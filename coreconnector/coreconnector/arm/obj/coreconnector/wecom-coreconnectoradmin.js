
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.coreconnectorAdmin = Wecom.coreconnectorAdmin || function (start, args) {
    this.createNode("body");
    var that = this;

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

    var texts = new innovaphone.lib1.Languages(Wecom.coreconnectorTexts, start.lang);

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    var serverName = '';

    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "admin", mt: "AdminMessage" });

        bodyConstructor()
    }

    function app_message(obj) {
        if (obj.api == "admin" && obj.mt == "AdminMessageResult") {
            serverName = obj.serverName;
            bodyConstructor()
        }
        if (obj.api == "admin" && obj.mt == "UpdateConfigOk") {
            serverName = obj.serverName;
            window.alert('ok')
        }
    }
    function bodyConstructor() {
        that.clear();
        const mainFilter = document.createElement("div")
        mainFilter.classList.add("flex", "bg-dark-200", 'items-center', "m-1", 'justify-between', 'p-1', 'margin-1', 'rounded-lg', "margin-1", "self-stretch", "gap-1")
        mainFilter.setAttribute("id", "divMain")

        document.body.appendChild(mainFilter);

        //Span
        const badge = document.createElement("span");
        badge.textContent = texts.text('serverNameSpan');
        badge.classList.add("inline-block", "py-1", "px-2", "rounded", "text-sm", "font-medium");
        mainFilter.appendChild(badge);
        //Input
        const inputShare = document.createElement("input")
        inputShare.classList.add('p-1', 'w-full', "border", "rounded-md", "font-Montserrat", "text-2", "not-italic", "font-bold", "text-black");
        inputShare.id = "inputServerName";
        inputShare.value = serverName;
        inputShare.placeholder = texts.text('serverNameIpt');
        inputShare.setAttribute('type', 'text');
        mainFilter.appendChild(inputShare);
        
        //Button
        const button = document.createElement("button");
        button.textContent = texts.text('updateBtn')
        mainFilter.appendChild(button);

        button.addEventListener("click", function (event) {
            const newValue = document.getElementById('inputServerName').value
            app.send({ api: "admin", mt: "UpdateConfig", prt: "serverName", vl: newValue  })
            event.stopPropagation()
            event.preventDefault()
        })
    }
}

Wecom.coreconnectorAdmin.prototype = innovaphone.ui1.nodePrototype;
