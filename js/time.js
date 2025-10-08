import { LOCAL_STORAGE_KEYS, saveToStorage } from './storage.js';
import { updateSubtitle } from './ui.js';

export let timeOffset = 0;

const NTP_SERVER = 'https://www.timeapi.io/api/Time/current/zone?timeZone=Asia/Jakarta';

export async function getOffset() {
    try {
        const response = await fetch(NTP_SERVER);
        const data = await response.json();
        const serverTime = new Date(data.dateTime).getTime();
        const clientTime = new Date().getTime();
        timeOffset = serverTime - clientTime;
        saveToStorage(LOCAL_STORAGE_KEYS.timeOffset, timeOffset);
        updateSubtitle(timeOffset);
    } catch (error) {
        console.error('Error fetching server time:', error);
        const offsetSubtitle = document.getElementById('offset-subtitle');
        offsetSubtitle.textContent = 'Error fetching server time.';
    }
}
