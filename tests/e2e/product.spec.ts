import { expect, test } from "@playwright/test";

test.describe("product detail", () => {
  test("shows every wireframe element plus the extras", async ({ page }) => {
    await page.goto("/en/products/1");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Essence Mascara Lash Princess",
    );
    await expect(page).toHaveTitle("Essence Mascara Lash Princess — The Online Store");
    await expect(
      page.getByRole("img", { name: "Essence Mascara Lash Princess, image 1 of 1" }),
    ).toBeVisible();
    await expect(page.getByText("Sale price")).toBeAttached();
    await expect(page.getByText("$9.99")).toBeVisible();
    await expect(page.getByText("Original price")).toBeAttached();
    await expect(page.locator("s")).toHaveText("$11.16");
    await expect(page.getByText("-10%")).toBeVisible();
    await expect(page.getByText(/Rated \d\.\d out of 5, 3 reviews/)).toBeAttached();
    await expect(page.getByText("In stock")).toBeVisible();
    const button = page.getByRole("button", { name: "Add to cart" });
    await expect(button).toBeEnabled();
    await expect(button).toHaveAccessibleDescription("In stock");
    await expect(page.getByRole("heading", { level: 2, name: "Product details" })).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Practical information" }),
    ).toBeVisible();
    await expect(page.getByRole("term").filter({ hasText: "Brand" })).toBeVisible();
    await expect(page.getByRole("definition").filter({ hasText: "Essence" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "3 reviews" })).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(3);
  });

  test("thumbnails switch the image through ?image without a data request", async ({ page }) => {
    await page.goto("/en/products/117");
    const historyLength = await page.evaluate(() => history.length);
    const thumbnails = page.getByRole("list", { name: "Product images" });
    await expect(thumbnails.getByRole("link")).toHaveCount(4);
    const dataRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes(".data")) dataRequests.push(request.url());
    });
    await thumbnails.getByRole("link", { name: "Show image 2 of 4" }).click();
    await expect(page).toHaveURL(/\/en\/products\/117\?image=2$/);
    await expect(
      page.getByRole("img", { name: "Sportbike Motorcycle, image 2 of 4" }),
    ).toBeVisible();
    await expect(thumbnails.getByRole("link", { name: "Show image 2 of 4" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(dataRequests).toEqual([]);
    await thumbnails.getByRole("link", { name: "Show image 1 of 4" }).click();
    await expect(page).toHaveURL(/\/en\/products\/117$/);
    // Image changes replace the history entry: no back-button trail through the gallery.
    expect(await page.evaluate(() => history.length)).toBe(historyLength);
  });

  test("an out-of-stock product disables Add to cart and says so", async ({ page }) => {
    await page.goto("/en/products/117");
    await expect(page.getByText("Out of stock")).toBeVisible();
    const button = page.getByRole("button", { name: "Add to cart" });
    await expect(button).toBeDisabled();
    await expect(button).toHaveAccessibleDescription("Out of stock");
  });

  test("a low-stock product shows the remaining count and a missing brand hides the row", async ({
    page,
  }) => {
    await page.goto("/en/products/16");
    await expect(page.getByText("Only 8 in stock")).toBeVisible();
    await expect(page.getByRole("term").filter({ hasText: "Brand" })).toHaveCount(0);
  });

  test("unknown ids are 404 inside the shell and bad ids too", async ({ page }) => {
    const missing = await page.goto("/en/products/9999");
    expect(missing?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Product not found");
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page).toHaveTitle("Product not found — The Online Store");
    expect((await page.goto("/en/products/abc"))?.status()).toBe(404);
    await page.goto("/en/products/1?image=9");
    await expect(page.getByRole("img", { name: /image 1 of 1/ })).toBeVisible();
  });

  test("Portuguese: prices, rating, dates and lang on API text", async ({ page }) => {
    await page.goto("/pt/products/1");
    await expect(page.getByText("9,99 US$")).toBeVisible();
    await expect(page.getByText("Preço promocional")).toBeAttached();
    await expect(page.getByRole("heading", { level: 1 })).toHaveAttribute("lang", "en");
    await expect(page.getByText("Em stock")).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "3 avaliações" })).toBeVisible();
    await expect(page.locator("time").first()).toHaveText(/\d{2}\/\d{2}\/\d{4}/);
  });
});
