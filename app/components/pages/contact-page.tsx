import { useTranslation } from "react-i18next";
import { Form, href, Link, useNavigation } from "react-router";

import { FormNotice } from "~/components/forms/form-notice";
import { TextField } from "~/components/forms/text-field";
import { useFocusFirstInvalid } from "~/components/forms/use-focus-first-invalid";
import { Button } from "~/components/ui/button";
import { DefinitionList } from "~/components/ui/definition-list";
import { useLocale } from "~/i18n/use-locale";
import { fieldProps, type FormFailure } from "~/lib/forms";
import { PageHeader } from "./page-header";

export const CONTACT_FIELDS = ["name", "email", "message"] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];
export type ContactResult = FormFailure<ContactField>;

type ContactPageProps = { title: string; sent: boolean; result?: ContactResult };

export function ContactPage({ title, sent, result }: ContactPageProps) {
  const { t } = useTranslation();
  const lang = useLocale();
  const navigation = useNavigation();
  const pending = navigation.formData?.get("intent") === "send";
  useFocusFirstInvalid(result);
  const fields = fieldProps(CONTACT_FIELDS, result);
  const email = t("pages.contact.details.emailValue");
  const details = [
    {
      key: "address",
      term: t("pages.contact.details.address"),
      description: t("pages.contact.details.addressValue"),
    },
    {
      key: "email",
      term: t("pages.contact.details.email"),
      description: <a href={`mailto:${email}`}>{email}</a>,
    },
    {
      key: "phone",
      term: t("pages.contact.details.phone"),
      description: t("pages.contact.details.phoneValue"),
    },
    {
      key: "hours",
      term: t("pages.contact.details.hours"),
      description: t("pages.contact.details.hoursValue"),
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      <PageHeader title={title} intro={t("pages.contact.intro")} />
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
        <section aria-labelledby="details-heading" className="flex flex-col gap-4">
          <h2 id="details-heading" className="text-h4 font-medium">
            {t("pages.contact.details.heading")}
          </h2>
          <DefinitionList items={details} />
        </section>
        <section aria-labelledby="form-heading" className="flex flex-col gap-4">
          <h2 id="form-heading" className="text-h4 font-medium">
            {t("pages.contact.form.heading")}
          </h2>
          {sent ? (
            <FormNotice>
              {t("pages.contact.sent.body")}{" "}
              <Link to={href("/:lang/contact", { lang })}>{t("pages.contact.sent.another")}</Link>
            </FormNotice>
          ) : (
            <Form
              method="post"
              noValidate
              aria-labelledby="form-heading"
              className="flex flex-col gap-4"
            >
              <input type="hidden" name="intent" value="send" />
              <TextField
                {...fields.name}
                label={t("pages.contact.form.name")}
                autoComplete="name"
              />
              <TextField
                {...fields.email}
                label={t("pages.contact.form.email")}
                type="email"
                autoComplete="email"
                inputMode="email"
              />
              <TextField {...fields.message} label={t("pages.contact.form.message")} multiline />
              <p className="text-body-sm text-fg-muted">{t("pages.contact.form.note")}</p>
              <div>
                <Button
                  type="submit"
                  pending={pending}
                  pendingLabel={t("pages.contact.form.sending")}
                >
                  {t("pages.contact.form.submit")}
                </Button>
              </div>
            </Form>
          )}
        </section>
      </div>
    </div>
  );
}
