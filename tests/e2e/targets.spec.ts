import { expect, type Locator, test } from "@playwright/test";

// WCAG 2.5.5 level: every control the project renders is at least 44 px tall (ACCESSIBILITY.md).
// Stretched card links and links inside sentences are the documented exceptions, so this checks
// the shell landmarks and the two buttons that used to render at 36 px.
async function expectTallEnough(controls: Locator) {
  const count = await controls.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i += 1) {
    const control = controls.nth(i);
    const box = await control.boundingBox();
    expect(box, await control.evaluate((el) => el.outerHTML)).not.toBeNull();
    expect(box?.height, await control.evaluate((el) => el.outerHTML)).toBeGreaterThanOrEqual(44);
  }
}

const CONTROLS = "a[href], button, summary";

test("header and footer controls are at least 44 px tall", async ({ page }) => {
  await page.goto("/en");
  await page.evaluate(() => document.fonts.ready);
  await expectTallEnough(page.getByRole("banner").locator(CONTROLS).filter({ visible: true }));
  await expectTallEnough(page.getByRole("contentinfo").locator(CONTROLS).filter({ visible: true }));
});

// With JavaScript the sort Apply button is sr-only until focused, so it is measured focused.
test("the sort Apply button is at least 44 px tall", async ({ page }) => {
  await page.goto("/en/shop");
  const apply = page
    .locator("form", { has: page.getByRole("combobox") })
    .getByRole("button", { name: "Apply" });
  await apply.focus();
  await expect(apply).toBeFocused();
  await expectTallEnough(apply);
});

test("the Remove code button is at least 44 px tall", async ({ page }) => {
  await page.goto("/en/products/1");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByRole("status").filter({ hasText: "You now have 1 item" })).toBeVisible();
  await page.goto("/en/cart");
  await page.getByRole("textbox", { name: "Promo code" }).fill("LTP10");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByText("Code LTP10 applied", { exact: true })).toBeVisible();
  await expectTallEnough(page.getByRole("button", { name: "Remove code" }));
});
