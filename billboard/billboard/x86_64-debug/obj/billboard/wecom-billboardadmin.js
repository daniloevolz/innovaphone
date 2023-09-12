/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.billboardAdmin = Wecom.billboardAdmin || function (start, args) {
    this.createNode("body");
    var that = this;
    var appdn = start.title;
    var UIuser;
    var list_tableUsers = [];
    var list_departments = [];
    var list_post = [];
    var list_editors_departments = [];
    var list_viewers_departments = [];
    var list_admins = [];
    var _colDireita;
    //license
    var licenseToken = null;
    var appInstall = null;
    var licenseFile = null;
    var licenseActive = null;
    var licenseInstallDate = null;
    var licenseUsed = 0;
    var avatar = start.consumeApi("com.innovaphone.avatar");

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

    var texts = new innovaphone.lib1.Languages(Wecom.billboardTexts, start.lang);

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;
    app.onerror = function (error) {
        console.error("DwcIdentity: Appwebsocket.Connection error: " + error);
        changeState("Disconnected");
    };
    app.onclosed = function () {
        console.error("DwcIdentity: Appwebsocket.Connection closed!");
        changeState("Disconnected");
    };
    var currentState = "Loading";
    function changeState(newState) {
        if (newState == currentState) return;
        if (newState == "Connected") {
            currentState = newState;
            console.info("Billboard: Appwebsocket.Connection Connected: ");
        }
        if (newState == "Disconnected") {
            console.error("Billboard: Appwebsocket.Connection Disconnected: ");
            currentState = "Disconnected";
        }
    }

    function app_connected(domain, user, dn, appdomain) {
        changeState("Connected");
        avatar = new innovaphone.Avatar(start, user, domain);
        UIuserPicture = avatar.url(user, 80, dn);
        UIuser = dn
        app.send({ api: "admin", mt: "AdminMessage" });
        app.send({ api: "admin", mt: "TableUsers" });
        app.send({ api: "admin", mt: "SelectAdmins" });
        constructor();
        
        setInterval(function () {
            if (currentState == "Connected") {
                var msg = { api: "user", mt: "Ping" };
                app.send(msg);
                console.log("Interval: Ping Sent " + JSON.stringify(msg));
            } else {
                changeState("Disconnected");
                console.log("Interval: changeState Disconnected");
            }

        }, 60000); // A cada 60 segundo
    }

    function app_message(obj) {
        if (obj.api == "admin" && obj.mt == "AdminMessageResult") {
        }
        if (obj.api == "admin" && obj.mt == "TableUsersResult") {
            list_tableUsers = JSON.parse(obj.result);
        }
        if (obj.api == "admin" && obj.mt == "UpdateConfigLicenseMessageSuccess") {
            app.send({ api: "admin", mt: "ConfigLicense" });
           // waitConnection(colDireita);
            window.alert("Configurações Atualizadas com suecesso!");

        }
        if (obj.api == "admin" && obj.mt == "LicenseMessageResult") {
            try {
                licenseToken = obj.licenseToken;
                licenseFile = obj.licenseFile;
                licenseActive = obj.licenseActive;
                licenseInstallDate = obj.licenseInstallDate;
                licenseUsed = obj.licenseUsed;
                appInstall = obj.appInstallDate;
                console.log("LicenseMessageResult = Success + License File: " + licenseFile)

            } catch (e) {
                console.log("ERRO LicenseMessageResult:" + e)
            }
            makeDivLicense(_colDireita);
        }
        if (obj.api == "admin" && obj.mt == "InsertAdminsSuccess"){
            window.alert("Usuários Inseridos com sucesso!")
        }
        if (obj.api == "admin" && obj.mt == "SelectAdminsResult"){
            list_admins = JSON.parse(obj.result)
            console.log("LIST ADMINS" + JSON.stringify(list_admins))
            makeDivUsers(_colDireita, list_tableUsers, list_admins);
        }
        if (obj.api == "admin" && obj.mt == "SelectDepartmentsResult") {
            list_departments = JSON.parse(obj.result)
            console.log("LIST DEPART " + JSON.stringify(list_departments))

            makeDivDepart(_colDireita, list_departments, list_tableUsers);
        }
        if (obj.api == "admin" && obj.mt == "SelectPostsResult") {
            list_post = JSON.parse(obj.result)
            console.log("LIST POST " + JSON.stringify(list_post))
            makeDivPost(_colDireita, list_post, list_tableUsers);
        }
        if (obj.api == "admin" && obj.mt == "UpdatePostSuccess") {
            app.send({ api: "admin", mt: "SelectPosts" })
        }
        if (obj.api == "admin" && obj.mt == "UpdateDepartmentSuccess") {
            app.send({ api: "admin", mt: "SelectDepartments" });
        }
        if (obj.api == 'admin' && obj.mt == "SelectDepartments") {
            makeDivDepart(_colDireita, list_departments, list_tableUsers);
        }
        if (obj.api == "admin" && obj.mt == "SelectAdminDepartmentViewersResult") {
            console.log(obj.result);
            list_viewers_departments = JSON.parse(obj.result);
            console.log('list viwers:', list_viewers_departments);
        }
        if (obj.api == "admin" && obj.mt == "SelectAdminDepartmentEditorsResult") {
            console.log(obj.result);
            list_editors_departments = JSON.parse(obj.result);
            console.log('list editors:', list_editors_departments);
            editDepartmentForm(_colDireita, obj.src)
        }
    }
    function constructor() {
        that.clear();
        // col direita
        var colDireita = that.add(new innovaphone.ui1.Div(null, null, "colunadireita").setAttribute("id","coldireita"));
        //Título
        colDireita.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("labelTituloAdmin")));

        // col Esquerda
        var colEsquerda = that.add(new innovaphone.ui1.Div(null, null, "colunaesquerda"));
        colEsquerda.setAttribute("id","colesquerda")
        var divreport = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; border-bottom: 1px solid #4b545c; border-width: 100%; height: 10%; width: 100%; background-color: #02163F;  display: flex; align-items: center;", null, null));
        var imglogo = divreport.add(new innovaphone.ui1.Node("img", "max-height: 33px; opacity: 0.8;", null, null).setAttribute("src", "./images/logo-wecom.png"));
     
        var spanreport = divreport.add(new innovaphone.ui1.Div("font-size: 1.00rem; color:white; margin : 5px;", appdn, null));
        var user = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; height: 10%; top: 10%; width: 100%; align-items: center; display: flex; border-bottom: 1px solid #4b545c"));
        var imguser = user.add(new innovaphone.ui1.Node("img", "max-height: 33px; border-radius: 50%;", null, null));
        //imguser.setAttribute("src", UIuserPicture);
        var username = user.add(new innovaphone.ui1.Node("span", "font-size: 0.75rem; color:white; margin: 5px;", UIuser, null));
        username.setAttribute("id", "user");
        var imguser = user.add(new innovaphone.ui1.Node("img", "max-height: 33px; border-radius: 50%;", null, null));
        imguser.setAttribute("src", UIuserPicture);

        var relatorios = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 24%; height: 40%;"));
        var prelatorios = relatorios.add(new innovaphone.ui1.Node("p", "text-align: center; font-size: 20px;", texts.text("labelAdmin"), null));
        var br = relatorios.add(new innovaphone.ui1.Node("br", null, null, null));
    
        var lirelatorios1 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"));
        var lirelatorios2 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"));
        var lirelatorios3 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"));
        var lirelatorios4 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"));
        // var lirelatorios3 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))

        var Arelatorios1 = lirelatorios1.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgUsers"), null));
        Arelatorios1.setAttribute("id", "CfgUsers");
        // var Arelatorios2 = lirelatorios2.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgGoogle"), null));
        // Arelatorios2.setAttribute("id", "CfgGoogle");
        var Arelatorios2 = lirelatorios2.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgLicense"), null));
        Arelatorios2.setAttribute("id", "CfgLicense");
        var Arelatorios3 = lirelatorios3.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgDepartment"), null));
        Arelatorios3.setAttribute("id", "CfgDepartment");
        var Arelatorios4 = lirelatorios4.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgPost"), null));
        Arelatorios4.setAttribute("id", "CfgPost");

        var divother = colEsquerda.add(new innovaphone.ui1.Div("text-align: left; position: absolute; top:59%;", null, null));
        var divother2 = divother.add(new innovaphone.ui1.Div(null, null, "otherli"));

        var config = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 90%;", null, null));
        var liconfig = config.add(new innovaphone.ui1.Node("li", "display:flex; aligns-items: center", null, "config"));

        var imgconfig = liconfig.add(new innovaphone.ui1.Node("img", "width: 100%; opacity: 0.9; margin: 2px; ", null, null));
        imgconfig.setAttribute("src", "./images/wecom-white.svg");
        //var Aconfig = liconfig.add(new innovaphone.ui1.Node("a", "display: flex; align-items: center; justify-content: center;", texts.text("labelConfig"), null));
        //Aconfig.setAttribute("href", "#");

        var a = document.getElementById("CfgUsers");
            a.addEventListener("click", function () { 
            ChangeView("CfgUsers", colDireita) 
            });

        var a = document.getElementById("CfgLicense");
            a.addEventListener("click", function () { 
            ChangeView("CfgLicense", colDireita) 
            });
        var a = document.getElementById("CfgDepartment");
            a.addEventListener("click", function () { 
            ChangeView("CfgDepartment", colDireita) 
            });

        var a = document.getElementById("CfgPost");
            a.addEventListener("click", function () { 
            ChangeView("CfgPost", colDireita) 
            });

        _colDireita = colDireita;
    }
    function ChangeView(ex, colDireita) {

        if (ex == "CfgUsers") {
           // app.send({ api: "admin", mt: "TableUsers" });
           app.send({ api: "admin", mt: "SelectAdmins" });
            
        }
        if (ex == "CfgLicense") {
            app.send({ api: "admin", mt: "ConfigLicense"});
            //waitConnection(colDireita);
        }
        if (ex == "CfgDepartment") {
            app.send({ api: "admin", mt: "SelectDepartments" });
            //waitConnection(colDireita);
        }
        if (ex == "CfgPost") {
            app.send({ api: "admin", mt: "SelectDepartments" });
            app.send({ api: "admin", mt: "SelectPosts" });
            //waitConnection(colDireita);
        }
    }
    function makeDivUsers(t, users, admins) {
        t.clear();
        // app.send({ api: "admin", mt: "SelectAdmins" });
        var scrollcontainer = t.add(new innovaphone.ui1.Div(null, null, "list-box scrolltable"))
        var tableMain = scrollcontainer.add(new innovaphone.ui1.Node("table", null, null, "table").setAttribute("id", "local-table"));
        tableMain.add(new innovaphone.ui1.Node("th", null, "Nome", null));
        tableMain.add(new innovaphone.ui1.Node("th", null, "Pode Criar Departamento", null));

        var adminGuids = admins.map(admin => admin.guid);
        console.log("Admin Guids: " + adminGuids);
        
        users.forEach(function (user) {
            var isChecked = adminGuids.includes(user.guid) ? 'checked' : ''; 
            console.log("User:", user.guid, "Is Checked:", isChecked);
            var html = `
              <tr>
                <td style="text-transform: capitalize; text-align: center;">${user.cn}</td>
                <td style="text-align: center;"><input type="checkbox" id="${user.guid}" class="userCheckbox" ${isChecked}></td>
              </tr>
            `;
            document.getElementById("local-table").innerHTML += html;
        });

        scrollcontainer.add(new innovaphone.ui1.Node("div",null,"Salvar","button-inn").setAttribute("id","btnSave")).addEvent("click",function(){
            console.log("Ok Funcionando")

            var checkboxes = document.querySelectorAll(".userCheckbox");
            // var btnSave = document.getElementById("btnSave");

            var Users = [];

            checkboxes.forEach(function (checkbox) {
            if (checkbox.checked) {
                Users.push(checkbox.getAttribute("id"));
                }
        });
          console.log("Enviados:" + Users)
          app.send({ api: "admin", mt: "InsertAdmins", users: Users  });

        })

   

    }
        
    function makeDivLicense(t, user) {
        t.clear();
        //Título

        // var imgMenu = t.add(new innovaphone.ui1.Node("img",null,null,"imgMenu"));
        // imgMenu.setAttribute("src","menu-icon.png");
        // imgMenu.setAttribute("id","imgmenu");
        //document.getElementById("imgmenu").addEventListener("click",openMenu);
        var worktable = t.add(new innovaphone.ui1.Div(null, null,"list-box scrolltable"));
        worktable.setAttribute('id', 'worktable')
        worktable.add(new innovaphone.ui1.Div(null, texts.text("labelTituloLicense"),"DivLicenseTitle"));
    
        worktable.add(new innovaphone.ui1.Div(null, texts.text("lblLicenseToken"), "DivLicenseTokenTitle"));
        worktable.add(new innovaphone.ui1.Div(null, licenseToken, "DivLicenseToken"));

        worktable.add(new innovaphone.ui1.Div(null, texts.text("labelLicenseFile"),"DivLicenseKey"));
        worktable.add(new innovaphone.ui1.Input("position: absolute;  top: 35%; left: 40%; height: 15px; padding:5px; width: 50%; border-radius: 10px; border: 2px solid; border-color:#02163F;", licenseFile, null, null, null, "DivLicenseIptKey").setAttribute("id", "InputLicenseFile"));
        var lic = "Temporária";
        if (licenseActive != "null") {
            lic = licenseActive
        }
        worktable.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 45%; left: 6%; font-weight: bold;", texts.text("labelLicenseActive"),"DivLicenseActive"));
        worktable.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 45%; left: 40%; font-weight: bold;", lic, "DivLicenseSystem"));

        worktable.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 55%; left: 6%; font-weight: bold;", texts.text("labelAppInstallDate"), "DivAppDateTitle"));
        worktable.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 55%; left: 40%; font-weight: bold;", appInstall, "DivAppDate"));

        worktable.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 65%; left: 6%; font-weight: bold;", texts.text("labelLicenseInstallDate"),"DivLicenseDateTitle"));
        worktable.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 65%; left: 40%; font-weight: bold;", licenseInstallDate, "DivLicenseDate"));

        worktable.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 75%; left: 6%; font-weight: bold;", texts.text("labelLicenseUsed"), "DivLicenseInUse"));
        worktable.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 75%; left: 40%; font-weight: bold;", String(licenseUsed), "DivLicenseUsed"));


        // buttons
        worktable.add(new innovaphone.ui1.Div("position:absolute; left:82%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnOk").addEvent("click", function () {
            licenseFile = document.getElementById("InputLicenseFile").value;
            if (licenseFile.length > 0) {
                app.send({ api: "admin", mt: "UpdateConfigLicenseMessage", licenseToken: licenseToken, licenseFile: licenseFile });
                //waitConnection(t);
            } else {
                window.alert("A chave de licença precisa ser informada!");
            }
            
        });

    }
    function makeDivDepart(t, depart, tableUser) {
        t.clear();

        var scrollcontainer = t.add(new innovaphone.ui1.Div(null, null, "list-box scrolltable"))
        var tableMain = scrollcontainer.add(new innovaphone.ui1.Node("table", null, null, "table").setAttribute("id", "local-table"));
        tableMain.add(new innovaphone.ui1.Node("th", null, "ID", null));
        tableMain.add(new innovaphone.ui1.Node("th", null, "Departamento", null));
        tableMain.add(new innovaphone.ui1.Node("th", null, "Criador", null));
        tableMain.add(new innovaphone.ui1.Node("th", null, "Excluído?", null));
        tableMain.add(new innovaphone.ui1.Node("th", null, "Editar", null));

        depart.forEach(function (depart) {
            var users = list_tableUsers.filter(function (user) {
                return depart.creator_guid === user.guid;
            });


            var userName = users.length > 0 ? users[0].cn : '';

            if (depart.deleted == null) {
                var departDel = "Não"
            } else {
                var dateString = depart.deleted;
                var date = new Date(dateString);
                var day = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();
                var hours = date.getHours();
                var minutes = date.getMinutes();
                var formattedDate = (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year + ' - ' + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
                var departDel = formattedDate
            }
            //var departDel = depart.deleted == null ? "Não" : formatDate();

            var html = `
                      <tr>
                        <td style="text-transform: capitalize; text-align: center;">${depart.id}</td>
                        <td style="background-color: ${depart.color}; text-transform: capitalize; text-align: center;">${depart.name}</td>
                        <td style="text-transform: capitalize; text-align: center;">${userName}</td>
                        <td style="text-transform: capitalize; text-align: center;">${departDel}</td>
                        <td style="display: flex; justify-content: center; align-items: center;"><div id="${depart.id}"  class="btnChgDpto" style="background-color: ${depart.color};"></div></td>
                      </tr>
                    `;

            document.getElementById("local-table").innerHTML += html;
           
        });
        var divs = document.getElementsByClassName("btnChgDpto");

        for (var i = 0; i < divs.length; i++) {
            divs[i].addEventListener("click", function (event) {
                // Obtenha o ID da DIV clicada.
                var idDaDivClicada = event.currentTarget.id;

                //editDepartmentForm(_colDireita, idDaDivClicada, list_departments);
                app.send({ api: "admin", mt: "SelectDepartmentOnClick", department: parseInt(idDaDivClicada) })
                // Execute a ação desejada com base no ID da DIV clicada.
                console.log("A DIV com ID " + idDaDivClicada + " foi clicada.");
                // Você pode usar idDaDivClicada para executar a ação específica para essa DIV.
                // Por exemplo, você pode buscar os dados relacionados a esse ID e iniciar a edição.
            });
        }


    }

    function editUsersDepartmentsGrid() {
        var usersListDiv = new innovaphone.ui1.Node("div", null, null, "userlist").setAttribute("id", "userslist");

        var table = usersListDiv.add(new innovaphone.ui1.Node("table", null, null, "table"));

        var headerRow = table.add(new innovaphone.ui1.Node("tr", null, null, "row"));

        var nameCol = headerRow.add(new innovaphone.ui1.Node("th", null, texts.text("labelUser"), "column"));

        var editorCol = headerRow.add(new innovaphone.ui1.Node("th", null, texts.text("labelEditor"), "column"));

        var viewerCol = headerRow.add(new innovaphone.ui1.Node("th", null, texts.text("labelViewer"), "column"));

        // Criar as demais linhas com os dados dos departamentos
        list_tableUsers.forEach(function (user) {
            var row = table.add(new innovaphone.ui1.Node("tr", null, null, "row"))

             var nameCol = row.add(new innovaphone.ui1.Node("td", null, user.cn, "column"))
            
            var userV = list_viewers_departments.filter(function (item) {
                return item.viewer_guid === user.guid;
            })[0];
            var userE = list_editors_departments.filter(function (item) {
                return item.editor_guid === user.guid;
            })[0];

            console.log("Visualizador:", list_viewers_departments);
            console.log("Editor:", list_editors_departments);

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
    function editDepartmentForm(t, dep_id, department) {

        var department = list_departments.filter(function (item) {
            return item.id === parseInt(dep_id, 10);
        })[0];
        t.clear()
       
        var worktable = t.add(new innovaphone.ui1.Div(null, null, "list-box scrolltable"));
        worktable.setAttribute('id', 'worktable')
        //insideDiv.className = 'insideDiv';
        var postMsgDiv = worktable.add(new innovaphone.ui1.Node("div", null, null, 'newdep').setAttribute("id", "newdep"));
        document.getElementById('newdep').style.backgroundColor = department.color
        var closeWindowDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, null, 'closewindow').setAttribute("id", "closewindow"));
        // Adicionando o listener de clique
        var c = document.getElementById('closewindow');
        c.addEventListener('click', function () {
            console.log("O elemento closeWindowDiv foi clicado!");
            makeDivDepart(_colDireita, list_departments, list_tableUsers);
        });
        var nameDepDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, department.name, 'nameDepDiv').setAttribute("id", "nameDepDiv"));
        var userTable = editUsersDepartmentsGrid();
        postMsgDiv.add(userTable);

        var buttonsDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, null, 'buttons').setAttribute("id", "buttons"));
        var paletteColor = document.getElementById('buttons').innerHTML = '<a>Selecione a cor:</a><ul id="palette" class="palette"></ul><input type="color" id="colorbox" style="display: none;">';
        var saveMsgDiv = buttonsDiv.add(new innovaphone.ui1.Node('div', null, 'Atualizar', 'saveclose').setAttribute("id", "savemsg"));
        var closeMsgDiv = buttonsDiv.add(new innovaphone.ui1.Node('div', null, 'Fechar', 'saveclose').setAttribute("id", "closemsg"));
        // Adicionando o listener de clique
        var d = document.getElementById('closemsg')
        d.addEventListener('click', function () {

            console.log("O elemento closeMsgDiv foi clicado!");
            makeDivDepart(_colDireita, list_departments, list_tableUsers);
        });
        var save = document.getElementById('savemsg');
        save.addEventListener('click', function () {
            // Aqui voc� pode implementar a a��o que deseja realizar quando o bot�o � clicado
            var departmentName = document.getElementById("nameDepDiv").innerHTML;
            var departmentColor = document.getElementById('newdep').style.backgroundColor;//document.getElementById("colorbox").value;
            console.log("Salvar clicado!");
            console.log("Nome do departamento:", departmentName);
            console.log("Cor selecionada:", departmentColor);
            var editorDepartments = getSelectedUsersDepartments('editor');
            var viewerDepartments = getSelectedUsersDepartments('viewer');
            console.log("Nome dos departamentos visiveis:", viewerDepartments);
            console.log("Nome dos departamentos editaveis:", editorDepartments);
            app.send({ api: "admin", mt: "UpdateDepartment", id: dep_id, name: departmentName, color: departmentColor, viewers: viewerDepartments, editors: editorDepartments });
        });
        var colorbox = document.getElementById("colorbox")
        colorbox.addEventListener("change", function () {
            document.getElementById("newdep").style.backgroundColor = colorbox.value;
        })
        var palette = document.getElementById("palette")
        palette.addEventListener("click", function () {
            colorbox.click();
        });

    }
    
    function getSelectedUsersDepartments(departmentType) {
        var checkboxes = document.getElementsByName(departmentType + 'Departments');
        var selectedUsers = Array.prototype.slice.call(checkboxes)
            .filter(function (checkbox) {
                return checkbox.checked;
            })
            .map(function (checkbox) {
                return checkbox.value;
            });

        return selectedUsers;
    }

    function makeDivPost(t, post, tableUser, list_department) {
        t.clear();

        var scrollcontainer = t.add(new innovaphone.ui1.Div(null, null, "list-box scrolltable"))
        var tableMain = scrollcontainer.add(new innovaphone.ui1.Node("table", null, null, "table").setAttribute("id", "local-table"));
        tableMain.add(new innovaphone.ui1.Node("th", null, "ID", null));
        tableMain.add(new innovaphone.ui1.Node("th", null, texts.text("labelCfgPost"), null));
        tableMain.add(new innovaphone.ui1.Node("th", null, texts.text("labelPostDateStart"), null));
        tableMain.add(new innovaphone.ui1.Node("th", null, texts.text("labelPostDateEnd"), null));
        tableMain.add(new innovaphone.ui1.Node("th", null, texts.text("labelPostCreator"), null));
        tableMain.add(new innovaphone.ui1.Node("th", null, texts.text("labelPostStatus") + "?", null));
        tableMain.add(new innovaphone.ui1.Node("th", null, texts.text("labelPostDeleted") + "?", null));
        tableMain.add(new innovaphone.ui1.Node("th", null, texts.text("labelPostEdit"), null));

        post.forEach(function (post) {
            var users = list_tableUsers.filter(function (user) {
                return post.user_guid === user.guid;
            });
            var starDate = new Date(post.date_start);
            var endDate = new Date(post.date_end);
            var now = new Date();

            var userName = users.length > 0 ? users[0].cn : '';

            if (post.deleted == null) {
                var postDel = "Não"
            } else {
                var dateString = post.deleted;
                var date = new Date(dateString);
                var day = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();
                var hours = date.getHours();
                var minutes = date.getMinutes();
                var formattedDate = (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year + ' - ' + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
                var postDel = formattedDate
            }
            //var departDel = depart.deleted == null ? "Não" : formatDate();
            if (post.deleted) {
                var statusPost = texts.text("labelPostDeleted");
            } else if (starDate > now) {
                var statusPost = texts.text("labelPostFuture");
            } else if (endDate < now) {
                var statusPost = texts.text("labelPostExpired");
            } else {
                var statusPost = texts.text("labelPostActive");
            }
            if (post.date_start) {
                var dateString = post.date_start;
                var date = new Date(dateString);
                var day = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();
                var hours = date.getHours();
                var minutes = date.getMinutes();
                var formattedDateStart = (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year + ' - ' + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
            }
            if (post.date_end) {
                var dateString = post.date_end;
                var date = new Date(dateString);
                var day = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();
                var hours = date.getHours();
                var minutes = date.getMinutes();
                var formattedDateEnd = (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year + ' - ' + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
            }
            var html = `
                      <tr>
                        <td style="text-transform: capitalize; text-align: center;">${post.id}</td>
                        <td style="background-color: ${post.color}; text-transform: capitalize; text-align: center;">${post.title}</td>
                        <td style="text-transform: capitalize; text-align: center;">${formattedDateStart}</td>
                          <td style="text-transform: capitalize; text-align: center;">${formattedDateEnd}</td>
                        <td style="text-transform: capitalize; text-align: center;">${userName}</td>
                        <td style="text-transform: capitalize; text-align: center;">${statusPost}</td>
                        <td style="text-transform: capitalize; text-align: center;">${postDel}</td>
                        <td style="display: flex; justify-content: center; align-items: center;"><div id="${post.id}"  class="btnChgDpto" style="background-color: ${post.color};"></div></td>
                      </tr>
                    `;

            document.getElementById("local-table").innerHTML += html;

        });
        var divs = document.getElementsByClassName("btnChgDpto");

        for (var i = 0; i < divs.length; i++) {
            divs[i].addEventListener("click", function (event) {
                // Obtenha o ID da DIV clicada.
                var idPostClick = event.currentTarget.id;

                editPostForm(_colDireita, post, idPostClick)

                // Execute a ação desejada com base no ID da DIV clicada.
                console.log("A DIV com ID " + idPostClick + " foi clicada.");
                // Você pode usar idDaDivClicada para executar a ação específica para essa DIV.
                // Por exemplo, você pode buscar os dados relacionados a esse ID e iniciar a edição.
            });
        }

    }
    function editPostForm(t, post, dep_id) {
        console.log('TODOS OS DEPART: ', list_departments);
        console.log('DADOS POST: ', post)
        console.log('DADOS DO DEP_ID: ', dep_id);

        var clickedPost = list_post.filter(function (item) {
            return item.id === parseInt(dep_id, 10);
        })[0];
        console.log('DADOS POST CLICADO: ', clickedPost)

        var departPost = clickedPost.department
        console.log('DADOS ID DEPART DO POST CLICADO CLICADO: ', departPost)


        var depart = list_departments.filter(function (department) {
            return department.id == departPost;
        })[0];

        console.log('DADOS DO FILTRO DO DEPART: ', depart);
        console.log('DADO NAME DO DEPART: ', depart.name);
        t.clear()

        var worktable = t.add(new innovaphone.ui1.Div(null, null, "list-box scrolltable"));
        worktable.setAttribute('id', 'worktable')

        
        var postMsgDiv = worktable.add(new innovaphone.ui1.Node("div", null, null, 'postmsg').setAttribute("id", "postmsg"));
        document.getElementById('postmsg').style.backgroundColor = clickedPost.color;

        var nameBoxDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, depart.name, 'namebox').setAttribute("id", "namebox"));
        var closeWindowDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, null, 'closewindow').setAttribute("id", "closewindow"));
        var titleMsgDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, null, 'titlemsg').setAttribute("id", "titlemsg"));
        var titleinput = titleMsgDiv.add(new innovaphone.ui1.Input('color: #ffff; background-color: rgb(93 126 131 / 36%);', clickedPost.title, "Título", 40, "text", 'titleinput').setAttribute("id", "titleevent"));
        var msgBoxDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, null, 'msgbox').setAttribute("id", "msgbox"));
        var msgBoxText = msgBoxDiv.add(new innovaphone.ui1.Node('textarea', null, clickedPost.description, 'msgevent').setAttribute("id", "msgevent"));
        msgBoxText.setAttribute('placeHolder', 'Texto da Mensagem: ');
        msgBoxText.setAttribute('maxLenght', '1000');

        var p = msgBoxDiv.add(new innovaphone.ui1.Node('p', null, '1000', 'char-counter').setAttribute("id", "charCount"));
        var textarea = document.getElementById("msgevent");
        var charCountSpan = document.getElementById("charCount");
        var maxChars = 1000;

        textarea.addEventListener("input", function () {
            var remainingChars = maxChars - textarea.value.length;
            charCountSpan.textContent = remainingChars;
        });
        var dateText = postMsgDiv.add(new innovaphone.ui1.Node('div', 'color: #ffff; background-color: rgb(93 126 131 / 36%);', null, 'datetext').setAttribute("id", "datetext"));
        var aTextStart = dateText.add(new innovaphone.ui1.Node('a', 'width: 100%; padding: 0px 0px 0 50px;', 'Data de Início: ', 'date').setAttribute("id", "date"));
        var aTextEnd = dateText.add(new innovaphone.ui1.Node('a', 'width: 100%; padding: 0px 0px 0 50px;', 'Data de Fim: ', 'date').setAttribute("id", "date"));

        var dateDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', 'color: #ffff; background-color: rgb(93 126 131 / 36%);', null, 'date').setAttribute("id", "date"));
        var dateStart = dateDiv.add(new innovaphone.ui1.Input(null, clickedPost.date_start, null, null, 'datetime-local', 'dateinput').setAttribute("id", "startevent"));
        var dateEnd = dateDiv.add(new innovaphone.ui1.Input(null, clickedPost.date_end, null, null, 'datetime-local', 'dateinput').setAttribute("id", "endevent"));
        var PublicPostDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", "width: 80%;display: flex;align-items: center;", null, null))
        var TypePost = PublicPostDiv.add(new innovaphone.ui1.Node("div", "color:white;", texts.text("labelTypePost"), null))
        console.log('TIPO DO POST:', clickedPost.type)

        var postType = clickedPost.type == "public" ? texts.text("labelPublic") : texts.text("labelPrivate");

        var publicPostSelect = PublicPostDiv.add(new innovaphone.ui1.Node("select", null, postType, "selectPublicPost").setAttribute("id", "selectTypePost"))
        publicPostSelect.add(new innovaphone.ui1.Node("option", null, texts.text("labelPublic"), null).setAttribute("id", "public"))
        publicPostSelect.add(new innovaphone.ui1.Node("option", null, texts.text("labelPrivate"), null).setAttribute("id", "private"))
        var buttonsDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, null, 'buttons').setAttribute("id", "buttons"));
        var paletteColor = document.getElementById('buttons').innerHTML = '<a>Selecione a cor:</a><ul id="palette" class="palette"></ul><input type="color" id="colorbox" style="display: none;">';
        var saveMsgDiv = buttonsDiv.add(new innovaphone.ui1.Node('div', null, 'Inserir', 'saveclose').setAttribute("id", "savemsg"));
        var closeMsgDiv = buttonsDiv.add(new innovaphone.ui1.Node('div', null, 'Fechar', 'saveclose').setAttribute("id", "closemsg"));
        // Adicionando o listener de clique
        var s = document.getElementById('savemsg');
        s.addEventListener('click', function () {
            function getDateNow() {
                var date = new Date();
                date.setUTCHours(date.getUTCHours() - 3);
                var dateString = date.toISOString();
                return dateString.slice(0, -8);
            };

            console.log("O elemento saveMsgDiv foi clicado!");
            var startPost = document.getElementById('startevent').value;
            var endPost = document.getElementById('endevent').value;
            var msgPost = document.getElementById('msgevent').value;
            var titlePost = document.getElementById('titleevent').value;
            var typePostSelect = document.getElementById("selectTypePost");
            var idSel = typePostSelect.options[typePostSelect.selectedIndex].id;
            var colorPost = document.getElementById("postmsg").style.backgroundColor
            var currentDate = getDateNow()
            console.log("Data Start:", startPost);
            if (msgPost === "" || msgPost === " " || titlePost === "" || startPost == "" || endPost == "") {
                window.alert("Favor preencher todos os campos corretamente para criação do post");
            } else if (endPost < startPost) {
                console.log("data inicio post" + startPost + "data atual" + currentDate);
                window.alert("A Data de término do post não pode ser menor que a data de início");
            } else if (startPost < currentDate) {
                window.alert("A data atualizada não pode ser inferior a data atual.");
            } else {
                app.send({ api: "admin", mt: "UpdatePost", id: parseInt(dep_id, 10), title: titlePost, color: colorPost, description: msgPost, department: parseInt(departPost, 10), date_start: startPost, date_end: endPost, type: idSel });
            };
            s.removeEventListener('click', s);
        });
        var d = document.getElementById('closemsg')
        d.addEventListener('click', function () {

            console.log("O elemento closeMsgDiv foi clicado!");
            makeDivPost(_colDireita, list_post, list_tableUsers);
            d.removeEventListener('click', w);
        });
        var q = document.getElementById('closewindow');
        q.addEventListener('click', function () {

            console.log("O elemento closeMsgDiv foi clicado!");
            makeDivPost(_colDireita, list_post, list_tableUsers);
            q.removeEventListener('click', q);
        });

        var colorbox = document.getElementById("colorbox")
        colorbox.addEventListener("change", function () {
            document.getElementById("postmsg").style.backgroundColor = colorbox.value;
        })
        var palette = document.getElementById("palette")
        palette.addEventListener("click", function () {
            colorbox.click();
        })
    }
}

Wecom.billboardAdmin.prototype = innovaphone.ui1.nodePrototype;