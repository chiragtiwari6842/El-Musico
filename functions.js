var songQueue = [];
let playedSongs = [];
let previousSongs = []; 
const maxPreviousSongs = 5; 
let isMuted = false;
let automatedSongSuggestions = false;
let automate_flag = true;
let showQueueButton = false;
let nameToBePrinted;
let audioCtx;
let panner;
let sourceNode;
let rotationAngle = 0;
let rotateInterval;
let enabled8d = false;
let songRepeat = false;
let isPlaying = false;
const suggestionFill = document.getElementById('suggestion-fill');
if (suggestionFill) {
    suggestionFill.style.width = '100%';
}

// if (audioCtx.state === 'suspended') {
//     audioCtx.resume();
// }

let messageElement = document.getElementById('suggestion-message');
    if (!messageElement) {
        messageElement = document.createElement('div');
        // messageElement.id = 'suggestion-message';
        messageElement.style.position = 'fixed';
        messageElement.style.bottom = '100px';
        messageElement.style.right = '60px';
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
    if (window.innerWidth > 768) {
        messageElement.textContent = 'Press H or CTRL + H for shortcuts bar';
        messageElement.style.opacity = '1';
        setTimeout(() => {
            messageElement.style.opacity = '0';
        }, 3000);
    }

function playNextSong() {
    if (!songQueue.length > 0) {
        return;
    }
    if (songRepeat) {
        const player = document.getElementById('player');
        player.currentTime = 0;
        player.play();
        return;
    }
        const nextSong = songQueue.shift();
        currentSongId = nextSong.song_id;
        currentSongName = nextSong.name;
        // title.textContent = nameToBePrinted;
        PlayAudio(nextSong.audio_url, nextSong.song_id);
}
setInterval(function() {
    title = document.getElementById('title-box');
    // nameToBePrinted = songQueue[0].name;
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

function enable8DAudio(audio) {
    if (!enabled8d) {
        return;
    }
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (sourceNode) {
        sourceNode.disconnect();
    }

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 2.5;

    sourceNode = audioCtx.createMediaElementSource(audio);

    panner = audioCtx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.setPosition(1, 0, 0);

    sourceNode.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(audioCtx.destination);

    if (rotateInterval) clearInterval(rotateInterval);
    rotationAngle = 0;
     rotateInterval = setInterval(() => {
        rotationAngle += 0.03; // faster
        const radius = 2;
        const x = Math.sin(rotationAngle) * radius;
        const z = Math.cos(rotationAngle) * radius;

        panner.setPosition(x, 0, z);
        panner.setOrientation(-x, 0, -z);
    }, 30);
}

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

function PlayAudio(audio_url, song_id){
    var audio = document.getElementById('player');
    var source = document.getElementById('audioSource');
    const playPauseIcon = document.getElementById('play-pause-icon');

    source.src = audio_url;
    try{
        var name = document.getElementById(song_id+"-n").textContent;
        // title.textContent = name;
        console.log("Name: ", name);
        console.log("AUdio URL: ", audio_url);
        console.log("Song id: ", song_id);
        // var song = data.songs && data.songs[0];
        // if (song) {
        //     var album = song.album || 'Unknown Album';
        //     var image = song.image || 'default-image.jpg';

        document.title = name;
        //     document.getElementById("player-name").innerHTML = name;
        //     document.getElementById("player-album").innerHTML = album;
        //     document.getElementById("player-image").setAttribute("src", image);
        //     }
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
        isPlaying = true;
        // playPauseIcon.src = "assets/pause.png";
        enable8DAudio(audio);
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
    // console.log(songQueue);
};

function getRecommendations(songName) {
    // Calling my own API
    //https://wide-fredia-other6842-27416da6.koyeb.app/get_recommendations?song_name=${encodeURIComponent(songName)}
    fetch(`https://wide-fredia-other6842-27416da6.koyeb.app/get_recommendations?song_name=${encodeURIComponent(songName)}`)
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
//Alternate own API
//https://recommendations-nc9w.onrender.com/get_recommendations?song_name=

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
                        if (player.paused) {
                            PlayAudio(downloadUrl, song.id);
                        }
                        else{
                            AddAutomatedQueue(downloadUrl, song.id, song.name, song.primaryArtists);
                        }
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
            messageElement.style.pointerEvents = 'none';
            messageElement.style.fontFamily = getComputedStyle(document.body).fontFamily;
            document.body.appendChild(messageElement);
        }
        messageElement.textContent = 'Please off automated suggestions to add songs manually';
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            messageElement.style.opacity = '0';
        }, 3000);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    const songDetails = results_objects[song_id]?.track;
    if (songDetails) {
        songQueue.push({
            audio_url: audio_url,
            song_id: song_id,
            name: song_name,
            artist: song_artist
        });
        // nameToBePrinted = songQueue[0];
        localStorage.setItem('songQueue', JSON.stringify(songQueue));
        // playSongFromQueue(songDetails.name, audio_url);
        const audio = document.getElementById('player');
        // if (songQueue.length == 1 && !audio.play()){
        //     PlayAudio(audio_url, song_id);
        //     songQueue.shift();
        // }
        // PlayAudio(audio_url, song_id);
        saveQueue(song_id);
    }
    // console.log(nameToBePrinted);
}

function AddAutomatedQueue(audio_url, song_id, song_name, song_artist) {
    // if (!automatedSongSuggestions) {
    //     window.scrollTo({ top: 0, behavior: 'smooth' });
    //     return;
    // }
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
    localStorage.setItem('songQueue', JSON.stringify(songQueue));
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

// const playPauseIcon = document.getElementById('play-pause-icon');
// const player = document.getElementById('player');

// const player = document.getElementById('player');
// document.addEventListener('DOMContentLoaded', function() {
//     const playPauseIcon = document.getElementById('play-pause-icon');
//     if (playPauseIcon) {
//         playPauseIcon.addEventListener('click', togglePlay);
//     }
// });
function togglePlay() {
    const player = document.getElementById('player');    
    const playPauseIcon = document.getElementById('play-pause-icon');
    
    // if (songQueue.length > 0 || playedSongs.length > 0) {
    if (!isPlaying) {
        return;
    }
    if (player.paused) {
        player.play();
        playPauseIcon.innerHTML = `<rect x="6" y="4" width="4" height="16" /> <rect x="14" y="4" width="4" height="16" />`;   
    } 
    else {
        player.pause();
        playPauseIcon.innerHTML = `<polygon points="6,4 20,12 6,20" />`;    
    }
}

const audio = document.getElementById('player');

audio.onplay = function() {
    const playPauseIcon = document.querySelector('.play-pause');
    playPauseIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>`;
};

audio.onpause = function() {
const playPauseIcon = document.getElementById('play-pause-icon');
    playPauseIcon.innerHTML = `<polygon points="6,4 20,12 6,20" />`;
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
    // const audio = document.getElementById('player');
    // if (previousSongs.length > 0) {
    //     const previousSong = previousSongs.pop();
    //     songQueue.unshift({ url: audio.src, song_id: currentSongId });
    //     PlayAudio(previousSong.audio_url, previousSong.song_id);
    // } else {
        audio.currentTime = 0;
        audio.play();
    // }
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
    // const handle = document.getElementById('progress-bar');
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = `${progressPercent}%`;
    // const progressBarWidth = document.getElementById('progress-bar').clientWidth;
    // const handlePosition = (progressPercent / 100) * progressBarWidth;
    // handle.style.left = `${handlePosition}px`;
}

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
        // suggestionFill.style.width = '100%'; 
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
            // Create the main queue display element
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
            queueElement.style.alignContent = 'center';
            queueElement.style.alignItems = 'center';

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
        const clearQueueButton = document.createElement('clear-queue-button');
        clearQueueButton.textContent = 'Clear Queue';
        clearQueueButton.style.backgroundColor = '#055ada';
        clearQueueButton.style.color = '#fff';
        clearQueueButton.style.border = 'none';
        clearQueueButton.style.padding = '8px 15px';
        clearQueueButton.style.borderRadius = '5px';
        clearQueueButton.style.marginBottom = '0px'; 
        clearQueueButton.style.marginLeft = '20px';
        clearQueueButton.style.display = 'none';
        // clearQueueButton.style.height = '30px';
        clearQueueButton.style.cursor = 'pointer';
        clearQueueButton.style.marginTop = '10px';
        clearQueueButton.style.width = '107px';
        clearQueueButton.style.textAlign = 'center';
        clearQueueButton.style.alignContent = 'center';
        clearQueueButton.style.alignItems = 'center';
        // clearQueueButton.style.height = '25px';
        // clearQueueButton.style.marginBottom = '2px';
        clearQueueButton.style.transition = 'background-color 0.3s ease'; 
        clearQueueButton.onmouseover = () => clearQueueButton.style.backgroundColor = 'orange'; 
        clearQueueButton.onmouseout = () => clearQueueButton.style.backgroundColor = '#055ada'; 
        clearQueueButton.addEventListener('click', function() {
            localStorage.clear();
            songQueue = []
            showQueue();
        });
        queueElement.appendChild(clearQueueButton);
        if (songQueue.length > 0 ){
            clearQueueButton.style.display = 'block';
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
    fetch('Playlist_Chirag.json')  
        .then(response => response.json())
        .then(data => {
            // console.log(data); 
            const songName = data.map(song => song.track_name);
            displayRecommendations(songName);
        })
        .catch(error => {
            console.error('Error fetching the playlist:', error);
        });
        playNextSong();
}