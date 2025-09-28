function showPlaylists() {
    const overlay = document.createElement('div');
    overlay.classList.add('playlist-overlay');
    
    const playlistBox = document.createElement('div');
    playlistBox.classList.add('playlist-box');
    
    const clickablePlaylist = document.createElement('div');
    clickablePlaylist.classList.add('clickable-playlist');
    clickablePlaylist.textContent = '▶ Chirag\'s Playlist';
    
    clickablePlaylist.onclick = () => {
        getPlaylist();
        document.body.removeChild(overlay);
    };

    playlistBox.appendChild(clickablePlaylist);

    const closeBtn = document.createElement('span');
    closeBtn.classList.add('close-btn');
    closeBtn.textContent = 'x';
    closeBtn.onclick = () => {
        document.body.removeChild(overlay);
    };
    
    playlistBox.appendChild(closeBtn);
    
    overlay.appendChild(playlistBox);
    
    document.body.appendChild(overlay);
}


function getPlaylist() {
    console.log(1);
    fetch('Playlist_Chirag.json')  
        .then(response => response.json())
        .then(data => {
            console.log(data); 
            const songName = data.map(song => song.track_name);
            displayRecommendations(songName);
        })
        .catch(error => {
            console.error('Error fetching the playlist:', error);
        });
        playNextSong();
}
