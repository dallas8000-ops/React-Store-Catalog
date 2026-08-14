"""
Add 40 catalog products, fetch random product photos, and import into the database.
"""
import json
import urllib.error
import urllib.request
from datetime import date, timedelta
from decimal import Decimal
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand

from shop.models import Product
from shop.product_images import find_file_on_disk, get_images_dir

EXTENDED_JSON = Path(__file__).resolve().parent.parent.parent / "data" / "extended_products.json"
IMAGE_PREFIX = "catalog-extra-"


class Command(BaseCommand):
    help = "High-tier upgrade: add 40 products, download images, import to DB/media."

    def add_arguments(self, parser):
        parser.add_argument(
            "--skip-download",
            action="store_true",
            help="Only add DB rows; assume images already in public/images/.",
        )
        parser.add_argument(
            "--force-images",
            action="store_true",
            help="Re-download images and re-import for extended products.",
        )

    def handle(self, *args, **options):
        images_dir = get_images_dir()
        images_dir.mkdir(parents=True, exist_ok=True)

        added = self._add_products()
        self.stdout.write(self.style.SUCCESS(f"Added {added} new product(s) to the database."))

        if not options["skip_download"]:
            downloaded = self._download_images(images_dir, options["force_images"])
            self.stdout.write(self.style.SUCCESS(f"Downloaded {downloaded} image file(s)."))

        imported = self._import_images(images_dir)
        self.stdout.write(self.style.SUCCESS(f"Imported {imported} image(s) into media/products/."))
        self.stdout.write(self.style.SUCCESS(f"Catalog total: {Product.objects.count()} products."))

    def _add_products(self) -> int:
        if not EXTENDED_JSON.is_file():
            self.stderr.write(self.style.ERROR(f"Missing {EXTENDED_JSON}"))
            return 0

        rows = json.loads(EXTENDED_JSON.read_text(encoding="utf-8"))
        added = 0
        for row in rows:
            if Product.objects.filter(name=row["name"]).exists():
                continue
            product_date = None
            if row.get("date"):
                y, m, d = map(int, row["date"].split("-"))
                product_date = date(y, m, d)
            Product.objects.create(
                name=row["name"],
                price=Decimal(str(row["price"])),
                image_path=row.get("image", ""),
                description=row.get("description", ""),
                category=row.get("category", "Accessory"),
                stars=Decimal(str(row.get("stars", 4.0))),
                old_price=Decimal(str(row["oldPrice"])) if row.get("oldPrice") else None,
                discount=row.get("discount"),
                product_date=product_date,
            )
            added += 1
        return added

    def _download_images(self, images_dir: Path, force: bool) -> int:
        count = 0
        for row in json.loads(EXTENDED_JSON.read_text(encoding="utf-8")):
            filename = row.get("image", "").replace("/images/", "").strip()
            if not filename.startswith(IMAGE_PREFIX):
                continue
            dest = images_dir / filename
            if dest.is_file() and not force:
                continue
            seed = filename.replace(".jpg", "").replace(".png", "")
            url = f"https://picsum.photos/seed/{seed}/640/640"
            try:
                urllib.request.urlretrieve(url, dest)  # noqa: S310
                count += 1
                self.stdout.write(f"  {filename}")
            except (urllib.error.URLError, OSError) as exc:
                self.stdout.write(self.style.WARNING(f"  skip {filename}: {exc}"))
        return count

    def _import_images(self, images_dir: Path) -> int:
        imported = 0
        for product in Product.objects.filter(image_path__contains=IMAGE_PREFIX):
            filename = product.image_path.replace("/images/", "").strip()
            real = find_file_on_disk(filename)
            if not real:
                continue
            src = images_dir / real
            if product.image:
                product.image.delete(save=False)
            with src.open("rb") as fh:
                product.image.save(real, File(fh), save=True)
            imported += 1
        # Also ensure original 16 have images
        for product in Product.objects.exclude(image_path__contains=IMAGE_PREFIX):
            if product.image:
                continue
            filename = product.image_path.replace("/images/", "").strip() if product.image_path else ""
            real = find_file_on_disk(filename) if filename else None
            if real:
                with (images_dir / real).open("rb") as fh:
                    product.image.save(real, File(fh), save=True)
                imported += 1
        return imported
