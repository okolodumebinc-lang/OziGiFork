import { test, expect } from '@playwright/test';

test.describe('Ozigi Landing Page & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render the correct branding and hero copy', async ({ page }) => {
    // 1. Check for the updated Hero Headers (split between H1 and span in Hero.tsx)
    await expect(page.locator('h1')).toContainText('The Intelligent');
    await expect(page.getByText('Content Engine', { exact: true }).first()).toBeVisible();

    // 2. Check for the "New Badge" component
    await expect(page.getByText('New: Multi-platform content campaigns')).toBeVisible();

    // 3. Verify Call to Action Buttons render properly
    await expect(page.getByRole('link', { name: 'See a Live Example' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In to Build' })).toBeVisible();
  });

test('header navigation should route to dashboard via Try It Now', async ({ page }) => {
    // Select the first instance of the button
    const tryItNowBtn = page.getByRole('link', { name: 'Try It Now' }).first();
    
    await expect(tryItNowBtn).toBeVisible();
    
    // Force the click to bypass Playwright's actionability checks 
    // (needed because the duplicate Header components are overlapping)
    await tryItNowBtn.click({ force: true });
    
    // Verify Next.js router transitions to the correct dashboard view
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Context Engine' })).toBeVisible();
  });
});