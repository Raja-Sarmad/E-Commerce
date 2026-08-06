"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiList, FiSliders, FiLayout } from "react-icons/fi";
import { Select } from "@/components/ui/Select";
import { Drawer } from "@/components/ui/Drawer";
import { FilterSidebar } from "./FilterSidebar";
import { cn } from "@/lib/utils";

export const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

type ShopToolbarProps = {
  total: number;
  showingFrom: number;
  showingTo: number;
};

export function ShopToolbar({ total, showingFrom, showingTo }: ShopToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");

  const sort = searchParams.get("sort") ?? "featured";

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted lg:hidden"
        >
          <FiSliders className="h-4 w-4" aria-hidden />
          Filters
        </button>
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{showingFrom}–{showingTo}</span> of{" "}
          <span className="font-semibold text-foreground">{total}</span> products
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center rounded-lg border border-border bg-card p-1 sm:flex">
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-label="Grid view"
            className={cn(
              "rounded-md p-1.5 transition-colors",
              view === "grid"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FiLayout className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            aria-label="List view"
            className={cn(
              "rounded-md p-1.5 transition-colors",
              view === "list"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FiList className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <Select
          value={sort}
          onChange={(e) => handleSort(e.target.value)}
          aria-label="Sort products"
          className="h-10 w-44 text-sm sm:w-48"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filters"
        side="left"
        size="sm"
      >
        <FilterSidebar onClose={() => setDrawerOpen(false)} />
      </Drawer>
    </div>
  );
}
