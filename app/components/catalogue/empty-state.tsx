import type { ReactNode } from "react";

type EmptyStateProps = { title: ReactNode; body?: ReactNode; action?: ReactNode };

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-border p-8 text-center">
      <h2 className="text-h5 font-medium">{title}</h2>
      {body && <p className="mt-2 text-fg-muted">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
