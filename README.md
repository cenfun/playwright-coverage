# playwright-coverage
Example for Playwright Coverage Reports

## Install
```sh
npm i monocart-coverage-reports -D
```

- Create `autoTestFixture` for collecting coverage data, see [fixtures.ts](fixtures.ts)
- Create [global.setup.ts](global.setup.ts) and [global-teardown.ts](global-teardown.ts) for generating coverage reports
- Set coverage options in config [mcr.config.ts](mcr.config.ts)
- Playwright config [playwright.config.ts](playwright.config.ts)

```sh
npm run test
```
The coverage report will be found here: `coverage-reports/index.html`

Check repo [monocart coverage reports](https://github.com/cenfun/monocart-coverage-reports) for more options.