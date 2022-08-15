
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.iptvAdmin = Wecom.iptvAdmin || function (start, args) {
    this.createNode("body");
    var that = this;

    var colorSchemes = {
        dark: {
            "--bg": "#191919",
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

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    var elcloseModal = document.getElementById("closeModal");
    elcloseModal.addEventListener("click", function () { closeModal() }, false);

    var elCancelModal = document.getElementById("cancelModal");
    elCancelModal.addEventListener("click", function () { closeModal() }, false);

    var elSalvarCloseModal = document.getElementById("salvarCloseModal");
    elSalvarCloseModal.addEventListener("click", function () { insertChannel() }, false);

    var elAddVideoModal = document.getElementById("newVideoModal");
    elAddVideoModal.addEventListener("click", function () { newVideoModal() }, false);

    var elDelVideoModal = document.getElementById("deleteVideo");
    elDelVideoModal.addEventListener("click", function () { deleteChannel() }, false);

    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "admin", mt: "AdminMessage" });
        app.send({ api: "channel", mt: "SelectChannelMessage" });
    }

    function app_message(obj) {
        if (obj.api == "admin" && obj.mt == "AdminMessageResult") {
        }
        if (obj.api == "channel" && obj.mt == "ChannelMessageError") {
            console.log(obj.result);
        }
        if (obj.api == "channel" && obj.mt == "SelectChannelMessageResultSuccess") {
            console.log(obj.mt);
            var channels = JSON.parse(obj.result);

            insereTd(channels);

        }
        if (obj.api == "channel" && obj.mt == "InsertChannelMessageSucess") {
            closeModal();
            getChannels();
        }
        if (obj.api == "channel" && obj.mt == "DeleteChannelMessageResultSuccess") {
            getChannels();
        }
    }
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

    function deleteChannel() {
        //var idVideo = document.getElementById("idVideo").value;
        var checkedValue = null;
        var inputElements = document.getElementsByClassName('checkChannels');
        for (var i = 0; inputElements[i]; ++i) {
            if (inputElements[i].checked) {
                checkedValue = inputElements[i].value;
                console.log(checkedValue);
                app.send({ api: "channel", mt: "DeleteChannelMessage", id: checkedValue });
                break;
            }
        }

        
    }

    function getChannels() {
        app.send({ api: "channel", mt: "SelectChannelMessage" });
    }

    function newVideoModal(e) {
        const modalNewVideo = document.querySelector('.modal');
        modalNewVideo.classList.add('visivel');

    }

    function closeModal(e) {
        console.log('function closemodal.');
        const modalNewVideo = document.querySelector('.modal');
        modalNewVideo.classList.remove('visivel');
    }

    function insereTd(data) {
        try {
            var lis = document.querySelectorAll('#channelLine');
            for (var i = 0; li = lis[i]; i++) {
                li.parentNode.removeChild(li);
            }
            console.log("Limpou o Td")
        } catch {
            console.log("o Td estava limpo!")
        }

        var table = document.getElementById('tableChannels');
        data.forEach(function (object) {
            var tr = document.createElement('tr');
            tr.setAttribute('id', 'channelLine');
            tr.innerHTML = '<td><input type="checkbox" id="checkChannels" class="checkChannels" value="' + object.id + '"></td>' +
                '<td>' + object.name + '</td>' +
                '<td>' + object.type + '</td>' +
                '<td>' + object.url + '</td>' +
                '<td><img id="imglogo" class="logo" src="' + object.img + '"></td>';
            table.appendChild(tr);
        });
    }
}

Wecom.iptvAdmin.prototype = innovaphone.ui1.nodePrototype;
