var results_container = document.querySelector("#music-results")
var results_objects = {};
const searchUrl = "https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=";

function MusicSearch() {
    event.preventDefault();
    var query = document.querySelector("#music-search-box").value.trim()
    query = encodeURIComponent(query);
    if(query==lastSearch){
        doMusicSearch(query)
    }
    window.location.hash = lastSearch; 
    if(query.length > 0){ 
        window.location.hash = query 
    }

    document.querySelector("#music-search-box").blur();
}
var page_index = 1;

function nextPage(){
    var query = document.querySelector("#music-search-box").value.trim();
    if (!query){
        query = lastSearch;
    }
    query = encodeURIComponent(query);
    doMusicSearch(query,0,true)
}

function backToFirstPage() {
    var query = document.querySelector("#music-search-box").value.trim();
    if (!query){
        query = lastSearch;
    }
    doMusicSearch(query,0,false);
}

async function doMusicSearch(query,NotScroll,page){
    window.location.hash = query;
    document.querySelector("#music-search-box").value = decodeURIComponent(query);
    if(!query){
        return 0;
    }
    results_container.innerHTML = `<span class="loader">Searching</span>`;
    query = query + "&limit=39";
    if(page){
        page_index = page_index+1;
        query = query + "&page=" + page_index;
    } 
    else{
        query = query + "&page=1";
        page_index = 1;
    }    
    try{
        var response = await fetch(searchUrl + query);
    } 
    catch(error){
        results_container.innerHTML = `<span class="error">Error: ${error} <br> Check if API is down </span>`;
    }
    var json = await response.json();

    if(response.status !== 200){
        results_container.innerHTML = `<span class="error">Error: ${json.message}</span>`;
        console.log(response)
        return 0;
    }
    var json = json.data.results;
    var results = [];
    if(!json){
        results_container.innerHTML = "<p> No result found. Try other Library </p>";
        return;
    }
    lastSearch = decodeURI(window.location.hash.substring(1));
    for(let track of json){
        song_name = TextAbstract(track.name,25);
        album_name = TextAbstract(track.album.name,20);
        if(track.album.name == track.name){
            album_name = ""
        }
        var measuredTime = new Date(null);
        measuredTime.setSeconds(track.duration);
        var play_time = measuredTime.toISOString().substr(11, 8);
        if(play_time.startsWith("00:0")){
            play_time = play_time.slice(4);
        }
        if(play_time.startsWith("00:")){
            play_time = play_time.slice(3);
        }
        var song_id = track.id;
        var year = track.year;
        var song_image = track.image[1].link;
        var song_artist = TextAbstract(track.primaryArtists,30);
        var bitrate = document.getElementById('music-bitrate');
        var bitrate_i = bitrate.options[bitrate.selectedIndex].value;
        if(track.downloadUrl){
        var download_url = track.downloadUrl[bitrate_i]['link'];
        var quality = 360;
        results_objects[song_id] = {
            track: track
        };
        results.push(`
            <div class="text-left song-container" style="margin-bottom:20px;border-radius:35px;background-color:#1c1c1c;padding:10px;">
                <div class="row" style="margin:auto;">
                    <div class="col-auto" style="padding:0px;padding-right:0px;border-style:none;">
                        <img id="${song_id}-i" class="img-fluid d-inline" style="width:115px;border-radius:5px;height:115px;padding-right:10px;border-radius:90px;" src="${song_image}" loading="eager"/>
                    </div>
                    <div class="col" style="border-style:none;padding:2px;">
                        <p class="float-right fit-content" style="margin:0px;color:#fff;padding-right:10px;">${year}</p>
                        <p id="${song_id}-n" class="fit-content" style="margin:0px;color:#fff;max-width:100%;">${song_name}</p>
                        <p id="${song_id}-a" class="fit-content" style="margin:0px;color:#fff;max-width:100%;">${album_name}<br/></p>
                        <p id="${song_id}-ar" class="fit-content" style="margin:0px;color:#fff;max-width:100%;">${song_artist}<br/></p>
                        <button class="btn btn-primary song-btn" type="button" style="margin:0px 2px;" title="Play" onclick='PlayAudio("${download_url}","${song_id}")'>▶</button>
                        <button class="btn btn-primary song-btn" type="button" style="margin:0px 2px;" title="Add to Queue" onclick='AddToQueue("${download_url}","${song_id}", "${song_name}", "${song_artist}")'><img src="assets/add-to-queue.png" style="width:25px;height:25px"display:flex;align-items:center;></button>
                        <p class="float-right fit-content" style="margin:0px;color:#fff;padding-right:10px;padding-top:15px;">${play_time}<br/></p>
                    </div>
                </div>
            </div>`
        ); }
    }
    results_container.innerHTML = results.join(' ');
    if(!NotScroll){
        document.getElementById("music-results").scrollIntoView();
    }
}

function TextAbstract(text, length){
    if (text == null){
        return "";
    }
    if(text.length <= length){
        return text;
    }
    text = text.substring(0, length);
    last = text.lastIndexOf(" ");
    text = text.substring(0, last);
    return text + "...";
}

if(window.location.hash){
   doMusicSearch(window.location.hash.substring(1));
} 
else{
    doMusicSearch('Ayushmann Khurrana',1);
}

addEventListener('hashchange', event => { });
onhashchange = event => {doMusicSearch(window.location.hash.substring(1))};

$('#music-bitrate').on('change', function (){
    doMusicSearch(lastSearch);
});

document.getElementById("next").addEventListener('click',nextPage)
document.getElementById("first-page").addEventListener('click', backToFirstPage)
