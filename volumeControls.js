
let lastVolume = 1;

const volumeSlider = document.getElementById('volume-slider');
const player = document.getElementById('player');
const volumeControl = document.getElementById('volume-control');

function toggleVolume() {
    if (isMuted) {
        player.volume = lastVolume;
        volumeSlider.value = lastVolume;
        volumeControl.src = 'assets/volume.png';
    } else {
        lastVolume = player.volume;
        player.volume = 0;
        volumeSlider.value = 0;
        volumeControl.src = 'assets/mute.png';
    }

    isMuted = !isMuted;
}

volumeSlider.addEventListener('input', function() {
    player.volume = this.value;

    if (player.volume == 0) {
        volumeControl.src = 'assets/mute.png';
    } else {
        volumeControl.src = 'assets/volume.png';
    }
});

volumeSlider.value = player.volume;
