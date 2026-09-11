import type { ReactNode } from "react";

import { cx } from "~/lib/cx";
import { Icon } from "./icon";
import { VisuallyHidden } from "./visually-hidden";

type AlertProps = { prefix: ReactNode; children: ReactNode; className?: string };

export function Alert({ prefix, children, className }: AlertProps) {
  return (
    <div
      role="alert"
      className={cx(
        "flex items-start gap-2 rounded-lg border border-error-border bg-surface p-3 text-body-sm text-error forced-colors:border",
        className,
      )}
    >
      <Icon name="error" className="mt-0.5 size-5 shrink-0" />
      <div>
        <VisuallyHidden>{prefix}</VisuallyHidden> {children}
      </div>
    </div>
  );
}
