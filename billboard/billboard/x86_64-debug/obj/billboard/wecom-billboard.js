
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.billboard = Wecom.billboard || function (start, args) {
    this.createNode("body");
    var that = this;
    var list_departments = [];
    var list_departments_editor = [];
    var list_tableUsers = [];
    var list_posts = [];
    var views_history = [];
    var list_editors_departments = [];
    var list_viewers_departments = [];
    

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
    app.onerror = waitConnection(that);
    app.onclosed = waitConnection(that);

    waitConnection(that);

    function app_connected(domain, user, dn, appdomain) {
        that.clear();
        that.add(new innovaphone.ui1.Div(null, null, "billboard").setAttribute("id", "billboard"))
        app.send({ api: "user", mt: "TableUsers" });
        app.send({ api: "user", mt: "SelectDepartments" });

    }
    
    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "TableUsersResult") {
            list_tableUsers = JSON.parse(obj.result);
        }
        if (obj.api == "user" && obj.mt == "InsertViewHistorySuccess") {
            app.send({ api: "user", mt: "SelectPosts", department: obj.src });
        }
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
        }
        if (obj.api == "user" && obj.mt == "UpdateDepartmentSuccess") {
            app.send({ api: "user", mt: "SelectDepartments" });
        }
        if (obj.api == "user" && obj.mt == "UpdatePostSuccess") {
            app.send({ api: "user", mt: "SelectPosts", department: obj.src });
        }
        if (obj.api == "user" && obj.mt == "DeleteDepartmentSuccess") {
            app.send({ api: "user", mt: "SelectDepartments" });
        }
        if (obj.api == "user" && obj.mt == "DeletePostSuccess") {
            app.send({ api: "user", mt: "SelectPosts", department: obj.src });
        }
        if (obj.api == "user" && obj.mt == "SelectViewsHistoryResult") {
            console.log(obj.result);
            views_history = JSON.parse(obj.result);
            
        }
        if (obj.api == "user" && obj.mt == "SelectHistoryByPostResult") {
            console.log(obj.result);
            createHistoryViewsPostGrid(JSON.parse(obj.result))
        }
        if (obj.api == "user" && obj.mt == "SelectUserDepartmentsViewerResult") {
            console.log(obj.result);
            list_departments = JSON.parse(obj.result);
            makeDivDepartments();
        }
        if (obj.api == "user" && obj.mt == "SelectUserDepartmentsEditorResult") {
            console.log(obj.result);
            list_departments_editor = JSON.parse(obj.result);
        }
        if (obj.api == "user" && obj.mt == "SelectPostsResult") {
            console.log(obj.result);
            list_posts = JSON.parse(obj.result);
            makeDivPosts(obj.department);
        }
        if (obj.api == "user" && obj.mt == "InsertDepartmentSuccess") {
            app.send({ api: "user", mt: "SelectDepartments" });
        }
        if (obj.api == "user" && obj.mt == "InsertPostSuccess") {
            app.send({ api: "user", mt: "SelectPosts", department: obj.src });
        }
        if (obj.api == "user" && obj.mt == "SelectDepartmentViewersResult") {
            console.log(obj.result);
            list_viewers_departments = JSON.parse(obj.result);
        }
        if (obj.api == "user" && obj.mt == "SelectDepartmentEditorsResult") {
            console.log(obj.result);
            list_editors_departments = JSON.parse(obj.result);
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
        //var headbanner = document.createElement('div');
        //headbanner.id = 'headbanner';
        //headbanner.style.backgroundImage = 'url("./images/header_wecom.png")';
        ////headbanner.style.backgroundColor = 'rgba(132, 0, 255, 0.644)';
        //headbanner.style.backgroundRepeat = 'no-repeat';
        //headbanner.style.backgroundSize = 'cover';
        //headbanner.style.position = 'absolute';
        //headbanner.style.height = '20%';
        //headbanner.style.top = '0%';
        //headbanner.style.width = '100%';
        //headbanner.style.fontSize = '35px';
        //headbanner.style.display = 'flex';
        //headbanner.style.justifyContent = 'center';
        //headbanner.style.alignItems = 'center';
        // headbanner.style.borderTopLeftRadius = '20px';
        // headbanner.style.borderTopRightRadius = '20px';
        //headbanner.textContent = 'MURAL DE AVISOS WECOM';
        //worktable.appendChild(headbanner);

        // Cria��o do elemento depcards
        var depcards = document.createElement('div');
        depcards.id = 'depcards';
        depcards.className = 'depcards';
        worktable.appendChild(depcards);

        var logoWecom = document.createElement('div');
        logoWecom.id = 'logowecom';
        logoWecom.className = 'logo'
        worktable.appendChild(logoWecom);

        //var depCardsContainer = document.getElementById('depcards');

        depcards.innerHTML = '';

        list_departments.forEach(function (department) {

            var div = document.createElement('div');
            div.id = department.id;
            div.className = 'card';
            div.textContent = department.name;
            div.style.display = 'flex';
            div.style.justifyContent = 'center';
            div.style.alignItems = 'center';
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
        divAdd.className = "cardnew";
        divAdd.textContent = "Adicionar +";
        divAdd.style.display = 'flex';
        divAdd.style.justifyContent = 'center';
        divAdd.style.alignItems = 'center';
        divAdd.style.borderRadius = '5px';
        divAdd.style.backgroundColor = 'rgb(68, 87, 91)';
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
        //for (var i = 0; i < views_history.length; i++) {
        //    var department = views_history[i].department;
        //    changeDepBackgroundColor(department);
        //}
        // Objeto para rastrear os ids únicos
        var uniqueIds = {};
        for (var i = 0; i < views_history.length; i++) {
            var department = views_history[i].department;
            if (!uniqueIds[department]) {
                uniqueIds[department] = true;
                console.log("Id único encontrado:", department);
                changeDepBackgroundColor(department);
            }
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
        //var headbanner = document.createElement('div');
        //headbanner.id = 'headbanner';
        //headbanner.style.position = 'absolute';
        //headbanner.style.backgroundImage = 'url("./images/header_wecom.png")';
        //headbanner.style.backgroundRepeat = 'no-repeat';
        //headbanner.style.backgroundSize = 'cover';
        //headbanner.style.height = '20%';
        //headbanner.style.top = '0%';
        //headbanner.style.width = '100%';
        //headbanner.style.fontSize = '35px';
        //headbanner.style.display = 'flex';
        //headbanner.style.justifyContent = 'center';
        //headbanner.style.alignItems = 'center';
        // headbanner.style.borderTopLeftRadius = '20px';
        // headbanner.style.borderTopRightRadius = '20px';
        //headbanner.textContent = 'MURAL DE AVISOS WECOM';
        //worktable.appendChild(headbanner);

        var postDepartDiv = document.createElement('div');
        postDepartDiv.id = 'post-depart';
        postDepartDiv.style.position = 'absolute';
        postDepartDiv.style.display = 'flex';
        /*postDepartDiv.style.paddingTop = '4%';*/
        postDepartDiv.style.flexWrap = 'wrap';
        postDepartDiv.style.overflowY = 'auto';
        postDepartDiv.style.width = '100%';
        postDepartDiv.style.top = '0%';
        postDepartDiv.style.height = '80%';
        postDepartDiv.style.justifyContent = 'center';
        postDepartDiv.style.alignItems = 'center';
        postDepartDiv.style.alignContent = 'center';

        var logoWecom = document.createElement('div');
        logoWecom.id = 'logowecom';
        logoWecom.className = 'logo'
        worktable.appendChild(logoWecom);

        // Criar divs para cada departamento
        list_posts.forEach(function (post) {
            var postDiv = document.createElement('div');
            postDiv.id = post.id;
            postDiv.className = 'post';
            postDiv.textContent = post.title;
            postDiv.style.display = 'flex';
            postDiv.style.flexDirection= 'column';
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
                makeDivPostMessage(clickedId, dep_id);

            });

            postDepartDiv.appendChild(postDiv);
        });

        worktable.appendChild(postDepartDiv);

        var isEditor = list_departments_editor.filter(function (item) {
            return item.id === parseInt(dep_id, 10);
        })[0];
        if (isEditor) {
            // Criar os elementos 'Adicionar +'
            var postNew1Div = document.createElement('div');
            postNew1Div.id = 'postnew1';
            postNew1Div.className = 'postnew';
            postNew1Div.textContent = 'Adicionar +';
            postNew1Div.style.display = 'flex';
            postNew1Div.style.flexDirection = 'column';
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
        }
        var footButtons = document.createElement('div');
        footButtons.id = 'footbuttons';
        footButtons.style.position = 'absolute';
        footButtons.style.display = 'flex';
        footButtons.style.overflowY = 'auto';
        footButtons.style.width = '250px';
        footButtons.style.height = '10%';
        footButtons.style.top = '90%';
        footButtons.style.justifyContent = 'center';
        footButtons.style.alignItems = 'center';
        footButtons.style.alignContent = 'center';
        worktable.appendChild(footButtons);

        
      


        var backDiv = document.createElement('div');
        backDiv.id = 'backDiv';
        backDiv.style.display = 'flex';
        backDiv.style.backgroundImage = 'url("./images/back.png")';
        backDiv.style.backgroundRepeat = 'no-repeat';
        backDiv.style.backgroundPosition = 'center';
        backDiv.style.backgroundSize = '50px';
        backDiv.style.display = 'flex';
        backDiv.style.flexWrap = 'wrap';
        backDiv.style.overflowY = 'auto';
        backDiv.style.width = '100%';
        backDiv.style.height = '100%';
        backDiv.style.justifyContent = 'center';
        backDiv.style.alignItems = 'center';
        backDiv.style.alignContent = 'center';

        backDiv.addEventListener("click", function () {
            makeDivDepartments();
        })

        footButtons.appendChild(backDiv);
        if(isEditor){
            var editDepDiv = document.createElement("div");
            editDepDiv.style.display = 'flex';
            editDepDiv.style.backgroundImage = 'url("./images/engine.png")';
            editDepDiv.style.backgroundRepeat = 'no-repeat';
            editDepDiv.style.backgroundPosition = 'center';
            editDepDiv.style.backgroundSize = '50px';
            editDepDiv.style.display = 'flex';
            editDepDiv.style.flexWrap = 'wrap';
            editDepDiv.style.overflowY = 'auto';
            editDepDiv.style.width = '100%';
            editDepDiv.style.height = '100%';
            editDepDiv.style.justifyContent = 'center';
            editDepDiv.style.alignItems = 'center';
            editDepDiv.style.alignContent = 'center';

            editDepDiv.addEventListener("click", function (isEditor) {
                console.log("CLICK BOTÃO EDITAR")
                editDepartmentForm(dep_id)
               
            })
            var delDepDiv = document.createElement("div");
            delDepDiv.style.display = 'flex';
            delDepDiv.style.backgroundImage = 'url("./images/trash.png")';
            delDepDiv.style.backgroundRepeat = 'no-repeat';
            delDepDiv.style.backgroundPosition = 'center';
            delDepDiv.style.backgroundSize = '50px';
            delDepDiv.style.display = 'flex';
            delDepDiv.style.flexWrap = 'wrap';
            delDepDiv.style.overflowY = 'auto';
            delDepDiv.style.width = '100%';
            delDepDiv.style.height = '100%';
            delDepDiv.style.justifyContent = 'center';
            delDepDiv.style.alignItems = 'center';
            delDepDiv.style.alignContent = 'center';

            delDepDiv.addEventListener("click", function (isEditor) {
                console.log("CLICK BOTÃO DELETAR")
                var hasPosts = list_posts.filter(function (item) {
                    return item.department === parseInt(dep_id, 10);
                });
                if (hasPosts) {
                    window.alert("ATENÇÃO!!!\n\nVocê deve excluir todos os Posts antes de excluir o Departamento.")
                } else {
                    app.send({ api: "user", mt: "DeleteDepartment", id: dep_id });
                }
                
            })
            var timedDepDiv = document.createElement("div");
            timedDepDiv.style.display = 'flex';
            timedDepDiv.style.backgroundImage = 'url("./images/timed.png")';
            timedDepDiv.style.backgroundRepeat = 'no-repeat';
            timedDepDiv.style.backgroundPosition = 'center';
            timedDepDiv.style.backgroundSize = '50px';
            timedDepDiv.style.display = 'flex';
            timedDepDiv.style.flexWrap = 'wrap';
            timedDepDiv.style.overflowY = 'auto';
            timedDepDiv.style.width = '100%';
            timedDepDiv.style.height = '100%';
            timedDepDiv.style.justifyContent = 'center';
            timedDepDiv.style.alignItems = 'center';
            timedDepDiv.style.alignContent = 'center';

            timedDepDiv.addEventListener("click", function (isEditor) {
                console.log("CLICK BOTÃO SELETOR TEMPO ABRIR POSTS eENTÂO ENVIAR APP.SEND")
                var worktable = document.getElementById('worktable');
                var depTimeManager = document.getElementById('depTimeManager');

                if (depTimeManager) {
                    worktable.removeChild(depTimeManager);

                } else {
                    var depTimeManager = document.createElement('div');
                    depTimeManager.id = 'depTimeManager';
                    depTimeManager.style.position = 'fixed';
                    depTimeManager.style.backgroundColor = 'rgb(215,215,215)';
                    depTimeManager.style.bottom = '10%';
                    depTimeManager.style.width = '250px';
                    depTimeManager.style.height = '200px';

                    var select = document.createElement('select');
                    select.id = 'periodSelector';

                    var options = [
                        'Hoje', 'Últimos 7 dias', 'Últimos 30 dias', 'Desde Sempre', 'Período Customizado'
                    ];

                    options.forEach(function (optionText) {
                        var option = document.createElement('option');
                        option.value = optionText.toLowerCase().replace(/\s/g, '');
                        option.textContent = optionText;
                        select.appendChild(option);
                    });

                    var customPeriodDiv = document.createElement('div');
                    customPeriodDiv.id = 'customPeriod';
                    customPeriodDiv.style.display = 'none';

                    var startDateLabel = document.createElement('label');
                    startDateLabel.textContent = 'Data de início:';
                    var startDateInput = document.createElement('input');
                    startDateInput.type = 'date';
                    startDateInput.id = 'data_start';

                    var endDateLabel = document.createElement('label');
                    endDateLabel.textContent = 'Data de término:';
                    var endDateInput = document.createElement('input');
                    endDateInput.type = 'date';
                    endDateInput.id = 'data_end';

                    var radioButtonLabel = document.createElement('label');
                    radioButtonLabel.textContent = 'Excluídos:';
                    var radioButton1 = document.createElement('input');
                    radioButton1.type = 'radio';
                    radioButton1.name = 'radioDeleted';
                    radioButton1.value = 'deleted';

                    var submitButton = document.createElement('button');
                    submitButton.textContent = 'OK';
                    submitButton.id = 'submitButton';

                    depTimeManager.appendChild(select);

                    customPeriodDiv.appendChild(startDateLabel);
                    customPeriodDiv.appendChild(startDateInput);
                    customPeriodDiv.appendChild(endDateLabel);
                    customPeriodDiv.appendChild(endDateInput);

                    depTimeManager.appendChild(customPeriodDiv);
                    
                    depTimeManager.appendChild(radioButtonLabel);
                    depTimeManager.appendChild(radioButton1);
                    depTimeManager.appendChild(submitButton);

                    select.addEventListener('change', function () {
                        if (select.value === 'períodocustomizado') {
                            customPeriodDiv.style.display = 'block';
                        } else {
                            customPeriodDiv.style.display = 'none';
                        }
                    });

                    submitButton.addEventListener('click', function () {
                        var selectedValue = select.value;
                        var startDate, endDate;

                        switch (selectedValue) {
                            case 'hoje':
                                startDate = endDate = new Date().toISOString().split('T')[0];
                                break;
                            case 'últimos7dias':
                                endDate = new Date().toISOString().split('T')[0];
                                startDate = new Date();
                                startDate.setDate(startDate.getDate() - 6);
                                startDate = startDate.toISOString().split('T')[0];
                                break;
                            case 'últimos30dias':
                                endDate = new Date().toISOString().split('T')[0];
                                startDate = new Date();
                                startDate.setDate(startDate.getDate() - 29);
                                startDate = startDate.toISOString().split('T')[0];
                                break;
                            case 'desdesempre':
                                startDate = '1970-01-01';
                                endDate = '2099-12-01';
                                break;
                            case 'períodocustomizado':
                                startDate = startDateInput.value.split('T')[0];
                                endDate = endDateInput.value.split('T')[0];
                                break;
                        }

                        var selectedRadioButton= false;

                        if (radioButton1.checked) {
                            selectedRadioButton = true;
                        }

                        console.log('Data de início:', startDate);
                        console.log('Data de término:', endDate);
                        app.send({ api: "user", mt: "SelectPosts", department: parseInt(dep_id, 10), start: startDate, end: endDate, deleted: selectedRadioButton });
                    });

                    worktable.appendChild(depTimeManager);
                }
            })
            
            footButtons.appendChild(delDepDiv);
            footButtons.appendChild(timedDepDiv);
            footButtons.appendChild(editDepDiv);
        }
        
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
    function makeDivPostMessage(id, dep_id) {
        var post = list_posts.filter(function (item) {
            return item.id === parseInt(id, 10);
        })[0];
        var isEditor = list_departments_editor.filter(function (item) {
            return item.id === parseInt(dep_id, 10);
        })[0];

        var department = list_departments.filter(function (item) {
            return item.id === parseInt(post.department, 10);
        })[0];
        // Criar os elementos HTML
        var postMsgDiv = document.createElement('div');
        postMsgDiv.id = 'postmsg';
        postMsgDiv.className = 'postmsg'
        postMsgDiv.style.backgroundColor = post.color;


        var closeWindowDiv = document.createElement('div');
        closeWindowDiv.id = 'closewindow';
        var historyPostDiv = document.createElement('div');
        historyPostDiv.id = 'historypost';
        var editPostDiv = document.createElement('div');
        editPostDiv.id = 'editpost';
        var deletePostDiv = document.createElement('div');
        deletePostDiv.id = 'deletepost';

        // Adicionando o listener de clique
        closeWindowDiv.addEventListener('click', function () {
            console.log("O elemento closeWindowDiv foi clicado!");
            var isNew = views_history.filter(function (item) {
                return item.id === parseInt(id, 10);
            })[0];
            if (isNew) {
                console.log("Post NEW Visualizado:", post.id);
                app.send({ api: "user", mt: "InsertViewHistory", post: post.id, src: parseInt(department.id, 10) });

            } else {
                makeDivPosts(post.department);
            }
        });
        historyPostDiv.addEventListener('click', function () {
            console.log("O elemento historyPostDiv foi clicado!", id);
            app.send({ api: "user", mt: "SelectHistoryByPost", post: parseInt(id, 10),})
        });
        editPostDiv.addEventListener('click', function () {
            console.log("O elemento editPostDiv foi clicado!");
            editPostForm(id, dep_id);            
        });
        deletePostDiv.addEventListener('click', function () {
            console.log("O elemento deletePostDiv foi clicado!");
            app.send({ api: "user", mt: "DeletePost", id: parseInt(id,10), src:dep_id });
        });

        var nameBoxDiv = document.createElement('div');
        nameBoxDiv.id = 'namebox';
        nameBoxDiv.className = 'namebox';

        nameBoxDiv.innerHTML = department.name;

        var titleMsgDiv = document.createElement('div');
        titleMsgDiv.id = 'titlemsg';
        titleMsgDiv.className = 'titlemsg'
        titleMsgDiv.innerHTML = post.title;

        var msgBoxDiv = document.createElement('div');
        msgBoxDiv.id = 'msgbox';
        msgBoxDiv.className = 'msgbox';
        msgBoxDiv.style.height = '75%'


        var scrollBox = document.createElement('scroll-box');
        scrollBox.style.display = 'flex';
        scrollBox.style.color = 'white';
        scrollBox.style.width = '100%';
        scrollBox.style.height = '100%';

        var msgContent = document.createElement('pre');
        msgContent.style.overflowY = 'auto'
        msgContent.style.overflowX = 'auto'
        msgContent.innerHTML = post.description;

        var closeDateDiv = document.createElement('div');
        closeDateDiv.id = 'closedate';
        closeDateDiv.className = 'closedate';
        closeDateDiv.innerHTML = post.date_end;

        // Adicionar os elementos criados � div com o ID 'billboard'
        var billboardDiv = document.getElementById('billboard');
        if (billboardDiv) {
            //billboardDiv.innerHTML = '';
            scrollBox.appendChild(msgContent);
            msgBoxDiv.appendChild(scrollBox);
            postMsgDiv.appendChild(closeWindowDiv);
            postMsgDiv.appendChild(nameBoxDiv);
            postMsgDiv.appendChild(titleMsgDiv);
            postMsgDiv.appendChild(msgBoxDiv);
            postMsgDiv.appendChild(closeDateDiv);
            if (isEditor) {
                postMsgDiv.appendChild(historyPostDiv);
                postMsgDiv.appendChild(editPostDiv);
                postMsgDiv.appendChild(deletePostDiv);
            }
            billboardDiv.appendChild(postMsgDiv);
        } else {
            console.error("A div com o ID 'billboard' não foi encontrada.");
        }

    }
    function createPostForm(dep_id) {
        var department = list_departments.filter(function (item) {
            return item.id === parseInt(dep_id, 10);
        })[0];

        var postMsgDiv = document.createElement('div');
        postMsgDiv.id = 'postmsg';
        postMsgDiv.className = 'postmsg';
        postMsgDiv.style.backgroundColor = '#0f243f';

        var nameBoxDiv = document.createElement('div');
        nameBoxDiv.id = 'namebox';
        nameBoxDiv.className = 'namebox';
        nameBoxDiv.innerHTML = department.name;

        var closeWindowDiv = document.createElement('div');
        closeWindowDiv.id = 'closewindow';

        var titleMsgDiv = document.createElement('div');
        titleMsgDiv.id = 'titlemsg';
        titleMsgDiv.className = 'titlemsg';
        titleMsgDiv.innerHTML = '<input id="titleevent" type="text" placeholder="Título" style="color: #ffff; background-color: rgb(93 126 131 / 36%);">';

        var msgBoxDiv = document.createElement('div');
        msgBoxDiv.id = 'msgbox';
        msgBoxDiv.className = 'msgbox';
        msgBoxDiv.innerHTML = '<textarea name="" id="msgevent" cols="30" rows="80" placeholder="Texto da mensagem" maxlength="1000"></textarea>' + '<p class="char-counter"><span id="charCount">1000</span> /1000</p>';

        document.body.appendChild(msgBoxDiv);

        var textarea = document.getElementById("msgevent");
        var charCountSpan = document.getElementById("charCount");
        var maxChars = 1000;

        textarea.addEventListener("input", function () {
            var remainingChars = maxChars - textarea.value.length;
            charCountSpan.textContent = remainingChars;
        });



        var dateDiv = document.createElement('div');
        dateDiv.id = 'date';
        dateDiv.style.backgroundColor = 'rgb(93 126 131 / 36%)';
        dateDiv.style.fontSize = '12px';
        dateDiv.innerHTML = '<a>Data de Início: </a><input type="datetime-local" id="startevent" class="dateinput"> <a>Data de Fim: </a><input type="datetime-local" id="endevent" class="dateinput">';

        var buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'buttons';
        buttonsDiv.innerHTML = '<a>Selecione a cor:</a><ul id="palette" class="palette"></ul><input type="color" id="colorbox" style="display: none;">'; //onclick="openColorPicker()" onchange="updateColor(event)

        var saveMsgDiv = document.createElement('div');
        saveMsgDiv.id = 'savemsg';
        saveMsgDiv.className = 'saveclose';
        saveMsgDiv.textContent = 'Inserir';

        var closeMsgDiv = document.createElement('div');
        closeMsgDiv.id = 'closemsg';
        closeMsgDiv.className = 'saveclose';
        closeMsgDiv.textContent = 'Fechar';


        // Adicionando o listener de clique
        saveMsgDiv.addEventListener('click', function () {

            console.log("O elemento saveMsgDiv foi clicado!");
            var startPost = document.getElementById('startevent').value;
            var endPost = document.getElementById('endevent').value;
            var msgPost = document.getElementById('msgevent').value;
            var titlePost = document.getElementById('titleevent').value;
            var colorPost = document.getElementById('colorbox').value;

            console.log("Data Start:", startPost);
            app.send({ api: "user", mt: "InsertPost", title: titlePost, color: colorPost, description: msgPost, department: parseInt(dep_id, 10), date_start: startPost, date_end: endPost });
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

        // Adicionando o listener de clique
        closeWindowDiv.addEventListener('click', function () {

            console.log("O elemento closeWindowDiv foi clicado!");
            makeDivPosts(dep_id);
        });



        buttonsDiv.appendChild(saveMsgDiv);
        buttonsDiv.appendChild(closeMsgDiv);
        postMsgDiv.appendChild(nameBoxDiv);
        postMsgDiv.appendChild(closeWindowDiv);
        postMsgDiv.appendChild(titleMsgDiv);
        postMsgDiv.appendChild(msgBoxDiv);
        postMsgDiv.appendChild(dateDiv);
        postMsgDiv.appendChild(buttonsDiv);

        // Exemplo de uso para adicionar os elementos criados à div com o ID 'billboard'
        var billboardDiv = document.getElementById('billboard');
        if (billboardDiv) {
            billboardDiv.appendChild(postMsgDiv);

            var colorbox = document.getElementById("colorbox")
            colorbox.addEventListener("change", function () {
                postMsgDiv.style.backgroundColor = colorbox.value;
            })
            var palette = document.getElementById("palette")
            palette.addEventListener("click", function () {
                colorbox.click();
            })
        } else {
            console.error("A div com o ID 'billboard' não foi encontrada.");
        }


    }
    function editPostForm(id, dep_id) {
        console.log("O elemento historyPostDiv foi clicado!", id);
        var department = list_departments.filter(function (item) {
            return item.id === parseInt(dep_id, 10);
        })[0];

        var post = list_posts.filter(function (item) {
            return item.id === parseInt(id, 10);
        })[0];
        var maxChars = 1000;
        var postMsgDiv = document.getElementById('postmsg');
        postMsgDiv.innerHTML = '';
        postMsgDiv.style.backgroundColor = post.color;

        var nameBoxDiv = document.createElement('div');
        nameBoxDiv.id = 'namebox';
        nameBoxDiv.className = 'namebox';
        nameBoxDiv.innerHTML = department.name;

        var closeWindowDiv = document.createElement('div');
        closeWindowDiv.id = 'closewindow';

        var titleMsgDiv = document.createElement('div');
        titleMsgDiv.id = 'titlemsg';
        titleMsgDiv.className = 'titlemsg';
        titleMsgDiv.innerHTML = '<input id="titleevent" type="text" value="'+post.title+'" placeholder="Título" style="color: #ffff; background-color: rgb(93 126 131 / 36%);">';
        var remainingChars = maxChars - post.description.length
        var msgBoxDiv = document.createElement('div');
        msgBoxDiv.id = 'msgbox';
        msgBoxDiv.className = 'msgbox';
        msgBoxDiv.innerHTML = '<textarea name="" id="msgevent" cols="30" rows="80" placeholder="Texto da mensagem" maxlength="1000">' + post.description + '</textarea>' + '<p class="char-counter"><span id="charCount">' + remainingChars +'</span> /'+ maxChars +'</p>';

        //document.body.appendChild(msgBoxDiv);

        //var textarea = document.getElementById("msgevent");
        //var charCountSpan = document.getElementById("charCount");
        //var maxChars = 1000;

        //textarea.addEventListener("input", function () {
        //    var remainingChars = maxChars - textarea.value.length;
        //    charCountSpan.textContent = remainingChars;
        //});



        var dateDiv = document.createElement('div');
        dateDiv.id = 'date';
        dateDiv.style.backgroundColor = 'rgb(93 126 131 / 36%)';
        dateDiv.style.fontSize = '12px';
        dateDiv.innerHTML = '<a>Data de Início: </a><input type="datetime-local" value="'+post.date_start+'" id="startevent" class="dateinput"> <a>Data de Fim: </a><input type="datetime-local" id="endevent" value="'+post.date_end+'" class="dateinput">';

        var buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'buttons';
        buttonsDiv.innerHTML = '<a>Selecione a cor:</a><ul id="palette" class="palette"></ul><input type="color" value="'+post.color+'" id="colorbox" style="display: none;">'; //onclick="openColorPicker()" onchange="updateColor(event)

        var saveMsgDiv = document.createElement('div');
        saveMsgDiv.id = 'savemsg';
        saveMsgDiv.className = 'saveclose';
        saveMsgDiv.textContent = 'Atualizar';

        var closeMsgDiv = document.createElement('div');
        closeMsgDiv.id = 'closemsg';
        closeMsgDiv.className = 'saveclose';
        closeMsgDiv.textContent = 'Fechar';


        // Adicionando o listener de clique
        saveMsgDiv.addEventListener('click', function () {

            console.log("O elemento saveMsgDiv foi clicado!");
            var startPost = document.getElementById('startevent').value;
            var endPost = document.getElementById('endevent').value;
            var msgPost = document.getElementById('msgevent').value;
            var titlePost = document.getElementById('titleevent').value;
            var colorPost = document.getElementById('colorbox').value;

            console.log("Data Start:", startPost);
            app.send({ api: "user", mt: "UpdatePost", id: parseInt(id,10), title: titlePost, color: colorPost, description: msgPost, department: parseInt(dep_id, 10), date_start: startPost, date_end: endPost });
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

        // Adicionando o listener de clique
        closeWindowDiv.addEventListener('click', function () {

            console.log("O elemento closeWindowDiv foi clicado!");
            makeDivPosts(dep_id);
        });



        buttonsDiv.appendChild(saveMsgDiv);
        buttonsDiv.appendChild(closeMsgDiv);
        postMsgDiv.appendChild(nameBoxDiv);
        postMsgDiv.appendChild(closeWindowDiv);
        postMsgDiv.appendChild(titleMsgDiv);
        postMsgDiv.appendChild(msgBoxDiv);
        postMsgDiv.appendChild(dateDiv);
        postMsgDiv.appendChild(buttonsDiv);

        var textarea = document.getElementById("msgevent");
        var charCountSpan = document.getElementById("charCount");
        

        textarea.addEventListener("input", function () {
            var remainingChars = maxChars - textarea.value.length;
            charCountSpan.textContent = remainingChars;
        });
        var colorbox = document.getElementById("colorbox")
        colorbox.addEventListener("change", function () {
            postMsgDiv.style.backgroundColor = colorbox.value;
        })
        var palette = document.getElementById("palette")
        palette.addEventListener("click", function () {
            colorbox.click();
        })

        // Exemplo de uso para adicionar os elementos criados à div com o ID 'billboard'
        //var billboardDiv = document.getElementById('billboard');
        //if (billboardDiv) {
        //    billboardDiv.appendChild(postMsgDiv);

        //    var colorbox = document.getElementById("colorbox")
        //    colorbox.addEventListener("change", function () {
        //        postMsgDiv.style.backgroundColor = colorbox.value;
        //    })
        //    var palette = document.getElementById("palette")
        //    palette.addEventListener("click", function () {
        //        colorbox.click();
        //    })
        //} else {
        //    console.error("A div com o ID 'billboard' não foi encontrada.");
        //}
    }
    function createDepartmentForm() {
        // Criar os elementos HTML
        var postMsgDiv = document.createElement('div');
        postMsgDiv.id = 'newdep';
        postMsgDiv.className = 'newdep';


        var closeWindowDiv = document.createElement('div');
        closeWindowDiv.id = 'closewindow';

        // Adicionando o listener de clique
        closeWindowDiv.addEventListener('click', function () {
            console.log("O elemento closeWindowDiv foi clicado!");
            makeDivDepartments();
        });

        var nameDepDiv = document.createElement('div');
        nameDepDiv.id = 'nameDepDiv';
        nameDepDiv.style.display = 'flex';
        nameDepDiv.style.backgroundColor = '#ffffff33';
        nameDepDiv.style.color = 'white';
        nameDepDiv.style.width = '80%';
        nameDepDiv.style.height = '8%';
        nameDepDiv.style.marginBottom = '15px';
        nameDepDiv.style.marginTop = '15px';
        nameDepDiv.innerHTML = '<input id="namedep" type="text" placeholder=" Nome do departamento" style="color: #ffff;">';


        var buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'buttons';
        buttonsDiv.style.display = 'flex';
        buttonsDiv.style.alignItems = 'center';
        buttonsDiv.style.justifyContent = 'flex-start';
        buttonsDiv.style.width = '80%';
        buttonsDiv.style.color = '#FFFF';
        buttonsDiv.innerHTML = '<a>Selecione a cor:</a><ul id="palette" class="palette"></ul><input type="color" id="colorbox" style="display: none;">';

        var closeMsgDiv = document.createElement('div');
        closeMsgDiv.id = 'closemsg';
        closeMsgDiv.className = 'saveclose';
        closeMsgDiv.textContent = 'Fechar';
        // Adicionando o listener de clique
        closeMsgDiv.addEventListener('click', function () {

            console.log("O elemento closeMsgDiv foi clicado!");
            makeDivDepartments();
        });

        var saveMsgDiv = document.createElement('div');
        saveMsgDiv.id = 'savemsg';
        saveMsgDiv.className = 'saveclose';
        saveMsgDiv.textContent = 'Inserir';
        // Event listener de clique para o bot�o "Salvar"
        saveMsgDiv.addEventListener('click', function () {
            // Aqui voc� pode implementar a a��o que deseja realizar quando o bot�o � clicado
            var departmentName = document.getElementById("namedep").value;
            var departmentColor = document.getElementById("colorbox").value;
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
            buttonsDiv.appendChild(saveMsgDiv);
            buttonsDiv.appendChild(closeMsgDiv);
            postMsgDiv.appendChild(closeWindowDiv);
            postMsgDiv.appendChild(nameDepDiv);
            var userTable = createUsersDepartmentsGrid();
            postMsgDiv.appendChild(userTable);
            postMsgDiv.appendChild(buttonsDiv);

            billboardDiv.appendChild(postMsgDiv);

            var colorbox = document.getElementById("colorbox")
            colorbox.addEventListener("change", function () {
                postMsgDiv.style.backgroundColor = colorbox.value;
            })
            var palette = document.getElementById("palette")
            palette.addEventListener("click", function () {
                colorbox.click();
            })

        } else {
            console.error("A div com o ID 'billboard' não foi encontrada.");
        }
    }

    function createUsersDepartmentsGrid() {
        var usersListDiv = document.createElement('div');
        usersListDiv.id = 'userslist';
        usersListDiv.className = 'userlist';
        usersListDiv.innerHTML = '';

        var table = document.createElement('table');
        table.classList.add('table');
        // Criar a primeira linha para os cabeçalhos das colunas
        var headerRow = document.createElement('tr');
        headerRow.classList.add('row');

        var nameCol = document.createElement('th');
        nameCol.classList.add('column');
        nameCol.textContent = 'Usuário';

        var editorCol = document.createElement('th');
        editorCol.classList.add('column');
        editorCol.textContent = 'Editor';

        var viewerCol = document.createElement('th');
        viewerCol.classList.add('column');
        viewerCol.textContent = 'Visualizador';

        headerRow.appendChild(nameCol);
        headerRow.appendChild(editorCol);
        headerRow.appendChild(viewerCol);

        table.appendChild(headerRow);

        // Criar as demais linhas com os dados dos departamentos
        list_tableUsers.forEach(function (user) {
            var row = document.createElement('tr');
            row.classList.add('row');

            var nameCol = document.createElement('td');
            nameCol.classList.add('column');
            nameCol.textContent = user.cn;

            var editorCol = document.createElement('td');
            editorCol.classList.add('column');
            var editorCheckbox = document.createElement('input');
            editorCheckbox.type = 'checkbox';

            editorCheckbox.name = 'editorDepartments';
            editorCheckbox.value = user.guid;
            editorCheckbox.className = 'checkbox'

            editorCheckbox.addEventListener('change', function () {
                if (editorCheckbox.checked) {
                    viewerCheckbox.checked = this.checked;
                }
            });

            editorCol.appendChild(editorCheckbox);

            var viewerCol = document.createElement('td');
            viewerCol.classList.add('column');
            var viewerCheckbox = document.createElement('input');
            viewerCheckbox.type = 'checkbox';

            viewerCheckbox.name = 'viewerDepartments';
            viewerCheckbox.value = user.guid;
            viewerCheckbox.className = 'checkbox'
            viewerCol.appendChild(viewerCheckbox);

            viewerCheckbox.checked = editorCheckbox.checked;

            row.appendChild(nameCol);
            row.appendChild(editorCol);
            row.appendChild(viewerCol);

            table.appendChild(row);
        });
        usersListDiv.appendChild(table);
        return usersListDiv;
    }
    function editUsersDepartmentsGrid() {
        var usersListDiv = document.createElement('div');
        usersListDiv.id = 'userslist';
        usersListDiv.className = 'userlist';
        usersListDiv.innerHTML = '';

        var table = document.createElement('table');
        table.classList.add('table');
        // Criar a primeira linha para os cabeçalhos das colunas
        var headerRow = document.createElement('tr');
        headerRow.classList.add('row');

        var nameCol = document.createElement('th');
        nameCol.classList.add('column');
        nameCol.textContent = 'Usuário';

        var editorCol = document.createElement('th');
        editorCol.classList.add('column');
        editorCol.textContent = 'Editor';

        var viewerCol = document.createElement('th');
        viewerCol.classList.add('column');
        viewerCol.textContent = 'Visualizador';

        headerRow.appendChild(nameCol);
        headerRow.appendChild(editorCol);
        headerRow.appendChild(viewerCol);

        table.appendChild(headerRow);

        // Criar as demais linhas com os dados dos departamentos
        list_tableUsers.forEach(function (user) {
            var row = document.createElement('tr');
            row.classList.add('row');

            var nameCol = document.createElement('td');
            nameCol.classList.add('column');
            nameCol.textContent = user.cn;

            var userV = list_viewers_departments.filter(function (item) {
                return item.viewer_guid === user.guid;
            })[0];
            var userE = list_editors_departments.filter(function (item) {
                return item.editor_guid === user.guid;
            })[0];

            var editorCol = document.createElement('td');
            editorCol.classList.add('column');
            var editorCheckbox = document.createElement('input');
            editorCheckbox.type = 'checkbox';
            if (userE) {
                editorCheckbox.checked = 'true';
            }
            editorCheckbox.name = 'editorDepartments';
            editorCheckbox.value = user.guid;
            editorCheckbox.className = 'checkbox'

            editorCheckbox.addEventListener('change', function () {
                if (editorCheckbox.checked) {
                    viewerCheckbox.checked = this.checked;
                }
            });

            editorCol.appendChild(editorCheckbox);

            var viewerCol = document.createElement('td');
            viewerCol.classList.add('column');
            var viewerCheckbox = document.createElement('input');
            viewerCheckbox.type = 'checkbox';
            if (userV) {
                viewerCheckbox.checked = 'true';
            }
            viewerCheckbox.name = 'viewerDepartments';
            viewerCheckbox.value = user.guid;
            viewerCheckbox.className = 'checkbox'
            viewerCol.appendChild(viewerCheckbox);

            //viewerCheckbox.checked = editorCheckbox.checked;

            row.appendChild(nameCol);
            row.appendChild(editorCol);
            row.appendChild(viewerCol);

            table.appendChild(row);
        });
        usersListDiv.appendChild(table);
        return usersListDiv;
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
            // Salva o conteúdo atual da div
            var conteudoAntigo = element.innerHTML;

            // Limpa o conteúdo da div encontrada
            element.innerHTML = '';

            // Cria os novos elementos (ul e a)
            var ulNew = document.createElement('pre');
            ulNew.id = 'new';
            ulNew.className = 'newpost';
            var aElement = document.createElement('a');
            // Adiciona o conteúdo antigo de volta à div no elemento A
            aElement.textContent = conteudoAntigo;

            var ulFoot = document.createElement('pre');
            ulFoot.id = 'foot';
            ulFoot.className = 'footpost';

            // Adiciona os novos elementos à div
            element.appendChild(ulNew);
            element.appendChild(aElement);
            element.appendChild(ulFoot);
        }
    }
    function changeDepBackgroundColor(elementId) {
        var element = document.getElementById(elementId);
        if (element) {
            // Salva o conteúdo atual da div
            var conteudoAntigo = element.innerHTML;

            // Limpa o conteúdo da div encontrada
            element.innerHTML = '';

            // Cria os novos elementos (ul e a)
            var ulNew = document.createElement('pre');
            ulNew.id = 'newDepPost';
            ulNew.className = 'newDepPost';
            var aElement = document.createElement('a');
            // Adiciona o conteúdo antigo de volta à div no elemento A
            aElement.textContent = conteudoAntigo;

            var ulFoot = document.createElement('pre');
            ulFoot.id = 'rightDep';
            ulFoot.className = 'rightDep';

            // Adiciona os novos elementos à div
            element.appendChild(ulNew);
            element.appendChild(aElement);
            element.appendChild(ulFoot);
        }
    }
    function editDepartmentForm(dep_id) {
        var department = list_departments.filter(function (item) {
            return item.id === parseInt(dep_id, 10);
        })[0];
        // Criar os elementos HTML
        var postMsgDiv = document.createElement('div');
        postMsgDiv.id = 'editdep';
        postMsgDiv.className = 'editdep';
        postMsgDiv.style.backgroundColor = department.color;

        var closeWindowDiv = document.createElement('div');
        closeWindowDiv.id = 'closewindow';
        var historyPostDiv = document.createElement('div');
        historyPostDiv.id = 'historypost';
        var editPostDiv = document.createElement('div');
        editPostDiv.id = 'editpost';
        var deletePostDiv = document.createElement('div');
        deletePostDiv.id = 'deletepost';

        // Adicionando o listener de clique
        closeWindowDiv.addEventListener('click', function () {
            console.log("O elemento closeWindowDiv foi clicado!");
            makeDivPosts(dep_id);
        });

        var nameDepDiv = document.createElement('div');
        nameDepDiv.id = 'nameDepDiv';
        nameDepDiv.style.display = 'flex';
        nameDepDiv.style.backgroundColor = '#ffffff33';
        nameDepDiv.style.color = 'white';
        nameDepDiv.style.width = '80%';
        nameDepDiv.style.height = '8%';
        nameDepDiv.style.marginBottom = '15px';
        nameDepDiv.style.marginTop = '15px';
        nameDepDiv.style.fontSize = '25px';
        nameDepDiv.style.justifyContent = 'center';
        nameDepDiv.style.alignItems = 'center';
        nameDepDiv.innerHTML = department.name;


        var buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'buttons';
        buttonsDiv.style.display = 'flex';
        buttonsDiv.style.alignItems = 'center';
        buttonsDiv.style.justifyContent = 'flex-start';
        buttonsDiv.style.width = '80%';
        buttonsDiv.style.color = '#FFFF';
        buttonsDiv.innerHTML = '<a>Selecione a cor:</a><ul id="palette" class="palette"></ul><input type="color" value="' + department.color +'" id="colorbox" style="display: none;">';

        var closeMsgDiv = document.createElement('div');
        closeMsgDiv.id = 'closemsg';
        closeMsgDiv.className = 'saveclose';
        closeMsgDiv.textContent = 'Fechar';
        // Adicionando o listener de clique
        closeMsgDiv.addEventListener('click', function () {

            console.log("O elemento closeMsgDiv foi clicado!");
            makeDivPosts(dep_id);
        });

        var saveMsgDiv = document.createElement('div');
        saveMsgDiv.id = 'savemsg';
        saveMsgDiv.className = 'saveclose';
        saveMsgDiv.textContent = 'Atualizar';
        // Event listener de clique para o bot�o "Salvar"
        saveMsgDiv.addEventListener('click', function () {
            // Aqui voc� pode implementar a a��o que deseja realizar quando o bot�o � clicado
            var departmentName = document.getElementById("nameDepDiv").innerHTML;
            var departmentColor = document.getElementById("colorbox").value;
            console.log("Salvar clicado!");
            console.log("Nome do departamento:", departmentName);
            console.log("Cor selecionada:", departmentColor);
            var editorDepartments = getSelectedUsersDepartments('editor');
            var viewerDepartments = getSelectedUsersDepartments('viewer');
            console.log("Nome dos departamentos visiveis:", viewerDepartments);
            console.log("Nome dos departamentos editaveis:", editorDepartments);
            app.send({ api: "user", mt: "UpdateDepartment", id: dep_id, name: departmentName, color: departmentColor, viewers: viewerDepartments, editors: editorDepartments });
        });

        // Adicionar os elementos criados � div com o ID 'billboard'
        var billboardDiv = document.getElementById('billboard');
        if (billboardDiv) {
            buttonsDiv.appendChild(saveMsgDiv);
            buttonsDiv.appendChild(closeMsgDiv);
            postMsgDiv.appendChild(closeWindowDiv);
            postMsgDiv.appendChild(nameDepDiv);
            var userTable = editUsersDepartmentsGrid();
            postMsgDiv.appendChild(userTable);
            postMsgDiv.appendChild(buttonsDiv);

            billboardDiv.appendChild(postMsgDiv);

            var colorbox = document.getElementById("colorbox")
            colorbox.addEventListener("change", function () {
                postMsgDiv.style.backgroundColor = colorbox.value;
            })
            var palette = document.getElementById("palette")
            palette.addEventListener("click", function () {
                colorbox.click();
            })

        } else {
            console.error("A div com o ID 'billboard' não foi encontrada.");
        }

    }
    function createHistoryViewsPostGrid(views_post_history) {
        var msgBoxDiv = document.getElementById('msgbox');
        msgBoxDiv.innerHTML = ''
        var table = document.createElement('table');
        table.classList.add('table');
        // Criar a primeira linha para os cabeçalhos das colunas
        var headerRow = document.createElement('tr');
        headerRow.classList.add('row');

        var nameCol = document.createElement('th');
        nameCol.classList.add('column');
        nameCol.textContent = 'Usuário';

        var dateCol = document.createElement('th');
        dateCol.classList.add('column');
        dateCol.textContent = 'Data';

        headerRow.appendChild(nameCol);
        headerRow.appendChild(dateCol);

        table.appendChild(headerRow);

        // Criar as demais linhas com os dados dos departamentos
        views_post_history.forEach(function (view) {
            var row = document.createElement('tr');
            row.classList.add('row');
            var user = list_tableUsers.filter(function (item) {
                return item.guid == view.user_guid;
            })[0];
            var nameCol = document.createElement('td');
            nameCol.classList.add('column');
            nameCol.textContent = user.cn;

            var dateCol = document.createElement('td');
            dateCol.classList.add('column');
            dateCol.textContent = view.date;

            row.appendChild(nameCol);
            row.appendChild(dateCol);

            table.appendChild(row);
        });
        msgBoxDiv.appendChild(table);
    }
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

Wecom.billboard.prototype = innovaphone.ui1.nodePrototype;