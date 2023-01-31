
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
            "--bg": "url('bg.png')",
            "--button": "#c6c6c6",
            "--text-standard": "#004c84",
            "--div-DelBtn": "#f2f5f6",
        },
        light: {
            "--bg": "url('bg.png')",
            "--button": "#c6c6c6",
            "--text-standard": "#004c84",
            "--div-DelBtn": "#f2f5f6",
        }
    };
    var schemes = new innovaphone.ui1.CssVariables(colorSchemes, start.scheme);
    start.onschemechanged.attach(function () { schemes.activate(start.scheme) });

    var texts = new innovaphone.lib1.Languages(Wecom.reportTexts, start.lang);

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;
    app.onclosed = waitConnection;
    app.onerror = waitConnection;

    function waitConnection() {
        that.clear();
        var bodywait = new innovaphone.ui1.Div("height: 100%; width: 100%; display: inline-flex; position: absolute;justify-content: center; background-color:rgba(100,100,100,0.5)", null, "bodywaitconnection")
        bodywait.addHTML('<svg class="pl" viewBox="0 0 128 128" width="128px" height="128px" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="hsl(193,90%,55%)" /><stop offset="100%" stop-color="hsl(223,90%,55%)" /></linearGradient></defs>	<circle class="pl__ring" r="56" cx="64" cy="64" fill="none" stroke="hsla(0,10%,10%,0.1)" stroke-width="16" stroke-linecap="round" />	<path class="pl__worm" d="M92,15.492S78.194,4.967,66.743,16.887c-17.231,17.938-28.26,96.974-28.26,96.974L119.85,59.892l-99-31.588,57.528,89.832L97.8,19.349,13.636,88.51l89.012,16.015S81.908,38.332,66.1,22.337C50.114,6.156,36,15.492,36,15.492a56,56,0,1,0,56,0Z" fill="none" stroke="url(#pl-grad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="44 1111" stroke-dashoffset="10" /></svg >');
        that.add(bodywait);
    }


    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "admin", mt: "TableUsers" });
        app.send({ api: "admin", mt: "SelectRamais" });
    }

    function app_message(obj) {
        
        if (obj.api == "admin" && obj.mt == "TableUsersResult") {
            console.log(JSON.parse(obj.result));
            list_users = [];
            list_users = JSON.parse(obj.result);
            // MakeAdmin()
        }   
        if (obj.api == "admin" && obj.mt == "UsersError") {
            console.log(obj.result);
            makePopup("ERRO", "Erro: " + obj.result);
        }
        if(obj.api == "admin" && obj.mt == "SelectRamaisResultSuccess"){
            console.log(obj.result);
            list_ramais = [];
            list_ramais = JSON.parse(obj.result);
            makeTableUsers();
        }          
        if (obj.api == "admin" && obj.mt == "InsertRamalSuccess") {
            that.clear()
            app.send({ api: "admin", mt: "SelectRamais" });
            makePopup("Atenção", "Ramal adicionado com sucesso!");
            
        }
        if (obj.api == "admin" && obj.mt == "DeleteRamalSuccess") {
            that.clear()
            app.send({ api: "admin", mt: "SelectRamais" });
            makePopup("Atenção", "Ramal excluído com sucesso!");
           
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

    function DivAddUsers(){
       that.clear();
       var divUserSip = that.add(new innovaphone.ui1.Div("position:absolute; top:5%; width:100%; text-align:center ; font-size:30px;",texts.text("labelUsersSip"),null))
       var iptUserSip = that.add(new innovaphone.ui1.Node("select", "position:absolute; left:35%; width:30%; top:15%; font-size:15px; text-align:center", null, null));
       iptUserSip.setAttribute("id", "selectUser");
       list_users.forEach(function (user) {
            iptUserSip.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.cn, null));
       })      
       that.add(new innovaphone.ui1.Div("position:absolute; left:30%; width:15%; top:45%; font-size:15px; background-color: #02163F; color:white; text-align:center", null, "button-inn")).addTranslation(texts, "btnAdd").addEvent("click", function () {
           var userSipSelect = document.getElementById("selectUser").value;

           var user = list_users.filter(function (user) { return user.cn === userSipSelect });

           // Horario Atual
           var day = new Date().toLocaleString();
           
           app.send({ api: "admin", mt: "AddRamal", sip: String(user[0].sip), nome: String(user[0].cn)  ,  data_criacao: String(day)});
            });
        //Botão Cancelar   
        that.add(new innovaphone.ui1.Div("position:absolute; left:52%; width:15%; top:45%; font-size:15px; text-align:center; background-color: #B0132B; color:white ", null, "button-inn")).addTranslation(texts, "btnCancel").addEvent("click", function () {
            that.clear()
            makeTableUsers();
        });
    }
    function makeTableUsers(){
        
        that.add(new innovaphone.ui1.Div("width: 100%; text-align:center; top: 5%; position: absolute; font-size: 25px; ",texts.text("labelAdminPanel"),null))

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
                app.send({ api: "admin", mt: "DeleteRamal", id: parseInt(selectedrows[0]) });
            })
        }); 
         //Título Tabela Users
         var labelTituloUsers = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:26%; font-size:17px; text-align:center; font-weight: bold", texts.text("labelTituloUsers")));
         var list = new innovaphone.ui1.Div("position: absolute; left:15%; top:35%;  width: 80%; height:300px", null, "");
         var columns = 4;
         var rows = list_ramais.length;
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
