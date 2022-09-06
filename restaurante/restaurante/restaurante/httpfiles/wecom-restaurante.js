
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.restaurante = Wecom.restaurante || function (start, args) {
    this.createNode("body");
    var that = this;

    var colorSchemes = {
        dark: {
            "--bg": "#191919",
            "--button": "#303030",
            "--text-standard": "#4a4a49",
        },
        light: {
            "--bg": "white",
            "--button": "#e0e0e0",
            "--text-standard": "#4a4a49",
        }
    };
    var schemes = new innovaphone.ui1.CssVariables(colorSchemes, start.scheme);
    start.onschemechanged.attach(function () { schemes.activate(start.scheme) });

    var texts = new innovaphone.lib1.Languages(Wecom.restauranteTexts, start.lang);
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
    
    // Modal JS Edição Pietro
  
var modal = document.getElementById("myModal");

// botão que abre o modal
var btn = document.getElementById("myBtn");

// botão que fecha o modal
var span = document.getElementsByClassName("close")[0];

// clicar e abrir o modal
btn.onclick = function() {
  modal.style.display = "block";
}

// clicar e fechar o modal
span.onclick = function() {
  modal.style.display = "none";
}

// clicar fora do modal e fechar ele 
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
}

Wecom.restaurante.prototype = innovaphone.ui1.nodePrototype;
