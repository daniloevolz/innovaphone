
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.coolworkAdmin = Wecom.coolworkAdmin || function (start, args) {
    this.createNode("body");
    var that = this;
    var devHwId = [];
    var filesID = [];
    var filesURL = [];
    var filesURLFinal;

    var getAllClickedWeekDaysActive = true;
    var imgBD; // db files variaveis
    var controlDB = false ; // db files variaveis
    var inputDbFiles; // db files variaveis
    var listbox; // db files variaveis
    var filesToUpload = []; // db files variaveis
    var phone_list = [] // todos os devices
    var listDeviceRoom = []; 
    var list_AllRoom = []
    var list_room = [];
    var list_editors = [];
    var list_viewers = [];
    var list_RoomSchedule = []
    var list_tableUsers = []
    var userSIP;
    var userDN;
    var userDomain;

    var rooms = []
    var devices = []
    var availabilities = []
    var viewers = []
    //var devHwid = []

    var checkedUsers = []; 
    var checkedDevices = []

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

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;
    waitConnection(that);

    var devicesApi; // revisar - importante 

    var uriGateway;
    var startIndex;
    var firstPart;
    var secondPart;
    var secondPartFinal;
    var endPointEvent;
    var endPointStopEvent;

    //var apiPhone;
    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "admin", mt: "TableUsers" });
        //app.send({ api: "admin", mt: "CheckAppointment" });
        controlDB = false
        userDomain = domain
        userDN = dn
        userSIP = user
        devicesApi = start.consumeApi("com.innovaphone.devices");
        devicesApi.onmessage.attach(devicesApi_onmessage); // onmessage is called for responses from the API
        devicesApi.send({ mt: "GetPhones" }); // phonelist
        devicesApi.send({ mt: "GetGateways" });

        //apiPhone = start.consumeApi("com.innovaphone.events") // testes pietro

        app.send({api:"admin", mt:"SelectAllRoom"})
        app.send({api:"admin", mt:"SelectDevices"})
    }

    
    function devicesApi_onmessage(conn, obj) {
        console.log("devicesApi_onmessage: " + JSON.stringify(obj));
        if (obj.msg.mt == "GetPhonesResult") {
            var devices = obj.msg.phones;
            console.log("devicesApi_onmessage:GetPhonesResult " + JSON.stringify(devices));
            app.send({api:"admin", mt:"PhoneList", devices: devices})
        }
        if (obj.msg.mt == "GetProvisioningCodeResult") {
            var code = obj.msg.code;
            console.log("devicesApi_onmessage:GetProvisioningCodeResult " + JSON.stringify(code));
            var div = document.getElementById("labelProvCode")
            div.textContent = code
            setTimeout(returnText, 60000)
            var returnText = function () {
                div.textContent = texts.text("labelProvCode")
            }
        }
        if (obj.msg.mt == "GetGatewaysResult"){
            uriGateway = obj.msg.gateways[0].uri
           
            // Encontrar o índice da parte após "/devices/passthrough/"
            startIndex = uriGateway.indexOf("/devices/passthrough/") + "/devices/passthrough/".length;

            // Extrair a parte até "/devices/passthrough/"
            firstPart = uriGateway.substring(0, startIndex);

            // Extrair a parte após "/devices/passthrough/"
            secondPart = uriGateway.substring(startIndex);
            secondPartFinal = secondPart.split("/")
            endPointEvent = "/PHONE/CONF-UI/mod_cmd.xml?xsl=phone_ring.xsl&cmd=phone-ring&op=mezzo&tag=n:1"

            endPointStopEvent = "/PHONE/CONF-UI/mod_cmd.xml?xsl=phone_ring.xsl&cmd=phone-ring&op=stop&tag=n:1"

            console.log("Primeira parte:", firstPart);
            console.log("Segunda parte:", secondPartFinal);
            console.log("Endpoint EventoURL", endPointEvent )
        }
    }

    function app_message(obj) {
        // chamar todos que nao estão vinculados a uma sala para serem adicionados em outra
        if (obj.api === "admin" && obj.mt === "SelectDevicesResult") {
            phone_list = JSON.parse(obj.result)
            //makeDivAddDevices(phone_list)
        }
        // if (obj.api === "admin" && obj.mt === "SelectAllRoomResult") {
        //     list_AllRoom = JSON.parse(obj.result)
        //     makeViewRoom() 
        //     //constructor(that)
        //     //se precisar usar a tela do admin original  para criar salas é so descomentar essa função       
        // }
        if (obj.api == "admin" && obj.mt == "TableUsersResult") {
            list_tableUsers = JSON.parse(obj.result);        
            console.log("TABLEUSERS" + JSON.stringify(list_tableUsers))   
        }
        if(obj.api == "admin" && obj.mt == "SelectRoomsResult"){
             rooms = JSON.parse(obj.rooms)
             devices = obj.dev
             availabilities = JSON.parse(obj.availabilities)
             viewers = JSON.parse(obj.viewers)
             makeViewRoom(rooms,devices,availabilities,viewers)
        }
        if(obj.api == "admin" && obj.mt == "InsertRoomResult"){ 
            app.send({api:"admin", mt:"SelectAllRoom"})
            filesID = [] // limpeza da variavel para nao excluir a imagem antiga (a que acabou de ser adicionada)
            checkedUsers = []
            checkedDevices = []
        }
        if(obj.api == "admin" && obj.mt == "DeleteRoomSuccess"){  
            app.send({api:"admin", mt:"SelectAllRoom"})
        }
        if(obj.api == "admin" && obj.mt == "UpdateRoomAvailabilityResult"){  
            app.send({api:"admin", mt:"SelectAllRoom"})
        }
    } 

    //#region CRIAÇÃO DE SALA
    function makeDivCreateRoom(){
    checkedUsers = [] // limpar usuarios
    checkedDevices = [] // limpar devices

    that.clear()
    const btnCreateRoom = makeButton(texts.text("labelCreate"),"primary","")
    makeHeader(backButton,btnCreateRoom,texts.text("labelCreateRoom"))
    const divMain = document.createElement("div")
    divMain.classList.add("flex","h-full","p-1","flex-col","items-start","sm:mx-[200px]","gap-1")
    //nome da sala
    const divNameRoom = document.createElement("div")
    divNameRoom.classList.add("flex","p-1","flex-col","items-start","gap-1","bg-dark-200","rounded-lg","w-full")
    const labelNameRoom = document.createElement("div")
    labelNameRoom.textContent = texts.text("labelNameRoom")
    const iptNameRoom = makeInput("","text","Nome da sala")
    iptNameRoom.id = "iptNameRoom"
    // imagem da sala
    const divImgRoom = document.createElement("div")
    divImgRoom.classList.add("flex","p-1","items-center","justify-between","bg-dark-200","rounded-lg","w-full")
    const labelImgRoom = document.createElement("div")
    labelImgRoom.textContent = texts.text("labelImageRoom")
    const nameImgDiv = document.createElement("div")
    nameImgDiv.textContent = texts.text("labelNoImageSelected")
    const divBtnChoose = makeButton(texts.text("labelChoose"),"primary","")
    var imgRoom;

    divBtnChoose.addEventListener("click",function(){
        console.log("Abrir Div Escolher Imagem")
        makeDivChooseImage(function(selectedImg){ //callback da função
            imgRoom = selectedImg
        },function(name){
            nameImgDiv.textContent = name
        })
    })
    // tipo de sala
    const divTypeRoom = document.createElement("div")
    divTypeRoom.classList.add("flex","p-1","items-center","justify-between","bg-dark-200","rounded-lg","w-full")
    const labelTypeRoom = document.createElement("div")
    labelTypeRoom.textContent = texts.text("labelTypeRoom")
    const divButtons = document.createElement("div")
    divButtons.classList.add("justify-evenly","flex","gap-1")
    const btnPeriod = makeButton(texts.text("labelPeriod"),"secundary","")
        btnPeriod.id = "periodType"
    const btnRecurrent = makeButton(texts.text("labelRecurrent"),"tertiary","")
    btnRecurrent.id = "recurrentType"

    var typeRoom = "periodType";
    btnPeriod.addEventListener("click", function(event) {
        typeOfRoomButtons(event, btnPeriod, btnRecurrent,function(selectedButton){
            typeRoom = selectedButton.id
        });
    });
    btnRecurrent.addEventListener("click", function(event) {
        typeOfRoomButtons(event, btnPeriod, btnRecurrent,function(selectedButton){
            typeRoom = selectedButton.id
        });
    });
            

    // usuarios
    var viewers = []
    const divUsersRoom = document.createElement("div")
    divUsersRoom.classList.add("flex","p-1","items-center","justify-between","bg-dark-200","rounded-lg","w-full")
    const labelUsersRoom = document.createElement("div")
    labelUsersRoom.textContent = texts.text("labelUsers")
    const divUsersToAdd = document.createElement("div")
    divUsersToAdd.id = "divUsersToAdd"
    const divBtnAddUsers = makeButton(texts.text("labelAdd"),"primary","")
    divBtnAddUsers.addEventListener("click",function(){
        console.log("Abrir Div Add Usuários")
        makeDivAddUsers(function(viewer){ //callback da função 
            viewers = viewer
            console.log("Variavel Viewers para envio ao banco" + "\n" + JSON.stringify(viewers))
            divUsersToAdd.innerHTML = ''
            makeAvatar(viewer,divUsersToAdd)
        })
    })
    //horario agendamento 
    const divHourSchedule = document.createElement("div")
    divHourSchedule.classList.add("flex","p-1","items-center","justify-between","bg-dark-200","rounded-lg","w-full")
    const labelHourSchedule = document.createElement("div")
    labelHourSchedule.textContent = texts.text("labelHourSchedule")
    const divShowHourAvailability = document.createElement("div")
    divShowHourAvailability.textContent = texts.text("NoHourSelected")
    divShowHourAvailability.classList.add("flex")
    const btnMakeCalendar = makeButton(texts.text("labelEdit"),"primary","")
    var typeSchedule;
    var dateAvailability;
    btnMakeCalendar.addEventListener("click",function(){
        makeDivAddAvailability(null,null,typeRoom,function(date){ //callback da função 
            dateAvailability;
            dateAvailability = date
            console.log("DATE AVAILABILITY: " + JSON.stringify(dateAvailability))
            //console.log(date)
            //console.log("Hora inicio: " , date[0].start , "Hora Fim: " , date[0].end)
            divShowHourAvailability.textContent = moment(dateAvailability[0].start).format("YYYY-MM-DD HH:mm") + " " + 
            moment(dateAvailability[0].end).format("YYYY-MM-DD HH:mm")
        },function(sched){
            typeSchedule = sched
        })
        console.log("Abrir Calendario")
    })
    // devices
    const divAddDevices = document.createElement("div")
    divAddDevices.classList.add("flex","p-1","items-center","justify-between","bg-dark-200","rounded-lg","w-full")
    const labelAddDevices = document.createElement("div")
    labelAddDevices.textContent = texts.text("labelDevices")
    const divBtnAddDevices = makeButton(texts.text("labelAdd"),"primary","")
    divBtnAddDevices.addEventListener("click",function(){
        console.log("Abrir div add devices")
        makeDivAddDevices(phone_list)
    })
    //appends
    divNameRoom.appendChild(labelNameRoom)
    divNameRoom.appendChild(iptNameRoom)
    divImgRoom.appendChild(labelImgRoom)
    divImgRoom.appendChild(nameImgDiv)
    divImgRoom.appendChild(divBtnChoose)

    divButtons.appendChild(btnPeriod)
    divButtons.appendChild(btnRecurrent)

    divTypeRoom.appendChild(labelTypeRoom)
    divTypeRoom.appendChild(divButtons)

    // divTypeSchedule.appendChild(labelTypeSchedule) colocar na tela de agendamento
    // divTypeSchedule.appendChild(btnDaySchedule) colocar na tela de agendamento
    // divTypeSchedule.appendChild(btnHourSchedule) colocar na tela de agendamento
    divUsersRoom.appendChild(labelUsersRoom)
    divUsersRoom.appendChild(divUsersToAdd)
    divUsersRoom.appendChild(divBtnAddUsers)
    divHourSchedule.appendChild(labelHourSchedule)
    divHourSchedule.appendChild(divShowHourAvailability)
    divHourSchedule.appendChild(btnMakeCalendar)
    divAddDevices.appendChild(labelAddDevices)
    divAddDevices.appendChild(divBtnAddDevices)

    divMain.appendChild(divNameRoom)
    divMain.appendChild(divImgRoom)
    divMain.appendChild(divTypeRoom)
    // divMain.appendChild(divTypeSchedule) colocar na tela de agendamento
    divMain.appendChild(divUsersRoom)
    divMain.appendChild(divHourSchedule)
    divMain.appendChild(divAddDevices)

    document.body.appendChild(divMain)

    btnCreateRoom.addEventListener("click",function(event){
        var viewerGuids = viewers.map(viewer => viewer.viewer_guid);

        const nomeSala = document.getElementById("iptNameRoom").value
        if(nomeSala == "" || nomeSala == null || nomeSala.length < 3 || imgRoom == "" || typeRoom == "" || typeSchedule == "" || viewers == "" || dateAvailability == ""){
        makePopUp(texts.text("labelWarning"), texts.text("labelCompleteAll"), texts.text("labelOk")).addEventListener("click",function(event){
            event.preventDefault()
            event.stopPropagation()
            document.body.removeChild(document.getElementById("bcgrd"))
        })      
        }
        else if(typeRoom == "periodType"){
            
            app.send({ api: "admin", mt: "InsertRoom", 
            name: nomeSala, 
            img: imgRoom, 
            dateStart: dateAvailability[0].start, 
            dateEnd: dateAvailability[0].end, 
            type: typeRoom, 
            schedule: typeSchedule, 
            viewer: viewerGuids,
            device : devHwId
            }); //viewer: viewer 
        }else if (typeRoom == "recurrentType") {
            console.log("dateAvailability " + JSON.stringify(dateAvailability));
        
            // Inicialize objetos para armazenar todos os horários de disponibilidade combinados
            let combinedAvailability = {
                startMonday: [],
                startTuesday: [],
                startWednesday: [],
                startThursday: [],
                startFriday: [],
                startSaturday: [],
                startSunday: [],
                endMonday: [],
                endTuesday: [],
                endWednesday: [],
                endThursday: [],
                endFriday: [],
                endSaturday: [],
                endSunday: []
            };
        
            // Combine os horários de disponibilidade de todas as salas
            dateAvailability.forEach(function(availability) {
                for (let key in availability) {
                    combinedAvailability[key].push(availability[key]);
                }
            });
        
            // Envie uma única mensagem com todos os horários de disponibilidade combinados
            app.send({
                api: "admin",
                mt: "InsertRoom",
                name: nomeSala,
                img: imgRoom,
                type: typeRoom,
                schedule: typeSchedule,
                startMonday: combinedAvailability.startMonday.join(", "),
                startTuesday: combinedAvailability.startTuesday.join(", "),
                startWednesday: combinedAvailability.startWednesday.join(", "),
                startThursday: combinedAvailability.startThursday.join(", "),
                startFriday: combinedAvailability.startFriday.join(", "),
                startSaturday: combinedAvailability.startSaturday.join(", "),
                startSunday: combinedAvailability.startSunday.join(", "),
                endMonday: combinedAvailability.endMonday.join(", "),
                endTuesday: combinedAvailability.endTuesday.join(", "),
                endWednesday: combinedAvailability.endWednesday.join(", "),
                endThursday: combinedAvailability.endThursday.join(", "),
                endFriday: combinedAvailability.endFriday.join(", "),
                endSaturday: combinedAvailability.endSaturday.join(", "),
                endSunday: combinedAvailability.endSunday.join(", "),
                viewer: viewerGuids,
                device: devHwId
            });
        }
        
        // app.send({ api: "admin", mt: "InsertRoom", 
        // name: nameRoom, 
        // img: srcDaImagem, 
        // dateStart: dateStart, 
        // dateEnd: dateEnd, 
        // type: optType, 
        // schedule: optModule, 
        // editor: editor, 
        // viewer: viewer });
    })
    }
    function makeDivAddUsers(viewers) {
        const insideDiv = document.createElement("div");
        insideDiv.classList.add("bg-black", "bg-opacity-50", "justify-center", "items-center", "absolute", "h-full", "w-full", "top-0", "flex");
    
        const divMain = document.createElement("div");
        divMain.classList.add("inline-flex", "p-3", "flex-col", "flex-start", "gap-1", "rounded-lg", "bg-dark-100", "w-full", "m-3", "md:m-96");
    
        const titleUsers = document.createElement("div");
        titleUsers.textContent = texts.text("labelUsers");
        titleUsers.classList.add("text-3", "text-white", "font-bold");
    
        const iptSearch = makeInput("", "search", texts.text("labelIptSearch"));
        iptSearch.classList.add("w-full");
        iptSearch.addEventListener("input", function () {
            const filter = this.value.trim();
            if (filter === "") {
                searchItems(list_tableUsers, 'scrollUsers', 'user', filter);
            } else {
                const filteredUsers = list_tableUsers.filter(user => user.cn.toLowerCase().includes(filter.toLowerCase()));
                searchItems(filteredUsers, 'scrollUsers', 'user', filter);
            }
        });
    
        const selectAllUsers = document.createElement("div");
        selectAllUsers.classList.add("flex", "justify-between", "items-center");
    
        const nameOfUsers = document.createElement("div");
        nameOfUsers.classList.add("text-3", "text-white", "font-bold");
        nameOfUsers.textContent = texts.text("labelNameOfUsers");
    
        const divLabelandCheckbox = document.createElement("div");
        divLabelandCheckbox.classList.add("flex", "w-[145px]", "p-1", "justify-between", "items-center");
        const labelSelectAllUsers = document.createElement("div");
        labelSelectAllUsers.textContent = texts.text("labelSelectAll");
        labelSelectAllUsers.classList.add("text-3", "text-white", "font-bold");
    
        const checkboxAllUsers = makeInput("", "checkbox", "");
    
        const scrollUsers = document.createElement("div");
        scrollUsers.id = 'scrollUsers';
        scrollUsers.classList.add("overflow-y-auto", "h-[200px]", "gap-1", "flex-col", "flex");
    
        // ordem alfabética
        list_tableUsers.sort((a, b) => a.cn.localeCompare(b.cn));
    
        list_tableUsers.forEach(function (user) {
            const divMainUsers = createUserElement(user); // Use a função createUserElement para criar elementos de usuário
            scrollUsers.appendChild(divMainUsers);
        });
    
        const divManage = document.createElement("div");
        divManage.classList.add("flex", "p-1", "justify-between", "items-center", "rounded-lg", "bg-dark-200");
        const textManage = document.createElement("div");
        textManage.classList.add("text-3", "font-bold", "text-white");
        textManage.textContent = texts.text("labelManageFunctions");
        const btnManage = makeButton(texts.text("labelEdit"), "secundary", "");
    
        const divButtons = document.createElement("div");
        divButtons.classList.add("flex", "justify-between", "items-center", "rounded-md");
        const buttonCancel = makeButton(texts.text("labelBtnCancel"), "secundary", "");
        buttonCancel.addEventListener("click", function () {
            console.log("Fechar Tela");
            checkedUsers = [];
            document.getElementById("divUsersToAdd").innerHTML = ''
            document.body.removeChild(insideDiv);
        });
    
        checkboxAllUsers.addEventListener("click", function () {
            // Obtém o estado atual do checkbox "Selecionar Todos os Usuários"
            const isChecked = this.checked;
    
            // Marca ou desmarca todos os checkboxes de usuários dependendo do estado do checkbox "Selecionar Todos os Usuários"
            document.querySelectorAll(".checkboxUser").forEach(function (checkbox) {
                checkbox.checked = isChecked;
            });
    
            // Verifica se algum usuário está marcado
            const algumMarcado = Array.from(document.querySelectorAll(".checkboxUser")).some(checkbox => checkbox.checked);
    
            // Se nenhum usuário estiver marcado, desmarca o checkbox "Selecionar Todos os Dispositivos"
            if (!algumMarcado) {
                checkboxAllUsers.checked = false;
            }

             // Adiciona ou remove todos os usuários da lista de usuários selecionados
                if (isChecked) {
                    // Se o checkbox "Selecionar Todos os Usuários" está marcado, adiciona todos os usuários ao checkedUsers
                    checkedUsers = list_tableUsers.map(user => {
                        return {
                            viewer_guid: user.guid,
                            sip: user.sip,
                            cn: user.cn
                        };
                    });
                } else {
                    // Se o checkbox "Selecionar Todos os Usuários" está desmarcado, limpa o checkedUsers
                    checkedUsers = [];
                }

        });
    
        const buttonConfirm = makeButton(texts.text("labelConfirm"), "primary", "");
        buttonConfirm.addEventListener("click", function () {
            // var viewer = [];
            viewers(checkedUsers);
            document.body.removeChild(insideDiv);
             
        });
    
        //appends
        divButtons.appendChild(buttonCancel);
        divButtons.appendChild(buttonConfirm);
        divManage.appendChild(textManage);
        divManage.appendChild(btnManage);
        divLabelandCheckbox.appendChild(labelSelectAllUsers);
        divLabelandCheckbox.appendChild(checkboxAllUsers);
        selectAllUsers.appendChild(nameOfUsers);
        selectAllUsers.appendChild(divLabelandCheckbox);
        divMain.appendChild(titleUsers);
        divMain.appendChild(iptSearch);
        divMain.appendChild(selectAllUsers);
        divMain.appendChild(scrollUsers);
        divMain.appendChild(divManage);
        divMain.appendChild(divButtons);
        insideDiv.appendChild(divMain);
        document.body.appendChild(insideDiv);
    }
    
    function makeDivAddAvailability(update,avail,typeRoom,dateTime,typeSchedule){
        getAllClickedWeekDaysActive = true
        // mudará conforme o tipo de sala ( RECORRENTE OU PERÍODO )
        const insideDiv = document.createElement("div")
        insideDiv.classList.add("bg-black", "bg-opacity-50", "justify-center","items-center","absolute","h-full","w-full","top-0","flex");
        
        const divMain = document.createElement("div")
        divMain.classList.add("inline-flex","p-3","flex-col","flex-start","gap-1","rounded-lg","bg-dark-100")

        if(typeRoom == "periodType"){
            const titleSchedule = document.createElement("div")
            titleSchedule.textContent = texts.text("labelSchedulePeriod")
            titleSchedule.classList.add("text-3","text-white" ,"font-bold")
            const divCalendar = document.createElement("div")
            
            var selectedDay;
            Calendar.createCalendar(divCalendar,"all","",function(day){
                selectedDay = "";
                selectedDay = day
                console.log("Dia Selecionado " + JSON.stringify(selectedDay))
                
            },"availability",null)
            
            const divTypeSchedule = document.createElement("div")
            divTypeSchedule.classList.add("flex","p-1","items-center","justify-between","bg-dark-200","rounded-lg","w-full")
            const labelTypeSchedule = document.createElement("div")
            labelTypeSchedule.textContent = texts.text("labelTypeSchedule")
            const btnDaySchedule = makeButton(texts.text("labelDay"),"tertiary","")
            btnDaySchedule.id = "dayModule"
            const btnHourSchedule = makeButton(texts.text("labelHour"),"secundary","")
            btnHourSchedule.id = "hourModule"
            
           
            const divHourSelect = document.createElement("div")
            divHourSelect.classList.add("flex","p-1","flex-col","gap-1","items-start","bg-dark-200","rounded-lg")
            const divHourSelectLabel = document.createElement("div")
            divHourSelectLabel.classList.add("text-1","font-bold","text-white")
            divHourSelectLabel.textContent = texts.text("labelSelectHour")

            const divTime = document.createElement("div")
            divTime.classList.add("flex","justify-center","items-center","gap-1")

            var dates = []; 
            var dataStart;
            var dataEnd; 
            const divTimeStart = makeInput("00:00","time","")
            // divTimeStart.classList.add("flex","p-1","flex-col","items-center","gap-1","rounded-lg","bg-dark-400","text-3")
            // divTimeStart.textContent = '-- : --'
                divTimeStart.addEventListener("change",function(event){
                    if(selectedDay == null || selectedDay == undefined){
                        this.value = ''
                        makePopUp(texts.text("labelWarning"), texts.text("labelSelectDay"), texts.text("labelOk")).addEventListener("click",function(event){
                            event.preventDefault()
                            event.stopPropagation()
                            document.body.removeChild(document.getElementById("bcgrd"))
                        })  
                    }
                    else if(divTimeEnd.value < divTimeStart.value && divTimeEnd.value != ''){
                        this.value = ''
                        makePopUp(texts.text("labelWarning"), texts.text("labelDaySmaller"), texts.text("labelOk")).addEventListener("click",function(event){
                            event.preventDefault()
                            event.stopPropagation()
                            document.body.removeChild(document.getElementById("bcgrd"))
                        })  
                    }else{
                        dataStart = selectedDay.startDate + "T" + this.value
                        console.log("DATA START INPUT CHANGE "  , dataStart)
                    }
                })
            
            
            const divToTime = document.createElement("div")
            divToTime.classList.add("text-white","text-2")
            divToTime.textContent = texts.text("labelToTime")

            const divTimeEnd  = makeInput("00:00","time","")
                divTimeEnd.addEventListener("change",function(event){
                    if(divTimeStart.value == null || divTimeStart.value == undefined || divTimeStart.value == ''){
                        this.value = ''
                        makePopUp(texts.text("labelWarning"), texts.text("labelSelectDivStart"), texts.text("labelOk")).addEventListener("click",function(event){
                            event.preventDefault()
                            event.stopPropagation()
                            document.body.removeChild(document.getElementById("bcgrd"))
                        })  
                    }
                    else if(divTimeStart.value > divTimeEnd.value && divTimeStart.value != ''){
                        this.value = ''
                        makePopUp(texts.text("labelWarning"), texts.text("labelDayBigger"), texts.text("labelOk")).addEventListener("click",function(event){
                            event.preventDefault()
                            event.stopPropagation()
                            document.body.removeChild(document.getElementById("bcgrd"))
                        })  
                    }else{
                        dataEnd = selectedDay.endDate + "T" + this.value
                        console.log("DATA END INPUT CHANGE " + dataEnd)
                        
                        dates.push({
                            start: dataStart,
                            end: dataEnd
                        })
                        console.log(JSON.stringify(dates))
                    }
                })

            // if(avail){ 
            //     var typeSched = avail;
            // }else{
            //     
            // }
            var typeSched = "hourModule"

            btnDaySchedule.addEventListener("click", function(event) {
                typeOfRoomButtons(event, btnDaySchedule, btnHourSchedule ,function(selectedButton){
                    typeSched = selectedButton.id
                    console.log("TYPE SCHED" + typeSched)
                    divMain.removeChild(divHourSelect)
                });
            });

            btnHourSchedule.addEventListener("click", function(event) {
                typeOfRoomButtons(event, btnDaySchedule, btnHourSchedule ,function(selectedButton){
                    typeSched = selectedButton.id
                    console.log("TYPE SCHED" + typeSched)
                    //divMain.removeChild(divHourSelect)
                    divMain.appendChild(divHourSelect)
                    divMain.removeChild(divButtons)
                    divMain.appendChild(divButtons)
                });
            });

            const divButtons = document.createElement("div")
            divButtons.classList.add("flex","justify-between","items-center","rounded-md")
            const buttonCancel = makeButton(texts.text("labelBtnCancel"),"secundary","")
            buttonCancel.addEventListener("click",function(){
            document.dispatchEvent(new Event("limparLista"));
            console.log("Fechar Tela")
            document.body.removeChild(insideDiv)
            
            })
            const buttonConfirm = makeButton(texts.text("labelConfirm"),"primary","")
            buttonConfirm.addEventListener("click",function(){
            typeSchedule(typeSched)
            console.log("typeSched " ,typeSched)
            if(typeSched === "hourModule"){

                if(dates.length > 0){
                    dateTime(dates)
                    console.log("Hour Module")
                    document.body.removeChild(insideDiv)
                }else{
                    makePopUp(texts.text("labelWarning"), texts.text("labelMustSelectHour"), texts.text("labelOk")).addEventListener("click",function(event){
                        event.preventDefault()
                        event.stopPropagation()
                        document.body.removeChild(document.getElementById("bcgrd"))
                    })  
                }
               
            }
            else if(typeSched === "dayModule"){
                
                if(selectedDay){
                    dates = []
                    dates.push({
                        start: selectedDay.startDate + "T" + "00:00",
                        end:  selectedDay.endDate + "T" + "23:59"
                    })
                    console.log( "DATES TIPO DIA " + JSON.stringify(dates))
                    dateTime(dates)
                    console.log("Day Module")
                    document.body.removeChild(insideDiv)
                    document.dispatchEvent(new Event("limparLista"));
                }else{
                    makePopUp(texts.text("labelWarning"), texts.text("labelSelectDay"), texts.text("labelOk")).addEventListener("click",function(event){
                        event.preventDefault()
                        event.stopPropagation()
                        document.body.removeChild(document.getElementById("bcgrd"))
                    })  
                }
            }
            
            })
            divButtons.appendChild(buttonCancel)
            divButtons.appendChild(buttonConfirm)
            divTime.appendChild(divTimeStart)
            divTime.appendChild(divToTime)
            divTime.appendChild(divTimeEnd)
            divHourSelect.appendChild(divHourSelectLabel)
            divHourSelect.appendChild(divTime)
            divTypeSchedule.appendChild(labelTypeSchedule)
            divTypeSchedule.appendChild(btnDaySchedule)
            divTypeSchedule.appendChild(btnHourSchedule)

            divMain.appendChild(titleSchedule)
            divMain.appendChild(divCalendar)
            divMain.appendChild(divTypeSchedule)
            divMain.appendChild(divHourSelect)
            divMain.appendChild(divButtons)
            insideDiv.appendChild(divMain)
        }
        else if(typeRoom == "recurrentType"){
            var daysSelected = [] // armazenar os dias clicados
            var datesRecurrent = []

            const titleSchedule = document.createElement("div")
            titleSchedule.textContent = texts.text("labelScheduleRecurrent")
            titleSchedule.classList.add("text-3","text-white" ,"font-bold")
            const divDaysWeek = document.createElement("div")
            divDaysWeek.classList.add("flex","p-1","items-start")

            var week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

            week.forEach(function (w) {
                const dayDiv = document.createElement('div')
                dayDiv.classList.add("flex", "w-[40px]", "h-[40px]", "p-1", "flex-col", "items-center", "justify-center", "gap-1","rounded-full","recurrentText","dayDiv")
                dayDiv.setAttribute("day-week", w)
                dayDiv.setAttribute("id", w)
                // const dayText = document.createElement('p')
                dayDiv.classList.add("font-Montserrat", "text-base", "font-bold", "leading-normal", 'leading-normal', "color-dark-400")
                dayDiv.textContent = texts.text(`${w + "Abrev"}`)
                //dayDiv.appendChild(dayText)
                divDaysWeek.appendChild(dayDiv)
            })
    
            const divTypeSchedule = document.createElement("div")
            divTypeSchedule.classList.add("flex","p-1","items-center","justify-between","bg-dark-200","rounded-lg","w-full")
            const labelTypeSchedule = document.createElement("div")
            labelTypeSchedule.textContent = texts.text("labelTypeSchedule")
            const btnDaySchedule = makeButton(texts.text("labelDay"),"tertiary","")
            btnDaySchedule.id = "dayModule"
            const btnHourSchedule = makeButton(texts.text("labelHour"),"secundary","")
            btnHourSchedule.id = "hourModule"
            

            const divHourSelect = document.createElement("div")
            divHourSelect.classList.add("flex","p-1","flex-col","gap-1","items-start","bg-dark-200","rounded-lg")
            const divHourSelectLabel = document.createElement("div")
            divHourSelectLabel.classList.add("text-1","font-bold","text-white")
            divHourSelectLabel.textContent = texts.text("labelSelectHour")

            const divTime = document.createElement("div")
            divTime.classList.add("flex","justify-center","items-center","gap-1")

            // var dates = []; 
            // var dataStart;
            // var dataEnd; 

            const divTimeStart = makeInput("00:00","time","")
            // divTimeStart.classList.add("flex","p-1","flex-col","items-center","gap-1","rounded-lg","bg-dark-400","text-3")
            // divTimeStart.textContent = '-- : --'
            divTimeStart.addEventListener("change", function (event) {
                if (daysSelected.length > 0) {
                    console.log("Contém algo");
                    var startTime = this.value;
                    
                    daysSelected.forEach(function (dayDiv) {
                        var dayId = dayDiv.getAttribute("id");
            
                        switch (dayId) {
                            case "Monday":
                                datesRecurrent.push({ startMonday : startTime });
                                break;
                            case "Tuesday":
                                datesRecurrent.push({ startTuesday: startTime });
                                break;
                            case "Wednesday":
                                datesRecurrent.push({ startWednesday : startTime });
                                break;
                            case "Thursday":
                                datesRecurrent.push({ startThursday : startTime });
                                break;
                            case "Friday":
                                datesRecurrent.push({ startFriday : startTime });
                                break;
                            case "Saturday":
                                datesRecurrent.push({ startSaturday : startTime });
                                break;
                            case "Sunday":
                                datesRecurrent.push({ startSunday : startTime });
                                break;
                            default:
                                break;
                        }
                    });
                }else{
                    makePopUp(texts.text("labelWarning"),texts.text("labelSelectDayRecurrent"), "ok").addEventListener("click",function(event){
                        event.preventDefault()
                        event.stopPropagation()
                        document.body.removeChild(document.getElementById("bcgrd"))
                    }) 
                    this.value = "--:--" 
                }
            })
            const divToTime = document.createElement("div")
            divToTime.classList.add("text-white","text-2")
            divToTime.textContent = texts.text("labelToTime")

            const divTimeEnd  = makeInput("00:00","time","")
                divTimeEnd.addEventListener("change",function(event){
                    if (daysSelected.length > 0) {
                        console.log("Contém algo");
                        var endTime = this.value;
                        
                        daysSelected.forEach(function (dayDiv) {
                            var dayId = dayDiv.getAttribute("id");
                
                            switch (dayId) {
                                case "Monday":
                                    datesRecurrent.push({ endMonday : endTime });
                                    break;
                                case "Tuesday":
                                    datesRecurrent.push({ endTuesday: endTime });
                                    break;
                                case "Wednesday":
                                    datesRecurrent.push({ endWednesday : endTime });
                                    break;
                                case "Thursday":
                                    datesRecurrent.push({ endThursday : endTime });
                                    break;
                                case "Friday":
                                    datesRecurrent.push({ endFriday : endTime });
                                    break;
                                case "Saturday":
                                    datesRecurrent.push({ endSaturday : endTime });
                                    break;
                                case "Sunday":
                                    datesRecurrent.push({ endSun : endTime });
                                    break;
                                default:
                                    break;
                            }
                        });
                    }else{
                        makePopUp(texts.text("labelWarning"),texts.text("labelSelectDayRecurrent"), "ok").addEventListener("click",function(event){
                            event.preventDefault()
                            event.stopPropagation()
                            document.body.removeChild(document.getElementById("bcgrd"))
                        })  
                        this.value = "--:--" 
                    }
                })

            
            // isso nos dois modelos de agendamento
            const divEditRecurrent = document.createElement("div")
            divEditRecurrent.classList.add("flex","p-1","items-center","justify-between","bg-dark-200","rounded-lg","w-full")
            const labelHourSchedule = document.createElement("div")
            labelHourSchedule.textContent = texts.text("labelHourIndividual")
            const btnEditRecurrentDay = makeButton(texts.text("labelEdit"),"secundary","")
     
            
            const divButtons = document.createElement("div")
            divButtons.classList.add("flex","justify-between","items-center","rounded-md")
            const buttonCancel = makeButton(texts.text("labelBtnCancel"),"secundary","")
            buttonCancel.addEventListener("click",function(){
                console.log("Fechar Tela")
                document.body.removeChild(insideDiv)
                
            })

            const buttonConfirm = makeButton(texts.text("labelConfirm"),"primary","")
            buttonConfirm.addEventListener("click",function(){
                typeSchedule(typeSched)

                const inputs = document.querySelectorAll('.inputIndividualHour');
                
                if(inputs.length > 0){

                    datesRecurrent = [] // limpeza

                    inputs.forEach(function(input, index) {

                        const dataDay = input.dataset.day;
                        const startTime = input.value;
                        //var endTime;
                        // Verifica se o próximo input na lista é para o horário de fim
                        const nextInput = inputs[index + 1];
                        if (nextInput && nextInput.dataset.day === dataDay) {
                            const endTime = nextInput.value;
                            console.log("DIA DA SEMANA  " + dataDay + " Hora inicio " + startTime + " Hora fim " + endTime);
    
                            // daysSelected.forEach(function (dayDiv) {
                                
                            //     console.dir("Todas Divs dentro do DaySelected" + dayDiv)
                                
                            recurrentDatesAvail(dataDay,datesRecurrent,startTime,endTime)
                           // });
                        } else {
                            console.log("Não há um próximo input ou é para um dia diferente");
                        }
    
    
                    });

                }
                
                if(typeSched == "hourModule"){
                    dateTime(datesRecurrent)
                    console.log("Hour Module")
                }else{
                    daysSelected.forEach(function(days){
                        var dayId = days.getAttribute("id");
                        var startDayTime = "00:00"
                        var EndDayTime = "23:59"
                        recurrentDatesAvail(dayId,datesRecurrent,startDayTime,EndDayTime)
                    })
                    dateTime(datesRecurrent) 
                    
                    console.log("DayModule " + "Datas" + JSON.stringify(datesRecurrent))
                }
                
                // implementar a lógica de quando for o dia inteiro para o recorrente aqui
                // ~ pietro

                // else if(typeSched = "dayModule"){
                //     datesRecurrent = []
                //     datesRecurrent.push({
                //         start: selectedDay.startDate + "T" + "00:00",
                //         end:  selectedDay.endDate + "T" + "23:59"
                //     })
                //     console.log( "DATES TIPO DIA " + JSON.stringify(dates))
                //     dateTime(dates)
                //     console.log("day Module")
              
                // }


                document.body.removeChild(insideDiv)
            })
    
            //  divButtons.appendChild(buttonCancel)
            //     divButtons.appendChild(buttonConfirm)
            divTime.appendChild(divTimeStart)
            divTime.appendChild(divToTime)
            divTime.appendChild(divTimeEnd)
            divHourSelect.appendChild(divHourSelectLabel)
            divHourSelect.appendChild(divTime)
            divButtons.appendChild(buttonCancel)
            divButtons.appendChild(buttonConfirm)
            divTypeSchedule.appendChild(labelTypeSchedule)
            divTypeSchedule.appendChild(btnDaySchedule)
            divTypeSchedule.appendChild(btnHourSchedule)
            divEditRecurrent.appendChild(labelHourSchedule)
            divEditRecurrent.appendChild(btnEditRecurrentDay)
            divMain.appendChild(titleSchedule)
            divMain.appendChild(divDaysWeek)
            divMain.appendChild(divTypeSchedule)
            divMain.appendChild(divHourSelect)
            divMain.appendChild(divEditRecurrent)
            divMain.appendChild(divButtons)
            //divMain.appendChild(divButtons)
            insideDiv.appendChild(divMain)
            var typeSched = "hourModule";
            btnDaySchedule.addEventListener("click", function(event) {
                typeOfRoomButtons(event, btnDaySchedule, btnHourSchedule ,function(selectedButton){
                    typeSched = selectedButton.id
                    divMain.removeChild(divHourSelect)
                    divMain.removeChild(divEditRecurrent)
                    datesRecurrent = []
                });
            });

            btnHourSchedule.addEventListener("click", function(event) {
                typeOfRoomButtons(event, btnDaySchedule, btnHourSchedule ,function(selectedButton){
                    typeSched = selectedButton.id
                    // caso o usuario clique no botão "Hora" ele iria duplicar entao adicionaremos aqui diretamente
                    divMain.appendChild(divHourSelect)
                    divMain.removeChild(divButtons)
                    divMain.appendChild(divEditRecurrent)
                    //divMain.removeChild(divEditRecurrent)        
                    divMain.appendChild(divButtons)
                });
            }); 


            btnEditRecurrentDay.addEventListener("click",function(){
                divMain.removeChild(divTypeSchedule)
                divMain.removeChild(divHourSelect)
                divMain.removeChild(divEditRecurrent)
                const divAllHours = document.createElement("div") // div com scroll
                divAllHours.classList.add("flex","overflow-auto","height-[250px]","flex-col","items-start","gap-1")
                divMain.removeChild(divButtons)
                divMain.appendChild(divAllHours)
                divMain.appendChild(divButtons)
               // vamos passar isso para uma função separado para evitar duplicidade de funções
               //(DRY - Don't Repeat Yourself)
               getAllClickedWeekDaysActive = false;
               Array.from(divDaysWeek.children).forEach(function(child){
                child.removeEventListener("click",child)
                child.classList.remove("dayDiv")
                child.classList.add("individualDiv")
               })

                individualWeekDays(daysSelected, "individual", divAllHours);
                typeSched = "hourModule";

            })
        }
        document.body.appendChild(insideDiv)
      
        // depois que adiciona tudo no body, chamaremos a função para aplicar o click nos
        // dias recorrentes 
        getAllClickedWeekDays(daysSelected);
        
    }
    function makeDivChooseImage(callback,nameImg){
        // filesID = [] // limpeza
        controlDB = false
        const insideDiv = new innovaphone.ui1.Div(null, null, "bg-black bg-opacity-50 justify-center items-center absolute h-full w-full top-0 flex");

        const divMain = new innovaphone.ui1.Div(null, null, "inline-flex p-3 flex-col flex-start gap-1 rounded-lg bg-dark-100");
    
        const titleImg = new innovaphone.ui1.Div(null, texts.text("labelImageRoom"), "text-3 text-white font-bold");
    
        const mainImg = new innovaphone.ui1.Node("img", null,"","h-[260px] rounded-lg aspect-[3/4]");
        mainImg.setAttribute("src", './images/MESA-1.png');
        mainImg.setAttribute("id", "divMainImg");
    
        const divSelectImgs = new innovaphone.ui1.Div(null,null,"flex w-full items-start gap-1 flex-row");

        const imgNameMap = [
            {src: './images/MESA-1.png' , imgName: "MESA-1" },
            {src: './images/MESA-2.png' , imgName: "MESA-2" },
            {src: './images/MESA-3.png' , imgName: "MESA-3" }
        ]
        
        const img1 = createImage(imgNameMap[0].src);
        const img2 = createImage(imgNameMap[1].src);
        const img3 = createImage(imgNameMap[2].src);

        img1.addEvent("click", function (event) {
            addBorderAndChangeImage(img1, mainImg, imgNameMap[0].src);
        });
    
        img2.addEvent("click", function (event) {
            addBorderAndChangeImage(img2, mainImg, imgNameMap[1].src);
        });
    
        img3.addEvent("click", function (event) {
            addBorderAndChangeImage(img3, mainImg, imgNameMap[2].src);
        });

        const divIptImage = new innovaphone.ui1.Div(null,null,"flex p-1 justify-between items-center rounded-lg bg-dark-200");
        const labelImportImg = new innovaphone.ui1.Div(null, texts.text("labelImportImg"));
        const customFileInput = new innovaphone.ui1.Node("label",null,texts.text("labelChoose"),"bg-dark-300 hover:bg-dark-400 text-primary-600 font-bold py-1 px-2 rounded-lg cursor-pointer");
        inputDbFiles = customFileInput.add(new innovaphone.ui1.Node("input","display:none", "", ""));
        inputDbFiles.setAttribute("id", "fileinput").setAttribute("type", "file");
        inputDbFiles.setAttribute("accept","image/*")
        inputDbFiles.container.addEventListener('change', onSelectFile, false);
        // input.style.display = "none";

        //input = divGeral.add(new innovaphone.ui1.Node("input", null, "", ""));
        //     input.setAttribute("id", "fileinput").setAttribute("type", "file");
        //     input.setAttribute("accept", "image/*");
        //     input.container.addEventListener('change', onSelectFile, false);
        app.sendSrc({ mt: "SqlInsert", statement: "insert-folder", args: { name: "myFolder" }} , folderAdded);

        const divButtons = new innovaphone.ui1.Div(null,null,"flex justify-between items-center rounded-md");
        const buttonCancel = new innovaphone.ui1.Node("button","",texts.text("labelBtnCancel"), "bg-dark-300 hover:bg-dark-400 text-primary-600 font-bold py-1 px-2 rounded-lg")
        buttonCancel.addEvent("click", function () {
            console.log("Fechar Tela");
            that.rem(insideDiv);
            console.log("Files ID " + filesID)
            deleteFile(filesID) 
        });
        const buttonConfirm = new innovaphone.ui1.Node("button","",texts.text("labelConfirm"),"bg-primary-600 hover:bg-primary-500  text-dark-100  font-medium  py-1 px-2 rounded-lg primary")
        buttonConfirm.addEvent("click", function () {
            var mainImgSrc = document.getElementById("divMainImg").getAttribute("src")  
            var foundMatch = false  
            for (const item of imgNameMap) {
                if(item.src == mainImgSrc){
                    nameImg(item.imgName)
                    foundMatch = true 
                    filesID = []
                    break;
                }
                
            }
            if (!foundMatch) {
                //nameImg(mainImgSrc);
                nameImg(filesURLFinal)
            }

            callback(mainImgSrc);

            that.rem(insideDiv);
            //filesID = []
        });

        divSelectImgs.add(img1);
        divSelectImgs.add(img2);
        divSelectImgs.add(img3);
        divIptImage.add(labelImportImg);
        divIptImage.add(customFileInput);
        divButtons.add(buttonCancel);
        divButtons.add(buttonConfirm);
        divMain.add(titleImg);
        divMain.add(mainImg);
        divMain.add(divSelectImgs);
        divMain.add(divIptImage);
        divMain.add(divButtons);
        insideDiv.add(divMain);

        that.add(insideDiv);

        if (filesID != "") {
            mainImg.setAttribute("src", start.originalUrl + "/files/" + filesID);
        }

    }
    function makeDivAddDevices(devices){
        // consultar os devices  
        
        const insideDiv = document.createElement("div")
        insideDiv.classList.add("bg-black", "bg-opacity-50", "justify-center","items-center","absolute","h-full","w-full","top-0","flex");
        
        const divMain = document.createElement("div")
        divMain.classList.add("inline-flex","p-3","flex-col","flex-start","gap-1","rounded-lg","bg-dark-100","w-full","m-3","md:m-96")

        const titleDevices = document.createElement("div")
        titleDevices.textContent = texts.text("labelUsers")
        titleDevices.classList.add("text-3","text-white" ,"font-bold")

        const iptSearch = makeInput("","search",texts.text("labelIptSearch"))
        iptSearch.classList.add("w-full")
        iptSearch.addEventListener("input", function () {
            const filter = this.value.trim();
            if (filter === "") {
                searchItems(devices,'scrollDevices','device',filter);
            } else {
                //const filteredUsers = list_tableUsers.filter(user => user.cn.toLowerCase().includes(filter.toLowerCase()));
                searchItems(devices, 'scrollDevices', 'device', filter);

            }
        });

        const selectAllDevices = document.createElement("div")
        selectAllDevices.classList.add("flex","justify-between","items-center")

        const nameOfDevices = document.createElement("div")
        nameOfDevices.classList.add("text-3","text-white" ,"font-bold")
        nameOfDevices.textContent = texts.text("labelNameOfDevices")

        const divLabelandCheckbox = document.createElement("div")
        divLabelandCheckbox.classList.add("flex","w-[145px]","p-1","justify-between","items-center")
        const labelSelectAllDevices = document.createElement("div")
        labelSelectAllDevices.textContent = texts.text("labelSelectAll")
        labelSelectAllDevices.classList.add("text-3","text-white" ,"font-bold")

        const checkboxAllDevices = makeInput("","checkbox","")
       
        const scrollDevices = document.createElement("div")
        scrollDevices.id = "scrollDevices"
        scrollDevices.classList.add("overflow-y-auto","h-[250px]","gap-1","flex-col","flex")



        devices.forEach(function(dev){
            
            const divMainDevices = document.createElement("div")
            divMainDevices.setAttribute("id",dev.hwid)
            divMainDevices.classList.add("flex","gap-1","justify-between","items-center","border-b-2","border-dark-400","p-1")
            const divImgDevice = document.createElement("div")
            divImgDevice.classList.add("flex","items-center","gap-1")
            const imgDevice = document.createElement("img");
            imgDevice.src = './images/device-admin.png'
            //imgDevice.classList.add("w-5", "h-5", "rounded-full");
            const nameDevice = document.createElement("div")
            nameDevice.textContent = dev.name
                const divCheckbox = document.createElement("div")
            divCheckbox.classList.add("flex", "gap-1" ,"items-center")
            const identifyBtn = makeButton(texts.text("labelIdentify"),"primary","")
            identifyBtn.id = dev.hwid
            identifyBtn.addEventListener("click",function(){
                    console.log("ID " + this.id)

                    var requestURL = firstPart + this.id + "/" + secondPartFinal[1] + endPointEvent
                    console.log("URL")
                
                    fetch( requestURL, {
                        method: 'GET',
                        headers: {}
                    })
                    setTimeout(function(){
                        var stopReq = firstPart + this.id + "/" + secondPartFinal[1] + endPointStopEvent
                        fetch( stopReq, {
                            method: 'GET',
                            headers: {}
                        })
                    },1000)
                // apiPhone.send({ mt: "StartCall", sip: "vitor" })
            })
            const checkboxDevice = makeInput("","checkbox","")
            checkboxDevice.setAttribute("id",'checkboxDev_' + dev.hwid)
            checkboxDevice.classList.add("checkboxDev")

            // Verificar se o usuário está marcado e marcar o checkbox, se necessário
                if (checkedDevices.includes(dev.hwid)) {
                    checkboxDevice.checked = true;
                }

                // Event listener para marcar/desmarcar usuários
                checkboxDevice.addEventListener("change", function () {
                    if (this.checked) {
                        checkedDevices.push(dev.hwid);
                    } else {
                        checkedDevices = checkedDevices.filter(hwid => hwid !== dev.hwid);
                    }
                });

            
            divCheckbox.appendChild(identifyBtn)
            divCheckbox.appendChild(checkboxDevice)
            divImgDevice.appendChild(imgDevice)
            divImgDevice.appendChild(nameDevice)
            divMainDevices.appendChild(divImgDevice);
            divMainDevices.appendChild(divCheckbox);
            scrollDevices.appendChild(divMainDevices)
        }) 

        // checkboxAllDevices.addEventListener("click",function(){
        //     document.querySelectorAll(".checkboxDev").forEach(function(checkbox){
        //         if(!checkbox.checked){
        //             checkbox.checked = true
        //             this.checked = true
        //         }
        //         else if(checkboxAllDevices.checked || !checkbox.checked){
        //             checkbox.checked = true
        //             this.checked = true
        //         }
        //         else if(!checkboxAllDevices.checked && checkbox.checked){
        //             checkbox.checked = true
        //             this.checked = true
        //         }
        //         else{
        //             checkbox.checked = false
        //             this.checked = false
        //         }
        //     })
        // })

        checkboxAllDevices.addEventListener("click", function () {
            // Obtém o estado atual do checkbox "Selecionar Todos os Dispositivos"
            const isChecked = this.checked;
        
            // Marca ou desmarca todos os checkboxes de dispositivos dependendo do estado do checkbox "Selecionar Todos os Dispositivos"
            document.querySelectorAll(".checkboxDev").forEach(function (checkbox) {
                checkbox.checked = isChecked;
            });
        
            // Verifica se algum dispositivo está marcado
            const algumMarcado = Array.from(document.querySelectorAll(".checkboxDev")).some(checkbox => checkbox.checked);
        
            // Se nenhum dispositivo estiver marcado, desmarca o checkbox "Selecionar Todos os Usuários"
            if (!algumMarcado) {
                checkboxAllDevices.checked = false;
            }

            if (isChecked) {
                // Se o checkbox "Selecionar Todos os Dispositivos" está marcado, adiciona todos os dispositivos ao checkedDevices
                checkedDevices = devices.map(dev => dev.hwid);
            } else {
                // Se o checkbox "Selecionar Todos os Dispositivos" está desmarcado, limpa o checkedDevices
                checkedDevices = [];
            }

            
        });
        
        
        const divButtons = document.createElement("div")
        divButtons.classList.add("flex","justify-between","items-center","rounded-md")
        const buttonCancel = makeButton(texts.text("labelBtnCancel"),"secundary","")
        buttonCancel.addEventListener("click",function(){
            checkedDevices = []
            console.log("Fechar Tela")
            document.body.removeChild(insideDiv)
            
        })
        const buttonConfirm = makeButton(texts.text("labelConfirm"),"primary","")
        buttonConfirm.addEventListener("click",function(){ 
                devHwId = checkedDevices 
                console.log(JSON.stringify(devHwId))
                document.body.removeChild(insideDiv)
        })


        //appends
        divButtons.appendChild(buttonCancel)
        divButtons.appendChild(buttonConfirm)
        divLabelandCheckbox.appendChild(labelSelectAllDevices)
        divLabelandCheckbox.appendChild(checkboxAllDevices)
        selectAllDevices.appendChild(nameOfDevices)
        selectAllDevices.appendChild(divLabelandCheckbox)
        divMain.appendChild(titleDevices)
        divMain.appendChild(iptSearch)
        divMain.appendChild(selectAllDevices)
        divMain.appendChild(scrollDevices)
        divMain.appendChild(divButtons)
        insideDiv.appendChild(divMain)
        document.body.appendChild(insideDiv)
    }
    //#endregion CRIAÇÃO DE SALA

    //#region VISUALIZAÇÃO DE SALA
    function makeViewRoom(rooms, devices, availabilities,viewers) {
        that.clear();
        const btnMenu = makeButton('','',"./images/settings.svg")
        const btnHome = makeButton("","","./images/home.svg")
        btnHome.addEventListener("click",function(event){
            event.preventDefault();
            event.stopPropagation();
            makeViewRoom(rooms,devices,availabilities,viewers)
        })
        makeHeader(btnHome, btnMenu , texts.text("labelYourRooms"))
        btnMenu.addEventListener("click",function(){
            console.log("click")
            makeDivOptions()
        })

        if(rooms.length > 0) {
            const divIptSearch = document.createElement("div")
            divIptSearch.classList.add("flex", "items-center" ,"justify-between" , "rounded-lg","p-1")
            const inputSearch = makeInput(null,"search",texts.text("labelSearchYourRoom"))
            inputSearch.classList.add("w-full")
            divIptSearch.appendChild(inputSearch)
            document.body.appendChild(divIptSearch)

            inputSearch.addEventListener("input", function(event) {
                const searchText = event.target.value.toLowerCase();
                const divsRoom = document.querySelectorAll('[room]');
                
                divsRoom.forEach(function(div) {
                    const roomName = div.querySelector('h1').textContent.toLowerCase();
    
                    if (roomName.includes(searchText)) {
                        div.style.display = "flex"; // Mostrar a div da sala
                    } else {
                        div.style.display = "none"; // Ocultar a div da sala
                    }
                });
            });
        
            
        }
        // div container (scroll)
        const container = document.createElement("div")
        container.classList.add("overflow-auto","grid","gap-2","sm:grid-cols-2","md:grid-cols-4")
        container.style.height = 'calc(100vh - 120px)'
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
    function makeViewCalendarInfo(divMain, availability) {
        availability.forEach(function (a) {
            if (a.type == "periodType") {

                // div disponibilidade periodo
                const divMainAvailabilityPeriod = document.createElement("div")
                divMainAvailabilityPeriod.classList.add("flex", "p-2", "items-center", "justify-between", "bg-dark-100", "rounded-lg")
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
        })
        var avail = availabilities.filter(function (avl) {
            return id == avl.room_id
        })[0];

        var availArray = availabilities.filter(function (avl) {
            return id == avl.room_id
        });
        // var sched = schedules.filter(function (sched) {
        //     return id == sched.device_room_id
        // });
        var viws = viewers.filter(function (viws) {
            return id == viws.room_id
        })

        that.clear();
        backButton.addEventListener("click",function(event){
            event.stopPropagation()
            event.preventDefault()
            makeViewRoom(rooms,devices,availabilities,viewers)
        })
        const btnUpdateRoom = makeButton(texts.text("save"),"primary","")
        makeHeader(backButton, btnUpdateRoom , room.name)
        // div container
        const container = document.createElement("div")
        container.classList.add("overflow-auto", "gap-1", "grid", "sm:grid-cols-2","sm:grid-rows-6", "m-1","content-start",)
        container.style.height = 'calc(100vh - 70px)'
        container.setAttribute("id", "container")
        
        // div sala
        const divMainSala = document.createElement("div")
        divMainSala.classList.add("aspect-[4/3]", "bg-dark-200", "rounded-lg", "divMainSala","sm:row-span-6","p-2","justify-start","items-start","min-w-[220px]","h-full","w-full")

        const divImg = document.createElement("div")
        divImg.classList.add("w-[100%]","h-[100%]", "bg-center", "bg-cover", "bg-no-repeat", "rounded-lg", "divSala","sm:bg-[length:606px_455px]")
        divImg.setAttribute("style", `background-image: url(${room.img});`);
        divImg.setAttribute("id","divImg")

        //div horario
        const divHour = document.createElement("div")
        divHour.classList.add("flex","p-1","items-center","justify-between","bg-dark-200","rounded-lg","w-full")
        makeViewCalendarInfo(divHour,availArray)
        //"sm:col-start-2","sm:row-start-3"

        //div devices
        const divDevices  = document.createElement("div")
        divDevices.classList.add("bg-dark-200","flex","justify-center","sm:row-span-2","sm:col-start-2","items-center","flex-col","rounded-lg")

        // identficar e adicionar devices
        const divOptDevices = document.createElement("div")
        divOptDevices.classList.add("flex","p-1","items-center","justify-between","bg-dark-200","rounded-lg","w-full")
        const labelOptDevices = document.createElement("div")
        labelOptDevices.classList.add("font-bold","text-white")
        labelOptDevices.textContent = texts.text("labelDevices")
        const divButtonsOpt = document.createElement("div")
        divButtonsOpt.classList.add("flex","justify-center","items-center","gap-2")
        const btnIdentify = makeButton(texts.text("labelIdentify"),"secundary","")
        //btnPeriod.id = "periodType"
        const btnAddDevices = makeButton(texts.text("labelAdd"),"primary","")
       // btnRecurrent.id = "recurrentType"
        const divAllDevices = document.createElement("div")
        divAllDevices.classList.add("flex","justify-center","items-center","gap-2","flex-wrap","overflow-auto")

       divButtonsOpt.appendChild(btnIdentify)
       divButtonsOpt.appendChild(btnAddDevices)
       divMainSala.appendChild(divImg)
       divOptDevices.appendChild(labelOptDevices)
       divOptDevices.appendChild(divButtonsOpt)
       divDevices.appendChild(divOptDevices)
       divDevices.appendChild(divAllDevices)

        devs.forEach(function (device) {
            makeViewDevice(divAllDevices,device)
        })
        
        //editar horario disponibilidade
        const divHourSchedule = document.createElement("div")
        divHourSchedule.classList.add("flex","p-1","items-center","justify-between","sm:col-start-2","sm:row-start-4","bg-dark-200","rounded-lg","w-full")
        const labelHourSchedule = document.createElement("div")
        labelHourSchedule.textContent = texts.text("labelRoomAvailability")
        const btnMakeCalendar = makeButton(texts.text("labelEdit"),"primary","")
        var dateAvailability;
        var typeSchedule;
        btnMakeCalendar.addEventListener("click",function(){
            makeDivAddAvailability("update",avail,avail.type,function(date){
                dateAvailability = date
                console.log("DATE AVAILABILITY: " + JSON.stringify(dateAvailability))
                //console.log(date)
                //console.log("Hora inicio: " , date[0].start , "Hora Fim: " , date[0].end)
            },function(sched){
                typeSchedule = sched
            })
            console.log("Abrir Calendario")
        })

        //deletar sala 
        const divDeleteRoom = document.createElement("div")
        divDeleteRoom.classList.add("flex","p-1","items-center","justify-between","sm:col-start-2","sm:row-start-5","bg-dark-200","rounded-lg","w-full")
        const labelDeleteRoom = document.createElement("div")
        labelDeleteRoom.textContent = texts.text("labelDeleteRoom")
        const btnDeleteRoom = makeButton(texts.text("labelDelete"),"destructive","")
        btnDeleteRoom.addEventListener("click",function(){
             // componentizar esse bloco de codigo em uma função separada ~pietro
             var btnPopUp = makePopUp(texts.text("labelYouSure"), texts.text("labelDeleteRoom"), texts.text("labelYesDelete"),texts.text("labelNo"))
             btnPopUp.addEventListener("click",function(event){
                 event.stopPropagation()
                 event.preventDefault()
                 app.sendSrc({ api: "admin", mt: "DeleteRoom", id: id ,src: id }, function (obj) {
                     })
             })
        })

         //editar sala  
         const divEditRoom = document.createElement("div")
         divEditRoom.classList.add("flex","p-1","items-center","justify-between","bg-dark-200","sm:col-start-2","sm:row-start-6","rounded-lg","w-full")
         const labelEditRoom = document.createElement("div")
         labelEditRoom.textContent = texts.text("labelEditRoom")
         const btnEditRoom = makeButton(texts.text("labelEdit"),"primary","")
         btnEditRoom.addEventListener("click",function(ev){
            makeDivEditRoom(room.name,avail.type)
            console.log("EDITAR A SALA TODA")
         })

        divHourSchedule.appendChild(labelHourSchedule)
        divHourSchedule.appendChild(btnMakeCalendar)
        divDeleteRoom.appendChild(labelDeleteRoom)
        divDeleteRoom.appendChild(btnDeleteRoom)
        divEditRoom.appendChild(labelEditRoom)
        divEditRoom.appendChild(btnEditRoom)
        container.appendChild(divMainSala)
        container.appendChild(divHour)
        container.appendChild(divDevices)
        container.appendChild(divHourSchedule)
        container.appendChild(divDeleteRoom)
        container.appendChild(divEditRoom)
        document.body.appendChild(container);

        // btnAddDevices.addEventListener("click", function () {
        //     document.querySelectorAll(".div93").forEach(function (div) {
        //         console.log("Elemento selecionado:", div);
        //         div.setAttribute("draggable", "true");
        //         div.addEventListener("drag",function(event){
        //             console.log("Agarrou")
        //             event.dataTransfer.setData("text", event.target.id);
        //         })
        //         });
        //     });
            btnAddDevices.addEventListener("click", function () {
                
              

                // document.querySelectorAll(".div93").forEach(function (div) {
                //     console.log("Elemento selecionado:", div);
                //     div.setAttribute("draggable", "true");
                //     div.addEventListener("drag", function(event){
                //         console.log("Iniciou o arraste");
                //         event.dataTransfer.setData("text", event.target.id);
                //     });
                // });


                // document.getElementById("divImg").addEventListener("dragover", function(ev) {
                //     console.log("Sobre a área de drop");
                //     ev.preventDefault(); // Evite o comportamento padrão
                // });
    
                // document.getElementById("divImg").addEventListener("drop", function(ev) {
                //     console.log("DROP");
                //     ev.preventDefault(); // Evite o comportamento padrão
                //     var data = ev.dataTransfer.getData("text");
                //     var draggedElement = document.getElementById(data);
                    
                //     // Obtenha a posição do mouse em relação à divMainSala
                //     var offsetX = ev.clientX - divMainSala.getBoundingClientRect().left;
                //     var offsetY = ev.clientY - divMainSala.getBoundingClientRect().top;
                    
                //     // Posicione o elemento na divMainSala na posição do mouse
                //     draggedElement.style.position = 'absolute';
                //     draggedElement.style.left = offsetX + 'px';
                //     draggedElement.style.top = offsetY + 'px';
                    
                //     // Adicione o elemento à divMainSala
                //     divMainSala.appendChild(draggedElement);
                // });

            });

            var phoneElements = document.querySelectorAll('.div93');
            phoneElements.forEach(function (phoneElement) {
                phoneElement.draggable = true;
                phoneElement.addEventListener("dragstart",drag,true)
                
            });
            

            document.getElementById("divImg").addEventListener("dragover",allowDrop,true)
            document.getElementById("divImg").addEventListener("drop",drop,true)
            

            btnUpdateRoom.addEventListener("click",function(){

                // if(avail.type == "periodType"){
                //     app.send({
                //         api: "admin", mt: "UpdateRoomAvailability", 
                //         datastart: dateAvailability[0].start, 
                //         dataend: dateAvailability[0].end,
                //         schedModule: typeSchedule,
                //         roomID: id
                //     })
                // }    
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
    
    //#endregion VISUALIZAÇÃO DE SALA

    //#region COMPONENTES
    function makePopUp(title, msg, btn1, btn2){
        const bcgrd = document.createElement("div")
        bcgrd.setAttribute("id","bcgrd")
        bcgrd.classList.add("absolute","w-full","h-full", "justify-center", "items-center", "top-0", "left-0", "flex", "z-1000", "bg-blue-500", "bg-opacity-40")
    
        const popUp = document.createElement("div")
        popUp.classList.add("inline-flex", "p-3", "flex-col", "items-center", "gap-1", "rounded-lg", "bg-dark-100", "m-1")
        const titlePopUp = document.createElement("div") // aplicar tipografia 
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
    function makeHeader(imgLeft,imgRight,title,callback){
        // construção do header
    
        const header = document.createElement("header")
        header.classList.add("bg-dark-200" ,"m-1" ,"flex", "items-center", "justify-between", "p-1", "rounded-lg")
    
        //construção da div com o titulo e imgHome
        const divTitle = document.createElement("div")
        divTitle.classList.add("flex","items-center","justify-start", "gap-1")
    
        //imgHome
        const leftElement = imgLeft
        leftElement.addEventListener("click", function (event) {
            event.stopPropagation()
            event.preventDefault()
            callback()
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
                button.classList.add("bg-primary-600", "hover:bg-primary-500", "text-dark-100", "font-medium", "py-1", "px-2", "rounded-lg","primary");
                break;
            case "secundary":
                button.classList.add("bg-dark-300", "hover:bg-dark-400", "text-primary-600", "font-bold", "py-1", "px-2", "rounded-lg");
                break;
            case "tertiary":
                button.classList.add("border-2","border-dark-400", "hover:bg-dark-500", "text-dark-400", "font-bold", "py-1", "px-2", "rounded-lg");
                break
            case "destructive":
                button.classList.add("bg-red-500", "hover:bg-red-700", "text-primary-600", "font-bold", "py-1", "px-2", "rounded-lg");
                break;
            case "transparent":
                button.classList.add("bg-transparent", "hover:bg-gray-100", "text-gray-700", "font-bold", "py-1", "px-2", "rounded-lg");
                break;
            default:
                button.classList.add("hover:bg-dark-300", "rounded-lg");
                break;
        }

        return button;
    }
    function makeInput(text,variant,placeHolder){
        const input = document.createElement("input")
        input.textContent = text
        input.placeholder = placeHolder
        input.type = variant

        switch (variant) {
            case "text":
                input.classList.add("flex","p-1","flex-col","items-start","gap-1","bg-white","rounded-lg","w-full","text-dark-100")
                break
            case "file":
                input.style.display = "none";
                const customFileInput = document.createElement("label");
                customFileInput.textContent = text;
                customFileInput.classList.add("bg-dark-300", "hover:bg-dark-400", "text-primary-600", "font-bold", "py-1", "px-2", "rounded-lg", "cursor-pointer");
                customFileInput.appendChild(input);
                return customFileInput;
            case "time":
                input.classList.add("text-black","rounded-lg")
                break
            case "checkbox":
                input.classList.add("w-[16px]","h-[16px]","rounded-md");
                break
            case "search":
                input.classList.add("flex","p-1","justify-between","items-center","rounded-md","bg-white","text-dark-100")

        }

        return input;
    
    }
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
    //botão voltar (arrow)
    var backButton = makeButton('', '', './images/arrow-left.svg');
    //#endregion COMPONENTES

    //#region FUNÇÕES INTERNAS
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
                app.sendSrc({ api: "user", mt: "InsertDeviceSchedule", type: avail.schedule_module, data_start: dateStart, data_end: dateEnd, device: deviceHw, room: roomId, src: deviceHw  }, function (obj) {
                    
                    // componentizar esse bloco de codigo em uma função separada ~pietro
                    var btnPopUp = makePopUp(texts.text("labelConfirmSchedule"), texts.text("labelScheduleComplete"), texts.text("labelConfirmSchedule"),texts.text("labelCancel"))
                    btnPopUp.addEventListener("click",function(event){
                        event.stopPropagation()
                        event.preventDefault()
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

    // função de visualização dos devices da sala
    function makeViewDevice(divMain,device){
         //div 93
         const div93 = document.createElement("div")
         div93.classList.add("div93")
        div93.setAttribute("id", device.id)

        // div93.style.top = device.topoffset
         //div93.style.left = device.leftoffset

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

         const divNameDevice = document.createElement("div")
         divNameDevice.classList.add("text-black","font-bold")
         divNameDevice.textContent = device.name
         var deviceIcon = document.createElement("img")
         deviceIcon.classList.add("deviceIcon")
         deviceIcon.draggable = false
         deviceIcon.setAttribute("src", "./images/" + device.product + ".png")
         div93.appendChild(div82)
         div82.appendChild(divNameDevice)
         div82.appendChild(deviceIcon)
 
         divMain.appendChild(div93)
    }
    function makeDeviceIcon(divMain, device, viewer) {
        //div 93
        const div93 = document.createElement("div")
        div93.classList.add("div93")
        div93.setAttribute("id", device.id)
        div93.style.top = device.topoffset
        div93.style.left = device.leftoffset
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
    }
    // função genérica para busca de usuarios e devices no input search



    function searchItems(arrayItems, idTable, itemType, filter = "") {
        const scroll = document.getElementById(idTable);
        scroll.innerHTML = '';

        arrayItems.forEach(function (item) {
            if (itemType === "user" && item.cn && item.cn.toLowerCase().includes(filter.toLowerCase())) {
                const divMainUsers = createUserElement(item);
                scroll.appendChild(divMainUsers);
            } else if (itemType === "device" && item.name && item.name.toLowerCase().includes(filter.toLowerCase())) {
                const divMainDevices = createDeviceElement(item);
                scroll.appendChild(divMainDevices);
            }
        });
    }

    function createUserElement(user) {
        const divMainUsers = document.createElement("div");
        divMainUsers.classList.add("flex", "gap-1", "justify-between", "items-center", "border-b-2", "border-dark-400", "p-1");
        const divUsersAvatar = document.createElement("div");
        divUsersAvatar.classList.add("flex", "gap-1", "items-center");
        let avatar = new innovaphone.Avatar(start, user.sip, userDomain);
        let UIuserPicture = avatar.url(user.sip, 120, user.cn);
        const imgAvatar = document.createElement("img");
        imgAvatar.setAttribute("src", UIuserPicture);
        imgAvatar.setAttribute("id", "divAvatar");
        imgAvatar.classList.add("w-5", "h-5", "rounded-full");
        const nameUser = document.createElement("div");
        nameUser.textContent = user.cn;
        const checkboxUser = makeInput("", "checkbox", "");
        checkboxUser.setAttribute("id", "viewercheckbox_" + user.guid);
        checkboxUser.classList.add("checkboxUser");

        // Verificar se o usuário está marcado e marcar o checkbox, se necessário
        if (checkedUsers.find(u => u.viewer_guid === user.guid)) {
            checkboxUser.checked = true;
        }

        // Event listener para marcar/desmarcar usuários
        checkboxUser.addEventListener("change", function () {
            if (this.checked) {
                // Adicionar o user.guid a checkedUsers quando o checkbox for marcado
                checkedUsers.push({ viewer_guid: user.guid, sip: user.sip, cn: user.cn });
            } else {
                // Remover o user.guid de checkedUsers quando o checkbox for desmarcado
                checkedUsers = checkedUsers.filter(u => u.viewer_guid !== user.guid);
            }
        });
        
        divUsersAvatar.appendChild(imgAvatar);
        divUsersAvatar.appendChild(nameUser);
        divMainUsers.appendChild(divUsersAvatar);
        divMainUsers.appendChild(checkboxUser);
        return divMainUsers;
    }
    
    
    function createDeviceElement(device) {
        const divMainDevice = document.createElement("div");
        divMainDevice.classList.add("flex", "gap-1", "justify-between", "items-center", "border-b-2", "border-dark-400", "p-1");
        const divDeviceIcon = document.createElement("div");
        divDeviceIcon.classList.add("flex", "gap-1", "items-center");
        // Suponha que você tenha uma função para obter o ícone do dispositivo com base em seu tipo
        const imgDeviceIcon = document.createElement("img");
        imgDeviceIcon.src = './images/device-admin.png'
        imgDeviceIcon.setAttribute("id", "divDeviceIcon");
        //imgDeviceIcon.classList.add("w-5", "h-5", "rounded-full");

        const nameDevice = document.createElement("div");
        nameDevice.textContent = device.name;
        const checkboxDevice = makeInput("", "checkbox", "");
        checkboxDevice.setAttribute("id", "viewercheckbox_" + device.hwid);
        checkboxDevice.classList.add("checkboxDevice");
    
        // Verificar se o dispositivo está marcado e marcar o checkbox, se necessário
        if (checkedDevices.includes(device.hwid)) {
            checkboxDevice.checked = true;
        }
    
        // Event listener para marcar/desmarcar dispositivos
        checkboxDevice.addEventListener("change", function () {
            if (this.checked) {
                // Adicionar o device.id a checkedDevices quando o checkbox for marcado
                checkedDevices.push(device.hwid);
            } else {
                // Remover o device.id de checkedDevices quando o checkbox for desmarcado
                checkedDevices = checkedDevices.filter(hwid => hwid !== device.hwid);
            }
        });
    
        divDeviceIcon.appendChild(imgDeviceIcon);
        divDeviceIcon.appendChild(nameDevice);
        divMainDevice.appendChild(divDeviceIcon);
        divMainDevice.appendChild(checkboxDevice);
        return divMainDevice;
    }
    
    

    //função REUTILIZAVEL para enviar as datas recorrentes para o banco 
    function recurrentDatesAvail(dataDay,datesRecurrent,startTime,endTime){
        switch (dataDay) {
            case "Monday":
                datesRecurrent.push({ startMonday : startTime });
                datesRecurrent.push({ endMonday : endTime });
                break;
            case "Tuesday":
                datesRecurrent.push({ startTuesday: startTime });
                datesRecurrent.push({ endTuesday : endTime });
                break;
            case "Wednesday":
                datesRecurrent.push({ startWednesday : startTime });
                datesRecurrent.push({ endWednesday : endTime });
                break;
            case "Thursday":
                datesRecurrent.push({ startThursday : startTime });
                datesRecurrent.push({ endThursday : endTime });
                break;
            case "Friday":
                datesRecurrent.push({ startFriday : startTime });
                datesRecurrent.push({ endFriday : endTime });
                break;
            case "Saturday":
                datesRecurrent.push({ startSaturday : startTime });
                datesRecurrent.push({ endSaturday : endTime });
                break;
            case "Sunday":
                datesRecurrent.push({ startSunday : startTime });
                datesRecurrent.push({ endSunday : endTime });
                break;
            default:
                break;
        }
    }
    function individualWeekDays(daysSelected,individualHour,divAllHours){
        if(individualHour == "individual"){
            daysSelected = [];
            document.querySelectorAll(".individualDiv").forEach(function(i){
                if(i.classList.contains("bg-dark-400")){
                    console.log("Está Pintada ")
                    i.classList.remove("bg-dark-400")
                }
                var marked = false;
                i.removeEventListener("click", i)
                i.addEventListener("click",function(event){          
                if(!marked){ 
                    // se marked for falso
                    event.preventDefault()
                    event.stopPropagation()
                    console.log("Clicando")
                    i.classList.add("rounded-full","bg-dark-400")
                    marked = true
                    daysSelected.push(i)
                    var dayId = i.getAttribute("id"); // ids das divs
                    console.log("DaysSelectedArray Individual " + daysSelected)
                    // const divAllHours = document.createElement("div") // div com scroll
                    // divAllHours.classList.add("flex","overflow-auto","height-[250px]","flex-col","items-start","gap-1")
    
                    const divHourSelectLabel = document.createElement("div")
                    divHourSelectLabel.classList.add("text-1","font-bold","text-white")
                    divHourSelectLabel.textContent = texts.text("labelSelectHourTo") + " " +  texts.text("label" + dayId + "Div")
                        
                    const divIndividualHours = document.createElement("div")
                    divIndividualHours.classList.add("flex","p-1","flex-col","items-start","gap-1","rounded-lg","bg-dark-200","w-full")
                    divIndividualHours.setAttribute("id",dayId)
                    
                    const divTimeInputs = document.createElement("div")
                    divTimeInputs.classList.add("flex","justify-center","items-center","gap-1")
        
                    const divTimeStart = makeInput("00:00","time","")
                    divTimeStart.classList.add("inputIndividualHour")
                    const divToTime = document.createElement("div")
                    divToTime.classList.add("text-white","text-2")
                    divToTime.textContent = texts.text("labelToTime")
                    const divTimeEnd  = makeInput("00:00","time","")
                    divTimeEnd.classList.add("inputIndividualHour")
                    divTimeInputs.appendChild(divTimeStart)
                    divTimeInputs.appendChild(divToTime)
                    divTimeInputs.appendChild(divTimeEnd)
                    divIndividualHours.appendChild(divHourSelectLabel)
                    divIndividualHours.appendChild(divTimeInputs)
                    divAllHours.appendChild(divIndividualHours)
    
                    divTimeStart.dataset.day = i.getAttribute("id");
                    divTimeEnd.dataset.day = i.getAttribute("id");

                    } 
                else{
                    i.classList.remove("rounded-full", "bg-dark-400");
                    marked = false;

                    var index = daysSelected.indexOf(i);

                    if (index !== -1) {
                        var removedElement = daysSelected.splice(index, 1)[0];
                    }
                    console.log(daysSelected);
                    var removedElementId = removedElement.getAttribute("id")
                    console.log("Elemento removido: " + removedElementId )

                    Array.from(divAllHours.children).forEach(function(div){
                        if(removedElementId == div.id){
                            divAllHours.removeChild(div)
                        }
                    })
                }
                })
            })
        }
    }
    function getAllClickedWeekDays(daysSelected){
            document.querySelectorAll(".dayDiv").forEach(function(d){
               var marked = false;
                d.addEventListener("click",function(event){
                    if (!getAllClickedWeekDaysActive) return;
                    if(!marked){ 
                        // se marked for falso
                        event.preventDefault()
                        event.stopPropagation()
                        console.log("Clicando")
                        d.classList.add("rounded-full","bg-dark-400")
                        marked = true         
                        daysSelected.push(d)
                        console.log("DaysSelectedArray " + daysSelected)
                        
                } 
                else{
                    d.classList.remove("rounded-full", "bg-dark-400");
                    marked = false;
    
                    var index = daysSelected.indexOf(d);
    
                    if (index !== -1) {
                        daysSelected.splice(index, 1);
                    }
            
                    console.log(daysSelected);
                }
                })
            })
        

    }
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
    function createImage(src) {
        const img = new innovaphone.ui1.Node("img", null, null,"basis-1/3 w-[96px] aspect-[4/3] rounded-lg");
        img.setAttribute("src", src);
        return img;
    }
    function typeOfRoomButtons(event,btn1,btn2,callback) {

        const clickedButton = event.target;

        if (clickedButton === btn1) {
            btn2.className = ''
            btn1.className = ''
            btn1.classList.add("bg-dark-300", "hover:bg-dark-400", "text-primary-600", "font-bold", "py-1", "px-2", "rounded-lg");            
            btn2.classList.add("border-2","border-dark-400", "hover:bg-dark-500", "text-dark-400", "font-bold", "py-1", "px-2", "rounded-lg");
            callback(btn1)
        }
        else if (clickedButton === btn2) {
            btn1.className = ''
            btn2.className = ''
            btn2.classList.add("bg-dark-300", "hover:bg-dark-400", "text-primary-600", "font-bold", "py-1", "px-2", "rounded-lg");
            btn1.classList.add("border-2","border-dark-400", "hover:bg-dark-500", "text-dark-400", "font-bold", "py-1", "px-2", "rounded-lg");
            callback(btn2)
        }
    }
    // let lastClickedImg = null;
    function addBorderAndChangeImage(imgElement, mainImg , newSrc) {
        // if (lastClickedImg !== null) {
        //     lastClickedImg.classList.remove("border-[3px]" ,"border-primary-100");
        // }
    
       // imgElement.classList.add("border-[3px]" , "border-primary-100");
    
        // Atualizar o último elemento clicado
        //lastClickedImg = imgElement;
    
        mainImg.setAttribute("src",newSrc) 
    }
    // rever uma forma de fazer isso 
    function makeDivAppearance(){
        that.clear();
        // backButton.addEventListener("click",function(event){
        //     event.preventDefault();
        //     event.stopPropagation();
        //     makeViewRoom(rooms,devices,availabilities,viewers)
        // })
        makeHeader(backButton, makeButton("", "", "./images/brush.svg"), texts.text("labelAppearance"), function () {
            makeDivOptions()
        })
        const divMain = document.createElement("div")
        divMain.classList.add("flex", "h-full", "p-1", "flex-col", "items-start", "sm:mx-[200px]", "gap-1")
        // cor primária
        const divPrimaryColor = document.createElement("div")
        divPrimaryColor.classList.add("flex", "p-1", "items-center", "gap-1", "rounded-lg", "bg-dark-200", "w-full")
        const paletteIcon1 = document.createElement("img")
        paletteIcon1.src = './images/palette.svg'
        const labelPrimaryColor = document.createElement("div")
        labelPrimaryColor.textContent = texts.text("labelPrimaryColor")
        // cor secundária
        const divSecundaryColor = document.createElement("div")
        divSecundaryColor.classList.add("flex", "p-1", "items-center", "gap-1", "rounded-lg", "bg-dark-200", "w-full")
        const paletteIcon2 = document.createElement("img")
        paletteIcon2.src = './images/palette.svg'
        const labelSecundaryColor = document.createElement("div")
        labelSecundaryColor.textContent = texts.text("labelSecundaryColor")
        // texto
        const divText = document.createElement("div")
        divText.classList.add("flex", "p-1", "items-center", "gap-1", "rounded-lg", "bg-dark-200", "w-full")
        const textIcon = document.createElement("img")
        textIcon.src = './images/text-cursor.svg'
        const labelText = document.createElement("div")
        labelText.textContent = texts.text("labelText")
        //imagem fundo
        const divImgInside = document.createElement("div")
        divImgInside.classList.add("flex", "p-1", "items-center", "gap-1", "rounded-lg", "bg-dark-200", "w-full")
        const imgInsideIcon = document.createElement("img")
        imgInsideIcon.src = './images/image-inside.svg'
        const labelImgInside = document.createElement("div")
        labelImgInside.textContent = texts.text("labelImgInside")
        // logo 
        const divLogo = document.createElement("div")
        divLogo.classList.add("flex", "p-1", "items-center", "gap-1", "rounded-lg", "bg-dark-200", "w-full")
        const divLogoIcon = document.createElement("img")
        divLogoIcon.src = './images/codesandbox.svg'
        const labelLogo = document.createElement("div")
        labelLogo.textContent = texts.text("labelLogo")

        divPrimaryColor.appendChild(paletteIcon1)
        divPrimaryColor.appendChild(labelPrimaryColor)
        divSecundaryColor.appendChild(paletteIcon2)
        divSecundaryColor.appendChild(labelSecundaryColor)
        divText.appendChild(textIcon)
        divText.appendChild(labelText)
        divImgInside.appendChild(imgInsideIcon)
        divImgInside.appendChild(labelImgInside)
        divLogo.appendChild(divLogoIcon)
        divLogo.appendChild(labelLogo)
        divMain.appendChild(divPrimaryColor)
        divMain.appendChild(divSecundaryColor)
        divMain.appendChild(divText)
        divMain.appendChild(divImgInside)
        divMain.appendChild(divLogo)
        document.body.appendChild(divMain)

        // //listeners
        // divMakeRoom.addEventListener("click", function (event) {
        //     event.preventDefault
        //     event.stopPropagation()
        //     createRoomContext()
        // })

        // divProvCode.addEventListener("click", function (event) {
        //     event.preventDefault
        //     event.stopPropagation()
        //     getProvisioningCode(userSIP, "inn-lab-ipva IP Phone", "labelProvCode")
        // })
        
        // divAppearance.addEventListener('click',function(event){
        //     event.preventDefault
        //     event.stopPropagation()
        //     // criar div de aparencia
        // })
    }
    function makeDivOptions() {
        that.clear();
        // backButton.addEventListener("click",function(event){
        //     event.preventDefault();
        //     event.stopPropagation();
        //     makeViewRoom(rooms,devices,availabilities,viewers)
        // })
        makeHeader(backButton, makeButton("", "", "./images/settings.svg"), texts.text("labelOptions"), function () {
            makeViewRoom(rooms, devices, availabilities, viewers)
        })
        const divMain = document.createElement("div")
        divMain.classList.add("flex", "h-full", "p-1", "flex-col", "items-start", "sm:mx-[200px]", "gap-1")
        // criar sala
        const divMakeRoom = document.createElement("div")
        divMakeRoom.classList.add("flex", "p-1", "items-center", "gap-1", "rounded-lg", "bg-dark-200", "w-full","cursor-pointer")
        const plusIcon = document.createElement("img")
        plusIcon.src = './images/plus-circle.svg'
        const labelMakeRoom = document.createElement("div")
        labelMakeRoom.textContent = texts.text("labelCreateRoom")
        // provisioning code
        const divProvCode = document.createElement("div")
        divProvCode.classList.add("flex", "p-1", "items-center", "gap-1", "rounded-lg", "bg-dark-200", "w-full","cursor-pointer")
        const provIcon = document.createElement("img")
        provIcon.src = './images/hash.svg'
        const labelProvCode = document.createElement("div")
        labelProvCode.setAttribute("id","labelProvCode")
        labelProvCode.textContent = texts.text("labelProvCode")
        // tabela agendamento
        const divTableSched = document.createElement("div")
        divTableSched.classList.add("flex", "p-1", "items-center", "gap-1", "rounded-lg", "bg-dark-200", "w-full","cursor-pointer")
        const schedIcon = document.createElement("img")
        schedIcon.src = './images/calendar-option.svg'
        const labelTableSched = document.createElement("div")
        labelTableSched.textContent = texts.text("labelTableSchedule")
        //aparencia
        const divAppearance = document.createElement("div")
        divAppearance.classList.add("flex", "p-1", "items-center", "gap-1", "rounded-lg", "bg-dark-200", "w-full","cursor-pointer")
        const appearanceIcon = document.createElement("img")
        appearanceIcon.src = './images/brush.svg'
        const labelAppearance= document.createElement("div")
        labelAppearance.setAttribute("id","labelAppearance")
        labelAppearance.textContent = texts.text("labelAppearance")


        divMakeRoom.appendChild(plusIcon)
        divMakeRoom.appendChild(labelMakeRoom)
        divProvCode.appendChild(provIcon)
        divProvCode.appendChild(labelProvCode)
        divTableSched.appendChild(schedIcon)
        divTableSched.appendChild(labelTableSched)
        divAppearance.appendChild(appearanceIcon)
        divAppearance.appendChild(labelAppearance)
        divMain.appendChild(divMakeRoom)
        divMain.appendChild(divProvCode)
        divMain.appendChild(divTableSched)
        divMain.appendChild(divAppearance)
        document.body.appendChild(divMain)

        //listeners
        divMakeRoom.addEventListener("click", function (event) {
            event.preventDefault
            event.stopPropagation()
            createRoomContext()
        })

        divProvCode.addEventListener("click", function (event) {
            event.preventDefault
            event.stopPropagation()
            getProvisioningCode(userSIP, "inn-lab-ipva IP Phone", "labelProvCode")
        })
        
        divAppearance.addEventListener('click',function(event){
            event.preventDefault
            event.stopPropagation()
            makeDivAppearance()
        })
    }
    function getProvisioningCode(sip, category, divId) {
        devicesApi.send({ mt: "GetProvisioningCode", sip: sip, category: category, div: divId })
    }
    function createRoomContext(){
        that.clear()
        makeHeader(backButton,makeButton("","",""),texts.text("labelCreateRoom"),function(){
            makeDivOptions()
        })
        const divMain = document.createElement("div")
        divMain.classList.add("flex","h-full","p-1","flex-col","items-start","sm:mx-[200px]","gap-1")
        
          // div criar do zero 
          const makeFromZero = document.createElement("div")
          makeFromZero.classList.add("flex","p-1","items-center","gap-1","rounded-lg","bg-dark-200","w-full","justify-center","cursor-pointer")
          makeFromZero.textContent = texts.text("labelmakeFromZero")
  
          divMain.appendChild(makeFromZero)
        
        // SALA SIMPLES
        const divSimpleRoom = document.createElement("div")
        divSimpleRoom.classList.add("flex","p-3","flex-col","items-center","gap-1","rounded-lg","bg-dark-200","w-full")
        const divTextSimpleRoom = document.createElement("div")
        divTextSimpleRoom.classList.add("text-3","text-white" ,"font-bold")
        divTextSimpleRoom.textContent = texts.text("labelSimpleRoom")
        const divImgSimpleRoom = document.createElement("div")
        divImgSimpleRoom.classList.add("flex","p-1","justify-center","items-start","gap-1")
        const imgPhoneSimple = document.createElement("img")
        imgPhoneSimple.src = './images/phone.svg'
        const imgUserSimple = document.createElement("img")
        imgUserSimple.src = './images/user.svg'
        const imgLaptopSimple = document.createElement("img")
        imgLaptopSimple.src = './images/laptop.svg'
        const textSimpleRoom1 = document.createElement("div")
        textSimpleRoom1.classList.add("text-3")
        textSimpleRoom1.textContent = texts.text("labelSimpleRoomTxt1")
        const textSimpleRoom2 = document.createElement("div")
        textSimpleRoom2.classList.add("text-3")
        textSimpleRoom2.textContent = texts.text("labelSimpleRoomTxt2")

        divImgSimpleRoom.appendChild(imgPhoneSimple)
        divImgSimpleRoom.appendChild(imgUserSimple)
        divImgSimpleRoom.appendChild(imgLaptopSimple)
        divSimpleRoom.appendChild(divTextSimpleRoom)
        divSimpleRoom.appendChild(divImgSimpleRoom)
        divSimpleRoom.appendChild(textSimpleRoom1)
        divSimpleRoom.appendChild(textSimpleRoom2)
        divMain.appendChild(divSimpleRoom)
        // SALA COMPLEXA
        const divComplexRoom = document.createElement("div")
        divComplexRoom.classList.add("flex","p-3","flex-col","items-center","gap-1","rounded-lg","bg-dark-200","w-full")
        const divTextComplexRoom = document.createElement("div")
        divTextComplexRoom.classList.add("text-3","text-white" ,"font-bold")
        divTextComplexRoom.textContent = texts.text("labelComplexRoom")
        const divImgComplexRoom = document.createElement("div")
        divImgComplexRoom.classList.add("flex","p-1","justify-center","items-start","gap-1")
        const imgPhoneComplex = document.createElement("img")
        imgPhoneComplex.src = './images/phone-missed.svg'
        const imgUserComplex = document.createElement("img")
        imgUserComplex.src = './images/users.svg'
        const imgMonitorComplex = document.createElement("img")
        imgMonitorComplex.src = './images/monitor.svg'
        const textComplexRoom1 = document.createElement("div")
        textComplexRoom1.classList.add("text-3")
        textComplexRoom1.textContent = texts.text("labelComplexRoomTxt1")
        const textComplexRoom2 = document.createElement("div")
        textComplexRoom2.classList.add("text-3")
        textComplexRoom2.textContent = texts.text("labelComplexRoomTxt2")
        divImgComplexRoom.appendChild(imgPhoneComplex)
        divImgComplexRoom.appendChild(imgUserComplex)
        divImgComplexRoom.appendChild(imgMonitorComplex)
        divComplexRoom.appendChild(divTextComplexRoom)
        divComplexRoom.appendChild(divImgComplexRoom)
        divComplexRoom.appendChild(textComplexRoom1)
        divComplexRoom.appendChild(textComplexRoom2)
        divMain.appendChild(divComplexRoom)
    
        document.body.appendChild(divMain) 

        makeFromZero.addEventListener("click",function(){
            makeDivCreateRoom()
        })
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
    //#endregion FUNÇÕES INTERNAS

    //#region EDIÇÃO DE SALA
    // function makeDivEditRoom(nameRoom,type){
    //     that.clear()
    //     const btnUpdateRoom = makeButton(texts.text("save"),"primary","")
    //     makeHeader(backButton,btnUpdateRoom,texts.text("labelEditRoom"))
    //     const divMain = document.createElement("div")
    //     divMain.classList.add("flex","h-full","p-1","flex-col","items-start","sm:mx-[200px]","gap-1")
    //     //nome da sala
    //     const divNameRoom = document.createElement("div")
    //     divNameRoom.classList.add("flex","p-1","flex-col","items-start","gap-1","bg-dark-200","rounded-lg","w-full")
    //     const labelNameRoom = document.createElement("div")
    //     labelNameRoom.textContent = texts.text("labelNameRoom")
    //     const iptNameRoom = makeInput(nameRoom,"text","")
    //     iptNameRoom.value = nameRoom
    //     iptNameRoom.id = "iptNameRoom"
    //     // imagem da sala
    //     const divImgRoom = document.createElement("div")
    //     divImgRoom.classList.add("flex","p-1","items-center","justify-between","bg-dark-200","rounded-lg","w-full")
    //     const labelImgRoom = document.createElement("div")
    //     labelImgRoom.textContent = texts.text("labelImageRoom")
    //     const divBtnChoose = makeButton(texts.text("labelChoose"),"primary","")
    //     var imgRoom;
    //     divBtnChoose.addEventListener("click",function(){
    //         console.log("Abrir Div Escolher Imagem")
    //         makeDivChooseImage(function(selectedImg){ //callback da função 
    //             imgRoom = selectedImg
    //         })
    //     })
    //     // tipo de sala
    //     const divTypeRoom = document.createElement("div")
    //     divTypeRoom.classList.add("flex","p-1","items-center","justify-between","bg-dark-200","rounded-lg","w-full")
    //     const labelTypeRoom = document.createElement("div")
    //     labelTypeRoom.textContent = texts.text("labelTypeRoom")

    //     var typeRoom = type;

    //     var btnPeriod;
    //     var btnRecurrent;

    //     if(type == 'periodType'){
    //         btnPeriod = makeButton(texts.text("labelPeriod"),"secundary","")
    //         btnPeriod.id = "periodType"
    //         btnRecurrent = makeButton(texts.text("labelRecurrent"),"tertiary","")
    //         btnRecurrent.id = "recurrentType"
    //     }else{
    //         btnPeriod = makeButton(texts.text("labelPeriod"),"tertiary","")
    //         btnPeriod.id = "periodType"
    //         btnRecurrent = makeButton(texts.text("labelRecurrent"),"secundary","")
    //         btnRecurrent.id = "recurrentType"
    //     }

    //     btnPeriod.addEventListener("click", function(event) {
    //         typeOfRoomButtons(event, btnPeriod, btnRecurrent,function(selectedButton){
    //             typeRoom = selectedButton.id
    //         });
    //     });

    //     btnRecurrent.addEventListener("click", function(event) {
    //         typeOfRoomButtons(event, btnPeriod, btnRecurrent,function(selectedButton){
    //             typeRoom = selectedButton.id
    //         });
    //     });
                
    
    //     // usuarios
    //     var viewers = []
    //     const divUsersRoom = document.createElement("div")
    //     divUsersRoom.classList.add("flex","p-1","items-center","justify-between","bg-dark-200","rounded-lg","w-full")
    //     const labelUsersRoom = document.createElement("div")
    //     labelUsersRoom.textContent = texts.text("labelUsers")
    //     const divUsersToAdd = document.createElement("div")
    //     const divBtnAddUsers = makeButton(texts.text("labelAdd"),"primary","")
    //     divBtnAddUsers.addEventListener("click",function(){
    //         console.log("Abrir Div Add Usuários")
    //         makeDivAddUsers(function(viewer){ //callback da função 
    //             viewers = viewer
    //             makeAvatar(viewer,divUsersToAdd)
    //         })
    //     })
    //     //horario agendamento 
    //     const divHourSchedule = document.createElement("div")
    //     divHourSchedule.classList.add("flex","p-1","items-center","justify-between","bg-dark-200","rounded-lg","w-full")
    //     const labelHourSchedule = document.createElement("div")
    //     labelHourSchedule.textContent = texts.text("labelHourSchedule")
    //     const btnMakeCalendar = makeButton(texts.text("labelEdit"),"primary","")
    //     var typeSchedule;
    //     var dateAvailability;
    //     btnMakeCalendar.addEventListener("click",function(){
    //         makeDivAddAvailability(null,null,typeRoom,function(date){
    //             dateAvailability;
    //             dateAvailability = date
    //             console.log("DATE AVAILABILITY: " + JSON.stringify(dateAvailability))
    //             //console.log(date)
    //             //console.log("Hora inicio: " , date[0].start , "Hora Fim: " , date[0].end)
    //         },function(sched){
    //             typeSchedule = sched
    //         })
    //         console.log("Abrir Calendario")
    //     })
    //     // devices
    //     const divAddDevices = document.createElement("div")
    //     divAddDevices.classList.add("flex","p-1","items-center","justify-between","bg-dark-200","rounded-lg","w-full")
    //     const labelAddDevices = document.createElement("div")
    //     labelAddDevices.textContent = texts.text("labelDevices")
    //     const divBtnAddDevices = makeButton(texts.text("labelAdd"),"primary","")
    //     divBtnAddDevices.addEventListener("click",function(){
    //         console.log("Abrir div add devices")
    //         makeDivAddDevices(phone_list)
    //         // makeDivAddDevices()
    //     })
    //     //appends
    //     divNameRoom.appendChild(labelNameRoom)
    //     divNameRoom.appendChild(iptNameRoom)
    //     divImgRoom.appendChild(labelImgRoom)
    //     divImgRoom.appendChild(divBtnChoose)
    //     divTypeRoom.appendChild(labelTypeRoom)
    //     divTypeRoom.appendChild(btnPeriod)
    //     divTypeRoom.appendChild(btnRecurrent)
    //     // divTypeSchedule.appendChild(labelTypeSchedule) colocar na tela de agendamento
    //     // divTypeSchedule.appendChild(btnDaySchedule) colocar na tela de agendamento
    //     // divTypeSchedule.appendChild(btnHourSchedule) colocar na tela de agendamento
    //     divUsersRoom.appendChild(labelUsersRoom)
    //     divUsersRoom.appendChild(divUsersToAdd)
    //     divUsersRoom.appendChild(divBtnAddUsers)
    //     divHourSchedule.appendChild(labelHourSchedule)
    //     divHourSchedule.appendChild(btnMakeCalendar)
    //     divAddDevices.appendChild(labelAddDevices)
    //     divAddDevices.appendChild(divBtnAddDevices)
    
    //     divMain.appendChild(divNameRoom)
    //     divMain.appendChild(divImgRoom)
    //     divMain.appendChild(divTypeRoom)
    //     // divMain.appendChild(divTypeSchedule) colocar na tela de agendamento
    //     divMain.appendChild(divUsersRoom)
    //     divMain.appendChild(divHourSchedule)
    //     divMain.appendChild(divAddDevices)
    
    //     document.body.appendChild(divMain)
    
    //     // btnUpdateRoom.addEventListener("click",function(event){
    //     //     const nomeSala = document.getElementById("iptNameRoom").value
    //     //     if(nomeSala == "" || imgRoom == "" || typeRoom == "" || typeSchedule == "" || viewers == ""){
    //     //     makePopUp(texts.text("labelWarning"), texts.text("labelCompleteAll"), texts.text("labelOk")).addEventListener("click",function(event){
    //     //         event.preventDefault()
    //     //         event.stopPropagation()
    //     //         document.body.removeChild(document.getElementById("bcgrd"))
    //     //     })      
    //     //     }
    //     //     if(typeRoom == "periodType"){
    //     //         app.send({ api: "admin", mt: "InsertRoom", 
    //     //         name: nomeSala, 
    //     //         img: imgRoom, 
    //     //         dateStart: dateAvailability[0].start, 
    //     //         dateEnd: dateAvailability[0].end, 
    //     //         type: typeRoom, 
    //     //         schedule: typeSchedule, 
    //     //         viewer: viewers,
    //     //         device : devHwId
    //     //         }); //viewer: viewer 
    //     //     }else if (typeRoom == "recurrentType") {
    //     //         console.log("dateAvailability " + JSON.stringify(dateAvailability));
            
    //     //         // Inicialize objetos para armazenar todos os horários de disponibilidade combinados
    //     //         let combinedAvailability = {
    //     //             startMonday: [],
    //     //             startTuesday: [],
    //     //             startWednesday: [],
    //     //             startThursday: [],
    //     //             startFriday: [],
    //     //             startSaturday: [],
    //     //             startSunday: [],
    //     //             endMonday: [],
    //     //             endTuesday: [],
    //     //             endWednesday: [],
    //     //             endThursday: [],
    //     //             endFriday: [],
    //     //             endSaturday: [],
    //     //             endSunday: []
    //     //         };
            
    //     //         // Combine os horários de disponibilidade de todas as salas
    //     //         dateAvailability.forEach(function(availability) {
    //     //             for (let key in availability) {
    //     //                 combinedAvailability[key].push(availability[key]);
    //     //             }
    //     //         });
            
    //     //         // Envie uma única mensagem com todos os horários de disponibilidade combinados
    //     //         app.send({
    //     //             api: "admin",
    //     //             mt: "InsertRoom",
    //     //             name: nomeSala,
    //     //             img: imgRoom,
    //     //             type: typeRoom,
    //     //             schedule: typeSchedule,
    //     //             startMonday: combinedAvailability.startMonday.join(", "),
    //     //             startTuesday: combinedAvailability.startTuesday.join(", "),
    //     //             startWednesday: combinedAvailability.startWednesday.join(", "),
    //     //             startThursday: combinedAvailability.startThursday.join(", "),
    //     //             startFriday: combinedAvailability.startFriday.join(", "),
    //     //             startSaturday: combinedAvailability.startSaturday.join(", "),
    //     //             startSunday: combinedAvailability.startSunday.join(", "),
    //     //             endMonday: combinedAvailability.endMonday.join(", "),
    //     //             endTuesday: combinedAvailability.endTuesday.join(", "),
    //     //             endWednesday: combinedAvailability.endWednesday.join(", "),
    //     //             endThursday: combinedAvailability.endThursday.join(", "),
    //     //             endFriday: combinedAvailability.endFriday.join(", "),
    //     //             endSaturday: combinedAvailability.endSaturday.join(", "),
    //     //             endSunday: combinedAvailability.endSunday.join(", "),
    //     //             viewer: viewers,
    //     //             device: devHwId
    //     //         });
    //     //     }
            
    //     //     // app.send({ api: "admin", mt: "InsertRoom", 
    //     //     // name: nameRoom, 
    //     //     // img: srcDaImagem, 
    //     //     // dateStart: dateStart, 
    //     //     // dateEnd: dateEnd, 
    //     //     // type: optType, 
    //     //     // schedule: optModule, 
    //     //     // editor: editor, 
    //     //     // viewer: viewer });
    //     // })
    //     }
    //#endregion
    
    //#region Drag and Drop Functions
    function clickedPhone(hwId, colDireita, e){
        console.log("Clicked Phone", hwId)
        var x = e.clientX;
        var y = e.clientY;
        var windWidth = window.innerWidth;
        var windHeight = window.innerHeight;
        var divWidth = 250;
        var divHeight = 200;
        
        // Verificando se a div ultrapassa os limites da janela
        if (x + divWidth > windWidth) {
            x = windWidth - divWidth; // reposiciona no lado oposto
        }
        if (y + divHeight > windHeight) {
            y = windHeight - divHeight; // reposiciona no lado oposto
        }
        var wallblock = colDireita.add(new innovaphone.ui1.Node('div', null, null, "wallblock").setAttribute("id", "wallblock")
                .addEvent("click", function(){
                    var elements = document.getElementsByClassName("list-box");

                    for (var i = 0; i < elements.length; i++) {
                        var id = elements[i].id;
                        console.log("ID da div:", id);
                    }
            
                    app.send({ api: "admin", mt: "SelectRoom", id: id });
                }))

        var nameUserPhone = listDeviceRoom.filter(function(device){
            return device.hwid == hwId;
        })[0]
        var namePhone = nameUserPhone.cn == "null" ? nameUserPhone.hwid : nameUserPhone.cn;

        var phoneInfo = colDireita.add(new innovaphone.ui1.Node('div', null, namePhone, "phoneinfo").setAttribute("id", hwId));
        

        phoneInfo.setStyle("left", x + "px");
        phoneInfo.setStyle("top", y + "px");
        phoneInfo.setStyle("width", divWidth + "px");
        phoneInfo.setStyle("height", divHeight + "px");
        

        phoneInfo.add(new innovaphone.ui1.Div(null, null, "closewindow").setAttribute("id", "clsLittleWindow"))
        var lists = phoneInfo.add(new innovaphone.ui1.Node('div', null, null, "list-info").setAttribute("id", "list-info"))
        var select_list = lists.add(new innovaphone.ui1.Node('select', null, null, null).setAttribute("id", "select-users"))
        select_list.add(new innovaphone.ui1.Node('option', null, texts.text("lableSelect"), null))

        console.log("LIST TABLE USERS", list_tableUsers)
        list_tableUsers.forEach(function (users){
            select_list.add(new innovaphone.ui1.Node('option', null, users.cn, null))
        })
        document.getElementById("clsLittleWindow").addEventListener("click",function(){
            var elements = document.getElementsByClassName("list-box");

            for (var i = 0; i < elements.length; i++) {
                var id = elements[i].id;
                console.log("ID da div:", id);
            }
            
            app.send({ api: "admin", mt: "SelectRoom", id: id });
        })
        var selectType = document.getElementById("select-users");

        var userSelect;

        selectType.addEventListener("change", function(){
            var optType = selectType.options[selectType.selectedIndex].value;
            console.log("OPT-TYPE ", optType);
            userSelect = list_tableUsers.filter(function(list_tableUser){
                console.log("OPT FILTER ", optType);
                return list_tableUser.cn == optType;
            })[0]
            console.log("USER SELECTED", userSelect);
        

        });

        var removeUserOnPhone = listDeviceRoom.filter(function(room){
            
            return room.hwid == hwId
        })[0];

        console.log("Remove this user on PHONE", removeUserOnPhone)

        var setUserBtt = phoneInfo.add(new innovaphone.ui1.Div(null, null, "button")
                .addText("Assumir Telefone")
                .addEvent("click", function () {    

                    var getPhone = {
                        api: "admin",
                        mt: "GetPhone",
                        hwId: hwId,
                        user: userSelect.guid
                    }

                    console.log("GETPHONE:",JSON.stringify(getPhone))
                    app.send(getPhone)
                    
                    var elements = document.getElementsByClassName("list-box");

                    for (var i = 0; i < elements.length; i++) {
                        var id = elements[i].id;
                        console.log("ID da div:", id);
                    }
                    
                    app.send({ api: "admin", mt: "SelectRoom", id: id });
                }, setUserBtt));

        var setAppontBtt = phoneInfo.add(new innovaphone.ui1.Div(null, null, "button")
        .addText("Agendar Telefone")
        .addEvent("click", function () {

            var calendar = colDireita.add(new innovaphone.ui1.Node('div', null, null, "phnCalendar").setAttribute("id", "phnCalendar"))
            var elements = document.getElementsByClassName("list-box");

            for (var i = 0; i < elements.length; i++) {
                var id = elements[i].id;
                console.log("ID da div:", id);
            }
            var roomfilter = list_RoomSchedule.filter(function(room){
                return room.id == id
            })[0]
            
            makePhoneSchedule(calendar, roomfilter.type)
            console.log("LIST DEVICES",listDeviceRoom)

        }, setAppontBtt));

        var rvButton = phoneInfo.add(new innovaphone.ui1.Div(null, null, "button")
                .addText("Remover Usuário")
                .addEvent("click", function () { 
                    var removeUser={
                        api: "admin",
                        mt: "RemoveUserPhone",
                        hwId: hwId,
                        user: removeUserOnPhone.guid
                    }
                    console.log("Remove USER JSON:",JSON.stringify(removeUser))
                    app.send(removeUser)

                    var elements = document.getElementsByClassName("list-box");

                    for (var i = 0; i < elements.length; i++) {
                        var id = elements[i].id;
                        console.log("ID da div:", id);
                    }
                    
                    app.send({ api: "admin", mt: "SelectRoom", id: id });
                    waitConnection(_colDireita);

                    }, rvButton));
    }
    function allowDrop(ev) {
        ev.stopPropagation();
        ev.preventDefault();
    }

      function drag(ev) {
        ev.dataTransfer.setData("text", ev.target.id);
        ev.dataTransfer.dropEffect = 'copy';
        console.log("Drag")
    }


    function drop(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        var data = ev.dataTransfer.getData("text");
        var draggedElement = document.getElementById(data);
    
        // Obtenha as coordenadas do mouse em relação à div "divImg"
        var rect = document.getElementById("divImg").getBoundingClientRect();
        var offsetX = ev.clientX - rect.left;
        var offsetY = ev.clientY - rect.top;
    
        // Ajuste as coordenadas do elemento para as coordenadas do mouse
        draggedElement.style.left = offsetX + "px";
        draggedElement.style.top = offsetY + "px";
    
        // Defina o z-index para garantir que o elemento seja exibido na frente de outros elementos
        draggedElement.style.zIndex = "2000";
    
        // Defina a posição como absoluta para garantir o posicionamento correto
        draggedElement.style.position = "absolute";
    
        // Anexe o elemento à div "divImg"
        document.getElementById("divImg").appendChild(draggedElement);
    }
    

    function resetPhonesDrop(ev){
        ev.stopPropagation();
        ev.preventDefault();

        var data = ev.dataTransfer.getData("text");
        var draggedElement = document.getElementById(data);
        var divPhones = document.getElementById("divMainImg");

        document.getElementById("imgBD").removeChild(draggedElement)
        draggedElement.style.position = 'static'
        draggedElement.name = '';
        draggedElement.classList.remove("DeviceActive")
        draggedElement.classList.add("DeviceRemoved")
        
        // Remova o dispositivo da lista de dispositivos ativos
    var deviceId = draggedElement.id; // Supondo que o ID do dispositivo corresponda ao ID na lista de dispositivos ativos
    var indexToRemove = -1;

    for (var i = 0; i < ativos.length; i++) {
        if (ativos[i].hwid === deviceId) {
            indexToRemove = i;
            break;
        }
    }

    if (indexToRemove >= 0) {
        ativos.splice(indexToRemove, 1);
    }

    for (var i = 0; i < listDeviceRoom.length; i++) {
        if (listDeviceRoom[i].hwid === deviceId) {
            indexToRemove = i;
            break;
        }
    }

    if (indexToRemove >= 0) {
        listDeviceRoom.splice(indexToRemove, 1);
    }
    app.send({api:"admin", mt:"DeleteDeviceFromRoom" , hwid: String(deviceId)})

    console.log("DEVICES QUE ESTÃO ATIVOS" + JSON.stringify(listDeviceRoom))
        console.log("ativos after reset " + JSON.stringify(ativos))
        divPhones.appendChild(draggedElement);

    }
    //#endregion

// db files
// container
var folder = null;

function onSelectFile() {
    // if(filesID){
    //     deleteFile(filesID)
    // }
        console.log("Evento do Input File" + inputDbFiles.container.files[0])
        controlDB = true
        postFile(inputDbFiles.container.files[0]);
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
        console.log("FILE IMG " + String(file))
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
        controlDB = false
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
                //document.getElementById("imgBD").innerHTML = '';
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
        console.log("FOLDER" + msg)
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
        // filesID = file.id

        //filesID = []
        //filesURL = []

        if(controlDB){
            // document.getElementById("imgBD").innerHTML = ''
            var divMainImg = document.getElementById("divMainImg")
            divMainImg.setAttribute("src",start.originalUrl + "/files/" + file.id)
            filesID = file.id
            
            filesURL = file.url
        
            const parts = filesURL.split('?');
            const path = parts[0];
            const pathParts = path.split('/');
            filesURLFinal = pathParts[pathParts.length - 1];
            console.log("FILES ID " + filesID)
            console.log("URL CORRETA " + filesURLFinal); 

            // var imgFile = imgBD.add(new innovaphone.ui1.Node("img","width:100%;height:200px",null,null).setAttribute("id","imgBDFile"))
            // imgFile.setAttribute("src",start.originalUrl + "/files/" + file.id)
            // var delButton = new innovaphone.ui1.Div(null, null, "button")
            // .addText("\uD83D\uDDD1")
            // .addEvent("click", function () { deleteFile(file.id) }, delButton);
        //imgBD.add(delButton)
        }else{
            console.log("Control DB FALSE")
            // document.getElementById("imgBD").innerHTML = ''
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

Wecom.coolworkAdmin.prototype = innovaphone.ui1.nodePrototype;
