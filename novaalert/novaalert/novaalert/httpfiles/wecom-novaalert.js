
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />
/// <reference path="../../web1/ui1.popup/innovaphone.ui1.popup.js" />

var Wecom = Wecom || {};
Wecom.novaalert = Wecom.novaalert || function (start, args) {
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

    var texts = new innovaphone.lib1.Languages(Wecom.novaalertTexts, start.lang);
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;


    var colesquerda = that.add(new innovaphone.ui1.Div(null, null, "colunaesquerda"));
    var container = colesquerda.add(new innovaphone.ui1.Div("position: absolute; height: 40%; width: 100%;", null, null));
    //var videoPlayer = colesquerda.add(new innovaphone.ui1.Node("video", "position: absolute ;width:100%; height:40%; border: 0px;", null, null));
    //videoPlayer.setAttribute("src", "https://www.youtube.com/embed/gz8tmR43AJE");
    container.setAttribute("id", "containerPlayer");
    var call = colesquerda.add(new innovaphone.ui1.Div(null, null,"call-container"));
    var history = call.add(new innovaphone.ui1.Div("height: 10%; width: 100%; background-color:black; color:white; text-align: center; font-weight:bold; font-size: 22px",texts.text("labelHistorico"),null))
    var scroll = call.add(new innovaphone.ui1.Node("scroll-container", null, null, "scroll-container"));
    scroll.setAttribute("id", "scroll-calls")

    function app_connected(domain, user, dn, appdomain) { 
        app.send({ api: "user", mt: "UserMessage" });
        app.send({ api: "user", mt: "SelectMessage" });
 
        if (app.logindata.info.unlicensed) {
            //sem licença
            app.send({ api: "user", mt: "UserMessage" })
            //var counter = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:calc(5% - 15px); font-size:30px; text-align:center", texts.text("licText")));
            //that.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:30%; top:calc(15% - 6px); font-size:12px; text-align:center", null, "button")).addTranslation(texts, "licContinue").addEvent("click", function () {
            //    app.send({ api: "user", mt: "UserMessage" })
            //    app.send({ api: "user", mt: "SelectMessage" });
            //});
  
        }
        else {
  
            app.send({ api: "user", mt: "UserMessage" })

        }
    }

    var buttonClicked = function (evt) {
        // Dentro do objeto evt esta o target, e o target tem um value:
        var value = evt.target.value;
        var type = evt.target.name;
        
        try {
            var oldPlayer = document.getElementById('video-js');
            videojs(oldPlayer).dispose();
            container.clear();
        } catch {
            container.clear();
        }
        if(type == "number") {
            app.send({ api: "user", mt: "TriggerCall", prt: String(value) })
            addNotification("<<<  " + type + " " + value);
        }
        if (type == "alarm") {
            app.send({ api: "user", mt: "TriggerAlert", prt: String(value) })
            addNotification("<<<  " + type + " " + value);
        }
        if (type == "video") {
            
            
            var videoElement = container.add(new innovaphone.ui1.Node("video", "position: absolute ;width:100%; height:100%; border: 0px;", null, null));

            //document.getElementById("videoPlayer").setAttribute("src", value);
            var source = document.createElement("source");
            source.setAttribute("src", value);
            source.setAttribute("type", "application/x-mpegURL");

            //document.getElementById("container").appendChild(script);
            //var videoElement = document.createElement("video");
            videoElement.setAttribute("allow", "autoplay");
            videoElement.setAttribute("autoplay", "true");
            videoElement.setAttribute("muted", "muted");
            videoElement.setAttribute("width", "800%");
            videoElement.setAttribute("height", "470%");
            videoElement.setAttribute("controls", "");
            videoElement.setAttribute("class", "video-js vjs-default-skin");
            videoElement.setAttribute("id", "video-js");

            //videoElement.setAttribute("src", url);
            //videoElement.setAttribute("type", type);
            //document.getElementById("container").appendChild(videoElement);
            document.getElementById("video-js").appendChild(source);
            var video = videojs('video-js', {
                html5: {
                    vhs: {
                        overrideNative: !videojs.browser.IS_SAFARI
                    },
                    nativeAudioTracks: false,
                    nativeVideoTracks: false
                }
            });
            //video.src({ type: type, src: url });
            video.ready(function () {
                video.src({ type: "application/x-mpegURL", src: value });
            });
        }
        
    };

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {

        }
        if (obj.api == "user" && obj.mt == "SelectMessageSuccess") {
            console.log(obj.result);
            var buttons = JSON.parse(obj.result);
            popButtons(buttons);
           
            
        }
        if (obj.api == "user" && obj.mt == "AlarmReceived") {
            console.log(obj.alarm);
            makePopup("Alarme Recebido!!!!", obj.alarm);
            addNotification(">>>  " + obj.alarm);
        }
    }

    function colEsquerda(){
        
        /* var teclado = colesquerda.add(new innovaphone.ui1.Div(null,null,"teclado"));
        var divBackspace = teclado.add(new innovaphone.ui1.Div(null,null,"backspace"));
        var textarea = divBackspace.add(new innovaphone.ui1.Node("textarea",null,null,"type"))
        textarea.setAttribute("id","resultado");
        var divBackspaceIcon = divBackspace.add(new innovaphone.ui1.Div(null,null,"backspace-icon"));
        var buttonbackspace =  divBackspaceIcon.add(new innovaphone.ui1.Node("button",null,null,null));
        buttonbackspace.setAttribute("id","apagar");
        buttonbackspace.setAttribute("value","apagar");
        var imgBackspace = buttonbackspace.add(new innovaphone.ui1.Node("img","width:130%; height:100%; margin-left: -5px;",null,null));
        imgBackspace.setAttribute("src","backspace.png");
        var divTeclado = teclado.add(new innovaphone.ui1.Div(null,null,"flex-teclado"));
        for(var i = 0; i < 9; i++){
            var btn = divTeclado.add(new innovaphone.ui1.Node("button",null, i+1,"typebtn"));
            btn.setAttribute("id",i+1)
        }
        var btn2 = divTeclado.add(new innovaphone.ui1.Node("button",null,"*","typebtn"));
        var btn3 = divTeclado.add(new innovaphone.ui1.Node("button",null,"0","typebtn"));
        var btn4 = divTeclado.add(new innovaphone.ui1.Node("button",null,"#","typebtn"));

        var ligar = teclado.add(new innovaphone.ui1.Div("display:flex",null,"calling"));
        ligar.setAttribute("id","calling");
        var btnLigar = ligar.add(new innovaphone.ui1.Node("button","width: 50%; height: 40px; background-color: rgb(20, 187, 20); color: rgb(0, 0, 0); font-weight: bold;","LIGAR",null));
        var btnDesligar = ligar.add(new innovaphone.ui1.Node("button","width: 50%; height: 40px; background-color: rgb(248, 23, 23); color: rgb(0, 0, 0); font-weight: bold;","DESLIGAR",null));
        var calls = colesquerda.add(new innovaphone.ui1.Div(null,null,"calls"));
         calls.setAttribute("id","calls");
         */
    }

    function addNotification(msg) {
        var alarm = scroll.add(new innovaphone.ui1.Node("scroll-page", null, msg, "scroll-page"));
        //document.getElementById("scroll-calls").appendChild(msg)
    }

    function popButtons(buttons) {
        var allbtn = that.add(new innovaphone.ui1.Div(null, null, "allbtn"));

        //var allbtn = document.getElementById("allbtn");
        buttons.forEach(function (object) {
            
            var btn = that.add(new innovaphone.ui1.Node("button", null, null, "allbutton"));
            if (object.button_type == "alarm") {
                btn.addHTML("<img src='alarm.png' class='img-icon'>" + object.button_name);
            } else if (object.button_type == "video") {
                btn.addHTML("<img src='video.png' class='img-icon'>" + object.button_name);
                //var img = new innovaphone.ui1.Node("img", null, null, "img-icon");
                //img.setAttribute("src", "video.png");
            } else {
                btn.addHTML("<img src='phone.png' class='img-icon'>" + object.button_name);
            }
            btn.setAttribute("type", "button");
            btn.setAttribute("nonce", object.button_id);
            btn.setAttribute("name", object.button_type);
            btn.setAttribute("value", object.button_prt);
            
            allbtn.add(btn);
        });

        var botoes = document.querySelectorAll(".allbutton");
        for (var i = 0; i < botoes.length; i++) {
            var botao = botoes[i];
            // O jeito correto e padronizado de incluir eventos no ECMAScript
            // (Javascript) eh com addEventListener:
            botao.addEventListener("click", buttonClicked);
        }
    }

    function makePopup(header, content) {
        console.log("makePopup");
        var styles = [new innovaphone.ui1.PopupStyles("popup-background", "popup-header", "popup-main", "popup-closer")];
        var h = [20];

        var popup = new innovaphone.ui1.Popup("position:absolute; left:50px; top:50px; width:500px; height:200px;", styles[0], h[0]);
        popup.header.addText(header);
        popup.content.addHTML(content);
    }
}

Wecom.novaalert.prototype = innovaphone.ui1.nodePrototype;
