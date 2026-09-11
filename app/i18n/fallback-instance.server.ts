import { createInstance, type i18n } from "i18next";
import { initReactI18next } from "react-i18next";

import { DEFAULT_LOCALE, localeCodes } from "~/i18n/config";
import resources from "~/locales";

// Used when a request fails before the i18next middleware ran (root error boundary renders in EN).
export const fallbackInstance: i18n = createInstance();
void fallbackInstance.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: localeCodes,
  interpolation: { escapeValue: false },
  returnNull: false,
});
