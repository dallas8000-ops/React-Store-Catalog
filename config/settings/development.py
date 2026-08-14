from .base import *  # noqa: F403

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
}

DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "[::1]", "testserver"]

# Allow dev passwords like "admin" when running create_store_admin
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 5},
    },
]

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
