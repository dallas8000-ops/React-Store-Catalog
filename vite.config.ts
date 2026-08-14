import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/** Public origin of the static site (no trailing slash). Required on Render for correct OG / LinkedIn previews. */
function resolveSiteOrigin(mode: string, cwd: string): string {
  const env = loadEnv(mode, cwd, '');
  const raw = (env.VITE_SITE_ORIGIN || '').trim().replace(/\/$/, '');
  if (raw) return raw;
  if (mode === 'production' && !process.env.CI) {
    console.warn(
      '[vite] VITE_SITE_ORIGIN is unset. Set it on Render (Static Site env) to your live URL so og:url and social previews use https, not localhost.',
    );
  }
  return 'http://localhost:5173';
}

function resolveOgImageUrl(mode: string, cwd: string, siteOrigin: string): string {
  const env = loadEnv(mode, cwd, '');
  const custom = (env.VITE_OG_IMAGE_URL || '').trim();
  if (custom) return custom;
  return `${siteOrigin}/images/Placeholder.jpg`;
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const cwd = process.cwd();
  const env = loadEnv(mode, cwd, '');
  /** Dev-only: `/api` proxy target — must match `PORT` in `server/.env` (repo default **3002**). */
  const apiProxyTarget = env.API_PROXY_TARGET || 'http://localhost:3002';

  return {
    plugins: [
      react(),
      {
        name: 'inject-social-meta',
        transformIndexHtml(html) {
          const siteOrigin = resolveSiteOrigin(mode, cwd);
          const ogImage = resolveOgImageUrl(mode, cwd, siteOrigin);
          return html
            .replaceAll('__SITE_ORIGIN__', siteOrigin)
            .replaceAll('__OG_IMAGE_URL__', ogImage);
        },
      },
    ],
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.ts',
    },
  };
});
