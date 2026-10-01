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
    <div className="grid grid-cols-1 items-start gap-5 sm:gap-6 lg:grid-cols-2 lg:items-center lg:gap-10">
      <div className="min-w-0">{left}</div>
      {image ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border/70 bg-muted/30 sm:rounded-2xl lg:aspect-[5/4]">
          <ProductImage
            src={image}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            imgClassName="object-cover object-center"
          />
        </div>
      ) : null}
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

  const tabs: { key: TabKey; label: string; shortLabel: string }[] = [
    { key: "details", label: "Details", shortLabel: "Details" },
    { key: "materials", label: "Materials", shortLabel: "Materials" },
    { key: "size-fit", label: "Size & Fit", shortLabel: "Size" },
    { key: "shipping", label: "Shipping & Returns", shortLabel: "Shipping" },
  ];

  return (
    <section id="product-info" className="mt-5 w-full min-w-0 sm:mt-8">
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm sm:rounded-2xl">
        <div
          role="tablist"
          className="-mb-px flex overflow-x-auto border-b border-border/70 no-scrollbar"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active === tab.key}
              onClick={() => setActive(tab.key)}
              className={cn(
                "shrink-0 border-b-2 px-3 py-3 text-xs font-medium transition-colors sm:px-5 sm:py-3.5 sm:text-sm",
                active === tab.key
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
              )}
            >
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6 lg:p-7">
          {active === "details" ? (
            <SplitContent
              alt={`${product.name} detail`}
              image={imageFor(1)}
              left={
                <div className="space-y-5 sm:space-y-7">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-foreground sm:text-2xl lg:text-3xl">
                      Product details
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-[15px] sm:leading-7">
                      {product.description ||
                        "Crafted for comfort and style, this piece combines premium materials with a modern silhouette for effortless everyday wear."}
                    </p>
                  </div>
                  <ul className="space-y-3 sm:space-y-4">
                    {featureList.map((feature, index) => {
                      const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length];
                      return (
                        <li key={feature} className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-10 sm:w-10 sm:rounded-xl">
                            <Icon className="h-4 w-4" aria-hidden />
                          </span>
                          <span className="pt-1.5 text-sm leading-relaxed text-foreground sm:pt-2">
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
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-display text-xl font-semibold text-foreground sm:text-2xl lg:text-3xl">
                    Materials & care
                  </h3>
                  {materialsText.split("\n").filter(Boolean).map((line) => (
                    <p
                      key={line}
                      className="text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-7"
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
                <div className="space-y-4 sm:space-y-5">
                  <h3 className="font-display text-xl font-semibold text-foreground sm:text-2xl lg:text-3xl">
                    Size & fit
                  </h3>
                  {sizeGuideText.split("\n").filter(Boolean).map((line) => (
                    <p
                      key={line}
                      className="text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-7"
                    >
                      {line}
                    </p>
                  ))}
                  {product.sizes && product.sizes.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-border/70">
                      <table className="w-full min-w-[240px] text-sm">
                        <thead className="bg-muted/40">
                          <tr>
                            <th className="px-3 py-2.5 text-left font-semibold text-foreground sm:px-4 sm:py-3.5">
                              Size
                            </th>
                            <th className="px-3 py-2.5 text-left font-semibold text-foreground sm:px-4 sm:py-3.5">
                              Fit
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.sizes.map((size) => (
                            <tr key={size} className="border-t border-border/60">
                              <td className="px-3 py-2.5 font-medium text-foreground sm:px-4 sm:py-3.5">
                                {size}
                              </td>
                              <td className="px-3 py-2.5 text-muted-foreground sm:px-4 sm:py-3.5">
                                True to size
                              </td>
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
                <div className="space-y-4 sm:space-y-5">
                  <h3 className="font-display text-xl font-semibold text-foreground sm:text-2xl lg:text-3xl">
                    Shipping & returns
                  </h3>
                  {shippingText.split("\n").filter(Boolean).map((line) => (
                    <div key={line} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-10 sm:w-10 sm:rounded-xl">
                        {line.toLowerCase().includes("return") ? (
                          <FiCheck className="h-4 w-4" aria-hidden />
                        ) : (
                          <FiTruck className="h-4 w-4" aria-hidden />
                        )}
                      </span>
                      <p className="pt-1.5 text-sm leading-relaxed text-muted-foreground sm:pt-2 sm:text-[15px] sm:leading-7">
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

      <div className="mt-6 overflow-hidden rounded-xl border border-border/70 bg-card p-4 sm:mt-8 sm:rounded-2xl sm:p-6 lg:p-8">
        <ReviewsSection product={product} />
      </div>
    </section>
  );
}
