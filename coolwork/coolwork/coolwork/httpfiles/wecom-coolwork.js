
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.coolwork = Wecom.coolwork || function (start, args) {
    this.createNode("body");
    var that = this;
    var phone_list = [];
    var avatar = start.consumeApi("com.innovaphone.avatar");


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
        var devicesApi = start.consumeApi("com.innovaphone.devices");
        devicesApi.onmessage.attach(devicesApi_onmessage); // onmessage is called for responses from the API
        devicesApi.send({ mt: "GetPhones" });
        avatar = new innovaphone.Avatar(start, user, domain);
        
    }

    function devicesApi_onmessage(conn, obj) {
        console.log("devicesApi_onmessage: " + JSON.stringify(obj));
        if (obj.msg.mt == "GetPhonesResult") {
            var devices = obj.msg.phones;
            console.log("devicesApi_onmessage:GetPhonesResult " + JSON.stringify(devices));
            app.send({api:"user", mt:"PhoneList", devices: devices})
        }
        
    }
    function app_message(obj) {
        if (obj.api === "user" && obj.mt === "PhoneListResult") {
            // placeholder for JsonApi handling
            console.log("app_message:PhoneListResult " + JSON.stringify(obj.result));
            phone_list = obj.result
            makePhoneButtons(phone_list)
        }

    }

    var colEsquerda = that.add(new innovaphone.ui1.Div(null,null,"colEsquerda"));
    colEsquerda.add(new innovaphone.ui1.Node("scroll-container",null,null,"scroll-container").setAttribute("id","scroll-phones"));

    var colDireita = that.add(new innovaphone.ui1.Div(null,null,"colDireita"));
    var divmain = colDireita.add(new innovaphone.ui1.Div("position:absolute;width:100%;height:100%;text-align:center;display:flex;justify-content:center;align-items:center",null,null).setAttribute("id","mainDiv"));
    divmain.add(new innovaphone.ui1.Node("span", "", "MAC do Telefone:", ""));
    var inputHW = divmain.add(new innovaphone.ui1.Node("input", "", "", ""));
    inputHW.setAttribute("id", "hwinput").setAttribute("type", "text");
    var loginButton = divmain.add(new innovaphone.ui1.Div(null, null, "button")
        .addText("Login")
        .addEvent("click", function () { app.send({ api: "user", mt: "LoginPhone", hw: inputHW.value }); }, loginButton));
    var logoutButton = divmain.add(new innovaphone.ui1.Div(null, null, "button")
        .addText("Logout")
        .addEvent("click", function () { app.send({ api: "user", mt: "LogoutPhone", hw: inputHW.value });}, logoutButton));

    function makePhoneButtons(obj){

        obj.forEach(function (phone) {
            var userPicture = avatar.url(phone.sip ,80)
            // console.log("SIP DO CARA" + phone.sip)
            var phoneHTML = `
            <div class="StatusPhone${phone.online} phoneButtons" id="${phone.hwId}">
            <div class="user-info">
                <img class="imgProfile" src="${userPicture}">
                <div class="user-name">${phone.cn}</div>
            </div>
            <div class="product-name">${phone.product}</div>
             </div>
            `;
            document.getElementById("scroll-phones").innerHTML += phoneHTML;
        });
    }
   

}

Wecom.coolwork.prototype = innovaphone.ui1.nodePrototype;
