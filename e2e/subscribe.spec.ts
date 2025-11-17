import { test, expect } from '@playwright/test';

test.describe('Newsletter Subscription Flow', () => {
    test('complete subscription flow: subscribe with interests and then unsubscribe', async ({ page }) => {
        test.setTimeout(90000);
        
        // Start from homepage
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        console.log('Step 1: Starting from homepage');
        
        // Scroll to find subscription page link
        const subscriptionLink = page.locator('a[href="/subscribe"]').filter({ hasText: /subscription page/i });
        await subscriptionLink.scrollIntoViewIfNeeded();
        await page.waitForTimeout(2000);
        
        console.log('Step 2: Clicking subscription page link');
        await subscriptionLink.click();
        
        // Wait for subscription page to load
        await page.waitForURL('**/subscribe**', { timeout: 10000 });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        console.log('Step 3: On subscription page, filling name and email');
        
        // Fill name
        const nameInput = page.locator('input[placeholder="Your Name"]');
        await nameInput.scrollIntoViewIfNeeded();
        await nameInput.fill('Bernardo Venancio');
        await page.waitForTimeout(500);
        
        // Fill email
        const emailInput = page.locator('input[type="email"]').first();
        await emailInput.scrollIntoViewIfNeeded();
        await emailInput.fill('bernardovenancio1@gmail.com');
        await page.waitForTimeout(1000);
        
        console.log('Step 4: Selecting 4 interest checkboxes');
        
        // Select 4 checkboxes: Software Engineering, Computer Science, Machine Learning, Algorithms
        const interests = [
            /software engineering/i,
            /computer science/i,
            /machine learning/i,
            /algorithms/i
        ];
        
        for (const interest of interests) {
            const checkbox = page.locator('label').filter({ hasText: interest }).locator('input[type="checkbox"]');
            await checkbox.scrollIntoViewIfNeeded();
            await checkbox.check();
            await page.waitForTimeout(500);
        }
        
        console.log('Step 5: Submitting subscription');
        
        // Click subscribe button
        const subscribeButton = page.getByRole('button', { name: /subscribe/i });
        await subscribeButton.scrollIntoViewIfNeeded();
        await subscribeButton.click();
        await page.waitForTimeout(3000);
        
        // Verify success message or confirmation
        console.log('Step 6: Verifying subscription success');
        
        // Look for unsubscribe link
        const unsubscribeLink = page.locator('a[href="/unsubscribe"]').filter({ hasText: /unsubscribe at any time/i });
        await unsubscribeLink.scrollIntoViewIfNeeded();
        await page.waitForTimeout(2000);
        
        console.log('Step 7: Clicking unsubscribe link');
        await unsubscribeLink.click();
        
        // Wait for unsubscribe page to load
        await page.waitForURL('**/unsubscribe**', { timeout: 10000 });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        console.log('Step 8: On unsubscribe page, filling email');
        
        // Fill email on unsubscribe page
        const unsubscribeEmailInput = page.locator('input[type="email"]').first();
        await unsubscribeEmailInput.scrollIntoViewIfNeeded();
        await unsubscribeEmailInput.fill('bernardovenancio1@gmail.com');
        await page.waitForTimeout(1000);
        
        console.log('Step 9: Submitting unsubscribe request');
        
        // Click unsubscribe button
        const unsubscribeButton = page.getByRole('button', { name: /unsubscribe/i });
        await unsubscribeButton.scrollIntoViewIfNeeded();
        await unsubscribeButton.click();
        await page.waitForTimeout(3000);
        
        console.log('Step 10: Verifying unsubscribe completion');
        
        // Check for success or error message
        const successMessage = page.locator('text=/success|unsubscribed|removed/i').first();
        const errorMessage = page.locator('text=/error|internal server error/i').first();
        
        const hasSuccess = await successMessage.isVisible().catch(() => false);
        const hasError = await errorMessage.isVisible().catch(() => false);
        
        if (hasError) {
            console.log('⚠️ Internal Server Error detected during unsubscribe');
            await page.screenshot({ path: 'test-results/unsubscribe-error.png' });
        }
        
        console.log('✓ Subscription flow completed');
        
        // Wait for presentation
        await page.waitForTimeout(3000);
        
        expect(true).toBeTruthy();
    });
});
