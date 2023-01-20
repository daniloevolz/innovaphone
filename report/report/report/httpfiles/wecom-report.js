
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.report = Wecom.report || function (start, args) {
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

    var texts = new innovaphone.lib1.Languages(Wecom.reportTexts, start.lang);
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
            constructor();
        }
    }
    function constructor(){
        that.clear();
        var colEsquerda = that.add(new innovaphone.ui1.Div(null,null,"colunaesquerda"));
        var divreport = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; border-bottom: 1px solid #4b545c; border-width: 100%; height: 10%; width: 100%; background-color: #02163F;  display: flex; align-items: center;",null,null));
        var imglogo = divreport.add(new innovaphone.ui1.Node("img","max-height: 33px; opacity: 0.8;",null,null));
        imglogo.setAttribute("src","logo-wecom.png");
        var spanreport = divreport.add(new innovaphone.ui1.Div("font-size: 1.25rem; color:white; margin : 5px;",texts.text("labelNameApp"),null));
        var user = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; height: 10%; top: 10%; width: 100%; align-items: center; display: flex; border-bottom: 1px solid #4b545c"));
        var imguser = user.add(new innovaphone.ui1.Node("img","max-height: 33px;",null,null));
        imguser.setAttribute("src","icon-user.png");
        var username = user.add(new innovaphone.ui1.Node("span","font-size: 1.25rem; color:white; margin: 5px;","Nome do usuário",null));
        
        var relatorios = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 24%; height: 40%;"));
        var prelatorios = relatorios.add(new innovaphone.ui1.Node("p","text-align: center; font-size: 20px;",texts.text("labelRelatórios") ,null));
        var br = relatorios.add(new innovaphone.ui1.Node("br",null,null,null));

            var lirelatorios1 = relatorios.add(new innovaphone.ui1.Node("li","opacity: 0.9",null,"liOptions"))
            var lirelatorios2 = relatorios.add(new innovaphone.ui1.Node("li","opacity: 0.9",null,"liOptions"))
            var lirelatorios3 = relatorios.add(new innovaphone.ui1.Node("li","opacity: 0.9",null,"liOptions"))
            var lirelatorios4 = relatorios.add(new innovaphone.ui1.Node("li","opacity: 0.9",null,"liOptions"))
            var Arelatorios1 = lirelatorios1.add(new innovaphone.ui1.Node("a",null,texts.text("labelTotalPeríodo"),null));
            Arelatorios1.setAttribute("id","TTP");
            var Arelatorios2 = lirelatorios2.add(new innovaphone.ui1.Node("a",null,texts.text("labelDetalhadoPeríodo"),null));
            Arelatorios2.setAttribute("id","DTP")
            var Arelatorios3 = lirelatorios3.add(new innovaphone.ui1.Node("a",null,texts.text("labelDetalhadoRamal"),null));
            Arelatorios3.setAttribute("id","DTR")
            var Arelatorios4 = lirelatorios4.add(new innovaphone.ui1.Node("a",null,texts.text("labelTotalRamal"),null));
            Arelatorios4.setAttribute("id","TTR")
        
        var divother = colEsquerda.add(new innovaphone.ui1.Div("text-align: left; position: absolute; top:59%;",null,null));
        var divother2 = divother.add(new innovaphone.ui1.Div(null,null,"otherli"));

        var config = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 62%;",null,null));
        var liconfig = config.add(new innovaphone.ui1.Node("li","display:flex; aligns-items: center",null,"config"));
        
        var imgconfig = liconfig.add(new innovaphone.ui1.Node("img","max-height: 30px; opacity: 0.9; margin: 5px; ",null,null));
        imgconfig.setAttribute("src","config-icon.png");
        var Aconfig = liconfig.add(new innovaphone.ui1.Node("a","display: flex; align-items: center; justify-content: center;",texts.text("labelConfig"),null));
        Aconfig.setAttribute("href","#")


    }

}

Wecom.report.prototype = innovaphone.ui1.nodePrototype;
