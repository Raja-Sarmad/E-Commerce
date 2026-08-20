"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiCheck,
  FiChevronDown,
  FiStar,
  FiX,
} from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCategories, useBrands } from "@/hooks/use-catalog";
import { cn } from "@/lib/utils";

const priceBrackets = [
  { label: "Under $50", min: 0, max: 50 },
  { label: "$50 – $100", min: 50, max: 100 },
  { label: "$100 – $250", min: 100, max: 250 },
  { label: "$250 – $500", min: 250, max: 500 },
  { label: "Over $500", min: 500, max: Infinity },
];

type FilterSidebarProps = {
  onClose?: () => void;
};

export function FilterSidebar({ onClose }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: categories = [] } = useCategories();
  const { data: brandsData = [] } = useBrands();
  const brands = brandsData.map((b) => b.name);

  const category = searchParams.get("category") ?? "";
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get("brand") ? searchParams.get("brand")!.split(",") : []
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("min") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") ?? "");
  const [selectedRating, setSelectedRating] = useState(
    Number(searchParams.get("rating") ?? 0)
  );
  const [inStock, setInStock] = useState(
    searchParams.get("inStock") === "true"
  );

  useEffect(() => {
    setSelectedBrands(
      searchParams.get("brand") ? searchParams.get("brand")!.split(",") : []
    );
    setMinPrice(searchParams.get("min") ?? "");
    setMaxPrice(searchParams.get("max") ?? "");
    setSelectedRating(Number(searchParams.get("rating") ?? 0));
    setInStock(searchParams.get("inStock") === "true");
  }, [searchParams]);

  const activeCount = useMemo(() => {
    let count = 0;
    if (category) count++;
    count += selectedBrands.length;
    if (minPrice || maxPrice) count++;
    if (selectedRating) count++;
    if (inStock) count++;
    return count;
  }, [category, selectedBrands, minPrice, maxPrice, selectedRating, inStock]);

  const buildQuery = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    if (category) params.set("category", category);
    params.delete("brand");
    if (selectedBrands.length) params.set("brand", selectedBrands.join(","));
    params.delete("min");
    if (minPrice) params.set("min", minPrice);
    params.delete("max");
    if (maxPrice) params.set("max", maxPrice);
    params.delete("rating");
    if (selectedRating) params.set("rating", String(selectedRating));
    params.delete("inStock");
    if (inStock) params.set("inStock", "true");
    params.delete("page");
    return params.toString();
  };

  const apply = () => {
    router.push(`/shop?${buildQuery()}`);
    onClose?.();
  };

  const clearAll = () => {
    router.push("/shop");
    onClose?.();
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-lg font-bold text-foreground">Filters</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close filters"
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
        >
          <FiX className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <div className="flex-1 space-y-7 overflow-y-auto pb-6">
        <FilterGroup
          title="Category"
          count={category ? 1 : 0}
          defaultOpen
        >
          <ul className="space-y-1.5">
            {categories.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (params.get("category") === c.slug) {
                      params.delete("category");
                    } else {
                      params.set("category", c.slug);
                    }
                    params.delete("page");
                    router.push(`/shop?${params.toString()}`);
                    onClose?.();
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                    category === c.slug
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  {c.name}
                  <span className="text-xs text-muted-foreground">
                    {c.count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </FilterGroup>

        <FilterGroup title="Price range" count={minPrice || maxPrice ? 1 : 0} defaultOpen>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              min={0}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              aria-label="Minimum price"
              className="h-10"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="number"
              placeholder="Max"
              min={0}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              aria-label="Maximum price"
              className="h-10"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {priceBrackets.map((bracket) => (
              <button
                key={bracket.label}
                type="button"
                onClick={() => {
                  setMinPrice(
                    bracket.min === 0 ? "" : String(bracket.min)
                  );
                  setMaxPrice(
                    bracket.max === Infinity ? "" : String(bracket.max)
                  );
                }}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {bracket.label}
              </button>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Brand" count={selectedBrands.length}>
          <ul className="space-y-1">
            {brands.map((brand) => (
              <li key={brand}>
                <button
                  type="button"
                  onClick={() => toggleBrand(brand)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <span
                    className={cn(
                      "flex h-4.5 w-4.5 items-center justify-center rounded border",
                      selectedBrands.includes(brand)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    )}
                    style={{ width: 18, height: 18 }}
                  >
                    {selectedBrands.includes(brand) && (
                      <FiCheck className="h-3 w-3" aria-hidden />
                    )}
                  </span>
                  {brand}
                </button>
              </li>
            ))}
          </ul>
        </FilterGroup>

        <FilterGroup title="Rating" count={selectedRating ? 1 : 0} defaultOpen>
          <ul className="space-y-1">
            {[4.5, 4, 3].map((rating) => (
              <li key={rating}>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedRating((prev) =>
                      prev === rating ? 0 : rating
                    )
                  }
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <span
                    className={cn(
                      "flex items-center justify-center rounded border",
                      selectedRating === rating
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    )}
                    style={{ width: 18, height: 18 }}
                  >
                    {selectedRating === rating && (
                      <FiCheck className="h-3 w-3" aria-hidden />
                    )}
                  </span>
                  <span className="flex items-center gap-0.5">
                    {rating}
                    <FiStar className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden />
                    <span className="text-muted-foreground">& up</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </FilterGroup>

        <FilterGroup title="Availability">
          <button
            type="button"
            onClick={() => setInStock((prev) => !prev)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <span
              className={cn(
                "flex items-center justify-center rounded border",
                inStock ? "border-primary bg-primary text-primary-foreground" : "border-border"
              )}
              style={{ width: 18, height: 18 }}
            >
              {inStock && <FiCheck className="h-3 w-3" aria-hidden />}
            </span>
            In stock only
          </button>
        </FilterGroup>
      </div>

      <div className="flex gap-2 border-t border-border pt-4">
        <Button variant="outline" onClick={clearAll} className="flex-1">
          Clear all
        </Button>
        <Button onClick={apply} className="flex-1">
          Apply filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </Button>
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  count = 0,
  defaultOpen = false,
  children,
}: {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border pb-5">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-1"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-foreground">
          {title}
          {count > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {count}
            </span>
          )}
        </span>
        <FiChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300",
          open ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
