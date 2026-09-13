import type { ComponentProps } from "react";
import { Link } from "react-router";

import { Icon } from "~/components/ui/icon";
import { cx } from "~/lib/cx";

type BackLinkProps = ComponentProps<typeof Link>;

// A fixed-destination link (never history.back(), so it works without JS) shown above the h1.
// The chevron mirrors in a right-to-left locale; -ms-1 lines the glyph up with the text margin.
export function BackLink({ className, children, ...props }: BackLinkProps) {
  return (
    <Link
      prefetch="intent"
      className={cx(
        "-ms-1 inline-flex min-h-11 items-center gap-1 self-start pe-2 text-tagline font-medium text-primary no-underline hover:underline",
        className,
      )}
      {...props}
    >
      <Icon name="chevronLeft" className="size-5 shrink-0 rtl:-scale-x-100" />
      {children}
    </Link>
  );
}
