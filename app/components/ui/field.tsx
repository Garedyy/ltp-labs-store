import { type ReactNode, useId } from "react";

import { cx } from "~/lib/cx";
import { Icon } from "./icon";
import { VisuallyHidden } from "./visually-hidden";

export type FieldIds = {
  inputId: string;
  labelId: string;
  hintId: string;
  errorId: string;
  describedBy: string | undefined;
};

export function useFieldIds(name: string, { hint, error }: { hint?: boolean; error?: boolean }) {
  const base = `${useId()}-${name}`;
  const hintId = `${base}-hint`;
  const errorId = `${base}-error`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined;
  return { inputId: `${base}-input`, labelId: `${base}-label`, hintId, errorId, describedBy };
}

type FieldProps = {
  name: string;
  label: ReactNode;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  errorPrefix: ReactNode;
  className?: string;
  children: (ids: FieldIds) => ReactNode;
};

// Render-prop instead of cloneElement: the control decides how it consumes the ids.
export function Field({
  name,
  label,
  hideLabel = false,
  hint,
  error,
  errorPrefix,
  className,
  children,
}: FieldProps) {
  const ids = useFieldIds(name, { hint: Boolean(hint), error: Boolean(error) });
  return (
    <div className={cx("flex flex-col gap-1", className)}>
      <label
        id={ids.labelId}
        htmlFor={ids.inputId}
        className={cx("font-medium", hideLabel && "sr-only")}
      >
        {label}
      </label>
      {hint && (
        <p id={ids.hintId} className="text-body-sm text-fg-muted">
          {hint}
        </p>
      )}
      {children(ids)}
      {error && (
        <p id={ids.errorId} role="alert" className="flex items-start gap-1 text-body-sm text-error">
          <Icon name="error" className="mt-0.5 size-4 shrink-0" />
          <VisuallyHidden>{errorPrefix}</VisuallyHidden> <span>{error}</span>
        </p>
      )}
    </div>
  );
}
