import { test as base, BrowserContext, Page } from '@playwright/test';
import LoginPage from '../pages/LoginPage.js';
import DashboardPage from '../pages/DashboardPage.js';
import { logger } from '../utility/logger';

interface TestFixtures {
	loginPage: LoginPage;
	dashboardPage: DashboardPage;
	sharedPage: Page;
	sharedContext: BrowserContext;
	saveScreenshot: void;
}

type WorkerFixtures = {
	workerContext: BrowserContext;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
	// Create a shared context at worker level
	workerContext: [
		async ({ browser }, use) => {
			logger.info('Creating worker-scoped browser context');
			const context = await browser.newContext();
			await use(context);
			await context.close();
			logger.info('Closed worker-scoped browser context');
		},
		{ scope: 'worker' },
	],

	// Use the worker context for the test-level shared context
	sharedContext: async ({ workerContext }, use) => {
		logger.info('Using worker context as shared context');
		await use(workerContext);
	},

	// Create a shared page from the shared context
	sharedPage: async ({ sharedContext }, use) => {
		logger.info('Creating shared page');
		const page = await sharedContext.newPage();

		page.on('console', (msg) => {
			// Log console messages from the page
			if (msg.type() === 'error') {
				logger.error(`Console error: ${msg.text()}`);
			} else {
				// logger.info(`Console message: ${msg.text()}`);
			}
		});
		page.on('pageerror', (error) => {
			// Log page errors
			logger.error(`Console error: ${error.message}`);
		});
		try {
			await use(page);
		} finally {
			// Close the page after the test completes
			logger.info('Closing page after test');
			await page.close().catch((err) => {
				logger.error(`Error closing page: ${err}`);
			});
		}
	},

	// Automatically take screenshots on test failure
	saveScreenshot: [
		async ({ sharedPage }, use, testInfo) => {
			await use();
			if (testInfo.status === 'failed') {
				logger.info('Test failed, taking screenshot...');
				let currentUrl = sharedPage.url();
				const screenshot = await sharedPage.screenshot();
				logger.info(
					`Screenshot taken for test ${testInfo.title} at URL: ${currentUrl}`,
				);
				await testInfo.attach('screenshot', {
					body: screenshot,
					contentType: 'image/png',
				});
			}
		},
		{ auto: true },
	],

	loginPage: async ({ sharedPage }, use) => {
		await use(new LoginPage(sharedPage));
	},
	dashboardPage: async ({ sharedPage }, use) => {
		await use(new DashboardPage(sharedPage));
	},
});

export { expect } from '@playwright/test';
