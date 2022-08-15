
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


    function insertChannel() {
        var nameVideo = document.getElementById("nomeVideo").value;
        var urlVideo = document.getElementById("urlVideo").value;
        var urlLogo = document.getElementById("urlImg").value;
        var typeVideo = document.getElementById("selectType").value;
        console.log(nameVideo);
        if (nameVideo.length > 1 && urlVideo.length > 1 && urlLogo.length > 1) {
            app.send({ api: "channel", mt: "AddChannelMessage", name: String(nameVideo), url: String(urlVideo), img: String(urlLogo), type: String(typeVideo) });
        }
    }

    

    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "user", mt: "UserMessage" });
        app.send({ api: "channel", mt: "SelectChannelMessage" });
    }

    function app_message(obj) {
        console.log(obj);
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
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

    const myInterval = window.setInterval(function () {
        getChannels();
    }, 60000);

    function getChannels() {
        app.send({ api: "channel", mt: "SelectChannelMessage" });
    }

    function onChange(url, type) {
        var video = videojs('hls-example');
        document.getElementById('hls-source').src = url;
        document.getElementById('hls-source').type = type;
        video.src({ type: type, src: url });
        video.ready(function () {
            video.play();
        });
       
    }

    function insereLi(channels) {
        try {
            var lis = document.querySelectorAll('#playChannel');
            for (var i = 0; li = lis[i]; i++) {
                li.parentNode.removeChild(li);
            }
            console.log("Limpou o LI")
        } catch {
            console.log("o LI estava limpo!")
        }
        channels.forEach(function (item, index) {
            console.log(item.name);
            var ul = document.getElementById('listchanenels');
            var newEl = document.createElement('li');
            var newImg = document.createElement('img');
            var newA = document.createElement('a'); //a tag <a> que faltava
            var newText = document.createTextNode(item.name);
            //var position = document.getElementsByTagName('ul')[0];
            //os atributos do <a>
            newImg.setAttribute("class", "logo");
            newImg.setAttribute("src", item.img);
            newA.setAttribute("nonce", item.url);
            newA.setAttribute("sourceType", item.type);
            newA.setAttribute("href", "#");
            newA.setAttribute("id", "playChannel");
            newA.appendChild(newText); //colocar o texto no <a>
            newEl.appendChild(newA);
            newEl.appendChild(newImg);//e o <a> dentro do <li>
            ul.appendChild(newEl);
            //ul.appendChild(newImg);
        });

        document.querySelectorAll("a").forEach(function (button) {

            button.addEventListener("click", function (event) {
                const el = event.target || event.srcElement;
                const nonce = el.nonce;
                const type = el.sourceType;
                console.log(nonce);
                onChange(nonce, type);
            });

        });
    }
}

Wecom.iptv.prototype = innovaphone.ui1.nodePrototype;
