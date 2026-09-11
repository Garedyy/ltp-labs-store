import { type ReactNode, useEffect, useRef } from "react";

import { cx } from "~/lib/cx";

type DisclosureProps = {
  summary: ReactNode;
  summaryLabel?: string;
  summaryClassName?: string;
  className?: string;
  children: ReactNode;
};

// Native <details>: Enter/Space and aria-expanded come for free. JS adds Escape and outside-click.
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
      details.open = false;
      details.querySelector("summary")?.focus();
    }
    function onPointerDown(event: PointerEvent) {
      if (details?.open && !details.contains(event.target as Node)) details.open = false;
    }

    details.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      details.removeEventListener("keydown", onKeyDown);
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
