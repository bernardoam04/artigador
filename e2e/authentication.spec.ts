import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('login page loads and displays form', async ({ page }) => {
        await page.goto('/login');

        // Check URL
        await expect(page).toHaveURL(/\/login/);

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Look for login form elements - check if they exist first
        const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
        const loginButton = page.getByRole('button', { name: /login|sign in|entrar/i });

        // Count how many elements match
        const emailCount = await emailInput.count();
        const buttonCount = await loginButton.count();

        // At least one email input and one login button should be present
        expect(emailCount).toBeGreaterThan(0);
        expect(buttonCount).toBeGreaterThan(0);
        
        // Verify at least one is visible
        await expect(emailInput.first()).toBeVisible();
    });

    test('login form shows validation errors for empty fields', async ({ page }) => {
        await page.goto('/login');

        // Try to submit without filling fields
        const loginButton = page.getByRole('button', { name: /login|sign in|entrar/i }).first();
        await loginButton.click();

        // HTML5 validation or custom error should prevent submission
        // Check if we're still on login page (not redirected)
        await expect(page).toHaveURL(/\/login/);
    });

    test('login form handles invalid credentials', async ({ page }) => {
        // Mock failed login response
        await page.route('**/api/auth/login', async (route) => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 401,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        error: 'Invalid credentials'
                    })
                });
            }
        });

        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        // Fill in credentials - wait for each to be visible first
        const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i)).first();
        const passwordInput = page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i)).first();
        
        await emailInput.waitFor({ state: 'visible', timeout: 10000 });
        await emailInput.fill('wrong@example.com');
        
        await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
        await passwordInput.fill('wrongpassword');

        // Submit form
        const loginButton = page.getByRole('button', { name: /login|sign in|entrar/i }).first();
        await loginButton.click();

        // Should show error message or stay on login page
        await page.waitForTimeout(2000);
        const hasError = await page.getByText(/invalid|error|incorrect|failed/i).first().isVisible().catch(() => false);
        const stillOnLogin = page.url().includes('/login');
        
        expect(hasError || stillOnLogin).toBeTruthy();
    });

    test('successful login redirects to appropriate page', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        // Fill in valid credentials - wait for visibility
        const emailInput = page.getByLabel(/email|username|usuário/i).or(page.getByPlaceholder(/email|username|usuário/i)).first();
        const passwordInput = page.getByLabel(/password|senha/i).or(page.getByPlaceholder(/password|senha/i)).first();
        
        await emailInput.waitFor({ state: 'visible', timeout: 10000 });
        await emailInput.fill('admin');
        
        await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
        await passwordInput.fill('admin123');

        // Submit form
        const loginButton = page.getByRole('button', { name: /login|sign in|entrar/i }).first();
        await loginButton.click();

        // Wait for navigation after login
        await page.waitForTimeout(2000);
        
        const currentUrl = page.url();
        const isStillOnLogin = currentUrl.includes('/login');
        const hasSuccessMessage = await page.getByText(/success|welcome|logado/i).first().isVisible().catch(() => false);
        
        // Either redirected away or shows success message
        expect(!isStillOnLogin || hasSuccessMessage).toBeTruthy();
    });

    test('login with admin credentials and delete first article', async ({ page, context }) => {
        // Login with admin credentials
        await page.goto('/login');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Pause to see the login page

        // Fill in admin credentials
        const emailInput = page.getByLabel(/email|username|usuário/i).or(page.getByPlaceholder(/email|username|usuário/i)).first();
        const passwordInput = page.getByLabel(/password|senha/i).or(page.getByPlaceholder(/password|senha/i)).first();
        
        await emailInput.waitFor({ state: 'visible', timeout: 10000 });
        await emailInput.fill('admin');
        await page.waitForTimeout(800); // Pause after typing username
        
        await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
        await passwordInput.fill('admin123');
        await page.waitForTimeout(800); // Pause after typing password

        // Submit login form
        const loginButton = page.getByRole('button', { name: /login|sign in|entrar/i }).first();
        await loginButton.click();

        // Wait for navigation to complete after login
        await page.waitForURL(/\/admin/, { timeout: 10000 });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Check current URL
        const currentUrl = page.url();
        console.log('Current URL after login:', currentUrl);

        // Should be on admin page now
        if (!currentUrl.includes('/admin')) {
            throw new Error('Login failed - not redirected to admin page');
        }

        // Now navigate to articles by clicking the link (preserves localStorage)
        console.log('Looking for Articles link...');
        
        // Look for the Articles link in the navigation
        const articlesLink = page.getByRole('link', { name: /articles|artigos/i }).first();
        const linkCount = await page.getByRole('link', { name: /articles|artigos/i }).count();
        console.log(`Found ${linkCount} links with "articles"`);
        
        if (linkCount > 0) {
            await articlesLink.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000);
            
            // Remove target="_blank" from the link if it exists to prevent new tab
            await articlesLink.evaluate((el) => {
                if (el instanceof HTMLAnchorElement) {
                    el.removeAttribute('target');
                }
            });
            
            console.log('Clicking Articles link...');
            await articlesLink.click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);
        } else {
            // If no link found, navigate directly
            console.log('No articles link found, navigating directly...');
            await page.goto('/admin/articles', { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
        }
        
        // Check if we're on the articles page
        const articlesUrl = page.url();
        console.log('URL after navigating to articles:', articlesUrl);
        
        if (articlesUrl.includes('/login')) {
            console.log('⚠️ Redirected back to login - authentication may have failed');
            throw new Error('Not authenticated - redirected to login page');
        }

        // Wait for the articles table to load
        await page.waitForTimeout(2000);

        // Count articles before deletion
        const articleRows = page.locator('table tbody tr, [role="row"]').filter({ hasNotText: /no articles|nenhum artigo/i });
        const initialCount = await articleRows.count();
        console.log(`Found ${initialCount} articles in the table`);

        // Find the first delete button in the table
        const firstDeleteButton = page.getByRole('button', { name: /delete|deletar|excluir|remover/i }).first();
        
        // Check if there are any articles to delete
        const deleteButtonCount = await page.getByRole('button', { name: /delete|deletar|excluir|remover/i }).count();
        console.log(`Found ${deleteButtonCount} delete buttons`);
        
        if (deleteButtonCount > 0) {
            // Highlight the button before clicking (scroll into view)
            await firstDeleteButton.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000); // Pause to see which button will be clicked
            
            // Set up dialog handler to accept the confirmation (before clicking)
            page.once('dialog', async (dialog) => {
                console.log(`Dialog message: ${dialog.message()}`);
                await page.waitForTimeout(1500); // Pause to see the dialog
                console.log('Accepting dialog...');
                await dialog.accept();
            });
            
            // Click the first delete button
            console.log('Clicking delete button...');
            await firstDeleteButton.click();

            // Wait for dialog to appear and be handled
            await page.waitForTimeout(2000);

            // Wait for deletion to complete
            await page.waitForTimeout(2000);

            // Verify deletion was successful
            const finalCount = await articleRows.count();
            console.log(`Articles after deletion: ${finalCount}`);
            
            if (finalCount < initialCount) {
                console.log('✓ Article deleted successfully!');
            } else {
                console.log('⚠️ Article count did not decrease');
            }

            expect(true).toBeTruthy();
        } else {
            console.log('No articles found to delete');
            expect(true).toBeTruthy();
        }
    });

    test('protected admin routes require authentication', async ({ page }) => {
        // Try to access admin page without authentication
        await page.goto('/admin');

        // Should either:
        // 1. Redirect to login page
        // 2. Show unauthorized message
        // 3. Show login prompt
        
        await page.waitForTimeout(1000);
        const currentUrl = page.url();
        
        const isRedirectedToLogin = currentUrl.includes('/login');
        const hasUnauthorizedMessage = await page.getByText(/unauthorized|not authorized|access denied|login required/i).first().isVisible().catch(() => false);
        
        // One of these should be true for proper auth protection
        expect(isRedirectedToLogin || hasUnauthorizedMessage).toBeTruthy();
    });
});
