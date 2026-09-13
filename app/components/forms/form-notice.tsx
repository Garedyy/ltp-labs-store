import { type ReactNode, useEffect, useRef } from "react";

import { cx } from "~/lib/cx";

// Outcome of a submission rendered by a loader or a flash: receives focus so it is read out. The
// no-JS document lands on it through `autofocus`; with JavaScript the element mounts after the
// navigation and React only auto-focuses form controls, hence the effect.
export function FormNotice({ children, className }: { children: ReactNode; className?: string }) {
  const notice = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    notice.current?.focus();
  }, []);
  return (
    <p
      ref={notice}
      role="status"
      tabIndex={-1}
      // eslint-disable-next-line jsx-a11y/no-autofocus -- the outcome takes the focus by design
      autoFocus
      className={cx("rounded-lg border border-border bg-surface-muted p-3", className)}
    >
      {children}
    </p>
  );
}
