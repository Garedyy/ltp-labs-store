export const SORT_OPTIONS = {
  "price-asc": { sortBy: "price", order: "asc" },
  "price-desc": { sortBy: "price", order: "desc" },
  "title-asc": { sortBy: "title", order: "asc" },
  "title-desc": { sortBy: "title", order: "desc" },
  "rating-desc": { sortBy: "rating", order: "desc" },
} as const;

export type SortKey = keyof typeof SORT_OPTIONS;

export const SORT_KEYS = Object.keys(SORT_OPTIONS) as SortKey[];

export function isSortKey(value: unknown): value is SortKey {
  return typeof value === "string" && Object.hasOwn(SORT_OPTIONS, value);
}
