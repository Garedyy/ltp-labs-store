import { expect, test } from "@playwright/test";

import { LOCALES, localised, ROUTES } from "./routes";

// WCAG 1.4.10 (reflow at 320 px) and 1.4.12 (text spacing): no horizontal scrolling anywhere.
const TEXT_SPACING_CSS = `
  * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
  p { margin-bottom: 2em !important; }
`;

test.use({ viewport: { width: 320, height: 256 } });

for (const locale of LOCALES) {
  for (const route of ROUTES) {
    test(`${localised(route, locale)} reflows at 320 px, also with WCAG text spacing`, async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name !== "desktop-chromium" && testInfo.project.name !== "pt",
        "one viewport per locale",
      );
      await page.goto(localised(route, locale), { waitUntil: "domcontentloaded" });
      await page.evaluate(() => document.fonts.ready);
      const width = () => page.evaluate(() => document.documentElement.scrollWidth);
      expect(await width()).toBeLessThanOrEqual(320);
      await page.addStyleTag({ content: TEXT_SPACING_CSS });
      expect(await width()).toBeLessThanOrEqual(320);
    });
  }
}

test("a filled cart reflows at 320 px", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "one project is enough");
  await page.goto("/en/products/78");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.getByRole("status").filter({ hasText: "You now have" }).waitFor();
  await page.goto("/en/cart");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.getByLabel("Open menu").click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
