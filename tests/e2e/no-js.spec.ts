import { expect, test } from "@playwright/test";

import { openLanguagePanel } from "./helpers";

test("the home page and the catalogue render without JavaScript", async ({ page }) => {
  const home = await page.goto("/en");
  expect(home?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Trending products");
  const shop = await page.goto("/en/shop");
  expect(shop?.status()).toBe(200);
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
  await page.goto("/en/shop");
  await page.getByRole("combobox", { name: "Sort by" }).selectOption("price-desc");
  await page
    .locator("form", { has: page.getByRole("combobox") })
    .getByRole("button", { name: "Apply" })
    .click();
  await expect(page).toHaveURL(/\/en\/shop\?sort=price-desc$/);
  await page.getByRole("checkbox", { name: "Beauty" }).check();
  const applyFilter = page.locator("aside").getByRole("button", { name: "Apply" });
  await expect(applyFilter).toBeVisible();
  await applyFilter.click();
  await expect(page).toHaveURL(/\/en\/shop\?category=beauty&sort=price-desc$/);
  await expect(page.getByText("Showing 1–5 of 5")).toBeVisible();
  await page.getByRole("link", { name: "Clear filter" }).click();
  await expect(page).toHaveURL(/\/en\/shop\?sort=price-desc$/);
});

test("searching works without JavaScript", async ({ page }) => {
  await page.goto("/en/search");
  await page.getByRole("searchbox", { name: "Search products" }).fill("laptop");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/\/en\/search\?q=laptop$/);
  await expect(page.getByText(/Showing 1–\d+ of \d+/)).toBeVisible();
});

test("adding to the cart twice without JavaScript redirects back and a refresh does not re-add", async ({
  page,
}) => {
  await page.goto("/en/products/1");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page).toHaveURL(/\/en\/products\/1$/);
  await expect(page.getByRole("status").filter({ hasText: "You now have 1 item." })).toBeFocused();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByRole("link", { name: "Cart, 2 items" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("link", { name: "Cart, 2 items" })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "You now have" })).toHaveCount(0);
});

test("Buy now without JavaScript lands on the confirmation and keeps the cart", async ({
  page,
}) => {
  await page.goto("/en/products/2");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
  await page.goto("/en/products/1");
  await page.getByRole("button", { name: "Buy now" }).click();
  await expect(page).toHaveURL(/\/en\/checkout\/confirmation$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Thank you/);
  await expect(page.getByRole("definition").filter({ hasText: "$29.99" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Thank you/);
  await page.goto("/en/cart");
  await expect(page.getByRole("list", { name: "Items" }).getByRole("listitem")).toHaveCount(1);
});

test("the cart works without JavaScript: stepper, promo, remove, checkout", async ({ page }) => {
  await page.goto("/en/products/1");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.goto("/en/products/2");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.goto("/en/cart");
  const mascara = page.getByRole("textbox", { name: "Qty Essence Mascara Lash Princess" });
  await page
    .getByRole("button", { name: "Increase quantity of Essence Mascara Lash Princess" })
    .click();
  await expect(page).toHaveURL(/\/en\/cart$/);
  await expect(page.getByRole("status").filter({ hasText: "updated to 2" })).toBeFocused();
  await expect(mascara).toHaveValue("2");
  await page
    .getByRole("button", { name: "Decrease quantity of Essence Mascara Lash Princess" })
    .click();
  await expect(page.getByRole("status").filter({ hasText: "updated to 1" })).toBeFocused();
  await expect(mascara).toHaveValue("1");
  await page.getByRole("textbox", { name: "Promo code" }).fill("LTP10");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByText("Code LTP10 applied", { exact: true })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Code LTP10 applied" })).toBeFocused();
  await page.getByRole("button", { name: "Remove code" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Promo code removed" })).toBeFocused();
  await expect(page.getByRole("textbox", { name: "Promo code" })).toBeVisible();
  await page.getByRole("button", { name: "Remove Eyeshadow Palette with Mirror" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Eyeshadow Palette with Mirror removed" }),
  ).toBeFocused();
  await expect(page.getByRole("list", { name: "Items" }).getByRole("listitem")).toHaveCount(1);
  await mascara.fill("x");
  await mascara.press("Enter");
  await expect(page.getByRole("alert")).toContainText("Enter a whole number");
  await expect(mascara).toBeFocused();
  await page.getByRole("button", { name: "Check out" }).click();
  await expect(page).toHaveURL(/\/en\/checkout\/confirmation$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Thank you/);
});

test("checking out a cart emptied elsewhere without JavaScript redirects back with the error", async ({
  page,
  context,
}) => {
  await page.goto("/en/products/1");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.goto("/en/cart");
  await context.clearCookies();
  await page.getByRole("button", { name: "Check out" }).click();
  await expect(page).toHaveURL(/\/en\/cart$/);
  await expect(page.getByRole("alert").filter({ hasText: "Your cart is empty" })).toBeFocused();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your cart is empty");
});
