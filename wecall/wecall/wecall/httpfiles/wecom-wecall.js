
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.wecall = Wecom.wecall || function (start, args) {
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

    var texts = new innovaphone.lib1.Languages(Wecom.wecallTexts, start.lang);
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    var elSalvarCloseModal = document.getElementById("salvarClose");
    elSalvarCloseModal.addEventListener("click", function () { insertUrl() }, false);


    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "user", mt: "UserMessage" });
    }

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
            if (obj.src == "") {
                document.getElementById('section1').style.display = 'block';
                document.getElementById('section2').style.display = 'none';

            } else {
                document.getElementById('section2').style.display = 'block';
                document.getElementById('section1').style.display = 'none';
                document.getElementById("iframebody").setAttribute("src", obj.src);
            }
            
        }
    }
    function insertUrl(){
        var urlPortal = document.getElementById("urlPortal").value;
        if (urlPortal.length > 1) {
            app.send({ api: "user", mt: "AddMessage", url: String(urlPortal) });
        }

    }
}

Wecom.wecall.prototype = innovaphone.ui1.nodePrototype;
