import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../types";
import type { RootState } from "./store";

const STORAGE_KEY = "novamart-wishlist";

function readStorage(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(items: Product[]) {
  if (typeof window === "undefined") return;
  if (items.length > 0) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

type WishlistState = {
  items: Product[];
};

const initialState: WishlistState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    hydrateWishlist: (state) => {
      state.items = readStorage();
    },
    toggleWishlist: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      const exists = state.items.some((p) => p.id === product.id);
      if (exists) {
        state.items = state.items.filter((p) => p.id !== product.id);
      } else {
        state.items.push(product);
      }
      writeStorage(state.items);
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
      writeStorage(state.items);
    },
    clearWishlist: (state) => {
      state.items = [];
      writeStorage(state.items);
    },
  },
});

export const {
  hydrateWishlist,
  toggleWishlist,
  removeFromWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;

export const selectWishlistItems = (state: RootState) => state.wishlist.items;
export const selectWishlistCount = (state: RootState) => state.wishlist.items.length;
export const selectIsInWishlist = (productId: string) => (state: RootState) =>
  state.wishlist.items.some((p) => p.id === productId);
