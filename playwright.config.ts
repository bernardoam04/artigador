import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    timeout: 30 * 1000,
    expect: { timeout: 5000 },
    fullyParallel: false,
    workers: 1,
    reporter: 'list',
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'on', // Always record video
        // Slow down test execution to see what's happening (in milliseconds)
        launchOptions: {
            slowMo: 500, // Wait 500ms between each action
        },
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
    // WebServer: Descomente se quiser auto-start (requer servidor sem erros PostCSS)
    // Recomendado: rode `npm run dev` manualmente em terminal separado
    webServer: process.env.SKIP_WEBSERVER ? undefined : {
        // Usar webpack no ambiente de E2E (agora é o padrão no npm run dev)
        command: process.env.PLAYWRIGHT_WEB_SERVER_CMD || 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 60 * 1000,
    },
});
