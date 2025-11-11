import { test, expect } from '@playwright/test';

test('newsletter shows error on network failure', async ({ page }) => {
    await page.route('**/api/subscriptions', route => route.abort());
    await page.goto('/');

    const email = page.getByPlaceholder('Enter your email address');
    await email.fill('e2e@example.com');

    const button = page.getByRole('button', { name: /subscribe/i });
    await button.click();

    await expect(page.getByText(/error/i)).toBeVisible();
});
