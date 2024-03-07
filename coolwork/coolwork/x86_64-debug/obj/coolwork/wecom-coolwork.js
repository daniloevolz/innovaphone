
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
    var schedules = [];
    var selectedDay; // dia do calendario
    var selected // call back 

    var mySchedules; // apenas para localizar meus agendamentos
    var myUserGuid; // localizar meu usuario pela tableUsers

    var rooms = [];
    var devices = [];
    var availabilities = [];
    var viewers = [];
    var editors = [];
    var phones =[];

    var colorSchemes = {
        dark: {
            "--bg": "#0B2E46",
            "--button": "#AED4EF",
            "--text-standard": "#ffffff",
        },
        light: {
            "--bg": "#0B2E46",
            "--button": "#AED4EF",
            "--text-standard": "#ffffff",
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
    //#region Funções de msg WebSocket
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
            phones = obj.msg.phones;
            console.log("WECOM-LOG:devicesApi_onmessage:GetPhonesResult " + JSON.stringify(phones));

            app.send({ api: "user", mt: "PhoneList", devices: phones })
        }
        if (obj.msg.mt == "GetProvisioningCodeResult") {
            var code = obj.msg.code;
            var now = new Date()
            var validUntil = now.setMinutes(now.getMinutes() + 10)
            console.log("devicesApi_onmessage:GetProvisioningCodeResult " + JSON.stringify(code));

            var btnPopUp = makePopUp(texts.text("provisioningCodeTitle"), texts.text("provisioningCodeMsg") + formatDate(validUntil), code, texts.text("labelOk"))
            btnPopUp.addEventListener("click", function (event) {
                event.stopPropagation()
                event.preventDefault()
                // Crie um elemento <textarea> temporário
                var textareaTemporario = document.createElement("textarea");
                textareaTemporario.value = code;

                // Adicione o elemento <textarea> ao corpo do documento
                document.body.appendChild(textareaTemporario);

                // Selecione o texto dentro do elemento <textarea>
                textareaTemporario.select();

                // Copie o texto para a área de transferência
                document.execCommand("copy");

                // Remova o elemento <textarea> temporário
                document.body.removeChild(textareaTemporario);

                // O valor foi copiado para a área de transferência
                console.log("Valor copiado para a área de transferência:", code);
            })
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
            console.log("ERICK TESTE MADRUGADA", availabilities)
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
        // if(obj.api === "user" && obj.mt === "DeviceScheduleSuccess"){
        //     app.send({ api: "user", mt: "SelectMyRooms" })

        //     // setTimeout(function(){
        //     //     makePopUp(texts.text("labelWarning"), texts.text("labelScheduleDone"), texts.text("labelOk"))
        //     // },1000)

        // }
    } 
    //#endregion
    // var mySchedules = schedules.filter(function(s){
    //     return s.user_guid == myUser.guid
    // })
    //#region Funções de Componentização

    
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
                case "tertiary":
                    button.classList.add("border-2","border-dark-400", "hover:bg-dark-500", "text-dark-400", "font-bold", "py-1", "px-2", "rounded-lg");
                    break
                case "destructive":
                    button.classList.add("bg-red-500", "hover:bg-red-700", "text-primary-600", "font-bold", "py-1", "px-2", "rounded");
                    break;
                case "transparent":
                    button.classList.add("bg-transparent", "hover:bg-gray-100", "text-gray-700", "font-bold", "py-1", "px-2", "rounded");
                    break;
                case "ghost":
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
            //leftElement.addEventListener("click", function (event) {
            //    makeViewRoom(rooms, devices, availabilities, schedules, viewers, editors)
            //    // app.send({ api: "user", mt: "SelectMyRooms" })
            //    event.stopPropagation()
            //    event.preventDefault()
            //})
         
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
        //#endregion

    //#region Funções Internas
    function getDefaultDayWithAvailability(week, a) {
        for (let day of week) {
            if (a[`timestart_${day.toLowerCase()}`] && a[`timeend_${day.toLowerCase()}`]) {
                return day;
            }
        }
        return null;
    }
//função para diminuir a string
function truncateString(str, maxLength) {
    if (str.length > maxLength) {
        return str.substring(0, maxLength) + "...";
    } else {
        return str;
    }
}
// Agora, devices contém os phones com os parâmetros necessários
function addPhonesToDevices() {
    phones.forEach(function(phone) {
      // Procura o índice do item em devices pelo hwId
      var index = devices.findIndex(function(device) {
        return device.hwid === phone.hwId;
      });
  
      // Se encontrou, atualiza o name; caso contrário, adiciona um novo item
      if (index !== -1) {
        devices[index].name = phone.name;
      }
    });
    console.log("Erick Devices",devices);
}
function truncateString(str, maxLength) {
    if (str.length > maxLength) {
        return str.substring(0, maxLength) + "...";
    } else {
        return str;
    }
}
function filterSchedule(){

    const mainFilter = document.createElement("div")
    mainFilter.classList.add("flex", "bg-dark-200",'items-center',"m-1", 'justify-between', 'p-1','margin-1', 'rounded-lg',"margin-1","self-stretch", "gap-1")
    mainFilter.setAttribute("id","divMainFilter")
    
    document.body.appendChild(mainFilter)
    const searchContain= document.createElement("div")
    searchContain.classList.add("relative", "w-full")
    
    const inputShare = document.createElement("input")
    inputShare.classList.add('p-1', 'w-full', "border", "rounded-md","font-Montserrat","text-2","not-italic","font-bold","text-black");
    inputShare.id = "inputShare";
    inputShare.placeholder = 'Pesquisar sala';
    inputShare.setAttribute('type','text');
    const iconShare = makeButton('', "", "./images/search.svg")
    iconShare.classList.add("absolute", "top-1/2", "right-4", "transform", "-translate-y-1/2", "bg-none", "border-none", "cursor-pointer", "outline-none")
    iconShare.setAttribute("id","iconShare")
    const ishare = document.createElement("i")
    ishare.classList.add("fas", "fa-search")
    
    const btnDiv = document.createElement("div")
    btnDiv.classList.add('justify-end', 'flex', 'items-center', 'gap-3', 'w-[300px]')
    btnDiv.id = "btnDiv"

    var btnDate = makeButton(texts.text("labelDate"), "primary",'')
    var btnAll = makeButton(texts.text("labelAll"), "secundary",'')
    btnAll.id = "btnAll"
    var btnTrash = makeButton('', "", "./images/trash-2.svg")
    
    inputShare.appendChild(ishare)
    searchContain.appendChild(inputShare)
    searchContain.appendChild(iconShare)
    mainFilter.appendChild(searchContain)
    btnDiv.appendChild(btnDate)
    btnDiv.appendChild(btnAll)
    btnDiv.appendChild(btnTrash)
    mainFilter.appendChild(btnDiv)
    
    btnDate.addEventListener('click', function(event){

        makeCalendar(mySchedules,"viewSchedule",mainFilter, null, null, function (day) {
            selected = day
            var filtred = mySchedules.filter(function(s){
                // Extract the date part from s.data_start
                var sDate = s.data_start.split('T')[0];
                
                return String(sDate) == String(selected);
            });
            console.log("filteredDate - Pietro", filtred)
            makeUserSchedules(filtred)
        },"update","UpdateSchedule")
        
    })


    inputShare.addEventListener("keydown", handleEnterKey);

    function handleEnterKey(event) {
        if (event.key === "Enter") {
            const searchTerm = inputShare.value.toLowerCase();
    
            const filteredRooms = rooms.filter(function (r) {
                const roomName = r.name.toLowerCase();
                return roomName.includes(searchTerm);
            });
            const filteredSchedules = mySchedules.filter(function (s) {
                // Verifica se o 'room_id' está incluído nos IDs dos quartos filtrados
                return filteredRooms.id === s.room_id;
            });
        
            console.log("ERICK filtro de Room", filteredRooms);
            console.log("Agendamentos filtrados", filteredSchedules);
        
            makeUserSchedules(filteredSchedules);
        }
    }
    
    
    // function filterRooms(searchTerm) {
    //     return 
    // }        
    
    // function filterSchedules(filtredRoom) {
    //     // Supondo que 'schedules' é uma lista de agendamentos
    //     return 
    // }
    btnAll.addEventListener("click",function(event){
        makeUserSchedules(mySchedules)
    })

    btnTrash.addEventListener("click",function(event){
        nextSchedules()
    })
    
    
}
function nextSchedules(mySchedules){
    const today = new Date();
    // if(schedule){
    //     schedules = schedule
    // }
    // Filtrar os agendamentos com base na data de início sendo maior que hoje
    const filtredschedules = mySchedules.filter(function (s) {
        // Converta a string de data para um objeto Date para comparação
        const startDate = new Date(s.data_start);
        // Compare apenas as datas (ignorando horas, minutos, etc.)
        return startDate > today;
    });
    makeUserSchedules(filtredschedules)
}
function calendarAnalise(deviceHw, roomId){
    if(!deviceHw && !roomId){
        var info = availabilities.filter(function (a) {
            return a.room_id == roomId
        })

    }else{
        return schedules
    }

    return
}
function UpdateSchedule(schedule){
    var cells = document.querySelectorAll("#calendar-body tr td div");
    if (schedule.length === 0) {
        cells.forEach(function (td) {
            td.classList.add('unavailable');
        });
    }
    else{
        cells.forEach(function(td){
          var dataDate = moment(td.getAttribute('data-date')).format('YYYY-MM-DD');  

          schedules.forEach(function(dateS){
            var dataSplit = dateS.data_start
            var dataS = dataSplit.split("T")[0]  // ajuste para comparar as datas 

            if(dataDate == dataS ){
                td.classList.remove('unavailable');
                td.classList.add('available')
            }
        })
        })
      
    }
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


}
function makePopUp(title, msg, btn1, btn2){
    const bcgrd = document.createElement("div")
    bcgrd.setAttribute("id","bcgrd")
    bcgrd.classList.add("absolute","w-full","h-full", "justify-center", "items-center", "top-0", "left-0", "flex", "z-1000", "bg-blue-500", "bg-opacity-40")

    const popUp = document.createElement("div")
    popUp.classList.add("inline-flex", "p-3", "flex-col", "items-center", "gap-1", "rounded-lg", "bg-dark-100", "m-1")
    const titlePopUp = document.createElement("div") // aplicar tipografia 
    titlePopUp.classList.add("font-bold", "[24px]")
    titlePopUp.textContent = title
    const msgPopUp = document.createElement("div")
    msgPopUp.classList.add("text-center")
    msgPopUp.textContent = msg
    const divButtons = document.createElement("div")
    divButtons.classList.add("flex", "p-2", "flex-col", "items-center", "gap-2", "items-stretch")
    const button1 = makeButton(btn1, "primary", "");
    divButtons.appendChild(button1)
    popUp.appendChild(titlePopUp)
    popUp.appendChild(msgPopUp)
    popUp.appendChild(divButtons)
    bcgrd.appendChild(popUp)
    document.body.appendChild(bcgrd)
    if(btn2){
        const button2 = makeButton(btn2, "secundary", "");
        button2.addEventListener("click",function(){
            console.log("BUTTON 2 CLICADO")
            document.body.removeChild(bcgrd)
        })
        divButtons.appendChild(button2)
    }
    return button1
}

function getDayOfWeekLabel(selectedDate) {
    console.log("SelectedDate" + selectedDate)
    const daysOfWeekMap = {
        "labelSun": "Sunday",
        "labelMon": "Monday",
        "labelTue": "Tuesday",
        "labelWed": "Wednesday",
        "labelThu": "Thursday",
        "labelFri": "Friday",
        "labelSat": "Saturday"
    };

        const selectedDayWeek = moment(selectedDate).format('dddd'); 
        const selectedDayDate = moment(selectedDate).format('DD/MM');

        for (const label in daysOfWeekMap) {
            console.log("label" + daysOfWeekMap[label] + "dayweek" + selectedDayWeek)
            if (daysOfWeekMap[label] === selectedDayWeek) {
                //var dayWeek = label.charAt(0).toUpperCase() + label.slice(1)
                return  texts.text(label) + " "  + selectedDayDate
                
            }
        }
    
        return null; 
}
//#endregion

    //#region Funções de Criação de Telas
    function makeUserSchedules(AllSchedule){
        that.clear()
        addPhonesToDevices()
        makeHeader(backButton, makeButton('','',"./images/menu.svg"), texts.text("labelMySchedules"));
        backButton.addEventListener("click",function EvtFunct(){
            makeViewRoom(rooms, devices, availabilities, schedules, viewers, editors)
            backButton.removeEventListener("click",EvtFunct)
        })
        filterSchedule()
        const container = document.createElement('div')
        container.classList.add('overflow-auto', 'w-full')
        container.style.height = 'calc(100vh - 130px)'

        AllSchedule.forEach(function(s){
            //div principal

            const divMain = document.createElement('div')
            divMain.classList.add('m-1', 'flex',"flex-col", 'items-center', 'rounded-lg',)
            
            divMain.setAttribute("id","divMain")
            //div da parte de cima user e device
            const divUp = document.createElement('div')
            divUp.classList.add("justify-start","flex","items-center","gap-2","w-full","bg-dark-300",'rounded-t-lg',"px-2","py-1")
            //div da parte de baixo device e botoes, edit e delete
            const divDown = document.createElement('div')
            divDown.classList.add("justify-between","flex","items-beatween","gap-1","w-full","bg-dark-200",'rounded-b-lg',"p-2")
            //divs dos elementos da paret de baixo
            //div elemento 1 room e data
            const divE1 = document.createElement('div')
            divE1.classList.add("flex","flex-col","items-start", "gap-1", "justify-center",)
            //div elemento 2 user e botões
            const divE2 = document.createElement('div')
            divE2.classList.add("flex","flex-row","items-end", "gap-1", "justify-center","items-center")
            
         
            const div185 = document.createElement('div')
            div185.classList.add("bg-dark-200", 'flex', "w-full",'items-center', 'justify-between','rounded-lg')
        
            div185.setAttribute("id","div185")
            //div imagem e nome do device
            //div imagem e nome do device
            const divDevice = document.createElement('div')
            divDevice.classList.add("flex","flex-row","items-center", "gap-1", "justify-center",)
            const divImg = document.createElement('img')
            divImg.classList.add("divImg","h-[45px]","w-[45px]",)
            divImg.setAttribute("src", "../images/IP112.png")
            console.log("Erick nameDevice", s)
            var nameDevice = devices.filter(function(d){
                return d.hwid === s.device_id
                
            })[0]
        
            
            console.log("Erick nameDevice", nameDevice)
            const deviceHw = document.createElement('div')
            deviceHw.classList.add("divDeviceHw")
            deviceHw.textContent = nameDevice.name

            //div data e sala schedule

            //div data e sala schedule

            const dateSchedule = document.createElement('div')
            dateSchedule.classList.add("flex","flex-col")

            var nameRoom = rooms.filter(function(r){
                return r.id === s.device_room_id
            })[0]

            var oldNameRoom = nameRoom.name
            
            var oldNameRoom = nameRoom.name

            const roomSched = document.createElement('div')
            roomSched.classList.add("nameroom", "font-medium", "text-xl")
            roomSched.textContent = nameRoom.name
            const formDate = s.data_end.split("T")

            console.log("formDate",s.data_end, formDate[1])

            const dateHour = document.createElement('div')
            dateHour.classList.add("dateHour")
            dateHour.textContent = formatDate(s.data_start).slice(0, -3) + " - " + formDate[1];

            const divUser = document.createElement("div")
            divUser.classList.add("flex-row","flex","gap-1","items-center")

            let avatar = new innovaphone.Avatar(start, userSIP, userDomain);
            let UIuserPicture = avatar.url(userSIP, 120, userDN);
            const imgAvatar = document.createElement("img");
            imgAvatar.setAttribute("src", UIuserPicture);
            imgAvatar.setAttribute("id", "divAvatar");
            imgAvatar.classList.add("w-5", "h-5", "rounded-full");

            const nameUser = document.createElement("div")
            nameUser.textContent = myUserGuid.cn

            divUser.appendChild(imgAvatar)
            divUser.appendChild(nameUser)

            const editBtn = makeButton(texts.text("labelEdit"), "secundary", "");
            editBtn.setAttribute("id",parseInt(s.id))
            editBtn.addEventListener('click', function(event){
                console.log("deviceHW", nameDevice.hwid,"Room ID", nameRoom.id, "Schedule device_id", s.device_id)
                makeScheduleContainer(nameDevice.hwid, nameRoom.id,AllSchedule,s,"update")
            })
            const delBtn = makeButton(texts.text(""), "", "./images/trash-2.svg");
            delBtn.addEventListener("click",function(event){

                 // componentizar esse bloco de codigo em uma função separada ~pietro
                 var btnPopUp = makePopUp(texts.text("labelYouSure"), texts.text("labelDeleteSchedule"), texts.text("labelYesDelete"),texts.text("labelNo"))
                 btnPopUp.addEventListener("click",function(event){
                     event.stopPropagation()
                     event.preventDefault()
                     app.sendSrc({ api: "user", mt: "DeleteDeviceSchedule", schedID: s.id, src: nameDevice.hwid }, function (obj) {
                        app.sendSrc({ api: "user", mt: "SelectDevicesSchedule", ids: rooms, src: obj.src }, function (obj) {
                            schedules = JSON.parse(obj.result)
                            mySchedules = [schedules.filter(function(s){
                                return  s.user_guid == myUserGuid.guid
                            })][0]
                            nextSchedules(mySchedules) 
                        })
                       
                    })
                 })
               
             })
                // //app.send({ api: "user", mt: "DeleteDeviceSchedule", schedID: s.id }
               
                
                // aplicar o popUp apos o delete do Schedule e voltar para a tela inicial 

                // tratar a mensagem de sucesso


                // , function (obj) {
                    
                //     // componentizar esse bloco de codigo em uma função separada ~pietro
                //     var btnPopUp = makePopUp(texts.text("labelWarning"), texts.text("labelScheduleDeleted"), texts.text("labelOk"))
                //     btnPopUp.addEventListener("click",function(event){
                //         event.stopPropagation()
                //         event.preventDefault()
                //         app.sendSrc({ api: "user", mt: "SelectDevicesSchedule", ids: rooms, src: obj.src }, function (obj) {
                //             schedules = JSON.parse(obj.result)
                //             makeViewRoomDetail(s.room_id)
                //         })
                //     })

            divDevice.appendChild(divImg)
            divDevice.appendChild(deviceHw)
            dateSchedule.appendChild(roomSched)
            dateSchedule.appendChild(dateHour)
                 
            divE1.appendChild(divDevice)
            divE1.appendChild(dateSchedule)

            const today = new Date();
            const startDate = new Date(s.data_start);
            if(today < startDate){

                divE2.appendChild(editBtn)
                divE2.appendChild(delBtn)
            }
        
            divMain.appendChild(divUp)
            divMain.appendChild(divDown)
            divUp.appendChild(divUser)
            divUp.appendChild(divDevice)
            divDown.appendChild(divE1)
            divDown.appendChild(divE2)
            container.appendChild(divMain)
            
            nameRoom.name = oldNameRoom
        })

        document.body.appendChild(container)
        
    }
    
    function makeCalendar(daySchedule,viewSchedule,divMain, deviceHw, roomId, funcao2,module,UpdateSched){
        divMain.innerHTML = "";
        //makeHeader(backButton, makeButton("Salvar","primary"), texts.text("labelSchedule"))
        // div principal
        const divCalendar = document.createElement("div")
        divCalendar.classList.add("flex","flex-col", "items-start", "gap-2","self-stretch","rounded-lg","bg-dark-200", "m-1")
        const divTextSelectDay = document.createElement("div")
        divTextSelectDay.classList.add("color-white","font-Montserrat","text-2","not-italic","font-bold")
        divTextSelectDay.textContent = texts.text("labelSelectYourDay")
        
        divCalendar.appendChild(divTextSelectDay)

        var info = calendarAnalise(deviceHw, roomId)

            var availability = availabilities.filter(function (a) {
            return a.room_id == roomId
        })
        console.log("AVAILABILITIES " + JSON.stringify(availability))

        Calendar.createCalendar(divCalendar,availability,daySchedule,function (day) {
            selectedDay = day.selectedDate
            console.log("SelectedDay " + JSON.stringify(selectedDay))
            funcao2(selectedDay) 
            
        },module,UpdateSched); // componente Calendar

        // if(viewSchedule == "viewSchedule"){  // condição para quando for consultar os schedules e nao agendar
        //     setTimeout(function(){
        //         UpdateSchedule(daySchedule)
        //     },500)
        // }
       
        divMain.appendChild(divCalendar);
        
    }

    var buttonMenu = makeButton('','',"./images/settings.svg")
    function makeViewRoom(rooms, devices, availabilities, schedules, viewers, editors) {
        that.clear();
        makeHeader(makeButton("","","./images/home.svg"), buttonMenu, texts.text("labelMyRooms"))
        buttonMenu.addEventListener("click",function(){
            //nextSchedules(mySchedules)
            makeDivOptions(rooms, devices, availabilities, schedules, viewers, editors)
        })

        myUserGuid = list_tableUsers.filter(function(u){
            return u.sip == userSIP
        })[0]
    
        mySchedules = [schedules.filter(function(s){
            return  s.user_guid == myUserGuid.guid
        })][0]

        // div container (scroll)
        const container = document.createElement("div")
<<<<<<< HEAD
        container.classList.add("overflow-auto","grid","gap-2","sm:grid-cols-2","lg:grid-cols-4")
=======
        container.classList.add("overflow-auto","grid","gap-2","sm:grid-cols-2",":grid-cols-4")
>>>>>>> 5873d27b1b63211e0e477fad92d15e89c53f180f
        container.style.height = 'calc(100vh - 70px)'
        container.setAttribute("id","container")
        document.body.appendChild(container);
        
        rooms.forEach(function(room){
            //div principal
            const divMain =  document.createElement("div")
            divMain.classList.add("rounded-lg","p-1","mx-1","bg-dark-200","gap-2","flex-col","flex", "h-fit", "cursor-pointer")
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
            
            var viewersFilter = viewers.filter(function (v){
                return v.room_id == room.id
            })
            //componente avatar
            makeAvatar(viewersFilter,divMain)

            //todas as divs com o atributo "room"
            const divsRoom = document.querySelectorAll('[room]');
            //listener de clique a cada div
            divsRoom.forEach(function (div) {
                div.addEventListener('click', function (event) {
                    var id = event.currentTarget.id;
                    // var room = rooms.filter(function (room) {
                    //     return id == room.id
                    // })[0];
                    // var devs = devices.filter(function (dev) {
                    //     return id == dev.room_id
                    // });
                    // var avail = availabilities.filter(function (avl) {
                    //     return id == avl.room_id
                    // });
                    // var sched = schedules.filter(function (sched) {
                    //     return id == sched.device_room_id
                    // });
                    // var viws = viewers.filter(function (viws) {
                    //     return id == viws.room_id
                    // });
                    event.stopPropagation();
                    makeViewRoomDetail(id)
                });
            });
        })   
    }
    function makeAvatar(viewersFilter, divMain) {
        const divUsersAvatar = document.createElement("div");
        divUsersAvatar.classList.add("flex", "items-start", "gap-1");
        divUsersAvatar.setAttribute("id", "divUsersAvatar");
        console.log("ARRAY USERS:" + JSON.stringify(viewersFilter));

        let processedUsersCount = 0;

        viewersFilter.forEach(function (viewer) {
            if (processedUsersCount < 6) {
                var viewersUsers = list_tableUsers.filter(function (user) {
                    return user.guid == viewer.viewer_guid;
                });

                viewersUsers.slice(0, 6).forEach(function (view) {
                    let avatar = new innovaphone.Avatar(start, view.sip, userDomain);
                    let UIuserPicture = avatar.url(view.sip, 120, view.cn);
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
                var week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

                week.forEach(function (w) {
                    const dayDiv = document.createElement('div')
                    dayDiv.classList.add("flex", "w-[40px]", "h-[40px]", "p-1", "flex-col", "items-center", "justify-center", "gap-1","rounded-full","recurrentText",`room-${a.room_id}`)
                    dayDiv.setAttribute("day-week", w)
                    const dayText = document.createElement('p')
                    dayText.classList.add("font-Montserrat", "text-base", "font-bold", "leading-normal", 'leading-normal', "color-dark-400",)
                    dayText.textContent = texts.text(`${w + "Abrev"}`)
                    dayDiv.appendChild(dayText)
                    divMainAvailabilityRecurrent.appendChild(dayDiv)
                })
                divMain.appendChild(divMainAvailabilityRecurrent)
                // UpdateAvailability(availability, a.type)
            }
             UpdateAvailability(availability, a.type)
        })
       

    }
    function makeViewRoomDetail(id) {

        var room = rooms.filter(function (room) {
            return id == room.id
        })[0];
        var devs = devices.filter(function (dev) {
            return id == dev.room_id
        });
        var avail = availabilities.filter(function (avl) {
            return id == avl.room_id
        });
        var sched = schedules.filter(function (allSched) {
            return id == allSched.device_room_id
        });
        var viws = viewers.filter(function (viws) {
            return id == viws.room_id
        });
        console.log("Sched " + sched)
        that.clear();

        makeHeader(backButton, makeButton("", "", "./images/menu.svg"), room.name)
        backButton.addEventListener("click",function EvtFunct(){
            makeViewRoom(rooms, devices, availabilities, schedules, viewers, editors)
            backButton.removeEventListener("click",EvtFunct)
        })
        // div container
        const container = document.createElement("div")
        // if (window.matchMedia('(min-width: 480px)').matches){
        //   container.classList.add("overflow-hidden")
        // }else{
        //     container.classList.add("overflow-auto")
        // }
        container.classList.add("overflow-auto", "sm:overflow-hidden","gap-1", "grid", "sm:grid-cols-2","sm:grid-rows-2", "m-1","content-start",)
        container.style.height = 'calc(100vh - 70px)'
        container.setAttribute("id", "container")
        document.body.appendChild(container);
        // div sala
        const divMainSala = document.createElement("div")
        divMainSala.classList.add("aspect-[4/3]", "bg-dark-200", "rounded-lg", "divMainSala","sm:row-span-2","p-2","justify-start","items-start","min-w-[220px]","h-full","w-full")

        const divImg = document.createElement("div")
        divImg.classList.add("w-[100%]","h-[100%]", "bg-center", "bg-cover", "bg-no-repeat", "rounded-lg", "divSala","sm:bg-[length:606px_455px]")
        divImg.setAttribute("style", `background-image: url(${room.img});`);
        container.appendChild(divMainSala)
        divMainSala.appendChild(divImg)


        //card horarios implementado pelo Pietro
        const divHorario = document.createElement("div")
        divHorario.classList.add("divHorario","w-full") //"h-full",
        container.appendChild(divHorario)
        makeViewCalendarDetail(divHorario, avail)

        // div container (scroll) devices
        const div102 = document.createElement("div")
        div102.classList.add("div102","sm:col-start-2","h-full","sm:overflow-auto","p-1","gap-1","flex","items-start","rounded-lg","bg-dark-200",'flex-col')
        /*div102.style.height = 'calc(100vh - 70px)'*/
        div102.setAttribute("id", "div102")
        container.appendChild(div102);

        devs.forEach(function (device) {
            var s = sched.filter(function (s) {
                return device.hwid == s.device_id
            });
            var viewer = viws.filter(function (v) {
                return v.viewer_guid == device.guid && v.room_id == room.id
            });
            makeDeviceIcon(divImg, device, viewer)
            makeViewDevice(div102, device, avail, s, viewer)
        })


        console.log("TODOS SCHEDULES DESSA SALA " + JSON.stringify(sched))
    }
    // calendario 
    // function makeCalendarOld(divMain, deviceHw,roomId, funcao2){
    //     divMain.innerHTML = "";
    //     //makeHeader(backButton, makeButton("Salvar","primary"), texts.text("labelSchedule"))
    //     // div principal
    //     const divCalendar = document.createElement("div")
    //     divCalendar.classList.add("flex","flex-col", "items-start", "gap-2","self-stretch","rounded-lg","bg-dark-200", "m-1")
    //     const divTextSelectDay = document.createElement("div")
    //     divTextSelectDay.classList.add("color-white","font-Montserrat","text-2","not-italic","font-bold")
    //     divTextSelectDay.textContent = texts.text("labelSelectYourDay")
        
    //     divCalendar.appendChild(divTextSelectDay)
    //     var availability = availabilities.filter(function (a) {
    //         return a.room_id == roomId
    //     })
    //     var sched = schedules.filter(function (s) {
    //         return s.room_id == roomId && s.device_id == deviceHw
    //     }) 
    //     Calendar.createCalendar(divCalendar,availability,function (day) {
    //         selectedDay = day
    //         console.log("SelectedDay " + day)
    //         funcao2(selectedDay)
    //     }); // componente Calendar 
    //     divMain.appendChild(divCalendar);
        
    // }
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
        // img expandir
        const divOpenTime = document.createElement("div")
        divOpenTime.classList.add("aspect-[16/9]", "w-[17px]", "h-[17px]", "bg-center", "bg-cover", "bg-no-repeat", "rounded-lg")
        divOpenTime.setAttribute("style", `background-image: url(./images/chevron-down.svg);`);
        divOpenTime.setAttribute("id", "divOpenTime")
        div160.appendChild(divOpenTime)

        if (window.matchMedia('(min-width: 480px)').matches){
            //divOpenTime.setAttribute("style", `background-image: url(./images/chevron-up.svg);`);
            var divAvailabilyDetail = document.createElement("div")
            divAvailabilyDetail.setAttribute("id", "divAvailabilyDetail")
            divAvailabilyDetail.classList.add("divAvailabilyDetail","flex","items-center","justify-start","gap-1",)
            divMain.appendChild(divAvailabilyDetail)

            //desktop
                if (a.type == "periodType") {
                    makeViewTimePeriod(divAvailabilyDetail, a)
                }

                if (a.type == "recurrentType") {
                    makeViewTimeRecurrent(divAvailabilyDetail, a)
                }

                UpdateAvailability(availability, a.type)     
        }else{
            //mobile
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
                    divAvailabilyDetail.classList.add("divAvailabilyDetail","flex","items-center","justify-start","gap-1")
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
        }

    })

    }
    //Função apara apresentar os horários para agendamento por período
    function makeViewTimeHour(divMain, day, availability, deviceSelected, callback) {

        const div106 = document.createElement("div")
        div106.classList.add("div106")
        //"h-fit se precisar"
        div106.setAttribute("id", "div106")
        divMain.appendChild(div106);
        console.log(JSON.stringify(deviceSelected))
        if (availability.type == "periodType") {
            const startTimeString = availability.data_start;
            const endTimeString = availability.data_end;
        
            var sched = deviceSelected.filter(function (s) {
                // Extrair apenas a parte da data (sem o horário) para comparar com o dia selecionado
                const startDate = s.data_start.split("T")[0];
                const endDate = s.data_end.split("T")[0];
                const selectedDay = day.split("T")[0];
        
                // Verifica se o agendamento está dentro do intervalo do dia selecionado
                return startDate === selectedDay && s.data_start >= startTimeString && s.data_start < endTimeString;
            });
        
            console.log("Agendamentos ", JSON.stringify(sched));
        
            // Extrair apenas as horas dos valores de data e hora recebidos
            const startHour = parseInt(startTimeString.split("T")[1].split(":")[0]);
            const endHourParsed = parseInt(endTimeString.split("T")[1].split(":")[0]);
        
            // Criar as divs somente para as horas no intervalo desejado
            for (let hour = startHour; hour <= endHourParsed; hour++) {
                const hourString = hour.toString().padStart(2, "0");
        
                const divHour = document.createElement("div");
                divHour.setAttribute("date-time", day + " " + hourString + ":00");
                divHour.classList.add("divHour", "cursor-pointer");
                
                // for each para divs com agendamento
                sched.forEach(function (s) {
                    const startHourSched = parseInt(s.data_start.split("T")[1].split(":")[0]);
                    const endHourSched = parseInt(s.data_end.split("T")[1].split(":")[0]);
                    // quando ja tiver agendamento nesse horário reduz a opacidade
                    if (hour >= startHourSched && hour <= endHourSched) {
                        divHour.classList.remove("cursor-pointer");
                        divHour.classList.add("opacity-[60%]");
                        divHour.removeAttribute("date-time");
                    }
                });

                var horaAtual = moment().format('YYYY-MM-DD HH:mm')

                divHour.setAttribute("id", hourString + ":00");
                divHour.textContent = hourString + ":00";
                div106.appendChild(divHour);
                // colocar opacidade na div com hora menor que a hora atual
                if(divHour.getAttribute("date-time") <= String(horaAtual)){
                    divHour.classList.remove("cursor-pointer");
                    divHour.classList.add("opacity-[60%]");
                    divHour.removeAttribute("date-time");
                }
            }
        
            const divsHours = document.querySelectorAll('[date-time]');
            divsHours.forEach(function (div) {
                div.addEventListener('click', function (event) {
                    var hour = event.currentTarget.id;
                    console.log("Hora clicada a tratar ", hour);
                    callback(hour);
                });
            });
        }
        
        if (availability.type == "recurrentType") {
            const isoDay = moment(day).isoWeekday();
            console.log(isoDay);
            var date = {};
            switch (isoDay) {
                case 1:
                    date.startTime = availability.timestart_monday;
                    date.endTime = availability.timeend_monday;
                    break;
                case 2:
                    date.startTime = availability.timestart_tuesday;
                    date.endTime = availability.timeend_tuesday;
                    break;
                case 3:
                    date.startTime = availability.timestart_wednesday;
                    date.endTime = availability.timeend_wednesday;
                    break;
                case 4:
                    date.startTime = availability.timestart_thursday;
                    date.endTime = availability.timeend_thursday;
                    break;
                case 5:
                    date.startTime = availability.timestart_friday;
                    date.endTime = availability.timeend_friday;
                    break;
                case 6:
                    date.startTime = availability.timestart_saturday;
                    date.endTime = availability.timeend_saturday;
                    break;
                case 7:
                    date.startTime = availability.timestart_sunday;
                    date.endTime = availability.timeend_sunday;
                    break;
            }
        
            const startTime = moment(date.startTime, 'HH:mm');
            const endTime = moment(date.endTime, 'HH:mm');
            
            const hoursInRange = [];
            let currentTime = startTime.clone();
        
            // Cria um array com todas as horas disponíveis dentro do intervalo
            while (currentTime.isBefore(endTime)) {
                hoursInRange.push(currentTime.format('HH') + ":00"); // Ajuste para obter horas cheias
                currentTime.add(1, 'hour');
            }
        
            // Cria as divs para as horas disponíveis
            hoursInRange.forEach(function(time) {
                const divHour = document.createElement("div");
                divHour.setAttribute("hour", time);
                divHour.classList.add("divHour", "cursor-pointer");
                
                // Verificar conflitos com agendamentos existentes
                var horaAtual = moment().format('YYYY-MM-DD HH:mm');
                const selectedDateTime = moment(day + ' ' + time, 'YYYY-MM-DD HH:mm');
                var isConflict = deviceSelected.some(function(s) {
                    const startDateTime = moment(s.data_start);
                    const endDateTime = moment(s.data_end);
                    return selectedDateTime.isBetween(startDateTime, endDateTime, null, '[]');
                });
        
                // Se houver conflito, definir opacidade e remover atributo de data-hora
                if (isConflict || selectedDateTime <= horaAtual) {
                    divHour.classList.remove("cursor-pointer");
                    divHour.classList.add("pointer-events-none");
                    divHour.classList.add("opacity-[60%]");
                    divHour.removeAttribute("date-time");
                }
        
                divHour.setAttribute("id", time);
                divHour.textContent = time;
                div106.appendChild(divHour);
            });
        
            const divsHours = document.querySelectorAll('[hour]');
            divsHours.forEach(function (div) {
                div.addEventListener('click', function (event) {
                    var hour = event.currentTarget.id;
                    console.log("Hora clicada a tratar ", hour);
                    callback(hour);
                });
            });
        }
          
    }
    function makeViewTimePeriod(divMain, availability) {
        //dias
        var div180 = document.createElement("div")
        div180.setAttribute("id", "div180")
        div180.classList.add("div180Period","flex","flex-row","gap-3","justify-start","w-full")
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
        divStartISODay.classList.add("divISODay","pb-1")
        divStartISODay.innerHTML = texts.text("label" + moment(availability.data_start).format("dddd") + "Div");
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
        divEndTime.classList.add("divEndTime")
        divEndTime.innerHTML = moment(availability.data_end).format("HH:mm");
        div179E.appendChild(divEndTime)
        //dia-semana   
        const divEndISODay = document.createElement("div")
        divEndISODay.setAttribute("id", "divEndISODay")
        divEndISODay.classList.add("divISODay")
        divEndISODay.innerHTML = texts.text("label" + moment(availability.data_end).format("dddd") + "Div");
        divDateEnd.appendChild(divEndISODay)

        div180.appendChild(divDateEnd)

    }
    function makeViewTimeRecurrent(divMain, a) {
        // div disponibilidade recorrente
        const divMainAvailabilityRecurrent = document.createElement("div");
        divMainAvailabilityRecurrent.classList.add("self-stretch", "flex", "p-1", "items-start", "bg-dark-100", "rounded-lg", "justify-center","gap-1");
        // dias da semana 
        var week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
        var defaultDay = getDefaultDayWithAvailability(week, a);
        
        var div180 = document.createElement("div");
        div180.setAttribute("id", "div180");
        div180.classList.add("flex","flex-row","gap-1","justify-start","w-full");
        div180.style.display = 'none';
        divMain.appendChild(divMainAvailabilityRecurrent);
        divMain.appendChild(div180);

        week.forEach(function (w, index) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add("flex", "w-[40px]", "h-[40px]", "p-1", "flex-col", "items-center", "justify-center", "gap-1", `room-${a.room_id}`,"rounded-full");
            const dayText = document.createElement('p');
            dayText.classList.add("font-Montserrat", "text-base", "font-bold", "leading-normal", 'leading-normal', "color-dark-400");
            // D 
            dayText.textContent = texts.text(`${w + "Abrev"}`);
            // dia - semana 
            dayDiv.setAttribute("day-week",  w);
            dayDiv.appendChild(dayText);
            divMainAvailabilityRecurrent.appendChild(dayDiv);

            dayDiv.addEventListener("click", function(ev){
                const dayOfWeek = dayDiv.getAttribute("day-week");
                const startTime = a[`timestart_${dayOfWeek.toLowerCase()}`];
                const endTime = a[`timeend_${dayOfWeek.toLowerCase()}`];
                console.log("DAFAULT DAY " + defaultDay)
                console.log("DayOfWeek " + dayOfWeek + "\n" + "StartTime " + startTime + "\n" + "EndTime " + endTime)
                makeViewDay(divMain, `label${dayOfWeek}Div`, startTime, endTime);
            });
    
            if (w === defaultDay) {
                const startTime = a[`timestart_${defaultDay.toLowerCase()}`];
                const endTime = a[`timeend_${defaultDay.toLowerCase()}`];
                makeViewDay(divMain, `label${defaultDay}Div`, startTime, endTime);
            }
        });

    }
    function makeViewDay(divMain, day, timestart, timeend) {
        //dias
        var div180 = document.getElementById("div180");
        div180.innerHTML = '';
        div180.classList.add("div180Period","flex","flex-col","gap-1","justify-start","w-full");
        div180.style.display = 'flex';

        var divDayLabel = document.createElement("div");
        //divDayLabel.setAttribute("id", "div180");
        divDayLabel.classList.add("divDayLabel");
        divDayLabel.innerHTML = texts.text(day);
        div180.appendChild(divDayLabel);

        //div182
        var div182 = document.createElement("div");
        div182.setAttribute("id", "div182");
        div182.classList.add("div182","flex","flex-row","gap-3","justify-start","w-full");
        div180.appendChild(div182);

        //time start
        var divTimeStart = document.createElement("div");
        divTimeStart.setAttribute("id", "divTimeStart");
        divTimeStart.classList.add("divDate");
        div182.appendChild(divTimeStart);
        divTimeStart.innerHTML = timestart;

        //div to
        const divToTime = document.createElement("div");
        divToTime.setAttribute("id", "divToTime");
        divToTime.classList.add("divToTime");
        divToTime.innerHTML = texts.text("labelTo");
        div182.appendChild(divToTime);

        //time end
        var divTimeEnd = document.createElement("div");
        divTimeEnd.setAttribute("id", "divTimeEnd");
        divTimeEnd.classList.add("divDate");
        div182.appendChild(divTimeEnd);
        divTimeEnd.innerHTML = timeend;
    }


    //console.log("MyUseVar " + JSON.stringify(myUser))

    function addOutlineOnClick(div1, div2) {
        if (div1 && div2) {
            // Adicione um ouvinte de eventos para adicionar o contorno à div1 e div2 quando a div1 for clicada
            div1.addEventListener("click", function() {
                div1.style.outline = "2px solid primary-100/50"; // Altere a cor e o tamanho do contorno conforme necessário
                div2.style.outline = "2px solid primary-100/50"; // Altere a cor e o tamanho do contorno conforme necessário
            });
    
            // Adicione um ouvinte de eventos para adicionar o contorno à div1 e div2 quando a div2 for clicada
            div2.addEventListener("click", function() {
                div1.style.outline = "2px solid primary-100/50"; // Altere a cor e o tamanho do contorno conforme necessário
                div2.style.outline = "2px solid primary-100/50"; // Altere a cor e o tamanho do contorno conforme necessário
            });
        } else {
            console.log('One or both of the divs do not exist');
        }
    }


    function makeViewDevice(divMain, device, availability, schedule, viewer) {
        //div 101
        var myUser = list_tableUsers.filter(function(u){
            return u.sip == userSIP
        })[0]

            const dateNow = moment();
            const formattedDate = dateNow.format('YYYY-MM-DDTHH:mm');

        const divMainViewDevice = document.createElement("div")
<<<<<<< HEAD
        divMainViewDevice.classList.add("bg-dark-100","flex","flex-row","rounded-lg","w-full","h-fit","justify-start","focus:ring-2","focus:ring-primary-100")
        divMainViewDevice.setAttribute("id", device.id)
        divMainViewDevice.setAttribute("tabindex", "0")
       
=======
        divMainViewDevice.setAttribute("tabindex", "0");
        divMainViewDevice.classList.add("bg-dark-100","flex","flex-row","rounded-lg","w-full","h-fit","justify-between","hover:bg-dark-100/50","active:bg-dark-100/75","focus:ring-2","focus:ring-primary-100/50","cursor-pointer")
        divMainViewDevice.setAttribute("id", device.id)
        const div93 = document.getElementById(device.id);
>>>>>>> 5873d27b1b63211e0e477fad92d15e89c53f180f
        //div retangle 1396

        const divButtons = document.createElement("div")
        divButtons.classList.add("flex","justify-end","items-center","gap-1","w-fit","pr-1")

        const div100User = document.createElement("div")
        div100User.classList.add("div100User") 

        const div100Status = document.createElement("div")
        div100Status.classList.add("div100Status","text-bold")
        //div100Status.textContent = 'Horário para colocar'

        var state;
        if(!device.guid){
            state = "bg-[#2AFF9C]" ;
            div100User.textContent = texts.text("labelFree")
            div100User.style.color = state
        }else if(device.guid == myUser.guid){
            state = "bg-[#26CAFF]"
            div100Status.innerHTML = texts.text("labelInUseByMe")
            div100Status.style.color = "#26CAFF"
        }else{
            state = "bg-[#FFC107]"
        }

        const div100NameDevice = document.createElement("div")
        div100NameDevice.classList.add("text-white" , "opacity-50","font-normal", "text-sm")
        div100NameDevice.textContent = device.name

        const div100 = document.createElement("div")
        div100.classList.add("div100", "p-1")

       // var state = device.guid ? "bg-[#FFC107]" : "bg-[#2AFF9C]";
        const divStatusColor = document.createElement("div")
        divStatusColor.classList.add(state, "h-[100%]", "w-[12px]","rounded-l-lg")
        divStatusColor.setAttribute("id", device.hwid)

        var room = rooms.filter(function (room) {
            return device.room_id == room.id
        })[0];

        //div Left
        const divLeft = document.createElement("div")
        divLeft.classList.add("w-fit","flex","justify-start","gap-1","items-center")

        const divNumberPosition = document.createElement("div")
        divNumberPosition.textContent = "00"
        var deviceIcon = document.createElement("img")
        deviceIcon.classList.add("deviceIcon")
        deviceIcon.setAttribute("src", "./images/" + device.product + ".png")
        divLeft.appendChild(divStatusColor) 
        divLeft.appendChild(divNumberPosition)
        divLeft.appendChild(deviceIcon)
        div100.appendChild(div100User)
        div100.appendChild(div100Status)
        div100.appendChild(div100NameDevice)
        divLeft.appendChild(div100)

        divMainViewDevice.appendChild(divLeft)
        

        // se tiver alguem usando o telefone
        if (viewer.length > 0) {
                // if(device.guid == myUser.guid ){
                //     state = "bg-[#26CAFF]"
                // }else if(device.guid && device.guid != myUser.guid ){
                // }
            //div 82
            var user = list_tableUsers.filter(function (u) {
                return u.guid == viewer[0].viewer_guid
            })[0];
              
            var userScheduels = schedule.filter(function(s){
                return s.user_guid == user.guid
            })[0]

            div100User.textContent = user.cn 

            //div 100
            console.log("UserSchedules"  + JSON.stringify(userScheduels) + "My User " + JSON.stringify(myUser))
            
            // se eu estiver usando o telefone por agendamento
            if(user.sip == userSIP && userScheduels && moment(userScheduels.data_start).format('YYYY-MM-DDTHH:mm') <= formattedDate ){
            const div36 = makeButton('',"secundary","./images/pencil.svg")
            div36.setAttribute("id", device.hwid)
            div36.addEventListener("click", function (event) {
                
            // var nameRoom = rooms.filter(function(r){
            //     return r.id === schedule.device_room_id
            // })[0]
            
            // var nameDevice = devices.filter(function(d){
            //     return d.hwid === schedule.device_id
                
            // })[0]

            // makeScheduleContainer(nameDevice.hwid, nameRoom.id, mySchedules,schedule,"update")

            })
            divButtons.appendChild(div36)
            //divMainViewDevice.appendChild(divButtons)
            }
            // se eu estiver usando o telefone
            else if (user.sip == userSIP ) {  
                //div 36
                // const div36 = makeButton(texts.text("deletePhoneUseButton"), "secundary")
                const div36 = makeButton('','secundary',"./images/reply.svg")
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
                            makeViewRoomDetail(room.id)
                        })
                    })
                })
                divButtons.appendChild(div36)
                divMainViewDevice.appendChild(divButtons)
                
            }
            //se ja tiver um agendamento rolando 
            else if(user.sip != userSIP  && userScheduels && userScheduels.data_start <= formattedDate && userScheduels.data_end >= formattedDate ){
                div100Status.innerHTML = texts.text("labelInUse")
                div100Status.style.color = "#FFC107"
            }
            // se tiver assumido por outra pessoa
            else {
                div100Status.innerHTML = texts.text("labelAssumed")
                div100Status.style.color = "#FFC107"

            //div 34
            const div34 = makeButton(texts.text("makePhoneSceduleButton"), "primary")
            //div34.classList.add("div34")
            div34.setAttribute("id", device.hwid)
            div34.innerHTML = texts.text("makePhoneSceduleButton")
            div34.addEventListener("click", function (event) {
                var deviceHw = event.currentTarget.id;
                makeScheduleContainer(deviceHw, room.id, schedule,null,"schedule")
               
                    // ~pietro estudar possibilidade de componentização 

            })

            divButtons.appendChild(div34)
            // divMainViewDevice.appendChild(divButtons)
            }

        }
        // quando telefone estiver livre
        else {  
            //div 36
            const div36 = makeButton('','secundary',"./images/hand.svg")
            div36.setAttribute("id", device.hwid)
            //div36.innerHTML = texts.text("makePhoneUseButton")
            div36.addEventListener("click", function (event) {
                var dev = event.currentTarget.id;
                event.stopPropagation()
                
                var btnPopUp = makePopUp(texts.text("labelTakeOverPhone"), texts.text("labelTakeOverPhoneText"), texts.text("labelTakeOverPhone"),texts.text("labelCancel"))
                btnPopUp.addEventListener("click",function(event){
                    event.stopPropagation()
                    event.preventDefault()
                    app.sendSrc({ api: "user", mt: "SetDeviceToUser", deviceId: dev, src: dev }, function (obj) {
                        app.sendSrc({ api: "user", mt: "SelectDevices", ids: rooms, src: obj.src }, function (obj) {
                            devices = JSON.parse(obj.result)
                            makeViewRoomDetail(room.id)
                        })
                    })
                })
            })

            //div 34
            const div34 = makeButton(texts.text("makePhoneSceduleButton"), "primary")
            //div34.classList.add("div34")
            div34.setAttribute("id", device.hwid)
            div34.innerHTML = texts.text("makePhoneSceduleButton")
            div34.addEventListener("click", function (event) {
                var deviceHw = event.currentTarget.id;
                makeScheduleContainer(deviceHw, room.id, schedule,null,"schedule")
                //makeScheduleContainer(availability, schedule, )
                // Calendar.createCalendar()
                // var devInfo = schedules.filter(function (sched) {
                //     return device.hwid == sched.device_id
                // });
                // console.log("DISPONIBILIDADE DA SALA " + JSON.stringify(availability) + "Schedules " + JSON.stringify(schedule) +
                // "Device INFO " + JSON.stringify(devInfo)  + "Full devices " + JSON.stringify(device))

            })
            divButtons.appendChild(div36)
            divButtons.appendChild(div34)
           // divMainViewDevice.appendChild(divButtons)
        }
        
        divMainViewDevice.appendChild(divButtons)
        divMain.appendChild(divMainViewDevice)
        addOutlineOnClick(divMainViewDevice, div93);
        

    }
    function makeDeviceIcon(divMain, device, viewer) {
        //div 93
        const div93 = document.createElement("div")
        div93.classList.add("div93")
        div93.setAttribute("tabindex","0")
        div93.setAttribute("id", device.id)
        div93.style.top = device.topoffset
        div93.style.left = device.leftoffset
        div93.setAttribute("tabindex", "0");
        const divMainViewDevice = document.getElementById(device.id);
    
        
        //div retangle 1396

        var myUser = list_tableUsers.filter(function(u){
            return u.sip == userSIP
        })[0]

        var state;

        if(!device.guid){
            state = "bg-[#2AFF9C]" ;
        }else if(device.guid == myUser.guid){
            state = "bg-[#26CAFF]"
        }else{
            state = "bg-[#FFC107]"
        }
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
        addOutlineOnClick(divMainViewDevice, div93);
    }
    //Função para criar a tela de seleção para o agendamento
    //chamar no click da div34
    function makeScheduleContainer(deviceHw, roomId, schedule, updateSched, module) {
        console.log("MAKESCHEDULECONTAINER")
        that.clear();
        const btnSave = makeButton(texts.text("save"), "primary", "")
        makeHeader(backButton,btnSave, texts.text("labelSchedule"))
        backButton.addEventListener("click",function EvtFunct(){
            makeViewRoomDetail(roomId)
            backButton.removeEventListener("click",EvtFunct)
        })
        //makeHeader("./images/arrow-left.svg", "Botão Salvar aqui", texts.text("labelSchedule"))
        const containerSchedule = document.createElement("div")
        containerSchedule.setAttribute("id", "containerSchedule")
        containerSchedule.classList.add("md:mx-96")
        document.body.appendChild(containerSchedule)

        var avail = availabilities.filter(function (a) {
            return a.room_id == roomId
        })[0]
        var selectedEnd;
        var selectedStart;
        console.log("Schedules" +JSON.stringify(schedule))
        // var scheduleDeviceClicked = [schedule.find(function(s){
        //     return s.device_id == deviceHw;
        // })]; 
        var scheduleDeviceClicked = [];
        schedule.forEach(function(s) {
            if (s.device_id === deviceHw) {
                scheduleDeviceClicked.push(s);
            }
        });
        //if (!schedule) {
            console.log("Schedule to Edit " +  JSON.stringify(scheduleDeviceClicked))
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
            
            frame107btn.addEventListener("click", function buildCalendar(event) {
                const frame104btn = makeButton(texts.text("labelConfirm"), "tertiary")
                frame104btn.setAttribute("id", "frame104btn")
                frame104btn.addEventListener("click", function(event){
                    makePopUp(texts.text("labelWarning"),texts.text("labelSelectDay"), "ok").addEventListener("click",function(event){
                        event.preventDefault()
                        event.stopPropagation()
                        document.body.removeChild(document.getElementById("bcgrd"))
                    })  
                })
                
                makeCalendar(scheduleDeviceClicked,'',div104, deviceHw, roomId, function (day) {
                    var selectedDay = day
                    console.log("Erick User Callback day", selectedDay) // recebe apenas o primeira data selecionada
                    var frame104btn = document.getElementById("frame104btn")
                    if (frame104btn) {
                        // Remove o elemento existente
                        div104.removeChild(frame104btn);
                    }
                    
                    frame104btn = makeButton(texts.text("labelConfirm"), "primary")
                    frame104btn.id = 'frame104btn'
                    div104.appendChild(frame104btn)
                    frame104btn.addEventListener("click", function (event) {
                        
                        console.log("Erick Dia day STR", JSON.stringify(day))
                        console.log("Dia selecionado retornado makeScheduleContainer ", JSON.stringify(day))
    
                        div104.innerHTML = '' ;
                        frame107.innerHTML = '' ;
                        frame107.appendChild(frame107txt)
    
                        const div32 = document.createElement("div")
                        div32.setAttribute("id","div32")
                        div32.classList.add("flex","justify-between","items-center","items-stretch","rounded-md")
                        console.log("getDayOfWeekLabel" + day)
                        const btnShowSelectedDay = makeButton(getDayOfWeekLabel(day),"primary","")
                        btnShowSelectedDay.setAttribute("id","btnShowSelectedDay")
                        div32.appendChild(btnShowSelectedDay)
    
                        const btnEditDay = makeButton(texts.text("labelEdit"), "secundary", "");
                        btnEditDay.setAttribute("id", "btnEditDay");
    
                        btnEditDay.addEventListener("click",function(){ // click botão editar
                            var oldDay = day.selectedDate
                            buildCalendar()
                            console.log("old daySelected" + oldDay)   
                            // para remover a div dos horarios se ela estiver aberta quando clicar no botão "editar"
                            var div106Id = document.getElementById("div106")
                            if(div106Id){
                                containerSchedule.removeChild(div106)
                            }
    
                            // se conter a data antiga limpa tudo 
                            if(document.getElementById("divTimeStart").innerHTML != '-- : --' && document.getElementById("divTimeEnd").innerHTML != '-- : --'){
                                selectedStart = ""
                                selectedEnd = ""
                                document.getElementById("divTimeStart").innerHTML = '-- : --';
                                document.getElementById("divTimeEnd").innerHTML = '-- : --';
                            }
                            
                            setTimeout(function(){
                                var cells = document.querySelectorAll("#calendar-body tr td div");
                                cells.forEach(function (td) {
                                    if (td.getAttribute("data-date") == oldDay) {
                                        td.classList.add("bg-[#199FDA]");
                                    }
                                    td.addEventListener("click", function () {
                                        cells.forEach(function (otherTd) {
                                            if (otherTd.classList.contains("bg-[#199FDA]")) {
                                                otherTd.classList.remove("bg-[#199FDA]");
                                            }
                                        });
                                    });
                                });
                            },350);
                            })
                    
                        div32.appendChild(btnEditDay);
                        
                        div104.appendChild(frame107)
                        div104.appendChild(div32);
                        
                    })
                   
                },module,null);

                div104.appendChild(frame104btn);

            });
           
            // btnEditDay.addEventListener("click",function(){
            //     callback(makeConfirmAndEditSchedule())
            // })

            //Seleção horário
            const div105 = document.createElement("div")
            div105.setAttribute("id", "div105")
            div105.classList.add("div105", "h-fit")
            containerSchedule.appendChild(div105)

            var frame108 = document.createElement("div")
            frame108.setAttribute("id", "frame108")
            frame108.classList.add("frame107", "h-fit")
            div105.appendChild(frame108)

            var frame108txt = document.createElement("div")
            frame108txt.classList.add("frame107txt")
            frame108txt.innerHTML = texts.text("labelSelectHour")
            frame108.appendChild(frame108txt)

            //div110
            var div110 = document.createElement("div")
            div110.setAttribute("id", "div110")
            div110.classList.add("div110")
            div105.appendChild(div110)

            //time start
            var divTimeStart = document.createElement("div")
            divTimeStart.setAttribute("id", "divTimeStart")
            divTimeStart.classList.add("divTime")
            div110.appendChild(divTimeStart)
            if(avail.schedule_module == "dayModule"){
                divTimeStart.innerHTML = "00:00"
            }else{
                divTimeStart.innerHTML = "-- : --"
            
            divTimeStart.addEventListener("click", function (event) {
                event.stopPropagation()
                event.preventDefault()
                var day = document.getElementById("btnShowSelectedDay")
                if (day) {

                    makeViewTimeHour(containerSchedule, selectedDay , avail, scheduleDeviceClicked, function (selectedTime) {
                        //
                        //continuar aqui com a reconstrução da div105 com a hora selecionado e botão editar...
                        //
                        divTimeStart.innerHTML = selectedTime
                        divTimeStart.style.color = "white"
                        var div106 = document.getElementById("div106")
                        containerSchedule.removeChild(div106)
                    })
                } else {
                   makePopUp(texts.text("labelWarning"), texts.text("labelSelectDay"), texts.text("labelOk")).addEventListener("click",function(event){
                        event.preventDefault()
                        event.stopPropagation()
                        document.body.removeChild(document.getElementById("bcgrd"))
                    })  
        
                }

            })
            }
            //div to
            const divToTime = document.createElement("div")
            divToTime.setAttribute("id", "divToTime")
            divToTime.classList.add("divToTime")
            divToTime.innerHTML = texts.text("labelToTime")
            div110.appendChild(divToTime)

            //time end
            var divTimeEnd = document.createElement("div")
            divTimeEnd.setAttribute("id", "divTimeEnd")
            divTimeEnd.classList.add("divTime")
            div110.appendChild(divTimeEnd)
            if(avail.schedule_module == "dayModule"){
                divTimeEnd.innerHTML = "23:59"
            }else{                
                divTimeEnd.innerHTML = "-- : -- "

            divTimeEnd.addEventListener("click", function (event) {
                event.stopPropagation()
                event.preventDefault()
                var day = document.getElementById("btnShowSelectedDay")
                if (day) {
                    makeViewTimeHour(containerSchedule, selectedDay, avail, scheduleDeviceClicked , function (selectedTime) {
                        //
                        //continuar aqui com a reconstrução da div105 com a hora selecionado e botão editar...
                        //
                        divTimeEnd.innerHTML = selectedTime
                        divTimeEnd.style.color = "white"
                        var div106 = document.getElementById("div106")
                        containerSchedule.removeChild(div106)
                    })
                } else {
                    makePopUp(texts.text("labelWarning"), texts.text("labelSelectDay"), texts.text("labelOk")).addEventListener("click",function(event){
                        event.preventDefault()
                        event.stopPropagation()
                        document.body.removeChild(document.getElementById("bcgrd"))
                    })  
                }
            })
        }
        btnSave.addEventListener("click",function(){
            var dateStart = selectedDay + "T" + document.getElementById("divTimeStart").innerHTML;
            var dateEnd = selectedDay + "T" + document.getElementById("divTimeEnd").innerHTML;

            console.log("Hora inicio agendamento " + dateStart)
            console.log("Hora fim agendamento " + dateEnd)
            
            if(dateStart == "" || dateEnd == ""){
                makePopUp(texts.text("labelWarning"), texts.text("labelCompleteAll"), texts.text("labelOk")).addEventListener("click",function(event){
                    event.preventDefault()
                    event.stopPropagation()
                    document.body.removeChild(document.getElementById("bcgrd"))
                })      
             }
            else if(module == "schedule"){
                // componentizar esse bloco de codigo em uma função separada ~pietro
                var btnPopUp = makePopUp(texts.text("labelConfirmSchedule"), texts.text("labelScheduleComplete"), texts.text("labelConfirmSchedule"),texts.text("labelCancel"))
                btnPopUp.addEventListener("click",function(event){
                    event.stopPropagation()
                    event.preventDefault()
                    if(avail.schedule_module == "dayModule" ){ // agendamento para outro dia - dia todo 
                        var horaAtual = moment()
                        if(horaAtual.format("YYYY-MM-DD") != moment(selectedDay).format("YYYY-MM-DD")){
                            dateStart =  selectedDay + "T" + document.getElementById("divTimeStart").innerHTML;
                        }else{  // agendamento para hoje  - dia todo 
                            var horaAtual = moment()
                            horaAtual.add(2, 'minutes'); 
                            var horaFinal = horaAtual.format('HH:mm');
                            dateStart = selectedDay + "T" + horaFinal
                        }
                       
                    }
                    app.sendSrc({ api: "user", mt: "InsertDeviceSchedule", type: avail.schedule_module, data_start: dateStart, data_end: dateEnd, device: deviceHw, room: roomId, src: deviceHw  }, function (obj) {
                        app.sendSrc({ api: "user", mt: "SelectDevicesSchedule", ids: rooms, src: obj.src }, function (obj) {
                            schedules = JSON.parse(obj.result)
                            makeViewRoomDetail(roomId)
                        })
                })
                
            })
                 
            }else if(module == "update"){
                console.log("Update p banco " + JSON.stringify(updateSched.id))
                var btnPopUp = makePopUp(texts.text("labelConfirmSchedule"), texts.text("labelScheduleComplete"), texts.text("labelConfirmSchedule"),texts.text("labelCancel"))
                
                
                btnPopUp.addEventListener("click",function(event){
                    event.stopPropagation()
                    event.preventDefault()
                    console.log("ERICK UPDATESCHEDULE ST.D ED.D SCED.ID DEV.HWID", dateStart, dateEnd, updateSched.id, deviceHw)
                    console.log("Erick Teste madruga", availabilities.id )

                    app.send({ api: "user", mt: "UpdateDeviceSchedule", data_start: dateStart, data_end: dateEnd, schedID: updateSched.id , src: deviceHw })

                    var okPopUp = makePopUp(texts.text("labelMySchedules"), texts.text("labelScheduleDone"), texts.text("labelOk"),)
                    okPopUp.addEventListener('click',function(){
                        
                        updateDataStartById(updateSched.id, dateStart, dateEnd, deviceHw)
                        
                    })
                    // app.sendSrc({ api: "user", mt: "SelectDevicesSchedule", ids: rooms, src: obj.src }, function (obj) {
                    //     schedules = JSON.parse(obj.result)
                    //     makeViewRoomDetail(roomId)
                    // })
                    
                })

            }

            })
             
    }
    function updateDataStartById(id, dateStart, dateEnd, deviceHw) {
        for (var i = 0; i < mySchedules.length; i++) {
            if (mySchedules[i].id === id) {
                mySchedules[i].data_start = dateStart;
                mySchedules[i].data_end = dateEnd;
                mySchedules[i].device_id = deviceHw;
                break; // interrompe o loop após encontrar o item
            }
        }
        console.log("Erick Sched", mySchedules)
        makeUserSchedules(mySchedules)
    }
    //#endregion



    //#region Opções

    function makeDivOptions(rooms, devices, availabilities, schedules, viewers, editors) {
        that.clear();
        // backButton.addEventListener("click",function(event){
        //     event.preventDefault();
        //     event.stopPropagation();
        //     makeViewRoom(rooms,devices,availabilities,viewers)
        // })
        makeHeader(backButton, makeButton("", "", "./images/settings.svg"), texts.text("labelOptions"), function () {
            makeViewRoom(rooms, devices, availabilities, schedules, viewers, editors)
        })
        const divMain = document.createElement("div")
        divMain.classList.add("flex", "h-full", "p-1", "flex-col", "items-start", "sm:mx-[200px]", "gap-1")
        // criar sala
        //const divMakeRoom = document.createElement("div")
        //divMakeRoom.classList.add("flex", "p-1", "items-center", "gap-1", "rounded-lg", "bg-dark-200", "w-full")
        //const plusIcon = document.createElement("img")
        //plusIcon.src = './images/plus-circle.svg'
        //const labelMakeRoom = document.createElement("div")
        //labelMakeRoom.textContent = texts.text("labelCreateRoom")
        // provisioning code
        const divProvCode = document.createElement("div")
        divProvCode.classList.add("flex", "p-1", "items-center", "gap-1", "rounded-lg", "bg-dark-200", "w-full", "cursor-pointer")
        const provIcon = document.createElement("img")
        provIcon.src = './images/hash.svg'
        const labelProvCode = document.createElement("div")
        labelProvCode.setAttribute("id", "labelProvCode")
        labelProvCode.textContent = texts.text("labelProvCode")
        // tabela agendamento
        const divTableSched = document.createElement("div")
        divTableSched.classList.add("flex", "p-1", "items-center", "gap-1", "rounded-lg", "bg-dark-200", "w-full", "cursor-pointer")
        const schedIcon = document.createElement("img")
        schedIcon.src = './images/calendar-option.svg'
        const labelTableSched = document.createElement("div")
        labelTableSched.textContent = texts.text("labelTableSchedule")
        //aparencia
        //const divAppearance = document.createElement("div")
        //divAppearance.classList.add("flex", "p-1", "items-center", "gap-1", "rounded-lg", "bg-dark-200", "w-full")
        //const appearanceIcon = document.createElement("img")
        //appearanceIcon.src = './images/brush.svg'
        //const labelAppearance = document.createElement("div")
        //labelAppearance.setAttribute("id", "labelAppearance")
        //labelAppearance.textContent = texts.text("labelAppearance")


        //divMakeRoom.appendChild(plusIcon)
        //divMakeRoom.appendChild(labelMakeRoom)
        divProvCode.appendChild(provIcon)
        divProvCode.appendChild(labelProvCode)
        divTableSched.appendChild(schedIcon)
        divTableSched.appendChild(labelTableSched)
        //divAppearance.appendChild(appearanceIcon)
        //divAppearance.appendChild(labelAppearance)
        //divMain.appendChild(divMakeRoom)
        divMain.appendChild(divProvCode)
        divMain.appendChild(divTableSched)
        //divMain.appendChild(divAppearance)
        document.body.appendChild(divMain)

        //listeners
        //divMakeRoom.addEventListener("click", function (event) {
        //    event.preventDefault
        //    event.stopPropagation()
        //    createRoomContext()
        //})
        divProvCode.addEventListener("click", function (event) {
            event.preventDefault
            event.stopPropagation()
            getProvisioningCode(userSIP, "inn-lab-ipva IP Phone", "labelProvCode")
        })

        divTableSched.addEventListener("click", function (event) {
            event.preventDefault
            event.stopPropagation()

            nextSchedules(mySchedules)
            
        })

        //divAppearance.addEventListener('click', function (event) {
        //    event.preventDefault
        //    event.stopPropagation()
        //    makeDivAppearance()
        //})
    }
    function getProvisioningCode(sip, category, divId) {
        devicesApi.send({ mt: "GetProvisioningCode", sip: sip, category: category, div: divId })
    }
    //#endregion
}
Wecom.coolwork.prototype = innovaphone.ui1.nodePrototype;