import { expect, type Page, test } from "@playwright/test";

const cards = (page: Page) =>
  page.getByRole("list", { name: /Showing|A mostrar/ }).getByRole("article");
const sortApply = (page: Page) =>
  page.locator("form", { has: page.getByRole("combobox") }).getByRole("button", { name: "Apply" });
const results = (page: Page) => page.getByRole("status").filter({ hasText: /^Showing \d+ to/ });

test.describe("catalogue", () => {
  test("shows nine cards, the summary, the categories and the pagination", async ({ page }) => {
    await page.goto("/en/shop");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Shop");
    await expect(cards(page)).toHaveCount(9);
    await expect(page.getByText("Showing 1–9 of 194")).toBeVisible();
    await expect(page.getByRole("checkbox")).toHaveCount(24);
    const pagination = page.getByRole("navigation", { name: "Pagination" });
    await expect(pagination.getByRole("link", { name: "Page 1" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(pagination.getByRole("link", { name: "Previous page" })).toHaveCount(0);
    await expect(pagination.getByRole("link", { name: "Next page" })).toHaveAttribute(
      "rel",
      "next",
    );
    const first = cards(page).first();
    await expect(first.getByRole("heading", { level: 2 })).toHaveText(
      "Essence Mascara Lash Princess",
    );
    await expect(first.getByRole("link")).toHaveAttribute("href", "/en/products/1");
  });

  test("choosing a sort applies it, keeps the focus on the select and announces", async ({
    page,
  }) => {
    await page.goto("/en/shop?page=2");
    const sort = page.getByRole("combobox", { name: "Sort by" });
    await expect(sort).toHaveAccessibleDescription("Results update when you choose");
    // selectOption does not focus the element the way a user does.
    await sort.focus();
    await sort.selectOption("price-desc");
    await expect(page).toHaveURL(/\/en\/shop\?sort=price-desc$/);
    await expect(cards(page).first().getByRole("heading")).toHaveText("Durango SXT RWD");
    await expect(sort).toHaveValue("price-desc");
    await expect(sort).toBeFocused();
    await expect(results(page).filter({ hasText: "Showing 1 to 9 of 194" })).toHaveCount(1);

    await sort.selectOption("");
    await expect(page).toHaveURL(/\/en\/shop$/);
    await expect(sort).toHaveValue("");
    await expect(cards(page).first().getByRole("heading")).toHaveText(
      "Essence Mascara Lash Princess",
    );

    // The select follows the URL, not the last choice.
    await page.goBack();
    await expect(page).toHaveURL(/\/en\/shop\?sort=price-desc$/);
    await expect(sort).toHaveValue("price-desc");
    await page.goBack();
    await expect(page).toHaveURL(/\/en\/shop\?page=2$/);
    await expect(sort).toHaveValue("");
  });

  test("the sort Apply button is hidden until it receives the focus", async ({ page }) => {
    await page.goto("/en/shop");
    await expect(sortApply(page)).toBeAttached();
    await expect(sortApply(page)).not.toBeInViewport();
    await page.getByRole("combobox", { name: "Sort by" }).focus();
    await page.keyboard.press("Tab");
    await expect(sortApply(page)).toBeFocused();
    await expect(sortApply(page)).toBeInViewport();
  });

  test("a category filters, changes the title and can be cleared", async ({ page }) => {
    await page.goto("/en/shop?page=3");
    const beauty = page.getByRole("checkbox", { name: "Beauty" });
    await beauty.check();
    await expect(page).toHaveURL(/\/en\/shop\?category=beauty$/);
    await expect(beauty).toBeFocused();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Beauty");
    await expect(page).toHaveTitle("Beauty — The Online Store");
    await expect(page.getByText("Showing 1–5 of 5")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Pagination" })).toHaveCount(0);

    await page.getByRole("checkbox", { name: "Laptops" }).check();
    await expect(page).toHaveURL(/\/en\/shop\?category=laptops$/);
    await expect(page.getByRole("checkbox", { name: "Beauty" })).not.toBeChecked();

    await page.getByRole("link", { name: "Clear filter" }).click();
    await expect(page).toHaveURL(/\/en\/shop$/);
    await expect(page.locator("fieldset")).toBeFocused();
  });

  test("page 22 renders, page 23 is a 404 inside the shell, an unknown category redirects", async ({
    page,
  }) => {
    await page.goto("/en/shop?page=22");
    await expect(page.getByText("Showing 190–194 of 194")).toBeVisible();
    await expect(page).toHaveTitle("Shop — page 22 — The Online Store");
    const missing = await page.goto("/en/shop?page=23");
    expect(missing?.status()).toBe(404);
    await expect(page.getByRole("banner")).toBeVisible();
    await page.goto("/en/shop?category=foo&sort=price-asc");
    await expect(page).toHaveURL(/\/en\/shop\?sort=price-asc$/);
  });

  test("a page change focuses the results heading and announces the range", async ({ page }) => {
    await page.goto("/en/shop");
    await page.getByRole("link", { name: "Page 2" }).click();
    await expect(page).toHaveURL(/\/en\/shop\?page=2$/);
    await expect(page.locator("#results-heading")).toBeFocused();
    await expect(page.getByText("Showing 10–18 of 194")).toBeVisible();
    await expect(
      page.getByRole("status").filter({ hasText: "Showing 10 to 18 of 194 products" }),
    ).toHaveCount(1);
  });

  test("a product service failure renders the 502 page in the shell", async ({ page }) => {
    const response = await page.goto("/en/products/999");
    expect(response?.status()).toBe(502);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Product service unavailable");
    await expect(page.getByRole("banner")).toBeVisible();
  });

  test("Portuguese: prices use the locale, category names are translated, titles keep lang=en", async ({
    page,
  }) => {
    await page.goto("/pt/shop?category=beauty");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Beleza");
    await expect(page.getByText("A mostrar 1–5 de 5")).toBeVisible();
    await expect(cards(page).first()).toContainText("9,99 US$");
    await expect(cards(page).first().getByRole("link")).toHaveAttribute("lang", "en");
  });
});
