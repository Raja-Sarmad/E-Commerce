"use client";

import { useEffect, type ReactNode } from "react";
import { Provider, useDispatch } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { makeStore, type AppDispatch } from "@/lib/rtk/store";
import { queryClient } from "@/lib/tanstack/queryClient";
import dynamic from "next/dynamic";
import { hydrateCart } from "@/lib/rtk/cartSlice";
import { hydrateAccessToken } from "@/lib/rtk/authSlice";

const Toaster = dynamic(() => import("@/components/ui/Toaster").then((m) => m.Toaster), { ssr: false });
import { hydrateWishlist } from "@/lib/rtk/wishlistSlice";
import { hydrateCompare } from "@/lib/rtk/compareSlice";
import { hydrateCurrency } from "@/lib/rtk/currencySlice";
import { bindCurrencyStore } from "@/lib/rtk/currency-bridge";
import { CurrencyReactivity } from "@/components/layout/CurrencyReactivity";
import { CartOwnerSync } from "@/components/cart/CartOwnerSync";

function HydrateClientState() {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(hydrateAccessToken());
    dispatch(hydrateCart());
    dispatch(hydrateWishlist());
    dispatch(hydrateCompare());
    dispatch(hydrateCurrency());
  }, [dispatch]);
  return null;
}

const store = makeStore();
bindCurrencyStore(store);

// Sync before first paint so Store→admin #access_token handoff is available to getMe.
if (typeof window !== "undefined") {
  store.dispatch(hydrateAccessToken());
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <HydrateClientState />
        <CartOwnerSync />
        <CurrencyReactivity>{children}</CurrencyReactivity>
        <Toaster />
      </QueryClientProvider>
    </Provider>
  );
}
