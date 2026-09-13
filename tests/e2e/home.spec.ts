import { expect, test } from "@playwright/test";

import { precedes } from "./helpers";

test.describe("home", () => {
  test("lists the eight best-rated products and links to the shop", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveTitle("Trending products - The Online Store");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Trending products");
    const grid = page.getByRole("list", { name: "Trending products" });
    const cards = grid.getByRole("listitem");
    await expect(cards).toHaveCount(8);
    await expect(cards.first().getByRole("link")).toHaveText("Amazon Echo Plus");
    await expect(cards.first().getByRole("link")).toHaveAttribute("href", "/en/products/99");
    await expect(cards.nth(1).getByRole("link")).toHaveText("Huawei Matebook X Pro");
    await expect(page.getByRole("combobox", { name: "Sort by" })).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Pagination" })).toHaveCount(0);
    const browse = page.getByRole("main").getByRole("link", { name: "Browse the shop" });
    const seeMore = page.getByRole("main").getByRole("link", { name: "See more" });
    await expect(browse).toHaveAttribute("href", "/en/shop");
    await expect(seeMore).toHaveAttribute("href", "/en/shop");
    expect(await precedes(browse, grid)).toBe(true);
    expect(await precedes(grid, seeMore)).toBe(true);
    await browse.click();
    await expect(page).toHaveURL(/\/en\/shop$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Shop");
  });

  // The landing page opens with more motion than the other pages (#43, D-18): the header comes
  // in three beats, the cards cascade in, See more follows. The suite runs under reduced motion;
  // this test opts back in.
  test("the header, the trending cards and See more enter in sequence, except under reduced motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/en");
    const hero = page.getByRole("heading", { level: 1 });
    const main = page.getByRole("main");
    const cards = page.getByRole("list", { name: "Trending products" }).getByRole("listitem");
    const timing = (el: Element) => {
      const style = getComputedStyle(el);
      return `${style.animationName} ${style.animationDelay}`;
    };
    expect(await hero.evaluate(timing)).toBe("hero-enter 0s");
    expect(await main.getByText("Our best-rated products", { exact: false }).evaluate(timing)).toBe(
      "hero-enter 0.12s",
    );
    expect(await main.getByRole("link", { name: "Browse the shop" }).evaluate(timing)).toBe(
      "hero-enter 0.24s",
    );
    expect(
      await cards.evaluateAll((items) =>
        items.map((item) => getComputedStyle(item).animationDelay),
      ),
    ).toEqual(["0s", "0.08s", "0.16s", "0.24s", "0.32s", "0.4s", "0.48s", "0.56s"]);
    // fill-mode both keeps a finished card animation listed: wait until none is still running.
    await expect
      .poll(
        () =>
          page.evaluate(
            () => document.getAnimations().filter((a) => a.playState !== "finished").length,
          ),
        { timeout: 3000 },
      )
      .toBe(0);
    await expect(cards.last()).toBeVisible();
    await expect(main.getByRole("link", { name: "See more" })).toBeVisible();
    // A control focused before its turn loses its delay (never an invisible focus target) and
    // stays revealed after the focus leaves; a late focus and blur never hide it again.
    await page.goto("/en");
    const seeMore = main.getByRole("link", { name: "See more" });
    const seeMoreBox = seeMore.locator("xpath=..");
    await seeMore.focus();
    expect(await seeMoreBox.evaluate(timing)).toBe("hero-enter 0s");
    await cards.last().getByRole("link").focus();
    expect(await cards.last().evaluate(timing)).toBe("card-enter 0s");
    expect(await seeMoreBox.evaluate(timing)).toBe("hero-enter 0s");
    await hero.evaluate((el) => {
      el.setAttribute("tabindex", "-1");
      (el as HTMLElement).focus();
    });
    expect(await cards.last().evaluate(timing)).toBe("card-enter 0s");
    await expect
      .poll(() => seeMoreBox.evaluate((el) => getComputedStyle(el).opacity), { timeout: 3000 })
      .toBe("1");
    await seeMore.focus();
    await hero.evaluate((el) => (el as HTMLElement).focus());
    await page.waitForTimeout(100);
    expect(await seeMoreBox.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await hero.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
    expect(
      await cards.evaluateAll((items) =>
        items.every((item) => getComputedStyle(item).animationName === "none"),
      ),
    ).toBe(true);
  });

  test("Home and Shop each carry aria-current on their own page", async ({ page }) => {
    await page.goto("/en");
    const menuToggle = page.getByLabel("Open menu");
    if (await menuToggle.isVisible()) await menuToggle.click();
    const nav = page.getByRole("navigation", { name: "Main" }).filter({ visible: true });
    const home = nav.getByRole("link", { name: "Home" });
    const shop = nav.getByRole("link", { name: "Shop" });
    await expect(home).toHaveAttribute("aria-current", "page");
    await expect(shop).not.toHaveAttribute("aria-current", "page");
    await expect(shop).toHaveAttribute("href", "/en/shop");
    await shop.click();
    await expect(page).toHaveURL(/\/en\/shop$/);
    if (await menuToggle.isVisible()) await menuToggle.click();
    await expect(shop).toHaveAttribute("aria-current", "page");
    await expect(home).not.toHaveAttribute("aria-current", "page");
    await expect(home).toHaveAttribute("href", "/en");
  });

  test("catalogue URLs from before the split redirect permanently to the shop", async ({
    page,
  }) => {
    const response = await page.request.get("/en?category=beauty&sort=price-asc&page=2", {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(301);
    expect(response.headers().location).toBe("/en/shop?category=beauty&sort=price-asc&page=2");
    await page.goto("/pt?page=2");
    await expect(page).toHaveURL(/\/pt\/shop\?page=2$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Loja - página 2");
  });

  test("Portuguese: the home page is translated and product titles keep lang=en", async ({
    page,
  }) => {
    await page.goto("/pt");
    await expect(page).toHaveTitle("Produtos em destaque - The Online Store");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Produtos em destaque");
    const browse = page.getByRole("main").getByRole("link", { name: "Ver a loja" });
    const seeMore = page.getByRole("main").getByRole("link", { name: "Ver mais" });
    const grid = page.getByRole("list", { name: "Produtos em destaque" });
    await expect(browse).toHaveAttribute("href", "/pt/shop");
    await expect(seeMore).toHaveAttribute("href", "/pt/shop");
    expect(await precedes(browse, grid)).toBe(true);
    expect(await precedes(grid, seeMore)).toBe(true);
    const title = page.getByRole("link", { name: "Amazon Echo Plus" });
    await expect(title).toHaveAttribute("lang", "en");
  });
});
