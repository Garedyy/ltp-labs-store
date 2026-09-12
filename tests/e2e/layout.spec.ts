import { expect, type Page, test } from "@playwright/test";

// The shell fills the viewport: on short pages the footer sits on the bottom edge, on long pages
// it ends with the document (#26).
const SHORT_ROUTES = ["/en/about", "/en/nowhere", "/en/cart", "/en/checkout/confirmation"];

async function footerBottom(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => {
    const footer = document.querySelector("footer");
    if (!footer) throw new Error("no footer");
    return {
      footerBottom: footer.getBoundingClientRect().bottom + window.scrollY,
      viewportHeight: window.innerHeight,
      documentHeight: document.documentElement.scrollHeight,
    };
  });
}

for (const route of SHORT_ROUTES) {
  test(`${route}: the footer reaches the bottom of the viewport`, async ({ page }) => {
    await page.goto(route);
    const { footerBottom: bottom, viewportHeight, documentHeight } = await footerBottom(page);
    expect(documentHeight).toBe(viewportHeight);
    expect(Math.abs(bottom - viewportHeight)).toBeLessThanOrEqual(1);
  });
}

test("/en: the footer ends with the document on a long page", async ({ page }) => {
  await page.goto("/en");
  const { footerBottom: bottom, viewportHeight, documentHeight } = await footerBottom(page);
  expect(documentHeight).toBeGreaterThan(viewportHeight);
  expect(Math.abs(bottom - documentHeight)).toBeLessThanOrEqual(1);
});
