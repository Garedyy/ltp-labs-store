import { describe, expect, it } from "vitest";

import { PAGE_SIZE, pageCountFor, pageItems, pageWindow, showing, skipFor } from "./pagination";

describe("pagination", () => {
  it("uses a fixed page size of 9", () => {
    expect(PAGE_SIZE).toBe(9);
    expect(skipFor(1)).toBe(0);
    expect(skipFor(3)).toBe(18);
  });

  it("computes the page count from the total, never below 1", () => {
    expect(pageCountFor(194)).toBe(22);
    expect(pageCountFor(9)).toBe(1);
    expect(pageCountFor(0)).toBe(1);
  });

  it("computes the showing range", () => {
    expect(showing(194, 0, 9)).toEqual({ from: 1, to: 9 });
    expect(showing(194, 189, 5)).toEqual({ from: 190, to: 194 });
    expect(showing(0, 0, 0)).toEqual({ from: 0, to: 0 });
  });

  it("centres a window of five pages and clamps it", () => {
    expect(pageWindow(1, 22)).toEqual([1, 2, 3, 4, 5]);
    expect(pageWindow(4, 22)).toEqual([2, 3, 4, 5, 6]);
    expect(pageWindow(22, 22)).toEqual([18, 19, 20, 21, 22]);
    expect(pageWindow(2, 3)).toEqual([1, 2, 3]);
    expect(pageWindow(1, 1)).toEqual([1]);
  });

  it("adds the first and last pages around the window, with a gap only when pages are hidden", () => {
    expect(pageItems(1, 22)).toEqual([1, 2, 3, 4, 5, "gap-end", 22]);
    expect(pageItems(4, 22)).toEqual([1, 2, 3, 4, 5, 6, "gap-end", 22]);
    expect(pageItems(5, 22)).toEqual([1, "gap-start", 3, 4, 5, 6, 7, "gap-end", 22]);
    expect(pageItems(9, 22)).toEqual([1, "gap-start", 7, 8, 9, 10, 11, "gap-end", 22]);
    expect(pageItems(19, 22)).toEqual([1, "gap-start", 17, 18, 19, 20, 21, 22]);
    expect(pageItems(22, 22)).toEqual([1, "gap-start", 18, 19, 20, 21, 22]);
    expect(pageItems(2, 3)).toEqual([1, 2, 3]);
    expect(pageItems(1, 1)).toEqual([1]);
  });
});
