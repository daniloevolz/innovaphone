
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.CriticalViewAdmin = Wecom.CriticalViewAdmin || function (start, args) {
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

    var texts = new innovaphone.lib1.Languages(Wecom.CriticalViewTexts, start.lang);

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "admin", mt: "AdminMessage" });
        app.send({ api: "channel", mt: "SelectChannelMessage" });
    }

    function app_message(obj) {
        if (obj.api == "admin" && obj.mt == "AdminMessageResult") {

        }
        
        if (obj.api == "channel" && obj.mt == "ChannelMessageError") {
            console.log(obj.result);
        }
        if (obj.api == "channel" && obj.mt == "SelectChannelMessageResultSuccess") {
            console.log(obj.mt);
            var channels = JSON.parse(obj.result);
            insereTd(channels);

        }
        if (obj.api == "channel" && obj.mt == "InsertChannelMessageSucess") {
            closeModal();
            getChannels();
        }
        if (obj.api == "channel" && obj.mt == "DeleteChannelMessageResultSuccess") {
            getChannels();
        }
    }
        
    function makeDivAddButton() {
        that.clear();
        //Título
        that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("labelTituloAdd")));

        //Usuário
        that.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:10%; font-size:15px; text-align:right", texts.text("labelName")));
        var iptName = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:10%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
        that.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:25%; font-size:15px; text-align:right", texts.text("labelType")));
        var iptType = that.add(new innovaphone.ui1.Node("select", "position:absolute; left:16%; width:30%; top:25%; font-size:12px; text-align:center", null, null));
        iptType.setAttribute("id", "selectType");
        var value1 = {a:"video/mp4",b:"application/x-mpegURL",c:"youtube",d:"video/flv",e:"audio/mpeg",f:"audio/wav"}
        for (var x in value1) {
        var optionType = iptType.add(new innovaphone.ui1.Node("option",null,value1[x],null));
        optionType.setAttribute("value",value1[x])
      }
      that.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:10%; font-size:15px; text-align:right", texts.text("labelPage")));
      var iptPage = that.add(new innovaphone.ui1.Node("select", "position:absolute; left:16%; width:30%; top:25%; font-size:12px; text-align:center", null, null));
      iptPage.setAttribute("id","selectPage");
      for (let i = 1; i < 7; i++) {
                var optionPage = iptPage.add(new innovaphone.ui1.Node("option",null,"Página " + i,null));
                optionPage.setAttribute("value",i)
            }
        that.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:10%; font-size:15px; text-align:right", texts.text("labelURL")));
        var iptUrl = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:10%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
        //Botão Salvar

        that.add(new innovaphone.ui1.Div("position:absolute; left:30%; width:15%; top:30%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
            var type = document.getElementById("selectType").value;
            if (String(iptName.getValue()) == "" || String(iptType.getValue()) == "" || String(iptPage.getValue()) == "") {
                makePopup("Atenção", "Complete todos os campos para que o botão possa ser criado.");
            }
            else {
                app.send({ api: "channel", mt: "AddChannelMessage", name: String(iptName.getValue()), url: String(iptUrl.getValue()), type: String(iptType.getValue()), page: StringparseInt(iptPage.getValue()) });
                makeDivAdmin();
            }
             });
        //Botão Cancelar   
        that.add(new innovaphone.ui1.Div("position:absolute; left:55%; width:15%; top:30%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnCancel").addEvent("click", function () {
            makeDivAdmin();
            makeTableButtons();
            makeTableActions();
        });
    }

    function getChannels() {
        app.send({ api: "channel", mt: "SelectChannelMessage" });
    }

    function newVideoModal(e) {
        const modalNewVideo = document.querySelector('.modal');
        modalNewVideo.classList.add('visivel');

    }

    function closeModal(e) {
        console.log('function closemodal.');
        const modalNewVideo = document.querySelector('.modal');
        modalNewVideo.classList.remove('visivel');
    }

    function insereTd(data) {
        that.add(new innovaphone.ui1.Div("position:absolute; left:5%; width:15%; top:35%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnAddButton").addEvent("click", function () {
            makeDivAddButton();
        });
            that.add(new innovaphone.ui1.Div("position:absolute; left:25%; width:15%; top:15%; font-size:12px; text-align:center; color:var(--div-DelBtn); background-color: #B0132B", null, "button-inn")).addTranslation(texts, "btnDelButton").addEvent("click", function () {
            var selected = listView.getSelectedRows();
            console.log(selected);
            var selectedrows = [];

            selected.forEach(function (s) {
                console.log(s);
                selectedrows.push(listView.getRowData(s))
                console.log(selectedrows[0]);
                app.send({ api: "admin", mt: "DeleteMessage", id: parseInt(selectedrows[0]) });
            })
        });
            var labelTitulo = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("labelTitle")));
            var list = new innovaphone.ui1.Div("position: absolute; left:20px; top:50%; right:50%; height:300px", null, "");
            var columns = 5;
            var listView = new innovaphone.ui1.ListView(list, 30, "headercl", "arrow", false);
            //Cabeçalho
             for (i = 0; i < columns; i++) {
            listView.addColumn(null, "text", texts.text("cabecalho" + i), i, 40, false);
            }
            data.forEach(function (object) {
                var row = [];
                row.push(object.id);
                row.push(object.name);
                row.push(object.page);
                row.push(object.type);
                row.push(object.url);
                listView.addRow(i, row, "rowcl", "#A0A0A0", "#82CAE2");
                that.add(list);
         });
         
    }
}

Wecom.CriticalViewAdmin.prototype = innovaphone.ui1.nodePrototype;
