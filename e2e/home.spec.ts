import { test, expect } from '@playwright/test';

test('home page loads and shows search', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Artigador|Home|/);
    // Search component input should be present
    const search = page.getByRole('textbox');
    await expect(search).toBeVisible();
});
