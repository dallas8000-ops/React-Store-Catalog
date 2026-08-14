#!/usr/bin/env bash
# Render / production build — install, static assets, DB, seed, admin user
set -o errexit

pip install -r requirements.txt

export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-config.settings.production}"

python manage.py collectstatic --noinput
python manage.py migrate --noinput
python manage.py seed_products
python manage.py import_product_images
python manage.py upgrade_catalog || true

if [ -n "${ADMIN_PASSWORD:-}" ]; then
  python manage.py create_store_admin
fi
