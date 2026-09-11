import { ComingSoon } from "~/components/pages/coming-soon";
import { pageMeta } from "~/lib/meta";
import { getInstance } from "~/middleware/i18next";
import type { Route } from "./+types/account";

export function loader({ context }: Route.LoaderArgs) {
  const t = getInstance(context).t;
  return { title: t("pages.account.title"), description: t("pages.account.description") };
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  return pageMeta({ ...loaderData, brand: matches[0].loaderData.brand });
}

export default function Account({ loaderData }: Route.ComponentProps) {
  return <ComingSoon title={loaderData.title} />;
}
