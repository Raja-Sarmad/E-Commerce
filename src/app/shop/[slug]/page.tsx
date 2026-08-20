import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FiCheck } from "react-icons/fi";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Tabs } from "@/components/ui/Tabs";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import { ProductSection } from "@/components/home/ProductSection";
import { getProductBySlug } from "@/lib/api/server";

export const dynamic = "force-dynamic";

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

  const specsEntries = product.specifications ? Object.entries(product.specifications as Record<string, unknown>) : [];

  return (
    <div className="py-6">
      <Container>
        <Breadcrumb
          items={[
            { label: "Shop", href: "/shop" },
            { label: product.category, href: `/shop?category=${product.categorySlug}` },
            { label: product.name },
          ]}
        />

        <div className="grid gap-10 lg:grid-cols-2">
          <ProductGallery images={product.images} name={product.name} />
          <ProductDetails product={product} />
        </div>

        <div className="mt-16">
          <Tabs
            defaultKey="description"
            tabs={[
              {
                key: "description",
                label: "Description",
                content: (
                  <div className="max-w-3xl space-y-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {product.description}
                    </p>
                    <div>
                      <h4 className="mb-3 text-sm font-bold text-foreground">
                        Key features
                      </h4>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {product.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <FiCheck
                              className="mt-0.5 h-4 w-4 shrink-0 text-success"
                              aria-hidden
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ),
              },
              {
                key: "specifications",
                label: "Specifications",
                content: (
                  <div className="max-w-3xl overflow-hidden rounded-2xl border border-border bg-card">
                    <dl>
                      {specsEntries.map(([key, value], index) => (
                        <div
                          key={key}
                          className={`grid grid-cols-[180px_1fr] gap-4 px-5 py-3.5 text-sm ${
                            index % 2 === 0 ? "bg-muted/40" : ""
                          }`}
                        >
                          <dt className="font-semibold text-foreground">{key}</dt>
                          <dd className="text-muted-foreground">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ),
              },
              {
                key: "reviews",
                label: `Reviews (${product.reviewsCount.toLocaleString()})`,
                content: <ReviewsSection product={product} />,
              },
            ]}
          />
        </div>

        <div className="mt-16">
          <ProductSection
            badge="You may also like"
            title="Related products"
            subtitle="Customers who viewed this item also looked at these."
            products={related}
            columns={4}
          />
        </div>
      </Container>
    </div>
  );
}
