from django.conf import settings

from . import cart


def store_context(request):
    theme = request.COOKIES.get("theme", "light")
    if theme not in ("light", "dark"):
        theme = "light"
    product_count = 0
    try:
        from .models import Product

        product_count = Product.objects.count()
    except Exception:
        pass
    return {
        "store_name": settings.STORE_DISPLAY_NAME,
        "store_user_label": settings.STORE_USER_LABEL,
        "cart_count": cart.cart_item_count(request),
        "product_count": product_count,
        "store_tier": getattr(settings, "STORE_TIER", "pro"),
        "theme": theme,
        "theme_class": "dark-mode" if theme == "dark" else "light-mode",
    }
