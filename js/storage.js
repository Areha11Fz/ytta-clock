export const LOCAL_STORAGE_KEYS = {
    useServerTime: 'ytta-clock-use-server-time',
    timeOffset: 'ytta-clock-time-offset',
    targetTimes: 'ytta-clock-target-times',
    debugProgressBar: 'ytta-clock-debug-progress-bar'
};

export function getFromStorage(key) {
    return localStorage.getItem(key);
}

export function saveToStorage(key, value) {
    localStorage.setItem(key, value);
}
