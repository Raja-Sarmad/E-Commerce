"use client";

import { useCallback } from "react";
import { useSelector } from "react-redux";
import { formatAmount } from "@/lib/currency";
import { selectCurrencyCode } from "@/lib/rtk/currencySlice";

/** Format USD-base amounts in the active display currency (subscribes to currency changes). */
export function useFormatPrice() {
  const currency = useSelector(selectCurrencyCode);
  return useCallback(
    (amount: number) => formatAmount(amount, currency),
    [currency]
  );
}
