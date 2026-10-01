export const DEFAULT_STORE_SLUG =
  process.env.NEXT_PUBLIC_STORE_SLUG?.trim().toLowerCase() || "ecommerce";

export const ADMIN_STORE_KEY = "novamart_admin_store";

export function getStoreSlug(): string {
  if (typeof window === "undefined") return DEFAULT_STORE_SLUG;
  const saved = localStorage.getItem(ADMIN_STORE_KEY);
  if (saved) return saved;
  return DEFAULT_STORE_SLUG;
}

export function setAdminStoreSlug(slug: string) {
  localStorage.setItem(ADMIN_STORE_KEY, slug);
}

export const STORE_LABELS: Record<string, string> = {
  ecommerce: "E-Commerce",
  cosmetic: "Cosmetic (Veya)",
};
