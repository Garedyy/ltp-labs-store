import { useTranslation } from "react-i18next";
import { useRouteLoaderData } from "react-router";

import { isLocale, type Locale, localeFromHtmlLang } from "./config";

export function useLocale(): Locale {
  const rootData = useRouteLoaderData("root") as { locale?: unknown } | undefined;
  const { i18n } = useTranslation();
  return isLocale(rootData?.locale) ? rootData.locale : localeFromHtmlLang(i18n.language);
}
