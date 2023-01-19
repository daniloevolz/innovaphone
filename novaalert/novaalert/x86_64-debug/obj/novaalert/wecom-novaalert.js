
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
        var id = evt.currentTarget.attributes['id'].value;
        try {
            var prt_user = evt.currentTarget.attributes['button_prt_user'].value;
        } catch {
            var prt_user = "";
        }
        updateScreen(id, type, prt, prt_user);
    };


    var list_users = [];
    var list_buttons = [];
    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {

        }
        if (obj.api == "user" && obj.mt == "SelectMessageSuccess") {
            console.log(obj.result);
            list_buttons = JSON.parse(obj.result);
            popButtons(list_buttons);
           
            
        }
        if (obj.api == "user" && obj.mt == "AlarmSuccessTrigged") {
            var clicked = document.getElementById(obj.src);
            document.getElementById(obj.src).style.backgroundColor = "var(--button)";
            //if (clicked.className == "allbuttonClicked") {
            //    document.getElementById(obj.value).setAttribute("class", "allbutton");
            //}
        }
        if (obj.api == "user" && obj.mt == "ComboSuccessTrigged") {
            //var clicked = document.getElementById(obj.src);
            document.getElementById(obj.src).style.backgroundColor = "var(--button)";
            //if (clicked.className == "allbuttonClicked") {
            //    document.getElementById(obj.value).setAttribute("class", "allbutton");
            //}
        }
        if (obj.api == "user" && obj.mt == "AlarmReceived") {
            console.log(obj.alarm);
            try {
                var clicked = document.getElementById(obj.alarm);
                document.getElementById(obj.alarm).style.backgroundColor = "darkred";
            } finally {
                addNotification(">>>  Alarme " + obj.alarm);
                makePopup("ATENÇÃO", "Alarme Recebido = " + obj.alarm, 500, 200);
            }
            

        }
        if (obj.api == "user" && obj.mt == "VideoRequest") {
            console.log(obj.alarm);
            //document.getElementById(obj.alarm).setAttribute("class", "allbuttonClicked");
            updateScreen("", "video", obj.alarm, "");
            //makePopup("Alarme Recebido!!!!", obj.alarm, 500, 200);
            //addNotification(">>>  " + obj.alarm);
        }
        if (obj.api == "user" && obj.mt == "PageRequest") {
            console.log(obj.alarm);
            //document.getElementById(obj.alarm).setAttribute("class", "allbuttonClicked");
            updateScreen("", "page", obj.alarm, "");
            //makePopup("Alarme Recebido!!!!", obj.alarm, 500, 200);
            //addNotification(">>>  " + obj.alarm);
        }
        if (obj.api == "user" && obj.mt == "CallConnected") {
            console.log(obj.src);
            var element = obj.src+"-status";
            console.log(element);
            document.getElementsByTagName("div")[obj.src + "-status"].style.backgroundColor = "rgb(231 8 8 / 48%)";
            //makePopup("Chamada Conectada!!!!", obj.src, 500, 200);
            addNotification(">>>  Chamada Conectada " + obj.src);
        }
        if (obj.api == "user" && obj.mt == "UserConnected") {
            console.log(obj.src);
            updateListUsers(obj.src, obj.mt);
            try {
                document.getElementById(obj.src).style.backgroundColor = "darkgreen";
            } catch {
                console.log("UserConnected not button");
            }
            
        }
        if (obj.api == "user" && obj.mt == "UserDisconnected") {
            console.log(obj.src);
            updateListUsers(obj.src, obj.mt);
            try {
                document.getElementById(obj.src).style.backgroundColor = "var(--button)";
                document.getElementById(obj.src).style.borderColor = "var(--button)";
            } catch {
                console.log("UserDisconnected not button");
            }
            
        }
        if (obj.api == "user" && obj.mt == "CallDisconnected") {
            console.log(obj.src);
            var element = obj.src + "-status";
            console.log(element);
            document.getElementsByTagName("div")[obj.src + "-status"].style.backgroundColor = "";
            //makePopup("Chamada Desconectada!!!!", obj.src, 500, 200);
            addNotification(">>>  Chamada Desconectada " + obj.src);
        }
    }

    function colEsquerdaTeclado(){
        
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
        var alarm = scroll.add(new innovaphone.ui1.Node("scroll-page", null, null, "scroll-page"));
        var today = new Date();
        var day = today.getDate() + "";
        var month = (today.getMonth() + 1) + "";
        var year = today.getFullYear() + "";
        var hour = today.getHours() + "";
        var minutes = today.getMinutes() + "";
        var seconds = today.getSeconds() + "";

        day = checkZero(day);
        month = checkZero(month);
        year = checkZero(year);
        hour = checkZero(hour);
        minutes = checkZero(minutes);
        seconds = checkZero(seconds);


        var div2 = alarm.add(new innovaphone.ui1.Div(null, null, "notificationtop"));
        //div2.setAttribute("id", object.button_prt + "-status");
        div2.addHTML("<img src='clock.png' class='img-icon'>" + day + "/" + month + "/" + year + " " + hour + ":" + minutes + ":" + seconds);

        var div3 = alarm.add(new innovaphone.ui1.Div(null, msg, "notificationdown"));

        //alarm.add(div1);

    }
    function checkZero(data) {
        if (data.length == 1) {
            data = "0" + data;
        }
        return data;
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
                div1.setAttribute("id", object.id);
                

                var div2 = div1.add(new innovaphone.ui1.Div(null, null, "buttontop"));
                div2.setAttribute("id", object.id + "-status");
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
                div2.setAttribute("id", object.button_prt + "-status");
                div2.addHTML("<img src='alarm.png' class='img-icon'>" + object.button_name);

                var div3 = div1.add(new innovaphone.ui1.Div(null, "ALARME " + object.button_prt, "buttondown"));

                allbtn.add(div1);
            }
            else if (object.button_type == "video") {
                var div1 = allbtn.add(new innovaphone.ui1.Div(null, null, "allbutton"));
                div1.setAttribute("button_type", object.button_type);
                div1.setAttribute("button_prt", object.button_prt);
                div1.setAttribute("id", object.button_prt);


                var div2 = div1.add(new innovaphone.ui1.Div(null, null, "buttontop"));
                div2.setAttribute("id", object.button_prt + "-status");
                div2.addHTML("<img src='video.png' class='img-icon'>" + object.button_name);

                var div3 = div1.add(new innovaphone.ui1.Div(null, "CÂMERA", "buttondown"));

                allbtn.add(div1);

            }
            else if (object.button_type == "number") {
                var div1 = allbtn.add(new innovaphone.ui1.Div(null, null, "numberbutton"));
                div1.setAttribute("button_type", object.button_type);
                div1.setAttribute("button_prt", object.button_prt);
                div1.setAttribute("id", object.button_prt);
                div1.setAttribute("button_prt_user", object.button_prt_user);

                var div2 = div1.add(new innovaphone.ui1.Div(null, null, "buttontop"));
                div2.setAttribute("id", object.button_prt + "-status");
                div2.addHTML("<img src='phone.png' class='img-icon'>" + object.button_name);

                var div3 = div1.add(new innovaphone.ui1.Div(null, "TELEFONE " + object.button_prt, "buttondown"));

                allbtn.add(div1);
            }
            else if (object.button_type == "queue") {
                var div1 = allbtn.add(new innovaphone.ui1.Div(null, null, "numberbutton"));
                div1.setAttribute("button_type", object.button_type);
                div1.setAttribute("button_prt", object.button_prt);
                div1.setAttribute("id", object.button_prt);
                div1.setAttribute("button_prt_user", object.button_prt_user);

                var div2 = div1.add(new innovaphone.ui1.Div(null, null, "buttontop"));
                div2.setAttribute("id", object.button_prt + "-status");
                div2.addHTML("<img src='queue.png' class='img-icon'>" + object.button_name);

                var div3 = div1.add(new innovaphone.ui1.Div(null, "GRUPO " + object.button_prt, "buttondown"));

                allbtn.add(div1);
            }
            else if (object.button_type == "page") {
                var div1 = allbtn.add(new innovaphone.ui1.Div(null, null, "pagebutton"));
                div1.setAttribute("button_type", object.button_type);
                div1.setAttribute("button_prt", object.button_prt);
                div1.setAttribute("id", object.button_prt);


                var div2 = div1.add(new innovaphone.ui1.Div(null, null, "buttontop"));
                div2.setAttribute("id", object.button_prt + "-status");
                div2.addHTML("<img src='page.png' class='img-icon'>" + object.button_name);

                var div3 = div1.add(new innovaphone.ui1.Div(null, "PÁGINA", "buttondown"));

                pagebtn.add(div1);

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

    
    function updateScreen(id, type, prt, prt_user) {
        
        if (type == "page") {
            var clicked = document.getElementById(prt);
            if (clicked.style.backgroundColor == "darkred") {
                var gfg_down = document.getElementsByClassName("colunapage")[0];
                gfg_down.parentNode.removeChild(gfg_down);
                document.getElementsByClassName("combobtn")[0].style.width = "";
                document.getElementsByClassName("allbtn")[0].style.width = "";
                document.getElementsByClassName("pagebtn")[0].style.width = "";
                document.getElementById(prt).style.backgroundColor = "";
                //document.getElementById(value).setAttribute("class", "allbutton");
            } else {
                //document.getElementsByClassName("allbtn")[0].style. = "darkgreen";
                document.getElementsByClassName("combobtn")[0].style.width = "65%";
                document.getElementsByClassName("allbtn")[0].style.width = "65%";
                document.getElementsByClassName("pagebtn")[0].style.width = "65%";
                var colunapage = coldireita.add(new innovaphone.ui1.Div(null, null, "colunapage"));
                colunapage.addHTML("<iframe src='" + prt + "' width='100%' height='100%' style='border:0;' allowfullscreen='' loading='lazy' referrerpolicy='no-referrer-when-downgrade'></iframe>");
                //makePopup("Página", "<iframe src='" + value + "' width='100%' height='100%' style='border:0;' allowfullscreen='' loading='lazy' referrerpolicy='no-referrer-when-downgrade'></iframe>", 600, 450);
                addNotification("<<<  " + type);
                document.getElementById(prt).style.backgroundColor = "darkred";
            }
        }
        if (type == "number") {
            var found = list_users.indexOf(prt);
            if (found!=-1) {
                var clicked = document.getElementById(id);
                if (clicked.style.backgroundColor == "darkred") {
                    app.send({ api: "user", mt: "EndCall", prt: String(prt_user) })
                    document.getElementById(id).style.backgroundColor = "darkgreen";
                    //document.getElementById(value).setAttribute("class", "allbutton");
                } else {
                    app.send({ api: "user", mt: "TriggerCall", prt: String(prt_user) })
                    addNotification("<<<  " + type + " " + prt);
                    document.getElementById(id).style.backgroundColor = "darkred";
                    //document.getElementById(value).setAttribute("class", "allbuttonClicked");
                }
            }
        }
        if (type == "queue") {
            var found = list_users.indexOf(prt);
            if (found!=-1) {
                var clicked = document.getElementById(id);
                if (clicked.style.backgroundColor == "darkred") {
                    app.send({ api: "user", mt: "EndCall", prt: String(prt_user) })
                    document.getElementById(id).style.backgroundColor = "darkgreen";
                    //document.getElementById(value).setAttribute("class", "allbutton");
                } else {
                    app.send({ api: "user", mt: "TriggerCall", prt: String(prt_user) })
                    addNotification("<<<  " + type + " " + prt);
                    document.getElementById(id).style.backgroundColor = "darkred";
                    //document.getElementById(value).setAttribute("class", "allbuttonClicked");
                }
            }
        }
        if (type == "alarm") {
            var clicked = document.getElementById(prt);
            if (clicked.style.backgroundColor == "darkred") {
                //app.send({ api: "user", mt: "DecrementCount" });
                document.getElementById(prt).style.backgroundColor = "var(--button)";
                //document.getElementById(value).setAttribute("class", "allbutton");
            } else {
                app.send({ api: "user", mt: "TriggerAlert", prt: String(prt) })
                addNotification("<<<  Alarme " + prt);
                document.getElementById(prt).style.backgroundColor = "darkred";
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
            var clicked = document.getElementById(prt);
            if (clicked.style.backgroundColor == "darkred") {
                container.clear();
                document.getElementById(prt).style.backgroundColor = "var(--button)";
                //document.getElementById(value).setAttribute("class", "allbutton");
            } else {
                var videoElement = container.add(new innovaphone.ui1.Node("video", "position: absolute ;width:100%; height:100%; border: 0px;", null, null));

                //document.getElementById("videoPlayer").setAttribute("src", value);
                var source = document.createElement("source");
                source.setAttribute("src", prt);
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
                    video.src({ type: "application/x-mpegURL", src: prt });
                });
                document.getElementById(prt).style.backgroundColor = "darkred";
                //document.getElementById(value).setAttribute("class", "allbuttonClicked");
            }
        }
        if (type == "combo") {
            var clicked = document.getElementById(id);
            if (clicked.style.backgroundColor == "darkred") {
                app.send({ api: "user", mt: "StopCombo", prt: String(id) })
                document.getElementById(id).style.backgroundColor = "var(--button)";
                //document.getElementById(value).setAttribute("class", "allbutton");
            } else {
                app.send({ api: "user", mt: "TriggerCombo", prt: String(id) })
                addNotification("<<<  " + type + " " + prt);
                document.getElementById(id).style.backgroundColor = "darkred";
                //document.getElementById(value).setAttribute("class", "allbuttonClicked");
            }

        }

    }

    function updateListUsers(sip, mt) {

        if (mt == "UserConnected") {
            list_users.push(sip);
            console.log("UserConnected updated list " + list_users);
        }
        if (mt == "UserDisconnected") {
            list_users.splice(list_users.indexOf(sip), 1);
            //list_users = list_users.filter(function (x) {
            //    return x != sip;
            //});
            console.log("UserDisconnected updated list " + list_users)
        }
    }

    var popupcloser = document.querySelectorAll(".popup-closer");
    for (var i = 0; i < popupcloser.length; i++) {
        var botao = popupcloser[i];
        // O jeito correto e padronizado de incluir eventos no ECMAScript
        // (Javascript) eh com addEventListener:
        botao.addEventListener("click", function () {
            app.send({ api: "user", mt: "DecrementCount" });
        });
    }
}

Wecom.novaalert.prototype = innovaphone.ui1.nodePrototype;
