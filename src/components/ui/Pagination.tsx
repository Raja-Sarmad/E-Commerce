"use client";

import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  buildHref?: (page: number) => string;
  className?: string;
};

function getPageItems(page: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push("...");
  pages.push(totalPages);
  return pages;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  buildHref,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  const items = getPageItems(page, totalPages);

  const renderItem = (item: number | "...", index: number) => {
    if (item === "...") {
      return (
        <span key={`dots-${index}`} className="px-2 text-sm text-muted-foreground">
          ...
        </span>
      );
    }
    const isActive = item === page;
    const classNameInner = cn(
      "flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium transition-all",
      isActive
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-foreground hover:bg-muted"
    );
    if (buildHref) {
      return (
        <Link
          key={item}
          href={buildHref(item)}
          aria-current={isActive ? "page" : undefined}
          className={classNameInner}
        >
          {item}
        </Link>
      );
    }
    return (
      <button
        key={item}
        type="button"
        onClick={() => onPageChange?.(item)}
        aria-current={isActive ? "page" : undefined}
        className={classNameInner}
      >
        {item}
      </button>
    );
  };

  const navProps = {
    "aria-label": "Pagination",
  };

  return (
    <nav {...navProps} className={cn("flex items-center justify-center gap-1.5", className)}>
      {buildHref ? (
        <Link
          href={buildHref(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors",
            page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-muted"
          )}
        >
          <FiChevronLeft className="h-4 w-4" aria-hidden />
          <span className="sr-only">Previous page</span>
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => onPageChange?.(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          aria-label="Previous page"
        >
          <FiChevronLeft className="h-4 w-4" aria-hidden />
        </button>
      )}
      {items.map((item, i) => renderItem(item, i))}
      {buildHref ? (
        <Link
          href={buildHref(Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors",
            page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-muted"
          )}
        >
          <FiChevronRight className="h-4 w-4" aria-hidden />
          <span className="sr-only">Next page</span>
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          aria-label="Next page"
        >
          <FiChevronRight className="h-4 w-4" aria-hidden />
        </button>
      )}
    </nav>
  );
}
