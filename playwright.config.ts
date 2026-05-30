import { defineConfig, devices } from '@playwright/test';

// Iridium's dev port 5173 is often occupied by other local projects, so the
// E2E suite runs the app on a dedicated port. Override with E2E_PORT if needed.
const PORT = Number(process.env.E2E_PORT ?? 7778);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
    globalSetup: './tests/global-setup.ts',
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: BASE_URL,
        navigationTimeout: 60000,
        trace: 'on-first-retry',
    },
    // Auth is explicit per test: the `authedPage` fixture creates a fresh,
    // isolated user on demand, while a plain `page` stays logged out. No global
    // storageState or setup project is needed; `globalSetup` only ensures the
    // named seed users (Alice, Bob) exist for the tests that log in as them.
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
            },
        },
        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
            },
        },
        {
            name: 'webkit',
            use: {
                ...devices['Desktop Safari'],
            },
        },
    ],
    webServer: {
        command: `bun run dev --port ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        // The suite mocks /api/chat, so the real Anthropic key is never used —
        // env validation just needs a non-empty value for the server to boot.
        // The two BETTER_AUTH base URLs must match the test port: the server
        // one drives Better Auth's trusted origins, and the VITE_ one is baked
        // into the browser auth client — if it points elsewhere, sign-in POSTs
        // to the wrong origin and silently hangs.
        env: {
            ANTHROPIC_API_KEY:
                process.env.ANTHROPIC_API_KEY || 'sk-ant-e2e-dummy-key',
            BETTER_AUTH_BASE_URL: BASE_URL,
            VITE_BETTER_AUTH_BASE_URL: BASE_URL,
            // The suite creates a fresh user per test; the prod-tuned auth rate
            // limiter would otherwise reject the rapid sign-ups with 429s.
            DISABLE_AUTH_RATE_LIMIT: 'true',
        },
    },
});
