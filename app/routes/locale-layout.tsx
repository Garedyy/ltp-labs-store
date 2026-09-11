import { useTranslation } from "react-i18next";
import { data, Outlet, redirect } from "react-router";

import { LanguageSwitcher } from "~/components/layout/language-switcher";
import { SkipLink } from "~/components/layout/skip-link";
import { RouteErrorBoundary } from "~/components/pages/route-error-boundary";
import { isLocale } from "~/i18n/config";
import { detectLocale } from "~/i18n/detect-locale.server";
import { withLocale } from "~/i18n/paths";
import type { Route } from "./+types/locale-layout";

const ASSET_DENY_LIST = new Set([
  "favicon.ico",
  ".well-known",
  "robots.txt",
  "apple-touch-icon.png",
]);

// Runs before every loader in the subtree (parent and child loaders run in parallel).
const validateLocale: Route.MiddlewareFunction = async ({ params, url, request }, next) => {
  const raw = params.lang;
  if (raw.includes(".") || ASSET_DENY_LIST.has(raw)) throw data(null, { status: 404 });

  const lower = raw.toLowerCase();
  if (isLocale(lower)) {
    if (raw !== lower) {
      throw redirect(`/${lower}${url.pathname.slice(raw.length + 1)}${url.search}`, 301);
    }
    return next();
  }

  const locale = await detectLocale(request);
  throw redirect(withLocale(url.pathname + url.search, locale), 302);
};

export const middleware: Route.MiddlewareFunction[] = [validateLocale];

export function loader() {
  return { cartCount: 0 };
}

function Shell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <>
      <SkipLink>{t("common.skipToContent")}</SkipLink>
      <header className="px-4 pt-4 lg:px-6 lg:pt-6">
        <div className="mx-auto flex min-h-header max-w-[87rem] items-center justify-between rounded-2xl bg-surface ps-6 pe-3 shadow-header">
          <span className="text-h5 font-semibold tracking-tight text-primary uppercase">
            {t("common.brand")}
          </span>
          <LanguageSwitcher />
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[87rem] px-4 py-8 lg:px-6">
        {children}
      </main>
    </>
  );
}

export default function LocaleLayout() {
  return (
    <Shell>
      <Outlet />
    </Shell>
  );
}

export function ErrorBoundary(props: Route.ErrorBoundaryProps) {
  return (
    <Shell>
      <RouteErrorBoundary error={props.error} />
    </Shell>
  );
}
