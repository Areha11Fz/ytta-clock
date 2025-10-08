import { LOCAL_STORAGE_KEYS, saveToStorage, getFromStorage } from './storage.js';
import { checkTargetTimes } from './clock.js';


const targetTimeList = document.getElementById('target-time-list');
const addTargetButton = document.getElementById('add-target-button');

function createEditableSpan(value, padLength) {
    const span = document.createElement('span');
    span.textContent = value;
    span.classList.add('editable');

    span.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'number';
        input.value = span.textContent;
        input.classList.add('editable-input');

        span.replaceWith(input);
        input.focus();

        input.addEventListener('blur', () => {
            let newValue = input.value.padStart(padLength, '0');
            const newSpan = createEditableSpan(newValue, padLength);
            input.replaceWith(newSpan);
            saveTargets();
            sortTargetList();
            checkTargetTimes(new Date());
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });
    });

    return span;
}

function createTargetListItem(targetText) {
    const listItem = document.createElement('li');

    const timeParts = targetText.split(/[:.]/);

    const hourSpan = createEditableSpan(timeParts[0], 2);
    const minuteSpan = createEditableSpan(timeParts[1], 2);
    const secondSpan = createEditableSpan(timeParts[2], 2);
    const millisecondSpan = createEditableSpan(timeParts[3], 3);

    listItem.appendChild(hourSpan);
    listItem.appendChild(document.createTextNode(':'));
    listItem.appendChild(minuteSpan);
    listItem.appendChild(document.createTextNode(':'));
    listItem.appendChild(secondSpan);
    listItem.appendChild(document.createTextNode('.'));
    listItem.appendChild(millisecondSpan);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '×';
    deleteButton.classList.add('delete-target-button');
    deleteButton.addEventListener('click', () => {
        listItem.remove();
        saveTargets();
    });

    listItem.appendChild(deleteButton);
    return listItem;
}

function sortTargetList() {
    const items = Array.from(targetTimeList.children);
    items.sort((a, b) => {
        const timeA = a.textContent.replace(/[.:×]/g, '');
        const timeB = b.textContent.replace(/[.:×]/g, '');
        return timeA.localeCompare(timeB);
    });
    items.forEach(item => targetTimeList.appendChild(item));
}

export function saveTargets() {
    const targets = [];
    targetTimeList.querySelectorAll('li').forEach(item => {
        const spans = item.querySelectorAll('span.editable');
        if (spans.length === 4) {
            const timeString = `${spans[0].textContent}:${spans[1].textContent}:${spans[2].textContent}.${spans[3].textContent}`;
            targets.push(timeString);
        }
    });
    saveToStorage(LOCAL_STORAGE_KEYS.targetTimes, JSON.stringify(targets));
}

export function loadTargets() {
    const targets = JSON.parse(getFromStorage(LOCAL_STORAGE_KEYS.targetTimes)) || [];
    targets.forEach(targetText => {
        const listItem = createTargetListItem(targetText);
        targetTimeList.appendChild(listItem);
    });
    sortTargetList();
}

addTargetButton.addEventListener('click', () => {
    const hour = document.getElementById('target-hour').value.padStart(2, '0');
    const minute = document.getElementById('target-minute').value.padStart(2, '0');
    const second = document.getElementById('target-second').value.padStart(2, '0');
    const millisecond = document.getElementById('target-millisecond').value.padStart(3, '0');

    const timeString = `${hour}:${minute}:${second}.${millisecond}`;

    const listItem = createTargetListItem(timeString);
    targetTimeList.appendChild(listItem);
    saveTargets();
    sortTargetList();
});
