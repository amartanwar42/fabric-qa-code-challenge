import { Page } from '@playwright/test';
import { TabHeading, Tab } from '../types/applicationTypes';

class DashboardPageObject {
	private page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	tabHeading(tabHeading: TabHeading) {
		return this.page
			.getByRole('heading', { name: tabHeading, exact: true })
			.first();
	}

	navigationTab(tabName: Tab) {
		return this.page.getByRole('link', { name: tabName });
	}

	PIMTab = {
		firstName: () => this.page.getByPlaceholder('First Name'),
		middleName: () => this.page.getByPlaceholder('Middle Name'),
		lastName: () => this.page.getByPlaceholder('Last Name'),
		employeeId: () =>
			this.page.locator("//label[text()='Employee Id']/../..//input"),
		createLoginDetailsToggle: () =>
			this.page.locator("span[class*='switch-input']"),
		usernameInput: () =>
			this.page.locator("//label[text()='Username']/../..//input"),
		passwordInput: () =>
			this.page.locator("//label[text()='Password']/../..//input"),
		confirmPasswordInput: () =>
			this.page.locator("//label[text()='Confirm Password']/../..//input"),

		search: {
			employeeList: () =>
				this.page.getByRole('link', { name: 'Employee List' }),
			employeeId: () =>
				this.page.locator("//label[text()='Employee Id']/../..//input"),
			employeeName: () =>
				this.page.locator("//label[text()='Employee Name']/../..//input"),
			searchList: {
				employeeId: () =>
					this.page.locator(
						"(//div[contains(@class,'table-row--clickable')])[1]/div[@role='cell'][2]",
					),
				firstName: () =>
					this.page.locator(
						"(//div[contains(@class,'table-row--clickable')])[1]/div[@role='cell'][3]",
					),
				lastName: () =>
					this.page.locator(
						"(//div[contains(@class,'table-row--clickable')])[1]/div[@role='cell'][4]",
					),
				editButton: () =>
					this.page.locator(
						"(//div[contains(@class,'table-row--clickable')])[1]/div[@role='cell'][9]//button[1]",
					),
				deleteButton: () =>
					this.page.locator(
						"(//div[contains(@class,'table-row--clickable')])[1]/div[@role='cell'][9]//button[2]",
					),
			},
		},
		editPatient: {
			jobTab: () => this.page.getByRole('link', { name: 'Job' }),
			joiningDateInput: () =>
				this.page.getByRole('textbox', { name: 'yyyy-dd-mm' }),
			jobTitleDropdown: () =>
				this.page.locator(
					"//label[text()='Job Title']/../..//div[@class='oxd-select-text-input']",
				),
			jobTitleOptions: (option: string) => this.page.getByText(option),
			jobCategoryDropdown: () =>
				this.page.locator(
					"//label[text()='Job Category']/../..//div[@class='oxd-select-text-input']",
				),
			jobCategoryOptions: (option: string) => this.page.getByText(option),
			employmentStatusDropdown: () =>
				this.page.locator(
					"//label[text()='Employment Status']/../..//div[@class='oxd-select-text-input']",
				),
			employmentStatusOptions: (option: string) => this.page.getByText(option),
		},
	};
}

export default DashboardPageObject;
