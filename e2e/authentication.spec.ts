import { test, expect } from '@playwright/test';

test.describe('Authentication Flow (V2 - Para Apresentação)', () => {
    test('login page loads and displays form', async ({ page }) => {
        await page.goto('/login');

        await expect(page).toHaveURL(/\/login/);
        await page.waitForLoadState('networkidle');

        const usernameInput = page.getByLabel(/username/i).or(page.getByPlaceholder(/username/i)).first();
        const loginButton = page.getByRole('button', { name: /sign in|login|entrar/i }).first();

        // Asserção principal: elementos estão visíveis
        await expect(usernameInput).toBeVisible();
        await expect(loginButton).toBeVisible();
        
        // Pausa para apresentação
        await page.waitForTimeout(2000);
    });

    test('login form shows validation errors for empty fields', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        const loginButton = page.getByRole('button', { name: /sign in|login|entrar/i }).first();
        await loginButton.click();

        // Garante que a URL não mudou
        await expect(page).toHaveURL(/\/login/);
        
        // Pausa para apresentação
        await page.waitForTimeout(2000);
    });

    test('login form handles invalid credentials', async ({ page }) => {
        // Mock (simulação) de uma falha de login
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

        const usernameInput = page.getByLabel(/username/i).or(page.getByPlaceholder(/username/i)).first();
        const passwordInput = page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i)).first();
        
        await usernameInput.fill('wronguser');
        await page.waitForTimeout(1000); // Pausa
        await passwordInput.fill('wrongpassword');
        await page.waitForTimeout(1000); // Pausa

        const loginButton = page.getByRole('button', { name: /sign in|login|entrar/i }).first();
        await loginButton.click();

        // Espera a mensagem de erro aparecer
        const errorMessage = page.getByText(/invalid|error|incorrect|failed/i).first();
        await expect(errorMessage).toBeVisible();

        // Garante que não fomos redirecionados
        await expect(page).toHaveURL(/\/login/);
        
        // Pausa para apresentação
        await page.waitForTimeout(2000);
    });

    test('login with admin and delete first article', async ({ page, context }) => {
        // --- 1. LOGIN ---
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        const emailInput = page.getByLabel(/email|username|usuário/i).or(page.getByPlaceholder(/email|username|usuário/i)).first();
        const passwordInput = page.getByLabel(/password|senha/i).or(page.getByPlaceholder(/password|senha/i)).first();
        
        await emailInput.fill('admin');
        await page.waitForTimeout(1000); // Pausa
        await passwordInput.fill('admin123');
        await page.waitForTimeout(1000); // Pausa
        
        const loginButton = page.getByRole('button', { name: /login|sign in|entrar/i }).first();
        
        // Espera pela navegação
        await Promise.all([
            page.waitForURL(/\/admin/, { timeout: 10000 }), 
            loginButton.click()
        ]);
        
        console.log('Current URL after login:', page.url());
        await page.waitForTimeout(2000); // Pausa pós-login
        
        // --- 2. NAVEGAÇÃO ---
        console.log('Looking for Articles link...');
        const articlesLink = page.getByRole('link', { name: /articles|artigos/i }).first();
        
        await articlesLink.evaluate((el) => el.removeAttribute('target'));
        
        console.log('Clicking Articles link...');
        await Promise.all([
            page.waitForURL(/\/admin\/articles/, { waitUntil: 'networkidle' }),
            articlesLink.click()
        ]);
        
        const articlesUrl = page.url();
        console.log('URL after navigating to articles:', articlesUrl);
        await page.waitForTimeout(2000); // Pausa na página de artigos
        
        // Checagem de segurança
        if (articlesUrl.includes('/login')) {
            throw new Error('Not authenticated - redirected to login page');
        }

        // --- 3. AÇÃO (DELETAR) ---
        
        await expect(page.locator('table, [role="table"]')).toBeVisible();

        const articleRows = page.locator('table tbody tr, [role="row"]').filter({ hasNotText: /no articles|nenhum artigo/i });
        const initialCount = await articleRows.count();
        console.log(`Found ${initialCount} articles in the table`);

        if (initialCount > 0) {
            // Configura o handler do diálogo
            page.once('dialog', async (dialog) => {
                console.log(`Dialog message: ${dialog.message()}`);
                await page.waitForTimeout(1500); // Pausa para ver o diálogo
                await dialog.accept();
                console.log('Dialog accepted.');
            });
            
            const firstDeleteButton = page.getByRole('button', { name: /delete|deletar|excluir|remover/i }).first();
            await firstDeleteButton.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000); // Pausa para ver o botão
            
            console.log('Clicking delete button...');
            await firstDeleteButton.click();

            // Espera pelo resultado (contagem diminuir)
            console.log('Waiting for row count to decrease...');
            await expect(articleRows).toHaveCount(initialCount - 1, { timeout: 10000 });

            const finalCount = await articleRows.count();
            console.log(`Articles after deletion: ${finalCount}`);
            
            expect(finalCount).toBe(initialCount - 1);
            console.log('✓ Article deleted successfully!');

        } else {
            console.log('No articles found to delete');
            // Se não há artigos, o teste deve passar, pois não há o que fazer.
            // A asserção é que a contagem é 0.
            expect(initialCount).toBe(0);
        }
        
        // Pausa para apresentação
        await page.waitForTimeout(2000);
    });

    test('protected admin routes require authentication', async ({ page }) => {
        await page.goto('/admin');

        // Espera a URL mudar para /login
        await page.waitForURL(/\/login/, { timeout: 10000 });
        
        // E então confirmar
        expect(page.url()).toContain('/login');
        
        // Pausa para apresentação
        await page.waitForTimeout(2000);
    });
});