import { useTranslation } from "react-i18next";

type ResultsSummaryProps = { from: number; to: number; total: number };

// Focus target after a page change; also labels the product list.
export function ResultsSummary({ from, to, total }: ResultsSummaryProps) {
  const { t } = useTranslation();
  return (
    <p id="results-heading" tabIndex={-1} className="text-body-sm text-fg-muted">
      {total > 0
        ? t("catalogue.results.showing", { from, to, total })
        : t("catalogue.results.none")}
    </p>
  );
}
