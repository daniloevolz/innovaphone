
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

    function app_connected(domain, user, dn, appdomain) {
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
        if (obj.api == "admin" && obj.mt == "UpdateConfigMessageErro") {
            window.alert("Erro ao atualizar as configurações, verifique os logs do serviço.");
        }
        if (obj.api == "admin" && obj.mt == "UpdateConfigMessageSuccess") {
            makeDivGeral(_colDireita);
            window.alert("Configurações Atualizadas com suecesso!");
            
        }
        if (obj.api == "admin" && obj.mt == "UpdateConfigGoogleMessageSuccess") {
            makeDivGoogle(_colDireita);
            window.alert("Configurações Atualizadas com suecesso!");

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
            makeDivLicense(_colDireita);
        }
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
        colEsquerda.setAttribute("id","colesquerda")
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
        var Arelatorios2 = lirelatorios2.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgGoogle"), null));
        Arelatorios2.setAttribute("id", "CfgGoogle");
        var Arelatorios3 = lirelatorios3.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgLicense"), null));
        Arelatorios3.setAttribute("id", "CfgLicense");

        var divother = colEsquerda.add(new innovaphone.ui1.Div("text-align: left; position: absolute; top:59%;", null, null));
        var divother2 = divother.add(new innovaphone.ui1.Div(null, null, "otherli"));

        var config = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 90%;", null, null));
        var liconfig = config.add(new innovaphone.ui1.Node("li", "display:flex; aligns-items: center", null, "config"));

        var imgconfig = liconfig.add(new innovaphone.ui1.Node("img", "width: 100%; opacity: 0.9; margin: 2px; ", null, null));
        imgconfig.setAttribute("src", "logo.png");
        //var Aconfig = liconfig.add(new innovaphone.ui1.Node("a", "display: flex; align-items: center; justify-content: center;", texts.text("labelConfig"), null));
        //Aconfig.setAttribute("href", "#");

        var a = document.getElementById("CfgGeral");
        a.addEventListener("click", function () {
            ChangeView("CfgGeral", colDireita) 
            if (window.matchMedia("(max-width: 500px)").matches) {
                openColDireita()
                console.log("Media Query 500px");
            }
            })
        var a = document.getElementById("CfgGoogle");
        a.addEventListener("click", function () { 
            ChangeView("CfgGoogle", colDireita) 
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

        _colDireita = colDireita;
    }
    function ChangeView(ex, colDireita) {

        if (ex == "CfgGeral") {
            makeDivGeral(colDireita);
        }
        if (ex == "CfgGoogle") {
            makeDivGoogle(colDireita);
        }
        if (ex == "CfgLicense") {
            app.send({ api: "admin", mt: "ConfigLicense"});
            waitConnection(colDireita);
        }
    }
    function waitConnection(t) {
        t.clear();
        var bodywait = new innovaphone.ui1.Div("height: 100%; width: 100%; display: inline-flex; position: absolute;justify-content: center; background-color:rgba(100,100,100,0.5)", null, "bodywaitconnection")
        bodywait.addHTML('<svg class="pl" viewBox="0 0 128 128" width="128px" height="128px" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="hsl(193,90%,55%)" /><stop offset="100%" stop-color="hsl(223,90%,55%)" /></linearGradient></defs>	<circle class="pl__ring" r="56" cx="64" cy="64" fill="none" stroke="hsla(0,10%,10%,0.1)" stroke-width="16" stroke-linecap="round" />	<path class="pl__worm" d="M92,15.492S78.194,4.967,66.743,16.887c-17.231,17.938-28.26,96.974-28.26,96.974L119.85,59.892l-99-31.588,57.528,89.832L97.8,19.349,13.636,88.51l89.012,16.015S81.908,38.332,66.1,22.337C50.114,6.156,36,15.492,36,15.492a56,56,0,1,0,56,0Z" fill="none" stroke="url(#pl-grad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="44 1111" stroke-dashoffset="10" /></svg >');
        t.add(bodywait);
    }
    function makeDivGeral(t) {
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
        var Inputpassword = t.add(new innovaphone.ui1.Input(null, password, null, null, "text","DivGeralAdminIptSenha").setAttribute("id", "Inputpassword"));


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
    function makeDivLicense(t) {
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
                window.alert("A chave de licença precisa ser informada!");
            }
            
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
}

Wecom.dwcschedulerAdmin.prototype = innovaphone.ui1.nodePrototype;
