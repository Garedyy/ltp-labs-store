import { createInstance, type i18n } from "i18next";
import { initReactI18next } from "react-i18next";

import { DEFAULT_LOCALE, type Locale, localeCodes } from "~/i18n/config";
import resources from "~/locales";

// A test instance that throws on a missing key, so typos surface as failures.
export function createTestI18n(lng: Locale = DEFAULT_LOCALE): i18n {
  const instance = createInstance();
  instance.use(initReactI18next);
  void instance.init({
    resources,
    lng,
    fallbackLng: false,
    supportedLngs: localeCodes,
    interpolation: { escapeValue: false },
    returnNull: false,
    parseMissingKeyHandler(key) {
      throw new Error(`Missing translation key: ${key}`);
    },
  });
  return instance;
}
