import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    globalSetup: './global.setup.js',
    globalTeardown: './global-teardown.js',
    reporter: [
        ['list'],
        ['html', {
            open: 'never'
        }]
    ],
    use: {
        browserName: 'chromium',
        trace: 'on-first-retry'
    }
});
