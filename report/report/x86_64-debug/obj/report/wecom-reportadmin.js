
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.reportAdmin = Wecom.reportAdmin || function (start, args) {
    this.createNode("body");
    var that = this;

    var list_users = [];

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

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "admin", mt: "AdminMessage" });

    }

    function app_message(obj) {
        if (obj.api == "admin" && obj.mt == "AdminMessageResult") {
        }
        if (obj.api == "admin" && obj.mt == "TableUsersResult") {
            console.log(obj.result);
            list_users = [];
            list_users = JSON.parse(obj.result);
            MakeAdmin()
        }
    }
    function MakeAdmin(){
        that.clear();
        
        var divAdminPainel = that.add(new innovaphone.ui1.Div("width: 100%; text-align:center; top: 5%; position: absolute; font-size: 25px; ",texts.text("labelAdminPanel"),null))

        var btnDivAddUsers = that.add(new innovaphone.ui1.Div("position:absolute; color:white; top: 15%; width: 15%; left: 32%; text-align:center; background-color: #02163F;",null,"button-inn").addTranslation(texts,"btnAdd")).addEvent("click", function(){
            DivAddUsers()
        })
        // var btnDelUsers = that.add(new innovaphone.ui1.Div("position: absolute; color:white; top: 15%; width: 15%; left: 52%; text-align:center; background-color: #B0132B;",null,"button-inn").addTranslation(texts,"btnDel")).addEvent("click", function(){

        // })
       
    }
    function DivAddUsers(){
        that.clear();
        var divUser = that.add(new innovaphone.ui1.Div("position:absolute; top:5%; width:100%; text-align:center ; font-size:30px;",texts.text("labelUsers"),null))
        var iptUser = that.add(new innovaphone.ui1.Node("select", "position:absolute; left:35%; width:30%; top:15%; font-size:15px; text-align:center", null, null));
        iptUser.setAttribute("id", "selectUser");
        list_users.forEach(function (user) {
            iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.sip, null));
        })      
       that.add(new innovaphone.ui1.Div("position:absolute; left:30%; width:15%; top:25%; font-size:15px; background-color: #02163F; text-align:center", null, "button-inn")).addTranslation(texts, "btnAdd").addEvent("click", function () {
        // app.send({ api: "channel", mt: "AddChannelMessage", name: String(iptName.getValue()), url: String(iptUrl.getValue()), type: String(type), img: String(linkImg) });
            });
        //Botão Cancelar   
        that.add(new innovaphone.ui1.Div("position:absolute; left:52%; width:15%; top:25%; font-size:15px; text-align:center; background-color: #B0132B; ", null, "button-inn")).addTranslation(texts, "btnCancel").addEvent("click", function () {
            MakeAdmin();
            makeTableUsers();
        });
    }
}

Wecom.reportAdmin.prototype = innovaphone.ui1.nodePrototype;
