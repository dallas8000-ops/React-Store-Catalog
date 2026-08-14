from collections import defaultdict
from datetime import date

from django.contrib import messages
from django.db.models import Q
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.views import LoginView
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy
from django.views.decorators.http import require_GET, require_POST

from . import cart
from .forms import CouponForm, ProductForm, StoreLoginForm
from .models import Coupon, Product


def staff_check(user):
    return user.is_active and user.is_staff


def theme_toggle(request: HttpRequest) -> HttpResponse:
    next_url = request.POST.get("next") or request.META.get("HTTP_REFERER") or "/"
    current = request.COOKIES.get("theme", "light")
    new_theme = "dark" if current != "dark" else "light"
    response = redirect(next_url)
    response.set_cookie("theme", new_theme, max_age=60 * 60 * 24 * 365, samesite="Lax")
    return response


def home(request: HttpRequest) -> HttpResponse:
    return render(request, "shop/home.html")


def about(request: HttpRequest) -> HttpResponse:
    return render(request, "shop/about.html")


def catalog(request: HttpRequest) -> HttpResponse:
    qs = Product.objects.all()
    query = (request.GET.get("q") or "").strip()
    category = (request.GET.get("category") or "").strip()

    if query:
        qs = qs.filter(
            Q(name__icontains=query)
            | Q(description__icontains=query)
            | Q(category__icontains=query)
        )
    if category:
        qs = qs.filter(category__iexact=category)

    products = list(qs)
    grouped: dict[str, list[Product]] = defaultdict(list)
    for product in products:
        key = product.product_date.isoformat() if product.product_date else "Undated"
        grouped[key].append(product)
    ordered_groups = sorted(grouped.items(), key=lambda x: x[0], reverse=True)
    categories = (
        Product.objects.order_by("category")
        .values_list("category", flat=True)
        .distinct()
    )
    product_id = request.GET.get("product")
    active = None
    if product_id:
        active = Product.objects.filter(pk=product_id).first()
    return render(
        request,
        "shop/catalog.html",
        {
            "product_groups": ordered_groups,
            "active_product": active,
            "product_count": Product.objects.count(),
            "filtered_count": len(products),
            "categories": [c for c in categories if c],
            "search_query": query,
            "active_category": category,
        },
    )


@require_POST
def cart_add(request: HttpRequest, product_id: int) -> HttpResponse:
    product = get_object_or_404(Product, pk=product_id)
    qty = int(request.POST.get("quantity", 1))
    cart.add_to_cart(request, product.id, max(1, qty))
    messages.success(request, f"Added {product.name} to cart.")
    next_url = request.POST.get("next") or request.META.get("HTTP_REFERER") or reverse_lazy("shop:catalog")
    if getattr(request, "htmx", False):
        return render(request, "shop/partials/cart_badge.html")
    return redirect(next_url)


@require_POST
def cart_update(request: HttpRequest, product_id: int) -> HttpResponse:
    cart_data = cart.get_cart(request)
    key = str(product_id)
    current = int(cart_data.get(key, {}).get("quantity", 1))
    action = request.POST.get("action")
    if action == "inc":
        qty = current + 1
    elif action == "dec":
        qty = max(1, current - 1)
    else:
        qty = int(request.POST.get("quantity", current))
    cart.update_quantity(request, product_id, qty)
    return redirect("shop:cart")


@require_POST
def cart_remove(request: HttpRequest, product_id: int) -> HttpResponse:
    cart.remove_from_cart(request, product_id)
    messages.info(request, "Item removed from cart.")
    return redirect("shop:cart")


@require_POST
def cart_clear(request: HttpRequest) -> HttpResponse:
    cart.clear_cart(request)
    messages.info(request, "Cart cleared.")
    return redirect("shop:cart")


def cart_view(request: HttpRequest) -> HttpResponse:
    return render(
        request,
        "shop/cart.html",
        {
            "lines": cart.cart_lines(request),
            "cart_total": cart.cart_total(request),
        },
    )


def shipping(request: HttpRequest) -> HttpResponse:
    lines = cart.cart_lines(request)
    if not lines:
        messages.warning(request, "Your cart is empty.")
        return redirect("shop:cart")
    shipping_cost = 12.99
    if request.method == "POST":
        messages.success(request, "Order placed! (demo checkout — no payment processed.)")
        cart.clear_cart(request)
        return redirect("shop:home")
    subtotal = cart.cart_total(request)
    return render(
        request,
        "shop/shipping.html",
        {
            "lines": lines,
            "subtotal": subtotal,
            "shipping_cost": shipping_cost,
            "order_total": subtotal + shipping_cost,
        },
    )


class AdminLoginView(LoginView):
    template_name = "shop/admin_login.html"
    authentication_form = StoreLoginForm
    redirect_authenticated_user = True

    def get_success_url(self):
        return reverse_lazy("shop:admin_dashboard")

    def form_valid(self, form):
        user = form.get_user()
        if not staff_check(user):
            messages.error(self.request, "This account does not have staff access.")
            return self.form_invalid(form)
        return super().form_valid(form)


def admin_logout(request: HttpRequest) -> HttpResponse:
    logout(request)
    messages.info(request, "Logged out.")
    return redirect("shop:admin_login")


@login_required(login_url="shop:admin_login")
@user_passes_test(staff_check)
def admin_dashboard(request: HttpRequest) -> HttpResponse:
    coupon_form = CouponForm()
    product_form = ProductForm(initial={"product_date": date.today(), "stars": 0})
    return render(
        request,
        "shop/admin_dashboard.html",
        {
            "coupons": Coupon.objects.all(),
            "products": Product.objects.all(),
            "coupon_form": coupon_form,
            "product_form": product_form,
        },
    )


@login_required(login_url="shop:admin_login")
@user_passes_test(staff_check)
@require_POST
def admin_coupon_create(request: HttpRequest) -> HttpResponse:
    form = CouponForm(request.POST)
    if form.is_valid():
        form.save()
        messages.success(request, "Coupon created.")
    else:
        messages.error(request, form.errors.as_text())
    return redirect("shop:admin_dashboard")


@login_required(login_url="shop:admin_login")
@user_passes_test(staff_check)
@require_POST
def admin_coupon_delete(request: HttpRequest, pk: int) -> HttpResponse:
    coupon = get_object_or_404(Coupon, pk=pk)
    coupon.delete()
    messages.success(request, "Coupon deleted.")
    return redirect("shop:admin_dashboard")


@login_required(login_url="shop:admin_login")
@user_passes_test(staff_check)
@require_POST
def admin_product_create(request: HttpRequest) -> HttpResponse:
    form = ProductForm(request.POST)
    if form.is_valid():
        form.save()
        messages.success(request, "Product created.")
    else:
        messages.error(request, form.errors.as_text())
    return redirect("shop:admin_dashboard")


@login_required(login_url="shop:admin_login")
@user_passes_test(staff_check)
@require_POST
def admin_product_delete(request: HttpRequest, pk: int) -> HttpResponse:
    product = get_object_or_404(Product, pk=pk)
    product.delete()
    messages.success(request, "Product deleted.")
    return redirect("shop:admin_dashboard")


@require_GET
def health(request: HttpRequest) -> JsonResponse:
    return JsonResponse({"status": "ok", "service": "django-store-catalog"})


@require_GET
def api_images(request: HttpRequest) -> JsonResponse:
    from .product_images import get_images_dir, list_image_filenames

    return JsonResponse({"files": list_image_filenames(), "dir": str(get_images_dir())})


def page_not_found(request: HttpRequest, exception):  # noqa: ARG001
    return render(request, "shop/404.html", status=404)
