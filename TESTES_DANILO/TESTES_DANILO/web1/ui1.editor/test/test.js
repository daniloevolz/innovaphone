
function TestEditor() {
    var editor;
    this.exe = function (op, args) {
        if (op == "init") {
            editor = new innovaphone.ui1.Editor(args.style, args.scrollWidth, args.scrollColor);
            document.body.appendChild(editor.container);
        }
        else if (op == "focus") {
            editor.focus();
        }
        else if (op == "input") {
            var range = window.getSelection().getRangeAt(0);
            if (range.startContainer.childNodes.length == 1 && range.startContainer.childNodes[0].nodeName == "BR") {
                range.startContainer.removeChild(range.startContainer.childNodes[0]);
            }
            var t = document.createTextNode(args.text);
            range.insertNode(t);
            window.getSelection().collapse(t, args.text.length);
        }
        else if (op == "keydown") {
            editor.keydown(new KeyboardEvent("keydown", { keyCode: args.code }));
        }
        else if (op == "cursor") {
            var range = window.getSelection().getRangeAt(0);
            var start = range.startContainer;
            var e = start;
            for (var i = 0; i < args.move.length; i++) {
                if (args.move[i] == "up") start = start.parentNode;
                else if (args.move[i] == "down") start = start.childNodes[0];
                else if (args.move[i] == "prev") start = start.previousSibling;
                else if (args.move[i] == "next") start = start.nextSibling;
            }
            window.getSelection().collapse(start, args.offset);

            if (args.select) {
                let r = document.createRange();
                if (args.select == "start") {
                    r.setStart(start, 0);
                    r.setEnd(e, 1);
                }
                else if (args.select == "end") {
                    r.setStart(e, 0);
                    r.setEnd(start, 1);
                }
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(r);
            }
        }
        else if (op == "ul") {
            editor.l("ul");
        }
        else if (op == "ol") {
            editor.l("ol");
        }
        else if (op == "indent") {
            editor.indent();
        }
        else if (op == "text") {
            let text = editor.text();
            if (args.match && args.match != text) con.error({ match: text });
        }
    }

    var con = new innovaphone.test.Console(this, "Editor", innovaphone.test);
}
TestEditor.prototype = innovaphone.test.obj;
