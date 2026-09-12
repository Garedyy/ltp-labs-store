import { expect, type Page, test } from "@playwright/test";

const row = (page: Page, label: RegExp) =>
  page
    .locator("dl > div")
    .filter({ has: page.getByRole("term").filter({ hasText: label }) })
    .getByRole("definition");

// Adds `times` units and waits for the header to reflect the expected total.
async function addProduct(page: Page, id: number, times: number, expectedTotal: number) {
  await page.goto(`/en/products/${id}`);
  for (let i = 0; i < times; i += 1) {
    const count = expectedTotal - times + i + 1;
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(
      page.getByRole("status").filter({ hasText: `You now have ${count} item` }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: `Cart, ${count} item${count === 1 ? "" : "s"}` }),
    ).toBeVisible();
  }
}

test.describe("cart page", () => {
  test("empty cart", async ({ page }) => {
    await page.goto("/en/cart");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your cart is empty");
    await expect(page.getByRole("link", { name: "Continue shopping" })).toHaveAttribute(
      "href",
      "/en",
    );
    await expect(page.getByRole("button", { name: "Check out" })).toHaveCount(0);
    await expect(page).toHaveTitle("Your cart — The Online Store");
    await page.goto("/en/checkout/confirmation");
    await expect(page).toHaveURL(/\/en\/cart$/);
  });

  test("lists items with quantity, totals and shipping; the stepper clamps at stock", async ({
    page,
  }) => {
    await addProduct(page, 1, 2, 2);
    await addProduct(page, 16, 1, 3);
    await page.getByRole("link", { name: "Cart, 3 items" }).click();
    await expect(page).toHaveURL(/\/en\/cart$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your cart");
    await expect(page).toHaveTitle("Shopping cart (3 units) — The Online Store");
    const items = page.getByRole("list", { name: "Items" }).getByRole("listitem");
    await expect(items).toHaveCount(2);
    await expect(
      items.first().getByRole("link", { name: "Essence Mascara Lash Princess" }),
    ).toBeVisible();
    await expect(
      items.first().getByRole("textbox", { name: "Qty Essence Mascara Lash Princess" }),
    ).toHaveValue("2");
    await expect(row(page, /^Subtotal$/)).toHaveText("$21.97");
    await expect(row(page, /^Shipping$/)).toHaveText("$20.00");
    await expect(row(page, /^Total$/)).toHaveText("$41.97");

    const apple = items.nth(1);
    const plus = apple.getByRole("button", { name: "Increase quantity of Apple" });
    for (let i = 2; i <= 8; i += 1) {
      await plus.click();
      await expect(apple.getByRole("textbox", { name: "Qty Apple" })).toHaveValue(String(i));
    }
    await expect(plus).toHaveAttribute("aria-disabled", "true");
    const minus = apple.getByRole("button", { name: "Decrease quantity of Apple" });
    await minus.click();
    await expect(apple.getByRole("textbox", { name: "Qty Apple" })).toHaveValue("7");
    await expect(page.getByRole("link", { name: "Cart, 9 items" })).toBeVisible();
    await apple.getByRole("textbox", { name: "Qty Apple" }).fill("50");
    await apple.getByRole("textbox", { name: "Qty Apple" }).press("Tab");
    await expect(
      page.getByRole("status").filter({ hasText: "Quantity limited to 8." }),
    ).toHaveCount(1);
    await expect(apple.getByRole("textbox", { name: "Qty Apple" })).toHaveValue("8");
    await expect(page.getByRole("link", { name: "Cart, 10 items" })).toBeVisible();
  });

  test("Enter in the quantity field submits the value and keeps the focus", async ({ page }) => {
    await addProduct(page, 2, 1, 1);
    await page.goto("/en/cart");
    const input = page.getByRole("textbox", { name: "Qty Eyeshadow Palette with Mirror" });
    await input.fill("3");
    await input.press("Enter");
    await expect(
      page.getByRole("status").filter({ hasText: "Quantity of Eyeshadow Palette with Mirror" }),
    ).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Cart, 3 items" })).toBeVisible();
    await expect(input).toHaveValue("3");
    await expect(input).toBeFocused();
  });

  test("an invalid quantity is refused and focus moves to the input", async ({ page }) => {
    await addProduct(page, 2, 1, 1);
    await page.goto("/en/cart");
    const input = page.getByRole("textbox", { name: "Qty Eyeshadow Palette with Mirror" });
    await input.fill("abc");
    await input.press("Tab");
    await expect(page.getByRole("alert")).toContainText("Enter a whole number");
    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute("aria-invalid", "true");
  });

  test("removing a line moves focus to the next remove button, then to the heading", async ({
    page,
  }) => {
    await addProduct(page, 1, 1, 1);
    await addProduct(page, 2, 1, 2);
    await page.goto("/en/cart");
    await page.getByRole("button", { name: "Remove Essence Mascara Lash Princess" }).click();
    await expect(
      page.getByRole("button", { name: "Remove Eyeshadow Palette with Mirror" }),
    ).toBeFocused();
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: "Essence Mascara Lash Princess removed from your cart." }),
    ).toHaveCount(1);
    await page.getByRole("button", { name: "Remove Eyeshadow Palette with Mirror" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Your cart is empty" })).toBeFocused();
    await expect(page.getByRole("link", { name: "Cart, empty" })).toBeVisible();
  });

  test("LTP10 reduces the total, FREESHIP makes shipping free, invalid codes are refused", async ({
    page,
  }) => {
    await addProduct(page, 1, 1, 1);
    await page.goto("/en/cart");
    const code = page.getByRole("textbox", { name: "Promo code" });
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByRole("alert")).toContainText("Enter a promo code");
    await expect(code).toBeFocused();
    await code.fill("nope");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByRole("alert")).toContainText("Unknown promo code");
    await code.fill("ltp10");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByText("Code LTP10 applied", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Remove code" })).toBeFocused();
    await expect(row(page, /^Discount \(LTP10\)$/)).toHaveText("−$1.00");
    await expect(row(page, /^Total$/)).toHaveText("$28.99");
    await expect(page.getByRole("status").filter({ hasText: "Total updated: $28.99" })).toHaveCount(
      1,
    );
    await page.getByRole("button", { name: "Remove code" }).click();
    await expect(page.getByRole("textbox", { name: "Promo code" })).toBeFocused();
    await page.getByRole("textbox", { name: "Promo code" }).fill("FREESHIP");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(row(page, /^Shipping$/)).toHaveText("Free");
    await expect(row(page, /^Total$/)).toHaveText("$9.99");
  });

  test("checkout leads to a confirmation that survives reload and language switch", async ({
    page,
  }) => {
    await addProduct(page, 1, 1, 1);
    await page.goto("/en/cart");
    await page.getByRole("button", { name: "Or pay with PayPal" }).click();
    await expect(page).toHaveURL(/\/en\/checkout\/confirmation$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /Thank you — order LTP-[A-Z0-9]+/,
    );
    await expect(page.getByRole("definition").filter({ hasText: "PayPal" })).toBeVisible();
    await expect(page.getByRole("definition").filter({ hasText: "$29.99" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Cart, empty" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Thank you/);
    await page.goto("/pt/checkout/confirmation");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Obrigado — encomenda LTP-/);
  });

  test("checking out a cart emptied elsewhere shows the empty-cart error", async ({
    page,
    context,
  }) => {
    await addProduct(page, 1, 1, 1);
    await page.goto("/en/cart");
    await context.clearCookies();
    await page.getByRole("button", { name: "Check out" }).click();
    const alert = page.getByRole("alert").filter({ hasText: "Your cart is empty" });
    await expect(alert).toBeFocused();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your cart is empty");
    await expect(page.getByRole("link", { name: "Cart, empty" })).toBeVisible();
  });

  test("the checkout action refuses an empty cart with and without JavaScript", async ({
    page,
  }) => {
    const refused = await page.request.post("/en/cart", {
      form: { intent: "checkout", payment: "card" },
    });
    expect(refused.status()).toBe(400);
    expect(await refused.text()).toContain("Your cart is empty");
    const redirected = await page.request.post("/en/cart", {
      form: { intent: "checkout", payment: "card", noJs: "1" },
      maxRedirects: 0,
    });
    expect(redirected.status()).toBe(303);
    expect(redirected.headers()["location"]).toBe("/en/cart");
  });

  test("Portuguese cart", async ({ page }) => {
    await addProduct(page, 1, 1, 1);
    await page.goto("/pt/cart");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("O seu carrinho");
    await expect(row(page, /^Envio$/)).toHaveText("20,00 US$");
    await expect(page.getByRole("button", { name: "Finalizar compra" })).toBeVisible();
  });
});
