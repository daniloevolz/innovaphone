
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.coolwork = Wecom.coolwork || function (start, args) {
    this.createNode("body")
    var that = this;
    var device_list = [];
    var UIuser;
    var UIDomain;
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
    // waitConnection(that);

    function app_connected(domain, user, dn, appdomain) {

        changeState("Connected");
        UIDomain = domain
        UIuser = dn
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
            var devices = obj.msg.phones;
            console.log("WECOM-LOG:devicesApi_onmessage:GetPhonesResult " + JSON.stringify(devices));
            app.send({ api: "user", mt: "PhoneList", devices: devices })
        }

    }
    function app_message(obj) {
        if (obj.api === "user" && obj.mt === "SelectDevicesResult") {
            device_list = JSON.parse(obj.result)
        }
        if (obj.api === "user" && obj.mt === "SelectMyRoomsViewerResult") {
            app.send({ api: "user", mt: "SelectRooms", ids: obj.result })
            // that.clear()
            // // list_MyRooms = JSON.parse(obj.result)
            
        }
        if (obj.api == "user" && obj.mt == "TableUsersResult") {
            list_tableUsers = JSON.parse(obj.result);     
            console.log("table-users " + JSON.stringify(list_tableUsers))      
        }
        if (obj.api === "user" && obj.mt === "SelectRoomsResult") {
            var rooms = JSON.parse(obj.rooms);
            schedules = JSON.parse(obj.schedules);
            var devices = JSON.parse(obj.devices);
            that.clear();
            makeHeader("./images/home.svg","./images/menu.svg", texts.text("labelMyRooms"))
            makeViewRoom(rooms,devices,schedules)  
            
        }

        // if (obj.api === "user" && obj.mt === "SelectRoomResult") {
        //     var room = JSON.parse(obj.room);
        //     schedules = JSON.parse(obj.schedules);
        //     var devices = obj.dev;
        //     makeDivRoom(_colDireita, room, schedules, devices);
        // }
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
     
     function makeViewRoom(rooms,devices,schedules){
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

        
        // divImg.appendChild(imgRoom)
        divTitleRoom.appendChild(nameRoom)
        divTitleRoom.appendChild(divDeviceNumber)
        divDeviceNumber.appendChild(statusDevice)
        
        divMain.appendChild(divImg)
        divMain.appendChild(divTitleRoom)

        const divUsersAvatar = document.createElement("div")
        divUsersAvatar.setAttribute("id","divUsersAvatar")

        console.log("TABLEUSERS" + JSON.stringify(list_tableUsers))
        if(list_tableUsers.length > 0 ){
            list_tableUsers.forEach(function(users){
                avatar = new innovaphone.Avatar(start, users.sip , UIDomain);
                UIuserPicture = avatar.url(users.sip, 80, UIuser );
                const imgAvatar = document.createElement("img")
                imgAvatar.setAttribute("src", UIuserPicture);
                imgAvatar.setAttribute("id","divAvatar")
                divUsersAvatar.appendChild(imgAvatar)
                divMain.appendChild(divUsersAvatar)
            })
        }
   
        
        container.appendChild(divMain)
        })
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
