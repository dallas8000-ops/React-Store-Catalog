/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** Public static site origin, no trailing slash (e.g. https://my-app.onrender.com). Used for OG / LinkedIn. */
  readonly VITE_SITE_ORIGIN?: string;
  /** Optional absolute image URL for og:image / twitter:image (PNG/JPG, large enough for link previews). */
  readonly VITE_OG_IMAGE_URL?: string;
}
