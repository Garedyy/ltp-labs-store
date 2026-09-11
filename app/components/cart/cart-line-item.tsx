import { useTranslation } from "react-i18next";
import { Link, useFetcher } from "react-router";

import { Icon } from "~/components/ui/icon";
import { VisuallyHidden } from "~/components/ui/visually-hidden";
import { useLocale } from "~/i18n/use-locale";
import type { CartLineView } from "~/services/cart/types";
import type { CartActionResult } from "./cart-types";
import { QuantityStepper } from "./quantity-stepper";

type CartLineItemProps = { item: CartLineView; flash?: CartActionResult };

export function CartLineItem({ item, flash }: CartLineItemProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const lang = locale === "en" ? undefined : "en";
  // Keyed so the cart page can read the result even after this line unmounts.
  const remove = useFetcher<CartActionResult>({ key: `remove-${item.productId}` });
  const removing = remove.state !== "idle";

  return (
    <li
      aria-busy={removing || undefined}
      data-product-id={item.productId}
      className="grid grid-cols-[5rem_1fr] gap-4 py-6 sm:grid-cols-[7rem_1fr_auto]"
    >
      <img
        src={item.thumbnail}
        alt=""
        width={112}
        height={112}
        loading="lazy"
        className="size-20 rounded-xl bg-surface-placeholder object-contain sm:size-28"
      />
      <div className="flex min-w-0 flex-col gap-2">
        <h2 className="text-body font-medium">
          <Link id={`line-title-${item.productId}`} to={item.href} lang={lang} prefetch="intent">
            {item.title}
          </Link>
        </h2>
        <p className="text-body-sm text-fg-muted">
          <VisuallyHidden>{t("cart.items.unitPrice")}</VisuallyHidden> {item.unitPriceFormatted}
        </p>
        <QuantityStepper
          productId={item.productId}
          title={item.title}
          quantity={item.quantity}
          maxQuantity={item.maxQuantity}
          flash={flash}
        />
      </div>
      <div className="col-start-2 flex items-center justify-between gap-4 sm:col-start-3 sm:flex-col sm:items-end">
        <p className="font-medium">
          <VisuallyHidden>{t("cart.items.lineTotal")}</VisuallyHidden> {item.linePriceFormatted}
        </p>
        <remove.Form
          method="post"
          noValidate
          aria-label={t("cart.items.remove", { title: item.title })}
        >
          <input type="hidden" name="intent" value="remove" />
          <input type="hidden" name="productId" value={item.productId} />
          <noscript>
            <input type="hidden" name="noJs" value="1" />
          </noscript>
          <button
            type="submit"
            aria-label={t("cart.items.remove", { title: item.title })}
            aria-busy={removing || undefined}
            data-remove={item.productId}
            className="inline-flex size-11 items-center justify-center rounded-xl border border-border-strong text-primary hover:bg-surface-muted forced-colors:border"
          >
            <Icon name="trash" />
          </button>
        </remove.Form>
      </div>
    </li>
  );
}
