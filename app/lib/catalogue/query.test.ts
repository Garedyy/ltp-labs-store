import { describe, expect, it } from "vitest";

import { buildSearch, parseCatalogueQuery } from "./query";

const slugs = ["beauty", "laptops"];

describe("parseCatalogueQuery", () => {
  it("defaults to page 1, no sort, empty q", () => {
    expect(parseCatalogueQuery(new URLSearchParams(""), slugs)).toEqual({ page: 1, q: "" });
  });

  it("silently normalises invalid page and sort", () => {
    const query = parseCatalogueQuery(new URLSearchParams("page=abc&sort=nope"), slugs);
    expect(query.page).toBe(1);
    expect(query.sort).toBeUndefined();
    expect(parseCatalogueQuery(new URLSearchParams("page=0"), slugs).page).toBe(1);
    expect(parseCatalogueQuery(new URLSearchParams("page=3&sort=price-asc"), slugs)).toMatchObject({
      page: 3,
      sort: "price-asc",
    });
  });

  it("trims, truncates and blanks whitespace-only q", () => {
    expect(parseCatalogueQuery(new URLSearchParams("q=  phone "), slugs).q).toBe("phone");
    expect(parseCatalogueQuery(new URLSearchParams("q=   "), slugs).q).toBe("");
    expect(parseCatalogueQuery(new URLSearchParams(`q=${"a".repeat(150)}`), slugs).q).toHaveLength(
      100,
    );
  });

  it("keeps a known category and asks for a canonical redirect on an unknown one", () => {
    expect(parseCatalogueQuery(new URLSearchParams("category=beauty"), slugs).category).toBe(
      "beauty",
    );
    const unknown = parseCatalogueQuery(new URLSearchParams("category=foo&sort=price-asc"), slugs);
    expect(unknown.category).toBeUndefined();
    expect(unknown.canonical).toBe("?sort=price-asc");
    expect(parseCatalogueQuery(new URLSearchParams("category=Beauty"), slugs).canonical).toBe("");
  });
});

describe("buildSearch", () => {
  it("writes params in the fixed order and never writes page=1", () => {
    const current = new URLSearchParams("page=3&sort=price-asc&q=phone");
    expect(buildSearch(current, {})).toBe("?q=phone&sort=price-asc&page=3");
    expect(buildSearch(current, { page: 1 })).toBe("?q=phone&sort=price-asc");
    expect(buildSearch(new URLSearchParams(), {})).toBe("");
  });

  it("drops page whenever q, category or sort change", () => {
    const current = new URLSearchParams("category=beauty&page=3");
    expect(buildSearch(current, { sort: "title-asc" })).toBe("?category=beauty&sort=title-asc");
    expect(buildSearch(current, { category: "laptops" })).toBe("?category=laptops");
    expect(buildSearch(current, { category: undefined })).toBe("");
    expect(buildSearch(current, { page: 4 })).toBe("?category=beauty&page=4");
  });
});
