
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.novaalert = Wecom.novaalert || function (start, args) {
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

    var texts = new innovaphone.lib1.Languages(Wecom.novaalertTexts, start.lang);
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    function app_connected(domain, user, dn, appdomain) { 
        app.send({ api: "user", mt: "UserMessage" });
        app.send({ api: "user", mt: "SelectMessage" });
 
        if (app.logindata.info.unlicensed) {
            //sem licença
            app.send({ api: "user", mt: "UserMessage" })
            //var counter = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:calc(5% - 15px); font-size:30px; text-align:center", texts.text("licText")));
            //that.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:30%; top:calc(15% - 6px); font-size:12px; text-align:center", null, "button")).addTranslation(texts, "licContinue").addEvent("click", function () {
            //    app.send({ api: "user", mt: "UserMessage" })
            //    app.send({ api: "user", mt: "SelectMessage" });
            //});
  
        }
        else {
  
            app.send({ api: "user", mt: "UserMessage" })

        }
    }

    var buttonClicked = function (evt) {
        // Dentro do objeto evt esta o target, e o target tem um value:
        var value = evt.target.value;
        var type = evt.target.name;
        if (type == "Número") {
            app.send({ api: "user", mt: "TriggerCall", prt: String(value) })
        } else {
            app.send({ api: "user", mt: "TriggerAlert", prt: String(value) })
        }
        
    };

    

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {

        }
        if (obj.api == "user" && obj.mt == "SelectMessageSuccess") {
            console.log(obj.result);
            var buttons = JSON.parse(obj.result);
            popButtons(buttons);
        }
    }

    function popButtons(buttons) {
        var allbtn = that.add(new innovaphone.ui1.Div(null, null, "allbtn"));

        //var allbtn = document.getElementById("allbtn");
        buttons.forEach(function (object) {
            
            var btn = that.add(new innovaphone.ui1.Node("button", null, null, "allbutton"));
            if (object.button_type == "Alarme") {
                var img = btn.add(new innovaphone.ui1.Node("img", null, null, "img-icon"));
                img.setAttribute("src", "alarm.png");
            } else {
                var img = btn.add(new innovaphone.ui1.Node("img", null, null, "img-icon"));
                img.setAttribute("src", "phone.png");
            }
            btn.setAttribute("type", "button");
            btn.setAttribute("nonce", object.button_id);
            btn.setAttribute("name", object.button_type);
            btn.setAttribute("value", object.button_prt);
            btn.addHTML(object.button_name);
            
            
            allbtn.add(btn);
        });

        var botoes = document.querySelectorAll(".allbutton");
        for (var i = 0; i < botoes.length; i++) {
            var botao = botoes[i];

            // O jeito correto e padronizado de incluir eventos no ECMAScript
            // (Javascript) eh com addEventListener:
            botao.addEventListener("click", buttonClicked);
        }
    }
}

Wecom.novaalert.prototype = innovaphone.ui1.nodePrototype;
