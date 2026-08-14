# Start THIS project's Django app (default port 8001 — 8000 is often used by other apps)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path ".venv\Scripts\python.exe")) {
    python -m venv .venv
    .\.venv\Scripts\pip install -r requirements.txt
}

if (-not (Test-Path ".env")) {
    Copy-Item .env.example .env
}

$port = if ($env:STORE_PORT) { $env:STORE_PORT } else { "8001" }
Write-Host "Starting Computer Gadget Store on http://127.0.0.1:$port/"
Write-Host "(Port 8000 is NOT this app — use $port)"
.\.venv\Scripts\pip install -q Pillow 2>$null
.\.venv\Scripts\python manage.py migrate --noinput
.\.venv\Scripts\python manage.py import_product_images 2>$null
.\.venv\Scripts\python manage.py upgrade_catalog 2>$null
.\.venv\Scripts\python manage.py runserver $port
