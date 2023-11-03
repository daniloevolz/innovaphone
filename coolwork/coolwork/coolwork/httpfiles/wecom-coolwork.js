
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.coolwork = Wecom.coolwork || function (start, args) {
    this.createNode("body");
    var that = this;
    var phone_list = [];
    var UIuser;
    var avatar;
    var UIuserPicture;
    var devicesApi;
    var list_MyRooms = [];
    var _colDireita;

    
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
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;
    app.onerror = function (error) {
        console.error("WECOM-LOG: Appwebsocket.Connection error: " + error);
        changeState("Disconnected");
    };
    app.onclosed = function () {
        console.error("WECOM-LOG: Appwebsocket.Connection closed!");
        changeState("Disconnected");
    };
    var currentState = "Loading";
    waitConnection(that);

    function app_connected(domain, user, dn, appdomain) {

        changeState("Connected");
        UIuser = dn
        avatar = new innovaphone.Avatar(start, user, domain);
        UIuserPicture = avatar.url(user, 80, dn);
        avatar = new innovaphone.Avatar(start, user, domain);

        
        app.send({ api: "user", mt: "SelectMyRooms" })

        
        devicesApi = start.consumeApi("com.innovaphone.devices");
        devicesApi.onmessage.attach(devicesApi_onmessage); // onmessage is called for responses from the API
        devicesApi.send({ mt: "GetPhones" }); // phonelist

        setInterval(function () {
            if (currentState == "Connected") {
                var msg = { api: "user", mt: "Ping" };
                app.send(msg);
                console.log("WECOM-LOG:Interval: Ping Sent " + JSON.stringify(msg));
            } else {
                changeState("Disconnected");
                console.log("WECOM-LOG:Interval: changeState Disconnected");
            }

        }, 60000); // A cada 60 segundo
    }
    function devicesApi_onmessage(conn, obj) {
        console.log("WECOM-LOG:devicesApi_onmessage: " + JSON.stringify(obj));
        if (obj.msg.mt == "GetPhonesResult") {
            var devices = obj.msg.phones;
            console.log("WECOM-LOG:devicesApi_onmessage:GetPhonesResult " + JSON.stringify(devices));
            app.send({ api: "user", mt: "PhoneList", devices: devices })
        }

    }
    function app_message(obj) {
        if (obj.api === "user" && obj.mt === "SelectDevicesResult") {
            phone_list = JSON.parse(obj.result)
        }
        if (obj.api === "user" && obj.mt === "SelectMyRoomsViewerResult") {
            that.clear()
            list_MyRooms = JSON.parse(obj.result)
            constructor(that)

        }
        if (obj.api === "user" && obj.mt === "SelectRoomResult") {
            var room = JSON.parse(obj.room);
            var schedules = JSON.parse(obj.schedules);
            var devices = obj.dev;
            makeDivRoom(_colDireita, room, schedules, devices);
        }
    }

    //Função para construção da GUI...
    function constructor(t) {
        t.clear()
        // col esquerda
        var colEsquerda = t.add(new innovaphone.ui1.Div(null, null, "colunaesquerda"));
        colEsquerda.setAttribute("id", "colesquerda")

        // col direita
        var colDireita = t.add(new innovaphone.ui1.Div(null, null, "colunadireita"));
        colDireita.setAttribute("id", "coldireita")


        var divList = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; border-bottom: 1px solid #4b545c; border-width: 100%; height: 10%; width: 100%; background-color: #02163F;  display: flex; align-items: center;", null, null));
        var imglogo = divList.add(new innovaphone.ui1.Node("img", "max-height: 33px; position: absolute; left: 10px; opacity: 0.8;", null, null).setAttribute("src", "./images/logo-wecom.png"));
        var spanreport = divList.add(new innovaphone.ui1.Div("font-size: 1.00rem; position: absolute; left: 43px; color:white; margin: 5px;", appdn, null));

        var user = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; height: 10%; top: 10%; width: 100%; align-items: center; display: flex; border-bottom: 1px solid #4b545c"));
        var imguser = user.add(new innovaphone.ui1.Node("img", "max-height: 33px; position: absolute; left: 10px; border-radius: 50%;", null, null));
        imguser.setAttribute("src", UIuserPicture);
        var username = user.add(new innovaphone.ui1.Node("span", "font-size: 1.00rem; position: absolute; left: 43px; color:white; margin: 5px;", UIuser, null));
        username.setAttribute("id", "user");

        //var itens = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; height: 10%; top: 20%; width: 100%; align-items: center; display: flex; justify-content: center; border-bottom: 1px solid #4b545c", texts.text("labelCreateRoom"), null))
        //itens.addEvent("click", function () {
        //    makeDivCreateRoom(t)
        //})
        var labelRoom = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; height: 10%; top: 30%; width: 100%; align-items: center; display: flex; justify-content:center;", texts.text("labelRooms") + "🔻", null))
        var rooms = colEsquerda.add(new innovaphone.ui1.Node("ul", "font-weight:bold; position: absolute; height: 55%; top: 40%; width: 100%; display: flex; flex-direction: column; overflow-x: hidden; overflow-y: auto; padding:0", null, null).setAttribute("id", "roomList"));
        //parte de exibição das salas
        list_MyRooms.forEach(function (room) {
            var liRoom = rooms.add(new innovaphone.ui1.Node("li", "width: 100%; align-items: center; display: flex;  border-bottom: 1px solid #4b545c; padding: 10px;", null, null).setAttribute("id", room.id).addEvent("click", function () {
                var clickedElement = document.getElementById(room.id)
                var clickedId = clickedElement.getAttribute("id")
                console.log('ID do elemento div clicado:', clickedId);
                app.send({ api: "user", mt: "SelectRoom", id: clickedId });
            }));
            var imgRoom = liRoom.add(new innovaphone.ui1.Node("img", "width: 50px; height: 50px; margin-right: 10px;", null, null));
            imgRoom.setAttribute("src", room.img);
            liRoom.add(new innovaphone.ui1.Node("span", "font-weight: bold;", room.name, null));
        });

        
        var divAppointment = colDireita.add(new innovaphone.ui1.Div("width:100%;height:100%;text-align:center;display:flex;justify-content:center;flex-direction: column; align-items:center", null, null).setAttribute("id", "userPresence"));
        divAppointment.add(new innovaphone.ui1.Node("span", "", "ID DA SALA:", ""));
        var inputRoom = divAppointment.add(new innovaphone.ui1.Node("input", "", "", ""));
        inputRoom.setAttribute("id", "inputRoom").setAttribute("type", "text");
        var roomInput = document.getElementById("inputRoom");
        divAppointment.add(new innovaphone.ui1.Node("span", "", "HWID PHONE", ""));
        var inputPhone = divAppointment.add(new innovaphone.ui1.Node("input", "", "", ""));
        inputPhone.setAttribute("id", "inputphone").setAttribute("type", "text");
        var phoneInput = document.getElementById("inputphone");
        divAppointment.add(new innovaphone.ui1.Node("span", "", "DATE START", ""));
        var inputDateStart = divAppointment.add(new innovaphone.ui1.Node("input", "", "", ""));
        inputDateStart.setAttribute("id", "inputDateStart").setAttribute("type", "text");
        var dateStartInput = document.getElementById("inputDateStart")
        divAppointment.add(new innovaphone.ui1.Node("span", "", "DATE END", ""));
        var inputDateEnd = divAppointment.add(new innovaphone.ui1.Node("input", "", "", ""));
        inputDateEnd.setAttribute("id", "inputDateEnd").setAttribute("type", "text");
        var dateEndInput = document.getElementById("inputDateEnd")

        var pcButton = divAppointment.add(new innovaphone.ui1.Div(null, null, "button")
            .addText("Set Presence")
            .addEvent("click", function () { app.send({ api: "admin", mt: "InsertAppointment", type: "hour", dateStart: dateStartInput.value, dateEnd: dateEndInput.value, device: phoneInput.value, deviceRoom: roomInput.value }) }, pcButton));

        _colDireita = colDireita;
    }

    //Função para criar div de visualização da sala
    function makeDivRoom(t, room, schedules, devices) {
        var insideDiv = t.add(new innovaphone.ui1.Div(null, null, "insideDiv"))
        var listbox = insideDiv.add(new innovaphone.ui1.Node("div", null, null, "list-box scrolltable").setAttribute("id", room.id))
        listbox.add(new innovaphone.ui1.Div(null, null, null).setAttribute("id", "closewindow"))
        listbox.add(new innovaphone.ui1.Node("h1", "position:absolute;width:100%;top:5%; text-align:center", room.name))

        var divDates = listbox.add(new innovaphone.ui1.Div("display:flex ; align-items:center ; width: 100%;position: absolute; justify-content: space-evenly;", null, null))

        schedules.forEach(function (schedule) {    // revisar isso na segunda 30/10
            divDates.add(new innovaphone.ui1.Div("font-weight:bold;", texts.text("labelScheduleModule") + formatDate(schedule.schedule_module), null))
            divDates.add(new innovaphone.ui1.Div("font-weight:bold;", texts.text("labelType") + formatDate(schedule.type), null))
            divDates.add(new innovaphone.ui1.Div("font-weight:bold;", texts.text("labelDateStart") + formatDate(schedule.data_start), null))
            divDates.add(new innovaphone.ui1.Div("font-weight:bold;", texts.text("labelDateEnd") + formatDate(schedule.data_end), null))
        })

        listbox.add(new innovaphone.ui1.Div("position: absolute;width: 40%; height:70%; display: flex;left: 3%; justify-content: center;top: 20%;", null, null).setAttribute("id", "divPhones"))
        var imgRoom = listbox.add(new innovaphone.ui1.Node("div", "position: absolute;width: 60%; left:40%; height:65%; display: flex;align-items: center; justify-content: center;top: 20%;", null, null).setAttribute("id", "imgBD"))
        imgRoom.add(new innovaphone.ui1.Node("img", "position:absolute;width:100%;height:100%").setAttribute("src", room.img))

        if (devices.length > 0) {
            devices.forEach(function (dev) {
               var userPicture = avatar.url(dev.sip, 80)
               var html = `<div style = "top: ${dev.topoffset + "px"}; left: ${dev.leftoffset + "px"}; position:absolute;" class="StatusPhone${dev.online} phoneButtons" id="${dev.hwid}">
                <div class="user-info">
                    <img class="imgProfile" src="${userPicture}">
                    <div class="user-name">${dev.cn}</div>
                </div>
                    <div class="product-name">${dev.product}</div>
                </div>    `
                document.getElementById("imgBD").innerHTML += html
            })
        }
        
        document.getElementById("closewindow").addEventListener("click", function () {  // close 
            insideDiv.clear()
            t.rem(insideDiv)
            app.send({ api: "admin", mt: "SelectMyRooms" })

        })
    }
    //Função para alterar o estado da váriavel de controle, utilizada para forçar o timer a tentar nova conexão.
    function changeState(newState) {
        if (newState == currentState) return;
        if (newState == "Connected") {
            currentState = newState;
            console.info("WECOM-LOG: Appwebsocket.Connection Connected: ");
        }
        if (newState == "Disconnected") {
            console.error("WECOM-LOG: Appwebsocket.Connection Disconnected: ");
            currentState = "Disconnected";
        }
    }

    //Função para apresentar Loader, chamado quando o App está desconectado ou aguardando algum processo.
    function waitConnection(div) {
        div.clear();
        var div1 = div.add(new innovaphone.ui1.Div(null, null, "preloader").setAttribute("id", "preloader"))
        var div2 = div1.add(new innovaphone.ui1.Div(null, null, "inner"))
        var div3 = div2.add(new innovaphone.ui1.Div(null, null, "loading"))
        div3.add(new innovaphone.ui1.Node("span", null, null, "circle"));
        div3.add(new innovaphone.ui1.Node("span", null, null, "circle"));
        div3.add(new innovaphone.ui1.Node("span", null, null, "circle"));
    }
}

Wecom.coolwork.prototype = innovaphone.ui1.nodePrototype;
