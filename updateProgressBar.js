let isDragging = false;

const progressBar = document.getElementById('progress-bar');
progressBar.addEventListener('mousedown', (event) => {
    isDragging = true;
    updateCurrentTime(event);
});

document.addEventListener('mousemove', (event) => {
    if (isDragging) {
        updateCurrentTime(event);
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});


function updateVolumeIcon(volume) {
    if (volume === 0) {
        volumeControl.src = 'assets/mute.png';
    } else {
        volumeControl.src = 'assets/volume.png';
    }
}

function updateCurrentTime(event) {
    const progressBarWidth = progressBar.clientWidth;
    const clickPositionX = event.clientX - progressBar.getBoundingClientRect().left;
    const clickFraction = Math.min(Math.max(clickPositionX / progressBarWidth, 0), 1);
    
    const audio = document.getElementById('player');
    if (!audio.duration)
        return;
    audio.currentTime = clickFraction * audio.duration; 
    updateProgressBar();
}

function updateProgressBar() {
    const audio = document.getElementById('player');
    const progress = document.getElementById('progress');
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = `${progressPercent}%`;
}

function seekTo(event) {
    const progressBar = document.getElementById('progress-bar');
    const audio = document.getElementById('player');
    if (!audio.duration)
        return;
    audio.pause();
    const progressBarWidth = progressBar.clientWidth;
    const clickPositionX = event.clientX - progressBar.getBoundingClientRect().left;
    const clickFraction = clickPositionX / progressBarWidth;
    audio.currentTime = clickFraction * audio.duration;
    audio.play();
    updateProgressBar();
}