import type { PaymentMethod } from "./types";

export type CartIntent =
  | { type: "set-quantity"; productId: number; quantity: number | null }
  | { type: "remove"; productId: number }
  | { type: "apply-promo"; code: string }
  | { type: "remove-promo" }
  | { type: "checkout"; payment: PaymentMethod }
  | { type: "invalid" };

function productIdFrom(form: FormData): number | null {
  const value = Number(form.get("productId"));
  return Number.isInteger(value) && value > 0 ? value : null;
}

// Quantities are absolute (never +1/-1) so rapid clicks stay idempotent; null means not an integer.
export function parseCartIntent(form: FormData): CartIntent {
  const intent = form.get("intent");
  const productId = productIdFrom(form);
  switch (intent) {
    case "set-quantity": {
      if (productId === null) return { type: "invalid" };
      // A clicked +/- button (`setQuantity`) overrides the typed value. They need distinct names:
      // the browser serialises the submitter at its DOM position, not last.
      const raw = String(form.get("setQuantity") ?? form.get("quantity") ?? "").trim();
      const quantity = /^-?\d+$/.test(raw) ? Number(raw) : null;
      return { type: "set-quantity", productId, quantity };
    }
    case "remove":
      return productId === null ? { type: "invalid" } : { type: "remove", productId };
    case "apply-promo":
      return { type: "apply-promo", code: String(form.get("code") ?? "") };
    case "remove-promo":
      return { type: "remove-promo" };
    case "checkout": {
      const payment = form.get("payment");
      return { type: "checkout", payment: payment === "paypal" ? "paypal" : "card" };
    }
    default:
      return { type: "invalid" };
  }
}

// The product route's intents: both add one unit; buy-now then redirects to the cart.
export type AddIntent = "add" | "buy-now";

export function isAddIntent(value: unknown): value is AddIntent {
  return value === "add" || value === "buy-now";
}

export function isNoJs(form: FormData): boolean {
  return form.get("noJs") === "1";
}
