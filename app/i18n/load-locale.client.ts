import type { i18n } from "i18next";

import type { Locale } from "./config";

// One chunk per locale: the client only downloads the language it renders.
const loaders = {
  en: () => import("~/locales/en"),
  pt: () => import("~/locales/pt"),
} satisfies Record<Locale, () => Promise<{ default: unknown }>>;

export async function ensureLocaleResources(instance: i18n, locale: Locale): Promise<void> {
  if (instance.hasResourceBundle(locale, "translation")) return;
  const { default: translation } = await loaders[locale]();
  instance.addResourceBundle(locale, "translation", translation, true, true);
}
