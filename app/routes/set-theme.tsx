import { redirect } from "react-router";

import { isSafeRedirectPath } from "~/i18n/paths";
import { badRequest, methodNotAllowed } from "~/lib/http";
import { isTheme } from "~/theme/config";
import { serializeTheme } from "~/theme/theme-cookie.server";
import type { Route } from "./+types/set-theme";

export function loader() {
  return methodNotAllowed();
}

// The only writer of the "theme" cookie.
export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const theme = form.get("theme");
  const redirectTo = form.get("redirectTo");
  if (!isTheme(theme) || !isSafeRedirectPath(redirectTo)) return badRequest();

  throw redirect(redirectTo, {
    status: 303,
    headers: { "Set-Cookie": await serializeTheme(theme) },
  });
}
