import type { TFunction } from "i18next";

import type { Locale } from "~/i18n/config";
import { formatDate, formatNumber, formatPercent, formatPrice } from "~/i18n/format.server";
import type { Product } from "~/services/dummyjson/types";

export type ReviewView = {
  key: string;
  reviewerName: string;
  rating: number;
  ratingFormatted: string;
  comment: string;
  date: string;
  dateFormatted: string;
};

export type InfoItem = { key: string; term: string; description: string; lang?: string };

export type ProductView = {
  id: number;
  title: string;
  description: string;
  priceFormatted: string;
  originalPriceFormatted?: string;
  discountFormatted?: string;
  rating: number;
  ratingFormatted: string;
  reviewCount: number;
  stock: number;
  inStock: boolean;
  images: string[];
  tags: string[];
  info: InfoItem[];
  reviews: ReviewView[];
};

export function toCents(price: number): number {
  return Math.round(price * 100);
}

// The original price is derived from the discount and shown only when at least one cent apart.
export function originalPriceCents(priceCents: number, discountPercentage: number): number | null {
  if (discountPercentage < 1) return null;
  const original = Math.round(priceCents / (1 - discountPercentage / 100));
  return original - priceCents >= 1 ? original : null;
}

export function buildProductView(product: Product, locale: Locale, t: TFunction): ProductView {
  const apiLang = locale === "en" ? undefined : "en";
  const priceCents = toCents(product.price);
  const original = originalPriceCents(priceCents, product.discountPercentage);
  const images = product.images.length > 0 ? product.images : [product.thumbnail].filter(Boolean);
  const fixed = (value: number) => formatNumber(value, locale, 2);

  const info: InfoItem[] = [];
  const push = (key: string, term: string, description: string, lang?: string) => {
    if (description) info.push({ key, term, description, lang });
  };
  push("brand", t("product.info.brand"), product.brand ?? "", apiLang);
  push("sku", t("product.info.sku"), product.sku);
  push("shipping", t("product.info.shipping"), product.shippingInformation, apiLang);
  push("warranty", t("product.info.warranty"), product.warrantyInformation, apiLang);
  push("returns", t("product.info.returns"), product.returnPolicy, apiLang);
  const { width, height, depth } = product.dimensions;
  if (width && height && depth) {
    push(
      "dimensions",
      t("product.info.dimensions"),
      t("product.info.dimensionsValue", {
        width: fixed(width),
        height: fixed(height),
        depth: fixed(depth),
      }),
    );
  }
  if (product.weight) {
    push(
      "weight",
      t("product.info.weight"),
      t("product.info.weightValue", { value: formatNumber(product.weight, locale, 2) }),
    );
  }

  return {
    id: product.id,
    title: product.title,
    description: product.description,
    priceFormatted: formatPrice(priceCents, locale),
    originalPriceFormatted: original === null ? undefined : formatPrice(original, locale),
    discountFormatted:
      original === null ? undefined : formatPercent(-product.discountPercentage / 100, locale),
    rating: product.rating,
    ratingFormatted: formatNumber(product.rating, locale),
    reviewCount: product.reviews.length,
    stock: product.stock,
    inStock: product.stock > 0,
    images,
    tags: product.tags,
    info,
    reviews: product.reviews.map((review, index) => ({
      key: `${index}-${review.date}`,
      reviewerName: review.reviewerName,
      rating: review.rating,
      ratingFormatted: formatNumber(review.rating, locale),
      comment: review.comment,
      date: review.date,
      dateFormatted: review.date ? formatDate(review.date, locale) : "",
    })),
  };
}
