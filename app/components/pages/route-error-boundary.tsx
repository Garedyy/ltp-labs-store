import { useTranslation } from "react-i18next";
import { href, isRouteErrorResponse } from "react-router";

import { ButtonLink } from "~/components/ui/button";
import { useLocale } from "~/i18n/use-locale";
import { ERROR_MESSAGE_KEYS, isErrorCode } from "~/lib/error-codes";
import { ErrorPage } from "./error-page";

export type ErrorMessageKey =
  | (typeof ERROR_MESSAGE_KEYS)[keyof typeof ERROR_MESSAGE_KEYS]
  | "methodNotAllowed"
  | "badRequest"
  | "unexpected";

function messageKeyFor(status: number): ErrorMessageKey {
  if (status === 404) return "notFound";
  if (status === 405) return "methodNotAllowed";
  if (status === 400) return "badRequest";
  if (status === 502 || status === 503) return "serviceUnavailable";
  return "unexpected";
}

// Loaders throw data({ code }) with a known ErrorCode; anything else falls back to the status.
export function statusOf(error: unknown): ErrorMessageKey {
  if (!isRouteErrorResponse(error)) return "unexpected";
  const code: unknown = (error.data as { code?: unknown } | null)?.code;
  if (isErrorCode(code)) return ERROR_MESSAGE_KEYS[code];
  return messageKeyFor(error.status);
}

export function RouteErrorBoundary({ error }: { error: unknown }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const key = statusOf(error);

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
