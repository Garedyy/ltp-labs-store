import { expect, type Page, test } from "@playwright/test";

import { LOCALES, localised, ROUTES } from "./routes";

// The shell fills the viewport: on short pages the footer sits on the bottom edge, on long pages
// it ends with the document (#26).
const SHORT_ROUTES = ["/en/nowhere", "/en/cart", "/en/checkout/confirmation"];

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

test("/en/shop: the footer ends with the document on a long page", async ({ page }) => {
  await page.goto("/en/shop");
  const { footerBottom: bottom, viewportHeight, documentHeight } = await footerBottom(page);
  expect(documentHeight).toBeGreaterThan(viewportHeight);
  expect(Math.abs(bottom - documentHeight)).toBeLessThanOrEqual(1);
});

// Page enter (#43): a CSS keyframe on the keyed page wrapper, so it also runs on a full-page load.
// The suite runs under reduced motion (playwright.config.ts); these tests opt back in.
test("the page content enters with an animation, except under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/en");
  const wrapper = page.locator("main [data-page]");
  const animation = () => wrapper.evaluate((el) => getComputedStyle(el).animationName);
  expect(await animation()).toBe("page-enter");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await animation()).toBe("none");
});

test("a client-side navigation replays the page enter and keeps the focus on main", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/en");
  await page.locator("main [data-page]").evaluate((el) => el.setAttribute("data-marker", "1"));
  await page.getByRole("main").getByRole("link", { name: "Browse the shop" }).click();
  await expect(page).toHaveURL(/\/en\/shop$/);
  await expect(page.locator("main [data-page]")).not.toHaveAttribute("data-marker", "1");
  await expect(page.getByRole("main")).toBeFocused();
});

// Every use of the motion scale is gated by motion-safe:, so under reduced motion no element on
// any route carries a keyframe and nothing longer than the 0.01 ms kill switch runs after the load.
test("nothing animates on any route under reduced motion", async ({ page }) => {
  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      await page.goto(localised(route, locale));
      const moving = await page.evaluate(() => ({
        running: document
          .getAnimations()
          .filter((animation) => Number(animation.effect?.getComputedTiming().duration) > 1).length,
        keyframed: [...document.querySelectorAll("body *")].filter(
          (el) => getComputedStyle(el).animationName !== "none",
        ).length,
      }));
      expect(moving, `${locale} ${route}`).toEqual({ running: 0, keyframed: 0 });
    }
  }
});
