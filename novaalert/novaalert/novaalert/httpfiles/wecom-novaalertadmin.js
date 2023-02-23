
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
    var list_buttons = [];
    var list_actions = [];
    var list_users = [];
    var colDireita;
    var colorSchemes = {
        dark: {
            "--bg": "url('bg.png')",
            "--button": "#c6c6c6",
            "--text-standard": "#004c84",
            "--div-DelBtn" : "#f2f5f6",
        },
        light: {
            "--bg": "url('bg.png')",
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

    function app_connected(domain, user, dn, appdomain) {
        UIuser = dn;
        //avatar
        avatar = new innovaphone.Avatar(start, user, domain);
        UIuserPicture = avatar.url(user, 100, dn);
        constructor();
        app.send({ api: "admin", mt: "AdminMessage" });
        app.send({ api: "admin", mt: "SelectMessage" });
        app.send({ api: "admin", mt: "SelectActionMessage" });
        //window.setInterval(function () {
        //    app.send({ api: "admin", mt: "SelectMessage" });
        //}, 30000);
    }

    function app_message(obj) {
        if (obj.api == "admin" && obj.mt == "AdminMessageResult") {
            iptUrl = obj.urlalert;
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
        }
        if (obj.api == "admin" && obj.mt == "SelectActionMessageSuccess") {
            console.log(obj.result);
            list_actions = JSON.parse(obj.result);
        }
        if (obj.api == "admin" && obj.mt == "InsertMessageSuccess") {
            app.send({ api: "admin", mt: "SelectMessage" });
            makePopup("Sucesso", "Botão criado com sucesso!");
        }
        if (obj.api == "admin" && obj.mt == "InsertActionMessageSuccess") {
            app.send({ api: "admin", mt: "SelectActionMessage" });
            makePopup("Sucesso", "Ação criada com sucesso!");
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
            reportView(colDireita, obj.result, obj.src);
        }
        if (obj.api == "admin" && obj.mt == "DeleteFromReportsSuccess") {
            constructor();
            makePopup("Atenção!", texts.text(labelDeleteSuccess));
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

    function makeDivAddButton(t) {
        t.clear();
        //Título
        t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("labelTituloAdd")));
        //Tipo
        t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:10%; font-size:15px; text-align:right", texts.text("labelType")));
        var iptType = t.add(new innovaphone.ui1.Node("select", "position:absolute; left:16%; width:30%; top:10%; font-size:12px; text-align:center", null, null));
        iptType.setAttribute("id", "selectType");
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "alarm", null));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "user", null));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "externalnumber", null));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "video", null));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "page", null));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "queue", null));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "combo", null));

        //Usuário
        t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:15%; font-size:15px; text-align:right", texts.text("labelUser")));
        var iptUser = t.add(new innovaphone.ui1.Node("select", "position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", null, null));
        iptUser.setAttribute("id", "selectUser");
        list_users.forEach(function (user) {
            iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.sip, null));
        })
        //var iptUser = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
        //Nome Botão
        t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:20%; font-size:15px; text-align:right", texts.text("labelButtonName")));
        var iptName = t.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:20%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
        //Nome Usuário
        var labelUserName = t.add(new innovaphone.ui1.Div("position:absolute; display:none; left:0%; width:15%; top:30%; font-size:15px; text-align:right", texts.text("labelUserName")));
        var iptUserName = t.add(new innovaphone.ui1.Input("position:absolute; display:none; left:16%; width:30%; top:30%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));

        //Parâmetro
        t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:25%; font-size:15px; text-align:right", texts.text("labelValue")));
        var iptValue = t.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:25%; font-size:12px; text-align:center", null, texts.text("iptText"), 500, "url", null));

        var iptType1 = null;
        var iptType2 = null;
        var iptType3 = null;
        var iptType4 = null;


        document.getElementById("selectType").addEventListener("change", function (e) {
            console.log(e.target.value);
            if (e.target.value == "user") {
                var iptValue = t.add(new innovaphone.ui1.Node("select", "position:absolute; left:16%; width:30%; top:25%; font-size:12px; text-align:center", null, null));
                iptValue.setAttribute("id", "selectValue");
                list_users.forEach(function (user) {
                    iptValue.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.sip, null));
                })
                labelUserName.setAttribute("style", "position:absolute; display:block; left:0%; width:15%; top:30%; font-size:15px; text-align:right");
                iptUserName.setAttribute("style", "position:absolute; display:block; left:16%; width:30%; top:30%; font-size:12px; text-align:center");
            }
            if (e.target.value == "number" || e.target.value == "queue") {
                labelUserName.setAttribute("style", "position:absolute; display:block; left:0%; width:15%; top:30%; font-size:15px; text-align:right");
                iptUserName.setAttribute("style", "position:absolute; display:block; left:16%; width:30%; top:30%; font-size:12px; text-align:center");
            } else {
                labelUserName.setAttribute("style", "position:absolute; display:none; left:0%; width:15%; top:30%; font-size:15px; text-align:right");
                iptUserName.setAttribute("style", "position:absolute; display:none; left:16%; width:30%; top:30%; font-size:12px; text-align:center");
            }
            if (e.target.value == "combo") {

                //Tipo
                t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:35%; font-size:15px; text-align:right", texts.text("cabecalho6")));
                iptType1 = t.add(new innovaphone.ui1.Node("select", "position:absolute; left:16%; width:30%; top:35%; font-size:12px; text-align:center", null, null));
                iptType1.setAttribute("id", "selectType1");
                list_buttons.forEach(function (button) {
                    iptType1.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.id, null));
                })
                
                //Tipo
                t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:45%; font-size:15px; text-align:right", texts.text("cabecalho7")));
                iptType2 = t.add(new innovaphone.ui1.Node("select", "position:absolute; left:16%; width:30%; top:45%; font-size:12px; text-align:center", null, null));
                iptType2.setAttribute("id", "selectType2");
                iptType2.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null));
                list_buttons.forEach(function (button) {
                    iptType2.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.id, null));
                })

                //Tipo
                t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:55%; font-size:15px; text-align:right", texts.text("cabecalho8")));
                iptType3 = t.add(new innovaphone.ui1.Node("select", "position:absolute; left:16%; width:30%; top:55%; font-size:12px; text-align:center", null, null));
                iptType3.setAttribute("id", "selectType3");
                iptType3.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null));
                list_buttons.forEach(function (button) {
                    iptType3.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.id, null));
                })

                //Tipo
                t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:65%; font-size:15px; text-align:right", texts.text("cabecalho9")));
                iptType4 = t.add(new innovaphone.ui1.Node("select", "position:absolute; left:16%; width:30%; top:65%; font-size:12px; text-align:center", null, null));
                iptType4.setAttribute("id", "selectType4");
                iptType4.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null));
                list_buttons.forEach(function (button) {
                    iptType4.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.id, null));
                })
            }
        });

        //Botão Salvar
        t.add(new innovaphone.ui1.Div("position:absolute; left:55%; width:15%; top:10%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
            var type = document.getElementById("selectType").value;
            var user = document.getElementById("selectUser").value;
            if (String(iptName.getValue()) == "" || String(type) == "") {
                makePopup("Atenção", "Complete todos os campos para que o botão possa ser criado.");
            }
            else if (type == "combo") {
                var type1 = document.getElementById("selectType1").value;
                var type2 = document.getElementById("selectType2").value;
                var type3 = document.getElementById("selectType3").value;
                var type4 = document.getElementById("selectType4").value;
                app.send({ api: "admin", mt: "InsertComboMessage", name: String(iptName.getValue()), user: String(iptUserName.getValue()), value: String(iptValue.getValue()), sip: String(user), type: String(type), type1: String(type1), type2: String(type2), type3: String(type3), type4: String(type4)});
            } else if (type == "user") {
                var value = document.getElementById("selectValue").value;
                app.send({ api: "admin", mt: "InsertMessage", name: String(iptName.getValue()), user: String(iptUserName.getValue()), value: String(value), sip: String(user), type: String(type) });

            }
            else {
                app.send({ api: "admin", mt: "InsertMessage", name: String(iptName.getValue()), user: String(iptUserName.getValue()), value: String(iptValue.getValue()), sip: String(user), type: String(type) });
            }
             });
        //Botão Cancelar   
        t.add(new innovaphone.ui1.Div("position:absolute; left:55%; width:15%; top:20%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnCancel").addEvent("click", function () {
            makeTableButtons(t);
        });
    }

    function makeDivAddAction(t) {
        t.clear();
        //Título
        t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("btnAddAction")));

        //Usuário
        t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:10%; font-size:15px; text-align:right", texts.text("labelUser")));
        var iptUser = t.add(new innovaphone.ui1.Node("select", "position:absolute; left:16%; width:30%; top:10%; font-size:12px; text-align:center", null, null));
        iptUser.setAttribute("id", "selectUser");
        list_users.forEach(function (user) {
            iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.sip, null));
        })
        //var iptUser = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:10%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
        //Nome
        t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:15%; font-size:15px; text-align:right", texts.text("labelName")));
        var iptName = t.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
        //Código Alarme
        t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:20%; font-size:15px; text-align:right", texts.text("labelAlarmCode")));
        var iptAlarmCode = t.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:20%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));

        //Valor
        t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:25%; font-size:15px; text-align:right", texts.text("labelValue")));
        var iptValue = t.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:25%; font-size:12px; text-align:center", null, texts.text("iptText"), 500, "url", null));
        //Tipo
        t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:30%; font-size:15px; text-align:right", texts.text("labelType")));
        var iptType = t.add(new innovaphone.ui1.Node("select", "position:absolute; left:16%; width:30%; top:30%; font-size:12px; text-align:center", null, null));
        iptType.setAttribute("id", "selectType");
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "alarm", null));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "number", null));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "video", null));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "page", null));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "popup", null));
        //Botão Salvar
        t.add(new innovaphone.ui1.Div("position:absolute; left:30%; width:15%; top:35%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
            var type = document.getElementById("selectType").value;
            var user = document.getElementById("selectUser").value;
            if (String(iptName.getValue()) == "" || String(iptValue.getValue()) == "" || String(type) == "") {
                makePopup("Atenção", "Complete todos os campos para que o botão possa ser criado.");
            }
            else {
                app.send({ api: "admin", mt: "InsertActionMessage", name: String(iptName.getValue()), alarm: String(iptAlarmCode.getValue()), value: String(iptValue.getValue()), sip: String(user), type: String(type) });
            }
        });
        //Botão Cancelar   
        t.add(new innovaphone.ui1.Div("position:absolute; left:55%; width:15%; top:35%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnCancel").addEvent("click", function () {
            makeTableActions(t);
        });

    }

    function makeDivAdmin(t) {
        t.clear();
        //Título
        var labelTitulo = t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:10%; font-size:25px; text-align:center", texts.text("labelTituloAdmin")));

        //B3
        var labelNovaAlert = t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:15%; font-size:17px; text-align:center; font-weight: bold", texts.text("labelNovaAlert")))
        var labelAdd = t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:50%; top:20%; font-size:15px; text-align:right", texts.text("labelCheck")));

        var labelURLNovaAlert = t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:50%; top:25%; font-size:15px; text-align:right", texts.text("labelURLNovaAlert")));
        var iptUrlNovaAlert = t.add(new innovaphone.ui1.Input("position:absolute; left:50%; width:30%; top:25%; font-size:12px; text-align:center", null, texts.text("urlText"), 255, "url", null));
        iptUrlNovaAlert.setAttribute("id", "inputNovaAlert")
        iptUrlNovaAlert.setValue(iptUrl);
        t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:30%; top:30%; font-size:12px; text-align:center", null, "button-inn")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
            app.send({ api: "admin", mt: "UpdateConfig", prt: "urlalert", vl: String(iptUrlNovaAlert.getValue()) });
            iptUrl = String(iptUrlNovaAlert.getValue());
        });
        
    }
    function makeDivClearDB(t) {
        t.clear();
        //Título
        t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:10%; font-size:25px; text-align:center", texts.text("labelTituloClearDB")));

        var divTo = t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 35%; left: 6%; font-weight: bold;", texts.text("labelTo"), null));
        var InputTo = t.add(new innovaphone.ui1.Input("position: absolute; top: 35%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "date", null).setAttribute("id", "dateTo"));
        var divReport = t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 55.6%; left: 6%; font-weight: bold;", texts.text("labelReports"), null));
        var SelectReport = new innovaphone.ui1.Node("select", "position: absolute; top: 55.0%; left: 20%; height: 25px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F; font-size: 13px; font-weight: bold ", null, null).setAttribute("id", "selectReport");
        t.add(SelectReport);
        SelectReport.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", "RptCalls", null)).setAttribute("id", "RptCalls");
        SelectReport.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", "RptAvailability", null)).setAttribute("id", "RptAvailability");
        SelectReport.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", "RptActivities", null)).setAttribute("id", "RptActivities");
        // buttons
        t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnOk").addEvent("click", function () {
            var to = document.getElementById("dateTo").value;
            var report = document.getElementById("selectReport").value;
            app.send({ api: "admin", mt: "DeleteFromReports", src:report,  to: to });
            waitConnection(t);
        });
        t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:90%; font-size:12px; text-align:center; color:var(--div-DelBtn); background-color: #B0132B", null, "button-inn")).addTranslation(texts, "btnCancel").addEvent("click", function () {
            constructor();
        });
    }

    function makeTableButtons(t) {
        t.clear();
        //Botões Tabela de Botões
        t.add(new innovaphone.ui1.Div("position:absolute; left:55%; width:15%; top:10%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnAddButton").addEvent("click", function () {
            makeDivAddButton(t);
        });
        t.add(new innovaphone.ui1.Div("position:absolute; left:30%; width:15%; top:10%; font-size:12px; text-align:center; color:var(--div-DelBtn); background-color: #B0132B", null, "button-inn")).addTranslation(texts, "btnDelButton").addEvent("click", function () {
            var selected = listView.getSelectedRows();
            console.log(selected);
            var selectedrows = [];

            selected.forEach(function (s) {
                console.log(s);
                selectedrows.push(listView.getRowData(s))
                console.log(selectedrows[0]);
                app.send({ api: "admin", mt: "DeleteMessage", id: parseInt(selectedrows[0]) });
            })
        });
        //Título Tabela Botôes
        var labelTituloTabeaBotoes = t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:30%; top:20%; font-size:17px; text-align:center; font-weight: bold", texts.text("labelTituloBotoes")));

        var scroll_container = new innovaphone.ui1.Node("scroll-container", "background-color: rgba(128, 130, 131, 0.48); position: absolute; left:1%; top:25%; right:1%; width: 98%; height:-webkit-fill-available;", null, "scroll-container-table");

        var list = new innovaphone.ui1.Div("position: absolute; left:2px; right:2px; height:fit-content", null, "");
        var columns = 10;
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
            row.push(b.button_prt);
            row.push(b.button_prt_user);
            row.push(b.button_type);
            row.push(b.button_user);
            row.push(b.button_type_1);
            row.push(b.button_type_2);
            row.push(b.button_type_3);
            row.push(b.button_type_4);
            listView.addRow(i, row, "rowcl", "#A0A0A0", "#82CAE2");
            scroll_container.add(list);
        })
        t.add(scroll_container);
    }

    function makeTableActions(t) {
        t.clear();
        
        //Botões Tabela de Ações
        t.add(new innovaphone.ui1.Div("position:absolute; left:55%; width:15%; top:10%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnAddAction").addEvent("click", function () {
            makeDivAddAction(t);
        });
        t.add(new innovaphone.ui1.Div("position:absolute; left:30%; width:15%; top:10%; font-size:12px; text-align:center; background-color: #B0132B; color:var(--div-DelBtn); ", null, "button-inn")).addTranslation(texts, "btnDelAction").addEvent("click", function () {
            var selected = actionsListView.getSelectedRows();
            console.log(selected);
            var selectedrows = [];

            selected.forEach(function (s) {
                console.log(s);
                selectedrows.push(actionsListView.getRowData(s))
                console.log(selectedrows[0]);
                app.send({ api: "admin", mt: "DeleteActionMessage", id: parseInt(selectedrows[0]) });
            })
        });



        //Título Tabela Ações
        var labelTituloTabeaAcoes = t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:30%; top:20%; font-size:17px; text-align:center; font-weight: bold", texts.text("labelTituloAcoes")));

        var scroll_container = new innovaphone.ui1.Node("scroll-container", "position: absolute; left:1%; top:25%; right:1%; width:98%; height:-webkit-fill-available;", null, "scroll-container-table");

        var list = new innovaphone.ui1.Div(null, null, "");
        var columns = 6;
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
            row.push(b.action_alarm_code);
            row.push(b.action_prt);
            row.push(b.action_type);
            row.push(b.action_user);
            actionsListView.addRow(i, row, "rowcl", "#A0A0A0", "#82CAE2");
            scroll_container.add(list);
        })
        t.add(scroll_container);
    }

    function constructor() {
        that.clear();
        // col direita
        var _colDireita = that.add(new innovaphone.ui1.Div(null, null, "colunadireitaadmin"));
        // col Esquerda
        var colEsquerda = that.add(new innovaphone.ui1.Div(null, null, "colunaesquerda"));
        var divreport = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; border-bottom: 1px solid #4b545c; border-width: 100%; height: 10%; width: 100%; background-color: #02163F;  display: flex; align-items: center;", null, null));
        var imglogo = divreport.add(new innovaphone.ui1.Node("img", "max-height: 33px; opacity: 0.8;", null, null));
        imglogo.setAttribute("src", "logo-wecom.png");
        var spanreport = divreport.add(new innovaphone.ui1.Div("font-size: 1.00rem; color:white; margin : 5px;", appdn, null));
        var user = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; height: 10%; top: 10%; width: 100%; align-items: center; display: flex; border-bottom: 1px solid #4b545c"));
        var imguser = user.add(new innovaphone.ui1.Node("img", "max-height: 33px; border-radius: 50%;", null, null));
        imguser.setAttribute("src", UIuserPicture);
        var username = user.add(new innovaphone.ui1.Node("span", "font-size: 0.75rem; color:white; margin: 5px;", UIuser, null));
        username.setAttribute("id", "user")

        var configs = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 24%; height: 40%;"));
        configs.add(new innovaphone.ui1.Node("p", "text-align: left; font-size: 20px;", texts.text("labelAdmin"), null));
        configs.add(new innovaphone.ui1.Node("br", null, null, null));

        var lirelatorios1 = configs.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        var lirelatorios2 = configs.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        var lirelatorios3 = configs.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        var lirelatorios4 = configs.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        lirelatorios1.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgButtons"), null).setAttribute("id", "CfgButtons"));
        lirelatorios2.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgAcctions"), null).setAttribute("id", "CfgAcctions"));
        lirelatorios3.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgNovaalert"), null).setAttribute("id", "CfgNovaalert"));
        lirelatorios4.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgDefaults"), null).setAttribute("id", "CfgDefaults"));

        var relatorios = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 60%; height: 40%;"));
        relatorios.add(new innovaphone.ui1.Node("p", "text-align: left; font-size: 20px;", texts.text("labelReports"), null));
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
        var liconfig = config.add(new innovaphone.ui1.Node("li", "display:flex; aligns-items: center", null, "config"));

        var imgconfig = liconfig.add(new innovaphone.ui1.Node("img", "width: 100%; opacity: 0.9; margin: 2px; ", null, null));
        imgconfig.setAttribute("src", "logo.png");
        //var Aconfig = liconfig.add(new innovaphone.ui1.Node("a", "display: flex; align-items: center; justify-content: center;", texts.text("labelConfig"), null));
        //Aconfig.setAttribute("href", "#");

        var a = document.getElementById("CfgButtons");
        a.addEventListener("click", function () { makeTableButtons(_colDireita) })

        var a = document.getElementById("CfgAcctions");
        a.addEventListener("click", function () { makeTableActions(_colDireita) })

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
        var divFiltros = colDireita.add(new innovaphone.ui1.Div("position:absolute; font-weight:bolder; width: 90%; top: 5%; left: 5%; font-size: 25px;", texts.text("labelFiltros"), null));
        var divFiltrosDetails = colDireita.add(new innovaphone.ui1.Div("position:absolute; font-weight:bolder; width: 50%; top: 8.5%; left: 18%; font-size: 15px;", texts.text(rpt), null));
        var divFrom = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 25.5%; left: 6%; font-weight: bold;", texts.text("labelFrom"), null));
        var InputFrom = colDireita.add(new innovaphone.ui1.Input("position: absolute;  top: 25%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "date", null).setAttribute("id","dateFrom"));
        var divTo = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 35.5%; left: 6%; font-weight: bold;", texts.text("labelTo"), null));
        var InputTo = colDireita.add(new innovaphone.ui1.Input("position: absolute; top: 35%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "date", null).setAttribute("id", "dateTo"));
        var divNumber = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 45.6%; left: 6%; font-weight: bold;", texts.text("labelPhone"), null));
        var InputNumber = colDireita.add(new innovaphone.ui1.Input("position: absolute; top: 45%; left: 20%; height: 25px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F; ", null, null, null, "number", null).setAttribute("id", "number"));
        var divRamal = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 55.6%; left: 6%; font-weight: bold;", texts.text("labelAgent"), null));
        var SelectRamal = new innovaphone.ui1.Node("select", "position: absolute; top: 55.0%; left: 20%; height: 25px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F; font-size: 13px; font-weight: bold ", null, null).setAttribute("id","selectUser");
        colDireita.add(SelectRamal);
        SelectRamal.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", null, null)).setAttribute("id", "sips");
        list_users.forEach(function (user) {
            SelectRamal.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", user.sip, null)).setAttribute("id", "sips");
        })
        // buttons
        colDireita.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnOk").addEvent("click", function () {
            var sip = document.getElementById("selectUser").value;
            var from = document.getElementById("dateFrom").value;
            var to = document.getElementById("dateTo").value;
            var number = document.getElementById("number").value;

            app.send({ api: "admin", mt: "SelectFromReports", sip: sip, from: from, to: to, number: number, src: rpt });
            waitConnection(colDireita);
        });
        colDireita.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:90%; font-size:12px; text-align:center; color:var(--div-DelBtn); background-color: #B0132B", null, "button-inn")).addTranslation(texts, "btnCancel").addEvent("click", function () {
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
    function reportView(t, result, src) {
        t.clear();
        var result = JSON.parse(result);
        //Botões Tabela
        t.add(new innovaphone.ui1.Div("position:absolute; left:15%; width:15%; top:0%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnPdf").addEvent("click", function () {
            downloadPDF();
        });
        t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:0%; font-size:12px; text-align:center; color:var(--div-DelBtn); background-color: #B0132B", null, "button-inn")).addTranslation(texts, "btnReturn").addEvent("click", function () {
            filterReports(src, colDireita)
        });
        //Título Tabela
        t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:30%; top:10%; font-size:17px; text-align:center; font-weight: bold", texts.text(src)).setAttribute("id","titleReport"));
        var list = new innovaphone.ui1.Div("background-color: rgba(128, 130, 131, 0.48); position: absolute; left:2px; top:15%; right:2px; height:fit-content", null, "").setAttribute("id","listReport");
        var columns = Object.keys(result[0]).length;
        var listView = new innovaphone.ui1.ListView(list, 50, "headercl", "arrow", false);
        //Cabeçalho
        for (i = 0; i < columns; i++) {
            listView.addColumn(null, "text", texts.text("cabecalho"+src+ + i), i, 10, false);
        }
        //Tabela 
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
                    row.push(b.status);
                    row.push(b.direction);
                    listView.addRow(i, row, "rowcl", "#A0A0A0", "#82CAE2");
                    t.add(list);
                })
                break;
            case "RptActivities":
                result.forEach(function (b) {
                    var row = [];
                    row.push(b.sip);
                    row.push(b.name);
                    row.push(b.date);
                    row.push(b.status);
                    row.push(b.details);
                    listView.addRow(i, row, "rowcl", "#A0A0A0", "#82CAE2");
                    t.add(list);
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
                    t.add(list);
                })
                break;
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
    }
    function downloadPDF2() {
        var maxPageHeight = 500;
        // criar um novo documento PDF
        var doc = new jsPDF();
        // obter a ListView
        var listView = document.getElementById('listReport');
        //// obter todas as linhas da ListView
        var linhas = listView.getElementsByTagName('tr');
        //// adicionar as linhas ao documento PDF
        for (var i = 0; i < linhas.length; i++) {
        //    // obter as células da linha
            var celulas = linhas[i].getElementsByTagName('td');
            // adicionar as células ao documento PDF
            for (var j = 0; j < celulas.length; j++) {
                doc.text(celulas[j].innerText, j * 60, (i + 2) * 10);
                //doc.cell(10, 10, celulas[j].innerText, j, i);
            }
        }
        //// baixar o arquivo PDF
        doc.output();
        saveAs(doc.output('blob'), 'Report.pdf');

    }

    function downloadPDF3() {
        // Criar um novo documento PDF
        var doc = new jsPDF('p', 'pt', 'a4');
        // Obter a ListView
        var listView = document.getElementById('listReport');
        // Obter todas as linhas da ListView
        var linhas = listView.getElementsByTagName('tr');
        // Obter todas as colunas da primeira linha
        var colunas = linhas[0].getElementsByTagName('td');
        // Definir a largura da página
        var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        // Definir a largura de cada coluna
        var colWidth = pageWidth / colunas.length;
        // Adicionar as linhas ao documento PDF
        var currentHeight = 100;
        for (var i = 0; i < linhas.length; i++) {
            // Obter as células da linha
            var celulas = linhas[i].getElementsByTagName('td');

            // Verificar se a próxima linha ultrapassa a altura da página
            if (currentHeight + 20 > doc.internal.pageSize.height) {
                doc.addPage();
                currentHeight = 100;
            }


            // Adicionar as células ao documento PDF
            for (var j = 0; j < celulas.length; j++) {
                // Adicionar bordas à célula
                //doc.rect(j * colWidth, currentHeight, j * colWidth, 50);
                // Adicionar o texto à célula
                doc.setFontSize(12);
                doc.text(celulas[j].innerText, j * colWidth, currentHeight, { align: 'center', valign: 'middle' });
            }
            currentHeight += 20;
        }

        // Baixar o arquivo PDF
        doc.output();
        saveAs(doc.output('blob'), 'Report.pdf');
    }

    function downloadPDF1() {
        // Definir a altura máxima de cada página
        var maxPageHeight = 1000;

        // Criar um novo documento PDF
        var doc = new jsPDF();

        // Obter a ListView
        var listView = document.getElementById('listReport');

        // Obter todas as linhas da ListView
        var linhas = listView.getElementsByTagName('tr');

        // Adicionar as linhas ao documento PDF
        var currentHeight = 10;
        for (var i = 0; i < linhas.length; i++) {
            // Obter as células da linha
            var celulas = linhas[i].getElementsByTagName('td');

            // Adicionar as células ao documento PDF
            for (var j = 0; j < celulas.length; j++) {
                // Verificar se a próxima linha ultrapassa a altura da página
                if (currentHeight + 50 > maxPageHeight) {
                    doc.addPage();
                    currentHeight = 10;
                }
                var cellWidth = celulas[j].offsetWidth * 0.264583;
                doc.text(celulas[j].innerText, j * cellWidth, currentHeight + 10);
                currentHeight += 10;
            }
        }

        // Baixar o arquivo PDF
        doc.output();
        saveAs(doc.output('blob'), 'Report.pdf');
    }

    function criaPDF() {
        // criar um novo objeto jsPDF
        var doc = new jsPDF();

        // definir a largura de cada coluna
        var colWidth = [30, 50, 70];

        // definir os dados da tabela
        var rows = [
            [1, "John Doe", "johndoe@example.com"],
            [2, "Jane Doe", "janedoe@example.com"],
            [3, "Bob Smith", "bobsmith@example.com"]
        ];

        // definir o estilo da tabela
        var tableStyle = {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
            fontStyle: "normal",
            fontSize: 12
        };

        // adicionar a imagem no cabeçalho
        var imgURL = "../logo_wecom.png";
        var imgWidth = 50;
        var imgHeight = 50;
        doc.addImage(imgURL, "PNG", 10, 10, imgWidth, imgHeight);

        // desenhar a tabela abaixo da imagem
        doc.autoTable({
            head: [["ID", "Name", "Email"]],
            body: rows,
            theme: "grid",
            startY: 70,
            columnWidth: colWidth,
            styles: tableStyle
        });

        // salvar o arquivo PDF
        doc.save("lista_de_contatos.pdf");
    }
}

Wecom.novaalertAdmin.prototype = innovaphone.ui1.nodePrototype;
