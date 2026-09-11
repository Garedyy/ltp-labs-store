import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";

import { Icon } from "~/components/ui/icon";
import { VisuallyHidden } from "~/components/ui/visually-hidden";
import { buildSearch } from "~/lib/catalogue/query";
import { pageWindow } from "~/lib/catalogue/pagination";
import { cx } from "~/lib/cx";

const ITEM =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-tagline font-medium text-primary no-underline hover:bg-surface-muted";

type PaginationProps = { page: number; pageCount: number };

// Prev/next are omitted when not applicable: focus always moves to #results-heading, so a
// vanishing control never holds focus.
export function Pagination({ page, pageCount }: PaginationProps) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  if (pageCount <= 1) return null;
  const to = (target: number) => buildSearch(searchParams, { page: target }) || "?";

  return (
    <nav aria-label={t("catalogue.pagination.label")}>
      <ul className="flex flex-wrap justify-center gap-1 sm:justify-end">
        {page > 1 && (
          <li>
            <Link to={to(page - 1)} rel="prev" className={ITEM} prefetch="intent">
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
              className={cx(
                ITEM,
                number === page &&
                  "bg-primary text-primary-fg hover:bg-primary-hover forced-colors:underline",
              )}
              prefetch="intent"
            >
              {number}
            </Link>
          </li>
        ))}
        {page < pageCount && (
          <li>
            <Link to={to(page + 1)} rel="next" className={ITEM} prefetch="intent">
              <Icon name="chevronRight" />
              <VisuallyHidden>{t("catalogue.pagination.next")}</VisuallyHidden>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
