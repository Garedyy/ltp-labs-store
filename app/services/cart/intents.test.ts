import { describe, expect, it } from "vitest";

import { isNoJs, parseCartIntent } from "./intents";

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
    expect(parseCartIntent(form({ intent: "checkout", payment: "paypal" }))).toEqual({
      type: "checkout",
      payment: "paypal",
    });
    expect(parseCartIntent(form({ intent: "checkout" }))).toEqual({
      type: "checkout",
      payment: "card",
    });
  });

  it("takes the last quantity value (the +/- submitter) when the input is also sent", () => {
    const data = new FormData();
    data.set("intent", "set-quantity");
    data.set("productId", "3");
    data.append("quantity", "1");
    data.append("quantity", "2");
    expect(parseCartIntent(data)).toEqual({ type: "set-quantity", productId: 3, quantity: 2 });
  });

  it("rejects unknown intents and missing product ids", () => {
    expect(parseCartIntent(form({ intent: "increment" }))).toEqual({ type: "invalid" });
    expect(parseCartIntent(form({ intent: "remove", productId: "abc" }))).toEqual({
      type: "invalid",
    });
  });

  it("detects the no-JS marker", () => {
    expect(isNoJs(form({ noJs: "1" }))).toBe(true);
    expect(isNoJs(form({}))).toBe(false);
  });
});
