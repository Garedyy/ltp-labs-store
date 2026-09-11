import type { TFunction } from "i18next";

import type { CartActionResult } from "~/components/cart/cart-types";
import { NOTICE_MESSAGE_KEYS } from "./error-codes";

// One place turns a notice code (+ values) into text, for status regions and flash notices.
export function noticeText(t: TFunction, result: Extract<CartActionResult, { ok: true }>): string {
  const values = result.values ?? {};
  switch (result.notice) {
    case "added":
      return t("cart.notice.added", { count: Number(values.count ?? 0) });
    default:
      return t(`cart.notice.${NOTICE_MESSAGE_KEYS[result.notice]}`, values);
  }
}
