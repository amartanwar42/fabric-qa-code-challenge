# OrangeHRM Test Automation

End-to-end test automation for the [OrangeHRM](https://opensource-demo.orangehrmlive.com) web application using Playwright and TypeScript.

## What This Project Does

Automates key HR workflows on the OrangeHRM demo application:

- **Login** — Authenticate with valid credentials and verify successful login
- **Navigation** — Verify all left-side menu tabs (Admin, PIM, Leave, Time, Recruitment, etc.) are functional
- **Employee Management (PIM)** — Create employees with optional login credentials, search by ID/name, validate search results, and edit employee details (job title, category, employment status)

## Project Structure

```
config/
  env.ts              # Centralized environment variable loader (dotenv)
  config.ts           # URL builders and app configuration per environment
tests/
  fixtures/           # Playwright custom fixtures (page objects, shared context)
  pageObjects/        # Locator definitions (DOM selectors)
  pages/              # Page action methods (business logic layer)
  specs/              # Test specifications
  types/              # Shared TypeScript types
  utility/            # Helpers (actions wrapper, logger, test data generator)
```

## Libraries Used

| Library            | Purpose                                               |
| ------------------ | ----------------------------------------------------- |
| `@playwright/test` | Test runner, browser automation, assertions           |
| `dotenv`           | Loads environment variables from `.env`               |
| `winston`          | Structured logging to file and console                |
| `@faker-js/faker`  | Random test data generation (names, IDs, credentials) |

## Fixtures

Custom fixtures are defined in `tests/fixtures/testFixture.ts` and extend Playwright's base `test` object:

| Fixture          | Scope       | Description                                                                                |
| ---------------- | ----------- | ------------------------------------------------------------------------------------------ |
| `workerContext`  | Worker      | Shared browser context across tests in a worker — avoids creating a new context per test   |
| `sharedContext`  | Test        | Exposes the worker context at test level                                                   |
| `sharedPage`     | Test        | Creates a page from the shared context; captures console errors and page errors via logger |
| `saveScreenshot` | Test (auto) | Automatically takes and attaches a screenshot on test failure                              |
| `loginPage`      | Test        | Pre-initialized `LoginPage` instance                                                       |
| `dashboardPage`  | Test        | Pre-initialized `DashboardPage` instance                                                   |

Usage in specs:

```ts
import { test } from '../fixtures/testFixture';

test('example', async ({ loginPage, dashboardPage }) => {
	await loginPage.openLoginPage();
	await loginPage.login('Admin', 'admin123');
	await dashboardPage.openTab('PIM', 'PIM');
});
```

## Setup

### Prerequisites

- Node.js >= 20
- npm >= 10

### Install

```bash
npm install
npx playwright install
```

### Environment Variables

Create a `.env` file in the project root:

```env
ENV=prod
ADMIN_USERNAME=****
ADMIN_PASSWORD=****
ENABLE_CONSOLE_LOG=true
LOG_LEVEL=info
```

| Variable             | Required | Values                           | Default |
| -------------------- | -------- | -------------------------------- | ------- |
| `ENV`                | Yes      | `dev`, `staging`, `prod`         | —       |
| `ADMIN_USERNAME`     | Yes      | —                                | —       |
| `ADMIN_PASSWORD`     | Yes      | —                                | —       |
| `ENABLE_CONSOLE_LOG` | No       | `true`, `false`                  | `false` |
| `LOG_LEVEL`          | No       | `info`, `debug`, `warn`, `error` | `info`  |
| `CI`                 | No       | `true`, `false`                  | `false` |

## Running Tests

```bash
# Run all tests
ENV=prod npx playwright test

# Run a specific spec
ENV=prod npx playwright test tests/specs/createEmployee.spec.ts

# Run headed (visible browser)
ENV=prod npx playwright test --headed

# Run with trace enabled
ENV=prod npx playwright test --trace=on

# List discovered tests without running
ENV=prod npx playwright test --list
```

> The `ENV` variable can also be set in `.env` instead of passing it inline.

### View Report

```bash
npx playwright show-report
```

## Logger

Logging is handled by [winston](https://github.com/winstonjs/winston) and configured in `tests/utility/logger.ts`.

### How It Works

- **File transport** — All logs are written to `test-execution.log` in the project root. This is always active.
- **Console transport** — Logs are printed to the terminal only when `ENABLE_CONSOLE_LOG=true` is set. Errors and warnings go to `stderr`, everything else to `stdout` with colorized output.
- **Log level** — Controlled by the `LOG_LEVEL` env variable (default: `info`). Supports `error`, `warn`, `info`, `debug`.
- **Format** — `<timestamp> <level>: <message>` (e.g., `2026-05-11T10:30:00.000Z info: Dashboard is visible`)

### Usage

```ts
import { logger } from '../utility/logger';

logger.info('Navigating to PIM tab');
logger.error('Element not found');
logger.debug('Response payload: ...');
```

### npm Scripts

| Command               | Description                    |
| --------------------- | ------------------------------ |
| `npm test`            | Run all tests                  |
| `npm run test:headed` | Run tests with visible browser |
| `npm run test:trace`  | Run tests with trace enabled   |
| `npm run test:list`   | List all discovered tests      |
| `npm run report`      | Open the HTML test report      |

> Set `ENV` in `.env` or pass inline: `ENV=prod npm test`

## CI/CD

Tests run automatically on GitHub Actions for every push and pull request to `main`/`master`. The workflow is defined in `.github/workflows/playwright.yml`.

### Setup

1. Base64-encode your `.env` file:

   ```bash
   base64 -i .env
   ```

2. In your GitHub repo, go to **Settings → Secrets and variables → Actions** and create a secret named `ENV_FILE` with the base64 output.

3. The workflow decodes the secret into a `.env` file at runtime before running tests.

### What the Workflow Does

- Checks out the code
- Installs Node.js and dependencies
- Installs Playwright browsers
- Decodes `ENV_FILE` secret into `.env`
- Runs all tests with `CI=true` (enables retries, parallel workers, `forbidOnly`)
- Uploads the HTML test report as an artifact (retained for 30 days)
