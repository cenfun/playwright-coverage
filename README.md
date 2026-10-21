# Playwright + MCR: Browser Tests and JavaScript Coverage

🌐 English | [简体中文](README.zh-Hans.md)

A **minimal integration example you can copy** to quickly add the following to your own web application:

- **Playwright Test**: open your application, perform real interactions, and assert its behavior.
- **monocart-coverage-reports (MCR)**: collect JavaScript coverage from the browser and generate code coverage reports.

This example uses plain JavaScript ESM without instrumenting application code. It covers **application code running in the browser**, not Playwright test scripts or a Node.js backend. CSS coverage collection is also demonstrated.

## Quick Start for Your Own Project

Use Node.js **22.15+ (22.x) or 24+**, and Chromium for native coverage collection.

### 1. Install Dependencies and Enable ESM

Run these commands in your project root. For a new directory, run `npm init -y` first:

```sh
npm install --save-dev @playwright/test monocart-coverage-reports@^3
npx playwright install chromium
```

Merge the following settings into `package.json` without replacing existing scripts:

```json
{
    "type": "module",
    "scripts": {
        "test:e2e": "playwright test"
    }
}
```

The following steps assume an ESM project. If Playwright is already configured, merge the settings instead of initializing it again. Do not change an existing application's module system just to add coverage.

### 2. Copy These Five Files

Copy these files from this repository's root into your own project root:

| File | Purpose |
| --- | --- |
| [fixtures.js](fixtures.js) | Start, stop, and persist page JS/CSS coverage around each test |
| [mcr.config.js](mcr.config.js) | Share the report name, formats, and output directory |
| [global.setup.js](global.setup.js) | Remove old reports and cached data before testing |
| [global-teardown.js](global-teardown.js) | Merge data and generate reports after all tests finish |
| [playwright.config.js](playwright.config.js) | Configure Chromium and connect the global lifecycle hooks |

Keep the `.js` extensions in relative imports. Add these entries to `.gitignore`:

```gitignore
node_modules/
coverage-reports/
playwright-report/
test-results/
```

### 3. Point the Tests at Your Application

Start your web application, then add its actual address to `use` in `playwright.config.js`:

```js
use: {
    browserName: 'chromium',
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry'
}
```

To let Playwright start the application automatically, add `webServer` to the configuration. Replace the command and URL with your project's actual values:

```js
webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI
}
```

Reuse an existing server lifecycle if you already have one. No additional coverage server is required.

### 4. Write a Functional Test Using the Extended `test`

Create `tests/app.spec.js`. This example assumes your application has a counter initially displaying `0` and an `Increment` button. Replace the selectors, interactions, and assertions with your application's behavior:

```js
import { test, expect } from '../fixtures.js';

test('increments the counter when clicked', async ({ page }) => {
    await page.goto('/');

    const counter = page.getByTestId('counter');
    await expect(counter).toHaveText('0');
    await page.getByRole('button', { name: 'Increment', exact: true }).click();
    await expect(counter).toHaveText('1');
});
```

**Import `test` from `../fixtures.js`, not directly from `@playwright/test`.** The automatic fixture handles coverage collection so tests can focus on application behavior.

You do not need to copy this repository's Todo page or route interception code. They only make the example runnable offline. For your own application, use the `baseURL` above and real pages.

### 5. Run Tests and View Coverage

```sh
npm run test:e2e
```

One run executes the functional tests and generates coverage reports:

| Output | Purpose |
| --- | --- |
| `coverage-reports/index.html` | **JavaScript/CSS code coverage report** with file, line, function, and branch details |
| `coverage-reports/lcov.info` | LCOV report for CI services |
| `playwright-report/index.html` | Playwright test results; view with `npx playwright show-report` |

Open the coverage HTML and confirm that the expected application sources are present. Use uncovered branches to identify missing functional tests. For bundled applications, provide sourcemaps matching the tested build and exclude third-party code using the actual URLs or mapped source paths.

## How the Integration Works

```text
Global setup removes old reports and cached data
  → Each test: start page coverage → assert behavior → stop coverage → MCR.add()
  → All workers finish → global teardown calls MCR.generate()
```

- **Start collection before navigation** to capture application initialization code.
- The fixture uses `{ auto: true }` and `try/finally`. Ordinary assertion failures still attempt to save coverage without suppressing the failure status.
- Workers only call `add()`. Keep `cleanCache: false` in the shared configuration; only the global lifecycle cleans and generates, so parallel tests do not erase each other's data.
- Setup removes both old reports and cached data. Teardown validates the generated result and fails if it is missing or empty, preventing stale reports from being mistaken for current results.
- [mcr.config.js](mcr.config.js) generates `v8`, `console-summary`, and `lcovonly` by default. Remove `lcovonly` if you only need HTML and console output. For JS-only coverage, remove the CSS start/stop calls and CSS data from the fixture's `add()` call.

## Run This Repository's Offline Example

To try the complete workflow before integrating it into your application:

```sh
npm install
npx playwright install chromium
npm test
```

[tests/demo-todo-app.spec.js](tests/demo-todo-app.spec.js) uses Playwright routes to serve real HTML, ESM JavaScript, and CSS from [tests/assets/todo/](tests/assets/todo/). It tests adding items, clearing the input, whitespace boundaries, and text rendering. No server or external website is required, and the coverage report contains only Todo application code.

On Linux CI, use `npx playwright install --with-deps chromium` to install the browser and its system dependencies. Installation requires network access; the local example can run offline once installed. Run `npm run lint` to check the code.

## Limitations

- Native `page.coverage` is **Chromium-only**. This minimal fixture collects only the Playwright-provided `page`; do not close it inside a test. Additional pages, popups, workers, and backend code require separate collection strategies.
- Do not wrap Playwright with `mcr test` as a replacement for page collection. JavaScript running inside the browser must be collected through the page coverage API.
- By default, only loaded files are counted. Unloaded application files are not automatically included at 0%; configure MCR's `all` when you need the complete source scope. High coverage does not replace meaningful behavioral assertions.
- Use a dedicated report output directory, never a source directory. Independent runs or CI shards must not share an active output directory.

For more options, see [monocart-coverage-reports](https://github.com/cenfun/monocart-coverage-reports).
