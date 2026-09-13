import { createCookie } from "react-router";

import { DEFAULT_THEME, isExplicitTheme, type Theme } from "./config";

// Written only by the set-theme action; absent while the visitor follows the system preference.
export const themeCookie = createCookie("theme", {
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  maxAge: 60 * 60 * 24 * 365,
});

export async function readTheme(request: Request): Promise<Theme> {
  const value: unknown = await themeCookie.parse(request.headers.get("Cookie"));
  return isExplicitTheme(value) ? value : DEFAULT_THEME;
}

// Choosing "system" removes the cookie instead of storing a third value.
export function serializeTheme(theme: Theme): Promise<string> {
  return isExplicitTheme(theme)
    ? themeCookie.serialize(theme)
    : themeCookie.serialize("", { maxAge: 0 });
}
