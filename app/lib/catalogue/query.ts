import { isSortKey, type SortKey } from "./sort-options";

export type CatalogueQuery = {
  page: number;
  sort?: SortKey;
  category?: string;
  q: string;
  // Set when the URL must be redirected to its canonical form (unknown category dropped).
  canonical?: string;
};

const MAX_QUERY_LENGTH = 100;
const PARAM_ORDER = ["q", "category", "sort", "page"] as const;

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseQ(value: string | null): string {
  return (value ?? "").trim().slice(0, MAX_QUERY_LENGTH);
}

export function parseCatalogueQuery(
  searchParams: URLSearchParams,
  categorySlugs: readonly string[],
): CatalogueQuery {
  const sortValue = searchParams.get("sort");
  const query: CatalogueQuery = {
    page: parsePage(searchParams.get("page")),
    sort: isSortKey(sortValue) ? sortValue : undefined,
    q: parseQ(searchParams.get("q")),
  };
  const category = searchParams.get("category");
  if (category !== null) {
    if (/^[a-z-]+$/.test(category) && categorySlugs.includes(category)) {
      query.category = category;
    } else {
      const canonical = new URLSearchParams(searchParams);
      canonical.delete("category");
      query.canonical = `?${canonical.toString()}`.replace(/\?$/, "");
    }
  }
  return query;
}

type Patch = Partial<Record<(typeof PARAM_ORDER)[number], string | number | undefined>>;

// Fixed parameter order; page=1 never written; page dropped whenever q, category or sort change.
export function buildSearch(current: URLSearchParams, patch: Patch): string {
  const next = new URLSearchParams();
  const resetsPage = "q" in patch || "category" in patch || "sort" in patch;
  for (const key of PARAM_ORDER) {
    const value = key in patch ? patch[key] : current.get(key);
    if (key === "page" && (resetsPage || value === undefined || String(value) === "1")) continue;
    if (value === undefined || value === null || value === "") continue;
    next.set(key, String(value));
  }
  const search = next.toString();
  return search ? `?${search}` : "";
}
