/** Public NovaMart storefront tenant (dashboard shop pages). */
export const DEFAULT_STORE_SLUG =
  process.env.NEXT_PUBLIC_STORE_SLUG?.trim().toLowerCase() || "ecommerce";

/**
 * Shared admin default tenant — Sab Pehno (`store`).
 * Separate from DEFAULT_STORE_SLUG so the public shop can stay on ecommerce.
 */
export const ADMIN_DEFAULT_STORE_SLUG = "store";

/** Bumped key so old “ecommerce” preference does not stick after Sab Pehno default. */
export const ADMIN_STORE_KEY = "novamart_admin_store_v2";

const KNOWN_ADMIN_STORES = new Set(["ecommerce", "cosmetic", "store", "warqu"]);

export function isKnownAdminStore(slug: string | null | undefined): slug is string {
  return !!slug && KNOWN_ADMIN_STORES.has(slug);
}

export function getStoreSlug(): string {
  if (typeof window === "undefined") return ADMIN_DEFAULT_STORE_SLUG;
  const fromUrl = new URLSearchParams(window.location.search).get("store")?.trim().toLowerCase();
  if (isKnownAdminStore(fromUrl)) return fromUrl;
  const saved = localStorage.getItem(ADMIN_STORE_KEY)?.trim().toLowerCase();
  if (isKnownAdminStore(saved)) return saved;
  return ADMIN_DEFAULT_STORE_SLUG;
}

export function setAdminStoreSlug(slug: string) {
  localStorage.setItem(ADMIN_STORE_KEY, slug);
}

export const STORE_LABELS: Record<string, string> = {
  ecommerce: "E-Commerce",
  cosmetic: "Cosmetic (Veya)",
  store: "Sab Pehno",
  warqu: "Warqu",
};

/** Brand mark shown in admin chrome when managing a given store slug. */
export const STORE_BRAND_LOGOS: Record<string, { src: string; alt: string }> = {
  store: { src: "/brands/sab-pehno-logo.png", alt: "Sab Pehno" },
};
