
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.webterminal = Wecom.webterminal || function (start, args) {
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

    var texts = new innovaphone.lib1.Languages(Wecom.webterminalTexts, start.lang);
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    function app_connected(domain, user, dn, appdomain) {
        
        document.getElementById('ip').value = '10.10.20.80';
        document.getElementById('port').value = '22';
        var ip, port;
        var commands = []; // Array to store commands

        document.getElementById('connect-btn').addEventListener('click', function () {
            ip = document.getElementById('ip').value;
            port = document.getElementById('port').value;
            console.log("Connecting to IP:", ip, "Port:", port);
            app.send({ api: "user", mt: "Connect", ip: ip, port: port});
        });

        document.getElementById('disconnect-btn').addEventListener('click', function () {
            console.log("Disconnecting from IP:", ip, "Port:", port);
            app.send({ api: "user", mt: "Disconnect", ip: ip, port: port });
        });

        document.getElementById('terminal-input').addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                var command = e.target.value;
                commands.push(command); // Store the command
                insertMessage("User: " + command); // Display the command in terminal
                e.target.value = ''; // Clear the input field
                app.send({ api: "user", mt: "SendMessage", msg: command, ip: ip, port: port });
            }
        });

        
    }

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "Message") {
            insertMessage(obj.msg);
        }
        if (obj.api == "user" && obj.mt == "Error") {
            insertMessage(obj.msg);
        }
    }

    function insertMessage(message) {
        var terminalContent = document.getElementById('terminal-content');
        terminalContent.innerHTML += message + "<br>";
        document.getElementById('terminal').scrollTop = terminalContent.scrollHeight; // Scroll to the bottom
    }
}

Wecom.webterminal.prototype = innovaphone.ui1.nodePrototype;
