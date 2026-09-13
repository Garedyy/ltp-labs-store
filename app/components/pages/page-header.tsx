import type { ReactNode } from "react";

// The one visible <h1> of a content page, with its lead paragraph.
export function PageHeader({ title, intro }: { title: string; intro: ReactNode }) {
  return (
    <header className="flex max-w-prose flex-col gap-3">
      <h1 className="text-h3 font-medium md:text-h2">{title}</h1>
      <p className="text-fg-muted">{intro}</p>
    </header>
  );
}
