import { useTranslation } from "react-i18next";
import { href, isRouteErrorResponse } from "react-router";

import { ButtonLink } from "~/components/ui/button";
import { useLocale } from "~/i18n/use-locale";
import { ErrorPage } from "./error-page";

export type ErrorMessageKey =
  "notFound" | "methodNotAllowed" | "badRequest" | "serviceUnavailable" | "unexpected";

function messageKeyFor(status: number): ErrorMessageKey {
  if (status === 404) return "notFound";
  if (status === 405) return "methodNotAllowed";
  if (status === 400) return "badRequest";
  if (status === 502 || status === 503) return "serviceUnavailable";
  return "unexpected";
}

export function statusOf(error: unknown): ErrorMessageKey {
  return messageKeyFor(isRouteErrorResponse(error) ? error.status : 500);
}

export function RouteErrorBoundary({ error }: { error: unknown }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const key = messageKeyFor(status);

  return (
    <ErrorPage
      status={status}
      title={t(`errors.${key}.title`)}
      description={t(`errors.${key}.description`)}
      actions={
        <ButtonLink to={href("/:lang", { lang: locale })}>{t("errors.links.home")}</ButtonLink>
      }
    />
  );
}
