
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.coolwork = Wecom.coolwork || function (start, args) {
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

    var texts = new innovaphone.lib1.Languages(Wecom.coolworkTexts, start.lang);
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    function app_connected(domain, user, dn, appdomain) {
        
    }

    function app_message(obj) {
        if (obj.api === "user" && obj.mt === "UserMessageResult") {
            // placeholder for JsonApi handling
        }
    }
    var divmain = that.add(new innovaphone.ui1.Div("position:absolute;width:100%;height:100%;text-align:center;display:flex;justify-content:center;align-items:center",null,null))
    divmain.add(new innovaphone.ui1.Node("span", "", "MAC do Telefone:", ""));

    var inputHW = divmain.add(new innovaphone.ui1.Node("input", "", "", ""));
    inputHW.setAttribute("id", "hwinput").setAttribute("type", "text");

    var loginButton = divmain.add(new innovaphone.ui1.Div(null, null, "button")
        .addText("Login")
        .addEvent("click", function () { app.send({ api: "user", mt: "LoginPhone", hw: inputHW.value }); }, loginButton));
    var logoutButton = divmain.add(new innovaphone.ui1.Div(null, null, "button")
        .addText("Logout")
        .addEvent("click", function () { app.send({ api: "user", mt: "LogoutPhone", hw: inputHW.value });}, logoutButton));

}

Wecom.coolwork.prototype = innovaphone.ui1.nodePrototype;
