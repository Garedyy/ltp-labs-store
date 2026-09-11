import { LOCALES, type Locale } from "./config";

// Intl runs in loaders only, so server and client HTML always match.
export function formatPrice(cents: number, locale: Locale): string {
  return new Intl.NumberFormat(LOCALES[locale].intlLocale, {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatNumber(value: number, locale: Locale, maximumFractionDigits = 1): string {
  return new Intl.NumberFormat(LOCALES[locale].intlLocale, { maximumFractionDigits }).format(value);
}

// formatPercent(-0.15) -> "-15%"
export function formatPercent(ratio: number, locale: Locale): string {
  return new Intl.NumberFormat(LOCALES[locale].intlLocale, {
    style: "percent",
    signDisplay: "always",
    maximumFractionDigits: 0,
  }).format(ratio);
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(LOCALES[locale].intlLocale, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(iso));
}
