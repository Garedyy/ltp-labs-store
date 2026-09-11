import { useTranslation } from "react-i18next";
import { data, Outlet, redirect } from "react-router";

import { AnnouncerProvider } from "~/components/layout/announcer";
import { useNavigationPending } from "~/components/layout/navigation-status";
import { PageContainer } from "~/components/layout/page-container";
import { RouteAnnouncer } from "~/components/layout/route-announcer";
import { SiteFooter } from "~/components/layout/site-footer";
import { SiteHeader } from "~/components/layout/site-header";
import { SkipLink } from "~/components/layout/skip-link";
import { RouteErrorBoundary } from "~/components/pages/route-error-boundary";
import { isLocale } from "~/i18n/config";
import { detectLocale } from "~/i18n/detect-locale.server";
import { withLocale } from "~/i18n/paths";
import type { Route } from "./+types/locale-layout";
import { revalidateOnPathnameOrSubmit } from "~/lib/revalidate";

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

export const shouldRevalidate = revalidateOnPathnameOrSubmit;

export function loader() {
  return { cartCount: 0 };
}

function Shell({ cartCount, children }: { cartCount: number; children: React.ReactNode }) {
  const { t } = useTranslation();
  const pending = useNavigationPending();
  return (
    <AnnouncerProvider>
      <SkipLink>{t("common.skipToContent")}</SkipLink>
      <SiteHeader cartCount={cartCount} />
      <main id="main" tabIndex={-1} aria-busy={pending || undefined} className="py-8">
        <PageContainer>{children}</PageContainer>
      </main>
      <SiteFooter />
      <RouteAnnouncer />
    </AnnouncerProvider>
  );
}

export default function LocaleLayout({ loaderData }: Route.ComponentProps) {
  return (
    <Shell cartCount={loaderData.cartCount}>
      <Outlet />
    </Shell>
  );
}

// TO VERIFY 2: loaderData is typed on ErrorBoundaryProps; fall back to 0 when it is absent.
export function ErrorBoundary({ error, loaderData }: Route.ErrorBoundaryProps) {
  return (
    <Shell cartCount={loaderData?.cartCount ?? 0}>
      <RouteErrorBoundary error={error} />
    </Shell>
  );
}
