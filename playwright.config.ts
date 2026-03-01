import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: 1,
  use: {
    // This tells page.goto('/') where to go
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  // This automatically starts your Next.js app before testing
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
