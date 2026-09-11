import type { ReactNode, SelectHTMLAttributes } from "react";

import { cx } from "~/lib/cx";
import { Icon } from "./icon";

export type SelectOption = { value: string; label: ReactNode };

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: ReactNode;
  hideLabel?: boolean;
  options: SelectOption[];
};

export function Select({
  id,
  label,
  hideLabel = false,
  options,
  className,
  ...props
}: SelectProps) {
  return (
    <div className={cx("flex max-w-full min-w-0 flex-wrap items-center gap-2", className)}>
      <label htmlFor={id} className={cx("font-medium", hideLabel && "sr-only")}>
        {label}
      </label>
      <span className="relative max-w-full min-w-0">
        <select
          id={id}
          className="min-h-11 w-full max-w-full appearance-none rounded-lg border border-border-strong bg-surface ps-3 pe-9 text-fg"
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          name="chevronDown"
          className="pointer-events-none absolute end-2 top-1/2 size-5 -translate-y-1/2"
        />
      </span>
    </div>
  );
}
