"""Alias: sync paths, then import files into the database."""
from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Import product images from public/images/ into the database (see import_product_images)."

    def add_arguments(self, parser):
        parser.add_argument("--force", action="store_true")

    def handle(self, *args, **options):
        call_command("import_product_images", force=options.get("force", False))
