
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />
/// <reference path="../../web1/ui1.switch/innovaphone.ui1.switch.js" />
/// <reference path="../../web1/ui1.popup/innovaphone.ui1.popup.js" />
/// <reference path="../../web1/ui1.listview/innovaphone.ui1.listview.js" />

var Wecom = Wecom || {};
Wecom.dwcscheduler = Wecom.dwcscheduler || function (start, args) {
    this.createNode("body");
    var that = this;
    var appdn = start.title;
    var avatar = start.consumeApi("com.innovaphone.avatar");
    var appUrl = start.originalUrl;

    var colorSchemes = {
        dark: {
            "--bg": "url(bg.png)",
            "--button": "#303030",
            "--text-standard": "#f2f5f6",
        },
        light: {
            "--bg": "url(bg.png)",
            "--button": "#e0e0e0",
            "--text-standard": "#4a4a49",
        }
    };
    var schemes = new innovaphone.ui1.CssVariables(colorSchemes, start.scheme);
    start.onschemechanged.attach(function () { schemes.activate(start.scheme) });

    var texts = new innovaphone.lib1.Languages(Wecom.dwcschedulerTexts, start.lang);
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;
    app.onclosed = waitConnection(that);
    app.onerror = waitConnection(that);
    var _colDireita;
    var list_availabilities = [];
    var list_schedules = [];
    var list_configs = [];
    var list_rooms = [];
    var UIuserPicture;
    var UIuser;
    var UIsip;
    var dwcCaller;
    var dwcLocation;
    var key_conference;

    var phoneApi;
    var searchApi;
    

    function app_connected(domain, user, dn, appdomain) {
        //avatar
        avatar = new innovaphone.Avatar(start, user, domain);
        UIuserPicture = avatar.url(user, 80, dn);
        UIuser = dn;
        UIsip = user;
        appUrl = appUrl+"/Calendario.htm?id="+user;
        constructor();
        app.send({ api: "user", mt: "UserMessage" });
        searchApi = start.provideApi("com.innovaphone.search");
        searchApi.onmessage.attach(onSearchApiMessage);
        // start consume Phone API when AppWebsocket is connected
        phoneApi = start.consumeApi("com.innovaphone.phone");
        if (phoneApi) {
            phoneApi.onupdate.attach(onPhoneApiUpdate);
        }
    }

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "NoLicense") {
            console.log(obj.result);
            makeDivNoLicense(obj.result);
        }
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
            console.log(obj.result);
            list_configs = JSON.parse(obj.result);
            app.send({ api: "user", mt: "FindObjConfMessage", obj_conference: list_configs[0].obj_conference });
            makeDivHelp(_colDireita);
            //makeDivGeral(_colDireita);
        }
        if (obj.api == "user" && obj.mt == "SelectAvailabilityMessageSuccess") {
            console.log(obj.result);
            list_availabilities = JSON.parse(obj.result);
            makeDivAvailabilities(_colDireita);
        }
        if (obj.api == "user" && obj.mt == "SelectSchedulesMessageSuccess") {
            console.log(obj.result);
            list_schedules = JSON.parse(obj.result);
            makeDivSchedules(_colDireita);
        }
        if (obj.api == "user" && obj.mt == "UserEventMessage") {

            console.log("makePopupDevice");
            var styles = [new innovaphone.ui1.PopupStyles("popup-background", "popup-header", "popup-main", "popup-closer")];
            var h = [20];
            var _popup = new innovaphone.ui1.Popup("position: absolute; display: inline-flex; left:50px; top:50px; align-content: center; justify-content: center; flex-direction: row; flex-wrap: wrap; width:400px; height:200px;", styles[0], h[0]);
            _popup.header.addText(texts.text("labelEventTitle"));

            var iptEventTitle = new innovaphone.ui1.Div("position:absolute; left:0%; width:100%; top:20%; font-size:15px; text-align:center", texts.text("labelEvent"));
            var iptEventRequest = new innovaphone.ui1.Div("position:absolute; left:1%; width:99%; top:35%; font-size:15px; text-align:left", texts.text("labelEventRequest")+obj.name);
            var iptEventEmail = new innovaphone.ui1.Div("position:absolute; left:1%; width:99%; top:45%; font-size:15px; text-align:left", texts.text("labelEventEmail")+obj.email);
            var iptEventWhen = new innovaphone.ui1.Div("position:absolute; left:1%; width:99%; top:55%; font-size:15px; text-align:left", texts.text("labelEventWhen")+obj.time_start);

            //Botao Salvar
            var btnAckEvent = new innovaphone.ui1.Div("position:absolute; left:40%; width:20%; top:70%; font-size:15px; text-align:center", null, "button-inn").addTranslation(texts, "btnOk").addEvent("click", function () {
                app.send({ api: "user", mt: "UserAckEventMessage"});
                _popup.close();
            });

            _popup.content.add(iptEventTitle);
            _popup.content.add(iptEventRequest);
            _popup.content.add(iptEventEmail);
            _popup.content.add(iptEventWhen);
            _popup.content.add(btnAckEvent);
        }
        if (obj.api == "user" && obj.mt == "UserEventHistoryMessage") {

            console.log("makePopupDevice");
            var styles = [new innovaphone.ui1.PopupStyles("popup-background", "popup-header", "popup-main", "popup-closer")];
            var h = [20];
            var _popup = new innovaphone.ui1.Popup("position: absolute; display: inline-flex; left:50px; top:50px; align-content: center; justify-content: center; flex-direction: row; flex-wrap: wrap; width:400px; height:200px;", styles[0], h[0]);
            _popup.header.addText(texts.text("labelEventTitle"));

            var iptEventTitle = new innovaphone.ui1.Div("position:absolute; left:0%; width:100%; top:20%; font-size:15px; text-align:center", texts.text("labelEventHistory"));
            var iptEventCount = new innovaphone.ui1.Div("position:absolute; left:1%; width:99%; top:50%; font-size:15px; text-align:left", texts.text("labelEventCount") + obj.count);
            //Botao Salvar
            var btnAckEvent = new innovaphone.ui1.Div("position:absolute; left:40%; width:20%; top:70%; font-size:15px; text-align:center", null, "button-inn").addTranslation(texts, "btnOk").addEvent("click", function () {
                app.send({ api: "user", mt: "UserAckEventMessage" });
                _popup.close();
            });

            _popup.content.add(iptEventTitle);
            _popup.content.add(iptEventCount);
            _popup.content.add(btnAckEvent);
        }
        if (obj.api == "user" && obj.mt == "DWCCallRequest") {
            dwcCaller = obj.caller;
            dwcLocation = obj.location;
        }
        if (obj.api == "user" && obj.mt == "FindObjConfMessageResult") {
            console.log(obj);
            if (obj.found == true) {
                list_rooms = obj.rooms;
                try {
                    if (list_rooms.length == 0) {
                        window.alert("Atenção! Não há Salas disponíveis neste Objeto de Conferências")
                    }
                    else {
                        key_conference = obj.key;

                        var selectElement = document.getElementById("selectConfNumber");
                        while (selectElement.options.length > 0) {
                            selectElement.remove(0);
                        }

                        for (var i = 0; i < list_rooms.length; i++) {
                            var option = document.createElement("option");
                            option.text = list_rooms[i].dn;
                            option.id = list_rooms[i]["room-number"];
                            selectElement.appendChild(option);
                        }
                    }
                } catch (e) {
                    console.warn("FindObjConfMessageResult: list_rooms atualizado.");
                }
                

            } else {
                window.alert("Atenção! Não localizado o Objeto de Conferências com o nome informado, por favor, verifique o nome digitado.")
            }
        }
    }
    function constructor() {
        that.clear();
        // col Esquerda
        var colEsquerda = that.add(new innovaphone.ui1.Div(null, null, "colunaesquerda"));
        colEsquerda.setAttribute("id","colesquerda")

         // col direita
         var colDireita = that.add(new innovaphone.ui1.Div(null, null, "colunadireita"));
         colDireita.setAttribute("id","coldireita")
        
         //Titulo
         colDireita.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("labelTituloAdmin")));

        var divreport = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; border-bottom: 1px solid #4b545c; border-width: 100%; height: 10%; width: 100%; background-color: #02163F;  display: flex; align-items: center;", null, null));
        var imglogo = divreport.add(new innovaphone.ui1.Node("img", "max-height: 33px; opacity: 0.8;", null, null));
        imglogo.setAttribute("src", "logo-wecom.png");
        var spanreport = divreport.add(new innovaphone.ui1.Div("font-size: 1.00rem; color:white; margin : 5px;", appdn, null));
        var user = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; height: 10%; top: 10%; width: 100%; align-items: center; display: flex; border-bottom: 1px solid #4b545c"));
        var imguser = user.add(new innovaphone.ui1.Node("img", "max-height: 33px; border-radius: 50%;", null, null));
        imguser.setAttribute("src", UIuserPicture);
        var username = user.add(new innovaphone.ui1.Node("span", "font-size: 0.75rem; color:white; margin: 5px;", UIuser, null));
        username.setAttribute("id", "user")

        var relatorios = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 24%; height: 40%;"));
        var prelatorios = relatorios.add(new innovaphone.ui1.Node("p", "text-align: center; font-size: 20px;", texts.text("labelAdmin"), null));
        var br = relatorios.add(new innovaphone.ui1.Node("br", null, null, null));

        var lirelatorios1 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        var lirelatorios2 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        var lirelatorios3 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        var lirelatorios4 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))

        var Arelatorios1 = lirelatorios1.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgGeral"), null));
        Arelatorios1.setAttribute("id", "CfgGeral");
        var Arelatorios2 = lirelatorios2.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgSchedules"), null));
        Arelatorios2.setAttribute("id", "CfgSchedules")
        var Arelatorios3 = lirelatorios3.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgAvailability"), null));
        Arelatorios3.setAttribute("id", "CfgAvailability")
        var Arelatorios4 = lirelatorios4.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgHelp"), null));
        Arelatorios4.setAttribute("id", "CfgHelp")

        var divother = colEsquerda.add(new innovaphone.ui1.Div("text-align: left; position: absolute; top:59%;", null, null));
        var divother2 = divother.add(new innovaphone.ui1.Div(null, null, "otherli"));

        var config = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 85%;", null, null));
        var liconfig = config.add(new innovaphone.ui1.Node("li", "display:flex; aligns-items: center; justify-content:center;", null, "config"));

        var imgconfig = liconfig.add(new innovaphone.ui1.Node("img", "width: 100%; opacity: 0.9; margin: 2px; ", null, null));
        imgconfig.setAttribute("src", "logo.png");

        var a = document.getElementById("CfgGeral");
        a.addEventListener("click", function () { 
            ChangeView("CfgGeral", colDireita)
            if (window.matchMedia("(max-width: 500px)").matches) {
                openColDireita()
            }
            else{
                console.log("View Desktop")
            }
        })
        var a = document.getElementById("CfgSchedules");
        a.addEventListener("click", function () { 
            ChangeView("CfgSchedules", colDireita)
            if (window.matchMedia("(max-width: 500px)").matches) {
                openColDireita()
            }
            else{
                console.log("View Desktop")
            }
        })

        var a = document.getElementById("CfgAvailability");
        a.addEventListener("click", function () { 
            ChangeView("CfgAvailability", colDireita)
            if (window.matchMedia("(max-width: 500px)").matches) {
               openColDireita()
            }
            else{
                console.log("View Desktop")
            }
         })

        var a = document.getElementById("CfgHelp");
        a.addEventListener("click", function(){ 
            ChangeView("CfgHelp",colDireita)
            if (window.matchMedia("(max-width: 500px)").matches) {
                openColDireita()
            }
            else{
                console.log("View Desktop")
            }
        })

        _colDireita = colDireita;
    }
    function ChangeView(ex, colDireita) {

        if (ex == "CfgGeral") {
            makeDivGeral(colDireita);
        }
        if (ex == "CfgSchedules") {
            app.send({ api: "user", mt: "SelectSchedulesMessage" });
            waitConnection(colDireita);
        }
        if (ex == "CfgAvailability") {
            app.send({ api: "user", mt: "SelectAvailabilityMessage"});
            waitConnection(colDireita);
        }
        if (ex == "CfgHelp") {
            makeDivHelp(colDireita)
        }
    }
    function makeDivNoLicense(msg) {
        that.clear();
        //Titulo 
        that.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:100%; top:40%; font-size:18px; text-align:center; font-weight: bold; color: darkblue;", msg));

    }
    function makeDivSchedules(t) {
        t.clear();

        var imgMenu = t.add(new innovaphone.ui1.Node("img",null,null,"imgMenu"));
        imgMenu.setAttribute("src","menu-icon.png");
        imgMenu.setAttribute("id","imgmenu");
        document.getElementById("imgmenu").addEventListener("click",openMenu);

        var today = getDateNow();
        //Botoes Tabela de Agendamentos
        //t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:10%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnAddAction").addEvent("click", function () {
        //    makeDivAddAction(t);
        //});
        t.add(new innovaphone.ui1.Div("position:absolute; left:53%; width:15%; top:3%; font-size:12px; text-align:center;", null, "button-inn-del")).addTranslation(texts, "btnDel").addEvent("click", function () {
            var selected = ListView.getSelectedRows();
            console.log(selected);
            var selectedrows = [];

            selected.forEach(function (s) {
                console.log(s);
                selectedrows.push(ListView.getRowData(s))
            })
            selectedrows.forEach(function (row) {
                console.log(row);
                app.send({ api: "user", mt: "DelSchedulesMessage", id: parseInt(row) });
            })
        });
        t.add(new innovaphone.ui1.Div("position:absolute; left:68%; width:15%; top:3%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnNext").addEvent("click", function () {
            next();
        });
        t.add(new innovaphone.ui1.Div("position:absolute; left:83%; width:15%; top:3%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnAll").addEvent("click", function () {
            scroll_container.clear();
            list.clear();
            var rows = list_schedules.length;
            ListView = new innovaphone.ui1.ListView(list, 50, "headercl", "arrow", false);
            //Cabeçalho
            for (i = 0; i < columns; i++) {
                ListView.addColumn(null, "text", texts.text("cabecalhoSchedules" + i), i, 10, false);
            }
            //Tabela    
            list_schedules.forEach(function (b) {
                var row = [];
                row.push(b.id);
                row.push(b.name);
                row.push(b.email);
                var arrayDate = b.time_start.split("T");
                var day = arrayDate[0];
                var time = arrayDate[1];
                row.push(day + " " + time);
                var arrayDate = b.time_end.split("T");
                var day = arrayDate[0];
                var time = arrayDate[1];
                row.push(day + " " + time);
                var img = new innovaphone.ui1.Div(null, null, "button-link").addTranslation(texts, "btnLink").addEvent("click", function () {
                    newWindow(b.conf_link);
                });
                    //new innovaphone.ui1.Node("a", null, new innovaphone.ui1.Node("img", "alt:'Imagem Link Conf'; width:40px; height:40px;", null, null).setAttribute("src", "link.svg"), null).setAttribute("src", b.conf_link);
                row.push(img);
                ListView.addRow(i, row, "rowaction", "#A0A0A0", "#82CAE2");
            })
            scroll_container.add(list);
        });
        function newWindow(url) {
            window.open(url);
        }
        function next() {
            scroll_container.clear();
            list.clear();
            var rows = list_schedules.length;
            ListView = new innovaphone.ui1.ListView(list, 50, "headercl", "arrow", false);
            //Cabeçalho
            for (i = 0; i < columns; i++) {
                ListView.addColumn(null, "text", texts.text("cabecalhoSchedules" + i), i, 10, false);
            }
            //Tabela    
            list_schedules.forEach(function (b) {
                if (today < b.time_start) {
                    var row = [];
                    row.push(b.id);
                    row.push(b.name);
                    row.push(b.email);
                    var arrayDate = b.time_start.split("T");
                    var day = arrayDate[0];
                    var time = arrayDate[1];
                    row.push(day + " " + time);
                    var arrayDate = b.time_end.split("T");
                    var day = arrayDate[0];
                    var time = arrayDate[1];
                    row.push(day + " " + time);
                    var img = new innovaphone.ui1.Div(null, null, "button-link").addTranslation(texts, "btnLink").addEvent("click", function () {
                        newWindow(b.conf_link);
                    });
                    //var img = new innovaphone.ui1.Node("a", null, new innovaphone.ui1.Node("img", "alt:'Imagem Link Conf'; width:40px; height:40px;", null, null).setAttribute("src","link.svg"), null).setAttribute("src",b.conf_link);
                    row.push(img);
                    ListView.addRow(i, row, "rowaction", "#A0A0A0", "#82CAE2");
                }
            })
            scroll_container.add(list);
        }

        //Titulo Tabela
        var labelTituloTabeaAcoes = t.add(new innovaphone.ui1.Div(null, texts.text("labelTituloSchedules"),"DivSchedulesTableTitle"));

        var scroll_container = new innovaphone.ui1.Node("scroll-container", "overflow-y: auto; position: absolute; left:1%; top:25%; right:1%; width:98%; height:-webkit-fill-available;", null, "scroll-container-table");

        var list = new innovaphone.ui1.Div(null, null, "listSchedules");
        var columns = 6;
        var ListView = new innovaphone.ui1.ListView(list, 50, "headercl", "arrow", false);
        t.add(scroll_container);
        next();
    }
    function makeDivAvailabilities(t) {
        t.clear();

        var imgMenu = t.add(new innovaphone.ui1.Node("img",null,null,"imgMenu"));
        imgMenu.setAttribute("src","menu-icon.png");
        imgMenu.setAttribute("id","imgmenu");
        document.getElementById("imgmenu").addEventListener("click",openMenu);

        //Botoes Tabela de Disponibilidades
        t.add(new innovaphone.ui1.Div("position:absolute; left:68%; width:15%; top:3%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnAdd").addEvent("click", function () {
            makeDivAddAvail(t);
        });
        t.add(new innovaphone.ui1.Div("position:absolute; left:83%; width:15%; top:3%; font-size:12px; text-align:center;", null, "button-inn-del")).addTranslation(texts, "btnDel").addEvent("click", function () {
            var selected = ListView.getSelectedRows();
            console.log(selected);
            var selectedrows = [];

            selected.forEach(function (s) {
                console.log(s);
                selectedrows.push(ListView.getRowData(s))
                
            })
            selectedrows.forEach(function (row) {
                console.log(row);
                app.send({ api: "user", mt: "DelAvailabilityMessage", id: parseInt(row) });
            })
        });



        //Titulo Tabela
        t.add(new innovaphone.ui1.Div(null, texts.text("labelTituloAvail"),"TitleAvailTable"));

        var scroll_container = new innovaphone.ui1.Node("scroll-container", "overflow-y: auto; position: absolute; left:1%; top:25%; right:1%; width:98%; height:-webkit-fill-available;", null, "scroll-container-table");

        var list = new innovaphone.ui1.Div(null, null, "");
        var columns = 3;
        var rows = list_availabilities.length;
        var ListView = new innovaphone.ui1.ListView(list, 50, "headercl", "arrow", false);
        //Cabeçalho
        for (i = 0; i < columns; i++) {
            ListView.addColumn("column", "text_cabecalho", texts.text("cabecalhoAvailabilities" + i), i, 10, false);
        }
        //Tabela    
        list_availabilities.forEach(function (a) {
            var row = [];
            row.push(a.id);
            var arrayDate = a.time_start.split("T");
            var day = arrayDate[0];
            var time = arrayDate[1];
            row.push(day + " " + time);
            var arrayDate = a.time_end.split("T");
            var day = arrayDate[0];
            var time = arrayDate[1];
            row.push(day + " " + time);
            ListView.addRow(i, row, "rowaction", "#A0A0A0", "#82CAE2");
        })
        scroll_container.add(list);
        t.add(scroll_container);
    }
    function makeDivAddAvail(colDireita) {
        colDireita.clear();

        var imgMenu = colDireita.add(new innovaphone.ui1.Node("img",null,null,"imgMenu"));
        imgMenu.setAttribute("src","menu-icon.png");
        imgMenu.setAttribute("id","imgmenu");
        document.getElementById("imgmenu").addEventListener("click",openMenu);

        //var divFrom = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 25%; left: 6%; font-weight: bold;", texts.text("labelFrom"), null));
        //var InputFrom = colDireita.add(new innovaphone.ui1.Input("position: absolute;  top: 25%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "datetime-local", null).setAttribute("id", "dateFrom"));
       
        var divStart = colDireita.add(new innovaphone.ui1.Div(null, texts.text("labelStart"), "DivStartAddAvail"));
        var InputStart = colDireita.add(new innovaphone.ui1.Input(null, null, null, null, "datetime-local","IptStartAddAvail").setAttribute("id", "timeStart"));

        var divEnd = colDireita.add(new innovaphone.ui1.Div(null, texts.text("labelEnd"), "DivEndAddAvail"));
        var InputEnd = colDireita.add(new innovaphone.ui1.Input(null, null, null, null, "datetime-local","IptEndAddAvail").setAttribute("id", "timeEnd"));
        // buttons
        colDireita.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnOk").addEvent("click", function () {
            //var from = document.getElementById("dateFrom").value;
            var time_start = document.getElementById("timeStart").value;
            var time_end = document.getElementById("timeEnd").value;

            app.send({ api: "user", mt: "AddAvailabilityMessage", time_start: time_start, time_end: time_end });
            waitConnection(colDireita);
        });
        colDireita.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn-del")).addTranslation(texts, "btnCancel").addEvent("click", function () {
            makeDivAvailabilities(colDireita);
        });
    }
    function waitConnection(t) {
        t.clear();
        var bodywait = new innovaphone.ui1.Div("height: 100%; width: 100%; display: inline-flex; position: absolute;justify-content: center; background-color:rgba(100,100,100,0.5)", null, "bodywaitconnection")
        bodywait.addHTML('<svg class="pl" viewBox="0 0 128 128" width="128px" height="128px" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="hsl(193,90%,55%)" /><stop offset="100%" stop-color="hsl(223,90%,55%)" /></linearGradient></defs>	<circle class="pl__ring" r="56" cx="64" cy="64" fill="none" stroke="hsla(0,10%,10%,0.1)" stroke-width="16" stroke-linecap="round" />	<path class="pl__worm" d="M92,15.492S78.194,4.967,66.743,16.887c-17.231,17.938-28.26,96.974-28.26,96.974L119.85,59.892l-99-31.588,57.528,89.832L97.8,19.349,13.636,88.51l89.012,16.015S81.908,38.332,66.1,22.337C50.114,6.156,36,15.492,36,15.492a56,56,0,1,0,56,0Z" fill="none" stroke="url(#pl-grad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="44 1111" stroke-dashoffset="10" /></svg >');
        t.add(bodywait);
    }
    function makeDivGeral(t){
        t.clear();
        var email_contato = null;
        var text_invite = null;
        var url_conference = null;
        var email_title = null;
        var title_conference = null;
        var obj_conference = null;
        var room = null;
        var reserved_conference = null;
        try {
            var email_contato = list_configs[0].email_contato;
            var text_invite = list_configs[0].text_invite;
            var url_conference = list_configs[0].url_conference;
            var email_title = list_configs[0].email_title;
            var title_conference = list_configs[0].title_conference;
            var obj_conference = list_configs[0].obj_conference;
            var room = list_configs[0].number_conference;
            key_conference = list_configs[0].key_conference;
            var reserved_conference = list_configs[0].reserved_conference;
        } catch (e) {
            
        }

        var imgMenu = t.add(new innovaphone.ui1.Node("img",null,null,"imgMenu"));
        imgMenu.setAttribute("src","menu-icon.png");
        imgMenu.setAttribute("id","imgmenu");
        document.getElementById("imgmenu").addEventListener("click",openMenu);

        t.add(new innovaphone.ui1.Div(null, texts.text("labelTituloAdmin"),"DivGeralTitle"));

        var emailContato = t.add(new innovaphone.ui1.Div(null, texts.text("labelEmailContato"),"DivGeralEmail"));
        var InputEmailContato = t.add(new innovaphone.ui1.Input(null, email_contato, "Insira aqui o e-mail de contato", null, "email","DivGeralIptEmail").setAttribute("id", "InputEmailContato"));

        var divTitleEmail = t.add(new innovaphone.ui1.Div(null, texts.text("labelTitleEmail"),"DivGeralTitleEmail"));
        var InputTitleEmail = t.add(new innovaphone.ui1.Input(null, email_title,"Insira aqui o titulo do e-mail", null, "url","DivGeralIptTitleEmail").setAttribute("id", "InputTitleEmail"));

        var divURLConference = t.add(new innovaphone.ui1.Div(null, texts.text("labelURLContato"),"DivGeralUrlConference"));
        var InputURLConference = t.add(new innovaphone.ui1.Input(null, url_conference, "Insira aqui a URL do evento", null, "url","DivGeralIptUrlConf").setAttribute("id", "InputURLConference"));

        //Sala de Conf dinâmica
        var divObjConference = t.add(new innovaphone.ui1.Div(null, texts.text("labelObjConf"), "DivGeralObjConference"));
        var InputObjConference = t.add(new innovaphone.ui1.Input(null, obj_conference, "Insira aqui o nome do Objeto de Conferência que possui as Salas", null, "text", "DivGeralIptObjConf").setAttribute("id", "InputObjConference"));
        t.add(new innovaphone.ui1.Div("position:absolute; left:82%; width:15%; top:54%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnFind").addEvent("click", function () {

            var obj_conference = document.getElementById("InputObjConference").value;
            app.send({ api: "user", mt: "FindObjConfMessage", obj_conference: obj_conference });
            //waitConnection(t);
        });
        var divConfRoom = t.add(new innovaphone.ui1.Div(null,texts.text("labelConfRoom"),"DivConfRoom"));
        var selectConfNumber = t.add(new innovaphone.ui1.Node("select", null, null, "SelectConfNumber").setAttribute("id", "selectConfNumber"));
        selectConfNumber.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "", null).setAttribute("id", ""));
        list_rooms.forEach(function (r) {
            selectConfNumber.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", r.dn, null).setAttribute("id", r["room-number"]));
        })
        if (list_configs[0].number_conference) {
            var cn = list_rooms.filter(function (r) { return r["room-number"] === room })[0].dn;
            var select = document.getElementById('selectConfNumber');
            select.remove(0);
            select.value = cn;
        }

        t.add(new innovaphone.ui1.Div(null, texts.text("labelDivGeralChannelsReserved"), "DivGeralChannelsReserved"));
        t.add(new innovaphone.ui1.Input(null, reserved_conference, "Insira aqui o número de canais reservados", null, "number", "DivGeralIptChannelsReserved").setAttribute("id", "InputChannelsReserved"));



        var divTitleConference = t.add(new innovaphone.ui1.Div(null, texts.text("labelTitleConference"),"DivGeralTitleConf"));
        var InputTitleConference = t.add(new innovaphone.ui1.Input(null, title_conference,"Insira aqui o título do evento", null, "url","DivGeralIptTitleConf").setAttribute("id", "InputTitleConference"));

        var divTextInvite = t.add(new innovaphone.ui1.Div(null, texts.text("labelTxtInvite"), "DivGeralTextInvite"));
        var InputTextInvite = t.add(new innovaphone.ui1.Node("textarea",null, text_invite,"DivGeralIptTextInvite").setAttribute("id", "InputTxtInvite"));
        InputTextInvite.setAttribute("placeholder", "Insira aqui o texto do e-mail de convite")
        
        
        // openMenu();
        // buttons
        t.add(new innovaphone.ui1.Div("position:absolute; left:82%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnOk").addEvent("click", function () {
            
            var email_contato = document.getElementById("InputEmailContato").value;
            var url_conference = document.getElementById("InputURLConference").value;
            var text_invite = document.getElementById("InputTxtInvite").value;
            var email_title = document.getElementById("InputTitleEmail").value;
            var title_conference = document.getElementById("InputTitleConference").value;
            var obj_conference = document.getElementById("InputObjConference").value;
            var reserved_conference = document.getElementById("InputChannelsReserved").value;
            var room_number = document.getElementById("selectConfNumber");
            var selectedroom = room_number.options[room_number.selectedIndex];
            var number_conference = selectedroom.id;

            app.send({ api: "user", mt: "UpdateConfigMessage", email: email_contato, url_conference: url_conference, text_invite: text_invite, email_title: email_title, title_conference: title_conference, obj_conference: obj_conference, number_conference: number_conference, key_conference: key_conference, reserved_conference: reserved_conference});
            waitConnection(t);
        });

    } 
    function makeDivHelp(t){
        t.clear();

        var imgMenu = t.add(new innovaphone.ui1.Node("img",null,null,"imgMenu"));
        imgMenu.setAttribute("src","menu-icon.png");
        imgMenu.setAttribute("id","imgmenu");
        document.getElementById("imgmenu").addEventListener("click",openMenu);

        t.add(new innovaphone.ui1.Node("h2",null,texts.text("labelcalendarURL"),"DivHelpCalendarTitle"));
        var divIptUrl = t.add(new innovaphone.ui1.Div(null,null,"DivHelpDivIptUrl"));
        var iptURL =  divIptUrl.add(new innovaphone.ui1.Input(null,appUrl,null,200,"text","urlcalendar"));
        iptURL.setAttribute("readonly", "readonly");
        iptURL.setAttribute("id","iptUrl")
        var btnCopy = divIptUrl.add(new innovaphone.ui1.Node("button",null,texts.text("labelCopy"),"DivHelpBtnCopy"))
        btnCopy.setAttribute("id","btnCopy");
        document.getElementById("btnCopy").addEventListener("click",copyText); 
        var CopyPopUp = t.add(new innovaphone.ui1.Div(null,texts.text("Copied"),"CopyPopUp"));
        CopyPopUp.setAttribute("id","copyPopUp")
        document.getElementById("btnCopy").addEventListener("click",ShowCopyPopUp); 
        // ainda nao acabei essa parte do pop up quando texto é copiado
        t.add(new innovaphone.ui1.Node("p",null,texts.text("infoUrl"),"DivHelpPInfo"));
        t.add(new innovaphone.ui1.Node("h2",null,texts.text("meaningURL"),"DivHelpH2"));
        var lista = t.add(new innovaphone.ui1.Node("ul",null,null,"DivHelpUlLista"));
        lista.add(new innovaphone.ui1.Node("li",null,"id="+UIsip,"DivHelpLi"));
        lista.add(new innovaphone.ui1.Node("br",null,null,null));
        lista.add(new innovaphone.ui1.Node("h3",null,texts.text("idInfo"),"DivHelpH3"))
        lista.add(new innovaphone.ui1.Node("p",null,texts.text("nota"),"DivHelpNota"))
        lista.add(new innovaphone.ui1.Node("p",null,texts.text("notaId"),"DivHelpNotaInfo"))
    }
    function copyText() {
        var input = document.getElementById("iptUrl");
        input.select();
        input.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(input.value)  
        //alert("Texto copiado: " + input.value);
    }
    function getDateNow() {
        // Cria uma nova data com a data e hora atuais em UTC
        var date = new Date();
        // Adiciona o deslocamento de GMT-3 �s horas da data atual em UTC
        date.setUTCHours(date.getUTCHours() - 3);

        // Formata a data e hora em uma string ISO 8601 com o caractere "T"
        var dateString = date.toISOString();

        // Substitui o caractere "T" por um espa�o
        //dateString = dateString.replace("T", " ");

        // Retorna a string no formato "AAAA-MM-DDTHH:mm:ss.sss"
        return dateString.slice(0, -5);
    }
    function getDateNow2() {
        // Cria uma nova data com a data e hora atuais em UTC
        var date = new Date();
        // Adiciona o deslocamento de GMT-3 �s horas da data atual em UTC
        date.setUTCHours(date.getUTCHours() - 3);

        // Formata a data em uma string no formato "AAAAMMDDTHHmmss"
        var year = date.getUTCFullYear();
        var month = padZero(date.getUTCMonth() + 1);
        var day = padZero(date.getUTCDate());
        var hours = padZero(date.getUTCHours());
        var minutes = padZero(date.getUTCMinutes());
        var seconds = padZero(date.getUTCSeconds());
        var dateString = year + month + day + "T" + hours + minutes + seconds;

        // Retorna a string no formato "AAAAMMDDTHHmmss"
        return dateString;
    }
    function convertDateTimeLocalToCustomFormat(datetimeLocal) {
        var d = new Date(datetimeLocal);
        var year = d.getFullYear();
        var month = padZero(d.getMonth() + 1);
        var day = padZero(d.getDate());
        var hours = padZero(d.getHours());
        var minutes = padZero(d.getMinutes());
        var seconds = padZero(d.getSeconds());
        return year + month + day + "T" + hours + minutes + seconds;
    }
    function padZero(num) {
        return (num < 10 ? "0" : "") + num;
    }
    // callback function called upon events in the phone app
    function onPhoneApiUpdate(arg0) {
        const provider = arg0.defaultApiProvider;
        const calls = arg0.model[provider].model.calls;
        calls.forEach(function (call) {
            if (call.sip == "extern-web") {
                if (dwcCaller.length>1 && dwcLocation.length<1) {
                    phoneApi.send({ mt: "CallInfo", id: call.id, html: "<div style=' width: 100%; left: 0%; text-align: center;;background:darkblue;color:white;font-size:20px'>Cliente: " + decodeURIComponent(dwcCaller) + "</div>" });
                }else if(dwcCaller.length>1 && dwcLocation.length>1){
                    phoneApi.send({ mt: "CallInfo", id: call.id, html: "<div style=' width: 100%; left: 0%; text-align: center;;background:darkblue;color:white;font-size:20px'>Cliente: " + decodeURIComponent(dwcCaller) + "</div><div style='top:40px; width: 100%; height: 100%; left: 0%; text-align: center;;background:darkblue;color:white;font-size:20px'><iframe src='"+dwcLocation+"' width='100%' height='100%' style='border:0;' allowfullscreen='' loading='lazy' referrerpolicy='no-referrer-when-downgrade'></iframe></div>" });
                }else if(dwcCaller.length<1 && dwcLocation.length<1){
                    phoneApi.send({ mt: "CallInfo", id: call.id, html: ""});
                }
                
            } else {
                phoneApi.send({ mt: "CallInfo", id: call.id, html: ""});
            }
            if (call.state == "Connected") {
                dwcLocation ='';
                dwcCaller='';
            }
        });
    }
    function onSearchApiMessage(consumer, obj) {
        console.log("onSearchApiMessage:obj " + JSON.stringify(obj));
        switch (obj.msg.mt) {
            case "Search":
                if (obj.msg.search == "Extern Web") {
                    obj.msg = "";
                    obj.msg = { mt: "SearchInfo", type: "contact", dn: dwcCaller, avatar: "danilo.volz", guid: "8e4b16d1-d798-40ba-9800-43ea0d9523a3", link: "users?id=danilo.volz@wecom.com.br", contact: { givenname: "Danilo", sn: "Volz", company: "", sip: ["danilo.volz@wecom.com.br"] }, pbx: "inn-lab-ipva", node: "root", template: "Config Admin" };
                    searchApi.send(obj);
                    obj.msg = "";
                    obj.msg = { mt: "SearchResult" };
                    searchApi.send(obj);
                }
                break;
        }
    }
    function openMenu() {
        var colunaEsquerda = document.getElementById("colesquerda");
        var colunaDireita = document.getElementById("coldireita");
        var imgMenu = document.getElementById("imgmenu");
        
        colunaEsquerda.style.display = 'block';
        colunaEsquerda.style.transform = 'translateX(-100%)';
        colunaEsquerda.style.transition = 'transform 1s ease-in-out, opacity 1s ease-in-out';
        
        colunaDireita.style.opacity = '1';
        colunaDireita.style.transition = 'opacity 1s ease-in-out';
        
        setTimeout(function() {
            colunaEsquerda.style.transform = 'translateX(0)';
            colunaDireita.style.opacity = '0';
        }, 0);
        
        setTimeout(function() {
            colunaDireita.style.display = 'none';
            imgMenu.style.display = 'none';
            colunaDireita.style.opacity = '1';
        }, 1000);
    }
    function openColDireita(){
        var colunaEsquerda = document.getElementById("colesquerda");
        var colunaDireita = document.getElementById("coldireita");
        var imgMenu = document.getElementById("imgmenu");
        
        colunaEsquerda.style.transform = 'translateX(-100%)';
        colunaEsquerda.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out';
        
        colunaDireita.style.display = 'block';
        colunaDireita.style.opacity = '0';
        colunaDireita.style.transition = 'opacity 0.3s ease-in-out';
        
        setTimeout(function() {
            colunaEsquerda.style.display = 'none';
            colunaEsquerda.style.transform = 'translateX(0)';
            colunaDireita.style.opacity = '1';
        }, 300);
    }
    function ShowCopyPopUp() {
        var popup = document.getElementById("copyPopUp");
        popup.classList.remove("hide");
        popup.classList.add("show");
  
        setTimeout(function() {
            popup.classList.remove("show");
            popup.classList.add("hide");
          }, 1000);
    
    }
}
Wecom.dwcscheduler.prototype = innovaphone.ui1.nodePrototype;
