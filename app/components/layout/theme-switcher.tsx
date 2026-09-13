import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Form, href, useLocation } from "react-router";

import { Disclosure } from "~/components/ui/disclosure";
import { Icon, type IconName } from "~/components/ui/icon";
import { VisuallyHidden } from "~/components/ui/visually-hidden";
import { useLocale } from "~/i18n/use-locale";
import { type Theme, THEMES } from "~/theme/config";
import { useTheme } from "~/theme/use-theme";
import { useAnnounce } from "./announcer";

const ICONS: Record<Theme, IconName> = { system: "contrast", light: "sun", dark: "moon" };

// A <details> pill like the language switcher; the panel is a POST form so the choice works
// without JavaScript. The redirect keeps the pathname, so the route announcer stays silent: the
// instance that submitted closes its panel, takes the focus back and announces the new theme.
export function ThemeSwitcher() {
  const { t } = useTranslation();
  const locale = useLocale();
  const theme = useTheme();
  const location = useLocation();
  const announce = useAnnounce();
  const root = useRef<HTMLDivElement>(null);
  const submitted = useRef(false);
  const name = t(`common.theme.${theme}`);

  useEffect(() => {
    if (!submitted.current) return;
    submitted.current = false;
    const details = root.current?.querySelector("details");
    if (details) details.open = false;
    details?.querySelector("summary")?.focus();
    announce(t("common.theme.applied", { name }));
  }, [theme, name, announce, t]);

  return (
    <div ref={root} className="relative">
      <Disclosure
        summaryClassName="inline-flex min-h-11 items-center gap-1 rounded-xl border border-border px-3 text-tagline font-medium text-primary hover:bg-surface-muted motion-safe:transition motion-safe:duration-150 active:scale-[0.97]"
        summary={
          <>
            <Icon name={ICONS[theme]} className="size-5" />
            <VisuallyHidden>{t("common.theme.current", { name })}</VisuallyHidden>
            <Icon
              name="chevronDown"
              className="size-4 group-open:rotate-180 motion-safe:transition-transform"
            />
          </>
        }
      >
        <Form
          method="post"
          action={href("/:lang/set-theme", { lang: locale })}
          onSubmit={() => {
            submitted.current = true;
          }}
          className="absolute end-0 z-40 mt-2 min-w-40 origin-top rounded-xl border border-border bg-surface p-2 shadow-header motion-safe:animate-pop-in"
        >
          <input type="hidden" name="redirectTo" value={location.pathname + location.search} />
          <ul className="flex flex-col">
            {THEMES.map((candidate) => (
              <li key={candidate}>
                {candidate === theme ? (
                  <span
                    aria-current="true"
                    className="flex min-h-11 items-center gap-2 rounded-lg bg-surface-muted px-3 font-medium"
                  >
                    <Icon name={ICONS[candidate]} className="size-4" />
                    {t(`common.theme.${candidate}`)}
                  </span>
                ) : (
                  <button
                    type="submit"
                    name="theme"
                    value={candidate}
                    className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-start hover:bg-surface-muted"
                  >
                    <Icon name={ICONS[candidate]} className="size-4" />
                    {t(`common.theme.${candidate}`)}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Form>
      </Disclosure>
    </div>
  );
}
