/// <reference types="vite/client" />

import { apiUrl } from '../config/apiBase';
import type { Product } from '../types/models';

/** Filename stem → public URL under `/images/` */
export type ImageSlugMap = Record<string, string>;

function buildMapFromFilenames(files: string[]): ImageSlugMap {
  const images: ImageSlugMap = {};
  for (const f of files) {
    if (!f || typeof f !== 'string') continue;
    const fileName = f.split('/').pop();
    if (!fileName) continue;
    const base = fileName.split('.')[0];
    if (base) images[base] = `/images/${fileName}`;
  }
  return images;
}

/** Build-time scan (files known when Vite started; fallback when API is down). */
function getAvailableImagesFromGlob(): ImageSlugMap {
  const imageContext = import.meta.glob('/images/*.{jpg,jpeg,png,webp,gif,svg}', { eager: true });
  const images: ImageSlugMap = {};
  for (const p of Object.keys(imageContext)) {
    const fileName = p.split('/').pop();
    if (!fileName) continue;
    const base = fileName.split('.')[0];
    if (base) images[base] = `/images/${fileName}`;
  }
  return images;
}

function matchImageByProductName(itemName: string, availableMap: ImageSlugMap): string | null {
  const normalizedName = itemName.toLowerCase().replaceAll(/\s+/g, '-');
  const variations = [
    normalizedName,
    normalizedName.replaceAll('-', ''),
    normalizedName.split('-')[0] ?? '',
  ];
  for (const variation of variations) {
    if (variation && availableMap[variation]) return availableMap[variation];
  }
  if (availableMap.placeholder) return availableMap.placeholder;
  return null;
}

function normalizeImagePath(img: string | null | undefined): string {
  if (!img) return '';
  if (img.startsWith('/')) return img;
  return `/images/${String(img).replace(/^\/?images\//, '')}`;
}

/**
 * Map of slug (filename without extension) → URL under `/images/`.
 * Prefers live `GET /api/images` (sees files under `public/images/` without rebuilding the app).
 */
export async function getAvailableImages(): Promise<ImageSlugMap> {
  try {
    const res = await fetch(apiUrl('/api/images'));
    if (res.ok) {
      const data = (await res.json()) as { files?: string[] };
      const files = Array.isArray(data.files) ? data.files : [];
      const map = buildMapFromFilenames(files);
      if (Object.keys(map).length > 0) return map;
    }
  } catch {
    /* offline or API down */
  }
  return getAvailableImagesFromGlob();
}

/**
 * Prefer real files on disk; if the stored path is missing, try a name-based filename match.
 */
export function reconcileProductImages(items: Product[], availableMap: ImageSlugMap): Product[] {
  if (!availableMap || Object.keys(availableMap).length === 0) return items;
  const pathSet = new Set(Object.values(availableMap));
  return items.map((it) => {
    const normalized = normalizeImagePath(it.image);
    if (normalized && pathSet.has(normalized)) return { ...it, image: normalized };
    const byName = matchImageByProductName(it.name, availableMap);
    if (byName) return { ...it, image: byName };
    return it;
  });
}

/** Legacy helper — tries name keys then `placeholder`, then first file in the map. */
export function findMatchingImage(itemName: string, availableImages: ImageSlugMap): string {
  const hit = matchImageByProductName(itemName, availableImages);
  if (hit) return hit;
  const availablePaths = Object.values(availableImages);
  return availablePaths.length > 0 ? availablePaths[0] : '/images/placeholder.png';
}
