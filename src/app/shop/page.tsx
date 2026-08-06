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
import { products, searchProducts } from "@/lib/data/products";
import { categories, getCategoryBySlug } from "@/lib/data/categories";
import { filterAndSortProducts, paginate } from "@/lib/filter";
import { FiSearch } from "react-icons/fi";

const PER_PAGE = 12;

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse our full catalog of premium products across electronics, fashion, home, beauty, sports and toys.",
};

type ShopPageProps = PageProps<"/shop">;

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  const categorySlug = typeof params.category === "string" ? params.category : "";
  const category = categorySlug ? getCategoryBySlug(categorySlug) : undefined;
  if (categorySlug && !category) {
    notFound();
  }

  const query = {
    category: categorySlug,
    brand: typeof params.brand === "string" ? params.brand : undefined,
    min: typeof params.min === "string" ? params.min : undefined,
    max: typeof params.max === "string" ? params.max : undefined,
    rating: typeof params.rating === "string" ? params.rating : undefined,
    inStock: typeof params.inStock === "string" ? params.inStock : undefined,
    sale: typeof params.sale === "string" ? params.sale : undefined,
    sort: typeof params.sort === "string" ? params.sort : undefined,
  };

  const page = Math.max(1, Number(params.page) || 1);
  const filtered = filterAndSortProducts(products, query);
  const { items: pageItems, total, totalPages } = paginate(filtered, page, PER_PAGE);
  const from = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, total);

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: "Shop", href: "/shop" }, ...(category ? [{ label: category.name }] : [])]} />
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {category ? category.name : "All Products"}
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
