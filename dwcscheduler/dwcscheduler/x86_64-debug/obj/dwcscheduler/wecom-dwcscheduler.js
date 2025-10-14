
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
    var list_day_availabilities = [];

    var phoneApi;
    var searchApi;
    var clientTimeZone = "-03:00";
    

    function app_connected(domain, user, dn, appdomain) {
        var clientTimeZoneOffset = new Date().getTimezoneOffset();
        clientTimeZone = formatTimezoneOffset(clientTimeZoneOffset);
        //avatar
        avatar = new innovaphone.Avatar(start, user, domain);
        UIuserPicture = avatar.url(user, 80, dn);
        UIuser = dn;
        UIsip = user;
        appUrl = appUrl+"/Calendario.htm?id="+user;
        constructor();
        app.send({ api: "user", mt: "UserMessage", lang: start.lang, timeZone: clientTimeZone });
        //searchApi = start.provideApi("com.innovaphone.search");
        //searchApi.onmessage.attach(onSearchApiMessage);
        // start consume Phone API when AppWebsocket is connected
        //phoneApi = start.consumeApi("com.innovaphone.phone");
        //if (phoneApi) {
        //    phoneApi.onupdate.attach(onPhoneApiUpdate);
        //}
    }

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "NoLicense") {
            console.log(obj.result);
            makeDivNoLicense(obj.result);
        }
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
            console.log(obj.result);
            list_configs = JSON.parse(obj.result);
            //app.send({ api: "user", mt: "FindObjConfMessage", obj_conference: list_configs[0].obj_conference });
            makeDivHelp(_colDireita);
            //makeDivGeral(_colDireita);
        }
        if (obj.api == "user" && obj.mt == "SelectAvailabilityMessageSuccess") {
            console.log(obj.result);
            list_day_availabilities = JSON.parse(obj.result);
            makeDivAddWeekAvailability(_colDireita);
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
            //dwcCaller = obj.caller;
            //dwcLocation = obj.location;
        }
        if (obj.api == "user" && obj.mt == "FindObjConfMessageResult") {
            console.log(obj);
            if (obj.found == true) {
                list_rooms = obj.rooms;
                try {
                    if (list_rooms.length == 0) {
                        makePopup(texts.text("labelWarning"),texts.text("labelNoConfRoom"), 500, 200);
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
                makePopup(texts.text("labelWarning"),texts.text("labelWrongObjectConf"), 500, 200);
            }
        }
    }
    function formatTimezoneOffset(offset) {
        var hours = Math.abs(Math.floor(offset / 60));
        var minutes = Math.abs(offset % 60);
        var sign = offset > 0 ? '-' : '+';
        return sign + pad(hours, 2) + ':' + pad(minutes, 2);
    }
    function pad(num, size) {
        var s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    }
    function makePopup(header, content, width, height) {
        console.log("makePopup");
        var styles = [new innovaphone.ui1.PopupStyles("popup-background", "popup-header", "popup-main", "popup-closer")];
        var h = [20];

        var _popup = new innovaphone.ui1.Popup("position: absolute; display: inline-flex; left:50px; top:50px; align-content: center; justify-content: center; flex-direction: row; flex-wrap: wrap; width:" + width + "px; height:" + height + "px;", styles[0], h[0]);
        _popup.header.addText(header);
        _popup.content.addHTML(content);

        // if (popupOpen == false) {
        //     }    
        //     popup = _popup;
        //     popupOpen = true;
    }
    function constructor() {
        that.clear();

         // col direita
         var colDireita = that.add(new innovaphone.ui1.Div(null, null, "colunadireita"));
         colDireita.setAttribute("id","coldireita")
        
         //Titulo
         colDireita.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("labelTituloAdmin")));

        // col Esquerda
        var colEsquerda = that.add(new innovaphone.ui1.Div(null, null, "colunaesquerda"));
        colEsquerda.setAttribute("id", "colesquerda");

        // Header
        var divHeader = colEsquerda.add(new innovaphone.ui1.Div("border-bottom: 1px solid #4b545c; height: 10%; display: flex; align-items: center; padding: 0 10px;", null, "header-user"));
        var imglogo = divHeader.add(new innovaphone.ui1.Node("img", "max-height: 33px; opacity: 0.8;", null));
        imglogo.setAttribute("src", "logo-wecom.png");
        divHeader.add(new innovaphone.ui1.Div("font-size: 16px; color:white; margin-left: 10px;", appdn));

        // User
        var divUser = colEsquerda.add(new innovaphone.ui1.Div("height: 10%; display: flex; align-items: center; border-bottom: 1px solid #4b545c; padding: 0 10px;", null, "user-info"));
        var imguser = divUser.add(new innovaphone.ui1.Node("img", "max-height: 33px; border-radius: 50%;", null));
        imguser.setAttribute("src", UIuserPicture);
        var username = divUser.add(new innovaphone.ui1.Node("span", "font-size: 14px; color:white; margin-left: 10px;", UIuser));
        username.setAttribute("id", "user");

        // Administração
        var adminSection = colEsquerda.add(new innovaphone.ui1.Div("flex: 1; overflow-y: auto; padding: 10px;", null, "menu-section"));
        adminSection.add(new innovaphone.ui1.Node("h2", null, texts.text("labelAdmin")));

        function createMenuItem(text, id) {
            var li = adminSection.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"));
            li.setAttribute("id", id);
            li.add(new innovaphone.ui1.Node("a", null, text));
            
        }

        // Itens do menu
        createMenuItem(texts.text("labelCfgGeral"), "CfgGeral");
        createMenuItem(texts.text("labelCfgSchedules"), "CfgSchedules");
        createMenuItem(texts.text("labelCfgAvailability"), "CfgAvailability");
        createMenuItem(texts.text("labelCfgHelp"), "CfgHelp");

        // Footer logo
        var divFooter = colEsquerda.add(new innovaphone.ui1.Div("height: 10%; display: flex; justify-content: center; align-items: center; padding: 10px;", null, "footer-logo"));
        var imgconfig = divFooter.add(new innovaphone.ui1.Node("img", "width: 80%; opacity: 0.9;", null));
        imgconfig.setAttribute("src", "logoTransp.png");


        var a = document.getElementById("CfgGeral");
        a.addEventListener("click", function () { 
            ChangeView("CfgGeral", colDireita)
            if (window.matchMedia("(max-width: 500px)").matches) {
                openColDireita()
                console.log("Media Query 500px");
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
    function oldmakeDivSchedules(t) {
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
                var myapps_time_start = ajustarHora(b.time_start, clientTimeZone);
                row.push(myapps_time_start);
                var arrayDate = b.time_end.split("T");
                var day = arrayDate[0];
                var time = arrayDate[1];
                var myapps_time_end = ajustarHora(b.time_end, clientTimeZone);
                row.push(myapps_time_end);
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
                    var myapps_time_start = ajustarHora(b.time_start, clientTimeZone);
                    row.push(myapps_time_start);
                    var arrayDate = b.time_end.split("T");
                    var day = arrayDate[0];
                    var time = arrayDate[1];
                    var myapps_time_end = ajustarHora(b.time_end, clientTimeZone);
                    row.push(myapps_time_end);
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
    // Refatorado com Tailwind e JavaScript puro
    function makeDivSchedules(t) {
        t.clear();

        var today = getDateNow();
        var list_schedules = [];
        var container = document.getElementById("coldireita");
        if (!container) return;

        var imgMenu = document.createElement("img");
        imgMenu.setAttribute("src", "menu-icon.png");
        imgMenu.setAttribute("id", "imgmenu");
        imgMenu.className = "imgMenu";
        imgMenu.addEventListener("click", openMenu);
        document.getElementById("coldireita").appendChild(imgMenu);

        var wrapper = document.createElement("div");
        wrapper.className = "max-w-6xl mx-auto mt-[50px] p-[10px] space-y-4";

        // Título
        var title = document.createElement("h1");
        title.className = "text-xl font-bold mb-4";
        title.textContent = texts.text("labelTituloSchedules");
        wrapper.appendChild(title);

        // Botões superiores
        var btnRow = document.createElement("div");
        btnRow.className = "flex gap-4 mb-4";

        var btnDelete = document.createElement("button");
        btnDelete.className = "bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded";
        btnDelete.textContent = texts.text("btnDel");
        btnDelete.addEventListener("click", function () {
            const selectedRows = document.querySelectorAll("input.schedule-check:checked");
            selectedRows.forEach(function (input) {
                var id = input.dataset.id;
                app.send({ api: "user", mt: "DelSchedulesMessage", id: parseInt(id) });
            });
        });
        btnRow.appendChild(btnDelete);

        var btnNext = document.createElement("button");
        btnNext.className = "bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded";
        btnNext.textContent = texts.text("btnNext");
        btnNext.addEventListener("click", function () {
            renderFilteredRows(true);
        });
        btnRow.appendChild(btnNext);

        var btnAll = document.createElement("button");
        btnAll.className = "bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded";
        btnAll.textContent = texts.text("btnAll");
        btnAll.addEventListener("click", function () {
            renderFilteredRows(false);
        });
        btnRow.appendChild(btnAll);

        wrapper.appendChild(btnRow);

        // Tabela
        var table = document.createElement("table");
        table.className = "min-w-full bg-white border rounded shadow-sm text-sm";

        var thead = document.createElement("thead");
        thead.className = "bg-gray-200";
        thead.innerHTML = `
        <tr>
            <th class="px-4 py-2">#</th>
            <th class="px-4 py-2">${texts.text("cabecalhoSchedules1")}</th>
            <th class="px-4 py-2">${texts.text("cabecalhoSchedules2")}</th>
            <th class="px-4 py-2">${texts.text("cabecalhoSchedules3")}</th>
            <th class="px-4 py-2">${texts.text("cabecalhoSchedules4")}</th>
            <th class="px-4 py-2">${texts.text("cabecalhoSchedules5")}</th>
        </tr>`;
        table.appendChild(thead);

        var tbody = document.createElement("tbody");
        tbody.id = "tbody-schedules";
        table.appendChild(tbody);
        wrapper.appendChild(table);

        container.appendChild(wrapper);

        function renderFilteredRows(onlyFuture) {
            tbody.innerHTML = "";
            list_schedules.forEach(function (b) {
                if (!onlyFuture || today < b.time_start) {
                    var tr = document.createElement("tr");
                    tr.className = "border-b hover:bg-gray-50";
                    var myapps_time_start = ajustarHora(b.time_start, clientTimeZone);
                    var myapps_time_end = ajustarHora(b.time_end, clientTimeZone);

                    tr.innerHTML = `
                    <td class='px-4 py-2 text-blue-700'><input type="checkbox" class="schedule-check" data-id="${b.id}" /></td>
                    <td class='px-4 py-2 text-blue-700'>${b.name}</td>
                    <td class='px-4 py-2 text-blue-700'>${b.email}</td>
                    <td class='px-4 py-2 text-blue-700'>${myapps_time_start}</td>
                    <td class='px-4 py-2 text-blue-700'>${myapps_time_end}</td>
                    <td class='px-4 py-2'>
                        <button class="text-blue-700 hover:underline" onclick="window.open('${b.conf_link}', '_blank')">${texts.text("btnLink")}</button>
                    </td>
                `;

                    tbody.appendChild(tr);
                }
            });
        }

        app.sendSrc({ api: "user", mt: "SelectSchedulesMessage", sip: UIsip, src: "load" }, function (obj) {
            list_schedules = JSON.parse(obj.result);
            renderFilteredRows(true);
        });
    }
    function makeDivAvailabilities(t) {
        t.clear();

        var imgMenu = t.add(new innovaphone.ui1.Node("img",null,null,"imgMenu"));
        imgMenu.setAttribute("src","menu-icon.png");
        imgMenu.setAttribute("id","imgmenu");
        document.getElementById("imgmenu").addEventListener("click",openMenu);

        //Botoes Tabela de Disponibilidades
        t.add(new innovaphone.ui1.Div("position:absolute; left:68%; width:15%; top:3%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnAdd").addEvent("click", function () {
            //makeDivAddAvail(t);
            makeDivAddWeekAvailability(t);
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
    function oldmakeDivAddWeekAvailability(colDireita) {
        colDireita.clear();

        var imgMenu = colDireita.add(new innovaphone.ui1.Node("img", null, null, "imgMenu"));
        imgMenu.setAttribute("src", "menu-icon.png");
        imgMenu.setAttribute("id", "imgmenu");
        document.getElementById("imgmenu").addEventListener("click", openMenu);
        //colDireita.add(new innovaphone.ui1.Div(null, texts.text("labelTituloAvail"), "TitleAvailTable"));
        
        const clock_div = colDireita.add(new innovaphone.ui1.Div("margin: 8px 0; display: flex; flex-direction: column; align-items: center;", null, null));
        clock_div.add(new innovaphone.ui1.Node("h2", null, texts.text("labelTituloAvail"), "TitleAvailTable"));
        const diasSemana = [
            { nome: "Segunda-feira", id: 1 },
            { nome: "Terça-feira", id: 2 },
            { nome: "Quarta-feira", id: 3 },
            { nome: "Quinta-feira", id: 4 },
            { nome: "Sexta-feira", id: 5 },
            { nome: "Sábado", id: 6 },
            { nome: "Domingo", id: 0 }
        ];

        const inputs = {}; // armazenar refs de inputs por dia

        diasSemana.forEach((dia, idx) => {
            const row = clock_div.add(new innovaphone.ui1.Div("margin: 8px 0; display: flex; align-items: center;", null, "row-dia-" + dia.id));
            const checkbox = row.add(new innovaphone.ui1.Input("margin-right: 8px;", null, null, null, "checkbox"));
            checkbox.setAttribute("id", `check-${dia.id}`);
            const label = row.add(new innovaphone.ui1.Div("width: 110px;", dia.nome));

            const hStart = row.add(new innovaphone.ui1.Input("width: 40px; margin:0 4px;", null, null, null, "number"));
            hStart.setAttribute("placeholder", "h Ini");
            const mStart = row.add(new innovaphone.ui1.Input("width: 40px; margin:0 4px;", null, null, null, "number"));
            mStart.setAttribute("placeholder", "m Ini");
            const hEnd = row.add(new innovaphone.ui1.Input("width: 40px; margin:0 4px;", null, null, null, "number"));
            hEnd.setAttribute("placeholder", "h Fim");
            const mEnd = row.add(new innovaphone.ui1.Input("width: 40px; margin:0 4px;", null, null, null, "number"));
            mEnd.setAttribute("placeholder", "m Fim");

            inputs[dia.id] = {
                checkbox: checkbox,
                hStart: hStart,
                mStart: mStart,
                hEnd: hEnd,
                mEnd: mEnd
            };
        });

        // Data início/fim global
        clock_div.add(new innovaphone.ui1.Div("margin-top: 10px;", "Data de Início (opcional)"));
        const dataInicio = clock_div.add(new innovaphone.ui1.Input("margin-bottom: 10px;", null, null, null, "date"));
        dataInicio.setAttribute("id", "dataInicio");

        clock_div.add(new innovaphone.ui1.Div(null, "Data de Fim (opcional)"));
        const dataFim = clock_div.add(new innovaphone.ui1.Input("margin-bottom: 10px;", null, null, null, "date"));
        dataFim.setAttribute("id", "dataFim");

        // Botões
        clock_div.add(new innovaphone.ui1.Div("position:absolute; left:42.5%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn"))
            .addTranslation(texts, "btnOk")
            .addEvent("click", function () {
                const date_start = dataInicio.getValue() || "";
                const date_end = dataFim.getValue() || "";

                let envioFeito = false;

                diasSemana.forEach((dia) => {
                    const ref = inputs[dia.id];
                    if (ref.checkbox.getValue()) {
                        const horaIni = ref.hStart.getValue();
                        const minIni = ref.mStart.getValue();
                        const horaFim = ref.hEnd.getValue();
                        const minFim = ref.mEnd.getValue();

                        if (horaIni.length == 0 || !minIni.length == 0 || !horaFim.length == 0 || !minFim.length == 0) {
                            makePopup("Aviso", "Preencha todos os horários para o dia: " + dia.nome, 500, 200);
                            return;
                        }

                        envioFeito = true;

                        app.send({
                            api: "user",
                            mt: "AddDayAvailability",
                            day: dia.id,
                            hour_start: convertHourToUtc(horaIni),
                            minute_start: minIni,
                            hour_end: convertHourToUtc(horaFim),
                            minute_end: minFim,
                            date_start: date_start,
                            date_end: date_end
                        });
                    }
                });

                if (!envioFeito) {
                    makePopup("Aviso", "Selecione ao menos um dia para salvar disponibilidade.", 500, 200);
                    return;
                }

                waitConnection(colDireita);
            });

        //clock_div.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn-del"))
        //    .addTranslation(texts, "btnCancel")
        //    .addEvent("click", function () {
        //        makeDivAddWeekAvailability(colDireita);
        //    });

        if (list_day_availabilities && Array.isArray(list_day_availabilities)) {
            list_day_availabilities.forEach((item) => {
                const ref = inputs[item.day];
                if (ref) {
                    ref.checkbox.setValue(true);
                    ref.hStart.setValue(convertHourFromUtc(item.hour_start));
                    ref.mStart.setValue(item.minute_start);
                    ref.hEnd.setValue(convertHourFromUtc(item.hour_end));
                    ref.mEnd.setValue(item.minute_end);

                    if (item.date_start) document.getElementById("dataInicio").value = item.date_start;
                    if (item.date_end) document.getElementById("dataFim").value = item.date_end;
                }
            });
        }
    }
    function makeDivAddWeekAvailability(colDireita) {
        colDireita.clear();

        var container = document.getElementById("coldireita");
        if (!container) return;

        // Botão menu
        var imgMenu = document.createElement("img");
        imgMenu.setAttribute("src", "menu-icon.png");
        imgMenu.setAttribute("id", "imgmenu");
        imgMenu.className = "imgMenu";
        imgMenu.addEventListener("click", openMenu);
        document.getElementById("coldireita").appendChild(imgMenu);

        const wrapper = document.createElement("div");
        wrapper.className = "max-w-4xl mx-auto mt-[50px] p-[10px] flex flex-col gap-6";

        const title = document.createElement("h2");
        title.textContent = texts.text("labelTituloAvail");
        title.className = "text-xl font-bold";
        wrapper.appendChild(title);

        const diasSemana = [
            { nome: "Segunda-feira", id: 1 },
            { nome: "Terça-feira", id: 2 },
            { nome: "Quarta-feira", id: 3 },
            { nome: "Quinta-feira", id: 4 },
            { nome: "Sexta-feira", id: 5 },
            { nome: "Sábado", id: 6 },
            { nome: "Domingo", id: 0 }
        ];

        const inputs = {};

        var days = document.createElement("div");
        days.className = "inline-flex flex-row flex-wrap max-w-6xl mx-auto space-y-2";

        diasSemana.forEach(dia => {
            const row = document.createElement("div");
            row.className = "flex items-center gap-2";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "w-[20px] h-[20px]";
            checkbox.id = `check-${dia.id}`;

            const label = document.createElement("label");
            label.textContent = dia.nome;
            label.className = "w-[120px] text-sm font-medium";

            const hStart = createTimeInput("h Ini");
            const mStart = createTimeInput("m Ini");
            const hEnd = createTimeInput("h Fim");
            const mEnd = createTimeInput("m Fim");

            row.append(checkbox, label, hStart, mStart, hEnd, mEnd);
            days.appendChild(row);

            inputs[dia.id] = { checkbox, hStart, mStart, hEnd, mEnd };
        });
        wrapper.appendChild(days);
        var dates = document.createElement("div");
        dates.className = "flex gap-1";

        // Data
        const dateInicio = createDateInput("dataInicio", "Data de Início (opcional)");
        const dateFim = createDateInput("dataFim", "Data de Fim (opcional)");
        dates.append(dateInicio.wrapper, dateFim.wrapper);
        wrapper.appendChild(dates);
        // Botão salvar
        const btnSalvar = document.createElement("button");
        btnSalvar.className = "self-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded";
        btnSalvar.textContent = texts.text("btnOk");
        btnSalvar.addEventListener("click", function () {
            const date_start = dateInicio.input.value || "";
            const date_end = dateFim.input.value || "";

            let envioFeito = false;

            diasSemana.forEach((dia) => {
                const ref = inputs[dia.id];
                if (ref.checkbox.checked) {
                    const horaIni = ref.hStart.value;
                    const minIni = ref.mStart.value;
                    const horaFim = ref.hEnd.value;
                    const minFim = ref.mEnd.value;

                    if (!horaIni || !minIni || !horaFim || !minFim) {
                        makePopup("Aviso", "Preencha todos os horários para o dia: " + dia.nome, 500, 200);
                        return;
                    }

                    envioFeito = true;
                    app.send({
                        api: "user",
                        mt: "AddDayAvailability",
                        day: dia.id,
                        hour_start: convertHourToUtc(horaIni),
                        minute_start: minIni,
                        hour_end: convertHourToUtc(horaFim),
                        minute_end: minFim,
                        date_start: date_start,
                        date_end: date_end
                    });
                }
            });

            if (!envioFeito) {
                makePopup("Aviso", "Selecione ao menos um dia para salvar disponibilidade.", 500, 200);
                return;
            }

            waitConnection(colDireita);
        });
        wrapper.appendChild(btnSalvar);
        container.appendChild(wrapper);

        // preencher valores caso existam
        if (list_day_availabilities && Array.isArray(list_day_availabilities)) {
            list_day_availabilities.forEach(item => {
                const ref = inputs[item.day];
                if (ref) {
                    ref.checkbox.checked = true;
                    ref.hStart.value = convertHourFromUtc(item.hour_start);
                    ref.mStart.value = item.minute_start;
                    ref.hEnd.value = convertHourFromUtc(item.hour_end);
                    ref.mEnd.value = item.minute_end;

                    if (item.date_start) dateInicio.input.value = item.date_start;
                    if (item.date_end) dateFim.input.value = item.date_end;
                }
            });
        }

        // helpers internos
        function createTimeInput(placeholder) {
            const input = document.createElement("input");
            input.type = "number";
            input.placeholder = placeholder;
            input.className = "w-[70px] px-2 py-1 border rounded text-sm";
            return input;
        }

        function createDateInput(id, labelText) {
            const wrapper = document.createElement("div");
            wrapper.className = "flex flex-col";

            const label = document.createElement("label");
            label.textContent = labelText;
            label.className = "text-sm font-medium";

            const input = document.createElement("input");
            input.type = "date";
            input.id = id;
            input.className = "border rounded p-2";

            wrapper.append(label, input);
            return { wrapper, input };
        }
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
            if(time_start > time_end || time_start < getDateNow() ){
                makePopup(texts.text("labelWarning"),texts.text("labelNoValidDate"), 500, 200);
            }else{
            app.send({ api: "user", mt: "AddAvailabilityMessage", time_start: time_start, time_end: time_end });
            waitConnection(colDireita);
            }

           
           
        });
        colDireita.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn-del")).addTranslation(texts, "btnCancel").addEvent("click", function () {
            //makeDivAvailabilities(colDireita);
        });
    }
    function waitConnection(t) {
        t.clear();
        var bodywait = new innovaphone.ui1.Div("height: 100%; width: 100%; display: inline-flex; position: absolute;justify-content: center; background-color:rgba(100,100,100,0.5)", null, "bodywaitconnection")
        bodywait.addHTML('<svg class="pl" viewBox="0 0 128 128" width="128px" height="128px" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="hsl(193,90%,55%)" /><stop offset="100%" stop-color="hsl(223,90%,55%)" /></linearGradient></defs>	<circle class="pl__ring" r="56" cx="64" cy="64" fill="none" stroke="hsla(0,10%,10%,0.1)" stroke-width="16" stroke-linecap="round" />	<path class="pl__worm" d="M92,15.492S78.194,4.967,66.743,16.887c-17.231,17.938-28.26,96.974-28.26,96.974L119.85,59.892l-99-31.588,57.528,89.832L97.8,19.349,13.636,88.51l89.012,16.015S81.908,38.332,66.1,22.337C50.114,6.156,36,15.492,36,15.492a56,56,0,1,0,56,0Z" fill="none" stroke="url(#pl-grad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="44 1111" stroke-dashoffset="10" /></svg >');
        t.add(bodywait);
    }
    function oldmakeDivGeral(t){
        t.clear();
        var email_contato = null;
        var text_invite = null;
        var email_title = null;
        var title_conference = null;
        try {
            var email_contato = list_configs[0].email_contato;
            var text_invite = list_configs[0].text_invite;
            var email_title = list_configs[0].email_title;
            var title_conference = list_configs[0].title_conference;
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

        //var divURLConference = t.add(new innovaphone.ui1.Div(null, texts.text("labelURLContato"),"DivGeralUrlConference"));
        //var InputURLConference = t.add(new innovaphone.ui1.Input(null, url_conference, "Insira aqui a URL do evento", null, "url","DivGeralIptUrlConf").setAttribute("id", "InputURLConference"));

        ////Sala de Conf dinâmica
        //var divObjConference = t.add(new innovaphone.ui1.Div(null, texts.text("labelObjConf"), "DivGeralObjConference"));
        //var InputObjConference = t.add(new innovaphone.ui1.Input(null, obj_conference, "Insira aqui o nome do Objeto de Conferência que possui as Salas", null, "text", "DivGeralIptObjConf").setAttribute("id", "InputObjConference"));
        //t.add(new innovaphone.ui1.Div("position:absolute; left:82%; width:15%; top:54%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnFind").addEvent("click", function () {

        //    var obj_conference = document.getElementById("InputObjConference").value;
        //    app.send({ api: "user", mt: "FindObjConfMessage", obj_conference: obj_conference });
        //    //waitConnection(t);
        //});
        //var divConfRoom = t.add(new innovaphone.ui1.Div(null,texts.text("labelConfRoom"),"DivConfRoom"));
        //var selectConfNumber = t.add(new innovaphone.ui1.Node("select", null, null, "SelectConfNumber").setAttribute("id", "selectConfNumber"));
        //selectConfNumber.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "", null).setAttribute("id", ""));
        //list_rooms.forEach(function (r) {
        //    selectConfNumber.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", r.dn, null).setAttribute("id", r["room-number"]));
        //})
        //try {
        //    if (list_configs[0].number_conference) {
        //        var cn = list_rooms.filter(function (r) { return r["room-number"] === room })[0].dn;
        //        var select = document.getElementById('selectConfNumber');
        //        select.remove(0);
        //        select.value = cn;
        //    }
        //} catch (e) {

        //}
        

        //t.add(new innovaphone.ui1.Div(null, texts.text("labelDivGeralChannelsReserved"), "DivGeralChannelsReserved"));
        //t.add(new innovaphone.ui1.Input(null, reserved_conference, "Insira aqui o número de canais reservados", null, "number", "DivGeralIptChannelsReserved").setAttribute("id", "InputChannelsReserved"));



        var divTitleConference = t.add(new innovaphone.ui1.Div(null, texts.text("labelTitleConference"),"DivGeralTitleConf"));
        var InputTitleConference = t.add(new innovaphone.ui1.Input(null, title_conference,"Insira aqui o título do evento", null, "url","DivGeralIptTitleConf").setAttribute("id", "InputTitleConference"));

        var divTextInvite = t.add(new innovaphone.ui1.Div(null, texts.text("labelTxtInvite"), "DivGeralTextInvite"));
        var InputTextInvite = t.add(new innovaphone.ui1.Node("textarea",null, text_invite,"DivGeralIptTextInvite").setAttribute("id", "InputTxtInvite"));
        InputTextInvite.setAttribute("placeholder", "Insira aqui o texto do e-mail de convite")
        
        
        // openMenu();
        // buttons
        t.add(new innovaphone.ui1.Div("position:absolute; left:82%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnOk").addEvent("click", function () {
            
            var email_contato = document.getElementById("InputEmailContato").value;
            //var url_conference = document.getElementById("InputURLConference").value;
            var text_invite = document.getElementById("InputTxtInvite").value;
            var email_title = document.getElementById("InputTitleEmail").value;
            var title_conference = document.getElementById("InputTitleConference").value;
            //var obj_conference = document.getElementById("InputObjConference").value;
            //var reserved_conference = document.getElementById("InputChannelsReserved").value;
            //var room_number = document.getElementById("selectConfNumber");
            //var selectedroom = room_number.options[room_number.selectedIndex];
            //var number_conference = selectedroom.id;

            app.send({ api: "user", mt: "UpdateConfigMessage", email: email_contato, text_invite: text_invite, email_title: email_title, title_conference: title_conference});
            waitConnection(t);
        });

    }
    // Função refatorada para criar a interface de configuração geral usando JS puro e Tailwind
    function makeDivGeral(colDireita) {
        colDireita.clear();

        var email_contato = null;
        var text_invite = null;
        var email_title = null;
        var title_conference = null;
        try {
            email_contato = list_configs[0].email_contato;
            text_invite = list_configs[0].text_invite;
            email_title = list_configs[0].email_title;
            title_conference = list_configs[0].title_conference;
        } catch (e) { }

        // mobile
        var imgMenu = colDireita.add(new innovaphone.ui1.Node("img", null, null, "imgMenu"));
        imgMenu.setAttribute("src", "menu-icon.png");
        imgMenu.setAttribute("id", "imgmenu");
        document.getElementById("imgmenu").addEventListener("click", openMenu);


        var wrapper = document.createElement("div");
        wrapper.className = "max-w-6xl mx-auto mt-[50px] p-[10px] space-y-4";

        var title = document.createElement("h1");
        title.className = "text-xl font-bold mb-4";
        title.textContent = texts.text("labelTituloAdmin");
        wrapper.appendChild(title);

        function addField(labelText, id, type, defaultValue) {
            var div = document.createElement("div");
            div.className = "flex flex-col space-y-1";

            var label = document.createElement("label");
            label.setAttribute("for", id);
            label.className = "block text-sm font-medium text-muted-foreground";
            label.textContent = labelText;

            var input = document.createElement("input");
            input.className = "w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
            input.type = type;
            input.value = defaultValue || "";
            input.id = id;

            div.appendChild(label);
            div.appendChild(input);
            wrapper.appendChild(div);
        }
        addField(texts.text("labelEmailContato"), "InputEmailContato", "email", email_contato);
        addField(texts.text("labelTitleEmail"), "InputTitleEmail", "email", email_title);
        addField(texts.text("labelTitleConference"), "InputTitleConference", "email", title_conference);

        function addFieldTextArea(labelText, id, defaultValue) {
            var div = document.createElement("div");
            div.className = "flex flex-col space-y-1";

            var label = document.createElement("label");
            label.setAttribute("for", id);
            label.className = "block text-sm font-medium text-muted-foreground";
            label.textContent = labelText;

            var input = document.createElement("textarea");
            input.className = "w-full h-100 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
            input.value = defaultValue || "";
            input.id = id;

            div.appendChild(label);
            div.appendChild(input);
            wrapper.appendChild(div);
        }
        addFieldTextArea(texts.text("labelTxtInvite"), "InputTxtInvite", text_invite);

        // Botão OK
        var btnOk = document.createElement("button");
        btnOk.className = "bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded text-sm";
        btnOk.textContent = texts.text("btnOk");
        btnOk.addEventListener("click", function () {
            var email = document.getElementById("InputEmailContato").value;
            var titleEmail = document.getElementById("InputTitleEmail").value;
            var invite = document.getElementById("InputTxtInvite").value;
            var titleConf = document.getElementById("InputTitleConference").value;

            app.send({
                api: "user",
                mt: "UpdateConfigMessage",
                email: email,
                text_invite: invite,
                email_title: titleEmail,
                title_conference: titleConf
            });

            waitConnection(colDireita);
        });
        wrapper.appendChild(btnOk);

        document.getElementById("coldireita").appendChild(wrapper);
    }
    function oldmakeDivHelp(t){
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
    function makeDivHelp(t) {
        t.clear();

        const container = document.getElementById("coldireita");
        if (!container) return;

        // mobile
        var imgMenu = t.add(new innovaphone.ui1.Node("img", null, null, "imgMenu"));
        imgMenu.setAttribute("src", "menu-icon.png");
        imgMenu.setAttribute("id", "imgmenu");
        document.getElementById("imgmenu").addEventListener("click", openMenu);


        const wrapper = document.createElement("div");
        wrapper.className = "max-w-6xl mx-auto mt-[50px] p-[10px] space-y-4";

        const title = document.createElement("h1");
        title.className = "text-xl font-bold mb-4";
        title.textContent = texts.text("labelcalendarURL");
        wrapper.appendChild(title);

        const divInputUrl = document.createElement("div");
        divInputUrl.className = "flex items-center gap-2";

        const iptUrl = document.createElement("input");
        iptUrl.className = "w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
        iptUrl.value = appUrl;
        iptUrl.readOnly = true;
        iptUrl.id = "iptUrl";
        divInputUrl.appendChild(iptUrl);

        const btnCopy = document.createElement("button");
        btnCopy.id = "btnCopy";
        btnCopy.textContent = texts.text("labelCopy");
        btnCopy.className = "bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm";
        divInputUrl.appendChild(btnCopy);

        wrapper.appendChild(divInputUrl);

        const popup = document.createElement("div");
        popup.id = "copyPopUp";
        popup.className = "CopyPopUp";
        popup.textContent = texts.text("Copied");
        wrapper.appendChild(popup);

        const help = document.createElement("div");
        help.className = "max-w-6xl mx-auto mt-[50px] p-[10px] space-y-2";


        const infoP = document.createElement("p");
        infoP.className = "text-sm";
        infoP.textContent = texts.text("infoUrl");
        help.appendChild(infoP);

        const meaningTitle = document.createElement("h2");
        meaningTitle.className = "text-md font-semibold mt-4";
        meaningTitle.textContent = texts.text("meaningURL");
        help.appendChild(meaningTitle);

        const ul = document.createElement("ul");
        ul.className = "list-disc pl-5 text-sm";

        const liId = document.createElement("li");
        liId.textContent = "id=" + UIsip;
        ul.appendChild(liId);

        const br = document.createElement("br");
        ul.appendChild(br);

        const h3IdInfo = document.createElement("h3");
        h3IdInfo.className = "font-semibold mt-2";
        h3IdInfo.textContent = texts.text("idInfo");
        ul.appendChild(h3IdInfo);

        const pNota = document.createElement("p");
        pNota.textContent = texts.text("nota");
        ul.appendChild(pNota);

        const pNotaId = document.createElement("p");
        pNotaId.textContent = texts.text("notaId");
        ul.appendChild(pNotaId);

        help.appendChild(ul);
        wrapper.appendChild(help);

        container.appendChild(wrapper);

        // Eventos
        document.getElementById("btnCopy").addEventListener("click", copyText);
        document.getElementById("btnCopy").addEventListener("click", ShowCopyPopUp);
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
    function convertHourToUtc(hour) {
        var offset = parseInt(clientTimeZone.split(":")[0]); // exemplo: "-03" vira -3
        return (parseInt(hour) - offset + 24) % 24; // garante valor entre 0-23
    }

    function convertHourFromUtc(hour) {
        var offset = parseInt(clientTimeZone.split(":")[0]);
        return (parseInt(hour) + offset + 24) % 24;
    }
    function ajustarHora(dataString, diferenca) {

        // Converte a string de data para um objeto Date
        var data = new Date(dataString);

        // Extrai o valor da diferença de horas da string
        var diferencaHoras = parseInt(diferenca.split(":")[0]);

        // Verifica se a diferença é positiva ou negativa e adiciona ou subtrai horas
        if (diferencaHoras >= 0) {
            data.setHours(data.getHours() + diferencaHoras);
        } else {
            data.setHours(data.getHours() - Math.abs(diferencaHoras));
        }

        // Formata a nova data para o formato desejado (yyyy-mm-ddThh:mm)
        var ano = data.getFullYear();
        var mes = padZero(data.getMonth() + 1); // Adiciona 1 porque os meses são indexados a partir de 0
        var dia = padZero(data.getDate());
        var horas = padZero(data.getHours());
        var minutos = padZero(data.getMinutes());

        var novaDataString = ano + "-" + mes + "-" + dia + " " + horas + ":" + minutos;

        // Formata a nova data para o formato desejado (yyyy-mm-ddThh:mm) EM UTC
        //var novaDataString = new Date(dataString).toISOString().slice(0, 16);

        return novaDataString;
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
