
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />
/// <reference path="../../web1/ui1.popup/innovaphone.ui1.popup.js" />
/// <reference path="../../web1/com.innovaphone.avatar/com.innovaphone.avatar.js" />

var Wecom = Wecom || {};
Wecom.novaalert = Wecom.novaalert || function (start, args) {
    this.createNode("body");
    var that = this;

    //var phoneApi = start.consumeApi("com.innovaphone.phone");
    var calllistApi = start.consumeApi("com.innovaphone.calllist");
    var avatar = start.consumeApi("com.innovaphone.avatar");
    calllistApi.send({ mt: "Subscribe", count: 1 }, "*");
    calllistApi.onmessage.attach(calllistonmessage);


    

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
    var userUI;
    app.onclosed = waitConnection;
    app.onerror = waitConnection;

    //Coluna Esquerda
    var colesquerda;
    var container;
    var coldireita;
    var scroll;
    var popup;
    var teste;
    var button_clicked = [];
    //var colesquerda = that.add(new innovaphone.ui1.Div(null, null, "colunaesquerda"));
    //var container = colesquerda.add(new innovaphone.ui1.Div("display: flex; justify-content: center; position: absolute; height: 40%; width: 100%; align-items: center; background-color: darkgrey;", new innovaphone.ui1.Node("img", "width:20%; height:20%;", null, null).setAttribute("src", "play.png"), null));
    //Coluna Direita
    //var coldireita = that.add(new innovaphone.ui1.Div(null, null, "colunadireita"));
    //var videoPlayer = colesquerda.add(new innovaphone.ui1.Node("video", "position: absolute ;width:100%; height:40%; border: 0px;", null, null));
    //videoPlayer.setAttribute("src", "https://www.youtube.com/embed/gz8tmR43AJE");
    //container.setAttribute("id", "containerPlayer");
    //var call = colesquerda.add(new innovaphone.ui1.Div(null, null, "call-container"));
    //var history = call.add(new innovaphone.ui1.Div("height: 10%; width: 100%; background-color:black; color:white; text-align: center; font-weight:bold; font-size: 22px", texts.text("labelHistorico"), null))
    //var scroll = call.add(new innovaphone.ui1.Node("scroll-container", null, null, "scroll-container"));
    //scroll.setAttribute("id", "scroll-calls")


    //waitConnection();

    function app_connected(domain, user, dn, appdomain) {
        userUI = user;
        app.send({ api: "user", mt: "UserMessage" });
        app.send({ api: "user", mt: "SelectMessage" });
        app.send({ api: "user", mt: "UserPresence" });
        connected();

        //avatar
        avatar = new innovaphone.Avatar(start, user, domain);
        teste = avatar.url(user, 100, dn);
        console.log("avatar" + JSON.stringify(teste));
        //avatar.onmessage.attach(testeavatar);
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
        var name = evt.currentTarget.innerText;
        updateScreen(id, name.split("\n")[0], type, prt, prt_user);
    };
    function findByPrt(prt) {
        return function (value) {
            if (value.prt == prt) {
                return true;
            }
            //countInvalidEntries++
            return false;
        }
    }
    function deleteById(id) {
        return function (value) {
            if (value.id != id) {
                return true;
            }
            //countInvalidEntries++
            return false;
        }
    }

    var list_users = [];
    var list_buttons = [];
    var popupOpen = false;
    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
            
        }
        if (obj.api == "user" && obj.mt == "SelectMessageSuccess") {
            console.log(obj.result);
            list_buttons = JSON.parse(obj.result);
            //connected(that);
            popButtons(list_buttons);
        }
        if (obj.api == "user" && obj.mt == "AlarmSuccessTrigged") {
            try {
                button_clicked = button_clicked.filter(deleteById(obj.alarm));
                var clicked = document.getElementById(obj.alarm);
                document.getElementById(obj.alarm).style.backgroundColor = "var(--button)";
            } catch {
                console.log("danilo req: Alarme acionado não estava ativo no botão.");
                
            } finally {
                //addNotification("out", "Alarme " + obj.alarm);
                addNotification('out', "Alarme " + obj.alarm)
                    .then(function (message) {
                        console.log(message);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
            //var clicked = document.getElementById(obj.src);
            //document.getElementById(obj.src).style.backgroundColor = "var(--button)";
            //if (clicked.className == "allbuttonClicked") {
            //    document.getElementById(obj.value).setAttribute("class", "allbutton");
            //}
        }
        if (obj.api == "user" && obj.mt == "ComboSuccessTrigged") {
            //var clicked = document.getElementById(obj.src);
            try {
                button_clicked = button_clicked.filter(deleteById(obj.src));
                document.getElementById(obj.src).style.backgroundColor = "";

            } catch {

            } finally {

            }
            //if (clicked.className == "allbuttonClicked") {
            //    document.getElementById(obj.value).setAttribute("class", "allbutton");
            //}
        }
        if (obj.api == "user" && obj.mt == "AlarmReceived") {
            console.log(obj.alarm);
            try {
                var button_found;
                list_buttons.forEach(function (l) {
                    if (l.button_prt == obj.alarm) {
                        button_found = l;
                    }
                })
                //var clicked = document.getElementById(obj.alarm);
                document.getElementById(obj.alarm).style.backgroundColor = "darkred";
                button_clicked.push({ id: String(obj.alarm), type: "alarm", name: button_found.button_name, prt: obj.alarm });
                console.log("danilo req: Lista de botões clicados atualizada: " + JSON.stringify(button_clicked));
            } catch (e){
                makePopup("ATENÇÃO", "<p class='popup-alarm-p'>Alarme Recebido: " + obj.alarm+"</p>", 500, 200);
            } finally {
                //addNotification("inc", "Alarme " + obj.alarm);
                addNotification('inc', "Alarme " + obj.alarm)
                    .then(function (message) {
                        console.log(message);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
            

        }
        if (obj.api == "user" && obj.mt == "VideoRequest") {
            console.log(obj.alarm);
            //document.getElementById(obj.alarm).setAttribute("class", "allbuttonClicked");
            updateScreen(obj.alarm, obj.name,"video", obj.alarm, "");
            //makePopup("Alarme Recebido!!!!", obj.alarm, 500, 200);
            //addNotification(">>>  " + obj.alarm);
        }
        if (obj.api == "user" && obj.mt == "PageRequest") {
            console.log(obj.alarm);
            //document.getElementById(obj.alarm).setAttribute("class", "allbuttonClicked");
            updateScreen(obj.alarm, obj.name, "page", obj.alarm, "");
            //makePopup("Alarme Recebido!!!!", obj.alarm, 500, 200);
            //addNotification(">>>  " + obj.alarm);
        }
        if (obj.api == "user" && obj.mt == "PopupRequest") {
            console.log(obj.alarm);
            //document.getElementById(obj.alarm).setAttribute("class", "allbuttonClicked");
            updateScreen(obj.alarm, obj.name, "popup", obj.alarm, "");
            //makePopup("Alarme Recebido!!!!", obj.alarm, 500, 200);
            //addNotification(">>>  " + obj.alarm);
        }
        if (obj.api == "user" && obj.mt == "CallRinging") {
            console.log(obj.src);
            var element = obj.src + "-status";
            console.log(element);
            try {
                document.getElementsByTagName("div")[obj.src + "-status"].style.backgroundColor = "rgb(187 205 72 / 84%)";
            } catch {
                console.log("CallRinging is not button");
            } finally {
                //makePopup("Chamada Conectada!!!!", obj.src, 500, 200);
                //addNotification("inc", "Tocando " + obj.src);
                addNotification('inc', "Tocando " + obj.src)
                    .then(function (message) {
                        console.log(message);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
        }
        if (obj.api == "user" && obj.mt == "ComboCallStart") {
            console.log(obj.src);
            var element = obj.src + "-status";
            console.log(element);
            try {
                var clicked = button_clicked.filter(findByPrt(obj.num));
                if (clicked.length == 0) {
                    var button_found;
                    list_buttons.forEach(function (l) {
                        if (l.button_prt == obj.num) {
                            button_found = l;
                        }
                    })
                    //var button = list_buttons.filter(findByPrt(obj.num));
                    var clicked = document.getElementById(obj.num);
                    if (clicked.style.backgroundColor != "darkred") {
                        document.getElementById(obj.num).style.backgroundColor = "darkred";
                        button_clicked.push({ id: button_found.button_prt, type: button_found.button_type, name: button_found.button_name, prt: obj.num });
                        console.log("danilo req: Lista de botões clicados atualizada: " + JSON.stringify(button_clicked));
                    }
                }
                

            } catch {
                console.log("CallRinging is not button");
            } finally {
                //makePopup("Chamada Conectada!!!!", obj.src, 500, 200);
                //addNotification("inc","Tocando " + obj.src);
            }
        }
        if (obj.api == "user" && obj.mt == "IncomingCallRinging") {
            console.log(obj.src);
            var element = obj.src + "-status";
            console.log(element);
            try {
                document.getElementsByTagName("div")[obj.src + "-status"].style.backgroundColor = "rgb(187 205 72 / 84%)";
            } catch {
                console.log("CallRinging is not button");
            } finally {
                //makePopup("Chamada Conectada!!!!", obj.src, 500, 200);
                //addNotification("inc", "Tocando " + obj.src);
                addNotification('inc', "Tocando " + obj.src)
                    .then(function (message) {
                        console.log(message);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
                if (obj.src == userUI && popupOpen == false) {
                    makePopup("Chamando", "<button type='button' class='popup-connect'>ATENDER</button><button type='button' class='popup-clear'>RECUSAR</button>", 400, 100);
                }
            }
        }
        if (obj.api == "user" && obj.mt == "CallConnected") {
            console.log(obj.src);
            var element = obj.src+"-status";
            console.log(element);
            try {
                document.getElementsByTagName("div")[obj.src + "-status"].style.backgroundColor = "rgb(231 8 8 / 48%)";
                //makePopup("Chamada Conectada!!!!", obj.src, 500, 200);
            } catch {
                console.log("CallConnected is not button");
            } finally {
                //addNotification("inc", "Conectado " + obj.src);
                addNotification('inc', "Conectado " + obj.src)
                    .then(function (message) {
                        console.log(message);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
                if (obj.src == userUI && popupOpen == true) {
                    popup.close();
                    popupOpen = false;
                }
            } 
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
            try {
                document.getElementsByTagName("div")[obj.src + "-status"].style.backgroundColor = "";
                var sipButton = document.getElementById(obj.src);
                if (sipButton.style.backgroundColor == "darkred") {
                    document.getElementById(obj.src).style.backgroundColor = "darkgreen";
                    //document.getElementById(value).setAttribute("class", "allbutton");
                }
            } catch {
                console.log("CallDisconnected not button");
            } finally {
                //makePopup("Chamada Desconectada!!!!", obj.src, 500, 200);
                //addNotification("inc","Desconectado " + obj.src);
                addNotification('inc', "Desconectado " + obj.src)
                    .then(function (message) {
                        console.log(message);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
                if (obj.src == userUI && popupOpen == true) {
                    popup.close();
                    popupOpen = false;
                }
            }
            try {
                if (obj.src == userUI) {
                    document.getElementById(obj.num).style.backgroundColor = "";
                }
                
            } catch {
                console.log("CallDisconnected number dialed not button");
            }
            
           

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

    /*
    function addNotification(flux, msg) {
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
        switch (flux) {
            case "inc":
                msg = "<img src='right-arrow.png' class='img-icon'><p>" + msg + "</p>";
                break;
            case "out":
                msg = "<img src='left-arrow.png' class='img-icon'><p>" + msg + "</p>";
                break;
        }
        var div = new innovaphone.ui1.Div(null, null, "notificationdown");
        div.addHTML(msg);
        var div3 = alarm.add(div);


        //alarm.add(div1);

    }

    */
    function addNotification(flux, msg) {
        return new Promise(function (resolve, reject) {
            try {
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
                div2.addHTML("<img src='clock.png' class='img-icon'>" + day + "/" + month + "/" + year + " " + hour + ":" + minutes + ":" + seconds);

                switch (flux) {
                    case "inc":
                        msg = "<img src='right-arrow.png' class='img-icon'><p>" + msg + "</p>";
                        break;
                    case "out":
                        msg = "<img src='left-arrow.png' class='img-icon'><p>" + msg + "</p>";
                        break;
                }

                var div = new innovaphone.ui1.Div(null, null, "notificationdown");
                div.addHTML(msg);
                var div3 = alarm.add(div);

                resolve('Notification added successfully.');
            } catch (error) {
                reject('Error adding notification: ' + error.message);
            }
        });
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
        var pageDivider = coldireita.add(new innovaphone.ui1.Div(null, null, "pageDivider"));

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
                var div1 = allbtn.add(new innovaphone.ui1.Div(null, null, "userbutton"));
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
            else if (object.button_type == "user") {
                var div1 = allbtn.add(new innovaphone.ui1.Div(null, null, "userbutton"));
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
            else if (object.button_type == "externalnumber") {
                var div1 = allbtn.add(new innovaphone.ui1.Div(null, null, "exnumberbutton"));
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
        var botoes = document.querySelectorAll(".exnumberbutton");
        for (var i = 0; i < botoes.length; i++) {
            var botao = botoes[i];
            // O jeito correto e padronizado de incluir eventos no ECMAScript
            // (Javascript) eh com addEventListener:
            botao.addEventListener("click", buttonClicked);
        }
        var botoes = document.querySelectorAll(".userbutton");
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

        var _popup = new innovaphone.ui1.Popup("position: absolute; display: inline-flex; left:50px; top:50px; align-content: center; justify-content: center; flex-direction: row; flex-wrap: wrap; width:" + width + "px; height:" + height + "px;", styles[0], h[0]);
        _popup.header.addText(header);
        _popup.content.addHTML(content);
        if (popupOpen == false) {
            var popupcloser = document.querySelectorAll(".popup-closer");
            for (var i = 0; i < popupcloser.length; i++) {
                var botao = popupcloser[i];
                // O jeito correto e padronizado de incluir eventos no ECMAScript
                // (Javascript) eh com addEventListener:
                botao.addEventListener("click", function () {
                    app.send({ api: "user", mt: "DecrementCount" });
                    popupOpen = false;
                });
            }
            var popupanswer = document.querySelectorAll(".popup-connect");
            for (var i = 0; i < popupanswer.length; i++) {
                var botao = popupanswer[i];
                // O jeito correto e padronizado de incluir eventos no ECMAScript
                // (Javascript) eh com addEventListener:
                botao.addEventListener("click", function () {
                    app.send({ api: "user", mt: "UserConnect" });
                    _popup.close();
                    popupOpen = false;
                });
            }
            var popupanswer = document.querySelectorAll(".popup-clear");
            for (var i = 0; i < popupanswer.length; i++) {
                var botao = popupanswer[i];
                // O jeito correto e padronizado de incluir eventos no ECMAScript
                // (Javascript) eh com addEventListener:
                botao.addEventListener("click", function () {
                    app.send({ api: "user", mt: "EndCall" });
                    _popup.close();
                    popupOpen = false;
                });
            }
            popup = _popup;
            popupOpen = true;
        }
    }

    function updateScreen(id, name, type, prt, prt_user) {
        var clicked = button_clicked.filter(findByPrt(prt));
        if (clicked.length > 0) {
            //DESATIVAR
            if (type == "page") {
                button_clicked.forEach(function (b) {
                    if (b.type == "page") {
                        document.getElementById(b.prt).style.backgroundColor = "";
                        try {
                            document.getElementsByClassName("pagebtn")[0].style.width = "";
                            var gfg_down = document.getElementsByClassName("colunapage")[0];
                            gfg_down.parentNode.removeChild(gfg_down);
                            document.getElementsByClassName("pageDivider")[0].style.display = "none";
                            document.getElementsByClassName("combobtn")[0].style.width = "";
                            document.getElementsByClassName("allbtn")[0].style.width = "";
                            document.getElementsByClassName("pagebtn")[0].style.width = "";
                        }
                        catch {
                            console.log("danilo req: Area de page já estava fechada");
                        }

                    }
                })
            }
            if (type == "user") {
                var found = list_users.indexOf(prt);
                if (found != -1) {
                    app.send({ api: "user", mt: "EndCall", prt: String(prt) })
                    document.getElementById(id).style.backgroundColor = "darkgreen";
                }
            }
            if (type == "externalnumber") {
                app.send({ api: "user", mt: "EndCall", prt: String(prt) })
                document.getElementById(id).style.backgroundColor = "";
            }
            if (type == "alarm") {
                app.send({ api: "user", mt: "DecrementCount" });
                app.send({ api: "user", mt: "TriggerStopAlarm", prt: String(prt) })
                document.getElementById(prt).style.backgroundColor = "var(--button)";
            }
            if (type == "video") {
                try {
                    var oldPlayer = document.getElementById('video-js');
                    videojs(oldPlayer).dispose();
                    container.clear();
                }
                catch {
                    container.clear();
                }
                app.send({ api: "user", mt: "TriggerStopVideo", prt: String(prt) })
                container.clear();
                container.add(new innovaphone.ui1.Node("img", "width:20%; height:20%;", null, null).setAttribute("src", "play.png"), null);

                document.getElementById(prt).style.backgroundColor = "var(--button)";
            }
            if (type == "combo") {
                document.getElementById(id).style.backgroundColor = "var(--button)";
            }
            //var btn = { id: id, type: type, name: name, prt: prt };
            //button_clicked.splice(button_clicked.indexOf(btn), 1);
            button_clicked = button_clicked.filter(deleteById(id));
            console.log("danilo req: Lista de botões clicados atualizada: " + JSON.stringify(button_clicked));
        }
        else {
            //ATIVAR
            var found = -1;
            if (type == "page") {
                button_clicked.forEach(function (b) {
                    if (b.type == "page") {
                        try {
                            //var btn = { id: b.id, type: b.type, name: b.name, prt: b.prt };
                            //button_clicked.splice(button_clicked.indexOf(btn), 1);
                            button_clicked = button_clicked.filter(deleteById(b.prt));
                            document.getElementById(b.prt).style.backgroundColor = "";
                            var gfg_down = document.getElementsByClassName("colunapage")[0];
                            gfg_down.parentNode.removeChild(gfg_down);
                            document.getElementsByClassName("pageDivider")[0].style.display = "none";
                            document.getElementsByClassName("combobtn")[0].style.width = "";
                            document.getElementsByClassName("allbtn")[0].style.width = "";
                            document.getElementsByClassName("pagebtn")[0].style.width = "";
                            
                        } catch {
                            console.log("danilo req: Area de page já estava fechada");
                        }
                    }
                })


                var is_button = document.getElementById(prt);
                if (is_button == null) {
                    makePopup("Popup", "<iframe src='" + prt + "' width='100%' height='100%' style='border:0;' allowfullscreen='' loading='lazy' referrerpolicy='no-referrer-when-downgrade'></iframe>", 800, 600);
                } else {

                    document.getElementsByClassName("combobtn")[0].style.width = "65%";
                    document.getElementsByClassName("allbtn")[0].style.width = "65%";
                    document.getElementsByClassName("pagebtn")[0].style.width = "65%";
                    document.getElementsByClassName("pageDivider")[0].style.display = "block";
                    document.getElementsByClassName("pageDivider")[0].style.left = "65%";
                    var colunapage = coldireita.add(new innovaphone.ui1.Div(null, null, "colunapage"));
                    colunapage.addHTML("<iframe id='iframepage' class='iframepage' src='" + prt + "' width='100%' height='100%' style='border:0; z-index:-1;' allowfullscreen='' loading='lazy' referrerpolicy='no-referrer-when-downgrade'></iframe>");
                    //makePopup("Página", "<iframe src='" + value + "' width='100%' height='100%' style='border:0;' allowfullscreen='' loading='lazy' referrerpolicy='no-referrer-when-downgrade'></iframe>", 600, 450);
                    //addNotification("out", name);
                    addNotification('out', name)
                        .then(function (message) {
                            console.log(message);
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                    app.send({ api: "user", mt: "TriggerStartPage", prt: String(prt) })
                    document.getElementById(prt).style.backgroundColor = "darkred";

                    //ARRASTAR E SOLTAR DIMENSÂO COLUNAS
                    // Obtenha as referências às DIVs que serão redimensionadas
                    var comboBtn = document.querySelector('.combobtn');
                    var allBtn = document.querySelector('.allbtn');
                    var pageBtn = document.querySelector('.pagebtn');
                    var pageColumn = document.querySelector('.colunapage');
                    //var iframe = document.querySelector('.iframepage');
                    
                    //// Adicione os manipuladores de eventos
                    var isDragging = false;
                    var startX = 0;
                    var btnWidth = 0;

                    var pageDivider = document.querySelector('.pageDivider');

                    pageDivider.addEventListener('mousedown', function (event) {
                        isDragging = true;

                        startX = event.pageX;
                        btnWidth = parseInt(getComputedStyle(allBtn).width, 10);
                    });

                    document.addEventListener('mousemove', function (event) {
                        if (!isDragging) {
                            return;
                        }
                        var offset = event.pageX - startX;
                        var newBtnWidth = btnWidth + offset;

                        // Verifique se a nova largura está dentro dos limites permitidos
                        if (newBtnWidth > 0 && newBtnWidth < window.innerWidth * 0.8) {
                            comboBtn.style.width = newBtnWidth - 5 + 'px';
                            allBtn.style.width = newBtnWidth - 5 + 'px';
                            pageBtn.style.width = newBtnWidth - 5 + 'px';

                            pageDivider.style.left = newBtnWidth - 5 + 'px';
                            pageColumn.style.left = newBtnWidth + 5 + 'px';
                        }

                    });

                    //var iframe = document.getElementById('iframepage');
                    pageColumn.addEventListener('mousemove', function (event) {
                        // faça algo quando o mouse se mover dentro do iframe
                        if (!isDragging) {
                            return;
                        }
                        var offset = event.pageX - startX;
                        var newBtnWidth = btnWidth + event.pageX;

                    //    // Verifique se a nova largura está dentro dos limites permitidos
                        if (newBtnWidth > 0 && newBtnWidth < window.innerWidth * 0.8) {
                            comboBtn.style.width = newBtnWidth - 5 + 'px';
                            allBtn.style.width = newBtnWidth - 5 + 'px';
                            pageBtn.style.width = newBtnWidth - 5 + 'px';

                            pageDivider.style.left = newBtnWidth - 5 + 'px';
                            pageColumn.style.left = newBtnWidth + 'px';
                        }
                    });
                    pageColumn.addEventListener('mouseup', function () {
                        isDragging = false;
                    });

                    document.addEventListener('mouseup', function () {
                        isDragging = false;
                    });


                    found = 1;
                }
            }
            if (type == "user") {
                found = list_users.indexOf(prt);
                if (found != -1) {
                    app.send({ api: "user", mt: "TriggerCall", prt: String(prt) })
                    //addNotification("out", name);
                    addNotification('out', name)
                        .then(function (message) {
                            console.log(message);
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                    document.getElementById(id).style.backgroundColor = "darkred";
                }
            }
            if (type == "popup") {
                makePopup("Popup", "<iframe src='" + prt + "' width='100%' height='100%' style='border:0;' allowfullscreen='' loading='lazy' referrerpolicy='no-referrer-when-downgrade'></iframe>", 800, 600);
                app.send({ api: "user", mt: "TriggerStartPopup", prt: String(prt) })
            }
            if (type == "externalnumber") {
                app.send({ api: "user", mt: "TriggerCall", prt: String(prt) })
                //addNotification("out", name);
                addNotification('out', name)
                    .then(function (message) {
                        console.log(message);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
                document.getElementById(id).style.backgroundColor = "darkred";
                found = 1;
            }
            if (type == "alarm") {
                app.send({ api: "user", mt: "TriggerAlert", prt: String(prt) })
                document.getElementById(prt).style.backgroundColor = "darkred";
                found = 1;
            }
            if (type == "video") {
                button_clicked.forEach(function (b) {
                    if (b.type == "video") {
                        try {
                            //var btn = { id: b.id, type: b.type, name: b.name, prt: b.prt };
                            //button_clicked.splice(button_clicked.indexOf(btn), 1);
                            button_clicked = button_clicked.filter(deleteById(b.prt));
                            document.getElementById(b.prt).style.backgroundColor = "";

                        } catch {
                            console.log("danilo req: Area de video já estava fechada, vamos abrir um novo video");
                        }
                    }
                })
                try {
                    var oldPlayer = document.getElementById('video-js');
                    videojs(oldPlayer).dispose();
                    container.clear();
                }
                catch {
                    container.clear();
                }
                app.send({ api: "user", mt: "TriggerStartVideo", prt: String(prt) })
                //addNotification("out" , name);
                addNotification('out', name)
                    .then(function (message) {
                        console.log(message);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
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
                found = 1;
                        //document.getElementById(value).setAttribute("class", "allbuttonClicked");
                        
            }
            if (type == "combo") {
                app.send({ api: "user", mt: "TriggerCombo", prt: String(id) })
                //addNotification("out", name);
                addNotification('out', name)
                    .then(function (message) {
                        console.log(message);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
                document.getElementById(id).style.backgroundColor = "darkred";
                found = 1;
            }
            if (type != "popup" && found != -1) {
                button_clicked.push({ id: id, type: type, name: name, prt: prt });
                console.log("danilo req: Lista de botões clicados atualizada: " + JSON.stringify(button_clicked));
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

    function waitConnection() {
        that.clear();
        var bodywait = new innovaphone.ui1.Div("height: 100%; width: 100%; display: inline-flex; position: absolute;justify-content: center; background-color:rgba(100,100,100,0.5)", null, "bodywaitconnection")
        bodywait.addHTML('<svg class="pl" viewBox="0 0 128 128" width="128px" height="128px" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="hsl(193,90%,55%)" /><stop offset="100%" stop-color="hsl(223,90%,55%)" /></linearGradient></defs>	<circle class="pl__ring" r="56" cx="64" cy="64" fill="none" stroke="hsla(0,10%,10%,0.1)" stroke-width="16" stroke-linecap="round" />	<path class="pl__worm" d="M92,15.492S78.194,4.967,66.743,16.887c-17.231,17.938-28.26,96.974-28.26,96.974L119.85,59.892l-99-31.588,57.528,89.832L97.8,19.349,13.636,88.51l89.012,16.015S81.908,38.332,66.1,22.337C50.114,6.156,36,15.492,36,15.492a56,56,0,1,0,56,0Z" fill="none" stroke="url(#pl-grad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="44 1111" stroke-dashoffset="10" /></svg >');
        that.add(bodywait);
    }

    function connected() {
        that.clear();
        //Coluna Esquerda
        var col_esquerda = that.add(new innovaphone.ui1.Div(null, null, "colunaesquerda"));
        var _container = col_esquerda.add(new innovaphone.ui1.Div("display: flex; justify-content: center; position: absolute; height: 40%; width: 100%; align-items: center;", new innovaphone.ui1.Node("img", "width:20%; height:20%;", null, null).setAttribute("src", "play.png"), null));

        //Coluna Direita
        var col_direita = that.add(new innovaphone.ui1.Div(null, null, "colunadireita"));
        //var videoPlayer = colesquerda.add(new innovaphone.ui1.Node("video", "position: absolute ;width:100%; height:40%; border: 0px;", null, null));
        //videoPlayer.setAttribute("src", "https://www.youtube.com/embed/gz8tmR43AJE");
        _container.setAttribute("id", "containerPlayer");
        var _call = col_esquerda.add(new innovaphone.ui1.Div(null, null, "call-container"));
        var _history = _call.add(new innovaphone.ui1.Div("height: 10%; width: 100%; background-color:black; color:white; text-align: center; font-weight:bold; font-size: 22px", texts.text("labelHistorico"), "divhistory"))
        var _scroll = _call.add(new innovaphone.ui1.Node("scroll-container", null, null, "scroll-container"));
        _scroll.setAttribute("id", "scroll-calls")
        coldireita = col_direita;
        colesquerda = col_esquerda;
        container = _container;
        scroll = _scroll;
        
        //ARRASTAR E SOLTAR DIMENSÂO COLUNAS
        // Obtenha as referências às DIVs que serão redimensionadas
        var leftColumn = document.querySelector('.colunaesquerda');
        var rightColumn = document.querySelector('.colunadireita');

        // Crie uma DIV para a barra de divisão
        var divider = document.createElement('div');
        divider.style.position = 'absolute';
        divider.style.width = '5px';
        divider.style.left = '15%';
        divider.style.height = '100%';
        divider.style.cursor = 'ew-resize';
        rightColumn.parentNode.insertBefore(divider, rightColumn);

        // Adicione os manipuladores de eventos
        var isDragging = false;
        var startX = 0;
        var startWidth = 0;

        divider.addEventListener('mousedown', function (event) {
            isDragging = true;
            startX = event.pageX;
            startWidth = parseInt(getComputedStyle(leftColumn).width, 10);
        });

        document.addEventListener('mousemove', function (event) {
            if (!isDragging) {
                return;
            }

            var offset = event.pageX - startX;
            var newWidth = startWidth + offset;

            // Verifique se a nova largura está dentro dos limites permitidos
            if (newWidth > 0 && newWidth < window.innerWidth * 0.8) {
                leftColumn.style.width = newWidth + 'px';
                var rightWidth = window.innerWidth - newWidth;
                rightColumn.style.width = rightWidth - 5 + 'px';
                rightColumn.style.left = newWidth + 5 + 'px';
                divider.style.left = newWidth + 'px';
            }
        });

        document.addEventListener('mouseup', function () {
            isDragging = false;
        });
    }

    function calllistonmessage(consumer, obj) {
        if (obj.msg) {
            console.log("::calllistApi::onmessage() msg=" + JSON.stringify(obj.msg));
            app.send({ api: "user", mt: "CallHistoryEvent", obj: JSON.stringify(obj.msg) });
        }
    }

}

Wecom.novaalert.prototype = innovaphone.ui1.nodePrototype;
