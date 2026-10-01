"use client";

import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiShoppingBag } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useGetStoresQuery } from "@/lib/rtk/adminApi";
import { baseApi } from "@/lib/rtk/baseApi";
import { selectStoreLabel, selectStoreSlug, setStoreSlug } from "@/lib/rtk/storeSlice";
import { STORE_LABELS } from "@/lib/store/config";
import { cn } from "@/lib/utils";
import type { AppDispatch } from "@/lib/rtk/store";

export function AdminStoreSwitcher() {
  const dispatch = useDispatch<AppDispatch>();
  const activeSlug = useSelector(selectStoreSlug);
  const activeLabel = useSelector(selectStoreLabel);
  const { data: stores = [] } = useGetStoresQuery();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const options =
    stores.length > 0
      ? stores
      : Object.entries(STORE_LABELS).map(([slug, name]) => ({
          _id: slug,
          slug,
          name,
          isActive: true,
        }));

  function switchStore(slug: string) {
    if (slug === activeSlug) {
      setOpen(false);
      return;
    }
    dispatch(setStoreSlug(slug));
    dispatch(baseApi.util.resetApiState());
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5 py-2 text-xs font-semibold text-foreground transition hover:bg-muted",
          open && "bg-muted"
        )}
        aria-label="Switch store"
      >
        <FiShoppingBag className="h-3.5 w-3.5 text-primary" aria-hidden />
        <span className="hidden max-w-[120px] truncate sm:inline">{activeLabel}</span>
        <FiChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      </button>
      {open && (
        <div className="animate-scale-in absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="border-b border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Manage store
          </div>
          <ul className="p-1">
            {options.map((store) => (
              <li key={store.slug}>
                <button
                  type="button"
                  onClick={() => switchStore(store.slug)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-muted",
                    store.slug === activeSlug && "bg-primary/10 font-semibold text-primary"
                  )}
                >
                  {store.name}
                  {store.slug === activeSlug ? (
                    <span className="text-[10px] uppercase tracking-wide">Active</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
