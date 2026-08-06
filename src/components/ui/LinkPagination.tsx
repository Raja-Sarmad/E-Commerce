"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Pagination } from "./Pagination";

type LinkPaginationProps = {
  page: number;
  totalPages: number;
  className?: string;
};

export function LinkPagination({ page, totalPages, className }: LinkPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildHref = (targetPage: number) => {
    const url = new URLSearchParams(searchParams.toString());
    if (targetPage > 1) url.set("page", String(targetPage));
    else url.delete("page");
    const qs = url.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
  };

  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      buildHref={buildHref}
      className={className}
    />
  );
}
