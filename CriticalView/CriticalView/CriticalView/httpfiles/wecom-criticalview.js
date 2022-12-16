
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.CriticalView = Wecom.CriticalView || function (start, args) {
    this.createNode("body");
    var that = this;
    var storeObject;

    var colorSchemes = {
        dark: {
            "--bg": "#191919",
            "--button": "#303030",
            "--text-standard": "#f2f5f6",
            "--colbutton": "#ffffff",
            "--coltext": "#000000",
        },
        light: {
            "--bg": "white",
            "--button": "#e0e0e0",
            "--text-standard": "#4a4a49",
            "--colbutton": "#000000",
            "--coltext": "#ffffff",
        }
    };
    var schemes = new innovaphone.ui1.CssVariables(colorSchemes, start.scheme);
    start.onschemechanged.attach(function () {
        if (start.scheme == "dark") {
            //document.getElementById('menu-icon').setAttribute('src', './images/menu-icon-white.png');
        }
        if (start.scheme == "light") {
            //document.getElementById('menu-icon').setAttribute('src', './images/menu-icon.png');
        }

        schemes.activate(start.scheme)
    });
    var texts = new innovaphone.lib1.Languages(Wecom.CriticalViewTexts, start.lang);
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "user", mt: "UserMessage" });
        app.send({ api: "channel", mt: "SelectChannelMessage" });

        if (app.logindata.info.unlicensed) {
            unlicensed()
        
        }
        else {
            // licensed mode

            constructor()
            console.log("Versão licenciada!")
            
            
            
        }
    } 

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
            // constructor();
        }
        if (obj.api == "channel" && obj.mt == "ChannelMessageError") {
            console.log(obj.result);
        }
        if (obj.api == "channel" && obj.mt == "SelectChannelMessageResultSuccess") {
            console.log(obj.mt);
            var channels = JSON.parse(obj.result);

            storeObject = channels;
            onChangePage("1");

        }
    }

    function constructor(){
        colEsquerda();
        grid();

    var botoes = document.querySelectorAll(".allbutton");
    for (var i = 0; i < botoes.length; i++) {
        var botao = botoes[i];

        // O jeito correto e padronizado de incluir eventos no ECMAScript
        // (Javascript) eh com addEventListener:
        botao.addEventListener("click", function (event) {
            const el = event.target || event.srcElement;
            const value = el.value;
            //const type = el.type;
            console.log(value);
            onChangePage(value);
        });
    }
    }

    function colEsquerda(){
     var colEsquerda = that.add(new innovaphone.ui1.Div(null,null,"colunaesquerda"));
     for (let i = 1; i < 6; i++) {
        var allBtn = colEsquerda.add(new innovaphone.ui1.Input(null,i,null,null,"button","allbutton"));
     }
    }
    function unlicensed(){
        var grid = that.add(new innovaphone.ui1.Div("margin-left: 6%; align-content: center; display: flex; flex-wrap: wrap; justify-content: center; flex-direction: row; text-align: center;",null,null));
        grid.setAttribute("id","grid");
        var divGrid = grid.add(new innovaphone.ui1.Div("width:37%; display:inline-block;",null,null));
            divGrid.setAttribute("id","div0")
        for(let i = 1; i < 4; i++){
            var divUnlicensed = grid.add(new innovaphone.ui1.Div("width:37%; display:inline-flex; font-size: 20px; font-weight: bold; color: var(--text-standard); justify-content:center; align-items:center",null,null))
            var unlicensedText = divUnlicensed.add(new innovaphone.ui1.Node("p",null,texts.text("licUnLicensed"),null))
            unlicensedText.setAttribute("id","unlicensed" + i)
        } 
    }
    function grid(){
        var grid = that.add(new innovaphone.ui1.Div("margin-left: 6%; align-content: center; display: flex; flex-wrap: wrap; justify-content: center; flex-direction: row; text-align: center;",null,null));
        grid.setAttribute("id","grid");
        for (let i = 0; i < 4; i++) {
            var divGrid = grid.add(new innovaphone.ui1.Div("width:37%; display:inline-block;",null,null));
            divGrid.setAttribute("id","div"+i)
        }
    }

    function onChangePage(page) {
        try {
            for (let i = 0; i < 4; i++) {
                var oldPlayer = document.getElementById('my_video_' + i);
                flvjs(oldPlayer).dispose();
                document.getElementById('div' + i).innerHTML = "";
              
            }

        } catch {
            for (let i = 0; i < 4; i++) {
                var oldPlayer = document.getElementById('my_video_' + i);
                videojs(oldPlayer).dispose();
                document.getElementById('div' + i).innerHTML = "";
            }
        } finally {
            let i = 0;
            storeObject.forEach(function (item, index) {
                if (String(item.page) == String(page)) {
                    document.getElementById('div' + i).innerHTML = "";
                    var playerElement = document.getElementById('div' + i);

                    if (item.type == "video/flv") {
                        var video = document.createElement("video");
                        video.setAttribute("id", "my_video_" + i);
                        video.setAttribute("class", "video-flv vjs-fluid vjs-default-skin");
                        video.setAttribute("controls", "");
                        video.setAttribute("preload", "auto");
                        video.setAttribute("allow", "autoplay");
                        video.setAttribute("autoplay", "true");
                        video.setAttribute("muted", "muted");

                        var source = document.createElement("source");
                        source.setAttribute("src", item.url);
                        source.setAttribute("type", "flv");

                        video.appendChild(source);
                        playerElement.appendChild(video);
       
                        var flvPlayer = flvjs.createPlayer({    
                            type: 'flv',
                            url: item.url
                        });
                        flvPlayer.attachMediaElement(video);
                        flvPlayer.load();
                        flvPlayer.play();   // teste apagar depois
                        //}
                    }
                    if (item.type == "youtube") {
                        var iframe = document.createElement("iframe");
                        iframe.src = item.url + "?autoplay=1&mute=1";
                        iframe.frameBorder = "0";
                        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                        iframe.width = "100%";
                        iframe.height = "180%";
                        iframe.setAttribute("id", "my_video_" + i);                
                        document.getElementById("div" + i).appendChild(iframe);

                        var divtest = document.getElementById('div' + i );
                        divtest.setAttribute("class","youtube" + i) 


                        var labelVideo = document.createElement("label");
                        labelVideo.setAttribute("class", "label" + i);
                        var txtNode = document.createTextNode(item.name);
                        playerElement.appendChild(labelVideo);
                        labelVideo.appendChild(txtNode);

                    }
                    if (item.type == "application/x-mpegURL" || item.type == "video/mp4" || item.type == "video/ogg"  || item.type == "audio/mpeg" || item.type == "audio/wav") {
                        var video = document.createElement("video");
                        video.setAttribute("id", "my_video_" + i);
                        video.setAttribute("class", "video-js vjs-fluid vjs-default-skin");
                        video.setAttribute("controls", "");
                        video.setAttribute("preload", "auto");
                        video.setAttribute("allow", "autoplay");
                        video.setAttribute("autoplay", "true");
                        video.setAttribute("muted", "muted");
                        
                        var source = document.createElement("source");
                        source.setAttribute("src", item.url);
                        source.setAttribute("type", item.type);

                        var divtest = document.getElementById('div' + i );
                        divtest.setAttribute("class","mpeg" + i)

                        var labelVideo2 = document.createElement("label");
                        labelVideo2.setAttribute("class", "labelmpeg" + i);
                        var txtNode2 = document.createTextNode(item.name);
                        playerElement.appendChild(labelVideo2);
                        labelVideo2.appendChild(txtNode2);

                        video.appendChild(source);
                        playerElement.appendChild(video);
                        var video = videojs('my_video_' + i, {
                            html5: {
                                vhs: {
                                    overrideNative: !videojs.browser.IS_SAFARI
                                },
                                nativeAudioTracks: false,
                                nativeVideoTracks: false
                            }
                        });
                        //video.src({ type: type, src: url });
                        video.ready(function () {
                            video.src({ type: item.type, src: item.url });
                        });

                    }
                    i++;
                }
            });
        }
    }
}

Wecom.CriticalView.prototype = innovaphone.ui1.nodePrototype;