import { describe, expect, it } from "vitest";

import { pageMeta } from "./meta";

describe("pageMeta", () => {
  it("builds the title from the page and the brand", () => {
    expect(pageMeta({ title: "Shop", brand: "The Online Store" })).toEqual([
      { title: "Shop — The Online Store" },
    ]);
  });

  it("adds the description when given", () => {
    expect(pageMeta({ title: "Shop", brand: "B", description: "D" })).toEqual([
      { title: "Shop — B" },
      { name: "description", content: "D" },
    ]);
  });
});
