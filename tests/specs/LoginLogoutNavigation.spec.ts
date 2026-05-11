import { test } from '../fixtures/testFixture';
import env from '../../config/env';

test.describe.serial('Login logout and navigation Tests', () => {
	test('verify login with valid credentials', async ({ loginPage }) => {
		// Step 1: Open the OrangeHRM application.
		await loginPage.openLoginPage();

		// Step 2: Log in to the application using valid credentials.
		await loginPage.login(env.ADMIN_USERNAME, env.ADMIN_PASSWORD);

		// Assertion to verify that login was successful by checking the presence of an element that is only visible after login
		await loginPage.verifyLoginSuccessful();
	});

	test('verify left-side navigation menu is displayed and functional', async ({
		dashboardPage,
	}) => {
		await dashboardPage.openDashboard();
		// Step 3: Verify that the left-side navigation menu is displayed and functional.
		await dashboardPage.openTab('Admin', '/ User Management');
		await dashboardPage.openTab('PIM', 'PIM');
		await dashboardPage.openTab('Leave', 'Leave');
		await dashboardPage.openTab('Time', '/ Timesheets');
		await dashboardPage.openTab('Recruitment', 'Recruitment');
		await dashboardPage.openTab('My Info', 'PIM');
		await dashboardPage.openTab('Performance', '/ Manage Reviews');
		await dashboardPage.openTab('Directory', 'Directory');
		await dashboardPage.openTab('Claim', 'Claim');
		await dashboardPage.openTab('Buzz', 'Buzz');
		await dashboardPage.openMaintenanceTab();
	});

	test('verify logout functionality', async ({ dashboardPage, loginPage }) => {
		await dashboardPage.openDashboard();
		await dashboardPage.profile.openProfileMenu();
		await dashboardPage.profile.logout();
		await loginPage.verifyLoginPageVisible();
	});
});
