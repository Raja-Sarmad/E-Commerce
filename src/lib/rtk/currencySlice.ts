import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  BASE_CURRENCY,
  CURRENCIES,
  isCurrencyCode,
  type CurrencyCode,
} from "../currency";
import type { RootState } from "./store";

const STORAGE_KEY = "novamart-currency";

type CurrencyState = {
  code: CurrencyCode;
};

const initialState: CurrencyState = {
  code: BASE_CURRENCY,
};

const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    hydrateCurrency: (state) => {
      if (typeof window === "undefined") return;
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && isCurrencyCode(saved)) {
        state.code = saved;
      }
    },
    setCurrency: (state, action: PayloadAction<CurrencyCode>) => {
      state.code = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, action.payload);
      }
    },
  },
});

export const { hydrateCurrency, setCurrency } = currencySlice.actions;

export default currencySlice.reducer;

export const selectCurrencyCode = (state: RootState): CurrencyCode =>
  state.currency.code;

export const selectCurrencyMeta = (state: RootState) =>
  CURRENCIES[state.currency.code];
