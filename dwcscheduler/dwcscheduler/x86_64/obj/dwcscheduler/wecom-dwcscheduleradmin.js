
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />
/// <reference path="../../web1/ui1.switch/innovaphone.ui1.switch.js" />
/// <reference path="../../web1/ui1.popup/innovaphone.ui1.popup.js" />
/// <reference path="../../web1/ui1.listview/innovaphone.ui1.listview.js" />


var Wecom = Wecom || {};
Wecom.dwcschedulerAdmin = Wecom.dwcschedulerAdmin || function (start, args) {
    this.createNode("body");
    var appdn = start.title;
    var that = this;
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

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;
    app.onclosed = waitConnection(that);
    app.onerror = waitConnection(that);
    var _colDireita;
    var UIuserPicture;
    var UIuser;
    //smtp
    var from = null;
    var fromName = null;
    var server = null;
    var username = null;
    var password = null;
    var googleApiKey = null;
    var sendLocation = false;
    //license
    var licenseToken = null;
    var licenseFile = null;
    var licenseActive = null;
    var licenseInstallDate = null;
    var licenseUsed = 0;
    var list_rooms = [];
    var list_users = [];
    var key_conference;
    var obj_conference;
    var url_conference;
    var reserved_conference;
    var room = null;
    var clientTimeZone = "-03:00";
    var fragments = [];

    // === Estado de visualização e cache dos dados ===
    var availabilityViewMode = "table"; // "table" | "summary"
    var availabilityDataCache = [];
    // util: garante que exista um container para o resumo (fica oculto por padrão)
    function ensureAvailabilitySummaryContainer(wrapper) {
        var sum = document.getElementById("availability-view-summary");
        if (!sum) {
            sum = document.createElement("div");
            sum.id = "availability-view-summary";
            sum.style.display = "none";
            sum.style.marginTop = "16px";
            wrapper.appendChild(sum);
        }
        return sum;
    }

    const diasSemana = [
        { nome: "Segunda-feira", id: 1 },
        { nome: "Terça-feira", id: 2 },
        { nome: "Quarta-feira", id: 3 },
        { nome: "Quinta-feira", id: 4 },
        { nome: "Sexta-feira", id: 5 },
        { nome: "Sábado", id: 6 },
        { nome: "Domingo", id: 0 }
    ];

    function app_connected(domain, user, dn, appdomain) {
        var clientTimeZoneOffset = new Date().getTimezoneOffset();
        clientTimeZone = formatTimezoneOffset(clientTimeZoneOffset);
        //avatar
        avatar = new innovaphone.Avatar(start, user, domain);
        UIuserPicture = avatar.url(user, 80, dn);
        UIuser = dn;
        constructor();
        app.send({ api: "admin", mt: "AdminMessage" });
    }

    function app_message(obj) {
        if (obj.api == "admin" && obj.mt == "AdminMessageResult") {
            try {
                from = obj.from;
                fromName = obj.fromName;
                server = obj.server;
                username = obj.username;
                password = obj.password;
                googleApiKey = obj.googleApiKey;
                sendLocation = obj.sendLocation;
            } catch (e) {
                console.log("ERRO AdminMessageResult:"+e)
            }
            
            makeDivGeral(_colDireita);
        }
        if (obj.api == "admin" && obj.mt == "UpdateConfigConferenceObjMessageSuccess") {
            app.send({ api: "admin", mt: "ConferenceConfigMessage" });
            makePopup(texts.text("labelWarning"), texts.text("popupUpdateOk"), 500, 200);
        }
        
        if (obj.api == "admin" && obj.mt == "ConferenceConfigMessageResult") {
            try {
                key_conference = obj.key_conference;
                obj_conference = obj.obj_conference;
                url_conference = obj.url_conference;
                reserved_conference = obj.reserved_conference;
                room = obj.number_conference;

                

            } catch (e) {
                console.log("ERRO AdminMessageResult:" + e)
            }
            makeDivConferenceServer(_colDireita);
            app.send({ api: "admin", mt: "FindObjConfMessage", obj_conference: obj.obj_conference });
        }
        if (obj.api == "admin" && obj.mt == "TableUsersResult") {
            console.log("TableUsersResult:result=" + obj.result);
            list_users = [];
            list_users = JSON.parse(obj.result);
        }
        if (obj.api == "admin" && obj.mt == "UpdateConfigMessageErro") {
            makePopup(texts.text("labelWarning"), texts.text("popupUpdateNok"), 500, 200);
            
        }
        if (obj.api == "admin" && obj.mt == "UpdateConfigMessageSuccess") {
            //makeDivGeral(_colDireita);
            app.send({ api: "admin", mt: "AdminMessage" });
            makePopup(texts.text("labelWarning"), texts.text("popupUpdateOk"), 500, 200);
            
        }
        if (obj.api == "admin" && obj.mt == "UpdateConfigGoogleMessageSuccess") {
            makeDivGoogle(_colDireita);
            makePopup(texts.text("labelWarning"), texts.text("popupUpdateOk"), 500, 200);

        }
        if (obj.api == "admin" && obj.mt == "UpdateConfigLicenseMessageSuccess") {
            app.send({ api: "admin", mt: "ConfigLicense" });
            waitConnection(_colDireita);
            makePopup(texts.text("labelWarning"), texts.text("popupUpdateOk"), 500, 200);

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
            makeDivLicense(_colDireita);
        }
        if (obj.api == "admin" && obj.mt == "FindObjConfMessageResult") {
            console.log(obj);
            if (obj.found == true) {
                if (!obj.rooms) {
                    makePopup(texts.text("labelWarning"), texts.text("labelNoConfRoom"), 500, 200);
                    return;
                }
                if (!obj.key) {
                    makePopup(texts.text("labelWarning"), texts.text("labelNoConfKey"), 500, 200);
                    return;
                }
                list_rooms = obj.rooms;
                try {
                    if (list_rooms.length == 0) {
                        makePopup(texts.text("labelWarning"), texts.text("labelNoConfRoom"), 500, 200);
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
                makePopup(texts.text("labelWarning"), texts.text("labelWrongObjectConf"), 500, 200);
            }
        }
        if (obj.api == "admin" && obj.mt === "SelectFromReportsSuccess") {
            if (obj.src === "RptAvailability") {
                fragments.push(obj.result);
                if (obj.lastFragment) {
                    var fullJson = JSON.parse(fragments.join(""));
                    fragments = [];
                    renderTableAvailability(fullJson);
                    renderSummaryAvailability(fullJson);
                }
            }
            if (obj.src === "RptSchedules") {
                fragments.push(obj.result);
                if (obj.lastFragment) {
                    var fullJson = JSON.parse(fragments.join(""));
                    fragments = [];
                    renderTableSchedules(fullJson);
                    renderSummarySchedules(fullJson);
                }
            }
            if (obj.src === "RptCalls") {
                fragments.push(obj.result);
                if (obj.lastFragment) {
                    var fullJson = JSON.parse(fragments.join(""));
                    fragments = [];
                    renderTableCalls(fullJson);
                }
            }
        }
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
        //Título
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
        createMenuItem(texts.text("labelCfgConference"), "CfgConference");
        createMenuItem(texts.text("labelCfgLicense"), "CfgLicense");
        createMenuItem(texts.text("labelCfgAvailabilities"), "CfgAvailabilities");
        createMenuItem(texts.text("labelCfgSchedules"), "CfgSchedules");

        // Relatórios
        adminSection.add(new innovaphone.ui1.Node("h2", "margin-top: 20px;", texts.text("labelReports")));
        createMenuItem(texts.text("labelRptAgents"), "RptAgents");
        createMenuItem(texts.text("labelRptCalls"), "RptCalls");
        createMenuItem(texts.text("labelCfgSchedules"), "RptSchedules");

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
        //var a = document.getElementById("CfgGoogle");
        //a.addEventListener("click", function () { 
        //    ChangeView("CfgGoogle", colDireita) 
        //    if (window.matchMedia("(max-width: 500px)").matches) {
        //        openColDireita()
        //        console.log("Media Query 500px");
        //    }
        //    })
        var a = document.getElementById("CfgConference");
        a.addEventListener("click", function () {
            ChangeView("CfgConference", colDireita)
            if (window.matchMedia("(max-width: 500px)").matches) {
                openColDireita()
                console.log("Media Query 500px");
            }
        })

        var a = document.getElementById("CfgLicense");
        a.addEventListener("click", function () {
            ChangeView("CfgLicense", colDireita)
            if (window.matchMedia("(max-width: 500px)").matches) {
                openColDireita()
                console.log("Media Query 500px");
            }
        })

        var a = document.getElementById("CfgAvailabilities");
        a.addEventListener("click", function () {
            ChangeView("CfgAvailabilities", colDireita)
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
                console.log("Media Query 500px");
            }
        })

        var a = document.getElementById("RptAgents");
        a.addEventListener("click", function () {
            ChangeView("RptAgents", colDireita)
            if (window.matchMedia("(max-width: 500px)").matches) {
                openColDireita()
                console.log("Media Query 500px");
            }
        })
        var a = document.getElementById("RptCalls");
        a.addEventListener("click", function () {
            ChangeView("RptCalls", colDireita)
            if (window.matchMedia("(max-width: 500px)").matches) {
                openColDireita()
                console.log("Media Query 500px");
            }
        })
        var a = document.getElementById("RptSchedules");
        a.addEventListener("click", function () {
            ChangeView("RptSchedules", colDireita)
            if (window.matchMedia("(max-width: 500px)").matches) {
                openColDireita()
                console.log("Media Query 500px");
            }
        })


        _colDireita = colDireita;
    }
    function ChangeView(ex, colDireita) {

        if (ex == "CfgGeral") {
            makeDivGeral(colDireita);
        }
        if (ex == "CfgGoogle") {
            makeDivGoogle(colDireita);
        }
        if (ex == "CfgConference") {
            app.send({ api: "admin", mt: "ConferenceConfigMessage" });
            waitConnection(colDireita);
        }
        if (ex == "CfgLicense") {
            app.send({ api: "admin", mt: "ConfigLicense"});
            waitConnection(colDireita);
        }
        if (ex == "CfgAvailabilities") {
            makeDivAddWeekAvailability(colDireita);
        }
        if (ex == "CfgSchedules") {
            makeDivSchedules(colDireita);
        }
        if (ex == "RptAgents") {
            createAvailabilityReportUI(colDireita);
        }
        if (ex == "RptCalls") {
            createCallsReportUI(colDireita);
        }
        if (ex == "RptSchedules") {
            createSchedulesReportUI(colDireita);
        }
    }
    function waitConnection(t) {
        t.clear();
            var bodywait = new innovaphone.ui1.Div("height: 100%; width: 100%; display: inline-flex; position: absolute;justify-content: center; background-color:rgba(100,100,100,0.5)", null, "bodywaitconnection")
            bodywait.addHTML('<svg class="pl" viewBox="0 0 128 128" width="128px" height="128px" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="hsl(193,90%,55%)" /><stop offset="100%" stop-color="hsl(223,90%,55%)" /></linearGradient></defs>	<circle class="pl__ring" r="56" cx="64" cy="64" fill="none" stroke="hsla(0,10%,10%,0.1)" stroke-width="16" stroke-linecap="round" />	<path class="pl__worm" d="M92,15.492S78.194,4.967,66.743,16.887c-17.231,17.938-28.26,96.974-28.26,96.974L119.85,59.892l-99-31.588,57.528,89.832L97.8,19.349,13.636,88.51l89.012,16.015S81.908,38.332,66.1,22.337C50.114,6.156,36,15.492,36,15.492a56,56,0,1,0,56,0Z" fill="none" stroke="url(#pl-grad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="44 1111" stroke-dashoffset="10" /></svg >');
            t.add(bodywait);
    }
    function oldmakeDivConferenceServer(t) {
        t.clear();


        var imgMenu = t.add(new innovaphone.ui1.Node("img", null, null, "imgMenu"));
        imgMenu.setAttribute("src", "menu-icon.png");
        imgMenu.setAttribute("id", "imgmenu");
        document.getElementById("imgmenu").addEventListener("click", openMenu);

        t.add(new innovaphone.ui1.Div(null, texts.text("labelTituloConferenceObj"), "DivGeralTitle"));

        var divURLConference = t.add(new innovaphone.ui1.Div(null, texts.text("labelURLContato"), "DivGeralUrlConference"));
        var InputURLConference = t.add(new innovaphone.ui1.Input(null, url_conference, "Insira aqui a URL do evento", null, "url", "DivGeralIptUrlConf").setAttribute("id", "InputURLConference"));

        //Sala de Conf dinâmica
        var divObjConference = t.add(new innovaphone.ui1.Div(null, texts.text("labelObjConf"), "DivGeralObjConference"));
        var InputObjConference = t.add(new innovaphone.ui1.Input(null, obj_conference, "Insira aqui o nome do Objeto de Conferência que possui as Salas", null, "text", "DivGeralIptObjConf").setAttribute("id", "InputObjConference"));
        t.add(new innovaphone.ui1.Div("position:absolute; left:82%; width:15%; top:54%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnFind").addEvent("click", function () {

            var obj_conference = document.getElementById("InputObjConference").value;
            app.send({ api: "admin", mt: "FindObjConfMessage", obj_conference: obj_conference });
            //waitConnection(t);
        });
        var divConfRoom = t.add(new innovaphone.ui1.Div(null, texts.text("labelConfRoom"), "DivConfRoom"));
        var selectConfNumber = t.add(new innovaphone.ui1.Node("select", null, null, "SelectConfNumber").setAttribute("id", "selectConfNumber"));
        selectConfNumber.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "", null).setAttribute("id", ""));
        list_rooms.forEach(function (r) {
            selectConfNumber.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", r.dn, null).setAttribute("id", r["room-number"]));
        })
        try {
            if (list_configs[0].number_conference) {
                var cn = list_rooms.filter(function (r) { return r["room-number"] === room })[0].dn;
                var select = document.getElementById('selectConfNumber');
                select.remove(0);
                select.value = cn;
            }
        } catch (e) {

        }


        t.add(new innovaphone.ui1.Div(null, texts.text("labelDivGeralChannelsReserved"), "DivGeralChannelsReserved"));
        t.add(new innovaphone.ui1.Input(null, reserved_conference, "Insira aqui o número de canais reservados", null, "number", "DivGeralIptChannelsReserved").setAttribute("id", "InputChannelsReserved"));


        // openMenu();
        // buttons
        t.add(new innovaphone.ui1.Div("position:absolute; left:82%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnOk").addEvent("click", function () {

            var url = document.getElementById("InputURLConference").value;
            var obj = document.getElementById("InputObjConference").value;
            var reserved = document.getElementById("InputChannelsReserved").value;
            var room_number = document.getElementById("selectConfNumber");
            var selectedroom = room_number.options[room_number.selectedIndex];
            var conference = selectedroom.id;

            app.send({ api: "admin", mt: "UpdateConfigConferenceObjMessage", url_conference: url, obj_conference: obj, number_conference: conference, key_conference: key_conference, reserved_conference: reserved });
            waitConnection(t);
        });

    }
    // Função refatorada para criar a interface de configuração de servidor de conferência usando JS puro e Tailwind
    function makeDivConferenceServer(colDireita) {
        colDireita.clear();

        // mobile
        var imgMenu = colDireita.add(new innovaphone.ui1.Node("img", null, null, "imgMenu"));
        imgMenu.setAttribute("src", "menu-icon.png");
        imgMenu.setAttribute("id", "imgmenu");
        document.getElementById("imgmenu").addEventListener("click", openMenu);

        var wrapper = document.createElement("div");
        wrapper.className = "max-w-6xl mx-auto mt-[50px] p-[10px]";

        var title = document.createElement("h1");
        title.className = "text-xl font-bold mb-4";
        title.textContent = texts.text("labelTituloConferenceObj");
        wrapper.appendChild(title);

        var urlLabel = document.createElement("label");
        urlLabel.className = "block text-sm font-medium mb-1";
        urlLabel.textContent = texts.text("labelURLContato");
        wrapper.appendChild(urlLabel);

        var inputURL = document.createElement("input");
        inputURL.className = "w-full border p-2 rounded mb-4";
        inputURL.placeholder = "Insira aqui a URL do evento";
        inputURL.type = "url";
        inputURL.value = url_conference;
        inputURL.id = "InputURLConference";
        wrapper.appendChild(inputURL);

        var objLabel = document.createElement("label");
        objLabel.className = "block text-sm font-medium mb-1";
        objLabel.textContent = texts.text("labelObjConf");
        wrapper.appendChild(objLabel);

        var inputObj = document.createElement("input");
        inputObj.className = "w-full border p-2 rounded mb-4";
        inputObj.placeholder = "Insira aqui o nome do Objeto de Conferência que possui as Salas";
        inputObj.type = "text";
        inputObj.value = obj_conference;
        inputObj.id = "InputObjConference";
        wrapper.appendChild(inputObj);

        var btnFind = document.createElement("button");
        btnFind.className = "bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded mb-4";
        btnFind.textContent = texts.text("btnFind");
        btnFind.addEventListener("click", function () {
            var obj_conference = document.getElementById("InputObjConference").value;
            app.send({ api: "admin", mt: "FindObjConfMessage", obj_conference: obj_conference });
        });
        wrapper.appendChild(btnFind);

        var roomLabel = document.createElement("label");
        roomLabel.className = "block text-sm font-medium mb-1";
        roomLabel.textContent = texts.text("labelConfRoom");
        wrapper.appendChild(roomLabel);

        var selectRoom = document.createElement("select");
        selectRoom.className = "w-full border p-2 rounded mb-4";
        selectRoom.id = "selectConfNumber";

        var defaultOpt = document.createElement("option");
        defaultOpt.value = "";
        defaultOpt.textContent = "";
        selectRoom.appendChild(defaultOpt);

        list_rooms.forEach(function (r) {
            var opt = document.createElement("option");
            opt.value = r["room-number"];
            opt.textContent = r.dn;
            selectRoom.appendChild(opt);
        });
        wrapper.appendChild(selectRoom);

        try {
            if (list_configs[0].number_conference) {
                var cn = list_rooms.filter(function (r) { return r["room-number"] === room })[0].dn;
                selectRoom.value = cn;
            }
        } catch (e) { }

        var canalLabel = document.createElement("label");
        canalLabel.className = "block text-sm font-medium mb-1";
        canalLabel.textContent = texts.text("labelDivGeralChannelsReserved");
        wrapper.appendChild(canalLabel);

        var inputCanal = document.createElement("input");
        inputCanal.className = "w-full border p-2 rounded mb-6";
        inputCanal.placeholder = "Insira aqui o número de canais reservados";
        inputCanal.type = "number";
        inputCanal.value = reserved_conference;
        inputCanal.id = "InputChannelsReserved";
        wrapper.appendChild(inputCanal);

        var btnOk = document.createElement("button");
        btnOk.className = "bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded";
        btnOk.textContent = texts.text("btnOk");
        btnOk.addEventListener("click", function () {
            var url = document.getElementById("InputURLConference").value;
            var obj = document.getElementById("InputObjConference").value;
            var reserved = document.getElementById("InputChannelsReserved").value;
            var room_number = document.getElementById("selectConfNumber");
            var selectedroom = room_number.options[room_number.selectedIndex];
            var conference = selectedroom.value;

            app.send({
                api: "admin",
                mt: "UpdateConfigConferenceObjMessage",
                url_conference: url,
                obj_conference: obj,
                number_conference: conference,
                key_conference: key_conference,
                reserved_conference: reserved
            });

            waitConnection(colDireita);
        });
        wrapper.appendChild(btnOk);

        document.getElementById("coldireita").appendChild(wrapper);
    }
    function oldmakeDivGeral(t) {
        t.clear();
        
        var imgMenu = t.add(new innovaphone.ui1.Node("img",null,null,"imgMenu"));
        imgMenu.setAttribute("src","menu-icon.png");
        imgMenu.setAttribute("id","imgmenu");
        document.getElementById("imgmenu").addEventListener("click",openMenu);
        
        //Título
        t.add(new innovaphone.ui1.Div(null, texts.text("labelTituloSmtp"),"DivGeralTitle"));

        var lblfrom = t.add(new innovaphone.ui1.Div(null, texts.text("labelfrom"), "DivGeralAdminContaEmail"));
        var Inputfrom = t.add(new innovaphone.ui1.Input(null, from, null, null, "email","DivGeralAdminIptEmail").setAttribute("id", "Inputfrom"));

        var lblfromName = t.add(new innovaphone.ui1.Div(null, texts.text("labelfromName"), "DivGeralAdminNameConta"));
        var InputfromName = t.add(new innovaphone.ui1.Input(null, fromName, null, null, "url","DivGeralAdminIptConta").setAttribute("id", "InputfromName"));

        var lblserver = t.add(new innovaphone.ui1.Div(null, texts.text("labelserver"), "DivGeralAdminServerName"));
        var Inputserver = t.add(new innovaphone.ui1.Input(null, server, null, null,"text","DivGeralAdminIptServer").setAttribute("id", "Inputserver"));

        var lblusername = t.add(new innovaphone.ui1.Div(null, texts.text("labelusername"), "DivGeralAdminUsername"));
        var Inputusername = t.add(new innovaphone.ui1.Input(null, username, null,null, "text", "DivGeralAdminIptUsername").setAttribute("id", "Inputusername"));

        var lblpassword = t.add(new innovaphone.ui1.Div(null, texts.text("labelpassword"), "DivGeralAdminSenha"));
        var Inputpassword = t.add(new innovaphone.ui1.Input(null, password, null, null, "password","DivGeralAdminIptSenha").setAttribute("id", "Inputpassword"));


        // buttons
        t.add(new innovaphone.ui1.Div("position:absolute; left:82%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnOk").addEvent("click", function () {
            from = document.getElementById("Inputfrom").value;
            fromName = document.getElementById("InputfromName").value;
            server = document.getElementById("Inputserver").value;
            username = document.getElementById("Inputusername").value;
            password = document.getElementById("Inputpassword").value;


            app.send({ api: "admin", mt: "UpdateConfigMessage", from: from, fromName: fromName, server: server, username: username, password: password });
            waitConnection(t);
        });

    }
    // Refatoração da função makeDivGeral com estrutura visual consistente usando JS puro e Tailwind CSS
    function makeDivGeral(colDireita) {
        colDireita.clear();

        var container = document.getElementById("coldireita");
        if (!container) return;

        // mobile
        var imgMenu = colDireita.add(new innovaphone.ui1.Node("img", null, null, "imgMenu"));
        imgMenu.setAttribute("src", "menu-icon.png");
        imgMenu.setAttribute("id", "imgmenu");
        document.getElementById("imgmenu").addEventListener("click", openMenu);


        var wrapper = document.createElement("div");
        wrapper.className = "max-w-6xl mx-auto mt-[50px] space-y-4 p-[10px]";

        // Título
        var title = document.createElement("h1");
        title.className = "text-xl font-bold mb-4";
        title.textContent = texts.text("labelTituloSmtp");
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

        addField(texts.text("labelfrom"), "Inputfrom", "email", from);
        addField(texts.text("labelfromName"), "InputfromName", "url", fromName);
        addField(texts.text("labelserver"), "Inputserver", "text", server);
        addField(texts.text("labelusername"), "Inputusername", "text", username);
        addField(texts.text("labelpassword"), "Inputpassword", "password", password);

        // Botão salvar
        var btnWrapper = document.createElement("div");
        btnWrapper.className = "flex justify-end pt-4";

        var btn = document.createElement("button");
        btn.className = "bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded text-sm";
        btn.textContent = texts.text("btnOk");
        btn.addEventListener("click", function () {
            from = document.getElementById("Inputfrom").value;
            fromName = document.getElementById("InputfromName").value;
            server = document.getElementById("Inputserver").value;
            username = document.getElementById("Inputusername").value;
            password = document.getElementById("Inputpassword").value;

            app.send({
                api: "admin",
                mt: "UpdateConfigMessage",
                from: from,
                fromName: fromName,
                server: server,
                username: username,
                password: password
            });
            waitConnection(colDireita);
        });

        btnWrapper.appendChild(btn);
        wrapper.appendChild(btnWrapper);

        container.appendChild(wrapper);
    }
    function makeDivGoogle(t) {
        t.clear();
        //Título
        var imgMenu = t.add(new innovaphone.ui1.Node("img",null,null,"imgMenu"));
        imgMenu.setAttribute("src","menu-icon.png");
        imgMenu.setAttribute("id","imgmenu");
        document.getElementById("imgmenu").addEventListener("click",openMenu);

        t.add(new innovaphone.ui1.Div(null, texts.text("labelTituloGoogle"),"DivGoogle"));

        var lblsendLocation = t.add(new innovaphone.ui1.Div(null, texts.text("lblsendLocation"),"DivGoogleSendLocation"));
        var switchsendLocation = t.add(new innovaphone.ui1.Switch(null,null, null, sendLocation,"DivGoogleSwitch"));
        switchsendLocation.addEvent("click", onsendLocationSwitchCLick);

        var lblgoogleApiKey = t.add(new innovaphone.ui1.Div(null, texts.text("labelgoogleApiKey"), "DivGoogleApiKey"));
        var InputgoogleApiKey = t.add(new innovaphone.ui1.Input(null, googleApiKey, null, null, null,"DivGoogleIptApi").setAttribute("id", "InputgoogleApiKey"));

        var onsendLocationSwitchCLick = function () {
            
            //e.currentTarget.state;
        }

        // buttons
        t.add(new innovaphone.ui1.Div("position:absolute; left:82%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnOk").addEvent("click", function () {
            googleApiKey = document.getElementById("InputgoogleApiKey").value;
            sendLocation = switchsendLocation.getValue();


            app.send({ api: "admin", mt: "UpdateConfigGoogleMessage", googleApiKey: googleApiKey, sendLocation: sendLocation });
            waitConnection(t);
        });

    }
    function oldmakeDivLicense(t) {
        t.clear();
        //Título

        var imgMenu = t.add(new innovaphone.ui1.Node("img",null,null,"imgMenu"));
        imgMenu.setAttribute("src","menu-icon.png");
        imgMenu.setAttribute("id","imgmenu");
        document.getElementById("imgmenu").addEventListener("click",openMenu);

        t.add(new innovaphone.ui1.Div(null, texts.text("labelTituloLicense"),"DivLicenseTitle"));

        t.add(new innovaphone.ui1.Div(null, texts.text("lblLicenseToken"), "DivLicenseTokenTitle"));
        t.add(new innovaphone.ui1.Div(null, licenseToken, "DivLicenseToken"));

        t.add(new innovaphone.ui1.Div(null, texts.text("labelLicenseFile"),"DivLicenseKey"));
        t.add(new innovaphone.ui1.Input("position: absolute;  top: 35%; left: 40%; height: 30px; padding:5px; width: 50%; border-radius: 10px; border: 2px solid; border-color:#02163F;", licenseFile, null, null, null, "DivLicenseIptKey").setAttribute("id", "InputLicenseFile"));

        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 45%; left: 6%; font-weight: bold;", texts.text("labelLicenseActive"),"DivLicenseActive"));
        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 45%; left: 40%; font-weight: bold;", licenseActive, "DivLicenseSystem"));

        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 55%; left: 6%; font-weight: bold;", texts.text("labelLicenseInstallDate"),"DivLicenseDateTitle"));
        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 55%; left: 40%; font-weight: bold;", licenseInstallDate, "DivLicenseDate"));

        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 65%; left: 6%; font-weight: bold;", texts.text("labelLicenseUsed"), "DivLicenseInUse"));
        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 65%; left: 40%; font-weight: bold;", String(licenseUsed), "DivLicenseUsed"));


        // buttons
        t.add(new innovaphone.ui1.Div("position:absolute; left:82%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnOk").addEvent("click", function () {
            licenseFile = document.getElementById("InputLicenseFile").value;
            if (licenseFile.length > 0) {
                app.send({ api: "admin", mt: "UpdateConfigLicenseMessage", licenseToken: licenseToken, licenseFile: licenseFile });
                waitConnection(t);
            } else {
                makePopup(texts.text("labelWarning"), texts.text("popupNoLicenceKey"), 500, 200);
            }
            
        });

    }
    // Refatoração da função makeDivLicense com visual consistente e JS puro
    function makeDivLicense(colDireita) {
        colDireita.clear();

        //mobile
        var imgMenu = colDireita.add(new innovaphone.ui1.Node("img", null, null, "imgMenu"));
        imgMenu.setAttribute("src", "menu-icon.png");
        imgMenu.setAttribute("id", "imgmenu");
        document.getElementById("imgmenu").addEventListener("click", openMenu);

        var container = document.getElementById("coldireita");
        if (!container) return;

        var wrapper = document.createElement("div");
        wrapper.className = "max-w-6xl mx-auto mt-[50px] space-y-4 p-[10px]";

        // Título
        var title = document.createElement("h1");
        title.className = "text-xl font-bold mb-4";
        title.textContent = texts.text("labelTituloLicense");
        wrapper.appendChild(title);

        function addTextBlock(labelText, value) {
            var div = document.createElement("div");
            div.className = "flex flex-col";

            var label = document.createElement("label");
            label.className = "text-sm font-medium text-muted-foreground";
            label.textContent = labelText;

            var span = document.createElement("span");
            span.className = "text-sm text-foreground";
            span.textContent = value;

            div.appendChild(label);
            div.appendChild(span);
            wrapper.appendChild(div);
        }

        addTextBlock(texts.text("lblLicenseToken"), licenseToken);

        var licenseField = document.createElement("div");
        licenseField.className = "flex flex-col space-y-1";

        var licenseLabel = document.createElement("label");
        licenseLabel.className = "text-sm font-medium text-muted-foreground";
        licenseLabel.textContent = texts.text("labelLicenseFile");

        var licenseInput = document.createElement("input");
        licenseInput.id = "InputLicenseFile";
        licenseInput.value = licenseFile;
        licenseInput.className = "w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

        licenseField.appendChild(licenseLabel);
        licenseField.appendChild(licenseInput);
        wrapper.appendChild(licenseField);

        addTextBlock(texts.text("labelLicenseActive"), licenseActive);
        addTextBlock(texts.text("labelLicenseInstallDate"), licenseInstallDate);
        addTextBlock(texts.text("labelLicenseUsed"), String(licenseUsed));

        var btnWrapper = document.createElement("div");
        btnWrapper.className = "flex justify-end pt-4";

        var btn = document.createElement("button");
        btn.className = "bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded text-sm";
        btn.textContent = texts.text("btnOk");
        btn.addEventListener("click", function () {
            licenseFile = document.getElementById("InputLicenseFile").value;
            if (licenseFile.length > 0) {
                app.send({ api: "admin", mt: "UpdateConfigLicenseMessage", licenseToken: licenseToken, licenseFile: licenseFile });
                waitConnection(colDireita);
            } else {
                makePopup(texts.text("labelWarning"), texts.text("popupNoLicenceKey"), 500, 200);
            }
        });

        btnWrapper.appendChild(btn);
        wrapper.appendChild(btnWrapper);
        container.appendChild(wrapper);
    }
    function oldmakeDivAddWeekAvailability(colDireita) {
        colDireita.clear();
        var list_day_availabilities = [];
        var imgMenu = colDireita.add(new innovaphone.ui1.Node("img", null, null, "imgMenu"));
        imgMenu.setAttribute("src", "menu-icon.png");
        imgMenu.setAttribute("id", "imgmenu");
        document.getElementById("imgmenu").addEventListener("click", openMenu);
        //colDireita.add(new innovaphone.ui1.Div(null, texts.text("labelTituloAvail"), "TitleAvailTable"));
        //titulo
        const clock_div = colDireita.add(new innovaphone.ui1.Div("margin: 8px 0; display: flex; flex-direction: column; align-items: center;", null, null));
        clock_div.add(new innovaphone.ui1.Node("h2", null, texts.text("labelTituloAvail"), "TitleAvailTable"));


        //Usuário
        clock_div.add(new innovaphone.ui1.Div("font-size:15px; text-align:right", texts.text("labelUser")));
        var iptUser = clock_div.add(new innovaphone.ui1.Node("select", "width:30%;font-size:12px; text-align:center", null, null));
        iptUser.setAttribute("id", "selectUser");
        var opt = iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", texts.text("labelSelectUser"), null));
        opt.setAttribute("id", "null");
        list_users.forEach(function (user) {
            var opt = iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.cn || user.dn, null));
            opt.setAttribute("id", user.sip);
        })
        document.getElementById("selectUser").addEventListener("change", function (e) {
            var user = document.getElementById("selectUser");
            var selectedOption = user.options[user.selectedIndex];
            var user = selectedOption.id;

            console.log("makeDivAddWeekAvailability: usuário alterado", user);
            app.sendSrc({ api: "admin", mt: "SelectAvailabilityMessage", sip: user, src: user }, function (obj) {
                console.log("makeDivAddWeekAvailability: retornou ", obj);
                list_day_availabilities = [];
                list_day_availabilities = JSON.parse(obj.result)

                if (list_day_availabilities && Array.isArray(list_day_availabilities) && list_day_availabilities.length > 0) {
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
                } else {
                    // 🧹 Limpa todos os dias
                    Object.keys(inputs).forEach((day) => {
                        const ref = inputs[day];
                        if (ref) {
                            ref.checkbox.setValue(false);
                            ref.hStart.setValue("");
                            ref.mStart.setValue("");
                            ref.hEnd.setValue("");
                            ref.mEnd.setValue("");
                        }
                    });

                    // 🧹 Limpa campos de data
                    document.getElementById("dataInicio").value = "";
                    document.getElementById("dataFim").value = "";
                }
                var calendarUrl = appUrl + "/Calendario.htm?id=" + user;
                document.getElementById("iptUrl").value = calendarUrl;
                

            })

        })



        const inputs = {}; // armazenar refs de inputs por dia

        diasSemana.forEach((dia, idx) => {
            const row = clock_div.add(new innovaphone.ui1.Div("margin: 8px 0; display: flex; align-items: center;", null, "row-dia-" + dia.id));
            const checkbox = row.add(new innovaphone.ui1.Input("margin-right: 8px;", null, null, null, "checkbox"));
            checkbox.setAttribute("id", `check-${dia.id}`);
            checkbox.setAttribute("disabled", "disabled");
            const label = row.add(new innovaphone.ui1.Div("width: 110px;", dia.nome));

            const hStart = row.add(new innovaphone.ui1.Input("width: 40px; margin:0 4px;", null, null, null, "number"));
            hStart.setAttribute("placeholder", "h Ini");
            hStart.setAttribute("readonly", "readonly");
            const mStart = row.add(new innovaphone.ui1.Input("width: 40px; margin:0 4px;", null, null, null, "number"));
            mStart.setAttribute("placeholder", "m Ini");
            mStart.setAttribute("readonly", "readonly");
            const hEnd = row.add(new innovaphone.ui1.Input("width: 40px; margin:0 4px;", null, null, null, "number"));
            hEnd.setAttribute("placeholder", "h Fim");
            hEnd.setAttribute("readonly", "readonly");
            const mEnd = row.add(new innovaphone.ui1.Input("width: 40px; margin:0 4px;", null, null, null, "number"));
            mEnd.setAttribute("placeholder", "m Fim");
            mEnd.setAttribute("readonly", "readonly");

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
        dataInicio.setAttribute("readonly", "readonly");

        clock_div.add(new innovaphone.ui1.Div(null, "Data de Fim (opcional)"));
        const dataFim = clock_div.add(new innovaphone.ui1.Input("margin-bottom: 10px;", null, null, null, "date"));
        dataFim.setAttribute("id", "dataFim");
        dataFim.setAttribute("readonly", "readonly");

        //url
        clock_div.add(new innovaphone.ui1.Node("h2", null, texts.text("labelcalendarURL"), null));
        var divIptUrl = clock_div.add(new innovaphone.ui1.Div(null, null, null));
        var iptURL = divIptUrl.add(new innovaphone.ui1.Input(null, null, null, 200, "text", "urlcalendar"));
        iptURL.setAttribute("readonly", "readonly");
        iptURL.setAttribute("id", "iptUrl")
        var btnCopy = divIptUrl.add(new innovaphone.ui1.Node("button", null, texts.text("labelCopy"), "DivHelpBtnCopy"))
        btnCopy.setAttribute("id", "btnCopy");
        document.getElementById("btnCopy").addEventListener("click", copyText);
        var CopyPopUp = clock_div.add(new innovaphone.ui1.Div(null, texts.text("Copied"), "CopyPopUpAdmin"));
        CopyPopUp.setAttribute("id", "copyPopUp")
        document.getElementById("btnCopy").addEventListener("click", ShowCopyPopUp);

        // Botões
        //clock_div.add(new innovaphone.ui1.Div("position: absolute; left: 83%; width: 15%; top: 3%; font-size: 12px; text-align: center;", null, "button-inn"))
        //    .addTranslation(texts, "btnOk")
        //    .addEvent("click", function () {
        //        const date_start = dataInicio.getValue() || "";
        //        const date_end = dataFim.getValue() || "";

        //        let envioFeito = false;

        //        diasSemana.forEach((dia) => {
        //            const ref = inputs[dia.id];
        //            if (ref.checkbox.getValue()) {
        //                const horaIni = ref.hStart.getValue();
        //                const minIni = ref.mStart.getValue();
        //                const horaFim = ref.hEnd.getValue();
        //                const minFim = ref.mEnd.getValue();

        //                if (horaIni.length == 0 || !minIni.length == 0 || !horaFim.length == 0 || !minFim.length == 0) {
        //                    makePopup("Aviso", "Preencha todos os horários para o dia: " + dia.nome, 500, 200);
        //                    return;
        //                }

        //                envioFeito = true;

        //                app.send({
        //                    api: "admin",
        //                    mt: "AddDayAvailability",
        //                    day: dia.id,
        //                    hour_start: convertHourToUtc(horaIni),
        //                    minute_start: minIni,
        //                    hour_end: convertHourToUtc(horaFim),
        //                    minute_end: minFim,
        //                    date_start: date_start,
        //                    date_end: date_end
        //                });
        //            }
        //        });

        //        if (!envioFeito) {
        //            makePopup("Aviso", "Selecione ao menos um dia para salvar disponibilidade.", 500, 200);
        //            return;
        //        }

        //        waitConnection(colDireita);
        //    });

        //clock_div.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn-del"))
        //    .addTranslation(texts, "btnCancel")
        //    .addEvent("click", function () {
        //        makeDivAddWeekAvailability(colDireita);
        //    });
    }
    // Refatoração da função makeDivAddWeekAvailability (em construção visual equivalente)
    function makeDivAddWeekAvailability(colDireita) {
        colDireita.clear();

        var imgMenu = colDireita.add(new innovaphone.ui1.Node("img", null, null, "imgMenu"));
        imgMenu.setAttribute("src", "menu-icon.png");
        imgMenu.setAttribute("id", "imgmenu");
        document.getElementById("imgmenu").addEventListener("click", openMenu);

        var container = document.getElementById("coldireita");
        if (!container) return;

        var wrapper = document.createElement("div");
        wrapper.className = "max-w-6xl mx-auto mt-[50px] space-y-4 p-[10px]";

        var title = document.createElement("h1");
        title.className = "text-xl font-bold mb-4";
        title.textContent = texts.text("labelTituloAvail");
        wrapper.appendChild(title);

        // usuário
        var userLabel = document.createElement("label");
        userLabel.className = "text-sm font-medium";
        userLabel.textContent = texts.text("labelUser");

        var userSelect = document.createElement("select");
        userSelect.className = "border rounded p-2 min-w-[200px] text-sm";
        userSelect.id = "selectUser";
        userSelect.setAttribute("multiples", "multiples")

        var optDefault = document.createElement("option");
        optDefault.value = "";
        optDefault.textContent = texts.text("labelSelectUser");
        userSelect.appendChild(optDefault);

        list_users.forEach(function (user) {
            var opt = document.createElement("option");
            opt.value = user.sip;
            opt.textContent = user.cn || user.dn;
            userSelect.appendChild(opt);
        });

        wrapper.appendChild(userLabel);
        wrapper.appendChild(userSelect);

        var days = document.createElement("div");
        days.className = "inline-flex flex-row flex-wrap max-w-6xl mx-auto mt-[50px] space-y-2";

        // dias da semana
        var inputs = {};
        diasSemana.forEach(function (dia) {
            var row = document.createElement("div");
            row.className = "flex items-center gap-2";

            var checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `check-${dia.id}`;
            checkbox.disabled = true;

            var label = document.createElement("span");
            label.textContent = dia.nome;
            label.className = "w-[110px]";

            var hStart = document.createElement("input");
            hStart.type = "number";
            hStart.placeholder = "h Ini";
            hStart.readOnly = true;
            hStart.className = "w-[60px] px-2 py-1 border rounded";

            var mStart = document.createElement("input");
            mStart.type = "number";
            mStart.placeholder = "m Ini";
            mStart.readOnly = true;
            mStart.className = "w-[60px] px-2 py-1 border rounded";

            var hEnd = document.createElement("input");
            hEnd.type = "number";
            hEnd.placeholder = "h Fim";
            hEnd.readOnly = true;
            hEnd.className = "w-[60px] px-2 py-1 border rounded";

            var mEnd = document.createElement("input");
            mEnd.type = "number";
            mEnd.placeholder = "m Fim";
            mEnd.readOnly = true;
            mEnd.className = "w-[60px] px-2 py-1 border rounded";


            row.appendChild(checkbox);
            row.appendChild(label);
            row.appendChild(hStart);
            row.appendChild(mStart);
            row.appendChild(hEnd);
            row.appendChild(mEnd);

            days.appendChild(row);

            //armazena referencia dos dias
            inputs[dia.id] = {
                checkbox: checkbox,
                hStart: hStart,
                mStart: mStart,
                hEnd: hEnd,
                mEnd: mEnd
            };
        });

        wrapper.appendChild(days);

        var dates = document.createElement("div");
        dates.className = "flex max-w-6xl mx-auto mt-[50px] space-y-2";

        // datas
        var dateStart = document.createElement("input");
        dateStart.type = "date";
        dateStart.id = "dataInicio";
        dateStart.readOnly = true;
        dateStart.className = "border rounded p-2";

        var dateEnd = document.createElement("input");
        dateEnd.type = "date";
        dateEnd.id = "dataFim";
        dateEnd.readOnly = true;
        dateEnd.className = "border rounded p-2";

        dates.appendChild(document.createTextNode("Data de Início (opcional)"));
        dates.appendChild(dateStart);
        dates.appendChild(document.createTextNode("Data de Fim (opcional)"));
        dates.appendChild(dateEnd);

        wrapper.appendChild(dates);
        // url
        var calendarTitle = document.createElement("h2");
        calendarTitle.textContent = texts.text("labelcalendarURL");
        wrapper.appendChild(calendarTitle);

        var calendarRow = document.createElement("div");
        calendarRow.className = "flex items-center gap-2";

        var iptUrl = document.createElement("input");
        iptUrl.id = "iptUrl";
        iptUrl.readOnly = true;
        iptUrl.className = "flex-1 border rounded p-2";

        var btnCopy = document.createElement("button");
        btnCopy.id = "btnCopy";
        btnCopy.textContent = texts.text("labelCopy");
        btnCopy.className = "bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm";

        calendarRow.appendChild(iptUrl);
        calendarRow.appendChild(btnCopy);
        wrapper.appendChild(calendarRow);

        var pop = document.createElement("div");
        pop.id = "copyPopUp";
        pop.className = "CopyPopUpAdmin";
        pop.textContent = texts.text("Copied");
        wrapper.appendChild(pop);

        container.appendChild(wrapper);

        document.getElementById("selectUser").addEventListener("change", function (e) {
            var user = document.getElementById("selectUser");
            var selectedOption = user.options[user.selectedIndex];
            var user = selectedOption.value;

            console.log("makeDivAddWeekAvailability: usuário alterado", user);
            app.sendSrc({ api: "admin", mt: "SelectAvailabilityMessage", sip: user, src: user }, function (obj) {
                console.log("makeDivAddWeekAvailability: retornou ", obj);
                list_day_availabilities = [];
                list_day_availabilities = JSON.parse(obj.result)

                if (list_day_availabilities && Array.isArray(list_day_availabilities) && list_day_availabilities.length > 0) {
                    list_day_availabilities.forEach((item) => {
                        const ref = inputs[item.day];
                        if (ref) {
                            ref.checkbox.checked = true;
                            ref.hStart.value = convertHourFromUtc(item.hour_start);
                            ref.mStart.value = item.minute_start;
                            ref.hEnd.value = convertHourFromUtc(item.hour_end);
                            ref.mEnd.value = item.minute_end;

                            if (item.date_start) document.getElementById("dataInicio").value = item.date_start;
                            if (item.date_end) document.getElementById("dataFim").value = item.date_end;
                        }
                    });
                } else {
                    // 🧹 Limpa todos os dias
                    Object.keys(inputs).forEach((day) => {
                        const ref = inputs[day];
                        if (ref) {
                            ref.checkbox.checked = false;
                            ref.hStart.value = "";
                            ref.mStart.value = "";
                            ref.hEnd.value = "";
                            ref.mEnd.value = "";

                        }
                    });

                    // 🧹 Limpa campos de data
                    document.getElementById("dataInicio").value = "";
                    document.getElementById("dataFim").value = "";
                }
                var calendarUrl = appUrl + "/Calendario.htm?id=" + user;
                document.getElementById("iptUrl").value = calendarUrl;


            })

        })

        document.getElementById("btnCopy").addEventListener("click", copyText);
        document.getElementById("btnCopy").addEventListener("click", ShowCopyPopUp);
    }
    function oldmakeDivSchedules(t) {
        t.clear();
        var list_schedules = [];
        var imgMenu = t.add(new innovaphone.ui1.Node("img", null, null, "imgMenu"));
        imgMenu.setAttribute("src", "menu-icon.png");
        imgMenu.setAttribute("id", "imgmenu");
        document.getElementById("imgmenu").addEventListener("click", openMenu);

        var today = getDateNow();
        //Botoes Tabela de Agendamentos
        //t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:10%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnAddAction").addEvent("click", function () {
        //    makeDivAddAction(t);
        //});

        //Titulo Tabela
        var labelTituloTabeaAcoes = t.add(new innovaphone.ui1.Div(null, texts.text("labelTituloSchedules"), "DivSchedulesTableTitle"));

        var scroll_container = new innovaphone.ui1.Node("scroll-container", "overflow-y: auto; position: absolute; left:1%; top:25%; right:1%; width:98%; height:-webkit-fill-available;", null, "scroll-container-table");

        var list = new innovaphone.ui1.Div(null, null, "listSchedules");
        var columns = 6;
        var ListView = new innovaphone.ui1.ListView(list, 50, "headercl", "arrow", false);

        //Usuário
        t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:15%; font-size:15px; text-align:right", texts.text("labelUser")));
        var iptUser = t.add(new innovaphone.ui1.Node("select", "position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", null, null));
        iptUser.setAttribute("id", "selectUser");
        var opt = iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", texts.text("labelSelectUser"), null));
        opt.setAttribute("id", "null");
        list_users.forEach(function (user) {
            var opt = iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.cn || user.dn, null));
            opt.setAttribute("id", user.sip);
        })
        document.getElementById("selectUser").addEventListener("change", function (e) {
            var user = document.getElementById("selectUser");
            var selectedOption = user.options[user.selectedIndex];
            var user = selectedOption.id;

            console.log("makeDivSchedules: usuário alterado", user);
            app.sendSrc({ api: "admin", mt: "SelectSchedulesMessage", sip: user, src: user }, function (obj) {
                console.log("makeDivSchedules: retornou ", obj);
                list_schedules = [];
                list_schedules = JSON.parse(obj.result)

                next();

            });
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

        t.add(scroll_container);
        next();
    }
    // Refatoração de makeDivSchedules usando JavaScript puro e Tailwind CSS
    function makeDivSchedules(colDireita) {
        colDireita.clear();

        var container = document.getElementById("coldireita");
        if (!container) return;

        var list_schedules = [];
        var today = getDateNow();

        // Menu mobile
        var imgMenu = colDireita.add(new innovaphone.ui1.Node("img", null, null, "imgMenu"));
        imgMenu.setAttribute("src", "menu-icon.png");
        imgMenu.setAttribute("id", "imgmenu");
        document.getElementById("imgmenu").addEventListener("click", openMenu);

        // Wrapper principal
        var wrapper = document.createElement("div");
        wrapper.className = "max-w-6xl mx-auto mt-[50px] space-y-4 p-[10px]";

        var title = document.createElement("h1");
        title.className = "text-xl font-bold mb-4";
        title.textContent = texts.text("labelTituloSchedules");
        wrapper.appendChild(title);

        // Filtro por usuário
        var filterDiv = document.createElement("div");
        filterDiv.className = "flex flex-wrap gap-4 items-end mb-4";

        var selectUserWrapper = document.createElement("div");
        selectUserWrapper.innerHTML = `
        <label class="block text-sm font-medium" for="selectUser">${texts.text("labelUser")}</label>
        <select id="selectUser" class="border rounded p-2 min-w-[200px]">
            <option value="null">${texts.text("labelSelectUser")}</option>
        </select>
    `;
        filterDiv.appendChild(selectUserWrapper);

        wrapper.appendChild(filterDiv);

        // Botões
        var buttonsDiv = document.createElement("div");
        buttonsDiv.className = "flex gap-4 mb-4";

        var btnNext = document.createElement("button");
        btnNext.className = "bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded";
        btnNext.textContent = texts.text("btnNext");
        btnNext.onclick = renderNext;
        buttonsDiv.appendChild(btnNext);

        var btnAll = document.createElement("button");
        btnAll.className = "bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded";
        btnAll.textContent = texts.text("btnAll");
        btnAll.onclick = renderAll;
        buttonsDiv.appendChild(btnAll);

        wrapper.appendChild(buttonsDiv);

        // Tabela
        var tableContainer = document.createElement("div");
        tableContainer.className = "overflow-auto border rounded shadow";

        var table = document.createElement("table");
        table.className = "min-w-full text-sm text-left text-blue-700";

        var thead = document.createElement("thead");
        thead.className = "bg-gray-200";
        thead.innerHTML = `
        <tr>
            <th class="px-4 py-2">ID</th>
            <th class="px-4 py-2">${texts.text("cabecalhoSchedules1")}</th>
            <th class="px-4 py-2">${texts.text("cabecalhoSchedules2")}</th>
            <th class="px-4 py-2">${texts.text("cabecalhoSchedules3")}</th>
            <th class="px-4 py-2">${texts.text("cabecalhoSchedules4")}</th>
            <th class="px-4 py-2">${texts.text("cabecalhoSchedules5")}</th>
        </tr>`;
        table.appendChild(thead);

        var tbody = document.createElement("tbody");
        tbody.id = "schedules-table-body";
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        wrapper.appendChild(tableContainer);

        container.appendChild(wrapper);

        // Popular select
        var iptUser = document.getElementById("selectUser");
        list_users.forEach(function (user) {
            var opt = document.createElement("option");
            opt.textContent = user.cn || user.dn;
            opt.value = user.sip;
            iptUser.appendChild(opt);
        });

        iptUser.addEventListener("change", function () {
            var sip = iptUser.value;
            if (!sip || sip === "null") return;

            app.sendSrc({ api: "admin", mt: "SelectSchedulesMessage", sip: sip, src: sip }, function (obj) {
                list_schedules = JSON.parse(obj.result);
                renderNext();
            });
        });

        function clearTable() {
            tbody.innerHTML = "";
        }

        function renderRow(b) {
            var row = document.createElement("tr");
            row.className = "border-b hover:bg-gray-50";

            row.innerHTML = `
            <td class="px-4 py-2 text-blue-700">${b.id}</td>
            <td class="px-4 py-2 text-blue-700">${b.name}</td>
            <td class="px-4 py-2 text-blue-700">${b.email}</td>
            <td class="px-4 py-2 text-blue-700">${ajustarHora(b.time_start, clientTimeZone)}</td>
            <td class="px-4 py-2 text-blue-700">${ajustarHora(b.time_end, clientTimeZone)}</td>
            <td class="px-4 py-2">
                <button class="text-blue-700 hover:underline" onclick="window.open('${b.conf_link}')">
                    ${texts.text("btnLink")}
                </button>
            </td>`;

            tbody.appendChild(row);
        }

        function renderNext() {
            clearTable();
            list_schedules.forEach(function (b) {
                if (today < b.time_start) renderRow(b);
            });
        }

        function renderAll() {
            clearTable();
            list_schedules.forEach(renderRow);
        }

        // render inicial vazio
        clearTable();
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
    function convertHourToUtc(hour) {
        var offset = parseInt(clientTimeZone.split(":")[0]); // exemplo: "-03" vira -3
        return (parseInt(hour) - offset + 24) % 24; // garante valor entre 0-23
    }
    function convertHourFromUtc(hour) {
        var offset = parseInt(clientTimeZone.split(":")[0]);
        return (parseInt(hour) + offset + 24) % 24;
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
    function padZero(num) {
        return (num < 10 ? "0" : "") + num;
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
    function copyText() {
        var input = document.getElementById("iptUrl");
        input.select();
        input.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(input.value)
        //alert("Texto copiado: " + input.value);
    }
    function ShowCopyPopUp() {
        var popup = document.getElementById("copyPopUp");
        popup.classList.remove("hide");
        popup.classList.add("show");

        setTimeout(function () {
            popup.classList.remove("show");
            popup.classList.add("hide");
        }, 1000);

    }

    //#region REPORTS UI
    function createAvailabilityReportUI(colDireita) {
        colDireita.clear();
        availabilityDataCache = [];

        //mobile
        var imgMenu = colDireita.add(new innovaphone.ui1.Node("img", null, null, "imgMenu"));
        imgMenu.setAttribute("src", "menu-icon.png");
        imgMenu.setAttribute("id", "imgmenu");
        document.getElementById("imgmenu").addEventListener("click", openMenu);


        var container = document.getElementById("coldireita");
        if (!container) return;

        var wrapper = document.createElement("div");
        wrapper.id = "report-availability-wrapper";
        wrapper.className = "max-w-6xl mx-auto mt-[50px] p-[10px]";

        // Título
        var title = document.createElement("h1");
        title.className = "text-xl font-bold mb-4";
        title.textContent = texts.text("labelTitleRptAgent");
        wrapper.appendChild(title);

        // Filtros
        var filterWrapper = document.createElement("div");
        filterWrapper.className = "flex flex-wrap gap-4 items-end mb-6";

        // Atendente
        var userDiv = document.createElement("div");
        userDiv.innerHTML = `
        <label class="block text-sm font-medium" for="select-user">`+ texts.text("cabecalhoSchedules1") +`</label>
        <select multiple id="select-user" class="border rounded p-2 min-w-[200px] overflow-auto">
            <option value="">`+ texts.text("btnAll") +`</option>
        </select>
    `;
        filterWrapper.appendChild(userDiv);
        // Status
        var statusDiv = document.createElement("div");
        statusDiv.innerHTML = `
        <label class="block text-sm font-medium" for="select-status">`+ texts.text("labelStatus") +`</label>
        <select id="select-status" class="border rounded p-2 min-w-[150px]">
            <option value="">`+ texts.text("btnAll") +`</option>
            <option value="Login">`+ texts.text("Login") +`</option>
            <option value="Logout">`+ texts.text("Logout") +`</option>
            <option value="away">`+ texts.text("away") +`</option>
            <option value="busy">`+ texts.text("busy") +`</option>
            <option value="dnd">`+ texts.text("dnd") +`</option>
            <option value="on-the-phone">`+ texts.text("on-the-phone") +`</option>
        </select>
    `;
        filterWrapper.appendChild(statusDiv);

        // Data De
        var fromDiv = document.createElement("div");
        fromDiv.innerHTML = `
        <label class="block text-sm font-medium" for="date-from">`+ texts.text("cabecalhoSchedules3") +`</label>
        <input type="date" id="date-from" class="border rounded p-2" />
    `;
        filterWrapper.appendChild(fromDiv);

        // Data Até
        var toDiv = document.createElement("div");
        toDiv.innerHTML = `
        <label class="block text-sm font-medium" for="date-to">`+ texts.text("cabecalhoSchedules4") +`</label>
        <input type="date" id="date-to" class="border rounded p-2" />
    `;
        filterWrapper.appendChild(toDiv);

        // === Botões de ação (Buscar / Exportar) ===
        var actionsDiv = document.createElement("div");
        actionsDiv.className = "flex gap-2 items-end";

        // Botão Consultar
        var btnConsultar = document.createElement("button");
        btnConsultar.className = "bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded";
        btnConsultar.textContent = texts.text("labelBtnQuery");
        btnConsultar.addEventListener("click", requestAvailabilityReport);
        actionsDiv.appendChild(btnConsultar);


        // Botão Exportar CSV
        var btnExportar = document.createElement("button");
        btnExportar.className = "bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded";
        btnExportar.textContent = texts.text("labelExportCsv");
        btnExportar.addEventListener("click", exportTableAvailabilityToCSV);
        actionsDiv.appendChild(btnExportar);

        // Botão Exportar PDF
        var btnExportarPdf = document.createElement("button");
        btnExportarPdf.className = "bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded";
        btnExportarPdf.textContent = texts.text("labelExportPdf");
        btnExportarPdf.addEventListener("click", () => exportTableAvailabilityToPdf());
        actionsDiv.appendChild(btnExportarPdf);

        
        wrapper.appendChild(filterWrapper);
        wrapper.appendChild(actionsDiv);

        // Resumo
        var resumo = document.createElement("div");
        resumo.id = "summary";
        resumo.style = "border: 1px solid rgb(229, 231, 235); border-radius: 8px; padding: 12px; margin-bottom: 12px; margin-top:10px; margin-bottom:10px; background-color: white";
        wrapper.appendChild(resumo);

        // === Botões de ação (Resumo / Detalhado) ===
        var actions2Div = document.createElement("div");
        actions2Div.className = "flex gap-2 justify-end pb-2";
        // === Botão ÚNICO: alterna entre Detalhado (table) e Resumido (summary) ===
        var btnToggle = document.createElement("button");
        btnToggle.id = "btn-availability-toggle";
        btnToggle.className = "font-semibold px-4 py-2 hidden rounded transition-colors";
        //updateAvailabilityToggleButtonUI(btnToggle); // seta rótulo/cores conforme modo atual

        btnToggle.addEventListener("click", function () {
            availabilityViewMode = (availabilityViewMode === "table" ? "summary" : "table");
            if (availabilityViewMode === "summary") {
                renderSummaryAvailabilityFromCache();
            } else {
                renderTableAvailability(availabilityDataCache);
            }
            updateAvailabilityToggleButtonUI(btnToggle);
        });
        actions2Div.appendChild(btnToggle);
        wrapper.appendChild(actions2Div);

        // Tabela
        var tableWrapper = document.createElement("div");
        tableWrapper.className = "overflow-auto border rounded shadow";

        var table = document.createElement("table");
        table.className = "min-w-full bg-white border rounded shadow-sm";

        table.id = "table-data";
        var thead = document.createElement("thead");
        thead.className = "bg-gray-200";
        thead.style.position = "sticky";
        thead.style.top = "0";
        thead.style.zIndex = "1";
        thead.style.boxShadow = "inset 0 -1px 0 #e5e7eb";
        thead.innerHTML = `
            <tr>
                <th class="px-4 py-2 text-left">`+ texts.text("cabecalhoSchedules1") +`</th>
                <th class="px-4 py-2 text-left">`+texts.text("labelFrom")+`</th>
                <th class="px-4 py-2 text-left">`+ texts.text("labelStatus") +`</th>
                <th class="px-4 py-2 text-left">`+ texts.text("labelDetail") +`</th>
            </tr>
        `;

        table.appendChild(thead);

        var tbody = document.createElement("tbody");
        tbody.id = "table-body";
        table.appendChild(tbody);

        tableWrapper.appendChild(table);
        wrapper.appendChild(tableWrapper);

        container.appendChild(wrapper);

        var iptUser = document.getElementById("select-user");
        list_users.forEach(function (user) {
            var opt = document.createElement("option");
            opt.textContent = user.cn || user.dn;
            opt.value = user.guid;
            opt.style.fontSize = "12px";
            opt.style.textAlign = "center";
            iptUser.appendChild(opt);
        });

        // Opcional: garantir container do resumo no wrapper do relatório
        ensureAvailabilitySummaryContainer(wrapper);

    }
    function updateAvailabilityToggleButtonUI(btn) {
        // Quando o modo atual é "table" (detalhado), o clique levará a "Resumo"
        if (availabilityViewMode === "table") {
            btn.textContent = texts.text("labelDailySummary");
            // cor “vai para resumo”
            btn.className = "bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded transition-colors";
        } else {
            btn.textContent = texts.text("labelBackToTable");
            // cor “voltar para detalhado”
            btn.className = "bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded transition-colors";
        }
    }
    function createSchedulesReportUI(colDireita) {
        colDireita.clear();

        //mobile
        var imgMenu = colDireita.add(new innovaphone.ui1.Node("img", null, null, "imgMenu"));
        imgMenu.setAttribute("src", "menu-icon.png");
        imgMenu.setAttribute("id", "imgmenu");
        document.getElementById("imgmenu").addEventListener("click", openMenu);


        var container = document.getElementById("coldireita");
        if (!container) return;

        var wrapper = document.createElement("div");
        wrapper.className = "max-w-6xl mx-auto mt-[50px] p-[10px]";

        // Título
        var title = document.createElement("h1");
        title.className = "text-xl font-bold mb-4";
        title.textContent = texts.text("labelTitleRptSchedule");
        wrapper.appendChild(title);

        // Filtros
        var filterWrapper = document.createElement("div");
        filterWrapper.className = "flex flex-wrap gap-4 items-end mb-6";

        // Atendente
        var userDiv = document.createElement("div");
        userDiv.innerHTML = `
        <label class="block text-sm font-medium" for="select-user">`+ texts.text("cabecalhoSchedules1") + `</label>
        <select multiple id="select-user" class="border rounded p-2 min-w-[200px] overflow-auto">
            <option value="">`+ texts.text("btnAll") + `</option>
        </select>
    `;
        filterWrapper.appendChild(userDiv);

        // Data De
        var fromDiv = document.createElement("div");
        fromDiv.innerHTML = `
        <label class="block text-sm font-medium" for="date-from">`+ texts.text("cabecalhoSchedules3") + `</label>
        <input type="date" id="date-from" class="border rounded p-2" />
    `;
        filterWrapper.appendChild(fromDiv);

        // Data Até
        var toDiv = document.createElement("div");
        toDiv.innerHTML = `
        <label class="block text-sm font-medium" for="date-to">`+ texts.text("cabecalhoSchedules4") + `</label>
        <input type="date" id="date-to" class="border rounded p-2" />
    `;
        filterWrapper.appendChild(toDiv);

        // === Botões de ação (Buscar / Exportar) ===
        var actionsDiv = document.createElement("div");
        actionsDiv.className = "flex gap-2 items-end";


        // Botão Consultar
        var btnConsultar = document.createElement("button");
        btnConsultar.className = "bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded";
        btnConsultar.textContent = texts.text("labelBtnQuery");
        btnConsultar.addEventListener("click", requestScheduleReport);
        actionsDiv.appendChild(btnConsultar);

        // Botão Exportar CSV
        var btnExportar = document.createElement("button");
        btnExportar.className = "bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded";
        btnExportar.textContent = texts.text("labelExportCsv");
        btnExportar.addEventListener("click", exportTableSchedulesToCSV);
        actionsDiv.appendChild(btnExportar);


        // Botão Exportar PDF
        var btnExportarPdf = document.createElement("button");
        btnExportarPdf.className = "bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded";
        btnExportarPdf.textContent = texts.text("labelExportPdf");
        btnExportarPdf.addEventListener("click", () => exportTableSchedulesToPdf(texts.text("labelTitleRptSchedule")));
        actionsDiv.appendChild(btnExportarPdf);

        wrapper.appendChild(filterWrapper);
        wrapper.appendChild(actionsDiv);


        

        // Resumo
        var resumo = document.createElement("div");
        resumo.id = "summary";
        resumo.style = "border: 1px solid rgb(229, 231, 235); border-radius: 8px; padding: 12px; margin-bottom: 12px; margin-top:10px; margin-bottom:10px; background-color: white";
        wrapper.appendChild(resumo);

        // Tabela
        var tableWrapper = document.createElement("div");
        tableWrapper.className = "overflow-auto border rounded shadow";

        var table = document.createElement("table");
        table.className = "min-w-full bg-white border rounded shadow-sm";
        table.id = "table-data";
        var thead = document.createElement("thead");
        thead.className = "bg-gray-200";
        thead.innerHTML = `
        <tr>
            <th class="px-4 py-2 text-left">`+ texts.text("cabecalhoSchedules0") + `</th>
            <th class="px-4 py-2 text-left">`+ texts.text("cabecalhoSchedules6") + `</th>
            <th class="px-4 py-2 text-left">`+ texts.text("cabecalhoSchedules1") + `</th>
            <th class="px-4 py-2 text-left">`+ texts.text("cabecalhoSchedules2") + `</th>
            <th class="px-4 py-2 text-left">`+ texts.text("cabecalhoSchedules3") + `</th>
            <th class="px-4 py-2 text-left">`+ texts.text("cabecalhoSchedules4") + `</th>
            <th class="px-4 py-2 text-left">`+ texts.text("cabecalhoSchedules5") + `</th>
        </tr>
    `;
        table.appendChild(thead);

        var tbody = document.createElement("tbody");
        tbody.id = "table-body";
        table.appendChild(tbody);

        tableWrapper.appendChild(table);
        wrapper.appendChild(tableWrapper);

        container.appendChild(wrapper);

        var iptUser = document.getElementById("select-user");
        list_users.forEach(function (user) {
            var opt = document.createElement("option");
            opt.textContent = user.cn || user.dn;
            opt.value = user.sip;
            opt.style.fontSize = "12px";
            opt.style.textAlign = "center";
            iptUser.appendChild(opt);
        });

    }
    function createCallsReportUI(colDireita) {
        colDireita.clear();

        var container = document.getElementById("coldireita");
        if (!container) return;

        var wrapper = document.createElement("div");
        wrapper.className = "max-w-7xl mx-auto mt-[50px] p-[10px]";

        var title = document.createElement("h1");
        title.className = "text-xl font-bold mb-4";
        title.textContent = texts.text("labelTitleRptCall");
        wrapper.appendChild(title);

        // Filtros
        var filterWrapper = document.createElement("div");
        filterWrapper.className = "flex flex-wrap gap-4 items-end mb-6";

        var userDiv = document.createElement("div");
        userDiv.innerHTML = `
        <label class="block text-sm font-medium" for="select-user">`+ texts.text("cabecalhoSchedules1") + `</label>
        <select multiple id="select-user" class="border rounded p-2 min-w-[200px] overflow-auto"></select>
    `;
        filterWrapper.appendChild(userDiv);

        var fromDiv = document.createElement("div");
        fromDiv.innerHTML = `
        <label class="block text-sm font-medium" for="date-from">`+ texts.text("cabecalhoSchedules3") + `</label>
        <input type="date" id="date-from" class="border rounded p-2" />
    `;
        filterWrapper.appendChild(fromDiv);

        var toDiv = document.createElement("div");
        toDiv.innerHTML = `
        <label class="block text-sm font-medium" for="date-to">`+ texts.text("cabecalhoSchedules4") + `</label>
        <input type="date" id="date-to" class="border rounded p-2" />
    `;
        filterWrapper.appendChild(toDiv);

        // === Botões de ação (Buscar / Exportar) ===
        var actionsDiv = document.createElement("div");
        actionsDiv.className = "flex gap-2 items-end";

        //Botão consultar
        var btnConsultar = document.createElement("button");
        btnConsultar.className = "bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded";
        btnConsultar.textContent = texts.text("labelBtnQuery");
        btnConsultar.addEventListener("click", requestCallsReport);
        actionsDiv.appendChild(btnConsultar);

        // Botão Exportar CSV
        var btnExportar = document.createElement("button");
        btnExportar.className = "bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded";
        btnExportar.textContent = texts.text("labelExportCsv");
        btnExportar.addEventListener("click", exportTableCallsToCSV);
        actionsDiv.appendChild(btnExportar);

        // Botão Exportar PDF
        var btnExportarPdf = document.createElement("button");
        btnExportarPdf.className = "bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded";
        btnExportarPdf.textContent = texts.text("labelExportPdf");
        btnExportarPdf.addEventListener("click", () => exportTableCallsToPdf(texts.text("labelTitleRptCall")));
        actionsDiv.appendChild(btnExportarPdf);

        wrapper.appendChild(filterWrapper);
        wrapper.appendChild(actionsDiv);


        // Resumo
        var resumo = document.createElement("div");
        resumo.id = "summary";
        resumo.style = "border: 1px solid rgb(229, 231, 235); border-radius: 8px; padding: 12px; margin-bottom: 12px; margin-top:10px; margin-bottom:10px; background-color: white";
        wrapper.appendChild(resumo);

        // Tabela
        var tableWrapper = document.createElement("div");
        tableWrapper.className = "overflow-auto border rounded shadow";

        var table = document.createElement("table");
        table.className = "min-w-full bg-white border rounded shadow-sm";
        table.id = "table-data";
        var thead = document.createElement("thead");
        thead.className = "bg-gray-200";
        //    thead.innerHTML = `
        //    <tr>
        //        <th class="px-4 py-2 text-left">${texts.text("labelDateTime")}</th>
        //        <th class="px-4 py-2 text-left">${texts.text("labelName")}</th>
        //        <th class="px-4 py-2 text-left">${texts.text("labelCallHistory")}</th>
        //        <th class="px-4 py-2 text-left">${texts.text("labelCallDuration")}</th>
        //        <th class="px-4 py-2 text-left">${texts.text("labelWaitTime")}</th>
        //    </tr>
        //`;
        thead.innerHTML = '\
            <tr>\
                <th class="px-4 py-2 text-left">' + texts.text("callId") + '</th>\
              <th class="px-4 py-2 text-left">' + texts.text("labelDateTime") + '</th>\
              <th class="px-4 py-2 text-left">' + texts.text("labelQuemLigou") + '</th>\
              <th class="px-4 py-2 text-left">' + texts.text("labelDirection") + '</th>\
              <th class="px-4 py-2 text-left">' + texts.text("cabecalhoSchedules6") + '</th>\
              <th class="px-4 py-2 text-left">' + texts.text("labelWaitingQueue") + '</th>\
              <th class="px-4 py-2 text-left">' + texts.text("labelHouveAtendimento") + '</th>\
              <th class="px-4 py-2 text-left">' + texts.text("labelCallDuration") + '</th>\
              <th class="px-4 py-2 text-left">' + texts.text("labelWaitTime") + '</th>\
              <th class="px-4 py-2 text-left">' + texts.text("labelHouveTransbordo") + '</th>\
            </tr>';
        table.appendChild(thead);
        table.appendChild(thead);

        var tbody = document.createElement("tbody");
        tbody.id = "calls-table-body";
        table.appendChild(tbody);

        tableWrapper.appendChild(table);
        wrapper.appendChild(tableWrapper);

        container.appendChild(wrapper);

        // Preenche os atendentes no select
        var iptUser = document.getElementById("select-user");
        var opt = document.createElement("option");
        opt.textContent = texts.text("all");
        opt.value = "";
        iptUser.appendChild(opt);
        list_users.forEach(function (user) {
            var opt = document.createElement("option");
            opt.textContent = user.cn || user.dn;
            opt.value = user.guid;
            iptUser.appendChild(opt);
        });
    }
    //#endregion

    //#region CALLS REPORT
    // ===== Helpers =====

    // Agrupa os registros por conf
    function groupCdrByConf(data){
        try{
            console.log('groupCdrByConf: data', data )
            // -------- Helpers --------
            function parseChildren(flowStr) {
                try {
                var parsed = JSON.parse(flowStr || "[]");
                if (Array.isArray(parsed)) return parsed;
                if (parsed && parsed.children && Array.isArray(parsed.children)) return parsed.children;
                } catch (e) {}
                return [];
            }
            function getConfFromChildren(children) {
                if (children[0] && children[0].attrs && children[0].attrs.conf) {
                return String(children[0].attrs.conf);
                }
                for (var i = 0; i < children.length; i++) {
                var ch = children[i];
                if (ch && ch.tag === "event" && ch.attrs && ch.attrs.conf) return String(ch.attrs.conf);
                }
                return "";
            }
            // -------- Agrupar por conf (com fallback via flow) --------
            var groupsByConf = {}; // confKey -> { conf, rows:[], flows:[], firstUtc, firstRow }
            for (var i = 0; i < data.length; i++) {
                var row = data[i];
                var children = parseChildren(row.flow);
                var confKey = (row.conf && String(row.conf)) || getConfFromChildren(children);
                var key = confKey || "__sem_conf__" + (row.call || ("utc" + row.utc + "_" + i));

                if (!groupsByConf[key]) {
                    groupsByConf[key] = { conf: confKey || "", rows: [], flows: [], firstUtc: row.utc || Infinity, firstRow: row };
                }
                var g = groupsByConf[key];
                g.rows.push({ raw: row, children: children });
                g.flows = g.flows.concat(children);
                if (row.utc && row.utc < g.firstUtc) {
                    g.firstUtc = row.utc;
                    g.firstRow = row;
                }
            }

            // Ordenar grupos por primeiro UTC
            var groups = Object.keys(groupsByConf).map(function(k){ return groupsByConf[k]; });
            groups.sort(function(a,b){ return (a.firstUtc||0) - (b.firstUtc||0); });

            // Guardar para CSV/summary
            window.__lastCallGroupsByConf = groups;
            console.log('groupCdrByConf: groups', groups )
            return groups;
        } catch (e){
            console.log('groupCdrByConf: error ', e )
            return [];
        }
    }

    // Tudo '00'
    const pad2 = (n) => String(n).padStart(2, "0");

    // recebe segundos e retorna HH:mm:ss
    function secToHHMMSS(s) {
        if (typeof s !== "number" || !isFinite(s) || s < 0) return "-";
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = Math.floor(s % 60);
        return `${pad2(h)}:${pad2(m)}:${pad2(sec)}`;
    }
        
    // Extrai tempos-chave de UM row
    function getRowTimes(row){
        const evs = (row?.children||[])
            .filter(n => n.tag === "event" && n.attrs)
            .map(e => ({ msg: e.attrs.msg, t: Number(e.attrs.time) }))
            .filter(x => x.msg && Number.isFinite(x.t))
            .sort((a,b)=>a.t-b.t);

        if (!evs.length) return { firstAlert:null, firstSetup:null, lastRel:null, lastEvent:null };

        const firstAlert = evs.find(e=>isAlert(e.msg))?.t ?? null;
        const firstSetup = evs.find(e=>isSetup(e.msg))?.t ?? null;
        const firstConn = evs.find(e=>isConn(e.msg))?.t ?? null;
        const lastRel    = [...evs].reverse().find(e=>isRel(e.msg))?.t ?? null;
        const lastEvent  = evs[evs.length-1].t;

        return { firstAlert, firstSetup, firstConn, lastRel, lastEvent };
    }

    // (A) Espera de UM row waiting: (alert|setup) -> (rel|lastEvent)
    function waitSecondsFromWaitingRow(row){
        const { firstAlert, firstSetup, firstConn, lastRel, lastEvent } = getRowTimes(row);
        const start = (firstAlert!=null) ? firstAlert : firstSetup;
        const end   = (lastRel!=null)    ? lastRel    : lastEvent;
        if (start!=null && end!=null && end>=start) return end - start;
        return 0;
    }

    // (B) Espera TOTAL do conf: soma de todos os rows waiting
    function waitSecondsForConf(rows){
        return (rows||[])
            .filter(isWaitingRow)
            .reduce((acc,r)=> acc + waitSecondsFromWaitingRow(r), 0);
    }

    // (C) Duração de UM row sem pseudo (atendente): (alert|setup) -> (rel|lastEvent)
    function durationSecondsFromAgentRow(row){
        const { firstAlert, firstSetup, firstConn, lastRel, lastEvent } = getRowTimes(row);
        let start = (firstAlert!=null) ? firstAlert : firstSetup;
        start = (firstConn!=null) ? firstConn : start;
        const end   = (lastRel!=null)    ? lastRel    : lastEvent;
        if (start!=null && end!=null && end>=start) return end - start;
        return 0;
    }

    function hmsToSec(hms) {
        if (!hms || hms === "-") return 0;
        var parts = String(hms).split(":").map(function(n){ return parseInt(n,10)||0; });
        if (parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2];
        if (parts.length === 2) return parts[0]*60 + parts[1];
        return parseInt(hms, 10) || 0;
    }

    const isSetup = (msg) => msg === "setup-to" || msg === "setup-from";
    const isConn  = (msg) => msg === "conn-to"   || msg === "conn-from";
    const isRel   = (msg) => msg === "rel-to"    || msg === "rel-from";
    const isAlert = (msg) => msg === "alert-to"  || msg === "alert-from";

    function flatEvents(children) {
        const out = [];
        (children || []).forEach(node => { if (node.tag === "event") out.push(node); });
        return out;
    }

    // Obtem evento mais importante para identidade da chamada
    function getFirstSetupInfo(rows) {
        // Retorna o DN do setup inicial + todas as filas (cf.dn) vistas nos setups (ordem preservada, sem duplicar)
        let dnOut = "-";
        const queues = [];
        const seen = new Set();

        // processa em ordem temporal (mais antigo primeiro)
        const ordered = (rows || []).slice().sort(
            (a, b) => (Number(a.raw?.utc) || 0) - (Number(b.raw?.utc) || 0)
        );

        for (const r of ordered) {

            const relevant = (isNoPseudo(r) || isWaitingRow(r));
            if (!relevant) continue;

            const kids = r?.children || [];
            for (const node of kids) {
            if (node?.tag !== "event" || !node.attrs) continue;
            const msg = node.attrs.msg;
            if (msg === "setup-to" || msg === "setup-from") {
                // 1) DN do chamador/contato
                if (dnOut === "-") {
                dnOut = node.attrs.dn || node.attrs.e164 || "-";
                }
                // 2) Filas (cf) declaradas como filhos do setup
                const evChildren = node.children || [];
                for (const ch of evChildren) {
                if (ch?.tag === "cf" && ch.attrs) {
                    const name = ch.attrs.dn || ch.attrs.e164 || ch.attrs.h323;
                    if (name && !seen.has(name)) {
                    seen.add(name);
                    queues.push(String(name));
                    }
                }
                }
            }
            }
        }

        return { dn: dnOut, queues };
    }


    // detectar "waiting" / "sem pseudo" ===
    function isWaitingRow(row) {
        return (row.children || []).some(n => n.tag === "user" && n.attrs && n.attrs.pseudo === "waiting");
    }
    function isNoPseudo(row) {
        return !(row.children || []).some(n => n.tag === "user" && n.attrs && "pseudo" in n.attrs);
    }

    // Remove CDRs duplicados por GUID
    function dedupeEarliestRelevantByGuid(rows) {
        const byGuid = new Map();
        const ordered = (rows || []).slice().sort(
            (a, b) => (Number(a.raw?.utc) || 0) - (Number(b.raw?.utc) || 0)
        );
        for (const r of ordered) {
            // só consideramos sem pseudo ou waiting
            if (!(isNoPseudo(r) || isWaitingRow(r))) continue;

            const guid = r.raw?.guid || "__no_guid__" + (Number(r.raw?.utc) || 0);
            if (!byGuid.has(guid)) {
            byGuid.set(guid, r); // guarda a 1ª ocorrência
            } else {
            // mesmo utc? preferir 'to' (mantém “entrada” como direção)
            const cur = byGuid.get(guid);
            const curUtc = Number(cur.raw?.utc) || 0;
            const rUtc   = Number(r.raw?.utc) || 0;
            if (rUtc === curUtc) {
                const curTo = cur.raw?.dir === "to";
                const rTo   = r.raw?.dir === "to";
                if (rTo && !curTo) byGuid.set(guid, r);
            }
            // se rUtc > curUtc, mantemos o mais antigo já salvo
            }
        }
        return Array.from(byGuid.values());
    }

    // Direção baseada só em (sem pseudo) OU (waiting) ===
    function getDirection(rows) {
        const deduped = dedupeEarliestRelevantByGuid(rows);
        if (!deduped.length) return "-";

        const someTo = deduped.some(r => r.raw && r.raw.dir === "to");
        // Se houver QUALQUER 'to' entre os primeiros por guid, consideramos RECEBIDA.
        // Só marcamos REALIZADA quando não há 'to' nesses primeiros.
        return someTo ? texts.text("labelReceived") : texts.text("labelDone");
    }


    // Filas de espera SEM depender de forwarded; preserva ordem e remove duplicados
    function getQueuesWaiting(rows) {
        const names = [];
        const seen = new Set();
        // iteramos em ordem temporal crescente
        const ordered = [...rows].sort((a,b)=>(Number(a.raw?.utc)||0)-(Number(b.raw?.utc)||0));
        for (const r of ordered) {
        if (!isWaitingRow(r)) continue;
        // procurar <cf dn="..."> em eventos
        (r.children || []).forEach(node => {
            if (node.tag !== "event" || !Array.isArray(node.children)) return;
            node.children.forEach(ch => {
            if (ch.tag === "cf" && ch.attrs?.dn) {
                const dn = String(ch.attrs.dn);
                if (!seen.has(dn)) {
                seen.add(dn);
                names.push(dn);
                }
            }
            });
        });
        }
        return names;
    }


    // Localiza destino do encaminhamento
    function _old_getForwardTarget(rows) {
        let forwarded = false;
        let target = null;
        for (const r of rows) {
        const evs = flatEvents(r.children);
        if (evs.some(e => e.attrs?.msg === "forwarded")) forwarded = true;
        const follow = evs.find(e => (e.attrs?.msg === "alert-to" || e.attrs?.msg === "transfer-to") && e.attrs?.dn);
        if (follow?.attrs?.dn) target = follow.attrs.dn;
        }
        return { forwarded, target };
    }
    function getForwardTarget(rows) {
        let forwarded = false;
        let target = null;
        for (const r of rows) {
            const evs = flatEvents(r.children);
            // Se encontrar qualquer evento "forwarded", marca como true
            if (evs.some(e => e.attrs?.msg === "forwarded")) forwarded = true;
            // Procura o destino do transfer (pode ser transfer-to, transfer-from, alert-to, etc)
            const follow = evs.find(e =>
                (e.attrs?.msg === "alert-to" ||
                e.attrs?.msg === "transfer-to" ||
                e.attrs?.msg === "transfer-from") &&
                (e.attrs?.dn || (e.children && e.children[0]?.attrs?.dn))
            );
            // Pega o destino do transfer, se existir
            if (follow) {
                target = follow.attrs?.dn || (follow.children && follow.children[0]?.attrs?.dn) || target;
            }
        }
        return { forwarded, target };
    }
    //Função que funciona para o caso do TRE Bah
    function getForwardInfoSmart(rows) {
    // === utils locais (não poluem global) ===
    const zoneCodeFromString = (s) => {
        if (!s) return null;
        const str = String(s);
        // ZE-123  |  123-ZE
        let m = str.match(/\bZE[-\s]*([0-9]{2,3})\b/i);
        if (m) return m[1];
        m = str.match(/\b([0-9]{2,3})[-\s]*ZE\b/i);
        if (m) return m[1];
        // zona123
        m = str.match(/\bzona[-\s]*([0-9]{2,3})\b/i);
        if (m) return m[1];
        // ...-ze(-informativa) com número em qualquer lugar
        if (/ze/i.test(str)) {
        const g = str.match(/([0-9]{2,3})/g);
        if (g && g.length) return g[g.length - 1];
        }
        return null;
    };

    const zoneCodeFromRow = (row) => {
        if (!row) return null;
        const cand = [row.raw?.cn, row.raw?.sip, row.raw?.h323];
        const evs = flatEvents(row.children) || [];
        for (const e of evs) {
        if (e?.attrs?.dn) cand.push(e.attrs.dn);
        if (e?.attrs?.h323) cand.push(e.attrs.h323);
        if (e?.attrs?.e164) cand.push(e.attrs.e164);
        }
        for (const s of cand) {
        const code = zoneCodeFromString(s);
        if (code) return code;
        }
        return null;
    };

    const isWaitingRow = (row) =>
        (row.children || []).some(n => n.tag === "user" && n.attrs && n.attrs.pseudo === "waiting");
    const isNoPseudo = (row) =>
        !(row.children || []).some(n => n.tag === "user" && n.attrs && "pseudo" in n.attrs);

    const hasConnNoPseudo = (row) => {
        if (!isNoPseudo(row)) return false;
        const evs = flatEvents(row.children);
        return evs.some(e => {
        const m = e?.attrs?.msg;
        return m === "conn-to" || m === "conn-from";
        });
    };

    // --- coleta transfer/forwarded em linhas waiting (regra principal) ---
    const waitingRows = (rows || [])
        .filter(isWaitingRow)
        .sort((a,b)=>(Number(a.raw?.utc)||0)-(Number(b.raw?.utc)||0));

    const transfersInWaiting = [];
    for (const r of waitingRows) {
        for (const e of (flatEvents(r.children) || [])) {
        const msg = e?.attrs?.msg;
        if (msg === "transfer-to" || msg === "transfer-from" || msg === "forwarded") {
            const t = Number(e?.attrs?.time) || Number(r.raw?.utc) || 0;
            transfersInWaiting.push({ t, e, r });
        }
        }
    }
    transfersInWaiting.sort((a,b)=>a.t-b.t);

    // último waiting "ativo" (com maior conn-*; senão o último por utc)
    const lastWaitingRow = (() => {
        let best = null, bestT = -1;
        for (const r of waitingRows) {
        for (const e of (flatEvents(r.children) || [])) {
            const msg = e?.attrs?.msg;
            if (msg && msg.startsWith("conn-")) {
            const t = Number(e.attrs.time) || Number(r.raw?.utc) || 0;
            if (t > bestT) { bestT = t; best = r; }
            }
        }
        }
        return best || waitingRows[waitingRows.length - 1] || null;
    })();

    const lastQueueCodeFromWaiting = zoneCodeFromRow(lastWaitingRow);

    // primeiro atendente real (sem pseudo) que conectou
    const agentRows = (rows || []).filter(r => isNoPseudo(r) && hasConnNoPseudo(r));
    const agentWithFirstConn = (() => {
        let best = null, bestT = Infinity;
        for (const r of agentRows) {
        const times = (flatEvents(r.children) || [])
            .filter(e => (e?.attrs?.msg || "").startsWith("conn-"))
            .map(e => Number(e.attrs.time))
            .filter(Number.isFinite)
            .sort((a,b)=>a-b);
        if (times.length && times[0] < bestT) { bestT = times[0]; best = r; }
        }
        return best;
    })();
    const agentCode = zoneCodeFromRow(agentWithFirstConn);

    // alvo do último transfer em waiting (se houver)
    let target = null, destCode = null;
    if (transfersInWaiting.length) {
        const lastT = transfersInWaiting[transfersInWaiting.length-1].e;
        const toNode = (lastT.children || []).find(ch => ch.tag === "to" && (ch.attrs?.dn || ch.attrs?.h323 || ch.attrs?.e164));
        const targetStr = toNode?.attrs?.dn || toNode?.attrs?.h323 || toNode?.attrs?.e164
                    || lastT?.attrs?.dn || lastT?.attrs?.h323 || lastT?.attrs?.e164;
        if (targetStr) {
        target = String(targetStr);
        destCode = zoneCodeFromString(targetStr);
        }
    }

    // === FALLBACK: inferir ZE via cadeia de CF em qualquer setup-* (quando waiting não veio no filtro)
    // coleta todos <cf> em ordem temporal (por time do evento se existir; senão utc da row)
    const cfHints = [];
    const orderedRows = (rows || []).slice().sort((a,b)=>(Number(a.raw?.utc)||0)-(Number(b.raw?.utc)||0));
    for (const r of orderedRows) {
        for (const ev of (flatEvents(r.children) || [])) {
        const msg = ev?.attrs?.msg || "";
        if (msg.startsWith("setup-")) {
            const t = Number(ev?.attrs?.time) || Number(r.raw?.utc) || 0;
            for (const ch of (ev.children || [])) {
            if (ch?.tag === "cf") {
                const s = ch.attrs?.dn || ch.attrs?.h323 || ch.attrs?.e164;
                const code = zoneCodeFromString(s);
                if (code) cfHints.push({ t, code, s });
            }
            }
        }
        }
    }
    cfHints.sort((a,b)=>a.t-b.t);
    // heurística: pegue o ÚLTIMO cf (normalmente é a ZE efetiva depois da informativa)
    const inferredQueueCodeFromCF = cfHints.length ? cfHints[cfHints.length - 1].code : null;

    // ===== Decisão =====
    let forwarded = false;

    if (transfersInWaiting.length) {
        // regra principal (com waiting)
        if (agentWithFirstConn) {
        if (lastQueueCodeFromWaiting && agentCode) forwarded = agentCode !== lastQueueCodeFromWaiting;
        else if (lastQueueCodeFromWaiting && !agentCode) forwarded = true; // saiu da ZE para fora (ex.: COJUR)
        else forwarded = true; // sem base de comparação, mas houve transfer em waiting + houve atendimento
        } else {
        if (lastQueueCodeFromWaiting && destCode) forwarded = destCode !== lastQueueCodeFromWaiting;
        else forwarded = true; // sem atendente: qualquer transfer em waiting conta
        }
    } else {
        // --- FALLBACK (sem transfer visível em waiting: dados filtrados) ---
        // Se conseguimos inferir ZE via CF e houve atendimento:
        if (inferredQueueCodeFromCF && agentWithFirstConn) {
        if (agentCode && agentCode === inferredQueueCodeFromCF) {
            forwarded = false; // mesma ZE => sem transbordo
        } else {
            forwarded = true;  // ZE diferente ou agente "fora de ZE" (null) => transbordo
        }
        } else {
        // sem atendente: não marcamos transbordo só por CF (evita falso positivo)
        forwarded = false;
        }
    }

    // alvo amigável
    if (!target && agentWithFirstConn) {
        target = agentWithFirstConn.raw?.cn || agentWithFirstConn.raw?.sip || agentWithFirstConn.raw?.guid || null;
    }

    return {
        forwarded,
        target,
        lastQueueCode: lastQueueCodeFromWaiting || inferredQueueCodeFromCF || null,
        agentCode: agentCode || null,
        destCode: destCode || null,
        inferredQueueCodeFromCF: inferredQueueCodeFromCF || null
    };
    }




    // A chamda foi atendida por um atendente?
    function hasConnNoPseudo(row) {
        if (!isNoPseudo(row)) return false;
        const evs = flatEvents(row.children);
        return evs.some(e => isConn(e.attrs?.msg));
    }


    function pickUserCN(row) {
        return (row && row.raw && row.raw.cn) ? row.raw.cn : "-";
    }

    // Deduplicar por GUID dentro do conf (preferir quem tem conn-*)
    function dedupeByGuid(rows) {
        const byGuid = new Map();
        function score(row) {
        const evs = flatEvents(row.children);
        const hasConn = evs.some(e => isConn(e.attrs?.msg)) ? 1 : 0;
        const utc = Number(row.raw?.utc) || 0;
        return { hasConn, utc };
        }
        for (const r of rows) {
        const guid = r.raw?.guid || "__no_guid__" + (Number(r.raw?.utc) || 0);
        if (!byGuid.has(guid)) {
            byGuid.set(guid, r);
        } else {
            const cur = byGuid.get(guid);
            const a = score(cur);
            const b = score(r);
            // preferimos: (tem conn) > (não tem); empate: menor utc (mais antigo)
            if (b.hasConn > a.hasConn || (b.hasConn === a.hasConn && b.utc < a.utc)) {
            byGuid.set(guid, r);
            }
        }
        }
        return Array.from(byGuid.values());
    }
    // Fim dos HELPERS

    function renderTableCalls(data) {
        const tbody = document.getElementById("calls-table-body");
        if (!tbody) return;

        var confArray = groupCdrByConf(data);
        // ===== Render =====
        tbody.innerHTML = "";

        (confArray || []).forEach(group => {
            const { conf, rows = [], firstUtc } = group;

            const dataHoraUTC = ajustarHora((firstUtc || 0) * 1000, "+00:00");
            //const { dn: numeroDN } = getFirstSetupInfo(rows);
            const direcao = getDirection(rows);

            // CALCULA UMA VEZ por conf
            const waitSecConf = waitSecondsForConf(rows);
            const waitHmsConf = secToHHMMSS(waitSecConf);

            //const filas = getQueuesWaiting(rows);
            //const { forwarded, target } = getForwardTarget(rows);
            const { forwarded, target } = getForwardInfoSmart(rows);
            const { dn: numeroDN, queues: setupQueues } = getFirstSetupInfo(rows);
            const filasFromWaiting = getQueuesWaiting(rows);

            // união mantendo ordem (waiting primeiro, depois setups)
            const filasMerged = [];
            const seenFilas = new Set();
            for (const q of (filasFromWaiting || [])) {
            if (q && !seenFilas.has(q)) { seenFilas.add(q); filasMerged.push(q); }
            }
            for (const q of (setupQueues || [])) {
            if (q && !seenFilas.has(q)) { seenFilas.add(q); filasMerged.push(q); }
            }


            // só SEM pseudo, depois deduplicamos por guid
            const noPseudoRowsAll = rows.filter(isNoPseudo);
            const noPseudoRows = dedupeByGuid(noPseudoRowsAll)
            .sort((a,b) => (Number(a.raw?.utc)||0) - (Number(b.raw?.utc)||0));

            // Se não houver sem pseudo, renderiza uma linha “placeholder”
            const toRender = noPseudoRows.length ? noPseudoRows : [null];

            toRender.forEach((row, idx) => {
                const tr = document.createElement("tr");
                tr.className = "text-gray-600";

                function td(text) {
                    const el = document.createElement("td");
                    el.textContent = text == null ? "" : String(text);
                    return el;
                }

                if (idx === 0) {
                    tr.appendChild(td(conf));                 // ID (conf)
                    tr.appendChild(td(dataHoraUTC));          // Data hora (utc)
                    tr.appendChild(td(numeroDN));             // Número (dn)
                    tr.appendChild(td(direcao));              // Direção (dir) — já filtrada
                } else {
                    tr.appendChild(td(""));                   // ID (conf)
                    tr.appendChild(td(""));                   // Data hora (utc)
                    tr.appendChild(td(""));                   // Número (dn)
                    tr.appendChild(td(""));                   // Direção (dir)
                }

                // Usuário (cn)
                const cn = row ? pickUserCN(row) : (rows[0]?.raw?.cn || "-");
                tr.appendChild(td(cn));

                // Filas de Espera (sempre mostram as 'waiting'; se houver forwarded, só acrescenta o destino)
                let filasTxt = filasMerged.join(", ");
                // (opcional) acrescentar destino de forwarded, sem ocultar as filas iniciais
                if (idx === 0 && forwarded && target && !seenFilas.has(target)) {
                filasTxt = filasTxt ? `${filasTxt} -> ${target}` : target;
                }
                tdFilasEl = td(filasTxt || "");
                tr.appendChild(tdFilasEl);


                // Atendida
                const atendida = row ? (hasConnNoPseudo(row) ? texts.text("labelYes") : texts.text("labelNo")) : texts.text("labelNo");
                tr.appendChild(td(atendida));

                // // Duração / Tempo de espera
                // let dur = "-", wait = "-";
                // if (row) {
                //     const t = calcDurAndWait(row);
                //     dur = t.duration;
                //     wait = t.waiting;
                // }
                // tr.appendChild(td(dur));
                // tr.appendChild(td(wait));
                // Duração / Tempo de espera
                let dur = "-", wait = waitHmsConf; // espera do CONF para todas as linhas
                if (row) {
                    const durSec = durationSecondsFromAgentRow(row); // (alert|setup)->(rel|lastEvent)
                    const newWaitTimeSec = waitSecConf - durSec;

                    wait = secToHHMMSS(newWaitTimeSec);
                    dur = secToHHMMSS(durSec);
                }
                tr.appendChild(td(dur));
                tr.appendChild(td(wait));

                // Encaminhada (por conf)
                // Encaminhada (apenas na linha pai)
                const enc = (idx === 0 && forwarded) ? texts.text("labelYes") : texts.text("labelNo");
                tr.appendChild(td(enc));

                tbody.appendChild(tr);
            });
        });
        // -------- Summary (mesmas linhas da TABELA) --------
        // var summaryData = [];

        // for (var si = 0; si < confArray.length; si++) {
        //     var g2 = confArray[si];

        //     // 1) mesmas linhas que vão para a tabela: sem pseudo + dedupe por guid
        //     var rowsNoPseudoAll = (g2.rows || []).filter(isNoPseudo);
        //     var rowsNoPseudo = dedupeByGuid(rowsNoPseudoAll)
        //         .sort(function(a,b){ return (Number(a.raw && a.raw.utc) || 0) - (Number(b.raw && b.raw.utc) || 0); });

        //     // 2) para cada sublinha (atendente), usar a MESMA função calcDurAndWait()
        //     if (!rowsNoPseudo.length) {
        //         // chamada sem atendente (ex.: abandonada) -> não soma tempos de conversa/espera do atendente
        //         // (se quiser somar "espera de abandonadas", posso te passar o bloco opcional depois)
        //         continue;
        //     }

        //     for (var ri = 0; ri < rowsNoPseudo.length; ri++) {
        //         var row = rowsNoPseudo[ri];
        //         var times = calcDurAndWait(row); // {duration: "HH:MM:SS"|- , waiting: "HH:MM:SS"|-}
        //         var durSec  = hmsToSec(times.duration);
        //         var waitSec = hmsToSec(times.waiting);

        //         var guidAgg = (row.raw && row.raw.guid) ? row.raw.guid : "unknown";
        //         var cnAgg   = (row.raw && row.raw.cn)   ? row.raw.cn   : "-";

        //         summaryData.push({
        //         guid: guidAgg,          // chave do atendente
        //         cn: cnAgg,              // nome (útil para debug/inspeção se quiser)
        //         duration: durSec,       // em segundos
        //         wait_time: waitSec      // em segundos
        //         });
        //     }
        // }
        // -------- Summary (tempo no atendente e tempo de espera) --------
        var summaryData = [];

        for (var si = 0; si < confArray.length; si++) {
            var g2 = confArray[si];

            // (1) Espera do conf (sempre)
            var waitSecConf = waitSecondsForConf(g2.rows);
            summaryData.push({
                guid: "__wait__:" + (g2.conf || si),
                cn: "Fila",
                duration: 0,
                wait_time: waitSecConf,
                non_agent: true
            });

            // (2) Durações por atendente (sem pseudo, dedupe por guid)
            var rowsNoPseudo = dedupeByGuid((g2.rows || []).filter(isNoPseudo))
                .sort(function(a,b){ return (Number(a.raw?.utc)||0) - (Number(b.raw?.utc)||0); });

            for (var ri = 0; ri < rowsNoPseudo.length; ri++) {
                var row = rowsNoPseudo[ri];
                var durSec = durationSecondsFromAgentRow(row);

                summaryData.push({
                guid: (row.raw && row.raw.guid) ? row.raw.guid : "unknown",
                cn:   (row.raw && row.raw.cn)   ? row.raw.cn   : "-",
                duration: durSec,  // segundos de fala/atendimento
                wait_time: 0       // espera já foi adicionada pelo item do conf
                });
            }
        }

        // render
        renderSummaryCalls(summaryData, confArray.length);
    }

    function renderSummaryCalls(data, totalConfs){
        var resumo = document.getElementById("summary");

        var totalCalls = (typeof totalConfs === "number") ? totalConfs : data.length;

        var users = {};
        var totalCallDuration = 0; // soma de (durations + waits)
        var totalWaitTime = 0;

        for (var i = 0; i < data.length; i++) {
            var row = data[i];

            // Somatórios
            totalWaitTime     += row.wait_time || 0;
            totalCallDuration += (row.duration || 0) + (row.wait_time || 0);

            // Contagem de agentes (ignora itens de 'fila')
            if (row.non_agent) continue;

            if (!users[row.guid]) users[row.guid] = { cn: row.cn || row.guid, callCount: 0, totalDuration: 0, totalWait: 0 };
            users[row.guid].callCount++;
            users[row.guid].totalDuration += row.duration || 0;
            users[row.guid].totalWait     += row.wait_time || 0; // sempre 0 nos itens de agente
        }

        var userCount = Object.keys(users).length;
        var avgCallsPerUser = userCount ? (totalCalls / userCount) : 0;
        var avgCallDuration = totalCalls ? (totalCallDuration / totalCalls) : 0;
        var avgWaitTime     = totalCalls ? (totalWaitTime / totalCalls) : 0;

        function formatDuration(seconds) {
            var s = Math.max(0, parseInt(seconds || 0, 10));
            var min = Math.floor(s / 60);
            var sec = s % 60;
            return min + ":" + (sec < 10 ? "0" + sec : sec);
        }

        resumo.innerHTML =
            "<p id='totalCalls' class='text-sm'>" + texts.text("labelTotalCalls") + " <strong>" + totalCalls + "</strong></p>" +
            "<p id='totalAgents' class='text-sm'>" + texts.text("labelTotalAgents") + " <strong>" + userCount + "</strong></p>" +
            "<p id='avgPerUser' class='text-sm'>" + texts.text("labelAvgCallsPerUser") + " <strong>" + avgCallsPerUser.toFixed(2) + "</strong></p>" +
            "<p id='totalDuration' class='text-sm'>" + texts.text("labelTotalCallTime") + " <strong>" + formatDuration(totalCallDuration) + "</strong></p>" +
            "<p id='avgDuration' class='text-sm'>" + texts.text("labelAvgCallTime") + " <strong>" + formatDuration(avgCallDuration) + "</strong></p>" +
            "<p id='totalWait' class='text-sm'>" + texts.text("labelTotalWaitTime") + " <strong>" + formatDuration(totalWaitTime) + "</strong></p>" +
            "<p id='avgWait' class='text-sm'>" + texts.text("labelAvgWaitTime") + " <strong>" + formatDuration(avgWaitTime) + "</strong></p>";
    }

    function exportTableCallsToCSV() {
        // ===== textos do cabeçalho/summary =====
        var title = texts.text("labelTitleRptCall");
        var summaryValues = {
            totalCalls:    document.getElementById("totalCalls")    ? document.getElementById("totalCalls").innerText    : "",
            totalAgents:   document.getElementById("totalAgents")   ? document.getElementById("totalAgents").innerText   : "",
            avgPerUser:    document.getElementById("avgPerUser")    ? document.getElementById("avgPerUser").innerText    : "",
            totalDuration: document.getElementById("totalDuration") ? document.getElementById("totalDuration").innerText : "",
            avgDuration:   document.getElementById("avgDuration")   ? document.getElementById("avgDuration").innerText   : "",
            totalWait:     document.getElementById("totalWait")     ? document.getElementById("totalWait").innerText     : "",
            avgWait:       document.getElementById("avgWait")       ? document.getElementById("avgWait").innerText       : ""
        };

        // ===== CSV base =====
        var csv = '"' + title + '"\n\n';
        csv += '"' + summaryValues.totalCalls    + '"\n';
        csv += '"' + summaryValues.totalAgents   + '"\n';
        csv += '"' + summaryValues.avgPerUser    + '"\n';
        csv += '"' + summaryValues.totalDuration + '"\n';
        csv += '"' + summaryValues.avgDuration   + '"\n';
        csv += '"' + summaryValues.totalWait     + '"\n';
        csv += '"' + summaryValues.avgWait       + '"\n';
        csv += "\n";

        // ===== Cabeçalhos (1 linha por conf) =====
        var h1 = texts.text("callId");                 // ID (conf)
        var h2 = texts.text("labelDateTime");          // Data e hora
        var h3 = texts.text("labelQuemLigou");         // Solicitante
        var h4 = texts.text("labelDirection");         // Direção
        var h5 = texts.text("cabecalhoSchedules6");    // Atendente
        var h6 = texts.text("labelWaitingQueue");      // Zona/Setor
        var h7 = texts.text("labelHouveAtendimento");  // Foi atendida
        var h8 = texts.text("labelCallDuration");      // Tempo no atendente
        var h9 = texts.text("labelWaitTime");          // Tempo de espera
        var h10 = texts.text("labelHouveTransbordo");  // Transbordo
        csv += '"' + h1 + '";"' + h2 + '";"' + h3 + '";"' + h4 + '";"' + h5 + '";"' + h6 + '";"' + h7 + '";"' + h8 +'";"' + h9 +'";"' + h10 +'"\n';

        // ===== Grupos (gerados no render) =====
        var groups = window.__lastCallGroupsByConf || [];

        // ===== Linhas =====
        for (var gi = 0; gi < groups.length; gi++) {
            var g = groups[gi];
            var rows = g.rows || [];

            // ID (conf)
            var confId = g.conf || (g.firstRow && g.firstRow.conf) || "";

            // Direção (mesma da tabela)
            var direcao = getDirection(rows);

            // Solicitante + filas (mesma lógica da tabela)
            var setupInfo = getFirstSetupInfo(rows);           // { dn, queues }
            var caller = setupInfo.dn;
            var setupQueues = setupInfo.queues || [];
            var filasFromWaiting = getQueuesWaiting(rows);
            var merged = [];
            var seen = new Set();
            (filasFromWaiting || []).forEach(function(q){ if(q && !seen.has(q)){ seen.add(q); merged.push(q); }});
            (setupQueues || []).forEach(function(q){ if(q && !seen.has(q)){ seen.add(q); merged.push(q); }});

            //var fwd = getForwardTarget(rows);  
            var fwd = getForwardInfoSmart(rows);                // { forwarded, target }

            // Atendentes (sem pseudo) dedupe por guid
            var agentRows = dedupeByGuid(rows.filter(isNoPseudo))
                .sort(function(a,b){ return (Number(a.raw && a.raw.utc) || 0) - (Number(b.raw && b.raw.utc) || 0); });

            // Se não houver sem pseudo, renderiza uma linha “placeholder”
            var toRender = agentRows.length ? agentRows : [null];

            toRender.forEach(function(row, idx) {
                // Atendente
                var atendente = row ? ((row.raw && row.raw.cn) ? row.raw.cn : (row.raw && row.raw.guid) ? row.raw.guid : "-") : "-";
                // Filas de Espera
                var zonaSetor = merged.join(", ");
                if (idx === 0 && fwd.forwarded && fwd.target && !seen.has(fwd.target)) {
                    zonaSetor = zonaSetor ? (zonaSetor + " -> " + fwd.target) : fwd.target;
                }
                // Foi atendida
                var houveAt = row ? (hasConnNoPseudo(row) ? texts.text('labelYes') : texts.text('labelNo')) : texts.text('labelNo');
                // Duração
                var durAgentsSec = row ? durationSecondsFromAgentRow(row) : 0;
                // Tempo de espera (do conf, só na primeira linha)
                var waitSecConf = waitSecondsForConf(rows);
                var waitTime = idx === 0 ? secToHHMMSS(waitSecConf) : "";
                // Transbordo: só "Sim" na primeira linha do grupo se houve forwarded
                var houveTb = (idx === 0 && fwd.forwarded) ? texts.text("labelYes") : texts.text("labelNo");

                var rowCsv = [
                    idx === 0 ? confId : "",
                    idx === 0 ? ajustarHora((g.firstUtc || 0) * 1000, "+00:00") : "",
                    idx === 0 ? caller : "",
                    idx === 0 ? direcao : "",
                    atendente,
                    zonaSetor,
                    houveAt,
                    secToHHMMSS(durAgentsSec),
                    waitTime,
                    houveTb
                ];

                csv += '"' + rowCsv.map(function (s) {
                    return (String(s)).replace(/\n/g," ").replace(/\r/g," ");
                }).join('";"') + '"\n';
            });
        }

        // ===== Download =====
        var blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "relatorio_chamadas.csv";
        link.click();
    }
    function exportTableCallsToPdf() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });

        // Título
        const title = texts.text("labelTitleRptCall");
        doc.setFontSize(14);
        doc.text(title, 10, 12);

        // --- Sumário compacto (lendo do DOM, como no CSV) ---
        const getTxt = id => (document.getElementById(id)?.innerText || "").trim();
        const summaryRows = [
            [getTxt("totalCalls")],
            [getTxt("totalAgents")],
            [getTxt("avgPerUser")],
            [getTxt("totalDuration")],
            [getTxt("avgDuration")],
            [getTxt("totalWait")],
            [getTxt("avgWait")],
        ];

        doc.autoTable({
            head: [[texts.text("labelMetric")]],
            body: summaryRows,
            startY: 16,
            theme: "plain",
            styles: { fontSize: 9, cellPadding: 1.5 },
            headStyles: { fontStyle: "bold" },
            margin: { left: 10, right: 10 }
        });

        const startY = (doc.lastAutoTable?.finalY || 16) + 4;

        // --- Tabela principal: usa o HTML do DOM ---
        doc.autoTable({
            html: `#table-data`,
            startY,
            theme: "grid",
            styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
            headStyles: { fillColor: [9, 33, 62], textColor: 255, fontStyle: "bold" }, // opcional
            bodyStyles: { valign: "top" },
            // Evita quebrar linhas muito curtas, ajuda na paginação de tabelas largas
            columnStyles: {
            0: { cellWidth: 55 },   // ID (conf)
            // ajuste fino opcional para outras colunas, se quiser:
            // 1: { cellWidth: 28 }, // Data e hora
            // 2: { cellWidth: 32 }, // Solicitante
            // 5: { cellWidth: 60 }, // Zona/Setor
            },
            didDrawPage: (data) => {
            const page = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.text(`${texts.text("labelPage")} ${page}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 6);
            }
        });

        doc.save("relatorio_chamadas.pdf");
    }

    //#endregion

    //#region Requisita Relatórios ao Backend

    function requestAvailabilityReport() {
        if (!app || !app.connected) {
            makePopup(texts.text("labelWarning"), texts.text("popupWsNok"), 500, 200);
            return;
        }

        fragments = [];

        var iptUser = document.getElementById("select-user");
        var selected = Array.prototype.slice.call(iptUser.selectedOptions)
            .map(function (opt) { return opt.value; })
            .filter(function (val) { return val; }); // remove valores falsos como ""

        var status = document.getElementById("select-status").value;
        var from = document.getElementById("date-from").value;
        var to = document.getElementById("date-to").value;

        var payload = {
            api: "admin",
            mt: "SelectFromReports",
            src: "RptAvailability",
            guid: selected, // agora sempre será [] ou [guid1, guid2, ...]
            from: from || null,
            to: to || null,
            status: status || null
        };

        app.send(payload);
    }
    function requestScheduleReport() {
        if (!app || !app.connected) {
            makePopup(texts.text("labelWarning"), texts.text("popupWsNok"), 500, 200);
            return;
        }

        fragments = [];

        var iptUser = document.getElementById("select-user");
        var selected = Array.prototype.slice.call(iptUser.selectedOptions)
            .map(function (opt) { return opt.value; })
            .filter(function (val) { return val; }); // remove valores falsos como ""

        var from = document.getElementById("date-from").value;
        var to = document.getElementById("date-to").value;

        var payload = {
            api: "admin",
            mt: "SelectFromReports",
            src: "RptSchedules",
            guid: selected, // agora sempre será [] ou [guid1, guid2, ...]
            from: from || null,
            to: to || null
        };

        app.send(payload);
    }
    function requestCallsReport() {
        if (!app || !app.connected) {
            makePopup(texts.text("labelWarning"), texts.text("popupWsNok"), 500, 200);
            return;
        }

        fragments = [];

        var iptUser = document.getElementById("select-user");
        var selected = Array.prototype.slice.call(iptUser.selectedOptions)
            .map(function (opt) { return opt.value; })
            .filter(function (val) { return val; }); // remove valores falsos como ""

        var from = document.getElementById("date-from").value;
        var to = document.getElementById("date-to").value;

        var payload = {
            api: "admin",
            mt: "SelectFromReports",
            src: "RptCalls",
            guid: selected, // agora sempre será [] ou [guid1, guid2, ...]
            from: from || null,
            to: to || null
        };

        app.send(payload);
    }
    //#endregion

    //#region AVAILABILITY REPORT
    function renderTableAvailability(data) {
        var container = document.getElementById("table-body");
        container.innerHTML = "";

        // Cache global para permitir alternar sem nova consulta
        availabilityDataCache = Array.isArray(data) ? data.slice() : [];

        if(availabilityDataCache.length>0) {
            var btn = document.getElementById("btn-availability-toggle")
            btn.style.display = "flex";
        }else{
            var btn = document.getElementById("btn-availability-toggle")
            btn.style.display = "none";
        }

        // Se o usuário clicou em "Resumo", apenas renderiza o resumo e sai
        if (availabilityViewMode === "summary") {
            renderSummaryAvailabilityFromCache();
            return;
        }

        data.forEach(function (row) {
            //Ajusta a data para o GMT do cliente
            var date = ajustarHora(row.date, clientTimeZone);
            // Localiza o usuário correspondente
            var user = list_users.find(function (u) {
                return u.guid === row.guid;
            });
            // Usa o nome amigável, ou o GUID se não encontrado
            var displayName = user ? (user.cn || user.dn || row.guid) : row.guid;

            var tr = document.createElement("tr");
            tr.className = "border-b";
            tr.innerHTML =
                `<td class='px-4 py-2 text-blue-700'>${displayName}</td>
           <td class='px-4 py-2 text-blue-700'>${date}</td>
           <td class='px-4 py-2 text-blue-700'>${texts.text(row.status) || row.status }</td>
           <td class='px-4 py-2 text-blue-700'>${texts.text(row.detail) || row.detail}</td>`;
            container.appendChild(tr);
        });

        // Mostrar a tabela normal e esconder o resumo
        var tableEl = document.querySelector("#table-body")?.closest("table");
        if (tableEl) tableEl.style.display = "";
        var summaryEl = document.getElementById("availability-view-summary");
        if (summaryEl) summaryEl.style.display = "none";

        var toggleBtn = document.getElementById("btn-availability-toggle");
        if (toggleBtn) updateAvailabilityToggleButtonUI(toggleBtn);
    }
    function renderSummaryAvailabilityFromCache() {
        var wrapper = document.getElementById("report-availability-wrapper") || document.body; // ajuste se tiver um wrapper específico
        var summaryHost = ensureAvailabilitySummaryContainer(wrapper);

        // Esconde a tabela original
        var tableEl = document.querySelector("#table-body")?.closest("table");
        if (tableEl) tableEl.style.display = "none";

        // Mostra o container do resumo
        summaryHost.style.display = "block";
        summaryHost.innerHTML = ""; // limpa

        var data = availabilityDataCache || [];
        if (!data.length) {
            summaryHost.innerHTML = '<div style="opacity:.7">Sem dados para resumir.</div>';
            return;
        }

        // Helpers (usa seu fuso/local; adapte se já tiver util de formatação)
        function toLocalDate(dIso) { return new Date(ajustarHora(dIso, clientTimeZone)); }
        function dayKey(dIso) {
            var d = toLocalDate(dIso);
            var y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,"0"), da = String(d.getDate()).padStart(2,"0");
            return `${y}-${m}-${da}`;
        }
        function fmtDateTime(d) {
            var y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,"0"), da=String(d.getDate()).padStart(2,"0");
            var H=String(d.getHours()).padStart(2,"0"), M=String(d.getMinutes()).padStart(2,"0"), S=String(d.getSeconds()).padStart(2,"0");
            return `${da}/${m}/${y} ${H}:${M}:${S}`;
        }
        function fmtHM(ms) {
            var s = Math.max(0, Math.floor(ms/1000));
            var hh = Math.floor(s/3600), mm = Math.floor((s%3600)/60), ss = s%60;
            return `${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
        }

        // Agrupa por dia -> guid
        var byDayGuid = {};
        data.forEach(function(r){
            var key = dayKey(r.date);
            (byDayGuid[key] ||= {});
            (byDayGuid[key][r.guid] ||= []).push(r);
        });

        // Para cada dia, criamos um "card" com tabela – e para cada guid, 2 linhas (principal + interior)
        Object.keys(byDayGuid).sort().forEach(function(dk){
            var card = document.createElement("div");
            card.style.border = "1px solid #e5e7eb";
            card.style.borderRadius = "8px";
            card.style.padding = "12px";
            card.style.marginBottom = "12px";
            card.style.backgroundColor = "white";

            var title = document.createElement("div");
            title.textContent = `Dia: ${dk}`;
            title.style.fontWeight = "600";
            title.style.marginBottom = "8px";
            card.appendChild(title);

            var tbl = document.createElement("table");
            tbl.style.width = "100%";
            tbl.style.borderCollapse = "collapse";
            var thead = document.createElement("thead");
            thead.innerHTML = `
            <tr style="border-bottom:1px solid #e5e7eb;">
                <th style="text-align:left;padding:8px">${texts.text("labelName")}</th>
                <th style="text-align:left;padding:8px">${texts.text("labelFirstLogin")}</th>
                <th style="text-align:left;padding:8px">${texts.text("labelLastLogout")}</th>
            </tr>`;
            tbl.appendChild(thead);

            var tbody = document.createElement("tbody");

            Object.keys(byDayGuid[dk]).sort().forEach(function(guid){
            var rows = byDayGuid[dk][guid].slice().sort(function(a,b){
                return toLocalDate(a.date) - toLocalDate(b.date);
            });

            var firstLogin = null, lastLogout = null;
            var openLogin = null, totalLoggedMs = 0;

            rows.forEach(function(r){
                var isLogin  = String(r.status).toLowerCase() === "login";
                var isLogout = String(r.status).toLowerCase() === "logout";
                var t = toLocalDate(r.date);

                if (isLogin) {
                if (!firstLogin) firstLogin = t;
                openLogin = t; // mantém o último login aberto
                } else if (isLogout) {
                lastLogout = t;
                if (openLogin && t >= openLogin) {
                    totalLoggedMs += (t - openLogin);
                    openLogin = null;
                }
                }
            });

            var workedMs = (firstLogin && lastLogout && lastLogout >= firstLogin) ? (lastLogout - firstLogin) : 0;


            // Localiza o usuário correspondente
            var user = list_users.find(function (u) {
                return u.guid === guid;
            });
            // Usa o nome amigável, ou o GUID se não encontrado
            var displayName = user ? (user.cn || user.dn || user.sip) : guid;
            // Linha principal
            var trMain = document.createElement("tr");
            trMain.style.borderBottom = "1px solid #f3f4f6";
            trMain.innerHTML = `
                <td style="padding:8px">${displayName}</td>
                <td style="padding:8px">${firstLogin ? fmtDateTime(firstLogin) : "-"}</td>
                <td style="padding:8px">${lastLogout ? fmtDateTime(lastLogout) : "-"}</td>
            `;
            tbody.appendChild(trMain);

            // Linha interior (indentada)
            var trInner = document.createElement("tr");
            trInner.style.borderBottom = "1px solid #e5e7eb";
            var tdInner = document.createElement("td");
            tdInner.colSpan = 3;
            tdInner.style.padding = "8px 8px 12px 32px";
            tdInner.style.fontSize = "12px";
            tdInner.style.opacity = ".9";
            tdInner.innerHTML = `
                <div style="display:flex;gap:24px;flex-wrap:wrap">
                <div><strong>${texts.text("labelTotalWorked")}</strong> ${fmtHM(workedMs)}</div>
                <div><strong>${texts.text("labelTotalLogged")}</strong> ${fmtHM(totalLoggedMs)}</div>
                </div>
            `;
            trInner.appendChild(tdInner);
            tbody.appendChild(trInner);
            });

            tbl.appendChild(tbody);
            card.appendChild(tbl);
            summaryHost.appendChild(card);
        });
    }
    function renderSummaryAvailability(data) {
        var resumo = document.getElementById("summary");
        var loginCount = 0;
        var lastLogin = "-";
        var sessions = {}; // guid => [eventos ordenados por data]

        data.forEach(function (row) {
            if (!sessions[row.guid]) sessions[row.guid] = [];
            sessions[row.guid].push(row);
            if (row.status === "Login") {
                loginCount++;
                lastLogin = row.date;
            }
        });

        var loginAgentCount = Object.keys(sessions).length;

        var totalMinutes = 0;
        var sessionDays = {};

        Object.keys(sessions).forEach(function (guid) {
            var events = sessions[guid].sort(function (a, b) {
                return new Date(a.date) - new Date(b.date);
            });

            for (var i = 0; i < events.length - 1; i++) {
                if (events[i].status === "Login" && events[i + 1].status === "Logout") {
                    var start = new Date(events[i].date);
                    var end = new Date(events[i + 1].date);
                    var minutes = (end - start) / 60000;
                    totalMinutes += minutes;

                    var day = start.toISOString().split("T")[0];
                    if (!sessionDays[day]) sessionDays[day] = 0;
                    sessionDays[day] += minutes;

                    i++; // pular o próximo logout já usado
                }
            }
        });

        var avgPerDay = Object.keys(sessionDays).length > 0 ? (totalMinutes / Object.keys(sessionDays).length) : 0;
        var avgPerAgent = loginAgentCount > 0 ? (totalMinutes / loginAgentCount) : 0;

        resumo.innerHTML = `
            <p id='loginAgentCount' class='text-sm'>${texts.text("labelTotalAgent")} <strong>${loginAgentCount}</strong></p>
            <p id='loginCount' class='text-sm'>${texts.text("labelLoginCount")} <strong>${loginCount}</strong></p>
            <p id='lastLogin' class='text-sm'>${texts.text("labelLastLogin")} <strong>${loginCount == 0 ? lastLogin : ajustarHora(lastLogin, clientTimeZone)}</strong></p>
            <p id='totalMinutes' class='text-sm'>${texts.text("labelTotalTime")} <strong>${secToHHMMSS(totalMinutes * 60)}</strong></p>
            <p id='avgPerDay' class='text-sm'>${texts.text("labelAverageDay")} <strong>${secToHHMMSS(avgPerDay * 60)}</strong></p>
            <p id='avgPerAgent' class='text-sm'>${texts.text("labelAverageAgent")} <strong>${secToHHMMSS(avgPerAgent * 60)}</strong></p>
        `;
        var toggleBtn = document.getElementById("btn-availability-toggle");
        if (toggleBtn) updateAvailabilityToggleButtonUI(toggleBtn);

    }
    function exportTableAvailabilityToCSV() {
        var csv = "";
        
        var title = texts.text("labelTitleRptAgent");
        // Título e resumo
        var summaryValues = {
            loginAgentCount: document.getElementById("loginAgentCount")?.innerText || "",
            loginCount: document.getElementById("loginCount")?.innerText || "",
            lastLogin: document.getElementById("lastLogin")?.innerText || "",
            totalMinutes: document.getElementById("totalMinutes")?.innerText || "",
            avgPerDay: document.getElementById("avgPerDay")?.innerText || "",
            avgPerAgent: document.getElementById("avgPerAgent")?.innerText || ""
        };

        csv = `"${title}"\n\n`; // título
        csv += `"${summaryValues.loginAgentCount}"\n`;
        csv += `"${summaryValues.loginCount}"\n`;
        csv += `"${summaryValues.lastLogin}"\n`;
        csv += `"${summaryValues.totalMinutes}"\n`;
        csv += `"${summaryValues.avgPerDay}"\n`;
        csv += `"${summaryValues.avgPerAgent}"\n`;
        csv += `\n`; // linha em branco antes da tabela

        if (availabilityViewMode === "summary") {
            // Exporta o RESUMO mostrado na tela
            var host = document.getElementById("availability-view-summary");
            if (!host || host.style.display === "none") {
            alert("Nada para exportar.");
            return;
            }
            csv += `"${texts.text("cabecalhoSchedules6")}";"${texts.text("labelFirstLogin")}";"${texts.text("labelLastLogout")}";"${texts.text("labelTotalWorked")}";"${texts.text("labelTotalLogged")}"\n`;
            // Para cada card (dia)
            var cards = host.querySelectorAll("div[style*='border']");
            cards.forEach(function(card, idx){
                //var dayTitle = card.querySelector("div[style*='font-weight']")?.textContent || ("Dia " + (idx+1));
                //csv += `"${dayTitle}"\n`;
                //csv += `"${texts.text("cabecalhoSchedules6")}";"${texts.text("labelFirstLogin")}";"${texts.text("labelLastLogout")}";"${texts.text("labelTotalWorked")}";"${texts.text("labelTotalLogged")}"\n`;


                var rows = card.querySelectorAll("tbody tr");
                for (var i = 0; i < rows.length; i += 2) { // 2 linhas por guid (main + inner)
                    var mainTds = rows[i].querySelectorAll("td");
                    var inner   = rows[i+1]?.querySelector("td")?.innerText || "";
                    // Extrai tempos da linha interior
                    var worked  = (inner.match(/Trabalhado:\s+([0-9:]+)/) || [,""])[1];
                    var logged  = (inner.match(/Logado:\s+([0-9:]+)/) || [,""])[1];

                    var guid  = mainTds[0]?.innerText || "";
                    var first = mainTds[1]?.innerText || "";
                    var last  = mainTds[2]?.innerText || "";

                    csv += `"${guid}";"${first}";"${last}";"${worked}";"${logged}"\n`;
                }
                //csv += `\n`;
            });
        }else{
            // Cabeçalho da tabela
            csv += `"${texts.text("cabecalhoSchedules1")}";"${texts.text("labelFrom")}";"${texts.text("labelStatus")}";"${texts.text("labelDetail")}"\n`;

            // Conteúdo da tabela
            var rows = document.querySelectorAll("#table-body tr");
            for (var i = 0; i < rows.length; i++) {
                var cols = rows[i].querySelectorAll("td");
                var row = [];
                for (var j = 0; j < cols.length; j++) {
                    row.push('"' + cols[j].innerText + '"');
                }
                csv += row.join(";") + "\n";
            }
        }
        //download
        var blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "relatorio_disponibilidade_resumo.csv";
        link.click();
        return;
    }
    function exportTableAvailabilityToPdf(tableId = 'table-data') {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });

        // Título
        const title = texts?.text('labelTitleRptAgent');
        doc.setFontSize(14);
        doc.text(title, 10, 12);

        // --- Summary (pega cada <p> do #summary como 1 linha) ---
        const summaryEl = document.getElementById('summary');
        const summaryRows = summaryEl
            ? Array.from(summaryEl.querySelectorAll('p'))
                .map(p => (p.innerText || '').trim())
                .filter(Boolean)
                .map(t => [t])
            : [];

        if (summaryRows.length) {
            doc.autoTable({
            head: [[texts?.text('labelMetric')]],
            body: summaryRows,
            startY: 16,
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: 1.5 },
            headStyles: { fontStyle: 'bold' },
            margin: { left: 10, right: 10 },
            didDrawPage: () => {
                const page = doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.text(
                `${texts?.text('labelPage')} ${page}`,
                doc.internal.pageSize.getWidth() - 20,
                doc.internal.pageSize.getHeight() - 6
                );
            },
            });
        }

        let startY = (doc.lastAutoTable?.finalY || 16) + 4;

        // --- Decide o que exportar conforme availabilityViewMode ---
        const mode = String(availabilityViewMode || 'table').toLowerCase();

        if (mode === 'table') {
            // Exporta a tabela principal (#table-data por padrão)
            const tableEl = document.getElementById(tableId) || document.querySelector('#' + tableId);
            if (!tableEl) {
            console.warn('Tabela de disponibilidade não encontrada: #' + tableId);
            } else {
            doc.autoTable({
                html: tableEl,
                startY,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
                headStyles: { fillColor: [9, 33, 62], textColor: 255, fontStyle: 'bold' },
                bodyStyles: { valign: 'top' },
                didDrawPage: () => {
                const page = doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.text(
                    `${texts?.text('labelPage') || 'Página'} ${page}`,
                    doc.internal.pageSize.getWidth() - 20,
                    doc.internal.pageSize.getHeight() - 6
                );
                },
            });
            }
        } else {
            // Exporta a visão de resumo de disponibilidade
            const viewEl = document.getElementById('availability-view-summary');
            if (!viewEl) {
            console.warn('Div de resumo de disponibilidade não encontrada: #availability-view-summary');
            } else {
            const innerTables = Array.from(viewEl.querySelectorAll('table'));
            if (innerTables.length) {
                // Se houver tabelas internas, exporta cada uma
                innerTables.forEach((tbl, idx) => {
                if (idx > 0) startY = (doc.lastAutoTable?.finalY || startY) + 4;
                doc.autoTable({
                    html: tbl,
                    startY,
                    theme: 'grid',
                    styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
                    headStyles: { fillColor: [9, 33, 62], textColor: 255, fontStyle: 'bold' },
                    bodyStyles: { valign: 'top' },
                    didDrawPage: () => {
                    const page = doc.internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.text(
                        `${texts?.text('labelPage')} ${page}`,
                        doc.internal.pageSize.getWidth() - 20,
                        doc.internal.pageSize.getHeight() - 6
                    );
                    },
                });
                });
            } else {
                // Sem tabelas: transforma blocos de texto em linhas simples
                const blocks = Array.from(
                viewEl.querySelectorAll('h1,h2,h3,h4,h5,h6,.metric,li,p')
                )
                .map(n => (n.innerText || '').trim())
                .filter(Boolean)
                .map(t => [t]);

                if (blocks.length) {
                doc.autoTable({
                    head: [[texts?.text('labelAvailabilityView') || 'Disponibilidade']],
                    body: blocks,
                    startY,
                    theme: 'plain',
                    styles: { fontSize: 9, cellPadding: 1.5 },
                    headStyles: { fontStyle: 'bold' },
                    margin: { left: 10, right: 10 },
                    didDrawPage: () => {
                    const page = doc.internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.text(
                        `${texts?.text('labelPage')} ${page}`,
                        doc.internal.pageSize.getWidth() - 20,
                        doc.internal.pageSize.getHeight() - 6
                    );
                    },
                });
                }
            }
            }
        }

        doc.save('disponibilidade.pdf');
    }


    //#endregion

    //#region SCHEDULES REPORT
    function renderTableSchedules(data) {
        var container = document.getElementById("table-body");
        container.innerHTML = "";

        data.forEach(function (row) {
            //Ajusta a data para o GMT do cliente
            var date = ajustarHora(row.date, clientTimeZone);
            // Localiza o usuário correspondente
            var user = list_users.find(function (u) {
                return u.sip === row.sip;
            });
            // Usa o nome amigável, ou o GUID se não encontrado
            var displayName = user ? (user.cn || user.dn || row.h323) : row.sip;

            var tr = document.createElement("tr");
            tr.className = "border-b";
            tr.innerHTML =
                `<td class="px-4 py-2 text-blue-700">${row.id}</td>
            <td class="px-4 py-2 text-blue-700">${displayName}</td>
            <td class="px-4 py-2 text-blue-700">${row.name}</td>
            <td class="px-4 py-2 text-blue-700">${row.email}</td>
            <td class="px-4 py-2 text-blue-700">${ajustarHora(row.time_start, clientTimeZone)}</td>
            <td class="px-4 py-2 text-blue-700">${ajustarHora(row.time_end, clientTimeZone)}</td>
            <td id="'${row.conf_link}'" class="px-4 py-2">
                <button class="text-blue-700 hover:underline" onclick="window.open('${row.conf_link}')">
                    ${texts.text("btnLink")}
                </button>
            </td>`;
            container.appendChild(tr);
        });
    }
    function renderSummarySchedules(data) {
        var resumo = document.getElementById("summary");
        var count = 0;
        var lastSched = "-";
        var sessions = {}; // guid => [eventos ordenados por data]

        data.forEach(function (row) {
            if (!sessions[row.sip]) sessions[row.sip] = [];
            sessions[row.sip].push(row);
            //if (row.status === "Login") {
            //    loginCount++;
            //    lastLogin = row.date;
            //}
            count++;
            lastSched = row.time_start;
        });

        var schedAgentCount = Object.keys(sessions).length;

        var totalMinutes = 0;
        var sessionDays = {};

        Object.keys(sessions).forEach(function (sip) {
            var events = sessions[sip].sort(function (a, b) {
                return new Date(a.time_start) - new Date(b.time_start);
            });

            for (var i = 0; i < events.length - 1; i++) {
                var start = new Date(events[i].time_start);
                var end = new Date(events[i].time_end);
                var minutes = (end - start) / 60000;
                totalMinutes += minutes;

                var day = start.toISOString().split("T")[0];
                if (!sessionDays[day]) sessionDays[day] = 0;
                sessionDays[day] += minutes;

                i++; // pular o próximo logout já usado
            }
        });

        var avgPerDay = Object.keys(sessionDays).length > 0 ? (totalMinutes / Object.keys(sessionDays).length) : 0;
        var avgPerAgent = schedAgentCount > 0 ? (totalMinutes / schedAgentCount) : 0;

        resumo.innerHTML = `
        <p id='schedAgentCount' class='text-sm'>${texts.text("labelTotalScheduler")} <strong>${schedAgentCount}</strong></p>
        <p id='schedCount' class='text-sm'>${texts.text("labelSchedulerCount")} <strong>${count}</strong></p>
        <p id='lastSched' class='text-sm'>${texts.text("labelLastScheduler")} <strong>${count == 0 ? lastSched : ajustarHora(lastSched, clientTimeZone)}</strong></p>
        <p id='totalMinutes' class='text-sm'>${texts.text("labelTotalTime")} <strong>${Math.round(totalMinutes)} ${texts.text("labelMinutes")}</strong></p>
        <p id='avgPerDay' class='text-sm'>${texts.text("labelAverageDay")} <strong>${Math.round(avgPerDay)} ${texts.text("labelMinutes")}</strong></p>
        <p id='avgPerAgent' class='text-sm'>${texts.text("labelAverageAgent")} <strong>${Math.round(avgPerAgent)} ${texts.text("labelMinutes")}</strong></p>
    `;
    }
    function exportTableSchedulesToCSV() {
        var title = texts.text("labelTitleRptSchedule");

        // Título e resumo
        var summaryValues = {
            schedAgentCount: document.getElementById("schedAgentCount")?.innerText || "",
            schedCount: document.getElementById("schedCount")?.innerText || "",
            lastSched: document.getElementById("lastSched")?.innerText || "",
            totalMinutes: document.getElementById("totalMinutes")?.innerText || "",
            avgPerDay: document.getElementById("avgPerDay")?.innerText || "",
            avgPerAgent: document.getElementById("avgPerAgent")?.innerText || ""
        };

        let csv = `"${title}"\n\n`; // título
        csv += `"${summaryValues.schedAgentCount}"\n`;
        csv += `"${summaryValues.schedCount}"\n`;
        csv += `"${summaryValues.lastSched}"\n`;
        csv += `"${summaryValues.totalMinutes}"\n`;
        csv += `"${summaryValues.avgPerDay}"\n`;
        csv += `"${summaryValues.avgPerAgent}"\n`;
        csv += `\n`; // linha em branco antes da tabela

        // Cabeçalho da tabela
        csv += `"${texts.text("cabecalhoSchedules0")}";"${texts.text("cabecalhoSchedules6")}";"${texts.text("cabecalhoSchedules1")}";"${texts.text("cabecalhoSchedules2")}";"${texts.text("cabecalhoSchedules3")}";"${texts.text("cabecalhoSchedules4")}";"${texts.text("cabecalhoSchedules5")}"\n"`;

        // Conteúdo da tabela
        var rows = document.querySelectorAll("#table-body tr");
        for (var i = 0; i < rows.length; i++) {
            var cols = rows[i].querySelectorAll("td");
            var row = [];
            for (var j = 0; j < cols.length; j++) {
                if (j == 6) {
                    row.push('"' + cols[j].id + '"');
                } else {
                    row.push('"' + cols[j].innerText + '"');
                }
            }
            csv += row.join(";") + "\n";
        }

        // Gera e baixa o arquivo CSV
        var blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "relatorio_agedamentos.csv";
        link.click();
    }
    function exportTableSchedulesToPdf() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });

        // Título
        const title = texts.text("labelTitleRptSchedule");
        doc.setFontSize(14);
        doc.text(title, 10, 12);

        // --- Sumário (usa os mesmos elementos do DOM) ---
        const getTxt = (id) => (document.getElementById(id)?.innerText || "").trim();
        const summaryLines = [
            getTxt("schedAgentCount"),
            getTxt("schedCount"),
            getTxt("lastSched"),
            getTxt("totalMinutes"),
            getTxt("avgPerDay"),
            getTxt("avgPerAgent"),
        ].filter(Boolean).map(s => [s]); // uma coluna, mesma pegada que você usou nos calls

        doc.autoTable({
            head: [[texts.text("labelMetric")]],
            body: summaryLines,
            startY: 16,
            theme: "plain",
            styles: { fontSize: 9, cellPadding: 1.5 },
            headStyles: { fontStyle: "bold" },
            margin: { left: 10, right: 10 }
        });

        const startY = (doc.lastAutoTable?.finalY || 16) + 4;

        // --- Localiza a tabela de agendamentos ---
        let tableEl =
            document.getElementById('table-data') ||
            document.querySelector('#table-body')?.closest('table');

        if (!tableEl) {
            console.warn('Tabela de agendamentos não encontrada. Passe o ID do <table> para exportSchedulesToPdf().');
            return;
        }

        // --- Tabela principal: usa o HTML do DOM (cabeçalho repete automático) ---
        doc.autoTable({
            html: tableEl,                 // pode ser o elemento direto
            startY,
            theme: "grid",
            styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
            headStyles: { fillColor: [9, 33, 62], textColor: 255, fontStyle: "bold" }, // opcional
            bodyStyles: { valign: "top" },
            // Ajustes finos de largura (opcionais — comente/ajuste conforme seu cabeçalho)
            // columnStyles: {
            //   0: { cellWidth: 26 }, // ID
            //   1: { cellWidth: 36 }, // Usuário
            //   2: { cellWidth: 44 }, // Nome
            //   3: { cellWidth: 46 }, // Email
            //   4: { cellWidth: 30 }, // Início
            //   5: { cellWidth: 30 }, // Fim
            //   6: { cellWidth: 30 }, // Link
            // },
            didDrawPage: () => {
            const page = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.text(`${texts.text("labelPage")} ${page}`,
                doc.internal.pageSize.getWidth() - 20,
                doc.internal.pageSize.getHeight() - 6
            );
            }
        });

        doc.save("agendamentos.pdf");
    }

    //#endregion
}

Wecom.dwcschedulerAdmin.prototype = innovaphone.ui1.nodePrototype;
