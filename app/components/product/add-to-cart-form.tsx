import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { href, Link, useFetcher } from "react-router";

import { Alert } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { useLocale } from "~/i18n/use-locale";
import { ERROR_MESSAGE_KEYS, type ErrorCode, type NoticeCode } from "~/lib/error-codes";
import { type AddIntent, isAddIntent } from "~/services/cart/intents";

export type AddResult =
  | { ok: true; notice: NoticeCode; cartCount: number; max?: number }
  | { ok: false; error: ErrorCode };

type AddToCartFormProps = {
  productId: number;
  inStock: boolean;
  // Flash result of a no-JS submission, rendered by the loader with autoFocus.
  flash?: AddResult;
};

// One fetcher for both buttons: Buy now is the primary call to action and follows the action's
// redirect to the order confirmation; Add to cart keeps the user on the page. Submits are
// ignored while one is pending.
export function AddToCartForm({ productId, inStock, flash }: AddToCartFormProps) {
  const { t } = useTranslation();
  const lang = useLocale();
  const fetcher = useFetcher<AddResult>();
  const buttons = useRef<Record<AddIntent, HTMLButtonElement | null>>({
    add: null,
    "buy-now": null,
  });
  const submitted = useRef<AddIntent>("add");
  const pending = fetcher.state !== "idle";
  const pendingIntent = fetcher.formData?.get("intent");
  const result = fetcher.data ?? flash;

  useEffect(() => {
    if (isAddIntent(pendingIntent)) submitted.current = pendingIntent;
  }, [pendingIntent]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) buttons.current[submitted.current]?.focus();
  }, [fetcher.state, fetcher.data]);

  return (
    <fetcher.Form
      method="post"
      noValidate
      aria-label={t("product.buyBlock")}
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        if (pending) event.preventDefault();
      }}
    >
      <input type="hidden" name="productId" value={productId} />
      <noscript>
        <input type="hidden" name="noJs" value="1" />
      </noscript>
      <Button
        ref={(element) => {
          buttons.current["buy-now"] = element;
        }}
        type="submit"
        name="intent"
        value="buy-now"
        disabled={!inStock}
        pending={pendingIntent === "buy-now"}
        pendingLabel={t("product.buyingNow")}
        aria-describedby="stock-status"
        className="w-full"
      >
        {t("product.buyNow")}
      </Button>
      <Button
        ref={(element) => {
          buttons.current.add = element;
        }}
        type="submit"
        name="intent"
        value="add"
        variant="secondary"
        disabled={!inStock}
        pending={pendingIntent === "add"}
        pendingLabel={t("product.adding")}
        aria-describedby="stock-status"
        className="w-full"
      >
        {t("product.addToCart")}
      </Button>
      {result?.ok && (
        // Without JavaScript the page reloads: autoFocus is the only way to hand focus to the
        // outcome (plan §3.6); with JavaScript the effect above focuses the button instead.
        // eslint-disable-next-line jsx-a11y/no-autofocus
        <p role="status" tabIndex={-1} autoFocus={Boolean(flash)} className="text-body-sm">
          {result.notice === "added-capped"
            ? t("cart.notice.addedCapped", { max: result.max ?? 0 })
            : t("cart.notice.added", { count: result.cartCount })}{" "}
          <Link to={href("/:lang/cart", { lang })}>{t("cart.viewCart")}</Link>
        </p>
      )}
      {result && !result.ok && (
        <Alert prefix={t("common.errorPrefix")}>
          {t(`errors.${ERROR_MESSAGE_KEYS[result.error]}.title`)}{" "}
          {result.error === "cart-full" && (
            <Link to={href("/:lang/cart", { lang })}>{t("cart.viewCart")}</Link>
          )}
          {result.error === "product-not-found" && (
            <Link to={href("/:lang", { lang })}>{t("errors.links.home")}</Link>
          )}
        </Alert>
      )}
    </fetcher.Form>
  );
}
