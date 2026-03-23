import { defineConfig, devices } from '@playwright/test';
import { STORAGE_STATE } from './tests/fixtures';

export default defineConfig({
    globalSetup: './tests/global-setup.ts',
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:5173',
        navigationTimeout: 60000,
        trace: 'on-first-retry',
    },
    projects: [
        // Auth setup — runs first, saves storageState for other projects
        {
            name: 'setup',
            testMatch: /auth-setup\.ts/,
        },
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                storageState: STORAGE_STATE,
            },
            dependencies: ['setup'],
            testIgnore: /auth-setup\.ts/,
        },
        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
                storageState: STORAGE_STATE,
            },
            dependencies: ['setup'],
            testIgnore: /auth-setup\.ts/,
        },
        {
            name: 'webkit',
            use: {
                ...devices['Desktop Safari'],
                storageState: STORAGE_STATE,
            },
            dependencies: ['setup'],
            testIgnore: /auth-setup\.ts/,
        },
    ],
    webServer: {
        command: 'bun run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
    },
});
