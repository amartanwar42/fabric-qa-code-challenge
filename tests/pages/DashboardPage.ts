import DashboardPageObject from '../pageObjects/DashboardPageObject';
import LoginPageObject from '../pageObjects/LoginPageObject';
import { expect, Page, test } from '@playwright/test';
import { logger } from '../utility/logger';
import { Tab, TabHeading } from '../types/applicationTypes';
import BasePage from './BasePage';

class DashboardPage extends BasePage {
	private dashboardPageObject: DashboardPageObject;
	private loginPageObect: LoginPageObject;

	constructor(page: Page) {
		super(page);
		this.dashboardPageObject = new DashboardPageObject(page);
		this.loginPageObect = new LoginPageObject(page);
	}

	async openDashboard(): Promise<void> {
		logger.info('Opening the dashboard page');
		await this.page.goto('dashboard/index');
		await this.verifyDashboardVisible();
	}

	async verifyDashboardVisible(): Promise<void> {
		logger.info('Checking if dashboard is visible');
		await this.actions.waitForVisible(
			this.dashboardPageObject.tabHeading('Dashboard'),
		);
		logger.info('Dashboard is visible');
	}

	async openTab(tabName: Tab, tabHeading: TabHeading): Promise<void> {
		logger.info(`Navigating to ${tabName} tab`);
		await this.actions.click(this.dashboardPageObject.navigationTab(tabName));

		// Assertion to verify that the correct tab is opened by checking the heading of the page
		logger.info(`Verifying that ${tabHeading} tab is opened`);
		await this.actions.waitForVisible(
			this.dashboardPageObject.tabHeading(tabHeading),
		);

		logger.info(`Verified that ${tabHeading} tab is opened`);
	}

	async openMaintenanceTab(): Promise<void> {
		logger.info('Navigating to Maintenance tab');
		await this.actions.click(
			this.dashboardPageObject.navigationTab('Maintenance'),
		);

		logger.info('Filling in username and password to access Maintenance tab');
		await this.actions.fill(this.loginPageObect.passwordInput, 'admin123');
		await this.clickButton('Confirm');

		// Assertion to verify that the correct tab is opened by checking the heading of the page
		logger.info('Verifying that Maintenance tab is opened');
		await this.actions.waitForVisible(
			this.dashboardPageObject.tabHeading('/ Purge Records'),
		);

		logger.info('Verified that Maintenance tab is opened');
	}

	pimTab = {
		createEmployee: async (
			employeeDetails: {
				firstName: string;
				middleName: string;
				lastName: string;
				employeeId: string;
			},
			options?: {
				createLoginDetails: boolean;
				username: string;
				password: string;
			},
		) => {
			logger.info(
				`Creating employee using: ${JSON.stringify(employeeDetails)}`,
			);
			await this.clickButton('Add');
			await this.actions.fill(
				this.dashboardPageObject.PIMTab.firstName(),
				employeeDetails.firstName,
			);
			await this.actions.fill(
				this.dashboardPageObject.PIMTab.middleName(),
				employeeDetails.middleName,
			);
			await this.actions.fill(
				this.dashboardPageObject.PIMTab.lastName(),
				employeeDetails.lastName,
			);
			await this.actions.fill(
				this.dashboardPageObject.PIMTab.employeeId(),
				employeeDetails.employeeId,
			);

			if (options?.createLoginDetails) {
				await this.pimTab.createLoginDetails(
					options.username,
					options.password,
				);
			} else {
				await this.clickButton('Save');
				logger.info(
					`Saved the employee details with employeeId: ${employeeDetails.employeeId}`,
				);
			}
		},

		createLoginDetails: async (username: string, password: string) => {
			logger.info(
				`Creating login details for the employee with username: ${username} and password: ${password}`,
			);
			await this.actions.click(
				this.dashboardPageObject.PIMTab.createLoginDetailsToggle(),
			);
			await this.actions.fill(
				this.dashboardPageObject.PIMTab.usernameInput(),
				username,
			);
			await this.actions.fill(
				this.dashboardPageObject.PIMTab.passwordInput(),
				password,
			);
			await this.actions.fill(
				this.dashboardPageObject.PIMTab.confirmPasswordInput(),
				password,
			);
			await this.clickButton('Save');
			logger.info(
				`Created login details for the employee with username: ${username}`,
			);
		},

		verifyEmployeeCreatedSuccess: async () => {
			logger.info(`Verifying success of creating employee`);
			const responsePromise = this.page.waitForResponse(
				(response) =>
					response.url().includes('/api/v2/pim/employees') &&
					response.request().method() === 'POST' &&
					response.status() === 200,
			);
			await this.verifyMessageVisible('Successfully Saved');
			await responsePromise;
			logger.info(`Verified success of creating employee`);
		},

		searchEmployee: async (searchCriteria: {
			employeeId?: string;
			employeeName?: string;
		}) => {
			logger.info(
				`Searching employee using criteria: ${JSON.stringify(searchCriteria)}`,
			);
			await this.actions.click(
				this.dashboardPageObject.PIMTab.search.employeeList(),
			);

			await this.page.waitForResponse(
				(response) =>
					response.url().includes('api/v2/pim/employees?limit=50') &&
					response.request().method() === 'GET' &&
					response.status() === 200,
			);

			if (searchCriteria.employeeId) {
				await this.actions.fill(
					this.dashboardPageObject.PIMTab.search.employeeId(),
					searchCriteria.employeeId,
				);
			}
			if (searchCriteria.employeeName) {
				await this.actions.fill(
					this.dashboardPageObject.PIMTab.search.employeeName(),
					searchCriteria.employeeName,
				);
			}
			await this.actions.waitForTimeout(2000); // Wait for search results to load
			await this.clickButton('Search');
		},

		validateSearchResult: async (expectedDetails: {
			employeeId: string;
			firstName: string;
			middleName: string;
			lastName: string;
		}) => {
			logger.info(
				`Validating search result with expected details: ${JSON.stringify(expectedDetails)}`,
			);
			await this.actions.waitForVisible(
				this.dashboardPageObject.PIMTab.search.searchList.employeeId(),
			);

			const [actualEmployeeId, actualFirstName, actualLastName] =
				await Promise.all([
					this.actions.getText(
						this.dashboardPageObject.PIMTab.search.searchList.employeeId(),
					),
					this.actions.getText(
						this.dashboardPageObject.PIMTab.search.searchList.firstName(),
					),
					this.actions.getText(
						this.dashboardPageObject.PIMTab.search.searchList.lastName(),
					),
				]);

			expect.soft(actualEmployeeId).toBe(expectedDetails.employeeId);
			expect
				.soft(actualFirstName)
				.toBe(`${expectedDetails.firstName} ${expectedDetails.middleName}`);
			expect.soft(actualLastName).toBe(expectedDetails.lastName);

			expect(
				test.info().errors,
				'Search result validation failed',
			).toHaveLength(0);

			logger.info(
				`Validated search result with expected details: ${JSON.stringify(expectedDetails)}`,
			);
		},

		editPatient: async (employeeDetails: {
			joiningDate?: string;
			jobTitle?:
				| 'Automation Tester'
				| 'Account Assistant'
				| 'Content Specialist';
			jobCategory?:
				| 'Craft Workers'
				| 'Operatives'
				| 'Officials Managers'
				| 'Test Engineer';
			employmentStatus?:
				| 'Freelance'
				| 'Part-Time Permanent'
				| 'Full-Time Contract';
		}) => {
			logger.info(`Editing the employee details`);
			await this.actions.click(
				this.dashboardPageObject.PIMTab.search.searchList.editButton(),
			);
			await this.actions.click(
				this.dashboardPageObject.PIMTab.editPatient.jobTab(),
			);
			if (employeeDetails.joiningDate) {
				await this.actions.fill(
					this.dashboardPageObject.PIMTab.editPatient.joiningDateInput(),
					employeeDetails.joiningDate,
				);
			}
			if (employeeDetails.jobTitle) {
				await this.selectDropdownOption(
					this.dashboardPageObject.PIMTab.editPatient.jobTitleDropdown(),
					this.dashboardPageObject.PIMTab.editPatient.jobTitleOptions(
						employeeDetails.jobTitle,
					),
				);
			}
			if (employeeDetails.jobCategory) {
				await this.selectDropdownOption(
					this.dashboardPageObject.PIMTab.editPatient.jobCategoryDropdown(),
					this.dashboardPageObject.PIMTab.editPatient.jobCategoryOptions(
						employeeDetails.jobCategory,
					),
				);
			}
			if (employeeDetails.employmentStatus) {
				await this.selectDropdownOption(
					this.dashboardPageObject.PIMTab.editPatient.employmentStatusDropdown(),
					this.dashboardPageObject.PIMTab.editPatient.employmentStatusOptions(
						employeeDetails.employmentStatus,
					),
				);
			}
			await this.clickButton('Save');
			await this.verifyMessageVisible('Successfully Updated');
			logger.info(`Edited the employee details`);
		},
	};

	profile = {
		openProfileMenu: async () => {
			logger.info('Opening profile menu');
			await this.actions.click(this.dashboardPageObject.profile.profileIcon());
		},

		logout: async () => {
			logger.info('Logging out from the application');
			await this.profile.openProfileMenu();
			await this.actions.click(this.dashboardPageObject.profile.logoutButton());
			logger.info('Clicked on logout button');
		},
	};
}

export default DashboardPage;
