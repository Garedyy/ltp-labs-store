import { useTranslation } from "react-i18next";
import { Form } from "react-router";

import { Button } from "~/components/ui/button";

// The only search landmark of the app; the header icon is a plain link to this page.
export function SearchForm({ q, hint }: { q: string; hint?: string }) {
  const { t } = useTranslation();
  return (
    <Form
      method="get"
      role="search"
      noValidate
      className="flex max-w-xl flex-col gap-2"
      aria-describedby={hint ? "search-hint" : undefined}
    >
      <label htmlFor="search-q" className="font-medium">
        {t("catalogue.search.label")}
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id="search-q"
          type="search"
          name="q"
          defaultValue={q}
          autoComplete="off"
          maxLength={100}
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-border-strong bg-surface px-3 text-fg"
        />
        <Button type="submit" variant="secondary">
          {t("catalogue.search.button")}
        </Button>
      </div>
      {hint && (
        <p id="search-hint" className="text-body-sm text-fg-muted">
          {hint}
        </p>
      )}
    </Form>
  );
}
