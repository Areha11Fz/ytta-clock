const settingsIcon = document.querySelector('.settings-icon');
const modal = document.getElementById('settings-modal');
const closeButton = document.querySelector('.close-button');

settingsIcon.addEventListener('click', () => {
    modal.style.display = 'block';
});

closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');

    const timeString = `${hours}:${minutes}:${seconds}.${milliseconds}`;
    document.getElementById('clock').textContent = timeString;
}

setInterval(updateClock, 1);