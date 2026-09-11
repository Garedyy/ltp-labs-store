import type { ReactNode } from "react";

// First focusable element in <body>; visible only when focused.
export function SkipLink({ children }: { children: ReactNode }) {
  return (
    <a
      href="#main"
      className="sr-only rounded-xl bg-primary px-5 py-3 font-medium text-primary-fg no-underline focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50"
    >
      {children}
    </a>
  );
}
