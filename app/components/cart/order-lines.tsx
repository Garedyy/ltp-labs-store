import { useTranslation } from "react-i18next";

import { useLocale } from "~/i18n/use-locale";
import type { CartLineView } from "~/services/cart/types";

// Read-only recap of the lines being paid; quantities are edited on the cart page.
export function OrderLines({ lines }: { lines: CartLineView[] }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const lang = locale === "en" ? undefined : "en";
  return (
    <ul aria-label={t("cart.items.heading")} className="flex flex-col gap-3">
      {lines.map((line) => (
        <li key={line.productId} className="flex items-center gap-3">
          <img
            src={line.thumbnail}
            alt=""
            width={48}
            height={48}
            loading="lazy"
            className="size-12 shrink-0 rounded-lg bg-surface-placeholder object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium" lang={lang}>
              {line.title}
            </p>
            <p className="text-body-sm text-fg-muted">
              {t("cart.items.quantityShort")} {line.quantity}
            </p>
          </div>
          <p className="shrink-0">{line.linePriceFormatted}</p>
        </li>
      ))}
    </ul>
  );
}
