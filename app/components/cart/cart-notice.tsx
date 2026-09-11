import type { ReactNode } from "react";

// Rendered only on no-JS renders (flash notice): receives focus so the outcome is read out.
export function CartNotice({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      tabIndex={-1}
      // eslint-disable-next-line jsx-a11y/no-autofocus -- no-JS render hands focus to the notice
      autoFocus
      className="rounded-lg border border-border bg-surface-muted p-3"
    >
      {children}
    </p>
  );
}
