import { Page } from '@playwright/test';
import { button } from '../types/applicationTypes';

class BasePageObject {
	private page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	getButton(buttonName: button) {
		return this.page.getByRole('button', { name: buttonName }).first();
	}

	getMessage(message: string) {
		return this.page.getByText(message).first();
	}
}

export default BasePageObject;
