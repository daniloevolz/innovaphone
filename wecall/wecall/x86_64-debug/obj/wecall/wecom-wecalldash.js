
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.wecallDash = Wecom.wecallDash || function (start, args) {
    this.createNode("body");
    var that = this;
    var appdn = start.title;
    var UIuser;
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
    app.onerror = waitConnection;
    app.onclosed = waitConnection;

    //var elSalvarCloseModal = document.getElementById("salvarClose");
    //elSalvarCloseModal.addEventListener("click", function () { insertUrl() }, false);

    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "dash", mt: "DashURLMessage", app: appdn });
        UIuser = user;
    }

    function app_message(obj) {
        if (obj.api == "dash" && obj.mt == "NoLicense") {
            console.log(obj.result);
            makeDivNoLicense(obj.result);
        }
        if (obj.api == "dash" && obj.mt == "DashMessageResult") {
            if (obj.src=="[]") {
                that.clear();
                var urlPortal = new innovaphone.ui1.Input("position:absolute; left:35%; width:30%; top:calc(5% - 6px); font-size:12px; text-align:center", null, texts.text("urlText"), 255, "url", "btn btn - save btn - lg");
                that.add(urlPortal);
                that.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:30%; top:calc(15% - 6px); font-size:12px; text-align:center", null, "button")).addTranslation(texts, "salvarClose").addEvent("click", function () {
                    //var urlPortal = document.getElementById("urlPortal").value;
                    var valueUrlPortal = urlPortal.getValue();
                    if (valueUrlPortal.length > 1) {
                        app.send({ api: "dash", mt: "AddURLDashMessage", url: String(valueUrlPortal), sip: UIuser, app: start.title });
                        waitConnection();
                    }
                });
            } else {
                that.clear();
                var bodyIframe = that.add(new innovaphone.ui1.Node("iframe", "position:fixed; top:0px; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;", null, "iframebody"));
                var result = JSON.parse(obj.src)
                bodyIframe.setAttribute("src", result[0].url);
            }

        }
    }
    function waitConnection() {
        that.clear();
        var bodywait = new innovaphone.ui1.Div("height: 100%; width: 100%; display: inline-flex; position: absolute;justify-content: center; background-color:rgba(100,100,100,0.5)", null, "bodywaitconnection")
        bodywait.addHTML('<svg class="pl" viewBox="0 0 128 128" width="128px" height="128px" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="hsl(193,90%,55%)" /><stop offset="100%" stop-color="hsl(223,90%,55%)" /></linearGradient></defs>	<circle class="pl__ring" r="56" cx="64" cy="64" fill="none" stroke="hsla(0,10%,10%,0.1)" stroke-width="16" stroke-linecap="round" />	<path class="pl__worm" d="M92,15.492S78.194,4.967,66.743,16.887c-17.231,17.938-28.26,96.974-28.26,96.974L119.85,59.892l-99-31.588,57.528,89.832L97.8,19.349,13.636,88.51l89.012,16.015S81.908,38.332,66.1,22.337C50.114,6.156,36,15.492,36,15.492a56,56,0,1,0,56,0Z" fill="none" stroke="url(#pl-grad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="44 1111" stroke-dashoffset="10" /></svg >');
        that.add(bodywait);
    }
    function makeDivNoLicense(msg) {
        that.clear();
        //Titulo 
        that.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:100%; top:40%; font-size:18px; text-align:center; font-weight: bold; color: darkblue;", msg));

    }
}

Wecom.wecallDash.prototype = innovaphone.ui1.nodePrototype;
