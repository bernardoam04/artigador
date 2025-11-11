import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    timeout: 30 * 1000,
    expect: { timeout: 5000 },
    fullyParallel: true,
    reporter: 'list',
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
    webServer: {
        // Usar webpack no ambiente de E2E para evitar problemas do Turbopack com lightningcss no Windows
        command: process.env.PLAYWRIGHT_WEB_SERVER_CMD || 'npm run dev:webpack',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
    },
});
