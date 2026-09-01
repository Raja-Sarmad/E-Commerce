"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProductImage } from "@/components/ui/ProductImage";
import { useGetStorefrontCategoriesQuery } from "@/lib/rtk/storefrontApi";
import { useMounted } from "@/hooks/use-mounted";

export function CategoryShowcase() {
  const mounted = useMounted();
  const { data: categories = [], isLoading } = useGetStorefrontCategoriesQuery();
  const showSkeleton = !mounted || isLoading;

  if (mounted && !isLoading && categories.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="categories-heading" className="py-12 sm:py-16">
      <Container>
        <SectionHeader
          badge="Categories"
          title="Shop by category"
          subtitle="Everything you need, neatly organized. Explore our curated collections."
          linkLabel="View all categories"
          linkHref="/categories"
        />
        {showSkeleton ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton aspect-square rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-square overflow-hidden">
                  <ProductImage
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" aria-hidden />
                  <div className="absolute inset-x-0 bottom-0 p-3.5">
                    <p className="text-sm font-bold text-white">{category.name}</p>
                    <p className="text-xs text-white/80">{category.count} items</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
