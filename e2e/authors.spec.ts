import { test, expect } from '@playwright/test';

test('authors page renders', async ({ page }) => {
    await page.goto('/authors');
    await expect(page.getByText(/authors/i)).toBeVisible();
});
