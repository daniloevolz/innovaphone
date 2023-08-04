
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.billboard = Wecom.billboard || function (start, args) {
    this.createNode("body");
    var that = this;
    var list_departments = [];
    var list_tableUsers = [];
    var list_posts = [];
    var postsProvisorio = [
        { id: 'post#1', title: 'ATESTADOS', color: '#f83200', description: 'Testes de descrição hsadeih dusaid, dsdjsakkdbdk dhuatrnadbiwr gusdjsa gjdv gvadwvawh vdvwvda. Gdshuhdsu syuw!', date_end: '31/02/2024 00:01:34' },
        { id: 'post#2', title: 'ALTERAÇÕES DO PLANO DE SAÚDE', color: '#7ff6ff', description: 'Testes de descrição hsadeih dusaid, dsdjsakkdbdk dhuatrnadbiwr gusdjsa gjdv gvadwvawh vdvwvda. Gdshuhdsu syuw!', date_end: '31/02/2024 00:01:34' },
    { id: 'post#3', title: 'PAGAMENTO DE BONUS', color: '#13a31b', description: 'Testes de descrição', date_end: '31/02/2024 00:01:34' },
    { id: 'post#4', title: 'IR DATAS', color: '#920d0d', description: 'Testes de descrição hsadeih dusaid, dsdjsakkdbdk dhuatrnadbiwr gusdjsa gjdv gvadwvawh vdvwvda. Gdshuhdsu syuw!', date_end: '31/02/2024 00:01:34' },
    { id: 'post#5', title: 'REUNIÕES', color: '#31c214', description: 'Testes de descrição', date_end: '31/02/2024 00:01:34' },
    { id: 'post#6', title: 'HORÁRIOS', color: '#cea00b', description: 'Testes de descrição', date_end: '31/02/2024 00:01:34' },
    { id: 'post#7', title: 'AGENDA', color: '#1b24a1', description: 'Testes de descrição', date_end: '31/02/2024 00:01:34' },
    { id: 'post#8', title: 'ANIVERSÁRIOS DO MÊS', color: '#0088f8', description: 'Testes de descrição', date_end: '31/02/2024 00:01:34' },
    ];

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
        if (obj.api == "user" && obj.mt == "SelectViewsHistoryResult") {
            console.log(obj.result);
            views_history = JSON.parse(obj.result);
            updateFlagNew();
        }
        if (obj.api == "user" && obj.mt == "SelectDepartmentsViewerResult") {
            console.log(obj.result);
            list_departments = JSON.parse(obj.result);
            makeDivDepartments();
        }
        if (obj.api == "user" && obj.mt == "SelectPostsResult") {
            console.log(obj.result);
            list_posts = JSON.parse(obj.result);
            makeDivPosts(obj.department);
        }
        if (obj.api == "user" && obj.mt == "InsertDepartmentSuccess") {
            app.send({ api: "user", mt: "SelectDepartments"});
        }
        
    }

    function makeDivDepartments() {
        // Cria��o do elemento ftground
        var worktable = document.createElement('div');
        worktable.id = 'worktable';
        worktable.style.display = 'flex';
        worktable.style.width = '100%';
        worktable.style.height = '100vh';
        worktable.style.justifyContent = 'center';
        worktable.style.flexDirection = 'column';
        worktable.style.alignItems = 'center';
        //worktable.style.backgroundColor = 'white';
        // ftground.style.borderRadius = '20px';

        // Cria��o do elemento headbanner
        var headbanner = document.createElement('div');
        headbanner.id = 'headbanner';
        headbanner.style.backgroundImage = 'url("./images/header_wecom.png")';
        //headbanner.style.backgroundColor = 'rgba(132, 0, 255, 0.644)';
        headbanner.style.backgroundRepeat = 'no-repeat';
        headbanner.style.backgroundSize = 'cover';
        headbanner.style.position = 'absolute';
        headbanner.style.height = '20%';
        headbanner.style.top = '0%';
        headbanner.style.width = '100%';
        headbanner.style.fontSize = '35px';
        headbanner.style.display = 'flex';
        headbanner.style.justifyContent = 'center';
        headbanner.style.alignItems = 'center';
        // headbanner.style.borderTopLeftRadius = '20px';
        // headbanner.style.borderTopRightRadius = '20px';
        //headbanner.textContent = 'MURAL DE AVISOS WECOM';
        worktable.appendChild(headbanner);

        // Cria��o do elemento depcards
        var depcards = document.createElement('div');
        depcards.id = 'depcards';
        depcards.style.position = 'absolute';
        //depcards.style.backgroundColor = 'rgba(136, 255, 132, 0.767)';
        depcards.style.display = 'flex';
        depcards.style.flexWrap = 'wrap';
        depcards.style.width = '100%';
        depcards.style.overflowY = 'auto';
        depcards.style.height = '80%';
        depcards.style.justifyContent = 'center';
        depcards.style.alignItems = 'center';
        worktable.appendChild(depcards);


        //var depCardsContainer = document.getElementById('depcards');

        depcards.innerHTML = '';

        list_departments.forEach(function (department) {

            var div = document.createElement('div');
            div.id = department.id;
            div.textContent = department.name;
            div.style.display = 'flex';
            div.style.justifyContent = 'center';
            div.style.alignItems = 'center';
            div.style.width = '150px';
            div.style.height = '40px';
            div.style.borderRadius = '5px';
            div.style.backgroundColor = department.color;
            div.style.margin = '10px';

            // Adicionar o event listener de clique
            div.addEventListener('click', function () {
                // Coletar o ID do elemento div clicado
                var clickedId = this.id;
                console.log('ID do elemento div clicado:', clickedId);
                app.send({ api: "user", mt: "SelectPosts", department: clickedId });

            });


            depcards.appendChild(div);

        });
        var divAdd = document.createElement('div');
        divAdd.textContent = "Adicionar +";
        divAdd.style.display = 'flex';
        divAdd.style.justifyContent = 'center';
        divAdd.style.alignItems = 'center';
        divAdd.style.width = '150px';
        divAdd.style.height = '40px';
        divAdd.style.borderRadius = '5px';
        divAdd.style.backgroundColor = 'rgb(96, 154, 201)';
        divAdd.style.margin = '10px';

        depcards.appendChild(divAdd)

        // Adicionando o listener de clique
        divAdd.addEventListener('click', function () {

            console.log("O elemento divAdd foi clicado!");
            createDepartmentForm();
        });

        // Obter a div com o ID 'billboard'
        var billboardDiv = document.getElementById('billboard');
        if (billboardDiv) {

            // Adicionar o elemento 'worktable' ao 'billboardDiv'
            billboardDiv.innerHTML = '';
            billboardDiv.appendChild(worktable);
        } else {
            console.error("A div com o ID 'billboard' não foi encontrada.");
        }
        // Iterar sobre a lista inputData e chamar a função para cada item
        for (var i = 0; i < views_history.length; i++) {
            var department = views_history[i].department;
            changeBackgroundColor(department);
        }
    }
    function makeDivPosts(dep_id) {
        // Criar os elementos HTML
        var worktable = document.createElement('div');
        worktable.id = 'worktable';
        worktable.style.display = 'flex';
        worktable.style.width = '100%';
        worktable.style.height = '100vh';
        worktable.style.justifyContent = 'center';
        worktable.style.flexDirection = 'column';
        worktable.style.alignItems = 'center';

        // Cria��o do elemento headbanner
        var headbanner = document.createElement('div');
        headbanner.id = 'headbanner';
        headbanner.style.position = 'absolute';
        headbanner.style.backgroundImage = 'url("./images/header_wecom.png")';
        headbanner.style.backgroundRepeat = 'no-repeat';
        headbanner.style.backgroundSize = 'cover';
        headbanner.style.height = '20%';
        headbanner.style.top = '0%';
        headbanner.style.width = '100%';
        headbanner.style.fontSize = '35px';
        headbanner.style.display = 'flex';
        headbanner.style.justifyContent = 'center';
        headbanner.style.alignItems = 'center';
        // headbanner.style.borderTopLeftRadius = '20px';
        // headbanner.style.borderTopRightRadius = '20px';
        //headbanner.textContent = 'MURAL DE AVISOS WECOM';
        worktable.appendChild(headbanner);

        var postDepartDiv = document.createElement('div');
        postDepartDiv.id = 'post-depart';
        postDepartDiv.style.position = 'absolute';
        postDepartDiv.style.display = 'flex';
        depcards.style.paddingTop = '4%';
        postDepartDiv.style.flexWrap = 'wrap';
        postDepartDiv.style.overflowY = 'auto';
        postDepartDiv.style.width = '100%';
        postDepartDiv.style.top = '20%';
        postDepartDiv.style.height = '80%';
        postDepartDiv.style.justifyContent = 'center';
        postDepartDiv.style.alignItems = 'center';
        postDepartDiv.style.alignContent = 'center';


        // Criar divs para cada departamento
        postsProvisorio.forEach(function (post) {
            var postDiv = document.createElement('div');
            postDiv.id = post.id;
            postDiv.textContent = post.title;
            postDiv.style.display = 'flex';
            postDiv.style.justifyContent = 'center';
            postDiv.style.alignItems = 'center';
            postDiv.style.width = '250px';
            postDiv.style.height = '200px';
            postDiv.style.textAlign = 'center';
            postDiv.style.borderRadius = '0px';
            postDiv.style.backgroundColor = post.color;
            postDiv.style.margin = '15px';
            postDiv.style.fontSize = '25px';
            postDiv.style.color = 'white';

            // Adicionar o event listener de clique
            postDiv.addEventListener('click', function () {
                // Coletar o ID do elemento div clicado
                var clickedId = this.id;
                console.log('ID do elemento div clicado:', clickedId);
                makeDivPostMessage(clickedId);

            });

            postDepartDiv.appendChild(postDiv);
        });
        worktable.appendChild(postDepartDiv);

        // Criar os elementos 'Adicionar +'
        var postNew1Div = document.createElement('div');
        postNew1Div.id = 'postnew1';
        postNew1Div.textContent = 'Adicionar +';
        postNew1Div.style.display = 'flex';
        postNew1Div.style.justifyContent = 'center';
        postNew1Div.style.alignItems = 'center';
        postNew1Div.style.width = '250px';
        postNew1Div.style.height = '200px';
        postNew1Div.style.textAlign = 'center';
        postNew1Div.style.borderRadius = '0px';
        postNew1Div.style.backgroundColor = '#44575B';
        postNew1Div.style.margin = '15px';
        postNew1Div.style.fontSize = '25px';
        postNew1Div.style.color = 'white';

        // Adicionando o listener de clique
        postNew1Div.addEventListener('click', function () {

            console.log("O elemento divAdd foi clicado!");
            createPostForm(dep_id);
        });
        

        // Adicionar os elementos criados � div com o ID 'post-depart'
        postDepartDiv.appendChild(postNew1Div);
  
        // Obter a div com o ID 'billboard'
        var billboardDiv = document.getElementById('billboard');
        if (billboardDiv) {

            // Adicionar o elemento 'worktable' ao 'billboardDiv'
            billboardDiv.innerHTML = '';
            billboardDiv.appendChild(worktable);
        } else {
            console.error("A div com o ID 'billboard' não foi encontrada.");
        }
        // Iterar sobre a lista inputData e chamar a função para cada item
        for (var i = 0; i < views_history.length; i++) {
            var post = views_history[i].id;
            changeBackgroundColor(post);
        }
    }
    function makeDivPostMessage(id) {
        var post = postsProvisorio.filter(function (item) {
            return item.id === id;
        })[0];
        // Criar os elementos HTML
        var postMsgDiv = document.createElement('div');
        postMsgDiv.id = 'postmsg';
        postMsgDiv.style.display = 'flex';
        postMsgDiv.style.flexDirection = 'column';
        postMsgDiv.style.alignItems = 'center';
        postMsgDiv.style.position = 'absolute';
        postMsgDiv.style.width = '40%';
        postMsgDiv.style.height = '80%';
        postMsgDiv.style.backgroundColor = post.color;;

        var nameBoxDiv = document.createElement('div');
        nameBoxDiv.id = 'namebox';
        nameBoxDiv.style.display = 'flex';
        nameBoxDiv.style.color = 'white';
        nameBoxDiv.style.width = '90%';
        nameBoxDiv.style.height = '10%';
        nameBoxDiv.style.justifyContent = 'center';
        nameBoxDiv.innerHTML = 'AVISO';

        var titleMsgDiv = document.createElement('div');
        titleMsgDiv.id = 'titlemsg';
        titleMsgDiv.style.display = 'flex';
        titleMsgDiv.style.justifyContent = 'center';
        titleMsgDiv.style.color = 'white';
        titleMsgDiv.style.width = '90%';
        titleMsgDiv.style.height = '10%';
        titleMsgDiv.innerHTML = post.title;

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
        msgContent.innerHTML = post.description;

        var closeDateDiv = document.createElement('div');
        closeDateDiv.id = 'closedate';
        closeDateDiv.style.display = 'flex';
        closeDateDiv.style.color = 'white';
        closeDateDiv.style.width = '90%';
        closeDateDiv.style.height = '10%';
        closeDateDiv.style.justifyContent = 'flex-end';
        closeDateDiv.innerHTML = post.date_end;

        // Adicionar os elementos criados � div com o ID 'billboard'
        var billboardDiv = document.getElementById('billboard');
        if (billboardDiv) {
            //billboardDiv.innerHTML = '';
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

    
    function createPostForm(dep_id) {
        var department = list_departments.filter(function (item) {
            return item.id === parseInt(dep_id,10);
        })[0];
        var postMsgDiv = document.createElement('div');
        postMsgDiv.id = 'postmsg';
        postMsgDiv.style.display = 'flex';
        postMsgDiv.style.flexDirection = 'column';
        postMsgDiv.style.alignItems = 'center';
        postMsgDiv.style.position = 'absolute';
        postMsgDiv.style.width = '40%';
        postMsgDiv.style.height = '80%';
        postMsgDiv.style.backgroundColor = '#0f243f59';

        var nameBoxDiv = document.createElement('div');
        nameBoxDiv.id = 'namebox';
        nameBoxDiv.style.display = 'flex';
        nameBoxDiv.style.color = 'white';
        nameBoxDiv.style.width = '90%';
        nameBoxDiv.style.height = '10%';
        nameBoxDiv.style.justifyContent = 'center';
        nameBoxDiv.innerHTML = department.name;

        var titleMsgDiv = document.createElement('div');
        titleMsgDiv.id = 'titlemsg';
        titleMsgDiv.style.display = 'flex';
        titleMsgDiv.style.backgroundColor = '#5d7e83ef';
        titleMsgDiv.style.color = 'white';
        titleMsgDiv.style.width = '90%';
        titleMsgDiv.style.height = '10%';
        titleMsgDiv.style.marginTop = '5px';
        titleMsgDiv.style.marginBottom = '15px';
        titleMsgDiv.innerHTML = '<input id="titleevent" type="text" placeholder="Titulo da mensagem" style="color: #ffff;">';

        var msgBoxDiv = document.createElement('div');
        msgBoxDiv.id = 'msgbox';
        msgBoxDiv.style.display = 'flex';
        msgBoxDiv.style.backgroundColor = '#5d7e83ef';
        msgBoxDiv.style.color = 'white';
        msgBoxDiv.style.width = '90%';
        msgBoxDiv.style.height = '60%';
        msgBoxDiv.innerHTML = '<textarea name="" id="msgevent" cols="30" rows="80" placeholder="Texto da mensagem" aria-placeholder="asdsdafa" maxlength="1000"></textarea>';

        var dateDiv = document.createElement('div');
        dateDiv.id = 'date';
        dateDiv.style.display = 'flex';
        dateDiv.style.alignItems = 'center';
        dateDiv.style.color = 'white';
        dateDiv.style.width = '90%';
        dateDiv.style.height = '10%';
        dateDiv.style.justifyContent = 'flex-end';
        dateDiv.innerHTML = 'Data de Início: <input type="date" id="startevent" class="date"> Data de Expiração: <input type="date" id="endevent" class="date">';

        var buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'buttons';
        buttonsDiv.style.display = 'flex';

        var saveMsgDiv = document.createElement('div');
        saveMsgDiv.id = 'savemsg';
        saveMsgDiv.className = 'saveclose';
        saveMsgDiv.textContent = 'Inserir';

        var postColorInput = document.createElement('input');
        postColorInput.id = 'postColor';
        postColorInput.type = 'color';
        postColorInput.style.margin = '10px';

        postColorInput.addEventListener("change", function () {
            postMsgDiv.style.backgroundColor = postColorInput.value;
        })

        // Adicionando o listener de clique
        saveMsgDiv.addEventListener('click', function () {

            console.log("O elemento saveMsgDiv foi clicado!");
            var startPost = document.getElementById('startevent').value;
            var endPost = document.getElementById('endevent').value;
            var msgPost = document.getElementById('msgevent').value;
            var titlePost = document.getElementById('titleevent').value;
            var colorPost = postColorInput.value;

            console.log("Data Start:", startPost);
            app.send({ api: "user", mt: "InsertPost", title: titlePost, color: colorPost, description: msgPost, department: parseInt(dep_id,10), date_start: startPost, date_end: endPost });
        });

        var closeMsgDiv = document.createElement('div');
        closeMsgDiv.id = 'closemsg';
        closeMsgDiv.className = 'saveclose';
        closeMsgDiv.textContent = 'Fechar';

        // Adicionando o listener de clique
        closeMsgDiv.addEventListener('click', function () {

            console.log("O elemento closeMsgDiv foi clicado!");
            makeDivPosts(dep_id);
        });

        buttonsDiv.appendChild(saveMsgDiv);
        buttonsDiv.appendChild(closeMsgDiv);
        postMsgDiv.appendChild(nameBoxDiv);
        postMsgDiv.appendChild(titleMsgDiv);
        postMsgDiv.appendChild(msgBoxDiv);
        postMsgDiv.appendChild(dateDiv);
        postMsgDiv.appendChild(postColorInput);
        postMsgDiv.appendChild(buttonsDiv);

        // Exemplo de uso para adicionar os elementos criados à div com o ID 'billboard'
        var billboardDiv = document.getElementById('billboard');
        if (billboardDiv) {
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


        // Event listener de clique para o bot�o "Salvar"
        saveButtonDiv.addEventListener('click', function () {
            // Aqui voc� pode implementar a a��o que deseja realizar quando o bot�o � clicado
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

        // Adicionar os elementos criados � div com o ID 'billboard'
        var billboardDiv = document.getElementById('billboard');
        if (billboardDiv) {
            postMsgDiv.appendChild(departmentNameInput);
            postMsgDiv.appendChild(departmentColorInput);
            postMsgDiv.appendChild(saveButtonDiv);

            billboardDiv.appendChild(postMsgDiv);

            createUsersDepartmentsGrid();
        } else {
            console.error("A div com o ID 'billboard' n�o foi encontrada.");
        }
    }

    function createUsersDepartmentsGrid() {
        var departmentsGrid = document.getElementById('postmsg');

        // Criar a primeira linha para os cabe�alhos das colunas
        var headerRow = document.createElement('div');
        headerRow.classList.add('row');

        var nameCol = document.createElement('div');
        nameCol.classList.add('column');
        nameCol.textContent = 'Nome do Usu�rio';

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
    // Função para buscar e alterar a cor de background do elemento
    function changeBackgroundColor(elementId) {
        var element = document.getElementById(elementId);
        if (element) {
            element.style.backgroundColor = "red";
        }
    }
}

Wecom.billboard.prototype = innovaphone.ui1.nodePrototype;
