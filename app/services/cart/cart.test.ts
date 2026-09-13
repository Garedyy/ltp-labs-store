import { describe, expect, it } from "vitest";

import {
  addLine,
  countItems,
  MAX_LINES,
  removeLine,
  sanitiseLines,
  sanitiseOrder,
  setQuantity,
} from "./cart";

describe("sanitiseLines", () => {
  it("drops anything that is not a well-formed line and clamps quantities", () => {
    expect(sanitiseLines(undefined)).toEqual([]);
    expect(sanitiseLines("nope")).toEqual([]);
    expect(
      sanitiseLines([
        { productId: 1, quantity: 2 },
        { productId: "2", quantity: 1 },
        { productId: 3, quantity: 0 },
        { productId: 4, quantity: 500 },
        { productId: 1, quantity: 9 },
        { productId: -5, quantity: 1 },
        null,
      ]),
    ).toEqual([
      { productId: 1, quantity: 2 },
      { productId: 3, quantity: 1 },
      { productId: 4, quantity: 99 },
    ]);
  });

  it("keeps the first 50 lines only", () => {
    const many = Array.from({ length: 60 }, (_, i) => ({ productId: i + 1, quantity: 1 }));
    expect(sanitiseLines(many)).toHaveLength(MAX_LINES);
  });
});

describe("sanitiseOrder", () => {
  const order = {
    number: "LTP-MFN2K1",
    method: "paypal",
    totalCents: 2999,
    lines: [{ productId: 1, quantity: 1 }],
  };

  it("keeps a well-formed order and sanitises its lines", () => {
    expect(sanitiseOrder(order)).toEqual(order);
    expect(
      sanitiseOrder({ ...order, lines: [...order.lines, { productId: 2, quantity: 500 }] }),
    ).toEqual({ ...order, lines: [...order.lines, { productId: 2, quantity: 99 }] });
  });

  it("reads an older or malformed order as no order", () => {
    expect(sanitiseOrder(undefined)).toBeUndefined();
    expect(sanitiseOrder("LTP-1")).toBeUndefined();
    const { lines: _lines, ...withoutLines } = order;
    expect(sanitiseOrder({ ...withoutLines, itemCount: 1 })).toBeUndefined();
    expect(sanitiseOrder({ ...order, lines: [] })).toBeUndefined();
    expect(sanitiseOrder({ ...order, number: "<script>" })).toBeUndefined();
    expect(sanitiseOrder({ ...order, method: "cash" })).toBeUndefined();
    expect(sanitiseOrder({ ...order, totalCents: 12.5 })).toBeUndefined();
  });
});

describe("addLine", () => {
  it("appends a new product with quantity 1 and increments an existing one in place", () => {
    const first = addLine([], 7, 10);
    expect(first).toEqual({ lines: [{ productId: 7, quantity: 1 }], capped: false, full: false });
    const second = addLine(first.lines, 7, 10);
    expect(second.lines).toEqual([{ productId: 7, quantity: 2 }]);
  });

  it("caps at the stock and refuses a 51st distinct product", () => {
    expect(addLine([{ productId: 7, quantity: 3 }], 7, 3)).toMatchObject({ capped: true });
    const full = Array.from({ length: 50 }, (_, i) => ({ productId: i + 1, quantity: 1 }));
    expect(addLine(full, 999, 10)).toMatchObject({ full: true, lines: full });
    expect(addLine(full, 1, 10).lines[0]).toEqual({ productId: 1, quantity: 2 });
  });
});

describe("setQuantity", () => {
  const lines = [{ productId: 1, quantity: 2 }];
  it("clamps to 1..min(99, stock) and reports the direction", () => {
    expect(setQuantity(lines, 1, 5, 10)).toMatchObject({ quantity: 5, clamped: null });
    expect(setQuantity(lines, 1, 0, 10)).toMatchObject({ quantity: 1, clamped: "min" });
    expect(setQuantity(lines, 1, 50, 10)).toMatchObject({ quantity: 10, clamped: "max" });
    expect(setQuantity(lines, 1, 500, 1000)).toMatchObject({ quantity: 99, clamped: "max" });
  });
});

describe("removeLine / countItems", () => {
  it("removes by id and sums quantities", () => {
    const lines = [
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 3 },
    ];
    expect(removeLine(lines, 1)).toEqual([{ productId: 2, quantity: 3 }]);
    expect(countItems(lines)).toBe(5);
    expect(countItems([])).toBe(0);
  });
});
