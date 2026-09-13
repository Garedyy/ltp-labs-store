import { describe, expect, it } from "vitest";

import { isCardCode, isCardExpiry, isCardNumber, isEmail } from "./validation";

describe("isEmail", () => {
  it("accepts a plain address and trims whitespace", () => {
    expect(isEmail("ana@example.com")).toBe(true);
    expect(isEmail("  ana@example.com  ")).toBe(true);
  });

  it("refuses missing parts and inner spaces", () => {
    expect(isEmail("ana@example")).toBe(false);
    expect(isEmail("ana example@example.com")).toBe(false);
    expect(isEmail("@example.com")).toBe(false);
    expect(isEmail("")).toBe(false);
  });
});

describe("isCardNumber", () => {
  it("accepts Luhn-valid numbers with or without spaces", () => {
    expect(isCardNumber("4242424242424242")).toBe(true);
    expect(isCardNumber("4242 4242 4242 4242")).toBe(true);
    expect(isCardNumber("378282246310005")).toBe(true);
  });

  it("refuses a bad checksum, letters and wrong lengths", () => {
    expect(isCardNumber("4242424242424241")).toBe(false);
    expect(isCardNumber("4242 4242 4242 424a")).toBe(false);
    expect(isCardNumber("424242424242")).toBe(false);
    expect(isCardNumber("42424242424242424242")).toBe(false);
  });
});

describe("isCardExpiry", () => {
  const now = new Date(Date.UTC(2026, 8, 13));

  it("accepts the current month and later ones", () => {
    expect(isCardExpiry("09/26", now)).toBe(true);
    expect(isCardExpiry("01/27", now)).toBe(true);
    expect(isCardExpiry("12 / 30", now)).toBe(true);
  });

  it("refuses past months and malformed values", () => {
    expect(isCardExpiry("08/26", now)).toBe(false);
    expect(isCardExpiry("13/27", now)).toBe(false);
    expect(isCardExpiry("00/27", now)).toBe(false);
    expect(isCardExpiry("09/2026", now)).toBe(false);
    expect(isCardExpiry("0926", now)).toBe(false);
  });
});

describe("isCardCode", () => {
  it("accepts three or four digits only", () => {
    expect(isCardCode("123")).toBe(true);
    expect(isCardCode("1234")).toBe(true);
    expect(isCardCode("12")).toBe(false);
    expect(isCardCode("12345")).toBe(false);
    expect(isCardCode("12a")).toBe(false);
  });
});
