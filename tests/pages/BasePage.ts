import { Page } from '@playwright/test';
import BasePageObject from '../pageObjects/BasePageObject';
import { button } from '../types/applicationTypes';
import { logger } from '../utility/logger';
import { Actions } from '../utility/actions';

class BasePage {
	page: Page;
	actions: Actions;
	constructor(page: Page) {
		this.page = page;
		this.actions = new Actions(page);
	}

	getBasePageObject(): BasePageObject {
		return new BasePageObject(this.page);
	}

	async clickButton(buttonName: button): Promise<void> {
		const basePageObject = this.getBasePageObject();
		await this.actions.click(basePageObject.getButton(buttonName));
		logger.info(`Clicked on button: ${buttonName}`);
	}

	async verifyMessageVisible(message: string): Promise<void> {
		const basePageObject = this.getBasePageObject();
		await this.actions.waitForVisible(basePageObject.getMessage(message));
		logger.info(`Verified that message: "${message}" is visible`);
	}

	async selectDropdownOption(
		dropdown: import('@playwright/test').Locator,
		option: import('@playwright/test').Locator,
	): Promise<void> {
		await this.actions.click(dropdown);
		await this.actions.click(option);
	}
}

export default BasePage;
