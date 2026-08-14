from django.contrib import admin
from django.utils.html import format_html

from .models import Coupon, Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "product_date", "stars", "has_image")
    list_filter = ("category",)
    search_fields = ("name", "description", "category")
    readonly_fields = ("image_preview",)

    @admin.display(boolean=True)
    def has_image(self, obj):
        return bool(obj.image)

    @admin.display(description="Preview")
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" alt="" style="max-height:140px;border-radius:8px;">', obj.image.url)
        return "—"


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ("code", "discount_percent")
