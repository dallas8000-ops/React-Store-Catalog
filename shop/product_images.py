"""
Product images from public/images/ (same as React/Vite public folder).

Each catalog product uses the filename from seed data — no fuzzy name guessing.
"""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from urllib.parse import quote

from django.conf import settings

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}


def get_images_dir() -> Path:
    return Path(getattr(settings, "PRODUCT_IMAGES_DIR", settings.BASE_DIR / "public" / "images"))


def image_basename(image_field: str) -> str:
    if not image_field:
        return ""
    path = str(image_field).strip()
    if path.startswith("/images/"):
        path = path[len("/images/") :]
    return Path(path).name


def public_image_url(filename: str) -> str:
    """URL-safe /images/… path (encodes spaces and special chars)."""
    return f"/images/{quote(filename)}"


def find_file_on_disk(filename: str) -> str | None:
    """Return actual filename on disk (case-insensitive), or None."""
    if not filename:
        return None
    images_dir = get_images_dir()
    if not images_dir.is_dir():
        return None
    target = filename.lower()
    for path in images_dir.iterdir():
        if path.is_file() and path.name.lower() == target:
            return path.name
    return None


@lru_cache(maxsize=1)
def _filename_index() -> dict[str, str]:
    """Lowercase filename → real filename on disk."""
    images_dir = get_images_dir()
    if not images_dir.is_dir():
        return {}
    return {
        p.name.lower(): p.name
        for p in images_dir.iterdir()
        if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS
    }


def clear_image_cache() -> None:
    _filename_index.cache_clear()


def resolve_image_for_product(stored_image: str, product_name: str = "") -> str:
    """
    Resolve image URL from the product's stored path (from seed JSON).
    Does not guess by product name — avoids wrong image/category mismatches.
    """
    del product_name  # kept for API compatibility

    if stored_image and str(stored_image).startswith("http"):
        return str(stored_image)

    basename = image_basename(stored_image)
    if basename:
        real = find_file_on_disk(basename)
        if real:
            return public_image_url(real)

    # Placeholder shipped with the repo
    for placeholder in ("Placeholder.jpg", "placeholder.svg", "placeholder.png"):
        real = find_file_on_disk(placeholder)
        if real:
            return public_image_url(real)

    return public_image_url("Placeholder.jpg")


def resolve_product_image_url(product) -> str:
    if getattr(product, "image", None):
        try:
            return product.image.url
        except (ValueError, AttributeError):
            pass
    return resolve_image_for_product(getattr(product, "image_path", "") or "", product.name)


def list_image_filenames() -> list[str]:
    images_dir = get_images_dir()
    if not images_dir.is_dir():
        return []
    return sorted(
        p.name
        for p in images_dir.iterdir()
        if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS
    )


# Canonical map: product name → filename in public/images/ (from products_seed.json)
SEED_IMAGE_BY_NAME: dict[str, str] = {
    "Wireless Mechanical Keyboard": "keyboard.jpg",
    "4K Ultra HD Monitor": "monitor.jpg",
    "Precision Gaming Mouse": "mouse.jpg",
    "Full HD Streaming Webcam": "webcam.png",
    "High-Speed USB Hub": "usbs.png",
    "Modern Smartwatch": "smartwatch.png",
    "32GB DDR4 Memory Module": "memory.png",
    "Ergonomic Computer Desk": "computer desk.png",
    "Dell Premium Laptop": "Dell Laptop.jpg",
    "Professional Drones": "Drones.jpg",
    "iPhone Latest Model": "Iphone.jpg",
    "Nintendo 3DS Console": "Nintendo 3DS.jpg",
    "Oculus VR Headset": "Oculus Headset.jpg",
    "Phone Card Holder": "Phone Card holder.jpg",
    "PlayStation 5 Console": "PS5.jpg",
    "PS5 Controller": "PS5 Controller.jpg",
}
