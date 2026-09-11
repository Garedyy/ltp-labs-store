import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";

import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { ERROR_MESSAGE_KEYS } from "~/lib/error-codes";
import type { CartActionResult } from "./cart-types";

type PromoCodeFormProps = { promoCode?: string; flash?: CartActionResult };

export function PromoCodeForm({ promoCode, flash }: PromoCodeFormProps) {
  const { t } = useTranslation();
  const apply = useFetcher<CartActionResult>({ key: "promo-apply" });
  const remove = useFetcher<CartActionResult>({ key: "promo-remove" });
  const input = useRef<HTMLInputElement>(null);
  const result = apply.data ?? flash;
  const error = result && !result.ok ? result.error : null;

  useEffect(() => {
    if (apply.data && !apply.data.ok) input.current?.focus();
  }, [apply.data]);

  // After "Remove code" the input is rendered again: give it focus once it exists.
  useEffect(() => {
    if (remove.data?.ok && !promoCode) input.current?.focus();
  }, [remove.data, promoCode]);

  if (promoCode) {
    return (
      <remove.Form
        method="post"
        noValidate
        className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"
      >
        <input type="hidden" name="intent" value="remove-promo" />
        <noscript>
          <input type="hidden" name="noJs" value="1" />
        </noscript>
        <p className="font-medium">{t("cart.promo.applied", { code: promoCode })}</p>
        <Button type="submit" variant="ghost" size="sm" pending={remove.state !== "idle"}>
          {t("cart.promo.remove")}
        </Button>
      </remove.Form>
    );
  }

  return (
    <apply.Form method="post" noValidate className="border-t border-border pt-4">
      <input type="hidden" name="intent" value="apply-promo" />
      <noscript>
        <input type="hidden" name="noJs" value="1" />
      </noscript>
      <Field
        name="code"
        label={t("cart.promo.label")}
        hint={t("cart.promo.hint")}
        error={error ? t(`errors.${ERROR_MESSAGE_KEYS[error]}.title`) : undefined}
        errorPrefix={t("common.errorPrefix")}
      >
        {(ids) => (
          <div className="flex flex-wrap gap-2">
            <input
              ref={input}
              id={ids.inputId}
              name="code"
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              aria-describedby={ids.describedBy}
              aria-invalid={error ? true : undefined}
              // eslint-disable-next-line jsx-a11y/no-autofocus -- no-JS render hands focus to the invalid input
              autoFocus={Boolean(flash && !flash.ok)}
              className="min-h-11 min-w-0 flex-1 rounded-lg border border-border-strong bg-surface px-3 aria-[invalid]:border-error-border"
            />
            <Button type="submit" variant="secondary" pending={apply.state !== "idle"}>
              {t("cart.promo.apply")}
            </Button>
          </div>
        )}
      </Field>
    </apply.Form>
  );
}
