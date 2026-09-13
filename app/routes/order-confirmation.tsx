import { useTranslation } from "react-i18next";
import { href, redirect } from "react-router";

import { OrderLines } from "~/components/cart/order-lines";
import { ButtonLink } from "~/components/ui/button";
import { DefinitionList } from "~/components/ui/definition-list";
import { Icon } from "~/components/ui/icon";
import { isLocale } from "~/i18n/config";
import { formatPrice } from "~/i18n/format.server";
import { useLocale } from "~/i18n/use-locale";
import { notFound, toRouteError } from "~/lib/http";
import { pageMeta } from "~/lib/meta";
import { getInstance, getLocale } from "~/middleware/i18next";
import { countItems, sanitiseOrder } from "~/services/cart/cart";
import { toLineView } from "~/services/cart/load-cart.server";
import { getCartSession } from "~/services/cart/session.server";
import type { CartLineView } from "~/services/cart/types";
import { getProductsByIds } from "~/services/dummyjson/products.server";
import type { Route } from "./+types/order-confirmation";

const SUMMARY_HEADING = "order-summary-heading";

export async function loader(args: Route.LoaderArgs) {
  try {
    return await load(args);
  } catch (error) {
    throw toRouteError(error);
  }
}

// lastOrder persists until the next cart mutation, so reloads and language switches keep it. The
// lines are priced from the catalogue again (D-17); a product gone since the order is skipped.
async function load({ context, request }: Route.LoaderArgs) {
  const locale = getLocale(context);
  if (!isLocale(locale)) notFound();
  const session = await getCartSession(request);
  const order = sanitiseOrder(session.get("lastOrder"));
  if (!order) throw redirect(href("/:lang/cart", { lang: locale }));
  const products = await getProductsByIds(order.lines.map((line) => line.productId));
  const lines: CartLineView[] = [];
  order.lines.forEach((line, index) => {
    const product = products[index];
    if (product) lines.push(toLineView(product, line.quantity, locale));
  });
  const t = getInstance(context).t;
  return {
    number: order.number,
    method: order.method,
    itemCount: countItems(order.lines),
    totalFormatted: formatPrice(order.totalCents, locale),
    lines,
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
  const { number, method, itemCount, totalFormatted, lines } = loaderData;
  const items = [
    { key: "items", term: t("cart.confirmation.items"), description: String(itemCount) },
    {
      key: "payment",
      term: t("cart.confirmation.payment"),
      description:
        method === "paypal" ? t("cart.confirmation.paypal") : t("cart.confirmation.card"),
    },
    { key: "total", term: t("cart.confirmation.total"), description: totalFormatted },
  ];
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 py-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-success text-fg-inverse forced-colors:border">
          <Icon name="check" className="size-8" />
        </span>
        <h1 className="text-h2 md:text-h1">{t("cart.confirmation.heading")}</h1>
        <p>{loaderData.description}</p>
        <p className="flex flex-col gap-1">
          <span className="text-body-sm text-fg-muted">{t("cart.confirmation.number")}</span>
          <strong className="text-h3 font-medium">{number}</strong>
        </p>
      </div>
      <section
        aria-labelledby={SUMMARY_HEADING}
        className="flex flex-col gap-4 rounded-2xl border border-border p-6"
      >
        <h2 id={SUMMARY_HEADING} className="text-h5 font-medium">
          {t("cart.confirmation.summary")}
        </h2>
        <OrderLines lines={lines} />
        <DefinitionList className="border-t border-border pt-4" items={items} />
      </section>
      <p className="text-center text-body-sm text-fg-muted">{t("cart.confirmation.demo")}</p>
      <div className="text-center">
        <ButtonLink to={href("/:lang/shop", { lang })}>
          {t("cart.confirmation.continue")}
        </ButtonLink>
      </div>
    </div>
  );
}
