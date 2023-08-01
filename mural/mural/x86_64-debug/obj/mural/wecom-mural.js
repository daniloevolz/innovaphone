
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.mural = Wecom.mural || function (start, args) {
    this.createNode("body");
    var that = this;
    var list_departments = []
    var list_tableUsers = [];

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

    var texts = new innovaphone.lib1.Languages(Wecom.muralTexts, start.lang);
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "user", mt: "TableUsers" });
        app.send({ api: "user", mt: "SelectDepartments" });
    }

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "TableUsersResult") {
            list_tableUsers = JSON.parse(obj.result);
        }
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
        }
        if (obj.api == "user" && obj.mt == "SelectDepartmentsResult") {
            console.log(obj.result);
            list_departments = JSON.parse(obj.result);
            makeDivDepartments();
        }
    }
    function makeDivDepartments() {
        // Criação do elemento ftground
        var ftground = document.createElement('div');
        ftground.id = 'ftground';
        ftground.style.display = 'flex';
        ftground.style.width = '100%';
        ftground.style.height = '100vh';
        ftground.style.justifyContent = 'center';
        ftground.style.flexDirection = 'column';
        ftground.style.alignItems = 'center';
        ftground.style.backgroundColor = 'white';
        // ftground.style.borderRadius = '20px';

        // Criação do elemento headbanner
        var headbanner = document.createElement('div');
        headbanner.id = 'headbanner';
        headbanner.style.backgroundColor = 'rgba(132, 0, 255, 0.644)';
        headbanner.style.height = '30%';
        headbanner.style.width = '100%';
        headbanner.style.fontSize = '35px';
        headbanner.style.display = 'flex';
        headbanner.style.justifyContent = 'center';
        headbanner.style.alignItems = 'center';
        // headbanner.style.borderTopLeftRadius = '20px';
        // headbanner.style.borderTopRightRadius = '20px';
        headbanner.textContent = 'Banner: MURAL DE AVISOS WECOM';
        ftground.appendChild(headbanner);

        // Criação do elemento depcards
        var depcards = document.createElement('div');
        depcards.id = 'depcards';
        depcards.style.backgroundColor = 'rgba(136, 255, 132, 0.767)';
        depcards.style.display = 'flex';
        depcards.style.flexWrap = 'wrap';
        depcards.style.width = '100%';
        depcards.style.height = '70%';
        depcards.style.justifyContent = 'center';
        depcards.style.alignItems = 'center';
        ftground.appendChild(depcards);

        // FOR EACH DO BANCO

        // Criação do elemento pgbuttom
        var pgbuttom = document.createElement('div');
        pgbuttom.id = 'pgbuttom';
        pgbuttom.style.width = '100%';
        pgbuttom.style.display = 'flex';
        pgbuttom.style.justifyContent = 'center';

        // Criação dos elementos ul (pg-1, pg-2, pg-3)
        for (var i = 1; i <= 3; i++) {
            var ul = document.createElement('ul');
            ul.id = 'pg-' + i;
            ul.style.display = 'flex';
            ul.style.justifyContent = 'center';
            ul.style.backgroundColor = i === 1 ? 'rgb(96, 154, 201)' : 'rgb(189, 187, 187)';
            ul.style.borderRadius = '50%';
            ul.style.width = '20px';
            ul.style.height = '20px';
            ul.style.padding = '0';
            ul.style.marginLeft = '5px';
            ul.style.marginRight = '5px';
            ul.textContent = i;
            pgbuttom.appendChild(ul);
        }

        ftground.appendChild(pgbuttom);

        // Adicionando o elemento ftground ao body
        document.body.appendChild(ftground);

        var depCardsContainer = document.getElementById('depcards');

        depCardsContainer.innerHTML = '';

        list_departments.forEach(function (department) {

            var div = document.createElement('div');
            div.id = department.id;
            div.textContent = department.name;
            div.style.display = 'flex';
            div.style.justifyContent = 'center';
            div.style.alignItems = 'center';
            div.style.width = '120px';
            div.style.height = '40px';
            div.style.borderRadius = '5px';
            div.style.backgroundColor = department.color;
            div.style.margin = '10px';


            depCardsContainer.appendChild(div);

        });
        var divAdd = document.createElement('div');
        divAdd.textContent = "Adicionar +";
        divAdd.style.display = 'flex';
        divAdd.style.justifyContent = 'center';
        divAdd.style.alignItems = 'center';
        divAdd.style.width = '120px';
        divAdd.style.height = '40px';
        divAdd.style.borderRadius = '5px';
        divAdd.style.backgroundColor = 'rgb(96, 154, 201)';
        divAdd.style.margin = '10px';

        depCardsContainer.appendChild(divAdd)

        // Adicionando o listener de clique
        divAdd.addEventListener('click', function () {

            console.log("O elemento divAdd foi clicado!");
            createDepartmentForm();
        });
    }

    function createPostMessage() {
        // Criar os elementos HTML
        var postMsgDiv = document.createElement('div');
        postMsgDiv.id = 'postmsg';
        postMsgDiv.style.display = 'flex';
        postMsgDiv.style.flexDirection = 'column';
        postMsgDiv.style.alignItems = 'center';
        postMsgDiv.style.position = 'absolute';
        postMsgDiv.style.width = '40%';
        postMsgDiv.style.height = '80%';
        postMsgDiv.style.backgroundColor = '#29336ed0';

        var nameBoxDiv = document.createElement('div');
        nameBoxDiv.id = 'namebox';
        nameBoxDiv.style.display = 'flex';
        nameBoxDiv.style.color = 'white';
        nameBoxDiv.style.width = '90%';
        nameBoxDiv.style.height = '10%';
        nameBoxDiv.style.justifyContent = 'center';
        nameBoxDiv.innerHTML = '<ul>NAME BOX - ATESTADOS</ul>';

        var titleMsgDiv = document.createElement('div');
        titleMsgDiv.id = 'titlemsg';
        titleMsgDiv.style.display = 'flex';
        titleMsgDiv.style.color = 'white';
        titleMsgDiv.style.width = '90%';
        titleMsgDiv.style.height = '10%';
        titleMsgDiv.innerHTML = '<ul>TITLE BOX</ul>';

        var msgBoxDiv = document.createElement('div');
        msgBoxDiv.id = 'msgbox';
        msgBoxDiv.style.display = 'flex';
        msgBoxDiv.style.color = 'white';
        msgBoxDiv.style.width = '90%';
        msgBoxDiv.style.height = '80%';

        var scrollBox = document.createElement('scroll-box');
        scrollBox.style.display = 'flex';
        scrollBox.style.color = 'white';
        scrollBox.style.width = '100%';
        scrollBox.style.height = '100%';

        var msgContent = document.createElement('ul');
        msgContent.innerHTML = '<span>TEXTO DA MENSÁGEM</span>';

        var closeDateDiv = document.createElement('div');
        closeDateDiv.id = 'closedate';
        closeDateDiv.style.display = 'flex';
        closeDateDiv.style.color = 'white';
        closeDateDiv.style.width = '90%';
        closeDateDiv.style.height = '10%';
        closeDateDiv.style.justifyContent = 'flex-end';
        closeDateDiv.innerHTML = '<ul>Expirate date:  ___/___/_____</ul>';

        // Adicionar os elementos criados à div com o ID 'billboard'
        var billboardDiv = document.getElementById('billboard');
        if (billboardDiv) {
            billboardDiv.innerHTML = '';
            scrollBox.appendChild(msgContent);
            msgBoxDiv.appendChild(scrollBox);

            postMsgDiv.appendChild(nameBoxDiv);
            postMsgDiv.appendChild(titleMsgDiv);
            postMsgDiv.appendChild(msgBoxDiv);
            postMsgDiv.appendChild(closeDateDiv);

            billboardDiv.appendChild(postMsgDiv);
        } else {
            console.error("A div com o ID 'billboard' não foi encontrada.");
        }
    }

    function createDepartmentForm() {
        // Criar os elementos HTML
        var postMsgDiv = document.createElement('div');
        postMsgDiv.id = 'postmsg';
        postMsgDiv.style.display = 'flex';
        postMsgDiv.style.flexDirection = 'column';
        postMsgDiv.style.alignItems = 'center';
        postMsgDiv.style.position = 'absolute';
        postMsgDiv.style.width = '40%';
        postMsgDiv.style.height = '80%';
        postMsgDiv.style.backgroundColor = '#29336ed0';

        var departmentNameInput = document.createElement('input');
        departmentNameInput.id = 'departmentName';
        departmentNameInput.type = 'text';
        departmentNameInput.placeholder = 'Department Name';
        departmentNameInput.style.margin = '10px';

        var departmentColorInput = document.createElement('input');
        departmentColorInput.id = 'departmentColor';
        departmentColorInput.type = 'color';
        departmentColorInput.style.margin = '10px';

        var saveButtonDiv = document.createElement('div');
        saveButtonDiv.textContent = 'Salvar';
        saveButtonDiv.style.display = 'flex';
        saveButtonDiv.style.color = 'white';
        saveButtonDiv.style.width = '90%';
        saveButtonDiv.style.height = '10%';
        saveButtonDiv.style.justifyContent = 'center';
        saveButtonDiv.style.alignItems = 'center';
        saveButtonDiv.style.backgroundColor = 'rgb(96, 154, 201)';
        saveButtonDiv.style.borderRadius = '5px';
        saveButtonDiv.style.margin = '10px';
        saveButtonDiv.style.cursor = 'pointer';


        // Event listener de clique para o botão "Salvar"
        saveButtonDiv.addEventListener('click', function () {
            // Aqui você pode implementar a ação que deseja realizar quando o botão é clicado
            var departmentName = departmentNameInput.value;
            var departmentColor = departmentColorInput.value;
            console.log("Salvar clicado!");
            console.log("Nome do departamento:", departmentName);
            console.log("Cor selecionada:", departmentColor);
            var editorDepartments = getSelectedUsersDepartments('editor');
            var viewerDepartments = getSelectedUsersDepartments('viewer');
            console.log("Nome dos departamentos visiveis:", viewerDepartments);
            console.log("Nome dos departamentos editaveis:", editorDepartments);
            app.send({ api: "user", mt: "InsertDepartment", name: departmentName, color: departmentColor, viewers: viewerDepartments, editors: editorDepartments });
        });

        // Adicionar os elementos criados à div com o ID 'billboard'
        var billboardDiv = document.getElementById('billboard');
        if (billboardDiv) {
            postMsgDiv.appendChild(departmentNameInput);
            postMsgDiv.appendChild(departmentColorInput);
            postMsgDiv.appendChild(saveButtonDiv);

            billboardDiv.appendChild(postMsgDiv);

            createUsersDepartmentsGrid();
        } else {
            console.error("A div com o ID 'billboard' não foi encontrada.");
        }
    }
    function createUsersDepartmentsGrid() {
        var departmentsGrid = document.getElementById('postmsg');

        // Criar a primeira linha para os cabeçalhos das colunas
        var headerRow = document.createElement('div');
        headerRow.classList.add('row');

        var nameCol = document.createElement('div');
        nameCol.classList.add('column');
        nameCol.textContent = 'Nome do Usuário';

        var editorCol = document.createElement('div');
        editorCol.classList.add('column');
        editorCol.textContent = 'Editor';

        var viewerCol = document.createElement('div');
        viewerCol.classList.add('column');
        viewerCol.textContent = 'Visualizador';

        headerRow.appendChild(nameCol);
        headerRow.appendChild(editorCol);
        headerRow.appendChild(viewerCol);

        departmentsGrid.appendChild(headerRow);

        // Criar as demais linhas com os dados dos departamentos
        list_tableUsers.forEach(function (user) {
            var row = document.createElement('div');
            row.classList.add('row');

            var nameCol = document.createElement('div');
            nameCol.classList.add('column');
            nameCol.textContent = user.cn;

            var editorCol = document.createElement('div');
            editorCol.classList.add('column');
            var editorCheckbox = document.createElement('input');
            editorCheckbox.type = 'checkbox';
            editorCheckbox.name = 'editorDepartments';
            editorCheckbox.value = user.guid;
            editorCol.appendChild(editorCheckbox);

            var viewerCol = document.createElement('div');
            viewerCol.classList.add('column');
            var viewerCheckbox = document.createElement('input');
            viewerCheckbox.type = 'checkbox';
            viewerCheckbox.name = 'viewerDepartments';
            viewerCheckbox.value = user.guid;
            viewerCol.appendChild(viewerCheckbox);

            row.appendChild(nameCol);
            row.appendChild(editorCol);
            row.appendChild(viewerCol);

            departmentsGrid.appendChild(row);
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

}
Wecom.mural.prototype = innovaphone.ui1.nodePrototype;
