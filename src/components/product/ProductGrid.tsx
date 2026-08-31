"use client";

import { ProductCard } from "@/components/product/ProductCard";
import { LiveStockProvider } from "@/components/product/LiveStockProvider";
import type { Product } from "@/lib/types";

type ProductGridProps = {
  products: Product[];
  className?: string;
};

export function ProductGrid({ products, className }: ProductGridProps) {
  const ids = products.map((product) => product.id);

  return (
    <LiveStockProvider productIds={ids}>
      <div className={className}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </LiveStockProvider>
  );
}
