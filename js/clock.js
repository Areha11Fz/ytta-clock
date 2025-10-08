import { timeOffset } from './time.js';
import { getFromStorage, LOCAL_STORAGE_KEYS } from './storage.js';

let triggeredTargets = [];
const progressBar = document.getElementById('progress-bar');
const targetTimeList = document.getElementById('target-time-list');
const nextTargetTimeElement = document.getElementById('next-target-time');

function debugProgressBar() {
    const now = new Date();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    const totalMs = (seconds * 1000 + milliseconds) % 5000; // Loop every 5 seconds
    const progress = (totalMs / 5000) * 100;
    progressBar.style.width = `${progress}%`;
}

export function checkTargetTimes(now) {
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
        nextTargetTimeElement.textContent = '';
        return;
    }

    const nowMs = now.getTime();

    let nearestFutureTarget = null;
    let minDiff = Infinity;

    targets.forEach(target => {
        const [time, msPart] = target.split('.');
        const [h, m, s] = time.split(':');
        const ms = msPart.padEnd(3, '0');

        // Target for today
        const targetDateToday = new Date(now);
        targetDateToday.setHours(h, m, s, ms);
        const diffToday = targetDateToday.getTime() - nowMs;

        if (diffToday > 0 && diffToday < minDiff) {
            minDiff = diffToday;
            nearestFutureTarget = targetDateToday;
        }

        // Target for tomorrow
        const targetDateTomorrow = new Date(now);
        targetDateTomorrow.setDate(targetDateTomorrow.getDate() + 1);
        targetDateTomorrow.setHours(h, m, s, ms);
        const diffTomorrow = targetDateTomorrow.getTime() - nowMs;

        if (diffTomorrow > 0 && diffTomorrow < minDiff) {
            minDiff = diffTomorrow;
            nearestFutureTarget = targetDateTomorrow;
        }
    });

    if (nearestFutureTarget) {
        const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const timeString = nearestFutureTarget.toLocaleTimeString('en-US', options);
        const msString = nearestFutureTarget.getMilliseconds().toString().padStart(3, '0').substring(0, 2);
        nextTargetTimeElement.textContent = `${timeString}.${msString}`;

        if (minDiff <= 5000) {
            const progress = (5000 - minDiff) / 5000 * 100;
            progressBar.style.width = `${progress}%`;
        } else {
            progressBar.style.width = '0%';
        }

        if (minDiff < 10) { // Check if we are very close to the target time
            const targetString = nearestFutureTarget.toTimeString().split(' ')[0] + '.' + nearestFutureTarget.getMilliseconds().toString().padStart(2, '0');
            if (!triggeredTargets.includes(targetString)) {
                triggeredTargets.push(targetString);
                document.getElementById('clock').style.backgroundColor = 'green';
                progressBar.style.width = '0%';
                setTimeout(() => {
                    document.getElementById('clock').style.backgroundColor = '#000';
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
        nextTargetTimeElement.textContent = '';
    }
}

export function updateClock() {
    let now = new Date();
    let shouldUseServerTime = getFromStorage(LOCAL_STORAGE_KEYS.useServerTime) === 'true';
    if (shouldUseServerTime) {
        now = new Date(now.getTime() + timeOffset);
    }
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = Math.floor(now.getMilliseconds() / 10).toString().padStart(2, '0');

    const timeString = `${hours}:${minutes}:${seconds}.${milliseconds}`;
    document.getElementById('clock-text').textContent = timeString;

    if (getFromStorage(LOCAL_STORAGE_KEYS.debugProgressBar) === 'true') {
        debugProgressBar();
    } else {
        checkTargetTimes(now);
    }
}
