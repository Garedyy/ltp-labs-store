import { useTranslation } from "react-i18next";

import { CatalogueResults } from "~/components/catalogue/catalogue-results";
import { SearchForm } from "~/components/catalogue/search-form";
import { isLocale } from "~/i18n/config";
import { parseCatalogueQuery } from "~/lib/catalogue/query";
import type { CatalogueView } from "~/lib/catalogue/types";
import { buildCatalogueView, listParamsFor } from "~/lib/catalogue/view.server";
import { notFound, toRouteError } from "~/lib/http";
import { pageMeta } from "~/lib/meta";
import { getInstance, getLocale } from "~/middleware/i18next";
import { searchProducts } from "~/services/dummyjson/products.server";
import type { Route } from "./+types/search";

export const handle = { initialFocus: "#search-q" };

const SEARCH_ANNOUNCE = "catalogue.search.announce" as const;

export async function loader(args: Route.LoaderArgs) {
  try {
    return await load(args);
  } catch (error) {
    throw toRouteError(error);
  }
}

async function load({ context, url }: Route.LoaderArgs) {
  const locale = getLocale(context);
  if (!isLocale(locale)) notFound();
  const t = getInstance(context).t;
  const query = parseCatalogueQuery(url.searchParams, []);
  if (query.canonical !== undefined)
    throw new Response(null, {
      status: 302,
      headers: { Location: url.pathname + query.canonical },
    });

  const base = t("catalogue.search.title");
  if (!query.q) {
    return {
      q: "",
      view: null as CatalogueView | null,
      title: base,
      description: t("catalogue.search.description"),
    };
  }

  const list = await searchProducts(query.q, listParamsFor(query));
  if (list.total > 0 && query.page > Math.ceil(list.total / 9)) notFound();
  const resultsTitle = t("catalogue.search.resultsTitle", { q: query.q, count: list.total });
  const title =
    query.page > 1
      ? t("catalogue.pageTitle", { title: resultsTitle, page: query.page })
      : resultsTitle;
  return {
    q: query.q,
    view: buildCatalogueView({ list, query, categories: [], locale, title }),
    title,
    description: t("catalogue.search.description"),
  };
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  return pageMeta({
    title: loaderData.title,
    description: loaderData.description,
    brand: matches[0].loaderData.brand,
  });
}

export default function Search({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { q, view } = loaderData;
  const prompt = t("catalogue.search.prompt");

  return (
    <CatalogueResults
      view={view}
      heading={t("catalogue.search.title")}
      emptyTitle={t("catalogue.search.noResults", { q })}
      emptyBody={t("catalogue.search.hint")}
      announce={{ key: SEARCH_ANNOUNCE, values: { q } }}
      emptyAnnouncement={prompt}
      toolbarStart={<SearchForm q={q} hint={view ? undefined : prompt} />}
    />
  );
}
