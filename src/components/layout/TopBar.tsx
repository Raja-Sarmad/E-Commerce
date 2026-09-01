"use client";

import { FiTruck, FiTag } from "react-icons/fi";
import { siteConfig } from "@/lib/site";
import { useFormatPrice } from "@/hooks/use-format-price";

export function TopBar() {
  const formatPrice = useFormatPrice();
  return (
    <div className="bg-foreground text-background">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-6 px-4 text-xs font-medium sm:px-6 lg:px-8">
        <span className="hidden items-center gap-1.5 sm:inline-flex">
          <FiTruck className="h-3.5 w-3.5" aria-hidden />
          Free shipping on orders over {formatPrice(siteConfig.freeShippingThreshold)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FiTag className="h-3.5 w-3.5" aria-hidden />
          Flash Sale: Up to 50% off this weekend
        </span>
        <span className="hidden items-center gap-1.5 md:inline-flex">
          Easy returns within 30 days
        </span>
      </div>
    </div>
  );
}
