import { cx } from "~/lib/cx";

type DiscountBadgeProps = { percentFormatted: string; className?: string };

// Decorative: the discount is already conveyed by the struck-through original price.
export function DiscountBadge({ percentFormatted, className }: DiscountBadgeProps) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "inline-block rounded-md bg-accent px-1.5 text-body-sm font-medium text-accent-fg forced-colors:border",
        className,
      )}
    >
      {percentFormatted}
    </span>
  );
}
