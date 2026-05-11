import { Page, Locator, expect, FrameLocator } from '@playwright/test';
import { logger } from './logger';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type KeyboardModifier = 'Alt' | 'Control' | 'Meta' | 'Shift';
type MouseButton = 'left' | 'right' | 'middle';
type WaitUntilState = 'load' | 'domcontentloaded' | 'networkidle' | 'commit';

// ──────────────────────────────────────────────
// Option Interfaces
// ──────────────────────────────────────────────

interface RetryOptions {
	retries?: number;
	retryInterval?: number;
}

interface NavigationOptions extends RetryOptions {
	timeout?: number;
	waitUntil?: WaitUntilState;
	referer?: string;
}

interface ClickOptions extends RetryOptions {
	timeout?: number;
	force?: boolean;
	button?: MouseButton;
	modifiers?: KeyboardModifier[];
}

interface DblClickOptions extends RetryOptions {
	timeout?: number;
	force?: boolean;
	modifiers?: KeyboardModifier[];
}

interface FillOptions extends RetryOptions {
	timeout?: number;
	force?: boolean;
	clearFirst?: boolean;
}

interface TypeOptions extends RetryOptions {
	timeout?: number;
	delay?: number;
}

interface PressOptions extends RetryOptions {
	timeout?: number;
	delay?: number;
}

interface SelectOptions extends RetryOptions {
	timeout?: number;
	force?: boolean;
}

interface CheckOptions extends RetryOptions {
	timeout?: number;
	force?: boolean;
}

interface HoverOptions extends RetryOptions {
	timeout?: number;
	force?: boolean;
	modifiers?: KeyboardModifier[];
	position?: { x: number; y: number };
}

interface DragOptions extends RetryOptions {
	timeout?: number;
	force?: boolean;
	sourcePosition?: { x: number; y: number };
	targetPosition?: { x: number; y: number };
}

interface UploadOptions extends RetryOptions {
	timeout?: number;
}

interface ScreenshotOptions extends RetryOptions {
	path?: string;
	fullPage?: boolean;
	type?: 'png' | 'jpeg';
	quality?: number;
	timeout?: number;
}

interface ElementScreenshotOptions extends RetryOptions {
	path?: string;
	type?: 'png' | 'jpeg';
	quality?: number;
	timeout?: number;
}

interface ScrollOptions extends RetryOptions {
	timeout?: number;
}

// ──────────────────────────────────────────────
// Actions Class
// ──────────────────────────────────────────────

export class Actions {
	private defaultTimeout: number;
	private defaultRetries: number;
	private defaultRetryInterval: number;

	constructor(
		private page: Page,
		options?: {
			timeout?: number;
			retries?: number;
			retryInterval?: number;
		},
	) {
		this.defaultTimeout = options?.timeout ?? 30000;
		this.defaultRetries = options?.retries ?? 0;
		this.defaultRetryInterval = options?.retryInterval ?? 1000;
	}

	/**
	 * Retries a failed action up to the specified number of attempts
	 * @param action The action to execute
	 * @param retries Number of retry attempts
	 * @param retryInterval Delay between retries in ms
	 */
	private async retry<T>(
		action: () => Promise<T>,
		retries?: number,
		retryInterval?: number,
		actionName?: string,
	): Promise<T> {
		const maxRetries = retries ?? this.defaultRetries;
		const interval = retryInterval ?? this.defaultRetryInterval;
		let lastError: Error | undefined;

		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			try {
				if (attempt > 0) {
					logger.warn(
						`Retry attempt ${attempt}/${maxRetries} for: ${actionName ?? 'action'}`,
					);
				}
				return await action();
			} catch (error) {
				lastError = error as Error;
				logger.error(
					`${actionName ?? 'Action'} failed (attempt ${attempt + 1}/${maxRetries + 1}): ${lastError.message}`,
				);
				if (attempt < maxRetries) {
					await this.page.waitForTimeout(interval);
				}
			}
		}
		throw lastError;
	}

	// ──────────────────────────────────────────────
	// Navigation
	// ──────────────────────────────────────────────

	/**
	 * Navigates to a URL with retry logic
	 * @param url The URL to navigate to
	 * @param options Navigation options
	 */
	async navigateTo(url: string, options?: NavigationOptions): Promise<void> {
		logger.debug(`Navigating to: ${url}`);
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				await this.page.goto(url, {
					timeout,
					waitUntil: options?.waitUntil ?? 'domcontentloaded',
					referer: options?.referer,
				});
			},
			options?.retries,
			options?.retryInterval,
			`navigateTo(${url})`,
		);
		logger.debug(`Navigated to: ${url}`);
	}

	/**
	 * Reloads the current page with retry logic
	 * @param options Reload options
	 */
	async reload(options?: Omit<NavigationOptions, 'referer'>): Promise<void> {
		logger.debug('Reloading page');
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				await this.page.reload({
					timeout,
					waitUntil: options?.waitUntil ?? 'domcontentloaded',
				});
			},
			options?.retries,
			options?.retryInterval,
			'reload',
		);
		logger.debug('Page reloaded');
	}

	/**
	 * Navigates back in browser history with retry logic
	 * @param options Navigation options
	 */
	async goBack(options?: Omit<NavigationOptions, 'referer'>): Promise<void> {
		logger.debug('Navigating back');
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				await this.page.goBack({
					timeout,
					waitUntil: options?.waitUntil ?? 'domcontentloaded',
				});
			},
			options?.retries,
			options?.retryInterval,
			'goBack',
		);
		logger.debug('Navigated back');
	}

	/**
	 * Navigates forward in browser history with retry logic
	 * @param options Navigation options
	 */
	async goForward(options?: Omit<NavigationOptions, 'referer'>): Promise<void> {
		logger.debug('Navigating forward');
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				await this.page.goForward({
					timeout,
					waitUntil: options?.waitUntil ?? 'domcontentloaded',
				});
			},
			options?.retries,
			options?.retryInterval,
			'goForward',
		);
		logger.debug('Navigated forward');
	}

	// ──────────────────────────────────────────────
	// Click Actions
	// ──────────────────────────────────────────────

	/**
	 * Clicks on an element with retry logic
	 * @param locator The element to click
	 * @param options Click options
	 */
	async click(locator: Locator, options?: ClickOptions): Promise<void> {
		logger.debug(`Clicking element`);
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				if (!options?.force) {
					await locator.waitFor({ state: 'visible', timeout });
				}
				await locator.click({
					timeout,
					force: options?.force,
					button: options?.button,
					modifiers: options?.modifiers,
				});
			},
			options?.retries,
			options?.retryInterval,
			'click',
		);
		logger.debug('Clicked element');
	}

	/**
	 * Double-clicks on an element with retry logic
	 * @param locator The element to double-click
	 * @param options Double-click options
	 */
	async doubleClick(
		locator: Locator,
		options?: DblClickOptions,
	): Promise<void> {
		logger.debug('Double-clicking element');
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				if (!options?.force) {
					await locator.waitFor({ state: 'visible', timeout });
				}
				await locator.dblclick({
					timeout,
					force: options?.force,
					modifiers: options?.modifiers,
				});
			},
			options?.retries,
			options?.retryInterval,
			'doubleClick',
		);
		logger.debug('Double-clicked element');
	}

	/**
	 * Right-clicks on an element with retry logic
	 * @param locator The element to right-click
	 * @param options Click options (button is forced to 'right')
	 */
	async rightClick(
		locator: Locator,
		options?: Omit<ClickOptions, 'button'>,
	): Promise<void> {
		logger.debug('Right-clicking element');
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				if (!options?.force) {
					await locator.waitFor({ state: 'visible', timeout });
				}
				await locator.click({
					timeout,
					button: 'right',
					force: options?.force,
					modifiers: options?.modifiers,
				});
			},
			options?.retries,
			options?.retryInterval,
			'rightClick',
		);
		logger.debug('Right-clicked element');
	}

	/**
	 * Force-clicks on an element bypassing actionability checks, with retry logic
	 * @param locator The element to force-click
	 * @param options Click options (force is always true)
	 */
	async forceClick(
		locator: Locator,
		options?: Omit<ClickOptions, 'force'>,
	): Promise<void> {
		logger.debug('Force-clicking element');
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				await locator.click({
					timeout,
					force: true,
					button: options?.button,
					modifiers: options?.modifiers,
				});
			},
			options?.retries,
			options?.retryInterval,
			'forceClick',
		);
		logger.debug('Force-clicked element');
	}

	// ──────────────────────────────────────────────
	// Input Actions
	// ──────────────────────────────────────────────

	/**
	 * Fills an input element with a value, with retry logic
	 * @param locator The input element to fill
	 * @param value The value to fill
	 * @param options Fill options (use clearFirst to clear before filling)
	 */
	async fill(
		locator: Locator,
		value: string,
		options?: FillOptions,
	): Promise<void> {
		logger.debug(`Filling element with value: ${value}`);
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				if (!options?.force) {
					await locator.waitFor({ state: 'visible', timeout });
				}
				if (options?.clearFirst) {
					await locator.clear({ timeout, force: options?.force });
				}
				await locator.fill(value, { timeout, force: options?.force });
			},
			options?.retries,
			options?.retryInterval,
			'fill',
		);
		logger.debug(`Filled element with value: ${value}`);
	}

	/**
	 * Types text into an element character by character with retry logic
	 * @param locator The element to type into
	 * @param value The text to type
	 * @param options Type options
	 */
	async type(
		locator: Locator,
		value: string,
		options?: TypeOptions,
	): Promise<void> {
		logger.debug(`Typing value: ${value}`);
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				await locator.waitFor({ state: 'visible', timeout });
				await locator.pressSequentially(value, {
					delay: options?.delay ?? 50,
					timeout,
				});
			},
			options?.retries,
			options?.retryInterval,
			'type',
		);
		logger.debug(`Typed value: ${value}`);
	}

	/**
	 * Clears an input element with retry logic
	 * @param locator The input element to clear
	 * @param options Clear options
	 */
	async clear(
		locator: Locator,
		options?: RetryOptions & { timeout?: number; force?: boolean },
	): Promise<void> {
		logger.debug('Clearing element');
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				if (!options?.force) {
					await locator.waitFor({ state: 'visible', timeout });
				}
				await locator.clear({ timeout, force: options?.force });
			},
			options?.retries,
			options?.retryInterval,
			'clear',
		);
		logger.debug('Cleared element');
	}

	// ──────────────────────────────────────────────
	// Keyboard Actions
	// ──────────────────────────────────────────────

	/**
	 * Presses a keyboard key with retry logic
	 * @param key The key to press (e.g. 'Enter', 'Tab', 'ArrowDown')
	 * @param options Retry options
	 */
	async pressKey(key: string, options?: RetryOptions): Promise<void> {
		logger.debug(`Pressing key: ${key}`);
		await this.retry(
			async () => {
				await this.page.keyboard.press(key);
			},
			options?.retries,
			options?.retryInterval,
			`pressKey(${key})`,
		);
		logger.debug(`Pressed key: ${key}`);
	}

	/**
	 * Presses a key on a specific element with retry logic
	 * @param locator The element to press the key on
	 * @param key The key to press
	 * @param options Press options
	 */
	async pressKeyOnLocator(
		locator: Locator,
		key: string,
		options?: PressOptions,
	): Promise<void> {
		logger.debug(`Pressing key on element: ${key}`);
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				await locator.press(key, { timeout, delay: options?.delay });
			},
			options?.retries,
			options?.retryInterval,
			`pressKeyOnLocator(${key})`,
		);
		logger.debug(`Pressed key on element: ${key}`);
	}

	// ──────────────────────────────────────────────
	// Dropdown / Select
	// ──────────────────────────────────────────────

	/**
	 * Selects a dropdown option by value with retry logic
	 * @param locator The select element
	 * @param value The option value to select
	 * @param options Select options
	 */
	async selectByValue(
		locator: Locator,
		value: string,
		options?: SelectOptions,
	): Promise<void> {
		logger.debug(`Selecting by value: ${value}`);
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				await locator.selectOption(
					{ value },
					{ timeout, force: options?.force },
				);
			},
			options?.retries,
			options?.retryInterval,
			`selectByValue(${value})`,
		);
		logger.debug(`Selected by value: ${value}`);
	}

	/**
	 * Selects a dropdown option by visible label with retry logic
	 * @param locator The select element
	 * @param label The option label to select
	 * @param options Select options
	 */
	async selectByLabel(
		locator: Locator,
		label: string,
		options?: SelectOptions,
	): Promise<void> {
		logger.debug(`Selecting by label: ${label}`);
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				await locator.selectOption(
					{ label },
					{ timeout, force: options?.force },
				);
			},
			options?.retries,
			options?.retryInterval,
			`selectByLabel(${label})`,
		);
		logger.debug(`Selected by label: ${label}`);
	}

	/**
	 * Selects a dropdown option by index with retry logic
	 * @param locator The select element
	 * @param index The option index to select
	 * @param options Select options
	 */
	async selectByIndex(
		locator: Locator,
		index: number,
		options?: SelectOptions,
	): Promise<void> {
		logger.debug(`Selecting by index: ${index}`);
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				await locator.selectOption(
					{ index },
					{ timeout, force: options?.force },
				);
			},
			options?.retries,
			options?.retryInterval,
			`selectByIndex(${index})`,
		);
		logger.debug(`Selected by index: ${index}`);
	}

	// ──────────────────────────────────────────────
	// Checkbox / Radio
	// ──────────────────────────────────────────────

	/**
	 * Checks a checkbox or radio button with retry logic
	 * @param locator The element to check
	 * @param options Check options
	 */
	async check(locator: Locator, options?: CheckOptions): Promise<void> {
		logger.debug('Checking element');
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				await locator.check({ timeout, force: options?.force });
			},
			options?.retries,
			options?.retryInterval,
			'check',
		);
		logger.debug('Checked element');
	}

	/**
	 * Unchecks a checkbox with retry logic
	 * @param locator The element to uncheck
	 * @param options Uncheck options
	 */
	async uncheck(locator: Locator, options?: CheckOptions): Promise<void> {
		logger.debug('Unchecking element');
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				await locator.uncheck({ timeout, force: options?.force });
			},
			options?.retries,
			options?.retryInterval,
			'uncheck',
		);
		logger.debug('Unchecked element');
	}

	/**
	 * Sets the checked state of a checkbox with retry logic
	 * @param locator The element to set checked state
	 * @param checked The desired checked state
	 * @param options Check options
	 */
	async setChecked(
		locator: Locator,
		checked: boolean,
		options?: CheckOptions,
	): Promise<void> {
		logger.debug(`Setting checked state to: ${checked}`);
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				await locator.setChecked(checked, { timeout, force: options?.force });
			},
			options?.retries,
			options?.retryInterval,
			`setChecked(${checked})`,
		);
		logger.debug(`Set checked state to: ${checked}`);
	}

	// ──────────────────────────────────────────────
	// Hover / Focus
	// ──────────────────────────────────────────────

	/**
	 * Hovers over an element with retry logic
	 * @param locator The element to hover over
	 * @param options Hover options
	 */
	async hover(locator: Locator, options?: HoverOptions): Promise<void> {
		logger.debug('Hovering over element');
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				if (!options?.force) {
					await locator.waitFor({ state: 'visible', timeout });
				}
				await locator.hover({
					timeout,
					force: options?.force,
					modifiers: options?.modifiers,
					position: options?.position,
				});
			},
			options?.retries,
			options?.retryInterval,
			'hover',
		);
		logger.debug('Hovered over element');
	}

	/**
	 * Focuses an element with retry logic
	 * @param locator The element to focus
	 * @param options Focus options
	 */
	async focus(
		locator: Locator,
		options?: RetryOptions & { timeout?: number },
	): Promise<void> {
		logger.debug('Focusing element');
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				await locator.focus({ timeout });
			},
			options?.retries,
			options?.retryInterval,
			'focus',
		);
		logger.debug('Focused element');
	}

	// ──────────────────────────────────────────────
	// Drag and Drop
	// ──────────────────────────────────────────────

	/**
	 * Drags an element and drops it on a target element with retry logic
	 * @param source The element to drag
	 * @param target The element to drop onto
	 * @param options Drag options
	 */
	async dragAndDrop(
		source: Locator,
		target: Locator,
		options?: DragOptions,
	): Promise<void> {
		logger.debug('Dragging and dropping element');
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				await source.dragTo(target, {
					timeout,
					force: options?.force,
					sourcePosition: options?.sourcePosition,
					targetPosition: options?.targetPosition,
				});
			},
			options?.retries,
			options?.retryInterval,
			'dragAndDrop',
		);
		logger.debug('Dragged and dropped element');
	}

	// ──────────────────────────────────────────────
	// File Upload
	// ──────────────────────────────────────────────

	/**
	 * Uploads a file by setting input files with retry logic
	 * @param locator The file input element
	 * @param filePath The file path(s) to upload
	 * @param options Upload options
	 */
	async uploadFile(
		locator: Locator,
		filePath: string | string[],
		options?: UploadOptions,
	): Promise<void> {
		logger.debug(`Uploading file: ${filePath}`);
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				await locator.setInputFiles(filePath, { timeout });
			},
			options?.retries,
			options?.retryInterval,
			'uploadFile',
		);
		logger.debug(`Uploaded file: ${filePath}`);
	}

	// ──────────────────────────────────────────────
	// Wait Actions
	// ──────────────────────────────────────────────

	/**
	 * Waits for an element to become visible
	 * @param locator The element to wait for
	 * @param timeout Timeout in ms
	 */
	async waitForVisible(locator: Locator, timeout?: number): Promise<void> {
		logger.debug('Waiting for element to be visible');
		await locator.waitFor({
			state: 'visible',
			timeout: timeout ?? this.defaultTimeout,
		});
		logger.debug('Element is visible');
	}

	/**
	 * Waits for an element to become hidden
	 * @param locator The element to wait for
	 * @param timeout Timeout in ms
	 */
	async waitForHidden(locator: Locator, timeout?: number): Promise<void> {
		logger.debug('Waiting for element to be hidden');
		await locator.waitFor({
			state: 'hidden',
			timeout: timeout ?? this.defaultTimeout,
		});
		logger.debug('Element is hidden');
	}

	/**
	 * Waits for an element to become attached to the DOM
	 * @param locator The element to wait for
	 * @param timeout Timeout in ms
	 */
	async waitForAttached(locator: Locator, timeout?: number): Promise<void> {
		logger.debug('Waiting for element to be attached');
		await locator.waitFor({
			state: 'attached',
			timeout: timeout ?? this.defaultTimeout,
		});
		logger.debug('Element is attached');
	}

	/**
	 * Waits for an element to become detached from the DOM
	 * @param locator The element to wait for
	 * @param timeout Timeout in ms
	 */
	async waitForDetached(locator: Locator, timeout?: number): Promise<void> {
		logger.debug('Waiting for element to be detached');
		await locator.waitFor({
			state: 'detached',
			timeout: timeout ?? this.defaultTimeout,
		});
		logger.debug('Element is detached');
	}

	/**
	 * Waits for the page to reach the 'load' state
	 */
	async waitForPageLoad(): Promise<void> {
		logger.debug('Waiting for page load');
		await this.page.waitForLoadState('load');
		logger.debug('Page loaded');
	}

	/**
	 * Waits for the page to reach the 'networkidle' state
	 */
	async waitForNetworkIdle(): Promise<void> {
		logger.debug('Waiting for network idle');
		await this.page.waitForLoadState('networkidle');
		logger.debug('Network is idle');
	}

	/**
	 * Waits for a specified amount of time
	 * @param ms The number of milliseconds to wait
	 */
	async waitForTimeout(ms: number): Promise<void> {
		await this.page.waitForTimeout(ms);
	}

	/**
	 * Waits for the page URL to match the given pattern
	 * @param url The URL string or RegExp to match
	 * @param timeout Timeout in ms
	 */
	async waitForURL(url: string | RegExp, timeout?: number): Promise<void> {
		logger.debug(`Waiting for URL: ${url}`);
		await this.page.waitForURL(url, {
			timeout: timeout ?? this.defaultTimeout,
		});
		logger.debug(`URL matched: ${url}`);
	}

	// ──────────────────────────────────────────────
	// Getters
	// ──────────────────────────────────────────────

	/**
	 * Gets the text content of an element with retry logic
	 * @param locator The element to get text from
	 * @param options Options with timeout and retry
	 */
	async getText(
		locator: Locator,
		options?: RetryOptions & { timeout?: number },
	): Promise<string> {
		logger.debug('Getting text content');
		const timeout = options?.timeout ?? this.defaultTimeout;
		const text = await this.retry(
			async () => {
				await locator.waitFor({ state: 'visible', timeout });
				return (await locator.textContent()) ?? '';
			},
			options?.retries,
			options?.retryInterval,
			'getText',
		);
		logger.debug(`Got text: ${text}`);
		return text;
	}

	/**
	 * Gets the inner text of an element with retry logic
	 * @param locator The element to get inner text from
	 * @param options Options with timeout and retry
	 */
	async getInnerText(
		locator: Locator,
		options?: RetryOptions & { timeout?: number },
	): Promise<string> {
		logger.debug('Getting inner text');
		const timeout = options?.timeout ?? this.defaultTimeout;
		const text = await this.retry(
			async () => {
				await locator.waitFor({ state: 'visible', timeout });
				return locator.innerText();
			},
			options?.retries,
			options?.retryInterval,
			'getInnerText',
		);
		logger.debug(`Got inner text: ${text}`);
		return text;
	}

	/**
	 * Gets the input value of an element with retry logic
	 * @param locator The input element
	 * @param options Options with timeout and retry
	 */
	async getInputValue(
		locator: Locator,
		options?: RetryOptions & { timeout?: number },
	): Promise<string> {
		logger.debug('Getting input value');
		const timeout = options?.timeout ?? this.defaultTimeout;
		const value = await this.retry(
			async () => {
				return locator.inputValue({ timeout });
			},
			options?.retries,
			options?.retryInterval,
			'getInputValue',
		);
		logger.debug(`Got input value: ${value}`);
		return value;
	}

	/**
	 * Gets an attribute value from an element with retry logic
	 * @param locator The element to get the attribute from
	 * @param attribute The attribute name
	 * @param options Options with timeout and retry
	 */
	async getAttribute(
		locator: Locator,
		attribute: string,
		options?: RetryOptions & { timeout?: number },
	): Promise<string | null> {
		logger.debug(`Getting attribute: ${attribute}`);
		const timeout = options?.timeout ?? this.defaultTimeout;
		const value = await this.retry(
			async () => {
				return locator.getAttribute(attribute, { timeout });
			},
			options?.retries,
			options?.retryInterval,
			`getAttribute(${attribute})`,
		);
		logger.debug(`Got attribute ${attribute}: ${value}`);
		return value;
	}

	/**
	 * Gets the count of elements matching the locator
	 * @param locator The locator to count
	 */
	async getCount(locator: Locator): Promise<number> {
		return locator.count();
	}

	/**
	 * Gets all text contents from elements matching the locator
	 * @param locator The locator to get texts from
	 */
	async getAllTexts(locator: Locator): Promise<string[]> {
		return locator.allTextContents();
	}

	/**
	 * Gets the page title
	 */
	async getTitle(): Promise<string> {
		return this.page.title();
	}

	/**
	 * Gets the current page URL
	 */
	async getURL(): Promise<string> {
		return this.page.url();
	}

	// ──────────────────────────────────────────────
	// State Checks
	// ──────────────────────────────────────────────

	/**
	 * Checks if an element is visible
	 * @param locator The element to check
	 */
	async isVisible(locator: Locator): Promise<boolean> {
		return locator.isVisible();
	}

	/**
	 * Checks if an element is enabled
	 * @param locator The element to check
	 */
	async isEnabled(locator: Locator): Promise<boolean> {
		return locator.isEnabled();
	}

	/**
	 * Checks if an element is checked
	 * @param locator The element to check
	 */
	async isChecked(locator: Locator): Promise<boolean> {
		return locator.isChecked();
	}

	/**
	 * Checks if an element is editable
	 * @param locator The element to check
	 */
	async isEditable(locator: Locator): Promise<boolean> {
		return locator.isEditable();
	}

	// ──────────────────────────────────────────────
	// Assertions
	// ──────────────────────────────────────────────

	/**
	 * Asserts that an element is visible
	 * @param locator The element to assert
	 * @param options Assertion options
	 */
	async expectToBeVisible(
		locator: Locator,
		options?: { timeout?: number },
	): Promise<void> {
		await expect(locator).toBeVisible(options);
	}

	/**
	 * Asserts that an element is hidden
	 * @param locator The element to assert
	 * @param options Assertion options
	 */
	async expectToBeHidden(
		locator: Locator,
		options?: { timeout?: number },
	): Promise<void> {
		await expect(locator).toBeHidden(options);
	}

	/**
	 * Asserts that an element has the specified text
	 * @param locator The element to assert
	 * @param text The expected text or RegExp
	 * @param options Assertion options
	 */
	async expectToHaveText(
		locator: Locator,
		text: string | RegExp,
		options?: {
			timeout?: number;
			useInnerText?: boolean;
			ignoreCase?: boolean;
		},
	): Promise<void> {
		await expect(locator).toHaveText(text, options);
	}

	/**
	 * Asserts that an element contains the specified text
	 * @param locator The element to assert
	 * @param text The expected text or RegExp
	 * @param options Assertion options
	 */
	async expectToContainText(
		locator: Locator,
		text: string | RegExp,
		options?: {
			timeout?: number;
			useInnerText?: boolean;
			ignoreCase?: boolean;
		},
	): Promise<void> {
		await expect(locator).toContainText(text, options);
	}

	/**
	 * Asserts that an input element has the specified value
	 * @param locator The element to assert
	 * @param value The expected value or RegExp
	 * @param options Assertion options
	 */
	async expectToHaveValue(
		locator: Locator,
		value: string | RegExp,
		options?: { timeout?: number },
	): Promise<void> {
		await expect(locator).toHaveValue(value, options);
	}

	/**
	 * Asserts that an element is enabled
	 * @param locator The element to assert
	 * @param options Assertion options
	 */
	async expectToBeEnabled(
		locator: Locator,
		options?: { timeout?: number },
	): Promise<void> {
		await expect(locator).toBeEnabled(options);
	}

	/**
	 * Asserts that an element is disabled
	 * @param locator The element to assert
	 * @param options Assertion options
	 */
	async expectToBeDisabled(
		locator: Locator,
		options?: { timeout?: number },
	): Promise<void> {
		await expect(locator).toBeDisabled(options);
	}

	/**
	 * Asserts that an element is checked
	 * @param locator The element to assert
	 * @param options Assertion options
	 */
	async expectToBeChecked(
		locator: Locator,
		options?: { timeout?: number; checked?: boolean },
	): Promise<void> {
		await expect(locator).toBeChecked(options);
	}

	/**
	 * Asserts that an element has the specified attribute value
	 * @param locator The element to assert
	 * @param name The attribute name
	 * @param value The expected attribute value or RegExp
	 * @param options Assertion options
	 */
	async expectToHaveAttribute(
		locator: Locator,
		name: string,
		value: string | RegExp,
		options?: { timeout?: number },
	): Promise<void> {
		await expect(locator).toHaveAttribute(name, value, options);
	}

	/**
	 * Asserts that the locator matches the expected count
	 * @param locator The locator to count
	 * @param count The expected count
	 * @param options Assertion options
	 */
	async expectToHaveCount(
		locator: Locator,
		count: number,
		options?: { timeout?: number },
	): Promise<void> {
		await expect(locator).toHaveCount(count, options);
	}

	/**
	 * Asserts that the page has the specified title
	 * @param title The expected title or RegExp
	 * @param options Assertion options
	 */
	async expectToHaveTitle(
		title: string | RegExp,
		options?: { timeout?: number },
	): Promise<void> {
		await expect(this.page).toHaveTitle(title, options);
	}

	/**
	 * Asserts that the page has the specified URL
	 * @param url The expected URL or RegExp
	 * @param options Assertion options
	 */
	async expectToHaveURL(
		url: string | RegExp,
		options?: { timeout?: number },
	): Promise<void> {
		await expect(this.page).toHaveURL(url, options);
	}

	/**
	 * Asserts that an element has the specified CSS class(es)
	 * @param locator The element to assert
	 * @param expected The expected class(es)
	 * @param options Assertion options
	 */
	async expectToHaveClass(
		locator: Locator,
		expected: string | RegExp | (string | RegExp)[],
		options?: { timeout?: number },
	): Promise<void> {
		await expect(locator).toHaveClass(expected, options);
	}

	/**
	 * Asserts that an element has the specified CSS property value
	 * @param locator The element to assert
	 * @param name The CSS property name
	 * @param value The expected CSS property value or RegExp
	 * @param options Assertion options
	 */
	async expectToHaveCSS(
		locator: Locator,
		name: string,
		value: string | RegExp,
		options?: { timeout?: number },
	): Promise<void> {
		await expect(locator).toHaveCSS(name, value, options);
	}

	/**
	 * Asserts that an element has the specified id
	 * @param locator The element to assert
	 * @param id The expected id or RegExp
	 * @param options Assertion options
	 */
	async expectToHaveId(
		locator: Locator,
		id: string | RegExp,
		options?: { timeout?: number },
	): Promise<void> {
		await expect(locator).toHaveId(id, options);
	}

	/**
	 * Asserts that an element is editable
	 * @param locator The element to assert
	 * @param options Assertion options
	 */
	async expectToBeEditable(
		locator: Locator,
		options?: { timeout?: number },
	): Promise<void> {
		await expect(locator).toBeEditable(options);
	}

	/**
	 * Asserts that an element is empty
	 * @param locator The element to assert
	 * @param options Assertion options
	 */
	async expectToBeEmpty(
		locator: Locator,
		options?: { timeout?: number },
	): Promise<void> {
		await expect(locator).toBeEmpty(options);
	}

	/**
	 * Asserts that an element is focused
	 * @param locator The element to assert
	 * @param options Assertion options
	 */
	async expectToBeFocused(
		locator: Locator,
		options?: { timeout?: number },
	): Promise<void> {
		await expect(locator).toBeFocused(options);
	}

	/**
	 * Asserts that an element is attached to the DOM
	 * @param locator The element to assert
	 * @param options Assertion options
	 */
	async expectToBeAttached(
		locator: Locator,
		options?: { timeout?: number; attached?: boolean },
	): Promise<void> {
		await expect(locator).toBeAttached(options);
	}

	// ──────────────────────────────────────────────
	// Frames
	// ──────────────────────────────────────────────

	/**
	 * Gets a frame locator by name or URL
	 * @param nameOrUrl The iframe name or URL to locate
	 */
	getFrame(nameOrUrl: string | RegExp): FrameLocator {
		logger.debug(`Getting frame: ${nameOrUrl}`);
		return this.page.frameLocator(
			typeof nameOrUrl === 'string'
				? `iframe[name="${nameOrUrl}"], iframe[src*="${nameOrUrl}"]`
				: 'iframe',
		);
	}

	// ──────────────────────────────────────────────
	// Dialog Handling
	// ──────────────────────────────────────────────

	/**
	 * Registers a handler to accept the next dialog
	 * @param promptText Optional text to enter for prompt dialogs
	 */
	async acceptDialog(promptText?: string): Promise<void> {
		logger.debug('Setting up dialog accept handler');
		this.page.once('dialog', async (dialog) => {
			logger.debug(`Accepted dialog: ${dialog.message()}`);
			await dialog.accept(promptText);
		});
	}

	/**
	 * Registers a handler to dismiss the next dialog
	 */
	async dismissDialog(): Promise<void> {
		logger.debug('Setting up dialog dismiss handler');
		this.page.once('dialog', async (dialog) => {
			logger.debug(`Dismissed dialog: ${dialog.message()}`);
			await dialog.dismiss();
		});
	}

	// ──────────────────────────────────────────────
	// Screenshots
	// ──────────────────────────────────────────────

	/**
	 * Takes a page screenshot with retry logic
	 * @param options Screenshot options
	 */
	async takeScreenshot(options?: ScreenshotOptions): Promise<Buffer> {
		logger.debug(
			`Taking page screenshot${options?.path ? ': ' + options.path : ''}`,
		);
		const timeout = options?.timeout ?? this.defaultTimeout;
		const buffer = await this.retry(
			async () => {
				return this.page.screenshot({
					path: options?.path,
					fullPage: options?.fullPage ?? true,
					type: options?.type,
					quality: options?.quality,
					timeout,
				});
			},
			options?.retries,
			options?.retryInterval,
			'takeScreenshot',
		);
		logger.debug('Page screenshot taken');
		return buffer;
	}

	/**
	 * Takes an element screenshot with retry logic
	 * @param locator The element to screenshot
	 * @param options Screenshot options
	 */
	async takeElementScreenshot(
		locator: Locator,
		options?: ElementScreenshotOptions,
	): Promise<Buffer> {
		logger.debug(
			`Taking element screenshot${options?.path ? ': ' + options.path : ''}`,
		);
		const timeout = options?.timeout ?? this.defaultTimeout;
		const buffer = await this.retry(
			async () => {
				return locator.screenshot({
					path: options?.path,
					type: options?.type,
					quality: options?.quality,
					timeout,
				});
			},
			options?.retries,
			options?.retryInterval,
			'takeElementScreenshot',
		);
		logger.debug('Element screenshot taken');
		return buffer;
	}

	// ──────────────────────────────────────────────
	// Scroll
	// ──────────────────────────────────────────────

	/**
	 * Scrolls an element into view with retry logic
	 * @param locator The element to scroll to
	 * @param options Scroll options
	 */
	async scrollToElement(
		locator: Locator,
		options?: ScrollOptions,
	): Promise<void> {
		logger.debug('Scrolling to element');
		const timeout = options?.timeout ?? this.defaultTimeout;
		await this.retry(
			async () => {
				await locator.scrollIntoViewIfNeeded({ timeout });
			},
			options?.retries,
			options?.retryInterval,
			'scrollToElement',
		);
		logger.debug('Scrolled to element');
	}

	/**
	 * Scrolls to the top of the page with retry logic
	 * @param options Retry options
	 */
	async scrollToTop(options?: RetryOptions): Promise<void> {
		logger.debug('Scrolling to top');
		await this.retry(
			async () => {
				await this.page.evaluate(() => window.scrollTo(0, 0));
			},
			options?.retries,
			options?.retryInterval,
			'scrollToTop',
		);
		logger.debug('Scrolled to top');
	}

	/**
	 * Scrolls to the bottom of the page with retry logic
	 * @param options Retry options
	 */
	async scrollToBottom(options?: RetryOptions): Promise<void> {
		logger.debug('Scrolling to bottom');
		await this.retry(
			async () => {
				await this.page.evaluate(() =>
					window.scrollTo(0, document.body.scrollHeight),
				);
			},
			options?.retries,
			options?.retryInterval,
			'scrollToBottom',
		);
		logger.debug('Scrolled to bottom');
	}

	// ──────────────────────────────────────────────
	// Tab / Window Handling
	// ──────────────────────────────────────────────

	/**
	 * Opens a new tab and navigates to the given URL with retry logic
	 * @param url The URL to open
	 * @param options Navigation options
	 */
	async openNewTab(url: string, options?: NavigationOptions): Promise<Page> {
		logger.debug(`Opening new tab: ${url}`);
		const timeout = options?.timeout ?? this.defaultTimeout;
		const newPage = await this.retry(
			async () => {
				const newPage = await this.page.context().newPage();
				await newPage.goto(url, {
					timeout,
					waitUntil: options?.waitUntil ?? 'domcontentloaded',
					referer: options?.referer,
				});
				return newPage;
			},
			options?.retries,
			options?.retryInterval,
			`openNewTab(${url})`,
		);
		logger.debug(`Opened new tab: ${url}`);
		return newPage;
	}

	/**
	 * Closes the current page
	 */
	async closeCurrentPage(): Promise<void> {
		logger.debug('Closing current page');
		await this.page.close();
		logger.debug('Closed current page');
	}

	/**
	 * Switches to a page by index in the browser context
	 * @param index The page index
	 */
	async switchToPage(index: number): Promise<Page> {
		logger.debug(`Switching to page index: ${index}`);
		const pages = this.page.context().pages();
		logger.debug(`Switched to page index: ${index}`);
		return pages[index];
	}

	// ──────────────────────────────────────────────
	// Storage
	// ──────────────────────────────────────────────

	/**
	 * Sets a value in localStorage with retry logic
	 * @param key The storage key
	 * @param value The storage value
	 * @param options Retry options
	 */
	async setLocalStorage(
		key: string,
		value: string,
		options?: RetryOptions,
	): Promise<void> {
		logger.debug(`Setting localStorage: ${key}`);
		await this.retry(
			async () => {
				await this.page.evaluate(
					([k, v]) => localStorage.setItem(k, v),
					[key, value],
				);
			},
			options?.retries,
			options?.retryInterval,
			`setLocalStorage(${key})`,
		);
		logger.debug(`Set localStorage: ${key}`);
	}

	/**
	 * Gets a value from localStorage with retry logic
	 * @param key The storage key
	 * @param options Retry options
	 */
	async getLocalStorage(
		key: string,
		options?: RetryOptions,
	): Promise<string | null> {
		logger.debug(`Getting localStorage: ${key}`);
		const value = await this.retry(
			async () => {
				return this.page.evaluate((k) => localStorage.getItem(k), key);
			},
			options?.retries,
			options?.retryInterval,
			`getLocalStorage(${key})`,
		);
		logger.debug(`Got localStorage ${key}: ${value}`);
		return value;
	}

	/**
	 * Clears all localStorage with retry logic
	 * @param options Retry options
	 */
	async clearLocalStorage(options?: RetryOptions): Promise<void> {
		logger.debug('Clearing localStorage');
		await this.retry(
			async () => {
				await this.page.evaluate(() => localStorage.clear());
			},
			options?.retries,
			options?.retryInterval,
			'clearLocalStorage',
		);
		logger.debug('Cleared localStorage');
	}
}
