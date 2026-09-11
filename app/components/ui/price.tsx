import { cx } from "~/lib/cx";
import { VisuallyHidden } from "./visually-hidden";

type PriceProps = {
  priceFormatted: string;
  originalPriceFormatted?: string;
  labels: { price: string; originalPrice: string };
  className?: string;
};

// Never colour alone: the original price is struck through and named for screen readers.
export function Price({ priceFormatted, originalPriceFormatted, labels, className }: PriceProps) {
  return (
    <span className={cx("inline-flex flex-wrap items-baseline gap-x-2", className)}>
      <VisuallyHidden>{labels.price}</VisuallyHidden>
      <span className="font-medium">{priceFormatted}</span>
      {originalPriceFormatted && (
        <>
          <VisuallyHidden>{labels.originalPrice}</VisuallyHidden>
          <s aria-hidden="true" className="text-body-sm text-fg-muted">
            {originalPriceFormatted}
          </s>
          <VisuallyHidden>{originalPriceFormatted}</VisuallyHidden>
        </>
      )}
    </span>
  );
}
