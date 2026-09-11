import { describe, expect, it } from "vitest";

import { isSortKey, SORT_KEYS, SORT_OPTIONS } from "./sort-options";

describe("sort options", () => {
  it("exposes the five approved sorts mapped to API fields", () => {
    expect(SORT_KEYS).toEqual([
      "price-asc",
      "price-desc",
      "title-asc",
      "title-desc",
      "rating-desc",
    ]);
    expect(SORT_OPTIONS["rating-desc"]).toEqual({ sortBy: "rating", order: "desc" });
    expect(isSortKey("price-asc")).toBe(true);
    expect(isSortKey("toString")).toBe(false);
    expect(isSortKey(undefined)).toBe(false);
  });
});
