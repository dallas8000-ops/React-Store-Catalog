import json
import re
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from shop.product_images import IMAGES_DIR, image_basename


def _svg(label: str, accent: str) -> str:
    safe = re.sub(r"[^\w\s-]", "", label)[:40] or "Product"
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:{accent}"/>
    </linearGradient>
  </defs>
  <rect width="480" height="480" fill="url(#g)"/>
  <rect x="40" y="40" width="400" height="400" rx="12" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
  <text x="240" y="230" text-anchor="middle" fill="#f8fafc" font-family="system-ui,sans-serif" font-size="22" font-weight="600">{safe}</text>
  <text x="240" y="265" text-anchor="middle" fill="#94a3b8" font-family="system-ui,sans-serif" font-size="14">Computer Gadget Store</text>
</svg>"""


ACCENTS = ("#1e40af", "#0d9488", "#7c3aed", "#0369a1", "#b45309", "#be123c")


class Command(BaseCommand):
    help = "Create SVG placeholders in public/images/ for seeded product filenames (when photos are missing)."

    def handle(self, *args, **options):
        IMAGES_DIR.mkdir(parents=True, exist_ok=True)

        seed_path = Path(settings.BASE_DIR) / "shop" / "data" / "products_seed.json"
        rows = json.loads(seed_path.read_text(encoding="utf-8"))

        created = 0
        for i, row in enumerate(rows):
            name = image_basename(row.get("image", ""))
            if not name:
                continue
            svg_path = IMAGES_DIR / f"{Path(name).stem}.svg"
            if svg_path.is_file():
                continue
            svg_path.write_text(_svg(row["name"], ACCENTS[i % len(ACCENTS)]), encoding="utf-8")
            created += 1
            self.stdout.write(f"  {svg_path.name}")

        # Global fallback
        placeholder = IMAGES_DIR / "placeholder.svg"
        if not placeholder.is_file():
            placeholder.write_text(_svg("Product", "#334155"), encoding="utf-8")
            created += 1

        self.stdout.write(self.style.SUCCESS(f"Wrote {created} placeholder image(s) to {IMAGES_DIR}"))
