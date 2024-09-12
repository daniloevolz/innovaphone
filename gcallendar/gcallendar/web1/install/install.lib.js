
/// <reference path="~/web/ui1.lib/innovaphone.lib1.js" />
/// <reference path="~/web/ui1.lib/innovaphone.ui1.lib.js" />
/// <reference path="~/web/ui1.input/innovaphone.ui1.input.js" />

innovaphone.getConfig = function (url, complete, args) {
    if (args) {
        for (var key in args) {
            if (args[key] != null) {
                if (Array.isArray(args[key])) {
                    for (var i = 0; i < args[key].length; i++) {
                        if (typeof args[key][i] == "object") {
                            var a = args[key];
                            for (var i = 0; i < a.length; i++) {
                                for (var keya in a[i]) {
                                    url += "&" + keya + "=" + encodeURIComponent(a[i][keya]);
                                }
                            }
                        }
                        else {
                            url += "&" + key + "=" + encodeURIComponent(args[key][i]);
                        }
                    }
                }
                else {
                    url += "&" + key + "=" + encodeURIComponent(args[key]);
                }
            }
        }
    }
    var xmlReq = new window.XMLHttpRequest();
    xmlReq.open('GET', url, true, this.usr ? this.usr : null, this.pwd ? this.pwd : null);
    xmlReq.send(null);
    xmlReq.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (xmlReq.status >= 200 && xmlReq.status < 300) complete(xmlReq.responseXML, xmlReq.responseText, xmlReq.status);
            else complete(null, null, xmlReq.status);
            xmlReq = null;
        }
    }
}

innovaphone.postConfig = function (url, complete, args) {
    var send = null;
    if (args) {
        for (var key in args) {
            if (args[key] != null) {
                send = send ? send + "&" : "";
                send += key + "=" + encodeURIComponent(args[key]);
            }
        }
    }
    var xmlReq = new window.XMLHttpRequest();
    xmlReq.open('POST', url, true, this.usr ? this.usr : null, this.pwd ? this.pwd : null);
    xmlReq.send(send);
    xmlReq.onreadystatechange = function () {
        if (this.readyState == 4) {
            complete(xmlReq.responseXML, xmlReq.responseText);;
            xmlReq = null;
        }
    }
}

innovaphone.InstallApp = function (manager, app, domain, pwd, version, log, userAgreement, complete) {
    console.log("InstallApp");
    //var src = new manager.Src();
    src = manager;
    src.onmessage = message;
    var v = app.versions.find(function (e) { return e.id == version });
    if (!v) v = app.versions[0];
    log.addLine(app.title + " " + v.id + " " + v.build + " " + v.label);
    var obj = { mt: "InstallService", appServiceID: app.id, title: app.title, folder: app.folder, binary: app.binary, manufacturer: app.manufacturer, version: v, userAgreementAccepted: userAgreement  };
    if (v.copy) {
        obj.copy = v.copy;
    }
    src.send(obj);

    function message(obj) {
        if (obj.mt == "InstallServiceResult") {
            src.send({ mt: "AddInstance", appServiceID: app.id, appName: app.id, appDomain: domain, appPassword: pwd, webserverPath: domain + "/" + app.id, dbHost: "", dbName: domain + "_" + app.id, dbUser:domain + "_" + app.id, dbPassword: pwd, logFlags: 0 });
        }
        else if (obj.mt == "AddInstanceResult") {
            src.send({ mt: "StartInstance", appServiceID: app.id, appName: app.id, appDomain: domain });
        }
        else if (obj.mt == "StartInstanceResult") {
            complete();
        }
    }
}

innovaphone.AddInstance = function (manager, app, appName, domain, pwd, excludeFromBackup, complete) {
    console.log("AddInstance");
    //var src = new manager.Src();
    src = manager;
    src.onmessage = message;
    var obj = { mt: "AddInstance", appServiceID: app.id, appName: appName, appDomain: domain, appPassword: pwd, webserverPath: domain + "/" + appName, dbHost: "", dbName: domain + "_" + appName, dbUser: domain + "_" + appName, dbPassword: pwd, logFlags: 0, excludeFromBackup: excludeFromBackup };
    src.send(obj);

    function message(obj) {
        if (obj.mt == "AddInstanceResult") {
            src.send({ mt: "StartInstance", appServiceID: app.id, appName: appName, appDomain: domain });
        }
        else if (obj.mt == "StartInstanceResult") {
            complete();
        }
    }
}

innovaphone.randomPwd = function (len) {
    var pwd = "";
    if (this.stdpwd) {
        pwd = "pwd";
    }
    else {
        for (var i = 0; i < len; i++) {
            var r = 33 + randomInt(92);
            if (r >= 39) r++;
            if (r >= 92) r++;
            pwd += String.fromCharCode(r)
        }
    }
    return pwd;

    function randomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
}

innovaphone.InstallLog = function (style, content) {
    this.createNode("div", style, content, "log");

    this.addLine = function(text) {
        this.add(new innovaphone.ui1.Div(null, text));
    }
}
innovaphone.InstallLog.prototype = innovaphone.ui1.nodePrototype;

innovaphone.InstallLogo = function () {
    this.createNode("div", null, null, "logo");
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("style", "position: relative; margin: 10px auto; width: 70px; height: 70px;");
    svg.setAttribute("viewBox", "0 0 88 70");
    svg.innerHTML = "<path d=\"M1.47,47.72H0V35.22H1.47v.93A7.54,7.54,0,0,1,5.53,35,3.42,3.42,0,0,1,8.58,36.3a9,9,0,0,1,2.18-.94A8.09,8.09,0,0,1,13.08,35c1.66,0,2.77.44,3.33,1.31s.84,2.5.84,4.87v6.57H15.78v-6.5a9.4,9.4,0,0,0-.54-3.89,2.42,2.42,0,0,0-2.34-1,7.11,7.11,0,0,0-1.85.26,7.5,7.5,0,0,0-1.45.54l-.5.25a12.63,12.63,0,0,1,.37,3.85v6.5H8V41.27a9.6,9.6,0,0,0-.53-3.94,2.39,2.39,0,0,0-2.31-1,6.62,6.62,0,0,0-1.79.26A7,7,0,0,0,2,37.12l-.48.25Z\" style=\"fill:#fff\"/><path d=\"M19.67,35.22H21.2l3.33,11.2h.89l3.36-11.2H30.3L24.9,53.35H23.4l1.68-5.63H23.35Z\" style=\"fill:#fff\"/><path d=\"M29.68,63.72l4.69-19H40.5l4.72,19H42.11l-1-4.08H33.79l-1,4.08Zm7.08-16.43L34.4,56.92h6.07l-2.33-9.63Z\" style=\"fill:#fff\"/><path d=\"M47.58,69.69V49.85h3v.86a7,7,0,0,1,3.58-1.17,4.75,4.75,0,0,1,4,1.68q1.27,1.68,1.27,5.63c0,2.64-.48,4.49-1.45,5.57S55.44,64,53.24,64a17.09,17.09,0,0,1-2.64-.25v5.91Zm6.05-17.46a6.34,6.34,0,0,0-2.61.59L50.6,53V61.2a13.09,13.09,0,0,0,2.44.22,2.91,2.91,0,0,0,2.61-1.08,7,7,0,0,0,.72-3.69Q56.37,52.23,53.63,52.23Z\" style=\"fill:#fff\"/><path d=\"M62.48,69.69V49.85h3v.86a7,7,0,0,1,3.58-1.17,4.75,4.75,0,0,1,4,1.68q1.28,1.68,1.27,5.63c0,2.64-.48,4.49-1.45,5.57S70.34,64,68.14,64a17.09,17.09,0,0,1-2.64-.25v5.91Zm6.05-17.46a6.34,6.34,0,0,0-2.61.59L65.5,53V61.2a13.09,13.09,0,0,0,2.44.22,2.91,2.91,0,0,0,2.61-1.08,7,7,0,0,0,.72-3.69Q71.27,52.23,68.53,52.23Z\" style=\"fill:#fff\"/><path d=\"M87,52.71a39.32,39.32,0,0,0-4.74-.45,4.24,4.24,0,0,0-2,.35,1.19,1.19,0,0,0-.57,1.09,1.08,1.08,0,0,0,.63,1.06,14.13,14.13,0,0,0,2.94.71,6.68,6.68,0,0,1,3.28,1.26,3.93,3.93,0,0,1,1,3.05A3.73,3.73,0,0,1,86.08,63,6.93,6.93,0,0,1,82,64a25,25,0,0,1-4.27-.47l-.86-.14L77,60.89a40.16,40.16,0,0,0,4.8.44,4.36,4.36,0,0,0,2.1-.36,1.27,1.27,0,0,0,.62-1.19,1.19,1.19,0,0,0-.6-1.15A11.94,11.94,0,0,0,81,57.94a7.68,7.68,0,0,1-3.32-1.18,3.52,3.52,0,0,1-1-2.94,3.7,3.7,0,0,1,1.45-3.2,6.23,6.23,0,0,1,3.73-1A27,27,0,0,1,86.2,50l.86.17Z\" style=\"fill:#fff\"/><rect x=\"53.09\" y=\"13.36\" width=\"13\" height=\"13\" style=\"fill:#f29100\"/><rect x=\"37.75\" y=\"23.91\" width=\"13\" height=\"13\" transform=\"translate(54.04 83.19) rotate(-135)\" style=\"fill:#17baae\"/><rect x=\"27.14\" y=\"13.3\" width=\"13\" height=\"13\" transform=\"translate(43.43 57.59) rotate(-135)\" style=\"fill:gray\"/><rect x=\"37.75\" y=\"2.69\" width=\"13\" height=\"13\" transform=\"translate(69.04 46.98) rotate(-135)\" style=\"fill:#17baae\"/>";
    this.container.appendChild(svg);
}
innovaphone.InstallLogo.prototype = innovaphone.ui1.nodePrototype;

innovaphone.InstallInfo = function (texts) {
    this.createNode("div", null, null, "info");
    var info0div = this.add(new innovaphone.ui1.Div());
    var info1div = this.add(new innovaphone.ui1.Div("margin-top:10px"));

    this.show = function (info0, info1) {
        info0div.addTranslation(texts, info0, "innerHTML");
        if (info1) info1div.addTranslation(texts, info1, "innerHTML");
        else info1div.clear();
    }
}
innovaphone.InstallInfo.prototype = innovaphone.ui1.nodePrototype;

innovaphone.InstallContent = function () {
    this.createNode("div", null, null, "content");
}
innovaphone.InstallContent.prototype = innovaphone.ui1.nodePrototype;

innovaphone.InstallNext = function (texts, next, onclick) {
    this.createNode("div", null, null, "next");
    this.addTranslation(texts, next);
    this.addEvent("click", onclick);
    this.show = function (on) { this.container.style.display = on ? "block" : "none" };
}
innovaphone.InstallNext.prototype = innovaphone.ui1.nodePrototype;

innovaphone.InstallButton = function (texts, text, onclick) {
    this.createNode("div", null, null, "button");
    this.addTranslation(texts, text);
    this.addEvent("click", onclick)
}
innovaphone.InstallButton.prototype = innovaphone.ui1.nodePrototype;

innovaphone.InstallSection = function (texts, info, headline, sel, onchange, show) {
    this.createNode("div", "position:relative; left:0px; right:0px");
    if (headline) {
        var head = this.add(new innovaphone.ui1.Div("position:relative; left:0px; margin-top:10px; font-size:14px")).addTranslation(texts, headline);
    }
    var fields = this.add(new innovaphone.ui1.Div("position:relative; left:0px; right:0px; padding-top:" + (headline ? 10 : 0) + "px; display:" + (show || show == undefined ? "flex" : "none")));
    if (sel != undefined) {
        var check = this.add(new innovaphone.ui1.Checkbox("position:absolute; left:-40px; top:0px", sel, null, "#1aa0ac", "white", "#313131"));
        if (onchange) check.addEvent("change", onchange, this);
    }
    if (head && info) head.addEvent("click", info);

    this.field = function (f) {
        if (info) f.addEvent("click", info);
        return fields.add(f);
    }

    this.fieldRem = function (f) {
        fields.rem(f);
    }

    this.padding = function (no) {
        while (no--) {
            fields.add(new innovaphone.ui1.Div("position:relative; width:100%"));
        }
    }

    this.header = function (e) {
        return this.add(e, fields);
    }

    this.getValue = function () {
        return !check || check.getValue();
    }
    this.setValue = function (value) {
        if (check) check.setValue(value);
    }

    this.showFields = function (on) {
        fields.container.style.display = (on || on == undefined) ? "flex" : "none";
    }

    this.info = info;

    this.testId = function (id) {
        if (check) check.testId(id);
        else if (head) head.testId(id);
        else fields.testId(id);
        return this;
    }
}
innovaphone.InstallSection.prototype = innovaphone.ui1.nodePrototype;

innovaphone.InstallInText = function (texts, headline, placeholder, max, info, regex, width) {
    this.createNode("div", null, null, "element");
    var head = this.add(new innovaphone.ui1.Div(null, null, "headline")).addTranslation(texts, headline),
        inDiv = this.add(new innovaphone.ui1.Div(width ? "width:" + width + "px" : null, null, "input")),
        inp = inDiv.add(new innovaphone.ui1.Input(null, null, null, max, null, "input")).addTranslation(texts, placeholder, "placeholder");
    if (info) inp.addEvent("focus", info);

    this.setDisabled = function () {
        inp.container.disabled = true;
        inp.container.style.backgroundColor = "#383838";
    }
    this.setEnabled = function () {
        inp.container.disabled = false;
        inp.container.style.backgroundColor = null;
    }
    this.setPlaceholder = function (id) {
        if (id) inp.addTranslation(texts, id, "placeholder"); else inp.container.placeholder = "";
    }

    this.setValue = function (value) { inp.setValue(value ? value : ""); return this };
    this.getValue = inp.getValue;
    this.addEvent = inp.addEvent;
    this.focus = function () { inp.container.focus() };
    this.valid = function () {
        if (regex) return regex.test(inp.getValue());
        else return inp.getValue();
    }
    this.error = function (on) {
        if (on) {
            inp.container.focus();
            this.container.style.borderColor = "#ea3f50";
        }
        else {
            this.container.style.borderColor = null;
        }
    };
    this.testId = function (id) {
        inp.testId(id);
        return this;
    }
    this.appendText = function (text) {
        head.container.innerText += text;
    }
}
innovaphone.InstallInText.prototype = innovaphone.ui1.nodePrototype;

innovaphone.InstallSelect = function (texts, headline, options) {
    this.createNode("div", null, null, "element");
    this.add(new innovaphone.ui1.Div(null, null, "headline")).addTranslation(texts, headline);
    var select = this.add(new innovaphone.ui1.Node("select", null, null, "input"));
    if (options) setOptions(options);

    function setOptions(options) {
        select.clear();
        for (var i = 0; i < options.length; i++) {
            var o = select.add(new innovaphone.ui1.Node("option", null, options[i].text));
            o.container.value = options[i].value;
            if (options[i].selected) o.container.selected = true;
        }
    }

    this.setOptions = setOptions;
    this.getValue = function () {
        return select.container.value;
    }
}
innovaphone.InstallSelect.prototype = innovaphone.ui1.nodePrototype;

innovaphone.InstallInPwd = function (texts, headline, headlineshow, max) {
    this.createNode("div", null, null, "element");
    this.add(new innovaphone.ui1.Div(null, null, "headline")).addTranslation(texts, headline);
    var inDiv = this.add(new innovaphone.ui1.Div(null, null, headlineshow ? "pwd" : "input"));
    var inp = inDiv.add(new innovaphone.ui1.Input(null, null, null, max, "password", "pwd"));
    if (headlineshow) {
        this.add(new innovaphone.ui1.Div(null, null, "headlineshow")).addTranslation(texts, headlineshow);
        var show = this.add(new innovaphone.ui1.Checkbox("position:absolute; right:40px; top:34px; width:12px; height:12px", false, null, "#1aa0ac", "white", "#313131")).addEvent("change", function () {
            if (inp.container.type == "text") {
                inp.container.type = "password";
            }
            else {
                inp.container.type = "text";
            }
        });
    }

    this.setValue = function (value) {
        inp.setValue(value);
        return this;
    }
    this.getValue = function () {
        return inp.getValue();
    }
    this.setDisabled = function () {
        inp.container.disabled = true;
    }
    this.valid = function () {
        return inp.getValue();
    }
    this.error = function (on) {
        if (on) {
            inp.container.focus();
            this.container.style.borderColor = "#ea3f50";
        }
        else {
            this.container.style.borderColor = null;
        }
    };
}
innovaphone.InstallInPwd.prototype = innovaphone.ui1.nodePrototype;

innovaphone.InstallInAction = function (texts, text, headline, onclick) {
    this.createNode("div", null, null, "element");
    this.add(new innovaphone.ui1.Div(null, null, "headline")).addTranslation(texts, headline);
    this.addEvent("click", onclick);
    var inDiv = this.add(new innovaphone.ui1.Div(null, null, "input"));
    var button = inDiv.add(new innovaphone.ui1.Div("position:absolute; box-sizing:border-box; left:0px; width:100%; top:1px; bottom:1px; background-color:#1aa0ac; padding:5px 10px; font-size:14px; cursor:pointer", null)).addTranslation(texts, text);

    this.action = function (action) {
        if (action) {
            button.addTranslation(texts, action);
            button.container.style.backgroundColor = "transparent";
        }
        else {
            button.addTranslation(texts, text);
            button.container.style.backgroundColor = "#1aa0ac";
        }
    }
}
innovaphone.InstallInAction.prototype = innovaphone.ui1.nodePrototype;

innovaphone.InstallCheckbox = function (texts, headline, onchange) {
    this.createNode("div", "height:45px", null, "element");
    if (texts) this.add(new innovaphone.ui1.Div(null, null, "headline")).addTranslation(texts, headline);
    else this.add(new innovaphone.ui1.Div(null, headline, "headline"));
    var inDiv = this.add(new innovaphone.ui1.Div(null, null, "input"));
    var inp = inDiv.add(new innovaphone.ui1.Checkbox("position:absolute; left:10px; top:5px; width:12px; height:12px", false, null, "#1aa0ac", "white", "#313131"));
    if (onchange) inp.addEvent("change", onchange);

    this.setValue = function (value) {
        inp.setValue(value);
    }
    this.getValue = function () {
        return inp.getValue();
    }
    this.testId = function (id) {
        inp.testId(id);
        return this;
    }
}
innovaphone.InstallCheckbox.prototype = innovaphone.ui1.nodePrototype;

innovaphone.InstallState = function (texts, headline) {
    this.createNode("div", null, null, "element");
    this.add(new innovaphone.ui1.Div(null, null, "headline")).addTranslation(texts, headline);
}
innovaphone.InstallState.prototype = innovaphone.ui1.nodePrototype;

innovaphone.InstallError = function (text) {
    this.createNode("div", null, null, "errorinfo");
    this.addText(text);
}
innovaphone.InstallError.prototype = innovaphone.ui1.nodePrototype;

