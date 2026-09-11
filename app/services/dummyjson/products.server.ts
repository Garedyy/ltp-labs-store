import { cached } from "./cache.server";
import { ApiError, fetchJson } from "./client.server";
import { parseCategoryList, parseProduct, parseProductSummaryList } from "./guards";
import type { Category, Product, ProductList, ProductSummary } from "./types";

const MINUTE = 60_000;
const SUMMARY_FIELDS = "id,title,price,thumbnail,stock";

export type ListParams = { limit: number; skip: number; sortBy?: string; order?: "asc" | "desc" };

function listQuery({ limit, skip, sortBy, order }: ListParams) {
  return { limit, skip, select: SUMMARY_FIELDS, sortBy, order: sortBy ? order : undefined };
}

function key(path: string, params: object): string {
  return `${path}?${JSON.stringify(params)}`;
}

export function getProducts(params: ListParams): Promise<ProductList<ProductSummary>> {
  const query = listQuery(params);
  return cached(key("/products", query), 5 * MINUTE, () =>
    fetchJson("/products", query, parseProductSummaryList),
  );
}

export function getProductsByCategory(
  slug: string,
  params: ListParams,
): Promise<ProductList<ProductSummary>> {
  const query = listQuery(params);
  const path = `/products/category/${encodeURIComponent(slug)}`;
  return cached(key(path, query), 5 * MINUTE, () =>
    fetchJson(path, query, parseProductSummaryList),
  );
}

export function searchProducts(
  q: string,
  params: ListParams,
): Promise<ProductList<ProductSummary>> {
  const query = { q, ...listQuery(params) };
  return cached(key("/products/search", query), 5 * MINUTE, () =>
    fetchJson("/products/search", query, parseProductSummaryList),
  );
}

export function getProduct(id: number): Promise<Product | null> {
  return cached(`/products/${id}`, 10 * MINUTE, async () => {
    try {
      return await fetchJson(`/products/${id}`, {}, parseProduct);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  });
}

// Parallel, bounded by the cart cap (50 lines) and the per-request timeout.
export function getProductsByIds(ids: number[]): Promise<(Product | null)[]> {
  return Promise.all(ids.map(getProduct));
}

export function getCategories(): Promise<Category[]> {
  return cached("/products/categories", 60 * MINUTE, () =>
    fetchJson("/products/categories", {}, parseCategoryList),
  );
}
