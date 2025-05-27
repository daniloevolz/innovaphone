
/// <reference path="../lib1/innovaphone.lib1.js" />
/// <reference path="../ui1.lib/innovaphone.ui1.lib.js" />

var innovaphone = innovaphone || {};
innovaphone.ui1 = innovaphone.ui1 || {};
innovaphone.ui1.Editor = innovaphone.ui1.Editor || function (style, scrollWidth, scrollColor, scrollStyle, onCtrlEnter, onEsc, onChanged, onFocus, onEmphasis, onUndo, onRedo) {
    this.createNode("div", style + "; overflow-x:hidden; overflow-y:auto");
    var that = this;
    var content = this.add(new innovaphone.ui1.Div(scrollStyle));
    this.content = content;
    const zeroWidthSpace = "​"; // \u200B

    content.container.contentEditable = true;
    content.container.style.outlineStyle = "none";
    if (onFocus) {
        content.addEvent("focus", function () { onFocus(true) });
        content.addEvent("blur", function () { onFocus(false) });
    }

    content.addEvent('keydown', onKeyDown);
    content.addEvent('keyup', onKeyUp);
    content.addEvent('mouseup', onMouseUp);
    content.addEvent('paste', onPaste);
    content.addEvent('input', function (e) { if (onChanged) onChanged(0, getSelection(), e) });
    if (onEmphasis) document.addEventListener('selectionchange', onSelectionChange);

    var ctrl = false;
    var shift = false;
    var alt = false;

    // event handler

    function onKeyDown(e) {

        switch (e.keyCode) {
            case 13:
                e.preventDefault();
                if (onCtrlEnter) {
                    if (onCtrlEnter(ctrl, empty(content.container))) {
                        ctrl = false;
                        return;
                    }
                }
                enter();
                break;
            case 16:
                shift = true;
                return;
            case 17:
                ctrl = true;
                return;
            case 18:
                alt = true;
                return;
            case 27:
                if (onEsc) {
                    onEsc();
                }
                return;
            case 89:
                if (ctrl && onRedo) {
                    e.preventDefault();
                    onRedo();
                    return;
                }
                break;
            case 90:
                if (ctrl && onUndo) {
                    e.preventDefault();
                    onUndo();
                    return;
                }
                break;
        }
        if (onChanged) onChanged(e.keyCode, getSelection(), e);
    }

    function enter() {
        var sel = getSelection();
        var r = sel.focusNode;
        var n = split(r, sel.focusOffset);
        if (n) r = n.parentNode;

        while (n?.tagName == "BR") {
            let t = n;
            n = n.nextSibling;
            t.remove();
        }

        if (empty(r)) {
            if (isItemNode(r)) {
                let t;
                if (r.nextSibling) {
                    t = r.parentNode.parentNode.insertBefore(document.createElement(r.parentNode.tagName), r.parentNode.nextSibling);
                    while (r.nextSibling) t.appendChild(r.parentNode.removeChild(r.nextSibling));
                }
                t = r;
                r = r.parentNode;
                t.remove();
                p = r.parentNode.insertBefore(document.createElement(isItemNode(r.parentNode) ? r.parentNode.tagName : "P"), r.nextSibling);
            }
            else {
                if (r.tagName == "P") p = r.parentNode.insertBefore(document.createElement("P"), r.nextSibling);
                else p = r.appendChild(document.createElement("P"));
            }
        }
        else {
            var p;
            if (r == content.container) p = r.insertBefore(document.createElement("P"), n);
            else p = r.parentNode.insertBefore(document.createElement(r.tagName), r.nextSibling);
            while (n) {
                p.appendChild(r.removeChild(n));
                n = n.nextSibling;
            }
        }
        if (empty(p, true)) p.appendChild(document.createTextNode(zeroWidthSpace));
        setCursor(p, true);
    }

    function onKeyUp(e) {
        switch (e.keyCode) {
            case 16:
                shift = false;
                break;
            case 17:
                ctrl = false;
                break;
            case 18:
                alt = false;
                break;
        }
    }

    function onMouseUp(e) {
    }

    function onPaste(e) {
        if (e.clipboardData.getData('text/html')) {
            e.preventDefault();
            e.stopPropagation();
            var sel = getSelection();

            var insert = document.createElement("span");
            insert.innerHTML = (sel.anchorNode.nodeType == 3 ? sel.anchorNode.textContent.slice(0, sel.anchorOffset) : "") + cleanupHTML(e.clipboardData.getData('text/html'));
            var end = document.createElement("span");
            if (sel.anchorNode.nodeType == 3) {
                if (sel.focusNode.nodeType == 3) end.appendChild(document.createTextNode(sel.focusNode.textContent.slice(sel.focusOffset)));
                insert.appendChild(end);
                sel.anchorNode.parentNode.insertBefore(insert, sel.anchorNode);
                sel.anchorNode.parentNode.removeChild(sel.anchorNode);
            }
            else {
                insert.appendChild(end);
                sel.anchorNode.insertBefore(insert, sel.anchorNode.firstChild);
            }
            sel.deleteFromDocument();
            var p = end.firstChild;
            normalize(insert.parentNode);
            setCursor(p);
        }
    }

    function onSelectionChange() {
        var sel = getSelection();
        if (!content.container.contains(sel.anchorNode) || !content.container.contains(sel.focusNode)) return;

        var b, i, u, ul, ol, dl;
        traverseSel(function (n) {
            var e;
            if (n.nodeType != 3 || !n.nodeValue.length) return;
            if (exists(content.container, n, "B")) b = b == undefined ? true : b; else b = false;
            if (exists(content.container, n, "I")) i = i == undefined ? true : i; else i = false;
            if (exists(content.container, n, "U")) u = u == undefined ? true : u; else u = false;
            e = exists(content.container, n, "UL");
            if (ul === undefined) ul = e; else if (ul !== e) ul = null;
            e = exists(content.container, n, "OL");
            if (ol === undefined) ol = e; else if (ol !== e) ol = null;
            e = exists(content.container, n, "DL");
            if (dl === undefined) dl = e; else if (dl !== e) dl = null;
        });
        b = b |= document.queryCommandState("bold");
        i = i |= document.queryCommandState("italic");
        u = u |= document.queryCommandState("underline");
        onEmphasis(b, i, u, ul, ol, dl);

        function exists(r, n, t) {
            if (!r.contains(n)) return null;
            if (n.nodeType == 1 && n.tagName == t) return n;
            if (n === r) return null;
            return exists(r, n.parentNode, t);
        }
    }

    // helper functions

    // traverese thru all nodes of the current selection
    // callback is done on going up and going to next sibling, so no callbacks on the "way down" to last node
    function traverseSel(onnode) {
        var sel = getSelection();
        var start = sel.anchorNode;
        var startOfs = sel.anchorOffset;
        var end = sel.focusNode;
        var endOfs = sel.focusOffset;
        var p = sel.anchorNode.compareDocumentPosition(sel.focusNode);
        if (p == 2) [start, startOfs, end, endOfs] = [end, endOfs, start, startOfs];
        else if (p == 0 && startOfs > endOfs) [startOfs, endOfs] = [endOfs, startOfs];
        node(start);

        function node(i) {
            var n;
            if (i !== end) {
                if (i.nextSibling) {
                    n = i.nextSibling;
                    while (n != end && n.firstChild) n = n.firstChild;
                }
                else {
                    n = i.parentNode;
                }
            }
            onnode(i, i === start ? startOfs : 0, i === end ? endOfs : undefined);
            if (n) node(n);
        }
    }

    // returns element which was created for after the split element
    // split is done on the level of the first non-text node (text, B, I, U) or the node type provided as tag
    function split(r, ofs, tag) {
        var n;
        while (isTextNode(r)) {
            if (r.nodeType == 3) {
                n = document.createTextNode(r.nodeValue.slice(ofs));
                r.nodeValue = r.nodeValue.slice(0, ofs);
                if (empty(r, true)) r.parentNode.insertBefore(document.createTextNode(zeroWidthSpace), r);
                r.parentNode.insertBefore(n, r.nextSibling);
            }
            else {
                var i = n;
                n = r.parentNode.insertBefore(document.createElement(r.tagName), r.nextSibling);
                while (i) {
                    let t = i.nextSibling;
                    n.appendChild(r.removeChild(i));
                    i = t;
                }
                if (r.tagName == tag) break;
            }
            r = r.parentNode;
        }
        return n;
    }

    // use normalize to cleanup an HTML
    function cleanupHTML(text) {
        const parser = new DOMParser();
        const html = parser.parseFromString(text, 'text/html');
        html.normalize();
        normalize(html.body);
        return html.body.innerHTML;
    }

    // removes all but the supported nodes and all attributes except href on A
    function normalize(node, parent, before) {
        for (var n = node.firstChild; n;) {
            var x = n.nextSibling;
            if (['B', 'STRONG', 'I', 'U', 'P', 'UL', 'OL', 'DL', 'LI', 'DT', 'DD', 'DIV', 'BR', 'TABLE', 'TR', 'TD'].indexOf(n.nodeName) != -1) {
                let p = document.createElement(n.nodeName);
                (parent ? parent : node).insertBefore(p, parent ? before : n);
                normalize(n, p, null);
            }
            else if (['CODE', 'PRE'].indexOf(n.nodeName) != -1) {
                (parent ? parent : node).insertBefore(document.createTextNode(n.textContent), parent ? before : n);
            }
            else if (['A'].indexOf(n.nodeName) != -1) {
                let p = document.createElement(n.nodeName);
                p.setAttribute("href", n.getAttribute("href"));
                p.setAttribute("target", "_blank");
                (parent ? parent : node).insertBefore(p, parent ? before : n);
                normalize(n, p, null);
            }
            else if (['SPAN', 'TBODY'].indexOf(n.nodeName) != -1) {
                normalize(n, parent ? parent : node, parent ? before : n);
            }
            else if (n.nodeType == 3) {
                if (!empty(n) || n.nextSibling || n.prevSibling) n.nodeValue = n.nodeValue.replace(/\u200B/g, '');
                (parent ? parent : node).insertBefore(n.parentNode.removeChild(n), parent ? before : x);
            }
            if (n.nodeType != 3) node.removeChild(n);
            n = x;
        }
    }

    // creates a selection at given position and collapses it to set cursor anywhere
    function setCursor(node, end) {
        if (!node) {
            node = content.container;
            if (end) while (node.lastChild) node = node.lastChild;
            else while (node.firstChild) node = node.firstChild;
        }
        var r = document.createRange();
        for (var e = node; e.lastChild; e = e.lastChild);
        r.setStart(e, e.nodeType == 3 && end ? e.nodeValue.length : 0);
        r.setEnd(e, e.nodeType == 3 && end ? e.nodeValue.length : 0);
        r.collapse();
        getSelection().removeAllRanges();
        getSelection().addRange(r);
        if (node.nodeType == 1 && node.getBoundingClientRect().bottom > that.container.getBoundingClientRect().bottom) {
            that.container.scrollTop += (node.getBoundingClientRect().bottom - that.container.getBoundingClientRect().bottom)
        }
    }

    function isTextNode(node) {
        return node && (node.nodeType == 3 || node.tagName == "B" || node.tagName == "U" || node.tagName == "I" || node.tagName == "SPAN" || node.tagName == "BR");
    }

    function isListNode(node) {
        return node && (node.tagName == "UL" || node.tagName == "OL" || node.tagName == "DL");
    }

    function isItemNode(node) {
        return node && (node.tagName == "LI" || node.tagName == "DT" || node.tagName == "DD");
    }

    function empty(node, zero, next) {
        if (node.nodeType == 3 && node.textContent.length) {
            let s = node.textContent;
            if (!zero) s = s.replace(/\u200B/g, '');
            if (s.search(/\S/) != -1) return false;
        }
        if (node.firstChild) {
            if (!empty(node.firstChild, zero, true)) return false;
        }
        if (next && node.nextSibling) {
            if (!empty(node.nextSibling, zero, true)) return false;
        }
        return true;
    }

    // text manipulation

    function emphasis(tag, off) {
        var sel = getSelection();
        if (sel.isCollapsed) {
            if (off) {
                document.execCommand(tag == "B" ? "bold" : (tag == "I" ? "italic" : "underline"));
                if (exists(content.container, sel.focusNode, tag)) {
                    let t = split(sel.focusNode, sel.focusOffset, tag);
                    t = t.parentNode.insertBefore(document.createTextNode(zeroWidthSpace), t.nextSibling);
                    setCursor(t, true);
                }
            }
            else {
                let f = sel.focusNode;
                if (!exists(content.container, f, tag)) {
                    let t = document.createElement(tag);
                    if (f.nodeType == 3) {
                        f.parentNode.insertBefore(t, f.nextSibling);
                        if (sel.focusOffset != f.textContent.length) {
                            f.parentNode.insertBefore(document.createTextNode(f.textContent.slice(sel.focusOffset)), t.nextSibling);
                            f.textContent = f.textContent.slice(0, sel.focusOffset);
                        };
                    }
                    else {
                        f.insertBefore(t, f.firstChild);
                    }
                    t.innerHTML = zeroWidthSpace;
                    setCursor(t, true);
                }
            }
        }
        else {
            var e = [];
            var last, lastOfs;

            traverseSel(function (n, sOfs, eOfs) {
                var t = exists(content.container, n, tag);
                if (t && e.indexOf(t) == -1) e.push(t);
                if (n.nodeType == 3) {
                    last = n;
                    lastOfs = eOfs;
                }
            });

            while (e.length) {
                var n = e.pop();
                while (n.firstChild) n.parentNode.insertBefore(n.removeChild(n.firstChild), n);
                n.parentNode.removeChild(n);
            }

            if (!off) {
                traverseSel(function (n, sOfs, eOfs) {
                    if (n.nodeType == 3 && n.nodeValue.length && !exists(content.container, n, tag)) {
                        var t = document.createElement(tag);
                        var text = t.appendChild(document.createTextNode(n.nodeValue.slice(sOfs, eOfs)));

                        if (sOfs) n.parentNode.insertBefore(document.createTextNode(n.nodeValue.slice(0, sOfs)), n);
                        n.parentNode.insertBefore(t, n);
                        if (eOfs) n.parentNode.insertBefore(document.createTextNode(n.nodeValue.slice(eOfs)), n);
                        n.parentNode.removeChild(n);
                        last = text;
                        lastOfs = eOfs - sOfs;
                    }
                });
            }
            sel.collapse(last, lastOfs);
        }
        onSelectionChange();

        function exists(r, n, t) {
            if (!r.contains(n)) return null;
            if (n.nodeType == 1 && n.tagName == t) return n;
            if (n === r) return null;
            return exists(r, n.parentNode, t);
        }
    }

    function createList(tag) {
        var root;
        var leafs = [];
        traverseSel(function (n) {
            if (n.nodeType == 3 && n.nodeValue.length) {
                leafs.push(n);
                if (!root) {
                    root = n.parentNode;
                }
                else {
                    while (!n.contains(root)) n = n.parentNode;
                    root = n;
                }
                while (isTextNode(root) || root.tagName == "LI" || root.tagName == "DD") root = root.parentNode;
            }
        });
        if (!tag) {
            if (root?.tagName == "UL" || root?.tagName == "OL") tag = root.tagName;
            else tag = "DL";
        }
        if (!root && getSelection().isCollapsed) {
            root = getSelection().focusNode;
            if (!root.firstChild) {
                let p = root.appendChild(document.createElement("P"));
                leafs.push(p.appendChild(document.createTextNode(zeroWidthSpace)));
            }
        }
        if (root && content.container.contains(root)) {
            normalize(root);

            var l, li, n;
            for (var c = root.firstChild, i = 0; c; c = n) {
                n = c.nextSibling;
                if (c.contains(leafs[i])) {
                    while (c.contains(leafs[i])) i++;
                    while (isTextNode(c) && isTextNode(c.previousSibling)) { n = c; c = c.previousSibling; };
                    if (!l) {
                        if (isListNode(root)) {
                            if (c.previousSibling) {
                                l = c.previousSibling.appendChild(document.createElement(tag));
                            }
                            else {
                                var t = root.insertBefore(document.createElement(tag == "DL" ? "DD" : "LI"), c);
                                t.appendChild(document.createTextNode(zeroWidthSpace));
                                l = t.appendChild(document.createElement(tag));
                            }
                        }
                        else {
                            l = root.insertBefore(document.createElement(tag), c);
                        }
                    }
                    if (!li || !isTextNode(li.firstChild) || !isTextNode(c)) {
                        li = l.appendChild(document.createElement(tag == "DL" ? "DD" : "LI"));
                    }
                    if (isTextNode(c)) {
                        li.appendChild(root.removeChild(c));
                        while (isTextNode(n)) {
                            c = n; n = n.nextSibling;
                            li.appendChild(root.removeChild(c));
                        }
                    }
                    else if (c.tagName == "P") {
                        root.removeChild(c);
                        while (c.firstChild) li.appendChild(c.removeChild(c.firstChild));
                    }
                    else if (isListNode(c)) {
                        li.appendChild(document.createTextNode(zeroWidthSpace));
                        li.appendChild(root.removeChild(c));
                    }
                    else if (c.tagName == (tag == "DL" ? "DD" : "LI")) {
                        while (c.firstChild) li.appendChild(c.removeChild(c.firstChild));
                        root.removeChild(c);
                    }
                    else {
                        li.appendChild(root.removeChild(c));
                    }
                }
            }
            if (!root.firstChild) root.parentNode.removeChild(root);
            setCursor(l, true);
        }
    }

    function remList(rem) {
        if (rem?.nodeType == 1) {
            while (rem.firstChild) {
                var c = rem.firstChild;
                var p = document.createElement("P");
                if (c.nodeType == 3) {
                    p.appendChild(rem.removeChild(c));
                }
                else {
                    while (c.firstChild) p.appendChild(c.removeChild(c.firstChild));
                }
                rem.parentNode.insertBefore(p, rem);
                rem.removeChild(rem.firstChild);
            }
            rem.parentNode.removeChild(rem);
            onSelectionChange();
        }
    }

    function unIndentSel() {
        var s = [];
        traverseSel(function (n) {
            if (n.nodeType == 3 && n.nodeValue.length) {
                s.push(n);
            }
        });
        while (s.length) unIndent(s.shift());
    }

    function unIndent(node) {
        if (content.container.contains(node)) {
            var c = node;
            var r = node.parentNode;
            while (r != content.container && !isListNode(r)) {
                c = r;
                r = r.parentNode;
            }
            var p = r.parentNode;
            if (r != content.container) {
                var f = r.nextSibling;
                var l;
                if (c.nextSibling) {
                    f = p.insertBefore(document.createElement(r.tagName), r.nextSibling);
                    while (c.nextSibling) f.appendChild(r.removeChild(c.nextSibling));
                }
                r.removeChild(c);
                if (!r.firstChild) p.removeChild(r);
                var n = p.insertBefore(document.createElement(isItemNode(p) ? p.tagName : "P"), f);
                while (c.firstChild) l = n.appendChild(c.removeChild(c.firstChild));
                if (l) setCursor(l, true);
            }
        }
    }

    // interface functions

    this.insert = function (text) {
        var s = getSelection();
        if (s && content.container.contains(s.focusNode)) {
            var f = s.focusNode;
            var o = s.focusOffset;
            f.textContent = f.textContent.slice(0, o) + text + f.textContent.slice(o);
            setCursor(f, true);
        }
    }

    this.backspace = function (num) {
        var s = getSelection();
        if (s && content.container.contains(s.focusNode)) {
            var f = s.focusNode;
            var o = s.focusOffset;
            if (s) f.textContent = f.textContent.slice(0, o - num) + f.textContent.slice(o);
            s.collapse(f, o - num);
        }
    }

    this.indent = createList;
    this.unIndent = unIndentSel;
    this.l = function (tag, rem) { if (rem) remList(rem); else createList(tag); };
    this.emphasis = emphasis;
    this.text = function (noempty) { return noempty && empty(content.container) ? null : content.container.innerHTML.replace(/<br>/g, "<br/>"); }
    this.setText = function (html, nochange) { content.addHTML(html); if (html) setTimeout(function () { setCursor(null, true) }, 10); if (!nochange && onChanged) onChanged(); return this };
    this.focus = function () { content.container.focus(); }
    this.blur = function () { content.container.blur(); }
    this.contentHeight = function () { return content.container.scrollHeight; };
    this.keydown = function (e) { onKeyDown(e) };
    this.cleanupHTML = cleanupHTML;
    this.normalize = normalize;
    this.setCursor = setCursor;
};
innovaphone.ui1.Editor.prototype = innovaphone.ui1.nodePrototype;
