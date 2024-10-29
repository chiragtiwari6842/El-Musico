var songQueue = [];
let playedSongs = [];
let previousSongs = []; 
const maxPreviousSongs = 5; 
let isMuted = false;



function playNextSong(){
   if (songQueue.length > 0){
       var nextSong = songQueue.shift();
       PlayAudio(nextSong.audio_url, nextSong.song_id);
   }
   else {
       const audio = document.getElementById('player');
       audio.currentTime = 0;
       audio.play();
   }
}

function PlayAudio(audio_url, song_id){
   var audio = document.getElementById('player');
   var source = document.getElementById('audioSource');
   source.src = audio_url;
   var name = document.getElementById(song_id + "-n").textContent;
   var album = document.getElementById(song_id + "-a").textContent;
   var image = document.getElementById(song_id + "-i").getAttribute("src");
     
   document.title = name + " - " + album;
   var bitrate = document.getElementById('music-bitrate');
   var bitrate_i = bitrate.options[bitrate.selectedIndex].value;
   var quality = 360;
   document.getElementById("player-name").innerHTML = name;
   document.getElementById("player-album").innerHTML = album;
   document.getElementById("player-image").setAttribute("src",image);
   var promise = audio.load();
   if(promise){
       promise.catch(function(error){ 
           console.error(error); 
       });
   }
   audio.play(); 

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
};

function searchSong(search_term){
   document.getElementById('search-box').value=search_term;
   var goButton = document.getElementById("search-trigger");
   goButton.click();   
}


function AddToQueue(audio_url, song_id){
   songQueue.push({audio_url: audio_url, song_id:song_id});
   var audio = document.getElementById('player');
   if (audio.paused){
       playNextSong();
   }
}

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

function playNextSong() {
    if (songQueue.length > 0) {
        const nextSong = songQueue.shift(); 
        currentSongId = nextSong.song_id; 
        PlayAudio(nextSong.audio_url, nextSong.song_id); 
    } else {
        console.log("No more songs in the queue.");
    }
}

function playPreviousSong() {
    const audio = document.getElementById('player');
    if (previousSongs.length > 0) {
        const previousSong = previousSongs.pop(); 
        songQueue.unshift({ audio_url: audio.src, song_id: currentSongId });
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

    if (event.code == "Slash") {
        event.preventDefault(); 
        searchBox.focus(); 
        searchBox.select();
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