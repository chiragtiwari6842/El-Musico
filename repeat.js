function repeatSong() {
    const audio = document.getElementById('player');
    const repeat = document.getElementById('repeat');
    if (!audio)
        return;
    if (songRepeat) {
        repeat.src = 'assets/repeat.png'
        audio.loop = false;
    }
    else {
        repeat.src = 'assets/repeatTrue.png'
        audio.loop = true;
    }
    songRepeat = !songRepeat;
}