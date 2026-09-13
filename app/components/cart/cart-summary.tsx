import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { useAnnounce } from "~/components/layout/announcer";
import type { TotalsView } from "~/services/cart/types";

type CartSummaryProps = {
  totals: TotalsView;
  heading?: string;
  // Rendered between the heading and the totals (the payment page's line recap).
  lines?: React.ReactNode;
  children?: React.ReactNode;
};

export function CartSummary({ totals, heading, lines, children }: CartSummaryProps) {
  const { t } = useTranslation();
  const announce = useAnnounce();
  const previous = useRef(totals.totalFormatted);

  useEffect(() => {
    if (previous.current === totals.totalFormatted) return;
    previous.current = totals.totalFormatted;
    announce(t("cart.summary.totalUpdated", { total: totals.totalFormatted }));
  }, [totals.totalFormatted, announce, t]);

  return (
    <section
      aria-labelledby="summary-heading"
      className="flex min-w-0 flex-col gap-4 rounded-2xl border border-border p-6 lg:sticky lg:top-28 [@media(max-height:30rem)]:static"
    >
      <h2 id="summary-heading" className="text-h5 font-medium">
        {heading ?? t("cart.summary.heading")}
      </h2>
      {lines}
      <dl className="flex flex-col gap-2">
        <div className="flex justify-between gap-4">
          <dt>{t("cart.summary.subtotal")}</dt>
          <dd>{totals.subtotalFormatted}</dd>
        </div>
        {totals.discountFormatted && totals.promoCode && (
          <div className="flex justify-between gap-4">
            <dt>{t("cart.summary.discount", { code: totals.promoCode })}</dt>
            <dd>−{totals.discountFormatted}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt>{t("cart.summary.shipping")}</dt>
          <dd>{totals.isFreeShipping ? t("cart.summary.free") : totals.shippingFormatted}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-border pt-2 text-h5">
          <dt>
            <strong>{t("cart.summary.total")}</strong>
          </dt>
          <dd>
            <strong>{totals.totalFormatted}</strong>
          </dd>
        </div>
      </dl>
      {children}
    </section>
  );
}
