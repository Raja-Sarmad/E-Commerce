"use client";

import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { syncCartStock, selectCartItems } from "@/lib/rtk/cartSlice";
import type { CartItem } from "@/lib/types";
import {
  useLiveStockMap,
  type LiveStockEntry,
} from "@/components/product/LiveStockProvider";
import { toast } from "@/hooks/use-toast";

function stockMapKey(
  stockMap: Record<string, LiveStockEntry>,
  ids: string[]
) {
  return ids
    .map((id) => {
      const entry = stockMap[id];
      if (!entry) return `${id}:`;
      const variantsKey = entry.variants
        ? Object.entries(entry.variants)
            .map(([size, stock]) => `${size}:${stock}`)
            .sort()
            .join(",")
        : "";
      return `${id}:${entry.stock}:${variantsKey}`;
    })
    .join("|");
}

function collectAdjustments(
  items: CartItem[],
  stockMap: Record<string, LiveStockEntry>
): string[] {
  const adjustments: string[] = [];
  for (const item of items) {
    const live = stockMap[item.product.id];
    if (!live) continue;

    if (item.size && item.product.variants && item.product.variants.length > 0) {
      // Variant-level check
      const variantStock = live.variants?.[item.size];
      if (variantStock === undefined) continue;
      if (variantStock === 0) {
        adjustments.push(
          `"${item.product.name}" (size: ${item.size}) is now out of stock.`
        );
      } else if (item.quantity > variantStock) {
        adjustments.push(
          `"${item.product.name}" (size: ${item.size}) quantity reduced to ${variantStock} (only ${variantStock} left).`
        );
      }
    } else {
      const stock = live.stock ?? 0;
      if (stock === 0) {
        adjustments.push(`"${item.product.name}" is now out of stock.`);
      } else if (item.quantity > stock) {
        adjustments.push(
          `"${item.product.name}" quantity reduced to ${stock} (only ${stock} left).`
        );
      }
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
  stockMap: Record<string, LiveStockEntry> | undefined
): { ok: true } | { ok: false; message: string } {
  if (!items.length) {
    return { ok: false, message: "Your cart is empty." };
  }

  for (const item of items) {
    const live = stockMap?.[item.product.id];
    if (!live) continue;

    if (item.size && item.product.variants && item.product.variants.length > 0) {
      const variantStock = live.variants?.[item.size];
      if (variantStock === undefined) continue;
      if (variantStock === 0) {
        return {
          ok: false,
          message: `"${item.product.name}" (size: ${item.size}) is out of stock. Please remove it from your cart.`,
        };
      }
      if (item.quantity > variantStock) {
        return {
          ok: false,
          message: `"${item.product.name}" (size: ${item.size}) only has ${variantStock} left. Please update your cart.`,
        };
      }
    } else {
      const stock = live.stock ?? 0;
      if (stock === 0) {
        return {
          ok: false,
          message: `"${item.product.name}" is out of stock. Please remove it from your cart.`,
        };
      }
      if (item.quantity > stock) {
        return {
          ok: false,
          message: `"${item.product.name}" only has ${stock} left. Please update your cart.`,
        };
      }
    }
  }

  return { ok: true };
}
