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

test("sorting and filtering work without JavaScript through the GET forms", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("combobox", { name: "Sort by" }).selectOption("price-desc");
  await page
    .locator("form", { has: page.getByRole("combobox") })
    .getByRole("button", { name: "Apply" })
    .click();
  await expect(page).toHaveURL(/\/en\?sort=price-desc$/);
  await page.getByRole("checkbox", { name: "Beauty" }).check();
  const applyFilter = page.locator("aside").getByRole("button", { name: "Apply" });
  await expect(applyFilter).toBeVisible();
  await applyFilter.click();
  await expect(page).toHaveURL(/\/en\?category=beauty&sort=price-desc$/);
  await expect(page.getByText("Showing 1–5 of 5")).toBeVisible();
  await page.getByRole("link", { name: "Clear filter" }).click();
  await expect(page).toHaveURL(/\/en\?sort=price-desc$/);
});

test("searching works without JavaScript", async ({ page }) => {
  await page.goto("/en/search");
  await page.getByRole("searchbox", { name: "Search products" }).fill("laptop");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/\/en\/search\?q=laptop$/);
  await expect(page.getByText(/Showing 1–\d+ of \d+/)).toBeVisible();
});
