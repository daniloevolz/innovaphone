
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
    var phoneApi = start.consumeApi("com.innovaphone.phone");
    var calllistApi = start.consumeApi("com.innovaphone.calllist");
    var avatar = start.consumeApi("com.innovaphone.avatar");
    calllistApi.send({ mt: "Subscribe", count: 1 }, "*");
    calllistApi.onmessage.attach(calllistonmessage);

    var colorSchemes = {
        dark: {
            "--bg": "url('wecom-white.png')",
            "--button": "#929292",
            "--text-standard": "white",
        },
        light: {
            "--bg": "url('wecom-white.png')",
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
    app.onclosed = waitConnection;
    app.onerror = waitConnection;
    waitConnection();

    //Var globais das divs
    var userUI;
    var colesquerda;
    var container;
    var coldireita;
    var divButtonsMain;
    var divOptionsMain;
    var zoneDiv;

    var scroll;
    var popup;
    var teste;
    var button_clicked = [];
    var list_users = [];
    var list_buttons = [];
    var popupOpen = false;
    var session;


    function app_connected(domain, user, dn, appdomain) {
        app.send({api: "user", mt: "SelectAllInfo"})
        userUI = user;
        var browserName = navigator.appCodeName;
        console.log("Navegador:", browserName);
        
        var screenWidth = window.screen.width;
        var screenHeight = window.screen.height;
        console.log("Resolução da tela:", screenWidth, "x", screenHeight);
                

        if (app.logindata.info.unlicensed) {
            //sem licença
            app.send({ api: "user", mt: "UserSession", info: browserName }); //Inicializa o ramal
        }
        else {
            //licenciado
            app.send({ api: "user", mt: "UserSession", info: browserName }); //Inicializa o ramal

        }

        //avatar
        avatar = new innovaphone.Avatar(start, user, domain);
        teste = avatar.url(user, 100, dn);
        console.log("avatar" + JSON.stringify(teste));

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

    var buttonClicked = function (evt) {
        // Dentro do objeto evt esta o target, e o target tem um value:
        
        var type = evt.currentTarget.attributes['button_type'].value;
        var prt = evt.currentTarget.attributes['button_prt'].value;
        //var btn_id = evt.currentTarget.attributes['button_id'].value;
        var id = evt.currentTarget.attributes['id'].value;

        //try {
        //    var prt_user = evt.currentTarget.attributes['button_prt_user'].value;
        //} catch {
        //    var prt_user = "";
        //}
        var name = evt.currentTarget.innerText;
        updateScreen(id, name.split("\n")[0], type, prt);
    };
    function findById(id) {
        return function (value) {
            if (String(value.id) == String(id)) {
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

    
    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserSessionResult") {
            console.log(obj.session);
            session = obj.session;
            app.send({ api: "user", mt: "InitializeMessage", session: session }); //Inicializa o ramal
        }
        if (obj.api == "user" && obj.mt == "NoLicense") {
            console.log(obj.result);
            makeDivNoLicense(obj.result);
        }
        if (obj.api == "user" && obj.mt == "UserInitializeResultSuccess") {
            app.send({ api: "user", mt: "SelectMessage" }); //Requisita os botões
        }
        if (obj.api == "user" && obj.mt == "SelectMessageSuccess") {
            connected();
            console.log(obj.result);
            list_buttons = JSON.parse(obj.result);
            popButtons(list_buttons,1); //Cria os botões na tela
            app.send({ api: "user", mt: "UserPresence" }); //Requisita a lista de ususários conectados
        }
        if (obj.api == "user" && obj.mt == "UserConnected") {
            console.log(obj.src);
            updateListUsers(obj.src, obj.mt);
            try {
                // Obtém todos os elementos com o parâmetro btn_id igual a obj.alarm
                var elementos = document.querySelectorAll('[button_prt="' + obj.src + '"]');

                // Percorre cada elemento encontrado
                for (var i = 0; i < elementos.length; i++) {
                    var elemento = elementos[i];

                    // Altera as características do elemento
                    elemento.style.backgroundColor = "darkgreen";
                }
                //document.getElementById(obj.src).style.backgroundColor = "darkgreen";
            } catch {
                console.log("UserConnected not button");
            }

        }
        if (obj.api == "user" && obj.mt == "UserDisconnected") {
            console.log(obj.src);
            updateListUsers(obj.src, obj.mt);
            try {
                // Obtém todos os elementos com o parâmetro btn_id igual a obj.alarm
                var elementos = document.querySelectorAll('[button_prt="' + obj.src + '"]');

                // Percorre cada elemento encontrado
                for (var i = 0; i < elementos.length; i++) {
                    var elemento = elementos[i];

                    // Altera as características do elemento
                    elemento.style.backgroundColor = "var(--button)";
                    elemento.style.borderColor = "var(--button)";
                }
                //document.getElementById(obj.src).style.backgroundColor = "var(--button)";
                //document.getElementById(obj.src).style.borderColor = "var(--button)";
            } catch {
                console.log("UserDisconnected not button");
            }

        }
        if (obj.api == "user" && obj.mt == "AlarmSuccessTrigged") {
            try {
                button_clicked = button_clicked.filter(deleteById(obj.btn_id));
                var clicked = document.getElementById(obj.btn_id);
                var elemento = document.getElementById(obj.btn_id)
                elemento.children[0].classList.add("gold-900")
                elemento.children[1].classList.add("gold-600")
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
                        button_found.push(l);
                    }
                })
                //var clicked = document.getElementById(obj.alarm);
                //document.getElementById(obj.alarm).style.backgroundColor = "darkred";

                // Obtém todos os elementos com o parâmetro btn_id igual a obj.alarm
                var elementos = document.querySelectorAll('[button_prt="' + obj.alarm + '"]');

                // Percorre cada elemento encontrado
                for (var i = 0; i < elementos.length; i++) {
                    var elemento = elementos[i];

                    // Altera as características do elemento
                    elemento.style.backgroundColor = "darkred";
                    button_clicked.push({ id: String(elemento.id), type: "alarm", name: button_found[i].button_name, prt: obj.alarm });
                }


                
                console.log("danilo req: Lista de botões clicados atualizada: " + JSON.stringify(button_clicked));
            } catch (e){
                makePopup("ATENÇÃO", "<p class='popup-alarm-p'>Alarme Recebido: " + obj.alarm + "</p><br/><p class='popup-alarm-p'>Origem: " + obj.src +"</p>", 500, 200);
            } finally {
                //addNotification("inc", "Alarme " + obj.alarm);
                addNotification('inc', "Alarme " + obj.alarm +" de "+obj.src)
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
            updateScreen(obj.btn_id, obj.name,"video", obj.alarm);
            //makePopup("Alarme Recebido!!!!", obj.alarm, 500, 200);
            //addNotification(">>>  " + obj.alarm);
        }
        if (obj.api == "user" && obj.mt == "PageRequest") {
            console.log(obj.alarm);
            //document.getElementById(obj.alarm).setAttribute("class", "allbuttonClicked");
            updateScreen(obj.btn_id, obj.name, "page", obj.alarm);
            //makePopup("Alarme Recebido!!!!", obj.alarm, 500, 200);
            //addNotification(">>>  " + obj.alarm);
        }
        if (obj.api == "user" && obj.mt == "PopupRequest") {
            console.log(obj.alarm);
            //document.getElementById(obj.alarm).setAttribute("class", "allbuttonClicked");
            updateScreen(obj.btn_id, obj.name, "popup", obj.alarm);
            //makePopup("Alarme Recebido!!!!", obj.alarm, 500, 200);
            //addNotification(">>>  " + obj.alarm);
        }
        if (obj.api == "user" && obj.mt == "ButtonRequest") {
            console.log(obj.button);
            var btn = JSON.parse(obj.button);
            updateScreen(btn.id, btn.button_name, btn.button_type, btn.button_prt);
 
        }
        if (obj.api == "user" && obj.mt == "CallRinging") {
            console.log(obj.src);
            var element = obj.src + "-status";
            console.log(element);
            try {
                // Obtém todos os elementos com o parâmetro btn_id igual a obj.alarm
                var elementos = document.querySelectorAll('[button_prtstatus="' + obj.src + '-status"]');

                // Percorre cada elemento encontrado
                for (var i = 0; i < elementos.length; i++) {
                    var elemento = elementos[i];

                    var primeiroFilho = elemento.children[0];
                    primeiroFilho.classList.add("gold-900")
                    var segundoFilho = elemento.children[1];
                    segundoFilho.classList.add("gold-600")
                }
                //document.getElementsByTagName("div")[obj.src + "-status"].style.backgroundColor = "rgb(187 205 72 / 84%)";
                // addNotification('inc', "Tocando " + obj.src)
                //     .then(function (message) {
                //         console.log(message);
                //     })
                //     .catch(function (error) {
                //         console.log(error);
                //     });
            } catch (e){
                console.log("CallRinging is not button");
            }
            try {
                // Obtém todos os elementos com o parâmetro btn_id igual a obj.alarm
                var elementos = document.querySelectorAll('[button_prtstatus="' + obj.num + '-status"]');

                // Percorre cada elemento encontrado
                for (var i = 0; i < elementos.length; i++) {
                    var elemento = elementos[i];

                    var primeiroFilho = elemento.children[0];
                    primeiroFilho.classList.add("gold-900")
                    var segundoFilho = elemento.children[1];
                    segundoFilho.classList.add("gold-600")
                }
                //document.getElementsByTagName("div")[obj.num + "-status"].style.backgroundColor = "rgb(187 205 72 / 84%)";
                // addNotification('inc', "Tocando " + obj.num)
                //     .then(function (message) {
                //         console.log(message);
                //     })
                //     .catch(function (error) {
                //         console.log(error);
                //     });
            } catch (e){
                console.log("CallRinging is not button");
            } 
        }
        if (obj.api == "user" && obj.mt == "ComboCallStart") {
            console.log(obj.src);
            var element = obj.src + "-status";
            console.log(element);
            try {
                var clicked = button_clicked.filter(findById(obj.btn_id));
                if (clicked.length == 0) {
                    var button_found;
                    list_buttons.forEach(function (l) {
                        if (l.id == obj.btn_id) {
                            button_found = l;
                        }
                    })
                    //var button = list_buttons.filter(findByPrt(obj.num));
                    var clicked = document.getElementById(obj.btn_id);
                    if (clicked.style.backgroundColor != "darkred") {
                        document.getElementById(obj.btn_id).style.backgroundColor = "darkred";
                        button_clicked.push({ id: button_found.id, type: button_found.button_type, name: button_found.button_name, prt: obj.num });
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
                // Obtém todos os elementos com o parâmetro btn_id igual a obj.alarm
                var elementos = document.querySelectorAll('[button_prtstatus="' + obj.src + '-status"]');

                // Percorre cada elemento encontrado
                for (var i = 0; i < elementos.length; i++) {
                    var elemento = elementos[i];

                    var primeiroFilho = elemento.children[0];
                    primeiroFilho.classList.add("gold-900")
                    var segundoFilho = elemento.children[1];
                    segundoFilho.classList.add("gold-600")
                }
                //document.getElementsByTagName("div")[obj.src + "-status"].style.backgroundColor = "rgb(187 205 72 / 84%)";
                // addNotification('inc', "Tocando " + obj.src)
                //     .then(function (message) {
                //         console.log(message);
                //     })
                //     .catch(function (error) {
                //         console.log(error);
                //     });
            } catch (e){
                console.log("CallRinging is not button");
            }
            try {
                // Obtém todos os elementos com o parâmetro btn_id igual a obj.alarm
                var elementos = document.querySelectorAll('[button_prtstatus="' + obj.num + '-status"]');

                // Percorre cada elemento encontrado
                for (var i = 0; i < elementos.length; i++) {
                    var elemento = elementos[i];
    
                    var primeiroFilho = elemento.children[0];
                    primeiroFilho.classList.add("gold-900")
                    var segundoFilho = elemento.children[1];
                    segundoFilho.classList.add("gold-600")
                }
                //document.getElementsByTagName("div")[obj.num + "-status"].style.backgroundColor = "rgb(187 205 72 / 84%)";
                // addNotification('inc', "Tocando " + obj.num)
                //     .then(function (message) {
                //         console.log(message);
                //     })
                //     .catch(function (error) {
                //         console.log(error);
                //     });
            } catch (e){
                console.log("CallRinging is not button");
            }
            
            if (obj.src == userUI && popupOpen == false) {
                makePopupCall("Chamando", "<button type='button' class='popup-connect'>ATENDER</button><button type='button' class='popup-clear'>RECUSAR</button>", 400, 100, obj.btn_id);
            }
        }
        if (obj.api == "user" && obj.mt == "CallConnected") {
            console.log(obj.src);
            var element = obj.src+"-status";
            console.log(element);
            try {
                // Obtém todos os elementos com o parâmetro btn_id igual a obj.alarm
                var elementos = document.querySelectorAll('[button_prtstatus="' + obj.src + '-status"]');

                // Percorre cada elemento encontrado
                for (var i = 0; i < elementos.length; i++) {
                    var elemento = elementos[i];

                    var primeiroFilho = elemento.children[0];
                    primeiroFilho.classList.remove("gold-900","verde-900")
                    primeiroFilho.classList.add("vermelho-900")
                    var segundoFilho = elemento.children[1];
                    segundoFilho.classList.remove("gold-600","verde-600")
                    segundoFilho.classList.add("vermelho-600")
                }
                //document.getElementsByTagName("div")[obj.src + "-status"].style.backgroundColor = "rgb(231 8 8 / 48%)";
                // addNotification('inc', "Conectado " + obj.src)
                //     .then(function (message) {
                //         console.log(message);
                //     })
                //     .catch(function (error) {
                //         console.log(error);
                //     });
            } catch (e){
                console.log("CallConnected is not button");
            }
            try {
                // Obtém todos os elementos com o parâmetro btn_id igual a obj.alarm
                var elementos = document.querySelectorAll('[button_prtstatus="' + obj.num + '-status"]');

                // Percorre cada elemento encontrado
                for (var i = 0; i < elementos.length; i++) {
                    var elemento = elementos[i];

        
                    var primeiroFilho = elemento.children[0];
                    primeiroFilho.classList.remove("gold-900")
                    primeiroFilho.classList.add("vermelho-900")
                    var segundoFilho = elemento.children[1];
                    segundoFilho.classList.remove("gold-600")
                    segundoFilho.classList.add("vermelho-600")
                }
                //document.getElementsByTagName("div")[obj.num + "-status"].style.backgroundColor = "rgb(231 8 8 / 48%)";
                // addNotification('inc', "Conectado " + obj.num)
                //     .then(function (message) {
                //         console.log(message);
                //     })
                //     .catch(function (error) {
                //         console.log(error);
                //     });
            } catch (e){
                console.log("CallConnected is not button");
            }
            if (obj.src == userUI && popupOpen == true) {
                popup.close();
                popupOpen = false;
            }
        }
        if (obj.api == "user" && obj.mt == "CallDisconnected") {
            console.log(obj.src);
            var element = obj.src + "-status";
            console.log(element);
            try {
                // Obtém todos os elementos com o parâmetro btn_id igual a obj.alarm
                var elementos = document.querySelectorAll('[button_prtstatus="' + obj.src + '-status"]');

                // Percorre cada elemento encontrado
                for (var i = 0; i < elementos.length; i++) {
                    var elemento = elementos[i];

                    var primeiroFilho = elemento.children[0];
                    primeiroFilho.classList.remove("gold-900","vermelho-900")
                    primeiroFilho.classList.add("verde-900")
                    var segundoFilho = elemento.children[1];
                    segundoFilho.classList.remove("vermelho-600","gold-600")
                    segundoFilho.classList.add("verde-600")
                }
                //document.getElementsByTagName("div")[obj.src + "-status"].style.backgroundColor = "";
                //var sipButton = document.getElementById(obj.src);
                //if (sipButton.style.backgroundColor == "darkred") {
                //    document.getElementById(obj.src).style.backgroundColor = "darkgreen";
                //    //document.getElementById(value).setAttribute("class", "allbutton");
                //}
                // addNotification('inc', "Desconectado " + obj.src)
                //     .then(function (message) {
                //         console.log(message);
                //     })
                //     .catch(function (error) {
                //         console.log(error);
                //     });
            } catch (e){
                console.log("CallDisconnected not button");
            }
            try {
                // Obtém todos os elementos com o parâmetro btn_id igual a obj.alarm
                var elementos = document.querySelectorAll('[button_prtstatus="' + obj.num + '-status"]');

                // Percorre cada elemento encontrado
                for (var i = 0; i < elementos.length; i++) {
                    var elemento = elementos[i];

                    var primeiroFilho = elemento.children[0];
                    primeiroFilho.classList.remove("gold-900","vermelho-900")
                    primeiroFilho.classList.add("verde-900")
                    var segundoFilho = elemento.children[1];
                    segundoFilho.classList.remove("vermelho-600","gold-600")
                    segundoFilho.classList.add("verde-600")
                }
                //document.getElementsByTagName("div")[obj.num + "-status"].style.backgroundColor = "";
                //var sipButton = document.getElementById(obj.btn_);
                //if (sipButton.style.backgroundColor == "darkred") {
                //    document.getElementById(obj.).style.backgroundColor = "darkgreen";
                //    //document.getElementById(value).setAttribute("class", "allbutton");
                //}
                // addNotification('inc', "Desconectado " + obj.num)
                //     .then(function (message) {
                //         console.log(message);
                //     })
                //     .catch(function (error) {
                //         console.log(error);
                //     });
            } catch (e){
                console.log("CallDisconnected not button");
            }
            try {
                var user_conn = list_users.filter(function (user) { return user == obj.src });
                if (obj.src == userUI && user_conn.length > 0) {
                    document.getElementById(obj.btn_id).style.backgroundColor = "darkgreen";
                } else {
                    document.getElementById(obj.btn_id).style.backgroundColor = "";
                }
            } catch (e){
                console.log("CallDisconnected number dialed not button");
            }
            if (obj.src == userUI && popupOpen == true) {
                popup.close();
                popupOpen = false;
            }
            button_clicked = button_clicked.filter(deleteById(obj.btn_id));
            console.log("danilo req: Lista de botões clicados atualizada: " + JSON.stringify(button_clicked));
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
        if (obj.api == "user" && obj.mt == "SensorAllInfoResult") {
            console.log("list_history " + JSON.stringify(obj.result))
        }
        if (obj.api == "user" && obj.mt == "SensorReceived") {
            //atualizar as divs dos sensores com as novas informações
            // ~pietro
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

    function checkZero(data) {
        if (data.length == 1) {
            data = "0" + data;
        }
        return data;
    }
    function makeDivNoLicense(msg) {
        that.clear();
        //Titulo 
        that.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:100%; top:40%; font-size:18px; text-align:center; font-weight: bold; color: darkblue;", msg));

    }
    function popButtons(buttons,page) {

        // var combobtn = coldireita.add(new innovaphone.ui1.Div(null, null, "combobtn"));
        // var allbtn = coldireita.add(new innovaphone.ui1.Div(null, null, "allbtn"));
        // var pagebtn = coldireita.add(new innovaphone.ui1.Div(null, null, "pagebtn"));
        // var pageDivider = coldireita.add(new innovaphone.ui1.Div(null, null, "pageDivider"));

          // div botão combo
          var combobtnDiv = divButtonsMain.add(new innovaphone.ui1.Div(null, null, "combobtn"));
          for (let i = 1; i < 6 ; i++) {
          var combobtn = combobtnDiv.add(new innovaphone.ui1.Div(null,null,"btnEmpty combobutton"))
            
            combobtn.setAttribute("page",page)
            combobtn.setAttribute("position-x", 1); 
            combobtn.setAttribute("position-y", i); 
          }

        // linha divisória (hr)
        var dividerLine = divButtonsMain.add(new innovaphone.ui1.Node("hr",null,null,"divider"))

        // div sensores 💣💣💣
            var sensoresBtnDiv = divButtonsMain.add(new innovaphone.ui1.Div(null,null,"sensorBtnDiv"))
            for (let i = 1; i < 6 ; i++) {
                var sensorBtn = sensoresBtnDiv.add(new innovaphone.ui1.Div(null,null,"btnEmpty sensorButton"))
                
                sensorBtn.setAttribute("page",page)
                sensorBtn.setAttribute("position-x", 2); 
                sensorBtn.setAttribute("position-y", i); 
        }

          // linha divisória (hr)
          var dividerLine = divButtonsMain.add(new innovaphone.ui1.Node("hr",null,null,"divider"))
   
          var allbtnDiv = divButtonsMain.add(new innovaphone.ui1.Div(null, null, "allbtn"));
          for (let i = 1; i < 26; i++) {
     
            var positionX = Math.ceil(i / 5) + 2; // 5/5 = 1 + 2  é = 3  e assim vai sempre ate 7
            var positionY = i % 5 === 0 ? 5 : i % 5; // 5%5 = 1 e assim vai 
        
            var allbtn = allbtnDiv.add(new innovaphone.ui1.Div(null, null, "btnEmpty"));
            
            allbtn.setAttribute("page",page)
            allbtn.setAttribute("position-x", positionX);
            allbtn.setAttribute("position-y", positionY);
        }
          // cameras sensores graficos planta baixa
          var optionsDiv = divOptionsMain.add(new innovaphone.ui1.Div(null, null, "optionsDiv"));
          for (let i = 0; i < 5; i++) {

             var imgAndTexts = {
                './images/map.svg': texts.text("labelPlantaBaixa") ,'./images/location.svg': texts.text("labelMaps"),
                './images/wifi.svg': texts.text("labelSensors"),'./images/warning.svg': texts.text("labelPlantaBaixa"),
                './images/camera.svg': texts.text("labelCams")
             }
            
              var optionsDivBtn = optionsDiv.add(new innovaphone.ui1.Div(null, null, "optionsBtn"));
                var divTop = optionsDivBtn.add(new innovaphone.ui1.Div(null, null, "buttontop neutro-800"));
                var imgTop = divTop.add(new innovaphone.ui1.Node("img",null,null,null))
                imgTop.setAttribute("src",Object.keys(imgAndTexts)[i])
                var divBottom = optionsDivBtn.add(new innovaphone.ui1.Div(null, imgAndTexts[Object.keys(imgAndTexts)[i]], "buttondown neutro-900"));
              
          }

           //paginas de 1 - 5
           var pagesDiv = divOptionsMain.add(new innovaphone.ui1.Div(null,null,"div-page"))
           for (let i = 1; i < 6 ; i++) {
               var pagesBtnDiv = pagesDiv.add(new innovaphone.ui1.Div(null,null,"pagina"))    
               var pagesBtnText = pagesBtnDiv.add(new innovaphone.ui1.Div(null,null,"framePagesText"))   
               var textBtn = pagesBtnText.add(new innovaphone.ui1.Div(null,"Página " + i,"text-wrapper-Pages"))  
               pagesBtnDiv.setAttribute("page", i )
           }     
       
        //var allbtn = document.getElementById("allbtn");
        console.log("TODOS OS BOTÕES " + "\n" + JSON.stringify(buttons))
        makeAllButtons(buttons,page)
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
        var pages = document.querySelectorAll(".pagina")
        pages.forEach(function(page){
            page.addEventListener("click", function(evt){
                var divPrincipal = document.getElementById("divMainButtons")
                var divOptions = document.getElementById("divOptions")
                var pageAttribute = page.getAttribute("page")
                divPrincipal.setAttribute("page",pageAttribute)
                divPrincipal.innerHTML = ''
                divOptions.innerHTML = ''
                popButtons(buttons,pageAttribute)
            });
        })
        

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
    function makePopupCall(header, content, width, height) {
        console.log("makePopupCall");
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
                    popupOpen = false;
                });
            }
            var popupanswer = document.querySelectorAll(".popup-connect");
            for (var i = 0; i < popupanswer.length; i++) {
                var botao = popupanswer[i];
                // O jeito correto e padronizado de incluir eventos no ECMAScript
                // (Javascript) eh com addEventListener:
                botao.addEventListener("click", function () {
                    //app.send({ api: "user", mt: "UserConnect", btn_id: btn_id });
                    console.warn("::ConnectCall::");
                    phoneApi.send({ mt: "ConnectCall" });
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
                    //app.send({ api: "user", mt: "EndCall", btn_id: btn_id });
                    console.warn("::DisconnectCall::");
                    phoneApi.send({ mt: "DisconnectCall" });
                    _popup.close();
                    popupOpen = false;
                });
            }
            popup = _popup;
            popupOpen = true;
        }
    }

    function updateScreen(id, name, type, prt) {
        var clicked = button_clicked.filter(findById(id));
        if (clicked.length > 0) {
            //DESATIVAR
            if (type == "page") {
                button_clicked.forEach(function (b) {
                    if (b.type == "page" && b.prt==prt) {
                        document.getElementById(b.id).style.backgroundColor = "";
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
                    app.send({ api: "user", mt: "EndCall", prt: String(prt), btn_id: String(id)})
                    document.getElementById(id).style.backgroundColor = "darkgreen";
                }
            }
            if (type == "externalnumber") {
                app.send({ api: "user", mt: "EndCall", prt: String(prt), btn_id: String(id) })
                document.getElementById(id).style.backgroundColor = "";
            }
            if (type == "alarm") {
                app.send({ api: "user", mt: "DecrementCount" });
                app.send({ api: "user", mt: "TriggerStopAlarm", prt: String(prt), btn_id: String(id) })
                var elemento = document.getElementById(id);
                elemento.children[0].classList.remove("vermelho-900")
                elemento.children[1].classList.remove("vermelho-600")
                elemento.children[0].classList.add("gold-900")
                elemento.children[1].classList.add("gold-600")
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
                app.send({ api: "user", mt: "TriggerStopVideo", prt: String(prt), btn_id: String(id) })
                container.clear();
                container.add(new innovaphone.ui1.Node("img", "width:20%; height:20%; max-width: 100px;", null, null).setAttribute("src", "./images/play.png"), null);

                document.getElementById(id).style.backgroundColor = "var(--button)";
            }
            if (type == "combo") {
                document.getElementById(id).style.backgroundColor = "";
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
                            button_clicked = button_clicked.filter(deleteById(b.id));
                            document.getElementById(b.id).style.backgroundColor = "";
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


                var is_button = document.getElementById(id);
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
                    document.getElementById(id).style.backgroundColor = "darkred";

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

                    // Adiciona um ouvinte de eventos para touchstart
                    pageDivider.addEventListener("touchstart", function (event) {
                        // Lida com o evento touchstart aqui
                        isDragging = true;
                        //startX = event.pageX;
                        //startX = event.changedTouches[0].clientX
                        startX = event.touches[0].pageX;
                        btnWidth = parseInt(getComputedStyle(allBtn).width, 10);
                    });

                    // Adiciona um ouvinte de eventos para touchmove
                    pageDivider.addEventListener("touchmove", function (event) {
                        // Lida com o evento touchmove aqui
                        if (!isDragging) {
                            return;
                        }
                        var offset = event.touches[0].pageX - startX;
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

                    // Adiciona um ouvinte de eventos para touchend
                    pageDivider.addEventListener("touchend", function (event) {
                        // Lida com o evento touchend aqui
                        isDragging = false;
                    });

                    found = 1;
                }
            }
            if (type == "user") {
                found = list_users.indexOf(prt);
                if (found != -1) {
                    app.send({ api: "user", mt: "TriggerCall", prt: String(prt), btn_id: String(id)})
                    //addNotification("out", name);
                    addNotification('out', name)
                        .then(function (message) {
                            console.log(message);
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                    var elemento = document.getElementById(id)
                    elemento.children[0].classList.remove("gold-900")
                    elemento.children[0].classList.add("vermelho-900")
                    elemento.children[1].classList.add("gold-600")
                    elemento.children[1].classList.remove("vermelho-600")
                }
            }
            if (type == "popup") {
                makePopup("Popup", "<iframe src='" + prt + "' width='100%' height='100%' style='border:0;' allowfullscreen='' loading='lazy' referrerpolicy='no-referrer-when-downgrade'></iframe>", 800, 600);
                app.send({ api: "user", mt: "TriggerStartPopup", prt: String(prt) })
            }
            if (type == "externalnumber") {
                app.send({ api: "user", mt: "TriggerCall", prt: String(prt), btn_id: String(id)})
                //addNotification("out", name);
                addNotification('out', type)
                    .then(function (message) {
                        console.log(message);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
                    var elemento = document.getElementById(id)
                    elemento.children[0].classList.remove("gold-900")
                    elemento.children[0].classList.add("vermelho-900")
                    elemento.children[1].classList.remove("gold-600")
                    elemento.children[1].classList.add("vermelho-600")
                found = 1;
            }
            if (type == "alarm") {
                app.send({ api: "user", mt: "TriggerAlert", prt: String(prt), btn_id: String(id)})
                var elemento = document.getElementById(id)
                elemento.children[0].classList.remove("gold-900")
                elemento.children[1].classList.remove("gold-600")
                elemento.children[0].classList.add("vermelho-900")
                elemento.children[1].classList.add("vermelho-600")
                found = 1;
            }
            if (type == "video") {
                button_clicked.forEach(function (b) {
                    if (b.type == "video") {
                        try {
                            //var btn = { id: b.id, type: b.type, name: b.name, prt: b.prt };
                            //button_clicked.splice(button_clicked.indexOf(btn), 1);
                            button_clicked = button_clicked.filter(deleteById(b.id));
                            document.getElementById(b.id).style.backgroundColor = "";

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
                document.getElementById(id).style.backgroundColor = "darkred";
                found = 1;
                        //document.getElementById(value).setAttribute("class", "allbuttonClicked");
                        
            }
            if (type == "combo") {
                app.send({ api: "user", mt: "TriggerCombo", prt: String(prt), btn_id: String(id)})
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
        var AllBody = that.add(new innovaphone.ui1.Div("display:flex; flex-direction:row; width:100%; height:100%; justify-content:center",null,null))
        //Coluna Esquerda
        var col_esquerda = AllBody.add(new innovaphone.ui1.Div("width: 100%; height:100%;", null));
        //colunaesquerda adicionar classe depois
        
        //var _container = col_esquerda.add(new innovaphone.ui1.Div("display: none; justify-content: center; position: absolute; height: 40%; width: 100%; align-items: center;", new innovaphone.ui1.Node("img", "width:20%; height:20%;", null, null).setAttribute("src", "./images/play.png"), null));
        // none > flex 

        //Div principal do meio
        var divCenter = AllBody.add(new innovaphone.ui1.Div("width:1014px",null,"buttons"))

        //Botões centrais
        var divButtons = divCenter.add(new innovaphone.ui1.Div("width:100% ",null,"divMainButtons"))
        divButtons.setAttribute("id","divMainButtons")
        divButtons.setAttribute("page",1)
    
        //Botões Fixos no final
        var divOptions = divCenter.add(new innovaphone.ui1.Div("position: fixed; bottom: 0",null,null))
        divOptions.setAttribute("id","divOptions")
        
        //Coluna Direita
        var col_direita = AllBody.add(new innovaphone.ui1.Div("width: 100%; background: var(--colors-neutro-1000) ", "Texto TesTE"));
        var _scroll = col_esquerda.add(new innovaphone.ui1.Node("scroll-container", null, null, "scroll-container"));
        _scroll.setAttribute("id", "scroll-calls");
        var _zoneDiv = col_esquerda.add(new innovaphone.ui1.Div("height:40%;width:100%;",null,"zoneDiv").setAttribute("id","zoneDiv"))
        coldireita = col_direita;
        colesquerda = col_esquerda;
        //container = _container;
        scroll = _scroll;
        zoneDiv = _zoneDiv
        divButtonsMain = divButtons
        divOptionsMain =  divOptions
        leftBottomButons()
    }

    function calllistonmessage(consumer, obj) {
        if (obj.msg) {
            console.log("::calllistApi::onmessage() msg=" + JSON.stringify(obj.msg));
            app.send({ api: "user", mt: "CallHistoryEvent", obj: JSON.stringify(obj.msg) });
        }
    }

    //#region funções internas
    function makeAllButtons(buttons,page){
        buttons.forEach(function (object) {

            switch (object.button_type) {
                case "combo":
                    var selector = ".combobutton[position-x='" + object.position_x + "'][position-y='" + object.position_y + "'][page='" + object.page + "']";
                    var combobtn = document.querySelector(selector);
                    if (combobtn) {
                        combobtn.setAttribute("id", object.id);
                        combobtn.setAttribute("button_type", object.button_type);
                        combobtn.setAttribute("button_prt", object.button_prt);
                        combobtn.setAttribute("button_id", object.id);
                        var divTop = document.createElement("div")
                            divTop.style.backgroundColor = "var(--colors-ciano-900)"
                            divTop.classList.add("buttontop")
                            divTop.setAttribute("id", object.id + "-status");
                            combobtn.appendChild(divTop)
                            var imgTop = document.createElement("img")
                            imgTop.style.width = "35px";
                            imgTop.setAttribute("src","./images/layer.svg")
                            divTop.appendChild(imgTop)
                            var divTopText = document.createElement("div")
                            divTopText.textContent = object.button_name
                            divTop.appendChild(divTopText);
                            var divBottom = document.createElement("div")
                            divBottom.style.backgroundColor = "var(--colors-ciano-600)"
                            divBottom.classList.add("buttondown")
                            divBottom.textContent = object.button_prt
                            combobtn.appendChild(divBottom)
                    }
                    //componentizar ~pietro
                    break;
                case "alarm":
                    createButtons(object,"allbutton","gold-900","gold-600","./images/warning.svg","btnEmpty",null,null,object.page)
                    break;
                case "externalnumber":
                    createButtons(object,"exnumberbutton","verde-900","verde-600","./images/phone.svg","btnEmpty",null,null,object.page)
                    break;
                case "sensor":
                    app.sendSrc({ api: "user", mt: "SelectSensorInfo", type: object.sensor_type, sensor: object.button_prt, src: object.button_prt }, function (obj) {
                        console.log("SendSrcResult: " + JSON.stringify(obj))
                        createButtons(object,"sensorbutton","neutro-900","neutro-1000","./images/wifi.svg","sensorButton","sensor", JSON.parse(obj.result) , object.page)     
                    })            
                    break;
                default:
                    break;
            }
            // if (object.button_type == "combo") {
            //     var selector = ".combobutton[position-x='" + object.position_x + "'][position-y='" + object.position_y + "']";
            //     var combobtn = document.querySelector(selector);
            //     if (combobtn) {
            //         combobtn.setAttribute("id", object.id);
            //         combobtn.setAttribute("button_type", object.button_type);
            //         combobtn.setAttribute("button_prt", object.button_prt);
            //         combobtn.setAttribute("button_id", object.id);
            //         var divTop = document.createElement("div")
            //             divTop.style.backgroundColor = "var(--colors-ciano-900)"
            //             divTop.classList.add("buttontop")
            //             divTop.setAttribute("id", object.id + "-status");
            //             combobtn.appendChild(divTop)
            //             var imgTop = document.createElement("img")
            //             imgTop.style.width = "35px";
            //             imgTop.setAttribute("src","./images/layer.svg")
            //             divTop.appendChild(imgTop)
            //             var divTopText = document.createElement("div")
            //             divTopText.textContent = object.button_name
            //             divTop.appendChild(divTopText);
            //             var divBottom = document.createElement("div")
            //             divBottom.style.backgroundColor = "var(--colors-ciano-600)"
            //             divBottom.classList.add("buttondown")
            //             divBottom.textContent = object.button_prt
            //             combobtn.appendChild(divBottom)
            //     }
            // }
            // if (object.button_type == "alarm") {
            //     // allbtn.setAttribute("id", object.id);
            //     allbtn.setAttribute("class", "allbutton");
            //     createButtons(object,"allbutton","gold-900","gold-600","./images/warning.svg","btnEmpty")
            // }
            // else if (object.button_type == "video") {
            //     var div1 = allbtn.add(new innovaphone.ui1.Div(null, null, "allbutton"));
            //     div1.setAttribute("button_type", object.button_type);
            //     div1.setAttribute("button_prt", object.button_prt);
            //     //div1.setAttribute("button_id", object.id);
            //     div1.setAttribute("id", object.id);


            //     var div2 = div1.add(new innovaphone.ui1.Div(null, null, "buttontop"));
            //     div2.setAttribute("id", object.button_prt + "-status");
            //     div2.addHTML("<img src='video.png' class='img-icon'>" + object.button_name);

            //     var div3 = div1.add(new innovaphone.ui1.Div(null, "CÂMERA", "buttondown"));

            //     allbtn.add(div1);

            // }
            // else if (object.button_type == "number") {
            //     var div1 = allbtn.add(new innovaphone.ui1.Div(null, null, "userbutton"));
            //     div1.setAttribute("button_type", object.button_type);
            //     div1.setAttribute("button_prt", object.button_prt);
            //     //div1.setAttribute("button_id", object.id);
            //     div1.setAttribute("id", object.id);
            //     //div1.setAttribute("button_prt_user", object.button_prt_user);

            //     var div2 = div1.add(new innovaphone.ui1.Div(null, null, "buttontop"));
            //     div2.setAttribute("id", object.button_prt + "-status");
            //     div2.addHTML("<img src='phone.png' class='img-icon'>" + object.button_name);

            //     var div3 = div1.add(new innovaphone.ui1.Div(null, "TELEFONE " + object.button_prt, "buttondown"));

            //     allbtn.add(div1);
            // }
            // else if (object.button_type == "user") {
            //     var div1 = allbtn.add(new innovaphone.ui1.Div(null, null, "userbutton"));
            //     div1.setAttribute("button_type", object.button_type);
            //     div1.setAttribute("button_prt", object.button_prt);
            //     //div1.setAttribute("button_id", object.id);
            //     div1.setAttribute("id", object.id);
            //     //div1.setAttribute("button_prt_user", object.button_prt_user);

            //     var div2 = div1.add(new innovaphone.ui1.Div(null, null, "buttontop"));
            //     div2.setAttribute("id", object.button_prt + "-status");
            //     div2.addHTML("<img src='phone.png' class='img-icon'>" + object.button_name);

            //     var div3 = div1.add(new innovaphone.ui1.Div(null, "TELEFONE " + object.button_prt, "buttondown"));

            //     allbtn.add(div1);
            // }
            // else if (object.button_type == "externalnumber") {
            //     createButtons(object,"exnumberbutton","verde-900","verde-600","./images/phone.svg","btnEmpty")
            // }
            // else if (object.button_type == "page") {
            //     var div1 = allbtn.add(new innovaphone.ui1.Div(null, null, "pagebutton"));
            //     div1.setAttribute("button_type", object.button_type);
            //     div1.setAttribute("button_prt", object.button_prt);
            //     //div1.setAttribute("button_id", object.id);
            //     div1.setAttribute("id", object.id);


            //     var div2 = div1.add(new innovaphone.ui1.Div(null, null, "buttontop"));
            //     div2.setAttribute("id", object.button_prt + "-status");
            //     div2.addHTML("<img src='page.png' class='img-icon'>" + object.button_name);

            //     var div3 = div1.add(new innovaphone.ui1.Div(null, "PÁGINA", "buttondown"));

            //     pagebtn.add(div1);

            //  }
            // else if(object.button_type == "sensor"){
            //     createButtons(object,"sensorbutton","neutro-900","neutro-1000","./images/wifi.svg","sensorButton")
            // }
            
        });
    }
    function createButtons(object,classButton,bgTop,bgBottom,srcImg,mainButtonClass,sensor,sensorInfo,page){

        var selector = `.${mainButtonClass}[position-x='${object.position_x}'][position-y='${object.position_y}'][page='${page}']`;
        var allBtns = document.querySelector(selector);
        if (allBtns) {
            allBtns.setAttribute("id", object.id);
            allBtns.setAttribute("button_type", object.button_type);
            allBtns.setAttribute("button_prt", object.button_prt);
            allBtns.setAttribute("button_id", object.id);
            allBtns.setAttribute("button_prtstatus", object.button_prt + "-status");
            allBtns.classList.add(classButton)
            var divTop = document.createElement("div")
                divTop.classList.add(bgTop)
                divTop.classList.add("buttontop")
                divTop.setAttribute("id", object.id + "-status");
                //divTop.setAttribute("id", object.button_prt + "-status");
                allBtns.appendChild(divTop)
                var imgTop = document.createElement("img")
                imgTop.style.width = "20px";
                imgTop.setAttribute("src",srcImg)
                divTop.appendChild(imgTop)
                var divTopText = document.createElement("div")
                divTopText.textContent = object.button_name
                divTop.appendChild(divTopText);

                var divBottom = document.createElement("div")
                divBottom.classList.add(bgBottom)
                divBottom.classList.add("buttondown")
                var divBottomTxt = document.createElement("div")
                divBottomTxt.textContent = object.button_prt
                divBottom.appendChild(divBottomTxt)
                if(sensor == "sensor"){
                    var divBottomSensorInfo = document.createElement("div")
                    divBottomSensorInfo.style.fontWeight = "bold;"
                    divBottom.style.gap = "10px"
                    divBottomSensorInfo.innerHTML = Object.values(sensorInfo[0])[0];
                    divBottom.appendChild(divBottomSensorInfo)
                }
                allBtns.appendChild(divBottom)
        }
    }
    function addOnHistory(history, objType, state, text1, text2){
        console.log("Função addOnHistory")
        console.log(JSON.stringify(history))

        var msgType = texts.text(history.type)
        var msgState = texts.text(history.state)
        var msgText1 = history.alert1
        var msgText2 = history.alert2

        // if(history = ''){
        //     msgType = objType
        //     msgState = state
        //     msgText1 = text1
        //     msgText2 = text2

        // }else{
            
        //     msgType = history.type
        //     msgState = history.state
        //     msgText1 = history.alert1
        //     msgText2 = history.alert2
        // }

        var today = new Date();
        var day = today.getDate() + "";
        var month = (today.getMonth() + 1) + "";
        var year = today.getFullYear() + "";
        var hour = today.getHours() + "";
        var minutes = today.getMinutes() + "";
        var seconds = today.getSeconds() + "";

        const histScroll = document.getElementById("scroll-calls")

        const boxDate = document.createElement("div")
        boxDate.id = "boxDate"
        boxDate.classList.add("boxDate")

        const boxEvent = document.createElement("div")
        boxEvent.id = "boxEvent"
        boxEvent.classList.add("boxEvent", "lastHistory",'toastAnimation')

        const boxEventTypeStatat = document.createElement("div")
        boxEventTypeStatat.id = "boxEventTypeStatat"
        boxEventTypeStatat.classList.add("boxEventTypeStatat")

        const eventType = document.createElement("div")
        eventType.id = "eventType"
        eventType.classList.add("eventType")
        eventType.textContent = msgType

        const eventStatus = document.createElement("div")
        eventStatus.id = "eventStatus"
        eventStatus.classList.add("eventStatus")
        eventStatus.textContent = msgState

        const boxEventTexts = document.createElement("div")
        boxEventTexts.id = "boxEventTexts"
        boxEventTexts.classList.add("boxEventTexts")

        const eventText1 = document.createElement("div")
        eventText1.id = "eventText1"
        eventText1.classList.add("eventText1")
        eventText1.textContent = msgText1

        const eventText2 = document.createElement("div")
        eventText2.id = "eventText2"
        eventText2.classList.add("eventText2")
        eventText2.textContent = msgText2

        const boxEventDate =document.createElement("div")
        boxEventDate.id = "boxEventDate"
        boxEventDate.classList.add("boxEventDate")

        const eventDate =document.createElement("div")
        eventDate.id = "eventDate"
        eventDate.classList.add("eventDate")
        eventDate.textContent = (day  < 10 ? '0' : '') + day + "/" + (month < 10 ? '0' : '') + month 

        const eventHour =document.createElement("div")
        eventHour.id = "eventHour"
        eventHour.classList.add("eventHour")
        eventHour.textContent = (hour  < 10 ? '0' : '') + hour + ":" + (minutes  < 10 ? '0' : '') + minutes

        boxEventTypeStatat.appendChild(eventType)
        boxEventTypeStatat.appendChild(eventStatus)

        boxEventTexts.appendChild(eventText1)
        boxEventTexts.appendChild(eventText2)

        boxEventDate.appendChild(eventDate)
        boxEventDate.appendChild(eventHour)

        boxEvent.appendChild(boxEventTypeStatat)
        boxEvent.appendChild(boxEventTexts)
        boxEvent.appendChild(boxEventDate)

        boxDate.appendChild(boxEvent)
        histScroll.appendChild(boxDate)

    }
    
    function addNotification(flux, msg) {
        return new Promise(function(resolve, reject) {
            try {
                var today = new Date();
                var day = today.getDate() + "";
                var month = (today.getMonth() + 1) + "";
                var year = today.getFullYear() + "";
                var hour = today.getHours() + "";
                var minutes = today.getMinutes() + "";
            
                const histScroll = document.getElementById("scroll-calls");
            
                const boxDate = document.createElement("div");
                boxDate.id = "boxDate";
                boxDate.classList.add("boxDate");
            
                const boxEvent = document.createElement("div");
                boxEvent.id = "boxEvent";
                boxEvent.classList.add("boxEvent", "lastHistory", 'toastAnimation');
            
                const boxEventTypeStatat = document.createElement("div");
                boxEventTypeStatat.id = "boxEventTypeStatat";
                boxEventTypeStatat.classList.add("boxEventTypeStatat");
            
                const eventType = document.createElement("div");
                eventType.id = "eventType";
                eventType.classList.add("eventType");
                eventType.textContent = texts.text("labelType");
            
                const eventStatus = document.createElement("div");
                eventStatus.id = "eventStatus";
                eventStatus.classList.add("eventStatus");
                eventStatus.textContent = msg;
            
                const boxEventTexts = document.createElement("div");
                boxEventTexts.id = "boxEventTexts";
                boxEventTexts.classList.add("boxEventTexts");
            
                const eventText1 = document.createElement("div");
                eventText1.id = "eventText1";
                eventText1.classList.add("eventText1");
                eventText1.textContent = "DE QUEM";
            
                const eventText2 = document.createElement("div");
                eventText2.id = "eventText2";
                eventText2.classList.add("eventText2");
                eventText2.textContent = "PARA QUEM";
            
                const boxEventDate = document.createElement("div");
                boxEventDate.id = "boxEventDate";
                boxEventDate.classList.add("boxEventDate");
            
                const eventDate = document.createElement("div");
                eventDate.id = "eventDate";
                eventDate.classList.add("eventDate");
                eventDate.textContent = (day < 10 ? '0' : '') + day + "/" + (month < 10 ? '0' : '') + month;
            
                const eventHour = document.createElement("div");
                eventHour.id = "eventHour";
                eventHour.classList.add("eventHour");
                eventHour.textContent = (hour < 10 ? '0' : '') + hour + ":" + (minutes < 10 ? '0' : '') + minutes;
            
                boxEventTypeStatat.appendChild(eventType);
                boxEventTypeStatat.appendChild(eventStatus);
            
                boxEventTexts.appendChild(eventText1);
                boxEventTexts.appendChild(eventText2);
            
                boxEventDate.appendChild(eventDate);
                boxEventDate.appendChild(eventHour);
            
                boxEvent.appendChild(boxEventTypeStatat);
                boxEvent.appendChild(boxEventTexts);
                boxEvent.appendChild(boxEventDate);
            
                boxDate.appendChild(boxEvent);
                histScroll.insertBefore(boxDate, histScroll.firstChild); // Adiciona no início da lista
            
                resolve('Notification added successfully.');
            } catch (error) {
                reject('Error adding notification: ' + error.message);
            }
        });
    }
    // apenas para demonstração
    var zonebuttons = [
        {
            "name": "Fabrica",
            "action": [
                { "alarm": "FUJAM" }
            ]
        },
        {
            "name": "Adminstrativo",
            "action": [
                { "alarm": "CORRAM" }
            ]
        },
        {
            "name": "Vendas",
            "action": [
                { "alarm": "ADULTOS PRIMEIRO" }
            ]
        }
    ];
    var helpButton = [{
        "name": "Bombeiro",
        "img": "./images/fire.svg"
    },
    {
        "name": "Polícia",
        "img": "./images/police.svg"
    },
    {
        "name": "Água",
        "img": "./images/water.svg"
    },
    {
        "name": "Central",
        "img": "./images/house.svg"
    },
    {
        "name": "Hospital",
        "img": "./images/hospital.svg"
    },
    {
        "name": "Energia",
        "img": "./images/light.svg"
    }]
    function truncateString(str, maxLength) {
        if (str.length > maxLength) {
            return str.substring(0, maxLength) + "...";
        } else {
            return str;
        }
    }
    function leftBottomButons(){

        const zoneDiv = document.getElementById("zoneDiv")
        zonebuttons.forEach(function(zb){
            const zoneBtn = document.createElement('div')
            zoneBtn.classList.add("zoneBtn")
            zoneBtn.id = "zoneBtn"
            
            const imgBtn = document.createElement('img')
            imgBtn.classList.add("imgBtn")
            imgBtn.id = "imgBtn"
            imgBtn.setAttribute("src","./images/megaphone.svg")

            const txtBtn = document.createElement('div')
            txtBtn.classList.add("txtBtn")
            txtBtn.id = "txtBtn"
            txtBtn.textContent = truncateString(zb.name, "7")

            zoneBtn.addEventListener("click", function(){
                console.log("Alarme BTN Clicado", zb.action[0].alarm)
            })
            zoneBtn.appendChild(imgBtn)
            zoneBtn.appendChild(txtBtn)
            zoneDiv.appendChild(zoneBtn)
        
        })

        helpButton.forEach(function(hb){
            const zoneBtn = document.createElement('div')
            zoneBtn.classList.add("zoneBtn")
            zoneBtn.id = "zoneBtn"

            const imgBtn = document.createElement('img')
            imgBtn.classList.add("imgBtn")
            imgBtn.id = "imgBtn"
            imgBtn.setAttribute("src", hb.img)

            const txtBtn = document.createElement('div')
            txtBtn.classList.add("txtBtn")
            txtBtn.id = "txtBtn"
            txtBtn.textContent = hb.name

            zoneBtn.addEventListener("click", function(){
                console.log("Function do Botão ligar para", hb.name)
            })
            zoneBtn.appendChild(imgBtn)
            zoneBtn.appendChild(txtBtn)
            zoneDiv.appendChild(zoneBtn)
        
        })

    }

    //#endregion
}

Wecom.novaalert.prototype = innovaphone.ui1.nodePrototype;

