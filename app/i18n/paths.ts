import { isLocale, type Locale } from "./config";

// "/products/3?image=2" -> "/en/products/3?image=2"
export function withLocale(pathWithSearch: string, locale: Locale): string {
  const path = pathWithSearch.startsWith("/") ? pathWithSearch : `/${pathWithSearch}`;
  return `/${locale}${path === "/" ? "" : path}`;
}

// "/en/cart?x=1" -> "/pt/cart?x=1"; an un-prefixed path gets the prefix added.
export function switchLocale(pathWithSearch: string, locale: Locale): string {
  const [pathname = "/", search = ""] = pathWithSearch.split(/(?=\?)/);
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0]?.toLowerCase();
  const rest = isLocale(first) ? segments.slice(1) : segments;
  const path = rest.length > 0 ? `/${rest.join("/")}` : "";
  return `/${locale}${path}${search}`;
}

// Same-origin relative paths only: "/x" yes, "//evil" and "https://evil" no.
export function isSafeRedirectPath(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//");
}
