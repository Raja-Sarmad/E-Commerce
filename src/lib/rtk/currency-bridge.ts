import type { AppStore } from "./store";
import {
  BASE_CURRENCY,
  isCurrencyCode,
  type CurrencyCode,
} from "../currency";

const STORAGE_KEY = "novamart-currency";

let storeRef: AppStore | null = null;

export function bindCurrencyStore(store: AppStore) {
  storeRef = store;
}

export function getActiveCurrencyCode(): CurrencyCode {
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
    return BASE_CURRENCY;
  }
  if (storeRef) {
    return storeRef.getState().currency.code;
  }
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isCurrencyCode(saved)) return saved;
  }
  return BASE_CURRENCY;
}
