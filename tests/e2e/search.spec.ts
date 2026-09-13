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
    await expect(page).toHaveTitle(/Search: "phone" \(\d+ results\) - The Online Store/);
    await expect(page.getByRole("searchbox", { name: "Search products" })).toHaveValue("phone");
    await expect(page.getByText(/Showing 1-9 of \d+/)).toBeVisible();
    const announcement = page.getByRole("status").filter({ hasText: /\d+ results for "phone"/ });
    await expect(announcement).toHaveCount(1);
    await page.getByRole("link", { name: "Page 2" }).click();
    await expect(page).toHaveURL(/\/en\/search\?q=phone&page=2$/);
    await expect(page.locator("#results-heading")).toBeFocused();
    // Two alternating status regions: the first search and the page change each keep theirs.
    await expect(announcement).toHaveCount(2);
  });

  test("choosing a sort keeps the query, drops the page and announces the results", async ({
    page,
  }) => {
    await page.goto("/en/search?q=phone&page=2");
    const sort = page.getByRole("combobox", { name: "Sort by" });
    await sort.focus();
    await sort.selectOption("price-asc");
    await expect(page).toHaveURL(/\/en\/search\?q=phone&sort=price-asc$/);
    await expect(sort).toBeFocused();
    await expect(page.getByText(/Showing 1-9 of \d+/)).toBeVisible();
    await expect(
      page.getByRole("status").filter({ hasText: /\d+ results for "phone"/ }),
    ).toHaveCount(1);
  });

  test("clearing the query announces the prompt again", async ({ page }) => {
    await page.goto("/en/search?q=phone");
    const prompt = page
      .getByRole("status")
      .filter({ hasText: "Type a word to search the catalogue." });
    await expect(prompt).toHaveCount(0);
    await page.getByRole("searchbox", { name: "Search products" }).fill("");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/\/en\/search\?q=$/);
    await expect(page.getByRole("list", { name: /Showing/ })).toHaveCount(0);
    await expect(prompt).toHaveCount(1);
  });

  test("a single hit uses the singular title", async ({ page }) => {
    await page.goto("/en/search?q=mascara");
    await expect(page).toHaveTitle('Search: "mascara" (1 result) - The Online Store');
    await expect(page.getByText("Showing 1-1 of 1")).toBeVisible();
  });

  test("no results shows the empty state with the English hint", async ({ page }) => {
    await page.goto("/en/search?q=zzzzzz");
    await expect(page).toHaveTitle('Search: "zzzzzz" (no results) - The Online Store');
    await expect(page.getByRole("heading", { level: 2 })).toHaveText('No results for "zzzzzz"');
    await expect(page.getByText("Products are searched in English.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Show all products" })).toHaveAttribute(
      "href",
      "/en/shop",
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
    await page.goto("/pt/search?q=mascara");
    await expect(page).toHaveTitle(/Pesquisa: «mascara» \(1 resultado\)/);
    await page.goto("/pt/search?q=zzzzzz");
    await expect(page).toHaveTitle(/Pesquisa: «zzzzzz» \(sem resultados\)/);
  });
});
