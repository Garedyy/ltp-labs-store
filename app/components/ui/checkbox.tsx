import type { InputHTMLAttributes, ReactNode } from "react";

import { cx } from "~/lib/cx";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  labelClassName?: string;
};

// 20 px box inside a 44 px label row so the whole row is the touch target.
export function Checkbox({ label, className, labelClassName, ...props }: CheckboxProps) {
  return (
    <label className={cx("flex min-h-11 cursor-pointer items-center gap-3", labelClassName)}>
      <input
        type="checkbox"
        className={cx("size-5 shrink-0 accent-primary", className)}
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
