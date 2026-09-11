import { expect, test } from "@playwright/test";

import { expectAccessible } from "./a11y-check";
import { LOCALES, localised, ROUTES } from "./routes";

for (const locale of LOCALES) {
  for (const route of ROUTES) {
    test(`${localised(route, locale)} renders one h1 and passes the WCAG 2.2 scan`, async ({
      page,
    }, testInfo) => {
      await page.goto(localised(route, locale));
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.locator("html")).toHaveAttribute("lang", locale === "pt" ? "pt-PT" : "en");
      await expectAccessible(
        page,
        `${locale}${route.replace(/\//g, "-")}-${testInfo.project.name}`,
      );
    });
  }
}
