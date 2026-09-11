import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";
import { localeCookie } from "./locale-cookie.server";

// Serves only "/" and un-prefixed redirects: cookie, then Accept-Language, then the default.
export async function detectLocale(request: Request): Promise<Locale> {
  const fromCookie = await localeCookie.parse(request.headers.get("Cookie"));
  if (isLocale(fromCookie)) return fromCookie;
  return localeFromAcceptLanguage(request.headers.get("Accept-Language")) ?? DEFAULT_LOCALE;
}

export function localeFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const candidates = header
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params.find((param) => param.trim().startsWith("q="));
      const weight = q ? Number(q.trim().slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), weight: Number.isNaN(weight) ? 0 : weight, index };
    })
    .filter((candidate) => candidate.tag && candidate.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.index - b.index);
  for (const { tag } of candidates) {
    const primary = tag.split("-")[0];
    if (isLocale(primary)) return primary;
  }
  return null;
}
