import { APIRequestContext } from '@playwright/test';
import config from '../../config/config';
import { logger } from './logger';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface EmployeeQueryParams {
	limit?: number;
	offset?: number;
	model?: 'detailed';
	includeEmployees?: 'onlyCurrent' | 'onlyPast' | 'currentAndPast';
	sortField?: string;
	sortOrder?: 'ASC' | 'DESC';
}

interface Employee {
	empNumber: number;
	lastName: string;
	firstName: string;
	middleName: string;
	employeeId: string;
	terminationId: number | null;
	jobTitle: {
		id: number;
		title: string;
		isDeleted: boolean;
	};
	subunit: {
		id: number | null;
		name: string | null;
	};
	empStatus: {
		id: number;
		name: string;
	};
	supervisors: unknown[];
}

interface EmployeeListResponse {
	data: Employee[];
	meta: {
		total: number;
	};
	rels: string[];
}

// ──────────────────────────────────────────────
// API Utility
// ──────────────────────────────────────────────

class ApiHelper {
	private request: APIRequestContext;

	constructor(request: APIRequestContext) {
		this.request = request;
	}

	/**
	 * Fetch list of employees with optional query parameters.
	 */
	async searchEmployees(
		params: EmployeeQueryParams = {},
	): Promise<EmployeeListResponse> {
		const queryParams: EmployeeQueryParams = {
			limit: 100,
			offset: 0,
			model: 'detailed',
			includeEmployees: 'onlyCurrent',
			sortField: 'jobTitle.jobTitleName',
			sortOrder: 'DESC',
			...params,
		};

		const searchParams = new URLSearchParams(
			Object.entries(queryParams).map(([k, v]) => [k, String(v)]),
		);

		const url = `${config.apiHost}/v2/pim/employees?${searchParams.toString()}`;
		logger.info(`GET ${url}`);

		const response = await this.request.get(url);

		if (!response.ok()) {
			const body = await response.text();
			throw new Error(`GET employees failed [${response.status()}]: ${body}`);
		}

		const json = await response.json();
		logger.info(`GET employees returned ${json.data?.length ?? 0} results`);
		return json;
	}
}

export { ApiHelper, EmployeeQueryParams, Employee, EmployeeListResponse };
