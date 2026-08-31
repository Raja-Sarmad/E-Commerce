export type DateRangePreset =
  | "all"
  | "today"
  | "7d"
  | "30d"
  | "last_month"
  | "this_month"
  | "90d"
  | "year"
  | "custom";

export const DATE_RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "last_month", label: "Last month" },
  { value: "this_month", label: "This month" },
  { value: "90d", label: "Last 90 days" },
  { value: "year", label: "This year" },
  { value: "custom", label: "Custom dates" },
];

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

/** Map preset to API `start` / `end` query params (YYYY-MM-DD). */
export function dateRangeFromPreset(preset: DateRangePreset): {
  start?: string;
  end?: string;
} {
  if (preset === "all") return {};

  const now = new Date();
  const today = startOfDay(now);

  switch (preset) {
    case "today":
      return { start: toIsoDate(today), end: toIsoDate(endOfDay(now)) };
    case "7d": {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return { start: toIsoDate(start), end: toIsoDate(endOfDay(now)) };
    }
    case "30d": {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      return { start: toIsoDate(start), end: toIsoDate(endOfDay(now)) };
    }
    case "90d": {
      const start = new Date(today);
      start.setDate(start.getDate() - 89);
      return { start: toIsoDate(start), end: toIsoDate(endOfDay(now)) };
    }
    case "this_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: toIsoDate(start), end: toIsoDate(endOfDay(now)) };
    }
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: toIsoDate(start), end: toIsoDate(endOfDay(end)) };
    }
    case "year": {
      const start = new Date(now.getFullYear(), 0, 1);
      return { start: toIsoDate(start), end: toIsoDate(endOfDay(now)) };
    }
    default:
      return {};
  }
}

/** Resolve preset or custom YYYY-MM-DD inputs to API query params. */
export function resolveDateRange(
  preset: DateRangePreset,
  custom?: { start?: string; end?: string }
): { start?: string; end?: string } {
  if (preset === "custom") {
    return {
      start: custom?.start || undefined,
      end: custom?.end || undefined,
    };
  }
  return dateRangeFromPreset(preset);
}
