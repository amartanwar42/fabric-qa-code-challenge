import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const getRequired = (key: string, validValues?: string[]): string => {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	if (validValues && !validValues.includes(value)) {
		throw new Error(
			`Invalid value "${value}" for ${key}. Must be one of: ${validValues.join(', ')}`,
		);
	}
	return value;
};

const getOptional = (key: string, defaultValue: string): string => {
	return process.env[key] ?? defaultValue;
};

const getBoolean = (key: string, defaultValue: boolean): boolean => {
	const value = process.env[key];
	if (value === undefined) return defaultValue;
	return value === 'true';
};

// ──────────────────────────────────────────────
// Environment Variables
// ──────────────────────────────────────────────

const env = {
	// Mandatory
	ENV: getRequired('ENV', ['dev', 'staging', 'prod']),
	ADMIN_USERNAME: getRequired('ADMIN_USERNAME'),
	ADMIN_PASSWORD: getRequired('ADMIN_PASSWORD'),

	// Optional
	LOG_LEVEL: getOptional('LOG_LEVEL', 'info'),
	ENABLE_CONSOLE_LOG: getBoolean('ENABLE_CONSOLE_LOG', false),
	CI: getBoolean('CI', false),

	// Email Reporter
	SMTP_USERNAME: getOptional('SMTP_USERNAME', ''),
	SMTP_PASSWORD: getOptional('SMTP_PASSWORD', ''),
};

export default env;
