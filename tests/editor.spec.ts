import { test, expect } from "@playwright/test";

test("should allow inline editing of generated posts", async ({ page }) => {
  // 1. Navigate to the app
  await page.goto("/");

  // 2. Generate a campaign first so the Edit buttons appear
  const input = page.getByPlaceholder("Source article URL...");
  await input.fill("https://example.com/test-article");
  await page.getByRole("button", { name: /Architect/i }).click();

  // Wait for the generation to finish by looking for the pipeline headers
  await expect(page.getByText(/X Pipeline/i)).toBeVisible({ timeout: 15000 });

  // 3. Now test the Edit logic
  const editBtn = page.locator('button:has-text("Edit")').first();
  await editBtn.click();

  const textarea = page.locator("textarea");
  await textarea.fill("This is a manual QA edit.");

  const saveBtn = page.getByText("Save");
  await saveBtn.click();

  // 4. Verify the edit was saved
  await expect(page.getByText("This is a manual QA edit.")).toBeVisible();
});
