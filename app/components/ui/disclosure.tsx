import { type ReactNode, useEffect, useRef } from "react";

import { cx } from "~/lib/cx";

type DisclosureProps = {
  summary: ReactNode;
  summaryLabel?: string;
  summaryClassName?: string;
  className?: string;
  children: ReactNode;
};

// Native <details>: Enter/Space and aria-expanded come for free. JS adds Escape, outside-click and
// closing when focus leaves, so an open panel never covers the element that receives focus.
export function Disclosure({
  summary,
  summaryLabel,
  summaryClassName,
  className,
  children,
}: DisclosureProps) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const details = ref.current;
    if (!details) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || !details?.open) return;
      event.stopPropagation();
      details.open = false;
      details.querySelector("summary")?.focus();
    }
    function onPointerDown(event: PointerEvent) {
      if (details?.open && !details.contains(event.target as Node)) details.open = false;
    }
    function onFocusOut(event: FocusEvent) {
      const next = event.relatedTarget;
      if (details?.open && next instanceof Node && !details.contains(next)) details.open = false;
    }

    details.addEventListener("keydown", onKeyDown);
    details.addEventListener("focusout", onFocusOut);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      details.removeEventListener("keydown", onKeyDown);
      details.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <details ref={ref} className={cx("group", className)}>
      <summary
        aria-label={summaryLabel}
        className={cx(
          "cursor-pointer list-none [&::-webkit-details-marker]:hidden",
          summaryClassName,
        )}
      >
        {summary}
      </summary>
      {children}
    </details>
  );
}
