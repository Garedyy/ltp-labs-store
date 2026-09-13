import { expect, test } from "@playwright/test";

test.describe("content pages", () => {
  test("About tells the story, the values and the fictional team in both languages", async ({
    page,
  }) => {
    await page.goto("/en/about");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("About us");
    await expect(page).toHaveTitle("About us - The Online Store");
    await expect(page.getByRole("heading", { level: 2 })).toHaveText([
      "Our story",
      "What we stand for",
      "The team",
    ]);
    await expect(page.getByRole("heading", { level: 3 })).toHaveCount(3);
    await expect(page.getByText("Inês Tavares")).toBeVisible();
    await page.goto("/pt/about");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sobre nós");
    await expect(page.getByRole("heading", { name: "A equipa" })).toBeVisible();
  });

  test("Blog lists three dated posts", async ({ page }) => {
    await page.goto("/en/blog");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Blog");
    const posts = page.getByRole("article");
    await expect(posts).toHaveCount(3);
    await expect(posts.first().getByRole("heading", { level: 2 })).toHaveText(
      "Why we switched to plastic-free packaging",
    );
    await expect(posts.first().locator("time")).toHaveAttribute("datetime", "2026-08-20");
    await expect(posts.first().locator("time")).toHaveText("Aug 20, 2026");
    await page.goto("/pt/blog");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Blogue");
    await expect(page.getByRole("article").first().locator("time")).toHaveText("20/08/2026");
  });

  test("Contact shows the details and validates the form before confirming", async ({ page }) => {
    await page.goto("/en/contact");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Contact");
    await expect(page.getByRole("link", { name: "hello@theonlinestore.example" })).toHaveAttribute(
      "href",
      "mailto:hello@theonlinestore.example",
    );
    const form = page.getByRole("form", { name: "Send us a message" });
    await form.getByRole("textbox", { name: "Email address" }).fill("nope");
    await form.getByRole("button", { name: "Send message" }).click();
    const name = form.getByRole("textbox", { name: "Your name" });
    await expect(name).toBeFocused();
    await expect(name).toHaveAccessibleDescription(/This field is required/);
    await expect(form.getByRole("textbox", { name: "Email address" })).toHaveValue("nope");
    await expect(form.getByRole("textbox", { name: "Email address" })).toHaveAccessibleDescription(
      /Enter a valid email address/,
    );
    await expect(form.getByRole("alert")).toHaveCount(3);
    await name.fill("Ana");
    await form.getByRole("textbox", { name: "Email address" }).fill("ana@example.com");
    await form.getByRole("textbox", { name: "Message" }).fill("Hello");
    await form.getByRole("button", { name: "Send message" }).click();
    await expect(page).toHaveURL(/\/en\/contact\?sent=1$/);
    await expect(page).toHaveTitle("Message received - The Online Store");
    const status = page.getByRole("status").filter({ hasText: "nothing was sent or stored" });
    await expect(status).toBeFocused();
    await expect(page.getByRole("form", { name: "Send us a message" })).toHaveCount(0);
    await page.getByRole("link", { name: "Send another message" }).click();
    await expect(page.getByRole("form", { name: "Send us a message" })).toBeVisible();
    await page.goto("/pt/contact");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Contacto");
    await expect(page.getByRole("button", { name: "Enviar mensagem" })).toBeVisible();
  });

  test("Account shows the device's cart and last order, and the sign-in mock", async ({ page }) => {
    await page.goto("/en/account");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Account");
    await expect(page.getByRole("definition").filter({ hasText: "Empty" })).toBeVisible();
    await expect(page.getByRole("definition").filter({ hasText: "No order yet" })).toBeVisible();
    await expect(page.getByRole("definition").filter({ hasText: "Demo customer" })).toBeVisible();
    await expect(page.getByRole("definition").filter({ hasText: "English" })).toBeVisible();
    const form = page.getByRole("form", { name: "Sign in" });
    await form.getByRole("button", { name: "Sign in" }).click();
    const email = form.getByRole("textbox", { name: "Email address" });
    await expect(email).toBeFocused();
    await expect(email).toHaveAccessibleDescription(/This field is required/);
    await expect(form.getByLabel("Password")).toHaveAccessibleDescription(/This field is required/);
    await email.fill("ana@example.com");
    await form.getByLabel("Password").fill("secret");
    await form.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/en\/account\?demo=1$/);
    await expect(page.getByRole("status").filter({ hasText: "Sign-in is a demo" })).toBeFocused();

    await page.goto("/en/products/1");
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
    await page.goto("/en/account");
    await expect(page.getByRole("definition").filter({ hasText: "1 item" })).toBeVisible();
    await page.goto("/pt/account");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Conta");
    await expect(page.getByRole("definition").filter({ hasText: "1 artigo" })).toBeVisible();
    await expect(page.getByRole("definition").filter({ hasText: "Português" })).toBeVisible();
  });

  test("Account links the last order to its confirmation", async ({ page }) => {
    await page.goto("/en/products/1");
    await page.getByRole("button", { name: "Buy now" }).click();
    await expect(page).toHaveURL(/\/en\/checkout\?product=1$/);
    for (const [label, value] of [
      ["Email address", "ana@example.com"],
      ["Full name", "Ana Demo"],
      ["Street address", "Rua"],
      ["Postal code", "4000"],
      ["City", "Porto"],
    ] as const) {
      await page.getByRole("textbox", { name: label }).fill(value);
    }
    await page.getByRole("radio", { name: "PayPal" }).check();
    await page.getByRole("button", { name: "Pay $29.99" }).click();
    await expect(page).toHaveURL(/\/en\/checkout\/confirmation$/);
    await page.goto("/en/account");
    await expect(
      page.getByRole("definition").filter({ hasText: /LTP-[A-Z0-9]+, \$29\.99/ }),
    ).toBeVisible();
    await page.getByRole("link", { name: "View the confirmation" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Thank you for your order");
  });
});
