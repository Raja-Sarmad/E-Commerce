import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { ADMIN_STORE_KEY, DEFAULT_STORE_SLUG, STORE_LABELS } from "../store/config";
import type { RootState } from "./store";

type StoreState = {
  slug: string;
};

const initialSlug =
  typeof window !== "undefined"
    ? localStorage.getItem(ADMIN_STORE_KEY) || DEFAULT_STORE_SLUG
    : DEFAULT_STORE_SLUG;

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
