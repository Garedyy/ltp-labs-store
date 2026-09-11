import { useTranslation } from "react-i18next";
import { href } from "react-router";

import { ButtonLink } from "~/components/ui/button";
import { useLocale } from "~/i18n/use-locale";

export function ComingSoon({ title }: { title: string }) {
  const { t } = useTranslation();
  const lang = useLocale();
  return (
    <div className="mx-auto max-w-prose py-8 text-center">
      <h1 className="text-h2 md:text-h1">{title}</h1>
      <p className="mt-4">{t("pages.comingSoon.body")}</p>
      <div className="mt-8">
        <ButtonLink to={href("/:lang", { lang })}>{t("pages.comingSoon.backHome")}</ButtonLink>
      </div>
    </div>
  );
}
