import type { ButtonHTMLAttributes, ComponentProps, ReactNode, Ref } from "react";
import { Link } from "react-router";

import { cx } from "~/lib/cx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "icon";
type ButtonSize = "md" | "sm";

const BASE =
  "inline-flex items-center justify-center gap-2 no-underline font-medium text-tagline motion-safe:transition motion-safe:duration-150 active:scale-[0.97] forced-colors:border";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "rounded-xl bg-primary text-primary-fg hover:bg-primary-hover disabled:bg-fg-muted",
  secondary:
    "rounded-xl border border-border-strong bg-surface text-primary hover:bg-surface-muted disabled:text-fg-muted",
  ghost: "rounded-lg text-primary hover:bg-surface-muted disabled:text-fg-muted",
  icon: "size-11 rounded-xl border border-border-strong bg-surface text-primary hover:bg-surface-muted",
};

// Both sizes keep the 44 px target; sm only tightens the horizontal padding.
const SIZES: Record<ButtonSize, string> = {
  md: "min-h-11 px-5 py-2",
  sm: "min-h-11 px-3 py-1",
};

function buttonClasses(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cx(BASE, VARIANTS[variant], variant === "icon" ? undefined : SIZES[size], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: Ref<HTMLButtonElement>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  pending?: boolean;
  pendingLabel?: ReactNode;
};

// Pending buttons stay enabled (focus is kept) and expose aria-busy; only out-of-stock uses disabled.
export function Button({
  variant = "primary",
  size = "md",
  pending = false,
  pendingLabel,
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      aria-busy={pending || undefined}
      className={buttonClasses(variant, size, className)}
      {...props}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
