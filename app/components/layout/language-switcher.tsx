import { useTranslation } from "react-i18next";
import { Form, href, useLocation } from "react-router";

import { Disclosure } from "~/components/ui/disclosure";
import { Icon } from "~/components/ui/icon";
import { VisuallyHidden } from "~/components/ui/visually-hidden";
import { LOCALES, localeCodes } from "~/i18n/config";
import { useLocale } from "~/i18n/use-locale";

// A <details> pill; the panel is a POST form so the switch works without JavaScript.
export function LanguageSwitcher() {
  const { t } = useTranslation();
  const locale = useLocale();
  const location = useLocation();
  const current = LOCALES[locale];
  const code = locale.toUpperCase();

  return (
    <nav aria-label={t("common.language.label")} className="relative">
      <Disclosure
        summaryClassName="inline-flex min-h-11 items-center gap-1 rounded-xl border border-border px-3 text-tagline font-medium text-primary hover:bg-surface-muted motion-safe:transition motion-safe:duration-150 active:scale-[0.97]"
        summary={
          <>
            <span aria-hidden="true">{code}</span>
            <VisuallyHidden>
              {t("common.language.current", { code, name: current.nativeName })}
            </VisuallyHidden>
            <Icon
              name="chevronDown"
              className="size-4 group-open:rotate-180 motion-safe:transition-transform"
            />
          </>
        }
      >
        <Form
          method="post"
          action={href("/:lang/set-language", { lang: locale })}
          className="absolute end-0 z-40 mt-2 min-w-40 origin-top rounded-xl border border-border bg-surface p-2 shadow-header motion-safe:animate-pop-in"
        >
          <input type="hidden" name="redirectTo" value={location.pathname + location.search} />
          <ul className="flex flex-col">
            {localeCodes.map((candidate) => {
              const info = LOCALES[candidate];
              return (
                <li key={candidate}>
                  {candidate === locale ? (
                    <span
                      aria-current="true"
                      lang={info.htmlLang}
                      className="flex min-h-11 items-center rounded-lg bg-surface-muted px-3 font-medium"
                    >
                      {info.nativeName}
                    </span>
                  ) : (
                    <button
                      type="submit"
                      name="locale"
                      value={candidate}
                      lang={info.htmlLang}
                      className="flex min-h-11 w-full items-center rounded-lg px-3 text-start hover:bg-surface-muted"
                    >
                      {info.nativeName}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </Form>
      </Disclosure>
    </nav>
  );
}
