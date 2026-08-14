from decimal import Decimal
from typing import Any

from django.conf import settings

from .models import Product


def _cart_key() -> str:
    return settings.CART_SESSION_KEY


def get_cart(request) -> dict[str, dict[str, Any]]:
    return request.session.get(_cart_key(), {})


def cart_item_count(request) -> int:
    return sum(line["quantity"] for line in get_cart(request).values())


def cart_lines(request) -> list[dict[str, Any]]:
    cart = get_cart(request)
    if not cart:
        return []
    ids = [int(pk) for pk in cart]
    products = {p.id: p for p in Product.objects.filter(id__in=ids)}
    lines = []
    for pk, row in cart.items():
        product = products.get(int(pk))
        if not product:
            continue
        qty = int(row.get("quantity", 1))
        lines.append(
            {
                "product": product,
                "quantity": qty,
                "line_total": product.price * qty,
            }
        )
    return lines


def cart_total(request) -> Decimal:
    return sum((line["line_total"] for line in cart_lines(request)), Decimal("0"))


def add_to_cart(request, product_id: int, quantity: int = 1) -> None:
    cart = get_cart(request)
    key = str(product_id)
    if key in cart:
        cart[key]["quantity"] = int(cart[key].get("quantity", 0)) + quantity
    else:
        cart[key] = {"quantity": quantity}
    request.session[_cart_key()] = cart
    request.session.modified = True


def update_quantity(request, product_id: int, quantity: int) -> None:
    cart = get_cart(request)
    key = str(product_id)
    if quantity < 1:
        cart.pop(key, None)
    elif key in cart:
        cart[key]["quantity"] = quantity
    request.session[_cart_key()] = cart
    request.session.modified = True


def remove_from_cart(request, product_id: int) -> None:
    cart = get_cart(request)
    cart.pop(str(product_id), None)
    request.session[_cart_key()] = cart
    request.session.modified = True


def clear_cart(request) -> None:
    request.session.pop(_cart_key(), None)
    request.session.modified = True
