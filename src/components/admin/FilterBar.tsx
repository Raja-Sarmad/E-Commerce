"use client";

import type { ReactNode } from "react";
import { FiSearch } from "react-icons/fi";
import { Input } from "@/components/ui/Input";

type FilterBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  className?: string;
};

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  leftSlot,
  rightSlot,
  className,
}: FilterBarProps) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            leftIcon={<FiSearch className="h-4 w-4" aria-hidden />}
            containerClassName="sm:w-64"
            className="h-10"
          />
          {leftSlot}
        </div>
        {rightSlot && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  );
}
