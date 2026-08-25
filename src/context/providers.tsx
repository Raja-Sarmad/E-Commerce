"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Provider, useDispatch } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { makeStore, type AppStore, type AppDispatch } from "@/lib/rtk/store";
import { queryClient } from "@/lib/tanstack/queryClient";
import dynamic from "next/dynamic";
import { hydrateCart } from "@/lib/rtk/cartSlice";
import { hydrateAccessToken } from "@/lib/rtk/authSlice";

const Toaster = dynamic(() => import("@/components/ui/Toaster").then((m) => m.Toaster), { ssr: false });
import { hydrateWishlist } from "@/lib/rtk/wishlistSlice";
import { hydrateCompare } from "@/lib/rtk/compareSlice";

function HydrateClientState() {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(hydrateAccessToken());
    dispatch(hydrateCart());
    dispatch(hydrateWishlist());
    dispatch(hydrateCompare());
  }, [dispatch]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <QueryClientProvider client={queryClient}>
        <HydrateClientState />
        {children}
        <Toaster />
      </QueryClientProvider>
    </Provider>
  );
}
