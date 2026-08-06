"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiSearch, FiX } from "react-icons/fi";
import { searchProducts } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "@/components/ui/ProductImage";

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (open) setQuery("");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const results = useMemo(() => searchProducts(query).slice(0, 6), [query]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const popularSearches = [
    "Headphones",
    "Smartwatch",
    "Linen shirt",
    "Running shoes",
    "Espresso",
    "Yoga mat",
  ];

  return (
    <div className="animate-fade-in fixed inset-0 z-[90] overflow-y-auto bg-background/95 backdrop-blur-lg">
      <div className="mx-auto max-w-3xl px-4 pt-20 pb-16">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Search</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="rounded-lg p-2 text-foreground transition-colors hover:bg-muted"
          >
            <FiX className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6" role="search">
          <div className="relative">
            <FiSearch
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, brands and more..."
              className="h-14 w-full rounded-2xl border border-border bg-card pr-4 pl-12 text-base text-foreground shadow-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Search products"
            />
          </div>
        </form>

        {!query.trim() ? (
          <div className="mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Popular searches
            </p>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setQuery(term);
                  }}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="mt-12 text-center">
            <FiSearch className="mx-auto h-10 w-10 text-muted-foreground/50" aria-hidden />
            <p className="mt-4 font-semibold text-foreground">No results found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try different keywords or browse all products.
            </p>
            <Link
              href="/shop"
              onClick={onClose}
              className="mt-4 inline-block text-sm font-semibold text-primary hover:text-primary-strong"
            >
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {results.length} result{results.length > 1 ? "s" : ""}
            </p>
            <ul className="space-y-2">
              {results.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/shop/${product.slug}`}
                    onClick={onClose}
                    className="group flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <ProductImage
                      src={product.images[0]}
                      alt={product.name}
                      className="h-14 w-14 shrink-0 rounded-lg"
                      imgClassName="rounded-lg"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground group-hover:text-primary">
                        {product.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {product.brand}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {formatPrice(product.price)}
                      </span>
                      <FiArrowRight
                        className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                        aria-hidden
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={onClose}
              className="mt-4 inline-block text-sm font-semibold text-primary hover:text-primary-strong"
            >
              View all results
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
