# React Store Catalog

Interactive product catalog (React + Vite) with inline edit mode, a detail modal, and a cart. A separate **Express + PostgreSQL** API adds production-style admin and optional live product data: on load, the app **tries the API once** and, if it isn't running, **keeps using the bundled product list** so nothing breaks.

| | |
|---|---|
| **Live demo** | https://react-store-catalog-1-production.up.railway.app |
| **Code** | https://github.com/dallas8000-ops/React-Store-Catalog |

> The public catalog loads with or without the API (it falls back to a bundled product list). The **Admin** panel requires the API + database. Demo admin credentials are available to reviewers on request.

**Open this project:** in Cursor or VS Code use **File → Open Folder** and choose the repo root (`React-Store-Catalog`).

---

### If the page does not load (MIME type `text/jsx`, port `5500`, or blank screen)

This app is **Vite + React**, not plain static HTML. **Do not use "Live Server"** (or "Open with Live Server") on `index.html` — that serves raw `.jsx` on port **5500**, so the browser shows *"Expected JavaScript module but got text/jsx"* and assets like `/vite.svg` return **404**.

**Do this instead:** in a terminal at the repo root run `npm install` once, then **`npm run dev`** (or **`npm start`**). Open **`http://localhost:5173`** — only that URL runs the Vite dev server that compiles JSX.

---

## Features

- Product catalog with date grouping, staggered motion, detail modal (Escape / arrow keys), and **✎ Edit Catalog** (in-session edits).
- Shopping cart (client state).
- **Admin** (`/admin`): JWT login to the API; coupons and products persisted in Postgres.
- Vite dev server **proxies** `/api` to **`http://localhost:3002`** (same default as **`PORT`** in `server/.env`). To use another port, set **`PORT`** and matching **`API_PROXY_TARGET`** in the repo root `.env` (see `.env.example`).
- **`GET /api/images`** reads `public/images` on each request so **new uploads** show up without rebuilding (set `IMAGES_DIR` in `server/.env` if your folder layout differs).

---

## Prerequisites

- Node 20+ (CI uses 22)
- Docker (for Postgres), or your own `DATABASE_URL`

---

## Quick start (full stack)

1. **Start Postgres**

   ```sh
   docker compose up -d
   ```

2. **Configure and migrate the API**

   ```sh
   cd server
   cp env.example .env
   # Edit .env if needed: JWT_SECRET (≥16 chars); default admin is admin / admin (see server/env.example)
   npm install
   npm run db:setup
   cd ..
   ```

3. **Install** (from repo root)

   ```sh
   npm install
   ```

4. **Run frontend + backend together** (needs Postgres from step 1 for API + admin)

   ```sh
   npm run dev:all
   ```

   Or run **`npm run dev`** and **`npm run start --prefix server`** in two terminals.

5. Open the app (e.g. `http://localhost:5173`). **Catalog** works with or without the API; **Admin** needs the API and database. Log in with `ADMIN_USERNAME` / `ADMIN_PASSWORD` from `server/.env`.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` / `npm start` | Vite dev server — **http://localhost:5173**; proxies `/api` → **http://localhost:3002** (override with root `.env` `API_PROXY_TARGET`) |
| `npm run dev:all` | Vite + API together (requires DB + `server/.env`) |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (unit / component tests) |
| `npm run start --prefix server` | API server |
| `npm run db:setup --prefix server` | `migrate` + `seed` products |

---

## Environment

- **Root** `.env.example` — optional `VITE_API_URL` when the UI is not served behind the same host as the API.
- **Server** `server/env.example` — `DATABASE_URL`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`.

---

## Deploy (Railway)

Deploys as two Railway services — an **Express API** and a **static frontend** — plus a managed PostgreSQL plugin.

**1 — PostgreSQL plugin**
Add the **PostgreSQL** plugin to the project. Railway provides `DATABASE_URL` automatically; reference it from the API service.

**2 — API service (Express)**

| Setting | Value |
|---|---|
| Build command | `cd server && npm ci` |
| Start command | `cd server && node index.js` |

Environment variables on the API service:

| Key | Value |
|---|---|
| `DATABASE_URL` | Reference the Railway Postgres plugin (`${{Postgres.DATABASE_URL}}`) |
| `JWT_SECRET` | Long random secret (16+ characters) |
| `ADMIN_USERNAME` | e.g. `admin` |
| `ADMIN_PASSWORD` | Your admin password (5+ characters) |
| `CORS_ORIGIN` | Your frontend service URL (exact origin) |

> Do **not** set `PORT` — Railway injects it. After the first deploy, run the DB setup once against the API service: `cd server && npm run db:setup`.

**3 — Frontend service (static)**

| Setting | Value |
|---|---|
| Build command | `npm ci && npm run build` |
| Publish directory | `dist` |

Build-time environment variable:

| Key | Value |
|---|---|
| `VITE_API_URL` | Your API service public URL (no trailing `/`) |

After deploy, set the API's `CORS_ORIGIN` to the exact frontend URL and redeploy the API if you changed it. Because `VITE_API_URL` is baked in at build time, redeploy the frontend after changing it.

---

## Tech stack

- React 19, React Router, Framer Motion, Bootstrap
- Vite 7, Vitest, Testing Library
- Express, `pg`, `bcryptjs`, `jsonwebtoken`, `express-validator`
- PostgreSQL 15 (Docker Compose locally; Railway Postgres in production)

---

## Project structure

- `src/components/` — UI (Catalog, ItemCard, ProductModal, …)
- `src/config/apiBase.ts` — API base URL helper
- `src/services/itemService.ts` — `GET /api/products`
- `server/` — REST API, migrations, seed data (`server/seed/products.json`)
- `.github/workflows/ci.yml` — lint, test, build, server syntax check

---

## License

MIT
