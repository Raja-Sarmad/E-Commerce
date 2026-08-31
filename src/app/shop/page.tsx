import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { LinkPagination as Pagination } from "@/components/ui/LinkPagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { ShopToolbar } from "@/components/shop/ShopToolbar";
import { getProducts, getCategories, getCategoryBySlug } from "@/lib/api/server";
import { FiSearch } from "react-icons/fi";

const PER_PAGE = 12;

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse our full catalog of premium products across electronics, fashion, home, beauty, sports and toys.",
};

type ShopPageProps = PageProps<"/shop">;

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  const categorySlug = typeof params.category === "string" ? params.category : "";
  const category = categorySlug ? await getCategoryBySlug(categorySlug) : undefined;
  if (categorySlug && !category) {
    notFound();
  }

  const page = Math.max(1, Number(params.page) || 1);
  const rating = typeof params.rating === "string" ? Number(params.rating) : undefined;

  let products: Awaited<ReturnType<typeof getProducts>>["products"] = [];
  let meta = { page: 1, limit: PER_PAGE, total: 0, totalPages: 1 };
  try {
    const result = await getProducts({
      categorySlug: categorySlug || undefined,
      brand: typeof params.brand === "string" ? params.brand : undefined,
      minPrice: typeof params.min === "string" ? Number(params.min) : undefined,
      maxPrice: typeof params.max === "string" ? Number(params.max) : undefined,
      inStock: typeof params.inStock === "string" ? params.inStock === "true" : undefined,
      onSale: typeof params.sale === "string" ? params.sale === "on" : undefined,
      sort: typeof params.sort === "string" ? params.sort : undefined,
      page,
      limit: PER_PAGE,
    });
    products = result.products;
    meta = result.meta;
  } catch {
    // backend unavailable — render empty shop
  }

  const pageItems = rating && !Number.isNaN(rating)
    ? products.filter((p) => p.rating >= rating)
    : products;

  const total = rating && !Number.isNaN(rating) ? pageItems.length : meta.total;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const from = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const to = Math.min(from + pageItems.length - 1, total);

  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  try {
    categories = await getCategories();
  } catch {
    // ignore
  }

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: "Catalog", href: "/shop" }, ...(category ? [{ label: category.name }] : [])]} />
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {category ? category.name : "Catalog"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {category
            ? category.description
            : "Browse our full catalog — premium products, honest prices, fast delivery."}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-2xl border border-border bg-card p-5">
            <FilterSidebar />
          </div>
        </aside>

        <div>
          <ShopToolbar total={total} showingFrom={from} showingTo={to} />

          {pageItems.length === 0 ? (
            <EmptyState
              icon={<FiSearch className="h-7 w-7" aria-hidden />}
              title="No products found"
              description="Try adjusting your filters or search terms to find what you're looking for."
              actionLabel="Clear all filters"
              actionHref="/shop"
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                {pageItems.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                className="mt-10"
              />
            </>
          )}
        </div>
      </div>

      {!category && (
        <div className="mt-14 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Browse by category
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Badge key={c.id} variant="outline" className="px-3 py-1.5 text-sm">
                <a href={`/shop?category=${c.slug}`} className="hover:text-primary">
                  {c.name}
                </a>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
