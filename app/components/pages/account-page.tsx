import { useTranslation } from "react-i18next";
import { Form, href, Link, useNavigation } from "react-router";

import { FormNotice } from "~/components/forms/form-notice";
import { TextField } from "~/components/forms/text-field";
import { useFocusFirstInvalid } from "~/components/forms/use-focus-first-invalid";
import { Button } from "~/components/ui/button";
import { DefinitionList } from "~/components/ui/definition-list";
import { useLocale } from "~/i18n/use-locale";
import { fieldProps, type FormFailure } from "~/lib/forms";
import type { LastOrder } from "~/services/cart/types";
import { PageHeader } from "./page-header";

export const SIGN_IN_FIELDS = ["email", "password"] as const;
export type SignInField = (typeof SIGN_IN_FIELDS)[number];
export type SignInResult = FormFailure<SignInField>;

export type AccountView = {
  cartCount: number;
  lastOrder?: LastOrder;
  sinceFormatted: string;
  languageName: string;
};

type AccountPageProps = { title: string; view: AccountView; demo: boolean; result?: SignInResult };

export function AccountPage({ title, view, demo, result }: AccountPageProps) {
  const { t } = useTranslation();
  const lang = useLocale();
  const navigation = useNavigation();
  const pending = navigation.formData?.get("intent") === "sign-in";
  useFocusFirstInvalid(result);
  const fields = fieldProps(SIGN_IN_FIELDS, result);
  const session = [
    {
      key: "cart",
      term: t("pages.account.session.cart"),
      description: (
        <>
          {t("pages.account.session.cartCount", { count: view.cartCount })}{" "}
          <Link to={href("/:lang/cart", { lang })}>{t("pages.account.session.viewCart")}</Link>
        </>
      ),
    },
    {
      key: "order",
      term: t("pages.account.session.lastOrder"),
      description: view.lastOrder ? (
        <>
          {t("pages.account.session.orderSummary", {
            number: view.lastOrder.number,
            total: view.lastOrder.totalFormatted,
          })}{" "}
          <Link to={href("/:lang/checkout/confirmation", { lang })}>
            {t("pages.account.session.viewOrder")}
          </Link>
        </>
      ) : (
        t("pages.account.session.noOrder")
      ),
    },
  ];
  const profile = [
    {
      key: "name",
      term: t("pages.account.profile.name"),
      description: t("pages.account.profile.nameValue"),
    },
    { key: "since", term: t("pages.account.profile.since"), description: view.sinceFormatted },
    { key: "language", term: t("pages.account.profile.language"), description: view.languageName },
  ];

  return (
    <div className="flex flex-col gap-10">
      <PageHeader title={title} intro={t("pages.account.intro")} />
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
        <section aria-labelledby="sign-in-heading" className="flex flex-col gap-4">
          <h2 id="sign-in-heading" className="text-h4 font-medium">
            {t("pages.account.signIn.heading")}
          </h2>
          {demo && <FormNotice>{t("pages.account.signIn.demo")}</FormNotice>}
          <Form
            method="post"
            noValidate
            aria-labelledby="sign-in-heading"
            className="flex flex-col gap-4"
          >
            <input type="hidden" name="intent" value="sign-in" />
            <TextField
              {...fields.email}
              label={t("pages.account.signIn.email")}
              type="email"
              autoComplete="email"
              inputMode="email"
            />
            <TextField
              {...fields.password}
              label={t("pages.account.signIn.password")}
              type="password"
              autoComplete="current-password"
            />
            <p className="text-body-sm text-fg-muted">{t("pages.account.signIn.note")}</p>
            <div>
              <Button
                type="submit"
                pending={pending}
                pendingLabel={t("pages.account.signIn.signingIn")}
              >
                {t("pages.account.signIn.submit")}
              </Button>
            </div>
          </Form>
        </section>
        <div className="flex flex-col gap-10">
          <section aria-labelledby="session-heading" className="flex flex-col gap-4">
            <h2 id="session-heading" className="text-h4 font-medium">
              {t("pages.account.session.heading")}
            </h2>
            <DefinitionList items={session} />
          </section>
          <section aria-labelledby="profile-heading" className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 id="profile-heading" className="text-h4 font-medium">
                {t("pages.account.profile.heading")}
              </h2>
              <p className="text-body-sm text-fg-muted">{t("pages.account.profile.note")}</p>
            </div>
            <DefinitionList items={profile} />
          </section>
        </div>
      </div>
    </div>
  );
}
