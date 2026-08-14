import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create or update the staff admin user from ADMIN_USERNAME / ADMIN_PASSWORD env vars."

    def handle(self, *args, **options):
        username = os.environ.get("ADMIN_USERNAME", "admin")
        password = os.environ.get("ADMIN_PASSWORD")
        if not password or len(password) < 5:
            self.stderr.write("ADMIN_PASSWORD must be set (min 5 characters).")
            return

        User = get_user_model()
        user, created = User.objects.get_or_create(
            username=username,
            defaults={"is_staff": True, "is_superuser": True},
        )
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()
        verb = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(f"{verb} staff user '{username}'."))
