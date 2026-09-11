import { expect, test } from "@playwright/test";

test.describe("locale routing", () => {
  test("/ redirects to the Accept-Language locale", async ({ browser }) => {
    const context = await browser.newContext({ locale: "pt-PT" });
    const page = await context.newPage();
    const response = await page.goto("/");
    expect(response?.request().redirectedFrom()?.url()).toMatch(/\/$/);
    expect(page.url()).toMatch(/\/pt$/);
    await context.close();
  });

  test("/ falls back to English", async ({ browser }) => {
    const context = await browser.newContext({ locale: "fr-FR" });
    const page = await context.newPage();
    await page.goto("/");
    expect(page.url()).toMatch(/\/en$/);
    await context.close();
  });

  test("an un-prefixed path is redirected to the detected locale, keeping the path", async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: "en-US" });
    const page = await context.newPage();
    await page.goto("/products/3?image=2");
    expect(page.url()).toMatch(/\/en\/products\/3\?image=2$/);
    const response = await page.goto("/xx/cart");
    expect(page.url()).toMatch(/\/en\/xx\/cart$/);
    expect(response?.status()).toBe(404);
    await context.close();
  });

  test("an upper-case locale is redirected permanently to lower-case", async ({ page }) => {
    const response = await page.request.get("/EN/nowhere", { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers()["location"]).toBe("/en/nowhere");
  });

  test("a trailing slash after the locale renders the catalogue", async ({ page }) => {
    const response = await page.goto("/en/");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Shop");
  });

  test("asset-like segments are 404 without a redirect", async ({ page }) => {
    const response = await page.request.get("/favicon.ico", { maxRedirects: 0 });
    expect(response.status()).toBe(404);
  });

  test("unknown pages render a translated 404 inside the shell", async ({ page }) => {
    const response = await page.goto("/pt/nowhere");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Página não encontrada");
    await expect(page.getByRole("navigation", { name: "Idioma" })).toBeVisible();
  });

  test("html lang and hreflang alternates follow the locale", async ({ page }) => {
    await page.goto("/pt/nowhere?x=1");
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-PT");
    const alternates = page.locator('link[rel="alternate"]');
    await expect(alternates).toHaveCount(3);
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute(
      "href",
      /\/en\/nowhere\?x=1$/,
    );
    await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute(
      "href",
      /\/en\/nowhere\?x=1$/,
    );
  });
});

test.describe("language switcher", () => {
  test("following a /pt link does not write the cookie; the switcher does", async ({
    page,
    context,
  }) => {
    await page.goto("/pt");
    expect((await context.cookies()).find((c) => c.name === "lng")).toBeUndefined();

    await page.getByRole("navigation", { name: "Idioma" }).locator("summary").click();
    await page.getByRole("button", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    const cookie = (await context.cookies()).find((c) => c.name === "lng");
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("Lax");

    await page.goto("/");
    expect(page.url()).toMatch(/\/en$/);
  });

  test("switching keeps the current path and query", async ({ page }) => {
    await page.goto("/en/nowhere?x=1");
    await page.getByRole("navigation", { name: "Language" }).locator("summary").click();
    await page.getByRole("button", { name: "Português" }).click();
    await expect(page).toHaveURL(/\/pt\/nowhere\?x=1$/);
  });

  test("GET on the resource route is 405 and a bad locale is 400", async ({ page }) => {
    expect((await page.request.get("/en/set-language", { maxRedirects: 0 })).status()).toBe(405);
    const bad = await page.request.post("/en/set-language", {
      form: { locale: "xx", redirectTo: "/en" },
      maxRedirects: 0,
    });
    expect(bad.status()).toBe(400);
    const open = await page.request.post("/en/set-language", {
      form: { locale: "pt", redirectTo: "//evil.example" },
      maxRedirects: 0,
    });
    expect(open.status()).toBe(400);
  });
});
