
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.iptv = Wecom.iptv || function (start, args) {
    this.createNode("body");
    var that = this;

    var colorSchemes = {
        dark: {
            "--bg": "#191918",
            "--button": "#303030",
            "--text-standard": "#f2f5f6",
        },
        light: {
            "--bg": "white",
            "--button": "#e0e0e0",
            "--text-standard": "#4a4a49",
        }
    };
    var schemes = new innovaphone.ui1.CssVariables(colorSchemes, start.scheme);
    start.onschemechanged.attach(function () { schemes.activate(start.scheme) });

    var texts = new innovaphone.lib1.Languages(Wecom.iptvTexts, start.lang);
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

   function app_connected(domain, user, dn, appdomain) {
      app.send({ api: "user", mt: "UserMessage" });
    }

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
        }
    }
}

function selectplayer(){
    populateChannelList();

    const queryString = window.location.search;
    var x = document.getElementById("hls-source").src;
    console.log(x);
    console.log(queryString);
    var params = new URLSearchParams(queryString);
    let channel = params.get('chn');
    let url = params.get('url');

    console.log(channel);
    document.getElementById('hls-source').src=url;
    var x = document.getElementById("hls-source").src;  
    console.log(x);                                        // porque repetir o X dnv?
    var player = videojs('hls-example');
    player.play();
    /*
    switch (channel){
        case 'sbt':
            console.log("sbt");
            document.getElementById('hls-source').src="http://wz4.dnip.com.br/bemtv/bemtv.sdp/playlist.m3u8";
            var x = document.getElementById("hls-source").src;
            console.log(x);
            var player = videojs('hls-example');
            player.play();
            break;
        case 'anime':
            console.log("anime");
            document.getElementById('hls-source').src="https://stmv1.srvif.com/animetv/animetv/playlist.m3u8";
            var x = document.getElementById("hls-source").src;
            console.log(x);
            var player = videojs('hls-example');
            player.play();
            break;
        case 'cnn':
            console.log('cnn');
            document.getElementById('hls-source').src="https://streaming.cnnbrasil.com.br/cnndigital_main.m3u8";
            var x = document.getElementById("hls-source").src;
            console.log(x);
            var player = videojs('hls-example');
            player.play();
            break;
        case 'allsports':
            console.log('allsports');
            document.getElementById('hls-source').src="https://5cf4a2c2512a2.streamlock.net/dgrau/dgrau/chunklist.m3u8";
            var x = document.getElementById("hls-source").src;
            console.log(x);
            var player = videojs('hls-example');
            player.play();
            break;     
    }
    */
}

function newVideoModal(e){
	const modalNewVideo = document.querySelector('.modal');
	modalNewVideo.classList.add('visivel');
	
}

function closeModal(e){
	console.log('function closemodal.');
	const modalNewVideo = document.querySelector('.modal');
	modalNewVideo.classList.remove('visivel');
}

function populateChannelList(e){
    //var token = Config.token;
    //console.log(token);
    //Config.token = "xxxx";
    //Config.save();
    //var token = Config.token;
	//console.log(token);

    var channels = [ {name:"TNT",href:"tnt",src:"https://glxlmn026c.singularcdn.net.br/playout_05/playlist.m3u8",logo:"./images/tnt-logo.png"},{name:"BandNews",href:"band",src:"https://evpp.mm.uol.com.br/geob_band/bandnewstv/playlist.m3u8",logo:"./images/bandnews.png"},{name:"NASA", href:"nasa", src:"https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master_2000.m3u8",logo:"./images/nasa.png"},{name:"CNN", hfef:"cnn",src:"https://cnn-cnninternational-1-de.samsung.wurl.com/manifest/playlist.m3u8",logo:"./images/CNN-Logo.png"},{name:"SBT", href:"sbt", src:"http://wz4.dnip.com.br/bemtv/bemtv.sdp/playlist.m3u8",logo:"./images/sbt.png"},{name:"Anime", href:"anime", src:"https://stmv1.srvif.com/animetv/animetv/playlist.m3u8",logo: "./images/anime-logo2.png"},{name:"AllSports", href:"allsports", src:"https://5cf4a2c2512a2.streamlock.net/dgrau/dgrau/chunklist.m3u8",logo: "./images/AllSports.png"},{name:"TVE", href:"tve",src:"http://selpro1348.procergs.com.br:1935/tve/stve/playlist.m3u8",logo: "./images/tve-logo.png"},{name:"Futura",href:"futura",src:"https://tv.unisc.br/hls/test.m3u8", logo:"./images/futura-logo.png"} ];
    
    channels.forEach(function(item,index){
        console.log(item.name);
        insereLi(item.name, item.href,item.src,item.logo);
    });
}
function insereLi(name, href, src,logo){
    var temphref = "?chn="+href+"&url="+src;

    var ul = document.getElementById('listchanenels');
    var newEl = document.createElement('li');
    var newImg = document.createElement('img');
    var newA = document.createElement('a'); //a tag <a> que faltava
    var newText = document.createTextNode(name);
    //var position = document.getElementsByTagName('ul')[0];
    //os atributos do <a>
    newImg.setAttribute("class","logo");
    newImg.setAttribute("src",logo);
    newA.setAttribute("href", temphref);
    //newA.setAttribute("src", src);
    newA.appendChild(newText); //colocar o texto no <a>
    newEl.appendChild(newA); //e o <a> dentro do <li>
    ul.appendChild(newEl);
    ul.appendChild(newImg);

}

Wecom.iptv.prototype = innovaphone.ui1.nodePrototype;
