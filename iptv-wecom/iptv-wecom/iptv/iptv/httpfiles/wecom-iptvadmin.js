
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.iptvAdmin = Wecom.iptvAdmin || function (start, args) {
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
            constructor();
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
    function constructor(){
        table();
        modal();

    var elcloseModal = document.getElementById("closeModal");
    elcloseModal.addEventListener("click", function () { closeModal() }, false);

    var elCancelModal = document.getElementById("cancelModal");
    elCancelModal.addEventListener("click", function () { closeModal() }, false);

    var elSalvarCloseModal = document.getElementById("salvarCloseModal");
    elSalvarCloseModal.addEventListener("click", function () { insertChannel() }, false);

    var elAddVideoModal = document.getElementById("newVideoModal");
    elAddVideoModal.addEventListener("click", function () { newVideoModal() }, false);

    var elDelVideoModal = document.getElementById("deleteVideo");
    elDelVideoModal.addEventListener("click", function () { deleteChannel() }, false);

    }
    function table(){
        var container = that.add(new innovaphone.ui1.Div(null,null,null));
        container.setAttribute("id","container")
        var table = container.add(new innovaphone.ui1.Node("table",null,null,"truetable"));
        table.setAttribute("id","tableChannels")
        var tr = table.add(new innovaphone.ui1.Node("tr",null,null,null));
        
        var name = {a:"SELECIONAR",b:"NOME",c:"PAGINA",d:"TIPO",e:"URL",f:"LOGO"};
        for (var x in name) {
          var th = tr.add(new innovaphone.ui1.Node("th",null,name[x],null));
        }
        var divbtn = container.add(new innovaphone.ui1.Div(null,null,null));
        divbtn.setAttribute("id","divbtn");
        var btnDelete = divbtn.add(new innovaphone.ui1.Node("buton",null,texts.text("RemoveVideo"),"btn btn-close btn-lg"));
        btnDelete.setAttribute("id","deleteVideo");
        var btnAdd = divbtn.add(new innovaphone.ui1.Node("buton",null,texts.text("AddVideo"),"btn btn-save btn-lg"));
        btnAdd.setAttribute("id","newVideoModal");
      }
  
      function modal(){
          var divModal = that.add(new innovaphone.ui1.Div(null,null,"modal"));
          var headerModal = divModal.add(new innovaphone.ui1.Node("header",null,null,null));
          var h2Modal = headerModal.add(new innovaphone.ui1.Node("h2",null,texts.text("AddVideo"),null));
          var spanModal = headerModal.add(new innovaphone.ui1.Node("span",null,"×","fechar-modal"));
          spanModal.setAttribute("id","closeModal");
          var corpoModal = divModal.add(new innovaphone.ui1.Div(null,null,"corpo-modal"))
          var pNome = corpoModal.add(new innovaphone.ui1.Node("p",null,texts.text("licNome"),null))
          var iptNomeVideo = corpoModal.add(new innovaphone.ui1.Input(null,null,null,null,"text","input"));
          iptNomeVideo.setAttribute("id","nomeVideo");
          var br = corpoModal.add(new innovaphone.ui1.Node("p","padding: 3px;",null,null));
          var pTipo = corpoModal.add(new innovaphone.ui1.Node("p",null,texts.text("licTipo")));
          var selectType = corpoModal.add(new innovaphone.ui1.Node("select",null,null,null));
          selectType.setAttribute("id","selectType");   
          selectType.setAttribute("name","selectType");
           var value1 = {a:"video/mp4",b:"application/x-mpegURL",c:"youtube",d:"video/flv",e:"audio/mpeg",f:"audio/wav"}
           for (var x in value1) {
              var optionType = selectType.add(new innovaphone.ui1.Node("option",null,value1[x],null));
              optionType.setAttribute("value",value1[x])
            }
          var pUrl = corpoModal.add(new innovaphone.ui1.Node("p",null,texts.text("licURL")));
          var iptUrlVideo = corpoModal.add(new innovaphone.ui1.Input(null,null,null,null,"url","input"));
          iptUrlVideo.setAttribute("id","urlVideo");
          var pUrlLogo = corpoModal.add(new innovaphone.ui1.Node("p",null,texts.text("licUrlLogo")));
          var iptUrlLogo = corpoModal.add(new innovaphone.ui1.Input(null,null,null,null,"url","input"));
          iptUrlLogo.setAttribute("id","urlImg");
          var modalFooter = divModal.add(new innovaphone.ui1.Node("footer",null,null,null));
          var btnCancel = modalFooter.add(new innovaphone.ui1.Node("button",null,texts.text("licCancel"),"btn btn-close btn-lg"));
          btnCancel.setAttribute("id","cancelModal");
          var btnSave = modalFooter.add(new innovaphone.ui1.Node("button",null,texts.text("licSave"),"btn btn-save btn-lg"));
          btnSave.setAttribute("id","salvarCloseModal");
          var mask = that.add(new innovaphone.ui1.Div(null,null,null));
          mask.setAttribute("id","mascara");
          
      }
    function insertChannel() {
        var nameVideo = document.getElementById("nomeVideo").value;
        var urlVideo = document.getElementById("urlVideo").value;
        var urlLogo = document.getElementById("urlImg").value;
        var typeVideo = document.getElementById("selectType").value;
        console.log(nameVideo);
        if (nameVideo.length > 1 && urlVideo.length > 1 && urlLogo.length > 1) {
            app.send({ api: "channel", mt: "AddChannelMessage", name: String(nameVideo), url: String(urlVideo), img: String(urlLogo), type: String(typeVideo) });
        }
    }

    function deleteChannel() {
        //var idVideo = document.getElementById("idVideo").value;
        var checkedValue = null;
        var inputElements = document.getElementsByClassName('checkChannels');
        for (var i = 0; inputElements[i]; ++i) {
            if (inputElements[i].checked) {
                checkedValue = inputElements[i].value;
                console.log(checkedValue);
                app.send({ api: "channel", mt: "DeleteChannelMessage", id: checkedValue });
                //break;  Vamos testar sem o break para ver como o codigo se comporta.
            }
        }

        
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
        try {
            var lis = document.querySelectorAll('#channelLine');
            for (var i = 0; li = lis[i]; i++) {
                li.parentNode.removeChild(li);
            }
            console.log("Limpou o Td")
        } catch {
            console.log("o Td estava limpo!")
        }

        var table = document.getElementById('tableChannels');
        data.forEach(function (object) {
            var tr = document.createElement('tr');
            tr.setAttribute("class", "tr1");
            tr.setAttribute('id', 'channelLine');
            tr.innerHTML = '<td class="tdborder"><input type="checkbox" id="checkChannels" class="checkChannels" value="' + object.id + '"></td>' +
                '<td class="tdborder2">' + object.name + '</td>' +
                '<td class="tdborder3">' + object.type + '</td>' +
                '<td class="tdborder4">' + object.url + '</td>' +
                '<td class="tdborder5"><img id="imglogo" class="logo" src="' + object.img + '"></td>';
            table.appendChild(tr);
        });
    }
}

Wecom.iptvAdmin.prototype = innovaphone.ui1.nodePrototype;
