"use client";

import { Select } from "@/components/ui/Select";
import { FiCalendar } from "react-icons/fi";
import {
  DATE_RANGE_OPTIONS,
  type DateRangePreset,
} from "@/lib/admin-filters";

type DateRangeFilterProps = {
  value: DateRangePreset;
  onChange: (value: DateRangePreset) => void;
  containerClassName?: string;
  className?: string;
};

export function DateRangeFilter({
  value,
  onChange,
  containerClassName = "sm:w-44",
  className = "h-10",
}: DateRangeFilterProps) {
  return (
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
  );
}
