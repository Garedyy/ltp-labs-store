import { expect, type Page } from "@playwright/test";

// The language switcher lives in the header on large screens and inside the menu below lg.
export async function openLanguagePanel(page: Page, navName: string): Promise<void> {
  const menuToggle = page.getByLabel(/Open menu|Abrir menu/);
  if (await menuToggle.isVisible()) await menuToggle.click();
  const summary = page.getByRole("navigation", { name: navName }).locator("summary").filter({
    visible: true,
  });
  await expect(summary).toHaveCount(1);
  await summary.click();
}

export const VALID_CARD = {
  email: "ana@example.com",
  name: "Ana Demo",
  address: "Rua da Demonstração 42",
  postalCode: "4000-000",
  city: "Porto",
  cardName: "Ana Demo",
  cardNumber: "4242 4242 4242 4242",
  cardExpiry: "12/30",
  cardCode: "123",
};

// Fills the payment page's form with a valid card (English labels) and submits it.
export async function payByCard(page: Page, overrides: Partial<typeof VALID_CARD> = {}) {
  const values = { ...VALID_CARD, ...overrides };
  const labels: Record<keyof typeof VALID_CARD, string> = {
    email: "Email address",
    name: "Full name",
    address: "Street address",
    postalCode: "Postal code",
    city: "City",
    cardName: "Name on card",
    cardNumber: "Card number",
    cardExpiry: "Expiry date (MM/YY)",
    cardCode: "Security code",
  };
  for (const [field, label] of Object.entries(labels) as [keyof typeof VALID_CARD, string][]) {
    await page.getByRole("textbox", { name: label }).fill(values[field]);
  }
  await page.getByRole("button", { name: /^Pay / }).click();
}
