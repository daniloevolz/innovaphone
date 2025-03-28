
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />
/// <reference path="../../web1/ui1.popup/innovaphone.ui1.popup.js" />
/// <reference path="../../web1/ui1.listview/innovaphone.ui1.listview.js" />
/// <reference path="../../web1/com.innovaphone.avatar/com.innovaphone.avatar.js" />
var Wecom = Wecom || {};
Wecom.novaalertAdmin = Wecom.novaalertAdmin || function (start, args) {
    this.createNode("body");
    var appdn = start.title;
    var that = this;
    var avatar = start.consumeApi("com.innovaphone.avatar");
    var iptUrl = "";
    var iptServerEnable = "";
    var iptMethod = "";
    var googlekey = "";
    var list_buttons = [];
    var list_buttons_sensors = [];
    var list_actions = [];
    var list_users = [];
    var divButtonsMain;
    var col_direita;
    var col_esquerda;
    var list_sensors_name = []
    var addButtonsArea;
    var reportsHitory = []
    var colorSchemes = {
        dark: {
            "--bg": "url('wecom-white.png')",
            "--button": "#c6c6c6",
            "--text-standard": "#004c84",
            "--div-DelBtn": "#f2f5f6",
        },
        light: {
            "--bg": "url('wecom-white.png')",
            "--button": "#c6c6c6",
            "--text-standard": "#004c84",
            "--div-DelBtn": "#f2f5f6",
        }
    };
    var schemes = new innovaphone.ui1.CssVariables(colorSchemes, start.scheme);
    start.onschemechanged.attach(function () { schemes.activate(start.scheme) });

    var texts = new innovaphone.lib1.Languages(Wecom.novaalertTexts, start.lang);

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;
    app.onclosed = waitConnection(that);
    app.onerror = waitConnection(that);
    var UIuser;
    var avatar;
    var UIuserPicture;
    var receivedFragments = [];

    var list_types = [
        { typeName: "Alarme", id: "alarm" },
        { typeName: "Usuário", id: "user" },
        { typeName: "Número", id: "number" },
        { typeName: "Vídeo", id: "video" },
        { typeName: "Página Iframe", id: "page" },
        { typeName: "Combo x4", id: "combo" },
        { typeName: "Sensor", id: "sensor" }
    ];
    var list_types_center = [
        { typeName: "Alarme", id: "alarm" },
        { typeName: "Usuário", id: "user" },
        { typeName: "Número", id: "number" }
    ];
    var list_act_types = [
        { typeName: "Alarme", id: "alarm" },
        { typeName: "Número", id: "number" },
        { typeName: "Botão", id: "button" },
        // { typeName: "Vídeo", id: "video" },
        // { typeName: "Página Iframe", id: "page" },
        // { typeName: "PopUp Iframe", id: "popup" }
    ];
    var list_start_types = [
        { typeName: "Alarme", id: "alarm" },
        { typeName: "Número Origem", id: "inc-number" },
        { typeName: "Número Destino", id: "out-number" },
        { typeName: "Valor Mínimo", id: "min-threshold" },
        { typeName: "Valor Máximo", id: "max-threshold" }
    ];
    var list_sensor_types = [
        { typeName: texts.text("co2"), id: "co2" },
        { typeName: texts.text("battery"), id: "battery" },
        { typeName: texts.text("humidity"), id: "humidity" },
        { typeName: texts.text("leak"), id: "leak" },
        { typeName: texts.text("temperature"), id: "temperature" },
        { typeName: texts.text("light"), id: "light" },
        { typeName: texts.text("pir"), id: "pir" }
    ];
    //páginas
    var list_pages = [
        { typeName: "page1", id: "1" },
        { typeName: "page2", id: "2" },
        { typeName: "page3", id: "3" },
        { typeName: "page4", id: "4" },
        { typeName: "page5", id: "5" },
    ];
    //colunas
    var list_columns = [
        { typeName: "column1", id: "1" },
        { typeName: "column2", id: "2" },
        { typeName: "column3", id: "3" },
        { typeName: "column4", id: "4" },
        { typeName: "column5", id: "5" }
    ];
    //linhas
    var list_rows = [
        { typeName: "row1", id: "1" },
        { typeName: "row2", id: "2" },
        { typeName: "row3", id: "3" },
        { typeName: "row4", id: "4" },
        { typeName: "row5", id: "5" },
        { typeName: "row6", id: "6" },
        { typeName: "row7", id: "7" },
    ];

    var menu_adm = [
        {menu: "labelCfgButtons", id: "menu_btn"},
        {menu: "labelCfgAcctions", id: "menu_act"},
        //{menu: "labelCfgNovaalert", id: "menu_srv"},
        //{menu: "labelCfgDefaults", id: "menu_dft"},
        {menu: "labelCfgLicense", id: "menu_lic"},
        {menu: "labelOption", id: "menu_opt"},
        {menu: "labelReports", id: "menu_rpt"},
    ]

    var options = [
        { id: 'floor', img: './images/map.svg' }, //string
        { id: 'map', img: './images/location.svg' }, //string
        { id: 'sensor', img: './images/wifi.svg' },
        { id: 'radio', img: './images/warning.svg' },
        { id: 'video', img: './images/camera.svg' },
        { id: 'chat' , img: './images/chat.svg'}
    ]

    var dests = [
        { id: 'megaphone', img: './images/megaphone.svg' }, //string
        { id: 'police', img: './images/police.svg' }, //string
        { id: 'water', img: './images/water.svg' },
        { id: 'house', img: './images/house.svg' },
        { id: 'light', img: './images/light.svg' },
        { id: 'hospital', img: './images/hospital.svg' },
        { id: 'fire', img: './images/fire.svg' },
    ]
    var category = [
        {menu: "Disponibilidade", id: "RptAvailability"},
        {menu: "Chamadas", id: "RptCalls"},
        {menu: "Atividades", id: "RptActivities"},
        {menu: "Sensores", id: "RptSensors"},
        {menu: "Chat", id: "RptMessages"},
        {menu: "Todos", id: "RptAll"},
    ]
    list_Sensors = [
        {sensor_name: "Técnica", id: "5874125"},
        {sensor_name: "Adm", id: "5383483"},
        {sensor_name: "Logistica", id: "834834534"},
        {sensor_name: "Vendas", id: "43583483"},
        {sensor_name: "Diretoria", id: "48338434"},
        {sensor_name: "Fabrica 1", id: "43843478"},
        {sensor_name: "Fabrica 2", id: "42484338"},
    ]

    //license
    var licenseToken = null;
    var licenseFile = null;
    var licenseActive = null;
    var licenseInstallDate = null;
    var licenseUsed = 0;

    //init
    function app_connected(domain, user, dn, appdomain) {
        UIuser = dn;
        //avatar
        avatar = new innovaphone.Avatar(start, user, domain);
        UIuserPicture = avatar.url(user, 100, dn);
        constructor();
        app.send({ api: "admin", mt: "AdminMessage" });
        app.send({ api: "admin", mt: "SelectSensorName" });
    }
    //TEXTS.TEXT + TRUNCATE STRING
    function appText(text, maxLength){
        var str = texts.text(text)
        if(str[0] ==="{"){
            if (text.length > maxLength) {
                return text.substring(0, maxLength) + "...";
            } else {
                return text;
            }
        } else{
            if (str.length > maxLength) {
                return str.substring(0, maxLength) + "...";
            } else {
                return str;
            }
        }
    }
    //AJUSTA A DIV / TEXTO PELO ID
    function adjustDivSize(id, minWidth, minHeight) {
        var div = document.getElementById(id);
        var divWidth = div.offsetWidth;
        var divHeight = div.offsetHeight;
        var texto = div.innerText;
    
        switch (true) {
            case (divWidth < minWidth || divHeight < minHeight):
                div.innerText = texto.substring(0, 10); // Substitua '10' pelo número de caracteres desejado
                break;
            case (divWidth < 100 || divHeight < 100):
                div.style.fontSize = '12px'; // Defina o tamanho da fonte desejado
                break;
            default:
                // Retorna ao tamanho normal da fonte e texto original
                div.style.fontSize = ''; // Restaura o tamanho da fonte padrão
                div.innerText = texto; // Restaura o texto original
                break;
        }
    }
    
    // Chama a função quando a janela é redimensionada
    window.onresize = function() {
        adjustDivSize('myDiv'); // Substitua 'myDiv' pelo ID da div desejada
    };

    //messages 
    function app_message(obj) {
        if (obj.api == "admin" && obj.mt == "AdminMessageResult") {
            iptUrl = obj.urlalert;
            googlekey = obj.googlekey;
            iptServerEnable = obj.urlenable;
            iptMethod = obj.urlmethod;
            //app.send({api: "admin", mt: "SelectMessage" })
        }
        if (obj.api == "admin" && obj.mt == "MessageError") {
            console.log(obj.result);
            makePopup("ERRO", "Erro: " + obj.result);
        }
        if (obj.api == "admin" && obj.mt == "TableUsersResult") {
            console.log(obj.result);
            list_users = [];
            list_users = JSON.parse(obj.result);
        }
        if (obj.api == "admin" && obj.mt == "SelectMessageSuccess") {
            console.log(obj.result);
            list_buttons = JSON.parse(obj.result);
            console.log( "USER SRC " + obj.src)
            //makeTableButtons(col_direita);
            makeDivAddButton2(col_direita, obj.src)
        }
        if (obj.api == "admin" && obj.mt == "SelectButtonsMessageSuccess") {
            console.log(obj.result);
            list_buttons = JSON.parse(obj.result);
        }
        if (obj.api == "admin" && obj.mt == "SelectActionMessageSuccess") {
            console.log(obj.result);
            list_actions = JSON.parse(obj.result);
            makeActionsDiv(col_direita);
            
        }
        if (obj.api == "admin" && obj.mt == "InsertMessageSuccess") {
            app.send({ api: "admin", mt: "SelectMessage", src: obj.src });
            makePopup("Sucesso", "Botão criado com sucesso!");
        }
        if (obj.api == "admin" && obj.mt == "UpdateMessageSuccess") {
            app.send({ api: "admin", mt: "SelectMessage" });
            makePopup("Sucesso", "Botão atualizado com sucesso!");
        }
        //if (obj.api == "admin" && obj.mt == "InsertActionMessageSuccess") {
        //    app.send({ api: "admin", mt: "SelectActionMessage" });
        //    makePopup("Sucesso", "Ação criada com sucesso!");
        //}
        if (obj.api == "admin" && obj.mt == "UpdateActionMessageSuccess") {
            app.send({ api: "admin", mt: "SelectActionMessage" });
            makePopup("Sucesso", "Ação atualizada com sucesso!");
        }
        //if (obj.api == "admin" && obj.mt == "DeleteMessageSuccess") {
        //    app.send({ api: "admin", mt: "SelectMessage" });
        //    makePopup("Sucesso", "Botão excluído com sucesso!");
        //}
        //if (obj.api == "admin" && obj.mt == "DeleteActionMessageSuccess") {
        //    app.send({ api: "admin", mt: "SelectActionMessage" });
        //    makePopup("Sucesso", "Ação excluída com sucesso!");
        //}
        if (obj.api == "admin" && obj.mt == "SelectSensorsFromButtonsSuccess") {
            console.log(obj.result);
            list_buttons_sensors = JSON.parse(obj.result);
            filterReports(obj.src, col_direita);
        }
        if (obj.api == "admin" && obj.mt == "SelectFromReportsSuccess") {
            // reportsHitory = JSON.stringify(obj.result)
            // reportList(reportsHitory)
            if(obj.result === "[]"){
                makePopup("Error", texts.text("noReport"))
            }else{
                receivedFragments.push(obj.result);

                if (obj.lastFragment) {
                    // Todos os fragmentos foram recebidos
                    var jsonData = receivedFragments.join("");
    
                    receivedFragments = [];
                    // Faça o que quiser com os dados aqui
                    if(obj.src == "RptSensors"){
                        sensorAnalyse(jsonData, obj.src)
                            .then(function (message) {
                                console.log(message);
                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                    }else{
                        reportList(JSON.parse(jsonData), obj.src)
                            .then(function (message) {
                                console.log(message);
                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                    }
                }
            }
            // if(obj.src == "RptSensors"){
            //     receivedFragments.push(obj.result);

            //     if (obj.lastFragment) {
                    
            //         // Todos os fragmentos foram recebidos
            //         var jsonData = receivedFragments.join("");
    
            //         receivedFragments = [];
            //         // Faça o que quiser com os dados aqui
            //         sensorAnalyse(jsonData, obj.src)
            //             .then(function (message) {
            //                 console.log(message);
            //             })
            //             .catch(function (error) {
            //                 console.log(error);
            //             });
            //         //reportView(colDireita, jsonData, obj.src);
            //         // Limpe o array de fragmentos recebidos
            //         //receivedFragments = [];
            //     }
            //     //sensorAnalyse(obj.result, obj.src);
                
            // }else{
            //     receivedFragments.push(obj.result);

            //     if (obj.lastFragment) {
                    
            //         // Todos os fragmentos foram recebidos
            //         var jsonData = receivedFragments.join("");
    
            //         // receivedFragments = [];
            //         // Faça o que quiser com os dados aqui
            //         reportList(jsonData, obj.src)
            //             .then(function (message) {
            //                 console.log(message);
            //             })
            //             .catch(function (error) {
            //                 console.log(error);
            //             });
            //         //reportView(colDireita, jsonData, obj.src);
            //         // Limpe o array de fragmentos recebidos
            //         receivedFragments = [];
            //     }
            //     //reportList(obj.result, obj.src);
            // }

        }
        if (obj.api == "admin" && obj.mt == "DeleteFromReportsSuccess") {
            constructor();
            makePopup("Atenção!", "Dados excluídos com sucesso!");
        }
        if (obj.api == "admin" && obj.mt == "UpdateConfigLicenseMessageSuccess") {
            app.send({ api: "admin", mt: "ConfigLicense" });
            waitConnection(colDireita);
            window.alert("Configurações Atualizadas com suecesso!");

        }
        if (obj.api == "admin" && obj.mt == "LicenseMessageResult") {
            try {
                licenseToken = obj.licenseToken;
                licenseFile = obj.licenseFile;
                licenseActive = obj.licenseActive;
                licenseInstallDate = obj.licenseInstallDate;
                licenseUsed = obj.licenseUsed;

            } catch (e) {
                console.log("ERRO LicenseMessageResult:" + e)
            }
            makeDivLicense(col_direita);
        }
        if (obj.api == "admin" && obj.mt == "UpdateConfigMessageErro") {
            window.alert("Erro ao atualizar as configurações, verifique os logs do serviço.");
        }
        if (obj.api == "admin" && obj.mt == "SelectSensorNameResult") {
            console.log(obj.result);
            list_sensors_name = JSON.parse(obj.result);
        }

    }

    function makePopup(header, content) {
        console.log("makePopup");
        var styles = [new innovaphone.ui1.PopupStyles("popup-background", "popup-header", "popup-main", "popup-closer")];
        var h = [20];

        var popup = new innovaphone.ui1.Popup("position:absolute; left:50px; top:50px; width:500px; height:200px;", styles[0], h[0]);
        popup.header.addText(header);
        popup.content.addText(content);
    }

     //buttons
     function makeButtonsDiv(t, user) {
        t.clear(); // limpa a coluna direita
        var colDireita = document.getElementById("colDireita")
        var html = `
        <div class = "mainDivTableButtons" style = "width: 100%; ">
        <div class = "divHeaderTableButtons">
        <div>${texts.text("labelCfgButons")}</div>
        <select id="selectUserModal" class="genericInputs">
        <option value="">${texts.text("labelSelectUser")}</option>
        </select>
        </div>
        <br>
        <div class = "tableButtonDiv" id = "tableButtonDiv">
        <table id = "tableButton">
        <thead>
            <tr>
            <th class = "thAction">${texts.text("labelID")}</th>
            <th class = "thAction">${texts.text("labelName")}</th>
            <th class = "thAction">${texts.text("labelType")}</th>
            <th class = "thAction">${texts.text("labelUser")}</th>
            <th class = "thAction"><img src = "./images/star.svg" style = "35px" > </img></th>
            </tr>
        </thead>
        <tbody id = "tbodyButton">
        </tbody>
        </table>
        </div>
        </div>
        `
        colDireita.innerHTML += html;
        
        var selectUserModal = document.getElementById("selectUserModal");
        list_users.forEach(function(user) {
            console.log("user " + user)
            var option = document.createElement("option");
            option.value = user.guid; 
            option.id = user.guid
            option.textContent = user.cn; 
            option.style.fontSize = '12px';
            option.style.textAlign = "center";
            option.style.color = "white";
            selectUserModal.appendChild(option);
        });
        document.getElementById("selectUserModal").addEventListener("change", function (evt) {
            var user = document.getElementById("selectUserModal");
            var selectedOption = user.options[user.selectedIndex];
            var user = selectedOption.id;
            console.log("Usuário Selecionado" + selectUserModal)
            makeTableButtons(user)
        });

         if (user !="noUser") {
             console.log("Usuário Selecionado ao acessar a tabela " + user)
             document.getElementById("selectUserModal").value = user
             makeTableButtons(user)
         }
    }

    function makeTableButtons(user) {

        var tbody = document.getElementById("tbodyButton");
        tbody.innerHTML = '';

        var filteredUserButtons = list_buttons.filter(function(button){
            return button.button_user == user
        })
        console.log("USER BUTTONS " + JSON.stringify(filteredUserButtons))

        var filteredUserCN = list_users.filter(function(u){
            return u.guid == user
        })[0]

        filteredUserButtons.forEach(function(button) {
            var newRow = document.createElement("tr");
            // Preencha as células conforme necessário
            var cells = [
                button.id,
                button.button_name,
                getButtonTypeText(button.button_type),
                filteredUserCN.cn
            ];
    
            cells.forEach(function(cellData) {
                var newCell = document.createElement("td");
                newCell.textContent = cellData;
                newCell.classList.add("tdTableAction")
                newRow.appendChild(newCell);
            });
    
            // Adiciona o ícone de lixeira
            var deleteIconCell = document.createElement("td");
            deleteIconCell.innerHTML = `<span class="delete-icon"><img src = "./images/trash.svg"> </img></span>`;
            deleteIconCell.classList.add("tdTableAction", "deleteTrash")
            deleteIconCell.setAttribute("row-id", button.id)
            deleteIconCell.id = "deleteTrash"
            newRow.appendChild(deleteIconCell);
            tbody.appendChild(newRow);
        });
        //var deleteIconCell = document.getElementById("deleteTrash")
        //if(deleteIconCell){
        //    deleteIconCell.addEventListener("click",function(evt){
        //        var rowId = this.getAttribute("row-id")
        //        app.send({ api: "admin", mt: "DeleteMessage", id: parseInt(rowId) });
        //    })
        //}
        var deleteIconCell = document.querySelectorAll(".deleteTrash")
        for (var i = 0; i < deleteIconCell.length; i++) {
            var botao = deleteIconCell[i];
            // O jeito correto e padronizado de incluir eventos no ECMAScript
            // (Javascript) eh com addEventListener:
            botao.addEventListener("click", function (e) {
                var rowId = this.getAttribute("row-id")
                app.sendSrc({ api: "admin", mt: "DeleteMessage", id: parseInt(rowId), guid: user, src: user }, function (obj) {
                    list_buttons = JSON.parse(obj.result)
                    makeTableButtons(obj.guid)
                    makePopup(texts.text("labelWarning", "labelDeleteSuccess"))
                });

            })
        }

    }
    function makeDivAddButton2(t1,userSrc) {
        t1.clear();
        //user
        var codDireita = document.getElementById("colDireita")
        
        var leftScreen = document.createElement("div")
        leftScreen.classList.add("leftScreenAdm")
        leftScreen.id = "leftScreen"

        var addBottonsForm= document.createElement("div")
        addBottonsForm.classList.add('addBottonsForm')
        addBottonsForm.id = "addBottonsForm"

        var middleScreen = document.createElement("div")
        middleScreen.classList.add("middleScreenAdm")
        middleScreen.id = "middleScreen"

        var rightScreen = document.createElement("div")
        rightScreen.classList.add("rightScreenAdm")
        rightScreen.id = "rightScreen"

        var topMiddleScreen = document.createElement("div")
        topMiddleScreen.classList.add("topMiddleScreen")
        topMiddleScreen.id = "topMiddleScreen"

        var btmMiddleScreen = document.createElement("div")
        btmMiddleScreen.classList.add("btmMiddleScreen")
        btmMiddleScreen.id = "btmMiddleScreen"

        var pageGrid = document.createElement("div")
        pageGrid.classList.add("pageGrid")
        pageGrid.id = "pageGrid"

        var textOpt = document.createElement("div")
        textOpt.classList.add("textOpt")
        textOpt.id = "textOpt"
        textOpt.textContent = texts.text("labelUser")
        
        var selectUser = document.createElement("select")
        selectUser.classList.add("selectUserAdm")
        selectUser.id = "selectUser"
        const buttonTable = document.createElement("div")
        buttonTable.innerHTML = makeButton(texts.text("labelTable"),"secundary");

        
        const optUser = document.createElement("option")
        optUser.textContent = appText('select', 15)
        optUser.id = "noUser"
        selectUser.appendChild(optUser)

        list_users.forEach(function(user) {
            const optUser = document.createElement("option")
            optUser.textContent = user.cn
            optUser.value = user.guid;
            optUser.id = user.guid
            selectUser.appendChild(optUser)

            if (user.guid === userSrc) {
                optUser.selected = true; 
            }
        })

        
        //Botões centrais
        var divButtonsMain = document.createElement("div")
        divButtonsMain.id = "divMainButtons"
        divButtonsMain.classList.add( "divMainButtons")

        // var iptUser = t1.add(new innovaphone.ui1.Node("select", null, null, "iptUserString"));
        // iptUser.setAttribute("id", "selectUser");
        // iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "", null).setAttribute("id", "all"));
        // list_users.forEach(function (user) {
        //     iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.cn, null).setAttribute("id", user.sip));
        // })
        
        
        var addButtonsArea = document.createElement('div')
        addButtonsArea.classList.add("addButtonsArea")

        var zoneDiv = document.createElement('div')
        zoneDiv.classList.add("zoneDiv")
        zoneDiv.id = "zoneDiv"
        // //Coluna Esquerda
        // col_esquerda = addButtonsArea.add(new innovaphone.ui1.Div("width: 62%; height:100%; position:relative; background: var(--colors-neutro-1000);", null));
        // col_esquerda.add(new innovaphone.ui1.Div(null, null, "zoneDiv").setAttribute("id", "zoneDiv"))



        //Botões Fixos no final
        var divOptionsMain = document.createElement('div')
        divOptionsMain.classList.add("divOptionsMain")
        divOptionsMain.id = "divOptionsMain"
        //var divOptionsMain = divCenter.add(new innovaphone.ui1.Div(null, null, null))
        
        // //Coluna  Direita
        // col_direita = addButtonsArea.add(new innovaphone.ui1.Div("align-self: flex-start; width: 100%; position: relative; background: var(--colors-neutro-1000) ", null).setAttribute("id", "colDireita"));

        // cameras sensores graficos planta baixa
        var optionsDiv = document.createElement('div')
        optionsDiv.classList.add("optionsDiv")
        optionsDiv.id = "optionsDiv"

        

        options.forEach(function (o) {
            var optionsDivBtn = document.createElement('div')
            optionsDivBtn.classList.add('optionsBtn')
            optionsDivBtn.id = o.id

            var divTop = document.createElement('div')
            divTop.classList.add('neutro-800','buttontop')

            var imgTop = document.createElement('img')
            imgTop.setAttribute("src", o.img)

            var divBottom = document.createElement('div')
            divBottom.classList.add("buttondown",'neutro-900' )
            divBottom.textContent = appText(o.id, 15)

            divTop.appendChild(imgTop)
            optionsDivBtn.appendChild(divTop)
            optionsDivBtn.appendChild(divBottom)
            optionsDiv.appendChild(optionsDivBtn)
        })

        //paginas de 1 - 5
        var pagesDiv = document.createElement('div')
        pagesDiv.classList.add("div-page")
        list_pages.forEach(function (p) {
            var pagesBtnDiv = document.createElement('div')
            pagesBtnDiv.classList.add('pagina')
            pagesBtnDiv.id = p.id

            var pagesBtnText = document.createElement('div') 
            pagesBtnDiv.classList.add("framePagesText")

            var textBtn = document.createElement('div')
            textBtn.classList.add("text-wrapper-Pages")
            textBtn.textContent = appText(p.typeName, 20)

            pagesBtnText.appendChild(textBtn)
            pagesBtnDiv.appendChild(pagesBtnText)
            pagesDiv.appendChild(pagesBtnDiv)
        })

        selectUser.addEventListener("change", function (e) {
            //user id
            var user = document.getElementById("selectUser");
            var selectedOption = user.options[user.selectedIndex];
            var user = selectedOption.id;

            console.log("ERICK SELECTED USER", user)
            
            popButtons(user, "1")

            leftBottomButons(user)
            createGridZero("floor", user);

        })
        buttonTable.addEventListener("click", function () {
            //user id
            var user = document.getElementById("selectUser");
            var selectedOption = user.options[user.selectedIndex];
            var user = selectedOption.id;

            makeButtonsDiv(t1, user)
        })
        
        topMiddleScreen.appendChild(textOpt)
        topMiddleScreen.appendChild(selectUser)
        topMiddleScreen.appendChild(buttonTable)
        addButtonsArea.appendChild(zoneDiv)
        leftScreen.appendChild(addBottonsForm)
        leftScreen.appendChild(addButtonsArea)

        btmMiddleScreen.appendChild(divButtonsMain)
        
        pageGrid.appendChild(optionsDiv)
        pageGrid.appendChild(pagesDiv)

        btmMiddleScreen.appendChild(pageGrid)

        middleScreen.appendChild(topMiddleScreen)
        middleScreen.appendChild(btmMiddleScreen)
                
        codDireita.appendChild(leftScreen)
        codDireita.appendChild(middleScreen)
        codDireita.appendChild(rightScreen)

        // listner nos botões das opções
        var optionSelector = document.querySelectorAll(".optionsBtn");
        for (var i = 0; i < optionSelector.length; i++) {
            var botao = optionSelector[i];
            // O jeito correto e padronizado de incluir eventos no ECMAScript
            // (Javascript) eh com addEventListener:
            botao.addEventListener("click", function (e) {

                //user id
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var user = selectedOption.id;

                if (user == "all") {
                    makePopup(texts.text("labelWarning"), texts.text("labelFillUser"))
                    return;
                } else {
                    if (!this.classList.contains("clicked")) {
                        //var btnsClick = document.querySelectorAll('.clicked')
                        //btnsClick.forEach(function (b) {
                        //    b.classList.remove('clicked')
                        //    b.children[0].classList.add("neutro-800")
                        //    b.children[1].classList.add("neutro-900")
                        //    b.children[0].classList.remove("azul-marinho-400")
                        //    b.children[1].classList.remove("azul-500")
                        //})
                        //this.classList.add("clicked")
                        //this.children[0].classList.remove("neutro-800")
                        //this.children[1].classList.remove("neutro-900")
                        //this.children[0].classList.add("azul-marinho-400")
                        //this.children[1].classList.add("azul-500")

                        var id = e.currentTarget.id
                        createGridZero(id, user);
                    }
                }
            });
        }

        // listner nos botões das páginas
        var pageSelector = document.querySelectorAll(".pagina");

        for (var i = 0; i < pageSelector.length; i++) {
            var botao = pageSelector[i];
            // O jeito correto e padronizado de incluir eventos no ECMAScript
            // (Javascript) eh com addEventListener:
            botao.addEventListener("click", function (e) {
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var user = selectedOption.id;

                if (user == "all") {
                    makePopup(texts.text("labelWarning"), texts.text("labelFillUser"))
                    return;
                } else {
                    var id = e.currentTarget.id
                    popButtons(user, id)

                }
            });
        }

        
        //Criar a coluna center com Botões
        popButtons("all", "1")

        //Criar a coluna de botões a esquerda
        leftBottomButons("all");

        //Criar a coluna de botões a direita
        createGridZero("floor", "all")

        if(userSrc){
            popButtons(userSrc, "1")
            leftBottomButons(userSrc)
            createGridZero("floor", userSrc);
        }

    }
    function popButtons(user, page) {
        console.log('ERICK POPBUTTONS', user, page, list_buttons)
        var buttons = [];
        var filterGuid = list_users.filter(function(u){return u.guid == user})
        console.log('ERICK FILTER', filterGuid)
        if (page && filterGuid.length > 0 ) {
            buttons = list_buttons.filter(function (b) { return b.page == page && b.button_user == filterGuid[0].guid })
        } 
        // else {
        //     buttons = list_buttons;
        //     page = "1"
        // }

        console.log('ERICK buttons', buttons)
        var divMainButtons = document.getElementById("divMainButtons")
        divMainButtons.innerHTML = ''
        //Botões centrais
        //var divButtonsMain = divCenter.add(new innovaphone.ui1.Div(null, null, "divMainButtons"))
        //divButtonsMain.setAttribute("id", "divMainButtons")
        divMainButtons.setAttribute("page", page)
        

        // div botão combo
        var combobtnDiv = document.createElement('div')
        combobtnDiv.id = "combobtn"
        combobtnDiv.classList.add("combobtn")

        for (let i = 1; i < 6; i++) {
            var combobtn = document.createElement('div')
            combobtn.classList.add('btnEmpty', 'Button', "combobutton")

            combobtn.setAttribute("page", page)
            combobtn.setAttribute("position-x", 1);
            combobtn.setAttribute("position-y", i);

            // const buttonImg = document.createElement("img")
            // buttonImg.setAttribute("src", "./images/addButton.svg")

            // combobtn.appendChild(buttonImg)
            combobtnDiv.appendChild(combobtn)
        }

        divMainButtons.appendChild(combobtnDiv)

        // linha divisória (hr)
        var dividerLine = document.createElement("hr")
        dividerLine.classList.add('divider')
        dividerLine.id = 'divider'
        divMainButtons.appendChild(dividerLine)

        // div sensores 💣💣💣
        var sensoresBtnDiv = document.createElement('div')
        sensoresBtnDiv.id = "sensoresBtnDiv"
        sensoresBtnDiv.classList.add("sensoresBtnDiv")
        for (let i = 1; i < 6; i++) {

            var sensorBtn = document.createElement('div')
            sensorBtn.classList.add("btnEmpty", 'Button', 'sensorButton')
            sensorBtn.setAttribute("page", page)
            sensorBtn.setAttribute("position-x", 2);
            sensorBtn.setAttribute("position-y", i);
            // const buttonImg = document.createElement("img")
            // buttonImg.setAttribute("src", "./images/addButton.svg")

            // sensorBtn.appendChild(buttonImg)
            sensoresBtnDiv.appendChild(sensorBtn)
        }

        divMainButtons.appendChild(sensoresBtnDiv)

        // linha divisória (hr)
        var dividerLine = document.createElement("hr")
        dividerLine.classList.add('divider')
        dividerLine.id = 'divider'
        divMainButtons.appendChild(dividerLine)

        //botões telefonia e alarme
        var allbtnDiv = document.createElement("div");
        allbtnDiv.classList.add("allbtnDiv")
        for (let i = 1; i < 31; i++) {

            var positionX = Math.ceil(i / 5) + 2; // 5/5 = 1 + 2  é = 3  e assim vai sempre ate 7
            var positionY = i % 5 === 0 ? 5 : i % 5; // 5%5 = 1 e assim vai 

            var allbtn = document.createElement("div");
            allbtn.classList.add("btnEmpty", "Button")
            allbtn.setAttribute("page", page)
            allbtn.setAttribute("position-x", positionX);
            allbtn.setAttribute("position-y", positionY);
            
            allbtnDiv.appendChild(allbtn)
        }
        divMainButtons.appendChild(allbtnDiv)
        //var allbtn = document.getElementById("allbtn");
        console.log("TODOS OS BOTÕES " + "\n" + JSON.stringify(buttons))
        //makeAllButtons(buttons,page)

        // criar todos os botões com a função genérica createButtons e classe btnEmpty
        buttons.forEach(function (object) {
            switch (object.button_type) {
                case "combo":
                    createComboButton(object, "comboButton", "ciano-600", "ciano-900", "./images/Layer.svg", "combobutton")
                    break;
                case "alarm":
                    createButtons(object, "allbutton", "gold-900", "gold-600", "./images/warning.svg", "Button")
                    break;
                case "number":
                    createButtons(object, "exnumberbutton", "verde-900", "verde-600", "./images/phone.svg", "Button")
                    break;
                case "user":
                    createButtons(object, "exnumberbutton", "verde-900", "verde-600", "./images/phone.svg", "Button")
                    break;
                case "sensor":
                    createSensorButton(object, "sensorbutton", "neutro-900", "neutro-1000", "./images/wifi.svg", "sensorButton")
                    break;
                default:
                    break;
            }
        });

        // listner nos botões vagos btnEmpty
        var botoes = document.querySelectorAll(".btnEmpty");
        for (var i = 0; i < botoes.length; i++) {
            var botao = botoes[i];
            // O jeito correto e padronizado de incluir eventos no ECMAScript
            // (Javascript) eh com addEventListener:
            botao.addEventListener("click", function () {
                if (user == "all") {
                    makePopup(texts.text("labelWarning"), texts.text("labelFillUser"))
                    return;
                } else {
                    // Obter os valores de position_x e position_y do elemento clicado
                    var position_x = this.getAttribute("position-x");
                    var position_y = this.getAttribute("position-y");

                    var z = document.getElementById("divMainButtons")
                    z = z.getAttribute("page");
                    if (position_x == 1) {
                        // Chamar a função makeDivAddButton3() passando os valores obtidos como argumentos
                        makeDivAddButton3("combo", user, position_x, position_y, z);
                    }
                    else if (position_x == 2) {
                        // Chamar a função makeDivAddButton3() passando os valores obtidos como argumentos
                        makeDivAddButton3( "sensor", user, position_x, position_y, z);
                    } else if (position_x >= 3 && position_x <= 8) {
                        // Chamar a função makeDivAddButton3() passando os valores obtidos como argumentos
                        makeDivAddButton3("center", user, position_x, position_y, z);
                    }
                }
            });
        }
        var pageSelector = document.querySelectorAll(".pagina");
        pageSelector.forEach(function (p) {
            if (p.id == page) {
                p.classList.add("azul-600-bottom")
            } else {
                p.classList.remove("azul-600-bottom")
            }
        })
        //Coloca a img + nos botões livres
        var btnfree = document.querySelectorAll(".btnEmpty")
        if(btnfree){
            btnfree.forEach(function(b){
                const buttonImg = document.createElement("img")
                buttonImg.setAttribute("src", "./images/addButton.svg")

                b.appendChild(buttonImg) 
            })

        }
 
    }
    function createButtons(object,classButton,bgTop,bgBottom,srcImg,mainButtonClass){

        var selector = `.${mainButtonClass}[position-x='${object.position_x}'][position-y='${object.position_y}'][page='${object.page}']`;
        var allBtns = document.querySelector(selector);
        if (allBtns) {
            allBtns.setAttribute("id", object.id);
            allBtns.setAttribute("button_type", object.button_type);
            allBtns.setAttribute("button_id", object.id);
            allBtns.setAttribute("button_prtstatus", object.button_prt + "-status");
            allBtns.classList.remove("btnEmpty")
            allBtns.classList.add(classButton)
            var divTop = document.createElement("div")
            divTop.classList.add(bgTop)
            divTop.classList.add("buttontop")
            divTop.setAttribute("id", object.id + "-status");
            //divTop.setAttribute("id", object.button_prt + "-status");
            allBtns.appendChild(divTop)
            var imgTop = document.createElement("img")
            imgTop.style.width = "20px";
            imgTop.setAttribute("src", srcImg)
            divTop.appendChild(imgTop)
            var divTopText = document.createElement("div")
            divTopText.textContent = object.button_name.toLowerCase()
            //truncateString(object.button_name.toLowerCase(),"7")
            divTop.appendChild(divTopText);

            var divBottom = document.createElement("div")
            divBottom.classList.add(bgBottom)
            divBottom.classList.add("buttondown")
            var divBottomTxt = document.createElement("div")
            divBottomTxt.textContent = object.button_prt.toLowerCase()
            //truncateString(object.button_prt.toLowerCase(),"7")
            divBottom.appendChild(divBottomTxt)
            allBtns.appendChild(divBottom)
            allBtns.setAttribute("button_prt", object.button_prt); 
                allBtns.setAttribute("button_prtstatus", object.button_prt + "-status");
                divBottomTxt.textContent = object.button_prt.toLowerCase()
                //truncateString(object.button_prt.toLowerCase(),"7")
                var found = true;
                list_users.forEach(function(u){
                    if(object.button_prt == u.guid && found){
                        allBtns.setAttribute("button_prt", u.e164); 
                        allBtns.setAttribute("button_prtstatus", u.e164 + "-status");
                        divBottomTxt.textContent = u.cn.toLowerCase()
                        // truncateString(u.cn.toLowerCase(),"7")
                        found = false
                        // se mudar o sip vai refletir aqui 
                        //pois tratamos tudo com GUID no admin
                    }
                })
        }
    }
    function createSensorButton(object, classButton, bgTop, bgBottom, srcImg, mainButtonClass) {

        var selector = `.${mainButtonClass}[position-x='${object.position_x}'][position-y='${object.position_y}'][page='${object.page}']`;
        var allBtns = document.querySelector(selector);
        if (allBtns) {
            allBtns.setAttribute("id", object.id);
            allBtns.setAttribute("button_type", object.button_type);
            allBtns.setAttribute("button_prt", object.button_prt);
            allBtns.setAttribute("button_id", object.id);
            allBtns.setAttribute("button_prtstatus", object.button_prt + "-status");
            allBtns.classList.remove("btnEmpty")
            allBtns.classList.add(classButton)
            var divTop = document.createElement("div")
            divTop.classList.add(bgTop)
            divTop.classList.add("buttontop")
            divTop.setAttribute("id", object.id + "-status");
            //divTop.setAttribute("id", object.button_prt + "-status");
            allBtns.appendChild(divTop)
            var imgTop = document.createElement("img")
            imgTop.style.width = "20px";
            imgTop.setAttribute("src", srcImg)
            divTop.appendChild(imgTop)
            var divTopText = document.createElement("div")
            divTopText.textContent = object.button_prt.toLowerCase()
            //truncateString(object.button_prt.toLowerCase(),"7")// nome do sensor que é o button_prt da list_buttons
            divTop.appendChild(divTopText);

            var divBottom = document.createElement("div")
            divBottom.classList.add(bgBottom)
            divBottom.classList.add("buttondown")
            var divBottomTxt = document.createElement("div")
            divBottomTxt.textContent = texts.text(object.sensor_type).toLowerCase()
            //truncateString(texts.text(object.sensor_type).toLowerCase(),"7")
            divBottomTxt.style.fontSize = "13px";
            divBottomTxt.style.margin = '8px';
            divBottomTxt.style.width = "100%"
            divBottom.appendChild(divBottomTxt)
            allBtns.appendChild(divBottom)
        }
    }
    function createComboButton(object, classButton, bgTop, bgBottom, srcImg, mainButtonClass) {

        var selector = `.${mainButtonClass}[position-x='${object.position_x}'][position-y='${object.position_y}'][page='${object.page}']`;
        var allBtns = document.querySelector(selector);
        if (allBtns) {
            allBtns.setAttribute("id", object.id);
            allBtns.setAttribute("button_type", object.button_type);
            allBtns.setAttribute("button_prt", object.button_prt);
            allBtns.setAttribute("button_id", object.id);
            allBtns.setAttribute("button_prtstatus", object.button_prt + "-status");
            allBtns.classList.remove("btnEmpty")
            allBtns.classList.add(classButton)
            // div esquerda (imagem do botão)
            var divImgCombo = document.createElement("div")
            divImgCombo.classList.add(bgTop)
            divImgCombo.classList.add("imgComboBtn")
            divImgCombo.setAttribute("id", object.id + "-status");
            allBtns.appendChild(divImgCombo)
            var imgCombo = document.createElement("img")
            imgCombo.style.width = "40px";
            imgCombo.setAttribute("src", srcImg)
            divImgCombo.appendChild(imgCombo)
            // div direita (nome do botão etc)
            var divComboName = document.createElement("div")
            divComboName.classList.add(bgBottom)
            divComboName.classList.add("divComboName")
            var divComboTopName = document.createElement("div")
            divComboTopName.textContent = object.button_type.toLowerCase()
            //truncateString(object.button_type.toLowerCase(),"5")
            divComboTopName.classList.add("divComboTopName")
            divComboName.appendChild(divComboTopName)
            var divComboBottomName = document.createElement("div")
            divComboBottomName.textContent = object.button_name.toLowerCase()
            //truncateString(object.button_name.toLowerCase(),"5");
            divComboBottomName.classList.add("divComboBottomName")
            divComboName.appendChild(divComboBottomName)
            allBtns.appendChild(divComboName)
        }
    }
    function  makeDivAddButton3(type, user, x, y, z) {
        //Título
        //t1.add(new innovaphone.ui1.Div(null, texts.text("labelTituloAdd"), "tituloAdd"));
        //var comboarea = t1.add(new innovaphone.ui1.Div(null, null, "comboarea"));
        var insideDiv = document.createElement("div")
        insideDiv.id = 'insideDiv'
        insideDiv.classList.add("insideDiv")

        switch (type) { 
            case "combo":
                document.body.appendChild(insideDiv)
                addComboParamters(insideDiv,type, user, x, y, z);
                break;
            case "sensor":
                document.body.appendChild(insideDiv)
                addSensorParamters(insideDiv,type, user, x, y, z);
                break;
            case "center":
                //Tipo
                var html = `
                <html>
                    <div class="divMainModal">
                        <h2 class="titleModal">${texts.text("btnAddButton")}</h2>
                        <div class="divSelectAndTextModal">
                            <span class="textGeneric">${texts.text("labelType")}</span>
                            <select id="selectTypeButtonModal" class="genericInputs">
                                <option value="">${texts.text("defaultOpt")}</option>
                                <option value="" id="alarm">${texts.text("labelAlarm")}</option>
                                <option value="" id="user">${texts.text("labelUser2")}</option>
                                <option value="" id="number">${texts.text("labelNumber")}</option>
                            </select>
                            </div>
                            <div class="divButtonsGeneric">
                            <div id = "btnCancel">${makeButton(texts.text("btnCancel"),"tertiary")}</div>
                            </div> 
                        </div>
                    </div>
                </html>
            `;
            
                insideDiv.innerHTML += html
                document.body.appendChild(insideDiv)
                // addAlarmParamters(type,user, x, y, z) // o select com alarme por default entao essa função é chamada

                
                   document.getElementById("selectTypeButtonModal").addEventListener("change", function (e) {
                                console.log(e.target.value);
                                var type = document.getElementById("selectTypeButtonModal");
                                var selectedOption = type.options[type.selectedIndex];
                                var type = selectedOption.id;
                                console.log(type);
                                if (type == "user") {
                                    //divMainButtons.removeChild(divSelectTypeButton)
                                    addUserParamters(insideDiv,type,user, x, y, z);

                                }
                                else if (type == "number") {
                                    //divMainButtons.removeChild(divSelectTypeButton)
                                    addNumberParamtersMultiDevice(insideDiv,type,user, x, y, z);
                                }
                                else if (type == "alarm") {
                                    // divMainButtons.removeChild(divSelectTypeButton)
                                    addAlarmParamters(insideDiv,type,user, x, y, z);
                                }
                            });   
    // //Botão Cancelar   
    document.getElementById("btnCancel").addEventListener("click",function(evt){
        var insideDiv = document.getElementById("insideDiv")
        document.body.removeChild(insideDiv)
    })            
                break;
            default:
                break;
        }

    }
    function addUserParamters(divMain,type,user, x, y, z) {
        var htmlUser = `
        <html>
            <body>
                <div class="divMainModal">
                <h2 class="titleModal">${texts.text("btnAddButton")}</h2>
                    <div class="divSelectAndTextModalBig">
                        <span class="textGeneric">${texts.text("labelButtonName")}</span>
                        <input type="text" class="genericInputs" id= "iptName" placeholder="${texts.text("labelButtonName")}">
                    </div>
                    <div class="divSelectAndTextModal">
                        <span class="textGeneric">${texts.text("labelValue")}</span>
                        <select id="selectParamModal" class="genericInputs">
                            <option value="selectUser" style = "text-align:center">${texts.text("labelSelectUser")}</option>
                        </select>
                    </div> 
                    <div class="divSelectAndTextModal">
                        <span class="textGeneric">${texts.text("labelDevice")}</span>
                        <select id="selectDeviceModal" class="genericInputs">
                            <option value="selectDevice" style = "text-align:center">${texts.text("labelSelectDevice")}</option>
                        </select>
                    </div> 
                    <div class="divButtonsGeneric">
                        <div id = "btnCancel">${makeButton(texts.text("btnCancel"),"tertiary")}</div>
                        <div id = "btnSave">${makeButton(texts.text("btnAddButton"),"primary")}</div>
                    </div> 
                </div>
            </body>
        </html>
    `;
    
    divMain.innerHTML = ''
    divMain.innerHTML += htmlUser

        var selectUserModal = document.getElementById("selectParamModal");
        list_users.forEach(function(user) {
            console.log("user " + user)
            var option = document.createElement("option");
            option.value = user.guid; 
            option.id = user.guid
            option.textContent = user.cn; 
            option.style.fontSize = '12px';
            option.style.textAlign = "center";
            option.style.color = "white";
            selectUserModal.appendChild(option);
        });
    
        var selectDevice = document.getElementById("selectDeviceModal")
        var u = list_users.filter(function (u) { return u.guid == user })[0]
        var devices = u.devices;
        devices.forEach(function (dev) {
            var opts = document.createElement("option")
            opts.textContent =  dev.text
            opts.id = dev.hw;
            opts.style.fontSize = '12px';
            opts.style.textAlign = "center";
            opts.style.color = "white";
            selectDevice.appendChild(opts)
        })
        //insideDiv.appendChild(divMainButtons)
        //document.body.appendChild(insideDiv)

        document.body.addEventListener("click",function(event){
            if(event.target.id == "insideDiv"){
                var insideDiv = document.getElementById("insideDiv")
                document.body.removeChild(insideDiv)
            }
        })

        // //Botão Salvar
            //device
            document.getElementById("btnSave").addEventListener("click",function(){

                var iptName = document.getElementById("iptName")
                var device = document.getElementById("selectDeviceModal");
                var selectedOption = device.options[device.selectedIndex];
                var device = selectedOption.id;

                
                if (iptName.value == "" || String(type) == "") {
                    makePopup("Atenção", "Complete todos os campos para que o botão possa ser criado.");
                }
                if (type == "user") {
                    var value = document.getElementById("selectParamModal");
                    var selectedOption = value.options[value.selectedIndex];
                    var value = selectedOption.id;
                    list_users.forEach(function(u){
                        if (u.guid == value ) {
                            app.send({ api: "admin", mt: "InsertNumberMessage", name: iptName.value , user: String(""), value: String(u.guid), guid: String(user), type: String(type), device: device, page: z, x: x, y: y, src: user });
                        }
                    })
                    var insideDiv = document.getElementById("insideDiv")
                    document.body.removeChild(insideDiv)
                    insideDiv.innerHTML = ''
                    //waitConnection(t1);
                 }
            })
       
        // //Botão Cancelar   
        document.getElementById("btnCancel").addEventListener("click",function(evt){
            var insideDiv = document.getElementById("insideDiv")
            document.body.removeChild(insideDiv)
        })
    }
    function addAlarmParamters(divMain,type,user,x,y,z) {
        var htmlUser = `
        <html>
            <body>
                <div class="divMainModal">
                <h2 class="titleModal">${texts.text("btnAddButton")}</h2>
                    <div class="divSelectAndTextModalBig">
                        <span class="textGeneric">${texts.text("labelButtonName")}</span>
                        <input type="text" class="genericInputs" id = "iptNameButton" placeholder="${texts.text("labelButtonName")}">
                    </div>
                    <div class="divSelectAndTextModalBig">
                        <span class="textGeneric">${texts.text("labelValue")}</span>
                        <input type="text" class="genericInputs"  id="iptParam" placeholder="${texts.text("alarm")}">
                    </div> 
                    <div class="divButtonsGeneric">
                        <div id = "btnCancel">${makeButton(texts.text("btnCancel"),"tertiary")}</div>
                        <div id = "btnSave">${makeButton(texts.text("btnAddButton"),"primary")}</div>
                    </div> 
                </div>
            </body>
        </html>
    `;

            divMain.innerHTML = ''
            divMain.innerHTML += htmlUser

            document.body.addEventListener("click",function(event){
                if(event.target.id == "insideDiv"){
                    var insideDiv = document.getElementById("insideDiv")
                    document.body.removeChild(insideDiv)
                }
            })
            //adicionar na div principal

        // //Botão Salvar
        document.getElementById("btnSave").addEventListener("click",function(evt){
                var iptNameButton = document.getElementById("iptNameButton")
                var iptParam = document.getElementById("iptParam")

                 if ( iptNameButton.value == "" || String(type) == "") {
                makePopup("Atenção", "Complete todos os campos para que o botão possa ser criado.");
            } else {

                app.send({ api: "admin", mt: "InsertAlarmMessage", name: String(iptNameButton.value), user: String(""), value: String(iptParam.value), guid: String(user), type: String(type), page: z, x: x, y: y, src: user });
                //waitConnection(colDireita);
                var insideDiv = document.getElementById("insideDiv")
                document.body.removeChild(insideDiv)
                insideDiv.innerHTML = ''
            }
        });

        ////Botão Cancelar   
           document.getElementById("btnCancel").addEventListener("click",function(evt){
            var insideDiv = document.getElementById("insideDiv")
            document.body.removeChild(insideDiv)
        })

    }
    function addComboParamters(divMain,type,user,x,y,z) {

        var htmlUser = `
        <html>
            <body>
                <div class="divMainModal">
                <h2 class="titleModal">${texts.text("btnAddButton")}</h2>
                    <div class="divSelectAndTextModalBig">
                        <span class="textGeneric">${texts.text("labelButtonName")}</span>
                        <input type="text" class="genericInputs" id = "iptNameButton" placeholder="${texts.text("labelButtonName")}">
                    </div>
                    <div class="divSelectAndTextModalBig">
                        <span class="textGeneric">${texts.text("labelValue")}</span>
                        <input type="text" class="genericInputs"  id="iptParam" placeholder="${texts.text("labelValue")}">
                    </div> 
                    <div class="divSelectAndTextModalBig">
                    
                        <span class="textGeneric">${texts.text("Combo1")}</span>
                        <select id="selectType1" class="genericInputs">
                            <option value="Combo1" style = "text-align:center">${texts.text("defaultOpt")}</option>
                    </select> 
                     </div> 
                     <div class="divSelectAndTextModalBig">
                        <span class="textGeneric">${texts.text("Combo2")}</span>
                        <select id="selectType2" class="genericInputs">
                            <option value="Combo2" style = "text-align:center">${texts.text("defaultOpt")}</option>
                     </select> 
                      </div> 
                      <div class="divSelectAndTextModalBig">
                      <span class="textGeneric">${texts.text("Combo3")}</span>
                      <select id="selectType3" class="genericInputs">
                          <option value="Combo3" style = "text-align:center">${texts.text("defaultOpt")}</option>
                   </select> 
                    </div> 
                    <div class="divSelectAndTextModalBig">
                    <span class="textGeneric">${texts.text("Combo4")}</span>
                    <select id="selectType4" class="genericInputs">
                        <option value="Combo4" style = "text-align:center">${texts.text("defaultOpt")}</option>
                 </select> 
                  </div> 
                    <div class="divButtonsGeneric">
                        <div id = "btnCancel">${makeButton(texts.text("btnCancel"),"tertiary")}</div>
                        <div id = "btnSave">${makeButton(texts.text("btnAddButton"),"primary")}</div>
                    </div> 
                    <div>
                
            </body>
        </html>
    `;

      
    divMain.innerHTML = ''
    divMain.innerHTML += htmlUser

            // 1 Tipo
            var Combo1Select = document.getElementById("selectType1")
            list_buttons.forEach(function (button) {
                if (button.button_type != "combo" && button.button_user == user) {
                    var opts = document.createElement("option")
                    opts.textContent =  button.button_name;
                    opts.id = button.id;
                    opts.style.fontSize = '12px';
                    opts.style.textAlign = "center";
                    opts.style.color = "white";
                    Combo1Select.appendChild(opts)
                }
            })

            // 2 Tipo
            var Combo2Select = document.getElementById("selectType2")
            list_buttons.forEach(function (button) {
                if (button.button_type != "combo" && button.button_user == user) {
                    var opts = document.createElement("option")
                    opts.textContent =  button.button_name;
                    opts.id = button.id;
                    opts.style.fontSize = '12px';
                    opts.style.textAlign = "center";
                    opts.style.color = "white";
                    Combo2Select.appendChild(opts)
                }
            })

            // 3 Tipo
            var Combo3Select = document.getElementById("selectType3")
            list_buttons.forEach(function (button) {
                if (button.button_type != "combo" && button.button_user == user) {
                    var opts = document.createElement("option")
                    opts.textContent =  button.button_name;
                    opts.id = button.id;
                    opts.style.fontSize = '12px';
                    opts.style.textAlign = "center";
                    opts.style.color = "white";
                    Combo3Select.appendChild(opts)
                }
            })

            // 4 Tipo
            var Combo4Select = document.getElementById("selectType4")
            list_buttons.forEach(function (button) {
                if (button.button_type != "combo" && button.button_user == user) {
                    var opts = document.createElement("option")
                    opts.textContent =  button.button_name;
                    opts.id = button.id;
                    opts.style.fontSize = '12px';
                    opts.style.textAlign = "center";
                    opts.style.color = "white";
                    Combo4Select.appendChild(opts)
                }
            })

        // //Botão Salvar
        document.getElementById("btnSave").addEventListener("click",function(){
                var iptName = document.getElementById("iptNameButton").value
                var iptValue = document.getElementById("iptParam").value
            if (String(iptName) == "" || String(type) == "") {
                makePopup("Atenção", "Complete todos os campos para que o botão possa ser criado.");
            }
            else if (type == "combo") {
                var type1 = document.getElementById("selectType1");
                var selectedOption = type1.options[type1.selectedIndex];
                var type1 = selectedOption.id;

                var type2 = document.getElementById("selectType2");
                var selectedOption = type2.options[type2.selectedIndex];
                var type2 = selectedOption.id;

                var type3 = document.getElementById("selectType3");
                var selectedOption = type3.options[type3.selectedIndex];
                var type3 = selectedOption.id;

                var type4 = document.getElementById("selectType4");
                var selectedOption = type4.options[type4.selectedIndex];
                var type4 = selectedOption.id;
                app.send({ api: "admin", mt: "InsertComboMessage", name: String(iptName), user: String(""), value: String(iptValue), guid: String(user), type: String(type), type1: String(type1), type2: String(type2), type3: String(type3), type4: String(type4), page: z, x: x, y: y, src: user });
                //waitConnection(colDireita);
                var insideDiv = document.getElementById("insideDiv")
                document.body.removeChild(insideDiv)
                insideDiv.innerHTML = ''
            }
        });
        document.body.addEventListener("click",function(event){
            if(event.target.id == "insideDiv"){
                var insideDiv = document.getElementById("insideDiv")
                document.body.removeChild(insideDiv)
            }
        })

        
         ////Botão Cancelar   
         document.getElementById("btnCancel").addEventListener("click",function(evt){
            var insideDiv = document.getElementById("insideDiv")
            document.body.removeChild(insideDiv)
        })
    }
    function addNumberParamtersMultiDevice(divMain,type,user, x, y, z) {

        var htmlUser = `
        <html>
            <body>
                <div class="divMainModal">
                <h2 class="titleModal">${texts.text("btnAddButton")}</h2>
                    <div class="divSelectAndTextModalBig">
                        <span class="textGeneric">${texts.text("labelButtonName")}</span>
                        <input type="text" class="genericInputs" id= "iptName" placeholder="${texts.text("labelButtonName")}">
                    </div>
                    <div class="divSelectAndTextModalBig">
                        <span class="textGeneric">${texts.text("labelValue")}</span>
                        <input type="text" class="genericInputs" id= "iptParam" placeholder="${texts.text("number")}">
                    </div> 
                    <div class="divSelectAndTextModal">
                        <span class="textGeneric">${texts.text("labelDevice")}</span>
                        <select id="selectDeviceModal" class="genericInputs">
                            <option value="selectDevice" style = "text-align:center">${texts.text("labelSelectDevice")}</option>
                        </select>
                    </div> 
                    <div class="divButtonsGeneric">
                        <div id = "btnCancel">${makeButton(texts.text("btnCancel"),"tertiary")}</div>
                        <div id = "btnSave">${makeButton(texts.text("btnAddButton"),"primary")}</div>
                    </div> 
                </div>
            </body>
        </html>
    `;
    
        divMain.innerHTML = ''
        divMain.innerHTML += htmlUser
            
        var selectDevice = document.getElementById("selectDeviceModal")
        var u = list_users.filter(function (u) { return u.guid == user })[0]
        var devices = u.devices;
        devices.forEach(function (dev) {
            var opts = document.createElement("option")
            opts.textContent =  dev.text
            opts.id = dev.hw;
            opts.style.fontSize = '12px';
            opts.style.textAlign = "center";
            opts.style.color = "white";
            selectDevice.appendChild(opts)
        })
        //insideDiv.appendChild(divMainButtons)
        //document.body.appendChild(insideDiv)

        document.body.addEventListener("click",function(event){
            if(event.target.id == "insideDiv"){
                var insideDiv = document.getElementById("insideDiv")
                document.body.removeChild(insideDiv)
            }
        })

       
        // //Botão Salvar
        
        document.getElementById("btnSave").addEventListener("click",function(){
                 
            var iptName = document.getElementById("iptName")
            var iptParam = document.getElementById("iptParam")
            var device = document.getElementById("selectDeviceModal");
            var selectedOption = device.options[device.selectedIndex];
            var device = selectedOption.id;

            if (iptName.value == "" || iptParam.value == "") {
                makePopup("Atenção", "Complete todos os campos para que o botão possa ser criado.");
            }
            else if (type == "number") {
                app.send({ api: "admin", mt: "InsertNumberMessage", name: iptName.value, user: String(""), value: iptParam.value, guid: String(user), type: String(type), device: device, page: z, x: x, y: y, src: user });
                //waitConnection(t1);
                var insideDiv = document.getElementById("insideDiv")
                document.body.removeChild(insideDiv)
                insideDiv.innerHTML = ''
            }
        });

        ////Botão Cancelar   
           document.getElementById("btnCancel").addEventListener("click",function(evt){
            var insideDiv = document.getElementById("insideDiv")
            document.body.removeChild(insideDiv)
        })

    }
    function addSensorParamters(divMain,type,user,x,y,z) {

        var htmlUser = `
        <html>
            <body>
                <div class="divMainModal">
                <h2 class="titleModal">${texts.text("btnAddButton")}</h2>
                    <div class="divSelectAndTextModalBig">
                        <span class="textGeneric">${texts.text("labelSensorName")}</span>
                        <input type="text" class="genericInputs" id= "iptNameSensor" placeholder="${texts.text("labelSensorName")}">
                    </div>
                    <div class="divSelectAndTextModalBig">
                        <span class="textGeneric">${texts.text("labelButtonName")}</span>
                        <input type="text" class="genericInputs" id= "iptName" placeholder="${texts.text("labelButtonName")}">
                    </div> 
                    <div class="divSelectAndTextModal">
                    <span class="textGeneric">${texts.text("labelTypeOfMeasure")}</span>
                    <select id="selectValueType" class="genericInputs">
                    <option value="measure"> ${texts.text("defaultOpt")}</option>
                    </select>
                    </div> 
                    <div class="divSelectAndTextModal">
                    <span class="textGeneric" style = "width:100%;">${texts.text("minValue")}</span>
                    <input type="number" class="genericInputs" id= "minThreshold" placeholder="00" style = "text-align:center; width:120px">
                    </div> 
                    <div class="divSelectAndTextModal">
                    <span class="textGeneric" style = "width:100%;">${texts.text("maxValue")}</span>
                    <input type="number" class="genericInputs" id= "maxThreshold" placeholder="00" style = "text-align:center; width:120px">
                    </div> 
                    <div class="divButtonsGeneric">
                        <div id = "btnCancel">${makeButton(texts.text("btnCancel"),"tertiary")}</div>
                        <div id = "btnSave">${makeButton(texts.text("btnAddButton"),"primary")}</div>
                    </div> 
                </div>
            </body>
        </html>
    `;
        divMain.innerHTML = ''
        divMain.innerHTML += htmlUser

       var selectValueType = document.getElementById("selectValueType")
        list_sensor_types.forEach(function (s) {
            var opts = document.createElement("option")
            opts.textContent =  texts.text(s.id)
            opts.id = s.id;
            opts.style.fontSize = '12px';
            opts.style.textAlign = "center";
            opts.style.color = "white";
            selectValueType.appendChild(opts)
        });


        // //Botão Salvar
      document.getElementById("btnSave").addEventListener("click",function(){

            var iptName = document.getElementById("iptName").value
            var iptMin = document.getElementById("minThreshold").value
            var iptMax = document.getElementById("maxThreshold").value
            var iptNameSensor = document.getElementById("iptNameSensor").value
            var valueType = document.getElementById("selectValueType");
            var selectedOption = valueType.options[valueType.selectedIndex];
            var valueType = selectedOption.id;

            if (String(iptNameSensor) == "" || String(type) == "" || iptMin == "" || iptMax == "") {
                makePopup(texts.text("labelWarning"), texts.text("labelFillInputsSensor"));
            } else {
                app.send({ api: "admin", mt: "InsertSensorMessage", name: String(iptName), user: String(""), value: String(iptNameSensor), guid: String(user), type: String(type), min: iptMin, max: iptMax, sensorType: String(valueType), page: z, x: x, y: y, src: user });
                //waitConnection(t1);
                var insideDiv = document.getElementById("insideDiv")
                document.body.removeChild(insideDiv)
                insideDiv.innerHTML = ''
            }
        });

       //Botão Cancelar   
       document.getElementById("btnCancel").addEventListener("click",function(evt){
        var insideDiv = document.getElementById("insideDiv")
        document.body.removeChild(insideDiv)
    })
    }


    function makeDivAddOption(divmain, type, user, x, y, z) {
        switch (type) {
            case "radio":
                addNumberParamtersMultiDevice(comboarea, type); // Analisar o que podemos fazer aqui ~Pietro
                break;
            case "sensor":
                addSensorOptions(divmain, type, user , x ,y ,z)
                break;
            case "chat":
                addChatOptions(divmain, type, user, x, y, z);
                break;
            default:
                addOptions(divmain, type,user,x,y,z);
                break;
        }
    }
    function addOptions(divmain, type, user , x ,y ,z) {

      var html =  `
            <div class="divSelectAndTextModalBig">
                <span class="textGeneric">${texts.text("labelButtonName")}</span>
                <input type="text" class="genericInputs" id= "iptName" placeholder="${texts.text("labelButtonName")}">
            </div>
            <div class="divSelectAndTextModalBig">
                <span class="textGeneric">${texts.text("labelValue")}</span>
                <input type="text" class="genericInputs" id= "iptParam" placeholder="${texts.text("placeholderOptionType"+type)}">
            </div>
            
            <div class="divButtonsGeneric">
                <div id = "btnCancel">${makeButton(texts.text("btnCancel"),"tertiary")}</div>
                <div id = "btnSave">${makeButton(texts.text("btnAddButton"),"primary")}</div>
            </div> 
            `;

            

            divmain.innerHTML = '';
            divmain.innerHTML += html;

        // //Botão Salvar
        document.getElementById("btnSave").addEventListener("click",function(evt){
            var iptName = document.getElementById("iptName").value;
            var iptParam = document.getElementById("iptParam").value;
            //var userTo = document.getElementById("selectUserModal");
            //var selectedOption = userTo.options[userTo.selectedIndex];
            //userTo = selectedOption.id;
            if (String(iptName) == "" || String(type) == "") {
                makePopup("Atenção", "Complete todos os campos para que o botão possa ser criado.");
            } else {
                app.sendSrc({ api: "admin", mt: "InsertMessageSrc", name: String(iptName), user: String(""), value: String(iptParam), guid: String(user), type: String(type), page: z, x: x, y: y, src: user }, function (obj) {
                    list_buttons = JSON.parse(obj.result)
                    createGridZero(type, user)

                })
                // waitConnection(t1);
             
            }
        })

        // //Botão Cancelar   
        document.getElementById("btnCancel").addEventListener("click",function(evt){
            divmain.innerHTML = '';
        })
    }
    function addChatOptions(divmain, type, user, x, y, z) {

        var html = `
            <div class="divSelectAndTextModalBig">
                <span class="textGeneric">${texts.text("labelButtonName")}</span>
                <input type="text" class="genericInputs" id= "iptName" placeholder="${texts.text("labelButtonName")}">
            </div>
            <div class="divSelectAndTextModalBig">
                <span class="textGeneric">${texts.text("labelValue")}</span>
                <select id="selectUserModal" class="genericInputs">
                    <option value="">${texts.text("labelSelectUser")}</option>
                </select>
            </div>
            
            <div class="divButtonsGeneric">
                <div id = "btnCancel">${makeButton(texts.text("btnCancel"), "tertiary")}</div>
                <div id = "btnSave">${makeButton(texts.text("btnAddButton"), "primary")}</div>
            </div> 
            `;



        divmain.innerHTML = '';
        divmain.innerHTML += html;

        var selectUserModal = document.getElementById("selectUserModal");
        list_users.forEach(function (user) {
            var option = document.createElement("option");
            option.value = user.guid;
            option.id = user.guid
            option.textContent = user.cn;
            option.style.fontSize = '12px';
            option.style.textAlign = "center";
            option.style.color = "white";
            selectUserModal.appendChild(option);
        });

        // //Botão Salvar
        document.getElementById("btnSave").addEventListener("click", function (evt) {
            var iptName = document.getElementById("iptName").value;
            //var iptParam = document.getElementById("iptParam").value;
            var userTo = document.getElementById("selectUserModal");
            var selectedOption = userTo.options[userTo.selectedIndex];
            userTo = selectedOption.id;
            if (String(iptName) == "" || String(type) == "") {
                makePopup("Atenção", "Complete todos os campos para que o botão possa ser criado.");
            } else {
                app.sendSrc({ api: "admin", mt: "InsertMessageSrc", name: String(iptName), user: String(""), value: String(userTo), guid: String(user), type: String(type), page: z, x: x, y: y, src: user }, function (obj) {
                    list_buttons = JSON.parse(obj.result)
                    createGridZero(type, user)

                })
                // waitConnection(t1);

            }
        })

        // //Botão Cancelar   
        document.getElementById("btnCancel").addEventListener("click", function (evt) {
            divmain.innerHTML = '';
        })
    }
    function addSensorOptions(divmain, type, user , x ,y ,z){
        var html =  `
        <div class="divSelectAndTextModalBig">
            <span class="textGeneric">${texts.text("labelButtonName")}</span>
            <input type="text" class="genericInputs" id= "iptName" placeholder="${texts.text("labelButtonName")}">
        </div>
        <div class="divSelectAndTextModalBig">
            <span class="textGeneric">${texts.text("labelSensorName")}</span>
            <input type="text" class="genericInputs" id= "iptParam" placeholder="${texts.text("labelSensorName")}">
        </div>
        <div class="divButtonsGeneric">
            <div id = "btnCancel">${makeButton(texts.text("btnCancel"),"tertiary")}</div>
            <div id = "btnSave">${makeButton(texts.text("btnAddButton"),"primary")}</div>
        </div> 
        `;

        divmain.innerHTML = '';
        divmain.innerHTML += html;

    // //Botão Salvar
    document.getElementById("btnSave").addEventListener("click",function(evt){
        var iptName = document.getElementById("iptName").value;
        var iptParam = document.getElementById("iptParam").value;
        if (String(iptName) == "" || String(type) == "") {
            makePopup("Atenção", "Complete todos os campos para que o botão possa ser criado.");
        } else {
            //waitConnection(t1);
            app.sendSrc({ api: "admin", mt: "InsertMessageSrc", name: String(iptName), user: String(""), value: String(iptParam), guid: String(user), type: String(type), page: z, x: x, y: y, src: user }, function(obj) {
                list_buttons = JSON.parse(obj.result)
                createGridZero(type, user)

            });
            
         
        }
    })
    // //Botão Cancelar   
    document.getElementById("btnCancel").addEventListener("click",function(evt){
        divmain.innerHTML = '';
    })
    }

    function createGridZero(type, user) {
        var opt = document.getElementById(type)
        if (!opt.classList.contains("clicked")) {
            var btnsClick = document.querySelectorAll('.clicked')
            btnsClick.forEach(function (b) {
                b.classList.remove('clicked')
                b.children[0].classList.add("neutro-800")
                b.children[1].classList.add("neutro-900")
                b.children[0].classList.remove("azul-marinho-400")
                b.children[1].classList.remove("azul-500")
            })
            opt.classList.add("clicked")
            opt.children[0].classList.remove("neutro-800")
            opt.children[1].classList.remove("neutro-900")
            opt.children[0].classList.add("azul-marinho-400")
            opt.children[1].classList.add("azul-500")
        }

        console.log("createGridZero Acessado")
        const colRight = document.getElementById("rightScreen")
        colRight.innerHTML = ""
        const colDireitaTop = document.createElement("div")
        colDireitaTop.classList.add("colDireitaTop")
        colRight.append(colDireitaTop)
        const headerTxt = document.createElement("div")
        headerTxt.id = "headerTxt"
        headerTxt.classList.add("headerTxt")
        headerTxt.textContent = texts.text(type)

        const grid = document.createElement("div")
        grid.id = "gridZero"
        grid.classList.add("gridZero")

        const divModalGridZero = document.createElement("div")
        divModalGridZero.id = "divModalGridZero"
        divModalGridZero.classList.add("divOptionsGridZero")

        for (var i = 1; i < 13; i++) {

            var positionX = Math.floor(i / 6) + 1; // Calcula a posição X
            var positionY = i % 6 === 0 ? 6 : i % 6; // 6%6 = 1 e assim vai 

            const buttonGrid = document.createElement("div")
            buttonGrid.id = i
            buttonGrid.classList.add("optEmpty")
            buttonGrid.setAttribute("position-x", positionX)
            buttonGrid.setAttribute("position-y", positionY)
            buttonGrid.setAttribute("page", "0")
            const buttonImg = document.createElement("img")
            buttonImg.setAttribute("src", "./images/addButton.svg")
            buttonImg.setAttribute("id", "buttonImg")

            buttonGrid.appendChild(buttonImg)
            grid.appendChild(buttonGrid)

        }
        colDireitaTop.appendChild(headerTxt)
        colDireitaTop.appendChild(grid)
        colDireitaTop.appendChild(divModalGridZero)

        list_buttons.forEach(function (b) {
            if (b.page === "0" && b.button_type === type && b.button_user === user) {
                createOptions(b)
            }
        })

        // listner nos botões vagos btnEmpty
        var botoes = document.querySelectorAll(".optEmpty");
        for (var i = 0; i < botoes.length; i++) {
            var botao = botoes[i];
            // O jeito correto e padronizado de incluir eventos no ECMAScript
            // (Javascript) eh com addEventListener:
            botao.addEventListener("click", function () {
                if (user == "noUser" || user == "all") {
                    makePopup(texts.text("labelWarning"), texts.text("labelFillUser"))
                    return;
                } else {
                    // Obter os valores de position_x e position_y do elemento clicado
                    var position_x = this.getAttribute("position-x");
                    var position_y = this.getAttribute("position-y");



                    makeDivAddOption(divModalGridZero, type, user, position_x, position_y, "0")
                }
            })
        }

        // listner nos botões ocupados para editar btnBusy
        var botoes = document.querySelectorAll(".optBusy");
        for (var i = 0; i < botoes.length; i++) {
            var botao = botoes[i];
            // O jeito correto e padronizado de incluir eventos no ECMAScript
            // (Javascript) eh com addEventListener:
            botao.addEventListener("click", function () {
                if (user == "noUser" || user == "all") {
                    makePopup(texts.text("labelWarning"), texts.text("labelFillUser"))
                    return;
                } else {
                    // Obter os valores de position_x e position_y do elemento clicado
                    var position_x = this.getAttribute("position-x");
                    var position_y = this.getAttribute("position-y");

                    var id = this.getAttribute("id");
                    var btn = list_buttons.filter(function (b) {return b.id == id})[0]

                    makeDivUpdateButton(divModalGridZero, btn)

                    //makeDivAddOption(divModalGridZero, type, user, position_x, position_y, "0")
                }
            })
        }
    }
    function createOptions(object) {

        var selector = `.${"optEmpty"}[position-x='${object.position_x}'][position-y='${object.position_y}'][page='${object.page}']`;
        var allBtns = document.querySelector(selector);
        if (allBtns) {
            allBtns.setAttribute("id", object.id);
            allBtns.setAttribute("button_type", object.button_type);
            allBtns.setAttribute("button_prt", object.button_prt);
            allBtns.setAttribute("button_id", object.id);
            allBtns.setAttribute("button_prtstatus", object.button_prt + "-status");
            allBtns.classList.remove("optEmpty")
            allBtns.classList.add("azul-500", "optBusy")
            allBtns.innerHTML = object.button_name
        }
    }

    function leftBottomButons(user) {
        const zoneDiv = document.getElementById("zoneDiv")
        zoneDiv.innerHTML = '';

        for (var i = 0; i < 9; i++) {

            var positionX = Math.floor(i / 4) + 1; // Calcula a posição X
            var positionY = (positionX - 1) * 4 + (i % 4) + 1; // Calcula a posição Y

            const buttonGrid = document.createElement("div")
            buttonGrid.id = i
            buttonGrid.classList.add("destEmpty")
            buttonGrid.setAttribute("position-x", positionX)
            buttonGrid.setAttribute("position-y", positionY)
            buttonGrid.setAttribute("page", "0")


            zoneDiv.appendChild(buttonGrid)
        }


        list_buttons.forEach(function (zb) {
            console.log('ERICK DEST', zb.button_user , user)
            if (zb.button_type == "dest" && zb.button_user == user && zb.page == "0") {
                createDests(zb)
            }
        })

        // listner nos botões vagos btnEmpty
        var botoes = document.querySelectorAll(".destEmpty");
        if(botoes){
            botoes.forEach(function(b){
                const buttonImg = document.createElement("img")
                buttonImg.setAttribute("src", "./images/addButton.svg")

                b.appendChild(buttonImg) 
            })
        }
        for (var i = 0; i < botoes.length; i++) {
            var botao = botoes[i];
            // O jeito correto e padronizado de incluir eventos no ECMAScript
            // (Javascript) eh com addEventListener:
            botao.addEventListener("click", function () {
                if (user == "all") {
                    makePopup(texts.text("labelWarning"), texts.text("labelFillUser"))
                    return;
                } else {
                    // Obter os valores de position_x e position_y do elemento clicado
                    var position_x = this.getAttribute("position-x");
                    var position_y = this.getAttribute("position-y");
                    var bottonsForm = document.getElementById("addBottonsForm");
                    if(bottonsForm){
                        bottonsForm.innerHTML = ''
                    }
                    addleftbottons("dest", user, position_x, position_y, "0")
                    //makeDivAddOption(col_direita, "dest", user, position_x, position_y, "0")
                }
            })
        }

    }
    function truncateString(str, maxLength) {
        if (str.length > maxLength) {
            return str.substring(0, maxLength) + "...";
        } else {
            return str;
        }
    }

    function selectDevice(bc){
        var selectDevice = document.getElementById(bc)
        var u = list_users.filter(function (u) { return u.guid == user })[0]
        var devices = u.devices;
        devices.forEach(function (dev) {
            var opts = document.createElement("option")
            opts.textContent =  dev.text
            opts.id = dev.hw;
            opts.style.fontSize = '12px';
            opts.style.textAlign = "center";
            opts.style.color = "white";
            selectDevice.appendChild(opts)
        })
    }
    function addleftbottons(type, user, x, y, z) {
        var addBottonsForm = document.getElementById('addBottonsForm')
        
        var u = list_users.filter(function (u) { return u.guid == user })[0]
        var devices = u.devices;

        var imgDiv = document.createElement('div');
        imgDiv.classList.add('imgDiv')
        var bgimg = document.createElement('div');
        bgimg.classList.add('bcimg')
    
        var bgimgTxt = document.createElement('div');
        bgimgTxt.classList.add('bgimgTxt')
        bgimgTxt.textContent = "Selecione"
    
        var bgButtons = document.createElement('div');
        bgButtons.id = 'bgButtons'
        bgButtons.classList.add('bgButtons')
    
        compInputText('Nome do Botão', 'nameInput', addBottonsForm)
        compInputText('Parâmetro', 'parameterInput', addBottonsForm)
        compInputSelect('Dispositivo', 'deviceSelect', devices, addBottonsForm)
        var input1 = document.getElementById('nameInput')
        var input2 = document.getElementById('parameterInput')
        //var select = document.getElementById('deviceSelect')
        
    
        dests.forEach(function(imagem) {
            var imageElement = document.createElement('img');
            imageElement.src = imagem.img;
            imageElement.id = imagem.id;
            imageElement.classList.add('imageSrc');
            imageElement.addEventListener('click', function(event) {
                // Remover a classe 'selected' de todas as imagens
                dests.forEach(function(imgObject) {
                    var imgToRemoveClass = document.getElementById(imgObject.id);
                    imgToRemoveClass.classList.remove('selected');
                });
    
                event.target.classList.add('selected');
            });
            imgDiv.appendChild(imageElement);
        });
    
        var create = document.createElement('div')
        create.textContent = "Criar"
        create.classList.add('btnprimary')
        create.id = "create"
        create.addEventListener('click', function(){
            var imgSelected = document.querySelector('.selected')
            console.log('TEXTOS 1', input1.value)
            console.log('TEXTOS 2', input2.value)
            var device = document.getElementById("deviceSelect");
            var selectedOption = device.options[device.selectedIndex];
            var device = selectedOption.id;
            console.log('TEXTOS device', device)
            console.log('TEXTOS I', imgSelected.getAttribute("src"))
            app.send({ api: "admin", mt: "InsertDestMessage", name: String(input1.value), user: String(""), value: String(input2.value), guid: String(user), type: String(type), device: device, img: String(imgSelected.getAttribute("src")), page: z, x: x, y: y, src: user });
        })
    
        var cancel = document.createElement('div')
        cancel.textContent = "Cancel"
        cancel.classList.add('btnsecundary')
        cancel.id = "cancel"
        cancel.addEventListener('click', function(){
            document.getElementById("addBottonsForm").innerHTML = '';
            console.log('TEXTOS', input1.value,input2.value,input3.value)
        })
    
        bgimg.appendChild(bgimgTxt);
        bgimg.appendChild(imgDiv);
        
        bgButtons.appendChild(cancel)
        bgButtons.appendChild(create)

        addBottonsForm.appendChild(bgimg)
        addBottonsForm.appendChild(bgButtons)
    }
    function compInputText(name, id ,addScreen){
       
        var bc = document.createElement("div")
        bc.classList.add('bcInput')
        
        var nameInputText = document.createElement("div")
        nameInputText.classList.add('nameInputText')
        nameInputText.textContent = name
        
        var inputText = document.createElement("input")
        inputText.id = id
        inputText.setAttribute('type', 'text');
        inputText.placeholder = "Insira o texto aqui"

        bc.appendChild(nameInputText)
        bc.appendChild(inputText)
        addScreen.appendChild(bc)
    }
    function compInputSelect(name, id, options ,addScreen){
       
        var bc = document.createElement("div")
        bc.classList.add('bcInput')
        
        var nameInputText = document.createElement("div")
        nameInputText.classList.add('nameSelectText')
        nameInputText.textContent = name
        
        var selectOpt = document.createElement("select")
        selectOpt.classList.add('addSelect')
        selectOpt.id = id
        console.log("SELECT", options)

        options.forEach(function(o){
            var opt = document.createElement("option")
            opt.id = o.hw
            opt.textContent = o.text
            selectOpt.appendChild(opt);

        })

        bc.appendChild(nameInputText)
        bc.appendChild(selectOpt)
        addScreen.appendChild(bc)
    }
    function createDests(object) {

        var selector = `.${"destEmpty"}[position-x='${object.position_x}'][position-y='${object.position_y}'][page='${object.page}']`;
        var allBtns = document.querySelector(selector);
        if (allBtns) {
            allBtns.setAttribute("id", object.id);
            allBtns.setAttribute("button_type", object.button_type);
            allBtns.setAttribute("button_prt", object.button_prt);
            allBtns.setAttribute("button_id", object.id);
            allBtns.setAttribute("button_prtstatus", object.button_prt + "-status");
            allBtns.classList.remove("destEmpty")
            allBtns.classList.add("destFree", "neutro-800")
            const imgBtn = document.createElement('img')
            imgBtn.classList.add("imgBtn")
            imgBtn.id = "imgBtn"
            imgBtn.setAttribute("src", object.img)
            const txtBtn = document.createElement('div')
            txtBtn.classList.add("txtBtn")
            txtBtn.id = "txtBtn"
            txtBtn.textContent = object.button_name
            //truncateString(object.button_name, "7")


            allBtns.appendChild(imgBtn)
            allBtns.appendChild(txtBtn)
        }
    }

    function makeDivUpdateButton(t1, button) {
        t1.clear();
        //Título
        t1.add(new innovaphone.ui1.Div(null, texts.text("labelTituloEdit"), "tituloAdd"));
        //Tipo
        t1.add(new innovaphone.ui1.Div(null, texts.text("labelType"), "labeltypeAdd"));
        var iptType = t1.add(new innovaphone.ui1.Node("select", null, null, "selectTypeAdd"));
        iptType.setAttribute("id", "selectType");
        list_types.forEach(function (type) {
            iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", texts.text(type.id), null).setAttribute("id", type.id));
        });
        var comboarea = t1.add(new innovaphone.ui1.Div(null, null, "comboarea"));

        if (button) {
            var type = list_types.filter(function (type) { return type.id === button.button_type })[0].typeName;
            var select = document.getElementById('selectType');
            //select.value = button[2];
            select.value = type;
            switch (button.button_type) {
                case "number":
                    addNumberParamters(comboarea);
                    break;
                case "combo":
                    addComboParamters(comboarea);
                    break;
                case "user":
                    addUserParamters(comboarea);
                    break;
                default:
                    addStringParamters(comboarea);
                    break;
            }
        }
        document.getElementById("selectType").addEventListener("change", function (e) {
            console.log(e.target.value);
            if (e.target.value == "Usuário") {
                addUserParamters(comboarea);
            }
            else if (e.target.value == "Número") {
                addNumberParamters(comboarea);
            }
            else if (e.target.value == "Combo x4") {
                addComboParamters(comboarea);
            }
            else {
                addStringParamters(comboarea);
            }

        });
        function addStringParamters(t) {
            //Usuário
            t.clear();
            t.add(new innovaphone.ui1.Div(null, texts.text("labelUser"), "labelUserString"));
            var iptUser = t.add(new innovaphone.ui1.Node("select", null, null, "iptUserString"));
            iptUser.setAttribute("id", "selectUser");
            iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "TODOS", null).setAttribute("id", "all"));
            list_users.forEach(function (user) {
                iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.cn, null).setAttribute("id", user.sip));
            })
            //Atualiza valores
            if (button && button.button_user != "all") {
                var cn = list_users.filter(function (user) { return user.sip === button.button_user })[0].cn;
                var select = document.getElementById('selectUser');
                select.value = cn;
            } else if (button && button.button_user == "all") {
                var select = document.getElementById('selectUser');
                select.value = texts.text("all");
            }
            //var iptUser = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
            var divAdd = t.add(new innovaphone.ui1.Div(null, null, "divAdd"))
            var iptName = divAdd.add(new innovaphone.ui1.Input(null, button.button_name, null, 255, "text", "iptString"));
            divAdd.add(new innovaphone.ui1.Div(null, texts.text("labelButtonName"), "labelBtnString"));
            //iptName.setAttribute("placeholder", " ");
            // divAdd.add(new innovaphone.ui1.Node("span",null,null,"focus-bg"))
            //Nome Usuário
            //t.add(new innovaphone.ui1.Div("position:absolute; display:block; left:0%; width:15%; top:30%; font-size:15px; text-align:right", texts.text("labelUserName")));
            //var iptUserName = t.add(new innovaphone.ui1.Input("position:absolute; display:block; left:16%; width:30%; top:30%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));

            //Parâmetro
            var divAdd2 = t.add(new innovaphone.ui1.Div(null, null, "divAdd2"))
            var iptValue = divAdd2.add(new innovaphone.ui1.Input(null, button.button_prt, null, 500, "text", "iptValueString"));
            divAdd2.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueString"));
            //Botão Salvar
            t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:75%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
                var type = document.getElementById("selectType");
                var selectedOption = type.options[type.selectedIndex];
                var type = selectedOption.id;
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var user = selectedOption.id;
                if (String(iptName.getValue()) == "" || String(type) == "") {
                    makePopup("Atenção", "Complete todos os campos para que o botão possa ser criado.");
                } else {
                    app.send({ api: "admin", mt: "UpdateMessage", id: button.id, name: String(iptName.getValue()), user: String(""), value: String(iptValue.getValue()), sip: String(user), type: String(type) });
                    //waitConnection(t1);
                }
            });
            //Botão Cancelar   
            t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:75%; font-size:15px; text-align:center", null, "button-inn-del")).addTranslation(texts, "btnCancel").addEvent("click", function () {
                makeTableButtons(t1);
            });
        }
        function addNumberParamters(t) {
            //Usuário
            t.clear();
            t.add(new innovaphone.ui1.Div(null, texts.text("labelUser"), "labelUserNumber"));
            var iptUser = t.add(new innovaphone.ui1.Node("select", null, null, "selectUserNumber"));
            iptUser.setAttribute("id", "selectUser");

            list_users.forEach(function (user) {
                iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.cn, null).setAttribute("id", user.sip));
            })
            //Atualiza valores
            if (button.button_user != "all") {
                var cn = list_users.filter(function (user) { return user.sip === button.button_user })[0].cn;
                var select = document.getElementById('selectUser');
                select.value = cn;
            } else if (button && button.button_user == "all") {
                var select = document.getElementById('selectUser');
                select.value = "TODOS";
            }
            //var iptUser = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
            //Nome Botão
            var divAdd3 = t.add(new innovaphone.ui1.Div(null, null, "divAdd3"))
            var iptName = divAdd3.add(new innovaphone.ui1.Input(null, button.button_name, null, 255, "text", "iptNameNumber"));
            divAdd3.add(new innovaphone.ui1.Div(null, texts.text("labelButtonName"), "labelBtnNumber"));
            //Nome Usuário
            //t.add(new innovaphone.ui1.Div("position:absolute; display:block; left:0%; width:15%; top:30%; font-size:15px; text-align:right", texts.text("labelUserName")));
            //var iptUserName = t.add(new innovaphone.ui1.Input("position:absolute; display:block; left:16%; width:30%; top:30%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));

            //Parâmetro
            var divAdd4 = t.add(new innovaphone.ui1.Div(null, null, "divAdd4"))
            var iptValue = divAdd4.add(new innovaphone.ui1.Input(null, button.button_prt, null, 500, "text", "iptValueNumber"));
            divAdd4.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueNumber"));
            iptValue.setAttribute("id", "iptValuePrt")

            //Device
            t.add(new innovaphone.ui1.Div(null, texts.text("device"), "labelDeviceNumber"));
            var iptDevice = t.add(new innovaphone.ui1.Node("select", "width:28%;margin-left:2%;", null, "iptDeviceNumber"));
            iptDevice.setAttribute("id", "selectDevice");
            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "", null).setAttribute("id", ""));

            //era só copiar o código do evento e colar fora do event listner assim o iptdevice é preeenchido ao carregar a div//
            try {
                var devices;
                list_users.forEach(function (user) {
                    if (user.sip == button.button_user) {
                        devices = user.devices;
                        devices.forEach(function (dev) {
                            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
                        })
                    }
                })

                //fazer selecionar o device que estava pré cadastrado no botão, é só fitrar os devices pelo hw que está no button_device e então usar o text para alterar o value//
                if (button.button_type == "number") {
                    var text = devices.filter(function (dev) { return dev.hw === button.button_device })[0].text;
                    var select = document.getElementById('selectDevice');
                    select.value = text;
                }

            } catch (e) {

            }

            document.getElementById("selectUser").addEventListener("change", function (e) {
                console.log(e.target.value);
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var sip = selectedOption.id;
                iptDevice.clear();
                list_users.forEach(function (user) {
                    if (user.sip == sip) {
                        var devices = user.devices;
                        devices.forEach(function (dev) {
                            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
                        })
                    }
                })
            });

            //Botão Salvar
            t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:75%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
                var type = document.getElementById("selectType");
                var selectedOption = type.options[type.selectedIndex];
                var type = selectedOption.id;
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var user = selectedOption.id;
                var prt = document.getElementById("iptValuePrt");
                var device = document.getElementById("selectDevice");
                var selectedOption = device.options[device.selectedIndex];
                var device = selectedOption.id;
                if (String(iptName.getValue()) == "" || String(prt) == "") {
                    makePopup("Atenção", "Complete todos os campos para que o botão possa ser criado.");
                }
                else if (type == "number") {
                    app.send({ api: "admin", mt: "UpdateMessage", id: button.id, name: String(iptName.getValue()), user: String(""), value: String(iptValue.getValue()), sip: String(user), type: String(type), device: device });
                    //waitConnection(t1);
                }
            });
            //Botão Cancelar   
            t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:75%; font-size:15px; text-align:center", null, "button-inn-del")).addTranslation(texts, "btnCancel").addEvent("click", function () {
                makeTableButtons(t1);
            });

        }
        function addUserParamters(t) {
            //Usuário
            t.clear();
            t.add(new innovaphone.ui1.Div(null, texts.text("labelUser"), "labelUserUsers"));
            var iptUser = t.add(new innovaphone.ui1.Node("select", null, null, "iptUserUsers"));
            iptUser.setAttribute("id", "selectUser");
            list_users.forEach(function (user) {
                iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.cn, null).setAttribute("id", user.sip));
            })
            //Atualiza valores
            if (button && button.button_user != "all") {
                var cn = list_users.filter(function (user) { return user.sip === button.button_user })[0].cn;
                var select = document.getElementById('selectUser');
                select.value = cn;
            } else if (button && button.button_user == "all") {
                var select = document.getElementById('selectUser');
                select.value = "TODOS";
            }
            //var iptUser = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
            //Nome Botão
            var divAdd5 = t.add(new innovaphone.ui1.Div(null, null, "divAdd5"))
            var iptName = divAdd5.add(new innovaphone.ui1.Input(null, button.button_name, null, 255, "text", "iptNameUsers"));
            divAdd5.add(new innovaphone.ui1.Div(null, texts.text("labelButtonName"), "labelBtnUsers"));
            //Nome Usuário
            //var labelUserName = t.add(new innovaphone.ui1.Div("position:absolute; display:block; left:0%; width:15%; top:30%; font-size:15px; text-align:right", texts.text("labelUserName")));
            //var iptUserName = t.add(new innovaphone.ui1.Input("position:absolute; display:block; left:16%; width:30%; top:30%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));

            //Parâmetro
            t.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueUsers"));
            //var iptValue = t.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:25%; font-size:12px; text-align:center", null, texts.text("iptText"), 500, "url", null));

            var iptValue = t.add(new innovaphone.ui1.Node("select", null, null, "selectValueUsers"));
            iptValue.setAttribute("id", "selectValue");
            list_users.forEach(function (user) {
                iptValue.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.cn, null).setAttribute("id", user.sip));
            });
            if (button.button_type == "user") {
                var cn = list_users.filter(function (user) { return user.sip === button.button_prt })[0].cn;
                var select = document.getElementById('selectValue');
                select.value = cn;
            }

            //Device
            t.add(new innovaphone.ui1.Div(null, texts.text("device"), "labelDeviceNumber"));
            var iptDevice = t.add(new innovaphone.ui1.Node("select", "width:28%;margin-left:2%;", null, "iptDeviceNumber"));
            iptDevice.setAttribute("id", "selectDevice");
            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "", null).setAttribute("id", ""));

            //era só copiar o código do evento e colar fora do event listner assim o iptdevice é preeenchido ao carregar a div//
            try {
                var devices;
                list_users.forEach(function (user) {
                    if (user.sip == button.button_user) {
                        devices = user.devices;
                        devices.forEach(function (dev) {
                            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
                        })
                    }
                })

                //fazer selecionar o device que estava pré cadastrado no botão, é só fitrar os devices pelo hw que está no button_device e então usar o text para alterar o value//
                if (button.button_type == "user") {
                    var text = devices.filter(function (dev) { return dev.hw === button.button_device })[0].text;
                    var select = document.getElementById('selectDevice');
                    select.value = text;
                }

            } catch (e) {

            }
            document.getElementById("selectUser").addEventListener("change", function (e) {
                console.log(e.target.value);
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var sip = selectedOption.id;
                iptDevice.clear();
                list_users.forEach(function (user) {
                    if (user.sip == sip) {
                        var devices = user.devices;
                        devices.forEach(function (dev) {
                            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
                        })
                    }
                })
            });


            //Botão Salvar
            t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:75%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
                var type = document.getElementById("selectType");
                var selectedOption = type.options[type.selectedIndex];
                var type = selectedOption.id;
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var user = selectedOption.id;
                var device = document.getElementById("selectDevice");
                var selectedOption = device.options[device.selectedIndex];
                var device = selectedOption.id;

                var value = document.getElementById("selectValue");
                var selectedOption = value.options[value.selectedIndex];
                var value = selectedOption.id;

                if (String(iptName.getValue()) == "" || String(value) == "") {
                    makePopup("Atenção", "Complete todos os campos para que o botão possa ser criado.");
                }
                else {
                    app.send({ api: "admin", mt: "UpdateMessage", id: button.id, name: String(iptName.getValue()), user: String(""), value: String(value), sip: String(user), type: String(type), device: device });
                    //waitConnection(t1);
                }
            });
            //Botão Cancelar   
            t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:75%; font-size:15px; text-align:center", null, "button-inn-del")).addTranslation(texts, "btnCancel").addEvent("click", function () {
                makeTableButtons(t1);
            });
        }
        function addComboParamters(t) {
            //Usuário
            t.clear();
            t.add(new innovaphone.ui1.Div(null, texts.text("labelUser"), "labelUserCombo"));
            var iptUser = t.add(new innovaphone.ui1.Node("select", null, null, "iptUserCombo"));
            iptUser.setAttribute("id", "selectUser");
            iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", "none"));
            //iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "TODOS", null).setAttribute("id", "all"));
            list_users.forEach(function (user) {
                iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.cn, null).setAttribute("id", user.sip));
            })
            //Atualiza valores
            if (button && button.button_user != "all") {
                var cn = list_users.filter(function (user) { return user.sip === button.button_user })[0].cn;
                var select = document.getElementById('selectUser');
                select.value = cn;
            } else if (button && button.button_user == "all") {
                var select = document.getElementById('selectUser');
                select.value = "TODOS";
            }
            //var iptUser = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:15%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));
            //Nome Botão
            var divAdd7 = t.add(new innovaphone.ui1.Div(null, null, "divAdd7"))
            var iptName = divAdd7.add(new innovaphone.ui1.Input(null, button.button_name, null, 255, "text", "iptNameCombo"));
            divAdd7.add(new innovaphone.ui1.Div(null, texts.text("labelButtonName"), "labelButtonCombo"));

            //Nome Usuário
            //var labelUserName = t.add(new innovaphone.ui1.Div("position:absolute; display:block; left:0%; width:15%; top:30%; font-size:15px; text-align:right", texts.text("labelUserName")));
            //var iptUserName = t.add(new innovaphone.ui1.Input("position:absolute; display:block; left:16%; width:30%; top:30%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));

            //PAREI DAQUI P BAIXO - APAGAR ISSO DEPOIS

            //Parâmetro
            var divAdd8 = t.add(new innovaphone.ui1.Div(null, null, "divAdd8"));
            var iptValue = divAdd8.add(new innovaphone.ui1.Input(null, button.button_prt, null, 500, "text", "iptValueCombo"));
            divAdd8.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueCombo"));


            //// Tipo Botão 1 ////
            t.add(new innovaphone.ui1.Div(null, texts.text("cabecalho6"), "combo1Div"));
            var iptType1 = t.add(new innovaphone.ui1.Node("select", null, null, "combo1"));
            iptType1.setAttribute("id", "selectType1");

            list_buttons.forEach(function (btn) {
                if (btn.button_type != "combo" && btn.button_user == button.button_user || btn.button_user == "all") {
                    iptType1.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", btn.button_name, null).setAttribute("id", btn.id));
                }
            })

            if (button.button_type == "combo" && button.button_type_1 != "") {
                try {
                    var button_name = list_buttons.filter(function (btn) { return btn.id === parseInt(button.button_type_1) })[0].button_name;
                    var select = document.getElementById('selectType1');
                    select.value = button_name;
                } catch (e) {
                    console.warn("Botão 1 Referenciado no Combo já não existe mais! Erro: " + e)
                }

            }

            //// Tipo Botão 2 ////
            t.add(new innovaphone.ui1.Div(null, texts.text("cabecalho7"), "combo2Div"));
            var iptType2 = t.add(new innovaphone.ui1.Node("select", null, null, "combo2"));
            iptType2.setAttribute("id", "selectType2");

            list_buttons.forEach(function (btn) {
                if (btn.button_type != "combo" && btn.button_user == button.button_user || btn.button_user == "all") {
                    iptType2.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", btn.button_name, null).setAttribute("id", btn.id));
                }
            })

            if (button.button_type == "combo" && button.button_type_2 != "") {
                try {
                    var button_name = list_buttons.filter(function (btn) { return btn.id === parseInt(button.button_type_2) })[0].button_name;
                    var select = document.getElementById('selectType2');
                    select.value = button_name;

                } catch (e) {
                    console.warn("Botão 2 Referenciado no Combo já não existe mais! Erro: " + e)
                }
            }

            //// Tipo Botão 3 ////
            t.add(new innovaphone.ui1.Div(null, texts.text("cabecalho8"), "combo3Div"));
            var iptType3 = t.add(new innovaphone.ui1.Node("select", null, null, "combo3"));
            iptType3.setAttribute("id", "selectType3");

            iptType3.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null));
            list_buttons.forEach(function (btn) {
                if (btn.button_type != "combo" && btn.button_user == button.button_user || btn.button_user == "all") {
                    iptType3.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", btn.button_name, null).setAttribute("id", btn.id));
                }
            })

            if (button.button_type == "combo" && button.button_type_3 != "") {
                try {
                    var button_name = list_buttons.filter(function (btn) { return btn.id === parseInt(button.button_type_3) })[0].button_name;
                    var select = document.getElementById('selectType3');
                    select.value = button_name;

                } catch (e) {
                    console.warn("Botão 3 Referenciado no Combo já não existe mais! Erro: " + e)
                }
            }

            //// Tipo Botão 4 ////
            t.add(new innovaphone.ui1.Div(null, texts.text("cabecalho9"), "combo4Div"));
            var iptType4 = t.add(new innovaphone.ui1.Node("select", null, null, "combo4"));
            iptType4.setAttribute("id", "selectType4");
            iptType4.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null));
            list_buttons.forEach(function (btn) {
                if (btn.button_type != "combo" && btn.button_user == button.button_user || btn.button_user == "all") {
                    iptType4.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", btn.button_name, null).setAttribute("id", btn.id));
                }
            })
            if (button.button_type == "combo" && button.button_type_4 != "") {
                try {
                    var button_name = list_buttons.filter(function (btn) { return btn.id === parseInt(button.button_type_4) })[0].button_name;
                    var select = document.getElementById('selectType4');
                    select.value = button_name;

                } catch (e) {
                    console.warn("Botão 4 Referenciado no Combo já não existe mais! Erro: " + e)
                }
            }

            //// Botão Salvar ////
            t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:75%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
                var type = document.getElementById("selectType");
                var selectedOption = type.options[type.selectedIndex];
                var type = selectedOption.id;
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var user = selectedOption.id;
                if (String(iptName.getValue()) == "" || String(type) == "") {
                    makePopup("Atenção", "Complete todos os campos para que o botão possa ser criado.");
                }
                else if (type == "combo") {
                    var type1 = document.getElementById("selectType1");
                    var selectedOption = type1.options[type1.selectedIndex];
                    var type1 = selectedOption.id;

                    var type2 = document.getElementById("selectType2");
                    var selectedOption = type2.options[type2.selectedIndex];
                    var type2 = selectedOption.id;

                    var type3 = document.getElementById("selectType3");
                    var selectedOption = type3.options[type3.selectedIndex];
                    var type3 = selectedOption.id;

                    var type4 = document.getElementById("selectType4");
                    var selectedOption = type4.options[type4.selectedIndex];
                    var type4 = selectedOption.id;
                    app.send({ api: "admin", mt: "InsertComboMessage", name: String(iptName.getValue()), user: String(""), value: String(iptValue.getValue()), sip: String(user), type: String(type), type1: String(type1), type2: String(type2), type3: String(type3), type4: String(type4) });
                    //waitConnection(t1);
                }
            });

            //// Botão Cancelar ////
            t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:75%; font-size:15px; text-align:center", null, "button-inn-del")).addTranslation(texts, "btnCancel").addEvent("click", function () {
                makeTableButtons(t1);
            });


            document.getElementById("selectUser").addEventListener("change", function (e) {
                console.log(e.target.value);
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var user = selectedOption.id;
                iptType1.clear();
                list_buttons.forEach(function (button) {
                    if (button.button_type != "combo" && button.button_user == user || button.button_user == "all") {
                        iptType1.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                    }
                })

                iptType2.clear();
                iptType2.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null));
                list_buttons.forEach(function (button) {
                    if (button.button_type != "combo" && button.button_user == user || button.button_user == "all") {
                        iptType2.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                    }
                })
                iptType3.clear();
                iptType3.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null));
                list_buttons.forEach(function (button) {
                    if (button.button_type != "combo" && button.button_user == user || button.button_user == "all") {
                        iptType3.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                    }
                })
                iptType4.clear();
                iptType4.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null));
                list_buttons.forEach(function (button) {
                    if (button.button_type != "combo" && button.button_user == user || button.button_user == "all") {
                        iptType4.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                    }
                })
            });
        }
    }

    //actions
    function makeActionsDiv(t) {
        return new Promise(function (resolve, reject) {
            try {
                t.clear(); // limpa a coluna direita

                var colDireita = document.getElementById("colDireita")

                var html = `
                    <div class = "mainDivTableAction" style = "width: 100%; ">
                    <div class = "divHeaderTableActions">
                    <div>${texts.text("labelCfgAcctions")}</div>
                    <select id="selectUserModal" class="genericInputs">
                    <option value="">${texts.text("labelSelectUser")}</option>
                    </select>
                    <div id = "btnCreate">${makeButton(texts.text("btnAddAction"), "primary")}</div>
                    </div>
                    <br>
                    <div class = "tableActionDiv" id = "tableActionDiv">
                    <table id = "tableAction" >
                    <thead>
                        <tr>
                        <th class = "thAction">${texts.text("labelID")}</th>
                        <th class = "thAction">${texts.text("labelName")}</th>
                        <th class = "thAction">${texts.text("labelParameter")}</th>
                        <th class = "thAction">${texts.text("labelAlarmCode")}</th>
                        <th class = "thAction">${texts.text("labelValue")}</th>
                        <th class = "thAction">${texts.text("labelAction")}</th>
                        <th class = "thAction">${texts.text("labelUser")}</th>
                        <th class = "thAction"><img src = "./images/star.svg" style = "35px" > </img></th>
                        </tr>
                    </thead>
                    <tbody id = "tbodyAction">
                    </tbody>
                    </table>
                    </div>
                    </div>
                `

                colDireita.innerHTML += html;

                var selectUserModal = document.getElementById("selectUserModal");
                list_users.forEach(function (user) {
                    console.log("user " + user)
                    var option = document.createElement("option");
                    option.value = user.guid;
                    option.id = user.guid
                    option.textContent = user.cn;
                    option.style.fontSize = '12px';
                    option.style.textAlign = "center";
                    option.style.color = "white";
                    selectUserModal.appendChild(option);
                });

                document.getElementById("selectUserModal").addEventListener("change", function (evt) {
                    var user = document.getElementById("selectUserModal");
                    var selectedOption = user.options[user.selectedIndex];
                    var user = selectedOption.id;
                    console.log("Usuário Selecionado" + selectUserModal)
                    makeTableActions(user)


                });

                document.getElementById("btnCreate").addEventListener("click", function (evt) {
                    var user = document.getElementById("selectUserModal");
                    var selectedOption = user.options[user.selectedIndex];
                    var user = selectedOption.id;
                    console.log("Usuário Selecionado" + selectUserModal)
                    makeDivAddAction(colDireita, user)
                })

                //Botões Tabela de Ações
                // t.add(new innovaphone.ui1.Div("position:absolute; left:60%; width:20%; top:10%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnAddAction").addEvent("click", function () {
                //     makeDivAddAction(t);
                // });
                // t.add(new innovaphone.ui1.Div("position:absolute; left:40%; width:20%; top:10%; font-size:12px; text-align:center;", null, "button-inn-del")).addTranslation(texts, "btnDelAction").addEvent("click", function () {
                //     var selected = actionsListView.getSelectedRows();
                //     console.log(selected);

                //     if (selected.length >= 1) {
                //         var selectedrows = [];

                //         selected.forEach(function (s) {
                //             console.log(s);
                //             selectedrows.push(actionsListView.getRowData(s)[0])
                //         })
                //         app.send({ api: "admin", mt: "DeleteActionMessage", id: selectedrows });
                //     } else {
                //         window.alert(texts.text("promptSelectAction"));
                //     }

                // });
                // t.add(new innovaphone.ui1.Div("position:absolute; left:20%; width:20%; top:10%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnEditButton").addEvent("click", function () {
                //     var selected = actionsListView.getSelectedRows();
                //     console.log(selected[0]);
                //     if (selected.length == 1) {
                //         var action = list_actions.filter(function (act) { return act.id === parseInt(actionsListView.getRowData(selected[0])[0]) })[0];
                //         makeDivUpdateAction(t, action)
                //     } else {
                //         window.alert(texts.text("promptSelectAction"));
                //     }


                // });


                // //Título Tabela Ações
                // var labelTituloTabeaAcoes = t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:100%; top:20%; font-size:17px; text-align:center; font-weight: bold", texts.text("labelTituloAcoes")));

                // var scroll_container = new innovaphone.ui1.Node("scroll-container", "position: absolute; left:1%; top:25%; right:1%; width:98%; height:-webkit-fill-available;", null, "scroll-container-table");

                // var list = new innovaphone.ui1.Div(null, null, "table-actions");
                // var columns = 7;
                // var rows = list_actions.length;
                // var actionsListView = new innovaphone.ui1.ListView(list, 50, "headercl", "arrow", false);
                // //Cabeçalho
                // for (i = 0; i < columns; i++) {
                //     actionsListView.addColumn(null, "text", texts.text("cabecalhoAction" + i), i, 10, false);
                // }
                // //Tabela    
                // list_actions.forEach(function (b) {
                //     var row = [];
                //     row.push(b.id);
                //     row.push(b.action_name);

                //     // Substituir valores de b.action_start_type por texto correspondente
                //     switch (b.action_start_type) {
                //         case "alarm":
                //             row.push("Alarme");
                //             break;
                //         case "out-number":
                //             row.push("Número Destino");
                //             break;
                //         case "inc-number":
                //             row.push("Número Origem");
                //             break;
                //         default:
                //             row.push(b.action_start_type);
                //     }
                //     row.push(b.action_alarm_code);


                //     // Substituir valores de b.name por texto correspondente
                //     switch (b.action_type) {
                //         case "video":
                //             row.push("Vídeo");
                //             row.push(b.action_prt);
                //             break;
                //         case "page":
                //             row.push("Página Iframe");
                //             row.push(b.action_prt);
                //             break;
                //         case "alarm":
                //             row.push("Alarme");
                //             row.push(b.action_prt);
                //             break;
                //         case "number":
                //             row.push("Número");
                //             row.push(b.action_prt);
                //             break;
                //         case "popup":
                //             row.push("PopUp Iframe");
                //             row.push(b.action_prt);
                //             break;
                //         case "button":
                //             row.push("Botão");
                //             var button_name = list_buttons.filter(function (btn) { return btn.id === parseInt(b.action_prt) })[0].button_name;
                //             row.push(button_name);
                //             break;
                //         default:
                //             row.push(b.action_type);
                //             row.push(b.action_prt);
                //     }
                //     row.push(b.action_user);
                //     actionsListView.addRow(i, row, "rowaction", "#A0A0A0", "#82CAE2");
                // })
                // scroll_container.add(list);
                // t.add(scroll_container);
                resolve(true)
            }
            catch (e) {
                reject(e)
            }
        })
    }

function makeTableActions(user) {
    var filteredActionsUser = list_actions.filter(function(action) {
        return action.action_user === user;
    });

    if (user != "") {
        document.getElementById("selectUserModal").value = user
    }

    var tbody = document.getElementById("tbodyAction");

    // Limpa o conteúdo atual do tbody
    tbody.innerHTML = '';
    var filteredUserCN = list_users.filter(function(u){
        return u.guid == filteredActionsUser[0].action_user
    })[0]
    console.log("USER CN " + JSON.stringify(filteredUserCN))
    filteredActionsUser.forEach(function(action) {
        var newRow = document.createElement("tr");


        // Preencha as células conforme necessário
        var cells = [
            action.id,
            action.action_name,
            getActionStartTypeText(action.action_start_type),
            action.action_alarm_code,
            getActionTypeText(action.action_type),
            action.action_prt,
            filteredUserCN.cn
        ];

        cells.forEach(function(cellData) {
            var newCell = document.createElement("td");
            newCell.textContent = cellData;
            newCell.classList.add("tdTableAction")
            newRow.appendChild(newCell);
        });

        // Adiciona o ícone de lixeira
        var deleteIconCell = document.createElement("td");
        deleteIconCell.innerHTML = `<span class="delete-icon"><img src = "./images/trash.svg"> </img></span>`;
        deleteIconCell.classList.add("tdTableAction", "deleteTrash")
        deleteIconCell.setAttribute("row-id", action.id)
        deleteIconCell.id = "deleteTrash"
        newRow.appendChild(deleteIconCell);
        tbody.appendChild(newRow);
    });
    //var deleteIconCell = document.document.getElementById("deleteTrash")
    //if(deleteIconCell){
    //    deleteIconCell.addEventListener("click",function(evt){
    //        var rowId = this.getAttribute("row-id")
    //        app.send({ api: "admin", mt: "DeleteActionMessage", id: parseInt(rowId) });
    //    })
    //}
    var deleteIconCell = document.querySelectorAll(".deleteTrash")
    for (var i = 0; i < deleteIconCell.length; i++) {
        var botao = deleteIconCell[i];
        // O jeito correto e padronizado de incluir eventos no ECMAScript
        // (Javascript) eh com addEventListener:
        botao.addEventListener("click", function (e) {
            var rowId = this.getAttribute("row-id")
            app.sendSrc({ api: "admin", mt: "DeleteActionMessage", id: parseInt(rowId), guid: user, src: user }, function (obj) {
                list_actions = JSON.parse(obj.result)
                makeActionsDiv(col_direita)
                    .then(function (message) {
                        console.log(message);
                        makeTableActions(obj.guid)
                        makePopup(texts.text("labelWarning"), texts.text("labelDeleteSuccess"))
                    })
                    .catch(function (error) {
                        console.log(error);
                        makePopup(texts.text("labelWarning", error))
                    });
                
            });

        })
    }
}

// Função para substituir valores específicos por texto correspondente
function getActionTypeText(actionType) {
    switch (actionType) {
        case "video":
            return texts.text("video");
        case "page":
            return texts.text("page");
        case "alarm":
            return texts.text("alarm");
        case "number":
            return texts.text("number");
        case "popup":
            return "PopUp Iframe";
        case "button":
            return texts.text("labelButton");
            // var button = list_buttons.find(function(btn) {
            //     return btn.id === parseInt(actionType);
            // });
            // return button ? button.button_name : "";
        default:
            return actionType;
    }
}

function getButtonTypeText(buttonType) {
    switch (buttonType) {
        case "combo":
            return texts.text("labelCombo");
        case "number":
            return texts.text("labelNumber");
        case "alarm":
            return texts.text("labelAlarm");
        case "user":
            return texts.text("labelUser");
        case "sensor":
            return texts.text("labelSensor");
        default:
            return buttonType;
    }
}
    function getActionStartTypeText(startType) {
    switch (startType) {
        case "alarm":
            return texts.text("labelAlarm")
        case "out-number":
            return texts.text("labelDestinationNumber")
        case "inc-number":
            return texts.text("labelOriginNumber")
        case "min-threshold":
            return texts.text("minValue")
        case "max-threshold":
            return texts.text("maxValue")
        default:
            return startType;
    }
}
    function makeDivAddAction(t, user) {
        // t.clear();
        // //Título

        var htmlUser = `
        <html>
            <body>
                <div class="divMainModal" style = "width: 80%; overflow: auto" >
                <h2 class="titleModal">${texts.text("btnAddAction")}</h2>
                    <div class="divSelectAndTextModal">
                        <span class="textGeneric">${texts.text("labelUser2")}</span>
                        <select id="selectUserModal" class="genericInputs">
                            <option value="selectUser" style = "text-align:center">${texts.text("labelSelectUser")}</option>
                        </select>
                    </div> 
                    <div class="divSelectAndTextModalBig">
                    <span class="textGeneric">${texts.text("labelActionName")}</span>
                    <input type="text" class="genericInputs" id= "iptNameAction" placeholder="${texts.text("labelActionName")}">
                    </div> 
                    <div class="divSelectAndTextModalBig">
                        <span class="textGeneric">${texts.text("labelAlarmeOrCall")}</span>
                        <select id="selectTypeTrigger" class="genericInputs">
                            <option value="selectDevice" style = "text-align:center">${texts.text("labelAlarmeOrCall")}</option>
                        </select>
                    </div> 
                    <div class="divSelectAndTextModalBig" id = "divSensorInfos" style = "display:none;" >
                  
                    </div> 
                    <div class="divSelectAndTextModalBig">
                    <span class="textGeneric">${texts.text("labelAlarmCode")}</span>
                    <input type="text" class="genericInputs" id= "iptAlarmAction" placeholder="${texts.text("labelAlarmCode")}">
                    </div> 

                    <div class="divSelectAndTextModalBig">
                    <span class="textGeneric">${texts.text("labelType")}</span>
                    <select id="selectTypeAction" class="genericInputs">
                        <option value="selectDevice" style = "text-align:center">${texts.text("labelSelectTheType")}</option>
                    </select>
                     </div> 

                    <div class="divSelectAndTextModalBig">
                    <span class="textGeneric">${texts.text("labelValue")}</span>
                    <input type="text" class="genericInputs" id= "iptValueAction" placeholder="${texts.text("labelValue")}">
                    </div>  
                    <div class="divSelectAndTextModalBig" id = "divDevice">
                  
                     </div> 
                    <div class="divButtonsGeneric">
                        <div id = "btnCancel">${makeButton(texts.text("btnCancel"),"tertiary")}</div>
                        <div id = "btnSave">${makeButton(texts.text("btnAddButton"),"primary")}</div>
                    </div> 
                </div>
            </body>
        </html>
    `;
    
    t.innerHTML = ''
    t.innerHTML += htmlUser

        var selectUserModal = document.getElementById("selectUserModal");
        list_users.forEach(function(user) {
            var option = document.createElement("option");
            option.value = user.guid; 
            option.id = user.guid
            option.textContent = user.cn; 
            option.style.fontSize = '12px';
            option.style.textAlign = "center";
            option.style.color = "white";
            selectUserModal.appendChild(option);
        });

        selectUserModal.addEventListener("change", function () {

            var selectedGuid = selectUserModal.options[selectUserModal.selectedIndex];
            var guidUser = selectedGuid.id;

            var selectedOption = selectTypeAction.options[selectTypeAction.selectedIndex];
            var type = selectedOption.id;

            if (type == "number") {
                list_users.forEach(function (user) {
                    if (user.guid == guidUser) {
                        var devices = user.devices;

                        var selectDevices = document.getElementById("selectDevices");
                        selectDevices.options.length = 1;
                        devices.forEach(function (dev){
                            var option = document.createElement("option");
                            option.value = dev.hw
                            option.id = dev.hw
                            option.textContent = dev.text
                            option.style.fontSize = '12px';
                            option.style.textAlign = "center";
                            option.style.color = "white";
                            selectDevices.appendChild(option);
                        })
                        
                    }
                })
                console.log("Lista de Devices atualizada para o novo usuário selecionado!")
            }

        })

        if (user!="") {
            selectUserModal.value = user
        }

        var  selectTypeTrigger = document.getElementById("selectTypeTrigger");
        list_start_types.forEach(function(act) {
            var option = document.createElement("option");
            option.value = act.id
            option.id = act.id
            option.textContent = act.typeName
            option.style.fontSize = '12px';
            option.style.textAlign = "center";
            option.style.color = "white";
            selectTypeTrigger.appendChild(option);
        });
          
        var  selectTypeAction = document.getElementById("selectTypeAction");
        list_act_types.forEach(function(act) {
            var option = document.createElement("option");
            option.value = act.id
            option.id = act.id
            option.textContent = act.typeName
            option.style.fontSize = '12px';
            option.style.textAlign = "center";
            option.style.color = "white";
            selectTypeAction.appendChild(option);
        });

        document.getElementById("btnCancel").addEventListener("click",function(){
            makeActionsDiv(col_direita)
        })

        selectTypeAction.addEventListener("change",function(){
            
            var selectedGuid = selectUserModal.options[selectUserModal.selectedIndex];
            var guidUser = selectedGuid.id;

            var selectedOption = selectTypeAction.options[selectTypeAction.selectedIndex];
            var type = selectedOption.id;

            if(type == "number"){
                list_users.forEach(function (user) {
                    if (user.guid == guidUser) {
                        var devices = user.devices;

                        var divDevice = document.getElementById("divDevice");
                        divDevice.innerHTML = ''
                        divDevice.innerHTML += `
                        <span class="textGeneric">${texts.text("labelDevice")}</span>
                        <select id="selectDevices" class="genericInputs">
                            <option value="selectDevice" style = "text-align:center">${texts.text("labelDevice")}</option>
                        </select>
                        `

                        devices.forEach(function (dev) {
                          
                            var selectDevices = document.getElementById("selectDevices")
                            var option = document.createElement("option");
                            option.value = dev.hw
                            option.id = dev.hw
                            option.textContent = dev.text
                            option.style.fontSize = '12px';
                            option.style.textAlign = "center";
                            option.style.color = "white";
                            selectDevices.appendChild(option);
                        })
                    }
                })
            }
            if(type == "button"){

                var divDevice = document.getElementById("divDevice");
                divDevice.innerHTML = ''
                divDevice.innerHTML += `
                <span class="textGeneric">${texts.text("labelValue")}</span>
                <select id="selectDevices" class="genericInputs">
                    <option value="selectDevice" style = "text-align:center">${texts.text("labelValue")}</option>
                </select>
                `
                list_buttons.forEach(function(button){
                    if (button.button_type != "combo" && button.button_user == guidUser || button.button_user == "all") {
                        var selectDevices = document.getElementById("selectDevices")
                        var option = document.createElement("option");
                        option.value = button.id
                        option.id = button.id
                        option.textContent = button.button_name
                        option.style.fontSize = '12px';
                        option.style.textAlign = "center";
                        option.style.color = "white";
                        selectDevices.appendChild(option);
                    }
                })
                
            }
            if(type == "alarm"){
                var divDevice = document.getElementById("divDevice");
                divDevice.innerHTML = ''
            }

            
            })

        selectTypeTrigger.addEventListener("change",function(){
            var selectedGuid = selectUserModal.options[selectUserModal.selectedIndex];
            var guidUser = selectedGuid.id;

            var selectedOptionTrigger = selectTypeTrigger.options[selectTypeTrigger.selectedIndex];
            var typeTrigger = selectedOptionTrigger.id;

            if(typeTrigger === "min-threshold" || typeTrigger === "max-threshold"){
                var divSensorInfos = document.getElementById("divSensorInfos");
                divSensorInfos.style.display = 'block';
                divSensorInfos.innerHTML = ''
                divSensorInfos.innerHTML += `
                <div class="divSelectAndTextModalBig">
                    <span class="textGeneric">${texts.text("labelSensorName")}</span>
                    <input type="text" class="genericInputs" id= "iptSensorName" placeholder="${texts.text("labelSensorName")}">
                </div> 
                <div class="divSelectAndTextModalBig">
                    <span class="textGeneric">${texts.text("labelSensorType")}</span>
                    <select id="selectTypeSensor" class="genericInputs">
                        <option value="selectSensorType" style = "text-align:center">${texts.text("labelSensorType")}</option>
                    </select>
                 </div> 
                `
                const selectTypeSensor = document.getElementById("selectTypeSensor")
                list_sensor_types.forEach(function (s) {
                    var opts = document.createElement("option")
                    opts.textContent =  texts.text(s.id)
                    opts.id = s.id;
                    opts.style.fontSize = '12px';
                    opts.style.textAlign = "center";
                    opts.style.color = "white";
                    selectTypeSensor.appendChild(opts)
                });
            }else{
                var divSensorInfos = document.getElementById("divSensorInfos");
                divSensorInfos.style.display = 'none'
            }
            })

        

        document.getElementById("btnSave").addEventListener("click",function(){
            const iptName = document.getElementById("iptNameAction").value;
            const iptAlarmAction = document.getElementById("iptAlarmAction").value;
            const iptValueAction = document.getElementById("iptValueAction").value;
            

            //trygger type
            const selectTypeTrigger = document.getElementById("selectTypeTrigger");
            const typetriggerOpt = selectTypeTrigger.options[selectTypeTrigger.selectedIndex];
            const typeTriggerValue = typetriggerOpt.id;

            //user
            const selectUserModal = document.getElementById("selectUserModal")
            var selectedGuid = selectUserModal.options[selectUserModal.selectedIndex];
            var guidUser = selectedGuid.id;

            //action type
            const selectTypeAction = document.getElementById("selectTypeAction")
            var selectedOption = selectTypeAction.options[selectTypeAction.selectedIndex];
            const type = selectedOption.id;

            let iptSensorName = ''
            let typeSensor = ''
            if (typeTriggerValue == 'min-threshold' || typeTriggerValue == 'max-threshold') {
                //sensor name
                iptSensorName = document.getElementById("iptSensorName").value;
                //sensor type
                const selectTypeSensor = document.getElementById("selectTypeSensor")
                var selectTypeSensorOpt = selectTypeSensor.options[selectTypeSensor.selectedIndex];
                typeSensor = selectTypeSensorOpt.id;
            }

            let device = ''
            if (type == 'number') {
                //device
                const selectDevices = document.getElementById("selectDevices");
                var optSelectDevices = selectDevices.options[selectDevices.selectedIndex];
                device = optSelectDevices.id;
            }
            

            if (String(iptName) == "" || String(iptAlarmAction) == "") {
                 makePopup("Atenção", "Complete todos os campos para que a Ação possa ser criada.");
            }
            else {
                app.sendSrc({
                    api: "admin", mt: "InsertActionMessageSrc",
                    name: String(iptName),
                    alarm: String(iptAlarmAction),
                    start: String(typeTriggerValue),
                    value: String(iptValueAction),
                    guid: String(guidUser),
                    type: String(type),
                    device: device,
                    sensorType: typeSensor,
                    sensorName: iptSensorName,
                    src: guidUser
                }, function (obj) {
                    list_actions = JSON.parse(obj.result)
                    makeActionsDiv(col_direita).then(function (messsage) {
                        makeTableActions(guidUser);
                        makePopup(texts.text("labelWarning"), texts.text("labelInsertSuccess"));

                    }).catch (function (error) {
                        console.log(error);
                        makePopup(texts.text("labelWarning"), error);
                    });
                });
                
                    
                        // Database.insert("INSERT INTO list_alarm_actions (action_name, action_alarm_code, 
                        // action_start_type, action_prt, action_user, action_type, action_device, action_sensor_type, action_sensor_name) 
                        // VALUES ('" + String(obj.name) + "','" + String(obj.alarm) + "','" + String(obj.start) + "','" + String(obj.value) 
                        // + "','" + String(obj.guid) + "','" + String(obj.type) + "','" 
                        // + String(obj.device) + "','" + String(obj.sensorType) + "','" + String(obj.sensorName)+ "')")
            }

        })
        //     else if (e.target.value == "Botão") {
        //         
        //         list_buttons.forEach(function (button) {
        //             if (button.button_type != "combo" && button.button_user == sip || button.button_user == "all") {
        //                 iptValue.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
        //             }
        //         })
        //         document.getElementById("selectUser").addEventListener("change", function (e) {
        //             console.log(e.target.value);
        //             var user = document.getElementById("selectUser");
        //             var selectedOption = user.options[user.selectedIndex];
        //             var sip = selectedOption.id;

        //             var start = document.getElementById("selectType");
        //             var start = start.options[start.selectedIndex].getAttribute("id");

        //             if (start == "button") {
        //                 //divAddAction4.clear();
        //                 iptValue.clear();
        //                 list_buttons.forEach(function (button) {
        //                     if (button.button_type != "combo" && button.button_user == sip || button.button_user == "all") {
        //                         iptValue.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
        //                     }
        //                 })
        //             }
        //         });
        //     } else {
        //         divDevice.clear();
        //         divAddAction4.clear();
        //         divAddAction4 = t.add(new innovaphone.ui1.Div(null, null, "divAddAction4"));
        //         divAddAction4.add(new innovaphone.ui1.Input(null, null, null, 500, null, "iptValueAction").setAttribute("id", "inputValue"));
        //         divAddAction4.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueAction"));

        //     }
        // });

        // //Botão Salvar
        // t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:75%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
        //     var type = document.getElementById("selectType");
        //     var selectedOption = type.options[type.selectedIndex];
        //     var type = selectedOption.id;
        //     var user = document.getElementById("selectUser");
        //     var selecteduser = user.options[user.selectedIndex];
        //     var user = selecteduser.id;
        //     var start = document.getElementById("selectStartType");
        //     var StartOpt = start.options[start.selectedIndex].getAttribute("id");
        //     //var start = document.getElementById("selectType");
        //     var device;
        //     var value;

        //     if (type == "number") {
        //         device = document.getElementById("selectDevice");
        //         var selectedOption = device.options[device.selectedIndex];
        //         var device = selectedOption.id;
        //     }
        //     if (type == "button") {
        //         value = document.getElementById("selectValue");
        //         var selectedOption = value.options[value.selectedIndex];
        //         value = selectedOption.id;
        //     } else {
        //         value = document.getElementById("inputValue").value;
        //     }

        //     if (String(iptName.getValue()) == "" || String(value) == "" || String(type) == "") {
        //         makePopup("Atenção", "Complete todos os campos para que a Ação possa ser criada.");
        //     }
        //     else {
        //         app.send({ api: "admin", mt: "InsertActionMessage", name: String(iptName.getValue()), alarm: String(iptAlarmCode.getValue()), start: String(StartOpt), value: String(value), guid: String(user), type: String(type), device: device });
        //         makeTableActions(t);
        //     }
        // });
        // //Botão Cancelar   
        // t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:75%; color:var(--div-DelBtn); font-size:15px; text-align:center", null, "button-inn-del")).addTranslation(texts, "btnCancel").addEvent("click", function () {
        //     makeTableActions(t);
        // });


    }

    function makeDivUpdateAction(t, action) {
        t.clear();
        //Título
        t.add(new innovaphone.ui1.Div(null, texts.text("labelTituloEdit"), "tituloAdd"));

        //Usuário
        t.add(new innovaphone.ui1.Div(null, texts.text("labelUser"), "labelUser"));
        var iptUser = t.add(new innovaphone.ui1.Node("select", null, null, "selectUserAction"));
        iptUser.setAttribute("id", "selectUser");
        list_users.forEach(function (user) {
            iptUser.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", user.cn, null).setAttribute("id", user.sip));
        })
        if (action) {
            var cn = list_users.filter(function (user) { return user.sip === action.action_user })[0].cn;
            var select = document.getElementById('selectUser');
            select.value = cn;
        }
        //var iptUser = that.add(new innovaphone.ui1.Input("position:absolute; left:16%; width:30%; top:10%; font-size:12px; text-align:center", null, texts.text("iptText"), 255, "url", null));

        //Nome
        var divAddAction = t.add(new innovaphone.ui1.Div(null, null, "divAddAction"))
        var iptName = divAddAction.add(new innovaphone.ui1.Input(null, action.action_name, null, 255, "text", "iptNameAction"));
        divAddAction.add(new innovaphone.ui1.Div(null, texts.text("labelName"), "labelNameAction"));

        //Tipo Gatilho
        //var divAddAction5 = t.add(new innovaphone.ui1.Div(null,null,"divAddAction5")) desnecessário
        t.add(new innovaphone.ui1.Div(" border-bottom: 2px solid #02163F;", texts.text("labelAlarmeOrCall"), "labelTypeAction"));
        var selectAlarmOrNumber = t.add(new innovaphone.ui1.Node("select", null, "Escolher...", "selectAlarmOrCall").setAttribute("id", "selectStartType"));
        list_start_types.forEach(function (act) {
            selectAlarmOrNumber.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", act.typeName, null).setAttribute("id", act.id));
        })
        if (action) {
            var type = list_start_types.filter(function (type) { return type.id === action.action_start_type })[0].typeName;
            var select = document.getElementById('selectStartType');
            select.value = type;
        }

        //Código Alarme
        var divAddAction2 = t.add(new innovaphone.ui1.Div(null, null, "divAddAction2"));
        var iptAlarmCode = divAddAction2.add(new innovaphone.ui1.Input(null, action.action_alarm_code, null, 255, "text", "iptAlarmAction"));
        divAddAction2.add(new innovaphone.ui1.Div(null, texts.text("labelAlarmCode"), "labelNameAlarm"));

        //Tipo
        t.add(new innovaphone.ui1.Div(null, texts.text("labelType"), "labelAction"));
        var iptType = t.add(new innovaphone.ui1.Node("select", null, null, "selectTypeAction"));
        iptType.setAttribute("id", "selectType");

        list_act_types.forEach(function (act) {
            iptType.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", act.typeName, null).setAttribute("id", act.id));
        })

        if (action) {
            var type = list_act_types.filter(function (type) { return type.id === action.action_type })[0].typeName;
            var select = document.getElementById('selectType');
            select.value = type;
        }

        //Valor
        var divAddAction4 = t.add(new innovaphone.ui1.Div(null, null, "divAddAction4"));

        //Device
        var divDevice = t.add(new innovaphone.ui1.Div(null, null, "divAddAction5"));

        //Usa o TIPO da ação para preencher os campos
        if (action.action_type == "button") {
            divDevice.clear();
            divAddAction4.clear();
            divAddAction4.add(new innovaphone.ui1.Div("width: 60%; font-size: 15px; text-align: left; border-bottom: 2px solid #02163F;", texts.text("labelValue"), "labelValueAction"));
            var iptValue = divAddAction4.add(new innovaphone.ui1.Node("select", null, null, "selectValueAction").setAttribute("id", "selectValue"));
            //iptValue.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", ""));

            var user = document.getElementById("selectUser");
            var selectedOption = user.options[user.selectedIndex];
            var sip = selectedOption.id;
            list_buttons.forEach(function (button) {
                if (button.button_type != "combo" && button.button_user == sip || button.button_user == "all") {
                    iptValue.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                }
            })
            if (action) {
                var button_name = list_buttons.filter(function (btn) { return btn.id === parseInt(action.action_prt) })[0].button_name;
                var select = document.getElementById('selectValue');
                select.value = button_name;
            }
            document.getElementById("selectUser").addEventListener("change", function (e) {
                console.log(e.target.value);
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var sip = selectedOption.id;
                iptValue.clear();
                list_buttons.forEach(function (button) {
                    if (button.button_type != "combo" && button.button_user == sip || button.button_user == "all") {
                        iptValue.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                    }
                })
            });

        }
        else if (action.action_type == "number") {
            //Parametro
            divAddAction4.clear();
            divAddAction4.add(new innovaphone.ui1.Input(null, action.action_prt, null, 500, "text", "iptValueAction").setAttribute("id", "inputValue"));
            divAddAction4.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueAction"));

            //Device
            divDevice.add(new innovaphone.ui1.Div(null, texts.text("device"), "labelDeviceNumberAction"));
            var iptDevice = divDevice.add(new innovaphone.ui1.Node("select", null, null, "iptDeviceNumberAction").setAttribute("id", "selectDevice"));
            //iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", ""));

            var user = document.getElementById("selectUser");
            var selectedOption = user.options[user.selectedIndex];
            var sip = selectedOption.id;
            iptDevice.clear();
            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", ""));
            list_users.forEach(function (user) {
                if (user.sip == sip) {
                    var devices = user.devices;
                    devices.forEach(function (dev) {
                        iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
                    })
                }
            })
            if (action) {
                try {
                    var devices;
                    list_users.forEach(function (user) {
                        if (user.sip == action.action_user) {
                            devices = user.devices;
                            devices.forEach(function (dev) {
                                iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
                            })
                        }
                    })
                    //fazer selecionar o device que estava pré cadastrado no botão, é só fitrar os devices pelo hw que está no button_device e então usar o text para alterar o value//
                    var text = devices.filter(function (dev) { return dev.hw === action.action_device })[0].text;
                    var select = document.getElementById('selectDevice');
                    select.value = text;

                } catch (e) {
                    console.warn("Device não está mais disponível para esse usuário");
                }
            }

            document.getElementById("selectUser").addEventListener("change", function (e) {
                console.log(e.target.value);
                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var sip = selectedOption.id;
                iptDevice.clear();
                list_users.forEach(function (user) {
                    if (user.sip == sip) {
                        var devices = user.devices;
                        devices.forEach(function (dev) {
                            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
                        })
                    }
                })
            });
        }
        else {
            divAddAction4 = t.add(new innovaphone.ui1.Div(null, null, "divAddAction4"));
            var iptValue = divAddAction4.add(new innovaphone.ui1.Input(null, action.action_prt, null, 500, "text", "iptValueAction").setAttribute("id", "inputValue"));
            divAddAction4.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueAction"));
        }


        //Trata evento de Alteração de TIPO
        document.getElementById("selectType").addEventListener("change", function (e) {
            console.log(e.target.value);
            if (e.target.value == "Botão") {
                divDevice.clear();
                divAddAction4.clear();
                divAddAction4.add(new innovaphone.ui1.Div("width: 60%; font-size: 15px; text-align: left; border-bottom: 2px solid #02163F;", texts.text("labelValue"), "labelValueAction"));
                var iptValue = divAddAction4.add(new innovaphone.ui1.Node("select", null, null, "selectValueAction").setAttribute("id", "selectValue"));
                //iptValue.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", ""));

                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var sip = selectedOption.id;
                list_buttons.forEach(function (button) {
                    if (button.button_type != "combo" && button.button_user == sip || button.button_user == "all") {
                        iptValue.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                    }
                })
                if (action) {
                    var button_name = list_buttons.filter(function (btn) { return btn.id === parseInt(action.action_prt) })[0].button_name;
                    var select = document.getElementById('selectValue');
                    select.value = button_name;
                }
                document.getElementById("selectUser").addEventListener("change", function (e) {
                    console.log(e.target.value);
                    var user = document.getElementById("selectUser");
                    var selectedOption = user.options[user.selectedIndex];
                    var sip = selectedOption.id;

                    var start = document.getElementById("selectType");
                    var start = start.options[start.selectedIndex].getAttribute("id");

                    if (start == "button") {
                        iptValue.clear();
                        list_buttons.forEach(function (button) {
                            if (button.button_type != "combo" && button.button_user == sip || button.button_user == "all") {
                                iptValue.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", button.button_name, null).setAttribute("id", button.id));
                            }
                        })
                    }
                });

            }
            else if (e.target.value == "Número") {
                //Parametro
                divAddAction4.clear();
                divAddAction4.add(new innovaphone.ui1.Input(null, action.action_prt, null, 500, "text", "iptValueAction").setAttribute("id", "inputValue"));
                divAddAction4.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueAction"));

                //Device
                divDevice.add(new innovaphone.ui1.Div(null, texts.text("device"), "labelDeviceNumberAction"));
                var iptDevice = divDevice.add(new innovaphone.ui1.Node("select", null, null, "iptDeviceNumberAction").setAttribute("id", "selectDevice"));
                //iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", ""));

                var user = document.getElementById("selectUser");
                var selectedOption = user.options[user.selectedIndex];
                var sip = selectedOption.id;
                iptDevice.clear();
                iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", null, null).setAttribute("id", ""));
                list_users.forEach(function (user) {
                    if (user.sip == sip) {
                        var devices = user.devices;
                        devices.forEach(function (dev) {
                            iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
                        })
                    }
                })

                document.getElementById("selectUser").addEventListener("change", function (e) {
                    console.log(e.target.value);
                    var user = document.getElementById("selectUser");
                    var selectedOption = user.options[user.selectedIndex];
                    var sip = selectedOption.id;
                    var start = document.getElementById("selectType");
                    var start = start.options[start.selectedIndex].getAttribute("id");

                    if (start == "number") {
                        iptDevice.clear();
                        list_users.forEach(function (user) {
                            if (user.sip == sip) {
                                var devices = user.devices;
                                devices.forEach(function (dev) {
                                    iptDevice.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", dev.text, null).setAttribute("id", dev.hw));
                                })
                            }
                        })
                    }
                });
            }
            else {
                divDevice.clear();
                divAddAction4.clear();
                divAddAction4 = t.add(new innovaphone.ui1.Div(null, null, "divAddAction4"));
                divAddAction4.add(new innovaphone.ui1.Input(null, action.action_prt, null, 500, "text", "iptValueAction").setAttribute("id", "inputValue"));
                divAddAction4.add(new innovaphone.ui1.Div(null, texts.text("labelValue"), "labelValueAction"));
            }
        });

        //Botão Salvar
        t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:75%; font-size:15px; text-align:center", null, "button-inn")).addTranslation(texts, "btnSave").addEvent("click", function () {
            var type = document.getElementById("selectType");
            var selectedOption = type.options[type.selectedIndex];
            var type = selectedOption.id;
            var user = document.getElementById("selectUser");
            var selecteduser = user.options[user.selectedIndex];
            var user = selecteduser.id;
            var start = document.getElementById("selectStartType");
            var StartOpt = start.options[start.selectedIndex].getAttribute("id");
            //var start = document.getElementById("selectType");
            var device;
            var value;

            if (type == "number") {
                device = document.getElementById("selectDevice");
                var selectedOption = device.options[device.selectedIndex];
                var device = selectedOption.id;
            }
            if (type == "button") {
                value = document.getElementById("selectValue");
                var selectedOption = value.options[value.selectedIndex];
                value = selectedOption.id;
            } else {
                value = document.getElementById("inputValue").value;
            }
            if (String(iptName.getValue()) == "" || String(value) == "" || String(type) == "") {
                makePopup("Atenção", "Complete todos os campos para que a Ação possa ser criada.");
            }
            else {
                app.send({ api: "admin", mt: "UpdateActionMessage", id: parseInt(action.id), name: String(iptName.getValue()), alarm: String(iptAlarmCode.getValue()), start: String(StartOpt), value: String(value), sip: String(user), type: String(type), device: device });
                makeTableActions(t);
            }
        });
        //Botão Cancelar   
        t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:75%; color:var(--div-DelBtn); font-size:15px; text-align:center", null, "button-inn-del")).addTranslation(texts, "btnCancel").addEvent("click", function () {
            makeTableActions(t);
        });

    }

    //general
    function makeDivAdmin(t) {
        t.clear();
        //Título
        t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:10%; font-size:25px; text-align:center", texts.text("labelTituloAdmin")));

        // chekbox
        t.add(new innovaphone.ui1.Div(null, texts.text("labelServerEnable"), "labelServerEnable"));
        var inputptServerEnable = t.add(new innovaphone.ui1.Input(null, null, null, null, "checkbox", "iptServerEnable"));
        inputptServerEnable.setAttribute("id", "iptServerEnable")
        inputptServerEnable.setValue(iptServerEnable);
        // url
        t.add(new innovaphone.ui1.Div(null, texts.text("labelURL"), "labelUrl"));
        var inputUrl = t.add(new innovaphone.ui1.Input(null, null, texts.text("urlText"), 255, "url", "iptUrl"));
        inputUrl.setAttribute("id", "inputUrl")
        inputUrl.setValue(iptUrl);
        // metodo
        t.add(new innovaphone.ui1.Div(null, texts.text("labelMethod"), "labelMethod"));
        var inputMethod = t.add(new innovaphone.ui1.Input(null, null, texts.text("urlText"), 10, "text", "inputMethod"));
        inputMethod.setAttribute("id", "inputMethod")
        inputMethod.setValue(iptMethod);
        // chave google
        t.add(new innovaphone.ui1.Div(null, texts.text("labelGoogleKey"), "labelGoogleKey"));
        var iptGoogleKey = t.add(new innovaphone.ui1.Input(null, null, texts.text("urlText"), 255, "url", "iptGoogleKey"));
        iptGoogleKey.setAttribute("id", "inputGoogle")
        iptGoogleKey.setValue(googlekey);

        t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:30%; top:75%; font-size:12px; text-align:center", null, "button-inn")).addTranslation(texts, "btnUpdate").addEvent("click", function () {
            app.send({ api: "admin", mt: "UpdateConfig", prt: "googlekey", vl: String(iptGoogleKey.getValue()) });
            app.send({ api: "admin", mt: "UpdateConfig", prt: "urlalert", vl: String(inputUrl.getValue()), method: inputMethod.getValue(), urlenable: inputptServerEnable.getValue() });
            //iptUrl = String(iptGoogleKey.getValue());
        });

    }
    function makeDivClearDB(t) {
        t.clear();
        //Título
        var colDireita = document.getElementById("colDireita")

        var htmlReport = `
        <html>
            <body>
                <div class="divMainModal" style = "width: 80%;">
                <h2 class="titleModal">${texts.text("labelTituloClearDB")}</h2>
                    <div class="divSelectAndTextModalBig">
                        <span class="textGeneric">${texts.text("labelSelectDate")}</span>
                        <input type="date" style="width: 200px; align-items:center; justify-content:center;" class="genericInputs" id= "iptDate" placeholder="${texts.text("labelButtonName")}">
                    </div>
                    <div class="divSelectAndTextModalBig">
                        <span class="textGeneric">${texts.text("labelSelectTheType")}</span>
                        <select id="selectReport" class="genericInputs">
                            <option value="selectDevice" style = "text-align:center">${texts.text("labelSelectTheType")}</option>
                            <option value="RptCalls" style = "text-align:center">${texts.text("labelRptCalls")}</option>
                            <option value="RptActivities" style = "text-align:center">${texts.text("labelRptActivities")}</option>
                            <option value="RptAvailability" style = "text-align:center">${texts.text("labelRptAvailability")}</option>
                            <option value="RptMessages" style = "text-align:center">${texts.text("labelRptMessages")}</option>
                            <option value="RptSensorHistory" style = "text-align:center">${texts.text("labelRptSensorHistory")}</option>
                        </select>
                    </div> 
                    <div class="divButtonsGeneric">
                        <div id = "btnSave">${makeButton(texts.text("btnOk"),"primary")}</div>
                    </div> 
                </div>
            </body>
        </html>
    `;
        colDireita.innerHTML += htmlReport

        var googleForm = `
        <html>
            <body>
                <div class="divMainModal" style = "width: 80%;">
                <h2 class="titleModal">${texts.text("labelGoogleKey")}</h2>
                    <div class="divSelectAndTextModalBig">
                        <span class="textGeneric">${texts.text("labelGoogleKey")}</span>
                        <input type="text" style="align-items:center; justify-content:center;" class="genericInputs" id= "iptGoogleKey" placeholder="${texts.text("labelGoogleKey")}" value=${googlekey}>
                    </div>
                    <div class="divButtonsGeneric">
                        <div id = "btnSaveGoogleKey">${makeButton(texts.text("btnOk"), "primary")}</div>
                    </div> 
                </div>
            </body>
        </html>
    `;
        colDireita.innerHTML += googleForm

        document.getElementById("btnSave").addEventListener("click",function(){
            const iptDate = document.getElementById("iptDate").value;
            var report = document.getElementById("selectReport");
            var selectedOption = report.options[report.selectedIndex];
            var report = selectedOption.value;

            if(iptDate == ""){
                makePopup(texts.text("labelWarning"), texts.text("labelFillDate"))
            }else{
                app.send({ api: "admin", mt: "DeleteFromReports", src: report, to: iptDate });
            }
        })

        document.getElementById("btnSaveGoogleKey").addEventListener("click", function () {
            const iptGoogleKey = document.getElementById("iptGoogleKey").value;

            if (iptGoogleKey == "") {
                makePopup(texts.text("labelWarning"), texts.text("labelFillGoogleKey"))
            } else {
                app.send({ api: "admin", mt: "UpdateConfig", prt: "googlekey", vl: iptGoogleKey });
            }
        })

        var inputDate = document.getElementById('iptDate');
        inputDate.addEventListener('focus', function() {
            // Abrir o calendário ao focar no input
            this.type = 'text';
            this.type = 'date';
        });

    }
    function makeDivLicense(t) {
        t.clear();
        var divMain = document.getElementById("colDireita")
        var htmlUser = `
        <html>
            <body>
                <div class="divMainModal">
                <h2 class="titleModal">${texts.text("labelTituloLicense")}</h2>
                    <div class="divSelectAndTextModalBig">
                        <span class="textGeneric">${texts.text("lblLicenseToken")}</span>
                        <div>${licenseToken}</div>
                    </div>
                    <div class="divSelectAndTextModalBig">
                        <span class="textGeneric">${texts.text("labelLicenseFile")}</span>
                        <input type="text" class="genericInputs" id= "InputLicenseFile" value = "${licenseFile}" placeholder="${texts.text("labelLicenseFile")}">   
                    </div> 
                    <div class="divSelectAndTextModalBig">
                        <span class="textGeneric">${texts.text("labelLicenseActive")}</span>
                        <div>${licenseActive}</div>
                    </div> 
                    <div class="divSelectAndTextModalBig">
                    <span class="textGeneric">${texts.text("labelLicenseInstallDate")}</span>
                    <div>${licenseInstallDate}</div>
                     </div> 
                     <div class="divSelectAndTextModalBig">
                     <span class="textGeneric">${texts.text("labelLicenseUsed")}</span>
                     <div>${String(licenseUsed)}</div>
                      </div> 
                    <div class="divButtonsGeneric">
                        <div id = "btnSave">${makeButton(texts.text("btnOk"),"primary")}</div>
                    </div> 
                </div>
            </body>
        </html>
    `;
    
    divMain.innerHTML = ''
    divMain.innerHTML += htmlUser
        
        //Título
        document.getElementById("btnSave").addEventListener("click",function(){
            licenseFile = document.getElementById("InputLicenseFile").value;
            if (licenseFile.length > 0) {
                app.send({ api: "admin", mt: "UpdateConfigLicenseMessage", licenseToken: licenseToken, licenseFile: licenseFile });
                waitConnection(t);
            } else {
                window.alert("A chave de licenÃƒÂ§a precisa ser informada!");
            }
        })
    }
    function constructor() {
        that.clear();

        var colEsquerda = that.add(new innovaphone.ui1.Div(null, null, "colunaesquerda"));
        // col direita
        var _colDireita = that.add(new innovaphone.ui1.Div(null, null, "colunadireitaadmin"));
        _colDireita.setAttribute('id',"colDireita") 
        // col Esquerda
        var logoEmergencyS = colEsquerda.add(new innovaphone.ui1.Node("img","margin: 5px",null,null))
        logoEmergencyS.setAttribute("src","./images/EmergencyS-logo.svg")
        var configs = colEsquerda.add(new innovaphone.ui1.Div(null, null, "divConfigs"));
        
        menu_adm.forEach(function(m){
            var lirelatorios = configs.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
            lirelatorios.setAttribute("id", m.id)
            
            lirelatorios.add(new innovaphone.ui1.Node("a", null, texts.text(m.menu), null))//.setAttribute("id", menu_adm.id));
            lirelatorios.addEvent('click',function(evt){
                menuAction(evt.currentTarget.id)
                
            })
        })
        function menuAction(id){
            
            switch (id) {
                case "menu_lic":
                    app.send({ api: "admin", mt: "ConfigLicense" });
                    waitConnection(_colDireita);
                break;
                case "menu_btn":
                    app.send({ api: "admin", mt: "SelectMessage" });
                    waitConnection(_colDireita);
                break;
                case "menu_act":
                    app.send({ api: "admin", mt: "SelectActionMessage" });
                    waitConnection(_colDireita);
                break;
                case "menu_rpt":
                    createReportingDiv()
                    
                break;  
                case "menu_srv":
                    //makeDivAdmin(_colDireita)
                    
                break;
                case "menu_opt":
                    makeDivClearDB(_colDireita)
                
                break;    
                default:
                    break;
            }
            col_direita = _colDireita;
        }
        // var a = document.getElementById("menu_lic");
        // a.addEventListener("click", function () {
        //     app.send({ api: "admin", mt: "ConfigLicense" });
        //     waitConnection(_colDireita);
        // })

        // var a = document.getElementById("menu_btn");
        // a.addEventListener("click", function () {
        //     app.send({ api: "admin", mt: "SelectMessage" });
        //     waitConnection(_colDireita)
        // })

        // var a = document.getElementById("menu_act");
        // a.addEventListener("click", function () {
        //     app.send({ api: "admin", mt: "SelectActionMessage" });
        //     waitConnection(_colDireita)
        // })
        // var a = document.getElementById("menu_rpt");
        // a.addEventListener("click", function () { makeDivReports(_colDireita) })

        // var a = document.getElementById("menu_srv");
        // a.addEventListener("click", function () { makeDivAdmin(_colDireita) })

        // var a = document.getElementById("menu_dft");
        // a.addEventListener("click", function () { makeDivClearDB(_colDireita) })
        // colDireita = _colDireita;
    }

    //report pages
    function createReportingDiv(){
        var colDireita = document.getElementById('colDireita')
        colDireita.innerHTML = ""

        var bgReport = document.createElement('div')
        bgReport.classList.add('bgReport')
        bgReport.id = 'bgReport'

        var text = document.createElement('h3')
        text.textContent = 'Filtro de relatório'

        var bgCategory = document.createElement('div')
        bgCategory.classList.add('bgCategory')
        bgCategory.id = 'bgCategory'

        var bgFilter = document.createElement('div')
        bgFilter.classList.add('bgFilter')
        bgFilter.id = 'bgFilter'
        
        var h4Category = document.createElement('h4')
        h4Category.textContent = "Categoria"
        
        bgCategory.appendChild(h4Category)
        
        category.forEach(function(cat){
            var btnCateg = document.createElement('div')
            btnCateg.classList.add('btnCateg')
            btnCateg.id = cat.id
            btnCateg.textContent = cat.menu
            btnCateg.addEventListener('click', function(evt){
                console.log("Categoria clicada", cat.id)
                switch (cat.id) {
                    case "RptAvailability":
                        bgFilter.innerHTML =''
                        usersSelect(bgFilter)
                        dateSelect(bgFilter)
                        buttonsReport(bgFilter, cat.id)
                        break;
                    case "RptCalls":
                        bgFilter.innerHTML =''
                        usersSelect(bgFilter)
                        callnumber(bgFilter)
                        dateSelect(bgFilter)
                        buttonsReport(bgFilter, cat.id)
                        break;
                    case "RptActivities":
                        bgFilter.innerHTML =''
                        usersSelect(bgFilter)
                        dateSelect(bgFilter)
                        buttonsReport(bgFilter, cat.id)
                        break;
                    case "RptSensors":
                        bgFilter.innerHTML =''
                        getSensor(bgFilter)
                        dateSelect(bgFilter)
                        buttonsReport(bgFilter, cat.id)
                        break;
                    case "RptMessages":
                        bgFilter.innerHTML =''
                        usersSelect(bgFilter)
                        dateSelect(bgFilter)
                        buttonsReport(bgFilter, cat.id)
                        break;
                    default:
                        bgFilter.innerHTML = ''
                        var noImplemented = document.createElement('h2')
                        noImplemented.textContent = texts.text('noImplemented')
                        bgFilter.appendChild(noImplemented)
                        break;
                }
                
                category.forEach(function(cat){
                    var catToRemSelec = document.getElementById(cat.id) 
                    catToRemSelec.classList.remove('selectReporting')
                    
                })
    
                btnCateg.classList.add("selectReporting")
    
            })
            bgCategory.appendChild(btnCateg)
        });
    
    
    
        bgReport.appendChild(text)
        
        bgReport.appendChild(bgCategory)
        bgReport.appendChild(bgFilter)
        colDireita.appendChild(bgReport)
                
    }
    function buttonsReport(bgFilter, reportID){
        var bgButtons = document.createElement('div')
        bgButtons.classList.add('bgButtons')
        bgButtons.id = 'bgButtons'
    
        var clearBtn = document.createElement('div')
        clearBtn.classList.add('clearBtn')
        clearBtn.id = 'clearBtn'

        var h4Clear = document.createElement('h4')
        h4Clear.textContent = "Limpar"
        clearBtn.appendChild(h4Clear)

        var confirmBtn = document.createElement('div')
        confirmBtn.classList.add('confirmBtn')
        confirmBtn.id = 'confirmBtn'

        var h4Confirm = document.createElement('h4')
        h4Confirm.textContent = "Filtrar"
        confirmBtn.appendChild(h4Confirm)
    
        confirmBtn.addEventListener('click',function(){
            var selectedUsers = document.querySelectorAll('.userCard')
            var users = []
            var selectedSensors = document.querySelectorAll('.selectSensor')
            var sensors = []
            selectedUsers.forEach(function(evt){
                users.push(evt.id)
            })
            selectedSensors.forEach(function(evt){
                sensors.push(evt.id)
            })
            var firstDate = document.getElementById('firstDate').textContent.replace(' ', 'T')
            var lastDate = document.getElementById('lastDate').textContent.replace(' ', 'T')
            

            var from = convertLocalToUTC(firstDate)
            var to = convertLocalToUTC(lastDate)

            console.log('app.send(report)', reportID)
            console.log('app.send(users)', users)
            console.log('app.send(sensors)', sensors)

            console.log('app.send(from)', from)
            console.log('app.send(to)', to)
    
            switch (reportID) {
                case 'RptSensors':
                    app.send({ api: "admin", mt: "SelectFromReports", sensor: sensors, from: from, to: to, src: reportID });
                    break;
                case 'RptAvailability':
                    app.send({ api: "admin", mt: "SelectFromReports", guid: users, from: from, to: to, src: reportID });
                break;
                case 'RptActivities':
                    //AJUSTAR EVENTS
                    app.send({ api: "admin", mt: "SelectFromReports", guid: users, from: from, to: to, src: reportID });
                break;
                case 'RptCalls':
                    //AJUSTAR CALLS
                    console.log('app.send(sensors)', number)
                    var number = document.getElementById('inputCall').value
                    app.send({ api: "admin", mt: "SelectFromReports", guid: users, number: number, from: from, to: to, src: reportID });
                break;
                case 'RptMessages':
                    //AJUSTAR MENSSAGES
                    app.send({ api: "admin", mt: "SelectFromReports", guid: users, from: from, to: to, src: reportID });
                break;
                case 'RptAll':
                    //AJUSTAR MENSSAGES
                    //app.send({ api: "admin", mt: "SelectFromReports", guid: users, sensor: sensors, number: number, from: from, to: to, src: reportID });
                break;
                default:
                    break;
            }
    
            
            // waitConnection(colDireita)
    
        })
        clearBtn.addEventListener('click',function(){
            document.querySelectorAll('.userCard').forEach(function(evt){
                evt.remove()
            })
            document.getElementById('firstDate').remove()
            document.getElementById('lastDate').remove()
            document.getElementById('infoBox').remove()
            document.getElementById('grafDiv').remove()
            document.querySelectorAll('.selectSensor').forEach(function(evt){
                evt.classList.remove('selectSensor')
            })
        })
        bgButtons.appendChild(clearBtn)
        bgButtons.appendChild(confirmBtn)
        
        bgFilter.appendChild(bgButtons)
    
    }
    function dateSelect(bgFilter){
        var bgDate = document.createElement('div')
        bgDate.classList.add('bgDate')
        bgDate.id = 'bgDate'
    
        var h4Date = document.createElement('h4')
        h4Date.textContent = "Período"
        bgDate.appendChild(h4Date)
    
        var btnDate = document.createElement('div')
        btnDate.classList.add('btnDate')
        btnDate.id = 'btnDate'
        btnDate.textContent = 'Selecione'
        btnDate.addEventListener('click',function(ent){
            console.log('butão clicado Data')
            getDate()
        })
    
        var bgSelectedDate = document.createElement('div')
        bgSelectedDate.classList.add('bgSelectedDate')
        bgSelectedDate.id = 'bgSelectedDate'
        bgDate.appendChild(bgSelectedDate)
        bgDate.appendChild(btnDate)
        bgFilter.appendChild(bgDate)
    
    }
    function usersSelect(bgFilter) {
    
        var bgUser = document.createElement('div')
        bgUser.classList.add('bgUser')
        bgUser.id = 'bgUser'
    
        var userInfo = document.createElement('div')
        userInfo.classList.add('userInfo')
    
        var h4Users = document.createElement('h4');
        h4Users.textContent = "Usuários";
    
        var bgSelect = document.createElement('div')
        bgSelect.classList.add('bgSelect')
    
        var selectUsers = document.createElement('select');
        selectUsers.id = 'selectUsers';
    
        var optUsers = document.createElement('option');
        optUsers.textContent = texts.text('labelSelectUser');
        selectUsers.appendChild(optUsers);
    
        var optAll = document.createElement('option');
        optAll.textContent = texts.text('all');
        //optAll.id = 'allUsers'
        
        selectUsers.appendChild(optAll);
    
        var userSelected = document.createElement('div')
        userSelected.classList.add('userSelected')
        userSelected.id = "userSelected"
        list_users.forEach(function (u) {
            console.log('ERICK LIST USER', u)
            var optUsers = document.createElement('option');
            optUsers.textContent = u.sip;
            optUsers.id = u.guid;
            selectUsers.appendChild(optUsers);
        });
    
        userInfo.appendChild(h4Users);
        userInfo.appendChild(selectUsers);
    
        bgUser.appendChild(userInfo)
        bgUser.appendChild(userSelected)
        selectUsers.addEventListener('change', function (e) {
            var selectedOption = selectUsers.options[selectUsers.selectedIndex];
            var sip = selectedOption.id; // Pegue o valor (ID) do option selecionado
            console.log("ERICK SELECTED USER ID:", sip);
        
            // Verifica se já existe uma div com a classe "userCard" para o usuário selecionado
            var existingUserCards = document.getElementsByClassName('userCard');
            
            // Variável para verificar se o usuário já existe
            var userAlreadyExists = false;
            for (var i = 0; i < existingUserCards.length; i++) {
                existingUserCards[i].classList.remove('tremor');
            }
        
            // Verifica se o usuário já foi selecionado anteriormente
            for (var i = 0; i < existingUserCards.length; i++) {
                
                if (existingUserCards[i].id === sip ) {
                    // Se o usuário já existir, adiciona a classe "tremor" e define a variável userAlreadyExists como true
                    existingUserCards[i].classList.add('tremor');
                    userAlreadyExists = true;
                    break;
                }
    
            }
            if (!userAlreadyExists && sip ) {
    
                var userCard = document.createElement('div');
                userCard.id = sip;
                userCard.classList.add('userCard');
        
                var iconCard = document.createElement('img');
                iconCard.setAttribute('src', "./images/user.svg");
                iconCard.classList.add('iconCard');
        
                var nameCard = document.createElement('div');
                nameCard.textContent = selectedOption.value;
        
                userCard.appendChild(iconCard);
                userCard.appendChild(nameCard);
                userSelected.appendChild(userCard);
        
                // Adiciona um event listener para remover a div ao clicar nela
                userCard.addEventListener('click', function () {
                    userCard.remove();
                });
            }
        });
        
    
        var bgSelectedUsers = document.createElement('div');
        bgSelectedUsers.classList.add('bgSelectedUsers');
        bgSelectedUsers.id = 'bgSelectedUsers';
    
        bgFilter.appendChild(bgUser)
    }
    function callnumber(bgFilter){

        var bgCall = document.createElement('div')
        bgCall.classList.add('bgCall')
    
        var h4Call = document.createElement('h4');
        h4Call.textContent = "Parâmetro";
    
        var inputCall = document.createElement('input')
        inputCall.type = 'text'
        inputCall.classList.add('genericInputs')
        inputCall.id = 'inputCall'
        inputCall.style.backgroundColor = '#141414'
        inputCall.placeholder = texts.text('labelNumber') +' / ' + "SIP"

        bgCall.appendChild(h4Call)
        bgCall.appendChild(inputCall)
        bgFilter.appendChild(bgCall)

    }
    function getDate(){
    
        var bgCurtain = document.createElement('div')
        bgCurtain.classList.add('bgCurtain')
        bgCurtain.id = 'bgCurtain'
        bgCurtain.addEventListener('click', function(event){
            if (event.target === bgCurtain) {
                console.log('remove date')
                document.getElementById('bgCurtain').remove();
            }
        })
    
        var bgInputDate = document.createElement('div')
        bgInputDate.classList.add('bgInputDate')
        bgInputDate.id = 'bgInputDate'
    
        var bgInputDateTxt = document.createElement('h4')
        bgInputDateTxt.classList.add('bgInputDateTxt')
        bgInputDateTxt.id = 'bgInputDateTxt'
        bgInputDateTxt.textContent = "Selecione uma data"
    
        var inputDate = document.createElement('input');
        inputDate.setAttribute('type', 'date');
        inputDate.id = 'inputDate';
        inputDate.classList.add('inputDate');
    
        var inputTime = document.createElement('input');
        inputTime.setAttribute('type', 'time');
        inputTime.id = 'inputTime';
        inputTime.classList.add('inputTime');
    
        console.log(inputDate.value)
        console.log(inputTime.value)
            
        var btnConfirm = document.createElement('div')
        btnConfirm.classList.add('btnDate')
        btnConfirm.id = 'btnDate'
        btnConfirm.textContent = 'Confirm'
        btnConfirm.addEventListener('click', function(event){
            var ajustedDate = inputDate.value 
            var ajustedHour = inputTime.value
            console.log('Data clicada', ajustedDate + "T" + ajustedHour)
    
            if (inputDate.value == "" ||  inputTime.value == ''){
                makePopup(texts.text('labelWarning'),texts.text("date"))
            }else{
                setDate(inputDate.value + " " + ajustedHour)
                if (event.target === btnConfirm) {
                    document.getElementById('bgCurtain').remove();
                }
            }
        })
        
        bgInputDate.appendChild(bgInputDateTxt)
        bgInputDate.appendChild(inputDate)
        bgInputDate.appendChild(inputTime)
        bgInputDate.appendChild(btnConfirm)
        bgCurtain.appendChild(bgInputDate)
        colDireita.appendChild(bgCurtain)
    
    }
    function setDate(date){
    
        var bgDate = document.getElementById('bgSelectedDate')
    
        var firstDate = document.getElementById('firstDate')
        var lastDate = document.getElementById('lastDate')
    
        if (!firstDate){
            var firstDate = document.createElement('div')
            firstDate.classList.add('setDate')
            firstDate.id = 'firstDate'
    
            var iconDate = document.createElement('img')
            iconDate.classList.add('iconDate')
            iconDate.src = './images/calendar.svg'
            
            var textDate = document.createElement('div')
            textDate.classList.add('textDate')
            textDate.id = 'textDate'
            textDate.textContent = date
            
            firstDate.appendChild(iconDate)
            firstDate.appendChild(textDate)
            bgDate.appendChild(firstDate)
    
            firstDate.addEventListener('click',function(){
                document.getElementById('firstDate').remove()
    
                var lastDate = document.getElementById('lastDate')
                if(lastDate){
                    console.log('delete fristDate', lastDate.children[1].textContent)
                    setDate(lastDate.children[1].textContent)
                    
                    document.getElementById('lastDate').remove()
                    
                }
            })
    
        }else if(!lastDate){
    
            if(firstDate.children[1].textContent > date){
                console.log("FIRST DATE MAIOR QUE LAST DATE")
                var firstdate = date
                var lastDate = firstDate.children[1].textContent
    
                document.getElementById('firstDate').remove()
    
                setDate(firstdate)
                setDate(lastDate)
    
            }else{
                var lastDate = document.createElement('div')
                lastDate.classList.add('setDate')
                lastDate.id = 'lastDate'
        
                var iconDate = document.createElement('img')
                iconDate.classList.add('iconDate')
                iconDate.src = './images/calendar.svg'
                
                var textDate = document.createElement('div')
                textDate.classList.add('textDate')
                textDate.id = 'textDate'
                textDate.textContent = date
        
                lastDate.appendChild(iconDate)
                lastDate.appendChild(textDate)
                bgDate.appendChild(lastDate)
                lastDate.addEventListener('click',function(){
                    document.getElementById('lastDate').remove()
                })
            }
    
            
        }
        
    }
    function getSensor(bgFilter){
        
        var bgSensor = document.createElement('div')
        bgSensor.id = 'bgSensor'
        bgSensor.classList.add('bgSensor')
    
        var infoSensor = document.createElement('div');
        infoSensor.classList.add('infoSensor');
    
        var h4Sensor = document.createElement('h4');
        h4Sensor.textContent = "Sensores";

        var sensorSelected = document.createElement('div');
        sensorSelected.classList.add('sensorSelectedDIV');
    
        infoSensor.appendChild(h4Sensor);
        
        list_sensors_name.forEach(function(sens){
            var btSensor = document.createElement('div')
            btSensor.classList.add('btnSensor')
            btSensor.id = sens.sensor_name
            btSensor.textContent = sens.sensor_name
            btSensor.addEventListener('click', function(evt){
                console.log("Categoria clicada", sens.id)
                
                list_sensors_name.forEach(function(sens){
                    var sensToRemSelec = document.getElementById(sens.sensor_name) 
                    sensToRemSelec.classList.remove('selectSensor')
                })
    
                btSensor.classList.add("selectSensor")
    
            })
            sensorSelected.appendChild(btSensor)
        });
    
    
        
        //infoSensor.appendChild(selectSensor);
        bgSensor.appendChild(infoSensor);
        bgSensor.appendChild(sensorSelected);
        bgFilter.appendChild(bgSensor);
        

    
        
    }
    function reportList(history, objSrc){
        console.log('reportList history', JSON.stringify(history))
        console.log('reportList objSrc', objSrc)
        
        var colRight = document.getElementById('colDireita')
        colRight.innerHTML = ''
    
        // var nameReport = document.createElement('div')
        // nameReport.textContent = history.sensor_name[0]
        var tableContainer = document.createElement('div')
        tableContainer.id = "table-container"
        tableContainer.classList.add('tableContainer')
        if(tableContainer){
            tableContainer.innerHTML = ''
        }
        var table = document.createElement('table')
        table.id = "table"
        table.classList.add('table')
    
        var headerRow = document.createElement('tr')
        headerRow.classList.add('headerRow')
        for (const key in history[0]) {
            console.log('ACESSO FOR', key)
            if (history[0].hasOwnProperty(key)){
                console.log('KEY IN HISTORY', key + ': ' + history[0][key]);
                if(key !== null){
                    const th = document.createElement('th');
                    th.textContent = texts.text(key);
                    
                    headerRow.appendChild(th);
                }
            }
    
        }
        table.appendChild(headerRow)
        // Create table data rows
        history.forEach(function(h){
            console.log("row", h)
            const dataRow = document.createElement('tr');
            dataRow.classList.add("dataRow")
            // Para cada chave do objeto, criamos uma célula <td> e atribuímos o valor correspondente
            Object.keys(h).forEach(function(key) {
                if(key == 'guid' || key == 'from_guid'|| key == 'to_guid'){
                    var u = list_users.filter(function (u){
                        return u.guid == h[key]
                    })[0]
                    const td = document.createElement('td');
                    td.textContent = h.guid == 'undefined'? texts.text('labelInsertError') : u.cn;
                    dataRow.appendChild(td);
                }else if(key == 'date' || key.startsWith('call_')){
                    const td = document.createElement('td');
                    td.textContent = convertUTCToLocalTime(h[key]);
                    dataRow.appendChild(td);
                }else{
                    const td = document.createElement('td');
                    td.textContent = h[key];
                    dataRow.appendChild(td);
                }
                
            });
            table.appendChild(dataRow);
        });
        
        tableContainer.appendChild(table);
        colRight.appendChild(tableContainer)
    }
    function reportGraph(xArray, yArray, name, nameX, nameY){

        const rangMinY = Math.min(...yArray)
        const rangMaxY = Math.max(...yArray)
        const rangMinX = Math.min(...xArray)
        const rangMaxX = Math.max(...xArray)
    
        // Define Data
        const data = [{
        x: xArray,
        y: yArray,
        mode:"lines"
        }];
        console.log("Array",rangMinY, rangMaxY)
        // Define Layout
        const layout = {
        xaxis: {range: [rangMinX, rangMaxX], title: nameX},
        yaxis: {range: [rangMinY, rangMaxY], title: nameY},  
        title: name
        };
        var bgFilter = document.getElementById('bgFilter')
        // bgFilter.innerHTML = ''
    
        var grafDiv = document.createElement('div')
        grafDiv.id = 'grafDiv'

        bgFilter.appendChild(grafDiv)
        // Display using Plotly
        Plotly.newPlot("grafDiv", data, layout);
    }
    //sensorAnalyse(sensorHistory, 'Datacenter', 'temperature')
    function sensorAnalyse(data, sensor, tipo){
        return new Promise(function (resolve, reject) {
            try {
            console.log(JSON.stringify(data))
            var filtredhistory = JSON.parse(data)

            var bgFilter = document.getElementById('bgFilter')
            var infoBoxDiv = document.getElementById('infoBox')
            var grafDiv = document.getElementById('grafDiv')
            
            // remove div elementos criados para filtro
            if (infoBoxDiv){
                bgFilter.removeChild(infoBoxDiv)
                bgFilter.removeChild(grafDiv)
            }
            const infoBox = document.createElement("div")
            infoBox.id = "infoBox"
            infoBox.classList.add("infobox")    

            const sensorInfoBox = document.createElement("div")
            sensorInfoBox.id = "sensorInfoBox"
            sensorInfoBox.classList.add("sensorInfoBox")
            // Criação da grade de opções para o gráfico
            for (const sensor in filtredhistory) { // Recebe o nome dos sensores solicitados
                // cria o H2 que mostra o nome do sensor recebido                
                var h2Sensor = document.createElement('h2')
                h2Sensor.textContent = sensor

                infoBox.appendChild(h2Sensor)
                
                if (filtredhistory.hasOwnProperty(sensor)) {
                    // recebe os lançamentos do sensor e armazena
                    const rows = filtredhistory[sensor];

                    for (const key in rows[0]) {
                        // cria a grade de parâmetros para seleceionar no gráfico

                        if(key !== "date" && key !=="id" && key !=="row_number" && key !== "battery" && key !== "sensor_name" && key !== "row_num" && rows[0][key] !== null){
                            const sensorBox = document.createElement("div")
                            sensorBox.id = "sensorBox"
                            sensorBox.classList.add("sensorBox")

                            const topBox = document.createElement("div")
                            topBox.id = "topBox"
                            topBox.classList.add("topBox", "neutro-700")
                            topBox.textContent = texts.text(key)

                            const btmBox = document.createElement("div")
                            btmBox.id = "btmBox"
                            btmBox.classList.add("btmBox", "neutro-900")
                            btmBox.textContent = rows[0][key]
                            
                            sensorBox.appendChild(topBox)
                            sensorBox.appendChild(btmBox)
                            sensorInfoBox.appendChild(sensorBox)

                            sensorBox.addEventListener("click", function(){
                                
                                if(document.getElementById('grafDiv')){
                                    document.getElementById('grafDiv').remove()
                                }
                                var clickBtm = document.querySelectorAll(".btmBox")
                                clickBtm.forEach(function(b){
                                    b.classList.remove("neutro-1100")
                                })
                                btmBox.classList.add('neutro-1100')

                                var xArray = []
                                var yArray = []

                                rows.forEach(function(r){
                                    xArray.push(convertUTCToLocalTime(r.date));
                                    yArray.push(r[key]);
                                })

                                reportGraph(xArray, yArray, key, 'Data', key)
                            })

                        }
                       
                        infoBox.appendChild(sensorInfoBox)
                    }
                }
            }
            
            bgFilter.appendChild(infoBox)
            resolve('success')

            }catch (error) {
            reject('Error adding report: ' + error.message);
            }
        }) 
        //reportGraph(eixoX, eixoY,'nome do gráfico', 'eixoX', 'eixoY')
    

    }
    
    // function makeDivReports(colDireita) {
    //     colDireita.clear()
    //     var options = colDireita.add(new innovaphone.ui1.Div(null, null, "divReportOptions"))
    //     var filters = colDireita.add(new innovaphone.ui1.Div(null, null, "divReportFilters"))

    //     var lirelatorios1 = options.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
    //     var lirelatorios2 = options.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
    //     var lirelatorios3 = options.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
    //     var lirelatorios4 = options.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
    //     lirelatorios1.add(new innovaphone.ui1.Node("a", null, texts.text("labelRptAvailability"), null).setAttribute("id", "RptAvailability"));
    //     lirelatorios2.add(new innovaphone.ui1.Node("a", null, texts.text("labelRptCalls"), null).setAttribute("id", "RptCalls"));
    //     lirelatorios3.add(new innovaphone.ui1.Node("a", null, texts.text("labelRptActivities"), null).setAttribute("id", "RptActivities"));
    //     lirelatorios4.add(new innovaphone.ui1.Node("a", null, texts.text("labelRptSensors"), null).setAttribute("id", "RptSensors"));

    //     var a = document.getElementById("RptAvailability");
    //     a.addEventListener("click", function () { filterReports("RptAvailability", filters) })
    //     var a = document.getElementById("RptCalls");
    //     a.addEventListener("click", function () { filterReports("RptCalls", filters) })
    //     var a = document.getElementById("RptActivities");
    //     a.addEventListener("click", function () { filterReports("RptActivities", filters) })
    //     var a = document.getElementById("RptSensors");
    //     a.addEventListener("click", function () {
    //         //app.sendSrc({ api: "admin", mt: "SelectSensorsFromButtons", src: "RptSensors" }, function (obj) {

    //         //});
    //         //waitConnection(colDireita)
    //         filterReports("RptSensors", filters)
    //     })
    // }
    // function filterReports(rpt, colDireita) {
    //     colDireita.clear();

    //     switch (rpt) {
    //         case "RptCalls":
    //             var divFiltros = colDireita.add(new innovaphone.ui1.Div("position:absolute; font-weight:bolder; width: 90%; top: 5%; left: 5%; font-size: 25px;", texts.text("labelFiltros"), null));
    //             var divFiltrosDetails = colDireita.add(new innovaphone.ui1.Div("position:absolute; font-weight:bolder; width: 50%; top: 8.5%; left: 18%; font-size: 15px;", texts.text(rpt), null));
    //             var divFrom = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 25.5%; left: 6%; font-weight: bold;", texts.text("labelFrom"), null));
    //             var InputFrom = colDireita.add(new innovaphone.ui1.Input("position: absolute;  top: 25%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "date", null).setAttribute("id", "dateFrom"));
    //             var divTo = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 35.5%; left: 6%; font-weight: bold;", texts.text("labelTo"), null));
    //             var InputTo = colDireita.add(new innovaphone.ui1.Input("position: absolute; top: 35%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "date", null).setAttribute("id", "dateTo"));
    //             var divNumber = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 45.6%; left: 6%; font-weight: bold;", texts.text("labelPhone"), null));
    //             var InputNumber = colDireita.add(new innovaphone.ui1.Input("position: absolute; top: 45%; left: 20%; height: 25px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F; ", null, null, null, "number", null).setAttribute("id", "number"));
    //             var divRamal = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 55.6%; left: 6%; font-weight: bold;", texts.text("labelAgent"), null));
    //             var SelectRamal = new innovaphone.ui1.Node("select", "position: absolute; top: 55.0%; left: 20%; height: 25px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F; font-size: 13px; font-weight: bold ", null, null).setAttribute("id", "selectUser");
    //             colDireita.add(SelectRamal);
    //             SelectRamal.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", null, null)).setAttribute("id", "sips");
    //             list_users.forEach(function (user) {
    //                 SelectRamal.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", user.cn, null)).setAttribute("id", user.guid);
    //             })
    //             break;
    //         case "RptAvailability":
    //             var divFiltros = colDireita.add(new innovaphone.ui1.Div("position:absolute; font-weight:bolder; width: 90%; top: 5%; left: 5%; font-size: 25px;", texts.text("labelFiltros"), null));
    //             var divFiltrosDetails = colDireita.add(new innovaphone.ui1.Div("position:absolute; font-weight:bolder; width: 50%; top: 8.5%; left: 18%; font-size: 15px;", texts.text(rpt), null));
    //             var divFrom = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 25.5%; left: 6%; font-weight: bold;", texts.text("labelFrom"), null));
    //             var InputFrom = colDireita.add(new innovaphone.ui1.Input("position: absolute;  top: 25%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "date", null).setAttribute("id", "dateFrom"));
    //             var divTo = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 35.5%; left: 6%; font-weight: bold;", texts.text("labelTo"), null));
    //             var InputTo = colDireita.add(new innovaphone.ui1.Input("position: absolute; top: 35%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "date", null).setAttribute("id", "dateTo"));
    //             var divRamal = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 45.6%; left: 6%; font-weight: bold;", texts.text("labelAgent"), null));
    //             var SelectRamal = new innovaphone.ui1.Node("select", "position: absolute; top: 45.0%; left: 20%; height: 25px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F; font-size: 13px; font-weight: bold ", null, null).setAttribute("id", "selectUser");
    //             colDireita.add(SelectRamal);
    //             SelectRamal.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", null, null)).setAttribute("id", "sips");
    //             list_users.forEach(function (user) {
    //                 SelectRamal.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", user.cn, null)).setAttribute("id", user.guid);
    //             })
    //             break;
    //         case "RptActivities":
    //             var divFiltros = colDireita.add(new innovaphone.ui1.Div("position:absolute; font-weight:bolder; width: 90%; top: 5%; left: 5%; font-size: 25px;", texts.text("labelFiltros"), null));
    //             var divFiltrosDetails = colDireita.add(new innovaphone.ui1.Div("position:absolute; font-weight:bolder; width: 50%; top: 8.5%; left: 18%; font-size: 15px;", texts.text(rpt), null));
    //             var divFrom = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 25.5%; left: 6%; font-weight: bold;", texts.text("labelFrom"), null));
    //             var InputFrom = colDireita.add(new innovaphone.ui1.Input("position: absolute;  top: 25%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "date", null).setAttribute("id", "dateFrom"));
    //             var divTo = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 35.5%; left: 6%; font-weight: bold;", texts.text("labelTo"), null));
    //             var InputTo = colDireita.add(new innovaphone.ui1.Input("position: absolute; top: 35%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "date", null).setAttribute("id", "dateTo"));
    //             var divEvent = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 45.6%; left: 6%; font-weight: bold;", texts.text("labelEvent"), null));
    //             var iptEvent = colDireita.add(new innovaphone.ui1.Node("select", "position:absolute; left:20%; width:20%; top:45.6%; text-align:center; border-radius: 10px; border: 2px solid; border-color:#02163F; font-size: 13px; font-weight: bold;", null, null));
    //             iptEvent.setAttribute("id", "selectEvent");
    //             var opt = iptEvent.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "", null).setAttribute("id", ""));
    //             var opt = iptEvent.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "Alarme", null).setAttribute("id", "alarm"));
    //             var opt = iptEvent.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "Ligação", null).setAttribute("id", "call"));
    //             var opt = iptEvent.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "Vídeo", null).setAttribute("id", "video"));
    //             var opt = iptEvent.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "Combo", null).setAttribute("id", "combo"));
    //             var opt = iptEvent.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "Página Iframe", null).setAttribute("id", "page"));
    //             var opt = iptEvent.add(new innovaphone.ui1.Node("option", "font-size:12px; text-align:center", "PopUp Iframe", null).setAttribute("id", "popup"));
    //             var divRamal = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 55.6%; left: 6%; font-weight: bold;", texts.text("labelAgent"), null));
    //             var SelectRamal = new innovaphone.ui1.Node("select", "position: absolute; top: 55.0%; left: 20%; height: 25px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F; font-size: 13px; font-weight: bold ", null, null).setAttribute("id", "selectUser");
    //             colDireita.add(SelectRamal);
    //             SelectRamal.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", null, null)).setAttribute("id", "sips");
    //             list_users.forEach(function (user) {
    //                 SelectRamal.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", user.cn, null)).setAttribute("id", user.guid);
    //             })
    //             break;
    //         case "RptSensors":
    //             var divFiltros = colDireita.add(new innovaphone.ui1.Div("position:absolute; font-weight:bolder; width: 90%; top: 5%; left: 5%; font-size: 25px;", texts.text("labelFiltros"), null));
    //             var divFiltrosDetails = colDireita.add(new innovaphone.ui1.Div("position:absolute; font-weight:bolder; width: 50%; top: 8.5%; left: 18%; font-size: 15px;", texts.text(rpt), null));
    //             var divFrom = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 25.5%; left: 6%; font-weight: bold;", texts.text("labelFrom"), null));
    //             var InputFrom = colDireita.add(new innovaphone.ui1.Input("position: absolute;  top: 25%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "date", null).setAttribute("id", "dateFrom"));
    //             var divTo = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 35.5%; left: 6%; font-weight: bold;", texts.text("labelTo"), null));
    //             var InputTo = colDireita.add(new innovaphone.ui1.Input("position: absolute; top: 35%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "date", null).setAttribute("id", "dateTo"));
    //             var divRamal = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 45.6%; left: 6%; font-weight: bold;", texts.text("labelAgent"), null));
    //             //var SelectRamal = new innovaphone.ui1.Node("select", "position: absolute; top: 45.0%; left: 20%; height: 25px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F; font-size: 13px; font-weight: bold ", null, null).setAttribute("id", "selectUser");
    //             //colDireita.add(SelectRamal);
    //             //SelectRamal.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", null, null)).setAttribute("id", "sips");
    //             //list_users.forEach(function (user) {
    //             //    SelectRamal.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", guid, null)).setAttribute("id", "sips");
    //             //})
    //             //sensor name
    //             colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 55.6%; left: 6%; font-weight: bold;", texts.text("labelSensorName"), null));
    //             var SelectSensor = new innovaphone.ui1.Node("select", "position: absolute; top: 55.0%; left: 20%; height: 25px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F; font-size: 13px; font-weight: bold ", null, null).setAttribute("id", "selectSensor");
    //             colDireita.add(SelectSensor);
    //             SelectSensor.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", null, null)).setAttribute("id", "");
    //             list_buttons.forEach(function (b) {
    //                 if (b.button_type == "sensor") {
    //                     SelectSensor.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", b.button_prt, null)).setAttribute("id", b.id);
    //                 }
    //             })
    //             //sensor type
    //             colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 65.6%; left: 6%; font-weight: bold;", texts.text("labelValueType"), null));
    //             var SelectSensorType = new innovaphone.ui1.Node("select", "position: absolute; top: 65.0%; left: 20%; height: 25px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F; font-size: 13px; font-weight: bold ", null, null).setAttribute("id", "selectSensorType");
    //             colDireita.add(SelectSensorType);
    //             SelectSensorType.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", null, null)).setAttribute("id", "");
    //             list_sensor_types.forEach(function (t) {
    //                 SelectSensorType.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", t.typeName, null)).setAttribute("id", t.id);
    //             })
    //             break;
    //     }
    //     // buttons
    //     colDireita.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:75%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnOk").addEvent("click", function () {
    //         var guid;
    //         var from = document.getElementById("dateFrom").value;
    //         var to = document.getElementById("dateTo").value;
    //         var event;
    //         var number;
    //         var sensor;
    //         var sensor_type;

    //         if (rpt == "RptCalls") {
    //             var SelectUser = document.getElementById("selectUser");
    //             var selectedOption = SelectUser.options[SelectUser.selectedIndex];
    //             guid = selectedOption.id;
    //             number = document.getElementById("number").value;
    //         } else if (rpt == "RptActivities") {
    //             var SelectUser = document.getElementById("selectUser");
    //             var selectedOption = SelectUser.options[SelectUser.selectedIndex];
    //             guid = selectedOption.id;
    //             event = document.getElementById("selectEvent");
    //             var selectedOption = event.options[event.selectedIndex];
    //             event = selectedOption.id;
    //         }
    //         else if (rpt == "RptSensors") {
    //             sensor = document.getElementById("selectSensor");
    //             var selectedOption = sensor.options[sensor.selectedIndex];
    //             sensor = selectedOption.value;
    //             sensor_type = document.getElementById("selectSensorType");
    //             var selectedOption = sensor_type.options[sensor_type.selectedIndex];
    //             sensor_type = selectedOption.id;
    //         }


    //         app.send({ api: "admin", mt: "SelectFromReports", guid: guid, from: from, to: to, number: number, event: event, sensor: sensor, sensor_type: sensor_type, src: rpt });
    //         waitConnection(colDireita);
    //     });
    //     colDireita.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:75%; font-size:12px; text-align:center;", null, "button-inn-del")).addTranslation(texts, "btnCancel").addEvent("click", function () {
    //         makeDivReports(colDireita)
    //     });

    // }
    function reportView(t, response, src) {
        return new Promise(function (resolve, reject) {
            try {
                t.clear();

                ////Botões Tabela
                //t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:5%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnPdf").addEvent("click", function () {
                //    downloadPDF();
                //});
                //t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:5%; font-size:12px; text-align:center;", null, "button-inn-del")).addTranslation(texts, "btnReturn").addEvent("click", function () {
                //    filterReports(src, colDireita)
                //});
                ////Título Tabela
                //t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:30%; top:10%; font-size:17px; text-align:center; font-weight: bold", texts.text(src)).setAttribute("id", "titleReport"));
                var list = new innovaphone.ui1.Div("position: absolute; left:2px; top:15%; right:2px; height:fit-content", null, "").setAttribute("id", "listReport");
                var columnsCount = Object.keys(JSON.parse(response)[0]).length;
                var columnsName = JSON.parse(response)[0]
                console.log("columnsCount", columnsCount)
                var listView = new innovaphone.ui1.ListView(list, 50, "headercl", "arrow", false);
                //Cabeçalho
                //for (i = 1; i < columnsCount; i++) {
                //    listView.addColumn(null, "text", texts.text("cabecalho" + src + + i), i, 10, false);
                //}
                for (var key in columnsName) {
                    if (columnsName.hasOwnProperty(key)) {
                        if(key == "guid"){
                            listView.addColumn(null, "text", texts.text("cabecalho1"), key, 10, false);
                        }else{
                            listView.addColumn(null, "text", texts.text(key), key, 10, false);
                        }
                        

                    }
                }
                //switch (src) {
                //    case "RptCalls":
                //        for (i = 0; i < 6; i++) {
                //            listView.addColumn(null, "text", texts.text("cabecalho" + src + + i), i, 10, false);
                //        }
                //        break;
                //    case "RptActivities":
                //        for (i = 0; i < 5; i++) {
                //            listView.addColumn(null, "text", texts.text("cabecalho" + src + + i), i, 10, false);
                //        }
                //        break;
                //    case "RptAvailability":
                //        for (i = 0; i < 4; i++) {
                //            listView.addColumn(null, "text", texts.text("cabecalho" + src + + i), i, 10, false);
                //        }
                //        break;
                //    case "RptSensors":
                //        for (i = 0; i < columnsCount; i++) {
                //            listView.addColumn(null, "text", texts.text("cabecalho" + src + + i), i, 10, false);
                //        }
                //        break;
                //    default:
                //        for (i = 0; i < 1; i++) {
                //            listView.addColumn(null, "text", texts.text("cabecalho" + src + + i), i, 10, false);
                //        }
                //        break;

                //}

                //Tabela 
                try {
                    var result = JSON.parse(response);
                    switch (src) {
                        case "RptCalls":
                            result.forEach(function (b) {
                                var row = [];
                                var u = list_users.filter(function (u){
                                    return u.guid == b.guid 
                                })[0]
                                row.push(u.cn);
                                row.push(b.number);
                                row.push(b.call_started);
                                row.push(b.call_ringing);
                                row.push(b.call_connected);
                                row.push(b.call_ended);
                                row.push(texts.text("callStatus" + b.status))
                                // Substituir valores de b.status por texto correspondente
                                //switch (b.status) {
                                //    case 6:
                                //        row.push("Desc. Realizada");
                                //        break;
                                //    case 7:
                                //        row.push("Desc. Recebida");
                                //        break;
                                //    case 134:
                                //        row.push("Desc. Realizada");
                                //        break;
                                //    case 135:
                                //        row.push("Desc. Recebida");
                                //        break;
                                //    default:
                                //        row.push(b.status);
                                //}
                                //row.push(b.status);
                                // Substituir valores de b.direction por texto correspondente
                                //switch (b.direction) {
                                //    case "inc":
                                //        row.push("Entrada");
                                //        break;
                                //    case "out":
                                //        row.push("Saída");
                                //        break;
                                //    default:
                                //        row.push(b.direction);
                                //}
                                row.push(texts.text(b.direction));
                                listView.addRow(b.id, row, "rowcl", "#A0A0A0", "#82CAE2");
                                //t.add(list);
                            })
                            break;
                        case "RptActivities":
                            result.forEach(function (b) {
                                var row = [];
                                var u = list_users.filter(function (u) { return u.guid == b.guid })[0]
                                row.push(u.cn);
                                // Substituir valores de b.name por texto correspondente
                                //switch (b.name) {
                                //    case "video":
                                //        row.push("Vídeo");
                                //        break;
                                //    case "page":
                                //        row.push("Página");
                                //        break;
                                //    case "alarm":
                                //        row.push("Alarme");
                                //        break;
                                //    case "call":
                                //        row.push("Ligação");
                                //        break;
                                //    case "combo":
                                //        row.push("Combo");
                                //        break;
                                //    case "popup":
                                //        row.push("PopUp");
                                //        break;
                                //    default:
                                //        row.push(b.name);
                                //}
                                row.push(texts.text(b.name));
                                row.push(b.date);
                                // Substituir valores de b.status por texto correspondente
                                //switch (b.status) {
                                //    case "start":
                                //        row.push("Ínício");
                                //        break;
                                //    case "stop":
                                //        row.push("Fim");
                                //        break;
                                //    case "inc":
                                //        row.push("Entrada");
                                //        break;
                                //    case "out":
                                //        row.push("Saída");
                                //        break;
                                //    default:
                                //        row.push(b.status);
                                //}
                                row.push(texts.text(b.status));
                                row.push(b.details);
                                listView.addRow(b.id, row, "rowcl", "#A0A0A0", "#82CAE2");
                                //t.add(list);
                            })
                            break;
                        case "RptAvailability":
                            result.forEach(function (b) {
                                var row = [];
                                var u = list_users.filter(function (u) { return u.guid == b.guid })[0]
                                row.push(u.cn);
                                row.push(b.date);
                                row.push(b.status);
                                row.push(b.group_name);
                                listView.addRow(b.id, row, "rowcl", "#A0A0A0", "#82CAE2");
                                //t.add(list);
                            })
                            break;
                        case "RptSensors":
                            result.forEach(function (b) {
                                var row = [];
                                for (var key in b) {
                                    if (b.hasOwnProperty(key)) {
                                        row.push(b[key]);
                                    }
                                }
                                listView.addRow(b.id, row, "rowcl", "#A0A0A0", "#82CAE2");
                                //t.add(list);
                            })
                            break;
                    }

                } catch (e) {
                    console.log("Erro ao receber report: " + e)
                }


                function downloadPDF() {
                    // Crie um objeto jsPDF
                    const doc = new jsPDF('l', 'pt', 'a4');

                    // Carregar a imagem usando um objeto Image
                    var img = new Image();
                    img.src = 'logo.png';

                    // Quando a imagem terminar de carregar, adicionar ao PDF
                    img.onload = function () {
                        // Adicionar a imagem ao documento
                        doc.addImage(img, 'PNG', 10, 30, 100, 19);
                        // Defina a fonte para 18px
                        doc.setFontSize(18);
                        const title = document.getElementById("titleReport");
                        // Adicione o texto da tabela
                        doc.text(title.innerHTML, 300, 50);

                        // Defina a fonte para 10px
                        doc.setFontSize(10);

                        // Obtenha a tabela da listview
                        const table = document.getElementById("listReport");

                        // Obtenha as linhas da tabela
                        const rows = table.querySelectorAll("tr");


                        // Obter todas as colunas da primeira linha
                        var colunas = rows[0].getElementsByTagName('td');
                        // Definir a largura da página
                        var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
                        // Definir a largura de cada coluna
                        //var colWidth = pageWidth / colunas.length;
                        var cellWidth = (pageWidth - (colunas.length * 2)) / colunas.length;


                        // Defina o posicionamento inicial para o topo da primeira página
                        let y = 100;

                        // Itere sobre as linhas e colunas da tabela e adicione os dados ao PDF
                        for (let i = 0; i < rows.length; i++) {
                            const cells = rows[i].querySelectorAll("td");
                            let x = 10;

                            // Verificar se a próxima linha ultrapassa a altura da página
                            if (y + 20 > doc.internal.pageSize.height) {
                                doc.addPage();
                                y = 100;
                            }

                            for (let j = 0; j < cells.length; j++) {
                                //var cellWidth = cells[j].offsetWidth * 0.264583;

                                // Adicione bordas à célula
                                //doc.rect(x, y, cells[j].clientWidth, cells[j].clientHeight);
                                doc.rect(x, y, cellWidth, cells[j].clientHeight);

                                // Adicione o texto da célula
                                doc.text(cells[j].textContent, x + 2, y + 10);

                                // Atualize a posição X para a próxima célula
                                //x += cells[j].clientWidth;
                                x += cellWidth;
                            }

                            // Atualize a posição Y para a próxima linha
                            y += cells[0].clientHeight;
                        }

                        // Baixar o arquivo PDF
                        doc.output();
                        saveAs(doc.output('blob'), 'Report.pdf');
                    };

                }


                t.clear();
                //Botões Tabela
                t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:5%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnPdf").addEvent("click", function () {
                    downloadPDF();
                });
                t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:5%; font-size:12px; text-align:center;", null, "button-inn-del")).addTranslation(texts, "btnReturn").addEvent("click", function () {
                    filterReports(src, colDireita)
                });
                //Título Tabela
                t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:30%; top:10%; font-size:17px; text-align:center; font-weight: bold", texts.text(src)).setAttribute("id", "titleReport"));
                t.add(list);

                resolve('Report added successfully.');
            } catch (error) {
                reject('Error adding report: ' + error.message);
            }

        });
    }

    //await
    function waitConnection(t) {
        //t.clear();
        //var bodywait = new innovaphone.ui1.Div("height: 100%; width: 100%; display: inline-flex; position: absolute;justify-content: center; background-color:rgba(100,100,100,0.5)", null, "bodywaitconnection")
        //bodywait.addHTML('<svg class="pl" viewBox="0 0 128 128" width="128px" height="128px" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="hsl(193,90%,55%)" /><stop offset="100%" stop-color="hsl(223,90%,55%)" /></linearGradient></defs>	<circle class="pl__ring" r="56" cx="64" cy="64" fill="none" stroke="hsla(0,10%,10%,0.1)" stroke-width="16" stroke-linecap="round" />	<path class="pl__worm" d="M92,15.492S78.194,4.967,66.743,16.887c-17.231,17.938-28.26,96.974-28.26,96.974L119.85,59.892l-99-31.588,57.528,89.832L97.8,19.349,13.636,88.51l89.012,16.015S81.908,38.332,66.1,22.337C50.114,6.156,36,15.492,36,15.492a56,56,0,1,0,56,0Z" fill="none" stroke="url(#pl-grad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="44 1111" stroke-dashoffset="10" /></svg >');
        //t.add(bodywait);

        t.clear();
        var div1 = t.add(new innovaphone.ui1.Div(null, null, "preloader").setAttribute("id", "preloader"))
        var div2 = div1.add(new innovaphone.ui1.Div(null, null, "inner"))
        var div3 = div2.add(new innovaphone.ui1.Div(null, null, "loading"))
        div3.add(new innovaphone.ui1.Node("span", null, null, "circle"));
        div3.add(new innovaphone.ui1.Node("span", null, null, "circle"));
        div3.add(new innovaphone.ui1.Node("span", null, null, "circle"));
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
                button.style.display = 'flex';
                button.style.padding = '6px 16px';
                button.style.flexDirection = 'column';
                button.style.justifyContent = 'center';
                button.style.alignItems = 'center';
                button.style.gap = '10px';
                button.style.borderRadius = '4px';
                button.style.background = '#EA551F';
                button.style.color = 'white';
                break;
            case "secundary":
                button.style.display = 'flex';
                button.style.padding = '6px 16px';
                button.style.flexDirection = 'column';
                button.style.justifyContent = 'center';
                button.style.alignItems = 'center';
                button.style.gap = '10px';
                button.style.borderRadius = '4px';
                button.style.backgroundColor = '#F4A97D';
                button.style.color = 'black';
                break;
            case "tertiary":
                button.style.display = 'flex';
                button.style.padding = '6px 16px';
                button.style.flexDirection = 'column';
                button.style.justifyContent = 'center';
                button.style.alignItems = 'center';
                button.style.gap = '10px';
                button.style.borderRadius = '4px';
                button.style.backgroundColor = 'grey';
                button.style.color = 'black';
                break
            case "destructive":
                button.style.display = 'flex';
                button.style.padding = '6px 16px';
                button.style.flexDirection = 'column';
                button.style.justifyContent = 'center';
                button.style.alignItems = 'center';
                button.style.gap = '10px';
                button.style.borderRadius = '4px';
                button.style.backgroundColor = '#F5222D';
                button.style.color = 'black'
                break;
            case "transparent":
                button.style.display = 'flex';
                button.style.padding = '6px 16px';
                button.style.flexDirection = 'column';
                button.style.justifyContent = 'center';
                button.style.alignItems = 'center';
                button.style.gap = '10px';
                button.style.borderRadius = '4px';
                button.style.backgroundColor = '#B62F18';
                button.style.color = 'black'
                break;
            case "ghost":
                button.style.display = 'flex';
                button.style.padding = '6px 16px';
                button.style.flexDirection = 'column';
                button.style.justifyContent = 'center';
                button.style.alignItems = 'center';
                button.style.gap = '10px';
                button.style.borderRadius = '4px';
                button.style.backgroundColor = '#595959';
                button.style.color = 'black'
                break;
            case  "disable":
                // valor aqui
                break;
            default:
                button.classList.add("hover:bg-dark-300", "rounded");
                break;
        }

        return button.outerHTML;
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
    function convertUTCToLocalTime(utcString) {
        // Parse the UTC string into a Date object
        const utcDate = new Date(utcString);
        var clientTimeZoneOffset = new Date().getTimezoneOffset();

        utcDate.setUTCMinutes(utcDate.getUTCMinutes() - clientTimeZoneOffset);
        // Get the local time components
        const localHours = utcDate.getHours().toString().padStart(2, '0');
        const localMinutes = utcDate.getMinutes().toString().padStart(2, '0');
        const localSeconds = utcDate.getSeconds().toString().padStart(2, '0');
        const localDay = utcDate.getDate().toString().padStart(2, '0');
        const localMonth = (utcDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
        const localYear = utcDate.getFullYear();

        // Format the local time string
        const localTimeString = `${localHours}:${localMinutes}:${localSeconds} ${localDay}/${localMonth}/${localYear}`;

        return localTimeString;
    }
    function convertLocalToUTC(localDateString) {

        //var clientTimeZoneOffset = new Date().getTimezoneOffset();
    
        // Parse the local date string into a Date object
        const localDate = new Date(localDateString);
        //localDate.setUTCMinutes(localDate.getUTCMinutes());
    
        var dateString = localDate.toISOString();
        return dateString.slice(0, -5);
    }
}

Wecom.novaalertAdmin.prototype = innovaphone.ui1.nodePrototype;