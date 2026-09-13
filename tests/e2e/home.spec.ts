import { expect, test } from "@playwright/test";

test.describe("home", () => {
  test("lists the eight best-rated products and links to the shop", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveTitle("Trending products — The Online Store");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Trending products");
    const grid = page.getByRole("list", { name: "Trending products" });
    const cards = grid.getByRole("listitem");
    await expect(cards).toHaveCount(8);
    await expect(cards.first().getByRole("link")).toHaveText("Amazon Echo Plus");
    await expect(cards.first().getByRole("link")).toHaveAttribute("href", "/en/products/99");
    await expect(cards.nth(1).getByRole("link")).toHaveText("Huawei Matebook X Pro");
    await expect(page.getByRole("combobox", { name: "Sort by" })).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Pagination" })).toHaveCount(0);
    await page.getByRole("main").getByRole("link", { name: "Browse the shop" }).click();
    await expect(page).toHaveURL(/\/en\/shop$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Shop");
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
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Loja — página 2");
  });

  test("Portuguese: the home page is translated and product titles keep lang=en", async ({
    page,
  }) => {
    await page.goto("/pt");
    await expect(page).toHaveTitle("Produtos em destaque — The Online Store");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Produtos em destaque");
    await expect(page.getByRole("link", { name: "Ver a loja" })).toHaveAttribute(
      "href",
      "/pt/shop",
    );
    const title = page.getByRole("link", { name: "Amazon Echo Plus" });
    await expect(title).toHaveAttribute("lang", "en");
  });
});
