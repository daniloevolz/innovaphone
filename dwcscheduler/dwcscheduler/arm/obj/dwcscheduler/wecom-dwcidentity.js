
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
    app.onerror = function (error) {
        console.error("DwcIdentity: Appwebsocket.Connection error: " + error);
        changeState("Disconnected");
    };
    app.onclosed = function () {
        console.error("DwcIdentity: Appwebsocket.Connection closed!");
        changeState("Disconnected");
    };
    var currentState = "Loading";
    var _colDireita;

    var list_configs = [];
    var list_rooms = [];
    var dwcCaller;
    var dwcLocation;

    var phoneApi;
    var searchApi;



    var phonelookupApi = start.provideApi("com.innovaphone.phonelookup");

    phonelookupApi.onmessage.attach(function (sender, phonelookupApiRequest) {
        //Alterar o nome do Telefone pode ser feito consulta em CRM, ou DB para obter o nome que é desejado visualizar.

        // usually the requests should be queued and processed
        // one by one to avoid heavy load, also a local cache can be created
        // we forward them directly to app service to keep it simple

    //    var response = { mt: "LookupInfo", dn: undefined, link: undefined, contact: {}, photourl: undefined, adjust: true }; //adjust number by a trunk prefix
    //    response.dn = "SSSSSSSSSSSS";
    //    console.log("phonelookup:obj " + JSON.stringify(response));
    //    sender.send(response, phonelookupApiRequest.consumer, phonelookupApiRequest.src); // consumer and src must be returned to sender
    //    sender.send({ mt: "LookupResult" }, phonelookupApiRequest.consumer, phonelookupApiRequest.src); // finishing LookupResult message
    });

    function changeState(newState) {
        if (newState == currentState) return;
        if (newState == "Connected") {
            currentState = newState;
            console.info("DwcIdentity: Appwebsocket.Connection Connected: ");
        }
        if (newState == "Disconnected") {
            console.error("DwcIdentity: Appwebsocket.Connection Disconnected: ");
            currentState = "Disconnected";
        }
    }


    function app_connected(domain, user, dn, appdomain) {
        changeState("Connected");

        app.send({ api: "user", mt: "UserSession" });
        searchApi = start.provideApi("com.innovaphone.search");
        searchApi.update({ relevance: 2000 });
        searchApi.onmessage.attach(onSearchApiMessage);
        // start consume Phone API when AppWebsocket is connected
        phoneApi = start.consumeApi("com.innovaphone.phone");
        if (phoneApi) {
            phoneApi.onupdate.attach(onPhoneApiUpdate);
        }

        setInterval(function () {
            if (currentState == "Connected") {
                var msg = { api: "user", mt: "Ping" };
                app.send(msg);
                console.log("Interval: Ping Sent " + JSON.stringify(msg));
            } else {
                changeState("Disconnected");
                console.log("Interval: changeState Disconnected");
            }
            
        }, 60000); // A cada 60 segundo
    }

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserSessionResult") {
            console.log("UserSessionResult "+ obj.session);
            app.send({ api: "user", mt: "InitializeMessage", session: obj.session });
        }
        if (obj.api == "user" && obj.mt == "NoLicense") {
            console.log(obj.result);
            makeDivNoLicense(obj.result);
        }
        if (obj.api == "user" && obj.mt == "DWCCallRequest") {
            console.log("DWCCallRequest: Received from= "+ obj.caller);
            dwcCaller = obj.caller;
            dwcLocation = obj.location;
        }
        if (obj.api == "user" && obj.mt == "Pong") {
            console.log("Interval: Pong received!!!");
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
                    console.log("onPhoneApiUpdate: Softphone updated with caller="+ dwcCaller);
                } else if (dwcCaller.length > 1 && dwcLocation.length > 1) {
                    phoneApi.send({ mt: "CallInfo", id: call.id, html: "<div style=' width: 100%; left: 0%; text-align: center;;background:darkblue;color:white;font-size:20px'>Cliente: " + decodeURIComponent(dwcCaller) + "</div><div style='top:40px; width: 100%; height: 100%; left: 0%; text-align: center;;background:darkblue;color:white;font-size:20px'><iframe src='" + dwcLocation + "' width='100%' height='100%' style='border:0;' allowfullscreen='' loading='lazy' referrerpolicy='no-referrer-when-downgrade'></iframe></div>" });
                    console.log("onPhoneApiUpdate: Softphone updated with caller=" + dwcCaller);
                } else if (dwcCaller.length < 1 && dwcLocation.length < 1) {
                    phoneApi.send({ mt: "CallInfo", id: call.id, html: "" });
                }

            } else {
                dwcLocation = '';
                dwcCaller = '';
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
                    console.log("onSearchApiMessage:obj.msg.search == Extern Web");
                    searchApi.send({
                        mt: "SearchInfo", type: "contact", dn: dwcCaller, cn: dwcCaller,
                        avatar: "extern-web", guid: "8e4b16d1-d798-40ba-9800-43ea0d9523a3",
                        link: dwcLocation, contact: {
                            givenname: dwcCaller,
                            sn: "",
                            company: "",
                            sip: [
                                "extern-web@wecom.com.br"
                            ]
                        },
                        pbx: "inn-lab-ipva", node: "root", template: "Config Admin", nodeprefix: ""
                    }, obj.consumer, obj.src);
                    searchApi.send({ mt: "SearchResult" }, obj.consumer, obj.src); 
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