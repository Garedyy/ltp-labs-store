import { data } from "react-router";

import { ErrorPage } from "~/components/pages/error-page";
import { pageMeta } from "~/lib/meta";
import { getInstance } from "~/middleware/i18next";
import type { Route } from "./+types/not-found";

export function loader({ context }: Route.LoaderArgs) {
  const t = getInstance(context).t;
  return data(
    { title: t("errors.notFound.title"), description: t("errors.notFound.description") },
    { status: 404 },
  );
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  return pageMeta({ title: loaderData.title, brand: matches[0].loaderData.brand });
}

export default function NotFound({ loaderData }: Route.ComponentProps) {
  return <ErrorPage status={404} title={loaderData.title} description={loaderData.description} />;
}
