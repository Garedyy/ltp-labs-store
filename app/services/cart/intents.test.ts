import { describe, expect, it } from "vitest";

import { isAddIntent, isNoJs, parseCartIntent, parsePaymentMethod } from "./intents";

const form = (entries: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
};

describe("parseCartIntent", () => {
  it("parses every intent with absolute quantities", () => {
    expect(
      parseCartIntent(form({ intent: "set-quantity", productId: "3", quantity: "4" })),
    ).toEqual({
      type: "set-quantity",
      productId: 3,
      quantity: 4,
    });
    expect(
      parseCartIntent(form({ intent: "set-quantity", productId: "3", quantity: "x" })),
    ).toEqual({
      type: "set-quantity",
      productId: 3,
      quantity: null,
    });
    expect(parseCartIntent(form({ intent: "remove", productId: "3" }))).toEqual({
      type: "remove",
      productId: 3,
    });
    expect(parseCartIntent(form({ intent: "apply-promo", code: " ltp10 " }))).toEqual({
      type: "apply-promo",
      code: " ltp10 ",
    });
    expect(parseCartIntent(form({ intent: "remove-promo" }))).toEqual({ type: "remove-promo" });
  });

  it("lets a +/- submitter override the typed quantity wherever it sits in the payload", () => {
    const minus = form({ intent: "set-quantity", productId: "3", setQuantity: "2", quantity: "3" });
    expect(parseCartIntent(minus)).toEqual({ type: "set-quantity", productId: 3, quantity: 2 });
    const plus = form({ intent: "set-quantity", productId: "3", quantity: "3", setQuantity: "4" });
    expect(parseCartIntent(plus)).toEqual({ type: "set-quantity", productId: 3, quantity: 4 });
  });

  it("rejects unknown intents and missing product ids", () => {
    expect(parseCartIntent(form({ intent: "increment" }))).toEqual({ type: "invalid" });
    // checkout left the cart route for the payment page (D-15).
    expect(parseCartIntent(form({ intent: "checkout", payment: "card" }))).toEqual({
      type: "invalid",
    });
    expect(parseCartIntent(form({ intent: "remove", productId: "abc" }))).toEqual({
      type: "invalid",
    });
  });

  it("detects the no-JS marker", () => {
    expect(isNoJs(form({ noJs: "1" }))).toBe(true);
    expect(isNoJs(form({}))).toBe(false);
  });
});

describe("isAddIntent", () => {
  it("accepts the two product-route intents only", () => {
    expect(isAddIntent("add")).toBe(true);
    expect(isAddIntent("buy-now")).toBe(true);
    expect(isAddIntent("increment")).toBe(false);
    expect(isAddIntent("checkout")).toBe(false);
    expect(isAddIntent(null)).toBe(false);
    expect(isAddIntent(undefined)).toBe(false);
  });
});

describe("parsePaymentMethod", () => {
  it("reads paypal and falls back to card", () => {
    expect(parsePaymentMethod("paypal")).toBe("paypal");
    expect(parsePaymentMethod("card")).toBe("card");
    expect(parsePaymentMethod(null)).toBe("card");
    expect(parsePaymentMethod("bitcoin")).toBe("card");
  });
});
