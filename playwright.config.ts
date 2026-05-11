import { defineConfig, devices } from '@playwright/test';
import env from './config/env';
import config from './config/config';
console.log(`Running tests against: ${config.baseUrl} [ENV: ${env.ENV}]`);

export default defineConfig({
	testDir: 'tests/specs',
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 4 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: process.env.CI
		? [['blob'], ['list'], ['html', { title: 'OrangeHRM Web App Tests' }]]
		: [['html', { title: 'OrangeHRM Web App Tests' }], ['list']],
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		baseURL: config.baseUrl,
		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry',
		viewport: { width: 1920, height: 1080 },
	},

	timeout: 4 * 60 * 1000, // 4 minutes
	globalTimeout: 60 * 60 * 1000, // 1 hour
	/* Configure projects for major browsers */
	projects: [
		{
			name: 'chromium',
		},
	],
	expect: {
		timeout: 10000,
	},
});
