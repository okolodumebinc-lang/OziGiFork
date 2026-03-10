import { test, expect } from '@playwright/test';

test.describe('Ozigi Context Engine Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should navigate Context Engine tabs and verify specific placeholders', async ({ page }) => {
    // 1. Verify we are on the Dashboard
    await expect(page.getByRole('heading', { name: 'Context Engine' })).toBeVisible();

    // 2. Link Tab (Default)
    const urlInput = page.getByPlaceholder('Paste an article or blog post URL...');
    await expect(urlInput).toBeVisible();

    // 3. Notes Tab
    // Using exact text from your tab buttons in ContextEngine.tsx
    await page.getByRole('button', { name: '📝 Notes' }).click();
    const textInput = page.getByPlaceholder('Paste your raw thoughts, meeting transcripts, or rough drafts here...');
    await expect(textInput).toBeVisible();

    // 4. Files Tab
    await page.getByRole('button', { name: '📎 Files' }).click();
    await expect(page.getByText('Upload PDF or Image')).toBeVisible();
  });

  test('should toggle Advanced Options and render the unauthenticated lock state', async ({ page }) => {
    // Advanced options should be hidden initially
    await expect(page.getByText('🗣️ Voice or Persona')).toBeHidden();

    // Click the exact progressive disclosure toggle text from your component
    const advancedToggle = page.getByRole('button', { name: '⚙️ Advanced Options (Personas, Formats) ⬇' });
    await advancedToggle.click();

    // Verify the expanded options appear
    await expect(page.getByText('🗣️ Voice or Persona')).toBeVisible();
    await expect(page.getByText('Campaign Directives')).toBeVisible();
    await expect(page.getByText('X (Twitter) Format')).toBeVisible();

    // Verify the unauthenticated fallback logic triggers successfully (Playwright runs as guest)
    await expect(page.getByText('🔒 Sign in to unlock')).toBeVisible();
  });

  test('should populate URL from Quick Examples, mock generation, and display Distribution Grid', async ({ page }) => {
    // 1. Click the built-in "Ozigi V2" quick example button instead of hardcoding a fake URL
    await page.getByRole('button', { name: 'Ozigi V2' }).click();
    
    // 2. Verify the input state successfully updated to the exact hardcoded URL in ContextEngine.tsx
    const urlInput = page.getByPlaceholder('Paste an article or blog post URL...');
    await expect(urlInput).toHaveValue('https://dev.to/dumebii/ozigi-v2-changelog-building-a-modular-agentic-content-engine-with-nextjs-supabase-and-playwright-59mo');

    // 3. Mock the Vertex AI / Backend Response matching the exact structure expected by dashboard/page.tsx
    await page.route('**/api/generate', async (route) => {
      // The frontend expects the JSON stringified inside the `output` key
      const jsonResponse = {
        output: JSON.stringify({
          campaign: [
            {
              day: 1,
              x: "Mocked Twitter Thread 1/3\n\n[Ozigi Playwright Mock Success]",
              linkedin: "Mocked LinkedIn Post here.",
              discord: "Mocked Discord Server Alert"
            }
          ]
        })
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(jsonResponse),
      });
    });

    // 4. Trigger Generation using the exact button text
    const generateBtn = page.getByRole('button', { name: 'Generate Campaign ⚡' });
    await expect(generateBtn).toBeEnabled();
    await generateBtn.click();

    // 5. Assert UI Layout Shift (Distillery hides, Reset Button appears)
    const resetBtn = page.getByRole('button', { name: '← Architect New Campaign' });
    await expect(resetBtn).toBeVisible();

    // 6. Assert Mock Data successfully rendered in the Distribution Grid
    await expect(page.getByText('Mocked Twitter Thread 1/3')).toBeVisible();
    await expect(page.getByText('[Ozigi Playwright Mock Success]')).toBeVisible();
  });
});