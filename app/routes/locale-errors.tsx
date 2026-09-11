import { Outlet } from "react-router";

import { RouteErrorBoundary, statusOf } from "~/components/pages/route-error-boundary";
import { pageMeta } from "~/lib/meta";
import { getInstance } from "~/middleware/i18next";
import type { Route } from "./+types/locale-errors";
import { revalidateOnPathnameOrSubmit } from "~/lib/revalidate";

// Pathless layout: leaf errors render here, inside the mounted shell of locale-layout. Its loader
// only supplies translated titles so an errored leaf still gets a <title>.
export const shouldRevalidate = revalidateOnPathnameOrSubmit;

export function loader({ context }: Route.LoaderArgs) {
  const t = getInstance(context).t;
  return {
    errorTitles: {
      notFound: t("errors.notFound.title"),
      productNotFound: t("errors.productNotFound.title"),
      serviceUnavailable: t("errors.serviceUnavailable.title"),
      badRequest: t("errors.badRequest.title"),
      methodNotAllowed: t("errors.methodNotAllowed.title"),
      unexpected: t("errors.unexpected.title"),
    },
  };
}

export function meta({ error, loaderData, matches }: Route.MetaArgs) {
  if (!error || !loaderData) return [];
  return pageMeta({
    title: loaderData.errorTitles[statusOf(error)],
    brand: matches[0].loaderData.brand,
  });
}

export default function LocaleErrors() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <RouteErrorBoundary error={error} />;
}
