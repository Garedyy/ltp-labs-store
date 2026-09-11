import { Outlet } from "react-router";

import { RouteErrorBoundary } from "~/components/pages/route-error-boundary";
import type { Route } from "./+types/locale-errors";

// Pathless layout: leaf errors render here, inside the mounted shell of locale-layout.
export default function LocaleErrors() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <RouteErrorBoundary error={error} />;
}
