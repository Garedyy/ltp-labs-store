import { expect, type Page, test } from "@playwright/test";

import { expectAccessible } from "./a11y-check";
import { cookieValue, payByCard } from "./helpers";

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
    await page.goto("/en/shop");
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
    await page.getByRole("link", { name: "Check out" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your cart is empty");
    await expect(page.getByRole("alert").filter({ hasText: "Your cart is empty" })).toBeFocused();
    await expectAccessible(page, `state-cart-empty-error-${testInfo.project.name}`);
  });

  test("add-to-cart status, the payment page (card, PayPal, errors) and the confirmation", async ({
    page,
  }, testInfo) => {
    await fillCart(page);
    await expectAccessible(page, `state-product-added-${testInfo.project.name}`);
    await page.goto("/en/cart");
    await page.getByRole("link", { name: "Check out" }).click();
    await expect(page).toHaveURL(/\/en\/checkout$/);
    await expectAccessible(page, `state-checkout-card-${testInfo.project.name}`);
    await page.getByRole("radio", { name: "PayPal" }).check();
    // check() scrolled the radio into view; element_tabbable_unobscured reads the header links as
    // obscured once the page is scrolled, so the scan runs from the top like the other states.
    await page.evaluate(() => window.scrollTo(0, 0));
    await expectAccessible(page, `state-checkout-paypal-${testInfo.project.name}`);
    await page.getByRole("radio", { name: "Card" }).check();
    await payByCard(page, { email: "nope", cardNumber: "1234" });
    await expect(page.getByRole("textbox", { name: "Email address" })).toBeFocused();
    await expectAccessible(page, `state-checkout-errors-${testInfo.project.name}`);
    await payByCard(page);
    await expect(page).toHaveURL(/confirmation$/);
    await expectAccessible(page, `state-confirmation-${testInfo.project.name}`);
  });

  test("payment page in product mode (Buy now) with a filled cart", async ({ page }, testInfo) => {
    await fillCart(page);
    await page.goto("/en/products/2");
    await page.getByRole("button", { name: "Buy now" }).click();
    await expect(page).toHaveURL(/\/en\/checkout\?product=2$/);
    await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
    await expectAccessible(page, `state-checkout-buy-now-${testInfo.project.name}`);
    await payByCard(page);
    await expect(page).toHaveURL(/\/en\/checkout\/confirmation$/);
    await expectAccessible(page, `state-confirmation-buy-now-${testInfo.project.name}`);
  });

  test("contact form errors and the sent state", async ({ page }, testInfo) => {
    await page.goto("/en/contact");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByRole("textbox", { name: "Your name" })).toBeFocused();
    await expectAccessible(page, `state-contact-errors-${testInfo.project.name}`);
    await page.getByRole("textbox", { name: "Your name" }).fill("Ana");
    await page.getByRole("textbox", { name: "Email address" }).fill("ana@example.com");
    await page.getByRole("textbox", { name: "Message" }).fill("Hello");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page).toHaveURL(/sent=1$/);
    await expectAccessible(page, `state-contact-sent-${testInfo.project.name}`);
  });

  test("sign-in errors and the demo notice, with a last order", async ({ page }, testInfo) => {
    await page.goto("/en/account");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("textbox", { name: "Email address" })).toBeFocused();
    await expectAccessible(page, `state-account-errors-${testInfo.project.name}`);
    await page.getByRole("textbox", { name: "Email address" }).fill("ana@example.com");
    await page.getByLabel("Password").fill("secret");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/demo=1$/);
    await expectAccessible(page, `state-account-demo-${testInfo.project.name}`);
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

  test("open theme panel", async ({ page }, testInfo) => {
    await page.goto("/en");
    await page
      .locator("summary", { hasText: /Change theme/ })
      .filter({ visible: true })
      .click();
    await expect(page.getByRole("button", { name: "Dark" })).toBeVisible();
    await expectAccessible(page, `state-theme-open-${testInfo.project.name}`, {
      manualReview: ["element_tabbable_unobscured"],
    });
  });

  // The explicit dark theme (cookie, data-theme on <html>); the system preference without a
  // cookie is covered on every route by the dark-chromium project of a11y.spec.ts.
  test("explicit dark theme", async ({ page, context }, testInfo) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/en");
    await page
      .locator("summary", { hasText: /Change theme/ })
      .filter({ visible: true })
      .click();
    await page.getByRole("button", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await cookieValue(context, "theme")).toBe("dark");
    for (const route of [
      "/en",
      "/en/shop",
      "/en/products/1",
      "/en/cart",
      "/en/checkout?product=1",
    ]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await expectAccessible(
        page,
        `state-dark${route.replace(/[/?=]/g, "-")}-${testInfo.project.name}`,
      );
    }
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/en/products/1");
    await expectAccessible(page, `state-dark-forced-colors-${testInfo.project.name}`);
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
