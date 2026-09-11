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
  use: {
    baseURL: `http://localhost:${appPort}`,
    trace: "on-first-retry",
  },
  webServer: [
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
      testMatch: /i18n|catalogue|cart|reflow/,
    },
  ],
});
