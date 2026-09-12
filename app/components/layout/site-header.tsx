import { useTranslation } from "react-i18next";
import { href, Link, useRouteLoaderData } from "react-router";

import { Disclosure } from "~/components/ui/disclosure";
import { Icon } from "~/components/ui/icon";
import { useLocale } from "~/i18n/use-locale";
import type { loader as cartLoader } from "~/routes/cart";
import { AccountLink, CartLink, SearchLink } from "./header-actions";
import { LanguageSwitcher } from "./language-switcher";
import { NavigationStatus } from "./navigation-status";
import { SiteNav } from "./site-nav";

// Floating card, sticky except on short viewports (zoomed pages keep their content reachable).
export function SiteHeader({ cartCount }: { cartCount: number }) {
  const { t } = useTranslation();
  const lang = useLocale();
  // The layout counts the raw cookie; the cart page counts the reconciled cart, which wins.
  const cart = useRouteLoaderData<typeof cartLoader>("routes/cart");
  const count = cart?.view.cartCount ?? cartCount;

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 lg:px-6 lg:pt-6 [@media(max-height:30rem)]:static">
      <div className="relative mx-auto flex min-h-header max-w-[87rem] items-center justify-between gap-3 rounded-2xl bg-surface ps-4 pe-3 shadow-header sm:ps-6 lg:grid lg:min-h-header-lg lg:grid-cols-[1fr_auto_1fr]">
        <Link
          to={href("/:lang", { lang })}
          className="inline-flex min-h-11 min-w-0 items-center text-body font-semibold tracking-tight text-primary uppercase no-underline sm:text-h5"
          prefetch="intent"
        >
          {t("common.brand")}
        </Link>

        <nav aria-label={t("common.nav.label")} className="hidden lg:block">
          <SiteNav />
        </nav>

        <div className="flex items-center gap-2 lg:justify-self-end">
          <SearchLink className="hidden sm:inline-flex" />
          <AccountLink className="hidden sm:inline-flex" />
          <CartLink count={count} />
          <div className="hidden lg:block">
            <LanguageSwitcher />
          </div>
          <Disclosure
            className="lg:hidden"
            summaryLabel={t("common.nav.openMenu")}
            summaryClassName="inline-flex size-11 items-center justify-center rounded-xl border border-border-strong text-primary hover:bg-surface-muted forced-colors:border"
            summary={
              <>
                <Icon name="menu" className="size-5 group-open:hidden" />
                <Icon name="close" className="hidden size-5 group-open:block" />
              </>
            }
          >
            <div className="absolute inset-x-0 top-full z-40 mt-2 rounded-2xl border border-border bg-surface p-4 shadow-header">
              <nav aria-label={t("common.nav.label")}>
                <SiteNav className="flex-col gap-0" />
              </nav>
              <ul className="mt-2 flex gap-2 border-t border-border pt-4 sm:hidden">
                <li>
                  <SearchLink />
                </li>
                <li>
                  <AccountLink />
                </li>
              </ul>
              <div className="mt-4 border-t border-border pt-4">
                <LanguageSwitcher />
              </div>
            </div>
          </Disclosure>
        </div>
      </div>
      <NavigationStatus />
    </header>
  );
}
