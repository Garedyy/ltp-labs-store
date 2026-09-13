import { redirect } from "react-router";

import { CatalogueResults } from "~/components/catalogue/catalogue-results";
import { CategoryFilter } from "~/components/catalogue/category-filter";
import { isLocale } from "~/i18n/config";
import { getLocale, getInstance } from "~/middleware/i18next";
import { parseCatalogueQuery } from "~/lib/catalogue/query";
import { buildCatalogueView, listParamsFor } from "~/lib/catalogue/view.server";
import { notFound, toRouteError } from "~/lib/http";
import { pageMeta } from "~/lib/meta";
import {
  getCategories,
  getProducts,
  getProductsByCategory,
} from "~/services/dummyjson/products.server";
import { isCategorySlug } from "~/services/dummyjson/types";
import type { Route } from "./+types/catalogue";

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
  const categories = await getCategories();
  const query = parseCatalogueQuery(
    url.searchParams,
    categories.map((category) => category.slug),
  );
  if (query.canonical !== undefined) throw redirect(url.pathname + query.canonical);

  const params = listParamsFor(query);
  const list = query.category
    ? await getProductsByCategory(query.category, params)
    : await getProducts(params);
  if (list.total > 0 && query.page > Math.ceil(list.total / 9)) notFound();

  const category = categories.find((candidate) => candidate.slug === query.category);
  const categoryName =
    category && isCategorySlug(category.slug)
      ? t(`catalogue.categories.${category.slug}`)
      : category?.name;
  const baseTitle = categoryName ?? t("catalogue.title");
  const title =
    query.page > 1 ? t("catalogue.pageTitle", { title: baseTitle, page: query.page }) : baseTitle;

  return {
    view: buildCatalogueView({ list, query, categories, locale, title }),
    description: t("catalogue.description"),
  };
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  return pageMeta({
    title: loaderData.view.title,
    description: loaderData.description,
    brand: matches[0].loaderData.brand,
  });
}

export default function Catalogue({ loaderData }: Route.ComponentProps) {
  return (
    <CatalogueResults view={loaderData.view} filters={<CategoryFilter view={loaderData.view} />} />
  );
}
