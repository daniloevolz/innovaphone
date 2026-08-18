
/// <reference path="../lib1/innovaphone.lib1.js" />

var innovaphone = innovaphone || {};
innovaphone.ui1 = innovaphone.ui1 || {};

innovaphone.ui1.nodePrototype = {
    addText: function (text) {
        this.container.innerText = text || "";
        return this;
    },

    addHTML: function (html) {
        this.container.innerHTML = html;
        return this;
    },

    add: function (node, before) {
        this.container.insertBefore(node.container, before ? before.container || before : null);
        return node;
    },

    rem: function (node) {
        if (this.container == node.container.parentNode) {
            this.container.removeChild(node.container);
            return node;
        }
    },

    clear: function () {
        this.container.innerHTML = "";
        return this;
    },

    firstChild: function () {
        return this.container.firstChild;
    },
    
    Listener: function (c, type, handler, obj) {
        c.addEventListener(type, on);

        function on(e) {
            handler(e, obj);
        }

        this.rem = function () {
            c.removeEventListener(type, on);    
        }

        this.type = type;
        this.handler = handler;
        this.obj = obj;
    },

    addEvent: function (type, handler, obj) {
        this.events = this.events || [];
        this.events.push(new this.Listener(this.container, type, handler, obj === undefined ? this : obj));
        return this;
    },

    remEvent: function (type, handler) {
        if (this.events) {
            var index = this.events.findIndex(function (v) { return v.type == type && (handler ? v.handler == handler : true); });
            if (index > -1) {
                this.events[index].rem();
                this.events.splice(index, 1);
            }
        }
        return this;
    },

    setClass: function (className) {
        this.container.className = className;
        return this;
    },

    addClass: function (className) {
        this.container.classList.add(className);
        return this;
    },

    remClass: function (className) {
        this.container.classList.remove(className);
        return this;
    },

    hasClass: function (className) {
        return this.container.classList.contains(className);
    },

    setStyle: function (style, value) {
        this.container.style[style] = value;
        return this;
    },

    setAttribute: function (name, value) {
        this.container.setAttribute(name, value);
        return this;
    },

    remAttribute: function (name) {
        this.container.removeAttribute(name);
        return this;
    },

    addTranslation: function (languages, id, property, args) {
        if (this.translatedNode) this.translatedNode.remove();
        this.translatedNode = languages.create(this, property, id, args);
        return this;
    },

    remTranslation: function () {
        if (this.translatedNode) {
            this.translatedNode.remove();
            delete this.translatedNode;
        }
        return this;
    },

    createTranslation: function (languages, id, property, args) {
        return languages.create(this, property, id, args);
    },
    
    setNoSelect: function () {
        this.container.style.webkitTouchCallout = "none";
        this.container.style.webkitUserSelect = "none";
        this.container.style.khtmlUserSelect = "none";
        this.container.style.MozUserSelect = "none";
        this.container.style.msUserSelect = "none";
        this.container.style.userSelect = "none";
        this.container.style.draggable = false;
        this.container.onselectstart = function () { return false; }
        this.container.ondragstart = function () { return false; }
        return this;
    },
    
    makeUnselectable: function () {
        this.container.style.MozUserSelect = "none";
        this.container.style.webkitUserSelect = "none";
        this.container.style.webkitTouchCallout = "none";
        this.container.setAttribute("unselectable", "on");
        return this;
    },

    setDisabled: function (state) {
        this.container.disabled = state !== false;
        return this;
    },

    createNode: function (type, style, content, cl) {
        if (type == "body") {
            this.container = document.body;
            this.container.addEventListener("dragover", function (e) {
                e = e || event;
                e.stopPropagation();
                e.preventDefault();
                e.dataTransfer.dropEffect = "none";
            });
        }
        else this.container = document.createElement(type);
        if (style) this.container.setAttribute("style", style);
        if (content) {
            if (content.container) this.container.appendChild(content.container);
            else this.container.innerText = content;
        }
        if (cl) this.container.setAttribute("class", cl);
        return this;
    },

    testId: function (id) {
        if (innovaphone.ui1.lib.browser.simulator) {
            if (id) this.container.setAttribute("aria-label", "test-" + id);
            else this.container.removeAttribute("aria-label");
        }
        if (id) this.container.setAttribute("id", "test-" + id);
        else this.container.removeAttribute("id");
        return this;
    },

    isScrollBottom: function () {
        return (this.container.scrollTop + this.container.clientHeight) >= this.container.scrollHeight;
    },

    isScrollTop: function () {
        return this.container.scrollTop == 0;
    }
}

innovaphone.ui1.Node = innovaphone.ui1.Node || function (type, style, content, cl) {
    this.createNode(type, style, content, cl);
}

innovaphone.ui1.Node.prototype = innovaphone.ui1.nodePrototype;

innovaphone.ui1.Div = innovaphone.ui1.Div || function (style, content, cl) {
    this.createNode("div", style, content, cl);
}

innovaphone.ui1.Div.prototype = innovaphone.ui1.nodePrototype;

innovaphone.ui1.Input = innovaphone.ui1.Input || function (style, value, placeHolder, maxLength, type, cl) {
    var that = this,
        originalValue = value;

    this.createNode("input", style, null, cl);
    if (value) setValue(value);
    else originalValue = "";
    if (placeHolder) this.container.placeholder = placeHolder;
    if (maxLength) this.container.maxLength = maxLength;
    if (type) {
        this.container.setAttribute("type", type);
    }

    function changed(noTrim) {
        if (type == "checkbox") return that.container.checked != originalValue;
        else if (type == "password" || noTrim) return that.container.value != originalValue;
        else return that.container.value.trim() != originalValue;
    }

    function setValue(value, overrideOriginalValue) {
        if (type == "checkbox") that.container.checked = value;
        else that.container.value = value;
        if (overrideOriginalValue) {
            originalValue = value;
        }
        return that;
    }

    function getValue(noTrim) {
        switch (type) {
            case "checkbox":
                return that.container.checked;
            case "number":
                if (!that.container.value || that.container.value.length == 0) return 0;
                else return parseInt(that.container.value);
            case "password":
                return that.container.value;
            default:
                if (!noTrim && that.container.value != that.container.value.trim()) {
                    that.container.value = that.container.value.trim();
                }
                return that.container.value;
        }
    }

    this.changed = changed;
    this.setValue = setValue;
    this.getValue = getValue;
}
innovaphone.ui1.Input.prototype = innovaphone.ui1.nodePrototype;



innovaphone.ui1.DropDown = innovaphone.ui1.DropDown || function (style, placeHolder, maxLength, type, cl) {
    var that = this;

    var node = this.createNode("select", style, null, cl);
    if (placeHolder) this.container.placeholder = placeHolder;
    if (maxLength) this.container.maxLength = maxLength;
    if (type) {
        this.container.setAttribute("type", type);
    }

    this.addOption = function addOption(value, texts) {
        if (texts) var option = this.add(new innovaphone.ui1.Node("option", style)).addTranslation(texts, value);
        else var option = this.add(new innovaphone.ui1.Node("option", style, value));
        option.container.value = value;
        return this;
    }

    this.getOptions = function getOptions() {
        let options = [];
        for (const element of that.container) {
            options.push(element.value);
        }
        return options;
    }

    this.clearOptions = function clearOptions() { node.clear(); }
    this.getSelected = function () { return that.container.value; }
    this.setSelected = function (option) {
        that.container.value = option;
        return this;
    }

}
innovaphone.ui1.DropDown.prototype = innovaphone.ui1.nodePrototype;





innovaphone.ui1.Password = innovaphone.ui1.Password || function (style, value, placeHolder, maxLength, cl, styleInput, clInput) {
    this.createNode("div", (style || "") + "; display:flex", null, cl);

    var that = this,
        input = this.add(new innovaphone.ui1.Input((styleInput || "") + "; flex:1 1 auto; padding-right:30px", value, placeHolder, maxLength, "password", clInput)),
        showPassword = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
        path = showPassword.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "path")),
        visible = false;

    function init() {
        that.container.appendChild(showPassword);
        showPassword.style.display = "none";
        showPassword.style.position = "absolute";
        showPassword.style.width = "20px";
        showPassword.style.height = "20px";
        showPassword.style.cursor = "pointer";
        showPassword.setAttribute("viewBox", "0 0 20 20");
        showPassword.addEventListener("click", toggle);
        if (value) input.setValue(value);
        if (placeHolder) input.container.placeholder = placeHolder;
        if (maxLength) input.container.maxLength = maxLength;
        if (innovaphone.ui1.lib.browser.name != "Edge" && innovaphone.ui1.lib.browser.name != "Internet Explorer") {
            input.addEvent("focus", onFocus);
        }
    }

    function toInt(value) {
        if (value && innovaphone.lib1.isInt(parseInt(value))) {
            return parseInt(value);
        }
        else {
            return 0;
        }
    }

    function onFocus() {
        input.remEvent("focus", onFocus);
        visible = true;
        toggle();
        var color = window.getComputedStyle(input.container, null).getPropertyValue("color"),
            position = window.getComputedStyle(that.container, null).getPropertyValue("position"),
            paddingRight = toInt(window.getComputedStyle(that.container, null).getPropertyValue("padding-right")),
            borderRight = toInt(window.getComputedStyle(input.container, null).getPropertyValue("border-right-width"));

        if (position == "" || position == "static") that.container.style.position = "relative";
        if (input.changed()) {
            showPassword.style.display = "";
        }
        showPassword.style.fill = color;
        showPassword.style.right = (borderRight + paddingRight + 5) + "px";
        showPassword.style.top = ((input.container.offsetHeight - 20) / 2) + "px";
        window.addEventListener("click", onClick);
        input.addEvent("keyup", onKeyUp);
        input.addEvent("keydown", onKeyDown);
    }

    function onClick(event) {
        if (event.target == that.container || that.container.contains(event.target) || event.target == path) {
            return;
        }
        onBlur();
    }

    function onKeyUp(event) {
        if (input.changed()) {
            showPassword.style.display = "";
        }
        else {
            showPassword.style.display = "none";
        }
    }

    function onKeyDown(event) {
        if (event.keyCode == innovaphone.lib1.keyCodes.f12 || event.keyCode == innovaphone.lib1.keyCodes.tab) {
            onBlur();
        }
    }

    function onBlur(event) {
        input.addEvent("focus", onFocus);
        input.remEvent("keyup", onKeyUp);
        input.remEvent("keydown", onKeyDown);
        window.removeEventListener("click", onClick);
        showPassword.style.display = "none";
        input.setAttribute("type", "password");
    }

    function toggle() {
        if (visible) {
            path.setAttribute("d", "M10,4C4.48,4,0,10.09,0,10.09S4.48,16,10,16s10-4.91,10-4.91S15.52,4,10,4Zm0,3a2.3,2.3,0,0,1,2,2.5A2.3,2.3,0,0,1,10,12,2.3,2.3,0,0,1,8,9.5,2.3,2.3,0,0,1,10,7Zm0,7c-3.07,0-5.89-2.42-7.36-3.93A16.68,16.68,0,0,1,6.16,7.18a4.5,4.5,0,1,0,7.91.42,18.3,18.3,0,0,1,3.28,3.23C15.84,12.09,13.06,14,10,14Z");
            input.setAttribute("type", "password");
        }
        else {
            path.setAttribute("d", "M2,19.45.56,18,18.43.17l1.41,1.42Zm1.63-5.88,1.44-1.43a17.23,17.23,0,0,1-2.41-2.07C4.1,8.51,6.93,6,10,6a4.72,4.72,0,0,1,1.06.12l1.59-1.58A7.29,7.29,0,0,0,10,4C4.48,4,0,10.09,0,10.09A19.9,19.9,0,0,0,3.61,13.57ZM16.14,6.7,14.72,8.12a18.91,18.91,0,0,1,2.63,2.71C15.84,12.09,13.06,14,10,14a6.24,6.24,0,0,1-1.06-.1L7.3,15.54A8.69,8.69,0,0,0,10,16c5.52,0,10-4.91,10-4.91A22.13,22.13,0,0,0,16.14,6.7Z");
            input.setAttribute("type", "text");
            if (that.onShowPassword) that.onShowPassword();
        }
        visible = !visible;
    }

    function testId(id) {
        input.testId(id);
        return that;
    }

    this.changed = input.changed;
    this.setValue = input.setValue;
    this.getValue = input.getValue;
    this.input = input;
    this.testId = testId;
    this.onShowPassword = null;

    init();
}
innovaphone.ui1.Password.prototype = innovaphone.ui1.nodePrototype;


innovaphone.ui1.Checkbox = innovaphone.ui1.Checkbox || function (style, value, cl, background, foreground, backgroundOff, inherit) {
    var that = this;
    that.background = background ? background : "gray";
    that.foreground = foreground ? foreground : "white";
    that.backgroundOff = backgroundOff ? backgroundOff : that.background;
    var svg = '<svg style="position:relative;width:14px;fill:' + that.foreground + ';" viewBox="0 0 20 20"><path d="M6.67,17.5,0,10.81,1.62,9.18l5.05,5.06L18.38,2.5,20,4.13Z"></path></svg>';
    function draw() {
        that.container.checked || (that.container.checked == undefined && inherit) ? that.addHTML(svg) : that.clear();
        box.container.style.backgroundColor = that.container.checked || (that.container.checked == undefined && inherit) ? that.background : that.backgroundOff;
        that.container.style.filter = that.container.disabled || that.container.checked == undefined ? "grayscale(50%) contrast(50%)" : "";
        that.container.style.cursor = that.container.disabled ? "" : "pointer";
    }
    that.getValue = function () { return that.container.checked }
    that.setValue = function (value) {
        if (value) {
            that.container.checked = true;
            that.container.setAttribute("checked", "on");
        }
        else if(!value && inherit == undefined) {
            that.container.checked = false;
            that.container.removeAttribute("checked");
        }
        else {
            that.container.checked = value;
            that.container.removeAttribute("checked");
        }
        draw();
    }
    that.setDisabled = function (value) { that.container.disabled = value ? true : false; draw() }
    that.setTooltip = function (value) { that.container.setAttribute("title", value) }
    var box = that.createNode("div", "display:flex;align-items:center;justify-content:center;width:20px;height:20px;" + style, null, cl);
    box.container.tabIndex = "0";

    function click(e) {
        if (!that.container.disabled) {
            that.setValue(that.container.checked ? false : (that.container.checked == undefined || inherit == undefined ? true : undefined));
            // call user's "change" handler (if any)
            var onchange = that.events.find(function (v) { return (v.type == "change") && v.handler });
            if (onchange) onchange.handler(e, onchange.obj);
        }
    }

    that.addEvent("click", function (e) {
        click(e);
    });
    that.addEvent("keydown", function (e) {
        if (e.keyCode == innovaphone.lib1.keyCodes.space) {
            click(e);
        }
    });
    that.setValue(value);
}
innovaphone.ui1.Checkbox.prototype = innovaphone.ui1.nodePrototype;

innovaphone.ui1.cssVariablesSupported = innovaphone.ui1.cssVariablesSupported || function () {
    var div = document.createElement("div");
    div.style.display = "var(--innovaphone-ui1-cssvariablessupported)";
    document.body.appendChild(div);
    document.body.style.setProperty("--innovaphone-ui1-cssvariablessupported", "inline-block");
    var supported = getComputedStyle(div, null).getPropertyValue('display') == "inline-block";
    document.body.removeChild(div);
    document.body.style.removeProperty("--innovaphone-ui1-cssvariablessupported");
    return supported;
};

innovaphone.ui1.CssVariables = innovaphone.ui1.CssVariables || function (sets, current, element) {
    this.sets = sets;
    this.current = current;
    this.element = element || document.body;
    this.activate(current);
};

innovaphone.ui1.CssVariables.prototype = {
    activate: function (id) {
        this.current = this.sets[id] ? id : Object.keys(this.sets)[0];
        for (var variable in this.sets[this.current]) this.element.style.setProperty(variable, this.sets[this.current][variable]);
    },
    toggle: function () {
        var ids = Object.keys(this.sets),
            index = ids.indexOf(this.current);
        this.activate(ids[index > -1 ? (index + 1) % ids.length : 0]);
    }
};

innovaphone.ui1.lib = innovaphone.ui1.lib || (function () {

    var isTouch = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0));
    var browser = getBrowserInfo();
    browser.touch = isTouch;

    function getBrowserInfo() {
        var ua = window.navigator.userAgent;
        if (ua.indexOf("myApps/") != -1) {
            if (ua.indexOf("Windows") != -1) return { name: "myApps for Windows", webkit: true, simulator: false };
            if (ua.indexOf("Linux") != -1) return { name: "myApps for Linux", webkit: true, simulator: false };
            if (ua.indexOf("Android") != -1) return { name: "myApps for Android", webkit: true, simulator: false };
            if (ua.indexOf("iOS Simulator") != -1) return { name: "myApps for iOS Simulator", webkit: true, simulator: true };
            if (ua.indexOf("iOS") != -1) return { name: "myApps for iOS", webkit: true, simulator: false };
            if (ua.indexOf("macOS") != -1) return { name: "myApps for macOS", webkit: true, simulator: false };
            if (ua.indexOf("IP232") != -1) return { name: "myApps for IP232", webkit: true, simulator: false };
            return {};
        }
        else if (ua.indexOf("OPR/") != -1 || ua.indexOf("Opera/") != -1) return { name: "Opera", webkit: true, simulator: false };
        else if (ua.indexOf("Edge/") != -1) return { name: "Edge", webkit: false, simulator: false };
        else if (ua.indexOf("Edg/") != -1) return { name: "Edge", webkit: true, simulator: false };
        else if (ua.indexOf("Teams/") != -1) return { name: "Teams", webkit: true, simulator: false };
        else if (ua.indexOf("Firefox/") != -1) return { name: "Firefox", webkit: false, simulator: false };
        else if (ua.indexOf("Chromium/") != -1) return { name: "Chromium", webkit: true, simulator: false };
        else if (ua.indexOf("Chrome/") != -1) return { name: "Chrome", webkit: true, simulator: false };
        else if (ua.indexOf("Safari/") != -1) return { name: "Safari", webkit: true, simulator: false };
        else if (ua.indexOf("Trident/") != -1) return { name: "Internet Explorer", webkit: false, simulator: false };
        return {};
    }

    var keyCodes = {
        arrowDown: 40,
        arrowLeft: 37,
        arrowRight: 39,
        arrowUp: 38,
        pageUp: 33,
        pageDown: 34,
        end: 35,
        home:36,
        escape: 27,
        enter: 13,
        space: 32,
        tab: 9,
    };

    return {
        browser: browser,
        isTouch: isTouch,
        keyCodes: keyCodes
    }
})();
