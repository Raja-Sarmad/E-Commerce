"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import { ProductImage } from "@/components/ui/ProductImage";
import { useFormatPrice } from "@/hooks/use-format-price";
import {
  useGetStorefrontCategoriesQuery,
  useGetStorefrontProductsQuery,
  useLazyGetStorefrontProductsQuery,
} from "@/lib/rtk/storefrontApi";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type TabId = "all" | "bestsellers" | string;

/** 4 hero + 8 grid cards per catalog page */
const PAGE_SIZE = 12;

function paginationItems(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) {
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "…", current - 1, current, current + 1, "…", total];
}

function productTag(product: Product): string {
  if (product.onSale && product.discountPercent > 0) return `${product.discountPercent}% off`;
  if (product.tags[0]) return product.tags[0];
  if (product.isNew) return "New";
  if (product.isBestSeller) return "Bestseller";
  return product.category;
}

function productBlurb(product: Product): string {
  const text = product.description?.trim();
  if (text) return text.length > 56 ? `${text.slice(0, 56)}…` : text;
  return product.features[0] ?? "";
}

function CatalogTile({ product }: { product: Product }) {
  const formatPrice = useFormatPrice();
  const image = product.images[0] ?? "";
  const hasCompare =
    product.compareAtPrice != null && product.compareAtPrice > product.price;

  return (
    <Link href={`/shop/${product.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/35 hover:shadow-[0_22px_44px_-14px_rgba(109,40,217,0.28)]">
        <div className="relative aspect-[4/5] overflow-hidden">
          <ProductImage
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            imgClassName="object-cover object-center transition duration-700 group-hover:scale-110"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/55 via-foreground/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden
          />
          <span className="absolute top-3 left-3 z-10 rounded-full bg-primary/90 px-3 py-1 text-[11px] font-medium text-primary-foreground shadow-sm backdrop-blur-sm">
            {productTag(product)}
          </span>
          <span className="absolute right-3 bottom-3 z-10 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-card/95 text-primary opacity-0 shadow-md backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <FiArrowUpRight className="h-4 w-4" aria-hidden />
          </span>
        </div>

        <div className="flex flex-1 flex-col p-3.5 sm:p-4">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-foreground sm:text-base">
            {product.name}
          </h3>
          {productBlurb(product) ? (
            <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground sm:text-[13px]">
              {productBlurb(product)}
            </p>
          ) : null}
          <div className="mt-auto flex items-end justify-between gap-2 pt-3">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-sm font-bold text-foreground sm:text-base">
                {formatPrice(product.price)}
              </span>
              {hasCompare ? (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              ) : null}
            </div>
            <span className="text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
              View
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function CatalogSection() {
  const catalogTopRef = useRef<HTMLDivElement>(null);
  const gridBottomRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<TabId>("all");
  const [page, setPage] = useState(1);
  const [extraGridProducts, setExtraGridProducts] = useState<Product[]>([]);
  const [extraPagesLoaded, setExtraPagesLoaded] = useState(0);

  const { data: categories = [], isLoading: catsLoading } =
    useGetStorefrontCategoriesQuery();

  const filterQuery = useMemo(() => {
    const base = { limit: PAGE_SIZE, sort: "position" as const };
    if (tab === "all") return base;
    if (tab === "bestsellers") return { ...base, bestSeller: true };
    return { ...base, categorySlug: tab };
  }, [tab]);

  const productQuery = useMemo(
    () => ({ ...filterQuery, page }),
    [filterQuery, page]
  );

  const { data: catalogData, isLoading: productsLoading } =
    useGetStorefrontProductsQuery(productQuery);

  const [fetchMoreProducts, { isFetching: loadingMore }] =
    useLazyGetStorefrontProductsQuery();

  const tabs = useMemo(() => {
    const cover = categories[0]?.image ?? "";
    const items: Array<{ id: TabId; label: string; image: string }> = [
      { id: "all", label: "Shop All", image: cover },
      {
        id: "bestsellers",
        label: "Bestsellers",
        image: categories[1]?.image ?? cover,
      },
    ];
    for (const cat of categories.slice(0, 3)) {
      items.push({ id: cat.slug, label: cat.name, image: cat.image });
    }
    return items;
  }, [categories]);

  const products = catalogData?.products ?? [];
  const totalPages = Math.max(1, catalogData?.meta.totalPages ?? 1);
  const heroProducts = products.slice(0, 4);
  const gridProducts = products.slice(4, PAGE_SIZE);
  const allGridProducts = [...gridProducts, ...extraGridProducts];
  const pageButtons = paginationItems(page, totalPages);
  const canLoadMore = page + extraPagesLoaded < totalPages;

  const lookImage =
    categories.find((c) => c.featured)?.image ??
    categories[0]?.image ??
    products[0]?.images[0] ??
    "";

  const loading = catsLoading || productsLoading;

  function resetExtraPages() {
    setExtraGridProducts([]);
    setExtraPagesLoaded(0);
  }

  function goToPage(next: number) {
    const safe = Math.min(Math.max(1, next), totalPages);
    setPage(safe);
    resetExtraPages();
    catalogTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function loadMore() {
    if (!canLoadMore || loadingMore) return;
    const nextPage = page + extraPagesLoaded + 1;
    try {
      const result = await fetchMoreProducts({
        ...filterQuery,
        page: nextPage,
      }).unwrap();
      setExtraGridProducts((prev) => [
        ...prev,
        ...result.products.slice(4, PAGE_SIZE),
      ]);
      setExtraPagesLoaded((n) => n + 1);
      gridBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch {
      /* ignore */
    }
  }

  return (
    <section
      id="catalog"
      aria-labelledby="catalog-heading"
      className="scroll-mt-24 bg-secondary px-5 pt-14 pb-16 sm:px-8 sm:pt-16 sm:pb-20 lg:px-12 lg:pt-20 lg:pb-24"
    >
      <div className="mx-auto max-w-[1440px]">
        <h2
          id="catalog-heading"
          className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem]"
        >
          Catalog
        </h2>
        <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-primary/50 sm:mt-4" />

        <div className="mx-auto mt-10 flex max-w-4xl justify-center overflow-x-auto sm:mt-12">
          <div className="flex items-center gap-1 rounded-full border border-border/60 bg-card px-2 py-2 shadow-sm sm:gap-2 sm:px-3">
            {tabs.map((item) => {
              const selected = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTab(item.id);
                    setPage(1);
                    resetExtraPages();
                  }}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full py-1.5 pr-4 pl-1.5 text-sm transition",
                    selected
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-background">
                    {item.image ? (
                      <ProductImage
                        src={item.image}
                        alt=""
                        fill
                        sizes="32px"
                        imgClassName="object-cover object-center"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-muted text-[10px] text-muted-foreground">
                        •
                      </span>
                    )}
                  </span>
                  <span className="pr-1 whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          ref={catalogTopRef}
          className="mt-10 grid items-stretch gap-8 lg:mt-14 lg:grid-cols-2 lg:gap-10"
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-5 sm:gap-y-8">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="skeleton aspect-[4/5] rounded-2xl" />
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-3 w-full rounded" />
                  </div>
                ))
              : heroProducts.map((product) => (
                  <CatalogTile key={product.id} product={product} />
                ))}
            {!loading && heroProducts.length === 0 ? (
              <p className="col-span-2 py-16 text-center text-sm text-muted-foreground">
                No products yet — add products from the admin dashboard.
              </p>
            ) : null}
          </div>

          <div className="relative min-h-[420px] overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_24px_48px_-20px_rgba(109,40,217,0.35)] ring-1 ring-primary/15 sm:min-h-[520px] lg:min-h-full">
            {lookImage ? (
              <ProductImage
                src={lookImage}
                alt="Shop the look"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                imgClassName="object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 bg-muted" />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
          </div>
        </div>

        {allGridProducts.length > 0 ? (
          <div
            ref={gridBottomRef}
            className="mt-16 grid grid-cols-2 gap-x-4 gap-y-6 sm:mt-20 sm:gap-x-5 sm:gap-y-8 md:grid-cols-4 lg:mt-24"
          >
            {allGridProducts.map((product) => (
              <CatalogTile key={product.id} product={product} />
            ))}
          </div>
        ) : null}

        {totalPages > 1 ? (
          <div className="mt-12 flex flex-col items-center justify-between gap-6 sm:mt-14 sm:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {pageButtons.map((item, index) =>
                item === "…" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-1 text-sm text-muted-foreground"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    aria-current={item === page ? "page" : undefined}
                    onClick={() => goToPage(item)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition",
                      item === page
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : "border border-border bg-card text-foreground hover:border-primary/40 hover:text-primary"
                    )}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                type="button"
                aria-label="Next page"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
                className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-primary/40 hover:text-primary disabled:opacity-30"
              >
                »
              </button>
            </div>

            <button
              type="button"
              disabled={!canLoadMore || loadingMore}
              onClick={() => void loadMore()}
              className="rounded-full border border-foreground/80 bg-card px-10 py-3 text-[11px] font-semibold tracking-[0.22em] text-foreground uppercase transition hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-35"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
