"use client";

import { useState, type ReactNode } from "react";
import {
  FiCheck,
  FiDroplet,
  FiLayers,
  FiMaximize2,
  FiPackage,
  FiTruck,
} from "react-icons/fi";
import { ProductImage } from "@/components/ui/ProductImage";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import type { Product } from "@/lib/types";
import { siteConfig } from "@/lib/site";
import { useFormatPrice } from "@/hooks/use-format-price";
import { cn } from "@/lib/utils";

const FEATURE_ICONS = [FiLayers, FiDroplet, FiMaximize2, FiPackage];

type ProductPageTabsProps = {
  product: Product;
};

type TabKey = "details" | "materials" | "size-fit" | "shipping";

const DEFAULT_FEATURES = [
  "Premium construction with attention to detail",
  "Comfortable fit designed for everyday wear",
  "Quality finish that holds up wash after wash",
];

function SplitContent({
  left,
  image,
  alt,
}: {
  left: ReactNode;
  image: string;
  alt: string;
}) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14 xl:gap-16">
      <div className="min-h-[220px]">{left}</div>
      <div className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-border/70 bg-muted/30 shadow-[0_24px_48px_-24px_rgba(109,40,217,0.35)] ring-1 ring-primary/10">
        <ProductImage
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 40vw"
          imgClassName="object-cover object-center"
        />
      </div>
    </div>
  );
}

export function ProductPageTabs({ product }: ProductPageTabsProps) {
  const formatPrice = useFormatPrice();
  const [active, setActive] = useState<TabKey>("details");

  const specsEntries = Object.entries(product.specifications ?? {});
  const detailImages = product.images.filter(Boolean);
  const imageFor = (index: number) =>
    detailImages[index] ?? detailImages[0] ?? "";

  const materialsText =
    product.materials?.trim() ||
    (specsEntries.length > 0
      ? specsEntries.map(([k, v]) => `${k}: ${v}`).join("\n")
      : "80% premium cotton, 20% recycled polyester.\nSoft brushed interior for warmth.\nMachine wash cold, tumble dry low.");

  const sizeGuideText =
    product.sizeGuide?.trim() ||
    "This item runs true to size. For a relaxed fit, consider sizing up.\n\nModel is 6'1\" and wears size M.\nRefer to chest and length measurements when between sizes.";

  const shippingText =
    product.shippingInfo?.trim() ||
    `Free standard shipping on orders over ${formatPrice(siteConfig.freeShippingThreshold)}.\nEasy 30-day returns on unworn items with tags attached.\nSecure checkout with encrypted payment processing.`;

  const featureList =
    product.features.length > 0 ? product.features : DEFAULT_FEATURES;

  const tabs: { key: TabKey; label: string }[] = [
    { key: "details", label: "Details" },
    { key: "materials", label: "Materials" },
    { key: "size-fit", label: "Size & Fit" },
    { key: "shipping", label: "Shipping & Returns" },
  ];

  return (
    <section id="product-info" className="mt-6 sm:mt-8">
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        <div
          role="tablist"
          className="flex gap-0 overflow-x-auto border-b border-border/70 no-scrollbar"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active === tab.key}
              onClick={() => setActive(tab.key)}
              className={cn(
                "shrink-0 border-b-2 px-5 py-4 text-sm font-medium transition-colors sm:px-8 sm:text-base",
                active === tab.key
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[280px] p-5 sm:p-6 lg:p-7">
          {active === "details" ? (
            <SplitContent
              alt={`${product.name} detail`}
              image={imageFor(1)}
              left={
                <div className="space-y-7">
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                      Product details
                    </h3>
                    <p className="mt-4 text-[15px] leading-7 text-muted-foreground sm:text-base">
                      {product.description ||
                        "Crafted for comfort and style, this piece combines premium materials with a modern silhouette for effortless everyday wear."}
                    </p>
                  </div>
                  <ul className="space-y-4">
                    {featureList.map((feature, index) => {
                      const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length];
                      return (
                        <li key={feature} className="flex items-start gap-3.5">
                          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Icon className="h-[18px] w-[18px]" aria-hidden />
                          </span>
                          <span className="pt-2 text-sm leading-relaxed text-foreground sm:text-[15px]">
                            {feature}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              }
            />
          ) : null}

          {active === "materials" ? (
            <SplitContent
              alt={`${product.name} fabric detail`}
              image={imageFor(2)}
              left={
                <div className="space-y-4">
                  <h3 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                    Materials & care
                  </h3>
                  {materialsText.split("\n").filter(Boolean).map((line) => (
                    <p
                      key={line}
                      className="text-[15px] leading-7 text-muted-foreground sm:text-base"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              }
            />
          ) : null}

          {active === "size-fit" ? (
            <SplitContent
              alt={`${product.name} fit guide`}
              image={imageFor(3)}
              left={
                <div className="space-y-5">
                  <h3 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                    Size & fit
                  </h3>
                  {sizeGuideText.split("\n").filter(Boolean).map((line) => (
                    <p
                      key={line}
                      className="text-[15px] leading-7 text-muted-foreground sm:text-base"
                    >
                      {line}
                    </p>
                  ))}
                  {product.sizes && product.sizes.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-border/70">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40">
                          <tr>
                            <th className="px-4 py-3.5 text-left font-semibold text-foreground">
                              Size
                            </th>
                            <th className="px-4 py-3.5 text-left font-semibold text-foreground">
                              Fit
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.sizes.map((size) => (
                            <tr key={size} className="border-t border-border/60">
                              <td className="px-4 py-3.5 font-medium text-foreground">{size}</td>
                              <td className="px-4 py-3.5 text-muted-foreground">True to size</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
              }
            />
          ) : null}

          {active === "shipping" ? (
            <SplitContent
              alt={`${product.name} packaging`}
              image={imageFor(0)}
              left={
                <div className="space-y-5">
                  <h3 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                    Shipping & returns
                  </h3>
                  {shippingText.split("\n").filter(Boolean).map((line) => (
                    <div key={line} className="flex items-start gap-3.5">
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        {line.toLowerCase().includes("return") ? (
                          <FiCheck className="h-[18px] w-[18px]" aria-hidden />
                        ) : (
                          <FiTruck className="h-[18px] w-[18px]" aria-hidden />
                        )}
                      </span>
                      <p className="pt-2 text-[15px] leading-7 text-muted-foreground sm:text-base">
                        {line}
                      </p>
                    </div>
                  ))}
                </div>
              }
            />
          ) : null}
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-3xl border border-border/70 bg-card p-6 sm:p-8 lg:p-10">
        <ReviewsSection product={product} />
      </div>
    </section>
  );
}
