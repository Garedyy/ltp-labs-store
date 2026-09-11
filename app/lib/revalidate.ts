import type { ShouldRevalidateFunctionArgs } from "react-router";

// Shell loaders (locale, brand, cart count, error titles) only depend on the pathname and on
// mutations: search-param changes such as ?image or ?page must not refetch them.
export function revalidateOnPathnameOrSubmit({
  currentUrl,
  nextUrl,
  formMethod,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs): boolean {
  if (formMethod) return defaultShouldRevalidate;
  return currentUrl.pathname !== nextUrl.pathname;
}
