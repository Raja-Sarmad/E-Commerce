"use client";

import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { selectCurrencyCode } from "@/lib/rtk/currencySlice";

/** Re-render storefront when the shopper changes display currency. */
export function CurrencyReactivity({ children }: { children: ReactNode }) {
  useSelector(selectCurrencyCode);
  return <>{children}</>;
}
