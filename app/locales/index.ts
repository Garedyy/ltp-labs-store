import type { Locale } from "~/i18n/config";
import en from "./en";
import pt from "./pt";

// One namespace ("translation") per locale, assembled from the domain files.
const resources = {
  en: { translation: en },
  pt: { translation: pt },
} as const satisfies Record<Locale, { translation: typeof en }>;

export default resources;
