import { useTranslation } from "react-i18next";

import { PageHeader } from "./page-header";

const VALUES = ["honesty", "prices", "people"] as const;
const MEMBERS = ["ines", "rui", "leonor"] as const;

function initials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0] ?? "")
    .join("");
}

export function AboutPage({ title }: { title: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-10">
      <PageHeader title={title} intro={t("pages.about.intro")} />
      <section aria-labelledby="story-heading" className="flex max-w-prose flex-col gap-4">
        <h2 id="story-heading" className="text-h4 font-medium">
          {t("pages.about.story.heading")}
        </h2>
        <p>{t("pages.about.story.p1")}</p>
        <p>{t("pages.about.story.p2")}</p>
        <p>{t("pages.about.story.p3")}</p>
      </section>
      <section aria-labelledby="values-heading" className="flex flex-col gap-4">
        <h2 id="values-heading" className="text-h4 font-medium">
          {t("pages.about.values.heading")}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {VALUES.map((value) => (
            <li key={value} className="rounded-2xl border border-border p-6">
              <h3 className="text-h5 font-medium">{t(`pages.about.values.${value}.title`)}</h3>
              <p className="mt-2 text-body-sm">{t(`pages.about.values.${value}.body`)}</p>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="team-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="team-heading" className="text-h4 font-medium">
            {t("pages.about.team.heading")}
          </h2>
          <p className="text-body-sm text-fg-muted">{t("pages.about.team.note")}</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-3">
          {MEMBERS.map((member) => {
            const name = t(`pages.about.team.members.${member}.name`);
            return (
              <li
                key={member}
                className="flex items-center gap-4 rounded-2xl border border-border p-4"
              >
                <span
                  aria-hidden="true"
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-muted font-medium text-primary"
                >
                  {initials(name)}
                </span>
                <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-body-sm text-fg-muted">
                    {t(`pages.about.team.members.${member}.role`)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
