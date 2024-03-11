
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />
/// <reference path="../../web1/ui1.popup/innovaphone.ui1.popup.js" />
/// <reference path="../../web1/ui1.listview/innovaphone.ui1.listview.js" />
/// <reference path="../../web1/com.innovaphone.avatar/com.innovaphone.avatar.js" />


var Wecom = Wecom || {};
Wecom.novaalertAdmin = Wecom.novaalertAdmin || function (start, args) {
    this.createNode("body");
    var appdn = start.title;
    var that = this;
    var avatar = start.consumeApi("com.innovaphone.avatar");


    var iptUrl = "";
    var iptServerEnable = "";
    var iptMethod = "";
    var googlekey = "";
    var list_buttons = [];
    var list_actions = [];
    var list_users = [];
    var colDireita;
    var colorSchemes = {
        dark: {
            "--bg": "url('wecom-white.png')",
            "--button": "#c6c6c6",
            "--text-standard": "#004c84",
            "--div-DelBtn" : "#f2f5f6",
        },
        light: {
            "--bg": "url('wecom-white.png')",
            "--button": "#c6c6c6",
            "--text-standard": "#004c84",
            "--div-DelBtn" : "#f2f5f6",
        }
    };
    var schemes = new innovaphone.ui1.CssVariables(colorSchemes, start.scheme);
    start.onschemechanged.attach(function () { schemes.activate(start.scheme) });

    var texts = new innovaphone.lib1.Languages(Wecom.novaalertTexts, start.lang);

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;
    app.onclosed = waitConnection(that);
    app.onerror = waitConnection(that);
    var UIuser;
    var avatar;
    var UIuserPicture;
    var receivedFragments = [];

    var list_types = [
        { typeName: "Alarme", id: "alarm" },
        { typeName: "Usuário", id: "user" },
        { typeName: "Número", id: "externalnumber" },
        { typeName: "Vídeo", id: "video" },
        { typeName: "Página Iframe", id: "page" },
        { typeName: "Combo x4", id: "combo" }
    ];
    var list_act_types = [
        { typeName: "Alarme", id: "alarm" },
        { typeName: "Número", id: "number" },
        { typeName: "Botão", id: "button" },
        { typeName: "Vídeo", id: "video" },
        { typeName: "Página Iframe", id: "page" },
        { typeName: "PopUp Iframe", id: "popup" }
    ];
    var list_start_types = [
        { typeName: "Alarme", id: "alarm" },
        { typeName: "Número Origem", id: "inc-number" },
        { typeName: "Número Destino", id: "out-number" },    ]

    //license
    var licenseToken = null;
    var licenseFile = null;
    var licenseActive = null;
    var licenseInstallDate = null;
    var licenseUsed = 0;

    function app_connected(domain, user, dn, appdomain) {
        UIuser = dn;
        //avatar
        avatar = new innovaphone.Avatar(start, user, domain);
        UIuserPicture = avatar.url(user, 100, dn);
        constructor();
        app.send({ api: "admin", mt: "AdminMessage" });
        
    }

    function app_message(obj) {
        if (obj.api == "admin" && obj.mt == "AdminMessageResult") {
            iptUrl = obj.urlalert;
            googlekey = obj.googlekey;
            iptServerEnable = obj.serverEnable;
            iptMethod = obj.method;

        }
        if (obj.api == "admin" && obj.mt == "MessageError") {
            console.log(obj.result);
            makePopup("ERRO", "Erro: " + obj.result);
        }
        if (obj.api == "admin" && obj.mt == "TableUsersResult") {
            console.log(obj.result);
            list_users = [];
            list_users = JSON.parse(obj.result);
        }
        if (obj.api == "admin" && obj.mt == "SelectMessageSuccess") {
            console.log(obj.result);
            list_buttons = JSON.parse(obj.result);
            makeTableButtons(colDireita);
        }
        if (obj.api == "admin" && obj.mt == "SelectButtonsMessageSuccess") {
            console.log(obj.result);
            list_buttons = JSON.parse(obj.result);
        }
        if (obj.api == "admin" && obj.mt == "SelectActionMessageSuccess") {
            console.log(obj.result);
            list_actions = JSON.parse(obj.result);
            makeTableActions(colDireita);
        }
        if (obj.api == "admin" && obj.mt == "InsertMessageSuccess") {
            app.send({ api: "admin", mt: "SelectMessage" });
            makePopup("Sucesso", "Botão criado com sucesso!");
        }
        if (obj.api == "admin" && obj.mt == "UpdateMessageSuccess") {
            app.send({ api: "admin", mt: "SelectMessage" });
            makePopup("Sucesso", "Botão atualizado com sucesso!");
        }
        if (obj.api == "admin" && obj.mt == "InsertActionMessageSuccess") {
            app.send({ api: "admin", mt: "SelectActionMessage" });
            makePopup("Sucesso", "Ação criada com sucesso!");
        }
        if (obj.api == "admin" && obj.mt == "UpdateActionMessageSuccess") {
            app.send({ api: "admin", mt: "SelectActionMessage" });
            makePopup("Sucesso", "Ação atualizada com sucesso!");
        }
        if (obj.api == "admin" && obj.mt == "DeleteMessageSuccess") {
            app.send({ api: "admin", mt: "SelectMessage" });
            makePopup("Sucesso", "Botão excluído com sucesso!");
        }
        if (obj.api == "admin" && obj.mt == "DeleteActionMessageSuccess") {
            app.send({ api: "admin", mt: "SelectActionMessage" });
            makePopup("Sucesso", "Ação excluída com sucesso!");
        }
        if (obj.api == "admin" && obj.mt == "SelectFromReportsSuccess") {
            receivedFragments.push(obj.result);
            if (obj.lastFragment) {
                // Todos os fragmentos foram recebidos
                var jsonData = receivedFragments.join("");
                // Faça o que quiser com os dados aqui
                reportView(colDireita, jsonData, obj.src)
                    .then(function (message) {
                        console.log(message);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
                //reportView(colDireita, jsonData, obj.src);
                // Limpe o array de fragmentos recebidos
                receivedFragments = [];
            }
            //reportView(colDireita, obj.result, obj.src);
        }
        if (obj.api == "admin" && obj.mt == "DeleteFromReportsSuccess") {
            constructor();
            makePopup("Atenção!", "Dados excluídos com sucesso!");
        }
        if (obj.api == "admin" && obj.mt == "UpdateConfigLicenseMessageSuccess") {
            app.send({ api: "admin", mt: "ConfigLicense" });
            waitConnection(colDireita);
            window.alert("Configurações Atualizadas com suecesso!");

        }
        if (obj.api == "admin" && obj.mt == "LicenseMessageResult") {
            try {
                licenseToken = obj.licenseToken;
                licenseFile = obj.licenseFile;
                licenseActive = obj.licenseActive;
                licenseInstallDate = obj.licenseInstallDate;
                licenseUsed = obj.licenseUsed;

            } catch (e) {
                console.log("ERRO LicenseMessageResult:" + e)
            }
            makeDivLicense(colDireita);
        }
        if (obj.api == "admin" && obj.mt == "UpdateConfigMessageErro") {
            window.alert("Erro ao atualizar as configurações, verifique os logs do serviço.");
        }
        
    }

    function makePopup(header, content) {
        console.log("makePopup");
        var styles = [new innovaphone.ui1.PopupStyles("popup-background", "popup-header", "popup-main", "popup-closer")];
        var h = [20];

        var popup = new innovaphone.ui1.Popup("position:absolute; left:50px; top:50px; width:500px; height:200px;", styles[0], h[0]);
        popup.header.addText(header);
        popup.content.addText(content);
    }

    function makeDivLicense(t) {
        t.clear();
        //Título
        t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("labelTituloLicense")));

        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 25%; left: 6%; font-weight: bold;", texts.text("lblLicenseToken"), null));
        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 25%; left: 40%; font-weight: bold;", licenseToken, null));

        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 35%; left: 6%; font-weight: bold;", texts.text("labelLicenseFile"), null));
        t.add(new innovaphone.ui1.Input("position: absolute;  top: 35%; left: 40%; height: 30px; padding:5px; width: 50%; border-radius: 10px; border: 2px solid; border-color:#02163F;", licenseFile, null, null, null, null).setAttribute("id", "InputLicenseFile"));

        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 45%; left: 6%; font-weight: bold;", texts.text("labelLicenseActive"), null));
        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 45%; left: 40%; font-weight: bold;", licenseActive, null));

        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 55%; left: 6%; font-weight: bold;", texts.text("labelLicenseInstallDate"), null));
        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 55%; left: 40%; font-weight: bold;", licenseInstallDate, null));

        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 65%; left: 6%; font-weight: bold;", texts.text("labelLicenseUsed"), null));
        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 65%; left: 40%; font-weight: bold;", String(licenseUsed), null));


        // buttons
        t.add(new innovaphone.ui1.Div("position:absolute; left:82%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnOk").addEvent("click", function () {
            licenseFile = document.getElementById("InputLicenseFile").value;
            if (licenseFile.length > 0) {
                app.send({ api: "admin", mt: "UpdateConfigLicenseMessage", licenseToken: licenseToken, licenseFile: licenseFile });
                waitConnection(t);
            } else {
                window.alert("A chave de licença precisa ser informada!");
            }
            
        });

    }
    function makeDivAddButton(t1) {
        t1.clear();
        //Título
        t1.add(new innovaphone.ui1.Div(null,texts.text("labelTituloAdd"),"tituloAdd"));
        //Tipo
        t1.add(new innovaphone.ui1.Div(null, texts.text("labelType"),"labeltypeAdd"));
        var iptType = t1.add(new innovaphone.ui1.Node("select", null, null,"selectTypeAdd"));
        iptType.setAttribute("id", "selectType");
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "Alarme", null).setAttribute("id", "alarm"));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "Usuário", null).setAttribute("id", "user"));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "Número", null).setAttribute("id", "externalnumber"));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "Vídeo", null).setAttribute("id", "video"));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "Página Iframe", null).setAttribute("id", "page"));
        //var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "Fila ou Grupo", null).setAttribute("id", "queue"));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "Combo x4", null).setAttribute("id", "combo"));

        var comboarea = t1.add(new innovaphone.ui1.Div(null,null,"comboarea"));
        addStringParamters(comboarea);

        document.getElementById("selectType").addEventListener("change", function (e) {
            console.log(e.target.value);
            if (e.target.value == "Usuário") {
                addUserParamters(comboarea);
                }
            else if (e.target.value == "Número") {
                //addNumberParamters(comboarea);
                addNumberParamtersMultiDevice(comboarea);
            }
            else if (e.target.value == "Combo x4") {
                addComboParamters(comboarea);
            }
            else {
                addStringParamters(comboarea);
            }
            
        });

        function addStringParamters(t) {
            //Usuário
            t.clear();
            t.add(new innovaphone.ui1.Div(null, texts.text("labelUser"), "labelUserString"));
            var iptUser = t.add(new innovaphone.ui1.Node("select", null, null, "iptUserString"));
            iptUser.setAttribute("id", "selectUser");
            iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "TODOS", null).setAttribute("id", "all"));
            list_users.forEach(function (user) {
                iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.cn, null).setAttribute("id", user.sip));
            })
            //var iptUser = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
            var divAdd = t.add(new innovaphone.ui1.Div(null, null, "divAdd"))
            var iptName = divAdd.add(new innovaphone.ui1.Input(null, null, null, 255, "url", "iptNameString"));
            divAdd.add(new innovaphone.ui1.Div(null, texts.text("labelButtonName"), "labelBtnString"));
            iptName.setAttribute("placeholder", " ");
            // divAdd.add(new innovaphone.ui1.Node("span",null,null,"focus-bg"))
            //Nome Usuário
            //t.add(new innovaphone.ui1.Div("position:absolute; display:block; left:0%; width:15%; top:30%; font-size:15px; text-align:right", texts.text("labelUserName")));
            //var iptUserName = t.add(new innovaphone.ui1.Input("position:absolute; display:block; left:16%; width:30%; top:30%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));

            //Parâmetro
            var divAdd2 = t.add(new innovaphone.ui1.Div(null, null, "divAdd2"))
            var iptValue = divAdd2.add(new innovaphone.ui1.Input(null, null, texts.text("iptText"), 500, "url", "iptValueString"));
            divAdd2.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueString"));
            iptValue.setAttribute("placeholder", " ");
            //Botão Salvar
            t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:90%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
                var type = document.getElementById("selectType");
                var selectedOption = type.options[type.selectedIndex];
                var type = selectedOption.id;
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var user = selectedOption.id;
                if (String(iptName.getValue()) == "" || String(type) == "") {
                    makePopup("Atenção", "Complete todos os campos para que o botão possa ser criado.");
                } else {
                    app.send({ api: "admin", mt: "InsertMessage", name: String(iptName.getValue()), user: String(""), value: String(iptValue.getValue()), sip: String(user), type: String(type) });
                    waitConnection(t1);
                }
            });
            //Botão Cancelar   
            t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:90%; font-size:15px; text-align:center", null, "button-inn-del")).addTranslation(texts, "btnCancel").addEvent("click", function () {
                makeTableButtons(t1);
            });
        }
        function addUserParamters(t) {
            //Usuário
            t.clear();
            t.add(new innovaphone.ui1.Div(null, texts.text("labelUser"), "labelUserUsers"));
            var iptUser = t.add(new innovaphone.ui1.Node("select", null, null, "iptUserUsers"));
            iptUser.setAttribute("id", "selectUser");
            iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", ""));
            list_users.forEach(function (user) {
                iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.cn, null).setAttribute("id", user.sip));
            })
            //var iptUser = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
            //Nome Botão
            var divAdd5 = t.add(new innovaphone.ui1.Div(null, null, "divAdd5"))
            var iptName = divAdd5.add(new innovaphone.ui1.Input(null, null, texts.text("iptText"), 255, "url", "iptNameUsers"));
            divAdd5.add(new innovaphone.ui1.Div(null, texts.text("labelButtonName"), "labelBtnUsers"));
            iptName.setAttribute("placeholder", " ");
            //Nome Usuário
            //var labelUserName = t.add(new innovaphone.ui1.Div("position:absolute; display:block; left:0%; width:15%; top:30%; font-size:15px; text-align:right", texts.text("labelUserName")));
            //var iptUserName = t.add(new innovaphone.ui1.Input("position:absolute; display:block; left:16%; width:30%; top:30%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));

            //Parâmetro
            t.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueUsers"));
            //var iptValue = t.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:25%; font-size:12px; text-align:center", null, texts.text("iptText"), 500, "url", null));

            var iptValue = t.add(new innovaphone.ui1.Node("select", null, null, "selectValueUsers"));
            iptValue.setAttribute("id", "selectValue");
            list_users.forEach(function (user) {
                iptValue.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.cn, null).setAttribute("id", user.sip));
            });

            //Device
            t.add(new innovaphone.ui1.Div(null, texts.text("device"), "labelDeviceNumber"));
            var iptDevice = t.add(new innovaphone.ui1.Node("select", "width:28%;margin-left:2%;", null, "iptDeviceNumber"));
            iptDevice.setAttribute("id", "selectDevice");
            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", ""));


            document.getElementById("selectUser").addEventListener("change", function (e) {
                console.log(e.target.value);
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var sip = selectedOption.id;
                iptDevice.clear();
                iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", ""));
                list_users.forEach(function (user) {
                    if (user.sip == sip) {
                        var devices = user.devices;
                        devices.forEach(function (dev) {
                            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
                        })
                    }
                })
            });

            //Botão Salvar
            t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:90%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
                var type = document.getElementById("selectType");
                var selectedOption = type.options[type.selectedIndex];
                var type = selectedOption.id;
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var user = selectedOption.id;
                var device = document.getElementById("selectDevice");
                var selectedOption = device.options[device.selectedIndex];
                var device = selectedOption.id;

                if (String(iptName.getValue()) == "" || String(type) == "") {
                    makePopup("Atenção", "Complete todos os campos para que o botão possa ser criado.");
                }
                if (type == "user") {
                    var value = document.getElementById("selectValue");
                    var selectedOption = value.options[value.selectedIndex];
                    var value = selectedOption.id;
                    app.send({ api: "admin", mt: "InsertMessage", name: String(iptName.getValue()), user: String(""), value: String(value), sip: String(user), type: String(type), device:device });
                    waitConnection(t1);
                }
            });
            //Botão Cancelar   
            t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:90%; font-size:15px; text-align:center", null, "button-inn-del")).addTranslation(texts, "btnCancel").addEvent("click", function () {
                makeTableButtons(t1);
            });
        }
        function addComboParamters(t) {
            //Usuário
            t.clear();
            t.add(new innovaphone.ui1.Div(null, texts.text("labelUser"), "labelUserCombo"));
            var iptUser = t.add(new innovaphone.ui1.Node("select", null, null, "iptUserCombo"));
            iptUser.setAttribute("id", "selectUser");
            iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", "none"));
            iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "TODOS", null).setAttribute("id", "all"));
            list_users.forEach(function (user) {
                iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.cn, null).setAttribute("id", user.sip));
            })
            //var iptUser = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
            //Nome Botão
            var divAdd7 = t.add(new innovaphone.ui1.Div(null, null, "divAdd7"))
            var iptName = divAdd7.add(new innovaphone.ui1.Input(null, null, texts.text("iptText"), 255, "url", "iptNameCombo"));
            divAdd7.add(new innovaphone.ui1.Div(null, texts.text("labelButtonName"), "labelButtonCombo"));
            iptName.setAttribute("placeholder", " ");
            //Nome Usuário
            //var labelUserName = t.add(new innovaphone.ui1.Div("position:absolute; display:block; left:0%; width:15%; top:30%; font-size:15px; text-align:right", texts.text("labelUserName")));
            //var iptUserName = t.add(new innovaphone.ui1.Input("position:absolute; display:block; left:16%; width:30%; top:30%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));

            //PAREI DAQUI P BAIXO - APAGAR ISSO DEPOIS

            //Parâmetro
            var divAdd8 = t.add(new innovaphone.ui1.Div(null, null, "divAdd8"));
            var iptValue = divAdd8.add(new innovaphone.ui1.Input(null, null, texts.text("iptText"), 500, "url", "iptValueCombo"));
            divAdd8.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueCombo"));
            iptValue.setAttribute("placeholder", " ");

            //Tipo
            t.add(new innovaphone.ui1.Div(null, texts.text("cabecalho6"), "combo1Div"));
            var iptType1 = t.add(new innovaphone.ui1.Node("select", null, null, "combo1"));
            iptType1.setAttribute("id", "selectType1");

            //Tipo
            t.add(new innovaphone.ui1.Div(null, texts.text("cabecalho7"), "combo2Div"));
            var iptType2 = t.add(new innovaphone.ui1.Node("select", null, null, "combo2"));
            iptType2.setAttribute("id", "selectType2");

            //Tipo
            t.add(new innovaphone.ui1.Div(null, texts.text("cabecalho8"), "combo3Div"));
            var iptType3 = t.add(new innovaphone.ui1.Node("select", null, null, "combo3"));
            iptType3.setAttribute("id", "selectType3");
            iptType3.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null));
            list_buttons.forEach(function (button) {
                if (button.button_type != "combo" && button.button_user == user || button.button_user == "all") {
                    iptType3.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                }
            })

            //Tipo
            t.add(new innovaphone.ui1.Div(null, texts.text("cabecalho9"), "combo4Div"));
            var iptType4 = t.add(new innovaphone.ui1.Node("select", null, null, "combo4"));
            iptType4.setAttribute("id", "selectType4");
            iptType4.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null));
            list_buttons.forEach(function (button) {
                if (button.button_type != "combo" && button.button_user == user || button.button_user == "all") {
                    iptType4.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                }
            })
            //Botão Salvar
            t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:90%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
                var type = document.getElementById("selectType");
                var selectedOption = type.options[type.selectedIndex];
                var type = selectedOption.id;
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var user = selectedOption.id;
                if (String(iptName.getValue()) == "" || String(type) == "") {
                    makePopup("Atenção", "Complete todos os campos para que o botão possa ser criado.");
                }
                else if (type == "combo") {
                    var type1 = document.getElementById("selectType1");
                    var selectedOption = type1.options[type1.selectedIndex];
                    var type1 = selectedOption.id;

                    var type2 = document.getElementById("selectType2");
                    var selectedOption = type2.options[type2.selectedIndex];
                    var type2 = selectedOption.id;

                    var type3 = document.getElementById("selectType3");
                    var selectedOption = type3.options[type3.selectedIndex];
                    var type3 = selectedOption.id;

                    var type4 = document.getElementById("selectType4");
                    var selectedOption = type4.options[type4.selectedIndex];
                    var type4 = selectedOption.id;
                    app.send({ api: "admin", mt: "InsertComboMessage", name: String(iptName.getValue()), user: String(""), value: String(iptValue.getValue()), sip: String(user), type: String(type), type1: String(type1), type2: String(type2), type3: String(type3), type4: String(type4) });
                    waitConnection(t1);
                }
            });
            //Botão Cancelar   
            t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:90%; font-size:15px; text-align:center", null, "button-inn-del")).addTranslation(texts, "btnCancel").addEvent("click", function () {
                makeTableButtons(t1);
            });


            document.getElementById("selectUser").addEventListener("change", function (e) {
                console.log(e.target.value);
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var user = selectedOption.id;
                iptType1.clear();
                list_buttons.forEach(function (button) {
                    if (button.button_type != "combo" && button.button_user == user || button.button_user == "all") {
                        iptType1.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                    }
                })

                iptType2.clear();
                iptType2.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null));
                list_buttons.forEach(function (button) {
                    if (button.button_type != "combo" && button.button_user == user || button.button_user == "all") {
                        iptType2.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                    }
                })
                iptType3.clear();
                iptType3.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null));
                list_buttons.forEach(function (button) {
                    if (button.button_type != "combo" && button.button_user == user || button.button_user == "all") {
                        iptType3.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                    }
                })
                iptType4.clear();
                iptType4.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null));
                list_buttons.forEach(function (button) {
                    if (button.button_type != "combo" && button.button_user == user || button.button_user == "all") {
                        iptType4.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                    }
                })
            });




        }

        //Testes Multi devices
        function addNumberParamtersMultiDevice(t) {
            //Usuário
            t.clear();
            t.add(new innovaphone.ui1.Div(null, texts.text("labelUser"), "labelUserNumber"));
            var iptUser = t.add(new innovaphone.ui1.Node("select", null, null, "selectUserNumber"));
            iptUser.setAttribute("id", "selectUser");
            iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", ""));

            list_users.forEach(function (user) {
                iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.cn, null).setAttribute("id", user.sip));
            })
            //var iptUser = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
            //Nome Botão
            var divAdd3 = t.add(new innovaphone.ui1.Div(null, null, "divAdd3"))
            var iptName = divAdd3.add(new innovaphone.ui1.Input(null, null, texts.text("iptText"), 255, "url", "iptNameNumber"));
            divAdd3.add(new innovaphone.ui1.Div(null, texts.text("labelButtonName"), "labelBtnNumber"));
            iptName.setAttribute("placeholder", " ");
            //Nome Usuário
            //t.add(new innovaphone.ui1.Div("position:absolute; display:block; left:0%; width:15%; top:30%; font-size:15px; text-align:right", texts.text("labelUserName")));
            //var iptUserName = t.add(new innovaphone.ui1.Input("position:absolute; display:block; left:16%; width:30%; top:30%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));

            //Parâmetro
            var divAdd4 = t.add(new innovaphone.ui1.Div(null, null, "divAdd4"))
            var iptValue = divAdd4.add(new innovaphone.ui1.Input(null, null, texts.text("iptText"), 500, "url", "iptValueNumber"));
            divAdd4.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueNumber"));
            iptValue.setAttribute("placeholder", " ");

            //Device
            t.add(new innovaphone.ui1.Div(null, texts.text("device"), "labelDeviceNumber"));
            var iptDevice = t.add(new innovaphone.ui1.Node("select", null, null, "iptDeviceNumber"));
            iptDevice.setAttribute("id", "selectDevice");
            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", ""));


            document.getElementById("selectUser").addEventListener("change", function (e) {
                console.log(e.target.value);
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var sip = selectedOption.id;
                iptDevice.clear();
                iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", ""));
                list_users.forEach(function (user) {
                    if (user.sip == sip) {
                        var devices = user.devices;
                        devices.forEach(function (dev) {
                            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
                        })
                    }
                })
            });


            //Botão Salvar
            t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:90%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
                var type = document.getElementById("selectType");
                var selectedOption = type.options[type.selectedIndex];
                var type = selectedOption.id;
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var user = selectedOption.id;
                var device = document.getElementById("selectDevice");
                var selectedOption = device.options[device.selectedIndex];
                var device = selectedOption.id;
                if (String(iptName.getValue()) == "" || String(iptValue.getValue()) == "") {
                    makePopup("Atenção", "Complete todos os campos para que o botão possa ser criado.");
                }
                else if (type == "externalnumber") {
                    app.send({ api: "admin", mt: "InsertNumberMessage", name: String(iptName.getValue()), user: String(""), value: String(iptValue.getValue()), sip: String(user), type: String(type), device: device });
                    waitConnection(t1);
                }
            });
            //Botão Cancelar   
            t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:90%; font-size:15px; text-align:center", null, "button-inn-del")).addTranslation(texts, "btnCancel").addEvent("click", function () {
                makeTableButtons(t1);
            });

        }
        
    }
    function makeDivUpdateButton(t1, button) {
        t1.clear();
        //Título
        t1.add(new innovaphone.ui1.Div(null, texts.text("labelTituloEdit"), "tituloAdd"));
        //Tipo
        t1.add(new innovaphone.ui1.Div(null, texts.text("labelType"), "labeltypeAdd"));
        var iptType = t1.add(new innovaphone.ui1.Node("select", null, null, "selectTypeAdd"));
        iptType.setAttribute("id", "selectType");
        list_types.forEach(function (type) {
            iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", type.typeName, null).setAttribute("id", type.id));
        });
        var comboarea = t1.add(new innovaphone.ui1.Div(null, null, "comboarea"));

        if (button) {
            var type = list_types.filter(function (type) { return type.id === button.button_type })[0].typeName;
            var select = document.getElementById('selectType');
            //select.value = button[2];
            select.value = type;
            switch (button.button_type) {
                case "externalnumber":
                    addNumberParamters(comboarea);
                    break;
                case "combo":
                    addComboParamters(comboarea);
                    break;
                case "user":
                    addUserParamters(comboarea);
                    break;
                default:
                    addStringParamters(comboarea);
                    break;
            }
        }
        document.getElementById("selectType").addEventListener("change", function (e) {
            console.log(e.target.value);
            if (e.target.value == "Usuário") {
                addUserParamters(comboarea);
            }
            else if (e.target.value == "Número") {
                addNumberParamters(comboarea);
            }
            else if (e.target.value == "Combo x4") {
                addComboParamters(comboarea);
            }
            else {
                addStringParamters(comboarea);
            }

        });
        function addStringParamters(t) {
            //Usuário
            t.clear();
            t.add(new innovaphone.ui1.Div(null, texts.text("labelUser"), "labelUserString"));
            var iptUser = t.add(new innovaphone.ui1.Node("select", null, null, "iptUserString"));
            iptUser.setAttribute("id", "selectUser");
            iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "TODOS", null).setAttribute("id", "all"));
            list_users.forEach(function (user) {
                iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.cn, null).setAttribute("id", user.sip));
            })
            //Atualiza valores
            if (button && button.button_user != "all") {
                var cn = list_users.filter(function (user) { return user.sip === button.button_user })[0].cn;
                var select = document.getElementById('selectUser');
                select.value = cn;
            } else if (button && button.button_user == "all") {
                var select = document.getElementById('selectUser');
                select.value = "TODOS";
            }
            //var iptUser = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
            var divAdd = t.add(new innovaphone.ui1.Div(null, null, "divAdd"))
            var iptName = divAdd.add(new innovaphone.ui1.Input(null, button.button_name, null, 255, "text", "iptNameString"));
            divAdd.add(new innovaphone.ui1.Div(null, texts.text("labelButtonName"), "labelBtnString"));
            //iptName.setAttribute("placeholder", " ");
            // divAdd.add(new innovaphone.ui1.Node("span",null,null,"focus-bg"))
            //Nome Usuário
            //t.add(new innovaphone.ui1.Div("position:absolute; display:block; left:0%; width:15%; top:30%; font-size:15px; text-align:right", texts.text("labelUserName")));
            //var iptUserName = t.add(new innovaphone.ui1.Input("position:absolute; display:block; left:16%; width:30%; top:30%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));

            //Parâmetro
            var divAdd2 = t.add(new innovaphone.ui1.Div(null, null, "divAdd2"))
            var iptValue = divAdd2.add(new innovaphone.ui1.Input(null, button.button_prt, null, 500, "text", "iptValueString"));
            divAdd2.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueString"));
            //Botão Salvar
            t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:90%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
                var type = document.getElementById("selectType");
                var selectedOption = type.options[type.selectedIndex];
                var type = selectedOption.id;
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var user = selectedOption.id;
                if (String(iptName.getValue()) == "" || String(type) == "") {
                    makePopup("Atenção", "Complete todos os campos para que o botão possa ser criado.");
                } else {
                    app.send({ api: "admin", mt: "UpdateMessage", id: button.id, name: String(iptName.getValue()), user: String(""), value: String(iptValue.getValue()), sip: String(user), type: String(type) });
                    waitConnection(t1);
                }
            });
            //Botão Cancelar   
            t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:90%; font-size:15px; text-align:center", null, "button-inn-del")).addTranslation(texts, "btnCancel").addEvent("click", function () {
                makeTableButtons(t1);
            });
        }
        function addNumberParamters(t) {
            //Usuário
            t.clear();
            t.add(new innovaphone.ui1.Div(null, texts.text("labelUser"), "labelUserNumber"));
            var iptUser = t.add(new innovaphone.ui1.Node("select", null, null, "selectUserNumber"));
            iptUser.setAttribute("id", "selectUser");
            
            list_users.forEach(function (user) {
                iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.cn, null).setAttribute("id", user.sip));
            })
            //Atualiza valores
            if (button.button_user != "all") {
                var cn = list_users.filter(function (user) { return user.sip === button.button_user })[0].cn;
                var select = document.getElementById('selectUser');
                select.value = cn;
            } else if (button && button.button_user == "all") {
                var select = document.getElementById('selectUser');
                select.value = "TODOS";
            }
            //var iptUser = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
            //Nome Botão
            var divAdd3 = t.add(new innovaphone.ui1.Div(null, null, "divAdd3"))
            var iptName = divAdd3.add(new innovaphone.ui1.Input(null, button.button_name, null, 255, "text", "iptNameNumber"));
            divAdd3.add(new innovaphone.ui1.Div(null, texts.text("labelButtonName"), "labelBtnNumber"));
            //Nome Usuário
            //t.add(new innovaphone.ui1.Div("position:absolute; display:block; left:0%; width:15%; top:30%; font-size:15px; text-align:right", texts.text("labelUserName")));
            //var iptUserName = t.add(new innovaphone.ui1.Input("position:absolute; display:block; left:16%; width:30%; top:30%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));

            //Parâmetro
            var divAdd4 = t.add(new innovaphone.ui1.Div(null, null, "divAdd4"))
            var iptValue = divAdd4.add(new innovaphone.ui1.Input(null, button.button_prt, null, 500, "text", "iptValueNumber"));
            divAdd4.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueNumber"));
            iptValue.setAttribute("id","iptValuePrt")

            //Device
            t.add(new innovaphone.ui1.Div(null, texts.text("device"), "labelDeviceNumber"));
            var iptDevice = t.add(new innovaphone.ui1.Node("select", "width:28%;margin-left:2%;", null, "iptDeviceNumber"));
            iptDevice.setAttribute("id", "selectDevice");
            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "", null).setAttribute("id", ""));

            //era só copiar o código do evento e colar fora do event listner assim o iptdevice é preeenchido ao carregar a div//
            try {
                var devices;
                list_users.forEach(function (user) {
                    if (user.sip == button.button_user) {
                        devices = user.devices;
                        devices.forEach(function (dev) {
                            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
                        })
                    }
                })

                //fazer selecionar o device que estava pré cadastrado no botão, é só fitrar os devices pelo hw que está no button_device e então usar o text para alterar o value//
                if (button.button_type == "externalnumber") {
                    var text = devices.filter(function (dev) { return dev.hw === button.button_device })[0].text;
                    var select = document.getElementById('selectDevice');
                    select.value = text;
                }

            } catch (e) {

            }

            document.getElementById("selectUser").addEventListener("change", function (e) {
                console.log(e.target.value);
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var sip = selectedOption.id;
                iptDevice.clear();
                list_users.forEach(function (user) {
                    if (user.sip == sip) {
                        var devices = user.devices;
                        devices.forEach(function (dev) {
                            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
                        })
                    }
                })
            });

            //Botão Salvar
            t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:90%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
                var type = document.getElementById("selectType");
                var selectedOption = type.options[type.selectedIndex];
                var type = selectedOption.id;
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var user = selectedOption.id;
                var prt = document.getElementById("iptValuePrt");
                var device = document.getElementById("selectDevice");
                var selectedOption = device.options[device.selectedIndex];
                var device = selectedOption.id;
                if (String(iptName.getValue()) == "" || String(prt) == "") {
                    makePopup("Atenção", "Complete todos os campos para que o botão possa ser criado.");
                }
                else if (type == "externalnumber") {
                    app.send({ api: "admin", mt: "UpdateMessage", id: button.id, name: String(iptName.getValue()), user: String(""), value: String(iptValue.getValue()), sip: String(user), type: String(type), device:device });
                    waitConnection(t1);
                }
            });
            //Botão Cancelar   
            t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:90%; font-size:15px; text-align:center", null, "button-inn-del")).addTranslation(texts, "btnCancel").addEvent("click", function () {
                makeTableButtons(t1);
            });

        }
        function addUserParamters(t) {
            //Usuário
            t.clear();
            t.add(new innovaphone.ui1.Div(null, texts.text("labelUser"), "labelUserUsers"));
            var iptUser = t.add(new innovaphone.ui1.Node("select", null, null, "iptUserUsers"));
            iptUser.setAttribute("id", "selectUser");
            list_users.forEach(function (user) {
                iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.cn, null).setAttribute("id", user.sip));
            })
            //Atualiza valores
            if (button && button.button_user != "all") {
                var cn = list_users.filter(function (user) { return user.sip === button.button_user })[0].cn;
                var select = document.getElementById('selectUser');
                select.value = cn;
            } else if (button && button.button_user == "all") {
                var select = document.getElementById('selectUser');
                select.value = "TODOS";
            }
            //var iptUser = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
            //Nome Botão
            var divAdd5 = t.add(new innovaphone.ui1.Div(null, null, "divAdd5"))
            var iptName = divAdd5.add(new innovaphone.ui1.Input(null, button.button_name, null, 255, "text", "iptNameUsers"));
            divAdd5.add(new innovaphone.ui1.Div(null, texts.text("labelButtonName"), "labelBtnUsers"));
            //Nome Usuário
            //var labelUserName = t.add(new innovaphone.ui1.Div("position:absolute; display:block; left:0%; width:15%; top:30%; font-size:15px; text-align:right", texts.text("labelUserName")));
            //var iptUserName = t.add(new innovaphone.ui1.Input("position:absolute; display:block; left:16%; width:30%; top:30%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));

            //Parâmetro
            t.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueUsers"));
            //var iptValue = t.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:25%; font-size:12px; text-align:center", null, texts.text("iptText"), 500, "url", null));

            var iptValue = t.add(new innovaphone.ui1.Node("select", null, null, "selectValueUsers"));
            iptValue.setAttribute("id", "selectValue");
            list_users.forEach(function (user) {
                iptValue.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.cn, null).setAttribute("id", user.sip));
            });
            if (button.button_type=="user") {
                var cn = list_users.filter(function (user) { return user.sip === button.button_prt })[0].cn;
                var select = document.getElementById('selectValue');
                select.value = cn;
            }

            //Device
            t.add(new innovaphone.ui1.Div(null, texts.text("device"), "labelDeviceNumber"));
            var iptDevice = t.add(new innovaphone.ui1.Node("select", "width:28%;margin-left:2%;", null, "iptDeviceNumber"));
            iptDevice.setAttribute("id", "selectDevice");
            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "", null).setAttribute("id", ""));

            //era só copiar o código do evento e colar fora do event listner assim o iptdevice é preeenchido ao carregar a div//
            try {
                var devices;
                list_users.forEach(function (user) {
                    if (user.sip == button.button_user) {
                        devices = user.devices;
                        devices.forEach(function (dev) {
                            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
                        })
                    }
                })

                //fazer selecionar o device que estava pré cadastrado no botão, é só fitrar os devices pelo hw que está no button_device e então usar o text para alterar o value//
                if (button.button_type == "user") {
                    var text = devices.filter(function (dev) { return dev.hw === button.button_device })[0].text;
                    var select = document.getElementById('selectDevice');
                    select.value = text;
                }

            } catch (e) {

            }
            document.getElementById("selectUser").addEventListener("change", function (e) {
                console.log(e.target.value);
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var sip = selectedOption.id;
                iptDevice.clear();
                list_users.forEach(function (user) {
                    if (user.sip == sip) {
                        var devices = user.devices;
                        devices.forEach(function (dev) {
                            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
                        })
                    }
                })
            });


            //Botão Salvar
            t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:90%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
                var type = document.getElementById("selectType");
                var selectedOption = type.options[type.selectedIndex];
                var type = selectedOption.id;
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var user = selectedOption.id;
                var device = document.getElementById("selectDevice");
                var selectedOption = device.options[device.selectedIndex];
                var device = selectedOption.id;

                var value = document.getElementById("selectValue");
                var selectedOption = value.options[value.selectedIndex];
                var value = selectedOption.id;

                if (String(iptName.getValue()) == "" || String(value) == "") {
                    makePopup("Atenção", "Complete todos os campos para que o botão possa ser criado.");
                }
                else {
                    app.send({ api: "admin", mt: "UpdateMessage", id: button.id, name: String(iptName.getValue()), user: String(""), value: String(value), sip: String(user), type: String(type), device: device });
                    waitConnection(t1);
                }
            });
            //Botão Cancelar   
            t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:90%; font-size:15px; text-align:center", null, "button-inn-del")).addTranslation(texts, "btnCancel").addEvent("click", function () {
                makeTableButtons(t1);
            });
        }
        function addComboParamters(t) {
            //Usuário
            t.clear();
            t.add(new innovaphone.ui1.Div(null, texts.text("labelUser"), "labelUserCombo"));
            var iptUser = t.add(new innovaphone.ui1.Node("select", null, null, "iptUserCombo"));
            iptUser.setAttribute("id", "selectUser");
            iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", "none"));
            //iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "TODOS", null).setAttribute("id", "all"));
            list_users.forEach(function (user) {
                iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.cn, null).setAttribute("id", user.sip));
            })
            //Atualiza valores
            if (button && button.button_user != "all") {
                var cn = list_users.filter(function (user) { return user.sip === button.button_user })[0].cn;
                var select = document.getElementById('selectUser');
                select.value = cn;
            } else if (button && button.button_user == "all") {
                var select = document.getElementById('selectUser');
                select.value = "TODOS";
            }
            //var iptUser = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
            //Nome Botão
            var divAdd7 = t.add(new innovaphone.ui1.Div(null, null, "divAdd7"))
            var iptName = divAdd7.add(new innovaphone.ui1.Input(null, button.button_name, null, 255, "text", "iptNameCombo"));
            divAdd7.add(new innovaphone.ui1.Div(null, texts.text("labelButtonName"), "labelButtonCombo"));

            //Nome Usuário
            //var labelUserName = t.add(new innovaphone.ui1.Div("position:absolute; display:block; left:0%; width:15%; top:30%; font-size:15px; text-align:right", texts.text("labelUserName")));
            //var iptUserName = t.add(new innovaphone.ui1.Input("position:absolute; display:block; left:16%; width:30%; top:30%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));

            //PAREI DAQUI P BAIXO - APAGAR ISSO DEPOIS

            //Parâmetro
            var divAdd8 = t.add(new innovaphone.ui1.Div(null, null, "divAdd8"));
            var iptValue = divAdd8.add(new innovaphone.ui1.Input(null, button.button_prt, null, 500, "text", "iptValueCombo"));
            divAdd8.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueCombo"));


            //// Tipo Botão 1 ////
            t.add(new innovaphone.ui1.Div(null, texts.text("cabecalho6"), "combo1Div"));
            var iptType1 = t.add(new innovaphone.ui1.Node("select", null, null, "combo1"));
            iptType1.setAttribute("id", "selectType1");

            list_buttons.forEach(function (btn) {
                if (btn.button_type != "combo" && btn.button_user == button.button_user || btn.button_user == "all") {
                    iptType1.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", btn.button_name, null).setAttribute("id", btn.id));
                }
            })

            if (button.button_type == "combo" && button.button_type_1 != "") {
                try {
                    var button_name = list_buttons.filter(function (btn) { return btn.id === parseInt(button.button_type_1) })[0].button_name;
                    var select = document.getElementById('selectType1');
                    select.value = button_name;
                } catch (e) {
                    console.warn("Botão 1 Referenciado no Combo já não existe mais! Erro: " + e)
                }
                
            }

            //// Tipo Botão 2 ////
            t.add(new innovaphone.ui1.Div(null, texts.text("cabecalho7"), "combo2Div"));
            var iptType2 = t.add(new innovaphone.ui1.Node("select", null, null, "combo2"));
            iptType2.setAttribute("id", "selectType2");

            list_buttons.forEach(function (btn) {
                if (btn.button_type != "combo" && btn.button_user == button.button_user || btn.button_user == "all") {
                    iptType2.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", btn.button_name, null).setAttribute("id", btn.id));
                }
            })

            if (button.button_type == "combo" && button.button_type_2 != "") {
                try {
                    var button_name = list_buttons.filter(function (btn) { return btn.id === parseInt(button.button_type_2) })[0].button_name;
                    var select = document.getElementById('selectType2');
                    select.value = button_name;

                } catch (e) {
                    console.warn("Botão 2 Referenciado no Combo já não existe mais! Erro: " + e)
                }
            }

            //// Tipo Botão 3 ////
            t.add(new innovaphone.ui1.Div(null, texts.text("cabecalho8"), "combo3Div"));
            var iptType3 = t.add(new innovaphone.ui1.Node("select", null, null, "combo3"));
            iptType3.setAttribute("id", "selectType3");

            iptType3.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null));
            list_buttons.forEach(function (btn) {
                if (btn.button_type != "combo" && btn.button_user == button.button_user || btn.button_user == "all") {
                    iptType3.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", btn.button_name, null).setAttribute("id", btn.id));
                }
            })

            if (button.button_type == "combo" && button.button_type_3 != "") {
                try {
                    var button_name = list_buttons.filter(function (btn) { return btn.id === parseInt(button.button_type_3) })[0].button_name;
                    var select = document.getElementById('selectType3');
                    select.value = button_name;

                } catch (e) {
                    console.warn("Botão 3 Referenciado no Combo já não existe mais! Erro: " + e)
                }
            }

            //// Tipo Botão 4 ////
            t.add(new innovaphone.ui1.Div(null, texts.text("cabecalho9"), "combo4Div"));
            var iptType4 = t.add(new innovaphone.ui1.Node("select", null, null, "combo4"));
            iptType4.setAttribute("id", "selectType4");
            iptType4.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null));
            list_buttons.forEach(function (btn) {
                if (btn.button_type != "combo" && btn.button_user == button.button_user || btn.button_user == "all") {
                    iptType4.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", btn.button_name, null).setAttribute("id", btn.id));
                }
            })
            if (button.button_type == "combo" && button.button_type_4 != "") {
                try {
                    var button_name = list_buttons.filter(function (btn) { return btn.id === parseInt(button.button_type_4) })[0].button_name;
                    var select = document.getElementById('selectType4');
                    select.value = button_name;

                } catch (e) {
                    console.warn("Botão 4 Referenciado no Combo já não existe mais! Erro: "+e)
                }
            }

            //// Botão Salvar ////
            t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:90%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
                var type = document.getElementById("selectType");
                var selectedOption = type.options[type.selectedIndex];
                var type = selectedOption.id;
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var user = selectedOption.id;
                if (String(iptName.getValue()) == "" || String(type) == "") {
                    makePopup("Atenção", "Complete todos os campos para que o botão possa ser criado.");
                }
                else if (type == "combo") {
                    var type1 = document.getElementById("selectType1");
                    var selectedOption = type1.options[type1.selectedIndex];
                    var type1 = selectedOption.id;

                    var type2 = document.getElementById("selectType2");
                    var selectedOption = type2.options[type2.selectedIndex];
                    var type2 = selectedOption.id;

                    var type3 = document.getElementById("selectType3");
                    var selectedOption = type3.options[type3.selectedIndex];
                    var type3 = selectedOption.id;

                    var type4 = document.getElementById("selectType4");
                    var selectedOption = type4.options[type4.selectedIndex];
                    var type4 = selectedOption.id;
                    app.send({ api: "admin", mt: "InsertComboMessage", name: String(iptName.getValue()), user: String(""), value: String(iptValue.getValue()), sip: String(user), type: String(type), type1: String(type1), type2: String(type2), type3: String(type3), type4: String(type4) });
                    waitConnection(t1);
                }
            });

            //// Botão Cancelar ////
            t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:90%; font-size:15px; text-align:center", null, "button-inn-del")).addTranslation(texts, "btnCancel").addEvent("click", function () {
                makeTableButtons(t1);
            });


            document.getElementById("selectUser").addEventListener("change", function (e) {
                console.log(e.target.value);
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var user = selectedOption.id;
                iptType1.clear();
                list_buttons.forEach(function (button) {
                    if (button.button_type != "combo" && button.button_user == user || button.button_user == "all") {
                        iptType1.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                    }
                })

                iptType2.clear();
                iptType2.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null));
                list_buttons.forEach(function (button) {
                    if (button.button_type != "combo" && button.button_user == user || button.button_user == "all") {
                        iptType2.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                    }
                })
                iptType3.clear();
                iptType3.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null));
                list_buttons.forEach(function (button) {
                    if (button.button_type != "combo" && button.button_user == user || button.button_user == "all") {
                        iptType3.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                    }
                })
                iptType4.clear();
                iptType4.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null));
                list_buttons.forEach(function (button) {
                    if (button.button_type != "combo" && button.button_user == user || button.button_user == "all") {
                        iptType4.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                    }
                })
            });
        }
    }

    function makeDivAddAction(t) {
        t.clear();
        //Título
        t.add(new innovaphone.ui1.Div(null, texts.text("btnAddAction"),"btnAddAction"));

        //Usuário
        t.add(new innovaphone.ui1.Div(null, texts.text("labelUser"),"labelUser"));
        var iptUser = t.add(new innovaphone.ui1.Node("select", null, null, "selectUserAction"));
        iptUser.setAttribute("id", "selectUser");
        iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "", null).setAttribute("id", ""));
        list_users.forEach(function (user) {
            iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.cn, null).setAttribute("id",user.sip));
        })
        //var iptUser = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:10%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
        
        //Nome
        var divAddAction = t.add(new innovaphone.ui1.Div(null,null,"divAddAction"))
        var iptName = divAddAction.add(new innovaphone.ui1.Input(null, null, null, 255, "text","iptNameAction"));
        divAddAction.add(new innovaphone.ui1.Div(null, texts.text("labelName"),"labelNameAction"));
        iptName.setAttribute("placeholder"," ");
        
        //SELECT LIGAÇÃO OU ALARME
        //var divAddAction5 = t.add(new innovaphone.ui1.Div(null,null,"divAddAction5")) desnecessário
        t.add(new innovaphone.ui1.Div(" border-bottom: 2px solid #02163F;",texts.text("labelAlarmeOrCall"),"labelTypeAction"));
        var selectAlarmOrNumber = t.add(new innovaphone.ui1.Node("select", null, "Escolher...", "selectAlarmOrCall").setAttribute("id", "selectStartType"));
        list_start_types.forEach(function (act) {
            selectAlarmOrNumber.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", act.typeName, null).setAttribute("id", act.id));
        })
        

        //Código Alarme
        var divAddAction2 = t.add(new innovaphone.ui1.Div(null,null,"divAddAction2"));
        var iptAlarmCode = divAddAction2.add(new innovaphone.ui1.Input(null, null, null, 255, "url","iptAlarmAction"));
        divAddAction2.add(new innovaphone.ui1.Div(null, texts.text("labelAlarmCode"),"labelNameAlarm"));
        iptAlarmCode.setAttribute("placeholder"," ");

        //Tipo
        t.add(new innovaphone.ui1.Div(null, texts.text("labelType"),"labelAction"));
        var iptType = t.add(new innovaphone.ui1.Node("select", null , null, "selectTypeAction"));
        iptType.setAttribute("id", "selectType");

        list_act_types.forEach(function (act) {
            iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", act.typeName, null).setAttribute("id", act.id));
        })

        //Valor
        var divAddAction4 =  t.add(new innovaphone.ui1.Div(null,null,"divAddAction4"));
        divAddAction4.add(new innovaphone.ui1.Input(null, null, null, 500, null, "iptValueAction").setAttribute("id","inputValue"));
        divAddAction4.add(new innovaphone.ui1.Div(null, texts.text("labelValue"),"labelValueAction"));


        //Device
        var divDevice = t.add(new innovaphone.ui1.Div(null, null, "divAddAction5"));

        document.getElementById("selectType").addEventListener("change", function (e) {
            console.log(e.target.value);
            if (e.target.value == "Número") {
                //Valor
                divAddAction4.clear();
                divAddAction4 = t.add(new innovaphone.ui1.Div(null, null, "divAddAction4"));
                divAddAction4.add(new innovaphone.ui1.Input(null, null, null, 500, null, "iptValueAction").setAttribute("id","inputValue"));
                divAddAction4.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueAction"));

                //Device
                divDevice.add(new innovaphone.ui1.Div(null, texts.text("device"), "labelDeviceNumberAction"));
                var iptDevice = divDevice.add(new innovaphone.ui1.Node("select", null, null, "iptDeviceNumberAction").setAttribute("id", "selectDevice"));
                //iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", ""));

                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var sip = selectedOption.id;
                iptDevice.clear();
                iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", ""));
                list_users.forEach(function (user) {
                    if (user.sip == sip) {
                        var devices = user.devices;
                        devices.forEach(function (dev) {
                            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
                        })
                    }
                })

                document.getElementById("selectUser").addEventListener("change", function (e) {
                    console.log(e.target.value);
                    var user = document.getElementById("selectUser");
                    var selectedOption = user.options[user.selectedIndex];
                    var sip = selectedOption.id;

                    var start = document.getElementById("selectType");
                    var start = start.options[start.selectedIndex].getAttribute("id");

                    if (start == "number") {
                        iptDevice.clear();
                        list_users.forEach(function (user) {
                            if (user.sip == sip) {
                                var devices = user.devices;
                                devices.forEach(function (dev) {
                                    iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
                                })
                            }
                        })
                    }
                });
            }
            else if (e.target.value == "Botão") {
                divDevice.clear();
                divAddAction4.clear();

                divAddAction4.add(new innovaphone.ui1.Div("width: 60%; font-size: 15px; text-align: left; border-bottom: 2px solid #02163F;", texts.text("labelValue"), "labelValueAction"));
                var iptValue = divAddAction4.add(new innovaphone.ui1.Node("select", null, null, "selectValueAction").setAttribute("id", "selectValue"));
                //iptValue.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", ""));

                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var sip = selectedOption.id;
                list_buttons.forEach(function (button) {
                    if (button.button_type != "combo" && button.button_user == sip || button.button_user == "all") {
                        iptValue.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                    }
                })
                document.getElementById("selectUser").addEventListener("change", function (e) {
                    console.log(e.target.value);
                    var user = document.getElementById("selectUser");
                    var selectedOption = user.options[user.selectedIndex];
                    var sip = selectedOption.id;

                    var start = document.getElementById("selectType");
                    var start = start.options[start.selectedIndex].getAttribute("id");

                    if (start == "button") {
                        //divAddAction4.clear();
                        iptValue.clear();
                        list_buttons.forEach(function (button) {
                            if (button.button_type != "combo" && button.button_user == sip || button.button_user == "all") {
                                iptValue.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                            }
                        })
                    }
                });
            } else  {
                divDevice.clear();
                divAddAction4.clear();
                divAddAction4 = t.add(new innovaphone.ui1.Div(null, null, "divAddAction4"));
                divAddAction4.add(new innovaphone.ui1.Input(null, null, null, 500, null, "iptValueAction").setAttribute("id", "inputValue"));
                divAddAction4.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueAction"));

            }
        });

        //Botão Salvar
        t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:90%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
            var type = document.getElementById("selectType");
            var selectedOption = type.options[type.selectedIndex];
            var type = selectedOption.id;
            var user = document.getElementById("selectUser");
            var selecteduser = user.options[user.selectedIndex];
            var user = selecteduser.id;
            var start = document.getElementById("selectStartType");
            var StartOpt = start.options[start.selectedIndex].getAttribute("id");
            //var start = document.getElementById("selectType");
            var device;
            var value;

            if (type == "number") {
                device = document.getElementById("selectDevice");
                var selectedOption = device.options[device.selectedIndex];
                var device = selectedOption.id;
            }
            if (type == "button") {
                value = document.getElementById("selectValue");
                var selectedOption = value.options[value.selectedIndex];
                value = selectedOption.id;
            } else {
                value = document.getElementById("inputValue").value;
            }
       
            if (String(iptName.getValue()) == "" || String(value) == "" || String(type) == "") {
                makePopup("Atenção", "Complete todos os campos para que a Ação possa ser criada.");
            }
            else {
                app.send({ api: "admin", mt: "InsertActionMessage", name: String(iptName.getValue()), alarm: String(iptAlarmCode.getValue()), start: String(StartOpt), value: String(value), sip: String(user), type: String(type), device: device });
                makeTableActions(t);
            }
        });
        //Botão Cancelar   
        t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:90%; color:var(--div-DelBtn); font-size:15px; text-align:center", null, "button-inn-del")).addTranslation(texts, "btnCancel").addEvent("click", function () {
            makeTableActions(t);
        });


    }
    function makeDivUpdateAction(t, action) {
        t.clear();
        //Título
        t.add(new innovaphone.ui1.Div(null, texts.text("labelTituloEdit"), "tituloAdd"));

        //Usuário
        t.add(new innovaphone.ui1.Div(null, texts.text("labelUser"), "labelUser"));
        var iptUser = t.add(new innovaphone.ui1.Node("select", null, null, "selectUserAction"));
        iptUser.setAttribute("id", "selectUser");
        list_users.forEach(function (user) {
            iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.cn, null).setAttribute("id", user.sip));
        })
        if (action) {
            var cn = list_users.filter(function (user) { return user.sip === action.action_user })[0].cn;
            var select = document.getElementById('selectUser');
            select.value = cn;
        }
        //var iptUser = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:10%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));

        //Nome
        var divAddAction = t.add(new innovaphone.ui1.Div(null, null, "divAddAction"))
        var iptName = divAddAction.add(new innovaphone.ui1.Input(null, action.action_name, null, 255, "text", "iptNameAction"));
        divAddAction.add(new innovaphone.ui1.Div(null, texts.text("labelName"), "labelNameAction"));

        //Tipo Gatilho
        //var divAddAction5 = t.add(new innovaphone.ui1.Div(null,null,"divAddAction5")) desnecessário
        t.add(new innovaphone.ui1.Div(" border-bottom: 2px solid #02163F;", texts.text("labelAlarmeOrCall"), "labelTypeAction"));
        var selectAlarmOrNumber = t.add(new innovaphone.ui1.Node("select", null, "Escolher...", "selectAlarmOrCall").setAttribute("id", "selectStartType"));
        list_start_types.forEach(function (act) {
            selectAlarmOrNumber.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", act.typeName, null).setAttribute("id", act.id));
        })
        if (action) {
            var type = list_start_types.filter(function (type) { return type.id === action.action_start_type })[0].typeName;
            var select = document.getElementById('selectStartType');
            select.value = type;
        }

        //Código Alarme
        var divAddAction2 = t.add(new innovaphone.ui1.Div(null, null, "divAddAction2"));
        var iptAlarmCode = divAddAction2.add(new innovaphone.ui1.Input(null, action.action_alarm_code, null, 255, "text", "iptAlarmAction"));
        divAddAction2.add(new innovaphone.ui1.Div(null, texts.text("labelAlarmCode"), "labelNameAlarm"));

        //Tipo
        t.add(new innovaphone.ui1.Div(null, texts.text("labelType"), "labelAction"));
        var iptType = t.add(new innovaphone.ui1.Node("select", null, null, "selectTypeAction"));
        iptType.setAttribute("id", "selectType");

        list_act_types.forEach(function (act) {
            iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", act.typeName, null).setAttribute("id", act.id));
        })

        if (action) {
            var type = list_act_types.filter(function (type) { return type.id === action.action_type })[0].typeName;
            var select = document.getElementById('selectType');
            select.value = type;
        }

        //Valor
        var divAddAction4 = t.add(new innovaphone.ui1.Div(null, null, "divAddAction4"));

        //Device
        var divDevice = t.add(new innovaphone.ui1.Div(null, null, "divAddAction5"));

        //Usa o TIPO da ação para preencher os campos
        if (action.action_type == "button") {
            divDevice.clear();
            divAddAction4.clear();
            divAddAction4.add(new innovaphone.ui1.Div("width: 60%; font-size: 15px; text-align: left; border-bottom: 2px solid #02163F;", texts.text("labelValue"), "labelValueAction"));
            var iptValue = divAddAction4.add(new innovaphone.ui1.Node("select", null, null, "selectValueAction").setAttribute("id", "selectValue"));
            //iptValue.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", ""));

            var user = document.getElementById("selectUser");
            var selectedOption = user.options[user.selectedIndex];
            var sip = selectedOption.id;
            list_buttons.forEach(function (button) {
                if (button.button_type != "combo" && button.button_user == sip || button.button_user == "all") {
                    iptValue.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                }
            })
            if (action) {
                var button_name = list_buttons.filter(function (btn) { return btn.id === parseInt(action.action_prt) })[0].button_name;
                var select = document.getElementById('selectValue');
                select.value = button_name;
            }
            document.getElementById("selectUser").addEventListener("change", function (e) {
                console.log(e.target.value);
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var sip = selectedOption.id;
                iptValue.clear();
                list_buttons.forEach(function (button) {
                    if (button.button_type != "combo" && button.button_user == sip || button.button_user == "all") {
                        iptValue.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                    }
                })
            });
            
        }
        else if (action.action_type == "number") {
            //Parametro
            divAddAction4.clear();
            divAddAction4.add(new innovaphone.ui1.Input(null, action.action_prt, null, 500, "text", "iptValueAction").setAttribute("id", "inputValue"));
            divAddAction4.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueAction"));

            //Device
            divDevice.add(new innovaphone.ui1.Div(null, texts.text("device"), "labelDeviceNumberAction"));
            var iptDevice = divDevice.add(new innovaphone.ui1.Node("select", null, null, "iptDeviceNumberAction").setAttribute("id", "selectDevice"));
            //iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", ""));

            var user = document.getElementById("selectUser");
            var selectedOption = user.options[user.selectedIndex];
            var sip = selectedOption.id;
            iptDevice.clear();
            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", ""));
            list_users.forEach(function (user) {
                if (user.sip == sip) {
                    var devices = user.devices;
                    devices.forEach(function (dev) {
                        iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
                    })
                }
            })
            if (action) {
                try {
                    var devices;
                    list_users.forEach(function (user) {
                        if (user.sip == action.action_user) {
                            devices = user.devices;
                            devices.forEach(function (dev) {
                                iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
                            })
                        }
                    })
                    //fazer selecionar o device que estava pré cadastrado no botão, é só fitrar os devices pelo hw que está no button_device e então usar o text para alterar o value//
                    var text = devices.filter(function (dev) { return dev.hw === action.action_device })[0].text;
                    var select = document.getElementById('selectDevice');
                    select.value = text;

                } catch (e) {
                    console.warn("Device não está mais disponível para esse usuário");
                } 
            }

            document.getElementById("selectUser").addEventListener("change", function (e) {
                console.log(e.target.value);
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var sip = selectedOption.id;
                iptDevice.clear();
                list_users.forEach(function (user) {
                    if (user.sip == sip) {
                        var devices = user.devices;
                        devices.forEach(function (dev) {
                            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
                        })
                    }
                })
            });
        }
        else {
            divAddAction4 = t.add(new innovaphone.ui1.Div(null, null, "divAddAction4"));
            var iptValue = divAddAction4.add(new innovaphone.ui1.Input(null, action.action_prt, null, 500, "text", "iptValueAction").setAttribute("id", "inputValue"));
            divAddAction4.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueAction"));
        }

        
        //Trata evento de Alteração de TIPO
        document.getElementById("selectType").addEventListener("change", function (e) {
            console.log(e.target.value);
            if (e.target.value == "Botão") {
                divDevice.clear();
                divAddAction4.clear();
                divAddAction4.add(new innovaphone.ui1.Div("width: 60%; font-size: 15px; text-align: left; border-bottom: 2px solid #02163F;", texts.text("labelValue"), "labelValueAction"));
                var iptValue = divAddAction4.add(new innovaphone.ui1.Node("select", null, null, "selectValueAction").setAttribute("id", "selectValue"));
                //iptValue.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", ""));

                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var sip = selectedOption.id;
                list_buttons.forEach(function (button) {
                    if (button.button_type != "combo" && button.button_user == sip || button.button_user == "all") {
                        iptValue.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                    }
                })
                if (action) {
                    var button_name = list_buttons.filter(function (btn) { return btn.id === parseInt(action.action_prt) })[0].button_name;
                    var select = document.getElementById('selectValue');
                    select.value = button_name;
                }
                document.getElementById("selectUser").addEventListener("change", function (e) {
                    console.log(e.target.value);
                    var user = document.getElementById("selectUser");
                    var selectedOption = user.options[user.selectedIndex];
                    var sip = selectedOption.id;

                    var start = document.getElementById("selectType");
                    var start = start.options[start.selectedIndex].getAttribute("id");

                    if (start == "button") {
                        iptValue.clear();
                        list_buttons.forEach(function (button) {
                            if (button.button_type != "combo" && button.button_user == sip || button.button_user == "all") {
                                iptValue.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                            }
                        })
                    }
                });
                    
            }
            else if (e.target.value == "Número") {
                //Parametro
                divAddAction4.clear();
                divAddAction4.add(new innovaphone.ui1.Input(null, action.action_prt, null, 500, "text", "iptValueAction").setAttribute("id", "inputValue"));
                divAddAction4.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueAction"));

                //Device
                divDevice.add(new innovaphone.ui1.Div(null, texts.text("device"), "labelDeviceNumberAction"));
                var iptDevice = divDevice.add(new innovaphone.ui1.Node("select", null, null, "iptDeviceNumberAction").setAttribute("id", "selectDevice"));
                //iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", ""));

                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var sip = selectedOption.id;
                iptDevice.clear();
                iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", ""));
                list_users.forEach(function (user) {
                    if (user.sip == sip) {
                        var devices = user.devices;
                        devices.forEach(function (dev) {
                            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
                        })
                    }
                })

                document.getElementById("selectUser").addEventListener("change", function (e) {
                    console.log(e.target.value);
                    var user = document.getElementById("selectUser");
                    var selectedOption = user.options[user.selectedIndex];
                    var sip = selectedOption.id;
                    var start = document.getElementById("selectType");
                    var start = start.options[start.selectedIndex].getAttribute("id");

                    if (start == "number") {
                        iptDevice.clear();
                        list_users.forEach(function (user) {
                            if (user.sip == sip) {
                                var devices = user.devices;
                                devices.forEach(function (dev) {
                                    iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
                                })
                            }
                        })
                    }
                });
            }
            else {
                divDevice.clear();
                divAddAction4.clear();
                divAddAction4 = t.add(new innovaphone.ui1.Div(null, null, "divAddAction4"));
                divAddAction4.add(new innovaphone.ui1.Input(null, action.action_prt, null, 500, "text", "iptValueAction").setAttribute("id","inputValue"));
                divAddAction4.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueAction"));
            }
        });

        //Botão Salvar
        t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:90%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
            var type = document.getElementById("selectType");
            var selectedOption = type.options[type.selectedIndex];
            var type = selectedOption.id;
            var user = document.getElementById("selectUser");
            var selecteduser = user.options[user.selectedIndex];
            var user = selecteduser.id;
            var start = document.getElementById("selectStartType");
            var StartOpt = start.options[start.selectedIndex].getAttribute("id");
            //var start = document.getElementById("selectType");
            var device;
            var value;

            if (type == "number") {
                device = document.getElementById("selectDevice");
                var selectedOption = device.options[device.selectedIndex];
                var device = selectedOption.id;
            }
            if (type == "button") {
                value = document.getElementById("selectValue");
                var selectedOption = value.options[value.selectedIndex];
                value = selectedOption.id;
            } else {
                value = document.getElementById("inputValue").value;
            }
            if (String(iptName.getValue()) == "" || String(value) == "" || String(type) == "") {
                makePopup("Atenção", "Complete todos os campos para que a Ação possa ser criada.");
            }
            else {
                app.send({ api: "admin", mt: "UpdateActionMessage", id: parseInt(action.id), name: String(iptName.getValue()), alarm: String(iptAlarmCode.getValue()), start:String(StartOpt), value: String(value), sip: String(user), type: String(type), device:device });
                makeTableActions(t);
            }
        });
        //Botão Cancelar   
        t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:90%; color:var(--div-DelBtn); font-size:15px; text-align:center", null, "button-inn-del")).addTranslation(texts, "btnCancel").addEvent("click", function () {
            makeTableActions(t);
        });

    }

    function makeDivAdmin(t) {
        t.clear();
        //Título
        t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:10%; font-size:25px; text-align:center", texts.text("labelTituloAdmin")));

        // chekbox
        t.add(new innovaphone.ui1.Div(null, texts.text("labelServerEnable"), "labelServerEnable"));
        var iptServerEnable = t.add(new innovaphone.ui1.Input(null, null, texts.text("urlText"), 1, "chekbox", "iptServerEnable"));
        iptServerEnable.setAttribute("id", "iptServerEnable")
        iptServerEnable.setValue(iptServerEnable);
        // url
        t.add(new innovaphone.ui1.Div(null, texts.text("labelURL"),"labelUrl"));
        var iptUrl = t.add(new innovaphone.ui1.Input(null, null, texts.text("urlText"), 255, "url","iptUrl"));
        iptUrl.setAttribute("id", "inputUrl")
        iptUrl.setValue(iptUrl);
        // metodo
        t.add(new innovaphone.ui1.Div(null, texts.text("inputMethod"), "inputMethod"));
        var inputMethod = t.add(new innovaphone.ui1.Input(null, null, texts.text("urlText"), 10, "text", "inputMethod"));
        inputMethod.setAttribute("id", "inputMethod")
        inputMethod.setValue(inputMethod);
        // chave google
        t.add(new innovaphone.ui1.Div(null, texts.text("labelGoogleKey"),"labelGoogleKey"));
        var iptGoogleKey = t.add(new innovaphone.ui1.Input(null, null, texts.text("urlText"), 255, "url", "iptGoogleKey"));
        iptGoogleKey.setAttribute("id", "inputGoogle")
        iptGoogleKey.setValue(googlekey);

        t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:30%; top:90%; font-size:12px; text-align:center", null, "button-inn")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
            app.send({ api: "admin", mt: "UpdateConfig", prt: "googlekey", vl: String(iptGoogleKey.getValue()) });
            app.send({ api: "admin", mt: "UpdateConfig", prt: "urlalert", vl: String(iptUrl.getValue()), method: inputMethod.getValue(), enableServer: iptServerEnable.getValue() });
            //iptUrl = String(iptGoogleKey.getValue());
        });
        
    }
    function makeDivClearDB(t) {
        t.clear();
        //Título
        t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:10%; font-size:25px; text-align:center", texts.text("labelTituloClearDB")));

        var divTo = t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 35%; left: 6%; font-weight: bold;", texts.text("labelTo"), null));
        var InputTo = t.add(new innovaphone.ui1.Input("position: absolute; top: 35%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "date", null).setAttribute("id", "dateTo"));
        var divReport = t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 45%; left: 6%; font-weight: bold;", texts.text("labelReports"), null));
        var SelectReport = new innovaphone.ui1.Node("select", "position: absolute; top: 45%; left: 20%; height: 25px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F; font-size: 13px; font-weight: bold ", null, null).setAttribute("id", "selectReport");
        t.add(SelectReport);
        SelectReport.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", "Chamadas", null)).setAttribute("id", "RptCalls");
        SelectReport.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", "Disponibilidade", null)).setAttribute("id", "RptAvailability");
        SelectReport.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", "Atividades", null)).setAttribute("id", "RptActivities");
        // buttons
        t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn-del")).addTranslation(texts, "btnOk").addEvent("click", function () {
            var to = document.getElementById("dateTo").value;
            var report = document.getElementById("selectReport");
            var selectedOption = report.options[report.selectedIndex];
            var report = selectedOption.id;
            app.send({ api: "admin", mt: "DeleteFromReports", src: report,  to: to });
            waitConnection(t);
        });
        t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnCancel").addEvent("click", function () {
            constructor();
        });
    }

    function makeTableButtons(t) {
        t.clear();
        //Botões Tabela de Botões
        t.add(new innovaphone.ui1.Div("position:absolute; left:60%; width:20%; top:10%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnAddButton").addEvent("click", function () {
            makeDivAddButton(t);
        });
        t.add(new innovaphone.ui1.Div("position:absolute; left:40%; width:20%; top:10%; font-size:12px; text-align:center;", null, "button-inn-del")).addTranslation(texts, "btnDelButton").addEvent("click", function () {
            var selected = listView.getSelectedRows();
            console.log(selected);

            if (selected.length >= 1) {
                var selectedrows = [];

                selected.forEach(function (s) {
                    console.log(s);
                    selectedrows.push(listView.getRowData(s)[0])

                })
                app.send({ api: "admin", mt: "DeleteMessage", id: selectedrows });
            } else {
                window.alert(texts.text("promptSelectButton"));
            }
            
        });
        t.add(new innovaphone.ui1.Div("position:absolute; left:20%; width:20%; top:10%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnEditButton").addEvent("click", function () {
            var selected = listView.getSelectedRows();
            console.log(selected[0]);

            if (selected.length==1) {
                var button = list_buttons.filter(function (btn) { return btn.id === parseInt(listView.getRowData(selected[0])[0]) })[0];
                makeDivUpdateButton(t, button)
            } else {
                window.alert(texts.text("promptSelectButton"));
            }

        });
        //Título Tabela Botôes
        var labelTituloTabeaBotoes = t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:20%; font-size:17px; text-align:center; font-weight: bold", texts.text("labelTituloBotoes")));

        var scroll_container = new innovaphone.ui1.Node("scroll-container", "position: absolute; left:1%; top:25%; right:1%; width: 98%; height:-webkit-fill-available;", null, "scroll-container-table");

        var list = new innovaphone.ui1.Div("position: absolute; left:2px; right:2px; height:fit-content", null, "table-buttons");
        var columns = 4;
        var rows = list_buttons.length;
        var listView = new innovaphone.ui1.ListView(list, 50, "headercl", "arrow", false);
        //Cabeçalho
        for (i = 0; i < columns; i++) {
            listView.addColumn(null, "text", texts.text("cabecalho" + i), i, 10, false);
        }
        //Tabela    
        list_buttons.forEach(function (b) {
            var row = [];
            row.push(b.id);
            row.push(b.button_name);
            // Substituir valores de b.name por texto correspondente
            switch (b.button_type) {
                case "video":
                    row.push("Vídeo");
                    break;
                case "page":
                    row.push("Página Iframe");
                    break;
                case "alarm":
                    row.push("Alarme");
                    break;
                case "externalnumber":
                    row.push("Número");
                    break;
                case "combo":
                    row.push("Combo x4");
                    break;
                case "user":
                    row.push("Usuário");
                    break;
                default:
                    row.push(b.button_type);
            }
            row.push(b.button_user);

            listView.addRow(i, row, "rowbutton", "#A0A0A0", "#82CAE2");
        })
        
        scroll_container.add(list);
        t.add(scroll_container);
    }

    function makeTableActions(t) {
        t.clear();
        
        //Botões Tabela de Ações
        t.add(new innovaphone.ui1.Div("position:absolute; left:60%; width:20%; top:10%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnAddAction").addEvent("click", function () {
            makeDivAddAction(t);
        });
        t.add(new innovaphone.ui1.Div("position:absolute; left:40%; width:20%; top:10%; font-size:12px; text-align:center;", null, "button-inn-del")).addTranslation(texts, "btnDelAction").addEvent("click", function () {
            var selected = actionsListView.getSelectedRows();
            console.log(selected);

            if (selected.length >= 1) {
                var selectedrows = [];

                selected.forEach(function (s) {
                    console.log(s);
                    selectedrows.push(actionsListView.getRowData(s)[0])
                })
                app.send({ api: "admin", mt: "DeleteActionMessage", id: selectedrows });
            } else {
                window.alert(texts.text("promptSelectAction"));
            }
            
        });
        t.add(new innovaphone.ui1.Div("position:absolute; left:20%; width:20%; top:10%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnEditButton").addEvent("click", function () {
            var selected = actionsListView.getSelectedRows();
            console.log(selected[0]);
            if (selected.length==1) {
                var action = list_actions.filter(function (act) { return act.id === parseInt(actionsListView.getRowData(selected[0])[0]) })[0];
                makeDivUpdateAction(t, action)
            } else {
                window.alert(texts.text("promptSelectAction"));
            }
            

        });


        //Título Tabela Ações
        var labelTituloTabeaAcoes = t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:100%; top:20%; font-size:17px; text-align:center; font-weight: bold", texts.text("labelTituloAcoes")));

        var scroll_container = new innovaphone.ui1.Node("scroll-container", "position: absolute; left:1%; top:25%; right:1%; width:98%; height:-webkit-fill-available;", null, "scroll-container-table");

        var list = new innovaphone.ui1.Div(null, null, "table-actions");
        var columns = 7;
        var rows = list_actions.length;
        var actionsListView = new innovaphone.ui1.ListView(list, 50, "headercl", "arrow", false);
        //Cabeçalho
        for (i = 0; i < columns; i++) {
            actionsListView.addColumn(null, "text", texts.text("cabecalhoAction" + i), i, 10, false);
        }
        //Tabela    
        list_actions.forEach(function (b) {
            var row = [];
            row.push(b.id);
            row.push(b.action_name);
           
            // Substituir valores de b.action_start_type por texto correspondente
            switch (b.action_start_type) {
                case "alarm":
                    row.push("Alarme");
                    break;
                case "out-number":
                    row.push("Número Destino");
                    break;
                case "inc-number":
                    row.push("Número Origem");
                    break;
                default:
                    row.push(b.action_start_type);
            }
            row.push(b.action_alarm_code);

            
            // Substituir valores de b.name por texto correspondente
            switch (b.action_type) {
                case "video":
                    row.push("Vídeo");
                    row.push(b.action_prt);
                    break;
                case "page":
                    row.push("Página Iframe");
                    row.push(b.action_prt);
                    break;
                case "alarm":
                    row.push("Alarme");
                    row.push(b.action_prt);
                    break;
                case "number":
                    row.push("Número");
                    row.push(b.action_prt);
                    break;
                case "popup":
                    row.push("PopUp Iframe");
                    row.push(b.action_prt);
                    break;
                case "button":
                    row.push("Botão");
                    var button_name = list_buttons.filter(function (btn) { return btn.id === parseInt(b.action_prt) })[0].button_name;
                    row.push(button_name);
                    break;
                default:
                    row.push(b.action_type);
                    row.push(b.action_prt);
            }
            row.push(b.action_user);
            actionsListView.addRow(i, row, "rowaction", "#A0A0A0", "#82CAE2");
        })
        scroll_container.add(list);
        t.add(scroll_container);
    }

    function constructor() {
        that.clear();
        // col direita
        var _colDireita = that.add(new innovaphone.ui1.Div(null, null, "colunadireitaadmin"));
        // col Esquerda
        var colEsquerda = that.add(new innovaphone.ui1.Div(null, null, "colunaesquerda"));
        var divreport = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; border-bottom: 1px solid #4b545c; border-width: 100%; height: 10%; width: 100%; background-color: #02163F;  display: flex; align-items: center;", null, null));
        var imglogo = divreport.add(new innovaphone.ui1.Node("img", "max-height: 33px; opacity: 0.8;", null, "img-logo-adm"));
        imglogo.setAttribute("src", "logo-wecom.png");
        var spanreport = divreport.add(new innovaphone.ui1.Div("font-size: 1.00rem; color:white; margin : 5px;", appdn, "appname"));
        var user = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; height: 10%; top: 10%; width: 100%; align-items: center; display: flex; border-bottom: 1px solid #4b545c"));
        var imguser = user.add(new innovaphone.ui1.Node("img", "max-height: 33px; border-radius: 50%;", null, "img-logo-adm"));
        imguser.setAttribute("src", UIuserPicture);
        var username = user.add(new innovaphone.ui1.Node("span", "font-size: 0.75rem; color:white; margin: 5px;", UIuser, "username"));
        username.setAttribute("id", "user")

        var menuarea = colEsquerda.add(new innovaphone.ui1.Node("scroll-container", "position: absolute; top: 20%; height: 76%; width:100%; overflow-y: auto;", null,"menuarea"));

        var configs = menuarea.add(new innovaphone.ui1.Div("position: absolute; top: 5%; height: 40%; width:100%"));
        configs.add(new innovaphone.ui1.Node("p", "text-align: left; font-size: 17px;", texts.text("labelAdmin"), null));
        configs.add(new innovaphone.ui1.Node("br", null, null, null));

        var lirelatorios1 = configs.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"));
        var lirelatorios2 = configs.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"));
        var lirelatorios3 = configs.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"));
        var lirelatorios4 = configs.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"));
        var lirelatorios5 = configs.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"));
        lirelatorios1.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgButtons"), null).setAttribute("id", "CfgButtons"));
        lirelatorios2.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgAcctions"), null).setAttribute("id", "CfgAcctions"));
        lirelatorios3.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgNovaalert"), null).setAttribute("id", "CfgNovaalert"));
        lirelatorios4.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgDefaults"), null).setAttribute("id", "CfgDefaults"));
        lirelatorios5.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgLicense"), null).setAttribute("id", "CfgLicense"));

        var relatorios = menuarea.add(new innovaphone.ui1.Div("position: absolute; top: 50%; height: 40%; width:100%"));
        relatorios.add(new innovaphone.ui1.Node("p", "text-align: left; font-size: 17px;", texts.text("labelReports"), null));
        relatorios.add(new innovaphone.ui1.Node("br", null, null, null));
        var lirelatorios1 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        var lirelatorios2 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        var lirelatorios3 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        lirelatorios1.add(new innovaphone.ui1.Node("a", null, texts.text("labelRptAvailability"), null).setAttribute("id", "RptAvailability"));
        lirelatorios2.add(new innovaphone.ui1.Node("a", null, texts.text("labelRptCalls"), null).setAttribute("id", "RptCalls"));
        lirelatorios3.add(new innovaphone.ui1.Node("a", null, texts.text("labelRptActivities"), null).setAttribute("id", "RptActivities"));

        var divother = colEsquerda.add(new innovaphone.ui1.Div("text-align: left; position: absolute; top:59%;", null, null));
        var divother2 = divother.add(new innovaphone.ui1.Div(null, null, "otherli"));

        var config = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 90%;", null, null));
        //var liconfig = config.add(new innovaphone.ui1.Node("li", "display:flex; aligns-items: center", null, "config"));

        var imgconfig = config.add(new innovaphone.ui1.Node("img", "width: 100%; opacity: 0.9;", null, null));
        imgconfig.setAttribute("src", "wecom-white.svg");
        //var Aconfig = liconfig.add(new innovaphone.ui1.Node("a", "display: flex; align-items: center; justify-content: center;", texts.text("labelConfig"), null));
        //Aconfig.setAttribute("href", "#");

        var a = document.getElementById("CfgLicense");
        a.addEventListener("click", function(){
            app.send({ api: "admin", mt: "ConfigLicense"});
            waitConnection(_colDireita);
        })

        var a = document.getElementById("CfgButtons");
        a.addEventListener("click", function () {
            app.send({ api: "admin", mt: "SelectMessage" });
            waitConnection(_colDireita)
        })

        var a = document.getElementById("CfgAcctions");
        a.addEventListener("click", function () {
            app.send({ api: "admin", mt: "SelectActionMessage" });
            waitConnection(_colDireita)
        })

        var a = document.getElementById("CfgNovaalert");
        a.addEventListener("click", function () { makeDivAdmin(_colDireita) })

        var a = document.getElementById("CfgDefaults");
        a.addEventListener("click", function () { makeDivClearDB(_colDireita) })

        var a = document.getElementById("RptAvailability");
        a.addEventListener("click", function () { filterReports("RptAvailability", _colDireita) })
        var a = document.getElementById("RptCalls");
        a.addEventListener("click", function () { filterReports("RptCalls", _colDireita) })
        var a = document.getElementById("RptActivities");
        a.addEventListener("click", function () { filterReports("RptActivities", _colDireita) })

        colDireita = _colDireita;
    }
    function filterReports(rpt,colDireita) {
        colDireita.clear();

        switch (rpt) {
            case "RptCalls":
                var divFiltros = colDireita.add(new innovaphone.ui1.Div("position:absolute; font-weight:bolder; width: 90%; top: 5%; left: 5%; font-size: 25px;", texts.text("labelFiltros"), null));
                var divFiltrosDetails = colDireita.add(new innovaphone.ui1.Div("position:absolute; font-weight:bolder; width: 50%; top: 8.5%; left: 18%; font-size: 15px;", texts.text(rpt), null));
                var divFrom = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 25.5%; left: 6%; font-weight: bold;", texts.text("labelFrom"), null));
                var InputFrom = colDireita.add(new innovaphone.ui1.Input("position: absolute;  top: 25%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "date", null).setAttribute("id", "dateFrom"));
                var divTo = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 35.5%; left: 6%; font-weight: bold;", texts.text("labelTo"), null));
                var InputTo = colDireita.add(new innovaphone.ui1.Input("position: absolute; top: 35%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "date", null).setAttribute("id", "dateTo"));
                var divNumber = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 45.6%; left: 6%; font-weight: bold;", texts.text("labelPhone"), null));
                var InputNumber = colDireita.add(new innovaphone.ui1.Input("position: absolute; top: 45%; left: 20%; height: 25px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F; ", null, null, null, "number", null).setAttribute("id", "number"));
                var divRamal = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 55.6%; left: 6%; font-weight: bold;", texts.text("labelAgent"), null));
                var SelectRamal = new innovaphone.ui1.Node("select", "position: absolute; top: 55.0%; left: 20%; height: 25px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F; font-size: 13px; font-weight: bold ", null, null).setAttribute("id", "selectUser");
                colDireita.add(SelectRamal);
                SelectRamal.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", null, null)).setAttribute("id", "sips");
                list_users.forEach(function (user) {
                    SelectRamal.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", user.sip, null)).setAttribute("id", "sips");
                })
                break;
            case "RptAvailability":
                var divFiltros = colDireita.add(new innovaphone.ui1.Div("position:absolute; font-weight:bolder; width: 90%; top: 5%; left: 5%; font-size: 25px;", texts.text("labelFiltros"), null));
                var divFiltrosDetails = colDireita.add(new innovaphone.ui1.Div("position:absolute; font-weight:bolder; width: 50%; top: 8.5%; left: 18%; font-size: 15px;", texts.text(rpt), null));
                var divFrom = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 25.5%; left: 6%; font-weight: bold;", texts.text("labelFrom"), null));
                var InputFrom = colDireita.add(new innovaphone.ui1.Input("position: absolute;  top: 25%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "date", null).setAttribute("id", "dateFrom"));
                var divTo = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 35.5%; left: 6%; font-weight: bold;", texts.text("labelTo"), null));
                var InputTo = colDireita.add(new innovaphone.ui1.Input("position: absolute; top: 35%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "date", null).setAttribute("id", "dateTo"));
                var divRamal = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 45.6%; left: 6%; font-weight: bold;", texts.text("labelAgent"), null));
                var SelectRamal = new innovaphone.ui1.Node("select", "position: absolute; top: 45.0%; left: 20%; height: 25px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F; font-size: 13px; font-weight: bold ", null, null).setAttribute("id", "selectUser");
                colDireita.add(SelectRamal);
                SelectRamal.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", null, null)).setAttribute("id", "sips");
                list_users.forEach(function (user) {
                    SelectRamal.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", user.sip, null)).setAttribute("id", "sips");
                })
                break;
            case "RptActivities":
                var divFiltros = colDireita.add(new innovaphone.ui1.Div("position:absolute; font-weight:bolder; width: 90%; top: 5%; left: 5%; font-size: 25px;", texts.text("labelFiltros"), null));
                var divFiltrosDetails = colDireita.add(new innovaphone.ui1.Div("position:absolute; font-weight:bolder; width: 50%; top: 8.5%; left: 18%; font-size: 15px;", texts.text(rpt), null));
                var divFrom = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 25.5%; left: 6%; font-weight: bold;", texts.text("labelFrom"), null));
                var InputFrom = colDireita.add(new innovaphone.ui1.Input("position: absolute;  top: 25%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "date", null).setAttribute("id", "dateFrom"));
                var divTo = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 35.5%; left: 6%; font-weight: bold;", texts.text("labelTo"), null));
                var InputTo = colDireita.add(new innovaphone.ui1.Input("position: absolute; top: 35%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "date", null).setAttribute("id", "dateTo"));
                var divEvent = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 45.6%; left: 6%; font-weight: bold;", texts.text("labelEvent"), null));
                var iptEvent = colDireita.add(new innovaphone.ui1.Node("select", "position:absolute; left:20%; width:20%; top:45.6%; text-align:center; border-radius: 10px; border: 2px solid; border-color:#02163F; font-size: 13px; font-weight: bold;", null, null));
                iptEvent.setAttribute("id", "selectEvent");
                var opt = iptEvent.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "", null).setAttribute("id", ""));
                var opt = iptEvent.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "Alarme", null).setAttribute("id", "alarm"));
                var opt = iptEvent.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "Ligação", null).setAttribute("id", "call"));
                var opt = iptEvent.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "Vídeo", null).setAttribute("id", "video"));
                var opt = iptEvent.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "Combo", null).setAttribute("id", "combo"));
                var opt = iptEvent.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "Página Iframe", null).setAttribute("id", "page"));
                var opt = iptEvent.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "PopUp Iframe", null).setAttribute("id", "popup"));
                var divRamal = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 55.6%; left: 6%; font-weight: bold;", texts.text("labelAgent"), null));
                var SelectRamal = new innovaphone.ui1.Node("select", "position: absolute; top: 55.0%; left: 20%; height: 25px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F; font-size: 13px; font-weight: bold ", null, null).setAttribute("id", "selectUser");
                colDireita.add(SelectRamal);
                SelectRamal.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", null, null)).setAttribute("id", "sips");
                list_users.forEach(function (user) {
                    SelectRamal.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", user.sip, null)).setAttribute("id", "sips");
                })
                break;
        }
        // buttons
        colDireita.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnOk").addEvent("click", function () {
            var sip = document.getElementById("selectUser").value;
            var from = document.getElementById("dateFrom").value;
            var to = document.getElementById("dateTo").value;
            var event;
            var number;

            if (rpt == "RptCalls") {
                number = document.getElementById("number").value;
            } else if (rpt == "RptActivities") {
                event = document.getElementById("selectEvent");
                var selectedOption = event.options[event.selectedIndex];
                event = selectedOption.id;
            }
            

            app.send({ api: "admin", mt: "SelectFromReports", sip: sip, from: from, to: to, number: number, event: event, src: rpt });
            waitConnection(colDireita);
        });
        colDireita.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn-del")).addTranslation(texts, "btnCancel").addEvent("click", function () {
            constructor();
        });
        
    }

    function waitConnection(t) {
        t.clear();
        var bodywait = new innovaphone.ui1.Div("height: 100%; width: 100%; display: inline-flex; position: absolute;justify-content: center; background-color:rgba(100,100,100,0.5)", null, "bodywaitconnection")
        bodywait.addHTML('<svg class="pl" viewBox="0 0 128 128" width="128px" height="128px" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="hsl(193,90%,55%)" /><stop offset="100%" stop-color="hsl(223,90%,55%)" /></linearGradient></defs>	<circle class="pl__ring" r="56" cx="64" cy="64" fill="none" stroke="hsla(0,10%,10%,0.1)" stroke-width="16" stroke-linecap="round" />	<path class="pl__worm" d="M92,15.492S78.194,4.967,66.743,16.887c-17.231,17.938-28.26,96.974-28.26,96.974L119.85,59.892l-99-31.588,57.528,89.832L97.8,19.349,13.636,88.51l89.012,16.015S81.908,38.332,66.1,22.337C50.114,6.156,36,15.492,36,15.492a56,56,0,1,0,56,0Z" fill="none" stroke="url(#pl-grad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="44 1111" stroke-dashoffset="10" /></svg >');
        t.add(bodywait);
    }

    //report pages
    function reportView(t, response, src) {
        return new Promise(function (resolve, reject) {
            try {
                t.clear();
                
                ////Botões Tabela
                //t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:5%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnPdf").addEvent("click", function () {
                //    downloadPDF();
                //});
                //t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:5%; font-size:12px; text-align:center;", null, "button-inn-del")).addTranslation(texts, "btnReturn").addEvent("click", function () {
                //    filterReports(src, colDireita)
                //});
                ////Título Tabela
                //t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:30%; top:10%; font-size:17px; text-align:center; font-weight: bold", texts.text(src)).setAttribute("id", "titleReport"));
                var list = new innovaphone.ui1.Div("position: absolute; left:2px; top:15%; right:2px; height:fit-content", null, "").setAttribute("id", "listReport");
                //var columns = Object.keys(result[0]).length;
                var listView = new innovaphone.ui1.ListView(list, 50, "headercl", "arrow", false);
                //Cabeçalho
                switch (src) {
                    case "RptCalls":
                        for (i = 0; i < 6; i++) {
                            listView.addColumn(null, "text", texts.text("cabecalho" + src + + i), i, 10, false);
                        }
                        break;
                    case "RptActivities":
                        for (i = 0; i < 5; i++) {
                            listView.addColumn(null, "text", texts.text("cabecalho" + src + + i), i, 10, false);
                        }
                        break;
                    case "RptAvailability":
                        for (i = 0; i < 4; i++) {
                            listView.addColumn(null, "text", texts.text("cabecalho" + src + + i), i, 10, false);
                        }
                        break;
                    default:
                        for (i = 0; i < 1; i++) {
                            listView.addColumn(null, "text", texts.text("cabecalho" + src + + i), i, 10, false);
                        }
                        break;

                }
                
                //Tabela 
                try {
                    var result = JSON.parse(response);
                    switch (src) {
                        case "RptCalls":
                            result.forEach(function (b) {
                                var row = [];
                                row.push(b.sip);
                                row.push(b.number);
                                row.push(b.call_started);
                                row.push(b.call_ringing);
                                row.push(b.call_connected);
                                row.push(b.call_ended);
                                // Substituir valores de b.status por texto correspondente
                                switch (b.status) {
                                    case 6:
                                        row.push("Desc. Realizada");
                                        break;
                                    case 7:
                                        row.push("Desc. Recebida");
                                        break;
                                    case 134:
                                        row.push("Desc. Realizada");
                                        break;
                                    case 135:
                                        row.push("Desc. Recebida");
                                        break;
                                    default:
                                        row.push(b.status);
                                }
                                //row.push(b.status);
                                // Substituir valores de b.direction por texto correspondente
                                switch (b.direction) {
                                    case "inc":
                                        row.push("Entrada");
                                        break;
                                    case "out":
                                        row.push("Saída");
                                        break;
                                    default:
                                        row.push(b.direction);
                                }
                                //row.push(b.direction);
                                listView.addRow(i, row, "rowcl", "#A0A0A0", "#82CAE2");
                                //t.add(list);
                            })
                            break;
                        case "RptActivities":
                            result.forEach(function (b) {
                                var row = [];
                                row.push(b.sip);
                                // Substituir valores de b.name por texto correspondente
                                switch (b.name) {
                                    case "video":
                                        row.push("Vídeo");
                                        break;
                                    case "page":
                                        row.push("Página");
                                        break;
                                    case "alarm":
                                        row.push("Alarme");
                                        break;
                                    case "call":
                                        row.push("Ligação");
                                        break;
                                    case "combo":
                                        row.push("Combo");
                                        break;
                                    case "popup":
                                        row.push("PopUp");
                                        break;
                                    default:
                                        row.push(b.name);
                                }
                                //row.push(b.name);
                                row.push(b.date);
                                // Substituir valores de b.status por texto correspondente
                                switch (b.status) {
                                    case "start":
                                        row.push("Ínício");
                                        break;
                                    case "stop":
                                        row.push("Fim");
                                        break;
                                    case "inc":
                                        row.push("Entrada");
                                        break;
                                    case "out":
                                        row.push("Saída");
                                        break;
                                    default:
                                        row.push(b.status);
                                }
                                //row.push(b.status);
                                row.push(b.details);
                                listView.addRow(i, row, "rowcl", "#A0A0A0", "#82CAE2");
                                //t.add(list);
                            })
                            break;
                        case "RptAvailability":
                            result.forEach(function (b) {
                                var row = [];
                                row.push(b.sip);
                                row.push(b.date);
                                row.push(b.status);
                                row.push(b.group_name);
                                listView.addRow(i, row, "rowcl", "#A0A0A0", "#82CAE2");
                                //t.add(list);
                            })
                            break;
                    }

                } catch (e){
                    console.log("Erro ao receber report: "+e)
                }
                

                function downloadPDF() {
                    // Crie um objeto jsPDF
                    const doc = new jsPDF('l', 'pt', 'a4');

                    // Carregar a imagem usando um objeto Image
                    var img = new Image();
                    img.src = 'logo.png';

                    // Quando a imagem terminar de carregar, adicionar ao PDF
                    img.onload = function () {
                        // Adicionar a imagem ao documento
                        doc.addImage(img, 'PNG', 10, 30, 100, 19);
                        // Defina a fonte para 18px
                        doc.setFontSize(18);
                        const title = document.getElementById("titleReport");
                        // Adicione o texto da tabela
                        doc.text(title.innerHTML, 300, 50);

                        // Defina a fonte para 10px
                        doc.setFontSize(10);

                        // Obtenha a tabela da listview
                        const table = document.getElementById("listReport");

                        // Obtenha as linhas da tabela
                        const rows = table.querySelectorAll("tr");


                        // Obter todas as colunas da primeira linha
                        var colunas = rows[0].getElementsByTagName('td');
                        // Definir a largura da página
                        var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
                        // Definir a largura de cada coluna
                        //var colWidth = pageWidth / colunas.length;
                        var cellWidth = (pageWidth - (colunas.length * 2)) / colunas.length;


                        // Defina o posicionamento inicial para o topo da primeira página
                        let y = 100;

                        // Itere sobre as linhas e colunas da tabela e adicione os dados ao PDF
                        for (let i = 0; i < rows.length; i++) {
                            const cells = rows[i].querySelectorAll("td");
                            let x = 10;

                            // Verificar se a próxima linha ultrapassa a altura da página
                            if (y + 20 > doc.internal.pageSize.height) {
                                doc.addPage();
                                y = 100;
                            }

                            for (let j = 0; j < cells.length; j++) {
                                //var cellWidth = cells[j].offsetWidth * 0.264583;

                                // Adicione bordas à célula
                                //doc.rect(x, y, cells[j].clientWidth, cells[j].clientHeight);
                                doc.rect(x, y, cellWidth, cells[j].clientHeight);

                                // Adicione o texto da célula
                                doc.text(cells[j].textContent, x + 2, y + 10);

                                // Atualize a posição X para a próxima célula
                                //x += cells[j].clientWidth;
                                x += cellWidth;
                            }

                            // Atualize a posição Y para a próxima linha
                            y += cells[0].clientHeight;
                        }

                        // Baixar o arquivo PDF
                        doc.output();
                        saveAs(doc.output('blob'), 'Report.pdf');
                    };

                }


                t.clear();
                //Botões Tabela
                t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:5%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnPdf").addEvent("click", function () {
                    downloadPDF();
                });
                t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:5%; font-size:12px; text-align:center;", null, "button-inn-del")).addTranslation(texts, "btnReturn").addEvent("click", function () {
                    filterReports(src, colDireita)
                });
                //Título Tabela
                t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:30%; top:10%; font-size:17px; text-align:center; font-weight: bold", texts.text(src)).setAttribute("id", "titleReport"));
                t.add(list);

                resolve('Report added successfully.');
            } catch (error) {
                reject('Error adding report: ' + error.message);
            }

        });
    }
}

Wecom.novaalertAdmin.prototype = innovaphone.ui1.nodePrototype;
