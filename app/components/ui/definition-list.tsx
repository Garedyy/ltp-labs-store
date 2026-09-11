import type { ReactNode } from "react";

import { cx } from "~/lib/cx";

export type DefinitionItem = {
  key: string;
  term: ReactNode;
  description: ReactNode;
  lang?: string;
};

type DefinitionListProps = { items: DefinitionItem[]; className?: string };

// <div> row wrappers are valid inside <dl> and give each pair a layout box.
export function DefinitionList({ items, className }: DefinitionListProps) {
  return (
    <dl className={cx("grid gap-3 sm:grid-cols-[auto_1fr] sm:gap-x-6", className)}>
      {items.map((item) => (
        <div key={item.key} className="contents">
          <dt className="font-medium">{item.term}</dt>
          <dd lang={item.lang}>{item.description}</dd>
        </div>
      ))}
    </dl>
  );
}
