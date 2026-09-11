import type { ElementType, ReactNode } from "react";

type VisuallyHiddenProps = { as?: ElementType; children: ReactNode };

export function VisuallyHidden({ as: Tag = "span", children }: VisuallyHiddenProps) {
  return <Tag className="sr-only">{children}</Tag>;
}
