import type { ReactNode } from "react";

type ErrorPageProps = {
  status: number;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function ErrorPage({ status, title, description, actions }: ErrorPageProps) {
  return (
    <div className="mx-auto max-w-prose py-8 text-center">
      <p className="text-tagline text-fg-muted">{status}</p>
      <h1 className="mt-2 text-h2 md:text-h1">{title}</h1>
      {description && <p className="mt-4">{description}</p>}
      {actions && <div className="mt-8 flex flex-wrap justify-center gap-3">{actions}</div>}
    </div>
  );
}
