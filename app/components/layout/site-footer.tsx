import { useTranslation } from "react-i18next";
import { href, Link, useLocation } from "react-router";

import { LOCALES, localeCodes } from "~/i18n/config";
import { switchLocale } from "~/i18n/paths";
import { useLocale } from "~/i18n/use-locale";

const LINK = "text-fg-inverse no-underline hover:underline";

export function SiteFooter() {
  const { t } = useTranslation();
  const lang = useLocale();
  const { pathname, search } = useLocation();
  const home = href("/:lang", { lang });
  const links = [
    ["home", home],
    ["shop", home],
    ["about", href("/:lang/about", { lang })],
    ["contact", href("/:lang/contact", { lang })],
    ["blog", href("/:lang/blog", { lang })],
  ] as const;

  return (
    <footer className="mt-16 rounded-t-3xl bg-surface-inverse px-4 py-8 text-fg-inverse lg:px-6 lg:py-12">
      <div className="mx-auto flex max-w-[87rem] flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            to={home}
            className="text-h5 font-semibold tracking-tight text-fg-inverse uppercase no-underline hover:underline"
          >
            {t("common.brand")}
          </Link>
          <p className="mt-2 text-body-sm">{t("common.tagline")}</p>
        </div>
        <nav aria-label={t("common.nav.footerLabel")}>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map(([key, to]) => (
              <li key={key}>
                <Link to={to} className={LINK}>
                  {t(`common.nav.${key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <ul className="flex gap-4" aria-label={t("common.language.label")}>
          {localeCodes.map((code) => (
            <li key={code}>
              <a
                href={switchLocale(pathname + search, code)}
                hrefLang={LOCALES[code].htmlLang}
                lang={LOCALES[code].htmlLang}
                aria-current={code === lang ? "true" : undefined}
                className={`${LINK} aria-[current=true]:underline`}
              >
                {LOCALES[code].nativeName}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
