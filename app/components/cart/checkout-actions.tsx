import { useTranslation } from "react-i18next";
import { Form } from "react-router";

import { Button } from "~/components/ui/button";

// Both buttons share the checkout intent; the whole form is a full navigation to the confirmation.
export function CheckoutActions() {
  const { t } = useTranslation();
  return (
    <Form
      method="post"
      noValidate
      aria-label={t("cart.summary.checkout")}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="intent" value="checkout" />
      <noscript>
        <input type="hidden" name="noJs" value="1" />
      </noscript>
      <Button
        type="submit"
        name="payment"
        value="card"
        aria-describedby="checkout-demo-note"
        className="w-full"
      >
        {t("cart.summary.checkout")}
      </Button>
      <Button
        type="submit"
        name="payment"
        value="paypal"
        variant="secondary"
        aria-describedby="checkout-demo-note"
        className="w-full"
      >
        {t("cart.summary.paypal")}
      </Button>
      <p id="checkout-demo-note" className="text-body-sm text-fg-muted">
        {t("cart.summary.demoNote")}
      </p>
    </Form>
  );
}
