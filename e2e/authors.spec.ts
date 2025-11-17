import { test, expect } from '@playwright/test';

test.describe('Authors Browse and Filter', () => {
    test('navigate to authors, search for non-existent name, clear filter, search for pedro, and view profile', async ({ page }) => {
        test.setTimeout(60000);
        
        // Start from homepage
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        console.log('Step 1: Starting from homepage');
        
        // Find Browse Authors button and scroll to it
        const browseAuthorsLink = page.getByRole('link', { name: /browse authors/i });
        await browseAuthorsLink.scrollIntoViewIfNeeded();
        await page.waitForTimeout(2000);
        
        console.log('Step 2: Clicking Browse Authors link');
        await browseAuthorsLink.click();
        
        // Wait for authors page to load
        await page.waitForURL('**/authors**', { timeout: 10000 });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Verify we're on authors page
        const currentUrl = page.url();
        console.log('Current URL after clicking Authors:', currentUrl);
        expect(currentUrl).toContain('/authors');
        
        // Search for non-existent author "inexistente" using the authors page search bar
        console.log('Step 3: Searching for non-existent author "inexistente"');
        // Use the specific search input for authors (not suggestions)
        const searchInput = page.locator('input[placeholder*="authors, affiliations, emails"]');
        await searchInput.waitFor({ state: 'visible', timeout: 10000 });
        await searchInput.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        
        await searchInput.fill('inexistente');
        await page.waitForTimeout(1500);
        
        // Press Enter to search
        await searchInput.press('Enter');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        console.log('Step 4: Verifying no results for "inexistente"');
        // Should show 0 authors found
        const noResults = page.locator('text=/0 authors found/i');
        await expect(noResults).toBeVisible({ timeout: 5000 });
        
        // Click the X button to clear the search
        console.log('Step 5: Clicking X button to clear search');
        // The SearchWithSuggestions component has a clear button (X icon) with class "right-12"
        const clearButton = page.locator('button.absolute.right-12').filter({ has: page.locator('svg.lucide-x') });
        await clearButton.click();
        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle');
        
        console.log('Step 6: Search cleared, searching for "pedro"');
        
        // Search for "pedro"
        await searchInput.fill('pedro');
        await page.waitForTimeout(1000);
        
        // Click in the middle of the screen to stop any suggestion loops
        await page.mouse.click(500, 400);
        await page.waitForTimeout(500);
        
        // Press Enter to search
        console.log('Step 6.5: Pressing Enter to search for pedro');
        await searchInput.press('Enter');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        console.log('Step 7: Verifying results for "pedro"');
        // Should find pedro
        const pedroLink = page.getByRole('link', { name: /pedro/i }).first();
        await expect(pedroLink).toBeVisible({ timeout: 5000 });
        
        // Click on pedro's profile
        console.log('Step 8: Clicking on pedro\'s profile');
        await pedroLink.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        await pedroLink.click();
        
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Verify we're on pedro's author page
        const authorPageUrl = page.url();
        console.log('Author page URL:', authorPageUrl);
        expect(authorPageUrl).toContain('/authors/');
        
        // Verify the author name is displayed
        const authorName = page.locator('h1, h2').filter({ hasText: /pedro/i }).first();
        await expect(authorName).toBeVisible();
        
        console.log('✓ Successfully navigated through authors search flow!');
        
        // Wait for presentation
        await page.waitForTimeout(3000);
        
        expect(true).toBeTruthy();
    });
});
