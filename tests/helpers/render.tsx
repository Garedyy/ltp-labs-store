import { render, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import { I18nextProvider } from "react-i18next";
import { type ActionFunction, createRoutesStub } from "react-router";

import type { Locale } from "~/i18n/config";
import { createTestI18n } from "./i18n";

type Options = {
  locale?: Locale;
  path?: string;
  // Answers every submission made from `ui` (fetchers and forms).
  action?: ActionFunction;
  // Names the leaf route and seeds its loader data, for `useRouteLoaderData(routeId)` consumers.
  routeId?: string;
  loaderData?: unknown;
};

// Mounts route-aware components (Link, Form, fetchers) inside a stub router with translations.
export function renderWithProviders(ui: ReactElement, options: Options = {}): RenderResult {
  const { locale = "en", path = `/${locale}`, action, routeId, loaderData } = options;
  const i18n = createTestI18n(locale);
  const leaf = { Component: () => ui, action };
  const Stub = createRoutesStub([
    {
      id: "root",
      path: "/",
      loader: () => ({ locale, origin: "http://localhost", brand: "The Online Store" }),
      children: [
        { ...leaf, path: "/:lang" },
        { ...leaf, path: "/:lang/*", id: routeId, loader: routeId ? () => loaderData : undefined },
      ],
    },
  ]);
  return render(
    <I18nextProvider i18n={i18n}>
      <Stub
        initialEntries={[path]}
        hydrationData={{
          loaderData: { root: { locale }, ...(routeId ? { [routeId]: loaderData } : {}) },
        }}
      />
    </I18nextProvider>,
  );
}

export const renderWithRouter = renderWithProviders;
