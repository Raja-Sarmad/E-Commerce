import type { CartItem, Coupon } from "../types";

const LEGACY_CART_KEY = "novamart-cart";
const GUEST_CART_KEY = "novamart-cart-guest";
const CART_OWNER_KEY = "novamart-cart-owner";

export type StoredCart = {
  items: CartItem[];
  coupon: Coupon | null;
};

function cartStorageKey(ownerId: string): string {
  return `novamart-cart-${ownerId}`;
}

function parseStored(raw: string): StoredCart {
  const parsed = JSON.parse(raw) as StoredCart | CartItem[];
  if (Array.isArray(parsed)) {
    return { items: parsed, coupon: null };
  }
  return {
    items: Array.isArray(parsed.items) ? parsed.items : [],
    coupon: parsed.coupon ?? null,
  };
}

/** Remove legacy / guest carts — checkout requires a logged-in account. */
export function clearGuestCartStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LEGACY_CART_KEY);
  window.localStorage.removeItem(GUEST_CART_KEY);
}

export function readStoredCartOwnerId(): string | null {
  if (typeof window === "undefined") return null;
  const stored = window.sessionStorage.getItem(CART_OWNER_KEY);
  if (!stored || stored === "guest") return null;
  return stored;
}

export function persistCartOwnerId(ownerId: string | null) {
  if (typeof window === "undefined") return;
  if (ownerId) {
    window.sessionStorage.setItem(CART_OWNER_KEY, ownerId);
  } else {
    window.sessionStorage.removeItem(CART_OWNER_KEY);
  }
}

export function readStoredCart(ownerId: string | null): StoredCart {
  if (!ownerId || typeof window === "undefined") {
    return { items: [], coupon: null };
  }
  try {
    const raw = window.localStorage.getItem(cartStorageKey(ownerId));
    if (!raw) return { items: [], coupon: null };
    return parseStored(raw);
  } catch {
    return { items: [], coupon: null };
  }
}

export function writeStoredCart(
  ownerId: string | null,
  items: CartItem[],
  coupon: Coupon | null
) {
  if (!ownerId || typeof window === "undefined") return;
  const key = cartStorageKey(ownerId);
  if (items.length > 0 || coupon) {
    window.localStorage.setItem(key, JSON.stringify({ items, coupon }));
  } else {
    window.localStorage.removeItem(key);
  }
}
