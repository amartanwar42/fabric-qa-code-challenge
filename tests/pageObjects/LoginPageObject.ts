import { Page } from '@playwright/test';

class LoginPageObject {
	private page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	get usernameInput() {
		return this.page.locator('input[name="username"]');
	}

	get passwordInput() {
		return this.page.locator('input[name="password"]');
	}

	get loginButton() {
		return this.page.getByRole('button', { name: 'Login' });
	}
}

export default LoginPageObject;
