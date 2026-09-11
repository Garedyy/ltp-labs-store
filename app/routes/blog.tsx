import { ComingSoon } from "~/components/pages/coming-soon";
import { pageMeta } from "~/lib/meta";
import { getInstance } from "~/middleware/i18next";
import type { Route } from "./+types/blog";

export function loader({ context }: Route.LoaderArgs) {
  const t = getInstance(context).t;
  return { title: t("pages.blog.title"), description: t("pages.blog.description") };
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  return pageMeta({ ...loaderData, brand: matches[0].loaderData.brand });
}

export default function Blog({ loaderData }: Route.ComponentProps) {
  return <ComingSoon title={loaderData.title} />;
}
