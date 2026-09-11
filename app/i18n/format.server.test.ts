import { describe, expect, it } from "vitest";

import { normaliseSpaces } from "../../tests/helpers/text";
import { formatDate, formatNumber, formatPercent, formatPrice } from "./format.server";

describe("formatPrice", () => {
  it("formats cents as USD per locale", () => {
    expect(normaliseSpaces(formatPrice(1999, "en"))).toBe("$19.99");
    expect(normaliseSpaces(formatPrice(1999, "pt"))).toBe("19,99 US$");
    expect(normaliseSpaces(formatPrice(3699999, "en"))).toBe("$36,999.99");
  });
});

describe("formatNumber", () => {
  it("keeps one decimal by default", () => {
    expect(formatNumber(4.56, "en")).toBe("4.6");
    expect(formatNumber(4.56, "pt")).toBe("4,6");
    expect(formatNumber(15.14, "en", 2)).toBe("15.14");
  });
});

describe("formatPercent", () => {
  it("always shows the sign and no decimals", () => {
    expect(normaliseSpaces(formatPercent(-0.15, "en"))).toBe("-15%");
    expect(normaliseSpaces(formatPercent(-0.154, "pt"))).toBe("-15%");
  });
});

describe("formatDate", () => {
  it("uses the medium date style per locale", () => {
    expect(formatDate("2025-04-30T09:41:02.053Z", "en")).toBe("Apr 30, 2025");
    expect(formatDate("2025-04-30T09:41:02.053Z", "pt")).toMatch(/30\/04\/2025|30 de abr/);
  });
});
