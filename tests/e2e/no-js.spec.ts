import { expect, test } from "@playwright/test";

import { openLanguagePanel } from "./helpers";

test("the catalogue renders without JavaScript", async ({ page }) => {
  const response = await page.goto("/en");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Shop");
});

test("the language switcher works without JavaScript", async ({ page }) => {
  await page.goto("/en/nowhere?x=1");
  await openLanguagePanel(page, "Language");
  await page.getByRole("button", { name: "Português" }).click();
  await expect(page).toHaveURL(/\/pt\/nowhere\?x=1$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-PT");
});
