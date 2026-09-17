"use client";

import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import { ProductImage } from "@/components/ui/ProductImage";
import { useFormatPrice } from "@/hooks/use-format-price";
import type { Product } from "@/lib/types";

function productTag(product: Product): string {
  if (product.onSale && product.discountPercent > 0) return `${product.discountPercent}% off`;
  if (product.tags[0]) return product.tags[0];
  if (product.isNew) return "New";
  if (product.isBestSeller) return "Bestseller";
  return product.category;
}

function productBlurb(product: Product): string {
  const text = product.description?.trim();
  if (text) return text.length > 56 ? `${text.slice(0, 56)}…` : text;
  return product.features[0] ?? "";
}

type CatalogTileProps = {
  product: Product;
};

export function CatalogTile({ product }: CatalogTileProps) {
  const formatPrice = useFormatPrice();
  const image = product.images[0] ?? "";
  const hasCompare =
    product.compareAtPrice != null && product.compareAtPrice > product.price;

  return (
    <Link href={`/shop/${product.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/35 hover:shadow-[0_22px_44px_-14px_rgba(109,40,217,0.28)]">
        <div className="relative aspect-[4/5] overflow-hidden">
          <ProductImage
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            imgClassName="object-cover object-center transition duration-700 group-hover:scale-110"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/55 via-foreground/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden
          />
          <span className="absolute top-3 left-3 z-10 rounded-full bg-primary/90 px-3 py-1 text-[11px] font-medium text-primary-foreground shadow-sm backdrop-blur-sm">
            {productTag(product)}
          </span>
          <span className="absolute right-3 bottom-3 z-10 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-card/95 text-primary opacity-0 shadow-md backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <FiArrowUpRight className="h-4 w-4" aria-hidden />
          </span>
        </div>

        <div className="flex flex-1 flex-col p-3.5 sm:p-4">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-foreground sm:text-base">
            {product.name}
          </h3>
          {productBlurb(product) ? (
            <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground sm:text-[13px]">
              {productBlurb(product)}
            </p>
          ) : null}
          <div className="mt-auto flex items-end justify-between gap-2 pt-3">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-sm font-bold text-foreground sm:text-base">
                {formatPrice(product.price)}
              </span>
              {hasCompare ? (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              ) : null}
            </div>
            <span className="text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
              View
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
