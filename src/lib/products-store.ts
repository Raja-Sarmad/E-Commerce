"use client";

import type { Product } from "./types";
import { products as seedProducts } from "./data/products";

const STORAGE_KEY = "novamart-admin-products";

function ensureStore(): Product[] {
  if (typeof window === "undefined") return seedProducts;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Product[];
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fall through to reseed
    }
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedProducts));
  return seedProducts;
}

export function readProducts(): Product[] {
  return ensureStore();
}

export function readProductById(id: string): Product | undefined {
  return readProducts().find((p) => p.id === id);
}

export function saveProduct(product: Product) {
  if (typeof window === "undefined") return;
  const list = readProducts();
  const exists = list.some((p) => p.id === product.id);
  const next = exists
    ? list.map((p) => (p.id === product.id ? product : p))
    : [product, ...list];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function deleteProduct(id: string) {
  if (typeof window === "undefined") return;
  const next = readProducts().filter((p) => p.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function deleteProducts(ids: string[]) {
  if (typeof window === "undefined") return;
  const idSet = new Set(ids);
  const next = readProducts().filter((p) => !idSet.has(p.id));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function generateProductId() {
  return `PRD-${Date.now().toString(36).toUpperCase()}${Math.floor(
    Math.random() * 1e4
  )
    .toString(36)
    .toUpperCase()}`;
}
