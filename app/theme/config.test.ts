import { describe, expect, it } from "vitest";

import { isExplicitTheme, isTheme, THEMES } from "./config";

describe("theme config", () => {
  it("offers system, light and dark in that order", () => {
    expect(THEMES).toEqual(["system", "light", "dark"]);
  });

  it("accepts the three themes and nothing else", () => {
    for (const theme of THEMES) expect(isTheme(theme)).toBe(true);
    expect(isTheme("auto")).toBe(false);
    expect(isTheme("")).toBe(false);
    expect(isTheme(null)).toBe(false);
  });

  it("treats system as the absence of a choice", () => {
    expect(isExplicitTheme("light")).toBe(true);
    expect(isExplicitTheme("dark")).toBe(true);
    expect(isExplicitTheme("system")).toBe(false);
  });
});
