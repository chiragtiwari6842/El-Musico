var songQueue = [];
let playedSongs = [];
let previousSongs = []; 
const maxPreviousSongs = 5; 
let isMuted = false;
let automatedSongSuggestions = true;
let automate_flag = true;
let showQueueButton = false;

const suggestionFill = document.getElementById('suggestion-fill');
suggestionFill.style.width = '100%';
function messageElementsDetails(text_content,top_px,right_px){
    let messageElement = document.getElementById('suggestion-message');
        messageElement = document.createElement('div');
        messageElement.style.position = 'fixed';
        messageElement.style.top = top_px;
        messageElement.style.right = right_px;
        messageElement.style.backgroundColor = '#333';
        messageElement.style.color = '#fff';
        messageElement.style.border = '4px solid #055ada';
        messageElement.style.padding = '15px';
        messageElement.style.borderRadius = '15px';
        messageElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
        messageElement.style.opacity = '0'; 
        messageElement.style.transition = 'opacity 0.5s, transform 0.3s';
        messageElement.style.pointerEvents = 'none';
        messageElement.style.fontFamily = getComputedStyle(document.body).fontFamily;
        document.body.appendChild(messageElement);
        messageElement.textContent = text_content;
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(-10px)'; 
        setTimeout(() => {
            messageElement.style.opacity = '0'; 
        }, 3000);
}
messageElementsDetails("Press H or CTRL + H for shortcuts bar","100px","60px");

function playNextSong() {
    if (songQueue.length > 0) {
        const nextSong = songQueue.shift(); 
        currentSongId = nextSong.song_id; 
        currentSongName = nextSong.name;
        PlayAudio(nextSong.audio_url, nextSong.song_id);
    }

}
setInterval(function() {

    if (songQueue.length == 1 && automatedSongSuggestions) {
        automate_flag = true;
    }
    if ((songQueue.length == 1) && automatedSongSuggestions && automate_flag) {
        const firstSong = songQueue[0];
        const songName = firstSong.name;
        getRecommendations(songName);
        automate_flag = false;
    }
}, 1000); 

function    PlayAudio(audio_url, song_id){//Take care of this and name required to get recommendations
    var audio = document.getElementById('player');
    var source = document.getElementById('audioSource');    
    source.src = audio_url;

    try{
            var name = document.getElementById(song_id+"-n").textContent;
            var song = data.songs && data.songs[0];
            if (song) {
                var album = song.album || 'Unknown Album';
                var image = song.image || 'default-image.jpg';
                document.title = name + " - " + album;
                document.getElementById("player-name").innerHTML = name;
                document.getElementById("player-album").innerHTML = album;
                document.getElementById("player-image").setAttribute("src", image);
            }
        }
        catch(error){
            console.error("Error fetching song details:", error);
        };
    
    var promise = audio.load();

    if(promise){
        promise.catch(function(error){ 
            console.error(error); 
        });
    }
    audio.play().then(() => {
        updateProgressBar();
        }).catch(error => {
            console.error(error);
        });
    playedSongs.push({ audio_url: audio.src, song_id });

    if (previousSongs.length >= maxPreviousSongs) {
        previousSongs.shift(); 
    }
    previousSongs.push({ audio_url: audio_url, song_id: song_id }); 
    audio.onended = playNextSong;
    try{
        // console.log(name);
        if(automatedSongSuggestions && songQueue.length == 0){
            getRecommendations(name);
        }
    }
    catch(error) {
        //do nothing
    }
    
};

function getRecommendations(songName) {
    fetch(`http://127.0.0.1:5000/get_recommendations?song_name=${encodeURIComponent(songName)}`)
        .then(response => response.json())
        .then(data => {
            if (data.recommendations) {
                const songNames = data.recommendations.slice(0, 10).map(rec => rec.track_name);
                displayRecommendations(songNames);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function displayRecommendations(songNames) {
    songNames.forEach(songName => {
        fetch(`https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodeURIComponent(songName)}`)
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                if (data.data && data.data.results && Array.isArray(data.data.results) && data.data.results.length > 0) {
                    const song = data.data.results[0]; 
                    const downloadUrl = song.downloadUrl?.find(url => url.quality === "320kbps")?.link;
                    if (downloadUrl) {
                        AddAutomatedQueue(downloadUrl, song.id, song.name, song.primaryArtists);
                    }  
                } 
            })
            .catch(error => {
                console.error('Error fetching song data from JioSaavn:', error);
            });
    });
}

function searchSong(search_term){
   document.getElementById('search-box').value=search_term;
   var goButton = document.getElementById("search-trigger");
   goButton.click();   
}



function AddToQueue(audio_url, song_id, song_name, song_artist){
    if (automatedSongSuggestions) {
        let messageElement = document.getElementById('suggestion-message');
        if (!messageElement) {
            messageElementsDetails("Please off automated suggestions to add songs manually","180px","10px");
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    const songDetails = results_objects[song_id]?.track;
    // console.log({"SongDetails":songDetails,
    //     "ResultsObj":results_objects
    // })
    if (songDetails) {
        // Before pushing into queue check if song is already available
        let isDup = false;
        songQueue.forEach((song) => {
            if(song.name === song_name){
                isDup = true;
            }
        });
        if(isDup){
            messageElementsDetails(`"${song_name}" already in Queue`,"90px","320px"); 
            return;
        }
        songQueue.push({
            audio_url: audio_url,
            song_id: song_id,
            name: song_name, 
            artist: song_artist 
        });
        localStorage.setItem('songQueue', JSON.stringify(songQueue));
        localStorage.setItem('currentSongName',JSON.stringify(song_name));
        // console.log({"SongQueue from AddQueue func":songQueue,
        //     "LocalStorage AddQueue":localStorage
        // });

        // playSongFromQueue(songDetails.name, audio_url);
        const audio = document.getElementById('player');
        // if (songQueue.length == 1 && !audio.play()){
        //     PlayAudio(audio_url, song_id);
        //     songQueue.shift();
        // }
        // PlayAudio(audio_url, song_id);
        saveQueue(song_id);
        messageElementsDetails(`"${song_name}" added to Queue`,"90px","320px"); 
        
    }

}

function AddAutomatedQueue(audio_url, song_id, song_name, song_artist) {
    if (!automatedSongSuggestions) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        alert("Tip: Turn on automated playlist for better listening experience.")
        return;
    }
    // const songDetails = results_objects[song_id]?.track;
    // if (songDetails) {
    // console.log(audio_url);
    // console.log(song_id);
    // console.log(song_name);
    // console.log(song_artist);
    songQueue.push({
        audio_url: audio_url,
        song_id: song_id,
        name: song_name, 
        artist: song_artist 
    });
    // localStorage.setItem('songQueue', JSON.stringify(songQueue));
    saveQueue(song_id);
    
}

function saveQueue(currentSongId) {
    localStorage.setItem('songQueue', JSON.stringify(songQueue));
    localStorage.setItem('currentSongId', currentSongId);
    const currentSong = songQueue.find(song => song.song_id === currentSongId);
    if (currentSong) {
        localStorage.setItem('currentAudioUrl', currentSong.audio_url); // Save audio_url
    }
    
}

function loadQueue() {
    const savedQueue = JSON.parse(localStorage.getItem('songQueue')) || [];
    songQueue = savedQueue;

    const savedSongId = localStorage.getItem('currentSongId');
    const savedAudioUrl = localStorage.getItem('currentAudioUrl'); // Get audio_url from storage
    if (savedSongId && savedAudioUrl) {
        const currentSong = songQueue.find(song => song.song_id === savedSongId);
        if (currentSong && currentSong.audio_url === savedAudioUrl) {
            PlayAudio(currentSong.audio_url, currentSong.song_id); // Play the saved song
        }
    }
}

window.onload = function() {
    loadQueue();
    
    // Restore liked states for initial load
    const likedSongs = JSON.parse(localStorage.getItem('likedSongs') || '{}');
    Object.keys(likedSongs).forEach(songId => {
        const button = document.querySelector(`[data-song-id="${songId}"]`);
        if(button && likedSongs[songId]) {
            button.classList.add('liked');
        }
    });
    
    if(songQueue.length > 0) {
        const firstSong = songQueue[0];
        PlayAudio(firstSong.url, firstSong.song_id);
    }
};

function togglePlay() {
    const player = document.getElementById('player');
    const playPauseIcon = document.querySelector('.play-pause');
    if (songQueue.length > 0 || playedSongs.length > 0) {
        if (player.paused) {
            player.play();
            playPauseIcon.src = "assets/pause.png"; 
        } else {
            player.pause();
            playPauseIcon.src = "assets/play.png";
        }
    }
}

const audio = document.getElementById('player');

audio.onplay = function() {
    document.querySelector('.play-pause').src = "assets/pause.png";
};

audio.ontimeupdate = function() {
    const progress = document.getElementById('progress');
    const currentTime = document.getElementById('current-time');
    const duration = document.getElementById('duration');
    
    const current = Math.floor(audio.currentTime);
    const total = Math.floor(audio.duration);
    
    currentTime.textContent = `${Math.floor(current / 60)}:${('0' + (current % 60)).slice(-2)}`;
    duration.textContent = `${Math.floor(total / 60)}:${('0' + (total % 60)).slice(-2)}`;
    
    progress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    updateProgressBar();
};

function seekTo(event) {
    const progressBar = document.getElementById('progress-bar');
    const audio = document.getElementById('player');
    
    audio.pause();
    const progressBarWidth = progressBar.clientWidth;
    const clickPositionX = event.clientX - progressBar.getBoundingClientRect().left;
    const clickFraction = clickPositionX / progressBarWidth;
    audio.currentTime = clickFraction * audio.duration;
    audio.play(); 
    updateProgressBar(); 
}

function playPreviousSong() {
    const audio = document.getElementById('player');
    if (previousSongs.length > 0) {
        const previousSong = previousSongs.pop(); 
        songQueue.unshift({ url: audio.src, song_id: currentSongId });
        PlayAudio(previousSong.audio_url, previousSong.song_id); 
    } else {
        audio.currentTime = 0; 
        audio.play();
    }
}

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

document.addEventListener('keydown', function(event) {
    const player = document.getElementById('player');
    const searchBox = document.getElementById('music-search-box');

    if (document.activeElement === searchBox) {
        return; 
    }

    if (event.code === 'Space' || event.code == 'Enter') {
        event.preventDefault();
        if (songQueue.length > 0 || playedSongs.length > 0) {
            if (player.paused) {
                player.play();
                document.querySelector('.play-pause').src = "assets/pause.png"; 
            } else {
                player.pause();
                document.querySelector('.play-pause').src = "assets/play.png"; 
            }
        }
    }

    if (event.code === 'ArrowUp' || event.code === 'ArrowRight') {
        event.preventDefault();
        if (!event.ctrlKey) { 
            if (event.code === 'ArrowRight') {
            }
            if (player.volume < 1) {
                player.volume = Math.min(player.volume + 0.1, 1);
                volumeSlider.value = player.volume;
                updateVolumeIcon(player.volume);
            }
        }
    }

    if (event.code === 'ArrowDown' || event.code === 'ArrowLeft') {
        event.preventDefault();
        if (!event.ctrlKey) { 
            if (event.code === 'ArrowRight') {
            }
            if (player.volume > 0) {
                player.volume = Math.max(player.volume - 0.1, 0);
                volumeSlider.value = player.volume; 
                updateVolumeIcon(player.volume);
            }
        }
    }

    if (event.ctrlKey && (event.code === 'ArrowRight')) {
        event.preventDefault();
        playNextSong();
    }


    if (event.ctrlKey && (event.code === 'ArrowLeft')) {
        event.preventDefault();
        playPreviousSong();
    }

    if (event.ctrlKey && (event.key.toLowerCase() === 'q')) {
        event.preventDefault();
        showQueue();
    }

    if (event.ctrlKey && (event.key.toLowerCase() == 'c')) {
        event.preventDefault();
        localStorage.clear();
    }

    if (event.code == "Slash") {
        event.preventDefault(); 
        searchBox.focus(); 
        searchBox.select();
    }

    if (event.key.toLowerCase() === 'm') {
        event.preventDefault();
        toggleVolume();
    }

    if ((event.ctrlKey && (event.key.toLowerCase() === 'h')) || (event.key.toLowerCase() === 'h')){
        event.preventDefault();

        let overlay = document.getElementById('overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = 0;
            overlay.style.left = 0;
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            overlay.style.zIndex = 999;  
            document.body.appendChild(overlay);
        }

        let messageElement = document.getElementById('help');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'help';
            messageElement.style.position = 'fixed';
            messageElement.style.top = '300px';
            messageElement.style.right = '50%';
            messageElement.style.left = '50%';
            // messageElement.style.bottom = '0px'
            messageElement.style.transform = 'translate(-50%, -50%)';
            messageElement.style.height = '490px';
            messageElement.style.width = '400px';
            messageElement.style.backgroundColor = '#333';
            messageElement.style.color = '#fff';
            messageElement.style.border = '4px solid #055ada';
            messageElement.style.padding = '25px';
            messageElement.style.borderRadius = '12px';
            messageElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
            messageElement.style.opacity = '0'; 
            messageElement.style.transition = 'opacity 0.5s, transform 0.3s';
            messageElement.style.pointerEvents = 'auto';
            messageElement.style.display = 'none';
            messageElement.style.fontFamily = 'Arial, Helvetica, sans-serif';
            messageElement.style.zIndex = 1000;
            document.body.appendChild(messageElement);

            const closeButton = document.createElement('span');
            closeButton.textContent = 'x';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '8px';
            closeButton.style.right = '15px';
            closeButton.textContent = '\u2715'; 
            closeButton.style.fontFamily = 'Arial, Helvetica, sans-serif';
            closeButton.style.fontSize = '22px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.color = '#fff';
            closeButton.style.fontWeight = 'bold';
            document.body.style.overflow = 'hidden';
            closeButton.onclick = function() {
                messageElement.style.opacity = 0;
                document.body.style.overflow = 'auto';
                overlay.style.display = 'none';
                setTimeout(() => { messageElement.style.display = 'none'; }, 500);
            };
        messageElement.appendChild(closeButton);

        const messageText = document.createElement('div');
        messageText.innerHTML = `
            <div>Pause : <span class="key">SPACE</span> / <span class="key">ENTER</span></div>
            <div>Volume Up : <span class="key">↑</span> / <span class="key">→</span></div>
            <div>Volume Down : <span class="key">↓</span> / <span class="key">←</span></div>
            <div>Next Song : <span class="key">CTRL</span> + <span class="key">→</span></div>
            <div>Previous Song : <span class="key">CTRL</span> + <span class="key">←</span></div>
            <div>Show Queue : <span class="key">CTRL</span> + <span class="key">Q</span></div>
            <div>Search Box : <span class="key">/</span></div>
            <div>Shortcuts Bar: <span class="key">CTRL</span> + <span class="key">H</span> / <span class="key">H</span></div>
            <div>Mute/Unmute : <span class="key">M</span></div>
            <div>Exit Shortcuts Bar : <span class="key">ESCAPE</span></div>
        `;
        messageText.style.whiteSpace = 'pre-line';
        messageText.style.color = '#fff';
        const style = document.createElement('style');
        style.textContent = `
            .key {
                display: inline-block;
                padding: 2px 6px;
                margin: 0 3px;
                background-color: #555;
                color: #fff;
                border-radius: 5px;
                font-weight: extra-bold;
                font-size: 0.9em;
                font-family: Arial, sans-serif;
                text-align: center;
            }
        `;
        document.head.appendChild(style);
        messageElement.appendChild(messageText);
        }
        overlay.style.display = 'block';
        if (messageElement.style.display === 'none') {
            messageElement.style.display = 'block';
            setTimeout(() => { messageElement.style.opacity = '1'; }, 10); 
        }
    }

    if (event.key === 'Escape') {
        if (showQueueButton){
            showQueue();
        }
        const messageElement = document.getElementById('help');
        if (messageElement && messageElement.style.display === 'block') {
            event.preventDefault();
            messageElement.style.opacity = '0';
            document.body.style.overflow = 'auto';
            overlay.style.display = 'none';
            setTimeout(() => { messageElement.style.display = 'none'; }, 500);
        }
    }
});

function updateVolumeIcon(volume) {
    if (volume === 0) {
        volumeControl.src = 'assets/mute.png';
    } else {
        volumeControl.src = 'assets/volume.png';
    }
}

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


function updateCurrentTime(event) {
    const progressBarWidth = progressBar.clientWidth;
    const clickPositionX = event.clientX - progressBar.getBoundingClientRect().left;
    const clickFraction = Math.min(Math.max(clickPositionX / progressBarWidth, 0), 1);
    
    const audio = document.getElementById('player');
    audio.currentTime = clickFraction * audio.duration; 
    updateProgressBar();
}

function updateProgressBar() {
    const audio = document.getElementById('player');
    const progress = document.getElementById('progress');
    const handle = document.getElementById('progress-handle');
    
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = `${progressPercent}%`;

    const progressBarWidth = document.getElementById('progress-bar').clientWidth;
    const handlePosition = (progressPercent / 100) * progressBarWidth;
    handle.style.left = `${handlePosition}px`;
}

let songRepeat = false;

function repeatSong() {
    const audio = document.getElementById('player');
    const repeat = document.getElementById('repeat');
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


function toggleAutomatedSongSuggestions() {
    let messageElement = document.getElementById('suggestion-message');
    if (!messageElement) {
        messageElement = document.createElement('div');
        // messageElement.id = 'suggestion-message';
        messageElement.style.position = 'fixed';
        messageElement.style.top = '180px';
        messageElement.style.right = '10px';
        messageElement.style.backgroundColor = '#333';
        messageElement.style.color = '#fff';
        messageElement.style.border = '4px solid #055ada';
        messageElement.style.padding = '15px';
        messageElement.style.borderRadius = '15px';
        messageElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
        messageElement.style.opacity = '0'; 
        messageElement.style.transition = 'opacity 0.5s, transform 0.3s';
        messageElement.style.fontFamily = getComputedStyle(document.body).fontFamily;
        messageElement.style.pointerEvents = 'none';
        document.body.appendChild(messageElement);
    }
    if (automatedSongSuggestions) {
        messageElement.textContent = 'Automated suggestions will now stop.';
        const dot = document.getElementById('dot');
        dot.style.right = '140px';
        messageElement.style.opacity = '1'; 
        setTimeout(() => {
            messageElement.style.opacity = '0'; 
        }, 3000);
    }
    else {
        const dot = document.getElementById('dot');
        dot.style.right = '120px';
    }
    automatedSongSuggestions = !automatedSongSuggestions;
    const suggestionsButton = document.getElementById('toggle-suggestions');
    const suggestionFill = document.getElementById('suggestion-fill');
    
    if (automatedSongSuggestions) {
        suggestionsButton.textContent = 'ON';
        suggestionsButton.classList.remove('OFF');
        suggestionsButton.classList.add('ON');
        suggestionFill.style.width = '100%'; 
    } else {
        suggestionsButton.textContent = 'OFF';
        suggestionsButton.classList.remove('ON');
        suggestionsButton.classList.add('OFF');
        suggestionFill.style.width = '0%';
    }
}

function showQueue() {
    showQueueButton = !showQueueButton; 
    let queueElement = document.getElementById('queue-display');

    if (showQueueButton) {
        if (!queueElement) {
            queueElement = document.createElement('div');
            queueElement.id = 'queue-display';
            queueElement.style.position = 'fixed';
            queueElement.style.top = '10px';
            queueElement.style.left = '10px';
            queueElement.style.backgroundColor = '#333';
            queueElement.style.color = '#fff';
            queueElement.style.border = '4px solid #055ada';
            queueElement.style.padding = '15px';
            queueElement.style.borderRadius = '15px';
            queueElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
            queueElement.style.maxHeight = '300px';
            queueElement.style.overflowY = 'auto';
            queueElement.style.zIndex = '1000'; 
            document.body.appendChild(queueElement);
        }

        queueElement.innerHTML = ''; 
        if (songQueue.length > 0) {
            songQueue.forEach((song, index) => {
                const songItem = document.createElement('div');
                songItem.textContent = `${index + 1}. ${song.name}`; 
                queueElement.appendChild(songItem);
            });
        } else {
            queueElement.textContent = 'The queue is empty.';
        }

        document.addEventListener('click', closeQueue);
    } else {
        if (queueElement) {
            queueElement.remove(); 
        }
        document.removeEventListener('click', closeQueue); 
    }
}
function closeQueue(event) {
    const queueElement = document.getElementById('queue-display');
    if (queueElement && !queueElement.contains(event.target) && event.target.id !== 'queue') {
        showQueueButton = false; 
        queueElement.remove(); 
        document.removeEventListener('click', closeQueue);
    }
}

function toggleLike(songId) {
    const button = document.querySelector(`[data-song-id="${songId}"]`);
    const isLiked = button.classList.toggle('liked');
    
    // Save to localStorage
    const likedSongs = JSON.parse(localStorage.getItem('likedSongs') || '{}');
    likedSongs[songId] = isLiked;
    localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
  }


  document.addEventListener('click', function(e) {
    if(e.target.classList.contains('like-button')) {
        const songId = e.target.dataset.songId;
        toggleLike(songId);
    }
});	