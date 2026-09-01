import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItem, Coupon, Product } from "../types";
import { siteConfig } from "../site";
import type { RootState } from "./store";

const STORAGE_KEY = "novamart-cart";

function readStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(items: CartItem[]) {
  if (typeof window === "undefined") return;
  if (items.length > 0) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

type CartState = {
  items: CartItem[];
  coupon: Coupon | null;
  hydrated: boolean;
};

export type CartStockCheck =
  | { ok: true; quantity: number }
  | { ok: false; title: string; message: string };

function findCartLine(
  items: CartItem[],
  productId: string,
  color?: string,
  size?: string
) {
  return items.find(
    (item) =>
      item.product.id === productId &&
      item.color === color &&
      item.size === size
  );
}

export function validateCartQuantity(
  items: CartItem[],
  product: Product,
  requestedQty: number,
  mode: "add" | "set",
  color?: string,
  size?: string
): CartStockCheck {
  const stock = Math.max(0, product.stock ?? 0);

  if (stock === 0) {
    return {
      ok: false,
      title: "No stock available",
      message: "This product is currently out of stock.",
    };
  }

  const existing = findCartLine(items, product.id, color, size);
  const inCart = existing?.quantity ?? 0;
  const targetQty = mode === "add" ? inCart + requestedQty : requestedQty;

  if (targetQty <= stock) {
    return { ok: true, quantity: targetQty };
  }

  if (inCart >= stock) {
    return {
      ok: false,
      title: "No stock available",
      message:
        stock === 1
          ? "Only 1 item in stock and it is already in your cart."
          : `Only ${stock} in stock and all are already in your cart.`,
    };
  }

  const remaining = stock - inCart;
  return {
    ok: false,
    title: "No stock available",
    message:
      remaining === 1
        ? "Only 1 more item can be added to your cart."
        : `Only ${remaining} more can be added (${stock} in stock).`,
  };
}

const initialState: CartState = {
  items: [],
  coupon: null,
  hydrated: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart: (state) => {
      state.items = readStorage();
      state.hydrated = true;
    },
    addItem: (
      state,
      action: PayloadAction<{
        product: Product;
        quantity?: number;
        color?: string;
        size?: string;
      }>
    ) => {
      const { product, quantity = 1, color, size } = action.payload;
      const stock = Math.max(0, product.stock ?? 0);
      if (stock === 0) return;

      const existing = findCartLine(state.items, product.id, color, size);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, stock);
      } else {
        state.items.push({
          product,
          quantity: Math.min(quantity, stock),
          color,
          size,
        });
      }
      writeStorage(state.items);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const { productId, quantity } = action.payload;
      state.items = state.items
        .map((i) => {
          if (i.product.id !== productId) return i;
          const stock = Math.max(0, i.product.stock ?? 0);
          return {
            ...i,
            quantity: Math.max(0, Math.min(quantity, stock)),
          };
        })
        .filter((i) => i.quantity > 0);
      writeStorage(state.items);
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.product.id !== action.payload);
      writeStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      writeStorage(state.items);
    },
    applyCoupon: (state, action: PayloadAction<Coupon>) => {
      state.coupon = action.payload;
    },
    removeCoupon: (state) => {
      state.coupon = null;
    },
    syncCartStock: (state, action: PayloadAction<Record<string, number>>) => {
      const stockMap = action.payload;
      let changed = false;

      const nextItems = state.items
        .map((item) => {
          const live = stockMap[item.product.id];
          if (live === undefined) return item;
          const stock = Math.max(0, live);
          const quantity = Math.min(item.quantity, stock);
          if (item.product.stock === stock && item.quantity === quantity) {
            return item;
          }
          changed = true;
          return {
            ...item,
            product: { ...item.product, stock },
            quantity,
          };
        })
        .filter((item) => item.quantity > 0);

      if (nextItems.length !== state.items.length) {
        changed = true;
      }

      if (!changed) return;

      state.items = nextItems;
      writeStorage(state.items);
    },
  },
});

export const {
  hydrateCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  applyCoupon,
  removeCoupon,
  syncCartStock,
} = cartSlice.actions;

export default cartSlice.reducer;

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartHydrated = (state: RootState) => state.cart.hydrated;
export const selectCartCoupon = (state: RootState) => state.cart.coupon;

export const selectCartCount = (state: RootState) =>
  state.cart.items.reduce((n, i) => n + i.quantity, 0);

export const selectCartTotals = createSelector(
  [(state: RootState) => state.cart.items, (state: RootState) => state.cart.coupon],
  (items, coupon) => {
    const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    let discount = 0;
    if (coupon) {
      if (coupon.type === "percentage") {
        discount = (subtotal * coupon.value) / 100;
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      } else {
        discount = coupon.value;
      }
      discount = Math.min(discount, subtotal);
    }
    const shipping =
      subtotal - discount >= siteConfig.freeShippingThreshold || subtotal === 0
        ? 0
        : siteConfig.shippingRate;
    const tax = (subtotal - discount) * siteConfig.taxRate;
    return {
      subtotal,
      discount,
      shipping,
      tax,
      total: subtotal - discount + shipping + tax,
    };
  }
);

export const selectIsInCart = (productId: string) => (state: RootState) =>
  state.cart.items.some((i) => i.product.id === productId);

export const selectCartItemQuantity = (productId: string) => (state: RootState) =>
  state.cart.items.find((i) => i.product.id === productId)?.quantity ?? 0;
