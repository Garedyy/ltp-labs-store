import { expect, type Page, test } from "@playwright/test";

import { expectAccessible } from "./a11y-check";

// States the route list cannot express: errors from fault injection, filled cart, invalid
// forms, open disclosures, and media emulation. Desktop project only (mobile menu is covered
// in a11y.spec.ts).

async function fillCart(page: Page) {
  await page.goto("/en/products/1");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.getByRole("status").filter({ hasText: "You now have" }).waitFor();
}

test.describe("accessibility of states", () => {
  test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "desktop project only");
  });

  test("service unavailable (502) page", async ({ page }, testInfo) => {
    const response = await page.goto("/en/products/999");
    expect(response?.status()).toBe(502);
    await expectAccessible(page, `state-502-${testInfo.project.name}`);
  });

  test("category service failure on the catalogue", async ({ page, context }, testInfo) => {
    // The mock answers 500 to categories?fail=1; the app never sends fail=1 itself, so route the
    // upstream request through a query rewrite.
    await context.route("**/products/categories", (route) =>
      route.continue({ url: route.request().url() + "?fail=1" }),
    );
    await page.goto("/en");
    await expectAccessible(page, `state-catalogue-error-${testInfo.project.name}`);
  });

  // The stepper and remove buttons are icon-only with aria-label names ("Decrease quantity of X",
  // "Remove X"): their visible label is the icon, which WCAG 2.5.3 allows. IBM asks a human to
  // confirm it (input_label_visible); the keyboard and VoiceOver protocol covers it.
  const cartReview = { manualReview: ["input_label_visible"] };

  test("filled cart, invalid quantity and invalid promo code", async ({ page }, testInfo) => {
    await fillCart(page);
    await page.goto("/en/cart");
    await expectAccessible(page, `state-cart-filled-${testInfo.project.name}`, cartReview);
    const quantity = page.getByRole("textbox", { name: /^Qty / });
    await quantity.fill("abc");
    await quantity.press("Tab");
    await expect(page.getByRole("alert")).toBeVisible();
    await page.getByRole("textbox", { name: "Promo code" }).fill("nope");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Unknown promo code" })).toBeVisible();
    await expectAccessible(page, `state-cart-errors-${testInfo.project.name}`, cartReview);
    await page.getByRole("textbox", { name: "Promo code" }).fill("LTP10");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByText("Code LTP10 applied", { exact: true })).toBeVisible();
    await expectAccessible(page, `state-cart-promo-${testInfo.project.name}`, cartReview);
  });

  test("checkout refused on an emptied cart", async ({ page, context }, testInfo) => {
    await fillCart(page);
    await page.goto("/en/cart");
    await context.clearCookies();
    await page.getByRole("button", { name: "Check out" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your cart is empty");
    await expect(page.getByRole("alert").filter({ hasText: "Your cart is empty" })).toBeFocused();
    await expectAccessible(page, `state-cart-empty-error-${testInfo.project.name}`);
  });

  test("add-to-cart status and the order confirmation", async ({ page }, testInfo) => {
    await fillCart(page);
    await expectAccessible(page, `state-product-added-${testInfo.project.name}`);
    await page.goto("/en/cart");
    await page.getByRole("button", { name: "Check out" }).click();
    await expect(page).toHaveURL(/confirmation$/);
    await expectAccessible(page, `state-confirmation-${testInfo.project.name}`);
  });

  test("cart reached through Buy now", async ({ page }, testInfo) => {
    await page.goto("/en/products/1");
    await page.getByRole("button", { name: "Buy now" }).click();
    await expect(page).toHaveURL(/\/en\/cart$/);
    await expect(page.getByRole("status").filter({ hasText: "Added to your cart" })).toBeVisible();
    await expectAccessible(page, `state-cart-buy-now-${testInfo.project.name}`, cartReview);
  });

  test("open language panel", async ({ page }, testInfo) => {
    await page.goto("/en");
    await page
      .getByRole("navigation", { name: "Language" })
      .locator("summary")
      .filter({ visible: true })
      .click();
    await expect(page.getByRole("button", { name: "Português" })).toBeVisible();
    await expectAccessible(page, `state-language-open-${testInfo.project.name}`, {
      manualReview: ["element_tabbable_unobscured"],
    });
  });

  test("reduced motion and forced colours emulation", async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en");
    await expectAccessible(page, `state-reduced-motion-${testInfo.project.name}`);
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/en/products/1");
    await expectAccessible(page, `state-forced-colors-${testInfo.project.name}`);
    await expect(page.getByRole("button", { name: "Add to cart" })).toBeVisible();
  });
});
