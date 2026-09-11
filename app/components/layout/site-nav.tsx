import { useTranslation } from "react-i18next";
import { href, Link, NavLink } from "react-router";

import { cx } from "~/lib/cx";
import { useLocale } from "~/i18n/use-locale";

const PAGES = ["about", "contact", "blog"] as const;

const ITEM =
  "flex min-h-11 items-center rounded-lg px-2.5 py-2 text-tagline font-medium text-primary no-underline hover:bg-surface-muted aria-[current=page]:bg-surface-muted aria-[current=page]:underline forced-colors:aria-[current=page]:underline";

// Home and Shop point to the same URL; only Home carries aria-current.
export function SiteNav({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const lang = useLocale();
  const home = href("/:lang", { lang });

  return (
    <ul className={cx("flex gap-1", className)}>
      <li>
        <NavLink end to={home} className={ITEM} prefetch="intent" onClick={onNavigate}>
          {t("common.nav.home")}
        </NavLink>
      </li>
      <li>
        <Link to={home} className={ITEM} prefetch="intent" onClick={onNavigate}>
          {t("common.nav.shop")}
        </Link>
      </li>
      {PAGES.map((page) => (
        <li key={page}>
          <NavLink
            to={href(`/:lang/${page}`, { lang })}
            className={ITEM}
            prefetch="intent"
            onClick={onNavigate}
          >
            {t(`common.nav.${page}`)}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
