import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { href, useNavigation } from "react-router";

import { useAnnounce } from "~/components/layout/announcer";
import { ButtonLink } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { useLocale } from "~/i18n/use-locale";
import type { CatalogueQuery } from "~/lib/catalogue/query";
import { cx } from "~/lib/cx";
import type { CatalogueView } from "~/lib/catalogue/types";
import { EmptyState } from "./empty-state";
import { Pagination } from "./pagination";
import { ProductGrid } from "./product-grid";
import { ResultsSummary } from "./results-summary";
import { SortForm } from "./sort-form";

type CatalogueResultsProps = {
  // Null is the search prompt: heading and toolbar only, and the component stays mounted so the
  // first search and the way back are announced like any other search-param change.
  view: CatalogueView | null;
  // Search pages pass their own heading and empty state; the catalogue uses the view title.
  heading?: React.ReactNode;
  emptyTitle?: React.ReactNode;
  emptyBody?: React.ReactNode;
  // Announcement key with plural suffixes; the catalogue default is catalogue.results.announce.
  announce?: { key: "catalogue.search.announce"; values: Record<string, string> };
  emptyAnnouncement?: string;
  // The category filter. Last in the DOM (desktop tab order: products, pagination, categories) but
  // placed under the toolbar below lg, where a button unfolds it; without JS it is simply shown.
  filters?: React.ReactNode;
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
function useResultsAnnouncements(
  view: CatalogueView | null,
  custom?: CatalogueResultsProps["announce"],
  emptyAnnouncement?: string,
) {
  const { t } = useTranslation();
  const announce = useAnnounce();
  const navigation = useNavigation();
  const previous = useRef(view);

  useEffect(() => {
    if (navigation.state !== "idle" || previous.current === view) return;
    const before = previous.current;
    previous.current = view;
    if (!view) {
      if (emptyAnnouncement) announce(emptyAnnouncement);
      return;
    }
    announce(
      custom
        ? t(custom.key, { count: view.total, ...custom.values })
        : t("catalogue.results.announce", {
            count: view.total,
            from: view.showing.from,
            to: view.showing.to,
            total: view.total,
          }),
    );
    if (before && onlyPageChanged(before.query, view.query)) {
      document.getElementById("results-heading")?.focus({ preventScroll: false });
    }
  }, [view, navigation.state, announce, t, custom, emptyAnnouncement]);
}

// Below lg the filters fold under the toolbar. Opening moves the focus into the panel because it
// sits after the products in the DOM (no scroll: the panel unfolds right under the button, which
// stays in view to fold it back); Escape closes it and gives the focus back to the button.
function useFiltersDisclosure() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const focusPanelOnOpen = useRef(false);

  useEffect(() => {
    if (!open) return;
    if (focusPanelOnOpen.current) {
      focusPanelOnOpen.current = false;
      document.getElementById("categories")?.focus({ preventScroll: true });
    }
    const element = panel.current;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setOpen(false);
      toggle.current?.focus();
    }
    element?.addEventListener("keydown", onKeyDown);
    return () => element?.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function onToggle() {
    focusPanelOnOpen.current = !open;
    setOpen(!open);
  }

  return { open, toggle, panel, onToggle };
}

export function CatalogueResults({
  view,
  heading,
  emptyTitle,
  emptyBody,
  announce,
  emptyAnnouncement,
  filters,
  toolbarStart,
}: CatalogueResultsProps) {
  const { t } = useTranslation();
  const lang = useLocale();
  const {
    open: filtersOpen,
    toggle: filtersToggle,
    panel: filtersPanel,
    onToggle: toggleFilters,
  } = useFiltersDisclosure();
  const hasFilters = filters !== undefined;
  useResultsAnnouncements(view, announce, emptyAnnouncement);

  if (!view) {
    return (
      <div className="flex min-w-0 flex-col gap-6">
        <h1 className="text-h4 font-medium">{heading}</h1>
        {toolbarStart}
      </div>
    );
  }

  return (
    <div
      className={cx(
        "grid gap-6",
        hasFilters && "lg:grid-cols-[minmax(0,1fr)_16rem] lg:grid-rows-[auto_1fr] lg:gap-x-8",
      )}
    >
      <div className="flex min-w-0 flex-col gap-6">
        <h1 className="text-h4 font-medium">{heading ?? view.title}</h1>
        {toolbarStart}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SortForm query={view.query} />
          <ResultsSummary from={view.showing.from} to={view.showing.to} total={view.total} />
          {hasFilters && (
            <>
              <button
                ref={filtersToggle}
                type="button"
                aria-expanded={filtersOpen}
                aria-controls="filters-panel"
                onClick={toggleFilters}
                className="hidden min-h-11 items-center gap-1 text-tagline font-medium max-lg:[.js_&]:inline-flex"
              >
                {t("catalogue.filters.toggle")}
                <Icon
                  name="chevronDown"
                  className={cx(
                    "size-4 motion-safe:transition-transform",
                    filtersOpen && "rotate-180",
                  )}
                />
              </button>
              <a
                href="#categories"
                className="sr-only min-h-11 items-center text-tagline font-medium focus:not-sr-only focus:inline-flex max-lg:[.js_&]:hidden"
              >
                {t("catalogue.filters.jump")}
              </a>
            </>
          )}
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-6 max-lg:order-last">
        {view.products.length > 0 ? (
          <ProductGrid products={view.products} />
        ) : (
          <EmptyState
            title={emptyTitle ?? t("catalogue.empty.title")}
            body={emptyBody}
            action={
              <ButtonLink to={href("/:lang/shop", { lang })}>
                {t("catalogue.empty.action")}
              </ButtonLink>
            }
          />
        )}
        <Pagination page={view.page} pageCount={view.pageCount} />
      </div>
      {hasFilters && (
        <div
          id="filters-panel"
          ref={filtersPanel}
          className={cx(
            "max-lg:motion-safe:animate-fade-in lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start",
            !filtersOpen && "max-lg:[.js_&]:hidden",
          )}
        >
          {filters}
        </div>
      )}
    </div>
  );
}
