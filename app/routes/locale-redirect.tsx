import { redirect } from "react-router";

import { detectLocale } from "~/i18n/detect-locale.server";
import type { Route } from "./+types/locale-redirect";

export async function loader({ request }: Route.LoaderArgs) {
  throw redirect(`/${await detectLocale(request)}`, {
    status: 302,
    headers: { Vary: "Cookie, Accept-Language" },
  });
}
