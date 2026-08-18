
var innovaphone = innovaphone || {};
innovaphone.Standalone = function (htm) {
    var that = this;
    this.createNode("body", "background-color:var(--bg1)");

    var schemes = new innovaphone.ui1.CssVariables(standaloneColors, "dark");

    var texts = new innovaphone.lib1.Languages(standaloneTexts, "de");

    Login.prototype = innovaphone.ui1.nodePrototype;
    var login = null;
    var app = null;

    if (localStorage.getItem("standalone")) {
        var obj = JSON.parse(localStorage.getItem("standalone"));
        app = this.add(new innovaphone.ui1.Node("iframe", "display:none; position:absolute; left:0px; width:100%; top:0px; height:100%; border:none"));
        app.container.src = htm + "?user=" + encodeURIComponent(obj.email);
    }
    else {
        login = that.add(new Login(function (email) {
            if (app) that.rem(app);
            app = that.add(new innovaphone.ui1.Node("iframe", "display:none; position:absolute; left:0px; width:100%; top:0px; height:100%; border:none"));
            app.container.src = htm + "?user=" + encodeURIComponent(email);
        }));
    }

    window.addEventListener("message", function (e) {
        if (e.data && typeof e.data == "string") {
            var obj = JSON.parse(e.data);
            switch (obj.mt) {
                case "getLogin":
                    if (localStorage.getItem("standalone")) {
                        var l = JSON.parse(localStorage.getItem("standalone"));
                        sendLogin(e.source, obj, l.email, l.key);
                    }
                    else if (login) {
                        login.getLogin(e.source, obj);
                    }
                    else {
                        login = that.add(new Login(function () {
                            if (app) {
                                login.getLogin(e.source, obj);
                            }
                            else {
                                app = that.add(new innovaphone.ui1.Node("iframe", "display:none; position:absolute; left:0px; width:100%; top:0px; height:100%; border:none"));
                                app.container.src = htm + "?user=" + encodeURIComponent(obj.email);
                            }
                        }));
                    }
                    break;
                case "loginResult":
                    if (obj.ok) {
                        app.container.style.display = "block";
                    }
                    else {
                        localStorage.removeItem("standalone");
                    }
                    break;
                case "logout":
                    localStorage.removeItem("standalone");
                    if (app) that.rem(app);
                    app = null;
                    login = that.add(new Login(function (email) {
                        app = that.add(new innovaphone.ui1.Node("iframe", "display:none; position:absolute; left:0px; width:100%; top:0px; height:100%; border:none"));
                        app.container.src = htm + "?user=" + encodeURIComponent(email);
                    }));
                    break;
            }
        }
    });

    function sendLogin(source, get, email, key) {
        var obj = { mt: "Login", src: get.src, app: "-", sip: email, domain: "", guid: "00", dn: get.dn };
        obj.digest = innovaphone.crypto.sha256(obj.app + ":" + obj.domain + ":" + obj.sip + ":" + obj.guid + ":" + obj.dn + ":" + get.challenge + ":" + key);
        obj.key = innovaphone.crypto.sha256("innovaphoneAppSessionKey:" + get.challenge + ":" + key);
        source.postMessage(JSON.stringify(obj));
    }

    function Login(onlogin) {
        this.createNode("div", "position:absolute; left:0px; right:0px; top:0px; bottom:0px; display:flex; justify-content:space-around");
        InText.prototype = innovaphone.ui1.nodePrototype;
        var column = this.add(new innovaphone.ui1.Div("position:relative; width:400px; height:100%; display:flex; flex-direction:column; justify-content:space-around"));
        var form = column.add(new innovaphone.ui1.Div("position:relative; width:100%; display:flex; flex-direction:column; font-size:14px; color:var(--c1); background-color:var(--bg2); padding:20px"));
        var email = form.add(new InText("email"));
        var password = form.add(new InText("password","password")).addEvent("keydown", function (e) {
            if (e.keyCode === 13) {
                onlogin(email.getValue());
            }
        });
        var buttons = form.add(new innovaphone.ui1.Div("position:relative; display:flex; justify-content:space-around"));
        buttons.add(new innovaphone.ui1.Div("position:relative; width:70px; background-color:var(--bg1); text-align:center; margin:10px 0px 0px; padding:4px; cursor:pointer")).addTranslation(texts, "login").addEvent("click", function () {
            onlogin(email.getValue());
        });
        form.add(new innovaphone.ui1.Div("position:relative; margin:4px; color:var(--c2); cursor:pointer")).addTranslation(texts,"signup").addEvent("click", function () {
            form.container.style.display = "none";
            nform = column.add(new innovaphone.ui1.Div("position:relative; width:100%; display:flex; flex-direction:column; font-size:14px; color:var(--c1); background-color:var(--bg2); padding:20px"));
            var nemail = nform.add(new InText("email"));
            var dn = nform.add(new InText("dn"));
            var npassword = nform.add(new InText("password", "password"));
            var buttons = nform.add(new innovaphone.ui1.Div("position:relative; display:flex; justify-content:space-around"));
            buttons.add(new innovaphone.ui1.Div("position:relative; width:70px; background-color:var(--bg1); text-align:center; margin:10px 0px 0px; padding:4px; cursor:pointer")).addTranslation(texts, "send").addEvent("click", function () {
                var nonce = Math.floor(Math.random() * 1000000000000);
                var key = innovaphone.crypto.sha256(nemail.getValue() + ":" + nonce + ":" + npassword.getValue());
                var href = location.href;
                href = href.substr(0, href.lastIndexOf("/"));
                href = href.substr(0, href.lastIndexOf("/"));
                innovaphone.lib1.httpGet("../signup?cmd=new&sip=" + encodeURIComponent(nemail.getValue()) + "&dn=" + encodeURIComponent(dn.getValue()) + "&nonce=" + nonce + "&key=" + key + "&href=" + encodeURIComponent(href) + "/signup", complete, complete);
                function complete() {
                    if (app) that.rem(app);
                    app = null;
                    column.rem(nform);
                    form.container.style.display = "flex";
                    email.setValue(nemail.getValue());
                    password.setValue(npassword.getValue());
                }
            });
        });
        form.add(new innovaphone.ui1.Div("position:relative; margin:4px; color:var(--c2); cursor:pointer")).addTranslation(texts, "reset").addEvent("click", function () {
            form.container.style.display = "none";
            nform = column.add(new innovaphone.ui1.Div("position:relative; width:100%; display:flex; flex-direction:column; font-size:14px; color:var(--c1); background-color:var(--bg2); padding:20px"));
            var nemail = nform.add(new InText("email"));
            var buttons = nform.add(new innovaphone.ui1.Div("position:relative; display:flex; justify-content:space-around"));
            buttons.add(new innovaphone.ui1.Div("position:relative; width:70px; background-color:var(--bg1); text-align:center; margin:10px 0px 0px; padding:4px; cursor:pointer")).addTranslation(texts, "reset").addEvent("click", function () {
                var href = location.href;
                href = href.substr(0, href.lastIndexOf("/"));
                href = href.substr(0, href.lastIndexOf("/"));
                innovaphone.lib1.httpGet("../signup?cmd=reset&sip=" + encodeURIComponent(nemail.getValue()) + "&href=" + encodeURIComponent(href) + "/signup", complete, complete);
                function complete() {
                    if (app) that.rem(app);
                    app = null;
                    column.rem(nform);
                    form.container.style.display = "flex";
                }
            });
        });
        this.getLogin = function(source, get) {
            var key = innovaphone.crypto.sha256(email.getValue() + ":" + get.nonce + ":" + password.getValue());
            localStorage.setItem("standalone", JSON.stringify({ email: email.getValue(), key: key }));
            var obj = { mt: "Login", src: get.src, app: "-", sip: email.getValue(), domain: "", guid: "00", dn: get.dn };
            obj.digest = innovaphone.crypto.sha256(obj.app + ":" + obj.domain + ":" + obj.sip + ":" + obj.guid + ":" + obj.dn + ":" + get.challenge + ":" + key);
            obj.key = innovaphone.crypto.sha256("innovaphoneAppSessionKey:" + get.challenge + ":" + password.getValue());
            source.postMessage(JSON.stringify(obj));
            that.rem(login);
            login = null;
        }
    }

    function InText(label, type) {
        this.createNode("div", "position:relative; display:flex; margin:4px");
        this.add(new innovaphone.ui1.Div("position:relative; width:100px")).addTranslation(texts, label);
        var inp = this.add(new innovaphone.ui1.Input(undefined, undefined, undefined, undefined, type));
        this.getValue = () => inp.getValue();
        this.setValue = (v) => inp.setValue(v);
    }
}
innovaphone.Standalone.prototype = innovaphone.ui1.nodePrototype;
