import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCard } from "@/components/product/ProductCard";
import { LinkPagination as Pagination } from "@/components/ui/LinkPagination";
import { searchProducts } from "@/lib/api/server";
import { filterAndSortProducts, paginate } from "@/lib/filter";
import { FiSearch } from "react-icons/fi";

const PER_PAGE = 12;

export const revalidate = 30;

type SearchPageProps = PageProps<"/search">;

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  return {
    title: q ? `Search results for "${q}"` : "Search",
    description: `Search results for "${q}" on NovaMart.`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const query = {
    q,
    brand: typeof params.brand === "string" ? params.brand : undefined,
    min: typeof params.min === "string" ? params.min : undefined,
    max: typeof params.max === "string" ? params.max : undefined,
    rating: typeof params.rating === "string" ? params.rating : undefined,
    inStock: typeof params.inStock === "string" ? params.inStock : undefined,
    sort: typeof params.sort === "string" ? params.sort : undefined,
  };
  const page = Math.max(1, Number(params.page) || 1);

  const results = q.trim() ? await searchProducts(q) : [];
  const filtered = filterAndSortProducts(results, query);
  const { items, total, totalPages } = paginate(filtered, page, PER_PAGE);
  const from = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, total);

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: "Search", href: "/search" }, ...(q ? [{ label: `"${q}"` }] : [])]} />
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {q ? `Results for "${q}"` : "Search NovaMart"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {total} {total === 1 ? "result" : "results"} found
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<FiSearch className="h-7 w-7" aria-hidden />}
          title={q ? `No results for "${q}"` : "Enter a search term"}
          description="Try different keywords, check your spelling, or browse our categories instead."
          actionLabel="Browse all products"
          actionHref="/shop"
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {items.map((product) => (
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
    </Container>
  );
}
