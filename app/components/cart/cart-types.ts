import type { ErrorCode, NoticeCode } from "~/lib/error-codes";

// Shape of every cart action result (fetcher data with JS, flashed into the session without).
export type CartActionResult =
  | { ok: true; notice: NoticeCode; values?: Record<string, string | number>; productId?: number }
  | { ok: false; error: ErrorCode; productId?: number };
