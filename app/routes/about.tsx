import { AboutPage } from "~/components/pages/about-page";
import { pageMeta } from "~/lib/meta";
import { getInstance } from "~/middleware/i18next";
import type { Route } from "./+types/about";

export function loader({ context }: Route.LoaderArgs) {
  const t = getInstance(context).t;
  return { title: t("pages.about.title"), description: t("pages.about.description") };
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  return pageMeta({ ...loaderData, brand: matches[0].loaderData.brand });
}

export default function About({ loaderData }: Route.ComponentProps) {
  return <AboutPage title={loaderData.title} />;
}
