import { ComingSoon } from "~/components/pages/coming-soon";
import { pageMeta } from "~/lib/meta";
import { getInstance } from "~/middleware/i18next";
import type { Route } from "./+types/cart";

// Placeholder until its feature branch lands.
export function loader({ context }: Route.LoaderArgs) {
  const t = getInstance(context).t;
  return { title: t("cart.title"), description: t("cart.description") };
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  return pageMeta({ ...loaderData, brand: matches[0].loaderData.brand });
}

export default function Cart({ loaderData }: Route.ComponentProps) {
  return <ComingSoon title={loaderData.title} />;
}
