import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        include: ['src/__tests__/**/*.{test,spec}.{ts,tsx}'],
        exclude: ['e2e/**', 'node_modules/**', '.next/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            reportsDirectory: './coverage',
            include: [
                'src/lib/auth.ts',
                'src/lib/bibtex.ts',
                'src/lib/email.ts',
                'src/components/NewsletterSignup.tsx',
                'src/app/api/subscriptions/route.ts',
                'src/app/api/articles/search/route.ts',
                'src/app/api/auth/login/route.ts',
                'src/app/api/articles/route.ts',
            ],
            exclude: [
                'src/**/*.d.ts',
                'src/**/__tests__/**',
                'src/**/__mocks__/**',
                'src/lib/prisma.ts',
                'src/lib/seed.ts',
            ],
            thresholds: {
                lines: 70,
                statements: 70,
                functions: 70,
                branches: 50,
            },
        },
    },
});
