import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { parseCategoryList, parseProduct, parseProductSummaryList } from "./guards";

const fixture = (name: string) =>
  JSON.parse(readFileSync(resolve(process.cwd(), "tests/fixtures/dummyjson", name), "utf8"));

describe("parseProduct", () => {
  it("accepts a real product and keeps every field the UI needs", () => {
    const product = parseProduct(fixture("product-1.json"));
    expect(product).toMatchObject({ id: 1, title: "Essence Mascara Lash Princess", stock: 99 });
    expect(product?.reviews).toHaveLength(3);
    expect(product?.images.length).toBeGreaterThan(0);
  });

  it("defaults optional fields: missing brand, stock, images, reviews", () => {
    const product = parseProduct({ id: 5, title: "T", price: 1.5, category: "beauty" });
    expect(product).toMatchObject({
      brand: undefined,
      stock: 0,
      images: [],
      thumbnail: "",
      reviews: [],
      discountPercentage: 0,
      minimumOrderQuantity: 1,
      dimensions: { width: 0, height: 0, depth: 0 },
    });
    expect(parseProduct(fixture("product-16.json"))?.brand).toBeUndefined();
  });

  it("rejects anything missing a required field or with a wrong type", () => {
    expect(parseProduct({ title: "T", price: 1, category: "c" })).toBeNull();
    expect(parseProduct({ id: "1", title: "T", price: 1, category: "c" })).toBeNull();
    expect(parseProduct({ id: 1, title: "T", price: "1", category: "c" })).toBeNull();
    expect(parseProduct(null)).toBeNull();
    expect(parseProduct("<html>")).toBeNull();
  });

  it("falls back to the thumbnail when images are missing and drops malformed reviews", () => {
    const product = parseProduct({
      id: 1,
      title: "T",
      price: 1,
      category: "c",
      thumbnail: "t.webp",
      reviews: [{ comment: "ok" }, { rating: 5 }],
    });
    expect(product?.images).toEqual(["t.webp"]);
    expect(product?.reviews).toEqual([{ rating: 0, comment: "ok", date: "", reviewerName: "" }]);
  });
});

describe("parseProductSummaryList", () => {
  it("accepts the full summary fixture (194 items) and ignores the echoed limit", () => {
    const list = parseProductSummaryList(fixture("products-all.json"));
    expect(list?.total).toBe(194);
    expect(list?.products).toHaveLength(194);
    expect(list?.products[0]).toEqual({
      id: 1,
      title: "Essence Mascara Lash Princess",
      price: 9.99,
      thumbnail: expect.stringContaining("webp"),
      stock: 99,
    });
  });

  it("accepts summaries without category (select) and rejects malformed items", () => {
    expect(
      parseProductSummaryList({ products: [{ id: 1, title: "T", price: 2 }], total: 1 })
        ?.products[0],
    ).toEqual({ id: 1, title: "T", price: 2, thumbnail: "", stock: 0 });
    expect(parseProductSummaryList({ products: [{ id: 1 }], total: 1 })).toBeNull();
    expect(parseProductSummaryList({ products: [] })).toBeNull();
    expect(parseProductSummaryList({ products: [], total: 0 })).toEqual({
      products: [],
      total: 0,
      skip: 0,
    });
  });
});

describe("parseCategoryList", () => {
  it("accepts the 24 categories and rejects malformed entries", () => {
    expect(parseCategoryList(fixture("categories.json"))).toHaveLength(24);
    expect(parseCategoryList([{ slug: "x" }])).toBeNull();
    expect(parseCategoryList({})).toBeNull();
  });
});
