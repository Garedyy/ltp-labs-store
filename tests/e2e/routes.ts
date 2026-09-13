import { localeCodes } from "../../app/i18n/config";

// Locale-relative paths; every feature PR appends the routes it adds. Scans run per locale.
export const ROUTES: readonly string[] = [
  "/",
  "/shop",
  "/shop?category=beauty&sort=price-asc",
  "/shop?page=2",
  "/shop?page=9",
  "/products/1",
  "/products/117",
  "/products/117?image=2",
  "/products/16",
  "/products/9999",
  "/search",
  "/search?q=phone",
  "/search?q=zzzzzz",
  "/cart",
  "/checkout?product=1",
  "/checkout/confirmation",
  "/about",
  "/contact",
  "/contact?sent=1",
  "/blog",
  "/account",
  "/account?demo=1",
  "/nowhere",
];

export const LOCALES = localeCodes;

export function localised(route: string, locale: string): string {
  return `/${locale}${route === "/" ? "" : route}`;
}
