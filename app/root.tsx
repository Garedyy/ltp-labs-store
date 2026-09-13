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
import { ensureLocaleResources } from "~/i18n/load-locale.client";
import { switchLocale } from "~/i18n/paths";
import { getInstance, getLocale, i18nextMiddleware } from "~/middleware/i18next";
import { responseHeadersMiddleware } from "~/middleware/response-headers";
import { readTheme } from "~/theme/theme-cookie.server";
import { useTheme } from "~/theme/use-theme";
import type { Route } from "./+types/root";
import manropeUrl from "./fonts/manrope-latin.woff2?url";
import "./styles/app.css";
import { revalidateOnPathnameOrSubmit } from "~/lib/revalidate";

export const middleware: Route.MiddlewareFunction[] = [
  i18nextMiddleware,
  responseHeadersMiddleware,
];

export const links: Route.LinksFunction = () => [
  { rel: "preload", href: manropeUrl, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "preconnect", href: "https://cdn.dummyjson.com" },
];

export const shouldRevalidate = revalidateOnPathnameOrSubmit;

export async function loader({ context, request, url }: Route.LoaderArgs) {
  const locale = getLocale(context);
  return {
    locale,
    origin: process.env.APP_ORIGIN || url.origin,
    brand: getInstance(context).t("common.brand"),
    theme: await readTheme(request),
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
  // An explicit choice is rendered on the server, so the page never flashes the other theme;
  // "system" leaves data-theme off and lets the CSS follow prefers-color-scheme. The meta lets
  // the browser paint the canvas in the right colour before the stylesheet arrives.
  const theme = useTheme();

  return (
    <html lang={htmlLang} dir={dir} data-theme={theme === "system" ? undefined : theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content={theme === "system" ? "light dark" : theme} />
        <Meta />
        <Links />
        {rootData && <AlternateLinks origin={rootData.origin} />}
        {/* Lets CSS hide no-JS fallbacks (e.g. Apply buttons) only when scripts run. */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
      </head>
      <body className="flex min-h-svh flex-col">
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
    const locale = loaderData.locale;
    if (i18n.language === locale || !isLocale(locale)) return;
    void ensureLocaleResources(i18n, locale).then(() => i18n.changeLanguage(locale));
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
