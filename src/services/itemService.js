// src/services/itemService.js
// ------------------------------------------
// Simple in-memory CRUD + dynamic image helper
// ------------------------------------------

import { products } from '../data/products.js';
import { getAvailableImages } from '../utils/imageScanner.js';

// ------------------------------------------------------------------
// 1.  Internal memory store - initialized from products.js
// ------------------------------------------------------------------
console.log('itemService: products imported:', products);

let items = products.map(product => ({
  id: product.id,
  name: product.name,
  price: product.price,
  image: product.image || null, // Use correct image property
  description: product.description || '',
  category: product.category || '',
  stars: product.stars || 0,
  oldPrice: product.oldPrice || null,
  discount: product.discount || null
}));

console.log('itemService: items initialized:', items);

// ------------------------------------------------------------------
// 2.  CRUD helpers
// ------------------------------------------------------------------
export const getItems = () => {
  console.log('getItems called, returning:', items);
  return Promise.resolve([...items]);
};

export const addItem = (item) => {
  const newItem = { ...item, id: Math.max(...items.map((i) => i.id), 0) + 1 };
  items.push(newItem);
  return Promise.resolve(newItem);
};

export const updateItem = (id, updates) => {
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return Promise.resolve(null);
  items[idx] = { ...items[idx], ...updates };
  return Promise.resolve(items[idx]);
};

export const deleteItem = (id) => {
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return Promise.resolve(false);
  items.splice(idx, 1);
  return Promise.resolve(true);
};

// ------------------------------------------------------------------
// 3.  Refresh items with images that actually exist in public/images
// ------------------------------------------------------------------
export const refreshItems = async () => {
  try {
    const available = await getAvailableImages(); // string[] of file names
    if (Array.isArray(available)) {
      items = items.map((it) =>
        available.includes(it.image) ? it : { ...it, image: null }
      );
    }
  } catch {
    console.log('Image refresh skipped');
  }
  return [...items];
};

// ------------------------------------------------------------------
// 4.  Re-export the scanner so DebugPanel (or any component) can use it
// ------------------------------------------------------------------
export { getAvailableImages };