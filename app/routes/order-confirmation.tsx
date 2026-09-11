import { useTranslation } from "react-i18next";
import { href, redirect } from "react-router";

import { ButtonLink } from "~/components/ui/button";
import { DefinitionList } from "~/components/ui/definition-list";
import { isLocale } from "~/i18n/config";
import { useLocale } from "~/i18n/use-locale";
import { notFound } from "~/lib/http";
import { pageMeta } from "~/lib/meta";
import { getInstance, getLocale } from "~/middleware/i18next";
import { getCartSession } from "~/services/cart/session.server";
import type { Route } from "./+types/order-confirmation";

// lastOrder persists until the next cart mutation, so reloads and language switches keep it.
export async function loader({ context, request }: Route.LoaderArgs) {
  const locale = getLocale(context);
  if (!isLocale(locale)) notFound();
  const session = await getCartSession(request);
  const order = session.get("lastOrder");
  if (!order) throw redirect(href("/:lang/cart", { lang: locale }));
  const t = getInstance(context).t;
  return {
    order,
    title: t("cart.confirmation.title", { number: order.number }),
    description: t("cart.confirmation.description"),
  };
}

export const shouldRevalidate = () => false;

export function meta({ loaderData, matches }: Route.MetaArgs) {
  return pageMeta({
    title: loaderData.title,
    description: loaderData.description,
    brand: matches[0].loaderData.brand,
  });
}

export default function OrderConfirmation({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const lang = useLocale();
  const { order } = loaderData;
  const items = [
    { key: "items", term: t("cart.confirmation.items"), description: String(order.itemCount) },
    {
      key: "payment",
      term: t("cart.confirmation.payment"),
      description:
        order.method === "paypal" ? t("cart.confirmation.paypal") : t("cart.confirmation.card"),
    },
    { key: "total", term: t("cart.confirmation.total"), description: order.totalFormatted },
  ];
  return (
    <div className="mx-auto max-w-prose py-8 text-center">
      <h1 className="text-h2 md:text-h1">{loaderData.title}</h1>
      <p className="mt-4">{loaderData.description}</p>
      <DefinitionList className="mx-auto mt-8 max-w-sm text-start" items={items} />
      <p className="mt-6 text-body-sm text-fg-muted">{t("cart.confirmation.demo")}</p>
      <div className="mt-8">
        <ButtonLink to={href("/:lang", { lang })}>{t("cart.confirmation.continue")}</ButtonLink>
      </div>
    </div>
  );
}
