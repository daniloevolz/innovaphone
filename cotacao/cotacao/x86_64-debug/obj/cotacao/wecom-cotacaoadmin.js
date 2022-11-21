
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.cotacaoAdmin = Wecom.cotacaoAdmin || function (start, args) {
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

    var texts = new innovaphone.lib1.Languages(Wecom.cotacaoTexts, start.lang);

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    //Título
    var labelTitulo = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("labelTituloAdmin")));

    //B3
    var labelB3 = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:10%; font-size:17px; text-align:center; font-weight: bold", texts.text("labelB3Admin")))
    var labelChkB3 = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:50%; top:15%; font-size:15px; text-align:right", texts.text("labelCheckLink")));

    var labelURLB3 = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:50%; top:20%; font-size:15px; text-align:right", texts.text("labelURLb3")));
    var iptUrlB3 = that.add(new innovaphone.ui1.Input("position:absolute; left:50%; width:30%; top:20%; font-size:12px; text-align:center", null, texts.text("urlText"), 255, "url", null));
    iptUrlB3.setAttribute("id","inputB3")
   that.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:30%; top:25%; font-size:12px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
    app.send({ api: "admin", mt: "UpdateConfig", prt: "urlb3", vl: String(iptUrlB3.getValue()) });
});
   
    
    // Todas as Fontes
    var labelTodasFontes = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:40%; font-size:17px; text-align:center; font-weight: bold", texts.text("labelTodasFontes")));
    var labelChk = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:50%; top:45%; font-size:15px; text-align:right", texts.text("labelCheckLink")));
  
    var labelURLTodas = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:50%; top:50%; font-size:15px; text-align:right", texts.text("labelURLTodas")));
    var iptUrlTodas = that.add(new innovaphone.ui1.Input("position:absolute; left:50%; width:30%; top:50%; font-size:12px; text-align:center", null, texts.text("urlText"), 255, "url", null));

    that.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:30%; top:55%; font-size:12px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
        app.send({ api: "admin", mt: "UpdateConfig", prt: "urltodas", vl: String(iptUrlTodas.getValue()) });
    });
    
    // Dados do BCB
    var labelBCB = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:70%; font-size:17px; text-align:center; font-weight: bold", texts.text("labelBCB")));
    var labelChk = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:50%; top:75%; font-size:15px; text-align:right", texts.text("labelCheckLink")));
  
    var labelURLBCB = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:50%; top:80%; font-size:15px; text-align:right", texts.text("labelURLBCB")));
    var iptUrlBCB = that.add(new innovaphone.ui1.Input("position:absolute; left:50%; width:30%; top:80%; font-size:12px; text-align:center", null, texts.text("urlText"), 255, "url", null));

    that.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:30%; top:85%; font-size:12px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
        app.send({ api: "admin", mt: "UpdateConfig", prt: "urlbcb", vl: String(iptUrlBCB.getValue()) });
    });
    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "admin", mt: "AdminMessage" });
    }

    function app_message(obj) {
        if (obj.api == "admin" && obj.mt == "AdminMessageResult") {
            iptUrlB3.setValue(obj.urlb3);
            iptUrlTodas.setValue(obj.urltodas);
            iptUrlBCB.setValue(obj.urlbcb);

        }
    }
}

Wecom.cotacaoAdmin.prototype = innovaphone.ui1.nodePrototype;
