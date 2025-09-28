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
let enabled8d = true;
let songRepeat = false;
let isPlaying = false;

// if (audioCtx.state === 'suspended') {
//     audioCtx.resume();
// }

function playNextSong() {
    if (songRepeat) {
        const player = document.getElementById('player');
        player.currentTime = 0;
        player.play();
        return;
    }
    if (!songQueue.length > 0) {
        return;
    }
        const nextSong = songQueue.shift();
        currentSongId = nextSong.song_id;
        currentSongName = nextSong.name;
        // title.textContent = nameToBePrinted;
        PlayAudio(nextSong.audio_url, nextSong.song_id);
}

function PlayAudio(audio_url, song_id){
    var audio = document.getElementById('player');
    var source = document.getElementById('audioSource');

    source.src = audio_url;
    try{
        var name = document.getElementById(song_id+"-n").textContent;
        var title = document.getElementById('title-box');
        title.textContent = name;
        console.log("Name: ", name);
        console.log("AUdio URL: ", audio_url);
        console.log("Song id: ", song_id);
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
};

function togglePlay() {
    const player = document.getElementById('player');    
    const playPauseIcon = document.getElementById('play-pause-icon');
    
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

function playPreviousSong() {
    audio.currentTime = 0;
    audio.play();
}

audio.ontimeupdate = function() {
    const progress = document.getElementById('progress');
    const currentTime = document.getElementById('current-time');
    const duration = document.getElementById('duration');
    
    const current = Math.floor(audio.currentTime);
    const total = Math.floor(audio.duration);
    if (!total)
        return;
    currentTime.textContent = `${Math.floor(current / 60)}:${('0' + (current % 60)).slice(-2)}`;
    duration.textContent = `${Math.floor(total / 60)}:${('0' + (total % 60)).slice(-2)}`;
    
    progress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    updateProgressBar();
};