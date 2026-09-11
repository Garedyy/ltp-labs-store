import type { CatalogueQuery } from "./query";

export type ProductCardView = {
  id: number;
  title: string;
  thumbnail: string;
  priceFormatted: string;
  inStock: boolean;
  href: string;
};

export type CatalogueView = {
  products: ProductCardView[];
  total: number;
  page: number;
  pageCount: number;
  showing: { from: number; to: number };
  query: CatalogueQuery;
  categories: { slug: string; name: string }[];
  title: string;
};
