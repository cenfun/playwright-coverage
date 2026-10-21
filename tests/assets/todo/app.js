const form = document.querySelector('#todo-form');
const input = document.querySelector('#new-todo');
const list = document.querySelector('#todo-list');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = input.value.trim();
    if (!title) {
        return;
    }

    const item = document.createElement('li');
    const label = document.createElement('span');
    label.dataset.testid = 'todo-title';
    label.textContent = title;
    item.append(label);
    list.append(item);
    input.value = '';
});
