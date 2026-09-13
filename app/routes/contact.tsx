import { data, href, redirect } from "react-router";

import { CONTACT_FIELDS, ContactPage, type ContactResult } from "~/components/pages/contact-page";
import { isLocale } from "~/i18n/config";
import { type FieldErrors, hasErrors, readFields } from "~/lib/forms";
import { badRequest, notFound } from "~/lib/http";
import { pageMeta } from "~/lib/meta";
import { isEmail } from "~/lib/validation";
import { getInstance, getLocale } from "~/middleware/i18next";
import type { Route } from "./+types/contact";

const MAX_MESSAGE_LENGTH = 2000;

// ?sent=1 is the state after a submission (Post/Redirect/Get): no session, no flash.
export function loader({ context, url }: Route.LoaderArgs) {
  const t = getInstance(context).t;
  const sent = url.searchParams.get("sent") === "1";
  return {
    sent,
    heading: t("pages.contact.title"),
    title: sent ? t("pages.contact.sent.title") : t("pages.contact.title"),
    description: t("pages.contact.description"),
  };
}

// The message is validated and dropped: this is a demo store, nothing is sent or stored.
export async function action({ context, request }: Route.ActionArgs) {
  const locale = getLocale(context);
  if (!isLocale(locale)) notFound();
  const form = await request.formData().catch(badRequest);
  if (form.get("intent") !== "send") throw data({ code: "invalid-intent" }, { status: 400 });
  const values = readFields(form, CONTACT_FIELDS, { message: MAX_MESSAGE_LENGTH });
  const errors: FieldErrors<(typeof CONTACT_FIELDS)[number]> = {};
  if (!values.name) errors.name = "field-required";
  if (!values.email) errors.email = "field-required";
  else if (!isEmail(values.email)) errors.email = "email-invalid";
  if (!values.message) errors.message = "field-required";
  if (hasErrors(errors)) {
    return data({ ok: false, errors, values } satisfies ContactResult, { status: 400 });
  }
  throw redirect(`${href("/:lang/contact", { lang: locale })}?sent=1`, 303);
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  return pageMeta({
    title: loaderData.title,
    description: loaderData.description,
    brand: matches[0].loaderData.brand,
  });
}

export default function Contact({ loaderData, actionData }: Route.ComponentProps) {
  return <ContactPage title={loaderData.heading} sent={loaderData.sent} result={actionData} />;
}
