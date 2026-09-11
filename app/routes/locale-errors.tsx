import { Outlet } from "react-router";

import {
  type ErrorMessageKey,
  RouteErrorBoundary,
  statusOf,
} from "~/components/pages/route-error-boundary";
import { pageMeta } from "~/lib/meta";
import { getInstance } from "~/middleware/i18next";
import type { Route } from "./+types/locale-errors";
import { revalidateOnPathnameOrSubmit } from "~/lib/revalidate";

// Pathless layout: leaf errors render here, inside the mounted shell of locale-layout. Its loader
// only supplies translated titles so an errored leaf still gets a <title>.
export const shouldRevalidate = revalidateOnPathnameOrSubmit;

const TITLE_KEYS = [
  "notFound",
  "productNotFound",
  "serviceUnavailable",
  "badRequest",
  "methodNotAllowed",
  "unexpected",
  "invalidIntent",
  "invalidQuantity",
  "outOfStock",
  "cartFull",
  "promoRequired",
  "promoInvalid",
  "emptyCart",
] as const satisfies readonly ErrorMessageKey[];

export function loader({ context }: Route.LoaderArgs) {
  const t = getInstance(context).t;
  const errorTitles = Object.fromEntries(
    TITLE_KEYS.map((key) => [key, t(`errors.${key}.title`)]),
  ) as Record<ErrorMessageKey, string>;
  return { errorTitles };
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
