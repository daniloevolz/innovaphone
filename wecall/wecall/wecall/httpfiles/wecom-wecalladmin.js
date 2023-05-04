
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />
/// <reference path="../../web1/ui1.switch/innovaphone.ui1.switch.js" />
/// <reference path="../../web1/ui1.popup/innovaphone.ui1.popup.js" />
/// <reference path="../../web1/ui1.listview/innovaphone.ui1.listview.js" />

var Wecom = Wecom || {};
Wecom.wecallAdmin = Wecom.wecallAdmin || function (start, args) {
    this.createNode("body");
    var that = this;
    var appdn = start.title;
    var avatar = start.consumeApi("com.innovaphone.avatar");

    var colorSchemes = {
        dark: {
            "--bg": "url('bg.png')",
            "--button": "#c6c6c6",
            "--text-standard": "#004c84",
        },
        light: {
            "--bg": "url('bg.png')",
            "--button": "#c6c6c6",
            "--text-standard": "#004c84",
        }
    };
    var schemes = new innovaphone.ui1.CssVariables(colorSchemes, start.scheme);
    start.onschemechanged.attach(function () { schemes.activate(start.scheme) });

    var texts = new innovaphone.lib1.Languages(Wecom.wecallTexts, start.lang);

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;
    app.onerror = waitConnection(that);
    app.onclosed = waitConnection(that);
    var UrlCallList;
    var UrlCallEvents;
    var CallList;
    var CallEvents;
    var UrlDashboard;
    var UrlSSO;
    var CodClient;
    var url;
    var urlG;
    var CodLeaveGroups;
    var LeaveGroupsStartup;
    var UIuser;
    var UIuserPicture;
    var list_users = [];
    var dashboard_apps = [];
    var _colDireita;
    var licenseToken;
    var licenseFile;
    var licenseActive;
    var licenseInstallDate;
    var licenseUsed;

    function makeDivCallListAPI(t) {
        t.clear();
        //CallList
        var labelCallList = t.add(new innovaphone.ui1.Div("position: absolute;left: 0px;width: 100%; top: 10%; font-size: 15px; text-align: center; text-decoration: underline;color: blue;", texts.text("labelCallListAdmin")));
        var labelChkCallList = t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:15%; font-size:15px; text-align:right", texts.text("labelChkCallList")));
        var switchCallList = t.add(new innovaphone.ui1.Switch("position:absolute; left:16%; top:15%;",null,null,CallList));
        switchCallList.addEvent("click", onCallListSwitchCLick);

        var labelURLCallList = t.add(new innovaphone.ui1.Div("position:absolute; left:20%; width:15%; top:15%; font-size:15px; text-align:right", texts.text("labelURLCallList")));
        var iptUrlCallList = t.add(new innovaphone.ui1.Input("position:absolute; left:36%; width:30%; top:15%; font-size:12px; text-align:center", UrlCallList, texts.text("urlText"), 255, "url", null));

        t.add(new innovaphone.ui1.Div("position:absolute; left:80%; width:15%; top:15%; font-size:15px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
            app.send({ api: "admin", mt: "UpdateConfig", prt: "urlCallHistory", vl: String(iptUrlCallList.getValue()) });
        });
        var onCallListSwitchCLick = function() {
            var state = switchCallList.getValue();
            //e.currentTarget.state;
            app.send({ api: "admin", mt: "UpdateConfig", prt: "sendCallHistory", vl: state });
        }
    }

    function makeDivCallEventsAPI(t) {
        t.clear();
        //RCC CallEvents
        var labelCallEvents = t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:10%; font-size:15px; text-align:center;text-decoration: underline;color: blue;", texts.text("labelCallEventsAdmin")));
        var labelChkCallEvents = t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:15%; top:15%; font-size:15px; text-align:right", texts.text("labelChkCallEvents")));
        var switchCallEvents = t.add(new innovaphone.ui1.Switch("position:absolute; left:16%; top:15%;",null,null,CallEvents));
        switchCallEvents.addEvent("click", onCallEventsSwitchCLick);

        var labelURLCallEvents = t.add(new innovaphone.ui1.Div("position:absolute; left:20%; width:15%; top:15%; font-size:15px; text-align:right", texts.text("labelURLCallEvents")));
        var iptUrlCallEvents = t.add(new innovaphone.ui1.Input("position:absolute; left:36%; width:30%; top:15%; font-size:12px; text-align:center", UrlCallEvents, texts.text("urlText"), 255, "url", null));

        t.add(new innovaphone.ui1.Div("position:absolute; left:80%; width:15%; top:15%; font-size:15px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
            app.send({ api: "admin", mt: "UpdateConfig", prt: "urlPhoneApiEvents", vl: String(iptUrlCallEvents.getValue()) });
        });

        var onCallEventsSwitchCLick = function() {

            var state = switchCallEvents.getValue();
            //e.currentTarget.state;
            app.send({ api: "admin", mt: "UpdateConfig", prt: "sendCallEvents", vl: state });
        }

    }

    function makeDivDashboards(t) {
        t.clear();
        
        //Botões Tabela
        t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:0%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnAdd").addEvent("click", function () {
            makeDivAddURLDash(t);
        });
        t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:0%; font-size:12px; text-align:center; color:var(--div-DelBtn); background-color: #B0132B", null, "button-inn")).addTranslation(texts, "btnDel").addEvent("click", function () {
            var selected = listView.getSelectedRows();
            console.log(selected);
            var selectedrows = [];

            selected.forEach(function (s) {
                console.log(s);
                selectedrows.push(listView.getRowData(s))
                console.log(selectedrows[0]);
                app.send({ api: "admin", mt: "DelURLDashMessage", id: parseInt(selectedrows[0]) });
            })
        });
        //Título Tabela
        var labelTituloTabela = t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:30%; top:10%; font-size:17px; text-align:center; font-weight: bold", texts.text("labelUrlDashTitulo")));
        var list = new innovaphone.ui1.Div("background-color: rgba(128, 130, 131, 0.48); position: absolute; left:2px; top:15%; right:2px; height:fit-content", null, "");
        var columns = 4;
        var listView = new innovaphone.ui1.ListView(list, 50, "headercl", "arrow", false);
        //Cabeçalho
        for (i = 0; i < columns; i++) {
            listView.addColumn(null, "text", texts.text("cabecalhoUrlDash" + i), i, 10, false);
        }
        //Tabela    
        dashboard_apps.forEach(function (b) {
            var row = [];
            row.push(b.id);
            row.push(b.sip);
            row.push(b.app_name);
            row.push(b.url);
            row.push(b.date_add);
            listView.addRow(i, row, "rowcl", "#A0A0A0", "#82CAE2");
            t.add(list);
        })
    }

    function makeDivAddURLDash(t) {
        t.clear();
        //Título
        t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("labelUrlDashTitulo")));

        //Usuário
        t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:15%; font-size:15px; text-align:right", texts.text("labelUser")));
        var iptUser = t.add(new innovaphone.ui1.Node("select", "position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", null, null));
        iptUser.setAttribute("id", "selectUser");
        list_users.forEach(function (user) {
            iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.sip, null));
        })
        //var iptUser = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
        //Nome App
        t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:20%; font-size:15px; text-align:right", texts.text("labelAppName")));
        var iptName = t.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:20%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));

        //URL
        t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:30%; font-size:15px; text-align:right", texts.text("urlText")));
        var iptURLDash = t.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:30%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));

        

        //Botão Salvar
        t.add(new innovaphone.ui1.Div("position:absolute; left:55%; width:15%; top:10%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
            var user = document.getElementById("selectUser").value;
            if (String(iptName.getValue()) == "" || String(iptURLDash.getValue()) == "...") {
                window.alert("Aten��o!! Complete todos os campos para que o aplicativo possa ser configurado.");
            }
            else {
                app.send({ api: "admin", mt: "AddURLDashMessage", app: String(iptName.getValue()), url: String(iptURLDash.getValue()), sip: String(user) });
            }
        });
        //Botão Cancelar   
        t.add(new innovaphone.ui1.Div("position:absolute; left:55%; width:15%; top:20%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnCancel").addEvent("click", function () {
            makeDivDashboards(t);
        });
    }
    
    function makeDivLogin(t) {
        t.clear();
        //URL SSO
        var labelUrlSSOTitulo = t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:10%; font-size:15px; text-align:center; text-decoration: underline;color: blue;", texts.text("labelSSO")));
        var labelUrlSSO = t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:15%; top:15%; font-size:15px; text-align:right", texts.text("labelUrlSSO")));
        var iptUrlSSO = t.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", UrlSSO, texts.text("urlText"), 255, "url", null));

        t.add(new innovaphone.ui1.Div("position:absolute; left:80%; width:15%; top:15%; font-size:15px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
            app.send({ api: "admin", mt: "UpdateConfig", prt: "urlSSO", vl: String(iptUrlSSO.getValue()) });
        });

        //Código Cliente
        var labelCodClient = t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:15%; top:25%; font-size:15px; text-align:right", texts.text("labelCodCient")));
        var iptCodClient = t.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:20%; top:25%; font-size:12px; text-align:center", CodClient, texts.text("urlText"), 255, "url", null));
        t.add(new innovaphone.ui1.Div("position:absolute; left:61%; width:15%; top:25%; height:auto; font-size:15px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
            app.send({ api: "admin", mt: "UpdateConfig", prt: "CodClient", vl: String(iptCodClient.getValue()) });
        });
        //URL Autenticação SSO
        var labelUrl = t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:15%; top:35%; font-size:15px; text-align:right", texts.text("labelUrl")));
        var ipturl = t.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:35%; font-size:12px; text-align:center", url, texts.text("urlText"), 255, "url", null));
        t.add(new innovaphone.ui1.Div("position:absolute; left:80%; width:15%; top:35%; height:auto; font-size:15px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
            app.send({ api: "admin", mt: "UpdateConfig", prt: "Url", vl: String(ipturl.getValue()) });
        });
    }
    
    function makeDivMonitor(t) {
        t.clear();
        var labelMonitorTitulo = t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:10%; font-size:15px; text-align:center; text-decoration: underline;color: blue;", texts.text("labelMonitorTitulo")));

        //URL Get Queue Groups Monitoring
        var labelUrl = t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:15%; top:15%; font-size:15px; text-align:right", texts.text("labelUrlG")));
        var ipturlG = t.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", urlG, texts.text("urlText"), 255, "url", null));
        t.add(new innovaphone.ui1.Div("position:absolute; left:80%; width:15%; top:15%; height:auto; font-size:15px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
            app.send({ api: "admin", mt: "UpdateConfig", prt: "UrlG", vl: String(ipturlG.getValue()) });
        });

        //Código Sair de Todos os Grupos
        var labelCodLeaveGroups = t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:15%; top:25%; font-size:15px; text-align:right", texts.text("labelCodLeaveGroups")));
        var iptCodLeaveGroups = t.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:20%; top:25%; font-size:12px; text-align:center", CodLeaveGroups, texts.text("urlText"), 255, "url", null));
        t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:25%; height:auto; font-size:15px; text-align:center", null, "button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
            app.send({ api: "admin", mt: "UpdateConfig", prt: "CodLeaveGroups", vl: String(iptCodLeaveGroups.getValue()) });
        });
        //Checkbox sair dos grupos ao entrar
        var labelChkLeaveGroupsStartup = t.add(new innovaphone.ui1.Div("position:absolute; left:70%; width:15%; top:25%; font-size:15px; text-align:right", texts.text("labelChkLeaveGroupsStartup")));
        var switchLeaveGroupsStartup = t.add(new innovaphone.ui1.Switch("position:absolute; left:90%; top:25%;",null,null,LeaveGroupsStartup));
        switchLeaveGroupsStartup.addEvent("click", onLeaveGroupsStartupSwitchCLick);

        var onLeaveGroupsStartupSwitchCLick = function() {

            var state = switchLeaveGroupsStartup.getValue();
            //e.currentTarget.state;
            app.send({ api: "admin", mt: "UpdateConfig", prt: "leaveGroupsStartup", vl: state });
        }
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
        t.add(new innovaphone.ui1.Div("position:absolute; left:82%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
            licenseFile = document.getElementById("InputLicenseFile").value;
            if (licenseFile.length > 0) {
                app.send({ api: "admin", mt: "UpdateConfigLicenseMessage", licenseToken: licenseToken, licenseFile: licenseFile });
                waitConnection(t);
            } else {
                window.alert("A chave de licença precisa ser informada!");
            }

        });

    }

    function app_connected(domain, user, dn, appdomain) {
        //avatar
        avatar = new innovaphone.Avatar(start, user, domain);
        UIuserPicture = avatar.url(user, 80, dn);

        app.send({ api: "admin", mt: "AdminMessage" });
        app.send({ api: "admin", mt: "SelectURLDashMessage" });
        UIuser = dn;
        constructor();
    }

    function app_message(obj) {
        if (obj.api == "admin" && obj.mt == "UpdateConfigResult") {
            UrlCallList=obj.urlH;
            UrlCallEvents=obj.urlP;
            CallList=obj.sH;
            CallEvents=obj.sP;
            UrlDash=obj.urlD;
            UrlSSO=obj.urlSSO;
            CodClient=obj.CodCli;
            url=obj.url;
            urlG=obj.urlG;
            CodLeaveGroups=obj.CodLeave;
            LeaveGroupsStartup = obj.sLS;
        }
        if (obj.api == "admin" && obj.mt == "TableUsersResult") {
            console.log("TableUsersResult:result="+obj.result);
            list_users = [];
            list_users = JSON.parse(obj.result);
        }
        if (obj.api == "admin" && obj.mt == "SelectURLDashResultSuccess") {
            console.log("TableUsersResult:result=" + obj.result);
            dashboard_apps = [];
            dashboard_apps = JSON.parse(obj.result);
        }
        if (obj.api == "admin" && obj.mt == "AddURLDashMessageSucess") {
            console.log("AddURLDashMessageSucess:result=" + obj.result);
            dashboard_apps = [];
            dashboard_apps = JSON.parse(obj.result);
            makeDivDashboards(_colDireita);

        }
        if (obj.api == "admin" && obj.mt == "DelURLDashMessageSucess") {
            console.log("DelURLDashMessageSucess:result=" + obj.result);
            dashboard_apps = [];
            dashboard_apps = JSON.parse(obj.result);
            makeDivDashboards(_colDireita);

        }
        if (obj.api == "admin" && obj.mt == "UpdateConfigLicenseMessageSuccess") {
            app.send({ api: "admin", mt: "ConfigLicense" });
            waitConnection(_colDireita);
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
            makeDivLicense(_colDireita);
        }
    }
    

    function constructor() {
        that.clear();
        // col direita
        var colDireita = that.add(new innovaphone.ui1.Div(null, null, "colunadireita"));
        //Título
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
        var lirelatorios4 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        var lirelatorios5 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        var lirelatorios6 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        lirelatorios1.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgLogin"), null).setAttribute("id", "CfgLogin"));
        lirelatorios2.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgCallListAPI"), null).setAttribute("id", "CfgCallListAPI"));
        lirelatorios3.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgCallEventAPI"), null).setAttribute("id", "CfgCallEventAPI"));
        lirelatorios4.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgMonitor"), null).setAttribute("id", "CfgMonitor"));
        lirelatorios5.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgDashboards"), null).setAttribute("id", "CfgDashboards"));
        lirelatorios6.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgLicense"), null).setAttribute("id", "CfgLicense"));


        var divother = colEsquerda.add(new innovaphone.ui1.Div("text-align: left; position: absolute; top:59%;", null, null));
        var divother2 = divother.add(new innovaphone.ui1.Div(null, null, "otherli"));

        var config = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 90%;", null, null));
        var liconfig = config.add(new innovaphone.ui1.Node("li", "display:flex; aligns-items: center", null, "config"));

        var imgconfig = liconfig.add(new innovaphone.ui1.Node("img", "width: 100%; opacity: 0.9; margin: 2px; ", null, null));
        imgconfig.setAttribute("src", "logo.png");
        //var Aconfig = liconfig.add(new innovaphone.ui1.Node("a", "display: flex; align-items: center; justify-content: center;", texts.text("labelConfig"), null));
        //Aconfig.setAttribute("href", "#");

        var a = document.getElementById("CfgLogin");
        a.addEventListener("click", function () { ChangeView("CfgLogin", colDireita) })

        var a = document.getElementById("CfgCallListAPI");
        a.addEventListener("click", function () { ChangeView("CfgCallListAPI", colDireita) })

        var a = document.getElementById("CfgCallEventAPI");
        a.addEventListener("click", function () { ChangeView("CfgCallEventAPI", colDireita) })

        var a = document.getElementById("CfgMonitor");
        a.addEventListener("click", function () { ChangeView("CfgMonitor", colDireita) })

        var a = document.getElementById("CfgDashboards");
        a.addEventListener("click", function () { ChangeView("CfgDashboards", colDireita) })

        var a = document.getElementById("CfgLicense");
        a.addEventListener("click", function () {
            app.send({ api: "admin", mt: "ConfigLicense" });
            waitConnection(colDireita);
        })

        _colDireita = colDireita;
    }

    function ChangeView(ex, colDireita) {

        if (ex == "CfgLogin") {
            makeDivLogin(colDireita);
        }
        if (ex == "CfgCallListAPI") {
            makeDivCallListAPI(colDireita);
        }
        if (ex == "CfgCallEventAPI") {
            makeDivCallEventsAPI(colDireita);
        }
        if (ex == "CfgMonitor") {
            makeDivMonitor(colDireita);
        }
        if (ex == "CfgDashboards") {
            makeDivDashboards(colDireita);
        }
    }

    function waitConnection(t) {
        t.clear();
        var bodywait = new innovaphone.ui1.Div("height: 100%; width: 100%; display: inline-flex; position: absolute;justify-content: center; background-color:rgba(100,100,100,0.5)", null, "bodywaitconnection")
        bodywait.addHTML('<svg class="pl" viewBox="0 0 128 128" width="128px" height="128px" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="hsl(193,90%,55%)" /><stop offset="100%" stop-color="hsl(223,90%,55%)" /></linearGradient></defs>	<circle class="pl__ring" r="56" cx="64" cy="64" fill="none" stroke="hsla(0,10%,10%,0.1)" stroke-width="16" stroke-linecap="round" />	<path class="pl__worm" d="M92,15.492S78.194,4.967,66.743,16.887c-17.231,17.938-28.26,96.974-28.26,96.974L119.85,59.892l-99-31.588,57.528,89.832L97.8,19.349,13.636,88.51l89.012,16.015S81.908,38.332,66.1,22.337C50.114,6.156,36,15.492,36,15.492a56,56,0,1,0,56,0Z" fill="none" stroke="url(#pl-grad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="44 1111" stroke-dashoffset="10" /></svg >');
        t.add(bodywait);
    }
}

Wecom.wecallAdmin.prototype = innovaphone.ui1.nodePrototype;
