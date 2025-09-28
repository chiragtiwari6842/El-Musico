document.getElementById("next").addEventListener('click',nextPage)
document.getElementById("first-page").addEventListener('click', backToFirstPage)

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