import { test, expect } from '@playwright/test';

test.describe('Navigation Flow', () => {
    test('navigate from home to browse, search author, view article, visit author profile, and view another article', async ({ page }) => {
        test.setTimeout(60000); // Increase timeout to 60 seconds
        // Start from homepage
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        console.log('Step 1: Starting from homepage');
        
        // Click on Browse button/link
        const browseLink = page.getByRole('link', { name: /browse|explorar/i }).first();
        await browseLink.waitFor({ state: 'visible', timeout: 10000 });
        await page.waitForTimeout(1000);
        
        console.log('Step 2: Clicking Browse link');
        await browseLink.click();
        
        // Wait for browse page to load
        await page.waitForURL('**/browse**', { timeout: 10000 });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Verify we're on browse page
        const currentUrl = page.url();
        console.log('Current URL after browse click:', currentUrl);
        expect(currentUrl).toContain('/browse');
        
        // Search for "bulbo" using the browse page search bar (not header)
        console.log('Step 3: Searching for "bulbo" in browse search bar');
        
        // Wait for the browse page search input to be visible
        // It should be the search bar within the filters/content area, not the header
        const browseSearchInput = page.locator('.bg-white.rounded-lg input[type="text"]').first();
        await browseSearchInput.waitFor({ state: 'visible', timeout: 10000 });
        await browseSearchInput.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        
        await browseSearchInput.fill('bulbo');
        await page.waitForTimeout(1000);
        
        // Press Enter to search
        await browseSearchInput.press('Enter');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        console.log('Step 4: Search results loaded');
        
        // Find and click on "WIFI-6" article
        const wifi6Link = page.getByRole('link', { name: /WIFI-6/i }).first();
        const wifi6Count = await page.getByRole('link', { name: /WIFI-6/i }).count();
        console.log(`Found ${wifi6Count} links with "WIFI-6"`);
        
        if (wifi6Count > 0) {
            await wifi6Link.scrollIntoViewIfNeeded();
            await page.waitForTimeout(2000);
            
            console.log('Step 5: Clicking on WIFI-6 article');
            // Force click to bypass any overlapping elements
            await wifi6Link.click({ force: true });
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);
            
            // Verify we're on the article page
            const articleUrl = page.url();
            console.log('Article URL:', articleUrl);
            expect(articleUrl).toContain('/article/');
            
            // Find and click on author name "Bulbo"
            console.log('Step 6: Looking for author name "Bulbo"');
            const authorLink = page.getByRole('link', { name: /^Bulbo$/i }).or(page.locator('a').filter({ hasText: /^Bulbo$/i })).first();
            const authorLinkCount = await authorLink.count();
            console.log(`Found ${authorLinkCount} links with "Bulbo"`);
            
            if (authorLinkCount > 0) {
                await authorLink.scrollIntoViewIfNeeded();
                await page.waitForTimeout(1000);
                
                console.log('Step 7: Clicking on author "Bulbo"');
                await authorLink.click();
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(2000);
                
                // Verify we're on author page
                const authorUrl = page.url();
                console.log('Author page URL:', authorUrl);
                expect(authorUrl).toContain('/authors/');
                
                // Find and click on "Machine Learning" article
                console.log('Step 8: Looking for Machine Learning article');
                const mlArticleLink = page.getByRole('link', { name: /Machine Learning/i }).first();
                const mlCount = await mlArticleLink.count();
                console.log(`Found ${mlCount} links with "Machine Learning"`);
                
                if (mlCount > 0) {
                    await mlArticleLink.scrollIntoViewIfNeeded();
                    await page.waitForTimeout(1000);
                    
                    console.log('Step 9: Clicking on Machine Learning article');
                    await mlArticleLink.click();
                    await page.waitForLoadState('networkidle');
                    await page.waitForTimeout(2000);
                    
                    // Verify we're on the ML article page
                    const mlArticleUrl = page.url();
                    console.log('ML Article URL:', mlArticleUrl);
                    expect(mlArticleUrl).toContain('/article/');
                    
                    // Verify article title is visible
                    const articleTitle = page.locator('h1').filter({ hasText: /Machine Learning/i });
                    await expect(articleTitle).toBeVisible();
                    
                    // Click on "View PDF" button to show PDF
                    console.log('Step 10: Looking for View PDF button');
                    const viewPdfButton = page.getByRole('button', { name: /View PDF/i });
                    await viewPdfButton.scrollIntoViewIfNeeded();
                    await page.waitForTimeout(1000);
                    
                    console.log('Step 11: Clicking View PDF button');
                    await viewPdfButton.click();
                    await page.waitForTimeout(2000);
                    
                    // Verify PDF iframe is visible
                    const pdfIframe = page.locator('iframe[src*="machine-learning-network-traffic.pdf"]');
                    await expect(pdfIframe).toBeVisible();
                    console.log('✓ PDF iframe is visible and embedded in the page');
                    
                    // Scroll down to show the PDF better
                    await pdfIframe.scrollIntoViewIfNeeded();
                    await page.waitForTimeout(1000);
                    
                    console.log('✓ Successfully navigated through entire flow and displayed PDF!');
                    
                    // Wait 3 seconds at the end for presentation
                    await page.waitForTimeout(3000);
                    
                    expect(true).toBeTruthy();
                } else {
                    console.log('⚠️ Machine Learning article not found');
                    expect(mlCount).toBeGreaterThan(0);
                }
            } else {
                console.log('⚠️ Author link not found');
                expect(authorLinkCount).toBeGreaterThan(0);
            }
        } else {
            console.log('⚠️ WIFI-6 article not found in search results');
            expect(wifi6Count).toBeGreaterThan(0);
        }
    });
});
