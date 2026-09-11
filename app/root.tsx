import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useRouteLoaderData,
} from "react-router";

import { RouteErrorBoundary } from "~/components/pages/route-error-boundary";
import { isLocale, LOCALES, localeCodes, localeFromHtmlLang } from "~/i18n/config";
import { switchLocale } from "~/i18n/paths";
import { getInstance, getLocale, i18nextMiddleware } from "~/middleware/i18next";
import { responseHeadersMiddleware } from "~/middleware/response-headers";
import type { Route } from "./+types/root";
import manropeUrl from "./fonts/manrope-latin.woff2?url";
import "./styles/app.css";

export const middleware: Route.MiddlewareFunction[] = [
  i18nextMiddleware,
  responseHeadersMiddleware,
];

export const links: Route.LinksFunction = () => [
  { rel: "preload", href: manropeUrl, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
];

export function loader({ context, url }: Route.LoaderArgs) {
  const locale = getLocale(context);
  return {
    locale,
    origin: process.env.APP_ORIGIN || url.origin,
    brand: getInstance(context).t("common.brand"),
  };
}

// Child meta replaces parent meta, so hreflang links are rendered straight into the head.
function AlternateLinks({ origin }: { origin: string }) {
  const { pathname, search } = useLocation();
  return (
    <>
      {localeCodes.map((locale) => (
        <link
          key={locale}
          rel="alternate"
          hrefLang={LOCALES[locale].htmlLang}
          href={origin + switchLocale(pathname + search, locale)}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={origin + switchLocale(pathname + search, "en")}
      />
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const rootData = useRouteLoaderData("root") as Route.ComponentProps["loaderData"] | undefined;
  const { i18n } = useTranslation();
  const locale = isLocale(rootData?.locale) ? rootData.locale : localeFromHtmlLang(i18n.language);
  const { htmlLang, dir } = LOCALES[locale];

  return (
    <html lang={htmlLang} dir={dir}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {rootData && <AlternateLinks origin={rootData.origin} />}
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const { i18n } = useTranslation();
  useEffect(() => {
    if (i18n.language !== loaderData.locale) void i18n.changeLanguage(loaderData.locale);
  }, [i18n, loaderData.locale]);
  return <Outlet />;
}

// Shell-less boundary: only for failures outside the locale layout (asset-like paths, 405, 500).
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <main id="main" className="mx-auto w-full max-w-[87rem] px-4 py-8 lg:px-6">
      <RouteErrorBoundary error={error} />
    </main>
  );
}
