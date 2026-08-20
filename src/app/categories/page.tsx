import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductImage } from "@/components/ui/ProductImage";
import { getCategories, getProducts } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Shop NovaMart by category — electronics, fashion, home & living, beauty, sports and toys.",
};

export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  try {
    categories = await getCategories();
  } catch {
    // backend unavailable — render empty state
  }

  const counts = new Map<string, number>();
  if (categories.length > 0) {
    const batches = await Promise.allSettled(
      categories.map(async (c) => {
        const res = await getProducts({ categorySlug: c.slug, limit: 1 });
        return [c.slug, res.meta.total] as const;
      })
    );
    batches.forEach((b) => {
      if (b.status === "fulfilled") counts.set(b.value[0], b.value[1]);
    });
  }

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: "Categories" }]} />
      <div className="mb-10">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Browse by category
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Find exactly what you need. Each collection is carefully curated for
          quality and value.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const count = counts.get(category.slug) ?? category.count ?? 0;
          return (
            <a
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <ProductImage
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-xl font-extrabold text-white">
                    {category.name}
                  </h2>
                  <p className="text-sm text-white/80">
                    {count} {count === 1 ? "product" : "products"}
                  </p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
                <span className="mt-3 inline-block text-sm font-semibold text-primary transition-colors group-hover:text-primary-strong">
                  Shop {category.name} →
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </Container>
  );
}
