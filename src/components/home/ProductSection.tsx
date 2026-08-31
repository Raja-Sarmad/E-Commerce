import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProductCard } from "@/components/product/ProductCard";
import { LiveStockProvider } from "@/components/product/LiveStockProvider";
import type { Product } from "@/lib/types";

type ProductSectionProps = {
  badge?: string;
  title: string;
  subtitle?: string;
  products: Product[];
  linkLabel?: string;
  linkHref?: string;
  columns?: 3 | 4;
};

export function ProductSection({
  badge,
  title,
  subtitle,
  products,
  linkLabel,
  linkHref,
  columns = 4,
}: ProductSectionProps) {
  if (products.length === 0) return null;

  const gridCols =
    columns === 4
      ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      : "grid-cols-2 md:grid-cols-3";

  return (
    <section aria-labelledby={`${title}-heading`} className="section-deferred py-12 sm:py-16">
      <Container>
        <SectionHeader
          badge={badge}
          title={title}
          subtitle={subtitle}
          linkLabel={linkLabel}
          linkHref={linkHref}
        />
        <div className={`grid gap-4 sm:gap-5 ${gridCols}`}>
          <LiveStockProvider productIds={products.map((product) => product.id)}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </LiveStockProvider>
        </div>
      </Container>
    </section>
  );
}
