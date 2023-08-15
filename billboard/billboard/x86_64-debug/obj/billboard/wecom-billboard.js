
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
            postDiv.style.backgroundColor = post.color;


            // Adicionar o event listener de clique
            postDiv.addEventListener('click', function () {
                // Coletar o ID do elemento div clicado
                var clickedId = this.id;
                console.log('ID do elemento div clicado:', clickedId);
                makeDivPostMessage(clickedId, dep_id);

            });
            var isEditor = list_departments_editor.filter(function (item) {
                return item.id === parseInt(dep_id, 10);
            })[0];

            if (isEditor) {
                var starDate = new Date(post.date_start);
                var endDate = new Date(post.date_end);

                var headpost = document.createElement('ul');
                headpost.id = 'headpost';

                if (post.deleted) {
                    headpost.className = 'deletedpost';
                };
                 
                var textpost = document.createElement('a');
                textpost.id = 'textpost';
                textpost.textContent = post.title;

                var footpost = document.createElement('ul');
                footpost.id = 'footpost';
                footpost.className = "footpost";

                var spanStart = document.createElement('span');
                spanStart.id = 'dateS';
                spanStart.style.fontSize = '10px';
                spanStart.textContent = "Início: " + formatDate(starDate);
                var spanEnd = document.createElement('span');
                spanEnd.id = 'dateE';
                spanEnd.style.fontSize = '10px';
                spanEnd.textContent = "Fim: " + formatDate(endDate);

                function formatDate(date) {
                    var day = date.getDate();
                    var month = date.getMonth() + 1; // Months are 0-indexed
                    var year = date.getFullYear();

                    // Add leading zeros if needed
                    if (day < 10) day = '0' + day;
                    if (month < 10) month = '0' + month;

                    return day + '/' + month + '/' + year;
                }

                footpost.appendChild(spanStart);
                footpost.appendChild(spanEnd);

                postDiv.innerHTML = '';
                postDiv.id = post.id;
                postDiv.className = 'post';
                postDiv.style.backgroundColor = post.color;
                postDiv.appendChild(headpost);
                postDiv.appendChild(textpost);
                postDiv.appendChild(footpost);
            }

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
        backDiv.className = 'backDiv'


        backDiv.addEventListener("click", function () {
            makeDivDepartments();
        })

        footButtons.appendChild(backDiv);
        if(isEditor){
            var editDepDiv = document.createElement("div");
            editDepDiv.className = 'editDepDiv'


            editDepDiv.addEventListener("click", function (isEditor) {
                console.log("CLICK BOTÃO EDITAR")
                editDepartmentForm(dep_id)
               
            })
            var delDepDiv = document.createElement("div");
            delDepDiv.className = 'delDepDiv'


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
            timedDepDiv.className= 'timedDepDiv'

            timedDepDiv.addEventListener("click", function (isEditor) {
                console.log("CLICK BOTÃO SELETOR TEMPO ABRIR POSTS E ENTÂO ENVIAR APP.SEND")
               
                var worktable = document.getElementById('worktable');
                var depTimeManager = document.getElementById('depTimeManager');

                if (depTimeManager) {
                    worktable.removeChild(depTimeManager);

                } else {
                    var depTimeManager = document.createElement('div');
                    depTimeManager.id = 'depTimeManager';
                    depTimeManager.className = 'depTimeManager'

                    var select = document.createElement('select');
                    select.id = 'periodSelector';
                    select.style.position = 'relative';
                    select.style.width = '230px';
                    select.style.margin = '010px';

                    var options = [
                        'Hoje', 'Últimos 7 dias', 'Últimos 30 dias', 'Próximos 7 dias', 'Próximos 30 dias', 'Desde Sempre', 'Período Customizado'
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
                    startDateLabel.style.marginLeft = '10px';
                    startDateLabel.style.marginRight = '20px';
                    startDateLabel.style.fontSize = '16px';
                    var startDateInput = document.createElement('input');
                    startDateInput.type = 'date';
                    startDateInput.id = 'data_start';

                    var endDateLabel = document.createElement('label');
                    endDateLabel.textContent = 'Data de término:';
                    endDateLabel.style.marginLeft = '10px';
                    endDateLabel.style.marginRight = '1px';
                    endDateLabel.style.fontSize = '16px';
                    var endDateInput = document.createElement('input');
                    endDateInput.type = 'date';
                    endDateInput.id = 'data_end';

                    var checkboxButtonLabel = document.createElement('label');
                    checkboxButtonLabel.textContent = 'Excluídos:';
                    checkboxButtonLabel.style.marginLeft = '10px';
                    checkboxButtonLabel.style.marginRight = '43px';
                    checkboxButtonLabel.style.fontSize = '16px';
                    var checkboxButton1 = document.createElement('input');
                    checkboxButton1.type = 'checkbox';
                    checkboxButton1.style.width = '115px'
                    checkboxButton1.style.height = '20px'
                    checkboxButton1.name = 'checkboxDeleted';
                    checkboxButton1.value = 'deleted';

                    var submitButton = document.createElement('button');
                    submitButton.textContent = 'OK';
                    submitButton.id = 'submitButton';
                    submitButton.style.width = '230px';
                    submitButton.style.margin = '10px';

                    var topSelect = document.createElement('div');
                    topSelect.id = 'topselect'
                    topSelect.className = 'topselect'

                    var middleSelect = document.createElement('div');
                    middleSelect.id = 'mdselect'
                    middleSelect.className = 'mdselect'

                    var bottomSelect = document.createElement('div');
                    bottomSelect.id = 'btselect'
                    bottomSelect.className = 'btselect'

                    depTimeManager.appendChild(topSelect);
                    depTimeManager.appendChild(middleSelect);
                    depTimeManager.appendChild(bottomSelect);

                    topSelect.appendChild(select);

                    customPeriodDiv.appendChild(startDateLabel);
                    customPeriodDiv.appendChild(startDateInput);
                    customPeriodDiv.appendChild(endDateLabel);
                    customPeriodDiv.appendChild(endDateInput);

                    middleSelect.appendChild(customPeriodDiv);

                    bottomSelect.appendChild(checkboxButtonLabel);
                    bottomSelect.appendChild(checkboxButton1);
                    bottomSelect.appendChild(submitButton);


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
                        var query;
                        switch (selectedValue) {
                            case 'hoje':
                                startDate = endDate = new Date().toISOString().split('T')[0];
                                query = "AND date_start <= '" + startDate + "' AND date_end >= '" + endDate + "'";
                                break;
                            case 'últimos7dias':
                                now = new Date().toISOString().split('T')[0];
                                startDate = new Date();
                                startDate.setDate(startDate.getDate() - 6);
                                startDate = startDate.toISOString().split('T')[0];
                                query = "AND date_start >= '" + startDate + "' AND date_start <= '" + now + "'";
                                break;
                            case 'últimos30dias':
                                now = new Date().toISOString().split('T')[0];
                                startDate = new Date();
                                startDate.setDate(startDate.getDate() - 29);
                                startDate = startDate.toISOString().split('T')[0];
                                query = "AND date_start >= '" + startDate + "' AND date_start <= '" + now + "'";
                                break;
                            case 'próximos7dias':
                                now = new Date().toISOString().split('T')[0];
                                startDate = new Date();
                                startDate.setDate(startDate.getDate() + 6);
                                startDate = startDate.toISOString().split('T')[0];
                                query = "AND date_start >= '" + now + "' AND date_start <= '" + startDate + "'";
                                break;
                            case 'próximos30dias':
                                now = new Date().toISOString().split('T')[0];
                                startDate = new Date();
                                startDate.setDate(startDate.getDate() + 29);
                                startDate = startDate.toISOString().split('T')[0];
                                query = "AND date_start >= '" + now + "' AND date_start <= '" + startDate + "'";
                                break;
                            case 'desdesempre':
                                query = "";
                                break;
                            case 'períodocustomizado':
                                startDate = startDateInput.value.split('T')[0];
                                endDate = endDateInput.value.split('T')[0];
                                query = "AND date_start >= '" + startDate + "' AND date_end <= '" + endDate + "'";
                                break;
                        }

                        if (!checkboxButton1.checked) {
                            query += " AND deleted IS NULL";
                        }

                        console.log('Data de início:', startDate);
                        console.log('Data de término:', endDate);
                        //var query = "AND date_start >= '" + startDate + "' AND date_end <= '" + endDate + "' AND deleted IS NULL";
                        app.send({ api: "user", mt: "SelectPosts", department: parseInt(dep_id, 10), query: query });
                    });

                    worktable.appendChild(depTimeManager);

                    var animatedDiv = document.getElementById("depTimeManager");
                    setTimeout(function () {
                        animatedDiv.style.opacity = 1;
                        animatedDiv.style.transform = "translate(0%, 0%)";
                    }, 10);
                    document.getElementById('submitButton').addEventListener('click', function () {
                    setTimeout(function () {
                        animatedDiv.style.opacity = 0;
                        animatedDiv.style.transform = "translate(0%, -100%)";

                    }, 10);

                    })

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
        
        element.innerHTML = '';
        
        var ulNew = document.createElement('ul');
        ulNew.id = 'new';
        ulNew.className = 'newpost';
        element.appendChild(ulNew);
        
        element.innerHTML += conteudoAntigo;
            // Limpa o conteúdo da div encontrada
            
            // var aElement = document.createElement('a');
            // aElement.id = 'textpost'
            // aElement.te

            // Adiciona o conteúdo antigo de volta à div no elemento A
            // var ulFoot = document.createElement('ul');
            // ulFoot.id = 'foot';
            // ulFoot.className = 'footpost';

            // Adiciona os novos elementos à div
            
            // element.appendChild(aTextPost);
            // element.appendChild(ulFoot);
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
            var ulNew = document.createElement('ul');
            ulNew.id = 'newDepPost';
            ulNew.className = 'newDepPost';
            var aElement = document.createElement('a');
            // Adiciona o conteúdo antigo de volta à div no elemento A
            aElement.textContent = conteudoAntigo;

            var ulFoot = document.createElement('ul');
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