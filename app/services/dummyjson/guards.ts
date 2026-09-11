import type { Category, Product, ProductList, ProductSummary, Review } from "./types";

type Unknown = Record<string, unknown>;

function isRecord(value: unknown): value is Unknown {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown, fallback = 0): number {
  return isFiniteNumber(value) ? value : fallback;
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function hasRequiredFields(
  value: unknown,
): value is Unknown & Pick<Product, "id" | "title" | "price" | "category"> {
  return (
    isRecord(value) &&
    isFiniteNumber(value.id) &&
    Number.isInteger(value.id) &&
    typeof value.title === "string" &&
    isFiniteNumber(value.price) &&
    typeof value.category === "string"
  );
}

function toReview(value: unknown): Review | null {
  if (!isRecord(value) || typeof value.comment !== "string") return null;
  return {
    rating: num(value.rating),
    comment: value.comment,
    date: str(value.date),
    reviewerName: str(value.reviewerName),
  };
}

// Tolerant of extra fields, strict on what the UI needs, defaults for every optional field.
export function parseProduct(value: unknown): Product | null {
  if (!hasRequiredFields(value)) return null;
  const dimensions = isRecord(value.dimensions) ? value.dimensions : {};
  const images = strings(value.images);
  const thumbnail = str(value.thumbnail, images[0] ?? "");
  return {
    id: value.id,
    title: value.title,
    description: str(value.description),
    category: value.category,
    price: value.price,
    discountPercentage: num(value.discountPercentage),
    rating: num(value.rating),
    stock: Math.max(0, Math.trunc(num(value.stock))),
    tags: strings(value.tags),
    brand: typeof value.brand === "string" && value.brand ? value.brand : undefined,
    sku: str(value.sku),
    weight: num(value.weight),
    dimensions: {
      width: num(dimensions.width),
      height: num(dimensions.height),
      depth: num(dimensions.depth),
    },
    warrantyInformation: str(value.warrantyInformation),
    shippingInformation: str(value.shippingInformation),
    availabilityStatus: str(value.availabilityStatus),
    reviews: Array.isArray(value.reviews)
      ? value.reviews.map(toReview).filter((review): review is Review => review !== null)
      : [],
    returnPolicy: str(value.returnPolicy),
    minimumOrderQuantity: num(value.minimumOrderQuantity, 1),
    images: images.length > 0 ? images : thumbnail ? [thumbnail] : [],
    thumbnail,
  };
}

export function parseProductSummary(value: unknown): ProductSummary | null {
  if (!hasRequiredFields(value)) return null;
  return {
    id: value.id,
    title: value.title,
    price: value.price,
    thumbnail: str(value.thumbnail),
    stock: Math.max(0, Math.trunc(num(value.stock))),
  };
}

function parseList<T>(
  value: unknown,
  parseItem: (item: unknown) => T | null,
): ProductList<T> | null {
  if (!isRecord(value) || !Array.isArray(value.products) || !isFiniteNumber(value.total))
    return null;
  const products: T[] = [];
  for (const item of value.products) {
    const parsed = parseItem(item);
    if (!parsed) return null;
    products.push(parsed);
  }
  return { products, total: value.total, skip: num(value.skip) };
}

export function parseProductSummaryList(value: unknown): ProductList<ProductSummary> | null {
  return parseList(value, parseProductSummary);
}

export function parseCategoryList(value: unknown): Category[] | null {
  if (!Array.isArray(value)) return null;
  const categories: Category[] = [];
  for (const item of value) {
    if (!isRecord(item) || typeof item.slug !== "string" || typeof item.name !== "string")
      return null;
    categories.push({ slug: item.slug, name: item.name, url: str(item.url) });
  }
  return categories;
}
