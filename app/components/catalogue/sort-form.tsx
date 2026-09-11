import { useTranslation } from "react-i18next";
import { Form } from "react-router";

import { Button } from "~/components/ui/button";
import { Select } from "~/components/ui/select";
import { SORT_KEYS } from "~/lib/catalogue/sort-options";
import type { CatalogueQuery } from "~/lib/catalogue/query";

// A GET form with a visible Apply button: no change-of-context on selection (SC 3.2.2).
export function SortForm({ query }: { query: CatalogueQuery }) {
  const { t } = useTranslation();
  const options = [
    { value: "", label: t("catalogue.sort.defaultOrder") },
    ...SORT_KEYS.map((key) => ({ value: key, label: t(`catalogue.sort.options.${key}`) })),
  ];

  return (
    <Form method="get" noValidate className="flex flex-wrap items-center gap-2">
      {query.q && <input type="hidden" name="q" value={query.q} />}
      {query.category && <input type="hidden" name="category" value={query.category} />}
      <Select
        id="sort"
        name="sort"
        label={t("catalogue.sort.label")}
        options={options}
        defaultValue={query.sort ?? ""}
      />
      <Button type="submit" variant="secondary" size="sm">
        {t("catalogue.sort.apply")}
      </Button>
    </Form>
  );
}
