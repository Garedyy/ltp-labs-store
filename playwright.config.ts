import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env.CI);
const appPort = 3000;
const mockApiPort = 4010;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  globalTeardown: "./tests/e2e/global-teardown.ts",
  // Reduced motion for every project: under it the app is exactly its motionless self, so the
  // suite stays deterministic. With an entrance running, Playwright's stability check fails and
  // retries an action with a forced scroll, which leaves the page scrolled and trips the IBM
  // sticky-header rule; without JavaScript Chromium stops painting once an animation ends and the
  // check never completes. The motion itself is verified by the tests that opt back in with
  // `page.emulateMedia({ reducedMotion: "no-preference" })` (layout.spec.ts, no-js.spec.ts).
  use: {
    baseURL: `http://localhost:${appPort}`,
    trace: "on-first-retry",
    reducedMotion: "reduce",
  },
  webServer: [
    {
      command: "node tests/e2e/mock-api.server.ts",
      url: `http://localhost:${mockApiPort}/products/categories`,
      reuseExistingServer: !isCI,
      timeout: 30_000,
      env: { MOCK_API_PORT: String(mockApiPort) },
    },
    {
      command: "npm run build && npm run start",
      url: `http://localhost:${appPort}/`,
      reuseExistingServer: !isCI,
      timeout: 120_000,
      env: {
        PORT: String(appPort),
        SESSION_SECRET: "e2e",
        DUMMYJSON_BASE_URL: `http://localhost:${mockApiPort}`,
        IBM_TELEMETRY_DISABLED: "true",
      },
    },
  ],
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
      testIgnore: /no-js/,
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
      testIgnore: /no-js/,
    },
    {
      name: "no-js",
      use: { ...devices["Desktop Chrome"], javaScriptEnabled: false },
      testMatch: /no-js/,
    },
    {
      name: "pt",
      use: { ...devices["Desktop Chrome"], locale: "pt-PT" },
      testMatch: /i18n|catalogue|cart|reflow|theme/,
    },
    // System dark preference without a cookie: the WCAG scan of every route x locale, dark.
    {
      name: "dark-chromium",
      use: { ...devices["Desktop Chrome"], colorScheme: "dark" },
      testMatch: /a11y\.spec/,
    },
  ],
});
