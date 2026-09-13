import { href, redirect } from "react-router";

import type { Locale } from "~/i18n/config";
import type { NoticeCode } from "~/lib/error-codes";
import { notFound } from "~/lib/http";
import { getProduct } from "~/services/dummyjson/products.server";
import { loadCartView, toLineView, toTotalsView } from "./load-cart.server";
import { commitCartSession, getCartSession } from "./session.server";
import { computeTotals, toCents } from "./totals";
import type { CartLineView, LastOrder, PaymentMethod, TotalsView } from "./types";

export type CheckoutView = {
  lines: CartLineView[];
  totals: TotalsView;
  itemCount: number;
  // Set when the page prices one unit of a product on its own (Buy now, D-12): the cart is
  // neither included nor touched and the promo code does not apply.
  productId?: number;
};

export type LoadedCheckout = {
  session: Awaited<ReturnType<typeof getCartSession>>;
  view: CheckoutView | null;
  changed: boolean;
  // Cart mode: the reconciliation the cart page would show (`items-removed`, `quantities-adjusted`).
  notice?: NoticeCode;
};

export function productIdFrom(value: unknown): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Cart mode: the reconciled cart, or null when it is empty. Product mode: one unit of the product;
// an unknown product is a 404 and a sold-out one goes back to its page.
export async function loadCheckout(
  request: Request,
  locale: Locale,
  productId: number | null,
): Promise<LoadedCheckout> {
  if (productId === null) {
    const loaded = await loadCartView(request, locale);
    const { lines, totals, cartCount } = loaded.view;
    return {
      session: loaded.session,
      view: lines.length > 0 ? { lines, totals, itemCount: cartCount } : null,
      changed: loaded.changed,
      notice: loaded.notice,
    };
  }
  const [session, product] = await Promise.all([getCartSession(request), getProduct(productId)]);
  if (!product) notFound("product-not-found");
  if (product.stock <= 0) {
    throw redirect(
      href("/:lang/products/:productId", { lang: locale, productId: String(productId) }),
    );
  }
  const totals = computeTotals([{ unitCents: toCents(product.price), quantity: 1 }]);
  return {
    session,
    view: {
      lines: [toLineView(product, 1, locale)],
      totals: toTotalsView(totals, locale),
      itemCount: 1,
      productId,
    },
    changed: false,
  };
}

// An empty cart cannot be paid: back to the cart with the refusal flashed and focused there.
export async function redirectToEmptyCart(
  session: LoadedCheckout["session"],
  locale: Locale,
  status: 302 | 303,
): Promise<never> {
  session.flash("flash", { ok: false, error: "empty-cart" });
  throw redirect(href("/:lang/cart", { lang: locale }), {
    status,
    headers: { "Set-Cookie": await commitCartSession(session) },
  });
}

export function buildOrder(view: CheckoutView, method: PaymentMethod, totalFormatted: string) {
  return {
    number: `LTP-${Date.now().toString(36).toUpperCase()}`,
    method,
    totalCents: view.totals.totalCents,
    itemCount: view.itemCount,
    totalFormatted,
  } satisfies LastOrder;
}
