document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('keydown', function(event) {
        const player = document.getElementById('player');
        const searchBox = document.getElementById('music-search-box');

        if (document.activeElement === searchBox) {
            return; 
        }
        if (event.code === 'Space' || event.code == 'Enter') {
            event.preventDefault();
            togglePlay();
            // event.preventDefault();
            // if (songQueue.length > 0 || playedSongs.length > 0) {
            //     if (player.paused) {
            //         player.play();
            //         document.querySelector('.play-pause').src = "assets/pause.png"; 
            //     } else {
            //         player.pause();
            //         document.querySelector('.play-pause').src = "assets/play.png"; 
            //     }
            // }
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

        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('nexttrack', playNextSong);
            navigator.mediaSession.setActionHandler('previoustrack', playPreviousSong);
        }

        if (event.ctrlKey && (event.code === 'ArrowRight')) {
            event.preventDefault();
            playNextSong();
        }


        if (event.ctrlKey && (event.code === 'ArrowLeft')) {
            event.preventDefault();
            playPreviousSong();
        }

        if (event.ctrlKey && (event.altKey && (event.key.toLowerCase() === 'r'))) {
            event.preventDefault();
            repeatSong();
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
});