
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.iptvAdmin = Wecom.iptvAdmin || function (start, args) {
    this.createNode("body");
    var that = this;

    var channels = []

    var colorSchemes = {
        dark: {
            "--bg": "url('./images/background.png')",
            "--button": "#c6c6c6",
            "--text-standard": "#ffffff",
            "--div-DelBtn": "#f2f5f6",
        },
        light: {
            "--bg": "url('./images/background.png')",
            "--button": "#c6c6c6",
            "--text-standard": "#ffffff",
            "--div-DelBtn": "#f2f5f6",
        }
    };
    var schemes = new innovaphone.ui1.CssVariables(colorSchemes, start.scheme);
    start.onschemechanged.attach(function () { schemes.activate(start.scheme) });

    var texts = new innovaphone.lib1.Languages(Wecom.iptvTexts, start.lang);

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
            makeDivAdmin()
        }
        
        if (obj.api == "channel" && obj.mt == "ChannelMessageError") {
            console.log(obj.result);
            makePopup("ERRO", "Erro: " + obj.result);
        }
        if (obj.api == "channel" && obj.mt == "SelectChannelMessageResultSuccess") {
            console.log(obj.mt);
            console.log(channels)
            channels = JSON.parse(obj.result);
            makeTableButtons();
            

        }
        if (obj.api == "channel" && obj.mt == "InsertChannelMessageSucess") {
            app.send({ api: "channel", mt: "SelectChannelMessage" });
            makeDivAdmin();
            makePopup("Atenção", "Canal criado com sucesso!");
        }
        if (obj.api == "admin" && obj.mt == "DeleteMessageSuccess") {
            that.clear();
            app.send({ api: "channel", mt: "SelectChannelMessage" });
            makeDivAdmin();
            makePopup("Atenção", "Canal excluído com sucesso!");
        }
    }

    function makePopup(header, content) {
        console.log("makePopup");
        var styles = [new innovaphone.ui1.PopupStyles("popup-background", "popup-header", "popup-main", "popup-closer")];
        var h = [20];

        var popup = new innovaphone.ui1.Popup("position:absolute; left:50px; top:50px; width:500px; height:200px; color: black; font-size: 20px; font-weight: bold", styles[0], h[0]);
        popup.header.addText(header);
        popup.content.addText(content);
    }


    function makeDivAddButton() {
        that.clear();
        //Título
        that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("labelTituloAdd")));
        // Nome 
        that.add(new innovaphone.ui1.Div("position:absolute; left:20%; width:15%; top:12%; font-size:15px; text-align:right", texts.text("labelName")));
        var iptName = that.add(new innovaphone.ui1.Input("position:absolute; left:35%; width:30%; top:12%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "text", null));
        //Tipo
        that.add(new innovaphone.ui1.Div("position:absolute; left:20%; width:15%; top:17%; font-size:15px; text-align:right", texts.text("labelType")));
        var iptType = that.add(new innovaphone.ui1.Node("select", "position:absolute; left:35%; width:30%; top:17%; font-size:12px; text-align:center", null, null));
        iptType.setAttribute("id", "selectType");
        var optionType = iptType.add(new innovaphone.ui1.Node("option",null,"application/x-mpegURL",null));
        optionType.setAttribute("value","application/x-mpegURL");
        var optionType2 = iptType.add(new innovaphone.ui1.Node("option",null,"youtube",null));
        optionType2.setAttribute("value","youtube");  
        var optionType3 = iptType.add(new innovaphone.ui1.Node("option",null,"video/mp4",null));
        optionType3.setAttribute("value","video/mp4");
        var optionType4 = iptType.add(new innovaphone.ui1.Node("option",null,"video/flv",null));
        optionType4.setAttribute("value","video/flv");
        //Página
        // that.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:20%; font-size:15px; text-align:right", texts.text("labelLogoUrl")));
        // var iptImg = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:20%; font-size:12px; text-align:center", null, null,null,"url",null));
        //URL
        that.add(new innovaphone.ui1.Div("position:absolute; left:20%; width:15%; top:22%; font-size:15px; text-align:right", texts.text("labelURL")));
        var iptUrl = that.add(new innovaphone.ui1.Input("position:absolute; left:35%; width:30%; top:22%; font-size:12px; text-align:center", null, null,null,"url",null));
        // Escolher Logo
       var divLogos = that.add(new innovaphone.ui1.Div("left:47.5%; top:28%; font-size:15px;font-weight:bold; text-align:center", texts.text("labelEscolherLogo"),"logos"));
        var btnlogo = divLogos.add(new innovaphone.ui1.Node("button","margin-top: 5%;",null,"btnLogos"))
        var img = btnlogo.add(new innovaphone.ui1.Node("img","margin:0px;width:35px",null,null))
        img.setAttribute("src","cameraIPTV.png")
        img.setAttribute("id","imgMain")
        btnlogo.add(new innovaphone.ui1.Node("p","margin:2px;","▼",null))
        
        var divLogosConteudo = divLogos.add(new innovaphone.ui1.Div(null,null,"logos-conteudos"));
        var a1 = divLogosConteudo.add(new innovaphone.ui1.Node("a","display: flex;align-items: center;margin-left:0px; border: 0;  center; justify-content: center;padding:0px",null,null));
        var a2 = divLogosConteudo.add(new innovaphone.ui1.Node("a","display: flex;align-items: center;margin-left:0px; border: 0; center; justify-content: center;padding:0px",null,null));
        var a3 = divLogosConteudo.add(new innovaphone.ui1.Node("a","display: flex;align-items: center;margin-left:0px; border: 0; center; justify-content: center;padding:0px",null,null));
        a1.setAttribute("id","CamIPTV")
        a2.setAttribute("id","PlayIPTV")
        a3.setAttribute("id","GraficoIPTV")
        var imgCam = a1.add(new innovaphone.ui1.Node("img","width:40px;",null,"linkimgs"));
        var imgPlay = a2.add(new innovaphone.ui1.Node("img","width:40px;",null,"linkimgs"));
        var imgGrafico = a3.add(new innovaphone.ui1.Node("img","width:40px;",null,"linkimgs"));
        imgCam.setAttribute("src","cameraIPTV.png")
        imgPlay.setAttribute("src","playIPTV.png")
        imgGrafico.setAttribute("src","playIPTV.png")

        var linkImg = "cameraIPTV.png"
        console.log("Link da Imagem "+ linkImg)

        //Botão Salvar
        that.add(new innovaphone.ui1.Div("position:absolute; left:30%; width:15%; top:50%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
            var type = document.getElementById("selectType").value;
        
            if (String(iptName.getValue()) == "" || String(iptUrl.getValue()) == "") {
                // || String(iptImg.getValue()) == ""
                makePopup("Atenção", "Complete todos os campos para que o canal possa ser adicionado.");
            }
            else {
                app.send({ api: "channel", mt: "AddChannelMessage", name: String(iptName.getValue()), url: String(iptUrl.getValue()), type: String(type), img: String(linkImg) });
                // makeDivAdmin();
            }
             });
        //Botão Cancelar   
        that.add(new innovaphone.ui1.Div("position:absolute; left:57%; width:15%; top:50%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnCancel").addEvent("click", function () {
            makeDivAdmin();
            makeTableButtons();
        });
     
     var Camera = document.getElementById("CamIPTV");
     Camera.addEventListener("click", function () { MudarDiv("CamIPTV"),linkImg = "cameraIPTV.png"}, false);
     var Play = document.getElementById("PlayIPTV");
     Play.addEventListener("click", function () { MudarDiv("PlayIPTV"),linkImg = "playIPTV.png" }, false);
     var Grafico = document.getElementById("GraficoIPTV");
        Grafico.addEventListener("click", function () { MudarDiv("GraficoIPTV"), linkImg = "playIPTV.png" }, false);

    }
    
    function makeDivAdmin(){
        that.clear();
        //logo wecom
        var wecom = that.add(new innovaphone.ui1.Div("position:fixed; bottom:20px",null,null));
        // wecom.setAttribute("id","logowecom");
        var wecomA = wecom.add(new innovaphone.ui1.Node("a",null,null,null))
        wecomA.setAttribute("href","https://wecom.com.br")
        var imgwecom = wecomA.add(new innovaphone.ui1.Node("img",null,null,"imglogo"));
        imgwecom.setAttribute("src","./images/wecom-white.svg")
        // titulo
        var labelTitulo = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("labelTitle")));
    }
    function makeTableButtons() {

        //Botões Tabela de Botões
        that.add(new innovaphone.ui1.Div("position:absolute; left:32%; width:15%; top:15%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnAddButton").addEvent("click", function () {
            makeDivAddButton();
        });
        that.add(new innovaphone.ui1.Div("position:absolute; left:52%; width:15%; top:15%; font-size:12px; text-align:center; color:var(--div-DelBtn); background-color: #B0132B", null, "button-inn")).addTranslation(texts, "btnDelButton").addEvent("click", function () {
            var selected = listView.getSelectedRows();
            console.log(selected);
            var selectedrows = [];

            selected.forEach(function (s) {
                console.log(s);
                selectedrows.push(listView.getRowData(s))
                console.log("TA PRINTANDO " + selectedrows[0]);
                app.send({ api: "channel", mt: "DeleteMessage", id: parseInt(selectedrows[0]) });
            })
        });   
        //Título Tabela Canais
        var labelTituloCanais = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:26%; font-size:17px; text-align:center; font-weight: bold", texts.text("labelTituloChannels")));
        var list = new innovaphone.ui1.Div("position: absolute; left:15%; top:35%;  width: 80%; height:300px", null, "");
        var columns = 5;
        var rows = channels.length;
        var listView = new innovaphone.ui1.ListView(list, 30, "headercl", "arrow", false);
        //Cabeçalho
        for (i = 0; i < columns; i++) {
            listView.addColumn(null, "text", texts.text("cabecalho" + i), i, 40, false);
        }
        //Tabela    
        channels.forEach(function (b) {
            var row = [];
            row.push(b.id);
            row.push(b.name);
            row.push(b.url);
            row.push(b.type);
            row.push(b.img);
            listView.addRow(i, row, "rowcl", "#A0A0A0", "#82CAE2");
            that.add(list);
        })
    }

      function MudarDiv(el) {
        if (el == "CamIPTV") {
            document.getElementById("imgMain").setAttribute("src","cameraIPTV.png");
            
         } else if (el == "PlayIPTV") {
            document.getElementById("imgMain").setAttribute("src","playIPTV.png")

        } else if (el == "GraficoIPTV") {
            document.getElementById("imgMain").setAttribute("src","playIPTV.png")
        }
        
    }
}
Wecom.iptvAdmin.prototype = innovaphone.ui1.nodePrototype;
