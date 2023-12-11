
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
        var colEsquerda = t.add(new innovaphone.ui1.Div(null, null, "colunaesquerda bg-clifford"));
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

        var pcButton = divAppointment.add(new innovaphone.ui1.Node("button",null, null, "bg-primary-900 border-2 border-primary-400")
            .addText("Set Presence")
            .addEvent("click", function () { app.send({ api: "admin", mt: "InsertAppointment", type: "hour", dateStart: dateStartInput.value, dateEnd: dateEndInput.value, device: phoneInput.value, deviceRoom: roomInput.value }) }, pcButton));

        _colDireita = colDireita;
    }
    //Função para criar div de visualização da sala
    function makeDivRoom(t, room, schedules, devices) {
        t.clear();
        var listbox = t.add(new innovaphone.ui1.Node("div", null, null, "list-box scrolltable").setAttribute("id", room.id))
        listbox.add(new innovaphone.ui1.Div(null, null, "closewindow").setAttribute("id", "closewindow"))
        listbox.add(new innovaphone.ui1.Node("h1", "position:absolute;width:50%;top:5%; text-align:center", room.name))

        var divDates = listbox.add(new innovaphone.ui1.Div("display:flex ; align-items:center ; width: 100%;position: absolute; top: 2%; justify-content: space-evenly;", null, null))

        schedules.forEach(function (schedule) {    
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
       
        var proprietiesDiv = listbox.add(new innovaphone.ui1.Div("position: absolute;width: 40%; height:75%;left: 1%; justify-content: center;top: 20;", null, null).setAttribute("id", "proprietiesDiv"))
        var imgRoom = listbox.add(new innovaphone.ui1.Node("div", "position: absolute;width: 50%; left:45%; height:65%; display: flex;align-items: center; justify-content: center;top: 20%;", null, null).setAttribute("id", "imgBD"))
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
                        makeDivPhoneProprieties(proprietiesDiv, room, "proprietiesDiv", "month",  schedules, d, resultMsg.schedules)
                    }
                );

                
            });
        }

    }
    function makeDivPhoneProprieties(t, room, divCalendar, defaultView, room_availability, device, dev_schedules) {
            var dev_schedulesList = JSON.parse(dev_schedules)

            
                            room_availability.forEach(function (s) {
                                // if (s.type == "recurrentType") {
                                //     makeRecurrentSchedule(t, room, divCalendar, device, s, dayOfWeek, clickedDateStart, clickedDateEnd, dev_schedulesList)
                                // }
                                if (s.type == "periodType") {

                                             if (s.schedule_module == "hourModule") {
                                                // $(`#${divCalendar}`).fullCalendar('changeView', 'agendaDay');
                                                // $(`#${divCalendar}`).fullCalendar('gotoDate', start);
                                            } else if (s.schedule_module == "dayModule") {
                                                  
                                                buildCalendar(room_availability,dev_schedulesList,divCalendar,device,room)
    
                                                // var startTemp = moment(s.data_start, 'HH:mm', true);
                                                // var endTemp = moment(s.data_end, 'HH:mm', true);
                                                // var clickedDateStartMoment = moment(clickedStart);
                                                // var combinedDateTimeStart = clickedDateStartMoment.format('YYYY-MM-DD') + 'T' + startTemp.format('HH:mm');
                                                // var clickedDateEndMoment = moment(clickedEnd);
                                                // clickedDateEndMoment.subtract(1, 'days'); // substract é do moment.js 
                                                // var combinedDateTimeEnd = clickedDateEndMoment.format('YYYY-MM-DD') + 'T' + endTemp.format('HH:mm');
                                                // var combinedDateTimeEnd = clickedDateEnd + "T" +s.data_end.split("T")[1]
                                                // makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, combinedDateTimeStart, combinedDateTimeEnd);
        
                                            } 
                                    
                
                                    }
                                    
                                        
                                // if (selectstart >= s.data_start.split("T")[0] && selectstart <= s.data_end.split("T")[0]) {
                                //             } 
            
                                //             else {
                                //         //Implementar mensagem de Data indisponível aqui. Toast
                                //         console.log("WECOM LOG: Data indisponível!!!")
                                //     }
                                })
                            
                            
                        }

var currentMonth;
var year;

function buildCalendar(availability,schedule,divCalendar,device,room) {

            document.getElementById(divCalendar).innerHTML = ''
            document.getElementById(divCalendar).innerHTML += 
            `<div id="bodycalendar">

            <div class="calendar">
              <div class="header">
                <button id="prevMonth" style="display: flex; justify-content: center; align-items: center; width: 36px; height: 36px; transform: rotate(-0deg);"><</button>
                <h1 id="month-year"></h1>
                <button id="nextMonth"style="display: flex; justify-content: center; align-items: center; width: 36px; height: 36px; transform: rotate(180deg);"><</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Dom</th>
                    <th>Seg</th>
                    <th>Ter</th>
                    <th>Qua</th>
                    <th>Qui</th>
                    <th>Sex</th>
                    <th>Sáb</th>
                  </tr>
                </thead>
                <tbody id="calendar-body">
                  <!-- Aqui será preenchido com os dias do mês -->
                </tbody>
              </table>
            </div>
            </div>
            <div id="schedule-container" class="divclock"></div>`

    
  var date = new Date();
  currentMonth = date.getMonth();
  year = date.getFullYear();

  document.getElementById("prevMonth").addEventListener("click", function() {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      year--;
    }
    rebuildCalendar(availability,schedule,device,room);
  });

  document.getElementById("nextMonth").addEventListener("click", function() {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      year++;
    }
    rebuildCalendar(availability,schedule,room,device);
  });

  rebuildCalendar(availability,schedule,room,device);
}

// function buildDailySchedule(day) {
//   var scheduleContainer = document.getElementById("schedule-container");
//   scheduleContainer.innerHTML = `
//     <div class="clock">
//       <div class="clock-face">
//         ${generateClockMarks()}
//       </div>
//     </div>`;
// }

function generateClockMarks() {
  let marksHTML = '';
  for (let i = 1; i <= 12; i++) {
    marksHTML += `<div class="triangle" style="--i: ${i};"><b>${i}</b></div>`;
  }
  return marksHTML;
}

function rebuildCalendar(availability,schedule,room,device) {
  var calendarBody = document.getElementById("calendar-body");
  calendarBody.innerHTML = "";

  var date = new Date([year, currentMonth, 1]);
  var currentMonthFirstDay = date.getDay()
  var daysInMonth = new Date(year, currentMonth + 1, 0).getDate();

  var prevMonth = new Date(year, currentMonth, 0);
  var daysInPrevMonth = prevMonth.getDate();
  var prevMonthStartDay = prevMonth.getDay();

  var day = 1;
  var row;

  var monthYearHeader = document.getElementById("month-year");
  monthYearHeader.innerHTML = getMonthName(currentMonth) + " " + year;

  row = calendarBody.insertRow();

  for (var i = 0; i < currentMonthFirstDay; i++) {
    var cell = row.insertCell();
    var dayToShow = daysInPrevMonth - currentMonthFirstDay + i + 1;
    cell.innerHTML = dayToShow;
    cell.classList.add("prev-month");
  }

  for (var i = 0; i < daysInMonth; i++) {
    if (row.cells.length === 7) {
      row = calendarBody.insertRow();
    }
    var cell = row.insertCell();
    cell.innerHTML = day;
    cell.addEventListener("click", function() {
    //   buildDailySchedule(parseInt(this.innerHTML));
    });
    day++;
  }

  var nextMonthDay = 1;
  while (row.cells.length < 7) {
    var cell = row.insertCell();
    cell.innerHTML = nextMonthDay;
    cell.classList.add("next-month");
    nextMonthDay++;
  }
  var cells = document.querySelectorAll("#calendar-body td");
  cells.forEach(function(cell) {

    UpdateAvailability(availability,schedule,room,device)
    var selectedDate = moment([year, currentMonth, cell.innerHTML]);
    var diaDaSemana = selectedDate.format('dddd'); // 'dddd' retorna o nome completo do dia
    cell.setAttribute("day-week", diaDaSemana); 

    var selectedDay = parseInt(cell.innerHTML);
    var formattedDate = moment(selectedDay + "-" + (currentMonth + 1) + "-" + year, "D-M-YYYY").format("YYYY-MM-DD");
    cell.setAttribute("data-date", formattedDate )

    cell.addEventListener("click",function(){
        console.log("Data inicio:" + formattedDate + "00:00")
        console.log("Data Fim:" + formattedDate + "23:59")
        // makeDivConfirmPhoneRecurrentSchedule()
    })

    // cell.addEventListener("click", function() {
    //     schedule.forEach(function(s){
    //         console.log("Data de agendamento Inicio:" + formattedDate + s.data_start )
    //         console.log("Data de agendamento Fim:" + formattedDate + s.data_end )
    //     })
        
        // makeDivConfirmPhoneRecurrentSchedule()
    //   buildDailySchedule(selectedDay);
    });


}

function getMonthName(month) {
  var months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return months[month];
}

function getDayName(day) {
  var days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return days[day];
}

    function makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, start, end) {
        console.log("Start para Envio:" + start )
        console.log("End para Envio:" + end )
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
            listbox.add(new innovaphone.ui1.Node("h1", null, texts.text("whenLabel") + " " + formatDate(start)))
    
            listbox.add(new innovaphone.ui1.Div("width:80px; height: 50px; color: white; border-radius: 40px; font-weight:bold;", texts.text("makePhoneSceduleButton"), "button").addEvent("click", function () {
                app.sendSrc({ api: "user", mt: "makePhoneSchedule", device: device.hwid, type: s.schedule_module, room: room.id, data_start: start, data_end: end }, function (obj) {
    
                });
            }))
        }

    }                    
    function makeRecurrentSchedule(t, room, divCalendar, device , s, dayWeek, clickedStart , clickedEnd, dev_schedule ){
        switch (dayWeek) {

            case "segunda-feira":
                var startTemp = moment(s.timestart_monday, 'HH:mm', true);
                var endTemp = moment(s.timeend_monday, 'HH:mm', true);
                var clickedDateStartMoment = moment(clickedStart);
                var combinedDateTimeStart = clickedDateStartMoment.format('YYYY-MM-DD') + 'T' + startTemp.format('HH:mm');

                var clickedDateEndMoment = moment(clickedEnd);
                clickedDateEndMoment.subtract(1, 'days'); // substract é do moment.js 
                var combinedDateTimeEnd = clickedDateEndMoment.format('YYYY-MM-DD') + 'T' + endTemp.format('HH:mm');

                var dateOccupied = dev_schedule.some(function (dateS) {
                    return dateS.data_start === combinedDateTimeStart;
                });

                if (dateOccupied) {
                    // se tiver ocupado acaba aqui - Pietro
                    console.log("WECOM LOG: Telefone ocupado nesta data!!!");
                    return;
                } else {
                    if (s.timestart_monday < s.timeend_monday && s.timestart_monday != "" && s.timeend_monday != "") {

                        if (s.schedule_module == "hourModule") {
                            $(`#${divCalendar}`).fullCalendar('changeView', 'agendaDay');
                            $(`#${divCalendar}`).fullCalendar('gotoDate', start);
                        } else if (s.schedule_module == "dayModule") {
                            console.log("Abrir modal para confirmar o dia inteiro.")
                            console.log("CombinedDateTimeStart")
                            makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, combinedDateTimeStart, combinedDateTimeEnd);

                        }
                    } else {
                        //Implementar mensagem de Data indisponível aqui. Toast
                        console.log("WECOM LOG: Data indisponível!!!")
                    }
                }
                return;
            case "terça-feira":
                var startTemp = moment(s.timestart_tuesday, 'HH:mm', true);
                var endTemp = moment(s.timeend_tuesday, 'HH:mm', true);
                var clickedDateStartMoment = moment(clickedStart);
                var combinedDateTimeStart = clickedDateStartMoment.format('YYYY-MM-DD') + 'T' + startTemp.format('HH:mm');

                var clickedDateEndMoment = moment(clickedEnd);
                clickedDateEndMoment.subtract(1, 'days'); // substract é do moment.js 
                var combinedDateTimeEnd = clickedDateEndMoment.format('YYYY-MM-DD') + 'T' + endTemp.format('HH:mm');

                var dateOccupied = dev_schedule.some(function (dateS) {
                    return dateS.data_start === combinedDateTimeStart;

                });

                if (dateOccupied) {
                    // se tiver ocupado acaba aqui - Pietro
                    console.log("WECOM LOG: Telefone ocupado nesta data!!!");
                    return;
                } else {
                    // se nao , continua a função aqui - Pietro
                    if (s.timestart_tuesday < s.timeend_tuesday && s.timestart_tuesday != "" && s.timeend_tuesday != "") {
                        var startTemp = moment(s.timestart_tuesday);
                        var endTemp = moment(s.timeend_tuesday);
                        if (s.schedule_module == "hourModule") {
                            $(`#${divCalendar}`).fullCalendar('changeView', 'agendaDay');
                            $(`#${divCalendar}`).fullCalendar('gotoDate', start);
                        } else if (s.schedule_module == "dayModule") {

                            console.log("Abrir modal para confirmar o dia inteiro.")
                            makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, combinedDateTimeStart, combinedDateTimeEnd);

                        } 
                    }
                    else {
                        //Implementar mensagem de Data indisponível aqui. Toast
                        console.log("WECOM LOG: Data indisponível!!!")
                    }
                }
                return;
            case "quarta-feira":

                var startTemp = moment(s.timestart_wednesday, 'HH:mm');
                var endTemp = moment(s.timeend_wednesday, 'HH:mm');
                var clickedDateStartMoment = moment(clickedStart);
                var combinedDateTimeStart = clickedDateStartMoment.format('YYYY-MM-DD') + 'T' + startTemp.format('HH:mm');
                var clickedDateEndMoment = moment(clickedEnd);
                clickedDateEndMoment.subtract(1, 'days'); // substract é do moment.js 
                var combinedDateTimeEnd = clickedDateEndMoment.format('YYYY-MM-DD') + 'T' + endTemp.format('HH:mm');
                var dateOccupied = dev_schedule.some(function (dateS) {
                    return dateS.data_start === combinedDateTimeStart;
                });
                if (dateOccupied) {
                    // se tiver ocupado acaba aqui - Pietro
                    console.log("WECOM LOG: Telefone ocupado nesta data!!!");
                    return;
                } else {

                    if (s.timestart_wednesday < s.timeend_wednesday && s.timestart_wednesday != "" && s.timeend_wednesday != "") {
                        var startTemp = moment(s.timestart_wednesday);
                        var endTemp = moment(s.timeend_wednesday);
                        if (s.schedule_module == "hourModule") {
                            $(`#${divCalendar}`).fullCalendar('changeView', 'agendaDay');
                            $(`#${divCalendar}`).fullCalendar('gotoDate', start);
                        } else if (s.schedule_module == "dayModule") {
                            console.log("Abrir modal para confirmar o dia inteiro.")
                            makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, combinedDateTimeStart, combinedDateTimeEnd);
                        } 
                        return;
                    } else {
                        //Implementar mensagem de Data indisponível aqui. Toast
                        console.log("WECOM LOG: Data indisponível!!!")
                    }
                }
                return;
            case "quinta-feira":

                var startTemp = moment(s.timestart_thursday, 'HH:mm');
                var endTemp = moment(s.timeend_thursday, 'HH:mm');
                var clickedDateStartMoment = moment(clickedStart);
                var combinedDateTimeStart = clickedDateStartMoment.format('YYYY-MM-DD') + 'T' + startTemp.format('HH:mm');

                var clickedDateEndMoment = moment(clickedEnd);
                clickedDateEndMoment.subtract(1, 'days'); // substract é do moment.js 
                var combinedDateTimeEnd = clickedDateEndMoment.format('YYYY-MM-DD') + 'T' + endTemp.format('HH:mm');

                var dateOccupied = dev_schedule.some(function (dateS) {
                    return dateS.data_start === combinedDateTimeStart;
                });

                if (dateOccupied) {
                    // se tiver ocupado acaba aqui - Pietro
                    console.log("WECOM LOG: Telefone ocupado nesta data!!!");
                    return;
                } else {

                    if (s.timestart_thursday < s.timeend_thursday && s.timestart_thursday != "" && s.timeend_thursday != "") {
                        var startTemp = moment(s.timestart_thursday);
                        var endTemp = moment(s.timeend_thursday);
                        if (s.schedule_module == "hourModule") {
                            $(`#${divCalendar}`).fullCalendar('changeView', 'agendaDay');
                            $(`#${divCalendar}`).fullCalendar('gotoDate', start);
                        } else if (s.schedule_module == "dayModule") {
                            console.log("Abrir modal para confirmar o dia inteiro.")
                            makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, combinedDateTimeStart, combinedDateTimeEnd);
                        } 
                    
                    } else {
                        //Implementar mensagem de Data indisponível aqui. Toast
                        console.log("WECOM LOG: Data indisponível!!!")
                    }
                }
                return;
            case "sexta-feira":

                var startTemp = moment(s.timestart_friday, 'HH:mm');
                var endTemp = moment(s.timeend_friday, 'HH:mm');
                var clickedDateStartMoment = moment(clickedStart);
                var combinedDateTimeStart = clickedDateStartMoment.format('YYYY-MM-DD') + 'T' + startTemp.format('HH:mm');

                var clickedDateEndMoment = moment(clickedEnd);
                clickedDateEndMoment.subtract(1, 'days'); // substract é do moment.js 
                var combinedDateTimeEnd = clickedDateEndMoment.format('YYYY-MM-DD') + 'T' + endTemp.format('HH:mm');

                var dateOccupied = dev_schedule.some(function (dateS) {
                    return dateS.data_start === combinedDateTimeStart;
                });

                if (dateOccupied) {
                    // se tiver ocupado acaba aqui - Pietro
                    console.log("WECOM LOG: Telefone ocupado nesta data!!!");
                    return;
                } else {

                    if (s.timestart_friday < s.timeend_friday && s.timestart_friday != "" && s.timeend_friday != "") {
                        var startTemp = moment(s.timestart_friday);
                        var endTemp = moment(s.timeend_friday);
                        if (s.schedule_module == "hourModule") {
                            $(`#${divCalendar}`).fullCalendar('changeView', 'agendaDay');
                            $(`#${divCalendar}`).fullCalendar('gotoDate', start);
                        } else if (s.schedule_module == "dayModule") {
                            console.log("Abrir modal para confirmar o dia inteiro.")

                            makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, combinedDateTimeStart, combinedDateTimeEnd);

                        }
                    } else {
                        //Implementar mensagem de Data indisponível aqui. Toast
                        console.log("WECOM LOG: Data indisponível!!!")
                    }
                }
                return;
            case "sábado":

                var startTemp = moment(s.timestart_saturday, 'HH:mm');
                var endTemp = moment(s.timeend_saturday, 'HH:mm');
                var clickedDateStartMoment = moment(clickedStart);
                var combinedDateTimeStart = clickedDateStartMoment.format('YYYY-MM-DD') + 'T' + startTemp.format('HH:mm');

                var clickedDateEndMoment = moment(clickedEnd);
                clickedDateEndMoment.subtract(1, 'days'); // substract é do moment.js 
                var combinedDateTimeEnd = clickedDateEndMoment.format('YYYY-MM-DD') + 'T' + endTemp.format('HH:mm');

                var dateOccupied = dev_schedule.some(function (dateS) {
                    return dateS.data_start === combinedDateTimeStart;
                });

                if (dateOccupied) {
                    // se tiver ocupado acaba aqui - Pietro
                    console.log("WECOM LOG: Telefone ocupado nesta data!!!");
                    return;
                } else {
                    if (s.timestart_saturday < s.timeend_saturday && s.timestart_saturday != "" && s.timeend_saturday != "") {
                        var startTemp = moment(s.timestart_saturday);
                        var endTemp = moment(s.timeend_saturday);
                        if (s.schedule_module == "hourModule") {
                            $(`#${divCalendar}`).fullCalendar('changeView', 'agendaDay');
                            $(`#${divCalendar}`).fullCalendar('gotoDate', start);
                        } else if (s.schedule_module == "dayModule") {
                            console.log("Abrir modal para confirmar o dia inteiro.")

                            makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, combinedDateTimeStart, combinedDateTimeEnd);

                        }
                    } else {
                        //Implementar mensagem de Data indisponível aqui. Toast
                        console.log("WECOM LOG: Data indisponível!!!")
                    }
                }
                return;
            case "domingo":

                var startTemp = moment(s.timestart_sunday, 'HH:mm');
                var endTemp = moment(s.timeend_sunday, 'HH:mm');
                var clickedDateStartMoment = moment(clickedStart);
                var combinedDateTimeStart = clickedDateStartMoment.format('YYYY-MM-DD') + 'T' + startTemp.format('HH:mm');

                var clickedDateEndMoment = moment(clickedEnd);
                clickedDateEndMoment.subtract(1, 'days'); // substract é do moment.js 
                var combinedDateTimeEnd = clickedDateEndMoment.format('YYYY-MM-DD') + 'T' + endTemp.format('HH:mm');

                var dateOccupied = dev_schedule.some(function (dateS) {
                    return dateS.data_start === combinedDateTimeStart;
                });

                if (dateOccupied) {
                    // se tiver ocupado acaba aqui - Pietro
                    console.log("WECOM LOG: Telefone ocupado nesta data!!!");
                    return;
                } else {
                    if (s.timestart_sunday < s.timeend_sunday && s.timestart_sunday != "" && s.timeend_sunday != "") {
                        var startTemp = moment(s.timestart_sunday);
                        var endTemp = moment(s.timeend_sunday);
                        if (s.schedule_module == "hourModule") {
                            $(`#${divCalendar}`).fullCalendar('changeView', 'agendaDay');
                            $(`#${divCalendar}`).fullCalendar('gotoDate', start);
                        } else if (s.schedule_module == "dayModule") {
                            console.log("Abrir modal para confirmar o dia inteiro.")

                            makeDivConfirmPhoneRecurrentSchedule(t, room, device, s, combinedDateTimeStart, combinedDateTimeEnd);

                        }

                    } else {
                        //Implementar mensagem de Data indisponível aqui. Toast
                        console.log("WECOM LOG: Data indisponível!!!")
                    }
                }
                return;
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
        var cells = document.querySelectorAll("#calendar-body td");
        if (availability.length === 0) {
            cells.forEach(function (td) {
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
                                    console.log("Data Split " + dataSplit)
                                    console.log("Data S " + dataS)

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
                                    var dataSplit = dateS.data_start
                                    var dataS = dataSplit.split("T")[0]  // ajuste para comparar as datas 
                                    //console.log("Data Split " + GetDeviceSchedulesResult)
                                    console.log("Data S " + dataS)

                                    if(dataDate == dataS ){
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
                                    var dataSplit = dateS.data_start
                                    var dataS = dataSplit.split("T")[0]  // ajuste para comparar as datas 
                                    console.log("Data Split " + dataSplit)
                                    console.log("Data S " + dataS)

                                    if(dataDate == dataS ){
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
                                    var dataSplit = dateS.data_start
                                    var dataS = dataSplit.split("T")[0]  // ajuste para comparar as datas 
                                    console.log("Data Split " + dataSplit)
                                    console.log("Data S " + dataS)

                                    if(dataDate == dataS ){
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
                                    var dataSplit = dateS.data_start
                                    var dataS = dataSplit.split("T")[0]  // ajuste para comparar as datas 
                                    console.log("Data Split " + dataSplit)
                                    console.log("Data S " + dataS)

                                    if(dataDate == dataS ){
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
                                    var dataSplit = dateS.data_start
                                    var dataS = dataSplit.split("T")[0]  // ajuste para comparar as datas 
                                    console.log("Data Split " + dataSplit)
                                    console.log("Data S " + dataS)

                                    if(dataDate == dataS ){
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
                                    var dataSplit = dateS.data_start
                                    var dataS = dataSplit.split("T")[0]  // ajuste para comparar as datas 
                                    console.log("Data Split " + dataSplit)
                                    console.log("Data S " + dataS)

                                    if(dataDate == dataS ){
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
                    cells.forEach(function (td) {
                        var dataDate = moment(td.getAttribute('data-date')).format('YYYY-MM-DD');
                        // var hourAvail = 24 //countTotalHoursAvailability(String(dataDate), availability);
                        // var hourBusy = 0 //countTotalHoursBusy(String(dataDate), schedules);
                        // hourAvail -= hourBusy;
                        // console.log("Horas disponivies " + hourAvail + " em " + String(dataDate))
                        if (dataDate >= datastart && dataDate <= dataend) {
                            td.classList.remove("unavailable")
                            td.classList.add("available")

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
    function UpdateDayAvailability(availability, schedules, day, month, year) {
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
