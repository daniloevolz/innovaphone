
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.coolworkAdmin = Wecom.coolworkAdmin || function (start, args) {
    this.createNode("body");
    var that = this;
    var devHwId = [];
    var filesID = [];
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

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;
    waitConnection(that);

    var devicesApi; // revisar - importante 
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

        //apiPhone = start.consumeApi("com.innovaphone.events") // testes pietro

        app.send({api:"admin", mt:"SelectAllRoom"})
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
            labeling(code)
        }
    }
    function app_message(obj) {
        // chamar todos que nao estão vinculados a uma sala para serem adicionados em outra
        if (obj.api === "admin" && obj.mt === "SelectDevicesResult") {
            phone_list = JSON.parse(obj.result)
            makeDivAddDevices(phone_list)
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
        }
    }

    //#region CRIAÇÃO DE SALA
    function makeDivCreateRoom(){
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
    const divBtnChoose = makeButton(texts.text("labelChoose"),"primary","")
    var imgRoom;
    divBtnChoose.addEventListener("click",function(){
        console.log("Abrir Div Escolher Imagem")
        makeDivChooseImage(function(selectedImg){
            imgRoom = selectedImg
        })
    })
    // tipo de sala
    const divTypeRoom = document.createElement("div")
    divTypeRoom.classList.add("flex","p-1","items-center","justify-between","bg-dark-200","rounded-lg","w-full")
    const labelTypeRoom = document.createElement("div")
    labelTypeRoom.textContent = texts.text("labelTypeRoom")
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
    const divBtnAddUsers = makeButton(texts.text("labelAdd"),"primary","")
    divBtnAddUsers.addEventListener("click",function(){
        console.log("Abrir Div Add Usuários")
        makeDivAddUsers(function(viewer){
            viewers = viewer
        })
    })
    //horario agendamento 
    const divHourSchedule = document.createElement("div")
    divHourSchedule.classList.add("flex","p-1","items-center","justify-between","bg-dark-200","rounded-lg","w-full")
    const labelHourSchedule = document.createElement("div")
    labelHourSchedule.textContent = texts.text("labelHourSchedule")
    const btnMakeCalendar = makeButton(texts.text("labelEdit"),"primary","")
    var typeSchedule;
    var dateAvailability;
    btnMakeCalendar.addEventListener("click",function(){
        makeDivAddAvailability(typeRoom,function(date){
            dateAvailability = date
            console.log("DATE AVAILABILITY: " + JSON.stringify(dateAvailability))
            //console.log(date)
            //console.log("Hora inicio: " , date[0].start , "Hora Fim: " , date[0].end)
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
        app.send({api:"admin", mt:"SelectDevices"})
        // makeDivAddDevices()
    })
    //appends
    divNameRoom.appendChild(labelNameRoom)
    divNameRoom.appendChild(iptNameRoom)
    divImgRoom.appendChild(labelImgRoom)
    divImgRoom.appendChild(divBtnChoose)
    divTypeRoom.appendChild(labelTypeRoom)
    divTypeRoom.appendChild(btnPeriod)
    divTypeRoom.appendChild(btnRecurrent)
    // divTypeSchedule.appendChild(labelTypeSchedule) colocar na tela de agendamento
    // divTypeSchedule.appendChild(btnDaySchedule) colocar na tela de agendamento
    // divTypeSchedule.appendChild(btnHourSchedule) colocar na tela de agendamento
    divUsersRoom.appendChild(labelUsersRoom)
    divUsersRoom.appendChild(divBtnAddUsers)
    divHourSchedule.appendChild(labelHourSchedule)
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
        const nomeSala = document.getElementById("iptNameRoom").value
        if(nomeSala == "" || imgRoom == "" || typeRoom == "" || typeSchedule == "" || dateAvailability[0].start == "" || dateAvailability[0].end == ""){
        makePopUp(texts.text("labelWarning"), texts.text("labelCompleteAll"), texts.text("labelOk")).addEventListener("click",function(event){
            event.preventDefault()
            event.stopPropagation()
            document.body.removeChild(document.getElementById("bcgrd"))
        })      
        }
        if(typeRoom == "periodType"){
            app.send({ api: "admin", mt: "InsertRoom", 
            name: nomeSala, 
            img: imgRoom, 
            dateStart: dateAvailability[0].start, 
            dateEnd: dateAvailability[0].end, 
            type: typeRoom, 
            schedule: typeSchedule, 
            viewer: viewers,
            device : devHwId
            }); //viewer: viewer 
        }else if(typeRoom == "recurrentType"){
            app.send({ api: "admin", mt: "InsertRoom", 
            name: nomeSala, 
            img: imgRoom, 
            type: typeRoom, 
            schedule: typeSchedule,
            //start
            startMonday: dateAvailability[0].startMonday,
            startTuesday: dateAvailability[0].startTuesday,
            startWednesday: dateAvailability[0].startWednesday,
            startThursday: dateAvailability[0].startThursday,
            startFriday: dateAvailability[0].startFriday,
            startSaturday: dateAvailability[0].startSaturday,
            startSunday: dateAvailability[0].startSunday,
            //end
            endMonday: dateAvailability[1].endMonday,
            endTuesday: dateAvailability[1].endTuesday,
            endWednesday: dateAvailability[1].endWednesday,
            endThursday: dateAvailability[1].endThursday,
            endFriday: dateAvailability[1].endFriday,
            endSaturday: dateAvailability[1].endSaturday,
            endSunday: dateAvailability[1].endSunday,
            viewer: viewers,
            device : devHwId
        }) 
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
    function makeDivAddUsers(viewers){
        const insideDiv = document.createElement("div")
        insideDiv.classList.add("bg-black", "bg-opacity-50", "justify-center","items-center","absolute","h-full","w-full","top-0","flex");
        
        const divMain = document.createElement("div")
        divMain.classList.add("inline-flex","p-3","flex-col","flex-start","gap-1","rounded-lg","bg-dark-100","w-full","m-3")

        const titleUsers = document.createElement("div")
        titleUsers.textContent = texts.text("labelUsers")
        titleUsers.classList.add("text-3","text-white" ,"font-bold")

        const iptSearch = makeInput("","search",texts.text("labelIptSearch"))
        iptSearch.classList.add("w-full")

        const selectAllUsers = document.createElement("div")
        selectAllUsers.classList.add("flex","justify-between","items-center")

        const nameOfUsers = document.createElement("div")
        nameOfUsers.classList.add("text-3","text-white" ,"font-bold")
        nameOfUsers.textContent = texts.text("labelNameOfUsers")

        const divLabelandCheckbox = document.createElement("div")
        divLabelandCheckbox.classList.add("flex","w-[145px]","p-1","justify-between","items-center")
        const labelSelectAllUsers = document.createElement("div")
        labelSelectAllUsers.textContent = texts.text("labelSelectAll")
        labelSelectAllUsers.classList.add("text-3","text-white" ,"font-bold")

        const checkboxAllUsers = makeInput("","checkbox","")

        const scrollUsers = document.createElement("div")
        scrollUsers.classList.add("overflow-y-auto","h-[200px]","gap-1","flex-col","flex")


        list_tableUsers.forEach(function(user){
            
            const divMainUsers = document.createElement("div")
            divMainUsers.classList.add("flex","gap-1","justify-between","items-center","border-b-2","border-dark-400","p-1")
            const divUsersAvatar = document.createElement("div")
            divUsersAvatar.classList.add("flex","gap-1","items-center")
            let avatar = new innovaphone.Avatar(start, user.sip, userDomain);
            let UIuserPicture = avatar.url(user.sip, 120, userDN);
            const imgAvatar = document.createElement("img");
            imgAvatar.setAttribute("src", UIuserPicture);
            imgAvatar.setAttribute("id", "divAvatar");
            imgAvatar.classList.add("w-5", "h-5", "rounded-full");
            const nameUser = document.createElement("div")
            nameUser.textContent = user.cn
            const checkboxUser = makeInput("","checkbox","")
            checkboxUser.setAttribute("id","viewercheckbox_" + user.guid)
            checkboxUser.classList.add("checkboxUser")
            divUsersAvatar.appendChild(imgAvatar);
            divUsersAvatar.appendChild(nameUser);
            divMainUsers.appendChild(divUsersAvatar);
            divMainUsers.appendChild(checkboxUser);
            scrollUsers.appendChild(divMainUsers)
        })
        
        const divManage = document.createElement("div")
        divManage.classList.add("flex","p-1","justify-between","items-center","rounded-lg","bg-dark-200")
        const textManage = document.createElement("div")
        textManage.classList.add("text-3","font-bold","text-white")
        textManage.textContent = texts.text("labelManageFunctions")
        const btnManage = makeButton(texts.text("labelEdit"),"secundary","")

        const divButtons = document.createElement("div")
        divButtons.classList.add("flex","justify-between","items-center","rounded-md")
        const buttonCancel = makeButton(texts.text("labelBtnCancel"),"secundary","")
        buttonCancel.addEventListener("click",function(){
            console.log("Fechar Tela")
            document.body.removeChild(insideDiv)
            
        })
        checkboxAllUsers.addEventListener("click",function(){
            document.querySelectorAll(".checkboxUser").forEach(function(checkbox){
                if(!checkbox.checked){
                    checkbox.checked = true
                    this.checked = true
                }
                else if(checkboxAllUsers.checked || !checkbox.checked){
                    checkbox.checked = true
                    this.checked = true
                }
                else if(!checkboxAllUsers.checked && checkbox.checked){
                    checkbox.checked = true
                    this.checked = true
                }
                else{
                    checkbox.checked = false
                    this.checked = false
                }
            })
        })
        const buttonConfirm = makeButton(texts.text("labelConfirm"),"primary","")
        buttonConfirm.addEventListener("click",function(){
            var viewer = [];
            // viewer = [];

            list_tableUsers.forEach(function (user) {
                var viewerCheckbox = document.getElementById("viewercheckbox_" + user.guid);
                if (viewerCheckbox.checked) {
                    viewer.push(user.guid);
                }
                    viewers(viewer)
            });
                document.body.removeChild(insideDiv)
        })

        //appends
        divButtons.appendChild(buttonCancel)
        divButtons.appendChild(buttonConfirm)
        divManage.appendChild(textManage)
        divManage.appendChild(btnManage)
        divLabelandCheckbox.appendChild(labelSelectAllUsers)
        divLabelandCheckbox.appendChild(checkboxAllUsers)
        selectAllUsers.appendChild(nameOfUsers)
        selectAllUsers.appendChild(divLabelandCheckbox)
        divMain.appendChild(titleUsers)
        divMain.appendChild(iptSearch)
        divMain.appendChild(selectAllUsers)
        divMain.appendChild(scrollUsers)
        divMain.appendChild(divManage)
        divMain.appendChild(divButtons)
        insideDiv.appendChild(divMain)
        document.body.appendChild(insideDiv)
    }
    function makeDivAddAvailability(typeRoom,dateTime,typeSchedule){
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
            Calendar.createCalendar(divCalendar,"all",function(day){
                selectedDay = day
                console.log("Dia Selecionado " + JSON.stringify(selectedDay))
                
            },"availability")
            
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
            
            var typeSched = "hourModule";
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
            console.log("Fechar Tela")
            document.body.removeChild(insideDiv)
            
            })
            const buttonConfirm = makeButton(texts.text("labelConfirm"),"primary","")
            buttonConfirm.addEventListener("click",function(){
            typeSchedule(typeSched)
            console.log("typeSched " ,typeSched)
            if(typeSched = "hourModule"){
                dateTime(dates)
                console.log("Hour Module")
            }
            else if(typeSched = "dayModule"){
                dates = []
                dates.push({
                    start: selectedDay.startDate + "T" + "00:00",
                    end:  selectedDay.endDate + "T" + "23:59"
                })
                console.log( "DATES TIPO DIA " + JSON.stringify(dates))
                dateTime(dates)
                console.log("day Module")
          
            }
            document.body.removeChild(insideDiv)
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

            var week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
                            case "Mon":
                                datesRecurrent.push({ startMonday : startTime });
                                break;
                            case "Tue":
                                datesRecurrent.push({ startTuesday: startTime });
                                break;
                            case "Wed":
                                datesRecurrent.push({ startWednesday : startTime });
                                break;
                            case "Thu":
                                datesRecurrent.push({ startThursday : startTime });
                                break;
                            case "Fri":
                                datesRecurrent.push({ startFriday : startTime });
                                break;
                            case "Sat":
                                datesRecurrent.push({ startSaturday : startTime });
                                break;
                            case "Sun":
                                datesRecurrent.push({ startSun : startTime });
                                break;
                            default:
                                break;
                        }
                    });
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
                                case "Mon":
                                    datesRecurrent.push({ endMonday : endTime });
                                    break;
                                case "Tue":
                                    datesRecurrent.push({ endTuesday: endTime });
                                    break;
                                case "Wed":
                                    datesRecurrent.push({ endWednesday : endTime });
                                    break;
                                case "Thu":
                                    datesRecurrent.push({ endThursday : endTime });
                                    break;
                                case "Fri":
                                    datesRecurrent.push({ endFriday : endTime });
                                    break;
                                case "Sat":
                                    datesRecurrent.push({ endSaturday : endTime });
                                    break;
                                case "Sun":
                                    datesRecurrent.push({ endSun : endTime });
                                    break;
                                default:
                                    break;
                            }
                        });
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

                const inputs = document.querySelectorAll('.inputIndividualHour');
                
                inputs.forEach(function(input, index) {
                    const dataDay = input.dataset.day;
                    const startTime = input.value;
                    //var endTime;
                    // Verifica se o próximo input na lista é para o horário de fim
                    const nextInput = inputs[index + 1];
                    if (nextInput && nextInput.dataset.day === dataDay) {
                        const endTime = nextInput.value;
                        console.log("DIA DA SEMANA  " + dataDay + " Hora inicio " + startTime + " Hora fim " + endTime);

                        daysSelected.forEach(function (dayDiv) {
                            //var dayId = dayDiv.getAttribute("id");
                            datesRecurrent = [] // limpeza
                            switch (dataDay) {
                                case "Mon":
                                    datesRecurrent.push({ startMonday : startTime });
                                    datesRecurrent.push({ endMonday : endTime });
                                    break;
                                case "Tue":
                                    datesRecurrent.push({ startTuesday: startTime });
                                    datesRecurrent.push({ endTuesday : endTime });
                                    break;
                                case "Wed":
                                    datesRecurrent.push({ startWednesday : startTime });
                                    datesRecurrent.push({ endWednesday : endTime });
                                    break;
                                case "Thu":
                                    datesRecurrent.push({ startThursday : startTime });
                                    datesRecurrent.push({ endThursday : endTime });
                                    break;
                                case "Fri":
                                    datesRecurrent.push({ startFriday : startTime });
                                    datesRecurrent.push({ endFriday : endTime });
                                    break;
                                case "Sat":
                                    datesRecurrent.push({ startSaturday : startTime });
                                    datesRecurrent.push({ endSaturday : endTime });
                                    break;
                                case "Sun":
                                    datesRecurrent.push({ startSun : startTime });
                                    datesRecurrent.push({ endTSun : endTime });
                                    break;
                                default:
                                    break;
                            }
                        });
                    } else {
                        console.log("Não há um próximo input ou é para um dia diferente");
                    }


                });
                
                dateTime(datesRecurrent) // passar todas as datas recorrentes para o callback 

                // var devArray = [];
                // // viewer = [];
    
                // devices.forEach(function (dev) {
                //     var devCheckbox = document.getElementById("checkboxDev_" + dev.hwid);
                //     if (devCheckbox.checked) {
                //         devArray.push(dev.hwid);
                //     }
                    
                // });
                // 
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
               //(DRY - Don't Repeat Yourself): APENAS UM TESTE SERÁ MODIFICADO NA SEGUNDA-FEIRA 29/2  ~pietro
               getAllClickedWeekDays(daysSelected,"individual",divAllHours)
            })
        }
        document.body.appendChild(insideDiv)
      

        // depois que adiciona tudo no body, chamaremos a função para aplicar o click nos
        // dias recorrentes 
        getAllClickedWeekDays(daysSelected)

        
    }
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
            const button2 = makeButton(btn2, "transparent", "");
            button2.addEventListener("click",function(){
                console.log("BUTTON 2 CLICADO")
                document.body.removeChild(bcgrd)
            })
            divButtons.appendChild(button2)
        }
        return button1
    }
    function makeDivChooseImage(callback){
        // filesID = [] // limpeza
        controlDB = false
        const insideDiv = new innovaphone.ui1.Div(null, null, "bg-black bg-opacity-50 justify-center items-center absolute h-full w-full top-0 flex");

        const divMain = new innovaphone.ui1.Div(null, null, "inline-flex p-3 flex-col flex-start gap-1 rounded-lg bg-dark-100");
    
        const titleImg = new innovaphone.ui1.Div(null, texts.text("labelImageRoom"), "text-3 text-white font-bold");
    
        const mainImg = new innovaphone.ui1.Node("img", null,"","h-[260px] rounded-lg aspect-[3/4]");
        mainImg.setAttribute("src", './images/MESA-1.png');
        mainImg.setAttribute("id", "divMainImg");
    
        const divSelectImgs = new innovaphone.ui1.Div(null,null,"flex w-full items-start gap-1 flex-row");

        const img1 = createImage('./images/MESA-1.png');
        const img2 = createImage('./images/MESA-2.png');
        const img3 = createImage('./images/MESA-3.png');

        img1.addEvent("click", function (event) {
            addBorderAndChangeImage(img1, mainImg, './images/MESA-1.png');
        });
    
        img2.addEvent("click", function (event) {
            addBorderAndChangeImage(img2, mainImg, './images/MESA-2.png');
        });
    
        img3.addEvent("click", function (event) {
            addBorderAndChangeImage(img3, mainImg, './images/MESA-3.png');
        });
        const divIptImage = new innovaphone.ui1.Div(null,null,"flex p-1 justify-between items-center rounded-lg bg-dark-200");
        const labelImportImg = new innovaphone.ui1.Div(null, texts.text("labelImportImg"));
        const customFileInput = new innovaphone.ui1.Node("label",null,texts.text("labelChoose"),"bg-primary-600 hover:bg-primary-500 text-dark-100 font-medium py-1 px-2 rounded-lg primary cursor-pointer");
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
            callback(mainImgSrc);
            that.rem(insideDiv);
            filesID = []
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

    }
    function makeDivAddDevices(devices){
        // consultar os devices  
        

        const insideDiv = document.createElement("div")
        insideDiv.classList.add("bg-black", "bg-opacity-50", "justify-center","items-center","absolute","h-full","w-full","top-0","flex");
        
        const divMain = document.createElement("div")
        divMain.classList.add("inline-flex","p-3","flex-col","flex-start","gap-1","rounded-lg","bg-dark-100","w-full","m-3")

        const titleDevices = document.createElement("div")
        titleDevices.textContent = texts.text("labelUsers")
        titleDevices.classList.add("text-3","text-white" ,"font-bold")

        const iptSearch = makeInput("","search",texts.text("labelIptSearch"))
        iptSearch.classList.add("w-full")

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
                    console.log("ID  " + this.id)
                // apiPhone.send({ mt: "StartCall", sip: "vitor" })
            })
            const checkboxDevice = makeInput("","checkbox","")
            checkboxDevice.setAttribute("id",'checkboxDev_' + dev.hwid)

            divCheckbox.appendChild(identifyBtn)
            divCheckbox.appendChild(checkboxDevice)
            divImgDevice.appendChild(imgDevice)
            divImgDevice.appendChild(nameDevice)
            divMainDevices.appendChild(divImgDevice);
            divMainDevices.appendChild(divCheckbox);
            scrollDevices.appendChild(divMainDevices)
        })  
        const divButtons = document.createElement("div")
        divButtons.classList.add("flex","justify-between","items-center","rounded-md")
        const buttonCancel = makeButton(texts.text("labelBtnCancel"),"secundary","")
        buttonCancel.addEventListener("click",function(){
            console.log("Fechar Tela")
            document.body.removeChild(insideDiv)
            
        })
        const buttonConfirm = makeButton(texts.text("labelConfirm"),"primary","")
        buttonConfirm.addEventListener("click",function(){
            var devArray = [];
            // viewer = [];

            devices.forEach(function (dev) {
                var devCheckbox = document.getElementById("checkboxDev_" + dev.hwid);
                if (devCheckbox.checked) {
                    devArray.push(dev.hwid);
                }
                devHwId = devArray 
                console.log(devHwId)
                
            }); 

                 // ajustar para usar callBack caso funcione assim  ~~ Pietro
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
        const btnMenu = makeButton('','',"./images/menu.svg")
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
            
            var viewersFilter = viewers.filter(function (v){
                return v.room_id == room.id
            })
            //componente avatar
            makeAvatar(viewersFilter,divMain,room)

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
                var week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
        // var sched = schedules.filter(function (sched) {
        //     return id == sched.device_room_id
        // });
        var viws = viewers.filter(function (viws) {
            return id == viws.room_id
        });

        that.clear();
        backButton.addEventListener("click",function(event){
            event.stopPropagation()
            event.preventDefault()
            makeViewRoom(rooms,devices,availabilities,viewers)
        })
        makeHeader(backButton, makeButton(texts.text("save"),"primary",""), room.name)
        // div container
        const container = document.createElement("div")
        container.classList.add("overflow-auto", "gap-1", "grid", "sm:grid-cols-2","sm:grid-rows-2", "m-1","content-start",)
        container.style.height = 'calc(100vh - 70px)'
        container.setAttribute("id", "container")
        document.body.appendChild(container);
        // div sala
        const divMainSala = document.createElement("div")
        divMainSala.classList.add("aspect-[4/3]", "bg-dark-200", "rounded-lg", "divMainSala","sm:row-span-2","p-2","justify-start","items-start","min-w-[220px]","h-full","w-full")

        const divImg = document.createElement("div")
        divImg.classList.add("aspect-[4/3]", "bg-center", "bg-cover", "bg-no-repeat", "rounded-lg", "divSala","sm:bg-[length:606px_455px]")
        divImg.setAttribute("style", `background-image: url(${room.img});`);
        container.appendChild(divMainSala)
        divMainSala.appendChild(divImg)

        //card horarios implementado pelo Pietro
        const divHorario = document.createElement("div")
        divHorario.classList.add("divHorario","w-full","h-full",)
        container.appendChild(divHorario)
        makeViewCalendarDetail(divHorario, avail)

        // div container (scroll) devices
        const div102 = document.createElement("div")
        div102.classList.add("div102","sm:col-start-2")
        /*div102.style.height = 'calc(100vh - 70px)'*/
        div102.setAttribute("id", "div102")
        container.appendChild(div102);

        devs.forEach(function (device) {
            var s = sched.filter(function (s) {
                return device.id == s.device_id
            });
            var viewer = viws.filter(function (v) {
                return v.viewer_guid == device.guid && v.room_id == room.id
            });
            makeDeviceIcon(divImg, device, viewer)
            makeViewDevice(div102, device, avail, s, viewer)
        })
    }
    function makeAvatar(viewersFilter, divMain) {
        const divUsersAvatar = document.createElement("div");
        divUsersAvatar.classList.add("flex", "items-start", "gap-1");
        divUsersAvatar.setAttribute("id", "divUsersAvatar");
        console.log("ARRAY USERS:" + JSON.stringify(viewersFilter));

        let processedUsersCount = 0;

        viewersFilter.forEach(function (viewer) {
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
    
    //#endregion VISUALIZAÇÃO DE SALA

    //#region COMPONENTES
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
                input.classList.add("flex","p-1","flex-col","items-start","gap-1","bg-white","rounded-lg","w-full","text-dark-600")
                break
            case "file":
                input.style.display = "none";
                const customFileInput = document.createElement("label");
                customFileInput.textContent = text;
                customFileInput.classList.add("bg-primary-600", "hover:bg-primary-500", "text-dark-100", "font-medium", "py-1", "px-2", "rounded-lg", "primary", "cursor-pointer");
                customFileInput.appendChild(input);
                return customFileInput;
            case "time":
                input.classList.add("text-black","rounded-lg")
                break
            case "checkbox":
                input.classList.add("w-[16px]","h-[16px]","rounded-md");
                break
            case "search":
                input.classList.add("flex","p-1","justify-between","items-center","rounded-md","bg-white","text-dark-500")

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
    function getAllClickedWeekDays(daysSelected,individualHour,divAllHours){
        document.querySelectorAll(".dayDiv").forEach(function(d){
            var marked = false;
            d.addEventListener("click",function(event){
                console.log("Clicando")
                if(!marked){
                    event.preventDefault()
                    event.stopPropagation()
                    d.classList.add("rounded-full","bg-dark-400")
                    marked = true
                    daysSelected.push(d)
                    console.dir("DaysSelectedArray " + daysSelected)
                    
                    if(individualHour == "individual"){
                        var dayId = d.getAttribute("id"); // ids das divs

                    // const divAllHours = document.createElement("div") // div com scroll
                    // divAllHours.classList.add("flex","overflow-auto","height-[250px]","flex-col","items-start","gap-1")

                    const divHourSelectLabel = document.createElement("div")
                    divHourSelectLabel.classList.add("text-1","font-bold","text-white")
                    divHourSelectLabel.textContent = texts.text("labelSelectHourTo") + " " +  texts.text("label" + dayId + "Div")
                        
                    const divIndividualHours = document.createElement("div")
                    divIndividualHours.classList.add("flex","p-1","flex-col","items-start","gap-1","rounded-lg","bg-dark-200","w-full")
                    
                    
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

                    divTimeStart.dataset.day = d.getAttribute("id");
                    divTimeEnd.dataset.day = d.getAttribute("id");

                    }
                }else{
                    d.classList.remove("rounded-full", "bg-dark-400");
                    marked = false;

                    var index = daysSelected.indexOf(d);

                    if (index !== -1) {
                        daysSelected.splice(index, 1);
                    }
            
                    console.log(daysSelected);

                    if(individualHour == "individual"){
                        
                    }
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
    function makeDivOptions(){
        that.clear();
        // backButton.addEventListener("click",function(event){
        //     event.preventDefault();
        //     event.stopPropagation();
        //     makeViewRoom(rooms,devices,availabilities,viewers)
        // })
        makeHeader(backButton , makeButton("","","./images/settings.svg"), texts.text("labelOptions"),function(){
            makeViewRoom(rooms,devices,availabilities,viewers)
        },)
        const divMain = document.createElement("div")
        divMain.classList.add("flex","h-full","p-1","flex-col","items-start","sm:mx-[200px]","gap-1")
        // criar sala
        const divMakeRoom = document.createElement("div")
        divMakeRoom.classList.add("flex","p-1","items-center","gap-1","rounded-lg","bg-dark-200","w-full")
        const plusIcon = document.createElement("img")
        plusIcon.src = './images/plus-circle.svg'
        const labelMakeRoom = document.createElement("div")
        labelMakeRoom.textContent = texts.text("labelCreateRoom")
        // provisioning code
        const divProvCode = document.createElement("div")
        divProvCode.classList.add("flex","p-1","items-center","gap-1","rounded-lg","bg-dark-200","w-full")
        const provIcon = document.createElement("img")
        provIcon.src = './images/hash.svg'
        const labelProvCode = document.createElement("div")
        labelProvCode.textContent = texts.text("labelProvCode")
        // tabela agendamento
        const divTableSched = document.createElement("div")
        divTableSched.classList.add("flex","p-1","items-center","gap-1","rounded-lg","bg-dark-200","w-full")
        const schedIcon = document.createElement("img")
        schedIcon.src = './images/calendar-option.svg'
        const labelTableSched = document.createElement("div")
        labelTableSched.textContent = texts.text("labelTableSchedule")


        divMakeRoom.appendChild(plusIcon)
        divMakeRoom.appendChild(labelMakeRoom)
        divProvCode.appendChild(provIcon)
        divProvCode.appendChild(labelProvCode)
        divTableSched.appendChild(schedIcon)
        divTableSched.appendChild(labelTableSched)
        divMain.appendChild(divMakeRoom)
        divMain.appendChild(divProvCode)
        divMain.appendChild(divTableSched)
        document.body.appendChild(divMain)

        divMakeRoom.addEventListener("click",function(event){
            event.preventDefault
            event.stopPropagation()
            createRoomContext()
        })

    }
    function createRoomContext(){
        that.clear()
        makeHeader(backButton,makeButton("","",""),texts.text("labelCreateRoom"),function(){
            makeDivOptions()
        })
        const divMain = document.createElement("div")
        divMain.classList.add("flex","h-full","p-1","flex-col","items-start","sm:mx-[200px]","gap-1")
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
        // div criar do zero 
        const makeFromZero = document.createElement("div")
        makeFromZero.classList.add("flex","p-1","items-center","gap-1","rounded-lg","bg-dark-200","w-full","justify-center")
        makeFromZero.textContent = texts.text("labelmakeFromZero")

        divMain.appendChild(makeFromZero)
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


        // colDireita.add(new innovaphone.ui1.Div(null, null, "button")
        //         .addText("Código de Provisionamento")
        //         .addEvent("click", function () { devicesApi.send({ mt: "GetProvisioningCode", sip: sip, category: "Phones" }); }));


        // var pcButton = divAppointment.add(new innovaphone.ui1.Div(null, null, "button")
        //         .addText("Agendamento")
        //         .addEvent("click", function () { app.send({api: "admin", mt: "InsertAppointment", type:"hour", dateStart: dateStartInput.value, dateEnd: dateEndInput.value, device: phoneInput.value, deviceRoom: roomInput.value})}, pcButton));
        // var rvButton = divAppointment.add(new innovaphone.ui1.Div(null, null, "button")
        //         .addText("ProvisioningCode")
        //         .addEvent("click", function () {devicesApi.send({ mt: "GetProvisioningCode", sip: "Erick-LAB", category: "inn-lab-ipva IP Phone" })}, rvButton));

   
    // function makeDivCreateRoom(t){
    //     t.clear();
    //     filesID = [];  // para não excluir os arquivos corretos da DB files ; 
    //     console.log("FILES ID "  + filesID)
    //     //var insideDiv = t.add(new innovaphone.ui1.Div(null, null, "insideDiv"));
    
    //     var leftbox = t.add(new innovaphone.ui1.Node("div", null, null, "list-box scrolltable").setAttribute("id", "left-box"));
    
    //     leftbox.add(new innovaphone.ui1.Div(null, null, "closewindow").setAttribute("id", "closewindow"));
    
    //     var topButtons = leftbox.add(new innovaphone.ui1.Div("position:absolute;width:80%;", null, null).setAttribute("id", "top-bottons"));
    //     topButtons.add(new innovaphone.ui1.Node("ul", null, null, null)).add(new innovaphone.ui1.Node("a", "width: 100%;", texts.text("labelGeral"), null).setAttribute("id", "list-geral"));
    //     topButtons.add(new innovaphone.ui1.Node("ul", null, null, null)).add(new innovaphone.ui1.Node("a", "width: 100%;", texts.text("labelUsers"), null).setAttribute("id", "list-users"));
    //     topButtons.add(new innovaphone.ui1.Node("ul",null,null,null)).add(new innovaphone.ui1.Node("a","width: 100%;",texts.text("labelSchedules"),null).setAttribute("id","list-schedule"))
        
    //     divinputs = leftbox.add(new innovaphone.ui1.Div(null, null, "divInputs"));
    //     var divGeral = divinputs.add(new innovaphone.ui1.Div(null, null, "divGeral").setAttribute("id", "div-geral"));
    //     divGeral.add(new innovaphone.ui1.Div(null, texts.text("labelName"), null));
    //     divGeral.add(new innovaphone.ui1.Input(null, null, null, 100, "text", "iptRoomName").setAttribute("id", "iptRoomName"));
    //     input = divGeral.add(new innovaphone.ui1.Node("input", null, "", ""));
    //     input.setAttribute("id", "fileinput").setAttribute("type", "file");
    //     input.setAttribute("accept", "image/*");
    //     input.container.addEventListener('change', onSelectFile, false);

    //     divGeral.add(new innovaphone.ui1.Div(null, texts.text("labelTypeRoom"), null))
    //     var selectTypeRoom = divGeral.add(new innovaphone.ui1.Node("select",null,null,null).setAttribute("id","selectType"))
    //     selectTypeRoom.add(new innovaphone.ui1.Node("option", null, texts.text("recurrentType"),null).setAttribute("id","recurrentType"))
    //     selectTypeRoom.add(new innovaphone.ui1.Node("option", null, texts.text("periodType"),null).setAttribute("id","periodType"))
        
    //     divGeral.add(new innovaphone.ui1.Div(null, texts.text("labelModuleRoom"), null))
    //     var selectTypeRoom = divGeral.add(new innovaphone.ui1.Node("select",null,null,null).setAttribute("id","selectModule"))
    //     selectTypeRoom.add(new innovaphone.ui1.Node("option", null, texts.text("hourModule"),null).setAttribute("id","hourModule"))
    //     selectTypeRoom.add(new innovaphone.ui1.Node("option", null, texts.text("dayModule"),null).setAttribute("id","dayModule"))
    //     selectTypeRoom.add(new innovaphone.ui1.Node("option", null, texts.text("periodModule"),null).setAttribute("id","periodModule"))

    //     // divPhones = leftbox.add(new innovaphone.ui1.Div("position: absolute;width: 40%; height:70%; display: flex;left: 3%; justify-content: center;top: 20%;",null,null).setAttribute("id","divPhones"))
    //     imgBD = divGeral.add(new innovaphone.ui1.Node("div",null,null,null).setAttribute("id","imgBD"))
    //     app.sendSrc({ mt: "SqlInsert", statement: "insert-folder", args: { name: "myFolder" }} , folderAdded);

    //     var divUsers = divinputs.add(new innovaphone.ui1.Div("position:absolute;width:100%;height:100%;display:none ;justify-content:center;align-items:center").setAttribute("id","div-users"))
    //     var rightDiv = divUsers.add(new innovaphone.ui1.Node("div", null, null, "right-box scrolltable tableusers").setAttribute("id","list-box"))
    //     var userTable = createUsersDepartmentsGrid();
    //     rightDiv.add(userTable)
        
    //     var divScheduleInn = divinputs.add(new innovaphone.ui1.Div("position:absolute;width:100%;height:100%;display:none").setAttribute("id","div-schedule"))
    //     //var divStartHour = divSchedule.add(new innovaphone.ui1.Div(null,texts.text("labelHourOpening"),"divStartHour"))
    //     //var divEndHour = divSchedule.add(new innovaphone.ui1.Div(null,texts.text("labelHourClosing"),"divEndHour"))
    //     //var hourStart = divSchedule.add(new innovaphone.ui1.Input(null,null,null,null,"time","startIpt").setAttribute("id","startIpt"))
    //     //var hourEnd = divSchedule.add(new innovaphone.ui1.Input(null,null,null,null,"time","endIpt").setAttribute("id","endIpt"))
    //     //var btnSave = divSchedule.add(new innovaphone.ui1.Node("button","width:90px;height:35px;display:flex;justify-content:center;align-items:center;top:1%;left:75%;position:absolute;",texts.text("labelCreateRoom"),null).setAttribute("id","btnSaveRoom")) 
    //     //divSchedule.add(new innovaphone.ui1.Div("position:absolute;top:10%",null,null).setAttribute("id","calendar"))

    //     var divGeral = document.getElementById("div-geral");
    //     var divUsers = document.getElementById("div-users");
    //     var divSchedule = document.getElementById("div-schedule");

    //     document.getElementById("list-geral").addEventListener("click", function () {
        
    //         divGeral.style.display = "flex";
    //         divUsers.style.display = "none";
    //         divSchedule.style.display = "none";
    //     });

    //     document.getElementById("list-users").addEventListener("click", function () {
            
    //         divGeral.style.display = "none";
    //         divUsers.style.display = "flex";
    //         divSchedule.style.display = "none";
    //     });

    //     var a = document.getElementById("list-schedule");
    //     a.addEventListener("click", function () {
    //         divGeral.style.display = "none";
    //         divUsers.style.display = "none";
    //         divSchedule.style.display = "block";
    
    //         var selectType = document.getElementById("selectType");
    //         var optType = selectType.options[selectType.selectedIndex].id;
    //         // set checkbox conforme oq for selecionado
    //         makeSchedule(divScheduleInn, optType);
    //     });

        
    //     // setTimeout(function(){                 //arrumar e usar promisses para limpar o FilesID e dps fechar a janela
    //     //     filesID = [];                      // setTimeout muito coisa de Junior 
    //     //     filesID = "vazio";   
    //     // },2000)
    //     document.getElementById("closewindow").addEventListener("click",function(){
    //         // console.log("FILES ID "  + filesID)
    //         // if(filesID ){                                      
    //         //     console.log("FILES ID "  + filesID)
    //         //    deleteFile(filesID)
    //         // }
    //         setTimeout(function () {
    //             //insideDiv.clear()
    //             //t.rem(insideDiv)
    //             //controlDB = false // controle da DB files
            
    //             //app.send({ api: "admin", mt: "SelectAllRoom" })
    //         },500) // arrumar para carregar isso apos o termino da requisição 
    //         leftbox.clear()
    //         t.rem(leftbox)
    //         controlDB = false // controle da DB files

    //         app.send({ api: "admin", mt: "SelectAllRoom" })
    //         waitConnection(that);
    //     })
    


    // }
   
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
function resetPhonesDrop(ev){
    ev.stopPropagation();
    ev.preventDefault();

    var data = ev.dataTransfer.getData("text");
    var draggedElement = document.getElementById(data);
    var divPhones = document.getElementById("divPhones");

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
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    ev.dataTransfer.dropEffect = 'copy';
}

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

        if(controlDB){
            // document.getElementById("imgBD").innerHTML = ''
            var divMainImg = document.getElementById("divMainImg")
            divMainImg.setAttribute("src",start.originalUrl + "/files/" + file.id)
            filesID = file.id
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
