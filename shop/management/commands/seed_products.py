import json
from datetime import datetime
from decimal import Decimal
from pathlib import Path

from django.core.management.base import BaseCommand

from shop.models import Product


class Command(BaseCommand):
    help = "Seed products from shop/data/products_seed.json when the table is empty."

    def handle(self, *args, **options):
        if Product.objects.exists():
            self.stdout.write(self.style.WARNING("Products already exist — skipping seed."))
            return

        path = Path(__file__).resolve().parent.parent.parent / "data" / "products_seed.json"
        rows = json.loads(path.read_text(encoding="utf-8"))
        for row in rows:
            product_date = None
            if row.get("date"):
                product_date = datetime.strptime(row["date"], "%Y-%m-%d").date()
            Product.objects.create(
                name=row["name"],
                price=Decimal(str(row["price"])),
                image_path=row.get("image") or "",
                description=row.get("description") or "",
                category=row.get("category") or "",
                stars=Decimal(str(row.get("stars", 0))),
                old_price=Decimal(str(row["oldPrice"])) if row.get("oldPrice") is not None else None,
                discount=row.get("discount"),
                product_date=product_date,
            )
        self.stdout.write(self.style.SUCCESS(f"Seeded {len(rows)} products."))
        from django.core.management import call_command

        call_command("import_product_images")
