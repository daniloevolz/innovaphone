
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
        if(type == "number") {
            app.send({ api: "user", mt: "TriggerCall", prt: String(value) })
            addNotification("<<<  " + type + " " + value);
        }
        if (type == "alarm") {
            app.send({ api: "user", mt: "TriggerAlert", prt: String(value) })
            addNotification("<<<  " + type + " " + value);
        }
        if (type == "video") {
            makePopup(texts.text("headerVideoPlayer"), '<html>' +
                '<head>' +
                '<link href="video-js.css" rel="stylesheet">' +
                '<meta charset=utf-8 />' +
                '</head>' +
                '<body>' +
                '<video id=example-video width=960 height=540 class="video-js vjs-default-skin" controls>' +
                '<source ' +
                'src="https://mediaserver.wecom.com.br:4443/live/room/index.m3u8" ' +
                'type="application/x-mpegURL">' +
                '</video>' +
                '<script>' +
                'var player = videojs("example-video"); ' +
                'player.play(); ' +
                '</script>' +
                '</body>' +
                '</html>')
        }
        
    };

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
           constructor();
    
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

    function constructor(){
        colEsquerda();
    }
    
    function colEsquerda(){
        var colesquerda =  that.add(new innovaphone.ui1.Div(null, null,"colunaesquerda"));
        var teclado = colesquerda.add(new innovaphone.ui1.Div(null,null,"teclado"));
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
        for(let i = 0; i < 9; i++){
            let btn = divTeclado.add(new innovaphone.ui1.Node("button",null, i+1,"typebtn"));
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
    }   
    
    function addNotification(msg) {
        var scroll = new innovaphone.ui1.Node("scroll-container",null,null,"scroll-container")
        scroll.setAttribute("id","scroll-calls")
        var alarm = new innovaphone.ui1.Node("scroll-page", null, msg, "scroll-page");
        document.getElementById("scroll-calls").appendChild(alarm.container)
    }

    function popButtons(buttons) {
        var allbtn = that.add(new innovaphone.ui1.Div(null, null, "allbtn"));

        //var allbtn = document.getElementById("allbtn");
        buttons.forEach(function (object) {
            
            var btn = that.add(new innovaphone.ui1.Node("button", null, null, "allbutton"));
            if (object.button_type == "Alarme") {
                var img = btn.add(new innovaphone.ui1.Node("img", null, null, "img-icon"));
                img.setAttribute("src", "alarm.png");
            } else {
                var img = btn.add(new innovaphone.ui1.Node("img", null, null, "img-icon"));
                img.setAttribute("src", "phone.png");
            }
            btn.setAttribute("type", "button");
            btn.setAttribute("nonce", object.button_id);
            btn.setAttribute("name", object.button_type);
            btn.setAttribute("value", object.button_prt);
            btn.addHTML(object.button_name);
            
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

        var popup = new innovaphone.ui1.Popup("position:absolute; left:50px; top:50px; width:500px; height:200px", styles[0], h[0]);
        popup.header.addText(header);
        popup.content.addHTML(content);
    }
}

Wecom.novaalert.prototype = innovaphone.ui1.nodePrototype;
