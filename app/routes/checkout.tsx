import { useTranslation } from "react-i18next";
import { data, href, Link, redirect } from "react-router";

import { CartSummary } from "~/components/cart/cart-summary";
import { FormNotice } from "~/components/forms/form-notice";
import {
  CHECKOUT_FIELDS,
  CheckoutForm,
  type CheckoutResult,
} from "~/components/cart/checkout-form";
import { OrderLines } from "~/components/cart/order-lines";
import { isLocale } from "~/i18n/config";
import { useLocale } from "~/i18n/use-locale";
import { type FieldErrors, hasErrors, readFields } from "~/lib/forms";
import { badRequest, notFound, toRouteError } from "~/lib/http";
import { pageMeta } from "~/lib/meta";
import { noticeText } from "~/lib/notices";
import { isCardCode, isCardExpiry, isCardNumber, isEmail } from "~/lib/validation";
import { getInstance, getLocale } from "~/middleware/i18next";
import {
  buildOrder,
  loadCheckout,
  productIdFrom,
  redirectToEmptyCart,
} from "~/services/cart/checkout.server";
import { parseCountry } from "~/services/cart/countries";
import { parsePaymentMethod } from "~/services/cart/intents";
import { commitCartSession } from "~/services/cart/session.server";
import type { PaymentMethod } from "~/services/cart/types";
import type { Route } from "./+types/checkout";

const PAYMENT_HEADING = "payment-heading";
const NOTICE_ID = "checkout-notice";

// A reconciliation notice, when present, takes the focus the route announcer would give main.
export const handle = { initialFocus: `#${NOTICE_ID}` };

export async function loader(args: Route.LoaderArgs) {
  try {
    return await load(args);
  } catch (error) {
    throw toRouteError(error);
  }
}

// ?product=<id> prices one unit of that product alone (Buy now); ?method=paypal preselects PayPal.
async function load({ context, request, url }: Route.LoaderArgs) {
  const locale = getLocale(context);
  if (!isLocale(locale)) notFound();
  const t = getInstance(context).t;
  const loaded = await loadCheckout(
    request,
    locale,
    productIdFrom(url.searchParams.get("product")),
  );
  const view = loaded.view ?? (await redirectToEmptyCart(loaded.session, locale, 302));
  return data(
    {
      view,
      notice: loaded.notice,
      method: parsePaymentMethod(url.searchParams.get("method")),
      title: t("cart.checkout.title"),
      description: t("cart.checkout.description"),
    },
    loaded.changed
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

type CheckoutField = (typeof CHECKOUT_FIELDS)[number];

function validate(values: Record<CheckoutField, string>, method: PaymentMethod) {
  const errors: FieldErrors<CheckoutField> = {};
  for (const name of ["name", "address", "postalCode", "city"] as const) {
    if (!values[name]) errors[name] = "field-required";
  }
  if (!values.email) errors.email = "field-required";
  else if (!isEmail(values.email)) errors.email = "email-invalid";
  if (method === "card") {
    if (!values.cardName) errors.cardName = "field-required";
    if (!values.cardNumber) errors.cardNumber = "field-required";
    else if (!isCardNumber(values.cardNumber)) errors.cardNumber = "card-number-invalid";
    if (!values.cardExpiry) errors.cardExpiry = "field-required";
    else if (!isCardExpiry(values.cardExpiry)) errors.cardExpiry = "card-expiry-invalid";
    if (!values.cardCode) errors.cardCode = "field-required";
    else if (!isCardCode(values.cardCode)) errors.cardCode = "card-code-invalid";
  }
  return errors;
}

// place-order validates the form, then writes lastOrder exactly as the cart's checkout used to:
// card data is checked for its format and dropped, never stored or logged.
async function act({ context, request }: Route.ActionArgs) {
  const locale = getLocale(context);
  if (!isLocale(locale)) notFound();
  const form = await request.formData().catch(badRequest);
  if (form.get("intent") !== "place-order") {
    throw data({ code: "invalid-intent" }, { status: 400 });
  }
  const method = parsePaymentMethod(form.get("method"));
  const values = readFields(form, CHECKOUT_FIELDS);
  values.country = parseCountry(values.country);
  const errors = validate(values, method);
  if (hasErrors(errors)) {
    const echoed = { ...values, cardNumber: "", cardExpiry: "", cardCode: "" };
    return data({ ok: false, errors, values: echoed, method } satisfies CheckoutResult, {
      status: 400,
    });
  }

  const productId = productIdFrom(form.get("product"));
  const loaded = await loadCheckout(request, locale, productId);
  const view = loaded.view ?? (await redirectToEmptyCart(loaded.session, locale, 303));
  const { session } = loaded;
  session.set("lastOrder", buildOrder(view, method));
  if (view.productId === undefined) {
    session.unset("cart");
    session.unset("promoCode");
  }
  throw redirect(href("/:lang/checkout/confirmation", { lang: locale }), {
    status: 303,
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

export default function Checkout({ loaderData, actionData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const lang = useLocale();
  const { view, method, notice } = loaderData;
  const back =
    view.productId === undefined
      ? { to: href("/:lang/cart", { lang }), label: t("cart.checkout.backToCart") }
      : {
          to: href("/:lang/products/:productId", { lang, productId: String(view.productId) }),
          label: t("cart.checkout.backToProduct"),
        };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12">
      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 id={PAYMENT_HEADING} className="text-h4 font-medium">
            {loaderData.title}
          </h1>
          <p className="text-body-sm text-fg-muted">{t("cart.checkout.intro")}</p>
          {view.productId !== undefined && (
            <p className="text-body-sm">{t("cart.checkout.buyNowNote")}</p>
          )}
        </div>
        {notice && <FormNotice id={NOTICE_ID}>{noticeText(t, { ok: true, notice })}</FormNotice>}
        <CheckoutForm
          totalFormatted={view.totals.totalFormatted}
          initialMethod={method}
          productId={view.productId}
          result={actionData}
        />
        <p>
          <Link to={back.to}>{back.label}</Link>
        </p>
      </div>
      <CartSummary
        totals={view.totals}
        heading={t("cart.checkout.orderHeading")}
        lines={<OrderLines lines={view.lines} />}
      />
    </div>
  );
}
