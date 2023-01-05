
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
            "--bg": "url('bg.png')",
            "--button": "#929292",
            "--text-standard": "white",
        },
        light: {
            "--bg": "url('bg.png')",
            "--button": "#929292",
            "--text-standard": "white",
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

    //Coluna Esquerda
    var colesquerda = that.add(new innovaphone.ui1.Div(null, null, "colunaesquerda"));
    var container = colesquerda.add(new innovaphone.ui1.Div("display: block; position: absolute; height: 40%; width: 100%;", null, null));
    //Coluna Direita
    var coldireita = that.add(new innovaphone.ui1.Div(null, null, "colunadireita"));
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
        app.send({ api: "user", mt: "UserPresence" });
 
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
        
        var type = evt.currentTarget.attributes['button_type'].value;
        var prt = evt.currentTarget.attributes['button_prt'].value;
        try {
            var prt_user = evt.currentTarget.attributes['button_prt_user'].value;
        } catch {
            var prt_user = "";
        }
        
        updateScreen(type, prt, prt_user);
    };

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {

        }
        if (obj.api == "user" && obj.mt == "SelectMessageSuccess") {
            console.log(obj.result);
            var buttons = JSON.parse(obj.result);
            popButtons(buttons);
           
            
        }
        if (obj.api == "user" && obj.mt == "AlarmSuccessTrigged") {
            var clicked = document.getElementById(obj.value);
            document.getElementById(obj.value).style.backgroundColor = "var(--button)";
            //if (clicked.className == "allbuttonClicked") {
            //    document.getElementById(obj.value).setAttribute("class", "allbutton");
            //}
        }
        if (obj.api == "user" && obj.mt == "AlarmReceived") {
            console.log(obj.alarm);
            makePopup("Alarme Recebido!!!!", obj.alarm, 500, 200);
            addNotification(">>>  " + obj.alarm);
        }
        if (obj.api == "user" && obj.mt == "VideoRequest") {
            console.log(obj.alarm);
            //document.getElementById(obj.alarm).setAttribute("class", "allbuttonClicked");
            updateScreen("video", obj.alarm, "");
            //makePopup("Alarme Recebido!!!!", obj.alarm, 500, 200);
            //addNotification(">>>  " + obj.alarm);
        }
        if (obj.api == "user" && obj.mt == "PageRequest") {
            console.log(obj.alarm);
            //document.getElementById(obj.alarm).setAttribute("class", "allbuttonClicked");
            updateScreen("page", obj.alarm, "");
            //makePopup("Alarme Recebido!!!!", obj.alarm, 500, 200);
            //addNotification(">>>  " + obj.alarm);
        }
        if (obj.api == "user" && obj.mt == "CallConnected") {
            console.log(obj.src);
            document.getElementById(obj.src).style.borderColor = "darkred";
            //makePopup("Chamada Conectada!!!!", obj.src, 500, 200);
            addNotification(">>>  Chamada Conectada " + obj.src);
        }
        if (obj.api == "user" && obj.mt == "UserConnected") {
            console.log(obj.src);
            try {
                document.getElementById(obj.src).style.backgroundColor = "darkgreen";
            } catch {
                console.log("UserConnected not button");
            }
            
        }
        if (obj.api == "user" && obj.mt == "UserDisconnected") {
            console.log(obj.src);
            try {
                document.getElementById(obj.src).style.backgroundColor = "var(--button)";
                document.getElementById(obj.src).style.borderColor = "var(--button)";
            } catch {
                console.log("UserDisconnected not button");
            }
            
        }
        if (obj.api == "user" && obj.mt == "CallDisconnected") {
            console.log(obj.src);
            document.getElementById(obj.src).style.backgroundColor = "darkgreen";
            document.getElementById(obj.src).style.borderColor = "darkgreen";
            //makePopup("Chamada Desconectada!!!!", obj.src, 500, 200);
            addNotification(">>>  Chamada Desconectada " + obj.src);
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
        var combobtn = coldireita.add(new innovaphone.ui1.Div(null, null, "combobtn"));
        var allbtn = coldireita.add(new innovaphone.ui1.Div(null, null, "allbtn"));
        var pagebtn = coldireita.add(new innovaphone.ui1.Div(null, null, "pagebtn"));
        //var allbtn = document.getElementById("allbtn");
        buttons.forEach(function (object) {
            //var btn = that.add(new innovaphone.ui1.Node("button", null, null, "allbutton"));
            if (object.button_type == "combo") {
                var div1 = combobtn.add(new innovaphone.ui1.Div(null, null, "combobutton"));
                div1.setAttribute("button_type", object.button_type);
                div1.setAttribute("button_prt", object.button_prt);
                div1.setAttribute("id", object.button_prt);
                

                var div2 = div1.add(new innovaphone.ui1.Div(null, null, "buttontop"));
                div2.addHTML("<img src='combo.png' class='img-icon'>" + object.button_name);
            
                var div3 = div1.add(new innovaphone.ui1.Div(null, "COMBO " + object.button_prt, "buttondown"));

                combobtn.add(div1);
            }
            if (object.button_type == "alarm") {
                var div1 = allbtn.add(new innovaphone.ui1.Div(null, null, "allbutton"));
                div1.setAttribute("button_type", object.button_type);
                div1.setAttribute("button_prt", object.button_prt);
                div1.setAttribute("id", object.button_prt);


                var div2 = div1.add(new innovaphone.ui1.Div(null, null, "buttontop"));
                div2.addHTML("<img src='alarm.png' class='img-icon'>" + object.button_name);

                var div3 = div1.add(new innovaphone.ui1.Div(null, "ALARME " + object.button_prt, "buttondown"));

                allbtn.add(div1);
                //
                //var btn = that.add(new innovaphone.ui1.Node("button", null, null, "allbutton"));
                //btn.addHTML("<img src='alarm.png' class='img-icon'>" + object.button_name);
                //allbtn.add(btn);
                //btn.setAttribute("type", "button");
                //btn.setAttribute("name", object.button_type);
                //btn.setAttribute("value", object.button_prt);
                //btn.setAttribute("id", object.button_prt);
            }
            else if (object.button_type == "video") {
                var div1 = allbtn.add(new innovaphone.ui1.Div(null, null, "allbutton"));
                div1.setAttribute("button_type", object.button_type);
                div1.setAttribute("button_prt", object.button_prt);
                div1.setAttribute("id", object.button_prt);


                var div2 = div1.add(new innovaphone.ui1.Div(null, null, "buttontop"));
                div2.addHTML("<img src='video.png' class='img-icon'>" + object.button_name);

                var div3 = div1.add(new innovaphone.ui1.Div(null, "CÂMERA", "buttondown"));

                allbtn.add(div1);
                //
                //var btn = that.add(new innovaphone.ui1.Node("button", null, null, "allbutton"));
                //btn.addHTML("<img src='video.png' class='img-icon'>" + object.button_name);
                //allbtn.add(btn);
                //btn.setAttribute("type", "button");
                //btn.setAttribute("name", object.button_type);
                //btn.setAttribute("value", object.button_prt);
                //btn.setAttribute("id", object.button_prt);

            }
            else if (object.button_type == "number") {
                var div1 = allbtn.add(new innovaphone.ui1.Div(null, null, "numberbutton"));
                div1.setAttribute("button_type", object.button_type);
                div1.setAttribute("button_prt", object.button_prt);
                div1.setAttribute("id", object.button_prt);
                div1.setAttribute("button_prt_user", object.button_prt_user);

                var div2 = div1.add(new innovaphone.ui1.Div(null, null, "buttontop"));
                div2.addHTML("<img src='phone.png' class='img-icon'>" + object.button_name);

                var div3 = div1.add(new innovaphone.ui1.Div(null, "TELEFONE " + object.button_prt, "buttondown"));

                allbtn.add(div1);

                //
                //var btn = that.add(new innovaphone.ui1.Node("button", null, null, "numberbutton"));
                //btn.addHTML("<img src='phone.png' class='img-icon'>" + object.button_name);
                //btn.setAttribute("nonce", object.button_prt_user);
                //allbtn.add(btn);
                //btn.setAttribute("type", "button");
                //btn.setAttribute("name", object.button_type);
                //btn.setAttribute("value", object.button_prt);
                //btn.setAttribute("id", object.button_prt);
            }
            else if (object.button_type == "queue") {
                var div1 = allbtn.add(new innovaphone.ui1.Div(null, null, "numberbutton"));
                div1.setAttribute("button_type", object.button_type);
                div1.setAttribute("button_prt", object.button_prt);
                div1.setAttribute("id", object.button_prt);
                div1.setAttribute("button_prt_user", object.button_prt_user);

                var div2 = div1.add(new innovaphone.ui1.Div(null, null, "buttontop"));
                div2.addHTML("<img src='queue.png' class='img-icon'>" + object.button_name);

                var div3 = div1.add(new innovaphone.ui1.Div(null, "GRUPO " + object.button_prt, "buttondown"));

                allbtn.add(div1);

                //var btn = that.add(new innovaphone.ui1.Node("button", null, null, "numberbutton"));
                //btn.addHTML("<img src='phone.png' class='img-icon'>" + object.button_name);
                //btn.setAttribute("nonce", object.button_prt_user);
                //allbtn.add(btn);
                //btn.setAttribute("type", "button");
                //btn.setAttribute("name", object.button_type);
                //btn.setAttribute("value", object.button_prt);
                //btn.setAttribute("id", object.button_prt);
            }
            else if (object.button_type == "page") {
                var div1 = allbtn.add(new innovaphone.ui1.Div(null, null, "pagebutton"));
                div1.setAttribute("button_type", object.button_type);
                div1.setAttribute("button_prt", object.button_prt);
                div1.setAttribute("id", object.button_prt);


                var div2 = div1.add(new innovaphone.ui1.Div(null, null, "buttontop"));
                div2.addHTML("<img src='video.png' class='img-icon'>" + object.button_name);

                var div3 = div1.add(new innovaphone.ui1.Div(null, "PÀGINA", "buttondown"));

                pagebtn.add(div1);

                //var btn = that.add(new innovaphone.ui1.Node("button", null, null, "pagebutton"));
                //btn.addHTML("<img src='page.png' class='img-icon'>" + object.button_name);
                //pagebtn.add(btn);
                //btn.setAttribute("type", "button");
                //btn.setAttribute("name", object.button_type);
                //btn.setAttribute("value", object.button_prt);
                //btn.setAttribute("id", object.button_prt);
            }
            
            
            
        });

        var botoes = document.querySelectorAll(".allbutton");
        for (var i = 0; i < botoes.length; i++) {
            var botao = botoes[i];
            // O jeito correto e padronizado de incluir eventos no ECMAScript
            // (Javascript) eh com addEventListener:
            botao.addEventListener("click", buttonClicked);
        }
        var botoes = document.querySelectorAll(".numberbutton");
        for (var i = 0; i < botoes.length; i++) {
            var botao = botoes[i];
            // O jeito correto e padronizado de incluir eventos no ECMAScript
            // (Javascript) eh com addEventListener:
            botao.addEventListener("click", buttonClicked);
        }
        var botoes = document.querySelectorAll(".pagebutton");
        for (var i = 0; i < botoes.length; i++) {
            var botao = botoes[i];
            // O jeito correto e padronizado de incluir eventos no ECMAScript
            // (Javascript) eh com addEventListener:
            botao.addEventListener("click", buttonClicked);
        }
        var botoes = document.querySelectorAll(".combobutton");
        for (var i = 0; i < botoes.length; i++) {
            var botao = botoes[i];
            // O jeito correto e padronizado de incluir eventos no ECMAScript
            // (Javascript) eh com addEventListener:
            botao.addEventListener("click", buttonClicked);
        }
    }

    function makePopup(header, content, width, height) {
        console.log("makePopup");
        var styles = [new innovaphone.ui1.PopupStyles("popup-background", "popup-header", "popup-main", "popup-closer")];
        var h = [20];

        var popup = new innovaphone.ui1.Popup("position:absolute; left:50px; top:50px; width:" + width + "px; height:" + height + "px;", styles[0], h[0]);
        popup.header.addText(header);
        popup.content.addHTML(content);
    }

    function updateScreen(type, value, nonce) {
        
        if (type == "page") {
            makePopup("Página", "<iframe src='" + value + "' width='100%' height='100%' style='border:0;' allowfullscreen='' loading='lazy' referrerpolicy='no-referrer-when-downgrade'></iframe>", 600, 450);
            addNotification("<<<  " + type);
        }
        if (type == "number") {
            var clicked = document.getElementById(value);
            if (clicked.style.backgroundColor == "darkred") {
                app.send({ api: "user", mt: "EndCall", prt: String(nonce) })
                document.getElementById(value).style.backgroundColor = "darkgreen";
                //document.getElementById(value).setAttribute("class", "allbutton");
            } else {
                app.send({ api: "user", mt: "TriggerCall", prt: String(nonce) })
                addNotification("<<<  " + type + " " + value);
                document.getElementById(value).style.backgroundColor = "darkred";
                //document.getElementById(value).setAttribute("class", "allbuttonClicked");
            }
            
        }
        if (type == "queue") {
            var clicked = document.getElementById(value);
            if (clicked.style.backgroundColor == "darkred") {
                app.send({ api: "user", mt: "EndCall", prt: String(value) })
                document.getElementById(value).style.backgroundColor = "darkgreen";
                //document.getElementById(value).setAttribute("class", "allbutton");
            } else {
                app.send({ api: "user", mt: "TriggerCall", prt: String(value) })
                addNotification("<<<  " + type + " " + value);
                document.getElementById(value).style.backgroundColor = "darkred";
                //document.getElementById(value).setAttribute("class", "allbuttonClicked");
            }

        }
        if (type == "alarm") {
            var clicked = document.getElementById(value);
            if (clicked.style.backgroundColor == "darkred") {
                document.getElementById(value).style.backgroundColor = "var(--button)";
                //document.getElementById(value).setAttribute("class", "allbutton");
            } else {
                app.send({ api: "user", mt: "TriggerAlert", prt: String(value) })
                addNotification("<<<  " + type + " " + value);
                document.getElementById(value).style.backgroundColor = "darkred";
                //document.getElementById(value).setAttribute("class", "allbuttonClicked");
            }
            
        }
        if (type == "video") {
            try {
                var oldPlayer = document.getElementById('video-js');
                videojs(oldPlayer).dispose();
                container.clear();
            } catch {
                container.clear();
            }
            var clicked = document.getElementById(value);
            if (clicked.style.backgroundColor == "darkred") {
                container.clear();
                document.getElementById(value).style.backgroundColor = "var(--button)";
                //document.getElementById(value).setAttribute("class", "allbutton");
            } else {
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
                document.getElementById(value).style.backgroundColor = "darkred";
                //document.getElementById(value).setAttribute("class", "allbuttonClicked");
            }
        }

    }
}

Wecom.novaalert.prototype = innovaphone.ui1.nodePrototype;
