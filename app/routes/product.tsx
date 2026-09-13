import { useTranslation } from "react-i18next";
import { data, href, redirect, type ShouldRevalidateFunctionArgs } from "react-router";

import { AddToCartForm, type AddResult } from "~/components/product/add-to-cart-form";
import { ProductGallery } from "~/components/product/product-gallery";
import { ProductInfoList } from "~/components/product/product-info-list";
import { ReviewList } from "~/components/product/review-list";
import { StockStatus } from "~/components/product/stock-status";
import { DiscountBadge } from "~/components/ui/discount-badge";
import { Price } from "~/components/ui/price";
import { Rating } from "~/components/ui/rating";
import { isLocale } from "~/i18n/config";
import { useLocale } from "~/i18n/use-locale";
import { notFound, redirectBack, toRouteError } from "~/lib/http";
import { pageMeta } from "~/lib/meta";
import { buildProductView } from "~/lib/product/view.server";
import { getInstance, getLocale } from "~/middleware/i18next";
import { addLine, countItems, MAX_QUANTITY, sanitiseLines } from "~/services/cart/cart";
import { isAddIntent, isNoJs } from "~/services/cart/intents";
import { commitCartSession, getCartSession } from "~/services/cart/session.server";
import { getProduct } from "~/services/dummyjson/products.server";
import type { Route } from "./+types/product";

function productIdFrom(params: Route.LoaderArgs["params"]): number {
  const id = Number(params.productId);
  if (!Number.isInteger(id) || id <= 0) notFound("product-not-found");
  return id;
}

export async function loader({ params, context, request }: Route.LoaderArgs) {
  const id = productIdFrom(params);
  const locale = getLocale(context);
  if (!isLocale(locale)) notFound();
  const t = getInstance(context).t;
  const product = await getProduct(id).catch((error: unknown) => {
    throw toRouteError(error);
  });
  if (!product) notFound("product-not-found");

  // A no-JS submission redirected back here with a flash result: read it and clear it.
  const session = await getCartSession(request);
  const flash = session.get("flash") as AddResult | undefined;
  return data(
    {
      view: buildProductView(product, locale, t),
      description: t("product.description"),
      flash,
    },
    flash ? { headers: { "Set-Cookie": await commitCartSession(session) } } : undefined,
  );
}

// The product route owns intent=add and intent=buy-now; the cart route owns every other intent.
export async function action({ params, context, request, url }: Route.ActionArgs) {
  const id = productIdFrom(params);
  const locale = getLocale(context);
  if (!isLocale(locale)) notFound();
  const form = await request.formData();
  const intent = form.get("intent");
  if (!isAddIntent(intent)) throw data({ code: "invalid-intent" }, { status: 400 });

  const session = await getCartSession(request);
  session.unset("lastOrder");
  const lines = sanitiseLines(session.get("cart"));
  const product = await getProduct(id).catch((error: unknown) => {
    throw toRouteError(error);
  });

  let result: AddResult;
  if (!product) result = { ok: false, error: "product-not-found" };
  else if (product.stock <= 0) result = { ok: false, error: "out-of-stock" };
  else {
    const max = Math.min(MAX_QUANTITY, product.stock);
    const added = addLine(lines, id, max);
    if (added.full) result = { ok: false, error: "cart-full" };
    else {
      session.set("cart", added.lines);
      result = {
        ok: true,
        notice: added.capped ? "added-capped" : "added",
        cartCount: countItems(added.lines),
        max,
      };
    }
  }

  // Buy now lands on the cart with the outcome flashed as a cart notice, with or without JS.
  if (intent === "buy-now" && result.ok) {
    const values =
      result.notice === "added-capped" ? { max: result.max } : { count: result.cartCount };
    session.flash("flash", { ok: true, notice: result.notice, values });
    throw redirect(href("/:lang/cart", { lang: locale }), {
      status: 303,
      headers: { "Set-Cookie": await commitCartSession(session) },
    });
  }
  if (isNoJs(form)) {
    session.flash("flash", result);
    throw redirectBack(request, url, { "Set-Cookie": await commitCartSession(session) });
  }
  return data(result, {
    status: result.ok ? 200 : 400,
    headers: { "Set-Cookie": await commitCartSession(session) },
  });
}

// Switching the gallery image only touches ?image: no refetch. Submissions still revalidate.
export function shouldRevalidate({
  currentUrl,
  nextUrl,
  formMethod,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (formMethod) return defaultShouldRevalidate;
  const current = new URLSearchParams(currentUrl.search);
  const next = new URLSearchParams(nextUrl.search);
  current.delete("image");
  next.delete("image");
  if (currentUrl.pathname === nextUrl.pathname && current.toString() === next.toString())
    return false;
  return defaultShouldRevalidate;
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  return pageMeta({
    title: loaderData.view.title,
    description: loaderData.description,
    brand: matches[0].loaderData.brand,
  });
}

export default function Product({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const lang = locale === "en" ? undefined : "en";
  const { view } = loaderData;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-12">
      <ProductGallery title={view.title} images={view.images} />
      <div className="flex flex-col gap-4">
        <h1 className="text-h3 font-medium md:text-h2" lang={lang}>
          {view.title}
        </h1>
        <Rating
          value={view.rating}
          valueFormatted={view.ratingFormatted}
          label={t("product.rating.label", {
            value: view.ratingFormatted,
            count: view.reviewCount,
          })}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Price
            priceFormatted={view.priceFormatted}
            originalPriceFormatted={view.originalPriceFormatted}
            labels={{ price: t("product.price.sale"), originalPrice: t("product.price.original") }}
            className="text-h4"
          />
          {view.discountFormatted && <DiscountBadge percentFormatted={view.discountFormatted} />}
        </div>
        <StockStatus stock={view.stock} />
        <AddToCartForm productId={view.id} inStock={view.inStock} flash={loaderData.flash} />
        <section aria-labelledby="details-heading" className="border-t border-border pt-4">
          <h2 id="details-heading" className="text-body-sm font-medium tracking-wide uppercase">
            {t("product.details.heading")}
          </h2>
          <p className="mt-2 text-body-sm" lang={lang}>
            {view.description}
          </p>
        </section>
        <ProductInfoList items={view.info} tags={view.tags} lang={lang} />
      </div>
      <div className="lg:col-span-2">
        <ReviewList reviews={view.reviews} lang={lang} />
      </div>
    </div>
  );
}
