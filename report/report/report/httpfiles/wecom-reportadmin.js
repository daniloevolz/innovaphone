
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.reportAdmin = Wecom.reportAdmin || function (start, args) {
    this.createNode("body");
    var that = this;

    var list_users = [];
    var list_ramais = []

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

    var texts = new innovaphone.lib1.Languages(Wecom.reportTexts, start.lang);

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "admin", mt: "AdminMessage" });
        app.send({ api: "users", mt: "SelectUsers" });

    }

    function app_message(obj) {
        if (obj.api == "admin" && obj.mt == "AdminMessageResult") {
        }
        if (obj.api == "admin" && obj.mt == "TableUsersResult") {
            console.log(obj.result);
            list_users = [];
            list_users = JSON.parse(obj.result);
            MakeAdmin()
        }
        if(obj.api == "users" && obj.mt == "SelectUsersResult"){
            list_ramais = [];
            list_ramais = JSON.parse(obj.result);
            makeTableUsers()
        }          
        if (obj.api == "users" && obj.mt == "InsertUsersSucess") {
            app.send({ api: "users", mt: "SelectUsers" });
            MakeAdmin()
            makePopup("Atenção", "Usuário adicionado com sucesso!");
        }
        if (obj.api == "users" && obj.mt == "DeleteUsersSuccess") {
            that.clear();
            app.send({ api: "channel", mt: "SelectUsers" });
            MakeAdmin();
            makePopup("Atenção", "Usuário excluído com sucesso!");
        }
    }

    function makePopup(header, content) {
        console.log("makePopup");
        var styles = [new innovaphone.ui1.PopupStyles("popup-background", "popup-header", "popup-main", "popup-closer")];
        var h = [20];

        var popup = new innovaphone.ui1.Popup("position:absolute; left:50px; top:50px; width:500px; height:200px; color: black; font-size: 20px; font-weight: bold", styles[0], h[0]);
        popup.header.addText(header);
        popup.content.addText(content);
    }

    function MakeAdmin(){
        that.clear();
        
        var divAdminPainel = that.add(new innovaphone.ui1.Div("width: 100%; text-align:center; top: 5%; position: absolute; font-size: 25px; ",texts.text("labelAdminPanel"),null))

    }
    function DivAddUsers(){
        that.clear();
        var divUser = that.add(new innovaphone.ui1.Div("position:absolute; top:5%; width:100%; text-align:center ; font-size:30px;",texts.text("labelUsers"),null))
        var iptUser = that.add(new innovaphone.ui1.Node("select", "position:absolute; left:35%; width:30%; top:15%; font-size:15px; text-align:center", null, null));
        iptUser.setAttribute("id", "selectUser");
        list_users.forEach(function (user) {
            iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.sip, null));
        })      
       that.add(new innovaphone.ui1.Div("position:absolute; left:30%; width:15%; top:25%; font-size:15px; background-color: #02163F; color:white; text-align:center", null, "button-inn")).addTranslation(texts, "btnAdd").addEvent("click", function () {
        list_users.forEach(function (user)  {
            // app.send({ api: "channel", mt: "AddChannelMessage", name: String(iptName.getValue()), url: String(iptUrl.getValue()), type: String(type), img: String(linkImg) });

        })
            });
        //Botão Cancelar   
        that.add(new innovaphone.ui1.Div("position:absolute; left:52%; width:15%; top:25%; font-size:15px; text-align:center; background-color: #B0132B; color:white ", null, "button-inn")).addTranslation(texts, "btnCancel").addEvent("click", function () {
            MakeAdmin();
            makeTableUsers();
        });
    }
    function makeTableUsers(){
        that.add(new innovaphone.ui1.Div("position:absolute; color:white; top: 15%; width: 15%; left: 32%; text-align:center; background-color: #02163F;",null,"button-inn").addTranslation(texts,"btnAdd")).addEvent("click", function(){
            DivAddUsers()
        })
        that.add(new innovaphone.ui1.Div("position: absolute; color:white; top: 15%; width: 15%; left: 52%; text-align:center; background-color: #B0132B;",null,"button-inn").addTranslation(texts,"btnDel")).addEvent("click", function () {
            var selected = listView.getSelectedRows();
            console.log(selected);
            var selectedrows = [];

            selected.forEach(function (s) {
                console.log(s);
                selectedrows.push(listView.getRowData(s))
                console.log("TA PRINTANDO " + selectedrows[0]);
                app.send({ api: "channel", mt: "DeleteUsers", id: parseInt(selectedrows[0]) });
            })
        }); 
         //Título Tabela Users
         var labelTituloUsers = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:26%; font-size:17px; text-align:center; font-weight: bold", texts.text("labelTituloUsers")));
         var list = new innovaphone.ui1.Div("position: absolute; display:flex; justify-content:center; left:0%; top:35%;  width: 100%; height:300px", null, "");
         var columns = 4;
         var rows = channels.length;
         var listView = new innovaphone.ui1.ListView(list, 30, "headercl", "arrow", false);
         //Cabeçalho
         for (i = 0; i < columns; i++) {
             listView.addColumn(null, "text", texts.text("cabecalho" + i), i, 40 , false); 
         }  
          //Tabela    
        list_ramais.forEach(function (b) {
            var row = [];
            row.push(b.id);
            row.push(b.sip);
            row.push(b.nome);
            row.push(b.data_criacao);
            listView.addRow(i, row, "rowcl", "#A0A0A0", "#82CAE2");
            that.add(list);
        })
    }
}

Wecom.reportAdmin.prototype = innovaphone.ui1.nodePrototype;
