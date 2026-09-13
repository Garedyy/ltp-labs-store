import { expect, type Page, test } from "@playwright/test";

import { payByCard } from "./helpers";

async function addToCart(page: Page, id: number, expectedCount: number) {
  await page.goto(`/en/products/${id}`);
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(
    page.getByRole("link", {
      name: `Cart, ${expectedCount} item${expectedCount === 1 ? "" : "s"}`,
    }),
  ).toBeVisible();
}

test.describe("payment page", () => {
  test("an empty cart cannot be paid: back to the cart with the focused error", async ({
    page,
  }) => {
    await page.goto("/en/checkout");
    await expect(page).toHaveURL(/\/en\/cart$/);
    await expect(page.getByRole("alert").filter({ hasText: "Your cart is empty" })).toBeFocused();
  });

  test("Check out and PayPal open the payment page with the method preselected", async ({
    page,
  }) => {
    await addToCart(page, 1, 1);
    await page.goto("/en/cart");
    await expect(page.getByRole("link", { name: "Check out" })).toHaveAttribute(
      "href",
      "/en/checkout",
    );
    await page.getByRole("link", { name: "Or pay with PayPal" }).click();
    await expect(page).toHaveURL(/\/en\/checkout\?method=paypal$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Payment");
    await expect(page).toHaveTitle("Payment - The Online Store");
    await expect(page.getByRole("radio", { name: "PayPal" })).toBeChecked();
    // With JavaScript the card fields fold away for PayPal and come back for Card.
    await expect(page.getByRole("textbox", { name: "Card number" })).toBeHidden();
    await page.getByRole("radio", { name: "Card" }).check();
    await expect(page.getByRole("textbox", { name: "Card number" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Pay $29.99" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to the cart" })).toHaveAttribute(
      "href",
      "/en/cart",
    );
  });

  test("invalid fields are refused with focus on the first one and the values kept", async ({
    page,
  }) => {
    await addToCart(page, 1, 1);
    await page.goto("/en/checkout");
    await payByCard(page, { email: "not-an-email", cardNumber: "1234", cardExpiry: "01/20" });
    await expect(page).toHaveURL(/\/en\/checkout$/);
    const email = page.getByRole("textbox", { name: "Email address" });
    await expect(email).toBeFocused();
    await expect(email).toHaveAccessibleDescription(/Enter a valid email address/);
    await expect(email).toHaveValue("not-an-email");
    await expect(page.getByRole("textbox", { name: "Card number" })).toHaveAccessibleDescription(
      /Enter a valid card number/,
    );
    await expect(
      page.getByRole("textbox", { name: "Expiry date (MM/YY)" }),
    ).toHaveAccessibleDescription(/Enter a valid expiry date/);
    await expect(page.getByRole("textbox", { name: "Full name" })).toHaveValue("Ana Demo");
    await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
  });

  test("a valid card places the order with the promo code applied and empties the cart", async ({
    page,
  }) => {
    await addToCart(page, 1, 1);
    await page.goto("/en/cart");
    await page.getByRole("textbox", { name: "Promo code" }).fill("FREESHIP");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByText("Code FREESHIP applied", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Check out" }).click();
    await expect(page.getByRole("heading", { name: "Your order" })).toBeVisible();
    await expect(
      page.getByRole("list", { name: "Items" }).getByRole("listitem").filter({ hasText: "Qty 1" }),
    ).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Pay $9.99" })).toBeVisible();
    await payByCard(page);
    await expect(page).toHaveURL(/\/en\/checkout\/confirmation$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Thank you for your order");
    await expect(page).toHaveTitle(/^Order LTP-[A-Z0-9]+ confirmed - The Online Store$/);
    await expect(page.getByText(/^LTP-[A-Z0-9]+$/)).toBeVisible();
    const summary = page.getByRole("region", { name: "Order summary" });
    await expect(
      summary.getByRole("list", { name: "Items" }).getByRole("listitem").filter({
        hasText: "Essence Mascara Lash Princess",
      }),
    ).toContainText("Qty 1");
    await expect(summary.getByRole("definition").filter({ hasText: /^1$/ })).toBeVisible();
    await expect(summary.getByRole("definition").filter({ hasText: "Card" })).toBeVisible();
    await expect(summary.getByRole("definition").filter({ hasText: "$9.99" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Cart, empty" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Thank you for your order");
    await page.goto("/pt/checkout/confirmation");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Obrigado pela sua encomenda");
    await expect(page).toHaveTitle(/^Encomenda LTP-[A-Z0-9]+ confirmada - The Online Store$/);
    await expect(page.getByRole("region", { name: "Resumo da encomenda" })).toContainText(
      "9,99 US$",
    );
  });

  test("PayPal needs no card details", async ({ page }) => {
    await addToCart(page, 1, 1);
    await page.goto("/en/checkout?method=paypal");
    await expect(page.getByText(/A real store would send you to PayPal/)).toBeVisible();
    for (const [label, value] of [
      ["Email address", "ana@example.com"],
      ["Full name", "Ana Demo"],
      ["Street address", "Rua da Demonstração 42"],
      ["Postal code", "4000-000"],
      ["City", "Porto"],
    ] as const) {
      await page.getByRole("textbox", { name: label }).fill(value);
    }
    await page.getByRole("button", { name: "Pay $29.99" }).click();
    await expect(page).toHaveURL(/\/en\/checkout\/confirmation$/);
    await expect(page.getByRole("definition").filter({ hasText: "PayPal" })).toBeVisible();
  });

  test("paying a cart emptied elsewhere goes back to the cart with the error", async ({
    page,
    context,
  }) => {
    await addToCart(page, 1, 1);
    await page.goto("/en/checkout");
    await context.clearCookies();
    await payByCard(page);
    await expect(page).toHaveURL(/\/en\/cart$/);
    await expect(page.getByRole("alert").filter({ hasText: "Your cart is empty" })).toBeFocused();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your cart is empty");
  });

  test("the place-order action refuses an empty cart and an unknown intent", async ({ page }) => {
    const redirected = await page.request.post("/en/checkout", {
      form: {
        intent: "place-order",
        method: "paypal",
        email: "a@b.co",
        name: "A",
        address: "R",
        postalCode: "1",
        city: "P",
        country: "pt",
      },
      maxRedirects: 0,
    });
    expect(redirected.status()).toBe(303);
    expect(redirected.headers()["location"]).toBe("/en/cart");
    const unknown = await page.request.post("/en/checkout", { form: { intent: "checkout" } });
    expect(unknown.status()).toBe(400);
  });

  test("Buy now pays one unit of the product alone and leaves the cart and its promo untouched", async ({
    page,
  }) => {
    await addToCart(page, 2, 1);
    await page.goto("/en/cart");
    await page.getByRole("textbox", { name: "Promo code" }).fill("FREESHIP");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByText("Code FREESHIP applied", { exact: true })).toBeVisible();
    await page.goto("/en/products/1");
    await page.getByRole("button", { name: "Buy now" }).click();
    await expect(page).toHaveURL(/\/en\/checkout\?product=1$/);
    await expect(page.getByText("You are buying this product on its own")).toBeVisible();
    // Product 1 costs $9.99: one unit plus the $20 shipping, no promo, nothing from the cart.
    await expect(page.getByRole("button", { name: "Pay $29.99" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Items" }).getByRole("listitem")).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Back to the product" })).toHaveAttribute(
      "href",
      "/en/products/1",
    );
    await payByCard(page);
    await expect(page).toHaveURL(/\/en\/checkout\/confirmation$/);
    await expect(page.getByRole("list", { name: "Items" }).getByRole("listitem")).toHaveText([
      /Essence Mascara Lash Princess.*Qty 1/,
    ]);
    await expect(page.getByRole("definition").filter({ hasText: /^1$/ })).toBeVisible();
    await expect(page.getByRole("definition").filter({ hasText: "$29.99" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
    await page.goto("/en/cart");
    await expect(
      page.getByRole("list", { name: "Items" }).getByRole("link", { name: /Eyeshadow Palette/ }),
    ).toBeVisible();
    await expect(page.getByText("Code FREESHIP applied", { exact: true })).toBeVisible();
  });

  test("product mode: a sold-out product goes back to its page, an unknown one is a 404", async ({
    page,
  }) => {
    await page.goto("/en/checkout?product=117");
    await expect(page).toHaveURL(/\/en\/products\/117$/);
    const missing = await page.goto("/en/checkout?product=9999");
    expect(missing?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Product not found");
  });

  test("Portuguese payment page", async ({ page }) => {
    await addToCart(page, 1, 1);
    await page.goto("/pt/checkout");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pagamento");
    await expect(page.getByRole("radio", { name: "Cartão" })).toBeChecked();
    await expect(page.getByRole("button", { name: "Pagar 29,99 US$" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Voltar ao carrinho" })).toBeVisible();
  });
});
