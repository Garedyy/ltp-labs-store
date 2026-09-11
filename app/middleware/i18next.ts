import { initReactI18next } from "react-i18next";
import { createI18nextMiddleware } from "remix-i18next";

import { DEFAULT_LOCALE, localeCodes } from "~/i18n/config";
import resources from "~/locales";

// The URL prefix is the only source of truth here; "/" and unknown prefixes use detectLocale().
export const [i18nextMiddleware, getLocale, getInstance] = createI18nextMiddleware({
  detection: {
    supportedLanguages: localeCodes,
    fallbackLanguage: DEFAULT_LOCALE,
    order: ["custom"],
    async findLocale({ url }) {
      return url.pathname.split("/").at(1)?.toLowerCase() ?? null;
    },
  },
  i18next: {
    resources,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: localeCodes,
    interpolation: { escapeValue: false },
    returnNull: false,
  },
  plugins: [initReactI18next],
});
