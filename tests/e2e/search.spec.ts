import { expect, test } from "@playwright/test";

test.describe("search", () => {
  test("the header icon leads to the search page and focuses the input on client navigation", async ({
    page,
  }) => {
    await page.goto("/en");
    const search = page.getByRole("banner").getByRole("link", { name: "Search" }).first();
    if (!(await search.isVisible())) await page.getByLabel("Open menu").click();
    await search.click();
    await expect(page).toHaveURL(/\/en\/search$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Search");
    await expect(page.getByRole("searchbox", { name: "Search products" })).toBeFocused();
    await expect(page.getByRole("search")).toBeVisible();
  });

  test("searching 'phone' paginates and keeps the query in the form", async ({ page }) => {
    await page.goto("/en/search");
    await page.getByRole("searchbox", { name: "Search products" }).fill("phone");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/\/en\/search\?q=phone$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Search");
    await expect(page).toHaveTitle(/Search: “phone” \(\d+ results\) — The Online Store/);
    await expect(page.getByRole("searchbox", { name: "Search products" })).toHaveValue("phone");
    await expect(page.getByText(/Showing 1–9 of \d+/)).toBeVisible();
    await page.getByRole("link", { name: "Page 2" }).click();
    await expect(page).toHaveURL(/\/en\/search\?q=phone&page=2$/);
    await expect(page.locator("#results-heading")).toBeFocused();
    await expect(
      page.getByRole("status").filter({ hasText: /\d+ results for “phone”/ }),
    ).toHaveCount(1);
  });

  test("no results shows the empty state with the English hint", async ({ page }) => {
    await page.goto("/en/search?q=zzzzzz");
    await expect(page.getByRole("heading", { level: 2 })).toHaveText("No results for “zzzzzz”");
    await expect(page.getByText("Products are searched in English.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Show all products" })).toHaveAttribute(
      "href",
      "/en",
    );
    await expect(page.getByText("No products found")).toBeVisible();
  });

  test("an empty or whitespace query shows the prompt without fetching", async ({ page }) => {
    await page.goto("/en/search?q=%20%20");
    await expect(page.getByText("Type a word to search the catalogue.")).toBeVisible();
    await expect(page.getByRole("list", { name: /Showing/ })).toHaveCount(0);
  });

  test("Portuguese search page", async ({ page }) => {
    await page.goto("/pt/search?q=phone");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pesquisar");
    await expect(page).toHaveTitle(/Pesquisa: «phone» \(\d+ resultados\)/);
  });
});
