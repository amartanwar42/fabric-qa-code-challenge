import { expect, test } from '../fixtures/testFixture';
import env from '../../config/env';
import testData from '../utility/testDataGenerator';
import DashboardPageObject from '../pageObjects/DashboardPageObject';

test.describe.serial('Create Employee Tests', () => {
	const employeeDetails = {
		firstName: testData.employee.firstName(),
		middleName: testData.employee.middleName(),
		lastName: testData.employee.lastName(),
		employeeId: testData.employee.employeeId(),
	};

	const employeeLoginDetails = {
		createLoginDetails: true,
		username: testData.employee.username(),
		password: testData.employee.password(),
	};
	test('Verify login with valid credentials', async ({ loginPage }) => {
		// Step 1: Open the OrangeHRM application.
		await loginPage.openLoginPage();

		// Step 2: Log in to the application using valid credentials.
		await loginPage.login(env.ADMIN_USERNAME, env.ADMIN_PASSWORD);

		// Assertion to verify that login was successful by checking the presence of an element that is only visible after login
		await loginPage.verifyLoginSuccessful();
	});

	// Step 3: Verify that the left-side navigation menu is displayed and functional.
	test.skip('verify left-side navigation menu is displayed and functional', async ({
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

	test('verify employee creation', async ({ dashboardPage }) => {
		// Step 4. Navigate to PIM (Personnel Information Management) module.
		await dashboardPage.openDashboard();
		await dashboardPage.openTab('PIM', 'PIM');

		// Step 5. Add a new employee with valid details and capture the Employee ID.
		await dashboardPage.pimTab.createEmployee(
			employeeDetails,
			employeeLoginDetails,
		);
		await dashboardPage.pimTab.verifyEmployeeCreatedSuccessMessage();
	});

	test('verify employee in search results and edit employee details', async ({
		dashboardPage,
		sharedPage,
	}) => {
		// Step 6. Validate that the employee appears in the employee list with correct details.
		await dashboardPage.openDashboard();
		await dashboardPage.openTab('PIM', 'PIM');
		await dashboardPage.pimTab.searchEmployee({
			employeeId: employeeDetails.employeeId,
		});
		await dashboardPage.pimTab.validateSearchResult(employeeDetails);

		// Step 7. Edit the employee details (e.g., job title, personal info) and validate updates.
		await dashboardPage.pimTab.editPatient({
			jobTitle: 'Account Assistant',
			jobCategory: 'Craft Workers',
			employmentStatus: 'Freelance',
		});

		// Verify updated employee details
		const dashboardPageObject = new DashboardPageObject(sharedPage);
		await sharedPage.reload(); // Reload the page to reflect the updated details
		await sharedPage.waitForTimeout(2000); // Wait for the page to reload and reflect the updated details

		let jobTitle = await dashboardPage.actions.getText(
			dashboardPageObject.PIMTab.editPatient.jobTitleDropdown(),
		);

		let jobCategory = await dashboardPage.actions.getText(
			dashboardPageObject.PIMTab.editPatient.jobCategoryDropdown(),
		);

		let employmentStatus = await dashboardPage.actions.getText(
			dashboardPageObject.PIMTab.editPatient.employmentStatusDropdown(),
		);

		expect(jobTitle).toBe('Account Assistant');
		expect(jobCategory).toBe('Craft Workers');
		expect(employmentStatus).toBe('Freelance');
	});
});
