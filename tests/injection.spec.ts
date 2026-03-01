import { test, expect } from "@playwright/test";

test.describe("WriterHelper v2 Context Injection Security", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("securely blocks context injection when unauthenticated", async ({
    page,
  }) => {
    // 1. Verify the URL input is completely disabled
    const urlInput = page.getByPlaceholder("Paste an article URL here...");
    await expect(urlInput).toBeDisabled();

    // 2. Verify the Textarea is completely disabled
    const textInput = page.getByPlaceholder(
      "Please connect GitHub to unlock the Context Tank..."
    );
    await expect(textInput).toBeDisabled();

    // 3. Verify the core action button cannot be clicked
    const synthesizeBtn = page.getByRole("button", {
      name: /Synthesize Strategy/i,
    });
    await expect(synthesizeBtn).toBeDisabled();
  });

  test("displays awaiting context UI by default", async ({ page }) => {
    // Verify the empty state is visible before any injection happens
    const emptyState = page.getByText("Awaiting Context Injection 🌿");
    await expect(emptyState).toBeVisible();
  });
});
