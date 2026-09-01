/** Store prices are saved in USD; display rates convert for the shopper. */
export type CurrencyCode = "USD" | "PKR" | "CAD" | "SAR" | "AUD";

export type CurrencyMeta = {
  code: CurrencyCode;
  label: string;
  symbol: string;
  locale: string;
  /** Multiply USD base price by this rate for display. */
  rateFromUsd: number;
  fractionDigits?: number;
};

export const BASE_CURRENCY: CurrencyCode = "USD";

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  USD: {
    code: "USD",
    label: "US Dollar",
    symbol: "$",
    locale: "en-US",
    rateFromUsd: 1,
  },
  PKR: {
    code: "PKR",
    label: "Pakistani Rupee",
    symbol: "Rs",
    locale: "en-PK",
    rateFromUsd: 278,
    fractionDigits: 0,
  },
  CAD: {
    code: "CAD",
    label: "Canadian Dollar",
    symbol: "CA$",
    locale: "en-CA",
    rateFromUsd: 1.36,
  },
  SAR: {
    code: "SAR",
    label: "Saudi Riyal",
    symbol: "SR",
    locale: "en-SA",
    rateFromUsd: 3.75,
  },
  AUD: {
    code: "AUD",
    label: "Australian Dollar",
    symbol: "A$",
    locale: "en-AU",
    rateFromUsd: 1.52,
  },
};

export const CURRENCY_LIST = Object.values(CURRENCIES);

export function isCurrencyCode(value: string): value is CurrencyCode {
  return value in CURRENCIES;
}

export function convertFromBase(amountUsd: number, code: CurrencyCode): number {
  const rate = CURRENCIES[code]?.rateFromUsd ?? 1;
  return amountUsd * rate;
}

export function formatAmount(
  amountInBase: number,
  code: CurrencyCode = BASE_CURRENCY
): string {
  const meta = CURRENCIES[code] ?? CURRENCIES.USD;
  const safe = Number.isFinite(amountInBase) ? Math.max(0, amountInBase) : 0;
  const converted = convertFromBase(safe, code);
  const digits =
    meta.fractionDigits ?? (converted % 1 === 0 ? 0 : 2);

  return new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(converted);
}
