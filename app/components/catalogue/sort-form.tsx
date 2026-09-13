import { useTranslation } from "react-i18next";
import { Form, useLocation, useNavigate, useNavigation, useSearchParams } from "react-router";

import { Button } from "~/components/ui/button";
import { Select } from "~/components/ui/select";
import { buildSearch, type CatalogueQuery } from "~/lib/catalogue/query";
import { isSortKey, SORT_KEYS, type SortKey } from "~/lib/catalogue/sort-options";

function sortFrom(search: string): SortKey | undefined {
  const value = new URLSearchParams(search).get("sort");
  return isSortKey(value) ? value : undefined;
}

// A GET form whose select navigates on change (D-11): the hint announces it beforehand
// (SC 3.2.2) and the Apply button submits without JS (with JS it only shows on focus).
export function SortForm({ query }: { query: CatalogueQuery }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  // Optimistic selection read from the pending navigation itself, so nothing outlives it.
  const pending = navigation.location?.pathname === pathname ? navigation.location : undefined;
  const selected = pending ? sortFrom(pending.search) : query.sort;
  const options = [
    { value: "", label: t("catalogue.sort.defaultOrder") },
    ...SORT_KEYS.map((key) => ({ value: key, label: t(`catalogue.sort.options.${key}`) })),
  ];

  function onChange(value: string) {
    const sort = isSortKey(value) ? value : undefined;
    void navigate(buildSearch(searchParams, { sort }) || "?", { preventScrollReset: true });
  }

  return (
    <Form method="get" noValidate className="flex max-w-full min-w-0 flex-wrap items-center gap-2">
      {query.q && <input type="hidden" name="q" value={query.q} />}
      {query.category && <input type="hidden" name="category" value={query.category} />}
      <Select
        id="sort"
        name="sort"
        label={t("catalogue.sort.label")}
        options={options}
        value={selected ?? ""}
        onChange={(event) => onChange(event.currentTarget.value)}
        aria-describedby="sort-hint"
      />
      <Button
        type="submit"
        variant="secondary"
        size="sm"
        className="[.js_&]:sr-only [.js_&]:focus:not-sr-only [.js_&]:focus:px-3"
      >
        {t("catalogue.sort.apply")}
      </Button>
      <p id="sort-hint" className="basis-full text-body-sm text-fg-muted">
        {t("catalogue.sort.hint")}
      </p>
    </Form>
  );
}
