"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsDown,
  FiChevronsLeft,
  FiChevronsRight,
  FiChevronUp,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";

export type Column<T> = {
  key: string;
  header: ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  render?: (row: T) => ReactNode;
  align?: "left" | "center" | "right";
  headerClassName?: string;
  className?: string;
};

export type SortState = { key: string; direction: "asc" | "desc" };

type DataTableEmpty = {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
};

type DataTablePagination = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  skeletonRows?: number;
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;
  empty?: DataTableEmpty;
  pagination?: DataTablePagination;
  toolbar?: ReactNode;
  bulkBar?: ReactNode;
  className?: string;
  cardClassName?: string;
  stickyHeader?: boolean;
};

const alignClass: Record<NonNullable<Column<never>["align"]>, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  skeletonRows = 6,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  sort,
  onSortChange,
  empty,
  pagination,
  toolbar,
  bulkBar,
  className,
  cardClassName,
  stickyHeader = true,
}: DataTableProps<T>) {
  const [internalSort, setInternalSort] = useState<SortState | undefined>();
  const sortState = sort ?? internalSort;

  const selected = selectedKeys ?? new Set<string>();

  const sortedRows = useMemo(() => {
    if (!sortState) return rows;
    const col = columns.find((c) => c.key === sortState.key);
    if (!col || !col.sortable || !col.sortValue) return rows;
    const factor = sortState.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (typeof av === "number" && typeof bv === "number") {
        return (av - bv) * factor;
      }
      return String(av).localeCompare(String(bv)) * factor;
    });
  }, [rows, sortState, columns]);

  const allVisibleKeys = sortedRows.map(rowKey);
  const allVisibleSelected = allVisibleKeys.every((k) => selected.has(k));

  const handleSort = (col: Column<T>) => {
    if (!col.sortable) return;
    const next: SortState =
      sortState?.key === col.key
        ? { key: col.key, direction: sortState.direction === "asc" ? "desc" : "asc" }
        : { key: col.key, direction: "asc" };
    if (onSortChange) onSortChange(next);
    else setInternalSort(next);
  };

  const toggleAll = () => {
    if (!onSelectionChange) return;
    const next = new Set(selected);
    if (allVisibleSelected) {
      allVisibleKeys.forEach((k) => next.delete(k));
    } else {
      allVisibleKeys.forEach((k) => next.add(k));
    }
    onSelectionChange(next);
  };

  const toggleRow = (key: string) => {
    if (!onSelectionChange) return;
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange(next);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {toolbar && <div>{toolbar}</div>}
      {selectable && selected.size > 0 && bulkBar && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5">
          <p className="text-sm font-semibold text-foreground">
            {selected.size} selected
          </p>
          {bulkBar}
        </div>
      )}
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
          cardClassName
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead
              className={cn(
                "bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground",
                stickyHeader && "sticky top-0 z-10"
              )}
            >
              <tr className="border-b border-border">
                {selectable && (
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all rows"
                      className="h-4 w-4 rounded border-border accent-primary"
                      checked={allVisibleSelected && allVisibleKeys.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-3 font-semibold",
                      alignClass[col.align ?? "left"],
                      col.headerClassName
                    )}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col)}
                        className={cn(
                          "inline-flex items-center gap-1 transition-colors hover:text-foreground",
                          sortState?.key === col.key && "text-foreground"
                        )}
                      >
                        {col.header}
                        {sortState?.key === col.key ? (
                          sortState.direction === "asc" ? (
                            <FiChevronUp className="h-3.5 w-3.5" aria-hidden />
                          ) : (
                            <FiChevronDown className="h-3.5 w-3.5" aria-hidden />
                          )
                        ) : (
                          <FiChevronsDown className="h-3.5 w-3.5 opacity-40" aria-hidden />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: skeletonRows }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="hover:bg-muted/40">
                    {selectable && (
                      <td className="px-4 py-3.5">
                        <Skeleton className="h-4 w-4 rounded" />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn("px-4 py-3.5", alignClass[col.align ?? "left"])}
                      >
                        <Skeleton className="h-4 w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sortedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="px-4 py-6"
                  >
                    <EmptyState
                      icon={empty?.icon}
                      title={empty?.title ?? "No results found"}
                      description={empty?.description}
                      actionLabel={empty?.actionLabel}
                      actionHref={empty?.actionHref}
                      onAction={empty?.onAction}
                      className="border-0 bg-transparent py-10"
                    />
                  </td>
                </tr>
              ) : (
                sortedRows.map((row) => {
                  const key = rowKey(row);
                  const isSelected = selected.has(key);
                  return (
                    <tr
                      key={key}
                      className={cn(
                        "transition-colors hover:bg-muted/40",
                        isSelected && "bg-primary/5"
                      )}
                    >
                      {selectable && (
                        <td className="px-4 py-3.5">
                          <input
                            type="checkbox"
                            aria-label="Select row"
                            className="h-4 w-4 rounded border-border accent-primary"
                            checked={isSelected}
                            onChange={() => toggleRow(key)}
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={cn(
                            "px-4 py-3.5",
                            alignClass[col.align ?? "left"],
                            col.className
                          )}
                        >
                          {col.render
                            ? col.render(row)
                            : (row as Record<string, ReactNode>)[col.key]}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {pagination.totalItems === 0
                  ? 0
                  : (pagination.page - 1) * pagination.pageSize + 1}
              </span>
              –{" "}
              <span className="font-semibold text-foreground">
                {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)}
              </span>{" "}
              of <span className="font-semibold text-foreground">{pagination.totalItems}</span>
            </p>
            <div className="flex items-center gap-2">
              {pagination.onPageSizeChange && pagination.pageSizeOptions && (
                <Select
                  value={pagination.pageSize}
                  onChange={(e) =>
                    pagination.onPageSizeChange?.(Number(e.target.value))
                  }
                  containerClassName="w-24"
                  className="h-9 px-3 text-xs"
                  aria-label="Rows per page"
                >
                  {pagination.pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size} / page
                    </option>
                  ))}
                </Select>
              )}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="First page"
                  disabled={pagination.page <= 1}
                  onClick={() => pagination.onPageChange(1)}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                >
                  <FiChevronsLeft className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={pagination.page <= 1}
                  onClick={() => pagination.onPageChange(pagination.page - 1)}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                >
                  <FiChevronLeft className="h-4 w-4" aria-hidden />
                </button>
                <span className="px-2 text-xs font-semibold text-foreground">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => pagination.onPageChange(pagination.page + 1)}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                >
                  <FiChevronRight className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Last page"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => pagination.onPageChange(pagination.totalPages)}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                >
                  <FiChevronsRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
