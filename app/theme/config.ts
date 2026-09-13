export const THEMES = ["system", "light", "dark"] as const;

export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "system";

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}

// "system" is the absence of a choice: the page follows prefers-color-scheme and <html> carries
// no data-theme, so only an explicit choice is ever rendered or stored.
export function isExplicitTheme(value: unknown): value is Exclude<Theme, "system"> {
  return value === "light" || value === "dark";
}
