"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useGetStorefrontBrandsQuery } from "@/lib/rtk/storefrontApi";
import { cn } from "@/lib/utils";

const gradients = [
  "from-violet-500 to-fuchsia-500",
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-purple-600",
];

export function BrandShowcase() {
  const { data: brands = [], isLoading } = useGetStorefrontBrandsQuery();

  if (!isLoading && brands.length === 0) {
    return null;
  }

  const displayBrands = brands.length > 0 ? [...brands, ...brands] : [];

  return (
    <section aria-labelledby="brands-heading" className="py-12 sm:py-16">
      <Container>
        <SectionHeader
          badge="Brands"
          title="Trusted brands we carry"
          subtitle="Partnering with brands that share our obsession with quality."
        />
        {isLoading ? (
          <div className="h-24 animate-pulse rounded-2xl border border-border bg-muted/40" />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex w-max animate-marquee gap-10 px-10 py-8 hover:[animation-play-state:paused]">
              {displayBrands.map((brand, index) => (
                <div
                  key={`${brand.id}-${index}`}
                  className="flex items-center gap-2.5 opacity-70 transition-opacity hover:opacity-100"
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-extrabold text-white",
                      gradients[index % gradients.length]
                    )}
                  >
                    {brand.name.charAt(0)}
                  </span>
                  <span className="whitespace-nowrap text-base font-bold tracking-tight text-foreground">
                    {brand.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
