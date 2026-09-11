import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { href, useNavigation } from "react-router";

import { useAnnounce } from "~/components/layout/announcer";
import { ButtonLink } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { VisuallyHidden } from "~/components/ui/visually-hidden";
import { useLocale } from "~/i18n/use-locale";
import type { CatalogueQuery } from "~/lib/catalogue/query";
import type { CatalogueView } from "~/lib/catalogue/types";
import { EmptyState } from "./empty-state";
import { Pagination } from "./pagination";
import { ProductGrid } from "./product-grid";
import { ResultsSummary } from "./results-summary";
import { SortForm } from "./sort-form";

type CatalogueResultsProps = {
  view: CatalogueView;
  // Search pages pass their own heading and empty state; the catalogue uses the view title.
  heading?: React.ReactNode;
  emptyTitle?: React.ReactNode;
  showJumpLink?: boolean;
  toolbarStart?: React.ReactNode;
};

function onlyPageChanged(previous: CatalogueQuery, current: CatalogueQuery): boolean {
  return (
    previous.page !== current.page &&
    previous.sort === current.sort &&
    previous.category === current.category &&
    previous.q === current.q
  );
}

// Search-param changes keep the pathname, so this component owns their announcements and focus.
function useResultsAnnouncements(view: CatalogueView) {
  const { t } = useTranslation();
  const announce = useAnnounce();
  const navigation = useNavigation();
  const previous = useRef(view);

  useEffect(() => {
    if (navigation.state !== "idle" || previous.current === view) return;
    const before = previous.current;
    previous.current = view;
    announce(
      t("catalogue.results.announce", {
        count: view.total,
        from: view.showing.from,
        to: view.showing.to,
        total: view.total,
      }),
    );
    if (onlyPageChanged(before.query, view.query)) {
      document.getElementById("results-heading")?.focus({ preventScroll: false });
    }
  }, [view, navigation.state, announce, t]);
}

export function CatalogueResults({
  view,
  heading,
  emptyTitle,
  showJumpLink,
  toolbarStart,
}: CatalogueResultsProps) {
  const { t } = useTranslation();
  const lang = useLocale();
  useResultsAnnouncements(view);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <h1 className="text-h4 font-medium">{heading ?? view.title}</h1>
      {toolbarStart}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SortForm query={view.query} />
        <ResultsSummary from={view.showing.from} to={view.showing.to} total={view.total} />
        {showJumpLink && (
          <a
            href="#categories"
            className="inline-flex min-h-11 items-center gap-1 text-tagline font-medium lg:sr-only lg:focus:not-sr-only"
          >
            {t("catalogue.filters.jump")}
            <Icon name="arrowDown" className="size-4" />
            <VisuallyHidden>{t("catalogue.filters.jumpLabel")}</VisuallyHidden>
          </a>
        )}
      </div>
      {view.products.length > 0 ? (
        <ProductGrid products={view.products} />
      ) : (
        <EmptyState
          title={emptyTitle ?? t("catalogue.empty.title")}
          action={
            <ButtonLink to={href("/:lang", { lang })}>{t("catalogue.empty.action")}</ButtonLink>
          }
        />
      )}
      <Pagination page={view.page} pageCount={view.pageCount} />
    </div>
  );
}
