"use client";

import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiGlobe } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  CURRENCY_LIST,
  type CurrencyCode,
} from "@/lib/currency";
import { cn } from "@/lib/utils";
import {
  selectCurrencyCode,
  setCurrency,
} from "@/lib/rtk/currencySlice";

type CurrencySelectorProps = {
  className?: string;
  compact?: boolean;
};

export function CurrencySelector({
  className,
  compact = false,
}: CurrencySelectorProps) {
  const dispatch = useDispatch();
  const active = useSelector(selectCurrencyCode);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const activeMeta = CURRENCY_LIST.find((c) => c.code === active);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Select currency"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted",
          compact && "h-10 px-2"
        )}
      >
        <FiGlobe className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        <span>{active}</span>
        {!compact && (
          <span className="hidden text-xs font-normal text-muted-foreground sm:inline">
            {activeMeta?.symbol}
          </span>
        )}
        <FiChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <div className="animate-fade-in absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <p className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Currency
          </p>
          <ul className="max-h-64 overflow-y-auto py-1">
            {CURRENCY_LIST.map((currency) => {
              const selected = currency.code === active;
              return (
                <li key={currency.code}>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(setCurrency(currency.code as CurrencyCode));
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted",
                      selected && "bg-primary/5 text-primary"
                    )}
                  >
                    <span>
                      <span className="font-semibold">{currency.code}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {currency.label}
                      </span>
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {currency.symbol}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
