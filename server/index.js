import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { body, param, validationResult } from 'express-validator';
import { pool } from './db.js';
import { initAuth, verifyAdmin } from './auth.js';
import { requireAuth } from './middleware/requireAuth.js';
import { rowToProduct } from './mapProduct.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Folder Vite serves as `/images/*` (runtime listing so new uploads are visible without rebuilding). */
const IMAGES_DIR = process.env.IMAGES_DIR || path.join(__dirname, '..', 'public', 'images');
const IMAGE_FILE_RE = /\.(jpe?g|png|webp|gif|svg)$/i;

const PORT = process.env.PORT || 3002;
const app = express();

const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors(
    corsOrigin
      ? { origin: corsOrigin.split(',').map((s) => s.trim()), credentials: true }
      : undefined
  )
);
app.use(express.json({ limit: '256kb' }));

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array({ onlyFirstError: true }) });
  }
  next();
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/images', async (_req, res) => {
  try {
    const names = await fs.readdir(IMAGES_DIR);
    const files = names.filter((n) => IMAGE_FILE_RE.test(n));
    res.json({ files, dir: IMAGES_DIR });
  } catch (err) {
    console.error('GET /api/images', err.message);
    res.json({ files: [], dir: IMAGES_DIR });
  }
});

app.get('/api/products', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM products ORDER BY product_date NULLS LAST, id ASC'
    );
    res.json(rows.map(rowToProduct));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    // Manual validation avoids express-validator edge cases (e.g. trim/type on JSON fields).
    const rawUser = req.body?.username;
    const rawPass = req.body?.password;
    const username = rawUser == null ? '' : String(rawUser).trim();
    const password = rawPass == null ? '' : String(rawPass);
    if (username.length < 1 || username.length > 64) {
      return res.status(400).json({ error: 'Username is required (1–64 characters).' });
    }
    if (password.length < 5 || password.length > 256) {
      return res.status(400).json({ error: 'Password must be at least 5 characters.' });
    }
    const ok = await verifyAdmin(username, password);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const token = jwt.sign({ sub: username, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, expiresIn: 28800 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/admin/coupons', requireAuth, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, code, discount_percent AS "discountPercent" FROM coupons ORDER BY id ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load coupons' });
  }
});

app.post(
  '/api/admin/coupons',
  requireAuth,
  body('code').trim().isLength({ min: 2, max: 64 }).matches(/^[A-Za-z0-9_-]+$/),
  body('discountPercent').isInt({ min: 1, max: 100 }),
  handleValidation,
  async (req, res) => {
    try {
      const { rows } = await pool.query(
        'INSERT INTO coupons (code, discount_percent) VALUES ($1, $2) RETURNING id, code, discount_percent AS "discountPercent"',
        [req.body.code.toUpperCase(), req.body.discountPercent]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'Coupon code already exists' });
      }
      console.error(err);
      res.status(500).json({ error: 'Failed to create coupon' });
    }
  }
);

app.delete('/api/admin/coupons/:id', requireAuth, param('id').isInt({ min: 1 }), handleValidation, async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM coupons WHERE id = $1', [req.params.id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Coupon not found' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

app.post(
  '/api/admin/products',
  requireAuth,
  body('name').trim().isLength({ min: 1, max: 255 }),
  body('price').isFloat({ min: 0 }),
  body('category').trim().isLength({ min: 1, max: 120 }),
  body('image').optional({ values: 'null' }).isString().isLength({ max: 2048 }),
  body('description').optional().isString().isLength({ max: 4000 }),
  body('stars').optional().isFloat({ min: 0, max: 5 }),
  body('oldPrice').optional({ values: 'null' }).isFloat({ min: 0 }),
  body('discount').optional({ values: 'null' }).isInt({ min: 0, max: 100 }),
  body('date').optional({ values: 'null' }).matches(/^\d{4}-\d{2}-\d{2}$/),
  handleValidation,
  async (req, res) => {
    try {
      const b = req.body;
      const { rows } = await pool.query(
        `INSERT INTO products (name, price, image, description, category, stars, old_price, discount, product_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          b.name,
          b.price,
          b.image || null,
          b.description ?? '',
          b.category,
          b.stars ?? 0,
          b.oldPrice ?? null,
          b.discount ?? null,
          b.date || null,
        ]
      );
      res.status(201).json(rowToProduct(rows[0]));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
);

app.delete('/api/admin/products/:id', requireAuth, param('id').isInt({ min: 1 }), handleValidation, async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Product not found' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.put(
  '/api/admin/products/:id',
  requireAuth,
  param('id').isInt({ min: 1 }),
  body('name').trim().isLength({ min: 1, max: 255 }),
  body('price').isFloat({ min: 0 }),
  body('category').trim().isLength({ min: 1, max: 120 }),
  body('image').optional({ values: 'null' }).isString().isLength({ max: 2048 }),
  body('description').optional().isString().isLength({ max: 4000 }),
  body('stars').optional().isFloat({ min: 0, max: 5 }),
  body('oldPrice').optional({ values: 'null' }).isFloat({ min: 0 }),
  body('discount').optional({ values: 'null' }).isInt({ min: 0, max: 100 }),
  body('date').optional({ values: 'null' }).matches(/^\d{4}-\d{2}-\d{2}$/),
  handleValidation,
  async (req, res) => {
    try {
      const b = req.body;
      const { rows } = await pool.query(
        `UPDATE products SET
          name = $1, price = $2, image = $3, description = $4, category = $5,
          stars = $6, old_price = $7, discount = $8, product_date = $9
         WHERE id = $10
         RETURNING *`,
        [
          b.name,
          b.price,
          b.image || null,
          b.description ?? '',
          b.category,
          b.stars ?? 0,
          b.oldPrice ?? null,
          b.discount ?? null,
          b.date || null,
          req.params.id,
        ]
      );
      if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
      res.json(rowToProduct(rows[0]));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update product' });
    }
  }
);

/** Vite production output (`npm run build` at repo root). */
const DIST_DIR = path.join(__dirname, '..', 'dist');
let distReady = false;

async function attachFrontend() {
  try {
    const stat = await fs.stat(path.join(DIST_DIR, 'index.html'));
    if (!stat.isFile()) return;
    distReady = true;
    app.use(express.static(DIST_DIR, { index: false }));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(DIST_DIR, 'index.html'));
    });
    console.log(`Serving frontend from ${DIST_DIR}`);
  } catch {
    app.get('/', (_req, res) => {
      res.json({
        service: 'React Store Catalog API',
        status: 'online',
        message: 'Frontend build not found. From repo root run: npm ci && npm run build',
        api: '/api/',
      });
    });
    console.warn(
      `No frontend at ${DIST_DIR}. API only until you run "npm run build" at the repo root (Render: build frontend before "cd server && node index.js").`
    );
  }
}

async function start() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
    throw new Error('JWT_SECRET must be set to at least 16 characters');
  }
  await initAuth();
  await attachFrontend();
  const server = app.listen(PORT, () => {
    const mode = distReady ? 'API + frontend' : 'API only (no dist/)';
    console.log(`${mode} listening on http://localhost:${PORT}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `Port ${PORT} is already in use. Stop the other process or set a different PORT in server/.env and the same URL in API_PROXY_TARGET in the repo root .env, then restart the API and npm run dev.`
      );
    } else {
      console.error(err);
    }
    process.exit(1);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
