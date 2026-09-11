import { href } from "react-router";

import type { Locale } from "~/i18n/config";
import { formatPrice } from "~/i18n/format.server";
import type { NoticeCode } from "~/lib/error-codes";
import { getProductsByIds } from "~/services/dummyjson/products.server";
import { countItems, MAX_QUANTITY, sanitiseLines } from "./cart";
import { getCartSession } from "./session.server";
import { computeTotals, toCents } from "./totals";
import type { CartLine, CartLineView, CartView, TotalsView } from "./types";

export type LoadedCart = {
  session: Awaited<ReturnType<typeof getCartSession>>;
  view: CartView;
  changed: boolean;
  notice?: NoticeCode;
};

// Reconciles the cookie with the catalogue: vanished or sold-out products are dropped,
// quantities above stock are clamped, and the caller commits when something changed.
export async function loadCartView(request: Request, locale: Locale): Promise<LoadedCart> {
  const session = await getCartSession(request);
  const stored = sanitiseLines(session.get("cart"));
  const products = await getProductsByIds(stored.map((line) => line.productId));

  const lines: CartLine[] = [];
  const views: CartLineView[] = [];
  const amounts: { unitCents: number; quantity: number }[] = [];
  let removed = false;
  let adjusted = false;
  stored.forEach((line, index) => {
    const product = products[index];
    if (!product || product.stock <= 0) {
      removed = true;
      return;
    }
    const maxQuantity = Math.min(MAX_QUANTITY, product.stock);
    const quantity = Math.min(line.quantity, maxQuantity);
    if (quantity !== line.quantity) adjusted = true;
    lines.push({ productId: line.productId, quantity });
    const unitCents = toCents(product.price);
    amounts.push({ unitCents, quantity });
    views.push({
      productId: product.id,
      title: product.title,
      thumbnail: product.thumbnail,
      quantity,
      maxQuantity,
      unitPriceFormatted: formatPrice(unitCents, locale),
      linePriceFormatted: formatPrice(unitCents * quantity, locale),
      href: href("/:lang/products/:productId", { lang: locale, productId: String(product.id) }),
    });
  });

  const promoCode = session.get("promoCode");
  const totals = computeTotals(
    views.map((line, index) => ({
      unitCents: toCents(
        products[stored.findIndex((s) => s.productId === line.productId)]?.price ?? 0,
      ),
      quantity: lines[index]?.quantity ?? 0,
    })),
    promoCode,
  );
  const totalsView: TotalsView = {
    subtotalFormatted: formatPrice(totals.subtotalCents, locale),
    discountFormatted:
      totals.discountCents > 0 ? formatPrice(totals.discountCents, locale) : undefined,
    promoCode,
    shippingFormatted: formatPrice(totals.shippingCents, locale),
    isFreeShipping: totals.isFreeShipping,
    totalFormatted: formatPrice(totals.totalCents, locale),
    totalCents: totals.totalCents,
  };

  const changed = removed || adjusted;
  if (changed) session.set("cart", lines);
  return {
    session,
    view: { lines: views, totals: totalsView, cartCount: countItems(lines), promoCode },
    changed,
    notice: removed ? "items-removed" : adjusted ? "quantities-adjusted" : undefined,
  };
}
