import { createCookie } from "react-router";

// Written only by the set-language action: following a shared /pt/… link never changes a preference.
export const localeCookie = createCookie("lng", {
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  maxAge: 60 * 60 * 24 * 365,
});
