import { expect } from '@playwright/test';
import { test } from '../fixtures';

test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc');
});

const TODO_ITEMS = [
    'buy some cheese',
    'feed the cat',
    'book a doctors appointment'
];

test.describe('New Todo', () => {
    test('should allow me to add todo items', async ({ page }) => {
    // create a new todo locator
        const newTodo = page.getByPlaceholder('What needs to be done?');

        // Create 1st todo.
        await newTodo.fill(TODO_ITEMS[0]);
        await newTodo.press('Enter');

        // Make sure the list only has one todo item.
        await expect(page.getByTestId('todo-title')).toHaveText([
            TODO_ITEMS[0]
        ]);

        // Create 2nd todo.
        await newTodo.fill(TODO_ITEMS[1]);
        await newTodo.press('Enter');

        // Make sure the list now has two todo items.
        await expect(page.getByTestId('todo-title')).toHaveText([
            TODO_ITEMS[0],
            TODO_ITEMS[1]
        ]);


    });

    test('should clear text input field when an item is added', async ({ page }) => {
    // create a new todo locator
        const newTodo = page.getByPlaceholder('What needs to be done?');

        // Create one todo item.
        await newTodo.fill(TODO_ITEMS[0]);
        await newTodo.press('Enter');

        // Check that input is empty.
        await expect(newTodo).toBeEmpty();

    });

});
