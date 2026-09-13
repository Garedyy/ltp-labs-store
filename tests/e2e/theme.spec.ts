import { expect, type Page, test } from "@playwright/test";

import { cookieValue } from "./helpers";

const DARK_SURFACE = "rgb(16, 19, 28)";
const LIGHT_SURFACE = "rgb(255, 255, 255)";

// The theme switcher sits in the header on large screens and inside the menu below lg; the menu
// stays open after a choice (the pathname does not change), so it is only opened once.
async function openThemePanel(page: Page, summaryName: RegExp): Promise<void> {
  const menuToggle = page.getByLabel(/Open menu|Abrir menu/);
  const menu = page.locator("details", { has: menuToggle });
  if ((await menuToggle.isVisible()) && !(await menu.evaluate((d: HTMLDetailsElement) => d.open)))
    await menuToggle.click();
  const summary = page.locator("summary", { hasText: summaryName }).filter({ visible: true });
  await expect(summary).toHaveCount(1);
  await summary.click();
}

function themePanel(page: Page, summaryName: RegExp) {
  return page
    .locator("details", { has: page.locator(":scope > summary", { hasText: summaryName }) })
    .filter({ visible: true });
}

function surfaceOf(page: Page) {
  return page.locator("body").evaluate((body) => getComputedStyle(body).backgroundColor);
}

test.describe("theme", () => {
  test("follows the system preference when nothing is chosen", async ({ page, context }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/en");
    await expect(page.locator("html")).not.toHaveAttribute("data-theme");
    await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute(
      "content",
      "light dark",
    );
    await expect.poll(() => surfaceOf(page)).toBe(DARK_SURFACE);
    expect((await context.cookies()).find((c) => c.name === "theme")).toBeUndefined();

    await page.emulateMedia({ colorScheme: "light" });
    await expect.poll(() => surfaceOf(page)).toBe(LIGHT_SURFACE);
  });

  test("the prefers-contrast remap still applies in the dark theme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark", contrast: "more" });
    await page.goto("/en");
    const roles = () =>
      page.locator("html").evaluate((html) => {
        const style = getComputedStyle(html);
        return {
          fgMuted: style.getPropertyValue("--fg-muted").trim(),
          fg: style.getPropertyValue("--fg").trim(),
          border: style.getPropertyValue("--border").trim(),
          borderStrong: style.getPropertyValue("--border-strong").trim(),
        };
      });
    // Computed custom properties are substituted: muted text and borders resolve to the
    // full-contrast dark-theme values, not to the dark-theme muted ones.
    await expect.poll(async () => (await roles()).fgMuted).toBe("#f4f7f9");
    const resolved = await roles();
    expect(resolved.fgMuted).toBe(resolved.fg);
    expect(resolved.border).toBe(resolved.borderStrong);
    await expect.poll(() => surfaceOf(page)).toBe(DARK_SURFACE);
  });

  test("an explicit choice is stored, rendered on the server and wins over the system", async ({
    page,
    context,
  }, testInfo) => {
    const pt = testInfo.project.name === "pt";
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto(pt ? "/pt/nowhere?x=1" : "/en/nowhere?x=1");

    await openThemePanel(page, pt ? /Mudar de tema/ : /Change theme/);
    await page.getByRole("button", { name: pt ? "Escuro" : "Dark" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page).toHaveURL(pt ? /\/pt\/nowhere\?x=1$/ : /\/en\/nowhere\?x=1$/);
    await expect.poll(() => surfaceOf(page)).toBe(DARK_SURFACE);

    const cookie = (await context.cookies()).find((c) => c.name === "theme");
    expect(await cookieValue(context, "theme")).toBe("dark");
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("Lax");

    // The panel closes, the focus comes back to its summary and the change is announced.
    const panel = themePanel(page, pt ? /Mudar de tema/ : /Change theme/);
    await expect(panel).not.toHaveAttribute("open");
    await expect(panel.locator("summary")).toHaveText(pt ? /Tema: Escuro/ : /Theme: Dark/);
    await expect(panel.locator("summary")).toBeFocused();
    await expect(
      page.getByRole("status").filter({ hasText: /theme applied|Tema .* aplicado/ }),
    ).toHaveCount(1);

    // Server-rendered on the next request: no flash, no script.
    const html = await (await page.request.get(pt ? "/pt" : "/en")).text();
    expect(html).toContain('data-theme="dark"');
    expect(html).toContain('<meta name="color-scheme" content="dark"');
    await page.reload();
    await expect.poll(() => surfaceOf(page)).toBe(DARK_SURFACE);
  });

  test("choosing System removes the cookie", async ({ page, context }, testInfo) => {
    const pt = testInfo.project.name === "pt";
    await page.goto(pt ? "/pt" : "/en");
    await openThemePanel(page, pt ? /Mudar de tema/ : /Change theme/);
    await page.getByRole("button", { name: pt ? "Claro" : "Light" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(await cookieValue(context, "theme")).toBe("light");

    await openThemePanel(page, pt ? /Mudar de tema/ : /Change theme/);
    await page.getByRole("button", { name: pt ? "Sistema" : "System" }).click();
    await expect(page.locator("html")).not.toHaveAttribute("data-theme");
    expect((await context.cookies()).find((c) => c.name === "theme")).toBeUndefined();
  });

  test("GET on the resource route is 405 and a bad theme or redirect is 400", async ({ page }) => {
    expect((await page.request.get("/en/set-theme", { maxRedirects: 0 })).status()).toBe(405);
    const bad = await page.request.post("/en/set-theme", {
      form: { theme: "sepia", redirectTo: "/en" },
      maxRedirects: 0,
    });
    expect(bad.status()).toBe(400);
    const open = await page.request.post("/en/set-theme", {
      form: { theme: "dark", redirectTo: "https://evil.example" },
      maxRedirects: 0,
    });
    expect(open.status()).toBe(400);
  });
});
