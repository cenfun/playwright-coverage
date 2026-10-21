import { fileURLToPath } from 'node:url';
import { test, expect } from '../fixtures.js';

const resources = new Map([
    ['/', {
        file: 'index.html', contentType: 'text/html'
    }],
    ['/app.js', {
        file: 'app.js', contentType: 'application/javascript'
    }],
    ['/style.css', {
        file: 'style.css', contentType: 'text/css'
    }]
]);

test.beforeEach(async ({ page }) => {
    // Serve the real example files without a server or external network access.
    await page.route('http://todo.test/**', async (route) => {
        const resource = resources.get(new URL(route.request().url()).pathname);
        if (!resource) {
            await route.abort();
            return;
        }
        await route.fulfill({
            path: fileURLToPath(new URL(`./assets/todo/${resource.file}`, import.meta.url)),
            contentType: resource.contentType
        });
    });
    await page.goto('http://todo.test/');
});

test('adds multiple todo items', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('buy some cheese');
    await input.press('Enter');
    await expect(page.getByTestId('todo-title')).toHaveText(['buy some cheese']);

    await input.fill('feed the cat');
    await input.press('Enter');
    await expect(page.getByTestId('todo-title')).toHaveText(['buy some cheese', 'feed the cat']);
});

test('clears the input after adding an item', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('buy some cheese');
    await input.press('Enter');
    await expect(page.getByTestId('todo-title')).toHaveText(['buy some cheese']);
    await expect(input).toBeEmpty();
});

test('ignores empty and whitespace-only items', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.press('Enter');
    await expect(page.getByTestId('todo-title')).toHaveCount(0);
    await input.fill('   ');
    await input.press('Enter');
    await expect(page.getByTestId('todo-title')).toHaveCount(0);
});

test('trims input and renders markup as text', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('  <strong>buy cheese</strong>  ');
    await input.press('Enter');
    await expect(page.getByTestId('todo-title')).toHaveText('<strong>buy cheese</strong>');
    await expect(page.getByTestId('todo-title').locator('strong')).toHaveCount(0);
    await expect(input).toBeEmpty();
});
