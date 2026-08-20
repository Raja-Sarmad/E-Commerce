import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
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
};

const initialState: CartState = {
  items: [],
  coupon: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart: (state) => {
      state.items = readStorage();
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
      const existing = state.items.find(
        (i) =>
          i.product.id === product.id &&
          i.color === color &&
          i.size === size
      );
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, 99);
      } else {
        state.items.push({ product, quantity, color, size });
      }
      writeStorage(state.items);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const { productId, quantity } = action.payload;
      state.items = state.items
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: Math.max(0, Math.min(quantity, 99)) }
            : i
        )
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
} = cartSlice.actions;

export default cartSlice.reducer;

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartCoupon = (state: RootState) => state.cart.coupon;

export const selectCartCount = (state: RootState) =>
  state.cart.items.reduce((n, i) => n + i.quantity, 0);

export const selectCartTotals = (state: RootState) => {
  const { items, coupon } = state.cart;
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
};

export const selectIsInCart = (productId: string) => (state: RootState) =>
  state.cart.items.some((i) => i.product.id === productId);

export const selectCartItemQuantity = (productId: string) => (state: RootState) =>
  state.cart.items.find((i) => i.product.id === productId)?.quantity ?? 0;
