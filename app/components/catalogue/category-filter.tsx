import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router";

import { Checkbox } from "~/components/ui/checkbox";
import { buildSearch } from "~/lib/catalogue/query";
import type { CatalogueView } from "~/lib/catalogue/types";
import { isCategorySlug } from "~/services/dummyjson/types";

// Single selection rendered as checkboxes (wireframe). With JS a change navigates and focus stays
// on the checkbox; the Apply button submits the GET form without JS (with JS it only shows on
// focus, so every user still has an explicit submit).
export function CategoryFilter({ view }: { view: CatalogueView }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fieldset = useRef<HTMLFieldSetElement>(null);
  const focusFieldsetAfterClear = useRef(false);
  const active = view.query.category;
  // Optimistic selection while the navigation is pending; discarded once the loader answers.
  const [choice, setChoice] = useState<{ base: string | undefined; value: string | undefined }>();
  const selected = choice && choice.base === active ? choice.value : active;

  useEffect(() => {
    if (focusFieldsetAfterClear.current && active === undefined) {
      focusFieldsetAfterClear.current = false;
      fieldset.current?.focus();
    }
  }, [active]);

  function onChange(slug: string, checked: boolean) {
    setChoice({ base: active, value: checked ? slug : undefined });
    void navigate(buildSearch(searchParams, { category: checked ? slug : undefined }) || "?", {
      preventScrollReset: true,
    });
  }

  return (
    <aside
      id="categories"
      tabIndex={-1}
      aria-labelledby="filters-heading"
      className="lg:col-start-2 lg:row-start-1 lg:self-start"
    >
      <form method="get" noValidate className="rounded-2xl border border-border p-4">
        {view.query.q && <input type="hidden" name="q" value={view.query.q} />}
        <fieldset ref={fieldset} tabIndex={-1} aria-describedby="filters-hint">
          <legend className="contents">
            <h2 id="filters-heading" className="text-h5 font-medium">
              {t("catalogue.filters.heading")}
            </h2>
          </legend>
          <p id="filters-hint" className="mt-1 text-body-sm text-fg-muted">
            {t("catalogue.filters.hint")}
          </p>
          <ul className="mt-2 divide-y divide-border">
            {view.categories.map((category) => (
              <li key={category.slug}>
                <Checkbox
                  name="category"
                  value={category.slug}
                  checked={category.slug === selected}
                  onChange={(event) => onChange(category.slug, event.currentTarget.checked)}
                  label={
                    isCategorySlug(category.slug)
                      ? t(`catalogue.categories.${category.slug}`)
                      : category.name
                  }
                />
              </li>
            ))}
          </ul>
        </fieldset>
        {/* After the checkboxes so a native submit keeps the q, category, sort order. */}
        {view.query.sort && <input type="hidden" name="sort" value={view.query.sort} />}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            className="inline-flex min-h-11 items-center rounded-xl border border-border-strong px-4 text-tagline font-medium text-primary [.js_&]:sr-only [.js_&]:focus:not-sr-only"
          >
            {t("catalogue.filters.apply")}
          </button>
          {active && (
            <Link
              to={buildSearch(searchParams, { category: undefined }) || "?"}
              onClick={() => {
                focusFieldsetAfterClear.current = true;
              }}
              className="inline-flex min-h-11 items-center text-tagline font-medium"
            >
              {t("catalogue.filters.clear")}
            </Link>
          )}
        </div>
      </form>
    </aside>
  );
}
