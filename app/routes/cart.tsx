import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { data, href, redirect, useFetchers } from "react-router";

import { CartLineItem } from "~/components/cart/cart-line-item";
import { CartNotice } from "~/components/cart/cart-notice";
import { CartSummary } from "~/components/cart/cart-summary";
import type { CartActionResult } from "~/components/cart/cart-types";
import { CheckoutActions } from "~/components/cart/checkout-actions";
import { EmptyCart } from "~/components/cart/empty-cart";
import { PromoCodeForm } from "~/components/cart/promo-code-form";
import { useAnnounce } from "~/components/layout/announcer";
import { Alert } from "~/components/ui/alert";
import { isLocale } from "~/i18n/config";
import { formatPrice } from "~/i18n/format.server";
import { ERROR_MESSAGE_KEYS } from "~/lib/error-codes";
import { notFound, redirectBack, toRouteError } from "~/lib/http";
import { pageMeta } from "~/lib/meta";
import { noticeText } from "~/lib/notices";
import { getInstance, getLocale } from "~/middleware/i18next";
import { MAX_QUANTITY, removeLine, sanitiseLines, setQuantity } from "~/services/cart/cart";
import { isNoJs, parseCartIntent } from "~/services/cart/intents";
import { loadCartView } from "~/services/cart/load-cart.server";
import { findPromo } from "~/services/cart/promo-codes";
import { commitCartSession, getCartSession } from "~/services/cart/session.server";
import { getProduct } from "~/services/dummyjson/products.server";
import type { Route } from "./+types/cart";

export async function loader(args: Route.LoaderArgs) {
  try {
    return await load(args);
  } catch (error) {
    throw toRouteError(error);
  }
}

async function load({ context, request }: Route.LoaderArgs) {
  const locale = getLocale(context);
  if (!isLocale(locale)) notFound();
  const t = getInstance(context).t;
  const loaded = await loadCartView(request, locale);
  const flash = loaded.session.get("flash") as CartActionResult | undefined;
  const count = loaded.view.cartCount;
  const title = count > 0 ? t("cart.titleWithCount", { count }) : t("cart.title");
  const reconciliation: CartActionResult | undefined = loaded.notice
    ? { ok: true, notice: loaded.notice }
    : undefined;
  return data(
    { view: loaded.view, title, description: t("cart.description"), flash, reconciliation },
    loaded.changed || flash
      ? { headers: { "Set-Cookie": await commitCartSession(loaded.session) } }
      : undefined,
  );
}

export async function action(args: Route.ActionArgs) {
  try {
    return await act(args);
  } catch (error) {
    throw toRouteError(error);
  }
}

async function act({ context, request, url }: Route.ActionArgs) {
  const locale = getLocale(context);
  if (!isLocale(locale)) notFound();
  const form = await request.formData();
  const intent = parseCartIntent(form);
  const session = await getCartSession(request);
  session.unset("lastOrder");
  const lines = sanitiseLines(session.get("cart"));
  let result: CartActionResult;

  switch (intent.type) {
    case "set-quantity": {
      const product = await getProduct(intent.productId);
      if (!product || product.stock <= 0) {
        session.set("cart", removeLine(lines, intent.productId));
        result = { ok: true, notice: "items-removed", productId: intent.productId };
      } else if (intent.quantity === null) {
        result = { ok: false, error: "invalid-quantity", productId: intent.productId };
      } else {
        const max = Math.min(MAX_QUANTITY, product.stock);
        const updated = setQuantity(lines, intent.productId, intent.quantity, max);
        session.set("cart", updated.lines);
        result =
          updated.clamped === "max"
            ? { ok: true, notice: "quantity-clamped", values: { max }, productId: intent.productId }
            : {
                ok: true,
                notice: "quantity-updated",
                values: { title: product.title, quantity: updated.quantity },
                productId: intent.productId,
              };
      }
      break;
    }
    case "remove": {
      const product = await getProduct(intent.productId);
      session.set("cart", removeLine(lines, intent.productId));
      result = {
        ok: true,
        notice: "removed",
        values: { title: product?.title ?? String(intent.productId) },
        productId: intent.productId,
      };
      break;
    }
    case "apply-promo": {
      if (!intent.code.trim()) result = { ok: false, error: "promo-required" };
      else {
        const promo = findPromo(intent.code);
        if (!promo) result = { ok: false, error: "promo-invalid" };
        else {
          session.set("promoCode", promo.code);
          result = { ok: true, notice: "promo-applied", values: { code: promo.code } };
        }
      }
      break;
    }
    case "remove-promo":
      session.unset("promoCode");
      result = { ok: true, notice: "promo-removed" };
      break;
    case "checkout": {
      const loaded = await loadCartView(request, locale);
      if (loaded.view.lines.length === 0) {
        result = { ok: false, error: "empty-cart" };
        break;
      }
      session.set("lastOrder", {
        number: `LTP-${Date.now().toString(36).toUpperCase()}`,
        method: intent.payment,
        totalCents: loaded.view.totals.totalCents,
        itemCount: loaded.view.cartCount,
        totalFormatted: formatPrice(loaded.view.totals.totalCents, locale),
      });
      session.unset("cart");
      session.unset("promoCode");
      throw redirect(href("/:lang/checkout/confirmation", { lang: locale }), {
        status: 303,
        headers: { "Set-Cookie": await commitCartSession(session) },
      });
    }
    default:
      result = { ok: false, error: "invalid-intent" };
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

export function meta({ loaderData, matches }: Route.MetaArgs) {
  return pageMeta({
    title: loaderData.title,
    description: loaderData.description,
    brand: matches[0].loaderData.brand,
  });
}

type RemovalTarget = { removed: number; next?: number; previous?: number };

function renderedProductIds(): number[] {
  return [...document.querySelectorAll<HTMLElement>("[data-product-id]")].map((element) =>
    Number(element.dataset.productId),
  );
}

// Focus handoff after a removal: next line's remove button, else the previous one, else the h1.
// The target is planned when the action answers (the line is still mounted) and applied once the
// revalidated list no longer contains the removed product.
function useRemovalFocus(productIds: number[]) {
  const target = useRef<RemovalTarget | null>(null);
  const ids = productIds.join(",");
  useEffect(() => {
    const planned = target.current;
    if (!planned || productIds.includes(planned.removed)) return;
    target.current = null;
    const focusRemove = (id?: number) => {
      if (id === undefined || !productIds.includes(id)) return false;
      const button = document.querySelector<HTMLElement>(`[data-remove="${id}"]`);
      button?.focus();
      return Boolean(button);
    };
    if (!focusRemove(planned.next) && !focusRemove(planned.previous)) {
      document.getElementById("cart-heading")?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ids is the stable form of productIds
  }, [ids]);
  return useCallback((removed: number) => {
    const current = renderedProductIds();
    const index = current.indexOf(removed);
    target.current = { removed, next: current[index + 1], previous: current[index - 1] };
  }, []);
}

// Every cart fetcher is keyed; results are handled here so a removed line can still be announced.
function useCartResults(onResult: (result: CartActionResult) => void) {
  const fetchers = useFetchers();
  const handled = useRef(new WeakSet<object>());
  useEffect(() => {
    for (const fetcher of fetchers) {
      const result = fetcher.data as CartActionResult | undefined;
      if (!result || typeof result !== "object" || handled.current.has(result)) continue;
      handled.current.add(result);
      onResult(result);
    }
  }, [fetchers, onResult]);
}

export default function Cart({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const announce = useAnnounce();
  const { view, flash, reconciliation } = loaderData;
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const productIds = view.lines.map((line) => line.productId);
  const planRemovalFocus = useRemovalFocus(productIds);

  const onResult = useCallback(
    (result: CartActionResult) => {
      if (result.ok) {
        announce(noticeText(t, result));
        if (result.notice === "removed" && result.productId !== undefined) {
          planRemovalFocus(result.productId);
        }
      } else if (result.error === "empty-cart") {
        setCheckoutError(t(`errors.${ERROR_MESSAGE_KEYS[result.error]}.title`));
      }
    },
    [announce, t, planRemovalFocus],
  );
  useCartResults(onResult);

  const notice = flash ?? reconciliation;

  if (view.lines.length === 0) {
    return (
      <>
        {notice?.ok && <CartNotice>{noticeText(t, notice)}</CartNotice>}
        <EmptyCart />
      </>
    );
  }

  const lineFlash = (productId: number) =>
    flash && flash.productId === productId && !flash.ok ? flash : undefined;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
      <div className="flex min-w-0 flex-col gap-4">
        <h1 id="cart-heading" tabIndex={-1} className="text-h4 font-medium">
          {t("cart.title")}
        </h1>
        {notice?.ok && <CartNotice>{noticeText(t, notice)}</CartNotice>}
        {notice && !notice.ok && notice.error === "empty-cart" && (
          <Alert prefix={t("common.errorPrefix")}>{t("errors.emptyCart.title")}</Alert>
        )}
        <ul aria-label={t("cart.items.heading")} className="divide-y divide-border">
          {view.lines.map((line) => (
            <CartLineItem key={line.productId} item={line} flash={lineFlash(line.productId)} />
          ))}
        </ul>
      </div>
      <CartSummary totals={view.totals}>
        {checkoutError && <Alert prefix={t("common.errorPrefix")}>{checkoutError}</Alert>}
        <CheckoutActions />
        <PromoCodeForm
          promoCode={view.promoCode}
          flash={flash && flash.productId === undefined && !flash.ok ? flash : undefined}
        />
      </CartSummary>
    </div>
  );
}
