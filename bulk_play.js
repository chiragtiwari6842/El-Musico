function playAll() {
    const tracks = JSON.parse(localStorage.getItem('musicSearchResults') || '[]');
    if (tracks.length === 0) {
        return;
    }

    for (const track of tracks) {
        AddToQueue(track.url_360, track.id, track.name, track.artist);
    }
    playNextSong();
}