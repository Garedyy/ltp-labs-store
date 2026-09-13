import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, useNavigation } from "react-router";

import { TextField } from "~/components/forms/text-field";
import { useFocusFirstInvalid } from "~/components/forms/use-focus-first-invalid";
import { Button } from "~/components/ui/button";
import { Select } from "~/components/ui/select";
import { fieldProps, type FormFailure } from "~/lib/forms";
import { COUNTRIES } from "~/services/cart/countries";
import type { PaymentMethod } from "~/services/cart/types";

export const CHECKOUT_FIELDS = [
  "email",
  "name",
  "address",
  "postalCode",
  "city",
  "country",
  "cardName",
  "cardNumber",
  "cardExpiry",
  "cardCode",
] as const;
export type CheckoutField = (typeof CHECKOUT_FIELDS)[number];
export type CheckoutResult = FormFailure<CheckoutField> & { method: PaymentMethod };

type CheckoutFormProps = {
  totalFormatted: string;
  initialMethod: PaymentMethod;
  productId?: number;
  result?: CheckoutResult;
};

const RADIO = "flex min-h-11 items-center gap-3";
const RADIO_INPUT = "size-5 shrink-0 accent-primary";

// A navigation form: the action answers 303 to the confirmation or 400 with the field codes. With
// JavaScript the card fields fold away when PayPal is chosen; without it they stay visible and
// the server ignores them for PayPal.
export function CheckoutForm({
  totalFormatted,
  initialMethod,
  productId,
  result,
}: CheckoutFormProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const pending = navigation.formData?.get("intent") === "place-order";
  const [method, setMethod] = useState<PaymentMethod>(result?.method ?? initialMethod);
  useFocusFirstInvalid(result);
  const fields = fieldProps(CHECKOUT_FIELDS, result);
  const countries = COUNTRIES.map((code) => ({
    value: code,
    label: t(`cart.checkout.countries.${code}`),
  }));

  return (
    <Form
      method="post"
      noValidate
      aria-labelledby="payment-heading"
      className="flex flex-col gap-8"
    >
      <input type="hidden" name="intent" value="place-order" />
      {productId !== undefined && <input type="hidden" name="product" value={productId} />}
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-4 text-h5 font-medium">{t("cart.checkout.contact")}</legend>
        <TextField
          {...fields.email}
          label={t("cart.checkout.email")}
          type="email"
          autoComplete="email"
          inputMode="email"
        />
      </fieldset>
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-4 text-h5 font-medium">{t("cart.checkout.shipping")}</legend>
        <TextField {...fields.name} label={t("cart.checkout.name")} autoComplete="name" />
        <TextField
          {...fields.address}
          label={t("cart.checkout.address")}
          autoComplete="address-line1"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            {...fields.postalCode}
            label={t("cart.checkout.postalCode")}
            autoComplete="postal-code"
          />
          <TextField
            {...fields.city}
            label={t("cart.checkout.city")}
            autoComplete="address-level2"
          />
        </div>
        <Select
          id="checkout-country"
          name="country"
          label={t("cart.checkout.country")}
          options={countries}
          defaultValue={result?.values.country ?? COUNTRIES[0]}
          autoComplete="country"
          className="flex-col items-start gap-1 [&>span]:w-full"
        />
      </fieldset>
      <fieldset className="flex flex-col gap-1">
        <legend className="mb-4 text-h5 font-medium">{t("cart.checkout.method")}</legend>
        <label className={RADIO}>
          <input
            type="radio"
            name="method"
            value="card"
            checked={method === "card"}
            onChange={() => setMethod("card")}
            className={RADIO_INPUT}
          />
          {t("cart.checkout.card")}
        </label>
        <label className={RADIO}>
          <input
            type="radio"
            name="method"
            value="paypal"
            checked={method === "paypal"}
            onChange={() => setMethod("paypal")}
            className={RADIO_INPUT}
          />
          {t("cart.checkout.paypal")}
        </label>
        {method === "paypal" && (
          <p className="text-body-sm text-fg-muted">{t("cart.checkout.paypalNote")}</p>
        )}
      </fieldset>
      <fieldset hidden={method === "paypal"} className="flex flex-col gap-4">
        <legend className="mb-4 text-h5 font-medium">{t("cart.checkout.cardDetails")}</legend>
        <TextField
          {...fields.cardName}
          label={t("cart.checkout.cardName")}
          autoComplete="cc-name"
        />
        <TextField
          {...fields.cardNumber}
          label={t("cart.checkout.cardNumber")}
          autoComplete="cc-number"
          inputMode="numeric"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            {...fields.cardExpiry}
            label={t("cart.checkout.cardExpiry")}
            autoComplete="cc-exp"
            inputMode="numeric"
          />
          <TextField
            {...fields.cardCode}
            label={t("cart.checkout.cardCode")}
            autoComplete="cc-csc"
            inputMode="numeric"
          />
        </div>
      </fieldset>
      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          pending={pending}
          pendingLabel={t("cart.checkout.paying")}
          aria-describedby="checkout-demo-note"
          className="w-full sm:w-auto sm:self-start"
        >
          {t("cart.checkout.pay", { total: totalFormatted })}
        </Button>
        <p id="checkout-demo-note" className="text-body-sm text-fg-muted">
          {t("cart.summary.demoNote")}
        </p>
      </div>
    </Form>
  );
}
