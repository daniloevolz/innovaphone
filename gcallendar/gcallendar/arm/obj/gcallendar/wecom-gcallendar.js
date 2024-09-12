
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.gcallendar = Wecom.gcallendar || function (start, args) {
    this.createNode("body");
    var that = this;
    var clientId;
    var redirectUri
    var token;
    var guid;

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

    var texts = new innovaphone.lib1.Languages(Wecom.gcallendarTexts, start.lang);
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
            clientId = obj.client_id;
            redirectUri = obj.javascript_origins;
            guid = obj.guid;
            token = JSON.parse(obj.token);
            createBody(that);
        }
        if (obj.api == "user" && obj.mt == "UserDisconnectResult") {
            token = [];
            createBody(that);
            createToast(texts.text("updated"))
        }
    }
    function createBody(t) {
        t.clear();
        if (token.length != 0) {
            t.add(new innovaphone.ui1.Div("position:absolute; left:40%; width:20%; top:45%; font-size:15px; text-align:center", null, "button")).addTranslation(texts, "btnDisconnect").addEvent("click", function () {
                app.send({ api: "user", mt: "UserDisconnect" });
            });
        } else {
            t.add(new innovaphone.ui1.Div("position:absolute; left:40%; width:20%; top:45%; font-size:15px; text-align:center", null, "button")).addTranslation(texts, "btnConnect").addEvent("click", function () {
                openOAuthPopup();
            });
        }

    }
    // Função para abrir o popup do OAuth do Google
    function openOAuthPopup() {
        var scope = 'https://www.googleapis.com/auth/calendar.readonly';
        var responseType = 'code';
        var authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
            'scope=' + encodeURIComponent(scope) + '&' +
            'response_type=' + encodeURIComponent(responseType) + '&' +
            'redirect_uri=' + encodeURIComponent(redirectUri) + '&' +
            'client_id=' + encodeURIComponent(clientId) + '&' +
            'state=' + encodeURIComponent(guid) + '&' +
            'access_type=' + encodeURIComponent('offline') + '&' +
            'prompt=' + encodeURIComponent('consent');
        // Abrir o popup (tamanho e configuração do popup)
        var width = 600;
        var height = 600;
        var left = (screen.width / 2) - (width / 2);
        var top = (screen.height / 2) - (height / 2);
        window.open(authUrl, 'OAuthPopup', 'width=' + width + ',height=' + height + ',top=' + top + ',left=' + left);
    }
    // Função para criar um toast de notificação
    function createToast(message) {
        var toast = that.add(new innovaphone.ui1.Div(null, message, "toast show"));
        //var toast = document.createElement("div");
        toast.setAttribute("id", "toast")

        // Definir o texto do toast
        //toast.innerHTML = message;

        // Adicionar a classe 'show' para mostrar o toast
        //toast.className = "toast show";

        // Remover o toast após 15 segundos
        setTimeout(function () {
            document.getElementById('toast').remove();
        }, 5000); // 15 segundos
    }
}

Wecom.gcallendar.prototype = innovaphone.ui1.nodePrototype;
