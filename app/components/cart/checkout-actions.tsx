import { useTranslation } from "react-i18next";
import { href } from "react-router";

import { ButtonLink } from "~/components/ui/button";
import { useLocale } from "~/i18n/use-locale";

// Both buttons open the payment page; PayPal only preselects the method there (URL as state).
export function CheckoutActions() {
  const { t } = useTranslation();
  const lang = useLocale();
  const checkout = href("/:lang/checkout", { lang });
  return (
    <div className="flex flex-col gap-3">
      <ButtonLink to={checkout} aria-describedby="checkout-demo-note" className="w-full">
        {t("cart.summary.checkout")}
      </ButtonLink>
      <ButtonLink
        to={`${checkout}?method=paypal`}
        variant="secondary"
        aria-describedby="checkout-demo-note"
        className="w-full"
      >
        {t("cart.summary.paypal")}
      </ButtonLink>
      <p id="checkout-demo-note" className="text-body-sm text-fg-muted">
        {t("cart.summary.demoNote")}
      </p>
    </div>
  );
}
