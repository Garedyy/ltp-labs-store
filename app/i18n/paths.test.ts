import { describe, expect, it } from "vitest";

import { isSafeRedirectPath, switchLocale, withLocale } from "./paths";

describe("withLocale", () => {
  it("prefixes a path and keeps the query string", () => {
    expect(withLocale("/", "en")).toBe("/en");
    expect(withLocale("/products/3?image=2", "pt")).toBe("/pt/products/3?image=2");
    expect(withLocale("cart", "en")).toBe("/en/cart");
  });
});

describe("switchLocale", () => {
  it("replaces an existing locale prefix", () => {
    expect(switchLocale("/en/cart?promo=1", "pt")).toBe("/pt/cart?promo=1");
    expect(switchLocale("/pt", "en")).toBe("/en");
    expect(switchLocale("/EN/products/3", "pt")).toBe("/pt/products/3");
  });

  it("adds the prefix to an un-prefixed path", () => {
    expect(switchLocale("/products/3", "pt")).toBe("/pt/products/3");
    expect(switchLocale("/", "pt")).toBe("/pt");
  });
});

describe("isSafeRedirectPath", () => {
  it("accepts same-origin paths only", () => {
    expect(isSafeRedirectPath("/en/cart")).toBe(true);
    expect(isSafeRedirectPath("//evil.example")).toBe(false);
    expect(isSafeRedirectPath("https://evil.example")).toBe(false);
    expect(isSafeRedirectPath(undefined)).toBe(false);
  });
});
