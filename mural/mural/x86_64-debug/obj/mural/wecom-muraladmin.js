
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.muralAdmin = Wecom.muralAdmin || function (start, args) {
    this.createNode("body");
    var that = this;

    var list_users = [];
    var _colDireita;
    var UIuserPicture;
    var UIuser;
    var appdn = start.title;

    var colorSchemes = {
        dark: {
            "--bg": "url('./images/bg.png')",
            "--button": "#303030",
            "--text-standard": "#f2f5f6",
        },
        light: {
            "--bg": "url('./images/bg.png')",
            "--button": "#e0e0e0",
            "--text-standard": "#4a4a49",
        }
    };
    var schemes = new innovaphone.ui1.CssVariables(colorSchemes, start.scheme);
    start.onschemechanged.attach(function () { schemes.activate(start.scheme) });

    var texts = new innovaphone.lib1.Languages(Wecom.muralTexts, start.lang);

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;
    app.onclosed = waitConnection(that);
    app.onerror = waitConnection(that);


    waitConnection(that);

    function app_connected(domain, user, dn, appdomain) {
        //avatar
        avatar = new innovaphone.Avatar(start, user, domain);
        UIuserPicture = avatar.url(user, 80, dn);
        UIuser = dn;
        constructor();

        app.send({ api: "admin", mt: "TableUsers" });
    }

    function app_message(obj) {
        if (obj.api == "admin" && obj.mt == "TableUsersResult") {
            list_users = obj.result;
        }
    }

    function constructor() {
        that.clear();
        // col direita
        var colDireita = that.add(new innovaphone.ui1.Div(null, null, "colunadireita"));
        colDireita.setAttribute("id", "coldireita")
        //Título
        colDireita.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("labelTituloAdmin")));

        // col Esquerda
        var colEsquerda = that.add(new innovaphone.ui1.Div(null, null, "colunaesquerda"));
        colEsquerda.setAttribute("id", "colesquerda")

        var divreport = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; border-bottom: 1px solid #4b545c; border-width: 100%; height: 10%; width: 100%; background-color: #02163F;  display: flex; align-items: center;", null, null));
        var imglogo = divreport.add(new innovaphone.ui1.Node("img", "max-height: 33px; opacity: 0.8;", null, null));
        imglogo.setAttribute("src", "./images/logo-wecom.png");
        var spanreport = divreport.add(new innovaphone.ui1.Div("font-size: 1.00rem; color:white; margin : 5px;", appdn, null));
        var user = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; height: 10%; top: 10%; width: 100%; align-items: center; display: flex; border-bottom: 1px solid #4b545c"));
        var imguser = user.add(new innovaphone.ui1.Node("img", "max-height: 33px; border-radius: 50%;", null, null));
        imguser.setAttribute("src", UIuserPicture);
        var username = user.add(new innovaphone.ui1.Node("span", "font-size: 0.75rem; color:white; margin: 5px;", UIuser, null));
        username.setAttribute("id", "user")



        var divMenu = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 24%; height: 40%;"));
        divMenu.add(new innovaphone.ui1.Node("p", "text-align: center; font-size: 20px;", texts.text("labelAdmin"), null));
        divMenu.add(new innovaphone.ui1.Node("br", null, null, null));

        var li1 = new innovaphone.ui1.Node("li", "opacity: 0.9", new innovaphone.ui1.Node("a", null, texts.text("labelCfgUsers"), null).setAttribute("id", "CfgUsers"), "liOptions");
        divMenu.add(li1);
        var li2 = new innovaphone.ui1.Node("li", "opacity: 0.9", new innovaphone.ui1.Node("a", null, texts.text("labelCfgDepartments"), null).setAttribute("id", "CfgDepartments"), "liOptions");
        divMenu.add(li2);
        var li3 = new innovaphone.ui1.Node("li", "opacity: 0.9", new innovaphone.ui1.Node("a", null, texts.text("labelCfgSkills"), null).setAttribute("id", "CfgSkills"), "liOptions");
        divMenu.add(li3);


        colEsquerda.add(new innovaphone.ui1.Div("text-align: left; position: absolute; top:59%;", null, null).add(new innovaphone.ui1.Div(null, null, "otherli")));
        var config = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 90%;", null, null));
        var liconfig = config.add(new innovaphone.ui1.Node("li", "display:flex; aligns-items: center", null, "config"));
        liconfig.add(new innovaphone.ui1.Node("img", "width: 100%; opacity: 0.9; margin: 2px; ", null, null).setAttribute("src", "./images/logo.png"));

        _colDireita = colDireita;
    }

    function waitConnection(div) {
        div.clear();
        var div1 = div.add(new innovaphone.ui1.Div(null, null, "preloader").setAttribute("id","preloader"))
        var div2 = div1.add(new innovaphone.ui1.Div(null, null, "inner"))
        var div3 = div2.add(new innovaphone.ui1.Div(null, null, "loading"))
        div3.add(new innovaphone.ui1.Node("span", null, null, "circle"));
        div3.add(new innovaphone.ui1.Node("span", null, null, "circle"));
        div3.add(new innovaphone.ui1.Node("span", null, null, "circle"));
    }

}

Wecom.muralAdmin.prototype = innovaphone.ui1.nodePrototype;
