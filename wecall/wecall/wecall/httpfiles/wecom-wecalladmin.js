
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />
/// <reference path="../../web1/ui1.switch/innovaphone.ui1.switch.js" />

var Wecom = Wecom || {};
Wecom.wecallAdmin = Wecom.wecallAdmin || function (start, args) {
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

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    //Título
    var labelTitulo = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("labelTituloAdmin")));

    //CallList
    var labelCallList = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:10%; font-size:15px; text-align:center", texts.text("labelCallListAdmin")));
    var labelChkCallList = that.add(new innovaphone.ui1.Div("position:absolute; left:30%; width:30%; top:15%; font-size:15px; text-align:right", texts.text("labelChkCallList")));
    var switchCallList = that.add(new innovaphone.ui1.Switch("position:absolute; left:60%; top:15%;"));
    switchCallList.addEvent("click", onCallListSwitchCLick);

    var labelURLCallList = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:20%; top:20%; font-size:15px; text-align:right", texts.text("labelURLCallList")));
    var iptUrlCallList = that.add(new innovaphone.ui1.Input("position:absolute; left:30%; width:20%; top:20%; font-size:12px; text-align:center", null, texts.text("urlText"), 255, "url", null));

    that.add(new innovaphone.ui1.Div("position:absolute; left:61%; width:15%; top:20%; font-size:12px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
        app.send({ api: "admin", mt: "UpdateConfig", prt: "urlCallHistory", vl: String(iptUrlCallList.getValue()) });
    });



    //PhoneApi
    var labelPhoneApi = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:35%; font-size:15px; text-align:center", texts.text("labelPhoneApiAdmin")));
    var labelChkPhoneApi = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:50%; top:40%; font-size:15px; text-align:right", texts.text("labelChkPhoneApi")));
    var switchPhoneApi = that.add(new innovaphone.ui1.Switch("position:absolute; left:50%; top:40%;"));
    switchPhoneApi.addEvent("click", onPhoneApiSwitchCLick);

    var labelURLPhoneApi = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:30%; top:45%; font-size:15px; text-align:right", texts.text("labelURLPhoneApi")));
    var iptUrlPhoneApi = that.add(new innovaphone.ui1.Input("position:absolute; left:30%; width:30%; top:45%; font-size:12px; text-align:center", null, texts.text("urlText"), 255, "url", null));

    that.add(new innovaphone.ui1.Div("position:absolute; left:61%; width:15%; top:45%; font-size:12px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
        app.send({ api: "admin", mt: "UpdateConfig", prt: "urlPhoneApiEvents", vl: String(iptUrlPhoneApi.getValue())});
    });

    //URL Dashboard
    var labelUrlDashTitulo = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:65%; font-size:15px; text-align:center", texts.text("labelUrlDash")));
    var labelUrlDash = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:30%; top:70%; font-size:15px; text-align:right", texts.text("labelUrlDash")));
    var iptUrlDash = that.add(new innovaphone.ui1.Input("position:absolute; left:30%; width:30%; top:70%; font-size:12px; text-align:center", null, texts.text("urlText"), 255, "url", null));

    that.add(new innovaphone.ui1.Div("position:absolute; left:61%; width:15%; top:70%; font-size:12px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
        app.send({ api: "admin", mt: "UpdateConfig", prt: "urlDashboard", vl: String(iptUrlDash.getValue()) });
    });

    //URL SSO
    var labelUrlSSOTitulo = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:80%; font-size:15px; text-align:center", texts.text("labelUrlSSO")));
    var labelUrlSSO = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:30%; top:85%; font-size:15px; text-align:right", texts.text("labelUrlSSO")));
    var iptUrlSSO = that.add(new innovaphone.ui1.Input("position:absolute; left:30%; width:30%; top:85%; font-size:12px; text-align:center", null, texts.text("urlText"), 255, "url", null));

    that.add(new innovaphone.ui1.Div("position:absolute; left:61%; width:15%; top:85%; font-size:12px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
        app.send({ api: "admin", mt: "UpdateConfig", prt: "urlSSO", vl: String(iptUrlSSO.getValue()) });
    });

    //Código Cliente
    var labelCodClient = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:20%; top:90%; font-size:15px; text-align:center", texts.text("labelCodCient")));
    var iptCodClient = that.add(new innovaphone.ui1.Input("position:absolute; left:20%; width:20%; top:90%; font-size:12px; text-align:center", null, texts.text("urlText"), 255, "url", null));
    that.add(new innovaphone.ui1.Div("position:absolute; left:61%; width:15%; top:90%; height:auto; font-size:12px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
        app.send({ api: "admin", mt: "UpdateConfig", prt: "CodClient", vl: String(ipturl.getValue()) });
    });
    //URL Autenticação SSO
    var labelUrl = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:20%; top:95%; font-size:15px; text-align:center", texts.text("labelUrl")));
    var ipturl = that.add(new innovaphone.ui1.Input("position:absolute; left:30%; width:30%; top:95%; font-size:12px; text-align:center", null, texts.text("urlText"), 255, "url", null));
    that.add(new innovaphone.ui1.Div("position:absolute; left:61%; width:15%; top:95%; height:auto; font-size:12px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
        app.send({ api: "admin", mt: "UpdateConfig", prt: "Url", vl: String(ipturl.getValue()) });
    });



    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "admin", mt: "AdminMessage" });
    }

    function app_message(obj) {
        if (obj.api == "admin" && obj.mt == "UpdateConfigResult") {
            iptUrlCallList.setValue(obj.urlH);
            iptUrlPhoneApi.setValue(obj.urlP);
            switchCallList.setValue(obj.sH);
            switchPhoneApi.setValue(obj.sP);
            iptUrlDash.setValue(obj.urlD);
            iptUrlSSO.setValue(obj.urlSSO);
            iptCodClient.setValue(obj.CodCli);
            ipturl.setValue(obj.url);

        }
    }
    function onPhoneApiSwitchCLick() {

        var state = switchPhoneApi.getValue();
            //e.currentTarget.state;
        app.send({ api: "admin", mt: "UpdateConfig", prt: "sendCallEvents", vl: state });
    }
    function onCallListSwitchCLick() {
        var state = switchCallList.getValue();
            //e.currentTarget.state;
        app.send({ api: "admin", mt: "UpdateConfig", prt: "sendCallHistory", vl: state });
    }
}

Wecom.wecallAdmin.prototype = innovaphone.ui1.nodePrototype;
