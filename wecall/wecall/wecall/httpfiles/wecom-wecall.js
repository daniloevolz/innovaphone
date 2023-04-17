
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />
/// <reference path="../../web1/ui1.popup/innovaphone.ui1.popup.js" />

var Wecom = Wecom || {};
Wecom.wecall = Wecom.wecall || function (start, args) {
    this.createNode("body");
    var that = this;
    //var phoneApi = start.consumeApi("com.innovaphone.phone");
    var calllistApi = start.consumeApi("com.innovaphone.calllist");
    calllistApi.send({ mt: "Subscribe", count: 1 }, "*");
    calllistApi.onmessage.attach(calllistonmessage);

    

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
    app.onclosed = wait;
    app.onerror = wait;
    wait();

    function wait() {
        that.clear();
        var bodywait = new innovaphone.ui1.Div("height: 100%; width: 100%; display: inline-flex; position: absolute;justify-content: center;", null, "bodywaitconnection")
        bodywait.addHTML('<svg class="pl" viewBox="0 0 128 128" width="128px" height="128px" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="hsl(193,90%,55%)" /><stop offset="100%" stop-color="hsl(223,90%,55%)" /></linearGradient></defs>	<circle class="pl__ring" r="56" cx="64" cy="64" fill="none" stroke="hsla(0,10%,10%,0.1)" stroke-width="16" stroke-linecap="round" />	<path class="pl__worm" d="M92,15.492S78.194,4.967,66.743,16.887c-17.231,17.938-28.26,96.974-28.26,96.974L119.85,59.892l-99-31.588,57.528,89.832L97.8,19.349,13.636,88.51l89.012,16.015S81.908,38.332,66.1,22.337C50.114,6.156,36,15.492,36,15.492a56,56,0,1,0,56,0Z" fill="none" stroke="url(#pl-grad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="44 1111" stroke-dashoffset="10" /></svg >');
        that.add(bodywait);
        //const myInterval = window.setInterval(function () {
        //    moedas();
        //}, 60000);
    }
    

    function app_connected(domain, user, dn, appdomain) {
        userUI = user;
        //if (app.logindata.info.unlicensed) {
        //    //sem licença
        //    var counter = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:calc(5% - 15px); font-size:30px; text-align:center", texts.text("licText")));
        //    that.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:30%; top:calc(15% - 6px); font-size:12px; text-align:center", null, "button")).addTranslation(texts, "licContinue").addEvent("click", function () {
        //        app.send({ api: "user", mt: "UserMessage" });
        //    });

        //} else {

        //    app.send({ api: "user", mt: "UserMessage" });
        //}
        //app.send({ api: "user", mt: "UserMessage" });
        app.send({ api: "user", mt: "InitializeMessage" });

        var phoneinfoApi = start.provideApi("com.innovaphone.phoneinfo");
        phoneinfoApi.onmessage.attach(function (sender, obj) {
            switch (obj.msg.mt) {
                case "CallAdded":
                    start.show();
                    //console.warn(obj.msg.mt);
                    console.log(obj.msg);
                    break;
                case "CallUpdated":
                    console.warn(obj.msg.mt);
                    console.log(obj.msg);
                    // show app if call is in connected state
                    if (obj.msg.state === "Connected") start.show();
                    break;
                case "CallRemoved":
                    start.show();
                    //console.warn(obj.msg.mt);
                    console.log(obj.msg);

                    // show home screen after the call is ended
                    //start.home();
                    break;
            }
        });
        
    }

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
            that.clear();
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
        if (obj.api == "user" && obj.mt == "DevicesList") {

            console.log("makePopupDevice");
            var styles = [new innovaphone.ui1.PopupStyles("popup-background", "popup-header", "popup-main", "popup-closer")];
            var h = [20];
            var _popup = new innovaphone.ui1.Popup("position: absolute; display: inline-flex; left:50px; top:50px; align-content: center; justify-content: center; flex-direction: row; flex-wrap: wrap; width:400px; height:200px;", styles[0], h[0]);
            _popup.header.addText(texts.text("labelDeviceTitle"));

            var devices = obj.devices;
            var iptDeviceTitle = new innovaphone.ui1.Div("position:absolute; left:0%; width:50%; top:40%; font-size:15px; text-align:right", texts.text("labelDevice"));
            var iptDevice = new innovaphone.ui1.Node("select", "position:absolute; left:50%; width:30%; top:40%; font-size:12px; text-align:rigth", null, null);
            iptDevice.setAttribute("id", "selectDevice");
            devices.forEach(function (dev) {
                iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
            })
            //Botão Salvar
            var btnSelectDevice = new innovaphone.ui1.Div("position:absolute; left:40%; width:20%; top:70%; font-size:15px; text-align:center", null, "button-inn").addTranslation(texts, "btnSave").addEvent("click", function () {
                var hw = document.getElementById("selectDevice");
                var selectedOption = hw.options[hw.selectedIndex];
                var hw = selectedOption.id;
                if (String(hw) == "") {
                    window.alert("Atenção!! Complete todos os campos.");
                } else {
                    app.send({ api: "user", mt: "DeviceSelected", hw: String(hw), src: obj.src });
                    _popup.close()
                }
            });

            _popup.content.add(iptDeviceTitle);
            _popup.content.add(iptDevice);
            _popup.content.add(btnSelectDevice);
        }
        //if (obj.api == "user" && obj.mt == "MakeCall") {
        //    console.warn("::MakeCall::");
        //    phoneApi.send({ mt: "StartCall", num: String(obj.num) });
        //}
        //if (obj.api == "user" && obj.mt == "DisconnectCall") {
        //    console.warn("::DisconnectCall::");
        //    phoneApi.send({ mt: "DisconnectCall" });
        //}
    }
    //phoneApi.onupdate.attach(function (sender, type) {
    //    Object.keys(sender.model).forEach(function (key) {
    //        var provider = sender.model[key];
    //        if (provider.model.calls) {
    //            provider.model.calls.forEach(function (call) {
    //                console.warn("::phoneapionupdate:: Direction=" + String(call.dir) + " State=" + String(call.state) + " Numero=" + String(call.num));
    //                app.send({ api: "user", mt: "PhoneApiEvent", obj: JSON.stringify( call )});
    //            });
    //        }
    //    });
    //});
    
    function calllistonmessage(consumer, obj) {
        if (obj.msg) {
            console.log("::calllistApi::onmessage() msg=" + JSON.stringify(obj.msg));
            app.send({ api: "user", mt: "CallHistoryEvent", obj: JSON.stringify(obj.msg) });
        }
    }
}

Wecom.wecall.prototype = innovaphone.ui1.nodePrototype;
