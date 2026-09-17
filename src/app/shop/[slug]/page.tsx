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
    <div className="bg-background">
      <section className="bg-secondary px-5 pt-6 pb-10 sm:px-8 sm:pt-8 sm:pb-12 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/#catalog"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <FiArrowLeft className="h-4 w-4" aria-hidden />
            Back to catalog
          </Link>

          <div className="mt-4 overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-6 lg:p-7">
            <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
              <ProductGallery images={product.images} name={product.name} />
              <ProductDetails product={product} />
            </div>
          </div>

          <ProductPageTabs product={product} />
        </div>
      </section>

      {related.length > 0 ? (
        <section
          className="border-t border-border/70 bg-background px-5 py-10 sm:px-8 sm:py-12 lg:px-12"
          aria-labelledby="related-heading"
        >
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-between gap-4">
              <h2
                id="related-heading"
                className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
              >
                You May Also Like
              </h2>
              <Link
                href={`/shop?category=${product.categorySlug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                View All
                <FiArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <LiveStockProvider productIds={related.map((p) => p.id)}>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
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
