import { useTranslation } from "react-i18next";
import { href } from "react-router";

import { ButtonLink } from "~/components/ui/button";
import { useLocale } from "~/i18n/use-locale";

export function EmptyCart() {
  const { t } = useTranslation();
  const lang = useLocale();
  return (
    <div className="mx-auto max-w-prose py-8 text-center">
      <h1 id="cart-heading" tabIndex={-1} className="text-h2 md:text-h1">
        {t("cart.empty.title")}
      </h1>
      <p className="mt-4">{t("cart.empty.body")}</p>
      <div className="mt-8">
        <ButtonLink to={href("/:lang", { lang })}>{t("cart.empty.action")}</ButtonLink>
      </div>
    </div>
  );
}
