import { expect, test } from "@playwright/test";

import { expectAccessible } from "./a11y-check";

test("the home page renders and passes the WCAG 2.2 scan", async ({ page }, testInfo) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectAccessible(page, `smoke-home-${testInfo.project.name}`);
});
