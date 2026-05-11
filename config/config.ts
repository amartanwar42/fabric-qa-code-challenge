import env from './env';

// ──────────────────────────────────────────────
// Environment Enum
// ──────────────────────────────────────────────

enum ENVIRONMENTS {
	DEV = 'dev',
	STAGING = 'staging',
	PROD = 'prod',
}

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type Domain = string;
type Path = string;

// ──────────────────────────────────────────────
// URL Builders
// ──────────────────────────────────────────────

/**
 * Create a URL based on domain, environment, and path
 */
const createEnvUrl = (domain: Domain, path: Path = '/'): string => {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;

	const envConfig: Record<string, () => string> = {
		[ENVIRONMENTS.PROD]: () =>
			`https://${domain}.orangehrmlive.com/web/index.php${normalizedPath}`,
		[ENVIRONMENTS.STAGING]: () =>
			`https://${domain}-staging.orangehrmlive.com/web/index.php${normalizedPath}`,
		[ENVIRONMENTS.DEV]: () =>
			`http://localhost:3000/web/index.php${normalizedPath}`,
	};

	return envConfig[env.ENV]();
};

/**
 * Create an environment API host based on domain
 */
const createEnvApiHost = (domain: Domain): string => {
	const envConfig: Record<string, () => string> = {
		[ENVIRONMENTS.PROD]: () =>
			`https://${domain}.orangehrmlive.com/web/index.php/api`,
		[ENVIRONMENTS.STAGING]: () =>
			`https://${domain}-staging.orangehrmlive.com/web/index.php/api`,
		[ENVIRONMENTS.DEV]: () => `http://localhost:4000/web/index.php/api`,
	};

	return envConfig[env.ENV]();
};

// ──────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────

const config = {
	env: env.ENV,

	// URLs
	baseUrl: createEnvUrl('opensource-demo'),
	apiHost: createEnvApiHost('opensource-demo'),
	createEnvUrl,
};

export default config;
export { ENVIRONMENTS, createEnvUrl, createEnvApiHost };
