
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.wecall = Wecom.wecall || function (start, args) {
    this.createNode("body");
    var that = this;
    var rcc = null;
    var userUI = null;
    var phoneApi = start.consumeApi("com.innovaphone.phone");
    var phoneinfoApi = start.provideApi("com.innovaphone.phoneinfo");

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
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    function app_connected(domain, user, dn, appdomain) {
        userUI = user;
        if (app.logindata.info.unlicensed) {
            //sem licen�a
            var counter = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:calc(5% - 15px); font-size:30px; text-align:center", texts.text("licText")));
            that.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:30%; top:calc(15% - 6px); font-size:12px; text-align:center", null, "button")).addTranslation(texts, "licContinue").addEvent("click", function () {
                app.send({ api: "user", mt: "UserMessage" });
            });

        } else {

            app.send({ api: "user", mt: "UserMessage" });
        }
        
    }

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
            if (obj.src == "") {
                var urlPortal = that.add(new innovaphone.ui1.Input("position:absolute; left:35%; width:30%; top:calc(5% - 6px); font-size:12px; text-align:center", null, texts.text("urlText"), 255, "url", "btn btn - save btn - lg"));
                that.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:30%; top:calc(15% - 6px); font-size:12px; text-align:center", null, "button")).addTranslation(texts, "salvarClose").addEvent("click", function () {
                    urlPortal = urlPortal.getValue();
                    if (urlPortal.length > 1) {
                        app.send({ api: "user", mt: "AddMessage", url: String(urlPortal) });
                    }
                });
            } else {
                var bodyIframe = that.add(new innovaphone.ui1.Node("iframe", "position:fixed; top:0px; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;", null, "iframebody"));
                bodyIframe.setAttribute("src", obj.src);
            } 
        }
        if (obj.api == "user" && obj.mt == "MakeCall") {
            console.warn("::MakeCall::");
            phoneApi.send({ mt: "StartCall", num: String(obj.num) });
        }
        if (obj.api == "user" && obj.mt == "DisconnectCall") {
            console.warn("::DisconnectCall::");
            phoneApi.send({ mt: "DisconnectCall" });
        }
        if (obj.api == "user" && obj.mt == "IncrementBadge") {
            console.warn("::IncrementBadge::");
            app.send({ api: "user", mt: "IncrementCount" });
        }
        if (obj.api == "user" && obj.mt == "DeleteBadge") {
            console.warn("::DeleteBadge::");
            app.send({ api: "user", mt: "DeleteBadge" });
        }
    }
    phoneApi.onupdate.attach(function (sender, type) {
        Object.keys(sender.model).forEach(function (key) {
            var provider = sender.model[key];
            if (provider.model.calls) {
                provider.model.calls.forEach(function (call) {
                    console.warn("::phoneapionupdate:: Direction=" + String(call.dir) + " State=" + String(call.state) + " Numero=" + String(call.num));
                });
            }
        });
    });
}

Wecom.wecall.prototype = innovaphone.ui1.nodePrototype;
