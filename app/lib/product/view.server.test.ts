import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { createTestI18n } from "../../../tests/helpers/i18n";
import { normaliseSpaces } from "../../../tests/helpers/text";
import { parseProduct } from "~/services/dummyjson/guards";
import { clampImageIndex } from "./image";
import { buildProductView, originalPriceCents } from "./view.server";

const fixture = (id: number) =>
  parseProduct(
    JSON.parse(
      readFileSync(resolve(process.cwd(), `tests/fixtures/dummyjson/product-${id}.json`), "utf8"),
    ),
  )!;

describe("originalPriceCents", () => {
  it("derives the original price and hides discounts under 1 % or 1 cent", () => {
    expect(originalPriceCents(999, 10.48)).toBe(1116);
    expect(originalPriceCents(999, 0.5)).toBeNull();
    expect(originalPriceCents(1, 1)).toBeNull();
  });
});

describe("clampImageIndex", () => {
  it("is 1-based and falls back to 1", () => {
    expect(clampImageIndex("2", 4)).toBe(2);
    expect(clampImageIndex("5", 4)).toBe(1);
    expect(clampImageIndex("0", 4)).toBe(1);
    expect(clampImageIndex("x", 4)).toBe(1);
    expect(clampImageIndex(null, 4)).toBe(1);
  });
});

describe("buildProductView", () => {
  it("formats prices, discount, rating, dates and practical information per locale", () => {
    const t = createTestI18n("pt").t;
    const view = buildProductView(fixture(1), "pt", t);
    expect(normaliseSpaces(view.priceFormatted)).toBe("9,99 US$");
    expect(normaliseSpaces(view.originalPriceFormatted ?? "")).toBe("11,16 US$");
    expect(normaliseSpaces(view.discountFormatted ?? "")).toBe("-10%");
    expect(view.ratingFormatted).toMatch(/^\d,\d$/);
    expect(view.reviews).toHaveLength(3);
    expect(view.reviews[0]?.dateFormatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(view.info.find((item) => item.key === "brand")).toMatchObject({
      description: "Essence",
      lang: "en",
    });
    expect(view.info.find((item) => item.key === "dimensions")?.description).toMatch(/cm$/);
    expect(view.info.find((item) => item.key === "weight")?.description).toMatch(/kg$/);
  });

  it("omits the brand row when missing and flags out-of-stock products", () => {
    const t = createTestI18n("en").t;
    const view = buildProductView(fixture(153), "en", t);
    expect(view.info.some((item) => item.key === "brand")).toBe(false);
    expect(view.inStock).toBe(false);
    expect(view.info.find((item) => item.key === "sku")?.lang).toBeUndefined();
  });
});
