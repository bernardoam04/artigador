import { test, expect } from '@playwright/test';

test('user can type in search field', async ({ page }) => {
    await page.goto('/');
    const search = page.getByRole('textbox');
    await search.fill('transformer');
    await expect(search).toHaveValue('transformer');
});
