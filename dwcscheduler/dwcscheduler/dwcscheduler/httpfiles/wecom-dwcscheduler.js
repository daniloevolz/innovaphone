
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
    var UIuserPicture;
    var UIuser;
    var dwcCaller;
    var dwcLocation;

    var phoneApi;
    var searchApi;
    

    function app_connected(domain, user, dn, appdomain) {
        //avatar
        avatar = new innovaphone.Avatar(start, user, domain);
        UIuserPicture = avatar.url(user, 80, dn);
        UIuser = dn;
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
            makeDivGeral(_colDireita);
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

            //Bot�o Salvar
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
            //Bot�o Salvar
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
    }
    function constructor() {
        that.clear();
        // col direita
        var colDireita = that.add(new innovaphone.ui1.Div(null, null, "colunadireita"));
        //T�tulo
        colDireita.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("labelTituloAdmin")));

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

        var relatorios = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 24%; height: 40%;"));
        var prelatorios = relatorios.add(new innovaphone.ui1.Node("p", "text-align: center; font-size: 20px;", texts.text("labelAdmin"), null));
        var br = relatorios.add(new innovaphone.ui1.Node("br", null, null, null));

        var lirelatorios1 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        var lirelatorios2 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        var lirelatorios3 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))

        var Arelatorios1 = lirelatorios1.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgGeral"), null));
        Arelatorios1.setAttribute("id", "CfgGeral");
        var Arelatorios2 = lirelatorios2.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgSchedules"), null));
        Arelatorios2.setAttribute("id", "CfgSchedules")
        var Arelatorios3 = lirelatorios3.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgAvailability"), null));
        Arelatorios3.setAttribute("id", "CfgAvailability")


        var divother = colEsquerda.add(new innovaphone.ui1.Div("text-align: left; position: absolute; top:59%;", null, null));
        var divother2 = divother.add(new innovaphone.ui1.Div(null, null, "otherli"));

        var config = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 90%;", null, null));
        var liconfig = config.add(new innovaphone.ui1.Node("li", "display:flex; aligns-items: center", null, "config"));

        var imgconfig = liconfig.add(new innovaphone.ui1.Node("img", "width: 100%; opacity: 0.9; margin: 2px; ", null, null));
        imgconfig.setAttribute("src", "logo.png");
        //var Aconfig = liconfig.add(new innovaphone.ui1.Node("a", "display: flex; align-items: center; justify-content: center;", texts.text("labelConfig"), null));
        //Aconfig.setAttribute("href", "#");

        var a = document.getElementById("CfgGeral");
        a.addEventListener("click", function () { ChangeView("CfgGeral", colDireita) })

        var a = document.getElementById("CfgSchedules");
        a.addEventListener("click", function () { ChangeView("CfgSchedules", colDireita) })

        var a = document.getElementById("CfgAvailability");
        a.addEventListener("click", function () { ChangeView("CfgAvailability", colDireita) })

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
    }
    function makeDivNoLicense(msg) {
        that.clear();
        //Titulo 
        that.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:100%; top:40%; font-size:18px; text-align:center; font-weight: bold; color: darkblue;", msg));

    }
    function makeDivSchedules(t) {
        t.clear();
        var today = getDateNow();
        //Bot�es Tabela de Agendamentos
        //t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:10%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnAddAction").addEvent("click", function () {
        //    makeDivAddAction(t);
        //});
        t.add(new innovaphone.ui1.Div("position:absolute; left:3%; width:15%; top:3%; font-size:12px; text-align:center;", null, "button-inn-del")).addTranslation(texts, "btnDel").addEvent("click", function () {
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
        t.add(new innovaphone.ui1.Div("position:absolute; left:18%; width:15%; top:3%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnNext").addEvent("click", function () {
            next();
        });
        t.add(new innovaphone.ui1.Div("position:absolute; left:33%; width:15%; top:3%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnAll").addEvent("click", function () {
            scroll_container.clear();
            list.clear();
            var rows = list_schedules.length;
            ListView = new innovaphone.ui1.ListView(list, 50, "headercl", "arrow", false);
            //Cabe�alho
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
            //Cabe�alho
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

        //T�tulo Tabela
        var labelTituloTabeaAcoes = t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:30%; top:20%; font-size:17px; text-align:center; font-weight: bold", texts.text("labelTituloSchedules")));

        var scroll_container = new innovaphone.ui1.Node("scroll-container", "overflow-y: auto; position: absolute; left:1%; top:25%; right:1%; width:98%; height:-webkit-fill-available;", null, "scroll-container-table");

        var list = new innovaphone.ui1.Div(null, null, "");
        var columns = 6;
        var ListView = new innovaphone.ui1.ListView(list, 50, "headercl", "arrow", false);
        t.add(scroll_container);
        next();
    }
    function makeDivAvailabilities(t) {
        t.clear();

        //Bot�es Tabela de Disponibilidades
        t.add(new innovaphone.ui1.Div("position:absolute; left:3%; width:15%; top:3%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnAdd").addEvent("click", function () {
            makeDivAddAvail(t);
        });
        t.add(new innovaphone.ui1.Div("position:absolute; left:18%; width:15%; top:3%; font-size:12px; text-align:center;", null, "button-inn-del")).addTranslation(texts, "btnDel").addEvent("click", function () {
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



        //T�tulo Tabela
        t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:30%; top:20%; font-size:17px; text-align:center; font-weight: bold", texts.text("labelTituloAvail")));

        var scroll_container = new innovaphone.ui1.Node("scroll-container", "overflow-y: auto; position: absolute; left:1%; top:25%; right:1%; width:98%; height:-webkit-fill-available;", null, "scroll-container-table");

        var list = new innovaphone.ui1.Div(null, null, "");
        var columns = 3;
        var rows = list_availabilities.length;
        var ListView = new innovaphone.ui1.ListView(list, 50, "headercl", "arrow", false);
        //Cabe�alho
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
        //var divFrom = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 25%; left: 6%; font-weight: bold;", texts.text("labelFrom"), null));
        //var InputFrom = colDireita.add(new innovaphone.ui1.Input("position: absolute;  top: 25%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "datetime-local", null).setAttribute("id", "dateFrom"));

        var divStart = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 35%; left: 6%; font-weight: bold;", texts.text("labelStart"), null));
        var InputStart = colDireita.add(new innovaphone.ui1.Input("position: absolute;  top: 35%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "datetime-local", null).setAttribute("id", "timeStart"));

        var divEnd = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 45%; left: 6%; font-weight: bold;", texts.text("labelEnd"), null));
        var InputEnd = colDireita.add(new innovaphone.ui1.Input("position: absolute;  top: 45%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "datetime-local", null).setAttribute("id", "timeEnd"));
        // buttons
        colDireita.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnOk").addEvent("click", function () {
            //var from = document.getElementById("dateFrom").value;
            var time_start = document.getElementById("timeStart").value;
            var time_end = document.getElementById("timeEnd").value;

            app.send({ api: "user", mt: "AddAvailabilityMessage", time_start: time_start, time_end: time_end });
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
    function makeDivGeral(t){
        t.clear();
        //T�tulo
        try {
            var email_contato = list_configs[0].email_contato;
            var text_invite = list_configs[0].text_invite;
            var url_conference = list_configs[0].url_conference;
            var email_title = list_configs[0].email_title;
            var title_conference = list_configs[0].title_conference
        } catch (e) {
            var email_contato = null;
            var text_invite = null;
            var url_conference = null;
            var email_title = null;
            var title_conference = null;
        }
        t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("labelTituloAdmin")));

        var emailContato = t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 20%; left: 6%; font-weight: bold;", texts.text("labelEmailContato"), null));
        var InputEmailContato = t.add(new innovaphone.ui1.Input("position: absolute;  top: 20%; left: 21%; height: 30px; padding:5px; width: 50%; border-radius: 10px; border: 2px solid; border-color:#02163F;", email_contato, "Insira aqui o e-mail de contato", null, "email", null).setAttribute("id", "InputEmailContato"));

        var divTitleEmail = t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 30%; left: 6%; font-weight: bold;", texts.text("labelTitleEmail"), null));
        var InputTitleEmail = t.add(new innovaphone.ui1.Input("position: absolute;  top: 30%; left: 21%; height: 30px; padding:5px; width: 50%; border-radius: 10px; border: 2px solid; border-color:#02163F;", email_title,"Insira aqui o titulo do e-mail", null, "url", null).setAttribute("id", "InputTitleEmail"));

        var divURLConference = t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 35%; left: 6%; font-weight: bold;", texts.text("labelURLContato"), null));
        var InputURLConference = t.add(new innovaphone.ui1.Input("position: absolute;  top: 35%; left: 21%; height: 30px; padding:5px; width: 50%; border-radius: 10px; border: 2px solid; border-color:#02163F;", url_conference, "Insira aqui a URL do evento", null, "url", null).setAttribute("id", "InputURLConference"));

        var divTitleConference = t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 40%; left: 6%; font-weight: bold;", texts.text("labelTitleConference"), null));
        var InputTitleConference = t.add(new innovaphone.ui1.Input("position: absolute;  top: 40%; left: 21%; height: 30px; padding:5px; width: 50%; border-radius: 10px; border: 2px solid; border-color:#02163F;", title_conference,"Insira aqui o título do evento", null, "url", null).setAttribute("id", "InputTitleConference"));

        var divTextInvite = t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 55%; left: 6%; font-weight: bold;", texts.text("labelTxtInvite"), null));
        var InputTextInvite = t.add(new innovaphone.ui1.Node("textarea", "position: absolute; padding:5px; top: 45%; left: 21%; height: 150px; rows=5; width: 50%; border-radius: 10px; border: 2px solid; border-color:#02163F;", text_invite, null).setAttribute("id", "InputTxtInvite"));
        InputTextInvite.setAttribute("placeholder", "Insira aqui o texto do e-mail de convite")
        // buttons
        t.add(new innovaphone.ui1.Div("position:absolute; left:82%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnOk").addEvent("click", function () {
            
            var email_contato = document.getElementById("InputEmailContato").value;
            var url_conference = document.getElementById("InputURLConference").value;
            var text_invite = document.getElementById("InputTxtInvite").value;
            var email_title = document.getElementById("InputTitleEmail").value;
            var title_conference = document.getElementById("InputTitleConference").value;
             
            

            app.send({ api: "user", mt: "UpdateConfigMessage", email: email_contato, url_conference: url_conference, text_invite: text_invite, email_title: email_title, title_conference: title_conference });
            waitConnection(t);
        });

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
                if (!dwcLocation) {
                    phoneApi.send({ mt: "CallInfo", id: call.id, html: "<div style=' width: 100%; left: 0%; text-align: center;;background:darkblue;color:white;font-size:20px'>Cliente: " + decodeURIComponent(dwcCaller) + "</div>" });
                }
                phoneApi.send({ mt: "CallInfo", id: call.id, html: "<div style=' width: 100%; left: 0%; text-align: center;;background:darkblue;color:white;font-size:20px'>Cliente: " + decodeURIComponent(dwcCaller) + "</div><div style='top:40px; width: 100%; height: 100%; left: 0%; text-align: center;;background:darkblue;color:white;font-size:20px'><iframe src='"+dwcLocation+"' width='100%' height='100%' style='border:0;' allowfullscreen='' loading='lazy' referrerpolicy='no-referrer-when-downgrade'></iframe></div>" });
            } else {
                phoneApi.send({ mt: "CallInfo", id: call.id, html: ""});
            }
            //if (call.state == "Alerting" || call.state == "Ringback" || call.state == "Connected") {
            //    }
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
}

Wecom.dwcscheduler.prototype = innovaphone.ui1.nodePrototype;
