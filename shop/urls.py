from django.urls import path

from . import views

app_name = "shop"

urlpatterns = [
    path("", views.home, name="home"),
    path("about/", views.about, name="about"),
    path("catalog/", views.catalog, name="catalog"),
    path("cart/", views.cart_view, name="cart"),
    path("cart/add/<int:product_id>/", views.cart_add, name="cart_add"),
    path("cart/update/<int:product_id>/", views.cart_update, name="cart_update"),
    path("cart/remove/<int:product_id>/", views.cart_remove, name="cart_remove"),
    path("cart/clear/", views.cart_clear, name="cart_clear"),
    path("shipping/", views.shipping, name="shipping"),
    # Store staff portal (not Django's /admin/ — avoids clash with contrib.admin)
    path("store-admin/", views.AdminLoginView.as_view(), name="admin_login"),
    path("store-admin/logout/", views.admin_logout, name="admin_logout"),
    path("store-admin/dashboard/", views.admin_dashboard, name="admin_dashboard"),
    path("store-admin/coupons/", views.admin_coupon_create, name="admin_coupon_create"),
    path(
        "store-admin/coupons/<int:pk>/delete/",
        views.admin_coupon_delete,
        name="admin_coupon_delete",
    ),
    path("store-admin/products/", views.admin_product_create, name="admin_product_create"),
    path(
        "store-admin/products/<int:pk>/delete/",
        views.admin_product_delete,
        name="admin_product_delete",
    ),
    path("theme/toggle/", views.theme_toggle, name="theme_toggle"),
    path("api/health/", views.health, name="health"),
    path("api/images/", views.api_images, name="api_images"),
]

handler404 = "shop.views.page_not_found"
