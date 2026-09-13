import type { CartLine, LastOrder, PaymentMethod } from "./types";

export const MAX_LINES = 50;
export const MAX_QUANTITY = 99;

function clampQuantity(quantity: number, max: number): number {
  return Math.min(Math.max(1, Math.trunc(quantity)), Math.min(MAX_QUANTITY, Math.max(1, max)));
}

// The cookie is user-controlled: every read goes through here before anything trusts it.
export function sanitiseLines(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<number>();
  const lines: CartLine[] = [];
  for (const item of value) {
    if (lines.length >= MAX_LINES) break;
    if (typeof item !== "object" || item === null) continue;
    const { productId, quantity } = item as Record<string, unknown>;
    if (typeof productId !== "number" || !Number.isInteger(productId) || productId <= 0) continue;
    if (typeof quantity !== "number" || !Number.isFinite(quantity) || seen.has(productId)) continue;
    seen.add(productId);
    lines.push({ productId, quantity: clampQuantity(quantity, MAX_QUANTITY) });
  }
  return lines;
}

const ORDER_NUMBER = /^LTP-[A-Z0-9]{1,16}$/;

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return value === "card" || value === "paypal";
}

// A stale or tampered lastOrder (an older cookie without lines, for instance) reads as no order.
export function sanitiseOrder(value: unknown): LastOrder | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const { number, method, totalCents, lines } = value as Record<string, unknown>;
  if (typeof number !== "string" || !ORDER_NUMBER.test(number)) return undefined;
  if (!isPaymentMethod(method)) return undefined;
  if (typeof totalCents !== "number" || !Number.isInteger(totalCents) || totalCents < 0) {
    return undefined;
  }
  const safeLines = sanitiseLines(lines);
  if (safeLines.length === 0) return undefined;
  return { number, method, totalCents, lines: safeLines };
}

export type AddResult = { lines: CartLine[]; capped: boolean; full: boolean };

// Adding an existing product increments it in place; a 51st distinct product is refused.
export function addLine(lines: CartLine[], productId: number, max: number): AddResult {
  const existing = lines.find((line) => line.productId === productId);
  if (existing) {
    const quantity = clampQuantity(existing.quantity + 1, max);
    return {
      lines: lines.map((line) => (line.productId === productId ? { ...line, quantity } : line)),
      capped: quantity === existing.quantity,
      full: false,
    };
  }
  if (lines.length >= MAX_LINES) return { lines, capped: false, full: true };
  return { lines: [...lines, { productId, quantity: 1 }], capped: false, full: false };
}

export type SetQuantityResult = {
  lines: CartLine[];
  quantity: number;
  clamped: "min" | "max" | null;
};

export function setQuantity(
  lines: CartLine[],
  productId: number,
  requested: number,
  max: number,
): SetQuantityResult {
  const quantity = clampQuantity(requested, max);
  const clamped = requested < 1 ? "min" : quantity < requested ? "max" : null;
  return {
    lines: lines.map((line) => (line.productId === productId ? { ...line, quantity } : line)),
    quantity,
    clamped,
  };
}

export function removeLine(lines: CartLine[], productId: number): CartLine[] {
  return lines.filter((line) => line.productId !== productId);
}

export function countItems(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}
