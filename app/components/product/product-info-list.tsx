import { useTranslation } from "react-i18next";

import { DefinitionList } from "~/components/ui/definition-list";
import type { InfoItem } from "~/lib/product/view.server";

export function ProductInfoList({
  items,
  tags,
  lang,
}: {
  items: InfoItem[];
  tags: string[];
  lang?: string;
}) {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="info-heading" className="flex flex-col gap-4">
      <h2 id="info-heading" className="text-h5 font-medium">
        {t("product.info.heading")}
      </h2>
      <DefinitionList items={items} />
      {tags.length > 0 && (
        <div>
          <h3 className="text-body-sm font-medium">{t("product.info.tags")}</h3>
          <ul className="mt-1 flex flex-wrap gap-2" lang={lang}>
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-md bg-surface-muted px-2 py-1 text-body-sm forced-colors:border"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
