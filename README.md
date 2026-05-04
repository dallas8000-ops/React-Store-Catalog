# React Store Catalog

Interactive product catalog (React + Vite) with the **same catalog UX as before** (inline edit mode, modal, cart). A separate **Express + PostgreSQL** API is added for production-style admin and optional live product data: on load, the app **tries the API once** and, if it is not running, **keeps using the bundled product list** so nothing breaks.

**Open this project:** in Cursor or VS Code use **File → Open Folder** and choose the repo root (`React-Store-Catalog`).

### If the page does not load (MIME type `text/jsx`, port `5500`, or blank screen)

This app is **Vite + React**, not plain static HTML. **Do not use “Live Server”** (or “Open with Live Server”) on `index.html` — that serves raw `.jsx` on port **5500**, so the browser shows *“Expected JavaScript module but got text/jsx”* and assets like `/vite.svg` return **404**.

**Do this instead:** in a terminal at the repo root run `npm install` once, then **`npm run dev`** (or **`npm start`**). Open **`http://localhost:5173`** — only that URL runs the Vite dev server that compiles JSX.

## Features

- Product catalog with date grouping, staggered motion, detail modal (Escape / arrow keys), and **✎ Edit Catalog** (in-session edits, same as before).
- Shopping cart (client state).
- **Admin** (`/admin`): JWT login to the API; coupons and products persisted in Postgres.
- Vite dev server **proxies** `/api` to **`http://localhost:3002`** (same default as **`PORT`** in `server/.env`). To use another port, set **`PORT`** and matching **`API_PROXY_TARGET`** in the repo root `.env` (see `.env.example`).
- **`GET /api/images`** reads `public/images` on each request so **new uploads** there show up without rebuilding (set `IMAGES_DIR` in `server/.env` if your folder layout differs).

## Prerequisites

- Node 20+ (CI uses 22)
- Docker (for Postgres), or your own `DATABASE_URL`

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

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` / `npm start` | Vite dev server — **http://localhost:5173**; proxies `/api` → **http://localhost:3002** (override with root `.env` `API_PROXY_TARGET`) |
| `npm run dev:all` | Vite + API together (requires DB + `server/.env`) |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (unit / component tests) |
| `npm run start --prefix server` | API server |
| `npm run db:setup --prefix server` | `migrate` + `seed` products |

## Environment

- **Root** `.env.example` — optional `VITE_API_URL` when the UI is not served behind the same host as the API.
- **Server** `server/env.example` — `DATABASE_URL`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`.

## Deploying on Render (PostgreSQL + API)

1. **Create PostgreSQL** in the Render dashboard (**New → PostgreSQL**). After it is ready, open the database and copy **Internal Database URL** (use **External** only if your API will not run on Render in the same region/plan that can reach internal URLs).

2. **Create a Web Service** for this repo (same GitHub project). Example:
   - **Build command:** `cd server && npm ci`
   - **Start command:** `cd server && node index.js`  
     Render injects **`PORT`**; the server reads it automatically.

3. **Environment variables** on that Web Service (match `server/env.example`):
   - **`DATABASE_URL`** — paste the URL from step 1.
   - **`JWT_SECRET`**, **`ADMIN_USERNAME`**, **`ADMIN_PASSWORD`** — set strong values for production.
   - **`CORS_ORIGIN`** — your deployed frontend origin(s), e.g. `https://your-frontend.onrender.com` (comma-separated for several).

   The API enables **TLS for `pg`** when `DATABASE_URL` is not localhost / Docker `db`. To override, set **`DATABASE_SSL=true`** or **`DATABASE_SSL=false`**.

4. **Migrate and seed once** (Render **Shell** on the Web Service, or a one-off deploy script):

   ```sh
   cd server && npm run db:setup
   ```

5. **Frontend (Static Site)** — build with `npm ci && npm run build`, publish **`dist`**, and set **`VITE_API_URL`** to your API’s public `https://…` origin (no trailing slash) so the browser can call the API from another Render hostname.

## Tech stack

- React 19, React Router, Framer Motion, Bootstrap
- Vite 7, Vitest, Testing Library
- Express, `pg`, `bcryptjs`, `jsonwebtoken`, `express-validator`
- PostgreSQL 15 (Docker Compose)

## Project structure

- `src/components/` — UI (Catalog, ItemCard, ProductModal, …)
- `src/config/apiBase.ts` — API base URL helper
- `src/services/itemService.ts` — `GET /api/products`
- `server/` — REST API, migrations, seed data (`server/seed/products.json`)
- `.github/workflows/ci.yml` — lint, test, build, server syntax check

## License

MIT
