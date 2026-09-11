import { render, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import { I18nextProvider } from "react-i18next";
import { createRoutesStub } from "react-router";

import type { Locale } from "~/i18n/config";
import { createTestI18n } from "./i18n";

type Options = { locale?: Locale; path?: string };

// Mounts route-aware components (Link, Form, fetchers) inside a stub router with translations.
export function renderWithProviders(ui: ReactElement, options: Options = {}): RenderResult {
  const { locale = "en", path = `/${locale}` } = options;
  const i18n = createTestI18n(locale);
  const Stub = createRoutesStub([
    {
      id: "root",
      path: "/",
      loader: () => ({ locale, origin: "http://localhost", brand: "The Online Store" }),
      children: [
        { path: "/:lang", Component: () => ui },
        { path: "/:lang/*", Component: () => ui },
      ],
    },
  ]);
  return render(
    <I18nextProvider i18n={i18n}>
      <Stub initialEntries={[path]} hydrationData={{ loaderData: { root: { locale } } }} />
    </I18nextProvider>,
  );
}

export const renderWithRouter = renderWithProviders;
