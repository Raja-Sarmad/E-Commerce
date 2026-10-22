import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  ADMIN_DEFAULT_STORE_SLUG,
  ADMIN_STORE_KEY,
  isKnownAdminStore,
  STORE_LABELS,
} from "../store/config";
import type { RootState } from "./store";

type StoreState = {
  slug: string;
};

function readInitialAdminStore() {
  if (typeof window === "undefined") return ADMIN_DEFAULT_STORE_SLUG;
  // URL wins over last-used tenant (Warqu/Store login handoff).
  const fromUrl = new URLSearchParams(window.location.search).get("store")?.trim().toLowerCase();
  if (isKnownAdminStore(fromUrl)) return fromUrl;
  const saved = localStorage.getItem(ADMIN_STORE_KEY)?.trim().toLowerCase();
  return isKnownAdminStore(saved) ? saved : ADMIN_DEFAULT_STORE_SLUG;
}

const initialSlug = readInitialAdminStore();

const storeSlice = createSlice({
  name: "store",
  initialState: { slug: initialSlug } as StoreState,
  reducers: {
    setStoreSlug(state, action: PayloadAction<string>) {
      state.slug = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem(ADMIN_STORE_KEY, action.payload);
      }
    },
  },
});

export const { setStoreSlug } = storeSlice.actions;
export const selectStoreSlug = (state: RootState) => state.store.slug;
export const selectStoreLabel = (state: RootState) =>
  STORE_LABELS[state.store.slug] ?? state.store.slug;

export default storeSlice.reducer;
