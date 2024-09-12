
var innovaphone = innovaphone || {};
innovaphone.SqlConsole = innovaphone.SqlConsole || function (style, app) {
    this.createNode("div", style);
    var panel = this.add(new innovaphone.ui1.Div("position: absolute; left:0px; right:0px; top:0px; bottom:0px; display:flex; flex-direction:column"));
    var control = panel.add(new innovaphone.ui1.Div("position:relative; width:100%; display:flex; flex-direction:row"));
    var play = control.add(new innovaphone.ui1.SvgInline("position:relative; width:20px; height:20px; margin:5px; fill:var(--innovaphone-messages-item-text); cursor:pointer", "0 0 20 20", "<path d=\'M5,16.23V3.77a1.12,1.12,0,0,1,1.74-.93l8.73,5.81a1.13,1.13,0,0,1,.06,1.83L6.84,17.12A1.12,1.12,0,0,1,5,16.23Z'/>")).addEvent("click", onplay);
    var ctrl = false;
    var input = panel.add(new innovaphone.ui1.Node("textarea", "position:relative; box-sizing:border-box; width:100%; height:150px; flex-shrink:0; flex-grow:10; resize:none")).addEvent("keydown", function (e) {
        if (e.keyCode == 17) ctrl = true;
        else if (e.keyCode == 13 && ctrl) {
            onplay();
            e.preventDefault();
        }
    }).addEvent("keyup", function (e) {
        if (e.keyCode == 17) ctrl = false;
    })
    var output = panel.add(new innovaphone.ui1.Div("position:relative; box-sizing:border-box; width:100% height:150px; flex-grow:15; overflow:auto"));

    function onplay() {
        output.clear();
        app.sendSrcMore({ mt: "SqlConsoleExec", query: input.container.value }, function (msg) {
            if (msg.mt == "SqlConsoleRow") {
                output.add(new innovaphone.ui1.Div("position:relative; font-family:monospace; white-space:nowrap", JSON.stringify(msg.result) + ","));
            }
            else if (msg.mt == "SqlConsoleExecResult") {
                output.add(new innovaphone.ui1.Div("position:relative; font-family:monospace", "Total time: " + msg.total + "ms"));
            }
        });
    }
}
innovaphone.SqlConsole.prototype = innovaphone.ui1.nodePrototype;
