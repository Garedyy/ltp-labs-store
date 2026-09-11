import { describe, expect, it } from "vitest";

import { computeTotals, SHIPPING_CENTS, toCents } from "./totals";

describe("computeTotals", () => {
  it("adds fixed shipping to a non-empty cart and nothing to an empty one", () => {
    expect(computeTotals([{ unitCents: 999, quantity: 2 }])).toEqual({
      subtotalCents: 1998,
      discountCents: 0,
      shippingCents: SHIPPING_CENTS,
      isFreeShipping: false,
      totalCents: 3998,
    });
    expect(computeTotals([]).totalCents).toBe(0);
  });

  it("applies LTP10 (10 % of the subtotal, rounded) and FREESHIP", () => {
    expect(computeTotals([{ unitCents: 1005, quantity: 1 }], "ltp10")).toMatchObject({
      discountCents: 101,
      totalCents: 1005 - 101 + 2000,
    });
    expect(computeTotals([{ unitCents: 1005, quantity: 1 }], "FREESHIP")).toMatchObject({
      shippingCents: 0,
      isFreeShipping: true,
      totalCents: 1005,
    });
    expect(computeTotals([{ unitCents: 1005, quantity: 1 }], "NOPE").discountCents).toBe(0);
  });

  it("stays exact with the most expensive product at the maximum quantity", () => {
    const totals = computeTotals([{ unitCents: toCents(36999.99), quantity: 99 }], "LTP10");
    expect(totals.subtotalCents).toBe(366299901);
    expect(totals.discountCents).toBe(36629990);
    expect(totals.totalCents).toBe(366299901 - 36629990 + 2000);
  });
});
