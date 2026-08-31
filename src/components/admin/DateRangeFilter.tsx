"use client";

import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { FiCalendar } from "react-icons/fi";
import {
  DATE_RANGE_OPTIONS,
  type DateRangePreset,
} from "@/lib/admin-filters";

type DateRangeFilterProps = {
  value: DateRangePreset;
  onChange: (value: DateRangePreset) => void;
  customStart?: string;
  customEnd?: string;
  onCustomStartChange?: (value: string) => void;
  onCustomEndChange?: (value: string) => void;
  containerClassName?: string;
  className?: string;
  showCustomInputs?: boolean;
};

export function DateRangeFilter({
  value,
  onChange,
  customStart = "",
  customEnd = "",
  onCustomStartChange,
  onCustomEndChange,
  containerClassName = "sm:w-44",
  className = "h-10",
  showCustomInputs = true,
}: DateRangeFilterProps) {
  const isCustom = value === "custom";

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as DateRangePreset)}
        containerClassName={containerClassName}
        className={className}
        leftIcon={<FiCalendar className="h-4 w-4" aria-hidden />}
        aria-label="Date range"
      >
        {DATE_RANGE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>

      {showCustomInputs && isCustom && (
        <>
          <Input
            type="date"
            value={customStart}
            onChange={(e) => onCustomStartChange?.(e.target.value)}
            containerClassName="sm:w-40"
            className="h-10"
            aria-label="From date"
          />
          <Input
            type="date"
            value={customEnd}
            onChange={(e) => onCustomEndChange?.(e.target.value)}
            containerClassName="sm:w-40"
            className="h-10"
            min={customStart || undefined}
            aria-label="To date"
          />
        </>
      )}
    </div>
  );
}
