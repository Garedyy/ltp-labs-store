import type { ReactNode } from "react";

import { cx } from "~/lib/cx";

export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("mx-auto w-full max-w-[87rem] px-4 lg:px-6", className)}>{children}</div>
  );
}
