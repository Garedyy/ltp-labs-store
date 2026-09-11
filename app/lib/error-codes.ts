export const ERROR_CODES = [
  "page-not-found",
  "product-not-found",
  "service-unavailable",
  "invalid-intent",
  "invalid-quantity",
  "out-of-stock",
  "cart-full",
  "promo-required",
  "promo-invalid",
  "empty-cart",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === "string" && (ERROR_CODES as readonly string[]).includes(value);
}

// Every code maps to a translation namespace: a missing entry is a compile error.
export const ERROR_MESSAGE_KEYS = {
  "page-not-found": "notFound",
  "product-not-found": "productNotFound",
  "service-unavailable": "serviceUnavailable",
  "invalid-intent": "invalidIntent",
  "invalid-quantity": "invalidQuantity",
  "out-of-stock": "outOfStock",
  "cart-full": "cartFull",
  "promo-required": "promoRequired",
  "promo-invalid": "promoInvalid",
  "empty-cart": "emptyCart",
} as const satisfies Record<ErrorCode, string>;

export const NOTICE_CODES = [
  "added",
  "added-capped",
  "quantity-updated",
  "quantity-clamped",
  "removed",
  "promo-applied",
  "promo-removed",
  "items-removed",
  "quantities-adjusted",
] as const;

export type NoticeCode = (typeof NOTICE_CODES)[number];

export function isNoticeCode(value: unknown): value is NoticeCode {
  return typeof value === "string" && (NOTICE_CODES as readonly string[]).includes(value);
}

export const NOTICE_MESSAGE_KEYS = {
  added: "added",
  "added-capped": "addedCapped",
  "quantity-updated": "quantityUpdated",
  "quantity-clamped": "quantityClamped",
  removed: "removed",
  "promo-applied": "promoApplied",
  "promo-removed": "promoRemoved",
  "items-removed": "itemsRemoved",
  "quantities-adjusted": "quantitiesAdjusted",
} as const satisfies Record<NoticeCode, string>;
