import { expect, test } from "@playwright/test";

import { expectAccessible } from "./a11y-check";
import { LOCALES, localised, ROUTES } from "./routes";

for (const locale of LOCALES) {
  for (const route of ROUTES) {
    test(`${localised(route, locale)} has one h1, named landmarks and passes WCAG 2.2`, async ({
      page,
    }, testInfo) => {
      await page.goto(localised(route, locale));
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.locator("html")).toHaveAttribute("lang", locale === "pt" ? "pt-PT" : "en");
      await expect(page.getByRole("banner")).toBeVisible();
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible();
      await expectAccessible(
        page,
        `${locale}${route.replace(/\//g, "-")}-${testInfo.project.name}`,
      );
    });
  }
}

// The open panel overlays the page by user action; it closes on Escape, outside click, focus
// leaving and navigation (keyboard.spec.ts), which is what SC 2.4.11 asks for. The engine cannot
// know that, so element_tabbable_unobscured is reviewed manually for this state only.
test("the open mobile menu passes WCAG 2.2", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "mobile layout only");
  await page.goto("/en");
  await page.getByLabel("Open menu").click();
  await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
  await expectAccessible(page, `en-menu-open-${testInfo.project.name}`, {
    manualReview: ["element_tabbable_unobscured"],
  });
});
