export const ERROR_CODES = ["page-not-found", "product-not-found", "service-unavailable"] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === "string" && (ERROR_CODES as readonly string[]).includes(value);
}

// Every code maps to a translation namespace: a missing entry is a compile error.
export const ERROR_MESSAGE_KEYS = {
  "page-not-found": "notFound",
  "product-not-found": "productNotFound",
  "service-unavailable": "serviceUnavailable",
} as const satisfies Record<ErrorCode, string>;
