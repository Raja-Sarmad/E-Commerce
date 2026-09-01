import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { formatAmount, type CurrencyCode } from "./currency";
import { getActiveCurrencyCode } from "./rtk/currency-bridge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currencyCode?: CurrencyCode) {
  return formatAmount(amount, currencyCode ?? getActiveCurrencyCode());
}

/** Keep only a positive decimal string for price inputs (no minus sign). */
export function sanitizePositiveDecimal(raw: string): string {
  let value = raw.replace(/[^\d.]/g, "");
  const dotIndex = value.indexOf(".");
  if (dotIndex !== -1) {
    value = `${value.slice(0, dotIndex + 1)}${value.slice(dotIndex + 1).replace(/\./g, "")}`;
  }
  return value;
}

/** Keep only a non-negative whole number string for stock/quantity inputs. */
export function sanitizeWholeNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateLong(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function calculateDiscount(price: number, compareAtPrice?: number) {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function timeAgo(date: string) {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );
  const intervals: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [604800, "week"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [secondsIn, unit] of intervals) {
    const count = Math.floor(seconds / secondsIn);
    if (count >= 1) {
      return count === 1 ? `1 ${unit} ago` : `${count} ${unit}s ago`;
    }
  }
  return "just now";
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function generateId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function isInStock(product: { stock: number }) {
  return product.stock > 0;
}

export function getStockLabel(product: { stock: number }) {
  if (product.stock === 0) return "Out of stock";
  if (product.stock <= 10) return `Only ${product.stock} left`;
  if (product.stock <= 30) return "Low stock";
  return "In stock";
}
