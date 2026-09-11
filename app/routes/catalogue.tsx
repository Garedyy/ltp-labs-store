import { useTranslation } from "react-i18next";

import { pageMeta } from "~/lib/meta";
import { getInstance } from "~/middleware/i18next";
import type { Route } from "./+types/catalogue";

export function loader({ context }: Route.LoaderArgs) {
  const t = getInstance(context).t;
  return { title: t("catalogue.title"), description: t("catalogue.description") };
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  return pageMeta({ ...loaderData, brand: matches[0].loaderData.brand });
}

// Placeholder until feature/catalogue renders the product grid.
export default function Catalogue({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  return (
    <>
      <h1 className="text-h4 font-medium">{loaderData.title}</h1>
      <p className="mt-2 text-fg-muted">{t("catalogue.description")}</p>
    </>
  );
}
