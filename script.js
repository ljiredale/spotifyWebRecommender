
var redirect_uri = "http://127.0.0.1:5500/index.html"; // change this your value
//var redirect_uri = "http://127.0.0.1:5500/index.html";
 



var access_token = null;
var refresh_token = null;
var currentPlaylist = "";
var data;
var rpdata;
var recdata;
var songsSel = [];
var searchStatus = null;
var finalStatus = null;
var finalButtonStatus = null;
var playlistData;
var numSongs = 0;
var client_id = "156cf8bae3934700800bc523bdfc18e5"; 
var client_secret = "e5dfeb1eb0af4e44b703fbaac068df19";

const AUTHORIZE = "https://accounts.spotify.com/authorize"
const TOKEN = "https://accounts.spotify.com/api/token";
const PLAYLISTS = "https://api.spotify.com/v1/me/playlists";
const DEVICES = "https://api.spotify.com/v1/me/player/devices";
const PLAY = "https://api.spotify.com/v1/me/player/play";
const PAUSE = "https://api.spotify.com/v1/me/player/pause";
const NEXT = "https://api.spotify.com/v1/me/player/next";
const PREVIOUS = "https://api.spotify.com/v1/me/player/previous";
const PLAYER = "https://api.spotify.com/v1/me/player";
const TRACKS = "https://api.spotify.com/v1/playlists/{{PlaylistId}}/tracks";
const CURRENTLYPLAYING = "https://api.spotify.com/v1/me/player/currently-playing";
const SHUFFLE = "https://api.spotify.com/v1/me/player/shuffle";
const SEARCH = "'https://api.spotify.com/v1/search'"



function callRpTracks(){
    callApi("GET", "https://api.spotify.com/v1/me/player/recently-played?limit=5", null, placeRpTracks)
}


function onPageLoad(){
    console.log(finalStatus);
    client_id = localStorage.getItem("client_id");
    client_secret = localStorage.getItem("client_secret");
    if ( window.location.search.length > 0 ){
        handleRedirect();
    }
    else{
        access_token = localStorage.getItem("access_token");
        if ( access_token == null ){
            // we don't have an access token so present token section
            document.getElementById("tokenSection").style.display = 'block';  
        }

        if (access_token != null & searchStatus == null & finalStatus == null) {
            document.getElementById("deviceSection").style.display = 'block';
            document.getElementById("suggestionSection").style.display="none";
            callRpTracks();
        }

        if (searchStatus != null & finalStatus == null) {
            document.getElementById("deviceSection").style.display = 'none';
            document.getElementById("searchSection").style.display = 'block';
        }
        if (finalStatus != null) {
            document.getElementById("deviceSection").style.display="none";
            document.getElementById("finalButtonSubmitSection").style.display='none';
            document.getElementById("suggestionSection").style.display="block";
        }
    }
    if (songsSel.length > 0 & finalStatus == null){
        document.getElementById("finalButtonSubmitSection").style.display="block";
    }
}


function handleRedirect(){
    let code = getCode();
    fetchAccessToken( code );
    window.history.pushState("", "", redirect_uri); // remove param from url
}
function refreshAccessToken(){
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    callAuthorizationApi(body);
}
function getCode(){
    let code = null;
    const queryString = window.location.search;
    if ( queryString.length > 0 ){
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code')
    }
    return code;
}

function requestAuthorization(){
    var client_id = "156cf8bae3934700800bc523bdfc18e5"; 
    var client_secret = "e5dfeb1eb0af4e44b703fbaac068df19";
    localStorage.setItem("client_id", client_id);
    localStorage.setItem("client_secret", client_secret); 

    let url = AUTHORIZE;
    url += "?client_id=" + "156cf8bae3934700800bc523bdfc18e5";
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private playlist-modify-private";
    window.location.href = url; // Show Spotify's authorization screen
}

function fetchAccessToken( code ){
    let body = "grant_type=authorization_code";
    body += "&code=" + code; 
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;

    callAuthorizationApi(body);
}

function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        var data = JSON.parse(this.responseText);
        if ( data.access_token != undefined ){
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if ( data.refresh_token  != undefined ){
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        onPageLoad();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function redirectToSearch() {
    location.href = "search.html";
}
function handleSearchResponse(){
    if ( this.status == 200){
        data = JSON.parse(this.responseText);
        const pics = ['songpic1','songpic2','songpic3','songpic4','songpic5'];
        const divs = ['songdiv1','songdiv2','songdiv3','songdiv4','songdiv5'];
        const titles = ['songtitle1','songtitle2','songtitle3','songtitle4','songtitle5'];
        const artists = ['artist1','artist2','artist3','artist4','artist5'];
        for (let i = 0; i < pics.length;i++){
            document.getElementById(titles[i]).innerHTML = data.tracks.items[i].name;
            document.getElementById(divs[i]).style.display = "inline-block";
            document.getElementById(pics[i]).src = data.tracks.items[i].album.images[0].url;
            document.getElementById(artists[i]).innerHTML = data.tracks.items[i].artists[0].name;
        }
    }
    else if ( this.status == 401 ){
        alert("Try search again")
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }    
}
function handleApiResponse(){
    if ( this.status == 200){
        console.log(this.responseText);
        setTimeout(currentlyPlaying, 2000);
    }
    else if ( this.status == 204 ){
        setTimeout(currentlyPlaying, 2000);
    }
    else if ( this.status == 401 ){
        alert("Try search again")
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }    
}
function changeSongTitle(){
    callApi("GET", "https://api.spotify.com/v1/search?q="+ document.getElementById("searchInput").value + "&type=track", null, handleSearchResponse)   
}
function callApi(method, url, body, callback){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.send(body);
    xhr.onload = callback;
}

function changeSearchStatus(){
    searchStatus = "active";
    onPageLoad();
}
function rpsongSelected(num){
    searchStatus = null;
    if (songsSel.length > 4){
        alert("You can only select 5 songs");
    }

    else {
        
        songsSel.push(rpdata.items[num-1].track);
    }
    document.getElementById("seltitle" + songsSel.length).innerHTML = rpdata.items[num-1].track.name;
    document.getElementById("seldiv" + songsSel.length).style.display="inline-block";
    document.getElementById("selpic" + songsSel.length).src = rpdata.items[num-1].track.album.images[0].url;
    document.getElementById("selartist" + songsSel.length).innerHTML = rpdata.items[num-1].track.artists[0].name;
    document.getElementById("searchSection").style.display="none";
    onPageLoad()
}
function songSelected(num){
    searchStatus = null;
    if (songsSel.length > 4){
        alert("You can only select 5 songs");
    }

    else {
        songsSel.push(data.tracks.items[num-1]);
    }
    document.getElementById("seltitle" + songsSel.length).innerHTML = data.tracks.items[num-1].name;
    document.getElementById("seldiv" + songsSel.length).style.display="inline-block";
    document.getElementById("selpic" + songsSel.length).src = data.tracks.items[num-1].album.images[0].url;
    document.getElementById("selartist" + songsSel.length).innerHTML = data.tracks.items[num-1].artists[0].name;
    document.getElementById("searchSection").style.display="none";

    onPageLoad()
}

function goBackFunc(){
    document.getElementById('searchSection').style.display="none";
    searchStatus = null;

    onPageLoad();
}

function placeRpTracks(){
    if ( this.status == 200){
        rpdata = JSON.parse(this.responseText);
        const rppics = ['rppic1','rppic2','rppic3','rppic4','rppic5'];
        const rpdivs = ['rpdiv1','rpdiv2','rpdiv3','rpdiv4','rpdiv5'];
        const rptitles = ['rptitle1','rptitle2','rptitle3','rptitle4','rptitle5'];
        const rpartists = ['rpartist1','rpartist2','rpartist3','rpartist4','rpartist5'];
        for (let i = 0; i < rppics.length;i++){
            document.getElementById(rptitles[i]).innerHTML = rpdata.items[i].track.name;
            document.getElementById(rpdivs[i]).style.display = "inline-block";
            document.getElementById(rppics[i]).src = rpdata.items[i].track.album.images[0].url;
            document.getElementById(rpartists[i]).innerHTML = rpdata.items[i].track.artists[0].name;
        }
    }
    else if ( this.status == 401 ){
        alert("Try search again")
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }  
}

function finalButtonSubmit(){
    finalStatus="active";
    
    onPageLoad();
    getRec();
}
function handleRecResponse(){
    if ( this.status == 200){
        recdata = JSON.parse(this.responseText);
        console.log(recdata);
        const recpics = ['recpic1','recpic2','recpic3','recpic4','recpic5','recpic6','recpic7','recpic8','recpic9','recpic10'];
        const recdivs = ['recdiv1','recdiv2','recdiv3','recdiv4','recdiv5','recdiv6','recdiv7','recdiv8','recdiv9','recdiv10'];
        const rectitles = ['rectitle1','rectitle2','rectitle3','rectitle4','rectitle5','rectitle6','rectitle7','rectitle8','rectitle9','rectitle10'];
        const recartists = ['recartist1','recartist2','recartist3','recartist4','recartist5','recartist6','recartist7','recartist8','recartist9','recartist10'];
        for (let i = 0; i < recartists.length;i++){
            document.getElementById(rectitles[i]).innerHTML = recdata.tracks[i].name;
            document.getElementById(recdivs[i]).style.display = "inline-block";
            document.getElementById(recpics[i]).src = recdata.tracks[i].album.images[0].url;
            document.getElementById(recartists[i]).innerHTML = recdata.tracks[i].artists[0].name;
        }
    }
    else if ( this.status == 401 ){
        alert("Try search again")
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}
function getRec(){
    var artseed;
    var trackseed;
    for (let i = 0; i < songsSel.length;i++){
        if (i == 0){
            artseed = songsSel[i].artists[0].id;
            trackseed = songsSel[i].id;
        }
        if (i > 0) {
            artseed += "%2C" + songsSel[i].artists[0].id;
            trackseed += "%2C" + songsSel[i].id;
        }
    }
    callApi("GET", "https://api.spotify.com/v1/recommendations?limit=10&seed_tracks=" +  trackseed, null, handleRecResponse);
}
function createPlaylist(){
    const body = '{"name":"Recommended Songs", "description":"Songs recommended using Spotify API","public":false}';
    callApi("POST", "https://api.spotify.com/v1/users/bobcat3610/playlists", body, handlePlaylistResponse)
}
function handlePlaylistResponse(){ 
    if ( this.status == 201){
        playlistData = JSON.parse(this.responseText);
        console.log(playlistData);
        playlistid = playlistData.id;
        var uris = "";
        for (let i = 0; i < 10;i++){
            uris+= recdata.tracks[i].uri + ",";
        }
        callApi("POST", "https://api.spotify.com/v1/users/bobcat3610/playlists/" + playlistid + "/tracks?uris=" + uris, null, handlePlaylistAddedSongResponse())
    }
    else if ( this.status == 401 ){
        alert("Try search again");
        refreshAccessToken();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}
function handlePlaylistAddedSongResponse(){
    data;
    rpdata;
    recdata;
    songsSel = [];
    searchStatus = null;
    finalStatus = null;
    finalButtonStatus = null;
    const pics = ['selpic1','selpic2','selpic3','selpic4','selpic5'];
    const divs = ['seldiv1','seldiv2','seldiv3','seldiv4','seldiv5'];
    const titles = ['seltitle1','seltitle2','seltitle3','seltitle4','seltitle5'];
    const artists = ['selartist1','selartist2','selartist3','selartist4','selartist5'];
    for (let i = 0; i < pics.length;i++){
        document.getElementById(titles[i]).innerHTML = "";
        document.getElementById(divs[i]).style.display = "none";
        document.getElementById(pics[i]).src = "";
        document.getElementById(artists[i]).innerHTML = "";
    }
    window.open(playlistData.external_urls.spotify);
    onPageLoad();
}