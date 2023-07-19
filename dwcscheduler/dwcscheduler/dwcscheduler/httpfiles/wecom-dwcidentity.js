
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />
/// <reference path="../../web1/ui1.switch/innovaphone.ui1.switch.js" />
/// <reference path="../../web1/ui1.popup/innovaphone.ui1.popup.js" />
/// <reference path="../../web1/ui1.listview/innovaphone.ui1.listview.js" />

var Wecom = Wecom || {};
Wecom.dwcidentity = Wecom.dwcidentity || function (start, args) {
    this.createNode("body");
    var that = this;



    var phoneApi = start.consumeApi("com.innovaphone.phone");
    var calllistApi = start.consumeApi("com.innovaphone.calllist");
    calllistApi.send({ mt: "Subscribe", count: 1 }, "*");
    calllistApi.onmessage.attach(calllistonmessage);



    var colorSchemes = {
        dark: {
            "--bg": "url(bg.png)",
            "--button": "#303030",
            "--text-standard": "#f2f5f6",
        },
        light: {
            "--bg": "url(bg.png)",
            "--button": "#e0e0e0",
            "--text-standard": "#4a4a49",
        }
    };
    var schemes = new innovaphone.ui1.CssVariables(colorSchemes, start.scheme);
    start.onschemechanged.attach(function () { schemes.activate(start.scheme) });

    var texts = new innovaphone.lib1.Languages(Wecom.dwcschedulerTexts, start.lang);
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;
    app.onclosed = waitConnection(that);
    app.onerror = waitConnection(that);
    var _colDireita;

    var list_configs = [];
    var list_rooms = [];
    var dwcCaller;
    var dwcLocation;

    var phoneApi;
    var searchApi;


    function app_connected(domain, user, dn, appdomain) {

        app.send({ api: "user", mt: "UserMessage" });
        searchApi = start.provideApi("com.innovaphone.search");
        searchApi.onmessage.attach(onSearchApiMessage);
        // start consume Phone API when AppWebsocket is connected
        phoneApi = start.consumeApi("com.innovaphone.phone");
        if (phoneApi) {
            phoneApi.onupdate.attach(onPhoneApiUpdate);
        }
    }

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "NoLicense") {
            console.log(obj.result);
            makeDivNoLicense(obj.result);
        }
        if (obj.api == "user" && obj.mt == "DWCCallRequest") {
            dwcCaller = obj.caller;
            dwcLocation = obj.location;
        }
    }
    
    function waitConnection(t) {
        t.clear();
        var bodywait = new innovaphone.ui1.Div("height: 100%; width: 100%; display: inline-flex; position: absolute;justify-content: center; background-color:rgba(100,100,100,0.5)", null, "bodywaitconnection")
        bodywait.addHTML('<svg class="pl" viewBox="0 0 128 128" width="128px" height="128px" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="hsl(193,90%,55%)" /><stop offset="100%" stop-color="hsl(223,90%,55%)" /></linearGradient></defs>	<circle class="pl__ring" r="56" cx="64" cy="64" fill="none" stroke="hsla(0,10%,10%,0.1)" stroke-width="16" stroke-linecap="round" />	<path class="pl__worm" d="M92,15.492S78.194,4.967,66.743,16.887c-17.231,17.938-28.26,96.974-28.26,96.974L119.85,59.892l-99-31.588,57.528,89.832L97.8,19.349,13.636,88.51l89.012,16.015S81.908,38.332,66.1,22.337C50.114,6.156,36,15.492,36,15.492a56,56,0,1,0,56,0Z" fill="none" stroke="url(#pl-grad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="44 1111" stroke-dashoffset="10" /></svg >');
        t.add(bodywait);
    }
    function makeDivNoLicense(msg) {
        that.clear();
        //Titulo 
        that.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:100%; top:40%; font-size:18px; text-align:center; font-weight: bold; color: darkblue;", msg));

    }
    
    // callback function called upon events in the phone app
    function onPhoneApiUpdate(arg0) {
        const provider = arg0.defaultApiProvider;
        const calls = arg0.model[provider].model.calls;
        calls.forEach(function (call) {
            if (call.sip == "extern-web") {
                if (dwcCaller.length > 1 && dwcLocation.length < 1) {
                    phoneApi.send({ mt: "CallInfo", id: call.id, html: "<div style=' width: 100%; left: 0%; text-align: center;;background:darkblue;color:white;font-size:20px'>Cliente: " + decodeURIComponent(dwcCaller) + "</div>" });
                } else if (dwcCaller.length > 1 && dwcLocation.length > 1) {
                    phoneApi.send({ mt: "CallInfo", id: call.id, html: "<div style=' width: 100%; left: 0%; text-align: center;;background:darkblue;color:white;font-size:20px'>Cliente: " + decodeURIComponent(dwcCaller) + "</div><div style='top:40px; width: 100%; height: 100%; left: 0%; text-align: center;;background:darkblue;color:white;font-size:20px'><iframe src='" + dwcLocation + "' width='100%' height='100%' style='border:0;' allowfullscreen='' loading='lazy' referrerpolicy='no-referrer-when-downgrade'></iframe></div>" });
                } else if (dwcCaller.length < 1 && dwcLocation.length < 1) {
                    phoneApi.send({ mt: "CallInfo", id: call.id, html: "" });
                }

            } else {
                phoneApi.send({ mt: "CallInfo", id: call.id, html: "" });
            }
            if (call.state == "Connected") {
                dwcLocation = '';
                dwcCaller = '';
            }
        });
    }
    function onSearchApiMessage(consumer, obj) {
        console.log("onSearchApiMessage:obj " + JSON.stringify(obj));
        switch (obj.msg.mt) {
            case "Search":
                if (obj.msg.search == "Extern Web") {
                    obj.msg = "";
                    obj.msg = { mt: "SearchInfo", type: "contact", dn: dwcCaller, avatar: "danilo.volz", guid: "8e4b16d1-d798-40ba-9800-43ea0d9523a3", link: "users?id=danilo.volz@wecom.com.br", contact: { givenname: "Danilo", sn: "Volz", company: "", sip: ["danilo.volz@wecom.com.br"] }, pbx: "inn-lab-ipva", node: "root", template: "Config Admin" };
                    searchApi.send(obj);
                    obj.msg = "";
                    obj.msg = { mt: "SearchResult" };
                    searchApi.send(obj);
                }
                break;
        }
    }
    function calllistonmessage(consumer, obj) {
        if (obj.msg) {
            console.log("::calllistApi::onmessage() msg=" + JSON.stringify(obj.msg));
            //app.send({ api: "user", mt: "CallHistoryEvent", obj: JSON.stringify(obj.msg) });
        }
    }
}
Wecom.dwcidentity.prototype = innovaphone.ui1.nodePrototype;