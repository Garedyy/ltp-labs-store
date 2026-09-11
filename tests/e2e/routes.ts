import { localeCodes } from "../../app/i18n/config";

// Locale-relative paths; every feature PR appends the routes it adds. Scans run per locale.
export const ROUTES: readonly string[] = ["/", "/nowhere"];

export const LOCALES = localeCodes;

export function localised(route: string, locale: string): string {
  return `/${locale}${route === "/" ? "" : route}`;
}
