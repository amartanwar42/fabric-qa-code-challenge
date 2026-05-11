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

	test('verify employee creation', async ({ dashboardPage, loginPage }) => {
		//login to the application first
		await loginPage.openLoginPage();
		await loginPage.login(env.ADMIN_USERNAME, env.ADMIN_PASSWORD);

		// Step 4. Navigate to PIM (Personnel Information Management) module.
		await dashboardPage.openTab('PIM', 'PIM');

		// Step 5. Add a new employee with valid details and capture the Employee ID.
		await dashboardPage.pimTab.createEmployee(
			employeeDetails,
			employeeLoginDetails,
		);
		await dashboardPage.pimTab.verifyEmployeeCreatedSuccess();
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

		// Wait for the page to reload and reflect the updated details
		await sharedPage.waitForResponse(
			(response) =>
				response.url().includes('api/v2/pim/employees/') &&
				response.request().method() === 'GET' &&
				response.status() === 200,
		);
		await sharedPage.waitForTimeout(2000);

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

	test('verify the search api response', async ({ apiHelper }) => {
		//check the created employee details in API response
		let employees = await apiHelper.searchEmployees();

		// Validate response structure
		expect(employees).toHaveProperty('data');
		expect(employees).toHaveProperty('meta');
		expect(employees).toHaveProperty('rels');
		expect(employees.meta).toHaveProperty('total');
		expect(employees.meta.total).toBeGreaterThan(0);
		expect(Array.isArray(employees.data)).toBe(true);

		// Find and validate the created employee
		const createdEmployee = employees.data.find(
			(emp) => emp.employeeId === employeeDetails.employeeId,
		);
		expect(createdEmployee).toBeDefined();

		// Validate employee fields
		expect(createdEmployee?.firstName).toBe(employeeDetails.firstName);
		expect(createdEmployee?.lastName).toBe(employeeDetails.lastName);
		expect(createdEmployee?.middleName).toBe(employeeDetails.middleName);
		expect(createdEmployee?.employeeId).toBe(employeeDetails.employeeId);
		expect(createdEmployee?.jobTitle.title).toBe('Account Assistant');
		expect(createdEmployee?.empStatus.name).toBe('Freelance');
	});
});
