import { expect, test } from "@playwright/test";

import { payByCard } from "./helpers";

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

test("on a phone the categories are shown in place under the toolbar without JavaScript", async ({
  page,
}) => {
  await page.setViewportSize({ width: 412, height: 915 });
  await page.goto("/en/shop");
  await expect(page.getByRole("button", { name: "Categories" })).toBeHidden();
  const beauty = page.getByRole("checkbox", { name: "Beauty" });
  await expect(beauty).toBeVisible();
  const toolbarBottom = await page
    .getByText("Showing 1–9 of 194")
    .boundingBox()
    .then((box) => (box ? box.y + box.height : Infinity));
  const panelTop = (await page.getByRole("complementary").boundingBox())?.y ?? 0;
  const gridTop = (await page.getByRole("article").first().boundingBox())?.y ?? 0;
  expect(panelTop).toBeGreaterThan(toolbarBottom);
  expect(panelTop).toBeLessThan(gridTop);
  await beauty.check();
  await page.locator("aside").getByRole("button", { name: "Apply" }).click();
  await expect(page).toHaveURL(/\/en\/shop\?category=beauty$/);
  await expect(page.getByText("Showing 1–5 of 5")).toBeVisible();
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

test("Buy now without JavaScript opens the payment page, then the confirmation, and keeps the cart", async ({
  page,
}) => {
  await page.goto("/en/products/2");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
  await page.goto("/en/products/1");
  await page.getByRole("button", { name: "Buy now" }).click();
  await expect(page).toHaveURL(/\/en\/checkout\?product=1$/);
  await expect(page.getByRole("textbox", { name: "Card number" })).toBeVisible();
  await payByCard(page);
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
  await page.getByRole("link", { name: "Check out" }).click();
  await expect(page).toHaveURL(/\/en\/checkout$/);
  await payByCard(page, { cardNumber: "1111" });
  await expect(page).toHaveURL(/\/en\/checkout$/);
  const cardNumber = page.getByRole("textbox", { name: "Card number" });
  await expect(cardNumber).toBeFocused();
  await expect(cardNumber).toHaveAccessibleDescription(/Enter a valid card number/);
  await expect(page.getByRole("textbox", { name: "Full name" })).toHaveValue("Ana Demo");
  // The card number, expiry and security code are never echoed back by the server.
  await expect(page.getByRole("textbox", { name: "Card number" })).toHaveValue("");
  await expect(page.getByRole("textbox", { name: "Expiry date (MM/YY)" })).toHaveValue("");
  await expect(page.getByRole("textbox", { name: "Security code" })).toHaveValue("");
  await payByCard(page);
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
  await page.getByRole("link", { name: "Check out" }).click();
  await expect(page).toHaveURL(/\/en\/cart$/);
  await expect(page.getByRole("alert").filter({ hasText: "Your cart is empty" })).toBeFocused();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your cart is empty");
});

test("the contact and sign-in forms work without JavaScript", async ({ page }) => {
  await page.goto("/en/contact");
  await page.getByRole("textbox", { name: "Email address" }).fill("nope");
  await page.getByRole("button", { name: "Send message" }).click();
  const name = page.getByRole("textbox", { name: "Your name" });
  await expect(name).toBeFocused();
  await expect(name).toHaveAccessibleDescription(/This field is required/);
  await expect(page.getByRole("textbox", { name: "Email address" })).toHaveValue("nope");
  await name.fill("Ana");
  await page.getByRole("textbox", { name: "Email address" }).fill("ana@example.com");
  await page.getByRole("textbox", { name: "Message" }).fill("Hello");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page).toHaveURL(/\/en\/contact\?sent=1$/);
  await expect(page.getByRole("status").filter({ hasText: "nothing was sent" })).toBeFocused();

  await page.goto("/en/account");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("textbox", { name: "Email address" })).toBeFocused();
  await page.getByRole("textbox", { name: "Email address" }).fill("ana@example.com");
  await page.getByLabel("Password").fill("secret");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/en\/account\?demo=1$/);
  await expect(page.getByRole("status").filter({ hasText: "Sign-in is a demo" })).toBeFocused();
});

test("the card fields fold and unfold with the payment method without JavaScript", async ({
  page,
}) => {
  await page.goto("/en/products/1");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.goto("/en/cart");
  await page.getByRole("link", { name: "Or pay with PayPal" }).click();
  await expect(page).toHaveURL(/\/en\/checkout\?method=paypal$/);
  await expect(page.getByRole("radio", { name: "PayPal" })).toBeChecked();
  await expect(page.getByRole("textbox", { name: "Card number" })).toBeHidden();
  await page.getByRole("radio", { name: "Card" }).check();
  await expect(page.getByRole("textbox", { name: "Card number" })).toBeVisible();
  await payByCard(page);
  await expect(page).toHaveURL(/\/en\/checkout\/confirmation$/);
  await expect(page.getByRole("definition").filter({ hasText: "Card" })).toBeVisible();
});
