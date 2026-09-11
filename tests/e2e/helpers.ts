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
