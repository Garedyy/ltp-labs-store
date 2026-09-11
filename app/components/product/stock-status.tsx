import { useTranslation } from "react-i18next";

import { Icon } from "~/components/ui/icon";
import { cx } from "~/lib/cx";

const LOW_STOCK_THRESHOLD = 10;

// Icon + text, never colour alone. The id lets the Add-to-cart button describe itself with it.
export function StockStatus({ stock, id = "stock-status" }: { stock: number; id?: string }) {
  const { t } = useTranslation();
  const out = stock <= 0;
  const low = !out && stock < LOW_STOCK_THRESHOLD;
  const text = out
    ? t("product.stock.out")
    : low
      ? t("product.stock.low", { count: stock })
      : t("product.stock.inStock");
  return (
    <p
      id={id}
      className={cx("flex items-center gap-2 text-body-sm", out ? "text-error" : "text-success")}
    >
      <Icon name={out ? "error" : low ? "warning" : "check"} className="size-4" />
      {text}
    </p>
  );
}
