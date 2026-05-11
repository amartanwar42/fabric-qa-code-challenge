import { Page } from '@playwright/test';
import { logger } from '../utility/logger';
import LoginPageObject from '../pageObjects/LoginPageObject';
import DashboardPage from './DashboardPage';
import BasePage from './BasePage';

class LoginPage extends BasePage {
	private loginPageObject: LoginPageObject;
	private dashboardPage: DashboardPage;

	constructor(page: Page) {
		super(page);
		this.loginPageObject = new LoginPageObject(page);
		this.dashboardPage = new DashboardPage(page);
	}
	openLoginPage() {
		logger.info('Navigating to Login Page');
		return this.actions.navigateTo('auth/login');
	}

	async login(username: string, password: string) {
		logger.info(`Attempting to log in with username: ${username}`);
		await this.actions.fill(this.loginPageObject.usernameInput, username);
		await this.actions.fill(this.loginPageObject.passwordInput, password);
		await this.actions.click(this.loginPageObject.loginButton);
		logger.info(`Login submitted for username: ${username}`);
	}

	async verifyLoginSuccessful(): Promise<void> {
		await this.actions.waitForHidden(this.loginPageObject.loginButton);
		await this.dashboardPage.verifyDashboardVisible();
	}
}

export default LoginPage;
