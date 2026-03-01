import { test, expect } from "@playwright/test";

test.describe("WriterHelper v2 Core UI", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto("/");
  });

  test("loads the primary header and context tank", async ({ page }) => {
    // 1. Verify the brand heading
    await expect(page.locator("h1")).toContainText("WriterHelper");
    await expect(page.getByText("Context Tank")).toBeVisible();

    // 2. Verify the Auth Bridge is asking for login
    const connectBtn = page.getByRole("button", { name: /Connect GitHub/i });
    await expect(connectBtn).toBeVisible();
  });

  test("displays the unified multi-modal inputs", async ({ page }) => {
    // 1. Verify the URL input is present and locked
    const urlInput = page.getByPlaceholder("Paste an article URL here...");
    await expect(urlInput).toBeVisible();
    await expect(urlInput).toBeDisabled();

    // 2. Verify the Textarea input is present and locked
    const textInput = page.getByPlaceholder(
      "Please connect GitHub to unlock the Context Tank..."
    );
    await expect(textInput).toBeVisible();
    await expect(textInput).toBeDisabled();

    // 3. Verify the core action button
    const synthesizeBtn = page.getByRole("button", {
      name: /Synthesize Strategy/i,
    });
    await expect(synthesizeBtn).toBeVisible();
    await expect(synthesizeBtn).toBeDisabled();
  });

  test("renders the social distribution pipelines", async ({ page }) => {
    // 1. Verify all three columns rendered
    await expect(page.getByText("X Pipeline")).toBeVisible();
    await expect(page.getByText("LinkedIn Pipeline")).toBeVisible();
    await expect(page.getByText("Discord Pipeline")).toBeVisible();

    // 2. Verify the empty state placeholder
    await expect(page.getByText("Awaiting Context Injection")).toBeVisible();
  });
});
