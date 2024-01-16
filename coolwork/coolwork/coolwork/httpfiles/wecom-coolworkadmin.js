
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.coolworkAdmin = Wecom.coolworkAdmin || function (start, args) {
    this.createNode("body");
    var that = this;
    var appdn = start.title;
    var UIuser;
    var leftbox;
    var dateStart; //agendamentos 
    var dateEnd;  // agendamentos 

    var editor = []; // editores 
    var viewer = []; // visualizadores 

    //var divPhones;  //db files variáveis

    var filesID = [];
    var ativos = [];  // vaiavel para controle dos devices de cada sala
    var imgBD; // db files variaveis
    var controlDB = false ; // db files variaveis
    var input; // db files variaveis
    var listbox; // db files variaveis
    var filesToUpload = []; // db files variaveis
    var phone_list = [] // todos os devices
    var us
    var listDeviceRoom = []; 
    var list_AllRoom = []
    var list_room = [];
    var list_editors = [];
    var list_viewers = [];
    var list_RoomSchedule = []
    //var appointments = []
    var colDireita;
    var appointments = []
    var list_tableUsers = []
    var UIuserPicture;
    var userSIP;
    var userDN;
    var userDomain;
    var divinputs; 
    // var devicesApi = start.consumeApi("com.innovaphone.devices");
    //     devicesApi.onmessage.attach(onmessage); // onmessage is called for responses from the API
    // var websocket = null

    // function send(obj) {
    //     if (obj && websocket) {
    //         var msg = JSON.stringify(obj);
    //         console.log("send to pbx (" + websocket.readyState + "): " + msg);
    //         websocket.send(msg);
    //         return true;
    //     }
    //     return false;
    // }

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

    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "admin", mt: "TableUsers" });
        app.send({ api: "admin", mt: "CheckAppointment" });
        controlDB = false
        userDomain = domain
        userDN = dn
        userSIP = user
        devicesApi = start.consumeApi("com.innovaphone.devices");
        devicesApi.onmessage.attach(devicesApi_onmessage); // onmessage is called for responses from the API
        devicesApi.send({ mt: "GetPhones" }); // phonelist
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
    // setInterval(function(){
    //     devicesApi.send({ mt: "GetPhones" }); // controlador - revisar e fazer melhorias 
    // },5000)
        
    function app_message(obj) {
        if (obj.api === "admin" && obj.mt === "SelectDevicesResult") {
            phone_list = JSON.parse(obj.result)
            makeDivAddDevices(phone_list)
        }
        if (obj.api === "admin" && obj.mt === "SelectAllRoomResult") {
            list_AllRoom = JSON.parse(obj.result)
            makeViewRoom() 
            //constructor(that)
            //se precisar usar a tela do admin original  para criar salas é so descomentar essa função       
        }
        if (obj.api === "admin" && obj.mt === "UpdateRoomResult") {
            app.send({api:"admin", mt:"SelectAllRoom"})
        }
        if (obj.api === "admin" && obj.mt === "DeleteRoomSuccess") {
            app.send({api:"admin", mt:"SelectAllRoom"})
        }
        if (obj.api === "admin" && obj.mt === "InsertRoomResult") {
            app.send({api:"admin", mt:"SelectAllRoom"})
        }
        if (obj.api === "admin" && obj.mt === "SelectRoomResult") {
            list_room = JSON.parse(obj.rooms)
            list_RoomSchedule = JSON.parse(obj.schedules)
            listDeviceRoom = obj.dev
            list_editors = JSON.parse(obj.editors)
            list_viewers = JSON.parse(obj.viewers)
            console.log("List_Editors" + JSON.stringify(list_editors))
            console.log("List_viewers" + JSON.stringify(list_viewers))
             
            
            //makeDivRoom(_colDireita); 
            
        }
        if (obj.api === "admin" && obj.mt === "UpdateDevicesResult") {
            app.send({api:"admin", mt:"SelectAllRoom"})
        }
        if (obj.api == "admin" && obj.mt == "TableUsersResult") {
            list_tableUsers = JSON.parse(obj.result);        
            console.log("TABLEUSERS" + JSON.stringify(list_tableUsers))   
        }
        if (obj.api == "admin" && obj.mt == "CheckAppointmentResult") {
            appointments = obj.result;
        }
        if (obj.api == "admin" && obj.mt == "InsertAppointmentResult") {
            console.log("AGENDADO", JSON.parse(obj.result))
        }
    }
    // funções tela nova (figma)

    //funções criação de telas 
        function makeViewRoom(){
            that.clear();
            const btnMenu = makeButton('','',"./images/menu.svg")
            makeHeader(makeButton("","","./images/home.svg"), btnMenu , texts.text("labelYourRooms"))
            btnMenu.addEventListener("click",function(){
                console.log("click")
                makeDivOptions()
            })
        }
        function makeDivOptions(){
            that.clear();
            makeHeader(backButton,makeButton("","","./images/settings.svg"), texts.text("labelOptions"))
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
            makeHeader(backButton,makeButton("","",""),texts.text("labelCreateRoom"))
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

        var typeRoom;
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
                // tipo de agendamento colocar isso na tela de agendamento

        // const divTypeSchedule = document.createElement("div")
        // divTypeSchedule.classList.add("flex","p-1","items-center","justify-between","bg-dark-200","rounded-lg","w-full")
        // const labelTypeSchedule = document.createElement("div")
        // labelTypeSchedule.textContent = texts.text("labelTypeSchedule")
        // const btnDaySchedule = makeButton(texts.text("labelDay"),"secundary","")
        // const btnHourSchedule = makeButton(texts.text("labelHour"),"secundary","")

        // usuarios
        const divUsersRoom = document.createElement("div")
        divUsersRoom.classList.add("flex","p-1","items-center","justify-between","bg-dark-200","rounded-lg","w-full")
        const labelUsersRoom = document.createElement("div")
        labelUsersRoom.textContent = texts.text("labelUsers")
        const divBtnAddUsers = makeButton(texts.text("labelAdd"),"primary","")
        divBtnAddUsers.addEventListener("click",function(){
            console.log("Abrir Div Add Usuários")
            makeDivAddUsers()
        })
        //horario agendamento 
        const divHourSchedule = document.createElement("div")
        divHourSchedule.classList.add("flex","p-1","items-center","justify-between","bg-dark-200","rounded-lg","w-full")
        const labelHourSchedule = document.createElement("div")
        labelHourSchedule.textContent = texts.text("labelHourSchedule")
        const btnMakeCalendar = makeButton(texts.text("labelEdit"),"primary","")
        btnMakeCalendar.addEventListener("click",function(){
            makeDivAddAvailability()
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

        btnCreateRoom.addEventListener("click",function(){
            console.log("CRIAR SALA")
            var nomeSala = document.getElementById("iptNameRoom").value
            console.log("Nome da Sala: " + nomeSala + "\n"
            + "Imagem da Sala: " + imgRoom + "\n"
            + "Tipo de sala: " + typeRoom
            )
            
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
        function makeDivAddUsers(){
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
                checkboxUser.setAttribute("id",user.guid)
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
            const buttonConfirm = makeButton(texts.text("labelConfirm"),"primary","")

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
        function makeDivAddAvailability(){
            // mudará conforme o tipo de sala ( RECORRENTE OU PERÍODO )
            const insideDiv = document.createElement("div")
            insideDiv.classList.add("bg-black", "bg-opacity-50", "justify-center","items-center","absolute","h-full","w-full","top-0","flex");
            
            const divMain = document.createElement("div")
            divMain.classList.add("inline-flex","p-3","flex-col","flex-start","gap-1","rounded-lg","bg-dark-100")

            const titleImg = document.createElement("div")
            titleImg.textContent = texts.text("labelImageRoom")
            titleImg.classList.add("text-3","text-white" ,"font-bold")
        }
        function makeDivChooseImage(callback){
            const insideDiv = document.createElement("div")
            insideDiv.classList.add("bg-black", "bg-opacity-50", "justify-center","items-center","absolute","h-full","w-full","top-0","flex");
        
            const divMain = document.createElement("div")
            divMain.classList.add("inline-flex","p-3","flex-col","flex-start","gap-1","rounded-lg","bg-dark-100")

            const titleImg = document.createElement("div")
            titleImg.textContent = texts.text("labelImageRoom")
            titleImg.classList.add("text-3","text-white" ,"font-bold")

            const mainImg = document.createElement("img")
            mainImg.classList.add("h-[260px]","rounded-lg","aspect-[3/4]")
            mainImg.src = './images/MESA-1.png'

            const divSelectImgs = document.createElement("div")
            divSelectImgs.classList.add("flex","w-full","items-start","gap-1","flex-row")

            const img1 = document.createElement("img")
            img1.classList.add("basis-1/3","w-[96px]","aspect-[4/3]","rounded-lg")
            img1.src = './images/MESA-1.png'
            const img2 = document.createElement("img")
            img2.classList.add("basis-1/3","w-[96px]","aspect-[4/3]","rounded-lg")
            img2.src = './images/MESA-2.png'
            const img3 = document.createElement("img")
            img3.classList.add("basis-1/3","w-[96px]","aspect-[4/3]","rounded-lg")
            img3.src = './images/MESA-3.png'

            img1.addEventListener("click", function(event) {
            addBorderAndChangeImage(img1, mainImg, './images/MESA-1.png');
            });
        
        img2.addEventListener("click", function(event) {
            addBorderAndChangeImage(img2,mainImg, './images/MESA-2.png');
        });
        
        img3.addEventListener("click", function(event) {
            addBorderAndChangeImage(img3, mainImg,'./images/MESA-3.png');
        });

            const divIptImage = document.createElement("div")
            divIptImage.classList.add("flex","p-1","justify-between","items-center","rounded-lg","bg-dark-200")
            const labelImportImg = document.createElement("div")
            labelImportImg.textContent = texts.text("labelImportImg")
            const iptFileImg =  makeInput(texts.text("labelChoose"),"file","")
            iptFileImg.addEventListener("change", function () {
            console.log("CLICANDO")
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
            callback(mainImg.getAttribute("src"))
            document.body.removeChild(insideDiv)
            })
            divSelectImgs.appendChild(img1)
            divSelectImgs.appendChild(img2)
            divSelectImgs.appendChild(img3)
            divIptImage.appendChild(labelImportImg)
            divIptImage.appendChild(iptFileImg)
            divButtons.appendChild(buttonCancel)
            divButtons.appendChild(buttonConfirm)
            divMain.appendChild(titleImg)
            divMain.appendChild(mainImg)
            divMain.appendChild(divSelectImgs)
            divMain.appendChild(divIptImage)
            divMain.append(divButtons)
            insideDiv.appendChild(divMain)

            document.body.appendChild(insideDiv)
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
                const checkboxDevice = makeInput("","checkbox","")
                checkboxDevice.setAttribute("id",dev.hwid)

                divImgDevice.appendChild(imgDevice)
                divImgDevice.appendChild(nameDevice)
                divMainDevices.appendChild(divImgDevice);
                divMainDevices.appendChild(checkboxDevice);
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
        // funções componentização 
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
                makeViewRoom()
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
                case "checkbox":
                    input.classList.add("w-[16px]","h-[16px]","rounded-md");
                    break
                case "search":
                    input.classList.add("flex","p-1","justify-between","items-center","rounded-md","bg-white","text-dark-500")

            }

            return input;
        
        }
        //botão voltar (arrow)
        const backButton = makeButton('', '', './images/arrow-left.svg');

        // funções internas (adicionais)
        function typeOfRoomButtons(event,btnPeriod,btnRecurrent,callback) {

            const clickedButton = event.target;
    
            if (clickedButton === btnPeriod) {
                btnRecurrent.className = ''
                btnPeriod.className = ''
                btnPeriod.classList.add("bg-dark-300", "hover:bg-dark-400", "text-primary-600", "font-bold", "py-1", "px-2", "rounded-lg");            
                btnRecurrent.classList.add("border-2","border-dark-400", "hover:bg-dark-500", "text-dark-400", "font-bold", "py-1", "px-2", "rounded-lg");
                callback(btnPeriod)
            }
            else if (clickedButton === btnRecurrent) {
                btnRecurrent.className = ''
                btnPeriod.className = ''
                btnRecurrent.classList.add("bg-dark-300", "hover:bg-dark-400", "text-primary-600", "font-bold", "py-1", "px-2", "rounded-lg");
                btnPeriod.classList.add("border-2","border-dark-400", "hover:bg-dark-500", "text-dark-400", "font-bold", "py-1", "px-2", "rounded-lg");
                callback(btnRecurrent)
            }
        }

        let lastClickedImg = null;
        function addBorderAndChangeImage(imgElement, mainImg , newSrc) {
            if (lastClickedImg !== null) {
                lastClickedImg.classList.remove("border-[3px]" ,"border-primary-100");
            }
        
            imgElement.classList.add("border-[3px]" , "border-primary-100");
        
            // Atualizar o último elemento clicado
            lastClickedImg = imgElement;
        
            mainImg.src = newSrc
        }

     // fim funções tela nova (figma)


    function getDateNow() {
        // Cria uma nova data com a data e hora atuais em UTC
        var date = new Date();
        // Adiciona o deslocamento de GMT-3 às horas da data atual em UTC
        date.setUTCHours(date.getUTCHours() - 3);

        // Formata a data e hora em uma string ISO 8601 com o caractere "T"
        var dateString = date.toISOString();

        // Substitui o caractere "T" por um espaço
        //dateString = dateString.replace("T", " ");

        // Retorna a string no formato "AAAA-MM-DDTHH:mm:ss.sss"
        return dateString.slice(0, -5);
    }
    function constructor(t){
        controlDB = false
        t.clear()
        // col esquerda
        var colEsquerda = t.add(new innovaphone.ui1.Div(null, null, "colunaesquerda "));
        colEsquerda.setAttribute("id", "colesquerda")

        // col direita
        var colDireita = t.add(new innovaphone.ui1.Div(null, null, "colunadireita"));
        colDireita.setAttribute("id", "coldireita")


    
        var divList = colEsquerda.add(new innovaphone.ui1.Div(null, null, "divList"));
        var imglogo = divList.add(new innovaphone.ui1.Node("img", null, null, "logoimg").setAttribute("src", "./images/logo-wecom.png"));
        var spanreport = divList.add(new innovaphone.ui1.Div("font-size: 1.00rem; position: absolute; left: 43px; color:white; margin: 5px;", "WECOM", null));
        
    
        var user = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; height: 10%; top: 10%; width: 100%; align-items: center; display: flex; border-bottom: 1px solid #4b545c"));
        var imguser = user.add(new innovaphone.ui1.Node("img", "max-height: 33px; position: absolute; left: 10px; border-radius: 50%;", null, null));
        imguser.setAttribute("src", UIuserPicture);
        var username = user.add(new innovaphone.ui1.Node("span", "font-size: 1.00rem; position: absolute; left: 43px; color:white; margin: 5px;", UIuser, null));
        username.setAttribute("id", "user");

        var liTables = colEsquerda.add(new innovaphone.ui1.Node("li",null, "Tabelas", "liTables").setAttribute("id", "liTables"));
        var appointments = liTables.add(new innovaphone.ui1.Node("li",null, "Tabela Agendamentos", "tableAppoint").setAttribute("id", "tableAppoint"));
        appointments.addEvent("click", function(){
            tableAppointments(colDireita)
        })

        var itens = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; height: 10%; top: 20%; width: 100%; align-items: center; display: flex; justify-content: center; border-bottom: 1px solid #4b545c",texts.text("labelCreateRoom"),null))
        itens.addEvent("click",function(){
            
            makeDivCreateRoom(colDireita)
        })
        var labelRoom = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; height: 10%; top: 30%; width: 100%; align-items: center; display: flex; justify-content:center;",texts.text("labelRooms") + "🔻" ,null))
        var rooms = colEsquerda.add(new innovaphone.ui1.Node("ul", "font-weight:bold; position: absolute; height: 40%; top: 40%; width: 100%; display: flex; flex-direction: column; overflow-x: hidden; overflow-y: auto; padding:0", null, null).setAttribute("id", "roomList"));
        // parte de exibição das salas
         list_AllRoom.forEach(function(room) {
            var liRoom =  rooms.add(new innovaphone.ui1.Node("li", "width: 100%; align-items: center; display: flex;  border-bottom: 1px solid #4b545c; padding: 10px;", null, null).setAttribute("id",room.id).addEvent("click",function(){
                var clickedElement = document.getElementById(room.id)
                var clickedId = clickedElement.getAttribute("id")
                console.log('ID do elemento div clicado:', clickedId);
                // app.send({api:"admin", mt:"SelectDevices"})
                app.send({ api: "admin", mt: "SelectRoom", id: clickedId });
            }));
            var imgRoom = liRoom.add(new innovaphone.ui1.Node("img", "width: 50px; height: 50px; margin-right: 10px;", null, null));
            imgRoom.setAttribute("src", room.img);
            liRoom.add(new innovaphone.ui1.Node("span", "font-weight: bold;", room.name, null));
            liRoom.add(new innovaphone.ui1.Node("div", "font-weight: bold; margin-left: 15px;", "🗑", "button").addEvent("click",function(){
                app.send({api: "admin" , mt: "DeleteRoom", id: room.id })
            }));
        });
        
        // col direita fora do list - box 

          ///////////////  SET PRESENCE ON INSERT  ///////////////////////////////
        //var divPresence = colDireita.add(new innovaphone.ui1.Div("width:100%;height:100%;text-align:center;display:flex;justify-content:center;align-items:center",null,null).setAttribute("id","userPresence"));
        // divPresence.add(new innovaphone.ui1.Node("span", "", "Presence PBX:", ""));
        // var inputPresence = divPresence.add(new innovaphone.ui1.Node("input", "", "", ""));
        // inputPresence.setAttribute("id", "pcinput").setAttribute("type", "text");
        // var pcInput = document.getElementById("pcinput")
        // var pcButton = divPresence.add(new innovaphone.ui1.Div(null, null, "button")
        //     .addText("Set Presence")
        //     .addEvent("click", function () { app.send({api: "admin", mt: "SetPresence", activity:"busy", note: pcInput.value})}, pcButton));
        ///////////////// END SET PRESENCE ON INSERT //////////////////////////
        var divAppointment = colDireita.add(new innovaphone.ui1.Div("width:100%;height:100%;text-align:center;display:flex;justify-content:center;flex-direction: column; align-items:center",null,null).setAttribute("id","userPresence"));
        divAppointment.add(new innovaphone.ui1.Node("span", "", "ID DA SALA:", ""));
        var inputRoom = divAppointment.add(new innovaphone.ui1.Node("input", "", "", ""));
        inputRoom.setAttribute("id", "inputRoom").setAttribute("type", "text");
        var roomInput = document.getElementById("inputRoom");
        divAppointment.add(new innovaphone.ui1.Node("span", "", "HWID PHONE", ""));
        var inputPhone = divAppointment.add(new innovaphone.ui1.Node("input", "", "", ""));



        
        inputPhone.setAttribute("id", "inputphone").setAttribute("type", "text");
        var phoneInput = document.getElementById("inputphone");
        divAppointment.add(new innovaphone.ui1.Node("span", "", "DATE START", ""));
        var dateStart = divAppointment.add(new innovaphone.ui1.Input(null, null, null, null, 'datetime-local', 'dateinput').setAttribute("id", "inputDateStart"));
        
        // var inputDateStart = divAppointment.add(new innovaphone.ui1.Node("input", "", "", ""));
        // inputDateStart.setAttribute("id", "inputDateStart").setAttribute("type", "text");

        var dateStartInput = document.getElementById("inputDateStart")

        divAppointment.add(new innovaphone.ui1.Node("span", "", "DATE END", ""));
        var dateEnd = divAppointment.add(new innovaphone.ui1.Input(null, null, null, '1000', 'datetime-local', 'dateinput').setAttribute("id", "inputDateEnd"));
        // var inputDateEnd = divAppointment.add(new innovaphone.ui1.Node("input", "", "", ""));
        // inputDateEnd.setAttribute("id", "inputDateEnd").setAttribute("type", "text");

        var dateEndInput = document.getElementById("inputDateEnd")

        colDireita.add(new innovaphone.ui1.Div(null, null, "button")
                .addText("Código de Provisionamento")
                .addEvent("click", function () { devicesApi.send({ mt: "GetProvisioningCode", sip: sip, category: "Phones" }); }));


        var pcButton = divAppointment.add(new innovaphone.ui1.Div(null, null, "button")
                .addText("Agendamento")
                .addEvent("click", function () { app.send({api: "admin", mt: "InsertAppointment", type:"hour", dateStart: dateStartInput.value, dateEnd: dateEndInput.value, device: phoneInput.value, deviceRoom: roomInput.value})}, pcButton));
        var rvButton = divAppointment.add(new innovaphone.ui1.Div(null, null, "button")
                .addText("ProvisioningCode")
                .addEvent("click", function () {devicesApi.send({ mt: "GetProvisioningCode", sip: "Erick-LAB", category: "inn-lab-ipva IP Phone" })}, rvButton));

        _colDireita = colDireita;
    }
    function labeling(code){
        console.log("PROVISION CODE STRINGFY", JSON.stringify(code))
        console.log("PROVISION CODE", code)
        _colDireita.add(new innovaphone.ui1.Node("div", "background-color: green; width: 300px; height: 300px; font-size: 50px; color: white; position: absolute; top: 30%; left: 50% ", code, "provCode")).setAttribute("id", "provCode");
    }
    function tableAppointments(cRight){
        cRight.clear()
        var scrollcontainer = cRight.add((new innovaphone.ui1.Div(null, null, "list-box scrolltable")))
        scrollcontainer.add(new innovaphone.ui1.Div(null, null, "closewindow").setAttribute("id","closewindow")).addEvent("click",function(){  // close 
            //t.rem(listbox)
            //waitConnection(that);
            //controlDB = false
            app.send({api:"admin", mt:"SelectAllRoom"})
            app.send({ api: "admin", mt: "CheckAppointment" });
        });
        var tableMain = scrollcontainer.add(new innovaphone.ui1.Node("table", null, null, "table").setAttribute("id", "local-table"));
        tableMain.add(new innovaphone.ui1.Node("th", null, "ID", null));
        tableMain.add(new innovaphone.ui1.Node("th", null, texts.text("labelRoomName"), null));
        tableMain.add(new innovaphone.ui1.Node("th", null, texts.text("periodType"), null));
        tableMain.add(new innovaphone.ui1.Node("th", null, texts.text("labelScheduleDateStart"), null));
        tableMain.add(new innovaphone.ui1.Node("th", null, texts.text("labelScheduleDateEnd"), null));
        tableMain.add(new innovaphone.ui1.Node("th", null, texts.text("labelScheduleUser"), null));
        tableMain.add(new innovaphone.ui1.Node("th", null, texts.text("labelDevice"), null));

        console.log("FOREACH TABLE" + JSON.stringify(appointments))
        

        appointments.forEach(function (table) {
            var users = list_tableUsers.filter(function (user) {
                return table.user_guid === user.guid;
            })[0];
            console.log("dep" + JSON.stringify(table))

            var starDate = table.data_start;
            var endDate = table.data_end;
            if (table.data_start) {
                var dateString = table.data_start;
                var date = new Date(dateString);
                var day = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();
                var hours = date.getHours();
                var minutes = date.getMinutes();
                var formattedDateStart = (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year + ' - ' + (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
            }
            if (table.data_end) {
                var dateString = table.data_end;
                var date = new Date(dateString);
                var day = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();
                var hours = date.getHours();
                var minutes = date.getMinutes();
                var formattedDateEnd = (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year + ' - ' + (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
            }

            var roomName = table.name
            var typeRoom = table.type

            var html = `
                        <tr>
                        <td style="text-transform: capitalize; text-align: center;">${table.id}</td>
                        <td style="text-transform: capitalize; text-align: center;">${roomName}</td>
                        <td style="text-transform: capitalize; text-align: center;">${typeRoom}</td>
                        <td style="text-transform: capitalize; text-align: center;">${formattedDateStart}</td>
                        <td style="text-transform: capitalize; text-align: center;">${formattedDateEnd}</td>
                        <td style="text-transform: capitalize; text-align: center;">${users.cn}</td>
                        <td style="text-transform: capitalize; text-align: center;">${table.device_id}</td>
                        </tr>
                    `;

            document.getElementById("local-table").innerHTML += html;
            // var userName = users.length > 0 ? users[0].cn : '';

            // if (post.deleted == null) {
            //     var postDel = texts.text("labelNo")
            // } else {
            //     var dateString = post.deleted;
            //     var date = new Date(dateString);
            //     var day = date.getDate();
            //     var month = date.getMonth() + 1;
            //     var year = date.getFullYear();
            //     var hours = date.getHours();
            //     var minutes = date.getMinutes();
            //     var formattedDate = (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year + ' - ' + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
            //     var postDel = formattedDate
            // }
            // //var departDel = depart.deleted == null ? "Não" : formatDate();
            // if (post.deleted) {
            //     var statusPost = texts.text("labelPostDeleted");
            // } else if (starDate > now) {
            //     var statusPost = texts.text("labelPostFuture");
            // } else if (endDate < now) {
            //     var statusPost = texts.text("labelPostExpired");
            // } else {
            //     var statusPost = texts.text("labelPostActive");
            // }

        });
  
    }

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

    function makeDivRoom(t) {
        t.clear();
        list_room.forEach(function(room){
            listbox = t.add(new innovaphone.ui1.Node("div", null, null, "list-box scrolltable").setAttribute("id",room.id))
            listbox.add(new innovaphone.ui1.Div(null, null, "closewindow").setAttribute("id","closewindow"))

            
            var topButtons = listbox.add(new innovaphone.ui1.Div("position:absolute;width:80%;", null, null).setAttribute("id", "top-bottons"));
            topButtons.add(new innovaphone.ui1.Node("ul", null, null, null)).add(new innovaphone.ui1.Node("a", "width: 100%;", texts.text("labelRoomName"), null).setAttribute("id", "list-room"));
            topButtons.add(new innovaphone.ui1.Node("ul", null, null, null)).add(new innovaphone.ui1.Node("a", "width: 100%;", texts.text("labelUsers"), null).setAttribute("id", "list-users"));
            topButtons.add(new innovaphone.ui1.Node("ul",null,null,null)).add(new innovaphone.ui1.Node("a","width: 100%;",texts.text("labelSchedules"),null).setAttribute("id","list-schedule"))
            listbox.add(new innovaphone.ui1.Node("h1","position:absolute;width:100%;top:10%; text-align:center",room.name))
            divinputs = listbox.add(new innovaphone.ui1.Div("position:absolute;top:12%;width:100%; height:80%; display: flex; justify-content: center;", null, null));
            var divGeral = divinputs.add(new innovaphone.ui1.Div(null, null, "divGeral").setAttribute("id", "div-geral")); 


            var phones = divGeral.add(new innovaphone.ui1.Div(null,null,"phones").setAttribute("id","Phones"))
            var labelPhones = phones.add(new innovaphone.ui1.Div(null,"Telefones Disponíveis","lablephones").setAttribute("id","lablephones"))
            var divPhones = phones.add(new innovaphone.ui1.Div(null,null,"divPhones").setAttribute("id","divPhones"))
            var imgRoom =  divGeral.add(new innovaphone.ui1.Node("div",null,null,"layoutRoom").setAttribute("id","imgBD"))
            var labelRoomPhones = imgRoom.add(new innovaphone.ui1.Div(null,"Telefones em Uso","lablephones").setAttribute("id","lableRoomPhones"))

            imgRoom.add(new innovaphone.ui1.Node("img","position:absolute; width:100%; height:95%; top:7%").setAttribute("src",room.img))
            console.log("Lista de telefones:", phone_list)
            makePhoneButtons(phone_list);

            if (listDeviceRoom.length > 0) {
                listDeviceRoom.forEach(function (dev) {
                    console.log("List Dev ROOM:",JSON.stringify(dev));
                    var html = `
                    <div style="top: ${dev.topoffset}px; left: ${dev.leftoffset}px; cursor: pointer; position: absolute;" class="StatusPhone ${dev.pbxactive} phoneButtons" id="${dev.hwid}">
                        <div class="user-info">
                            <img class="imgProfile" src="../images/${dev.product}.png">
                        </div>
                        <div class="product-name">${dev.product}</div>
                    </div>`;
                    
                    document.getElementById("imgBD").innerHTML += html;
                });
            
                // Adicionando evento de clique a todos os elementos com a classe 'phoneButtons'
                var elements = document.querySelectorAll('.phoneButtons');
                elements.forEach(function (element) {
                    element.addEventListener("click", function (e) {
                        var clickedId = this.id;
                        clickedPhone(clickedId, _colDireita, e);
                        app.send({ api: "admin", mt: "TableUsers" });
                    });
            
                    // Adicionar evento de hover
                    element.addEventListener("mouseover", function (event) {
                        var hoveredId = event.target.id; // Obtém o ID da div que o mouse está sobrevoando
                        var hoveredDev = listDeviceRoom.find(dev => dev.hwid === hoveredId); // Encontra o objeto correspondente na lista
                    
                        if (hoveredDev) {
                            // Aqui você pode definir as alterações no hover
                            this.style.backgroundColor = 'lightgray';
                            if (hoveredDev.cn == "null") {
                                this.setAttribute('title', 'Sem Usuário');
                            } else {
                                this.setAttribute('title', hoveredDev.cn); // Define o texto do hover usando a propriedade correspondente, por exemplo, dev.cn
                            }
                        }
                    });
                    
                    
            
                    element.addEventListener("mouseout", function () {
                        // Quando o mouse sai do elemento, remova as alterações feitas no hover
                        this.style.backgroundColor = ''; // Volta à cor original
                        this.removeAttribute('title'); // Remove o texto do hover
                    });
                });
            }
            
            

            // div users   
            var divUsers = divinputs.add(new innovaphone.ui1.Div("position:absolute;width:100%;height:100%;display:none ;justify-content:center;align-items:center").setAttribute("id","div-users"))
            var usersGrid = editUsersDepartmentsGrid()
            divUsers.add(usersGrid)
            //div schedule
            var divScheduleInn = divinputs.add(new innovaphone.ui1.Div("position:absolute;width:50%;height:100%;display:none").setAttribute("id","div-schedule"))
        
            var phoneElements = document.querySelectorAll(".phoneButtons");
            phoneElements.forEach(function (phoneElement) {
               phoneElement.draggable = true;
               phoneElement.addEventListener("dragstart",drag,true)

            });
           document.getElementById("closewindow").addEventListener("click",function(){  // close 
               //t.rem(listbox)
               waitConnection(that);
                controlDB = false
                app.send({api:"admin", mt:"SelectAllRoom"})

            })
            divGeral.add(new innovaphone.ui1.Node("button", null, "Salvar", "saveBttn").addEvent("click", function () {
            console.log("Salvando");

            var activeDevices = document.querySelectorAll(".DeviceActive");
            var updatedDevices = [];

            activeDevices.forEach(function (dev) {
                updatedDevices.push({
                    hwid: dev.id, 
                    room_id: room.id, 
                    topoffset: parseFloat(dev.style.top), 
                    leftoffset: parseFloat(dev.style.left) 
                });
            });
            updatedDevices = updatedDevices.concat(listDeviceRoom)
            console.log("updated" + JSON.stringify(updatedDevices));
            app.send({ api: "admin", mt: "UpdateDeviceRoom", room: room.id, devices: updatedDevices });
        }));
        
        list_RoomSchedule.forEach(function(schedule){ 
            var imgEdit = divScheduleInn.add(new innovaphone.ui1.Node("img","width: 40px; height: 40px;",null,null ).setAttribute("src","./images/edit-icon.png"))
           
            imgEdit.addEvent("click",function(){
                console.log("Clickable")
                if(schedule.type == "periodType"){
                    divScheduleInn.clear()
                    makeSchedule(divScheduleInn,schedule.type)
                    document.querySelectorAll(".btnSaveRoom").forEach(function(btn){
                        btn.removeEventListener("click",btn)
                        btn.id = "UpdateRoom"
                        btn.textContent = "Atualizar Sala"
                        
                    })
                    document.getElementById("UpdateRoom").addEventListener("click",function(){
                        
                        editor = [];
                        viewer = [];
            
                        list_tableUsers.forEach(function (user) {
                            var editorCheckbox = document.getElementById("editcheckbox_" + user.guid);
                            var viewerCheckbox = document.getElementById("viewercheckbox_" + user.guid);
            
                            if (editorCheckbox.checked) {
                                editor.push(user.guid);
                            }
            
                            if (viewerCheckbox.checked) {
                                viewer.push(user.guid);
                            }
                        });

                        app.send({
                            api: "admin", mt: "UpdateRoom", 
                            editor: editor, 
                            viewer: viewer, 
                            datastart: dateStart , 
                            dataend: dateEnd, 
                            roomID : schedule.room_id
                        });
                    })
                }
                if(schedule.type == "recurrentType"){
                    divScheduleInn.clear()
                    makeRecurrentInputs(divScheduleInn)
                    document.querySelectorAll(".btnSaveRoom").forEach(function(btn){
                        btn.removeEventListener("click",btn)
                        btn.id = "UpdateRoom"
                        btn.textContent = "Atualizar Sala"
                        
                    })
                    document.getElementById("UpdateRoom").addEventListener("click",function(){
                        
                        app.send({
                            api: "admin", mt: "UpdateRoom",  datastart: dateStart , dataend: dateEnd, roomID : schedule.room_id
                        });
                    })
                }
            })
            if(schedule.type == "periodType"){
                makePeriodSchedule()
        }
            if(schedule.type == "recurrentType"){
               
                document.getElementById("div-schedule").innerHTML += `
                <table>
                <tr>
                    <th>${texts.text("labelDayWeek")}</th>
                    <th>${texts.text("labelDateStart")}</th>
                    <th>${texts.text("labelDateEnd")}</th>
                </tr>
                <tr>
                    <td>${texts.text("labelMondayDiv")}</td>
                    <td>${schedule.timestart_monday}</td>
                    <td>${schedule.timeend_monday}</td>
                </tr>
                <tr>
                <td>${texts.text("labeltuesdayDiv")}</td>
                <td>${schedule.timestart_tuesday}</td>
                <td>${schedule.timeend_tuesday}</td>
                </tr>
                <tr>
                <td>${texts.text("labelwednesdayDiv")}</td>
                <td>${schedule.timestart_wednesday}</td>
                <td>${schedule.timeend_wednesday}</td>                
                </tr>
                <tr>
                <td>${texts.text("labelthursdayDiv")}</td>
                <td>${schedule.timestart_thursday}</td>
                <td>${schedule.timeend_thursday}</td>
                </tr>
                <tr>
                <td>${texts.text("labelfridayDiv")}</td>
                <td>${schedule.timestart_friday}</td>
                <td>${schedule.timeend_friday}</td>
                </tr>
                <tr>
                <td>${texts.text("labelsaturdayDiv")}</td>
                <td>${schedule.timestart_saturday}</td>
                <td>${schedule.timeend_saturday}</td>
                </tr>
                <tr>
                <td>${texts.text("labelsundayDiv")}</td>
                <td>${schedule.timestart_sunday}</td>
                <td>${schedule.timeend_sunday}</td>
                </tr>
            </table>

                `
             }

            
            })

        })
          
        var divGeral = document.getElementById("div-geral");
        var divUsers = document.getElementById("div-users");
        var divSchedule = document.getElementById("div-schedule");

        document.getElementById("list-room").addEventListener("click", function () {
            divGeral.style.display = "flex";
            divUsers.style.display = "none";
            divSchedule.style.display = "none";
        });

        document.getElementById("list-users").addEventListener("click", function () {
            
            divGeral.style.display = "none";
            divUsers.style.display = "flex";
            divSchedule.style.display = "none";
        });

        var a = document.getElementById("list-schedule");
        a.addEventListener("click", function () {
            divGeral.style.display = "none";
            divUsers.style.display = "none";
            divSchedule.style.display = "block";
        });

            document.getElementById("divPhones").addEventListener("dragover",allowDrop,true)
            document.getElementById("divPhones").addEventListener("drop",resetPhonesDrop,true)
            document.getElementById("imgBD").addEventListener("dragover",allowDrop,true)
            document.getElementById("imgBD").addEventListener("drop", function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        var data = ev.dataTransfer.getData("text");
        var draggedElement = document.getElementById(data);
    
        // Obtenha as coordenadas do cursor do mouse no momento do evento de soltura
        var mouseX = ev.clientX;
        var mouseY = ev.clientY;
    
        // Obtenha as coordenadas da div "imgBD"
        var imgBD = document.getElementById("imgBD");
        var imgBDBounds = imgBD.getBoundingClientRect();
    
        // Obtenha as coordenadas do elemento arrastado em relação à div "imgBD"
        var draggedElementBounds = draggedElement.getBoundingClientRect();

        // Calcule as coordenadas finais onde o elemento deve ser posicionado
        var leftOffset = mouseX - (imgBDBounds.left + draggedElementBounds.width / 2);
        var topOffset = mouseY - (imgBDBounds.top + draggedElementBounds.height / 2);
    
        // Atualize a posição do elemento arrastado
        draggedElement.style.left = leftOffset + "px";
        draggedElement.style.top = topOffset + "px";
        
        draggedElement.classList.add("DeviceActive")
        
        // Defina o z-index para garantir que o elemento seja exibido na frente de outros elementos
        draggedElement.style.zIndex = "2000";
    
        // Defina a posição como absoluta para garantir o posicionamento correto
        draggedElement.style.position = "absolute";
            
        ativos = [];

        var activeDevices = document.querySelectorAll(".DeviceActive");
        
        if (activeDevices) {
            activeDevices.forEach(function(dev){
                var dispositivosAtivos = phone_list.filter(function (item) {
                    return item.hwid == dev.id;
                });
                ativos = ativos.concat(dispositivosAtivos);
            });

            console.log("ativos" + JSON.stringify(ativos));
        }
        // Anexe o elemento à div "imgBD"
        //draggedElement.setAttribute("id",room.id)
        imgBD.appendChild(draggedElement);
    })
    }
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

    // continuar na quinta 
    function UpdateAvailability(availability){
        console.log("Availability" + JSON.stringify(availability))
        var tds = document.querySelectorAll('.fc-day','.fc-highlight');
        if (availability.length === 0) {
            tds.forEach(function(td) {
                td.classList.add('unavailable');  
            });
        } 
        else {
            availability.forEach(function(dates){
                var datastart = moment(dates.data_start).format('YYYY-MM-DD[T]HH:mm:ss');
                var dataend = moment(dates.data_end).format('YYYY-MM-DD[T]HH:mm:ss');
                tds.forEach(function(td) {
                    var dataDate = moment(td.getAttribute('data-date')).format('YYYY-MM-DD[T]HH:mm:ss');
                    console.log("DataStart" + datastart + "DataEnd" + dataend + "\n" + "Data Elementos" + dataDate)
                    if (dataDate >= datastart && dataDate <= dataend) {
                            td.classList.remove('unavailable');
                            td.classList.add('available');
                    } else {
                        td.classList.add('unavailable');                 
                    }
                });
            })
        }
        console.log("UpdateAvailability Result Success");                             
    }

    // ajustar na quinta feira 
    function UpdateDayAvailability(availability, day, month, year){
        // var tds = document.querySelectorAll('.fc-widget-content');
        var trs = document.querySelectorAll('.fc-slats tr');
        if (availability.length === 0) {
            trs.forEach(function(tr) {
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

            availability.forEach(function(dates) {
                var datastart = moment(dates.data_start, moment.ISO_8601).format('YYYY-MM-DDTHH:mm:ss');
                var dataend = moment(dates.data_end, moment.ISO_8601).format('YYYY-MM-DDTHH:mm:ss');
                trs.forEach(function(tr) {
                    
                    var dataTime = moment(tr.getAttribute('data-time'), 'HH:mm:ss');
                    // Obtém os valores do dia, mês e ano
                    var hour = moment(dataTime).format('HH');
                    var minute = moment(dataTime).format('mm');
                    var second = moment(dataTime).format('ss');
                    var date = year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":" + second;
                    // Cria o objeto de data
                    var dateView = moment(date, moment.ISO_8601).format('YYYY-MM-DDTHH:mm:ss');

                    //console.log(dateView);

                    if (dateView>=datastart && dateView<=dataend) {
                        tr.classList.remove('unavailable');
                        tr.classList.add('available');
                    }
                });
            });
            console.log("UpdateDayAvailabilitySuccess");
            if(availability.length >0){
                availability.forEach(function (dates) {
                    var datastart = moment(dates.data_start, moment.ISO_8601).format('YYYY-MM-DDTHH:mm:ss');
                    
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
    function makePeriodSchedule(){
        $(document).ready(function () {
            $.fullCalendar.locale('pt-br');
            // var id = $.urlParam('id');
            $('#div-schedule').fullCalendar('destroy');
            $('#div-schedule').fullCalendar({

                header: {
                    left: 'today',
                    center: 'title , month, agendaDay',
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
                    selectstart = start.format('YYYY-MM-DD[T]HH:mm:ss');
                    selectend = end.format('YYYY-MM-DD[T]HH:mm:ss');
                    
                    if (view.name === 'month') {
                        console.log("View: Month");
                        var clickedElement = jsEvent.target
                        
                        console.log(" Elemento clicado " + clickedElement);
                        var clickedDate = start.format('YYYY-MM-DD');
                        console.log("Data do elemento clicado:", clickedDate);
                        var teste = false;
                        
                                var datastart = moment(schedule.data_start).format('YYYY-MM-DD');
                                var dataend = moment(schedule.data_end).format('YYYY-MM-DD');
                                console.log("Data inicio " + datastart + "Data fim " + dataend)
                                if (clickedDate >= datastart && clickedDate <= dataend ) {
                                        console.log("Elemento clicado está disponível");
                                        $('#div-schedule').fullCalendar('changeView', 'agendaDay');
                                        $('#div-schedule').fullCalendar('gotoDate', start);
                                        teste = true;      
                            } 
                
                        if (!teste) window.alert(" Data indisponível \n Por favor, escolha outra data.");
                        $('#div-schedule').fullCalendar('unselect'); 
                    }
                    else {
                        // desenvolver na quinta 9/11 
                        var valid = false;
                        if(dataavailability.length>0){
                            dataavailability.forEach(function (dates) {
                                var datastart = moment(dates.time_start, moment.ISO_8601).format('YYYY-MM-DDTHH:mm:ss');
                                var dataend = moment(dates.time_end, moment.ISO_8601).format('YYYY-MM-DDTHH:mm:ss');
                                console.log("Disponibilidade: \n" +datastart + "\n" + dataend);

                                // Obtém os valores do ano, mês e ano
                                var year = moment(start).format('YYYY');
                                var month = moment(start).format('MM');
                                var day = moment(start).format('DD');
                                // Obtém os valores do hora, minuto e segundos
                                var hour = moment(start).format('HH');
                                var minute = moment(start).format('mm');
                                var second = moment(start).format('ss');
                                var date = year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":" + second;
                                // Cria o objeto de data
                                var dateView = moment(date, moment.ISO_8601).format('YYYY-MM-DDTHH:mm:ss');

                                console.log(dateView);

                                if (dateView >= datastart && dateView <= dataend) {
                                    valid = true;
                                }
                            });
                        }
                        if(dataschedules.length>0){
                            dataschedules.forEach(function (dates) {
                                var datastart = moment(dates.time_start, moment.ISO_8601).format('YYYY-MM-DDTHH:mm:ss');
                                var dataend = moment(dates.time_end, moment.ISO_8601).format('YYYY-MM-DDTHH:mm:ss');

                                console.log("Agendamento: \n"+datastart + "\n" + dataend);
                                // Obtém os valores do ano, mês e ano
                                var year = moment(start).format('YYYY');
                                var month = moment(start).format('MM');
                                var day = moment(start).format('DD');
                                // Obtém os valores do hora, minuto e segundos
                                var hour = moment(start).format('HH');
                                var minute = moment(start).format('mm');
                                var second = moment(start).format('ss');
                                var date = year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":" + second;
                                // Cria o objeto de data
                                var dateView = moment(date, moment.ISO_8601).format('YYYY-MM-DDTHH:mm:ss');

                                console.log(dateView);

                                if (dateView == datastart) {
                                    valid = false;
                                }
                            });
                        }

                        var year = moment(start).format('YYYY');
                        var month = moment(start).format('MM');
                        var day = moment(start).format('DD');
                        // Obtém os valores do hora, minuto e segundos
                        var hour = moment(start).format('HH');
                        var minute = moment(start).format('mm');
                        var second = moment(start).format('ss');
                        var date = year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":" + second;
                        // Cria o objeto de data
                        var datastart = moment(date, moment.ISO_8601).format('YYYY-MM-DDTHH:mm:ss');

                        var now = moment().format("YYYY-MM-DDTHH:mm:ss");
                        if (datastart < now) {
                            console.warn("Data selecionada está no passado.");
                            valid = false;
                        }

                        if (valid) {
                            dayName = view.title;
                            var clickedTime = start.format('HH:mm:ss');
                            console.log("Dia do elemento clicado:" + dayName)
                            console.log("Hora do elemento clicado:", clickedTime);
                            makeModal(dayName, clickedTime);
                            $('#div-schedule').fullCalendar('unselect');

                        } else {
                            window.alert(" Horario indisponível \n Por favor, escolha outro horário.");
                            $('#div-schedule').fullCalendar('unselect');
                        }
                        ///
                    }
                },
                editable: false,
                eventLimit: true,
                events: [],
                eventRender: function (event, element) {},

                viewRender: function(view, element) {
                    
                    if (view.name === 'month') {
                        setTimeout(function() {
                            UpdateAvailability(list_RoomSchedule)
                        }, 100);
                        console.log('View: Modo mês');
                    } 
                    // else if(view.name === 'agendaWeek') {
                    //     console.log("View Modo Semana")
                    // }
                    else{
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
                        setTimeout(function() {
                           UpdateDayAvailability(list_RoomSchedule, day, month, year)
                        }, 100);
                    }
    },
            });
        });
    }

    function makeSchedule(t, optType) {
        t.clear();
        
        var btnSave = t.add(new innovaphone.ui1.Node("button", "width:90px;height:35px;display:flex;justify-content:center;align-items:center;top:1%;left:75%;position:absolute;", texts.text("labelCreateRoom"), "btnSaveRoom").setAttribute("id", "btnSaveRoom"))

        if (optType == "periodType") {
            var recurrentTimeDiv = t.add(new innovaphone.ui1.Div(null, null, "recurrentPeriodDiv"))
            var divStartHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divStartHour"), "divStartHour"))
            var hourStart = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "startIpt").setAttribute("id", "startIpt"))
            var divEndHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divEndHour"), "divEndHour"))
            var hourEnd = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "endIpt").setAttribute("id", "endIpt"))

            t.add(new innovaphone.ui1.Div("position:absolute;top:10%", null, null).setAttribute("id", "calendar"))
            $(document).ready(function () {
                $.fullCalendar.locale('pt-br');
                // var id = $.urlParam('id');
                $('#calendar').fullCalendar('destroy');
                $('#calendar').fullCalendar({

                    header: {
                        left: 'today',
                        center: 'title , month', //agendaWeek,
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
                        selectstart = start.format('YYYY-MM-DD[T]HH:mm:ss');
                        selectend = end.format('YYYY-MM-DD[T]HH:mm:ss');

                        if (view.name === 'month') {
                            console.log("View: Month");
                            // var clickedElement = jsEvent.target;

                            // console.log(" Elemento clicado " + clickedElement);
                            // var clickedDate = start.format('YYYY-MM-DD');
                            // console.log("Data do elemento clicado:", clickedDate);
                        
                            var startHour = document.getElementById("startIpt").value;
                            var endHour = document.getElementById("endIpt").value;

                            var clickedDateStart = start.format('YYYY-MM-DD');
                            console.log("Data do elemento clicado Inicio:", clickedDateStart);
    
                            var clickedDateEnd = end.format('YYYY-MM-DD');
                            console.log("Data do elemento clicado Inicio:", clickedDateEnd);

                            var clickedDateStartMoment = moment(clickedDateStart);

                            var clickedDateEndMoment = moment(clickedDateEnd);

                            var startMoment = moment(startHour, 'HH:mm',true);
                            var endMoment = moment(endHour, 'HH:mm',true);

                            var combinedDateTimeStart = clickedDateStartMoment.format('YYYY-MM-DD') + 'T' + startMoment.format('HH:mm');
                            var combinedDateTimeEnd = clickedDateEndMoment.format('YYYY-MM-DD') + 'T' + endMoment.format('HH:mm');

                            dateStart = combinedDateTimeStart
                            dateEnd = combinedDateTimeEnd
                            
                            console.log(" Data inicio concatenada "  + dateStart) 
                            console.log(" Data Fim concatenada " + dateEnd) 

                            $('#calendar').fullCalendar('unselect');
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
                            console.log("data de início " + dateStart.toISOString())
                            // data fim
                            dateEnd = "";
                            dateEnd = new Date(end);
                            console.log("data de término " + dateEnd.toISOString())


                        }
                    },
                    editable: false,
                    eventLimit: true,
                    events: [],
                    eventRender: function (event, element) { },

                    viewRender: function (view, element) {

                        if (view.name === 'month') {
                            console.log('View: Modo mês');
                            setTimeout(function(){
                                var tds = document.querySelectorAll('.fc-day','.fc-highlight');
                                tds.forEach(function(td) {
                                    td.classList.add('unavailable');  
                                }); 
                            },300)
                        }
                        else if (view.name === 'agendaWeek') {
                            console.log("View Modo Semana")
                        }
                        else {
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
                            // setTimeout(function() {
                            //    UpdateDayAvailability(dataTime_start, dataTime_end, dataavailability, dataschedules, day, month, year)
                            // }, 100);
                        }
                    },
                });

            });

            document.getElementById("btnSaveRoom").addEventListener("click",function(){

                editor = [];
                viewer = [];
    
                list_tableUsers.forEach(function (user) {
                    var editorCheckbox = document.getElementById("editcheckbox_" + user.guid);
                    var viewerCheckbox = document.getElementById("viewercheckbox_" + user.guid);
    
                    if (editorCheckbox.checked) {
                        editor.push(user.guid);
                    }
    
                    if (viewerCheckbox.checked) {
                        viewer.push(user.guid);
                    }
                });


                var selectType = document.getElementById("selectType");
                var optType = selectType.options[selectType.selectedIndex].id;
                var selectModule = document.getElementById("selectModule")
                var optModule = selectModule.options[selectModule.selectedIndex].id;
                var fileInput = document.getElementById("fileinput")
    
                var nameRoom = document.getElementById("iptRoomName").value
                var imagem = document.getElementById('imgBDFile')
                var srcDaImagem = imagem.src;


                if(document.getElementById("startIpt").value == "" || document.getElementById("endIpt").value == "" ){
                    
                    console.log("Favor Selecionar uma Data")
                    
                }else{
                        app.send({ api: "admin", mt: "InsertRoom", 
                        name: nameRoom, 
                        img: srcDaImagem, 
                        dateStart: dateStart, 
                        dateEnd: dateEnd, 
                        type: optType, 
                        schedule: optModule, 
                        editor: editor, 
                        viewer: viewer });
                }

            })

        }
        if (optType == "recurrentType") {
        makeRecurrentInputs(t)

        document.getElementById("btnSaveRoom").addEventListener("click", function () {
            var selectType = document.getElementById("selectType");
            var optType = selectType.options[selectType.selectedIndex].id;
            var selectModule = document.getElementById("selectModule")
            var optModule = selectModule.options[selectModule.selectedIndex].id;
            var fileInput = document.getElementById("fileinput")

            var nameRoom = document.getElementById("iptRoomName").value
            var imagem = document.getElementById('imgBDFile')
            var srcDaImagem = imagem.src;

            editor = [];
            viewer = [];

            list_tableUsers.forEach(function (user) {
                var editorCheckbox = document.getElementById("editcheckbox_" + user.guid);
                var viewerCheckbox = document.getElementById("viewercheckbox_" + user.guid);

                if (editorCheckbox.checked) {
                    editor.push(user.guid);
                }

                if (viewerCheckbox.checked) {
                    viewer.push(user.guid);
                }
            });

            if (nameRoom === "" || fileInput.files.length == 0  ) {
                console.log("Favor Completar todos os campos")
            }else if(optType == "recurrentType"){
                var startMonday = document.getElementById("timeStartMonday").value
                var endMonday = document.getElementById("timeEndMonday").value
                var startTuesday = document.getElementById("timeStartTuesday").value;
                var endTuesday = document.getElementById("timeEndTuesday").value;
                var startWednesday = document.getElementById("timeStartWednesday").value;
                var endWednesday = document.getElementById("timeEndWednesday").value;
                var startThursday = document.getElementById("timeStartThursday").value;
                var endThursday = document.getElementById("timeEndThursday").value;
                var startFriday = document.getElementById("timeStartFriday").value;
                var endFriday = document.getElementById("timeEndFriday").value;
                var startSaturday = document.getElementById("timeStartSaturday").value;
                var endSaturday = document.getElementById("timeEndSaturday").value;
                var startSunday = document.getElementById("timeStartSunday").value;
                var endSunday = document.getElementById("timeEndSunday").value;

                app.send({ 
                    api: "admin", mt: "InsertRoom", 
                    name: nameRoom, 
                    img: srcDaImagem, 
                    dateStart: dateStart, 
                    dateEnd: dateEnd, 
                    type: optType, 
                    schedule: optModule, 
                    editor: editor, 
                    viewer: viewer,
                    startMonday : startMonday, // começo segunda
                    endMonday : endMonday, // fim segunda
                    startTuesday : startTuesday,// começo terça
                    endTuesday : endTuesday, // fim terça
                    startWednesday : startWednesday, // começo quarta
                    endWednesday : endWednesday, // fim quartaendWednesday
                    startThursday : startThursday, // começo quinta
                    endThursday : endThursday, // fim quinta
                    startFriday : startFriday, // começo sexta
                    endFriday : endFriday, // fim sexta
                    startSaturday : startSaturday, // começo sab
                    endSaturday : endSaturday, // fim sab
                    startSunday : startSunday, // começo dom
                    endSunday : endSunday, // fim dom
                });
            }

        })
        
    }
    }

    function countTotalHoursAvailability(dataString, array) {
        var targetDate = moment(dataString);
        var totalHours = 0;
        
        array.forEach(function(obj) {
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
    
    array.forEach(function(obj) {
        var start = moment(obj.time_start);
        
        if (targetDate.isSame(start, 'day')) {
        count++;
        }
    });
    
    return count;
}
function editUsersDepartmentsGrid() {
    var usersListDiv = new innovaphone.ui1.Node("div", null, null, "userlist").setAttribute("id", "userslist");

    var table = usersListDiv.add(new innovaphone.ui1.Node("table", null, null, "table"));

    var headerRow = table.add(new innovaphone.ui1.Node("tr", null, null, "row"));

    var nameCol = headerRow.add(new innovaphone.ui1.Node("th", null, texts.text("labelUser"), "column"));

    var editorCol = headerRow.add(new innovaphone.ui1.Node("th", null, texts.text("labelEditor"), "column"));

    var viewerCol = headerRow.add(new innovaphone.ui1.Node("th", null, texts.text("labelViewer"), "column"));


    list_tableUsers.forEach(function (user) {
        var row = table.add(new innovaphone.ui1.Node("tr", null, null, "row"))

            var nameCol = row.add(new innovaphone.ui1.Node("td", null, user.cn, "column"))
        
        var userV = list_viewers.filter(function (item) {
            return item.viewer_guid == user.guid;
        })[0];

        var userE = list_editors.filter(function (item) {
            return item.editor_guid == user.guid;
        })[0];
        

        console.log("Filtro Visualizador:", userV);
        console.log("Filtro Editor:", userE);
            var editorCol = row.add(new innovaphone.ui1.Node("td", null, null, "column"))

            var viewerCol = row.add(new innovaphone.ui1.Node("td", null, null, "column"))
        
            var viewerCheckbox = viewerCol.add(new innovaphone.ui1.Input(null, null, null, null, "checkbox", "checkbox viewercheckbox").setAttribute("id", "viewercheckbox_" + user.guid));
            viewerCheckbox.setAttribute("name", "viewerDepartments");
            viewerCheckbox.setAttribute("value", user.guid);

            var editorCheckbox = editorCol.add(new innovaphone.ui1.Input(null, null, null, null, "checkbox", "checkbox editorcheckbox").setAttribute("id", "editcheckbox_" + user.guid));
            editorCheckbox.setAttribute("name", "editorDepartments");
            editorCheckbox.setAttribute("value", user.guid);

        editorCheckbox.addEvent('click', function () {
            var viewerCheckbox = document.getElementById("viewercheckbox_" + user.guid);
            viewerCheckbox.checked = true

        });
        setTimeout(function () {
            if (userV) {
                var viewCheckbox = document.getElementById("viewercheckbox_" + user.guid);
                viewCheckbox.checked = true;
            }
            if (userE) {
                var editCheckbox = document.getElementById("editcheckbox_" + user.guid);
                editCheckbox.checked = true;
            }
        }, 500)

    });
    //usersListDiv.appendChild(table);
    return usersListDiv;
}


function createUsersDepartmentsGrid() {
    var usersListDiv = new innovaphone.ui1.Node("div", null, null, "userlist").setAttribute("id", "userslist")

    var table = usersListDiv.add(new innovaphone.ui1.Node("table", null, null, "table"))

    var headerRow = table.add(new innovaphone.ui1.Node("tr", null, null, "row"))

    var nameCol = headerRow.add(new innovaphone.ui1.Node("th", null, texts.text("labelUser"), "column"))

    var editorCol = headerRow.add(new innovaphone.ui1.Node("th", null, texts.text("labelEditor"), "column"))

    var viewerColTitle = headerRow.add(new innovaphone.ui1.Node("th", null, texts.text("labelViewer"), "column"))

    list_tableUsers.forEach(function (user) {

        // var userV = list_viewers_departments.filter(function (item) {
        //     return item.viewer_guid === user.guid;
        // })[0];
        // var userE = list_editors_departments.filter(function (item) {
        //     return item.editor_guid === user.guid;
        // })[0];

        var row = table.add(new innovaphone.ui1.Node("tr", null, null, "row"))

        var nameCol = row.add(new innovaphone.ui1.Node("td", null, user.cn, "column"))

        var editorCol = row.add(new innovaphone.ui1.Node("td", null, null, "column"))

        var viewerCol = row.add(new innovaphone.ui1.Node("td", null, null, "column"))


        var viewerCheckbox = viewerCol.add(new innovaphone.ui1.Input(null, null, null, null, "checkbox", "checkbox viewercheckbox").setAttribute("id", "viewercheckbox_" + user.guid));
        viewerCheckbox.setAttribute("name", "viewerDepartments");
        viewerCheckbox.setAttribute("value", user.guid)

        var editorCheckbox = editorCol.add(new innovaphone.ui1.Input(null, null, null, null, "checkbox", "checkbox editorcheckbox").setAttribute("id", "editcheckbox_" + user.guid));
        editorCheckbox.setAttribute("name", "editorDepartments");
        editorCheckbox.setAttribute("value", user.guid)

        editorCheckbox.addEvent('click', function () {
            var viewerCheckbox = document.getElementById("viewercheckbox_" + user.guid);
            viewerCheckbox.checked = true


        });
        var marked = false
        viewerColTitle.addEvent('click', function () {
            //  console.log("Elemento viewerCol foi CLICADO")
            if (!marked) {
                var _clickViewer = document.querySelectorAll('.viewercheckbox')
                _clickViewer.forEach(function (view) {
                    view.checked = true
                });
                marked = true
            } else {
                var _clickViewer = document.querySelectorAll('.viewercheckbox')
                _clickViewer.forEach(function (view) {
                    view.checked = false
                });
                marked = false
            }


        });

    });


    //usersListDiv.add(table);
    return usersListDiv;
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

function makePhoneButtons(obj){
    
    obj.forEach(function (phone) {

        var phoneHTML = `
        <div class="StatusPhone ${phone.online} phoneButtons" id="${phone.hwid}">
        <div class="user-info">
            <img class="imgProfile" src="../images/${phone.product}.png">
        </div>
        <div class="product-name">${phone.product}</div>
         </div>
        `;
        document.getElementById("divPhones").innerHTML += phoneHTML;
    });
}
// construtor 
// db files

var folder = null;

function onSelectFile() {
    // if(filesID){
    //     deleteFile(filesID)
    // }
        console.log("Evento do Input File")
        controlDB = true
        postFile(input.container.files[0]);
    
   
}

function startfileUpload() {
    if (filesToUpload.length > 0) {
        postFile(filesToUpload.pop());
    }
}
function makeRecurrentInputs(t){
    var recurrentCalendar = t.add(new innovaphone.ui1.Div(null, null, "recurrentCalendar"));
    //Segundas feiras
    var mondayDiv = recurrentCalendar.add(new innovaphone.ui1.Div(null, null, "dayDiv"))
    mondayDiv.add(new innovaphone.ui1.Div(null, texts.text("labelMondayDiv"), "day"))
    var columnRecurrentTimeDiv = mondayDiv.add(new innovaphone.ui1.Div(null, null, "columnRecurrentTimeDiv"))

    var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
    var divStartHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divStartHour"), "divStartHour"))
    var hourStart = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "startIpt").setAttribute("id", "timeStartMonday"))
    
    var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
    var divEndHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divEndHour"), "divEndHour"))
    var hourEnd = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "endIpt").setAttribute("id", "timeEndMonday"))
    //var mondayChk = mondayDiv.add(new innovaphone.ui1.Input(null, null, null, null, "checkbox", "mondayChk").setAttribute("id", "mondayChk"))

    //Terças feiras
    var tuesdayDiv = recurrentCalendar.add(new innovaphone.ui1.Div(null, null, "dayDiv"))
    tuesdayDiv.add(new innovaphone.ui1.Div(null, texts.text("labeltuesdayDiv"), "day"))
    var columnRecurrentTimeDiv = tuesdayDiv.add(new innovaphone.ui1.Div(null, null, "columnRecurrentTimeDiv"))

    var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
    var divStartHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divStartHour"), "divStartHour"))
    var hourStart = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "startIpt").setAttribute("id", "timeStartTuesday"))
    
    var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
    var divEndHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divEndHour"), "divEndHour"))
    var hourEnd = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "endIpt").setAttribute("id", "timeEndTuesday"))
    //var tuesdayChk = tuesdayDiv.add(new innovaphone.ui1.Input(null, null, null, null, "checkbox", "tuesdayChk").setAttribute("id", "tuesdayChk"))

    //Quartas feiras
    var wednesdayDiv = recurrentCalendar.add(new innovaphone.ui1.Div(null, null, "dayDiv"))
    wednesdayDiv.add(new innovaphone.ui1.Div(null, texts.text("labelwednesdayDiv"), "day"))
    var columnRecurrentTimeDiv = wednesdayDiv.add(new innovaphone.ui1.Div(null, null, "columnRecurrentTimeDiv"))

    var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
    var divStartHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divStartHour"), "divStartHour"))
    var hourStart = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "startIpt").setAttribute("id", "timeStartWednesday"))

    var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
    var divEndHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divEndHour"), "divEndHour"))
    var hourEnd = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "endIpt").setAttribute("id", "timeEndWednesday"))
    //var wednesdayChk = wednesdayDiv.add(new innovaphone.ui1.Input(null, null, null, null, "checkbox", "wednesdayChk").setAttribute("id", "wednesdayChk"))

    //Quintas feiras
    var thursdayDiv = recurrentCalendar.add(new innovaphone.ui1.Div(null, null, "dayDiv"))
    thursdayDiv.add(new innovaphone.ui1.Div(null, texts.text("labelthursdayDiv"), "day"))
    var columnRecurrentTimeDiv = thursdayDiv.add(new innovaphone.ui1.Div(null, null, "columnRecurrentTimeDiv"))

    var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
    var divStartHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divStartHour"), "divStartHour"))
    var hourStart = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "startIpt").setAttribute("id", "timeStartThursday"))
    
    var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
    var divEndHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divEndHour"), "divEndHour"))
    var hourEnd = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "endIpt").setAttribute("id", "timeEndThursday"))
    //var tursdayChk = tursdayDiv.add(new innovaphone.ui1.Input(null, null, null, null, "checkbox", "tursdayChk").setAttribute("id", "tursdayChk"))

    //Sextas feiras
    var fridayDiv = recurrentCalendar.add(new innovaphone.ui1.Div(null, null, "dayDiv"))
    fridayDiv.add(new innovaphone.ui1.Div(null, texts.text("labelfridayDiv"), "day"))
    var columnRecurrentTimeDiv = fridayDiv.add(new innovaphone.ui1.Div(null, null, "columnRecurrentTimeDiv"))

    var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
    var divStartHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divStartHour"), "divStartHour"))
    var hourStart = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "startIpt").setAttribute("id", "timeStartFriday"))

    var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
    var divEndHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divEndHour"), "divEndHour"))
    var hourEnd = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "endIpt").setAttribute("id", "timeEndFriday"))
    //var fridayChk = fridayDiv.add(new innovaphone.ui1.Input(null, null, null, null, "checkbox", "fridayChk").setAttribute("id", "fridayChk"))

    //Sabados
    var saturdayDiv = recurrentCalendar.add(new innovaphone.ui1.Div(null, null, "dayDiv"))
    saturdayDiv.add(new innovaphone.ui1.Div(null, texts.text("labelsaturdayDiv"), "day"))
    var columnRecurrentTimeDiv = saturdayDiv.add(new innovaphone.ui1.Div(null, null, "columnRecurrentTimeDiv"))

    var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
    var divStartHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divStartHour"), "divStartHour"))
    var hourStart = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "startIpt").setAttribute("id", "timeStartSaturday"))

    var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
    var divEndHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divEndHour"), "divEndHour"))
    var hourEnd = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "endIpt").setAttribute("id", "timeEndSaturday"))
    //var saturdayChk = saturdayDiv.add(new innovaphone.ui1.Input(null, null, null, null, "checkbox", "saturdayChk").setAttribute("id", "saturdayChk"))

    //Domingos
    var sundayDiv = recurrentCalendar.add(new innovaphone.ui1.Div(null, null, "dayDiv"))
    sundayDiv.add(new innovaphone.ui1.Div(null, texts.text("labelsundayDiv"), "day"))
    var columnRecurrentTimeDiv = sundayDiv.add(new innovaphone.ui1.Div(null, null, "columnRecurrentTimeDiv"))

    var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
    var divStartHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divStartHour"), "divStartHour"))
    var hourStart = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "startIpt").setAttribute("id", "timeStartSunday"))

    var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
    var divEndHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divEndHour"), "divEndHour"))
    var hourEnd = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "endIpt").setAttribute("id", "timeEndSunday"))
    //var sundayChk = sundayDiv.add(new innovaphone.ui1.Input(null, null, null, null, "checkbox", "sundayChk").setAttribute("id", "sundayChk"))
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
    function insertRoom(msg){
        console.log("InsertRoom" + msg)
        app.send({api: "admin" , mt: "InsertRoomSchedule" })
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
        filesID = file.id

        if(controlDB){
            document.getElementById("imgBD").innerHTML = ''
            var imgFile = imgBD.add(new innovaphone.ui1.Node("img","width:100%;height:200px",null,null).setAttribute("id","imgBDFile"))
            imgFile.setAttribute("src",start.originalUrl + "/files/" + file.id)
            var delButton = new innovaphone.ui1.Div(null, null, "button")
            .addText("\uD83D\uDDD1")
            .addEvent("click", function () { deleteFile(file.id) }, delButton);
        imgBD.add(delButton)
        }else{
            document.getElementById("imgBD").innerHTML = ''
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
