"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiClock } from "react-icons/fi";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/lib/types";

type FlashSaleProps = {
  products: Product[];
};

function getTimeLeft() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const diff = end.getTime() - now.getTime();
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { hours, minutes, seconds };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function FlashSale({ products }: FlashSaleProps) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setTime(getTimeLeft());
    setMounted(true);
    const timer = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const units = [
    { value: time.hours, label: "Hours" },
    { value: time.minutes, label: "Minutes" },
    { value: time.seconds, label: "Seconds" },
  ];

  return (
    <section aria-labelledby="flash-sale-heading" className="py-12 sm:py-16">
      <Container>
        <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-secondary/60 to-card">
          <div className="flex flex-col gap-6 border-b border-border bg-gradient-to-r from-destructive/10 via-warning/10 to-accent/10 px-6 py-6 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive text-destructive-foreground">
                  <FiClock className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2
                    id="flash-sale-heading"
                    className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl"
                  >
                    Flash Sale
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Limited-time offers ending at midnight
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2" role="timer" aria-label="Time remaining">
                {units.map((unit, i) => (
                  <div key={unit.label} className="flex items-center gap-2">
                    <div className="flex min-w-[3.5rem] flex-col items-center rounded-xl bg-foreground px-3 py-2">
                      <span className="text-lg font-extrabold tabular-nums text-background">
                        {mounted ? pad(unit.value) : "--"}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-background/60">
                        {unit.label}
                      </span>
                    </div>
                    {i < units.length - 1 && (
                      <span className="text-lg font-bold text-muted-foreground">:</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/shop?sale=on"
                className="inline-flex items-center gap-2 rounded-xl bg-destructive px-6 py-3 text-sm font-bold text-destructive-foreground shadow-sm transition-all hover:bg-destructive/90 active:scale-[0.98]"
              >
                View all deals
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
