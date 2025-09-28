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
            queueElement.style.width = '300px';
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
                
                const deleteBtn = document.createElement('button');
                deleteBtn.style.background = 'none';
                deleteBtn.style.border = 'none';
                deleteBtn.style.cursor = 'pointer';
                deleteBtn.style.padding = '0';
                deleteBtn.style.marginLeft = '10px';
                deleteBtn.title = 'Remove song from queue';

                deleteBtn.innerHTML = `
                    <svg width="1.00em" height="1em" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="white" class="svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 3H8V5H12V3ZM7 3V5H5H4H2.5C2.22386 5 2 5.22386 2 5.5C2 5.77614 2.22386 6 2.5 6H4V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6H17.5C17.7761 6 18 5.77614 18 5.5C18 5.22386 17.7761 5 17.5 5H16H15H13V3C13 2.44772 12.5523 2 12 2H8C7.44772 2 7 2.44772 7 3ZM8 6H12H15V16C15 16.5523 14.5523 17 14 17H6C5.44772 17 5 16.5523 5 16V6H8ZM7.5 8.5C7.5 8.22386 7.27614 8 7 8C6.72386 8 6.5 8.22386 6.5 8.5V14.5C6.5 14.7761 6.72386 15 7 15C7.27614 15 7.5 14.7761 7.5 14.5V8.5ZM10 8C10.2761 8 10.5 8.22386 10.5 8.5V14.5C10.5 14.7761 10.2761 15 10 15C9.72386 15 9.5 14.7761 9.5 14.5V8.5C9.5 8.22386 9.72386 8 10 8ZM13.5 8.5C13.5 8.22386 13.2761 8 13 8C12.7239 8 12.5 8.22386 12.5 8.5V14.5C12.5 14.7761 12.7239 15 13 15C13.2761 15 13.5 14.7761 13.5 14.5V8.5Z"></path>
                    </svg>
                `;

                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    songQueue.splice(index, 1);
                    localStorage.setItem('songQueue', JSON.stringify(songQueue));
                    showQueue();  
                    showQueue();
                });

                songItem.appendChild(deleteBtn);
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
    if (songQueue.length > 0) {
        if (!document.getElementById('shuffle-icon')) {
            const shuffleIconWrapper = document.createElement('div');
            shuffleIconWrapper.id = 'shuffle-icon';
            shuffleIconWrapper.innerHTML = `
                <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="white">
                    <path d="M18 15L21 18M21 18L18 21M21 18H18.5689C17.6297 18 17.1601 18 16.7338 17.8705C16.3564 17.7559 16.0054 17.5681 15.7007 17.3176C15.3565 17.0348 15.096 16.644 14.575 15.8626L14.3333 15.5M18 3L21 6M21 6L18 9M21 6H18.5689C17.6297 6 17.1601 6 16.7338 6.12945C16.3564 6.24406 16.0054 6.43194 15.7007 6.68236C15.3565 6.96523 15.096 7.35597 14.575 8.13744L9.42496 15.8626C8.90398 16.644 8.64349 17.0348 8.29933 17.3176C7.99464 17.5681 7.64357 17.7559 7.2662 17.8705C6.83994 18 6.37033 18 5.43112 18H3M3 6H5.43112C6.37033 6 6.83994 6 7.2662 6.12945C7.64357 6.24406 7.99464 6.43194 8.29933 6.68236C8.64349 6.96523 8.90398 7.35597 9.42496 8.13744L9.66667 8.5"
                        stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            shuffleIconWrapper.title = "Shuffle Queue";
            shuffleIconWrapper.style.position = 'absolute';
            shuffleIconWrapper.style.top = '10px';
            shuffleIconWrapper.style.right = '10px';
            shuffleIconWrapper.style.width = '24px';
            shuffleIconWrapper.style.height = '24px';
            shuffleIconWrapper.style.cursor = 'pointer';
            shuffleIconWrapper.style.zIndex = '1001';
            shuffleIconWrapper.style.opacity = '0.8';
            shuffleIconWrapper.style.transition = 'opacity 0.3s ease';

            shuffleIconWrapper.onmouseover = () => shuffleIconWrapper.style.opacity = '1';
            shuffleIconWrapper.onmouseout = () => shuffleIconWrapper.style.opacity = '0.8';

            shuffleIconWrapper.addEventListener('click', (e) => {
                e.stopPropagation(); 
                shuffle();
                showQueue();
                showQueue();
            });

            queueElement.appendChild(shuffleIconWrapper);
        }
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
    clearQueueButton.style.width = '150px';
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
        songQueue = [];
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

function AddToQueue(audio_url, song_id, song_name, song_artist){
    const songDetails = results_objects[song_id]?.track;
    if (songDetails) {
        songQueue.push({
            audio_url: audio_url,
            song_id: song_id,
            name: song_name,
            artist: song_artist
        });
        localStorage.setItem('songQueue', JSON.stringify(songQueue));
        const audio = document.getElementById('player');
        saveQueue(song_id);
    }
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
    const savedAudioUrl = localStorage.getItem('currentAudioUrl'); 
    if (savedSongId && savedAudioUrl) {
        const currentSong = songQueue.find(song => song.song_id === savedSongId);
        if (currentSong && currentSong.audio_url === savedAudioUrl) {
            PlayAudio(currentSong.audio_url, currentSong.song_id); 
        }
    }
}

function shuffle() {
    for (let i = songQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [songQueue[i], songQueue[j]] = [songQueue[j], songQueue[i]];
    }
    localStorage.setItem('songQueue', JSON.stringify(songQueue));
    console.log('Queue shuffled:', songQueue);
}