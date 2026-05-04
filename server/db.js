import pg from 'pg';

const { Pool } = pg;

/**
 * Render / Neon / most hosted Postgres require TLS. Local Docker and localhost do not.
 * Set DATABASE_SSL=false to force SSL off; DATABASE_SSL=true to force SSL on.
 */
function sslConfig() {
  if (process.env.DATABASE_SSL === 'false') return false;
  if (process.env.DATABASE_SSL === 'true') {
    return { rejectUnauthorized: false };
  }
  const url = process.env.DATABASE_URL || '';
  if (!url) return undefined;
  const local =
    /(?:@|\/)localhost(?:[:/]|$)/i.test(url) ||
    /127\.0\.0\.1/.test(url) ||
    /@db(?::|$)/i.test(url);
  if (local) return false;
  return { rejectUnauthorized: false };
}

const poolOptions = {
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.PGPOOL_MAX || 10),
};

const ssl = sslConfig();
if (ssl !== undefined) {
  poolOptions.ssl = ssl;
}

export const pool = new Pool(poolOptions);
