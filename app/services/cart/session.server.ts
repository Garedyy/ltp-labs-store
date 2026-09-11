import { createCookieSessionStorage } from "react-router";

import type { NoticeCode } from "~/lib/error-codes";
import type { CartSessionData } from "./types";

type CartFlashData = { notice?: NoticeCode; flash?: unknown };

const DEV_SECRET = "dev-only-cart-secret";

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required in production");
  }
  // eslint-disable-next-line no-console -- a deliberate boot-time warning for developers
  console.warn("SESSION_SECRET is not set: using the development secret");
  return DEV_SECRET;
}

// Signed, httpOnly, 30 days. Tampering fails the signature and reads as an empty cart.
export const cartStorage = createCookieSessionStorage<CartSessionData, CartFlashData>({
  cookie: {
    name: "__cart",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    maxAge: 60 * 60 * 24 * 30,
    secrets: [sessionSecret()],
  },
});

export function getCartSession(request: Request) {
  return cartStorage.getSession(request.headers.get("Cookie"));
}

export const commitCartSession = cartStorage.commitSession;
