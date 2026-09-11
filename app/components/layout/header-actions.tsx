import { useTranslation } from "react-i18next";
import { href, Link } from "react-router";

import { Icon, type IconName } from "~/components/ui/icon";
import { cx } from "~/lib/cx";
import { useLocale } from "~/i18n/use-locale";

const ICON_LINK =
  "inline-flex size-11 items-center justify-center rounded-xl border border-border-strong text-primary no-underline hover:bg-surface-muted forced-colors:border";

function IconLink({
  to,
  icon,
  label,
  className,
}: {
  to: string;
  icon: IconName;
  label: string;
  className?: string;
}) {
  return (
    <Link to={to} aria-label={label} className={cx(ICON_LINK, className)} prefetch="intent">
      <Icon name={icon} />
    </Link>
  );
}

export function SearchLink({ className }: { className?: string }) {
  const { t } = useTranslation();
  const lang = useLocale();
  return (
    <IconLink
      to={href("/:lang/search", { lang })}
      icon="search"
      label={t("common.nav.search")}
      className={className}
    />
  );
}

export function AccountLink({ className }: { className?: string }) {
  const { t } = useTranslation();
  const lang = useLocale();
  return (
    <IconLink
      to={href("/:lang/account", { lang })}
      icon="user"
      label={t("common.nav.account")}
      className={className}
    />
  );
}

// Badge hidden at zero; "99+" above 99; the accessible name carries the count.
export function CartLink({ count }: { count: number }) {
  const { t } = useTranslation();
  const lang = useLocale();
  return (
    <Link
      to={href("/:lang/cart", { lang })}
      aria-label={t("common.cartLink", { count })}
      className={cx(ICON_LINK, "relative")}
      prefetch="intent"
    >
      <Icon name="bag" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -end-1 -top-1 min-w-5 rounded-full bg-accent px-1 text-center text-[0.6875rem] leading-5 font-medium text-accent-fg forced-colors:border"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
