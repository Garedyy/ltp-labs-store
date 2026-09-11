import { cx } from "~/lib/cx";
import { Icon } from "./icon";
import { VisuallyHidden } from "./visually-hidden";

type RatingProps = {
  value: number;
  valueFormatted: string;
  label: string;
  className?: string;
};

const STARS = [1, 2, 3, 4, 5] as const;

// Stars are decorative; the visible number and the sr label carry the information.
export function Rating({ value, valueFormatted, label, className }: RatingProps) {
  return (
    <span className={cx("inline-flex items-center gap-1", className)}>
      <span aria-hidden="true" className="inline-flex">
        {STARS.map((star) => (
          <Icon
            key={star}
            name="star"
            className={cx("size-4", star <= Math.round(value) ? "text-accent" : "text-border")}
          />
        ))}
      </span>
      <span aria-hidden="true" className="text-body-sm">
        {valueFormatted}
      </span>
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  );
}
