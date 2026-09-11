export const LOCALES = {
  en: {
    htmlLang: "en",
    intlLocale: "en-US",
    dir: "ltr",
    nativeName: "English",
    plurals: ["one", "other"],
  },
  pt: {
    htmlLang: "pt-PT",
    intlLocale: "pt-PT",
    dir: "ltr",
    nativeName: "Português",
    plurals: ["one", "many", "other"],
  },
} as const;

export type Locale = keyof typeof LOCALES;

export const DEFAULT_LOCALE: Locale = "en";

export const localeCodes = Object.keys(LOCALES) as Locale[];

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && Object.hasOwn(LOCALES, value);
}

// "pt-PT" -> "pt"; anything unknown falls back to the default locale.
export function localeFromHtmlLang(lang: string): Locale {
  const primary = lang.toLowerCase().split("-")[0];
  return isLocale(primary) ? primary : DEFAULT_LOCALE;
}
