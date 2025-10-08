const LOCAL_STORAGE_KEYS = {
    useServerTime: 'ytta-clock-use-server-time',
    timeOffset: 'ytta-clock-time-offset',
    targetTimes: 'ytta-clock-target-times'
};

let shouldUseServerTime = localStorage.getItem(LOCAL_STORAGE_KEYS.useServerTime) === null ? true : localStorage.getItem(LOCAL_STORAGE_KEYS.useServerTime) === 'true';
let timeOffset = parseInt(localStorage.getItem(LOCAL_STORAGE_KEYS.timeOffset)) || 0;

const serverTimeToggle = document.getElementById('server-time-toggle');
const offsetSubtitle = document.getElementById('offset-subtitle');
const syncNowButton = document.getElementById('sync-now-button');

const NTP_SERVER = 'https://www.timeapi.io/api/Time/current/zone?timeZone=Asia/Jakarta';

async function getOffset() {
    try {
        const response = await fetch(NTP_SERVER);
        const data = await response.json();
        const serverTime = new Date(data.dateTime).getTime();
        const clientTime = new Date().getTime();
        timeOffset = serverTime - clientTime;
        localStorage.setItem(LOCAL_STORAGE_KEYS.timeOffset, timeOffset);
        updateSubtitle();
    } catch (error) {
        console.error('Error fetching server time:', error);
        offsetSubtitle.textContent = 'Error fetching server time.';
    }
}

function updateSubtitle() {
    if (timeOffset !== 0) {
        const offsetInMs = Math.abs(timeOffset);
        const aheadOrBehind = timeOffset > 0 ? 'ahead' : 'behind';
        offsetSubtitle.textContent = `Your system clock is ${offsetInMs}ms ${aheadOrBehind} of server time.`;
    } else {
        offsetSubtitle.textContent = 'Clock is in sync with system time.';
    }
}

syncNowButton.addEventListener('click', getOffset);

serverTimeToggle.addEventListener('change', () => {
    shouldUseServerTime = serverTimeToggle.checked;
    localStorage.setItem(LOCAL_STORAGE_KEYS.useServerTime, shouldUseServerTime);
    if (shouldUseServerTime) {
        getOffset();
    }
});

window.addEventListener('load', () => {
    serverTimeToggle.checked = shouldUseServerTime;
    if (shouldUseServerTime) {
        getOffset();
    }
    updateSubtitle();
    loadTargets();
});

const settingsIcon = document.querySelector('.settings-icon');
const modal = document.getElementById('settings-modal');
const closeButton = document.querySelector('.close-button');

settingsIcon.addEventListener('click', () => {
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('modal-open'), 10);
});

closeButton.addEventListener('click', () => {
    modal.classList.remove('modal-open');
    setTimeout(() => modal.style.display = 'none', 300);
});

window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.classList.remove('modal-open');
        setTimeout(() => modal.style.display = 'none', 300);
    }
});

const addTargetButton = document.getElementById('add-target-button');
const targetTimeList = document.getElementById('target-time-list');

function saveTargets() {
    const targets = [];
    targetTimeList.querySelectorAll('li').forEach(item => {
        const spans = item.querySelectorAll('span.editable');
        if (spans.length === 4) {
            const timeString = `${spans[0].textContent}:${spans[1].textContent}:${spans[2].textContent}.${spans[3].textContent}`;
            targets.push(timeString);
        }
    });
    localStorage.setItem(LOCAL_STORAGE_KEYS.targetTimes, JSON.stringify(targets));
}

function loadTargets() {
    const targets = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.targetTimes)) || [];
    targets.forEach(targetText => {
        const listItem = createTargetListItem(targetText);
        targetTimeList.appendChild(listItem);
    });
    sortTargetList();
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
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });
    });

    return span;
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

let triggeredTargets = [];

const progressBar = document.getElementById('progress-bar');

function checkTargetTimes(now) {
    const targets = [];
    targetTimeList.querySelectorAll('li').forEach(item => {
        const spans = item.querySelectorAll('span.editable');
        if (spans.length === 4) {
            const timeString = `${spans[0].textContent}:${spans[1].textContent}:${spans[2].textContent}.${spans[3].textContent}`;
            targets.push(timeString);
        }
    });

    if (targets.length === 0) {
        progressBar.style.width = '0%';
        return;
    }

    const nowMs = now.getTime();

    let nearestFutureTarget = null;
    let minDiff = Infinity;

    targets.forEach(target => {
        const [time, ms] = target.split('.');
        const [h, m, s] = time.split(':');
        
        const targetDate = new Date(now);
        targetDate.setHours(h, m, s, ms);

        const diff = targetDate.getTime() - nowMs;

        if (diff > 0 && diff < minDiff) {
            minDiff = diff;
            nearestFutureTarget = targetDate;
        }
    });

    if (nearestFutureTarget) {
        if (minDiff <= 5000) {
            const progress = (5000 - minDiff) / 5000 * 100;
            progressBar.style.width = `${progress}%`;
        } else {
            progressBar.style.width = '0%';
        }

        if (minDiff < 10) { // Check if we are very close to the target time
            const targetString = nearestFutureTarget.toTimeString().split(' ')[0] + '.' + nearestFutureTarget.getMilliseconds().toString().padStart(3, '0');
            if (!triggeredTargets.includes(targetString)) {
                triggeredTargets.push(targetString);
                document.body.style.backgroundColor = 'green';
                progressBar.style.width = '0%';
                setTimeout(() => {
                    document.body.style.backgroundColor = '#000';
                    // Remove the triggered target from the list so it doesn't trigger again
                    const index = triggeredTargets.indexOf(targetString);
                    if (index > -1) {
                        triggeredTargets.splice(index, 1);
                    }
                }, 5000);
            }
        }
    } else {
        progressBar.style.width = '0%';
    }
}

function updateClock() {
    let now = new Date();
    if (shouldUseServerTime) {
        now = new Date(now.getTime() + timeOffset);
    }
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');

    const timeString = `${hours}:${minutes}:${seconds}.${milliseconds}`;
    document.getElementById('clock').textContent = timeString;

    checkTargetTimes(now);
}

setInterval(updateClock, 1);