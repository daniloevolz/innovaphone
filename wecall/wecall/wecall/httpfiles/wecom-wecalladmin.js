
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

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

    //var elSalvarCloseModal = document.getElementById("salvarClose");
    //elSalvarCloseModal.addEventListener("click", function () { insertUrl() }, false);


    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "admin", mt: "AdminMessage" });
    }

    function app_message(obj) {
        if (obj.api == "admin" && obj.mt == "AdminMessageResult") {
            if (obj.src == "") {
                var urlPortal = that.add(new innovaphone.ui1.Input("position:absolute; left:35%; width:30%; top:calc(5% - 6px); font-size:12px; text-align:center", null, texts.text("urlText"), 255, "url", "btn btn - save btn - lg"));
                that.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:30%; top:calc(15% - 6px); font-size:12px; text-align:center", null, "button")).addTranslation(texts, "salvarClose").addEvent("click", function () {
                    //var urlPortal = document.getElementById("urlPortal").value;
                    urlPortal = urlPortal.getValue();
                    if (urlPortal.length > 1) {
                        app.send({ api: "user", mt: "AddMessage", url: String(urlPortal) });
                    }
                });
                //document.getElementById('section1').style.display = 'block';
                //document.getElementById('section2').style.display = 'none';

            } else {
                var bodyIframe = that.add(new innovaphone.ui1.Node("iframe", "position:fixed; top:0px; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;", null, "iframebody"));
                bodyIframe.setAttribute("src", obj.src);
                //document.getElementById('section2').style.display = 'block';
                //document.getElementById('section1').style.display = 'none';
                //document.getElementById("iframebody").setAttribute("src", obj.src);
            }

        }
    }
    //function insertUrl() {
    //    var urlPortal = document.getElementById("urlPortal").value;
    //    if (urlPortal.length > 1) {
    //        app.send({ api: "admin", mt: "AddMessage", url: String(urlPortal) });
    //    }

    //}
}

Wecom.wecallAdmin.prototype = innovaphone.ui1.nodePrototype;
