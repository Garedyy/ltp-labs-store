import { findPromo } from "./promo-codes";

export const SHIPPING_CENTS = 2000;

export type LineAmount = { unitCents: number; quantity: number };

export type Totals = {
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  isFreeShipping: boolean;
};

export function toCents(price: number): number {
  return Math.round(price * 100);
}

// Integer cents only; the largest product ($36,999.99 × 99) stays far below 2^53.
export function computeTotals(lines: LineAmount[], promoCode?: string): Totals {
  const subtotalCents = lines.reduce((sum, line) => sum + line.unitCents * line.quantity, 0);
  const promo = findPromo(promoCode);
  const discountCents = promo?.percentOff
    ? Math.round((subtotalCents * promo.percentOff) / 100)
    : 0;
  const isFreeShipping = Boolean(promo?.freeShipping) && lines.length > 0;
  const shippingCents = lines.length === 0 || isFreeShipping ? 0 : SHIPPING_CENTS;
  return {
    subtotalCents,
    discountCents,
    shippingCents,
    isFreeShipping,
    totalCents: subtotalCents - discountCents + shippingCents,
  };
}
