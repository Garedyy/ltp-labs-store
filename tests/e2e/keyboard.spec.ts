import { expect, type Page, test } from "@playwright/test";

async function activeElementId(page: Page) {
  return page.evaluate(() => document.activeElement?.id ?? document.activeElement?.tagName);
}

test("the skip link is the first tab stop and moves focus to main", async ({ page }) => {
  await page.goto("/en");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  expect(await activeElementId(page)).toBe("main");
});

test("desktop tab order follows the DOM: brand, nav, actions, switcher", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "desktop layout only");
  await page.goto("/en");
  const expected = [
    "Skip to main content",
    "The Online Store",
    "Home",
    "Shop",
    "About",
    "Contact",
    "Blog",
    "Search",
    "Account",
    "Cart, empty",
  ];
  for (const name of expected) {
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveAccessibleName(name);
  }
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toHaveAccessibleName("EN, English. Change language");
});

test("Escape closes the language panel and returns focus to its summary", async ({ page }) => {
  await page.goto("/en");
  const menuToggle = page.getByLabel("Open menu");
  if (await menuToggle.isVisible()) await menuToggle.click();
  const summary = page
    .getByRole("navigation", { name: "Language" })
    .locator("summary")
    .filter({ visible: true });
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Português" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Português" })).toBeHidden();
  await expect(summary).toBeFocused();
});

test("mobile menu: Escape restores focus; navigating closes it and focuses main", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "mobile layout only");
  await page.goto("/en");
  const toggle = page.getByLabel("Open menu");
  const menuAbout = page.getByRole("banner").getByRole("link", { name: "About" });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(menuAbout).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menuAbout).toBeHidden();
  await expect(toggle).toBeFocused();

  await page.keyboard.press("Enter");
  await menuAbout.click();
  await expect(page).toHaveURL(/\/en\/about$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("About us");
  expect(await activeElementId(page)).toBe("main");
  await expect(page.getByRole("banner").getByRole("link", { name: "Contact" })).toBeHidden();
});

test("client navigation announces the new title and focuses main", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("contentinfo").getByRole("link", { name: "Contact" }).click();
  await expect(page).toHaveURL(/\/en\/contact$/);
  expect(await activeElementId(page)).toBe("main");
  await expect(
    page.getByRole("status").filter({ hasText: "Contact — The Online Store" }),
  ).toHaveCount(1);
});
