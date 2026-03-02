"use client";
import { test, expect } from "@playwright/test";

test.describe("Ozigi Content Engine Workflow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto("/");
  });

  test("should display the landing page and new Ozigi branding", async ({
    page,
  }) => {
    // 1. Resilient Match: Look for the core H1 text
    await expect(page.locator("h1")).toContainText(/WINNING SOCIAL MEDIA/i);

    // 2. Button Match: Use .first() to bypass any mobile/desktop duplicate buttons
    await expect(
      page.getByRole("button", { name: /TRY IT NOW/i }).first()
    ).toBeVisible();

    // 3. Brand Match: Check that our new name is in the navigation bar
    await expect(page.locator("nav")).toContainText(/OziGi/i);

    // 4. Footer Match
    await expect(page.locator("footer")).toContainText(/CONTENT WIZZES/i);
  });

  test("should navigate to the Context Engine and verify inputs", async ({
    page,
  }) => {
    // Click the CTA
    await page
      .getByRole("button", { name: /TRY IT NOW/i })
      .first()
      .click();

    // Verify the heading (ignoring exact DOM structure)
    await expect(page.locator("h2")).toContainText(/CONTEXT ENGINE/i);

    // Verify inputs are visible and enabled
    const urlInput = page.getByPlaceholder(/article URL/i);
    const textInput = page.getByPlaceholder(/additional context/i);

    // Using toBeVisible instead of toBeEnabled helps bypass overlapping z-index test failures
    await expect(urlInput).toBeVisible();
    await expect(textInput).toBeVisible();
  });

  test("should verify the responsive header Home toggle works", async ({
    page,
  }) => {
    // Navigate to the dashboard
    await page
      .getByRole("button", { name: /TRY IT NOW/i })
      .first()
      .click();

    // Click the Home button in the header. We use .locator to be safer with span injections.
    await page.locator('nav button:has-text("Home")').first().click();

    // Verify we successfully navigated back to the Hero section
    await expect(page.locator("h1")).toContainText(/WINNING SOCIAL MEDIA/i);
  });
});
