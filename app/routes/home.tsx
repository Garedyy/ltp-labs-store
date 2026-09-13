import { useTranslation } from "react-i18next";
import { href, redirect } from "react-router";

import { ProductGrid } from "~/components/catalogue/product-grid";
import { ButtonLink } from "~/components/ui/button";
import { isLocale } from "~/i18n/config";
import { useLocale } from "~/i18n/use-locale";
import { toCardView } from "~/lib/catalogue/view.server";
import { notFound, toRouteError } from "~/lib/http";
import { pageMeta } from "~/lib/meta";
import { getInstance, getLocale } from "~/middleware/i18next";
import { getProducts } from "~/services/dummyjson/products.server";
import type { Route } from "./+types/home";

const TRENDING_COUNT = 8;
const TRENDING_HEADING = "trending-heading";
// Catalogue URLs from before the Home / Shop split keep working through a permanent redirect.
const CATALOGUE_PARAMS = ["q", "category", "sort", "page"];

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
  if (CATALOGUE_PARAMS.some((param) => url.searchParams.has(param))) {
    throw redirect(href("/:lang/shop", { lang: locale }) + url.search, 301);
  }
  const t = getInstance(context).t;
  const list = await getProducts({
    limit: TRENDING_COUNT,
    skip: 0,
    sortBy: "rating",
    order: "desc",
  });
  return {
    products: list.products.map((product) => toCardView(product, locale)),
    title: t("pages.home.title"),
    description: t("pages.home.description"),
  };
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  return pageMeta({
    title: loaderData.title,
    description: loaderData.description,
    brand: matches[0].loaderData.brand,
  });
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const lang = useLocale();

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4 motion-safe:animate-hero-enter">
        <div className="flex flex-col gap-1">
          <h1 id={TRENDING_HEADING} className="text-h4 font-medium">
            {loaderData.title}
          </h1>
          <p className="text-body-sm text-fg-muted">{t("pages.home.intro")}</p>
        </div>
        <ButtonLink to={href("/:lang/shop", { lang })} prefetch="intent">
          {t("pages.home.browse")}
        </ButtonLink>
      </div>
      <ProductGrid products={loaderData.products} labelledBy={TRENDING_HEADING} stagger />
      <div className="flex justify-center">
        <ButtonLink to={href("/:lang/shop", { lang })} prefetch="intent">
          {t("pages.home.seeMore")}
        </ButtonLink>
      </div>
    </div>
  );
}
