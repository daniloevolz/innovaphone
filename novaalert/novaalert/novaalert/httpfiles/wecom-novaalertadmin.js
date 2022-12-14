
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />
/// <reference path="../../web1/ui1.popup/innovaphone.ui1.popup.js" />
/// <reference path="../../web1/ui1.listview/innovaphone.ui1.listview.js" />


var Wecom = Wecom || {};
Wecom.novaalertAdmin = Wecom.novaalertAdmin || function (start, args) {
    this.createNode("body");
    var that = this;

    var iptUrl = "";
    var list_buttons = [];
    var list_actions = [];
    var list_users = [];
    var colorSchemes = {
        dark: {
            "--bg": "#191919",
            "--button": "#303030",
            "--text-standard": "#f2f5f6",
            "--div-DelBtn" : "#f2f5f6",
        },
        light: {
            "--bg": "white",
            "--button": "#e0e0e0",
            "--text-standard": "#4a4a49",
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

    

    function app_connected(domain, user, dn, appdomain) {
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
            makeDivAdmin();
            //iptUrlNovaAlert.setValue(iptUrl);
        }
        if (obj.api == "admin" && obj.mt == "MessageError") {
            console.log(obj.result);
            makePopup("ERRO", "Erro: " + obj.result);
        }
        if (obj.api == "admin" && obj.mt == "TableUsersResult") {
            console.log(obj.result);
            list_users = JSON.parse(obj.result);
        }
        if (obj.api == "admin" && obj.mt == "SelectMessageSuccess") {
            console.log(obj.result);
            list_buttons = JSON.parse(obj.result);
            makeTableButtons();
        }
        if (obj.api == "admin" && obj.mt == "SelectActionMessageSuccess") {
            console.log(obj.result);
            list_actions = JSON.parse(obj.result);
            makeTableActions();
        }
        if (obj.api == "admin" && obj.mt == "InsertMessageSuccess") {
            app.send({ api: "admin", mt: "SelectMessage" });
            makeDivAdmin();
            makeTableActions();
            makePopup("Aten????o", "Bot??o criado com sucesso!");
        }
        if (obj.api == "admin" && obj.mt == "InsertActionMessageSuccess") {
            app.send({ api: "admin", mt: "SelectActionMessage" });
            makeDivAdmin();
            makeTableButtons();
            makePopup("Aten????o", "A????o criada com sucesso!");
        }
        if (obj.api == "admin" && obj.mt == "DeleteMessageSuccess") {
            app.send({ api: "admin", mt: "SelectMessage" });
            makeDivAdmin();
            makeTableActions();
            makePopup("Aten????o", "Bot??o exclu??do com sucesso!");
        }
        if (obj.api == "admin" && obj.mt == "DeleteActionMessageSuccess") {
            app.send({ api: "admin", mt: "SelectActionMessage" });
            makeDivAdmin();
            makeTableButtons();
            makePopup("Aten????o", "A????o exclu??da com sucesso!");
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

    function makeDivAddButton() {
        that.clear();
        //T??tulo
        that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("labelTituloAdd")));
        //Tipo
        that.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:10%; font-size:15px; text-align:right", texts.text("labelType")));
        var iptType = that.add(new innovaphone.ui1.Node("select", "position:absolute; left:16%; width:30%; top:10%; font-size:12px; text-align:center", null, null));
        iptType.setAttribute("id", "selectType");
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "alarm", null));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "number", null));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "video", null));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "page", null));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "queue", null));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "combo", null));

        //Usu??rio
        that.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:15%; font-size:15px; text-align:right", texts.text("labelUser")));
        var iptUser = that.add(new innovaphone.ui1.Node("select", "position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", null, null));
        iptUser.setAttribute("id", "selectUser");
        list_users.forEach(function (user) {
            iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.sip, null));
        })
        //var iptUser = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
        //Nome Bot??o
        that.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:20%; font-size:15px; text-align:right", texts.text("labelButtonName")));
        var iptName = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:20%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
        //Nome Usu??rio
        var labelUserName = that.add(new innovaphone.ui1.Div("position:absolute; display:none; left:0%; width:15%; top:25%; font-size:15px; text-align:right", texts.text("labelUserName")));
        var iptUserName = that.add(new innovaphone.ui1.Input("position:absolute; display:none; left:16%; width:30%; top:25%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));

        //Valor
        that.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:30%; font-size:15px; text-align:right", texts.text("labelValue")));
        var iptValue = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:30%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));

        document.getElementById("selectType").addEventListener("change", function (e) {
            console.log(e.target.value);
            if (e.target.value == "number" || e.target.value == "queue") {
                labelUserName.setAttribute("style", "position:absolute; display:block; left:0%; width:15%; top:25%; font-size:15px; text-align:right");
                iptUserName.setAttribute("style", "position:absolute; display:block; left:16%; width:30%; top:25%; font-size:12px; text-align:center");
            } else {
                labelUserName.setAttribute("style", "position:absolute; display:none; left:0%; width:15%; top:25%; font-size:15px; text-align:right");
                iptUserName.setAttribute("style", "position:absolute; display:none; left:16%; width:30%; top:25%; font-size:12px; text-align:center");
            }
            if (e.target.value == "combo") {

            }
        });

        //Bot??o Salvar
        that.add(new innovaphone.ui1.Div("position:absolute; left:30%; width:15%; top:35%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
            var type = document.getElementById("selectType").value;
            var user = document.getElementById("selectUser").value;
            if (String(iptName.getValue()) == "" || String(iptValue.getValue()) == "" || String(type) == "") {
                makePopup("Aten????o", "Complete todos os campos para que o bot??o possa ser criado.");
            }
            else {
                app.send({ api: "admin", mt: "InsertMessage", name: String(iptName.getValue()), user: String(iptUserName.getValue()), value: String(iptValue.getValue()), sip: String(user), type: String(type) });
                //makeDivAdmin();
            }
             });
        //Bot??o Cancelar   
        that.add(new innovaphone.ui1.Div("position:absolute; left:55%; width:15%; top:35%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnCancel").addEvent("click", function () {
            makeDivAdmin();
            makeTableButtons();
            makeTableActions();
        });
    }

    function makeDivAddAction() {
        that.clear();
        //T??tulo
        that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("btnAddAction")));

        //Usu??rio
        that.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:10%; font-size:15px; text-align:right", texts.text("labelUser")));
        var iptUser = that.add(new innovaphone.ui1.Node("select", "position:absolute; left:16%; width:30%; top:10%; font-size:12px; text-align:center", null, null));
        iptUser.setAttribute("id", "selectUser");
        list_users.forEach(function (user) {
            iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.sip, null));
        })
        //var iptUser = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:10%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
        //Nome
        that.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:15%; font-size:15px; text-align:right", texts.text("labelName")));
        var iptName = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
        //C??digo Alarme
        that.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:20%; font-size:15px; text-align:right", texts.text("labelAlarmCode")));
        var iptAlarmCode = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:20%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));

        //Valor
        that.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:25%; font-size:15px; text-align:right", texts.text("labelValue")));
        var iptValue = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:25%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
        //Tipo
        that.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:30%; font-size:15px; text-align:right", texts.text("labelType")));
        var iptType = that.add(new innovaphone.ui1.Node("select", "position:absolute; left:16%; width:30%; top:30%; font-size:12px; text-align:center", null, null));
        iptType.setAttribute("id", "selectType");
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "alarm", null));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "number", null));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "video", null));
        var opt = iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "page", null));
        //Bot??o Salvar
        that.add(new innovaphone.ui1.Div("position:absolute; left:30%; width:15%; top:35%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
            var type = document.getElementById("selectType").value;
            var user = document.getElementById("selectUser").value;
            if (String(iptName.getValue()) == "" || String(iptValue.getValue()) == "" || String(type) == "") {
                makePopup("Aten????o", "Complete todos os campos para que o bot??o possa ser criado.");
            }
            else {
                app.send({ api: "admin", mt: "InsertActionMessage", name: String(iptName.getValue()), alarm: String(iptAlarmCode.getValue()), value: String(iptValue.getValue()), sip: String(user), type: String(type) });
                //makeDivAdmin();
            }
        });
        //Bot??o Cancelar   
        that.add(new innovaphone.ui1.Div("position:absolute; left:55%; width:15%; top:35%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnCancel").addEvent("click", function () {
            makeDivAdmin();
            makeTableButtons();
            makeTableActions();
        });

    }

    function makeDivAdmin() {

        that.clear();
        //T??tulo
        var labelTitulo = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("labelTituloAdmin")));

        //B3
        var labelNovaAlert = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:10%; font-size:17px; text-align:center; font-weight: bold", texts.text("labelNovaAlert")))
        var labelAdd = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:50%; top:15%; font-size:15px; text-align:right", texts.text("labelCheck")));

        var labelURLNovaAlert = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:50%; top:20%; font-size:15px; text-align:right", texts.text("labelURLNovaAlert")));
        var iptUrlNovaAlert = that.add(new innovaphone.ui1.Input("position:absolute; left:50%; width:30%; top:20%; font-size:12px; text-align:center", null, texts.text("urlText"), 255, "url", null));
        iptUrlNovaAlert.setAttribute("id", "inputNovaAlert")
        iptUrlNovaAlert.setValue(iptUrl);
        that.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:30%; top:25%; font-size:12px; text-align:center", null, "button-inn")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
            app.send({ api: "admin", mt: "UpdateConfig", prt: "urlalert", vl: String(iptUrlNovaAlert.getValue()) });
        });
        
    }
    function makeTableButtons() {
        //Bot??es Tabela de Bot??es
        that.add(new innovaphone.ui1.Div("position:absolute; left:5%; width:15%; top:35%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnAddButton").addEvent("click", function () {
            makeDivAddButton();
        });
        that.add(new innovaphone.ui1.Div("position:absolute; left:25%; width:15%; top:35%; font-size:12px; text-align:center; color:var(--div-DelBtn); background-color: #B0132B", null, "button-inn")).addTranslation(texts, "btnDelButton").addEvent("click", function () {
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
        //T??tulo Tabela Bot??es
        var labelTituloTabeaBotoes = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:50%; top:45%; font-size:17px; text-align:center; font-weight: bold", texts.text("labelTituloBotoes")));
        var list = new innovaphone.ui1.Div("position: absolute; left:20px; top:50%; right:50%; height:300px", null, "");
        var columns = 6;
        var rows = list_buttons.length;
        var listView = new innovaphone.ui1.ListView(list, 30, "headercl", "arrow", false);
        //Cabe??alho
        for (i = 0; i < columns; i++) {
            listView.addColumn(null, "text", texts.text("cabecalho" + i), i, 40, false);
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
            listView.addRow(i, row, "rowcl", "#A0A0A0", "#82CAE2");
            that.add(list);
        })
    }

    function makeTableActions() {
        //Bot??es Tabela de A????es
        that.add(new innovaphone.ui1.Div("position:absolute; left:55%; width:15%; top:35%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnAddAction").addEvent("click", function () {
            makeDivAddAction();
        });
        that.add(new innovaphone.ui1.Div("position:absolute; left:75%; width:15%; top:35%; font-size:12px; text-align:center; background-color: #B0132B; color:var(--div-DelBtn); ", null, "button-inn")).addTranslation(texts, "btnDelAction").addEvent("click", function () {
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



        //T??tulo Tabela A????es
        var labelTituloTabeaAcoes = that.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:50%; top:45%; font-size:17px; text-align:center; font-weight: bold", texts.text("labelTituloAcoes")));
        var list = new innovaphone.ui1.Div("position: absolute; left:50%; top:50%; right:0%; height:300px", null, "");
        var columns = 6;
        var rows = list_actions.length;
        var actionsListView = new innovaphone.ui1.ListView(list, 30, "headercl", "arrow", false);
        //Cabe??alho
        for (i = 0; i < columns; i++) {
            actionsListView.addColumn(null, "text", texts.text("cabecalhoAction" + i), i, 40, false);
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
            that.add(list);
        })
    }
    
    function delButton(selected) {
        console.log(selected);
        selected.forEach(function (s) {
            app.send({ api: "admin", mt: "DeleteMessage", id: s.id });
        })
    }
}

Wecom.novaalertAdmin.prototype = innovaphone.ui1.nodePrototype;
