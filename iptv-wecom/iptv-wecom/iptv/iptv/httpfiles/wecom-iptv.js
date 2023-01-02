
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />
/// <reference path="./flv.js" />
/// <reference path="./video.js" />


var Wecom = Wecom || {};
Wecom.iptv = Wecom.iptv || function (start, args) {

    this.createNode("body");
    var that = this;

    var colorSchemes = {
        dark: {
            "--bg": "#191918",
            "--button": "#303030",
            "--text-standard": "#f2f5f6",
            "--nav-bg": "rgba(255, 255, 255, 0.5)",

        },
        light: {
            "--bg": "white",
            "--button": "#e0e0e0",
            "--text-standard": "#4a4a49",
            "--nav-bg": "rgba(75, 71, 71, 0.7)",
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
        app.send({ api: "channel", mt: "SelectChannelMessage" });
        }

    function app_message(obj) {
        console.log(obj);
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
            iptv()
        }
        if (obj.api == "channel" && obj.mt =="ChannelMessageError") {
            console.log(obj.result);
        }
        if (obj.api == "channel" && obj.mt == "SelectChannelMessageResultSuccess") {
            console.log(obj.mt);
            var channels = JSON.parse(obj.result);
            insereLi(channels);

        }
    }
    function iptv(){
       var colesquerda = that.add(new innovaphone.ui1.Div("position:absolute;width:15%;float:left; height: 100%",null,"colunaesquerda"));
       var wecom = colesquerda.add(new innovaphone.ui1.Div("position:absolute; width:100%; height: 5%; top: 90%;display:flex;justify-content:center; align-items:center;",null,null));
       var wecomA = wecom.add(new innovaphone.ui1.Node("a",null,null,null))
       wecomA.setAttribute("href","https://wecom.com.br")
       wecomA.setAttribute("id","wecomA")
       var imgwecom = wecomA.add(new innovaphone.ui1.Node("img",null,null,"imglogo"));
       imgwecom.setAttribute("src","logo.png")
       var scroll = colesquerda.add(new innovaphone.ui1.Node("scroll-container", null, null, "scroll-container"));
       var uliptv = scroll.add(new innovaphone.ui1.Node("ul",null,null,null));
       uliptv.setAttribute("id","listchannels");
       var divcontainer = that.add(new innovaphone.ui1.Div("position:absolute;width:85%;left:15%; height: 100%",null,"container"));
       divcontainer.setAttribute("id","container")
       var videoiptv = divcontainer.add(new innovaphone.ui1.Node("video",null,null,null))
       videoiptv.setAttribute("id","video-flv")

    }
    const myInterval = window.setInterval(function () {
        getChannels();
    }, 30000);

    function getChannels() {
        app.send({ api: "channel", mt: "SelectChannelMessage" });
    }

    function onChange(url, type) {
        try {
            var oldPlayer = document.getElementById('video-flv');
            flvjs(oldPlayer).dispose();
        } catch {
            var oldPlayer = document.getElementById('video-js_html5_api');
            videojs(oldPlayer).dispose();
        } finally {
            document.getElementById("container").innerHTML = "";
            if (type == "video/flv") {
                //var script = document.createElement("script");
                //script.src = "flv.js";
                //script.type = "text/javascript";
                //document.getElementById("container").appendChild(script);
                //if (flvjs.isSupported()) {
                var videoElement = document.createElement("video");
                videoElement.setAttribute("allow", "autoplay");
                videoElement.setAttribute("autoplay", "true");
                videoElement.setAttribute("muted", "muted");
                //videoElement.setAttribute("width", "800%");
                //videoElement.setAttribute("height", "470%");
                videoElement.setAttribute("controls", "");
                videoElement.setAttribute("class", "video-flv vjs-default-skin");
                videoElement.setAttribute("id", "video-flv");

                document.getElementById("container").appendChild(videoElement);

                var flvPlayer = flvjs.createPlayer({
                    type: 'flv',
                    url: url
                });
                flvPlayer.attachMediaElement(videoElement);
                flvPlayer.load();
                flvPlayer.play();
                //}
            }
            if (type == "youtube") {
                var iframe = document.createElement("iframe");
                iframe.src = url +"?autoplay=1&mute=1";
                iframe.frameBorder = "0";
                iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                iframe.width = "100%";
                iframe.height = "100%";
                document.getElementById("container").appendChild(iframe);
            }
            if (type == "application/x-mpegURL") {
                //var script = document.createElement("script");
                //script.src = "video.js";
                //script.type = "text/javascript";
                var source = document.createElement("source");
                source.setAttribute("src", url);
                source.setAttribute("type", type);

                //document.getElementById("container").appendChild(script);
                var videoElement = document.createElement("video");
                videoElement.setAttribute("allow", "autoplay");
                videoElement.setAttribute("autoplay", "true");
                videoElement.setAttribute("muted", "muted");
                videoElement.setAttribute("width", "100%");
                videoElement.setAttribute("height", "100%");
                videoElement.setAttribute("controls","");
                videoElement.setAttribute("class", "video-js vjs-default-skin");
                videoElement.setAttribute("id", "video-js");

                //videoElement.setAttribute("src", url);
                //videoElement.setAttribute("type", type);
                document.getElementById("container").appendChild(videoElement);
                document.getElementById("video-js").appendChild(source);
                var video = videojs('video-js', {
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
                    video.src({ type: type, src: url });
                });

            }
            if (type == "video/mp4"|| type=="video/ogg") {
                //var script = document.createElement("script");
                //script.src = "video.js";
                //script.type = "text/javascript";
                var source = document.createElement("source");
                source.setAttribute("src", url);
                source.setAttribute("type", type);

                //document.getElementById("container").appendChild(script);
                var videoElement = document.createElement("video");
                videoElement.setAttribute("allow", "autoplay");
                videoElement.setAttribute("autoplay", "true");
                videoElement.setAttribute("muted", "muted");
                videoElement.setAttribute("width", "800%");
                videoElement.setAttribute("height", "470%");
                videoElement.setAttribute("controls","");
                videoElement.setAttribute("class", "video-js vjs-default-skin");
                videoElement.setAttribute("id", "video-js");

                //videoElement.setAttribute("src", url);
                //videoElement.setAttribute("type", type);
                document.getElementById("container").appendChild(videoElement);
                document.getElementById("video-js").appendChild(source);
                var video = videojs('video-js');
                //video.src({ type: type, src: url });
                video.ready(function () {
                    video.src({ type: type, src: url });
                });
            }
            if (type == "audio/mpeg" || type =="audio/wav") {
                //var script = document.createElement("script");
                //script.src = "video.js";
                //script.type = "text/javascript";
                var source = document.createElement("source");
                source.setAttribute("src", url);
                source.setAttribute("type", type);

                //document.getElementById("container").appendChild(script);
                var videoElement = document.createElement("audio");
                videoElement.setAttribute("controls", "");
                videoElement.setAttribute("autoplay", "");
                videoElement.setAttribute("muted", "");
                videoElement.setAttribute("class", "video-js vjs-default-skin");
                videoElement.setAttribute("id", "video-js");

                //videoElement.setAttribute("src", url);
                //videoElement.setAttribute("type", type);
                document.getElementById("container").appendChild(videoElement);
                document.getElementById("video-js").appendChild(source);
       
            }

        }
    }

    function insereLi(channels) {
        try {
            //var lis = document.querySelectorAll('#listchanenels');
            //for (var i = 0; li = lis[i]; i++) {
            //    li.parentNode.removeChild(li);
            //}
            document.getElementById("listchannels").innerHTML = "";
            console.log("Limpou o LI")
        } catch {
            console.log("o LI estava limpo!")
        }
        channels.forEach(function (item, index) {
            console.log(item.name);
            var ul = document.getElementById('listchannels');
            var newEl = document.createElement('li');
            var newImg = document.createElement('img');
            var newA = document.createElement('a'); 
            var newText = document.createTextNode(item.name)
            
            newImg.setAttribute("class", "logo");
            // newImg.setAttribute("src", item.img); 
            newImg.setAttribute("src",item.img)
            newA.setAttribute("nonce", item.url);
            newA.setAttribute("type", item.type);
            newA.setAttribute("href", "#");
            newA.setAttribute("id", "playChannel");
            newA.appendChild(newText); 
            newA.appendChild(newImg);
            newEl.appendChild(newA);
            ul.appendChild(newEl);
        });

        document.querySelectorAll("a").forEach(function (button) {

            button.addEventListener("click", function (event) {
                const el = event.target || event.srcElement;
                const nonce = el.nonce;
                const type = el.type;
                console.log(nonce);
                onChange(nonce, type);
            });

        });
    }
}

Wecom.iptv.prototype = innovaphone.ui1.nodePrototype;
