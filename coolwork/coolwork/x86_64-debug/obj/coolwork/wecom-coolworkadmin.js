
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.coolworkAdmin = Wecom.coolworkAdmin || function (start, args) {
    this.createNode("body");
    var that = this;
    var appdn = start.title;
    var UIuser;
    var imgBD; // db files variaveis
    var input; // db files variaveis
    var listbox; // db files variaveis
    var filesToUpload = []; // db files variaveis
    var colDireita;
    var UIuserPicture;
    var avatar = start.consumeApi("com.innovaphone.avatar");

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

    var texts = new innovaphone.lib1.Languages(Wecom.coolworkTexts, start.lang);

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    function app_connected(domain, user, dn, appdomain) {
        UIuser = dn
        avatar = new innovaphone.Avatar(start, user, domain);
        UIuserPicture = avatar.url(user, 80, dn);
        var devicesApi = start.consumeApi("com.innovaphone.devices");
        devicesApi.onmessage.attach(devicesApi_onmessage); // onmessage is called for responses from the API
        devicesApi.send({ mt: "GetPhones" });
        avatar = new innovaphone.Avatar(start, user, domain);
    }

    function devicesApi_onmessage(conn, obj) {
        console.log("devicesApi_onmessage: " + JSON.stringify(obj));
        if (obj.msg.mt == "GetPhonesResult") {
            var devices = obj.msg.phones;
            console.log("devicesApi_onmessage:GetPhonesResult " + JSON.stringify(devices));
            app.send({api:"admin", mt:"PhoneList", devices: devices})
        }
        
    }
    function app_message(obj) {
        if (obj.api === "admin" && obj.mt === "PhoneListResult") {
            // placeholder for JsonApi handling
            console.log("app_message:PhoneListResult " + JSON.stringify(obj.result));
            var phone_list = obj.result
            //makePhoneButtons(phone_list)
            constructor(phone_list)
        }

    }

    function constructor(phone){

        var colEsquerda = that.add(new innovaphone.ui1.Div(null, null, "colunaesquerda"));
        colEsquerda.setAttribute("id","colesquerda")
    
        var divList = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; border-bottom: 1px solid #4b545c; border-width: 100%; height: 10%; width: 100%; background-color: #02163F;  display: flex; align-items: center;", null, null));
        var imglogo = divList.add(new innovaphone.ui1.Node("img", "max-height: 33px; position: absolute; left: 10px; opacity: 0.8;", null, null).setAttribute("src", "./images/logo-wecom.png"));
        var spanreport = divList.add(new innovaphone.ui1.Div("font-size: 1.00rem; position: absolute; left: 43px; color:white; margin: 5px;", appdn, null));
    
        var user = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; height: 10%; top: 10%; width: 100%; align-items: center; display: flex; border-bottom: 1px solid #4b545c"));
        var imguser = user.add(new innovaphone.ui1.Node("img", "max-height: 33px; position: absolute; left: 10px; border-radius: 50%;", null, null));
        imguser.setAttribute("src", UIuserPicture);
        var username = user.add(new innovaphone.ui1.Node("span", "font-size: 1.00rem; position: absolute; left: 43px; color:white; margin: 5px;", UIuser, null));
        username.setAttribute("id", "user");

        var itens = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; height: 10%; top: 20%; width: 100%; align-items: center; display: flex; justify-content: center; border-bottom: 1px solid #4b545c",texts.text("labelCreateRoom"),null))
        itens.addEvent("click",function(){
           makeDivCreateRoom(phone)
        })
        // col direita fora do list - box 
        colDireita = that.add(new innovaphone.ui1.Div(null,null,"colDireita"));
        var divmain = colDireita.add(new innovaphone.ui1.Div("position:absolute;width:100%;height:100%;text-align:center;display:flex;justify-content:center;align-items:center",null,null).setAttribute("id","mainDiv"));
        divmain.add(new innovaphone.ui1.Node("span", "", "MAC do Telefone:", ""));
        var inputHW = divmain.add(new innovaphone.ui1.Node("input", "", "", ""));
        inputHW.setAttribute("id", "hwinput").setAttribute("type", "text");
        var iptHW = document.getElementById("hwinput")
        var loginButton = divmain.add(new innovaphone.ui1.Div(null, null, "button")
            .addText("Login")
            .addEvent("click", function () { app.send({ api: "user", mt: "LoginPhone", hw: iptHW.value }); }, loginButton));
        var logoutButton = divmain.add(new innovaphone.ui1.Div(null, null, "button")
            .addText("Logout")
            .addEvent("click", function () { app.send({ api: "user", mt: "LogoutPhone", hw: iptHW.value });}, logoutButton));

            //db files

            // var dialog = divmain.add(new innovaphone.ui1.Node("dialog", "", "", ""));
            // dialog.add(new innovaphone.ui1.Node("span", "", "Processing...", ""));

            // var dropArea = divmain.add(new innovaphone.ui1.Div("border: 5px solid blue; width: 200px; height: 100px;", "", "droparea"));
            // dropArea.add(new innovaphone.ui1.Node("p", "", "Drag one or more PDF files to this drop zone.", ""));
            // dropArea.container.addEventListener('drop', dropHandler, true);
            // dropArea.container.addEventListener('dragover', dragOverHandler, true);

            var fileList = divmain.add(new innovaphone.ui1.Div("", "", "filelist"));
            
    }
    function makeDivCreateRoom(phone){
        listbox = colDireita.add(new innovaphone.ui1.Node("div", null, null, "list-box scrolltable").setAttribute("id","list-box"))
        listbox.add(new innovaphone.ui1.Div(null,null,null).setAttribute("id","closewindow"))
        listbox.add(new innovaphone.ui1.Div(null,texts.text("labelName"),null))
        listbox.add(new innovaphone.ui1.Input("height: 13.5px ; width: 130px;margin-right:100px;margin-left:10px;",null,null,100,"text",null))
        input = listbox.add(new innovaphone.ui1.Node("input", "height:25px;", "", ""));
        input.setAttribute("id", "fileinput").setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.container.addEventListener('change', onSelectFile, false);
        
        var divPhones = listbox.add(new innovaphone.ui1.Div("position: absolute;width: 50%;display: flex;align-items: center;left: 3%; justify-content: center;top: 40%;",null,null).setAttribute("id","divPhones"))
        imgBD = listbox.add(new innovaphone.ui1.Node("div","position: absolute;width: 50%;left: 50%;display: flex;align-items: center; justify-content: center;top: 40%;",null,null).setAttribute("id","imgBD"))
        makePhoneButtons(phone)
        app.sendSrc({ mt: "SqlInsert", statement: "insert-folder", args: { name: "myFolder" } }, folderAdded);
        
        document.getElementById("closewindow").addEventListener("click",function(){
            colDireita.rem(listbox)
        })

    var phoneElements = document.querySelectorAll(".phoneButtons");
    phoneElements.forEach(function (phoneElement) {
        phoneElement.draggable = true;

        phoneElement.addEventListener("dragstart",drag,true)
    });
    document.getElementById("imgBD").addEventListener("dragover",allowDrop,true)
    document.getElementById("imgBD").addEventListener("drop",drop,true)
    }
   

    function allowDrop(ev) {
        ev.stopPropagation();
        ev.preventDefault();
    }
    function drop(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        var data = ev.dataTransfer.getData("text");
        var draggedElement = document.getElementById(data);
        
        // Atualize a posição do elemento arrastado para as coordenadas do evento de soltura
        draggedElement.style.left = (ev.clientX - document.getElementById("imgBD").offsetLeft) + "px";
        draggedElement.style.top = (ev.clientY - document.getElementById("imgBD").offsetTop) + "px";
    
        // Defina o z-index para garantir que o elemento seja exibido na frente de outros elementos
        draggedElement.style.zIndex = "2000";
    
        // Defina a posição como absoluta para garantir o posicionamento correto
        draggedElement.style.position = "absolute";
    
        // Anexe o elemento à div "imgBD"
        document.getElementById("imgBD").appendChild(draggedElement);
    }
      function drag(ev) {
        ev.dataTransfer.setData("text", ev.target.id);
        ev.dataTransfer.dropEffect = 'copy';
    }

    function makePhoneButtons(obj){

        obj.forEach(function (phone) {
            var userPicture = avatar.url(phone.sip ,80)
            // console.log("SIP DO CARA" + phone.sip)
            var phoneHTML = `
            <div class="StatusPhone${phone.online} phoneButtons" id="${phone.hwId}">
            <div class="user-info">
                <img class="imgProfile" src="${userPicture}">
                <div class="user-name">${phone.cn}</div>
            </div>
            <div class="product-name">${phone.product}</div>
             </div>
            `;
             document.getElementById("divPhones").innerHTML += phoneHTML;
        });
    }
        // construtor 
    function constructorReserva() {
        that.clear();
        // col Esquerda
        var colEsquerda = that.add(new innovaphone.ui1.Div(null, null, "colunaesquerda"));
        colEsquerda.setAttribute("id","colesquerda")

        var relatorios = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 24%; height: 40%;"));
        var prelatorios = relatorios.add(new innovaphone.ui1.Node("p", "text-align: center; font-size: 20px;", texts.text("labelAdmin"), null));
        var br = relatorios.add(new innovaphone.ui1.Node("br", null, null, null));
    
        var lirelatorios1 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"));
        var lirelatorios2 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"));
        var lirelatorios3 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"));
        var lirelatorios4 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"));
        var lirelatorios5 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"));
        // var lirelatorios3 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))

        var Arelatorios1 = lirelatorios1.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgUsers"), null));
        Arelatorios1.setAttribute("id", "CfgUsers");
        // var Arelatorios2 = lirelatorios2.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgGoogle"), null));
        // Arelatorios2.setAttribute("id", "CfgGoogle");
        var Arelatorios2 = lirelatorios2.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgLicense"), null));
        Arelatorios2.setAttribute("id", "CfgLicense");
        var Arelatorios3 = lirelatorios3.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgDepartment"), null));
        Arelatorios3.setAttribute("id", "CfgDepartment");
        var Arelatorios4 = lirelatorios4.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgPost"), null));
        Arelatorios4.setAttribute("id", "CfgPost");
        var Arelatorios5 = lirelatorios5.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgUrl"), null));
        Arelatorios5.setAttribute("id", "CfgUrl");

        var divother = colEsquerda.add(new innovaphone.ui1.Div("text-align: left; position: absolute; top:59%;", null, null));
        var divother2 = divother.add(new innovaphone.ui1.Div(null, null, "otherli"));

        var config = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 90%;", null, null));
        var liconfig = config.add(new innovaphone.ui1.Node("li", "display:flex; aligns-items: center", null, "config"));

        var imgconfig = liconfig.add(new innovaphone.ui1.Node("img", "width: 100%; opacity: 0.9; margin: 2px; ", null, null));
        imgconfig.setAttribute("src", "./images/wecom-white.svg");
        //var Aconfig = liconfig.add(new innovaphone.ui1.Node("a", "display: flex; align-items: center; justify-content: center;", texts.text("labelConfig"), null));
        //Aconfig.setAttribute("href", "#");

        var a = document.getElementById("CfgUsers");
            a.addEventListener("click", function () { 
            ChangeView("CfgUsers", colDireita) 
            });

        var a = document.getElementById("CfgLicense");
            a.addEventListener("click", function () { 
            ChangeView("CfgLicense", colDireita) 
            });
        var a = document.getElementById("CfgDepartment");
            a.addEventListener("click", function () { 
            ChangeView("CfgDepartment", colDireita) 
            });

        var a = document.getElementById("CfgPost");
            a.addEventListener("click", function () { 
            ChangeView("CfgPost", colDireita) 
            });
        var a = document.getElementById("CfgUrl");
        a.addEventListener("click", function () {
            var link = appUrl + '/Posts.htm';

            var popup =  `<div style="position:absolute; left:82%; width:15%; top:70%; font-size:12px; text-align:center;" id="popupbtn" class= "button-inn";>${texts.text("labelSite")}</div>.`
            
            makePopup("URL", link + popup, 800, 200);

            var b = document.getElementById("popupbtn")
            b.addEventListener("click", function () {
            window.open(link, '_blank');
            removeEventListener("click", b);
            });
        });

        _colDireita = colDireita;
    }




    // db files
    
    

    function dropHandler(ev) {
        console.log("File(s) dropped");

        // Prevent default behavior (Prevent file from being opened)
        ev.stopPropagation();
        ev.preventDefault();

        if (ev.dataTransfer && ev.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            [...ev.dataTransfer.items].forEach((item, i) => {
                // If dropped items aren't files, reject them
                if (item.kind === "file") {
                    const file = item.getAsFile();
                    console.log(`... file[${i}].name = ${file.name}`);
                    filesToUpload.push(file);
                }
            });
            startfileUpload();
        } else {
            // Use DataTransfer interface to access the file(s)
            [...ev.dataTransfer.files].forEach((file, i) => {
                console.log(`... file[${i}].name = ${file.name}`);
                filesToUpload.push(file);
            });
            startfileUpload();
        }
    }

    function dragOverHandler(ev) {
        console.log("File(s) in drop zone");

        // Prevent default behavior (Prevent file from being opened)
        ev.stopPropagation();
        ev.preventDefault();
        ev.dataTransfer.dropEffect = 'copy';
    }
    var folder = null;

    function onSelectFile() {
        postFile(input.container.files[0]);
    }

    function startfileUpload() {
        if (filesToUpload.length > 0) {
            postFile(filesToUpload.pop());
        }
    }

    function postFile(file) {
        if (!file) return;
        //dialog.container.showModal();
        sessionKey = innovaphone.crypto.sha256("generic-dbfiles:" + app.key());

        fetch('?dbfiles=myfiles&folder=' + folder + '&name=' + encodeURI(file.name) + '&key=' + sessionKey,
            {
                method: 'POST',
                headers: {},
                body: file
            }).then(response => {
                if (!response.ok) {
                    return Promise.reject(response);
                }
                return response.json();
            }).then(data => {
                console.log("Success");
                //dialog.container.close();
                console.log(data);
                listFolder(folder);
                startfileUpload();
            }).catch(error => {
                //dialog.container.close();
                if (typeof error.json === "function") {
                    error.json().then(jsonError => {
                        console.log("JSON error from API");
                        console.log(jsonError);
                    }).catch(genericError => {
                        console.log("Generic error from API");
                        console.log(error.statusText);
                    });
                } else {
                    console.log("Fetch error");
                    console.log(error);
                }
            });
    }

    function deleteFile(id) {
        if (!id) return;
       // dialog.container.showModal();
        sessionKey = innovaphone.crypto.sha256("generic-dbfiles:" + app.key());

        fetch('?dbfiles=myfiles&folder=' + folder + '&del=' + id + '&key=' + sessionKey,
            {
                method: 'POST',
                headers: {}
            }).then(response => {
                if (!response.ok) {
                    return Promise.reject(response);
                }
                return response.json();
            }).then(data => {
                console.log("Success");
                //dialog.container.close();
                console.log(data);
                document.getElementById("imgBD").innerHTML = '';
                listFolder(folder);
            }).catch(error => {
                //dialog.container.close();
                if (typeof error.json === "function") {
                    error.json().then(jsonError => {
                        console.log("JSON error from API");
                        console.log(jsonError);
                    }).catch(genericError => {
                        console.log("Generic error from API");
                        console.log(error.statusText);
                    });
                } else {
                    console.log("Fetch error");
                    console.log(error);
                }
            });
    }
    function folderAdded(msg) {
        folder = msg.id;
        listFolder(folder);
    }

    function listFolder(id) {
       // fileList.clear();
        app.sendSrcMore({ mt: "DbFilesList", name: "myfiles", folder: id }, listFolderResult);
    }

    function listFolderResult(msg) {
        if ("files" in msg && msg.files.length > 0) {
            msg.files.forEach(file => addFileToFileList(file));
        }
    }

    function addFileToFileList(file) {
        
        var imgFile = imgBD.add(new innovaphone.ui1.Node("img","width:100%;height:200px",null,null))
        imgFile.setAttribute("src",file.url)

         var delButton = new innovaphone.ui1.Div(null, null, "button")
             .addText("\uD83D\uDDD1")
             .addEvent("click", function () { deleteFile(file.id) }, delButton);
        //listbox.add(delButton)
        imgBD.add(delButton)
        // var entry = fileList.add(new innovaphone.ui1.Div("", "", "fileentry"));
        // entry.add(new innovaphone.ui1.Div("", "", "fileid").addText(file.id));

        // var nameContainer = entry.add(new innovaphone.ui1.Div("", "", "filename"));
        // nameContainer.add(new innovaphone.ui1.Node("span", "", file.name, ""));

        // var sizeContainer = entry.add(new innovaphone.ui1.Div("", "", "filesize"));
        // sizeContainer.add(new innovaphone.ui1.Node("span", "", formatBytes(file.size), ""));

        // in-session download link, available only as long the user is logged in
        // var linkcontainerPrivate = entry.add(new innovaphone.ui1.Div("", "", "private"));
        // var linkPrivate = linkcontainerPrivate.add(new innovaphone.ui1.Node("a", "", "", "").addText("Private Link"));
        // linkPrivate.setAttribute("href", file.url);
        // linkPrivate.setAttribute("target", "_blank");

        // share file download link, avilable via URL
        // var linkcontainerPublic = entry.add(new innovaphone.ui1.Div("", "", "public"));
        // var linkPublic = linkcontainerPublic.add(new innovaphone.ui1.Node("a", "", "", "").addText("Public Link"));
        // linkPublic.setAttribute("href", start.originalUrl + "/files/" + file.id);
        // linkPublic.setAttribute("target", "_blank");

    }
        

    // function addLine(text) {
    //     fileList.add(new innovaphone.ui1.Div("", "", "")).addText(text);
    // }

    // function formatBytes(bytes) {
    //     if (bytes === 0) return "0 Bytes";
    //     const units = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    //     const k = 1024;
    //     const i = Math.max(0, Math.floor(Math.log(bytes) / Math.log(k)) - 1);
    //     const size = Math.round(bytes / Math.pow(k, i));
    //     const numberWithPeriods = size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    //     return numberWithPeriods + " " + units[i];
    // }

}

Wecom.coolworkAdmin.prototype = innovaphone.ui1.nodePrototype;
