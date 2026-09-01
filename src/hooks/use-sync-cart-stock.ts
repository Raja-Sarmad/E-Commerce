"use client";

import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { syncCartStock, selectCartItems } from "@/lib/rtk/cartSlice";
import type { CartItem } from "@/lib/types";
import { useLiveStockMap } from "@/components/product/LiveStockProvider";
import { toast } from "@/hooks/use-toast";

function stockMapKey(stockMap: Record<string, number>, ids: string[]) {
  return ids.map((id) => `${id}:${stockMap[id] ?? ""}`).join("|");
}

function collectAdjustments(
  items: CartItem[],
  stockMap: Record<string, number>
): string[] {
  const adjustments: string[] = [];
  for (const item of items) {
    const live = stockMap[item.product.id];
    if (live === undefined) continue;
    if (live === 0) {
      adjustments.push(`"${item.product.name}" is now out of stock.`);
    } else if (item.quantity > live) {
      adjustments.push(
        `"${item.product.name}" quantity reduced to ${live} (only ${live} left).`
      );
    }
  }
  return adjustments;
}

export function useSyncCartStock(options?: { notify?: boolean }) {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const ids = useMemo(() => items.map((item) => item.product.id), [items]);
  const { data: stockMap, refetch, isFetching } = useLiveStockMap(ids);
  const notifiedRef = useRef<string>("");
  const syncedKeyRef = useRef<string>("");
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    if (!stockMap || ids.length === 0) return;

    const key = stockMapKey(stockMap, ids);
    if (syncedKeyRef.current === key) return;
    syncedKeyRef.current = key;

    const currentItems = itemsRef.current;
    const adjustments = collectAdjustments(currentItems, stockMap);
    dispatch(syncCartStock(stockMap));

    if (options?.notify && adjustments.length > 0) {
      const messageKey = adjustments.join("|");
      if (notifiedRef.current !== messageKey) {
        notifiedRef.current = messageKey;
        toast.warning("Stock updated", adjustments[0]);
      }
    }
  }, [stockMap, ids, dispatch, options?.notify]);

  return { stockMap, refetch, isFetching };
}

export function validateCartStockBeforeCheckout(
  items: CartItem[],
  stockMap: Record<string, number> | undefined
): { ok: true } | { ok: false; message: string } {
  if (!items.length) {
    return { ok: false, message: "Your cart is empty." };
  }

  for (const item of items) {
    const live = stockMap?.[item.product.id];
    if (live === undefined) continue;
    if (live === 0) {
      return {
        ok: false,
        message: `"${item.product.name}" is out of stock. Please remove it from your cart.`,
      };
    }
    if (item.quantity > live) {
      return {
        ok: false,
        message: `"${item.product.name}" only has ${live} left. Please update your cart.`,
      };
    }
  }

  return { ok: true };
}
