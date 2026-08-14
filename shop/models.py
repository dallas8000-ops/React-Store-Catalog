from decimal import Decimal

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Product(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0"))],
    )
    # Legacy path from seed JSON (/images/keyboard.jpg) — used only until import_product_images runs
    image_path = models.CharField(max_length=512, blank=True, default="")
    # Image file stored in DB + media/products/ (Django ImageField)
    image = models.ImageField(upload_to="products/", blank=True, null=True)
    description = models.TextField(blank=True, default="")
    category = models.CharField(max_length=120, blank=True, default="")
    stars = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        default=Decimal("0"),
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    old_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0"))],
    )
    discount = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MaxValueValidator(100)],
    )
    product_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["product_date", "id"]

    def __str__(self) -> str:
        return self.name

    @property
    def image_url(self) -> str:
        """URL for templates: uploaded file in media/, else public/images/ fallback."""
        if self.image:
            return self.image.url
        from .product_images import resolve_image_for_product

        return resolve_image_for_product(self.image_path or "", self.name)


class Coupon(models.Model):
    code = models.CharField(max_length=64, unique=True)
    discount_percent = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(100)],
    )

    class Meta:
        ordering = ["id"]

    def __str__(self) -> str:
        return self.code

    def save(self, *args, **kwargs):
        self.code = self.code.upper()
        super().save(*args, **kwargs)
