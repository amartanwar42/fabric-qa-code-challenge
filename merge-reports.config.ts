import { defineConfig } from '@playwright/test';
import env from './config/env';
import { PlaywrightReportEmail } from '@playwright-labs/reporter-email/templates/base';
import React from 'react';

/**
 * This config is used exclusively by `npx playwright merge-reports`
 * in the CI merge-reports job, after all shards have completed.
 * It sends one consolidated email with the full test results.
 */
export default defineConfig({
	reporter: [
		['html', { title: 'OrangeHRM Web App Tests' }],
		[
			'@playwright-labs/reporter-email',
			{
				host: 'smtp.gmail.com',
				port: 465,
				secure: true,
				auth: { user: env.SMTP_USERNAME, pass: env.SMTP_PASSWORD },
				from: env.SMTP_USERNAME,
				to: ['amartanwar93@gmail.com'],
				subject: (result: any) =>
					`[OrangeHRM Web App Test Report] ${result.status.toUpperCase()} — ${new Date().toLocaleDateString()}`,
				html: (result: any, testCases: any) =>
					React.createElement(PlaywrightReportEmail, { result, testCases }),
				send: 'always',
			},
		],
	],
});
