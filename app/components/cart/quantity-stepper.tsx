import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";

import { Alert } from "~/components/ui/alert";
import { Icon } from "~/components/ui/icon";
import { VisuallyHidden } from "~/components/ui/visually-hidden";
import { ERROR_MESSAGE_KEYS } from "~/lib/error-codes";
import { cx } from "~/lib/cx";
import type { CartActionResult } from "./cart-types";

const STEP_BUTTON =
  "inline-flex size-11 items-center justify-center rounded-lg text-primary hover:bg-surface-muted aria-disabled:text-fg-muted aria-disabled:hover:bg-transparent forced-colors:aria-disabled:text-[GrayText]";

type QuantityStepperProps = {
  productId: number;
  title: string;
  quantity: number;
  maxQuantity: number;
  // Result of a no-JS submission for this line, rendered with autoFocus.
  flash?: CartActionResult;
};

// One form per line; every submit carries an absolute quantity so rapid clicks are idempotent.
export function QuantityStepper({
  productId,
  title,
  quantity,
  maxQuantity,
  flash,
}: QuantityStepperProps) {
  const { t } = useTranslation();
  const fetcher = useFetcher<CartActionResult>({ key: `quantity-${productId}` });
  const input = useRef<HTMLInputElement>(null);
  // The value shown while a submission is pending; an invalid value never changes it (and never
  // remounts the input through its key, so focus stays where it is).
  const inFlight = String(
    fetcher.formData?.get("setQuantity") ?? fetcher.formData?.get("quantity") ?? "",
  );
  const shown = /^\d+$/.test(inFlight) ? Number(inFlight) : quantity;
  const result = fetcher.data ?? flash;
  const error = result && !result.ok ? result.error : null;

  // Focus once the revalidation settled, so no re-render can steal it back.
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && !fetcher.data.ok) input.current?.focus();
  }, [fetcher.state, fetcher.data]);

  return (
    <fetcher.Form
      method="post"
      noValidate
      aria-label={t("cart.items.quantityLabel", { title })}
      className="flex flex-col gap-1"
    >
      <input type="hidden" name="intent" value="set-quantity" />
      <input type="hidden" name="productId" value={productId} />
      <noscript>
        <input type="hidden" name="noJs" value="1" />
      </noscript>
      <VisuallyHidden>
        <button type="submit">{t("cart.items.update")}</button>
      </VisuallyHidden>
      <div className="flex items-center gap-2">
        <label
          id={`quantity-label-${productId}`}
          htmlFor={`quantity-${productId}`}
          className="text-body-sm"
        >
          {t("cart.items.quantityShort")}
        </label>
        <div className="inline-flex items-center rounded-lg border border-border-strong">
          <button
            type="submit"
            name="setQuantity"
            value={shown - 1}
            aria-label={t("cart.items.decrease", { title })}
            aria-disabled={shown <= 1 || undefined}
            onClick={(event) => {
              if (shown <= 1) event.preventDefault();
            }}
            className={STEP_BUTTON}
          >
            <Icon name="minus" className="size-4" />
          </button>
          <input
            ref={input}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            name="quantity"
            id={`quantity-${productId}`}
            key={shown}
            defaultValue={shown}
            aria-labelledby={`quantity-label-${productId} line-title-${productId}`}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `quantity-error-${productId}` : undefined}
            // eslint-disable-next-line jsx-a11y/no-autofocus -- no-JS render hands focus to the invalid input
            autoFocus={Boolean(flash && !flash.ok)}
            // Native change semantics: submit when the field is left (Enter uses the hidden submit).
            onBlur={(event) => {
              if (event.currentTarget.value !== String(shown))
                fetcher.submit(event.currentTarget.form);
            }}
            className={cx(
              "min-h-11 w-14 border-x border-border-strong bg-surface text-center",
              error && "border-error-border",
            )}
          />
          <button
            type="submit"
            name="setQuantity"
            value={shown + 1}
            aria-label={t("cart.items.increase", { title })}
            aria-disabled={shown >= maxQuantity || undefined}
            onClick={(event) => {
              if (shown >= maxQuantity) event.preventDefault();
            }}
            className={STEP_BUTTON}
          >
            <Icon name="plus" className="size-4" />
          </button>
        </div>
      </div>
      {error && (
        <Alert prefix={t("common.errorPrefix")}>
          <span id={`quantity-error-${productId}`}>
            {t(`errors.${ERROR_MESSAGE_KEYS[error]}.title`)}
          </span>
        </Alert>
      )}
    </fetcher.Form>
  );
}
