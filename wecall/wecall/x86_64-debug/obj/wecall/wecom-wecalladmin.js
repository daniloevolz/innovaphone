
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
            "--bg": "url('bg.png')",
            "--button": "#c6c6c6",
            "--text-standard": "#004c84",
        },
        light: {
            "--bg": "url('bg.png')",
            "--button": "#c6c6c6",
            "--text-standard": "#004c84",
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
    var labelCallList = that.add(new innovaphone.ui1.Div("position: absolute;left: 0px;width: 100%; top: 10%; font-size: 15px; text-align: center; text-decoration: underline;color: blue;", texts.text("labelCallListAdmin")));
    var labelChkCallList = that.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:15%; font-size:15px; text-align:right", texts.text("labelChkCallList")));
    var switchCallList = that.add(new innovaphone.ui1.Switch("position:absolute; left:16%; top:15%;"));
    switchCallList.addEvent("click", onCallListSwitchCLick);

    var labelURLCallList = that.add(new innovaphone.ui1.Div("position:absolute; left:20%; width:15%; top:15%; font-size:15px; text-align:right", texts.text("labelURLCallList")));
    var iptUrlCallList = that.add(new innovaphone.ui1.Input("position:absolute; left:36%; width:30%; top:15%; font-size:12px; text-align:center", null, texts.text("urlText"), 255, "url", null));

    that.add(new innovaphone.ui1.Div("position:absolute; left:80%; width:15%; top:15%; font-size:15px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
        app.send({ api: "admin", mt: "UpdateConfig", prt: "urlCallHistory", vl: String(iptUrlCallList.getValue()) });
    });



    //RCC CallEvents
    var labelCallEvents = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:25%; font-size:15px; text-align:center;text-decoration: underline;color: blue;", texts.text("labelCallEventsAdmin")));
    var labelChkCallEvents = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:15%; top:30%; font-size:15px; text-align:right", texts.text("labelChkCallEvents")));
    var switchCallEvents = that.add(new innovaphone.ui1.Switch("position:absolute; left:16%; top:30%;"));
    switchCallEvents.addEvent("click", onCallEventsSwitchCLick);

    var labelURLCallEvents = that.add(new innovaphone.ui1.Div("position:absolute; left:20%; width:15%; top:30%; font-size:15px; text-align:right", texts.text("labelURLCallEvents")));
    var iptUrlCallEvents = that.add(new innovaphone.ui1.Input("position:absolute; left:36%; width:30%; top:30%; font-size:12px; text-align:center", null, texts.text("urlText"), 255, "url", null));

    that.add(new innovaphone.ui1.Div("position:absolute; left:80%; width:15%; top:30%; font-size:15px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
        app.send({ api: "admin", mt: "UpdateConfig", prt: "urlPhoneApiEvents", vl: String(iptUrlCallEvents.getValue())});
    });

    //URL Dashboard
    var labelUrlDashTitulo = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:40%; font-size:15px; text-align:center; text-decoration: underline;color: blue;", texts.text("labelUrlDashTitulo")));
    var labelUrlDash = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:15%; top:45%; font-size:15px; text-align:right", texts.text("labelUrlDash")));
    var iptUrlDash = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:45%; font-size:12px; text-align:center", null, texts.text("urlText"), 255, "url", null));

    that.add(new innovaphone.ui1.Div("position:absolute; left:80%; width:15%; top:45%; font-size:12px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
        app.send({ api: "admin", mt: "UpdateConfig", prt: "urlDashboard", vl: String(iptUrlDash.getValue()) });
    });

    //URL SSO
    var labelUrlSSOTitulo = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:55%; font-size:15px; text-align:center; text-decoration: underline;color: blue;", texts.text("labelUrlSSO")));
    var labelUrlSSO = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:15%; top:60%; font-size:15px; text-align:right", texts.text("labelUrlSSO")));
    var iptUrlSSO = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:60%; font-size:12px; text-align:center", null, texts.text("urlText"), 255, "url", null));

    that.add(new innovaphone.ui1.Div("position:absolute; left:80%; width:15%; top:60%; font-size:15px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
        app.send({ api: "admin", mt: "UpdateConfig", prt: "urlSSO", vl: String(iptUrlSSO.getValue()) });
    });

    //Código Cliente
    var labelCodClient = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:15%; top:65%; font-size:15px; text-align:right", texts.text("labelCodCient")));
    var iptCodClient = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:20%; top:65%; font-size:12px; text-align:center", null, texts.text("urlText"), 255, "url", null));
    that.add(new innovaphone.ui1.Div("position:absolute; left:61%; width:15%; top:65%; height:auto; font-size:15px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
        app.send({ api: "admin", mt: "UpdateConfig", prt: "CodClient", vl: String(iptCodClient.getValue()) });
    });
    //URL Autenticação SSO
    var labelUrl = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:15%; top:70%; font-size:15px; text-align:right", texts.text("labelUrl")));
    var ipturl = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:70%; font-size:12px; text-align:center", null, texts.text("urlText"), 255, "url", null));
    that.add(new innovaphone.ui1.Div("position:absolute; left:80%; width:15%; top:70%; height:auto; font-size:15px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
        app.send({ api: "admin", mt: "UpdateConfig", prt: "Url", vl: String(ipturl.getValue()) });
    });
    //URL Get Queue Groups Monitoring
    var labelUrl = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:15%; top:80%; font-size:15px; text-align:right", texts.text("labelUrlG")));
    var ipturlG = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:80%; font-size:12px; text-align:center", null, texts.text("urlText"), 255, "url", null));
    that.add(new innovaphone.ui1.Div("position:absolute; left:80%; width:15%; top:80%; height:auto; font-size:15px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
        app.send({ api: "admin", mt: "UpdateConfig", prt: "UrlG", vl: String(ipturlG.getValue()) });
    });

    //Código Sair de Todos os Grupos
    var labelCodLeaveGroups = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:15%; top:90%; font-size:15px; text-align:right", texts.text("labelCodLeaveGroups")));
    var iptCodLeaveGroups = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:20%; top:90%; font-size:12px; text-align:center", null, texts.text("urlText"), 255, "url", null));
    that.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:90%; height:auto; font-size:15px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
        app.send({ api: "admin", mt: "UpdateConfig", prt: "CodLeaveGroups", vl: String(iptCodLeaveGroups.getValue()) });
    });
    //Checkbox sair dos grupos ao entrar
    var labelChkLeaveGroupsStartup = that.add(new innovaphone.ui1.Div("position:absolute; left:70%; width:15%; top:90%; font-size:15px; text-align:right", texts.text("labelChkLeaveGroupsStartup")));
    var switchLeaveGroupsStartup = that.add(new innovaphone.ui1.Switch("position:absolute; left:90%; top:90%;"));
    switchLeaveGroupsStartup.addEvent("click", onLeaveGroupsStartupSwitchCLick);


    

    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "admin", mt: "AdminMessage" });
    }

    function app_message(obj) {
        if (obj.api == "admin" && obj.mt == "UpdateConfigResult") {
            iptUrlCallList.setValue(obj.urlH);
            iptUrlCallEvents.setValue(obj.urlP);
            switchCallList.setValue(obj.sH);
            switchCallEvents.setValue(obj.sP);
            iptUrlDash.setValue(obj.urlD);
            iptUrlSSO.setValue(obj.urlSSO);
            iptCodClient.setValue(obj.CodCli);
            ipturl.setValue(obj.url);
            ipturlG.setValue(obj.urlG);
            iptCodLeaveGroups.setValue(obj.CodLeave);
            switchLeaveGroupsStartup.setValue(obj.sLS)

        }
    }
    function onCallEventsSwitchCLick() {

        var state = switchCallEvents.getValue();
            //e.currentTarget.state;
        app.send({ api: "admin", mt: "UpdateConfig", prt: "sendCallEvents", vl: state });
    }
    function onLeaveGroupsStartupSwitchCLick() {

        var state = switchLeaveGroupsStartup.getValue();
        //e.currentTarget.state;
        app.send({ api: "admin", mt: "UpdateConfig", prt: "leaveGroupsStartup", vl: state });
    }
    function onCallListSwitchCLick() {
        var state = switchCallList.getValue();
            //e.currentTarget.state;
        app.send({ api: "admin", mt: "UpdateConfig", prt: "sendCallHistory", vl: state });
    }
}

Wecom.wecallAdmin.prototype = innovaphone.ui1.nodePrototype;
