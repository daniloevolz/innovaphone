
/*-----------------------------------------------------------------------------------------------*/
/* innovaphone.test.js                                                                           */
/* copyright (c) innovaphone 2022...                                                             */
/*-----------------------------------------------------------------------------------------------*/

innovaphone.test = innovaphone.test || {
    objs: [],
    current: 0,
    steps: null,
    auto: null,
    autoList: 0,
    autoScript: 0,
    error: false,
    delay: 0,
    timer: 0,

    obj: {
        init: function (id) {
            this.id = id;
            innovaphone.test.objs.push(this);
            return this;
        }
    },

    run: function (steps, con) {
        this.current = 0;
        this.steps = steps;
        if (con) this.console = con;
        this.exe();
    },

    exe: function () {
        if (this.current < this.steps.length && this.steps[this.current].cmd == "exe") {
            var that = this;
            var o = this.objs.find(function (e) { return e.id == that.steps[that.current].obj });
            var c = this.current++;
            this.log.write("exe", o.id, this.steps[c].op, this.steps[c].args);
            if (this.steps[c].op == "event") {
                o.event(this.steps[c].args);
            }
            else if (this.steps[c].op == "keyboardEvent") {
                o.keyboardEvent(this.steps[c].args);
            }
            else if (this.steps[c].op == "set") {
                o.set(this.steps[c].args);
            }
            else if (this.steps[c].op == "html") {
                o.html(this.steps[c].args);
            }
            else {
                o.exe(this.steps[c].op, this.steps[c].args);
            }
            if (this.error) return;

            if (this.current < this.steps.length) {
                if (this.steps[this.current].cmd == "exe") {
                    that.timer = setTimeout(function () {
                        that.timer = 0;
                        that.exe();
                    }, this.delay || this.steps[this.current].delay);
                }
            }
            else {
                if (this.auto) {
                    this.autoScript++;
                    if (this.autoScript < this.auto[this.autoList].length) {
                        this.log.section(this.auto[this.autoList][this.autoScript].file, this.auto[this.autoList][this.autoScript].title);
                        this.run(this.auto[this.autoList][this.autoScript].steps);
                    }
                    else {
                        this.autoList++;
                        if (this.autoList < this.auto.length) {
                            this.autoScript = 0;
                            this.reset();
                            this.log.section(this.auto[this.autoList][this.autoScript].file, this.auto[this.autoList][this.autoScript].title);
                            this.run(this.auto[this.autoList][this.autoScript].steps);
                        }
                        else {
                            if (this.console) this.console.ok();
                        }
                    }
                }
            }
        }
    },

    chk: function (obj, op, args) {
        if (this.current < this.steps.length && this.steps[this.current].cmd == "chk" && this.steps[this.current].obj == obj && this.steps[this.current].op == op) {
            var that = this;
            innovaphone.test.log.write("chk", obj, op, this.steps[this.current].args);
            if (this.current + 1 < this.steps.length) {
                if (this.steps[this.current + 1].cmd == "exe") {
                    that.timer = setTimeout(function () {
                        that.timer = 0;
                        that.exe();
                    }, this.delay || this.steps[this.current + 1].delay);
                }
            }
            return this.steps[this.current++].args;
        }
        else if (innovaphone.test.simu) {
            innovaphone.test.simu.recv(obj, op, args);
        }
        else {
            innovaphone.test.log.write("err", obj, op, { error: "chk not found" });
        }
    },

    cont: function (delay) {
        var that = this;
        if (delay >= 0) this.delay = delay;
        if (this.timer) {
            clearTimeout(this.timer);
            if (delay >= 0) {
                this.timer = setTimeout(function () {
                    that.timer = 0;
                    that.exe();
                }, 0);
            }
        }
    },

    reset: function () {
        this.error = false;
        this.objs = [this.objs[0]];
        document.body.innerHTML = null;
        document.body.appendChild(this.console.container);
    },

    Start: function (args) {
        Event.prototype = innovaphone.test.obj;
        this.search = args.search;
        this.onlangchanged = new Event("start-onlangchanged");
        this.onschemechanged = new Event("start-onschemechanged");
        this.onargschanged = new Event("start-onargschanged");
        this.onmenustatechanged = new Event("start-onmenustatechanged");
        this.setMenuState = function (state) {
            var args = innovaphone.test.chk(this.id, "setMenuState");
        }
        this.setColor = function (color) {
            var args = innovaphone.test.chk(this.id, "setColor");
        }

        this.consumeApi = function (api) {
            Api.prototype = innovaphone.test.obj;
            var args = innovaphone.test.chk(this.id, "consumeApi");
            if (args) {
                return new Api(args.ret);
            }

            function Api(id) {
                this.init(id);
                this.onmessage = new Event(id + "-onmessage");
                this.onupdate = new Event(id + "-onupdate");
                this.providers = [];
                this.Src = function () {
                    var args = innovaphone.test.chk(id, "Src");
                    this.init(args.ret);
                    this.send = function (msg) {
                        var args = innovaphone.test.chk(this.id, "send");
                        if (!args) alert("x");
                    }
                }
                this.Src.prototype = innovaphone.test.obj;
            }
        }

        this.provideApi = function (api) {
            Api.prototype = innovaphone.test.obj;
            var args = innovaphone.test.chk(this.id, "provideApi");
            if (args) {
                return new Api(args.ret);
            }

            function Api(id) {
                this.init(id);
                this.onmessage = new Event(id + "-onmessage");
            }
        }

        function Event(id) {
            this.init(id);
            this.attach = function (handler) {
                var args = innovaphone.test.chk(this.id, "attach");
                this.handler = handler;
            }
        }
    },

    Console: function (main, name, test) {
        var that = this;
        this.createNode("div", "position:absolute; box-sizing:border-box; z-index: 1000; left: 300px; top: 200px; width:600px; height:400px; background-color:white; border: 1px solid black; resize:both; overflow:auto");
        document.body.appendChild(this.container);
        var header = this.add(new innovaphone.ui1.Div("position:relative; width:100%; height:20px; background-color:grey")).addEvent("mousedown", dragStart);
        var content = this.add(new innovaphone.ui1.Div("position:relative; width:100%; height:calc(100% - 20px); display:flex; flex-direction:column; align-items: stretch"));
        Control.prototype = innovaphone.ui1.nodePrototype;
        var control = content.add(new Control("position:relative; width:100%; flex-shrink:5; display:flex; flex-direction:column"));
        Log.prototype = innovaphone.ui1.nodePrototype;
        var log = content.add(new Log("position:relative; width:100%; height:200px; overflow:auto; border-top: 1px solid black; flex-grow:10; flex-shrink:10; font-family:monospace"));
        innovaphone.test.log = log;

        function dragStart(e) {
            var dragX = e.offsetX;
            var dragY = e.offsetY;
            document.body.addEventListener("mousemove", move);
            document.body.addEventListener("mouseup", stop);

            function move(e) {
                that.container.style.left = (e.pageX - dragX) + "px";
                that.container.style.top = (e.pageY - dragY) + "px";
                e.stopPropagation();
            }

            function stop() {
                document.body.removeEventListener("mousemove", move);
                document.body.removeEventListener("mouseup", stop);
            }
        }

        function Control(style) {
            var control = this;
            this.createNode("div", style);
            var buttons = this.add(new innovaphone.ui1.Div("position:relative; display:flex; padding:1px"));
            Scripts.prototype = innovaphone.ui1.nodePrototype;
            var scripts = this.add(new Scripts("position:relative; padding:1px; flex-shrink:5; display:flex"));
            buttons.add(new innovaphone.ui1.Div("position:relative; width:60px; height:20px; margin:1px; text-align:center; background-color:#e0e0e0; cursor:pointer", "Reset")).addEvent("click", function () {
                innovaphone.test.objs = [];
                innovaphone.test.current = 0;
                innovaphone.test.steps = [];
                document.body.innerHTML = null;
                document.body.appendChild(that.container);
                log.clear();
            });
            var fast = buttons.add(new innovaphone.ui1.Div("position:relative; width:30px; height:20px; margin:1px; text-align:center; background-color:#e0e0e0; cursor: pointer; box-sizing:border-box; border:1px solid black", ">>")).addEvent("mousedown", function (e) {
                control.fast();
                e.preventDefault();
            });
            var play = buttons.add(new innovaphone.ui1.Div("position:relative; width:30px; height:20px; margin:1px; text-align:center; background-color:#e0e0e0; cursor:pointer; box-sizing:border-box", ">")).addEvent("mousedown", function (e) {
                control.play();
                e.preventDefault();
            });
            var pause = buttons.add(new innovaphone.ui1.Div("position:relative; width:30px; height:20px; margin:1px; text-align:center; background-color:#e0e0e0; cursor:pointer; box-sizing:border-box", "||")).addEvent("mousedown", function (e) {
                control.pause();
                e.preventDefault();
            });
            var file = buttons.add(new innovaphone.ui1.Input("position:relative; margin:1px; cursor:pointer", null, null, 0, "file"));
            file.container.multiple = "multiple";
            file.addEvent("change", function () {
                for (let i = 0; i < file.container.files.length; i++) {
                    let reader = new FileReader();
                    reader.onload = function () {
                        eval(reader.result);
                        for (let j = 0; testScripts && j < testScripts.length; j++) {
                            if (testScripts[j].title && testScripts[j].steps) scripts.addScript(testScripts[j].title, testScripts[j].steps, testScripts[j].delay);
                        }
                    }
                    reader.readAsText(file.container.files[i]);
                }
            });

            this.fast = function () {
                pause.container.style.border = null;
                fast.container.style.border = "1px solid black";
                play.container.style.border = null;
                innovaphone.test.cont(0);
            }
            this.play = function (delay) {
                pause.container.style.border = null;
                play.container.style.border = "1px solid black";
                fast.container.style.border = null;
                innovaphone.test.cont(delay || 2000);
            }
            this.pause = function () {
                pause.container.style.border = "1px solid black";
                play.container.style.border = null;
                fast.container.style.border = null;
                innovaphone.test.cont(-1);
            }
        }

        function Scripts(style) {
            this.createNode("div", style);
            this.addScript = function (title, steps, delay) {
                this.add(new Script(title, steps, delay));
            }

            function Script(title, steps, delay) {
                this.createNode("div", "position:relative; margin:1px; height:20px; padding:0px 4px; background-color:#f0f0f0; cursor:pointer", title);
                this.addEvent("mousedown", function (e) {
                    main.init(name);
                    if (delay) control.play(delay);
                    innovaphone.test.run(steps);
                    e.preventDefault();
                });
            }
            Script.prototype = innovaphone.ui1.nodePrototype;
        }

        function Log(style) {
            this.createNode("div", style);

            this.write = function (cmd, obj, op, args) {
                var style = (cmd == "exe" ? "; background-color:#e0e0e0" : cmd == "trc" ? "; color:lime" : cmd == "err" ? "; color:red" : "");
                var line = this.add(new innovaphone.ui1.Div("position:relative; display:flex; align-items: stretch" + style));
                line.add(new innovaphone.ui1.Div("position:relative; width:25px; padding-left:4px; overflow:hidden; white-space:nowrap", cmd));
                line.add(new innovaphone.ui1.Div("position:relative; width:100px; overflow:hidden; white-space:nowrap", obj)).setAttribute("title", obj);
                line.add(new innovaphone.ui1.Div("position:relative; width:75px; padding-left:4px; overflow:hidden; white-space:nowrap", op)).setAttribute("title", op);
                line.add(new innovaphone.ui1.Div("position:relative; width:100px; overflow:hidden; flex-grow:10; white-space:nowrap", JSON.stringify(args))).setAttribute("title", JSON.stringify(args));
                this.container.scrollTop = this.container.scrollHeight;
            }

            this.section = function (file, title) {
                this.add(new innovaphone.ui1.Div("position:relative; color:blue", "--- " + file + ": " + title));
            }
        }

        this.error = function (info) {
            test.error = true;
            test.log.write("err", test.steps[test.current - 1].obj, test.steps[test.current - 1].op, info);
            if (test.auto) {
                var err = this.add(new innovaphone.ui1.Div("position:absolute; top:80px; left:50px; background-color:red; font-size:20px; padding: 50px 100px", "FAIL")).testId("fail").addEvent("click", function () {
                    that.rem(err);
                });
            }
        },

        this.ok = function () {
            var ok = this.add(new innovaphone.ui1.Div("position:absolute; top:80px; left:50px; background-color:green; font-size:20px; padding: 50px 100px", "PASS")).testId("pass").addEvent("click", function () {
                that.rem(ok);
            });
        }

        window.addEventListener("message", function (e) {
            innovaphone.test.auto = [];
            innovaphone.test.autoList = 0;
            innovaphone.test.autoScript = 0;
            var scripts = JSON.parse(e.data);
            for (let i = 0; scripts && i < scripts.length; i++) {
                if (scripts[i].run) {
                    for (let j = 0; j < scripts[i].run.length; j++) {
                        var list = [];
                        for (let k = 0; k < scripts[i].run[j].length; k++) {
                            var script = scripts[i].run[j][k] == "." ? scripts[i] : scripts.find(function (e) { return e.title == scripts[i].run[j][k] });
                            if (script) {
                                list.push({ file: script.file, title: script.title, steps: script.steps });
                            }
                        }
                        if (list.length) innovaphone.test.auto.push(list);
                    }
                }
            }
            if (innovaphone.test.auto.length) {
                main.init(name);
                log.section(innovaphone.test.auto[0][0].file, innovaphone.test.auto[0][0].title);
                innovaphone.test.run(innovaphone.test.auto[0][0].steps, that);
            }
        });
    }
};
innovaphone.test.Console.prototype = innovaphone.ui1.nodePrototype;
innovaphone.test.Start.prototype = innovaphone.test.obj;

/*-----------------------------------------------------------------------------------------------*/

innovaphone.test.Obj = function (node, id) {
    this.init(id);

    this.event = function (args) {
        node.container.dispatchEvent(new Event(args.type, args.obj));
    }

    this.keyboardEvent = function (args) {
        node.container.dispatchEvent(new KeyboardEvent(args.type, args.obj));
    }

    this.set = function (args) {
        node.container[args.property] = args.value;
    }

    this.html = function (args) {
        var xml = (new DOMParser()).parseFromString("<xml>" + node.container.innerHTML + "</xml>", "text/xml");
        try {
            var ret = xml.evaluate(args.xpath, xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        }
        catch (e) { };
        if (!(ret && ret.singleNodeValue)) {
            innovaphone.test.log.write("err", id, "html", { error: "xpath no match" });
        }
    }
}
innovaphone.test.Obj.prototype = innovaphone.test.obj;

innovaphone.ui1.nodePrototype.testId = function (id) {
    if (id) {
        this.container.setAttribute("id", "test-" + id);
        new innovaphone.test.Obj(this, "test-" + id);
    }
    else {
        this.container.removeAttribute("id");
    }
    return this;
}

/*-----------------------------------------------------------------------------------------------*/

innovaphone.appwebsocket = innovaphone.appwebsocket || {};
innovaphone.appwebsocket.Connection = innovaphone.appwebsocket.Connection || function (url, app, password, domain, fonconnected, fonmessage, fonerror, fonclosed, fgetlogin) {
    var that = this;
    var args = innovaphone.test.chk("innovaphone.appwebsocket.Connection", "new");
    if (args) this.init(args.ret);
    var user = args.user,
        unique = 0;

    this.onconnected = fonconnected;
    this.onmessage = fonmessage;
    this.logindata = args.logindata = { info: { unlicensed: false } };

    this.user = function () { return user };

    this.exe = function (op, args) {
        if (op == "connected") {
            this.onconnected(args.domain);
        }
        else if (op == "message") {
            innovaphone.test.log.write("trc", this.id, "recv", args);
            this.onmessage(args.msg);
        }
    }

    this.send = function (msg) {
        innovaphone.test.log.write("trc", this.id, "send", msg);
        var args = innovaphone.test.chk("app", "send", { msg: msg });
    }

    this.info = function () {
        return innovaphone.test.chk("app", "info").info;
    }

    this.dn = function () {
        return args ? args.dn : "";
    }

    this.setKeepAlive = function (value) {
        var args = innovaphone.test.chk("app", "setKeepAlive");
    }

    var srcs = [];
    this.src = function (src) {
        if (!src) src = "src" + unique++;
        this.onmessage = null;

        var args = innovaphone.test.chk(that.id, "Src");
        this.src = args && args.ret ? args.ret : src;
        src = this.src;
        this.init(src);

        this.exe = function (op, args) {
            if (op == "message" && this.onmessage) {
                this.onmessage(args.msg);
            }
        }
        this.send = function (msg) {
            msg.src = this.src;
            innovaphone.test.log.write("trc", this.id, "send", msg);
            innovaphone.test.chk(this.id, "send", { msg: msg });
            return this;
        }
        this.close = function () {
            innovaphone.test.chk(this.id, "close");
            if (srcs.find(function (s) { return s.src == src })) {
                this.onmessage = null;
                srcs.splice(srcs.indexOf(this), 1);
            }
        }
        var s = srcs.find(function (s) { return s.src == src });
        if (s) {
            console.log(app + ": duplicate src " + src);
            s.onmessage = null;
            srcs.splice(srcs.indexOf(s), 1);
        }
        srcs.push(this);
    }
    this.src.prototype = innovaphone.test.obj;

    this.Src = function (onmessage, src) {
        if (!src) src = "src" + unique++;
        this.onmessage = onmessage;
        var args = innovaphone.test.chk(that.id, "Src");
        this.src = args && args.ret ? args.ret : src;
        src = this.src;
        this.init(src);

        this.exe = function (op, args) {
            if (op == "message" && this.onmessage) {
                this.onmessage(args.msg);
            }
        }

        this.send = function (msg) {
            innovaphone.test.log.write("trc", this.id, "send", msg);
            innovaphone.test.chk(this.id, "send", { msg: msg });
            return this;
        }

        this.close = function () {
            innovaphone.test.chk(this.id, "close");
            if (srcs.find(function (s) { return s.src == src })) {
                this.onmessage = null;
                srcs.splice(srcs.indexOf(this), 1);
            }
        }
        var s = srcs.find(function (s) { return s.src == src });
        if (s) {
            console.log(app + ": duplicate src " + src);
            s.onmessage = null;
            srcs.splice(srcs.indexOf(s), 1);
        }
        srcs.push(this);
    }
    this.Src.prototype = innovaphone.test.obj;

    this.sendSrc = function (msg, recv) {
        innovaphone.test.log.write("trc", this.id, "sendSrc", msg);
        var args = innovaphone.test.chk(this.id, "sendSrc");

        SendSrc.prototype = innovaphone.test.obj;
        new SendSrc(recv);
        function SendSrc(recv) {
            this.init((args.recv));

            this.exe = function (op, args) {
                if (op == "message") {
                    recv(args.msg);
                }
            }
        }
    }
}
innovaphone.appwebsocket.Connection.prototype = innovaphone.test.obj;
