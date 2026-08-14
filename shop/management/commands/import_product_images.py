from django.core.files import File
from django.core.management.base import BaseCommand

from shop.models import Product
from shop.product_images import SEED_IMAGE_BY_NAME, find_file_on_disk, get_images_dir


class Command(BaseCommand):
    help = "Copy files from public/images/ into each Product.image (database + media/products/)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Re-import even if product.image is already set.",
        )

    def handle(self, *args, **options):
        images_dir = get_images_dir()
        if not images_dir.is_dir():
            self.stderr.write(self.style.ERROR(f"Missing folder: {images_dir}"))
            return

        force = options["force"]
        imported = 0
        skipped = 0
        missing = []

        for product in Product.objects.all():
            if product.image and not force:
                skipped += 1
                continue

            filename = SEED_IMAGE_BY_NAME.get(product.name)
            if not filename and product.image_path:
                filename = product.image_path.replace("/images/", "").strip()

            real = find_file_on_disk(filename) if filename else None
            if not real:
                missing.append(f"{product.name} ({filename!r})")
                continue

            src = images_dir / real
            if product.image:
                product.image.delete(save=False)

            with src.open("rb") as fh:
                product.image.save(real, File(fh), save=True)

            if not product.image_path:
                product.image_path = f"/images/{real}"
                product.save(update_fields=["image_path"])

            imported += 1
            self.stdout.write(f"  {product.name} <- {real}")

        if missing:
            self.stdout.write(self.style.WARNING("No file found for:"))
            for line in missing:
                self.stdout.write(f"    {line}")

        self.stdout.write(
            self.style.SUCCESS(f"Imported {imported} image(s) into the database ({skipped} skipped).")
        )
