import i18next from "i18next";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { HydratedRouter } from "react-router/dom";

import { DEFAULT_LOCALE, localeCodes, localeFromHtmlLang } from "~/i18n/config";
import { ensureLocaleResources } from "~/i18n/load-locale.client";

// <html lang> is authoritative; init must finish before hydration or keys would mismatch the SSR
// HTML. Only the rendered locale is downloaded (PT and EN share the same keys by construction).
async function main() {
  const lng = localeFromHtmlLang(document.documentElement.lang);
  await i18next.use(initReactI18next).init({
    resources: {},
    lng,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: localeCodes,
    interpolation: { escapeValue: false },
    returnNull: false,
  });
  await ensureLocaleResources(i18next, lng);

  startTransition(() => {
    hydrateRoot(
      document,
      <I18nextProvider i18n={i18next}>
        <StrictMode>
          <HydratedRouter />
        </StrictMode>
      </I18nextProvider>,
    );
  });
}

void main();
