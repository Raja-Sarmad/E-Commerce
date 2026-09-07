"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useGetProductStockQuery } from "@/lib/rtk/storefrontApi";

export type LiveStockEntry = {
  stock: number;
  variants?: Record<string, number>;
};

const LiveStockContext = createContext<Record<string, LiveStockEntry>>({});

type LiveStockProviderProps = {
  productIds: string[];
  children: ReactNode;
};

export function LiveStockProvider({ productIds, children }: LiveStockProviderProps) {
  const ids = useMemo(
    () => [...new Set(productIds.filter(Boolean))],
    [productIds]
  );

  const { data = {} } = useGetProductStockQuery(ids, {
    skip: ids.length === 0,
    pollingInterval: 15000,
    refetchOnMountOrArgChange: true,
  });

  return (
    <LiveStockContext.Provider value={data}>{children}</LiveStockContext.Provider>
  );
}

export function useLiveStock(productId: string, fallback = 0) {
  const map = useContext(LiveStockContext);
  if (productId in map) return map[productId].stock;
  return fallback;
}

export function useLiveStockMap(productIds: string[]) {
  const ids = useMemo(
    () => [...new Set(productIds.filter(Boolean))],
    [productIds]
  );

  return useGetProductStockQuery(ids, {
    skip: ids.length === 0,
    pollingInterval: 15000,
    refetchOnMountOrArgChange: true,
  });
}
