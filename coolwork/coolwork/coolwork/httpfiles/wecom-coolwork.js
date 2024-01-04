
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.coolwork = Wecom.coolwork || function (start, args) {
    this.createNode("body")
    var that = this;
    var device_list = [];
    var userDN;
    var userSIP;
    var userDomain;
    var avatar;
    var appdn = start.title;
    var appUrl = start.originalUrl;
    var UIuserPicture;
    var devicesApi;
    var list_MyRooms = [];
    var list_tableUsers = []
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
    var availabilities = [];
    var schedules = [];
    var viewers = [];
    var editors = [];


    function app_connected(domain, user, dn, appdomain) {

        changeState("Connected");
        userDomain = domain
        userDN = dn
        userSIP = user
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
            app.sendSrc({ api: "user", mt: "SelectDevices", ids: obj.ids, src: obj.ids}, function (obj) {
                app.send({ api: "user", mt: "SelectRoomsEditors", ids: obj.ids })
                app.send({ api: "user", mt: "SelectRoomsViewers", ids: obj.ids })
                devices = JSON.parse(obj.result);
                app.send({ api: "user", mt: "SelectRoomsAvailabilities", ids: obj.ids })
            })
            
        }
        //Retorna todas os devices de todas as salas solicitadas
        //if (obj.api === "user" && obj.mt === "SelectDevicesResult") {
        //    devices = JSON.parse(obj.result);
        //    app.send({ api: "user", mt: "SelectRoomsAvailabilities", ids: obj.ids })
        //}
        //Retorna todas as disponibilidades de todas as salas solicitadas
        if (obj.api === "user" && obj.mt === "SelectRoomsAvailabilitiesResult") {
            availabilities = JSON.parse(obj.result);
            app.send({ api: "user", mt: "SelectDevicesSchedule", ids: obj.ids })
        }
        //Retorna todos os agendamentos de todas as salas solicitadas
        if (obj.api === "user" && obj.mt === "SelectDevicesScheduleResult") {
            schedules = JSON.parse(obj.result);

            //Todos os dados carregados, vamos abrir a tela visual do App!!!!!!
            console.info("Todos os dados carregados, vamos abrir a tela visual do App!!!!!!");
            makeViewRoom(rooms, devices, availabilities, schedules, viewers, editors)
        }
        //Retorna todos os usuários visualizadores das salas solicitadas
        if (obj.api === "user" && obj.mt === "SelectRoomsViewersResult") {
            viewers = JSON.parse(obj.result);  
        }
        //Retorna todos os usuários editores das salas solicitadas
        if (obj.api === "user" && obj.mt === "SelectRoomsEditorsResult") {
            editors = JSON.parse(obj.result);
        }
        if(obj.api === "user" && obj.mt === "DeviceScheduleSuccess"){
            app.send({ api: "user", mt: "SelectMyRooms" })
        }
    } 
    function makeButton(text, variant, iconSVG) {
        const button = document.createElement("button");
        button.textContent = text;

        if (iconSVG) {
            const icon = document.createElement("img");
            icon.src = iconSVG;
            button.prepend(icon);
        }

        switch (variant) {
            case "primary":
                button.classList.add("bg-primary-600", "hover:bg-primary-500", "text-dark-100", "font-medium", "py-1", "px-2", "rounded","primary");
                break;
            case "secundary":
                button.classList.add("bg-dark-300", "hover:bg-dark-400", "text-primary-600", "font-bold", "py-1", "px-2", "rounded");
                break;
            case "destructive":
                button.classList.add("bg-red-500", "hover:bg-red-700", "text-primary-600", "font-bold", "py-1", "px-2", "rounded");
                break;
            case "transparent":
                button.classList.add("bg-transparent", "hover:bg-gray-100", "text-gray-700", "font-bold", "py-1", "px-2", "rounded");
                break;
            default:
                button.classList.add("hover:bg-dark-300", "rounded");
                break;
        }

        return button;
    }
     const backButton = makeButton('', '', './images/arrow-left.svg');

     function makeStatus(variant) {
        const outerCircle = document.createElement("div");
        outerCircle.classList.add("w-3", "h-3", "rounded-full", "flex", "items-center", "justify-center");

        const innerCircle = document.createElement("div");
        innerCircle.classList.add("w-2", "h-2", "rounded-full");

        outerCircle.appendChild(innerCircle);

        switch (variant) {
            case "red":
                outerCircle.classList.add("bg-red-300");
                innerCircle.classList.add("bg-red-500");
                break;
            case "green":
                outerCircle.classList.add("bg-green-300");
                innerCircle.classList.add("bg-green-500");
                break;
            case "blue":
                outerCircle.classList.add("bg-blue-300");
                innerCircle.classList.add("bg-blue-500");
                break;
            case "yellow":
                outerCircle.classList.add("bg-yellow-300");
                innerCircle.classList.add("bg-yellow-500");
                break;
            default:
                outerCircle.classList.add("bg-gray-300");
                innerCircle.classList.add("bg-gray-500");
                break;
        }

        return outerCircle;
    }

    function makeBadge(text, variant) {
        const badge = document.createElement("span");
        badge.textContent = text;
        badge.classList.add("inline-block", "py-1", "px-2", "rounded", "text-sm", "font-medium");

        switch (variant) {
            case "primary":
                badge.classList.add("bg-blue-500", "text-white");
                break;
            case "secundary":
                badge.classList.add("bg-gray-500", "text-white");
                break;
            case "success":
                badge.classList.add("bg-green-500", "text-white");
                break;
            case "danger":
                badge.classList.add("bg-red-500", "text-white");
                break;
            case "alert":
                badge.classList.add("bg-yellow-500", "text-black");
                break;
            default:
                badge.classList.add("bg-gray-500", "text-white");
                break;
        }

        return badge;
    }

    function makeHeader(imgLeft,imgRight,title){
        // construção do header
      
        const header = document.createElement("header")
        header.classList.add("bg-dark-200" ,"m-1" ,"flex", "items-center", "justify-between", "p-1", "rounded-lg")
     
        //construção da div com o titulo e imgHome
        const divTitle = document.createElement("div")
        divTitle.classList.add("flex","items-center","justify-start", "gap-1")
     
        //imgHome
        const leftElement = imgLeft
        leftElement.addEventListener("click", function (event) {
            makeViewRoom(rooms, devices, availabilities, schedules, viewers, editors)
        event.stopPropagation()
            event.preventDefault()
        })
     
        //titulo
        const titleRoom = document.createElement("h1")
        titleRoom.classList.add("text-white" ,"font-bold")
        titleRoom.textContent = title
     
        //imgMenu
        const rightElment = imgRight
        // imgMenu.setAttribute("src",imgRight)
     
        
           divTitle.appendChild(leftElement)
           divTitle.appendChild(titleRoom)
           header.appendChild(divTitle)
           header.appendChild(rightElment)
           document.body.appendChild(header);
     
     }
     
    function makeViewRoom(rooms, devices, availabilities, schedules, viewers, editors) {
        that.clear();
        makeHeader(makeButton("","","./images/home.svg"), makeButton('','',"./images/menu.svg"), texts.text("labelMyRooms"))
        // div container (scroll)
        const container = document.createElement("div")
        container.classList.add("overflow-auto","grid","gap-2","sm:grid-cols-2","md:grid-cols-4")
        container.style.height = 'calc(100vh - 70px)'
        container.setAttribute("id","container")
        document.body.appendChild(container);
        
        rooms.forEach(function(room){
            //div principal
            const divMain =  document.createElement("div")
            divMain.classList.add("rounded-lg","p-1","m-1","bg-dark-200","gap-2","flex-col","flex", "h-fit", "cursor-pointer")
            divMain.setAttribute("room",room.id)
            divMain.setAttribute("id", room.id)
            container.appendChild(divMain)
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

            var devicesInfo = devices.filter(function (dev) {
                return dev.room_id == room.id && dev.guid === null ;
            });

            const totalDevices = devices.length;
            const availableDevices = devicesInfo.length;
            const percentageAvailable = (availableDevices / totalDevices) * 100;
            console.log("PORCENTAGEM " , percentageAvailable)
            var statusDevice;
            if(percentageAvailable >= 30 && percentageAvailable <= 50 ){
              statusDevice = makeStatus("yellow")
            }
            else if(percentageAvailable >= 50){
              statusDevice = makeStatus("green")
            }
            else{
             statusDevice = makeStatus("red")
            }
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
            var avail = availabilities.filter(function (a) {
                return a.room_id == room.id
            });
            console.log("Availabilities: " + JSON.stringify(avail))
            // calendario recorrent e periodo
            makeViewCalendarInfo(divMain, avail)
            
            //componente avatar
            makeAvatar(viewers,divMain,room)

            //todas as divs com o atributo "room"
            const divsRoom = document.querySelectorAll('[room]');
            //listener de clique a cada div
            divsRoom.forEach(function (div) {
                div.addEventListener('click', function (event) {
                    var id = event.currentTarget.id;
                    var room = rooms.filter(function (room) {
                        return id == room.id
                    })[0];
                    var devs = devices.filter(function (dev) {
                        return id == dev.room_id
                    });
                    var avail = availabilities.filter(function (avl) {
                        return id == avl.room_id
                    });
                    var sched = schedules.filter(function (sched) {
                        return id == sched.device_room_id
                    });
                    var viws = viewers.filter(function (viws) {
                        return id == viws.room_id
                    });
                    event.stopPropagation();
                    makeViewRoomDetail(room, devs, avail, sched, viws)
                });
            });
        })   
    }
    function makeAvatar(viewers, divMain) {
        const divUsersAvatar = document.createElement("div");
        divUsersAvatar.classList.add("flex", "items-start", "gap-1");
        divUsersAvatar.setAttribute("id", "divUsersAvatar");
        console.log("ARRAY USERS:" + JSON.stringify(viewers));

        let processedUsersCount = 0;

        viewers.forEach(function (viewer) {
            if (processedUsersCount < 8) {
                var viewersUsers = list_tableUsers.filter(function (user) {
                    return user.guid == viewer.viewer_guid;
                });

                viewersUsers.slice(0, 6).forEach(function (view) {
                    let avatar = new innovaphone.Avatar(start, view.sip, userDomain);
                    let UIuserPicture = avatar.url(view.sip, 120, userDN);
                    const imgAvatar = document.createElement("img");
                    imgAvatar.setAttribute("src", UIuserPicture);
                    imgAvatar.setAttribute("id", "divAvatar");
                    imgAvatar.classList.add("w-5", "h-5", "rounded-full");
                    divUsersAvatar.appendChild(imgAvatar);
                    divMain.appendChild(divUsersAvatar);
                });
                // avatar com + 
                processedUsersCount += viewersUsers.length;
            }
        });
    }

    function makeViewCalendarInfo(divMain, availability) {
        availability.forEach(function (a) {
            if (a.type == "periodType") {

                // div disponibilidade periodo
                const divMainAvailabilityPeriod = document.createElement("div")
                divMainAvailabilityPeriod.classList.add("flex", "p-1", "items-center", "justify-between", "bg-dark-100", "rounded-lg")
                const imgCalendar = document.createElement("img")
                imgCalendar.setAttribute("src", "./images/calendar-days.svg")
                divMainAvailabilityPeriod.appendChild(imgCalendar)
                // div data
                const divDateP = document.createElement("div")
                divDateP.classList.add("flex", "items-center", "gap-1", "justify-center", "content-center")

                const dateStart = document.createElement("p")
                const formatedDataStart = moment(a.data_start).format("DD/MM");
                dateStart.textContent = formatedDataStart
                dateStart.classList.add("text-xl", "font-bold",)
                // texto até
                const dateAte = document.createElement("p")
                dateAte.textContent = texts.text("labelTo")
                dateAte.classList.add("text-sm", "font-regular", 'text-primary-600')
                // texto fim
                const dateEnd = document.createElement("p")
                const formatedDataEnd = moment(a.data_end).format("DD/MM");
                dateEnd.textContent = formatedDataEnd
                dateEnd.classList.add("text-xl", "font-bold",)

                divDateP.appendChild(dateStart)
                divDateP.appendChild(dateAte)
                divDateP.appendChild(dateEnd)
                divMainAvailabilityPeriod.appendChild(divDateP)
                divMain.appendChild(divMainAvailabilityPeriod)
            }

            if (a.type == "recurrentType") {
                // div disponibilidade recorrente
                const divMainAvailabilityRecurrent = document.createElement("div")
                divMainAvailabilityRecurrent.classList.add("flex", "p-1", "items-start", "bg-dark-100", "rounded-lg", "justify-center","gap-1")
                // dias da semana 
                var week = ["labelSun", "labelMon", "labelTerc", "labelQuar", "labelQuint", "labelSex", "labelSab"];

                const daysOfWeekMap = {
                    "labelSun": "domingo",
                    "labelMon": "segunda-feira",
                    "labelTerc": "terça-feira",
                    "labelQuar": "quarta-feira",
                    "labelQuint": "quinta-feira",
                    "labelSex": "sexta-feira",
                    "labelSab": "sabado"
                };
                week.forEach(function (w) {
                    const dayDiv = document.createElement('div')
                    dayDiv.classList.add("flex", "w-[40px]", "h-[40px]", "p-1", "flex-col", "items-center", "justify-center", "gap-1","rounded-full","recurrentText",`room-${a.room_id}`)
                    dayDiv.setAttribute("day-week", daysOfWeekMap[w])
                    const dayText = document.createElement('p')
                    dayText.classList.add("font-Montserrat", "text-base", "font-bold", "leading-normal", 'leading-normal', "color-dark-400",)
                    dayText.textContent = texts.text(`${w}`)
                    dayDiv.appendChild(dayText)
                    divMainAvailabilityRecurrent.appendChild(dayDiv)
                })
                divMain.appendChild(divMainAvailabilityRecurrent)
                // UpdateAvailability(availability, a.type)
            }
             UpdateAvailability(availability, a.type)
        })
       

    }
    function makeViewRoomDetail(room, devices, availability, schedules, viewers) {
        that.clear();
        makeHeader(backButton, makeButton("", "", "./images/menu.svg"), room.name)
        // div container
        const container = document.createElement("div")
        container.classList.add("overflow-auto", "gap-2", "grid", "sm:grid-cols-2", "md:grid-cols-4", "m-1")
        container.style.height = 'calc(100vh - 70px)'
        container.setAttribute("id", "container")
        document.body.appendChild(container);
        // div sala
        const divImg = document.createElement("div")
        divImg.classList.add("aspect-[3/4]", "bg-center", "bg-cover", "bg-no-repeat", "rounded-lg", "divSala")
        divImg.setAttribute("style", `background-image: url(${room.img});`);
        container.appendChild(divImg);

        //card horarios implementado pelo Pietro
        const divHorario = document.createElement("div")
        divHorario.classList.add("divHorario")
        container.appendChild(divHorario)
        makeViewCalendarDetail(divHorario, availability)




        // div container (scroll)
        const div102 = document.createElement("div")
        div102.classList.add("div102", "h-fit")
        /*div102.style.height = 'calc(100vh - 70px)'*/
        div102.setAttribute("id", "div102")
        container.appendChild(div102);



        devices.forEach(function (device) {
            var sched = schedules.filter(function (sched) {
                return device.id == sched.device_id
            });
            var viewer = viewers.filter(function (v) {
                return v.viewer_guid == device.guid && v.room_id == room.id
            });
            makeDeviceIcon(divImg, device, viewer)
            makeViewDevice(div102, device, availability, sched, viewer)
        })



    }
    // calendario 
    function makeCalendar(divMain, deviceHw,roomId, funcao2){
        divMain.innerHTML = "";
        //makeHeader(backButton, makeButton("Salvar","primary"), texts.text("labelSchedule"))
        // div principal
        const divCalendar = document.createElement("div")
        divCalendar.classList.add("flex","p-1","flex-col", "items-start", "gap-2","self-stretch","rounded-lg","bg-dark-200", "m-1")
        const divTextSelectDay = document.createElement("div")
        divTextSelectDay.classList.add("color-white","font-Montserrat","text-2","not-italic","font-bold")
        divTextSelectDay.textContent = texts.text("labelSelectYourDay")
        
        divCalendar.appendChild(divTextSelectDay)
        var availability = availabilities.filter(function (a) {
            return a.room_id == roomId
        })
        var sched = schedules.filter(function (s) {
            return s.room_id == roomId && s.device_id == deviceHw
        })

        var selectedDay; 
        Calendar.createCalendar(divCalendar,availability,function (day) {
            selectedDay = day
            console.log("SelectedDay " + day)
            funcao2(selectedDay)
        }); // componente Calendar 
        divMain.appendChild(divCalendar);
        
    }
    function makeViewCalendarDetail(divMain, availability) {
        // div label horario
        const div160 = document.createElement("div")
        div160.classList.add("div160")
        divMain.appendChild(div160)

        const divHourCard = document.createElement("div")
        divHourCard.classList.add("divHourCard")
        divHourCard.innerHTML = texts.text("divHourCard")
        div160.appendChild(divHourCard)

        availability.forEach(function (a) {
            if (a.type == "periodType") {
                var divPeriod = document.createElement("div")
                const startDate = moment(a.data_start);
                const endDate = moment(a.data_end);

                const formattedStartDate = startDate.format("MM/DD");
                const formattedEndDate = endDate.format("MM/DD");
                divPeriod.innerHTML = formattedStartDate + " - " + formattedEndDate
                div160.appendChild(divPeriod)
            }

            // if (a.type == "recurrentType") {
            //     var divRecurrent = document.createElement("div")
            //     divRecurrent.classList.add("flex","items-center","gap-1")
            //     divRecurrent.innerHTML = 
            //     div160.appendChild(divRecurrent)
            // }

        // img expandir
        const divOpenTime = document.createElement("div")
        divOpenTime.classList.add("aspect-[16/9]", "w-[17px]", "h-[17px]", "bg-center", "bg-cover", "bg-no-repeat", "rounded-lg")
        divOpenTime.setAttribute("style", `background-image: url(./images/chevron-down.svg);`);
        divOpenTime.setAttribute("id", "divOpenTime")
        div160.appendChild(divOpenTime)
        divOpenTime.addEventListener("click", function (event) {
            event.stopPropagation()
            var divAvailabilyDetail = document.getElementById("divAvailabilyDetail")
            var divOpenTime = document.getElementById("divOpenTime")
            if (divAvailabilyDetail) {
                divOpenTime.setAttribute("style", `background-image: url(./images/chevron-down.svg);`);
                divMain.removeChild(divAvailabilyDetail)

            } else {
                divOpenTime.setAttribute("style", `background-image: url(./images/chevron-up.svg);`);
                var divAvailabilyDetail = document.createElement("div")
                divAvailabilyDetail.setAttribute("id", "divAvailabilyDetail")
                divAvailabilyDetail.classList.add("divAvailabilyDetail")
                divMain.appendChild(divAvailabilyDetail)

                
                    if (a.type == "periodType") {
                        makeViewTimePeriod(divAvailabilyDetail, a)
                    }

                    if (a.type == "recurrentType") {
                        makeViewTimeRecurrent(divAvailabilyDetail, a)
                    }

                    UpdateAvailability(availability, a.type)     
            }
        })
    })

    }
    //Função apara apresentar os horários para agendamento por período
    function makeViewTimeHour(divMain, availability, callback) {
        divMain.innerHTML = "";

        const frame108 = document.createElement("div")
        frame108.setAttribute("id", "frame108")
        frame108.classList.add("frame107", "h-fit")
        divMain.appendChild(frame108)

        const frame108txt = document.createElement("div")
        frame108txt.classList.add("frame107txt")
        frame108txt.innerHTML = texts.text("labelSelectHour")
        frame108.appendChild(frame108txt)


        const div106 = document.createElement("div")
        div106.classList.add("div106", "h-fit")
        div106.setAttribute("id", "div106")
        divMain.appendChild(div106);

        const textHour = document.createElement("div")
        textHour.classList.add("textHour")
        textHour.setAttribute("id", "textHour")
        textHour.innerHTML = texts.text("labelSelectHour")
        div106.appendChild(textHour)
        console.log("Agendamentos Erick", JSON.stringify(availability))
        // Garantir que divStartTime e divEndTime sejam strings
        const startTimeString = availability[0].data_start;
        const endTimeString = availability[0].data_end;

        var now = Date();
        var endHour;
        if (moment(availability[0].data_end).format("DD/MM") == moment(now).format("DD/MM")) {
            endHour = parseInt(endTimeString.split("T")[1].split(":")[0]);
        } else {
            endHour = 23;
        }
        console.log("startTimeString Erick", startTimeString)
        console.log("endTimeString Erick", endTimeString)
        // Extrair apenas as horas dos valores de data e hora recebidos
        const startHour = parseInt(startTimeString.split("T")[1].split(":")[0]);

        var hours = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "00",]


        // Filtrar as horas dentro do intervalo desejado
        const hoursInRange = hours.filter(h => {
            const hour = parseInt(h);
            return hour >= startHour && hour <= endHour;
        });

        // Criar as divs somente para as horas no intervalo desejado
        hoursInRange.forEach(function (h) {
            console.log("Hora forEach:", h);
            const divHour = document.createElement("div");
            divHour.classList.add("divHour");
            divHour.setAttribute("hour", h);
            divHour.setAttribute("id", h);
            divHour.innerHTML = h + ":00";
            div106.appendChild(divHour);
        });
        //todas as divs com o atributo "room"
        const divsHours = document.querySelectorAll('[hour]');
        //listener de clique a cada div
        divsHours.forEach(function (div) {
            div.addEventListener('click', function (event) {
                var hour = event.currentTarget.id;
                console.log("Hora clicada a tratar ", hour)
            });
        });
    }
    function makeViewTimePeriod(divMain, availability) {
        //dias
        var div180 = document.createElement("div")
        div180.setAttribute("id", "div180")
        div180.classList.add("div180Period")
        divMain.appendChild(div180)

        //Start Date and time
        const divDateStart = document.createElement("div")
        divDateStart.setAttribute("id", "divDateStart")
        divDateStart.classList.add("divDate")
        //linha 1
        var div179S = document.createElement("div")
        div179S.setAttribute("id", "div179s")
        div179S.classList.add("div179")
        divDateStart.appendChild(div179S)

        //DD/MM
        const divStartDay = document.createElement("div")
        divStartDay.setAttribute("id", "divStartDay")
        divStartDay.classList.add("divDay")
        divStartDay.innerHTML = moment(availability.data_start).format("DD/MM");
        div179S.appendChild(divStartDay)
        //HH:mm
        const divStartTime = document.createElement("div")
        divStartTime.setAttribute("id", "divStartTime")
        divStartTime.classList.add("divStartTime")
        divStartTime.innerHTML = moment(availability.data_start).format("HH:mm");
        div179S.appendChild(divStartTime)
        //dia-semana
        const divStartISODay = document.createElement("div")
        divStartISODay.setAttribute("id", "divStartISODay")
        divStartISODay.classList.add("divISODay")
        divStartISODay.innerHTML = moment(availability.data_start).format("dddd");
        divDateStart.appendChild(divStartISODay)
        //apende div
        div180.appendChild(divDateStart)



        //div to
        const divToTime = document.createElement("div")
        divToTime.setAttribute("id", "divToTime")
        divToTime.classList.add("divToTime")
        divToTime.innerHTML = texts.text("labelTo")
        div180.appendChild(divToTime)
        //



        //End Date and time
        const divDateEnd = document.createElement("div")
        divDateEnd.setAttribute("id", "divDateEnd")
        divDateEnd.classList.add("divDate")
        //linha 1
        var div179E = document.createElement("div")
        div179E.setAttribute("id", "div179e")
        div179E.classList.add("div179")
        divDateEnd.appendChild(div179E)
        //DD/MM
        const divEndDay = document.createElement("div")
        divEndDay.setAttribute("id", "divEndDay")
        divEndDay.classList.add("divDay")
        divEndDay.innerHTML = moment(availability.data_end).format("DD/MM");

        div179E.appendChild(divEndDay)
        //HH:mm
        const divEndTime = document.createElement("div")
        divEndTime.setAttribute("id", "divEndTime")
        divEndTime.classList.add("divTime")
        divEndTime.innerHTML = moment(availability.data_end).format("HH:mm");
        div179E.appendChild(divEndTime)
        //dia-semana   
        const divEndISODay = document.createElement("div")
        divEndISODay.setAttribute("id", "divEndISODay")
        divEndISODay.classList.add("divISODay")
        divEndISODay.innerHTML = moment(availability.data_end).format("dddd");
        divDateEnd.appendChild(divEndISODay)

        div180.appendChild(divDateEnd)

    }
    function makeViewTimeRecurrent(divMain, a) {
        // div disponibilidade recorrente
        const divMainAvailabilityRecurrent = document.createElement("div")
        divMainAvailabilityRecurrent.classList.add("self-stretch", "flex", "p-1", "items-start", "bg-dark-100", "rounded-lg", "justify-center","gap-1")
        // dias da semana 
        var week = ["labelSun", "labelMon", "labelTerc", "labelQuar", "labelQuint", "labelSex", "labelSab"];

        const daysOfWeekMap = {
            "labelSun": "domingo",
            "labelMon": "segunda-feira",
            "labelTerc": "terça-feira",
            "labelQuar": "quarta-feira",
            "labelQuint": "quinta-feira",
            "labelSex": "sexta-feira",
            "labelSab": "sabado"
        };
        week.forEach(function (w) {
            const dayDiv = document.createElement('div')
            dayDiv.classList.add("flex", "w-[40px]", "h-[40px]", "p-1", "flex-col", "items-center", "justify-center", "gap-1", `room-${a.room_id}`,"rounded-full")
            const dayText = document.createElement('p')
            dayText.classList.add("font-Montserrat", "text-base", "font-bold", "leading-normal", 'leading-normal', "color-dark-400")
            dayText.textContent = texts.text(`${w}`)
            dayDiv.setAttribute("day-week", daysOfWeekMap[w])
            dayDiv.appendChild(dayText)
            divMainAvailabilityRecurrent.appendChild(dayDiv)


            dayDiv.addEventListener("click",function(ev){
                switch (dayDiv.getAttribute("day-week")) {
                    case "segunda-feira":
                        makeViewDay(divMain, "labelMondayDiv", a.timestart_monday, a.timeend_monday)
                    break;
                    case "terça-feira":
                        makeViewDay(divMain, "labeltuesdayDiv", a.timestart_tuesday, a.timeend_tuesday)
                    break;
                    case "quarta-feira":
                        makeViewDay(divMain, "labelwednesdayDiv", a.timestart_wednesday, a.timeend_wednesday)
                    break;
                    case "quinta-feira":
                        makeViewDay(divMain, "labelthursdayDiv", a.timestart_thursday, a.timeend_thursday)
                    break;
                    case "sexta-feira":
                        makeViewDay(divMain, "labelfridayDiv", a.timestart_friday, a.timeend_friday)
                    break;
                    case "sabado":
                        makeViewDay(divMain, "labelsaturdayDiv", a.timestart_saturday, a.timeend_saturday)
                    break;
                    case "domingo":
                        makeViewDay(divMain, "labelsundayDiv", a.timestart_sunday, a.timeend_sunday)
                    break;
                        
                }
            })

        })

        var div180 = document.createElement("div")
        div180.setAttribute("id", "div180")
        div180.classList.add("div180")
        div180.style.display = 'none'
        divMain.appendChild(divMainAvailabilityRecurrent)
        divMain.appendChild(div180)

        function makeViewDay(divMain, day, timestart, timeend) {
            //dias
            var div180 = document.getElementById("div180")
            div180.innerHTML = '';
            div180.style.display = 'block'

            var divDayLabel = document.createElement("div")
            divDayLabel.setAttribute("id", "div180")
            divDayLabel.classList.add("divDayLabel")
            divDayLabel.innerHTML = texts.text(day)
            div180.appendChild(divDayLabel)

            //div182
            var div182 = document.createElement("div")
            div182.setAttribute("id", "div182")
            div182.classList.add("div182")
            div180.appendChild(div182)

            //time start
            var divTimeStart = document.createElement("div")
            divTimeStart.setAttribute("id", "divTimeStart")
            divTimeStart.classList.add("divDate")
            div182.appendChild(divTimeStart)
            divTimeStart.innerHTML = timestart

            //div to
            const divToTime = document.createElement("div")
            divToTime.setAttribute("id", "divToTime")
            divToTime.classList.add("divToTime")
            divToTime.innerHTML = texts.text("labelTo")
            div182.appendChild(divToTime)

            //time end
            var divTimeEnd = document.createElement("div")
            divTimeEnd.setAttribute("id", "divTimeEnd")
            divTimeEnd.classList.add("divDate")
            div182.appendChild(divTimeEnd)
            divTimeEnd.innerHTML = timeend


        }

    }

    function makeViewDevice(divMain, device, availability, schedule, viewer) {
        //div 101
        const div101 = document.createElement("div")
        div101.classList.add("div101")
        div101.setAttribute("id", device.id)
        //div retangle 1396
        var state = device.guid ? "device-busy" : "device-free";
        const div1396 = document.createElement("div")
        div1396.classList.add("div1396", state)
        div1396.setAttribute("id", device.hwid)
        div101.appendChild(div1396)

        var room = rooms.filter(function (room) {
            return device.room_id == room.id
        })[0];

        //div 84
        const div84 = document.createElement("div")
        div84.classList.add("div84")


        //div avatar
        if (viewer.length > 0) {
            //const divUsersAvatar = document.createElement("div")
            //divUsersAvatar.classList.add("rounded-lg", "p-1", "m-1", "bg-dark-200", "gap-2", "flex-col", "flex")
            //divUsersAvatar.setAttribute("id", user.guid)
            //img user
            //avatar = new innovaphone.Avatar(start, user.sip, userDomain);
            //UIuserPicture = avatar.url(user.sip, 15, userDN);
            //const imgAvatar = document.createElement("img")
            //imgAvatar.setAttribute("src", UIuserPicture);
            //imgAvatar.setAttribute("id", user.guid)
            //imgAvatar.classList.add("w-5", "h-5", "rounded-full")
            ////divUsersAvatar.appendChild(imgAvatar)
            //div84.appendChild(imgAvatar)
            makeAvatar(viewer, div84)
            var user = list_tableUsers.filter(function (u) {
                return u.guid == viewer[0].viewer_guid
            })[0];
            //div 100
            const div100 = document.createElement("div")
            div100.classList.add("div100")
            div100.innerHTML = user.cn
            div84.appendChild(div100)

            if (user.sip == userSIP) {
                //div 36
                const div36 = makeButton(texts.text("deletePhoneUseButton"), "secundary")
                div36.setAttribute("id", device.hwid)
                div36.addEventListener("click", function (event) {
                    var dev = event.currentTarget.id;
                    event.stopPropagation()
                    app.sendSrc({ api: "user", mt: "DeleteDeviceToUser", deviceId: dev, src: dev }, function (obj) {
                        app.sendSrc({ api: "user", mt: "SelectDevices", ids: rooms, src: obj.src }, function (obj) {
                            devices = JSON.parse(obj.result)
                            var devs = devices.filter(function (dev) {
                                return dev.room_id == room.id
                            })
                            makeViewRoomDetail(room, devs, availability, schedules, viewers)
                        })
                    })
                })
                div84.appendChild(div36)
            }

        }
        else {
            //div 36
            const div36 = makeButton(texts.text("makePhoneUseButton"), "secundary")
            div36.setAttribute("id", device.hwid)
            div36.innerHTML = texts.text("makePhoneUseButton")
            div36.addEventListener("click", function (event) {
                var dev = event.currentTarget.id;
                event.stopPropagation()
                app.sendSrc({ api: "user", mt: "SetDeviceToUser", deviceId: dev, src: dev }, function (obj) {
                    app.sendSrc({ api: "user", mt: "SelectDevices", ids: rooms, src: obj.src }, function (obj) {
                        devices = JSON.parse(obj.result)
                        var devs = devices.filter(function (d) {
                            return d.room_id == room.id
                        })
                        makeViewRoomDetail(room, devs, availability, schedules, viewers)
                    })
                })
            })

            div84.appendChild(div36)
        }
        //div 34
        const div34 = makeButton(texts.text("makePhoneSceduleButton"), "primary")
        //div34.classList.add("div34")
        div34.setAttribute("id", device.hwid)
        //div34.innerHTML = texts.text("makePhoneSceduleButton")
        div34.addEventListener("click", function (event) {
            var deviceHw = event.currentTarget.id;
            makeScheduleContainer(deviceHw, room.id)
            //makeScheduleContainer(availability, schedule, )
            // Calendar.createCalendar()
            // var devInfo = schedules.filter(function (sched) {
            //     return device.hwid == sched.device_id
            // });
            // console.log("DISPONIBILIDADE DA SALA " + JSON.stringify(availability) + "Schedules " + JSON.stringify(schedule) +
            // "Device INFO " + JSON.stringify(devInfo)  + "Full devices " + JSON.stringify(device))

        })
        div84.appendChild(div34)
        div101.appendChild(div84)

        //div 82
        const div82 = document.createElement("div")
        div82.classList.add("div82")
        var deviceIcon = document.createElement("img")
        deviceIcon.classList.add("deviceIcon")
        deviceIcon.setAttribute("src", "./images/" + device.product + ".png")
        div101.appendChild(div82)
        div82.appendChild(deviceIcon)

        divMain.appendChild(div101)

    }
    function makeDeviceIcon(divMain, device, viewer) {
        //div 93
        const div93 = document.createElement("div")
        div93.classList.add("div93")
        div93.setAttribute("id", device.id)
        div93.style.top = device.topoffset
        div93.style.left = device.leftoffset
        //div retangle 1396
        var state = device.guid ? "device-busy" : "device-free";
        const div1396 = document.createElement("div")
        div1396.classList.add("div1396", state)
        div1396.setAttribute("id", device.hwid)
        div93.appendChild(div1396)
        //div 82
        const div82 = document.createElement("div")
        div82.classList.add("div82")
        var deviceIcon = document.createElement("img")
        deviceIcon.classList.add("deviceIcon")
        deviceIcon.setAttribute("src", "./images/" + device.product + ".png")
        div93.appendChild(div82)
        div82.appendChild(deviceIcon)

        //div avatar
        if (viewer.length > 0) {

            makeAvatar(viewer, div93)
            ////img user
            //avatar = new innovaphone.Avatar(start, user.sip, userDomain);
            //UIuserPicture = avatar.url(user.sip, 15, userDN);
            //const divUsersAvatar = document.createElement("div")
            //divUsersAvatar.classList.add("rounded-lg", "p-1", "m-1", "bg-dark-200", "gap-2", "flex-col", "flex")
            //divUsersAvatar.setAttribute("id", user.guid)
            //divUsersAvatar.setAttribute("src", UIuserPicture)
            ////img user
            //avatar = new innovaphone.Avatar(start, user.sip, userDomain);
            //UIuserPicture = avatar.url(user.sip, 15, userDN);
            //const imgAvatar = document.createElement("img")
            //imgAvatar.setAttribute("src", UIuserPicture);
            //imgAvatar.setAttribute("id", "divAvatar")
            //imgAvatar.classList.add("w-5", "h-5", "rounded-full")
            //divUsersAvatar.appendChild(imgAvatar)
            //div93.appendChild(imgAvatar)
        }
        divMain.appendChild(div93)
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

    //Função para criar a tela de seleção para o agendamento
    //chamar no click da div34
    function makeScheduleContainer(deviceHw, roomId, scheduleId) {
        console.log("MAKESCHEDULECONTAINER")
        that.clear();
        makeHeader(backButton, makeButton(texts.text("save"), "primary", ""), texts.text("labelSchedule"))
        //makeHeader("./images/arrow-left.svg", "Botão Salvar aqui", texts.text("labelSchedule"))
        const containerSchedule = document.createElement("div")
        containerSchedule.setAttribute("id", "containerSchedule")
        document.body.appendChild(containerSchedule)

        if (!scheduleId) {
            //Seleção calendário
            const div104 = document.createElement("div")
            div104.setAttribute("id", "div104")
            div104.classList.add("div104", "h-fit")
            containerSchedule.appendChild(div104)

            const frame107 = document.createElement("div")
            frame107.setAttribute("id", "frame107")
            frame107.classList.add("frame107", "h-fit")
            div104.appendChild(frame107)

            const frame107txt = document.createElement("div")
            frame107txt.classList.add("frame107txt")
            frame107txt.innerHTML = texts.text("labelSelectYourDay")
            frame107.appendChild(frame107txt)

            const frame107btn = makeButton(texts.text("labelSelect"),"primary")
            frame107.appendChild(frame107btn)
            var selected
            frame107btn.addEventListener("click", function (event) {
                makeCalendar(div104, deviceHw, roomId, function (selectedDay) {
                    selected = selectedDay;
                    if (!document.getElementById("frame104btn")) {
                        const frame104btn = makeButton(texts.text("labelConfirm"), "primary")
                        div104.appendChild(frame104btn)
                        frame104btn.setAttribute("id", "frame104btn")
                        frame104btn.addEventListener("click", function (event) {
                            console.log("Dia selecionado retornado makeScheduleContainer ", selected)
                            //
                            //continuar aqui com a reconstrução da div104 com o dia selecionado e botão editar...
                            //
                        })
                    } 
                    
                })
                
                
            })

            //Seleção horário
            const div105 = document.createElement("div")
            div105.setAttribute("id", "div105")
            div105.classList.add("div104", "h-fit")
            containerSchedule.appendChild(div105)

            const frame108 = document.createElement("div")
            frame108.setAttribute("id", "frame108")
            frame108.classList.add("frame107", "h-fit")
            div105.appendChild(frame108)

            const frame108txt = document.createElement("div")
            frame108txt.classList.add("frame107txt")
            frame108txt.innerHTML = texts.text("labelSelectHour")
            frame108.appendChild(frame108txt)

            const frame108btn = makeButton(texts.text("labelSelect"), "primary")
            frame108.appendChild(frame108btn)
            frame108btn.addEventListener("click", function (event) {
                makeViewTimeHour(div105, availabilities, function (selected) {
                    console.log("Hora selecionado retornado makeScheduleContainer ", selected)
                            //
                            //continuar aqui com a reconstrução da div105 com a hora selecionado e botão editar...
                            //
                })
            })

        } else {
            //Seleção calendário
            const div104 = document.createElement("div")
            div104.setAttribute("id", "div104")
            div104.classList.add("div104", "h-fit")
            containerSchedule.appendChild(div104)

            const frame107 = document.createElement("div")
            frame107.setAttribute("id", "frame107")
            frame107.classList.add("frame107", "h-fit")
            div104.appendChild(frame107)

            const frame107txt = document.createElement("div")
            frame107txt.classList.add("frame107txt")
            frame107txt.innerHTML = texts.text("labelSelectYourDay")
            frame107.appendChild(frame107txt)

            const frame107btn = document.createElement("div")
            frame107btn.classList.add("framebtn", "h-fit")
            frame107btn.innerHTML = texts.text("labelSelect")
            frame107.appendChild(frame107btn)
            frame107btn.addEventListener("click", function (event) {
                makeCalendar(availability, schedules)
            })

        }
        const div106 = document.createElement("div")
        div106.setAttribute("id", "div106")
        div106.classList.add("div104", "h-fit")
        containerSchedule.appendChild(div106)

        const frame109 = document.createElement("div")
        frame109.setAttribute("id", "frame109")
        frame109.classList.add("frame107", "h-fit")
        div106.appendChild(frame109)

        const frame19txt = document.createElement("div")
        frame19txt.classList.add("frame107txt")
        frame19txt.innerHTML = texts.text("labelTxtCancel")
        frame109.appendChild(frame19txt)

          //botão cancelar
          const frame109btn = makeButton(texts.text("labelBtnCancel"), "destructive", "")
          frame109btn.addEventListener("click", function (event) {
              var obj = { mt: "UpdateSchedule", api: "user", id: scheduleId }
              makeCancelPopUp(obj, function (msg) {
                  makeSuccessPopUp(msg)
              })
          })

          frame109.appendChild(frame109btn)
        

    }
    function makeSuccessPopUp(msg) {
        console.log(JSON.stringify(msg))
    }
    function makeCancelPopUp(obj, callback) { 
        var insideDiv = document.createElement("div")
        insideDiv.classList.add("absolute", "w-full", "h-full", "justify-center", "items-center", "top-0", "left-0", "flex", "z-1000", "bg-blue-500", "bg-opacity-40")
        const divMain = document.createElement("div")
        divMain.classList.add("inline-flex", "p-3", "flex-col", "items-center", "gap-1", "rounded-lg", "bg-dark-100", "m-1")
        const titlePopUp = document.createElement("div") // aplicar tipografia 
        titlePopUp.textContent = texts.text("labelYouSure")
        const textCancel = document.createElement("div")
        textCancel.classList.add("text-center")
        textCancel.textContent = texts.text("labelCancelSchedule")
        const divButtons = document.createElement("div")
        divButtons.classList.add("flex", "p-2", "flex-col", "items-center", "gap-2", "items-stretch")
        const buttonCancel = makeButton(texts.text("labelYesCancel"), "primary", "");
        buttonCancel.addEventListener("click", function (event) {
            app.sendSrc(obj,callback(msg))
        })
        const buttonNoCancel = makeButton(texts.text("labelNo"), "secundary", "");

        divButtons.appendChild(buttonCancel)
        divButtons.appendChild(buttonNoCancel)
        divMain.appendChild(titlePopUp)
        divMain.appendChild(textCancel)
        divMain.appendChild(divButtons)
        insideDiv.appendChild(divMain)
        document.body.appendChild(insideDiv)


    }}
Wecom.coolwork.prototype = innovaphone.ui1.nodePrototype;