import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../types";
import type { RootState } from "./store";

const STORAGE_KEY = "novamart-compare";
const MAX_COMPARE = 4;

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

type CompareState = {
  items: Product[];
};

const initialState: CompareState = {
  items: [],
};

const compareSlice = createSlice({
  name: "compare",
  initialState,
  reducers: {
    hydrateCompare: (state) => {
      state.items = readStorage();
    },
    toggleCompare: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      const exists = state.items.some((p) => p.id === product.id);
      if (exists) {
        state.items = state.items.filter((p) => p.id !== product.id);
      } else if (state.items.length >= MAX_COMPARE) {
        state.items = [...state.items.slice(1), product];
      } else {
        state.items.push(product);
      }
      writeStorage(state.items);
    },
    removeFromCompare: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
      writeStorage(state.items);
    },
    clearCompare: (state) => {
      state.items = [];
      writeStorage(state.items);
    },
  },
});

export const {
  hydrateCompare,
  toggleCompare,
  removeFromCompare,
  clearCompare,
} = compareSlice.actions;

export default compareSlice.reducer;

export const selectCompareItems = (state: RootState) => state.compare.items;
export const selectIsInCompare = (productId: string) => (state: RootState) =>
  state.compare.items.some((p) => p.id === productId);
