const LOCAL_STORAGE_KEYS = {
    useServerTime: 'ytta-clock-use-server-time',
    timeOffset: 'ytta-clock-time-offset'
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
}

setInterval(updateClock, 1);