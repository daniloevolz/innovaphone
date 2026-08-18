
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.cotacaoAdmin = Wecom.cotacaoAdmin || function (start, args) {
    this.createNode("body");
    var that = this;
    

    var texts = new innovaphone.lib1.Languages(Wecom.cotacaoTexts, start.lang);

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    // Main Container
    var container = that.add(new innovaphone.ui1.Div(null, null, "wecom-admin-container"));
    
    // Header
    var header = container.add(new innovaphone.ui1.Div(null, null, "wecom-admin-header"));
    header.add(new innovaphone.ui1.Div(null, texts.text("labelTituloAdmin"), "wecom-admin-title"));
    header.add(new innovaphone.ui1.Div(null, "Configure as fontes de cotações", "wecom-admin-subtitle"));

    // B3 Section
    var sectionB3 = container.add(new innovaphone.ui1.Div(null, null, "wecom-admin-section"));
    sectionB3.add(new innovaphone.ui1.Div(null, texts.text("labelB3Admin"), "wecom-admin-section-title"));
    
    var formGroupB3 = sectionB3.add(new innovaphone.ui1.Div(null, null, "wecom-admin-form-group"));
    formGroupB3.add(new innovaphone.ui1.Div(null, texts.text("labelURLb3"), "wecom-admin-label"));
    var iptUrlB3 = formGroupB3.add(new innovaphone.ui1.Input(null, null, texts.text("urlText"), 255, "url", null));
    iptUrlB3.setAttribute("id", "inputB3");
    iptUrlB3.setAttribute("class", "wecom-admin-input");
    iptUrlB3.setAttribute("placeholder", "https://...");
    
    var buttonContainerB3 = sectionB3.add(new innovaphone.ui1.Div(null, null, "wecom-admin-button-container"));
    buttonContainerB3.add(new innovaphone.ui1.Div(null, null, "wecom-admin-button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
        app.send({ api: "admin", mt: "UpdateConfig", prt: "urlb3", vl: String(iptUrlB3.getValue()) });
        showStatus(sectionB3, "Atualizado com sucesso!", "success");
    });
   
    
    // Todas as Fontes Section
    var sectionTodas = container.add(new innovaphone.ui1.Div(null, null, "wecom-admin-section"));
    sectionTodas.add(new innovaphone.ui1.Div(null, texts.text("labelTodasFontes"), "wecom-admin-section-title"));
    
    var formGroupTodas = sectionTodas.add(new innovaphone.ui1.Div(null, null, "wecom-admin-form-group"));
    formGroupTodas.add(new innovaphone.ui1.Div(null, texts.text("labelURLTodas"), "wecom-admin-label"));
    var iptUrlTodas = formGroupTodas.add(new innovaphone.ui1.Input(null, null, texts.text("urlText"), 255, "url", null));
    iptUrlTodas.setAttribute("class", "wecom-admin-input");
    iptUrlTodas.setAttribute("placeholder", "https://...");
    
    var buttonContainerTodas = sectionTodas.add(new innovaphone.ui1.Div(null, null, "wecom-admin-button-container"));
    buttonContainerTodas.add(new innovaphone.ui1.Div(null, null, "wecom-admin-button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
        app.send({ api: "admin", mt: "UpdateConfig", prt: "urltodas", vl: String(iptUrlTodas.getValue()) });
        showStatus(sectionTodas, "Atualizado com sucesso!", "success");
    });
    
    // BCB Section
    var sectionBCB = container.add(new innovaphone.ui1.Div(null, null, "wecom-admin-section"));
    sectionBCB.add(new innovaphone.ui1.Div(null, texts.text("labelBCB"), "wecom-admin-section-title"));
    
    var formGroupBCB = sectionBCB.add(new innovaphone.ui1.Div(null, null, "wecom-admin-form-group"));
    formGroupBCB.add(new innovaphone.ui1.Div(null, texts.text("labelURLBCB"), "wecom-admin-label"));
    var iptUrlBCB = formGroupBCB.add(new innovaphone.ui1.Input(null, null, texts.text("urlText"), 255, "url", null));
    iptUrlBCB.setAttribute("class", "wecom-admin-input");
    iptUrlBCB.setAttribute("placeholder", "https://...");
    
    var buttonContainerBCB = sectionBCB.add(new innovaphone.ui1.Div(null, null, "wecom-admin-button-container"));
    buttonContainerBCB.add(new innovaphone.ui1.Div(null, null, "wecom-admin-button")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
        app.send({ api: "admin", mt: "UpdateConfig", prt: "urlbcb", vl: String(iptUrlBCB.getValue()) });
        showStatus(sectionBCB, "Atualizado com sucesso!", "success");
    });
    // Status message function
    function showStatus(section, message, type) {
        var statusDiv = section.add(new innovaphone.ui1.Div(null, message, "wecom-admin-status " + type));
        setTimeout(function() {
            if (statusDiv && statusDiv.style) {
                statusDiv.style.display = 'none';
            }
        }, 3000);
    }

    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "admin", mt: "AdminMessage" });
    }

    function app_message(obj) {
        if (obj.api == "admin" && obj.mt == "AdminMessageResult") {
            iptUrlB3.setValue(obj.urlb3);
            iptUrlTodas.setValue(obj.urltodas);
            iptUrlBCB.setValue(obj.urlbcb);
        }
    }
}

Wecom.cotacaoAdmin.prototype = innovaphone.ui1.nodePrototype;
