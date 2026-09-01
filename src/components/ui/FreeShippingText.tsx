"use client";

import { siteConfig } from "@/lib/site";
import { formatPrice } from "@/lib/utils";

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
  return (
    <span className={className}>
      {prefix}
      {formatPrice(siteConfig.freeShippingThreshold)}
      {suffix}
    </span>
  );
}
