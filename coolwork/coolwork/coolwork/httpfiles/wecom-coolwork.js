
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.coolwork = Wecom.coolwork || function (start, args) {
    this.createNode("body")
    var that = this;
    var device_list = [];
    var userDN;
    var userDomain;
    var avatar;
    var appdn = start.title;
    var appUrl = start.originalUrl;
    var UIuserPicture;
    var devicesApi;
    var list_MyRooms = [];
    var list_tableUsers = []
    var _colDireita;
    var schedules = []


    var colorSchemes = {
        dark: {
            "--bg": "#0B2E46",
            "--button": "#AED4EF",
            "--text-standard": "#ffffff",
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
    var rooms = [];
    var devices = [];
    var availiabilities = [];
    var schedules = [];
    var viewers = [];
    var editors = [];

    function app_connected(domain, user, dn, appdomain) {

        changeState("Connected");
        userDomain = domain
        userDN = dn
        // avatar = new innovaphone.Avatar(start, user, domain);
        // UIuserPicture = avatar.url(user, 80, dn);

        console.log("USER" + user)
        appUrl = appUrl + "/Calendar.html"

        app.send({ api: "user", mt: "TableUsers" });
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
            var phones = obj.msg.phones;
            console.log("WECOM-LOG:devicesApi_onmessage:GetPhonesResult " + JSON.stringify(phones));
            app.send({ api: "user", mt: "PhoneList", devices: phones })
        }

    }
    function app_message(obj) {
        if (obj.api === "user" && obj.mt === "SelectMyRoomsViewerResult") {
            app.send({ api: "user", mt: "SelectRooms", ids: obj.result })
            // that.clear()
            // // list_MyRooms = JSON.parse(obj.result)
        }
        if (obj.api == "user" && obj.mt == "TableUsersResult") {
            list_tableUsers = JSON.parse(obj.result);     
            console.log("table-users " + JSON.stringify(list_tableUsers))      
        }
        //Retorna todas as salas solicitadas
        if (obj.api === "user" && obj.mt === "SelectRoomsResult") {
            rooms = JSON.parse(obj.result);
            app.send({ api: "user", mt: "SelectDevices", ids: obj.ids })
            app.send({ api: "user", mt: "SelectRoomsEditors", ids: obj.ids })
            app.send({ api: "user", mt: "SelectRoomsViewers", ids: obj.ids })
        }
        //Retorna todas os devices de todas as salas solicitadas
        if (obj.api === "user" && obj.mt === "SelectDevicesResult") {
            devices = JSON.parse(obj.result);
            app.send({ api: "user", mt: "SelectRoomsAvailabilities", ids: obj.ids })
        }
        //Retorna todas as disponibilidades de todas as salas solicitadas
        if (obj.api === "user" && obj.mt === "SelectRoomsAvailabilitiesResult") {
            availiabilities = JSON.parse(obj.result);
            app.send({ api: "user", mt: "SelectDevicesSchedule", ids: obj.ids })
        }
        //Retorna todos os agendamentos de todas as salas solicitadas
        if (obj.api === "user" && obj.mt === "SelectDevicesScheduleResult") {
            schedules = JSON.parse(obj.result);

            //Todos os dados carregados, vamos abrir a tela visual do App!!!!!!
            console.info("Todos os dados carregados, vamos abrir a tela visual do App!!!!!!");
            that.clear();
            makeHeader("./images/home.svg", "./images/menu.svg", texts.text("labelMyRooms"))
            makeViewRoom(rooms, devices, availiabilities, schedules, viewers, editors)
        }
        //Retorna todos os usuários visualizadores das salas solicitadas
        if (obj.api === "user" && obj.mt === "SelectRoomsViewersResult") {
            viewers = JSON.parse(obj.result);
            //if (viewers.hasOwnProperty(obj.room)) {
            //    viewers[obj.room].push = JSON.parse(obj.result)
            //} else {
            //    viewers[obj.room] = [];
            //    viewers[obj.room].push = JSON.parse(obj.result)
            //}
            
        }
        //Retorna todos os usuários editores das salas solicitadas
        if (obj.api === "user" && obj.mt === "SelectRoomsEditorsResult") {
            editors = JSON.parse(obj.result);
            //if (editors.hasOwnProperty(obj.room)) {
            //    editors[obj.room].push = JSON.parse(obj.result)
            //} else {
            //    editors[obj.room] = [];
            //    editors[obj.room].push = JSON.parse(obj.result)
            //} 
        }
        if(obj.api === "user" && obj.mt === "DeviceScheduleSuccess"){
            app.send({ api: "user", mt: "SelectMyRooms" })
        }
    } 

    function makeHeader(imgLeft,imgRight,title){
        // construção do header
      
        const header = document.createElement("header")
        header.classList.add("bg-dark-200" ,"m-1" ,"flex", "items-center", "justify-between", "p-1", "rounded-lg")
     
        //construção da div com o titulo e imgHome
        const divTitle = document.createElement("div")
        divTitle.classList.add("flex","items-center","justify-start", "gap-1")
     
        //imgHome
        const imgHome = document.createElement("img")
        imgHome.setAttribute("src",imgLeft)
     
        //titulo
        const titleRoom = document.createElement("h1")
        titleRoom.classList.add("text-white" ,"font-bold")
        titleRoom.textContent = title
     
        //imgMenu
        const imgMenu = document.createElement("img")
        imgMenu.setAttribute("src",imgRight)
     
        
           divTitle.appendChild(imgHome)
           divTitle.appendChild(titleRoom)
           header.appendChild(divTitle)
           header.appendChild(imgMenu)
           document.body.appendChild(header);
     
     }
     
     function makeContainer(){
         var container = document.createElement("div")
         document.body.appendChild(container);
         return container
     } 
     
    function makeViewRoom(rooms, devices, availiabilities, schedules, viewers, editors){
        // div container (scroll)
        const container = document.createElement("div")
        container.classList.add("overflow-auto","grid","gap-2","sm:grid-cols-2","md:grid-cols-4")
        container.style.height = 'calc(100vh - 70px)'
        container.setAttribute("id","container")
        document.body.appendChild(container);
        
        rooms.forEach(function(room){
            //div principal
            const divMain =  document.createElement("div")
            divMain.classList.add("rounded-lg","p-1","m-1","bg-dark-200","gap-2","flex-col","flex")
            divMain.setAttribute("room",room.id)
            divMain.setAttribute("id",room.id)
            // img da sala
            const divImg = document.createElement("div")
            divImg.classList.add("aspect-[16/9]","bg-center","bg-cover","bg-no-repeat","rounded-lg")
            divImg.setAttribute("style", `background-image: url(${room.img});`);
            // div titulo da sala
            const divTitleRoom = document.createElement("div")
            divTitleRoom.classList.add("flex","items-center","justify-between", "gap-1")
            // nome da sala
            const nameRoom = document.createElement("h1")
            nameRoom.textContent = `${room.name}`
            nameRoom.classList.add("text-white" ,"font-bold")
            // device count
            const divDeviceNumber = document.createElement("div")
            divDeviceNumber.classList.add("justify-start","flex","items-center","gap-1")
            const statusDevice = document.createElement("div")
            statusDevice.classList.add("bg-[#FF0707]","w-3","h-3","rounded-full")

            // filtro para retornar os telefones disponíveis
            var devicesInfo = devices.filter(function (dev) {
                return dev.room_id == room.id && dev.guid === null ;
            });
       
            const deviceNumber = document.createElement("h1")
            deviceNumber.textContent = `${parseInt(devicesInfo.length,10)}`
            deviceNumber.classList.add("text-white" ,"font-bold")
            divDeviceNumber.appendChild(deviceNumber)

        
            divTitleRoom.appendChild(nameRoom)
            divTitleRoom.appendChild(divDeviceNumber)
            divDeviceNumber.appendChild(statusDevice)
        
            divMain.appendChild(divImg)
            divMain.appendChild(divTitleRoom)

            //disponibilidade da sala 
            var availabilitiesInfo = availiabilities.filter(function (a) {
                return a.room_id == room.id
            });
            console.log("Availabilities: " + JSON.stringify(availabilitiesInfo))

            availabilitiesInfo.forEach(function(a){
                if(a.type == "periodType"){
  
                    // div disponibilidade periodo
                   const divMainAvailabilityPeriod = document.createElement("div")
                   divMainAvailabilityPeriod.classList.add("flex","p-1","items-center","justify-between","bg-dark-100/35","rounded-lg")
                   const imgCalendar = document.createElement("img")
                   imgCalendar.setAttribute("src","./images/calendar-days.svg")
                   divMainAvailabilityPeriod.appendChild(imgCalendar)
                   // div data
                   const divDateP = document.createElement("div")
                   divDateP.classList.add("flex","items-center","gap-1","justify-center","content-center")
   
                   const dateStart = document.createElement("p")
                   const formatedDataStart = moment(a.data_start).format("DD/MM");
                   dateStart.textContent = formatedDataStart
                   dateStart.classList.add("text-xl","font-bold",)
                   // texto até
                   const dateAte = document.createElement("p")
                   dateAte.textContent = texts.text("labelTo")
                   dateAte.classList.add("text-sm","font-regular",'text-primary-600')
                   // texto fim
                   const dateEnd = document.createElement("p")
                   const formatedDataEnd = moment(a.data_end).format("DD/MM");
                   dateEnd.textContent = formatedDataEnd
                   dateEnd.classList.add("text-xl","font-bold",)
           
                   divDateP.appendChild(dateStart)
                   divDateP.appendChild(dateAte)
                   divDateP.appendChild(dateEnd)
                   divMainAvailabilityPeriod.appendChild(divDateP)
                   divMain.appendChild(divMainAvailabilityPeriod)
               }
   
               if(a.type == "recurrentType"){
                   // div disponibilidade recorrente
                   const divMainAvailabilityRecurrent = document.createElement("div")
                   divMainAvailabilityRecurrent.classList.add("flex","p-1","items-start","bg-dark-100/35","rounded-lg","justify-center")
                   // dias da semana 
                   var week = [texts.text("labelSun"), texts.text("labelMon") ,texts.text("labelTerc"), texts.text("labelQuar") , texts.text("labelQuint") , texts.text("labelSex") , texts.text("labelSab")];
                  
                   const daysOfWeekMap = {
                    "D": "domingo",
                    "M": "segunda-feira",
                    "T": "terça-feira",
                    "W": "quarta-feira",
                    "T2": "quinta-feira",
                    "F": "sexta-feira",
                    "S": "sabado"
                };
                   week.forEach(function(w){
                       const dayDiv = document.createElement('div')
                       dayDiv.classList.add("flex","w-[40px]","h-[40px]","p-1","flex-col","items-center","justify-center","gap-1")
                       const dayText = document.createElement('p')
                       dayText.classList.add("font-Montserrat","text-base","font-bold","leading-normal",'leading-normal',"color-dark-400","recurrentText")
                       dayText.textContent = w
                       dayText.setAttribute("day-week", daysOfWeekMap[w] )
                       dayDiv.appendChild(dayText)
                       divMainAvailabilityRecurrent.appendChild(dayDiv)
                   })
                   divMain.appendChild(divMainAvailabilityRecurrent)
                   
               }
            })
            const divUsersAvatar = document.createElement("div")
            divUsersAvatar.classList.add("flex","items-start","gap-1")
            divUsersAvatar.setAttribute("id", "divUsersAvatar")
            console.log("ARRAY DO INFERNO:" + JSON.stringify(viewers))
            
            viewers.forEach(function (viewer) {

                var viewersUsers = list_tableUsers.filter(function (user) {
                    return user.guid == viewer.viewer_guid && viewer.room_id == room.id
                });
                viewersUsers.forEach(function(view){

                    avatar = new innovaphone.Avatar(start, view.sip , userDomain);
                    UIuserPicture = avatar.url(view.sip, 15 , userDN );
                    const imgAvatar = document.createElement("img")
                    imgAvatar.setAttribute("src", UIuserPicture);
                    imgAvatar.setAttribute("id","divAvatar")
                    imgAvatar.classList.add("w-5","h-5","rounded-full")
                    divUsersAvatar.appendChild(imgAvatar)
                    divMain.appendChild(divUsersAvatar)

                })
            })
            container.appendChild(divMain)
            UpdateAvailability(availabilitiesInfo,"","sim")

        //todas as divs com o atributo "room"
        const divsRoom = document.querySelectorAll('[room]');
        //listener de clique a cada div
        divsRoom.forEach(function (div) {
            div.addEventListener('click', function (event) {
                var id = event.currentTarget.id;
                var room = rooms.filter(function (room) {
                    return id == room.id
                });
                var devs = devices.filter(function (dev) {
                    return id == dev.room_id
                });
                var avail = availiabilities.filter(function (avl) {
                    return id == avl.room_id
                });
                var sched = schedules.filter(function (sched) {
                    return id == sched.device_room_id
                });
                var viws = schedules.filter(function (viws) {
                    return id == viws.room_id
                });
                event.stopPropagation();
                //makeViewRoomDetail(room, devs, avail, sched, viws)
            });
        });
        })   
     }
     function makeRoom(){

     }
     function makeViewRoomDetail(room, devices, availability, schedules, viewers) {
        that.clear();
        makeHeader("./images/arrow-left.svg", "./images/menu.svg", room.name)
        // div sala
        const divImg = document.createElement("div")
        divImg.classList.add("aspect-[16/9]", "bg-center", "bg-cover", "bg-no-repeat", "rounded-lg", "divSala")
        divImg.setAttribute("style", "background-image: url(${room.img})")
        document.body.appendChild(div102);
        //card horarios implementado pelo Pietro
        UpdateAvailability(availability, schedules)

        // div container (scroll)
        const div102 = document.createElement("div")
        div102.classList.add("div102")
        div102.style.height = 'calc(100vh - 70px)'
        div102.setAttribute("id", "div102")
        document.body.appendChild(div102);

        devices.forEach(function (device) {
            var sched = schedules.filter(function (sched) {
                return device.id == sched.device_id
            });

            makeViewDevice(div102, device, availability, sched, viewers)
        })



    }
    function makeViewDevice(div, device, availability, schedules, viewers) {


    }
    // //Função para alterar o estado da váriavel de controle, utilizada para forçar o timer a tentar nova conexão.
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
}

Wecom.coolwork.prototype = innovaphone.ui1.nodePrototype;