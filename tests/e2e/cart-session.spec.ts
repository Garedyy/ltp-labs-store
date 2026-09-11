import { expect, test } from "@playwright/test";

test.describe("add to cart", () => {
  test("adding twice updates the status, the header badge and keeps focus on the button", async ({
    page,
  }) => {
    await page.goto("/en/products/1");
    const button = page.getByRole("button", { name: "Add to cart" });
    await button.click();
    await expect(
      page.getByRole("status").filter({ hasText: "You now have 1 item." }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
    await expect(button).toBeFocused();
    await button.click();
    await expect(
      page.getByRole("status").filter({ hasText: "You now have 2 items." }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Cart, 2 items" })).toBeVisible();
    await expect(page.getByRole("link", { name: "View cart" })).toHaveAttribute("href", "/en/cart");
    await page.reload();
    await expect(page.getByRole("link", { name: "Cart, 2 items" })).toBeVisible();
  });

  test("the count survives navigation and the language switch", async ({ page }) => {
    await page.goto("/en/products/2");
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
    await page.goto("/pt");
    await expect(page.getByRole("link", { name: "Carrinho, 1 artigo" })).toBeVisible();
  });

  test("quantity is capped at the available stock", async ({ page }) => {
    await page.goto("/en/products/16");
    const button = page.getByRole("button", { name: "Add to cart" });
    for (let i = 0; i < 8; i += 1) {
      await button.click();
      await expect(
        page.getByRole("status").filter({ hasText: `You now have ${i + 1} item` }),
      ).toBeVisible();
    }
    await button.click();
    await expect(
      page.getByRole("status").filter({ hasText: "Quantity limited to available stock (8)." }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Cart, 8 items" })).toBeVisible();
  });

  test("a tampered cookie reads as an empty cart without a server error", async ({
    page,
    context,
  }) => {
    await page.goto("/en/products/1");
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
    const cookie = (await context.cookies()).find((c) => c.name === "__cart");
    expect(cookie?.httpOnly).toBe(true);
    await context.addCookies([{ ...cookie!, value: cookie!.value.slice(0, -6) + "AAAAAA" }]);
    const response = await page.goto("/en");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("link", { name: "Cart, empty" })).toBeVisible();
  });

  test("out-of-stock and unknown products are refused by the action", async ({ page }) => {
    const out = await page.request.post("/en/products/117", {
      form: { intent: "add", productId: "117" },
      headers: { accept: "application/json" },
    });
    expect(out.status()).toBe(400);
    const missing = await page.request.post("/en/products/9999", {
      form: { intent: "add", productId: "9999" },
    });
    expect(missing.status()).toBe(400);
    const bad = await page.request.post("/en/products/1", { form: { intent: "increment" } });
    expect(bad.status()).toBe(400);
  });
});
