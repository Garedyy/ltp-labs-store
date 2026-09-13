import { data, href, redirect } from "react-router";

import {
  AccountPage,
  type AccountView,
  SIGN_IN_FIELDS,
  type SignInResult,
} from "~/components/pages/account-page";
import { isLocale, LOCALES } from "~/i18n/config";
import { formatDate } from "~/i18n/format.server";
import { type FieldErrors, hasErrors, readFields } from "~/lib/forms";
import { badRequest, notFound } from "~/lib/http";
import { pageMeta } from "~/lib/meta";
import { isEmail } from "~/lib/validation";
import { getInstance, getLocale } from "~/middleware/i18next";
import { countItems, sanitiseLines } from "~/services/cart/cart";
import { getCartSession } from "~/services/cart/session.server";
import type { Route } from "./+types/account";

// The demo profile's fixed start date; the only account data is what the cart cookie holds.
const CUSTOMER_SINCE = "2026-01-15";

export async function loader({ context, request, url }: Route.LoaderArgs) {
  const locale = getLocale(context);
  if (!isLocale(locale)) notFound();
  const t = getInstance(context).t;
  const session = await getCartSession(request);
  const view: AccountView = {
    cartCount: countItems(sanitiseLines(session.get("cart"))),
    lastOrder: session.get("lastOrder"),
    sinceFormatted: formatDate(CUSTOMER_SINCE, locale),
    languageName: LOCALES[locale].nativeName,
  };
  return {
    view,
    demo: url.searchParams.get("demo") === "1",
    title: t("pages.account.title"),
    description: t("pages.account.description"),
  };
}

// Sign-in is a mock: the fields are validated, nothing is created, stored or compared.
export async function action({ context, request }: Route.ActionArgs) {
  const locale = getLocale(context);
  if (!isLocale(locale)) notFound();
  const form = await request.formData().catch(badRequest);
  if (form.get("intent") !== "sign-in") throw data({ code: "invalid-intent" }, { status: 400 });
  const values = readFields(form, SIGN_IN_FIELDS);
  const errors: FieldErrors<(typeof SIGN_IN_FIELDS)[number]> = {};
  if (!values.email) errors.email = "field-required";
  else if (!isEmail(values.email)) errors.email = "email-invalid";
  if (!values.password) errors.password = "field-required";
  if (hasErrors(errors)) {
    const echoed = { ...values, password: "" };
    return data({ ok: false, errors, values: echoed } satisfies SignInResult, { status: 400 });
  }
  throw redirect(`${href("/:lang/account", { lang: locale })}?demo=1`, 303);
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  return pageMeta({
    title: loaderData.title,
    description: loaderData.description,
    brand: matches[0].loaderData.brand,
  });
}

export default function Account({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <AccountPage
      title={loaderData.title}
      view={loaderData.view}
      demo={loaderData.demo}
      result={actionData}
    />
  );
}
