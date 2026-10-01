import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductPageTabs } from "@/components/product/ProductPageTabs";
import { RelatedProductCard } from "@/components/product/RelatedProductCard";
import { LiveStockProvider } from "@/components/product/LiveStockProvider";
import { getProductBySlug } from "@/lib/api/server";

export const revalidate = 60;

type ProductPageProps = PageProps<"/shop/[slug]">;

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) {
      return { title: "Product not found" };
    }
    return {
      title: product.name,
      description: product.description,
      keywords: product.tags,
      openGraph: {
        title: `${product.name} | NovaMart`,
        description: product.description,
        images: [product.images?.[0] ?? ""],
        type: "website",
      },
    };
  } catch {
    return { title: "Product not found" };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  let product;
  try {
    const { slug } = await params;
    product = await getProductBySlug(slug);
  } catch {
    notFound();
  }

  if (!product) {
    notFound();
  }

  const { related } = product;

  return (
    <div className="overflow-x-hidden bg-background">
      <section className="bg-secondary px-4 pt-5 pb-8 sm:px-6 sm:pt-7 sm:pb-10 lg:px-8 lg:pb-12">
        <div className="mx-auto w-full max-w-6xl">
          <Link
            href="/#catalog"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary sm:gap-2 sm:text-sm"
          >
            <FiArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
            Back to catalog
          </Link>

          <div className="mt-3 overflow-hidden rounded-xl border border-border/60 bg-card p-3 shadow-sm sm:mt-4 sm:rounded-2xl sm:p-5 lg:p-7">
            <div className="grid grid-cols-1 items-start gap-5 sm:gap-6 lg:grid-cols-2 lg:gap-8">
              <ProductGallery images={product.images} name={product.name} />
              <ProductDetails product={product} />
            </div>
          </div>

          <ProductPageTabs product={product} />
        </div>
      </section>

      {related.length > 0 ? (
        <section
          className="border-t border-border/70 bg-background px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
          aria-labelledby="related-heading"
        >
          <div className="mx-auto w-full max-w-6xl">
            <div className="flex items-center justify-between gap-3">
              <h2
                id="related-heading"
                className="text-lg font-bold tracking-tight text-foreground sm:text-xl md:text-2xl"
              >
                You May Also Like
              </h2>
              <Link
                href={`/shop?category=${product.categorySlug}`}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary sm:text-sm"
              >
                View All
                <FiArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
              </Link>
            </div>
            <LiveStockProvider productIds={related.map((p) => p.id)}>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 md:grid-cols-4 md:gap-5">
                {related.slice(0, 4).map((item) => (
                  <RelatedProductCard key={item.id} product={item} />
                ))}
              </div>
            </LiveStockProvider>
          </div>
        </section>
      ) : null}
    </div>
  );
}
