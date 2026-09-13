import type { HTMLInputAutoCompleteAttribute, HTMLInputTypeAttribute, ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Field } from "~/components/ui/field";
import { cx } from "~/lib/cx";
import { ERROR_MESSAGE_KEYS, type ErrorCode } from "~/lib/error-codes";

export const INPUT_CLASS =
  "min-h-11 w-full rounded-lg border border-border-strong bg-surface px-3 text-fg aria-[invalid]:border-error-border";

type TextFieldProps = {
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ErrorCode;
  defaultValue?: string;
  type?: HTMLInputTypeAttribute;
  autoComplete?: HTMLInputAutoCompleteAttribute;
  inputMode?: "text" | "email" | "numeric" | "tel";
  multiline?: boolean;
  // Set on the first invalid field so the no-JS render lands the focus on it.
  autoFocus?: boolean;
  className?: string;
};

// A labelled text control with the server-side error code rendered under it.
export function TextField({
  name,
  label,
  hint,
  error,
  defaultValue,
  type = "text",
  autoComplete,
  inputMode,
  multiline = false,
  autoFocus = false,
  className,
}: TextFieldProps) {
  const { t } = useTranslation();
  return (
    <Field
      name={name}
      label={label}
      hint={hint}
      error={error ? t(`errors.${ERROR_MESSAGE_KEYS[error]}.title`) : undefined}
      errorPrefix={t("common.errorPrefix")}
      className={className}
    >
      {(ids) =>
        multiline ? (
          <textarea
            id={ids.inputId}
            name={name}
            rows={5}
            defaultValue={defaultValue}
            autoComplete={autoComplete}
            // Same name as the <label for>; the IBM checker only credits a visible label to a
            // textarea through aria-labelledby (input_label_visible).
            aria-labelledby={ids.labelId}
            aria-describedby={ids.describedBy}
            aria-invalid={error ? true : undefined}
            // eslint-disable-next-line jsx-a11y/no-autofocus -- no-JS render hands focus to the invalid field
            autoFocus={autoFocus}
            className={cx(INPUT_CLASS, "py-2")}
          />
        ) : (
          <input
            id={ids.inputId}
            name={name}
            type={type}
            defaultValue={defaultValue}
            autoComplete={autoComplete}
            inputMode={inputMode}
            aria-describedby={ids.describedBy}
            aria-invalid={error ? true : undefined}
            // eslint-disable-next-line jsx-a11y/no-autofocus -- no-JS render hands focus to the invalid field
            autoFocus={autoFocus}
            className={INPUT_CLASS}
          />
        )
      }
    </Field>
  );
}
