
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
    var appdn = start.title;
    var UIuserPicture;
    var devicesApi;
    var list_MyRooms = [];
    var _colDireita;
    var schedules = []

    
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
        devicesApi.onmessage.attach(devicesApi_onmessage); //onmessage is called for responses from the API
        devicesApi.send({ mt: "GetPhones" }); //phonelist

        setInterval(function () {
            if (currentState == "Connected") {
                var msg = { api: "user", mt: "Ping" };
                app.send(msg);
                console.log("WECOM-LOG:Interval: Ping Sent " + JSON.stringify(msg));
            } else {
                changeState("Disconnected");
                console.log("WECOM-LOG:Interval: changeState Disconnected");
            }

        }, 60000); //A cada 60 segundo
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
            schedules = JSON.parse(obj.schedules);
            var devices = obj.dev;
            makeDivRoom(_colDireita, room, schedules, devices);
        }
        if(obj.api === "user" && obj.mt === "PhoneScheduleSuccess"){
            app.send({ api: "user", mt: "SelectMyRooms" })
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
        t.clear();
        var listbox = t.add(new innovaphone.ui1.Node("div", null, null, "list-box scrolltable").setAttribute("id", room.id))
        listbox.add(new innovaphone.ui1.Div(null, null, "closewindow").setAttribute("id", "closewindow"))
        listbox.add(new innovaphone.ui1.Node("h1", "position:absolute;width:100%;top:5%; text-align:center", room.name))

        var divDates = listbox.add(new innovaphone.ui1.Div("display:flex ; align-items:center ; width: 100%;position: absolute; top: 2%; justify-content: space-evenly;", null, null))

        schedules.forEach(function (schedule) {    // revisar isso na segunda 30/10
            if(schedule.schedule_module == "periodModule"){
                divDates.add(new innovaphone.ui1.Div("font-weight:bold;", texts.text("labelScheduleModule") + ":" + " " + texts.text("periodModule"), null))
            }else if(schedule.schedule_module == "dayModule"){
                divDates.add(new innovaphone.ui1.Div("font-weight:bold;", texts.text("labelScheduleModule") + ":" + " " + texts.text("dayModule"), null))
            }else{
                divDates.add(new innovaphone.ui1.Div("font-weight:bold;", texts.text("labelScheduleModule") + ":" + " " + texts.text("hourModule"), null))
            }
            if(schedule.type == "periodType"){
                divDates.add(new innovaphone.ui1.Div("font-weight:bold;", texts.text("labelType") + ":" + " " + texts.text("periodType"), null))
                divDates.add(new innovaphone.ui1.Div("font-weight:bold;", texts.text("labelDateStart") + formatDate(schedule.data_start), null))
                divDates.add(new innovaphone.ui1.Div("font-weight:bold;", texts.text("labelDateEnd") + formatDate(schedule.data_end), null))
            }else{
                divDates.add(new innovaphone.ui1.Div("font-weight:bold;", texts.text("labelType") + ":" + " " + texts.text("recurrentType"), null))
            }
        })

        var proprietiesDiv = listbox.add(new innovaphone.ui1.Div("position: absolute;width: 40%; height:75%;left: 2%; justify-content: center;top: 16%;", null, null).setAttribute("id", "proprietiesDiv"))
        var imgRoom = listbox.add(new innovaphone.ui1.Node("div", "position: absolute;width: 60%; left:45%; height:65%; display: flex;align-items: center; justify-content: center;top: 20%;", null, null).setAttribute("id", "imgBD"))
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
            app.send({ api: "user", mt: "SelectMyRooms" })

        })

        // Obtém todos os elementos com a classe "phoneButtons"
        var phoneButtons = document.getElementsByClassName("phoneButtons");

        // Adiciona um evento de clique a cada elemento
        for (var i = 0; i < phoneButtons.length; i++) {
            phoneButtons[i].addEventListener("click", function (event) {
                //var elementoClicado = event.target;
                var elementoClicado = event.target;
                var id = event.currentTarget.id
                //var ip = elementoClicado.getAttribute("data-ip"); // Suponha que o IP seja armazenado no atributo "data-ip"
                console.log("ID do elemento clicado: " + id);
                var d = devices.filter(function (dev) { return dev.hwid == id })[0]

                app.sendSrc({ api: "user", mt: "GetDeviceSchedules", room: room.id, dev: id, src: id},
                    function (resultMsg) { // this function is called when response to sendSrc arrives 

                        console.log(JSON.stringify("ResultMsgSchedules" + resultMsg.schedules))
                        makeDivPhoneProprieties(proprietiesDiv, room, schedules, d, resultMsg.schedules)
                    }
                );

                
            });
        }

    }
    function makeDivPhoneProprieties(t, room, schedules, device, dev_schedules) {
       
        // var insideDiv = t.add(new innovaphone.ui1.Div(null, null, "insideDiv"))
        // var listbox = insideDiv.add(new innovaphone.ui1.Node("div", null, null, "list-box scrolltable").setAttribute("id", device.id))
        // listbox.add(new innovaphone.ui1.Div(null, null, "closewindow").setAttribute("id", "closeDevWindow"))
        // listbox.add(new innovaphone.ui1.Node("h1", "position:absolute;width:100%;top:0%; text-align:center", device.product))

        // var divDates = listbox.add(new innovaphone.ui1.Div("display:flex ; align-items:center ; width: 100%;position: absolute; justify-content: space-evenly;", null, null))
        // document.getElementById("closeDevWindow").addEventListener("click", function () {  // close 
        //     t.rem(insideDiv);

        // })
        //var divSchedule = listbox.add(new innovaphone.ui1.Div("position:absolute;width:100%;height:100%;display:block").setAttribute("id", "div-schedule"))
        //var btnSave = divSchedule.add(new innovaphone.ui1.Node("button", "width:90px;height:35px;display:flex;justify-content:center;align-items:center;top:1%;left:75%;position:absolute;", texts.text("labelCreateRoom"), null).setAttribute("id", "btnSaveRoom"))
        // listbox.add(new innovaphone.ui1.Div("position:absolute;top:10%", null, null).setAttribute("id", "calendar"))
        var dev_schedulesList = JSON.parse(dev_schedules)

            $(document).ready(function () {
                $.fullCalendar.locale('pt-br');
                // var id = $.urlParam('id');
                $('#proprietiesDiv').fullCalendar('destroy'); // recriar o calendario quando clicar em outro fone 
                $('#proprietiesDiv').fullCalendar({
    
                    header: {
                        left: 'today',
                        center: 'title , month,agendaDay', //agendaWeek,
                        right: 'prev,next'
                    },
                    buttonText: {
                        today: 'Hoje',
                        month: 'Mês',
                        week: 'Semana',
                        day: 'Dia'
                    },
                    monthNames: [
                        'Janeiro',
                        'Fevereiro',
                        'Março',
                        'Abril',
                        'Maio',
                        'Junho',
                        'Julho',
                        'Agosto',
                        'Setembro',
                        'Outubro',
                        'Novembro',
                        'Dezembro'
                    ],
                    defaultView: 'month',
                    slotDuration: '01:00:00',
                    minTime: '00:00:00',
                    maxTime: '24:00:00',
                    selectable: true,
                    selectLongPressDelay: 0,
    
                    selectHelper: true,
                    select: function (start, end, jsEvent, view) {
                        var selectstart = start.format('YYYY-MM-DD[ ]HH:mm:ss');
                        var selectend = end.format('YYYY-MM-DD[ ]HH:mm:ss');
                        var dayOfWeek = start.format('dddd');
    
                        if (view.name === 'month') {
                            console.log("View: Month");
                            var clickedElement = jsEvent.target
    
                            console.log(" Elemento clicado " + clickedElement);
                            // var clickedDate = start.format('YYYY-MM-DD');
                            // console.log("Data do elemento clicado:", clickedDate);
    
                            var clickedDateStart = start.format('YYYY-MM-DD');
                            console.log("Data do elemento clicado Inicio:", clickedDateStart);
    
                            var clickedDateEnd = end.format('YYYY-MM-DD');
                            console.log("Data do elemento clicado Inicio:", clickedDateEnd);
    
                            schedules.forEach(function (s) {
                                if (s.type == "recurrentType") {
                                    //var dayOfWeek = findDayOfWeek(clickedElement.classList)
                                    switch (dayOfWeek) {
                                        case "segunda-feira":
                                            var dateOccupied = dev_schedulesList.some(function(dateS) {
                                                return dateS.data_start === clickedDateStart;
                                            });
        
                                            if (dateOccupied) {
                                                // se tiver ocupado acaba aqui - Pietro
                                                console.log("WECOM LOG: Telefone ocupado nesta data!!!");
                                                return;
                                            }else{
                                            if (s.timestart_monday < s.timeend_monday && s.timestart_monday != "" && s.timeend_monday != "") {
                                                var start = moment(s.timestart_monday, 'HH:mm');
                                                var end = moment(s.timeend_monday, 'HH:mm');
                                                var clickedDateStartMoment = moment(clickedDateStart);
                                                var combinedDateTimeStart = clickedDateStartMoment.format('YYYY-MM-DD') + 'T' + start.format('HH:mm');

                                                var clickedDateEndMoment = moment(clickedDateEnd);
                                                var combinedDateTimeEnd = clickedDateEndMoment.format('YYYY-MM-DD') + 'T' + end.format('HH:mm');

                                                if (s.schedule_module == "hourModule") {
                                                    $('#calendar').fullCalendar('changeView', 'agendaDay');
                                                    $('#calendar').fullCalendar('gotoDate', start);
                                                } else if (s.schedule_module == "dayModule") {
                                                    console.log("Abrir modal para confirmar o dia inteiro.")
                                                    makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, combinedDateTimeStart, combinedDateTimeEnd);
    
                                                } else if (s.schedule_module == "periodoModule") {
    
                                                    console.log("Abrir modal para perguntar se será manhã ou tarde.")
                                                    makeDivConfirmPhoneRecurrentSchedule(t, room);
    
                                                }
                                                return
                                            } else {
                                                //Implementar mensagem de Data indisponível aqui. Toast
                                                console.log("WECOM LOG: Data indisponível!!!")
                                            }
                                        }
                                            return
                                        case "terça-feira":
                                        
                                        var dateOccupied = dev_schedulesList.some(function(dateS) {
                                            return dateS.data_start === clickedDateStart;
                                        });
    
                                        if (dateOccupied) {
                                            // se tiver ocupado acaba aqui - Pietro
                                            console.log("WECOM LOG: Telefone ocupado nesta data!!!");
                                            return;
                                        }else{
                                            // se nao , continua a função aqui - Pietro
                                            if (s.timestart_tuesday < s.timeend_tuesday && s.timestart_tuesday != "" && s.timeend_tuesday != "") {
                                                var start = moment(s.timestart_tuesday);
                                                var end = moment(s.timeend_tuesday);
                                                if (s.schedule_module == "hourModule") {
                                                    $('#calendar').fullCalendar('changeView', 'agendaDay');
                                                    $('#calendar').fullCalendar('gotoDate', start);
                                                } else if (s.schedule_module == "dayModule") {
                                                    
                                                    console.log("Abrir modal para confirmar o dia inteiro.")
        
                                                    makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, clickedDateStart, clickedDateEnd);
        
                                                } else if (s.schedule_module == "periodoModule") {
        
                                                    console.log("Abrir modal para perguntar se será manhã ou tarde.")
                                                    makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, start);
        
                                                }
                                                return
                                            }
                                            else {
                                                //Implementar mensagem de Data indisponível aqui. Toast
                                                console.log("WECOM LOG: Data indisponível!!!")
                                            }
                                        }
                                            return
                                        case "quarta-feira":
                                            var dateOccupied = dev_schedulesList.some(function(dateS) {
                                                return dateS.data_start === clickedDateStart;
                                            });
        
                                            if (dateOccupied) {
                                                // se tiver ocupado acaba aqui - Pietro
                                                console.log("WECOM LOG: Telefone ocupado nesta data!!!");
                                                return;
                                            }else{
    
                                            if (s.timestart_wednesday < s.timeend_wednesday && s.timestart_wednesday != "" && s.timeend_wednesday != "") {
                                                var start = moment(s.timestart_wednesday);
                                                var end = moment(s.timeend_wednesday);
                                                if (s.schedule_module == "hourModule") {
                                                    $('#calendar').fullCalendar('changeView', 'agendaDay');
                                                    $('#calendar').fullCalendar('gotoDate', start);
                                                } else if (s.schedule_module == "dayModule") {
                                                    console.log("Abrir modal para confirmar o dia inteiro.")
        
                                                    makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, clickedDateStart, clickedDateEnd);
    
                                                } else if (s.schedule_module == "periodoModule") {
    
                                                    console.log("Abrir modal para perguntar se será manhã ou tarde.")
    
                                                }
                                                return
                                            } else {
                                                //Implementar mensagem de Data indisponível aqui. Toast
                                                console.log("WECOM LOG: Data indisponível!!!")
                                            }
                                        }
                                            return
                                        case "quinta-feira":
                                            var dateOccupied = dev_schedulesList.some(function(dateS) {
                                                return dateS.data_start === clickedDateStart;
                                            });
        
                                            if (dateOccupied) {
                                                // se tiver ocupado acaba aqui - Pietro
                                                console.log("WECOM LOG: Telefone ocupado nesta data!!!");
                                                return;
                                            }else{
    
                                            if (s.timestart_thursday < s.timeend_thursday && s.timestart_thursday != "" && s.timeend_thursday != "") {
                                                var start = moment(s.timestart_thursday);
                                                var end = moment(s.timeend_thursday);
                                                if (s.schedule_module == "hourModule") {
                                                    $('#calendar').fullCalendar('changeView', 'agendaDay');
                                                    $('#calendar').fullCalendar('gotoDate', start);
                                                } else if (s.schedule_module == "dayModule") {
                                                    console.log("Abrir modal para confirmar o dia inteiro.")
        
                                                    makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, clickedDateStart, clickedDateEnd);
    
                                                } else if (s.schedule_module == "periodoModule") {
    
                                                    console.log("Abrir modal para perguntar se será manhã ou tarde.")
                                                    makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, start);
    
                                                }
                                                return
                                            } else {
                                                //Implementar mensagem de Data indisponível aqui. Toast
                                                console.log("WECOM LOG: Data indisponível!!!")
                                            }
                                        }
                                            return
                                        case "sexta-feira":
    
                                            var dateOccupied = dev_schedulesList.some(function(dateS) {
                                                return dateS.data_start === clickedDateStart;
                                            });
        
                                            if (dateOccupied) {
                                                // se tiver ocupado acaba aqui - Pietro
                                                console.log("WECOM LOG: Telefone ocupado nesta data!!!");
                                                return;
                                            }else{
    
                                            if (s.timestart_friday < s.timeend_friday && s.timestart_friday != "" && s.timeend_friday != "") {
                                                var start = moment(s.timestart_friday);
                                                var end = moment(s.timeend_friday);
                                                if (s.schedule_module == "hourModule") {
                                                    $('#calendar').fullCalendar('changeView', 'agendaDay');
                                                    $('#calendar').fullCalendar('gotoDate', start);
                                                } else if (s.schedule_module == "dayModule") {
                                                    console.log("Abrir modal para confirmar o dia inteiro.")
        
                                                    makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, clickedDateStart, clickedDateEnd);
    
                                                } else if (s.schedule_module == "periodoModule") {
    
                                                    console.log("Abrir modal para perguntar se será manhã ou tarde.")
                                                    makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, start);
    
                                                }
                                                return
                                            } else {
                                                //Implementar mensagem de Data indisponível aqui. Toast
                                                console.log("WECOM LOG: Data indisponível!!!")
                                            }
                                        }
                                            return
                                        case "sábado":
                                            var dateOccupied = dev_schedulesList.some(function(dateS) {
                                                return dateS.data_start === clickedDateStart;
                                            });
        
                                            if (dateOccupied) {
                                                // se tiver ocupado acaba aqui - Pietro
                                                console.log("WECOM LOG: Telefone ocupado nesta data!!!");
                                                return;
                                            }else{
                                            if (s.timestart_saturday < s.timeend_saturday && s.timestart_saturday != "" && s.timeend_saturday != "") {
                                                var start = moment(s.timestart_saturday);
                                                var end = moment(s.timeend_saturday);
                                                if (s.schedule_module == "hourModule") {
                                                    $('#calendar').fullCalendar('changeView', 'agendaDay');
                                                    $('#calendar').fullCalendar('gotoDate', start);
                                                } else if (s.schedule_module == "dayModule") {
                                                    console.log("Abrir modal para confirmar o dia inteiro.")
        
                                                    makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, clickedDateStart, clickedDateEnd);
    
                                                } else if (s.schedule_module == "periodoModule") {
    
                                                    console.log("Abrir modal para perguntar se será manhã ou tarde.")
                                                    makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, selectstart);
    
                                                }
                                                return
                                            } else {
                                                //Implementar mensagem de Data indisponível aqui. Toast
                                                console.log("WECOM LOG: Data indisponível!!!")
                                            }
                                        }
                                            return
                                        case "domingo":
                                            var dateOccupied = dev_schedulesList.some(function(dateS) {
                                                return dateS.data_start === clickedDateStart;
                                            });
        
                                            if (dateOccupied) {
                                                // se tiver ocupado acaba aqui - Pietro
                                                console.log("WECOM LOG: Telefone ocupado nesta data!!!");
                                                return;
                                            }else{
                                            if (s.timestart_sunday < s.timeend_sunday && s.timestart_sunday != "" && s.timeend_sunday != "") {
                                                var start = moment(s.timestart_sunday);
                                                var end = moment(s.timeend_sunday);
                                                if (s.schedule_module == "hourModule") {
                                                    $('#calendar').fullCalendar('changeView', 'agendaDay');
                                                    $('#calendar').fullCalendar('gotoDate', start);
                                                } else if (s.schedule_module == "dayModule") {
                                                    console.log("Abrir modal para confirmar o dia inteiro.")
        
                                                    makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, clickedDateStart, clickedDateEnd);
    
                                                } else if (s.schedule_module == "periodoModule") {
    
                                                    console.log("Abrir modal para perguntar se será manhã ou tarde.")
                                                    makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, selectstart);
    
                                                }
                                                return
                                                
                                            } else {
                                                //Implementar mensagem de Data indisponível aqui. Toast
                                                console.log("WECOM LOG: Data indisponível!!!")
                                            }
                                        }
                                            return
    
                                        default:
                                            //Implementar mensagem de Data indisponível aqui. Toast
                                            console.log("WECOM LOG: Data indisponível!!!")
                                            return
    
                                    } 
                                }
                                if (s.type == "periodType") {
                                    if (clickedDate >= s.data_start.split(" ")[0] && clickedDate <= s.data_end.split(" ")[0]) {
                                        if (s.schedule_module == "hourModule") {
                                            $('#proprietiesDiv').fullCalendar('changeView', 'agendaDay');
                                            $('#proprietiesDiv').fullCalendar('gotoDate', start);
                                        } else if (s.schedule_module == "dayModule") {
                                            console.log("Abrir modal para confirmar o dia inteiro.")
                                            makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, start);
    
                                        } else if (s.schedule_module == "periodoModule") {
    
                                            console.log("Abrir modal para perguntar se será manhã ou tarde.")
                                            makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, start);
    
                                        }
                                        return
                                    } else {
                                        //Implementar mensagem de Data indisponível aqui. Toast
                                        console.log("WECOM LOG: Data indisponível!!!")
                                    }
                                }
                            })
                            $('#proprietiesDiv').fullCalendar('unselect');
                        }
                        else if (view.name === 'agendaWeek') {
                            console.log("View: " + "Week");
    
                            var clickedElement = jsEvent.target
                            console.log(" Elemento clicado " + clickedElement);
                            var clickedDate = start.format('YYYY-MM-DD');
                            console.log("Data do elemento clicado:", clickedDate);
                            var teste = false;
    
                        }
                        else {
                            console.log("View: " + "day");
                            // data inicio em iso string 
                            dateStart = "";
                            dateStart = new Date(start);
                            console.log("data de início " + formatDate(dateStart.toISOString()))
                            // data fim
                            dateEnd = "";
                            dateEnd = new Date(end);
                            console.log("data de término " + formatDate(dateEnd.toISOString()))
                            makeDivConfirmPhoneRecurrentSchedule(listbox, room, device, schedules, start);
    
    
                        }
                    },
                    editable: false,
                    eventLimit: true,
                    events: [],
                    eventRender: function (event, element) { },
    
                    viewRender: function (view, element) {
    
                        if (view.name === 'month') {
                            console.log('View: Modo mês');
                            console.log("DEV SCHEDULES" + dev_schedules)
                            // var dev_schedulesList = JSON.parse(dev_schedules)
                            UpdateAvailability(schedules, dev_schedulesList);
                            
                            // os agendamentos só vao aparecer se forem maior do que
                            // a data de hoje 
                        }
                        else if (view.name === 'agendaWeek') {
                            console.log("View Modo Semana")
                        }
                        else {
                            console.log('View: Modo dias');
                            UpdateDayAvailability(schedules, dev_schedules);
    
                            dayName = view.title
                            console.log("View title result = " + dayName)
                            var dateParts = dayName.split(" de "); // Divide a string em partes separadas por " de "
                            // Obtém os valores do dia, mês e ano
                            var day = String(dateParts[0]).padStart(2, '0');
                            var month = getMonthIndex(dateParts[1]);
                            var year = dateParts[2];
    
                            // Função auxiliar para obter o índice do mês com base no nome do mês
                            function getMonthIndex(monthName) {
                                var months = [
                                    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                                ];
                                var index = months.indexOf(monthName) + 1;
    
                                return String(index).padStart(2, '0');
                            }
                        }
                    },
                });
    
            });
    }

    function makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, start, end) {
        // var start;
        // var end;
        console.log("Start para Envio:" + start )
        console.log("End para Envio:" + end )
        // schedules.forEach(function(s){
        //     switch (s.schedule_module) {
        //         case "dayModule":
        //             start = start + "" + s.time_start // ajustar
        //             end = start +" "+ s.
        //             return
        //         case "hourModule":
        //             return
        //     }
        // })
        var today = new Date();
        var dataHoje = today.toISOString().split('T')[0];

        if(start < dataHoje){
            console.log("Escolha uma data maior superior a data de hoje!!!")
        }else{
            var insideDiv = t.add(new innovaphone.ui1.Div(null, null, "insideDivConfirm"))
            var listbox = insideDiv.add(new innovaphone.ui1.Node("div", null, null, "list-box scrolltable confirmDiv").setAttribute("id", device.id))
            listbox.add(new innovaphone.ui1.Div(null, null, "closewindow").addEvent("click", function () { // close
                t.rem(insideDiv);
    
            }))
            listbox.add(new innovaphone.ui1.Node("h1", null, room.name))
            listbox.add(new innovaphone.ui1.Node("h1", null, texts.text(s.schedule_module)))
            listbox.add(new innovaphone.ui1.Node("h1", null, device.product + " " + device.hwid))
            listbox.add(new innovaphone.ui1.Node("h1", null, texts.text("whenLabel") + " " + start))
    
            listbox.add(new innovaphone.ui1.Div("width:80px; height: 50px; color: white; border-radius: 40px; font-weight:bold;", texts.text("makePhoneSceduleButton"), "button").addEvent("click", function () {
                app.sendSrc({ api: "user", mt: "makePhoneSchedule", device: device.hwid, type: s.schedule_module, room: room.id, data_start: start, data_end: end }, function (obj) {
    
                });
            }))
        }

    }
    //Função para alterar o estado da váriavel de controle, utilizada para forçar o timer a tentar nova conexão.
    function changeState(newState) {
        if (newState == currentState) return;
        if (newState == "Connected") {
            currentState = newState;
            console.info("WECOM-LOG: Appwebsocket.Connection Connected: ");
        }
        if (newState == "Disconnected") {
            waitConnection(that);
            console.error("WECOM-LOG: Appwebsocket.Connection Disconnected: ");
            currentState = "Disconnected";
        }
    }
    function formatDate(inputDate) {
        const date = new Date(inputDate);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

        return formattedDate;
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

    function UpdateAvailability(availability, schedules) {
        var tds = document.querySelectorAll('.fc-day', '.fc-highlight');
        if (availability.length === 0) {
            tds.forEach(function (td) {
                td.classList.add('unavailable');
            });
        }
        else {

            availability.forEach(function (dates) {
                if (dates.type == "recurrentType") {
                    tds.forEach(function (td) {
                        var dayOfWeek = findDayOfWeek(td.classList);
                        var dataDate = moment(td.getAttribute('data-date')).format('YYYY-MM-DD');
                        //var hourAvail = countTotalHoursAvailability(String(dataDate), availability);
                        //var hourBusy = countTotalHoursBusy(String(dataDate), schedules);
                        var defaultDate = "2000-01-01";
                        switch (dayOfWeek) {
                            case "monday":
                                if (dates.timestart_monday < dates.timeend_monday && dates.timestart_monday != "" && dates.timeend_monday != "") {
                                    var start = moment(defaultDate + " " + dates.timestart_monday, "YYYY-MM-DD HH:mm");
                                    var end = moment(defaultDate + " " + dates.timeend_monday, "YYYY-MM-DD HH:mm");
                                    var totalHours = 0;
                                    totalHours += end.diff(start, 'hours');
                                    console.log("Horas disponivies " + totalHours + " em " + String(dataDate))

                                    if (totalHours <= 6) {
                                        td.classList.remove('unavailable');
                                        td.classList.add('parcialavailable');
                                    } else {
                                        td.classList.remove('unavailable');
                                        td.classList.add('available');
                                    }
                                } else {
                                    td.classList.add('unavailable');
                                }
                                console.log("Schedules:" +  schedules)
                                schedules.forEach(function(dateS){
                                    var dataSplit = dateS.data_start
                                    var dataS = dataSplit.split("T")[0]  // ajuste para comparar as datas 
                                    console.log("Data Split" + dataSplit)
                                    console.log("Data S" + dataS)

                                    if(dataDate == dataS ){
                                        td.classList.remove('parcialavailable');
                                        td.classList.add('unavailable')
                                    }
                                })
                                return
                            case "tuesday":
                                if (dates.timestart_tuesday < dates.timeend_tuesday && dates.timestart_tuesday != "" && dates.timeend_tuesday != "") {
                                    var start = moment(defaultDate + " " + dates.timestart_tuesday, "YYYY-MM-DD HH:mm");
                                    var end = moment(defaultDate + " " + dates.timeend_tuesday, "YYYY-MM-DD HH:mm");
                                    var totalHours = 0;
                                    totalHours += end.diff(start, 'hours');
                                    console.log("Horas disponivies " + totalHours + " em " + String(dataDate))

                                    if (totalHours <= 6) {
                                        td.classList.remove('unavailable');
                                        td.classList.add('parcialavailable');
                                    } else {
                                        td.classList.remove('unavailable');
                                        td.classList.add('available');
                                    }
                                } else {
                                    td.classList.add('unavailable');
                                }
                                console.log("Schedules:" +  schedules)
                                schedules.forEach(function(dateS){
                                    if(dataDate == dateS.data_start ){
                                        td.classList.remove('parcialavailable');
                                        td.classList.add('unavailable')
                                    }
                                })
                                
                                return
                            case "wednesday":
                                if (dates.timestart_wednesday < dates.timeend_wednesday && dates.timestart_wednesday != "" && dates.timeend_wednesday != "") {
                                    var start = moment(defaultDate + " " + dates.timestart_wednesday, "YYYY-MM-DD HH:mm");
                                    var end = moment(defaultDate + " " + dates.timeend_wednesday, "YYYY-MM-DD HH:mm");
                                    var totalHours = 0;
                                    totalHours += end.diff(start, 'hours');
                                    console.log("Horas disponivies " + totalHours + " em " + String(dataDate))

                                    if (totalHours <= 6) {
                                        td.classList.remove('unavailable');
                                        td.classList.add('parcialavailable');
                                    } else {
                                        td.classList.remove('unavailable');
                                        td.classList.add('available');
                                    }
                                } else {
                                    td.classList.add('unavailable');
                                }
                                console.log("Schedules:" +  schedules)
                                schedules.forEach(function(dateS){
                                    if(dataDate == dateS.data_start ){
                                        td.classList.remove('parcialavailable');
                                        td.classList.add('unavailable')
                                    }
                                })
                                return
                            case "thursday":
                                if (dates.timestart_thursday < dates.timeend_thursday && dates.timestart_thursday != "" && dates.timeend_thursday != "") {
                                    var start = moment(defaultDate + " " + dates.timestart_thursday, "YYYY-MM-DD HH:mm");
                                    var end = moment(defaultDate + " " + dates.timeend_thursday, "YYYY-MM-DD HH:mm");
                                    var totalHours = 0;
                                    totalHours += end.diff(start, 'hours');
                                    console.log("Horas disponivies " + totalHours + " em " + String(dataDate))

                                    if (totalHours <= 6) {
                                        td.classList.remove('unavailable');
                                        td.classList.add('parcialavailable');
                                    } else {
                                        td.classList.remove('unavailable');
                                        td.classList.add('available');
                                    }
                                } else {
                                    td.classList.add('unavailable');
                                }
                                console.log("Schedules:" +  schedules)
                                schedules.forEach(function(dateS){
                                    if(dataDate == dateS.data_start ){
                                        td.classList.remove('parcialavailable');
                                        td.classList.add('unavailable')
                                    }
                                })
                                return
                            case "friday":
                                if (dates.timestart_friday < dates.timeend_friday && dates.timestart_friday != "" && dates.timeend_friday != "") {
                                    var start = moment(defaultDate + " " + dates.timestart_friday, "YYYY-MM-DD HH:mm");
                                    var end = moment(defaultDate + " " + dates.timeend_friday, "YYYY-MM-DD HH:mm");
                                    var totalHours = 0;
                                    totalHours += end.diff(start, 'hours');
                                    console.log("Horas disponivies " + totalHours + " em " + String(dataDate))

                                    if (totalHours <= 6) {
                                        td.classList.remove('unavailable');
                                        td.classList.add('parcialavailable');
                                    } else {
                                        td.classList.remove('unavailable');
                                        td.classList.add('available');
                                    }
                                } else {
                                    td.classList.add('unavailable');
                                }
                                console.log("Schedules:" +  schedules)
                                schedules.forEach(function(dateS){
                                    if(dataDate == dateS.data_start ){
                                        td.classList.remove('parcialavailable');
                                        td.classList.add('unavailable')
                                    }
                                })
                                return
                            case "saturday":
                                if (dates.timestart_saturday < dates.timeend_saturday && dates.timestart_saturday != "" && dates.timeend_saturday != "") {
                                    var start = moment(defaultDate + " " + dates.timestart_saturday, "YYYY-MM-DD HH:mm");
                                    var end = moment(defaultDate + " " + dates.timeend_saturday, "YYYY-MM-DD HH:mm");
                                    var totalHours = 0;
                                    totalHours += end.diff(start, 'hours');
                                    console.log("Horas disponivies " + totalHours + " em " + String(dataDate))

                                    if (totalHours <= 6) {
                                        td.classList.remove('unavailable');
                                        td.classList.add('parcialavailable');
                                    } else {
                                        td.classList.remove('unavailable');
                                        td.classList.add('available');
                                    }
                                } else {
                                    td.classList.add('unavailable');
                                }
                                console.log("Schedules:" +  schedules)
                                schedules.forEach(function(dateS){
                                    if(dataDate == dateS.data_start ){
                                        td.classList.remove('parcialavailable');
                                        td.classList.add('unavailable')
                                    }
                                })
                                return
                            case "sunday":
                                if (dates.timestart_sunday < dates.timeend_sunday && dates.timestart_sunday != "" && dates.timeend_sunday != "") {
                                    var start = moment(defaultDate + " " + dates.timestart_sunday, "YYYY-MM-DD HH:mm");
                                    var end = moment(defaultDate + " " + dates.timeend_sunday, "YYYY-MM-DD HH:mm");
                                    var totalHours = 0;
                                    totalHours += end.diff(start, 'hours');
                                    console.log("Horas disponivies " + totalHours + " em " + String(dataDate))

                                    if (totalHours <= 6) {
                                        td.classList.remove('unavailable');
                                        td.classList.add('parcialavailable');
                                    } else {
                                        td.classList.remove('unavailable');
                                        td.classList.add('available');
                                    }
                                } else {
                                    td.classList.add('unavailable');
                                }
                                console.log("Schedules:" +  schedules)
                                schedules.forEach(function(dateS){
                                    if(dataDate == dateS.data_start ){
                                        td.classList.remove('parcialavailable');
                                        td.classList.add('unavailable')
                                    }
                                })
                                return

                            default:
                                td.classList.add('unavailable');
                                
                        }
                    });

                } else if (dates.type == "periodType"){
                    var datastart = moment(dates.data_start).format('YYYY-MM-DD');
                    var dataend = moment(dates.data_end).format('YYYY-MM-DD');
                    tds.forEach(function (td) {
                        var dataDate = moment(td.getAttribute('data-date')).format('YYYY-MM-DD');
                        var hourAvail = 24 //countTotalHoursAvailability(String(dataDate), availability);
                        var hourBusy = 0 //countTotalHoursBusy(String(dataDate), schedules);
                        hourAvail -= hourBusy;
                        console.log("Horas disponivies " + hourAvail + " em " + String(dataDate))
                        if (dataDate >= datastart && dataDate <= dataend) {
                            if (hourAvail <= 6) {
                                td.classList.remove('unavailable');
                                td.classList.add('parcialavailable');
                            } else {
                                td.classList.remove('unavailable');
                                td.classList.add('available');
                            }

                        } else {
                            td.classList.add('unavailable');
                        }
                    });
                }


                
            })
        }
        console.log("UpdateAvailability Result Success");
    }
    function countTotalHoursAvailability(dataString, array) {
        var targetDate = moment(dataString);
        var totalHours = 0;

        array.forEach(function (obj) {
            var start = moment(obj.time_start);
            var end = moment(obj.time_end);

            if (targetDate.isSame(start, 'day')) {
                if (targetDate.isSame(end, 'day')) {
                    totalHours += end.diff(start, 'hours');
                } else {
                    var endOfDay = moment(targetDate).endOf('day');
                    totalHours += endOfDay.diff(start, 'hours');
                }
            } else if (targetDate.isAfter(start, 'day') && targetDate.isBefore(end, 'day')) {
                //var startOfDay = moment(targetDate).startOf('day');
                //totalHours += end.diff(startOfDay, 'hours');
                totalHours = 24;
            } else if (targetDate.isSame(end, 'day')) {
                var startOfDay = moment(targetDate).startOf('day');
                totalHours += end.diff(startOfDay, 'hours');
            }
        });

        return totalHours;
    }

    function countTotalHoursBusy(dataString, array) {
        var targetDate = moment(dataString);
        var count = 0;

        array.forEach(function (obj) {
            var start = moment(obj.time_start);

            if (targetDate.isSame(start, 'day')) {
                count++;
            }
        });

        return count;
    }

    function UpdateDayAvailability(datastart, dataend, availability, schedules, day, month, year) {
        // var tds = document.querySelectorAll('.fc-widget-content');
        var trs = document.querySelectorAll('.fc-slats tr');
        if (availability.length === 0) {
            trs.forEach(function (tr) {
                console.log("Availability: 0");
                tr.classList.remove('available');
                tr.classList.add('unavailable');
            });
        }
        else {


            //Deixa tudo indisponível
            trs.forEach(function (tr) {
                tr.classList.remove('available');
                tr.classList.add('unavailable');
            });
            console.log("UpdateDayAvailability");

            availability.forEach(function (dates) {
                var datastart = moment(dates.time_start, moment.ISO_8601).format('YYYY-MM-DDTHH:mm:ss');
                var dataend = moment(dates.time_end, moment.ISO_8601).format('YYYY-MM-DDTHH:mm:ss');
                trs.forEach(function (tr) {

                    var dataTime = moment(tr.getAttribute('data-time'), 'HH:mm:ss');
                    // Obtém os valores do dia, mês e ano
                    var hour = moment(dataTime).format('HH');
                    var minute = moment(dataTime).format('mm');
                    var second = moment(dataTime).format('ss');
                    var date = year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":" + second;
                    // Cria o objeto de data
                    var dateView = moment(date, moment.ISO_8601).format('YYYY-MM-DDTHH:mm:ss');

                    //console.log(dateView);

                    if (dateView >= datastart && dateView <= dataend) {
                        tr.classList.remove('unavailable');
                        tr.classList.add('available');
                    }
                });
            });
            console.log("UpdateDayAvailabilitySuccess");
            if (schedules.length > 0) {
                schedules.forEach(function (dates) {
                    var datastart = moment(dates.time_start, moment.ISO_8601).format('YYYY-MM-DDTHH:mm:ss');

                    trs.forEach(function (tr) {
                        var dataTime = moment(tr.getAttribute('data-time'), 'HH:mm:ss');
                        var hour = moment(dataTime).format('HH');
                        var minute = moment(dataTime).format('mm');
                        var second = moment(dataTime).format('ss');
                        var date = year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":" + second;
                        // Cria o objeto de data
                        var dateView = moment(date, moment.ISO_8601).format('YYYY-MM-DDTHH:mm:ss');

                        if (dateView == datastart) {
                            tr.classList.remove('available');
                            tr.classList.add('unavailable');
                        }
                    });
                });
            }
            console.log("UpdateDaySchedulesSuccess");
        }
    }

    // Função para encontrar o nome do dia da semana a partir das classes
    function findDayOfWeek(classes) {
        for (var j = 0; j < classes.length; j++) {
            switch (classes[j]) {
                case "fc-mon":
                    return "monday";
                case "fc-tue":
                    return "tuesday";
                case "fc-wed":
                    return "wednesday";
                case "fc-thu":
                    return "thursday";
                case "fc-fri":
                    return "friday";
                case "fc-sat":
                    return "saturday";
                case "fc-sun":
                    return "sunday";
            }
                
            
        }
        return null; // Retorna null se não encontrar o nome do dia
    }
}

Wecom.coolwork.prototype = innovaphone.ui1.nodePrototype;
