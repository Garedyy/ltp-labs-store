import { href } from "react-router";

import { formatPrice } from "~/i18n/format.server";
import type { Locale } from "~/i18n/config";
import type { Category, ProductList, ProductSummary } from "~/services/dummyjson/types";
import { pageCountFor, showing, skipFor } from "./pagination";
import type { CatalogueQuery } from "./query";
import { SORT_OPTIONS } from "./sort-options";
import type { CatalogueView, ProductCardView } from "./types";

export function listParamsFor(query: CatalogueQuery) {
  const sort = query.sort ? SORT_OPTIONS[query.sort] : undefined;
  return { limit: 9, skip: skipFor(query.page), sortBy: sort?.sortBy, order: sort?.order };
}

export function toCardView(product: ProductSummary, locale: Locale): ProductCardView {
  return {
    id: product.id,
    title: product.title,
    thumbnail: product.thumbnail,
    priceFormatted: formatPrice(Math.round(product.price * 100), locale),
    inStock: product.stock > 0,
    href: href("/:lang/products/:productId", { lang: locale, productId: String(product.id) }),
  };
}

type BuildInput = {
  list: ProductList<ProductSummary>;
  query: CatalogueQuery;
  categories: Category[];
  locale: Locale;
  title: string;
};

export function buildCatalogueView({
  list,
  query,
  categories,
  locale,
  title,
}: BuildInput): CatalogueView {
  const skip = skipFor(query.page);
  return {
    products: list.products.map((product) => toCardView(product, locale)),
    total: list.total,
    page: query.page,
    pageCount: pageCountFor(list.total),
    showing: showing(list.total, skip, list.products.length),
    query,
    categories: categories.map(({ slug, name }) => ({ slug, name })),
    title,
  };
}
