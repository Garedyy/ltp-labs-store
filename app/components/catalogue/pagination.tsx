import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";

import { Icon } from "~/components/ui/icon";
import { VisuallyHidden } from "~/components/ui/visually-hidden";
import { buildSearch } from "~/lib/catalogue/query";
import { pageWindow } from "~/lib/catalogue/pagination";
import { cx } from "~/lib/cx";

const ITEM =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-tagline font-medium text-primary no-underline";
// The current page is not a navigation target, so only the other links get hover feedback.
const PAGE_LINK = cx(ITEM, "hover:bg-surface-muted");
const CURRENT_PAGE = cx(ITEM, "bg-primary text-primary-fg forced-colors:underline");

type PaginationProps = { page: number; pageCount: number };

// Page changes keep the scroll (`preventScrollReset`) and the focus on the clicked link: page
// links are keyed by number so a link that survives the window shift keeps its element, and
// `CatalogueResults` moves the focus to the current page when the clicked control vanished
// (previous/next are omitted when not applicable).
export function Pagination({ page, pageCount }: PaginationProps) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  if (pageCount <= 1) return null;
  const to = (target: number) => buildSearch(searchParams, { page: target }) || "?";

  return (
    <nav id="pagination" aria-label={t("catalogue.pagination.label")}>
      <ul className="flex flex-wrap justify-center gap-1 sm:justify-end">
        {page > 1 && (
          <li>
            <Link
              to={to(page - 1)}
              rel="prev"
              className={PAGE_LINK}
              prefetch="intent"
              preventScrollReset
            >
              <Icon name="chevronLeft" />
              <VisuallyHidden>{t("catalogue.pagination.previous")}</VisuallyHidden>
            </Link>
          </li>
        )}
        {pageWindow(page, pageCount).map((number) => (
          <li key={number}>
            <Link
              to={to(number)}
              aria-label={t("catalogue.pagination.page", { page: number })}
              aria-current={number === page ? "page" : undefined}
              className={number === page ? CURRENT_PAGE : PAGE_LINK}
              prefetch="intent"
              preventScrollReset
            >
              {number}
            </Link>
          </li>
        ))}
        {page < pageCount && (
          <li>
            <Link
              to={to(page + 1)}
              rel="next"
              className={PAGE_LINK}
              prefetch="intent"
              preventScrollReset
            >
              <Icon name="chevronRight" />
              <VisuallyHidden>{t("catalogue.pagination.next")}</VisuallyHidden>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
