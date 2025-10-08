import { initUI } from './ui.js';
import { updateClock } from './clock.js';

initUI();
setInterval(updateClock, 1);
