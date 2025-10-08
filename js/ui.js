import { getOffset } from './time.js';
import { loadTargets } from './targets.js';
import { getFromStorage, saveToStorage, LOCAL_STORAGE_KEYS } from './storage.js';

export function updateSubtitle(timeOffset) {
    const offsetSubtitle = document.getElementById('offset-subtitle');
    if (timeOffset !== 0) {
        const offsetInMs = Math.abs(timeOffset);
        const aheadOrBehind = timeOffset > 0 ? 'ahead' : 'behind';
        offsetSubtitle.textContent = `Your system clock is ${offsetInMs}ms ${aheadOrBehind} of server time.`;
    } else {
        offsetSubtitle.textContent = 'Clock is in sync with system time.';
    }
}

export function initUI() {
    const serverTimeToggle = document.getElementById('server-time-toggle');
    const debugProgressBarToggle = document.getElementById('debug-progress-bar');
    const syncNowButton = document.getElementById('sync-now-button');
    const settingsIcon = document.querySelector('.settings-icon');
    const modal = document.getElementById('settings-modal');
    const closeButton = document.querySelector('.close-button');

    let shouldUseServerTime = getFromStorage(LOCAL_STORAGE_KEYS.useServerTime) === null ? true : getFromStorage(LOCAL_STORAGE_KEYS.useServerTime) === 'true';
    let isDebugMode = getFromStorage(LOCAL_STORAGE_KEYS.debugProgressBar) === 'true';

    serverTimeToggle.checked = shouldUseServerTime;
    debugProgressBarToggle.checked = isDebugMode;

    syncNowButton.addEventListener('click', getOffset);

    serverTimeToggle.addEventListener('change', () => {
        shouldUseServerTime = serverTimeToggle.checked;
        saveToStorage(LOCAL_STORAGE_KEYS.useServerTime, shouldUseServerTime);
        if (shouldUseServerTime) {
            getOffset();
        }
    });

    debugProgressBarToggle.addEventListener('change', () => {
        isDebugMode = debugProgressBarToggle.checked;
        saveToStorage(LOCAL_STORAGE_KEYS.debugProgressBar, isDebugMode);
    });

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

    window.addEventListener('load', () => {
        if (shouldUseServerTime) {
            getOffset();
        }
        updateSubtitle(parseInt(getFromStorage(LOCAL_STORAGE_KEYS.timeOffset)) || 0);
        loadTargets();
    });
}
