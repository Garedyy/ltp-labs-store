import { redirect } from "react-router";

import { isLocale } from "~/i18n/config";
import { localeCookie } from "~/i18n/locale-cookie.server";
import { isSafeRedirectPath, switchLocale } from "~/i18n/paths";
import { badRequest, methodNotAllowed } from "~/lib/http";
import type { Route } from "./+types/set-language";

export function loader() {
  return methodNotAllowed();
}

// The only writer of the "lng" cookie.
export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const locale = form.get("locale");
  const redirectTo = form.get("redirectTo");
  if (!isLocale(locale) || !isSafeRedirectPath(redirectTo)) return badRequest();

  throw redirect(switchLocale(redirectTo, locale), {
    status: 303,
    headers: { "Set-Cookie": await localeCookie.serialize(locale) },
  });
}
