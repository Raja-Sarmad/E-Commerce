"use client";

import { siteConfig } from "@/lib/site";
import { useFormatPrice } from "@/hooks/use-format-price";

type FreeShippingTextProps = {
  prefix?: string;
  suffix?: string;
  className?: string;
};

export function FreeShippingText({
  prefix = "On orders over ",
  suffix = "",
  className,
}: FreeShippingTextProps) {
  const formatPrice = useFormatPrice();
  return (
    <span className={className}>
      {prefix}
      {formatPrice(siteConfig.freeShippingThreshold)}
      {suffix}
    </span>
  );
}
