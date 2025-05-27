
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.gcalendarAdmin = Wecom.gcalendarAdmin || function (start, args) {
    this.createNode("body");
    var that = this;
    var clientId;
    var origins;
    var client_secret;

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

    var texts = new innovaphone.lib1.Languages(Wecom.gcalendarTexts, start.lang);

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "admin", mt: "AdminMessage" });
    }

    function app_message(obj) {
        if (obj.api == "admin" && obj.mt == "AdminMessageResult") {
            clientId = obj.client_id;
            origins = obj.javascript_origins;
            client_secret = obj.client_secret;
            createBody(that);
        }
        if (obj.api == "admin" && obj.mt == "UpdateClientIdResult") {
            createToast(texts.text("updated"))
        }
        if (obj.api == "admin" && obj.mt == "UpdateOriginsResult") {
            createToast(texts.text("updated"))
        }
    }

    function createBody(t) {
        var labelClientId = t.add(new innovaphone.ui1.Div("position:absolute; left:20%; width:15%; top:15%; font-size:15px; text-align:right", texts.text("labelClientId")));
        var iptClientId = t.add(new innovaphone.ui1.Input("position:absolute; left:36%; width:30%; top:15%; font-size:12px; text-align:center", clientId, texts.text("iptClientId"), 255, "text", null));

        t.add(new innovaphone.ui1.Div("position:absolute; left:80%; width:15%; top:15%; font-size:15px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
            app.send({ api: "admin", mt: "UpdateClientId", client_id: String(iptClientId.getValue()) });
        });

        var labelClientSecret = t.add(new innovaphone.ui1.Div("position:absolute; left:20%; width:15%; top:25%; font-size:15px; text-align:right", texts.text("labelClientSecret")));
        var iptClientSecret = t.add(new innovaphone.ui1.Input("position:absolute; left:36%; width:30%; top:25%; font-size:12px; text-align:center", client_secret, texts.text("iptClientSecret"), 255, "text", null));

        t.add(new innovaphone.ui1.Div("position:absolute; left:80%; width:15%; top:25%; font-size:15px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
            app.send({ api: "admin", mt: "UpdateClientSecret", client_secret: String(iptClientSecret.getValue()) });
        });
        var labeluri = t.add(new innovaphone.ui1.Div("position:absolute; left:20%; width:80%; top:35%; font-size:15px; text-align:left", texts.text("labelUri")));

        var labeluriVl = t.add(new innovaphone.ui1.Div("position:absolute; left:20%; width:80%; top:45%; font-size:15px; text-align:left", origins));


    }

    // Fun��o para criar um toast de notifica��o
    function createToast(message) {
        var toast = that.add(new innovaphone.ui1.Div(null, message, "toast show"));
        //var toast = document.createElement("div");
        toast.setAttribute("id","toast")

        // Definir o texto do toast
        //toast.innerHTML = message;

        // Adicionar a classe 'show' para mostrar o toast
        //toast.className = "toast show";

        // Remover o toast ap�s 15 segundos
        setTimeout(function () {
            document.getElementById('toast').remove();
        }, 5000); // 15 segundos
    }
}

Wecom.gcalendarAdmin.prototype = innovaphone.ui1.nodePrototype;
