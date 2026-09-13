import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Reads the raw palette from tokens.css and checks every semantic pairing against WCAG 2.2 AA.
const css = readFileSync(resolve(process.cwd(), "app/styles/tokens.css"), "utf8");

function palette(name: string): string {
  const match = css.match(new RegExp(`--palette-${name}:\\s*(#[0-9a-f]{3,6})`, "i"));
  if (!match?.[1]) throw new Error(`Missing palette token ${name}`);
  return match[1];
}

function luminance(hex: string): number {
  const digits = hex.length === 4 ? [...hex.slice(1)].map((d) => d + d).join("") : hex.slice(1);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const channel = parseInt(digits.slice(i, i + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(foreground: string, background: string): number {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a) as [
    number,
    number,
  ];
  return Math.round(((light + 0.05) / (dark + 0.05)) * 10) / 10;
}

const white = palette("white");
const lightGray = palette("light-gray");
const darkBlue = palette("dark-blue");
const darkBlueLighter = palette("dark-blue-lighter");
const mediumBlueLighter = palette("medium-blue-lighter");
const grayOnDark = palette("gray-on-dark");
const greenOnDark = palette("green-on-dark");
const errorOnDark = palette("error-on-dark");

const TEXT_PAIRS: [string, string, string, number][] = [
  ["fg on surface", palette("dark-blue"), white, 4.5],
  ["fg on surface-muted", palette("dark-blue"), lightGray, 4.5],
  ["fg-muted on surface", palette("dark-gray"), white, 4.5],
  ["primary text on surface", palette("medium-blue"), white, 4.5],
  ["link-hover on surface", palette("blue"), white, 4.5],
  ["primary-fg on primary", white, palette("medium-blue"), 4.5],
  ["fg-inverse on surface-inverse", white, palette("dark-blue"), 4.5],
  ["accent-fg on accent (badge)", palette("medium-blue"), palette("orange"), 4.5],
  ["error text on surface", palette("error-text"), white, 4.5],
  ["success text on surface", palette("light-green"), white, 4.5],
];

const COMPONENT_PAIRS: [string, string, string, number][] = [
  ["border-strong on surface", palette("dark-gray"), white, 3],
  ["error-border on surface", palette("error"), white, 3],
  ["focus-inner ring on surface", palette("medium-blue"), white, 3],
  ["fg-inverse icon on success (confirmation disc)", white, palette("light-green"), 3],
  ["focus ring against primary button", palette("orange"), palette("medium-blue"), 3],
];

const DARK_TEXT_PAIRS: [string, string, string, number][] = [
  ["fg on surface", lightGray, darkBlue, 4.5],
  ["fg on surface-muted", lightGray, darkBlueLighter, 4.5],
  ["fg-muted on surface", grayOnDark, darkBlue, 4.5],
  ["fg-muted on surface-muted", grayOnDark, darkBlueLighter, 4.5],
  ["fg-muted on surface-placeholder", grayOnDark, mediumBlueLighter, 4.5],
  ["primary-fg on primary", palette("medium-blue"), lightGray, 4.5],
  ["primary-fg on primary-hover", palette("medium-blue"), white, 4.5],
  ["fg-inverse on surface-inverse", white, darkBlueLighter, 4.5],
  ["accent-fg on accent (badge)", palette("medium-blue"), palette("orange"), 4.5],
  ["error text on surface", errorOnDark, darkBlue, 4.5],
  ["error text on surface-muted", errorOnDark, darkBlueLighter, 4.5],
  ["success text on surface", greenOnDark, darkBlue, 4.5],
  ["success text on surface-muted", greenOnDark, darkBlueLighter, 4.5],
];

const DARK_COMPONENT_PAIRS: [string, string, string, number][] = [
  ["border-strong on surface", grayOnDark, darkBlue, 3],
  ["error-border on surface", palette("error"), darkBlue, 3],
  ["focus ring on surface", palette("orange"), darkBlue, 3],
  ["focus ring on surface-muted", palette("orange"), darkBlueLighter, 3],
  ["focus-inner ring against primary button", darkBlue, lightGray, 3],
  ["fg-inverse icon on success (confirmation disc)", white, greenOnDark, 3],
];

// The explicit block and the system-preference block must declare the same roles.
function block(selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`Missing block ${selector}`);
  const end = css.indexOf("}", start);
  return css
    .slice(start + selector.length + 2, end)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

describe("dark theme", () => {
  it.each(DARK_TEXT_PAIRS)("%s is at least %s:1", (_label, fg, bg, minimum) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(minimum);
  });

  it.each(DARK_COMPONENT_PAIRS)("%s is at least %s:1", (_label, fg, bg, minimum) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(minimum);
  });

  it("documents why focus-inner turns dark: orange alone fails on the light primary button", () => {
    expect(contrast(palette("orange"), lightGray)).toBeLessThan(3);
  });

  it("is declared once for the cookie and once for the system preference, identically", () => {
    const explicit = block(':root[data-theme="dark"]');
    const system = block(':root:not([data-theme="light"])');
    expect(explicit).toContain("color-scheme: dark;");
    expect(explicit).toContain("--surface: var(--palette-dark-blue);");
    expect(system).toBe(explicit);
  });
});

describe("design tokens contrast (WCAG 2.2 AA)", () => {
  it.each(TEXT_PAIRS)("%s is at least %s:1", (_label, fg, bg, minimum) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(minimum);
  });

  it.each(COMPONENT_PAIRS)("%s is at least %s:1", (_label, fg, bg, minimum) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(minimum);
  });

  it("documents why orange is never used as text", () => {
    expect(contrast(palette("orange"), white)).toBeLessThan(4.5);
  });
});
