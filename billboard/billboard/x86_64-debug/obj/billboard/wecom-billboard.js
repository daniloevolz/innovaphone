
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
    var list_history = []; 
    var list_editors_departments = [];
    var list_viewers_departments = [];
    var createDepartment = false;
    var billboard;
    

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
        billboard = that.add(new innovaphone.ui1.Div(null, null, "billboard").setAttribute("id", "billboard"))
        app.send({ api: "user", mt: "TableUsers" });
        app.send({ api: "user", mt: "SelectDepartments" });

    }
    
    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "NoLicense") {
            console.log(obj.result);
            makeDivNoLicense(obj.result);
        }
        if (obj.api == "user" && obj.mt == "TableUsersResult") {
            list_tableUsers = JSON.parse(obj.result);
            createDepartment = Boolean(obj.create_department);
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
            // Objeto para rastrear os ids únicos
            var uniqueIds = {};
            // Iterar sobre a lista inputData e chamar a função para cada item
            for (var i = 0; i < views_history.length; i++) {
                var post = views_history[i].id;
                changeBackgroundColor(post);
                var department = views_history[i].department;
                if (!uniqueIds[department]) {
                    uniqueIds[department] = true;
                    console.log("Id único encontrado:", department);
                    changeDepBackgroundColor(department);
                }
            }
            
        }
        if (obj.api == "user" && obj.mt == "SelectHistoryByPostResult") {
            console.log(obj.result);
             list_history = JSON.parse(obj.result)
            // createHistoryViewsPostGrid(JSON.parse(obj.result))
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
    function makeDivNoLicense(msg) {
        that.clear();
        //Titulo 
        that.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:100%; top:40%; font-size:18px; text-align:center; font-weight: bold; color: darkblue;", msg));

    }
    function makeDivDepartments() {
        document.getElementById("billboard").innerHTML = '';
        var worktable = billboard.add(new innovaphone.ui1.Node("div",null,null,null).setAttribute("id",'worktable'))
        var depcards = worktable.add(new innovaphone.ui1.Node("div",null,null,"depcards").setAttribute("id","depcards"))
        var logoWecom = worktable.add(new innovaphone.ui1.Node("div",null,null,"logo").setAttribute("id","logowecom"))
        depcards.innerHTML = '';
        list_departments.forEach(function (department) {
            var div = depcards.add(new innovaphone.ui1.Node("div",`display:flex;justify-content:center;align-items:center;border-radius:5px;margin:10px;background-color:${department.color};`,null,"card"));
            div.setAttribute("id",department.id)
            var card = document.querySelectorAll(".card")
            card.forEach(function(cards){
                cards.addEventListener('click', function () {
                    // Coletar o ID do elemento div clicado
                    var clickedId = this.id;
                    console.log('ID do elemento div clicado:', clickedId);
                    app.send({ api: "user", mt: "SelectPosts", department: clickedId });
                })
            })
            var ulNew = div.add(new innovaphone.ui1.Node("ul",null,null,null).setAttribute("id","newDepPost"))
            var aElement = div.add(new innovaphone.ui1.Node("a",null,department.name,null))
        });

        if (createDepartment == true) {
            var divAdd = depcards.add(new innovaphone.ui1.Node("div","display:flex;justify-content:center;align-items:center;border-radius:5px;background-color: rgb(68, 87, 91);margin:10px;",texts.text("labelAdd"),"cardnew"))
            var cardnew = document.querySelectorAll(".cardnew")
            cardnew.forEach(function(add){
                add.addEventListener('click',function(){
                    console.log("O elemento divAdd foi clicado!");
                    createDepartmentForm();
                })
            })
        }

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
        document.getElementById("billboard").innerHTML = '';
        var worktable = billboard.add(new innovaphone.ui1.Node("div",null,null,null).setAttribute("id","worktable"))
        var postDepartDiv = worktable.add(new innovaphone.ui1.Node("div",null,null,"post-depart").setAttribute("id","post-depart"));
        var logoWecom = worktable.add(new innovaphone.ui1.Node("div",null,null,"logo").setAttribute("id","logowecom"))

        // Criar divs para cada departamento
        list_posts.forEach(function (post) {
            var postDiv = postDepartDiv.add(new innovaphone.ui1.Node("div",`background-color:${post.color}`,null,"post").setAttribute("id",post.id))
            // postDiv.setAttribute("id","postdiv")
            // postDiv.id = post.id;
            // postDiv.className = 'post';
            // /*postDiv.textContent = post.title;*/
            // postDiv.style.backgroundColor = post.color;

            // Adicionar o event listener de clique
            var a = document.getElementById(post.id)

                a.addEventListener('click', function () {
                    var clickedId = this.id;
                        console.log('ID do elemento div clicado:', clickedId);
                         console.log(post)
                        var user = post.user_guid;
                        console.log(user)
                        var user = list_tableUsers.filter(function (item) {
                            return item.guid == post.user_guid;
                })[0];
                console.log(user)
                makeDivPostMessage(clickedId, dep_id, user);
            });
            var isEditor = list_departments_editor.filter(function (item) {
                return item.id === parseInt(dep_id, 10);
            
            })[0];

            var headpost = postDiv.add(new innovaphone.ui1.Node("ul",null,null,"headpost").setAttribute("id","headpost"))
            // postDiv.appendChild(headpost);
            // var headpost = document.createElement('ul');
            // headpost.id = 'headpost';
            var textpost = postDiv.add(new innovaphone.ui1.Node("a",null,post.title,null).setAttribute("id","textpost"))
            // var textpost = document.createElement('a');
            // textpost.id = 'textpost';
            // textpost.textContent = post.title;
            // postDiv.appendChild(textpost);

            if (isEditor) {
                var starDate = new Date(post.date_start);
                var endDate = new Date(post.date_end);
                var now = new Date();
                console.log("Start Date" + starDate + "End Date" + endDate + "Now" + now)

                var hdposts = document.querySelectorAll(".headpost");

                hdposts.forEach(function(hdpost) {
                    if (post.deleted) {
                        hdpost.className = 'deletedpost';
                    }else if (starDate > now) {
                        hdpost.className = 'futurepost';
                    } else {
                        hdpost.className = ''; 
                    }
                });
                // if (starDate>now) {
                //     headpost.className ='futurepost';
                // }
                // if (post.deleted) {
                //     document.getElementById("headpost").className = 'deletedpost'
                //     //headpost.className ='deletedpost';
                // };
                
                var footpost = postDiv.add(new innovaphone.ui1.Node("ul",null,null,"footpost").setAttribute("id","footpost"))
                // var footpost = document.createElement('ul');
                // footpost.id = 'footpost';
                // footpost.className = "footpost";

                var spanStart = footpost.add(new innovaphone.ui1.Node("span","font-size:10px;",null,"dateS").setAttribute("id","dateS"))
                //document.getElementById("dateS").innerHTML = "Início: " + formatDate(starDate);
                // spanStart.textContent = "Início: " + formatDate(starDate);
                
                var spanEnd = footpost.add(new innovaphone.ui1.Node("span","font-size:10px;",null,"dateE").setAttribute("id","dateE"))
               // document.getElementById("dateE").innerHTML = "Fim: " + formatDate(endDate);
                // spanEnd.textContent = "Fim: " + formatDate(endDate);
                var postid = document.getElementById(post.id)
                var dateStartSpan = postid.querySelector(".dateS"); 
                var dateEndSpan = postid.querySelector(".dateE"); 
                dateStartSpan.textContent = "Início: " + formatDate(starDate);
                dateEndSpan.textContent = "Fim: " + formatDate(endDate);

                // var spanEnd = document.createElement('span');
                // spanEnd.id = 'dateE';
                // spanEnd.style.fontSize = '10px';
                // spanEnd.textContent = "Fim: " + formatDate(endDate);

                function formatDate(date) {
                    var day = date.getDate();
                    var month = date.getMonth() + 1; // Months are 0-indexed
                    var year = date.getFullYear();

                    // Add leading zeros if needed
                    if (day < 10) day = '0' + day;
                    if (month < 10) month = '0' + month;

                    return day + '/' + month + '/' + year;
                }

                // footpost.appendChild(spanStart);
                // footpost.appendChild(spanEnd);

                postDiv.id = post.id;
                postDiv.className = 'post';
                document.getElementById(post.id).style.backgroundColor = post.color;
                //postDiv.style.backgroundColor = post.color;
                
                postDiv.add(footpost);
            }
            postDepartDiv.add(postDiv);
        })
        var isEditor = list_departments_editor.filter(function (item) {
            return item.id === parseInt(dep_id, 10);
        })[0];
        if (isEditor) {
            // Criar os elementos 'Adicionar +'

                var postNew1Div = postDepartDiv.add(new innovaphone.ui1.Node("div",null,texts.text("labelAdd"),"postnew").setAttribute("id","postnew1"))
            // var postNew1Div = document.createElement('div');
            // postNew1Div.id = 'postnew1';
            // postNew1Div.className = 'postnew';
            // postNew1Div.textContent = 'adicionar +';
            // Adicionando o listener de clique
            var postnew = document.getElementById("postnew1");
            postnew.addEventListener('click', function () {
                console.log("O elemento divAdd foi clicado!");
                createPostForm(dep_id);
            });
            // Adicionar os elementos criados � div com o ID 'post-depart'
            // postDepartDiv.appendChild(postNew1Div);
        }
            var footButtons = worktable.add(new innovaphone.ui1.Node("div",null,null,"footbuttons").setAttribute("id","footbuttons"))
        // var footButtons = document.createElement('div');
        // footButtons.id = 'footbuttons';
        // footButtons.className = 'footbuttons';
        // worktable.appendChild(footButtons);
            var backDiv = footButtons.add(new innovaphone.ui1.Node("div",null,null,"backDiv").setAttribute("id","backDiv"))

        // var backDiv = document.createElement('div');
        // backDiv.id = 'backDiv';
        // backDiv.className = 'backDiv'
            var back = document.getElementById("backDiv");

        back.addEventListener("click", function () {
            document.getElementById("post-depart").style.display = 'none';
            makeDivDepartments();
        })

        //footButtons.appendChild(backDiv);

        if(isEditor){

            var editDepDiv = footButtons.add(new innovaphone.ui1.Node("div",null,null,"editDepDiv").setAttribute("id","editDepDiv"));
            
            // var editDepDiv = document.createElement("div");
            // editDepDiv.className = 'editDepDiv'
            var edit = document.getElementById("editDepDiv")
            edit.addEventListener("click", function (isEditor) {
                console.log("CLICK BOTÃO EDITAR")
                editDepartmentForm(dep_id)
            })
                var delDepDiv = footButtons.add(new innovaphone.ui1.Node("div",null,null,"delDepDiv").setAttribute("id","delDepDiv"));
            // var delDepDiv = document.createElement("div");
            // delDepDiv.className = 'delDepDiv'
            var del = document.getElementById("delDepDiv")
            del.addEventListener("click", function (isEditor) {
                console.log("CLICK BOTÃO DELETAR")
                var hasPosts = list_posts.filter(function (item) {
                    return item.department === parseInt(dep_id, 10) && item.deleted == "";
                });
                if (hasPosts) {
                    window.alert("ATENÇÃO!!!\n\nVocê deve excluir todos os Posts antes de excluir o Departamento.")
                } else {
                    app.send({ api: "user", mt: "DeleteDepartment", id: dep_id });
                }
                
            })
            var timedDepDiv = footButtons.add(new innovaphone.ui1.Node("div",null,null,"timedDepDiv").setAttribute("id","timeDepDiv"))
            // var timedDepDiv = document.createElement("div");
            // timedDepDiv.className= 'timedDepDiv'
            var time = document.getElementById("timeDepDiv")
            time.addEventListener("click", function (isEditor) {
                console.log("CLICK BOTÃO SELETOR TEMPO ABRIR POSTS E ENTÂO ENVIAR APP.SEND")
               
                var worktable1 = document.getElementById('worktable');
                var depTimeManager = document.getElementById('depTimeManager');

                if (depTimeManager) {
                    worktable1.removeChild(depTimeManager)
                    // worktable1.remove(depTimeManager);
                    // console.log("Removido")

                } else {
                    var depTimeManager = worktable.add(new innovaphone.ui1.Node("div",null,null,"depTimeManager").setAttribute("id","depTimeManager"))

                    var topSelect = depTimeManager.add(new innovaphone.ui1.Node("div",null,null,"topselect").setAttribute("id","topselect"))
                    
                    var middleSelect = depTimeManager.add(new innovaphone.ui1.Node("div",null,null,"mdselect").setAttribute("id","mdselect"))

                    var customPeriodDiv = middleSelect.add(new innovaphone.ui1.Node("div","display:none;",null,"customPeriod").setAttribute("id","customPeriod"))
                    
                    var bottomSelect = depTimeManager.add(new innovaphone.ui1.Node("div",null,null,"btselect").setAttribute("id","btselect"))
                    // var depTimeManager = document.createElement('div');
                    // depTimeManager.id = 'depTimeManager';
                    // depTimeManager.className = 'depTimeManager'
                    // var select = topSelect.add(new innovaphone.ui1.Node("div",null,null,"periodSelector").setAttribute("id","periodSelector"))
                    // var select = document.createElement('select');
                    // select.id = 'periodSelector';
                    // select.className = 'periodSelector';
                    // var options = [
                    //     'Hoje', 'Últimos 7 dias', 'Últimos 30 dias', 'Próximos 7 dias', 'Próximos 30 dias', 'Desde Sempre', 'Período Customizado'
                    // ];

                    // options.forEach(function (optionText) {
                    //     var option = document.createElement('option');
                    //     option.value = optionText.toLowerCase().replace(/\s/g, '');
                    //     option.textContent = optionText;
                    //     select.add(option);
                    // });
                    // var customPeriodDiv = middleSelect.add(new innovaphone.ui1.Node("div","display:none;",null,"customPeriod").setAttribute("id","customPeriod"))
    
                    // var customPeriodDiv = document.createElement('div');
                    // customPeriodDiv.id = 'customPeriod';
                    // customPeriodDiv.className = 'customPeriod';
                    // customPeriodDiv.style.display = 'none';
                    // var bottomSelect = depTimeManager.add(new innovaphone.ui1.Node("div",null,null,"btselect").setAttribute("id","btselect"))

                    var startDateLabel = customPeriodDiv.add(new innovaphone.ui1.Node("label",null,texts.text("labelInicio"),"startDateLabel"))

                    // var startDateLabel = document.createElement('label');
                    // startDateLabel.textContent = 'Início:';
                    // startDateLabel.style.marginLeft = '10px';
                    // startDateLabel.style.marginRight = '0px';
                    // startDateLabel.style.fontSize = '18px';
                    // startDateLabel.style.height = '20px';
                    // startDateLabel.style.width = '145px';
                    // startDateLabel.style.position = 'relative';
                    // startDateLabel.style.left = '95px';
                    var startDateInput = customPeriodDiv.add(new innovaphone.ui1.Input(null,null,null,null,"date","dateinput").setAttribute("id","data_start"));
                    // var startDateInput = document.createElement('input');
                    // startDateInput.type = 'date';
                    // startDateInput.id = 'data_start';
                    // startDateInput.className = 'dateinput';
                    var endDateLabel = customPeriodDiv.add(new innovaphone.ui1.Node("label",null,texts.text("labelExpired"),"endDateLabel"))

                    // var endDateLabel = document.createElement('label');
                    // endDateLabel.textContent = 'Expiração:';
                    // endDateLabel.style.marginLeft = '10px';
                    // endDateLabel.style.marginRight = '0px';
                    // endDateLabel.style.fontSize = '18px';
                    // endDateLabel.style.height = '20px';
                    // endDateLabel.style.width = '145px';
                    // endDateLabel.style.position = 'relative';
                    // endDateLabel.style.left = '61px';

                    var endDateInput = customPeriodDiv.add(new innovaphone.ui1.Input(null,null,null,null,"date","dateinput").setAttribute("id","data_end"));

                    // var endDateInput = document.createElement('input');
                    // endDateInput.type = 'date';
                    // endDateInput.id = 'data_end';
                    // endDateInput.className = 'dateinput';

                    var checkboxButtonLabel = bottomSelect.add(new innovaphone.ui1.Node("label","font-size:18px;",texts.text("labelExcluidos"),null))
                     // var checkboxButtonLabel = document.createElement('label');
                    // checkboxButtonLabel.textContent = 'Excluídos:';
                    // checkboxButtonLabel.style.fontSize = '18px';
                    var checkboxButton1 = bottomSelect.add(new innovaphone.ui1.Input("width:30px;height:25px;margin:0px 15px;","deleted",null,null,"checkbox",null).setAttribute("id","checkboxDeleted"))

                    // var checkboxButton1 = document.createElement('input');
                    // checkboxButton1.type = 'checkbox';
                    // checkboxButton1.style.width = '30px'
                    // checkboxButton1.style.height = '25px'
                    // checkboxButton1.style.margin = '0px 15px';
                    // checkboxButton1.name = 'checkboxDeleted';
                    // checkboxButton1.value = 'deleted';

                    var submitButton = bottomSelect.add(new innovaphone.ui1.Node("button","width: 46px; height: 25px; margin: 10px;",texts.text("btnOk")).setAttribute("id","submitButton"))

                    // var submitButton = document.createElement('button');
                    // submitButton.textContent = 'OK';
                    // submitButton.id = 'submitButton';
                    // submitButton.style.width = '46px';
                    // submitButton.style.height = '25px';
                    // submitButton.style.margin = '10px';

                    //var topSelect = depTimeManager.add(new innovaphone.ui1.Node("div",null,null,"topselect").setAttribute("id","topselect"))

                    // var topSelect = document.createElement('div');
                    // topSelect.id = 'topselect'
                    // topSelect.className = 'topselect'
                    //var middleSelect = depTimeManager.add(new innovaphone.ui1.Node("div",null,null,"mdselect").setAttribute("id","mdselect"))

                    // var customPeriodDiv = middleSelect.add(new innovaphone.ui1.Node("div","display:none;",null,"customPeriod").setAttribute("id","customPeriod"))
                    // var middleSelect = document.createElement('div');
                    // middleSelect.id = 'mdselect'
                    // middleSelect.className = 'mdselect'
                    // var bottomSelect = depTimeManager.add(new innovaphone.ui1.Node("div",null,null,"btselect").setAttribute("id","btselect"))
                    // var bottomSelect = document.createElement('div');
                    // bottomSelect.id = 'btselect'
                    // bottomSelect.className = 'btselect'

                    // depTimeManager.appendChild(topSelect);
                    // depTimeManager.appendChild(middleSelect);
                    // depTimeManager.appendChild(bottomSelect);

                    // topSelect.appendChild(select);

                    // customPeriodDiv.appendChild(startDateLabel);
                    // customPeriodDiv.appendChild(startDateInput);
                    // customPeriodDiv.appendChild(endDateLabel);
                    // customPeriodDiv.appendChild(endDateInput);

                   // middleSelect.appendChild(customPeriodDiv);

                    // bottomSelect.appendChild(checkboxButtonLabel);
                    // bottomSelect.appendChild(checkboxButton1);
                    // bottomSelect.appendChild(submitButton);
                    var select = topSelect.add(new innovaphone.ui1.Node("select",null,null,"periodSelector").setAttribute("id","periodSelector"))

                    var options = [
                            'Hoje', 'Últimos 7 dias', 'Últimos 30 dias', 'Próximos 7 dias', 'Próximos 30 dias', 'Desde Sempre', 'Período Customizado'
                         ];
    
                         options.forEach(function (optionText) {
                            var option = select.add(new innovaphone.ui1.Node("option", null, optionText, null));
                            var optionValue = optionText.toLowerCase().replace(/\s/g, ''); 
                            option.setAttribute("id", "optvalue"); 
                            option.setAttribute("value", optionValue);
                            // select.add(option);
                        });

                    var selectPeriod = document.getElementById("periodSelector")
                    selectPeriod.addEventListener('change', function () {
                        if (selectPeriod.value === 'períodocustomizado') {
                            console.log("Periodo Customizado!")
                            document.getElementById("customPeriod").style.display = 'flex'
                            // customPeriodDiv.style.display = 'flex';
                            document.getElementById("depTimeManager").className = 'depTimeManagerPersonal'
                           // depTimeManager.className = 'depTimeManagerPersonal';
                            document.getElementById("mdselect").style.display = 'flex';
                            // middleSelect.style.display = 'flex';
                            selectPeriod.className = 'periodSelectorPersonal';
                            document.getElementById("topselect").className = 'topselectPersonal'
                            // topSelect.className = 'topselectPersonal';
                            document.getElementById("btselect").className = 'btselectPersonal'
                            // bottomSelect.className = 'btselectPersonal';
                            //document.getElementById("depTimeManager").style.transition = 'width 1s, height 1s'
                          //depTimeManager.style.transition = 'width 1s, height 1s';//
                        } else {
                            // customPeriodDiv.style.display = 'none';
                            document.getElementById("customPeriod").style.display = 'none'
                            document.getElementById("depTimeManager").className = 'depTimeManager'
                            //depTimeManager.className = 'depTimeManager';
                            // middleSelect.style.display = 'none';
                            document.getElementById("mdselect").style.display = 'none';
                            selectPeriod.className = 'periodSelector';
                            // topSelect.className = 'topselect';
                            document.getElementById("topselect").className = 'topselect'
                            document.getElementById("btselect").className = 'btselect';
                            //document.getElementById("depTimeManager").style.transition = ''
                          //depTimeManager.style.transition = '';//
                        }
                    });
                    var submit = document.getElementById("submitButton")
                    submit.addEventListener('click', function () {
                        var selectedValue = document.getElementById("periodSelector").value
                        console.log("SELECTED VALUE" + selectedValue)
                        // var selectedValue = select.value;
                        var startDate, endDate;
                        var query = '';
                        var checkboxbtn = document.getElementById("checkboxDeleted")
                        console.log(checkboxbtn + "CHECKBOX DELETED")
                        if (!checkboxbtn.checked) {
                           // query += " AND deleted IS NULL";
                           query += " AND deleted IS NULL";
                        }

                        switch (selectedValue) {
                            case 'hoje':
                                startDate = endDate = new Date().toISOString()
                                query += " AND date_start <= '" + startDate + "' AND date_end >= '" + endDate + "'";
                                break;
                            case 'últimos7dias':
                                now = new Date().toISOString();
                                startDate = new Date();
                                startDate.setDate(startDate.getDate() - 6);
                                startDate = startDate.toISOString();
                                query += " AND date_start >= '" + startDate + "' AND date_start <= '" + now + "'";
                                break;
                            case 'últimos30dias':
                                now = new Date().toISOString();
                                startDate = new Date();
                                startDate.setDate(startDate.getDate() - 29);
                                startDate = startDate.toISOString();
                                query += " AND date_start >= '" + startDate + "' AND date_start <= '" + now + "'";
                                break;
                            case 'próximos7dias':
                                now = new Date().toISOString();
                                startDate = new Date();
                                startDate.setDate(startDate.getDate() + 6);
                                startDate = startDate.toISOString();
                                query = " AND date_start >= '" + now + "' AND date_start <= '" + startDate + "'";
                                break;
                            case 'próximos30dias':
                                now = new Date().toISOString();
                                startDate = new Date();
                                startDate.setDate(startDate.getDate() + 29);
                                startDate = startDate.toISOString();
                                query += " AND date_start >= '" + now + "' AND date_start <= '" + startDate + "'";
                                break;
                            case 'desdesempre':
                                query += ";";
                                break;
                            case 'períodocustomizado':
                                var startDateIpt = document.getElementById("data_start")
                                var endDateIpt = document.getElementById("data_end")
                                startDate = startDateIpt.value;
                                endDate = endDateIpt.value;
                                var startDateObj = new Date(startDate).toISOString()
                                var endDateObj = new Date(endDate);
                                endDateObj.setUTCHours(23,59,59)
                                endDateObj = endDateObj.toISOString()
                                console.log("END DATE OBJ" + endDateObj)
                                query += " AND date_start >= '" + startDateObj + "' AND date_end <= '" + endDateObj + "'";
                                break;
                        }


                        console.log('Data de início:', startDate);
                        console.log('Data de término:', endDate);
                        //var query = "AND date_start >= '" + startDate + "' AND date_end <= '" + endDate + "' AND deleted IS NULL";
                        app.send({ api: "user", mt: "SelectPosts", department: parseInt(dep_id, 10), query: query });
                    });

                    worktable.add(depTimeManager);

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
            
            // footButtons.appendChild(delDepDiv);
            // footButtons.appendChild(timedDepDiv);
            // footButtons.appendChild(editDepDiv);
        }
        
        // Obter a div com o ID 'billboard'
        // var billboardDiv = document.getElementById('billboard');
        // if (billboardDiv) {

        //     // Adicionar o elemento 'worktable' ao 'billboardDiv'
        //     billboardDiv.innerHTML = '';
        //     billboardDiv.appendChild(worktable);
        // } else {
        //     console.error("A div com o ID 'billboard' não foi encontrada.");
        // }
        // Iterar sobre a lista inputData e chamar a função para cada item
        for (var i = 0; i < views_history.length; i++) {
            var post = views_history[i].id;
            changeBackgroundColor(post);
        }
        
    }
    function makeDivPostMessage(id, dep_id, user) {
        

        //limpa a div BILlBOARD
        document.getElementById('billboard').innerHTML = '';

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
        var insideDiv = billboard.add(new innovaphone.ui1.Node('div', null, null, 'insideDiv').setAttribute('id', 'insideDiv'));
        // insideDiv.className = 'insideDiv';
        // insideDiv.style.backgroundColor = post.color;

        var postMsgDiv = insideDiv.add(new innovaphone.ui1.Node('div', `background-color:${post.color}`, null, 'postmsg').setAttribute('id', 'postmsg'));
        //postMsgDiv.id = 'postmsg';
        //postMsgDiv.className = 'postmsg'
        //postMsgDiv.style.backgroundColor = post.color;


        var closeWindowDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, null, 'closewindow').setAttribute('id', 'closewindow'));
        //closeWindowDiv.id = 'closewindow';
            if (isEditor) {
            app.send({ api: "user", mt: "SelectHistoryByPost", post: parseInt(id, 10), })

            var historyPostDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, null, 'historypost').setAttribute('id', 'historypost'));
            //historyPostDiv.id = 'historypost';
            var backDescription = postMsgDiv.add(new innovaphone.ui1.Node('div','display: none;', null, 'backDescription').setAttribute('id', 'backDescription'));
            //backDescription.id = 'backDescription';
            //backDescription.style.display = 'none';
            var editPostDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, null, 'editpost').setAttribute('id', 'editpost'));
            //editPostDiv.id = 'editpost';
            var deletePostDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, null, 'deletepost').setAttribute('id', 'deletepost'));
            //deletePostDiv.id = 'deletepost';
            
                //postMsgDiv.appendChild(historyPostDiv);
                //postMsgDiv.appendChild(backDescription);
                //postMsgDiv.appendChild(editPostDiv);
                //postMsgDiv.appendChild(deletePostDiv);
            }

        // Adicionando o listener de clique
        var a = document.getElementById('closewindow');
        a.addEventListener('click', function () {
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
        //closeWindowDiv.addEventListener('click', function () {
        //    console.log("O elemento closeWindowDiv foi clicado!");
        //    var isNew = views_history.filter(function (item) {
        //        return item.id === parseInt(id, 10);
        //    })[0];
        //    if (isNew) {
        //        console.log("Post NEW Visualizado:", post.id);
        //        app.send({ api: "user", mt: "InsertViewHistory", post: post.id, src: parseInt(department.id, 10) });

        //    } else {
        //        makeDivPosts(post.department);
        //    }
        //});
        var hist = document.getElementById('historypost');
        var back = document.getElementById('backDescription');
        hist.addEventListener('click', function () {
            console.log("O elemento historyPostDiv foi clicado!", id);
            //app.send({ api: "user", mt: "SelectHistoryByPost", post: parseInt(id, 10), })

            // FUNÇAÕ VEM AQUI 
            document.getElementById('msgbox').innerHTML = '';
            
        var table = msgBoxDiv.add(new innovaphone.ui1.Node('table', null, null, 'table'));
        var headerRow = table.add(new innovaphone.ui1.Node('tr', null, null, 'row'));
        var nameCol = headerRow.add(new innovaphone.ui1.Node('th', null, 'Usuário', 'column'));
        var dateCol = headerRow.add(new innovaphone.ui1.Node('th', null, 'Data', 'column'));
        list_history.forEach(function (view) {

            row = table.add(new innovaphone.ui1.Node('tr', null, null, 'row'));
            var user = list_tableUsers.filter(function (item) {
                return item.guid == view.user_guid;
            })[0];
            var nameCol = row.add(new innovaphone.ui1.Node('td', null, user.cn, 'column'));
            var dateString = view.date;
            var date = new Date(dateString);
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var formattedDate = (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year + ' - ' + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
            var dateCol = row.add(new innovaphone.ui1.Node('td', null, formattedDate, 'column'));
        });
        //msgBoxDiv.appendChild(table);

            hist.style.display = 'none';
            back.style.display = 'block';
            hist.removeEventListener("click",hist);
        });
        var back = document.getElementById('backDescription');
        back.addEventListener('click', function () {
            msgContent.innerHTML = post.description;
            document.getElementById("msgbox").innerHTML = ''
            msgBoxDiv.add(msgContent);

            hist.style.display = 'flex';
            back.style.display = 'none';
            back.removeEventListener('click',back)
        });
        var edit = document.getElementById('editpost');
        edit.addEventListener('click', function () {
            console.log("O elemento editPostDiv foi clicado!");
            editPostForm(id, dep_id);
        });
        var del = document.getElementById('deletepost');
        del.addEventListener('click', function () {
            console.log("O elemento deletePostDiv foi clicado!");
            app.send({ api: "user", mt: "DeletePost", id: parseInt(id, 10), src: dep_id });
        });
        var nameBoxDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, department.name, 'namebox').setAttribute('id', 'namebox'));
        var titleMsgDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, post.title, 'titlemsg').setAttribute('id', 'titlemsg'));
        var msgBoxDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', 'height: 75%;', null, 'msgbox').setAttribute('id', 'msgbox'));
        var scrollBox = msgBoxDiv.add(new innovaphone.ui1.Node('scrollbox', 'display: flex; color:white; width:100%; height:100%;', null, 'scrollbox').setAttribute('id', 'scrollbox'));
        var msgContent = scrollBox.add(new innovaphone.ui1.Node('div', 'overflow:auto;',post.description, 'msgcontent').setAttribute('id', 'msgcontent'));
        var footShowPost = postMsgDiv.add(new innovaphone.ui1.Node('div', null, null, 'footShowPost').setAttribute('id', 'footShowPost'));
        footShowPost.id = 'footShowPost';
        footShowPost.className = 'footShowPost';

        var creatorPost = footShowPost.add(new innovaphone.ui1.Node('div', null, 'Criador: ' + user.cn, 'creatorPost').setAttribute('id', 'creatorPost'));
        //creatorPost.id = 'creatorPost';
        //creatorPost.className = 'creatorPost';
        //creatorPost.innerHTML = 'Criador: ' + user.cn;

        //console.log('Quero saber: ', user.cn);

        var closeDateDiv = footShowPost.add(new innovaphone.ui1.Node('div', null, formattedDate, 'closedate').setAttribute('id', 'closedate'));
        //closeDateDiv.id = 'closedate';
        //closeDateDiv.className = 'closedate';

        var dateString = post.date_end;
        var date = new Date(dateString);
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var formattedDate = 'Fim: ' + (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year + ' - ' + hours + ':' + (minutes < 10 ? '0' : '') + minutes;

        document.getElementById("closedate").innerHTML = formattedDate
        //closeDateDiv.innerHTML = formattedDate;

        //footShowPost.appendChild(creatorPost);
        //footShowPost.appendChild(closeDateDiv);
        
        // Adicionar os elementos criados � div com o ID 'billboard'
        //var billboardDiv = document.getElementById('billboard');
        
        //    //billboardDiv.innerHTML = '';
        //    scrollBox.appendChild(msgContent);
        //    msgBoxDiv.appendChild(scrollBox);
        //    postMsgDiv.appendChild(closeWindowDiv);
        //    postMsgDiv.appendChild(nameBoxDiv);
        //    postMsgDiv.appendChild(titleMsgDiv);
        //    postMsgDiv.appendChild(msgBoxDiv);
        //    postMsgDiv.appendChild(footShowPost);

        //    billboardDiv.appendChild(insideDiv);
        //    insideDiv.appendChild(postMsgDiv);

    }
    function createPostForm(dep_id) {
        var department = list_departments.filter(function (item) {
            return item.id === parseInt(dep_id, 10);
        })[0];
        //var billboard = document.getElementById('billboard').innerHTML = '';

        var insideDiv = billboard.add(new innovaphone.ui1.Node("div", null, null, 'insideDiv').setAttribute("id", "insideDiv"));
        //insideDiv.className = 'insideDiv';
        var postMsgDiv = insideDiv.add(new innovaphone.ui1.Node("div", 'background-color:#0f243f;', null, 'postmsg').setAttribute("id", "postmsg"));
        //postMsgDiv.id = 'postmsg';
        //postMsgDiv.className = 'postmsg';
        //postMsgDiv.style.backgroundColor = '#0f243f';
        var nameBoxDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, department.name, 'namebox').setAttribute("id", "namebox"));
        //nameBoxDiv.id = 'namebox';
        //nameBoxDiv.className = 'namebox';
        //nameBoxDiv.innerHTML = department.name;
        var closeWindowDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, null, 'closewindow').setAttribute("id", "closewindow"));
        //closeWindowDiv.id = 'closewindow';
        var titleMsgDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, null, 'titlemsg').setAttribute("id", "titlemsg"));
        var titleinput = titleMsgDiv.add(new innovaphone.ui1.Input('color: #ffff; background-color: rgb(93 126 131 / 36%);', null, "Título", 40, "text", 'titleinput').setAttribute("id", "titleevent"));
        //titleMsgDiv.id = 'titlemsg';
        //titleMsgDiv.className = 'titlemsg';
        //titleMsgDiv.innerHTML = '<input id="titleevent" type="text" placeholder="Título" style="color: #ffff; background-color: rgb(93 126 131 / 36%);">';

        var msgBoxDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, null, 'msgbox').setAttribute("id", "msgbox"));
        var msgBoxText = msgBoxDiv.add(new innovaphone.ui1.Node('textarea', null, null, '1000', 'msgevent').setAttribute("id", "msgevent"));
        msgBoxText.setAttribute('placeHolder', 'Texto da Mensagem: ');

        var p = msgBoxDiv.add(new innovaphone.ui1.Node('p', null, '1000', 'char-counter').setAttribute("id", "charCount"));
        //msgBoxDiv.id = 'msgbox';
        //msgBoxDiv.className = 'msgbox';
        //msgBoxDiv.innerHTML = '<textarea name="" id="msgevent" cols="30" rows="80" placeholder="Texto da mensagem" maxlength="1000"></textarea>' + '<p class="char-counter"><span id="charCount">1000</span> /1000</p>';

        //document.body.appendChild(msgBoxDiv);

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
        var dateStart = dateDiv.add(new innovaphone.ui1.Input(null, null, null, '1000', 'datetime-local', 'dateinput').setAttribute("id", "startevent"));
        var dateEnd = dateDiv.add(new innovaphone.ui1.Input(null, null, null, '1000', 'datetime-local', 'dateinput').setAttribute("id", "endevent"));
        //dateDiv.id = 'date';
        //dateDiv.style.backgroundColor = 'rgb(93 126 131 / 36%)';
        //dateDiv.style.fontSize = '12px';
        //var dateInput = document.getElementById('date').innerHTML = '<a>Data de Início: </a><input type="datetime-local" id="startevent" class="dateinput"> <a>Data de Fim: </a><input type="datetime-local" id="endevent" class="dateinput">';
        //dateDiv.innerHTML = '<a>Data de Início: </a><input type="datetime-local" id="startevent" class="dateinput"> <a>Data de Fim: </a><input type="datetime-local" id="endevent" class="dateinput">';

        var buttonsDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, null, 'buttons').setAttribute("id", "buttons"));
        //buttonsDiv.className = 'buttons';
        var paletteColor = document.getElementById('buttons').innerHTML = '<a>Selecione a cor:</a><ul id="palette" class="palette"></ul><input type="color" id="colorbox" style="display: none;">';
        //buttonsDiv.innerHTML = '<a>Selecione a cor:</a><ul id="palette" class="palette"></ul><input type="color" id="colorbox" style="display: none;">'; //onclick="openColorPicker()" onchange="updateColor(event)

        var saveMsgDiv = buttonsDiv.add(new innovaphone.ui1.Node('div', null, 'Inserir', 'saveclose').setAttribute("id", "savemsg"));
        //saveMsgDiv.id = 'savemsg';
        //saveMsgDiv.className = 'saveclose';
        //saveMsgDiv.textContent = 'Inserir';

        var closeMsgDiv = buttonsDiv.add(new innovaphone.ui1.Node('div', null, 'Fechar', 'saveclose').setAttribute("id", "closemsg"));
        //closeMsgDiv.id = 'closemsg';
        //closeMsgDiv.className = 'saveclose';
        //closeMsgDiv.textContent = 'Fechar';


        // Adicionando o listener de clique
        var s = document.getElementById('savemsg');
        s.addEventListener('click', function () {

            console.log("O elemento saveMsgDiv foi clicado!");
            var startPost = document.getElementById('startevent').value;
            var endPost = document.getElementById('endevent').value;
            var msgPost = document.getElementById('msgevent').value;
            var titlePost = document.getElementById('titleevent').value;
            var colorPost = document.getElementById('colorbox').value;

            console.log("Data Start:", startPost);
            app.send({ api: "user", mt: "InsertPost", title: titlePost, color: colorPost, description: msgPost, department: parseInt(dep_id, 10), date_start: startPost, date_end: endPost });
            s.removeEventListener();
        });

        //var closeMsgDiv = document.createElement('div');
        //closeMsgDiv.id = 'closemsg';
        //closeMsgDiv.className = 'saveclose';
        //closeMsgDiv.textContent = 'Fechar';

        // Adicionando o listener de clique
        //closeMsgDiv.addEventListener('click', function () {

        //    console.log("O elemento closeMsgDiv foi clicado!");
        //    makeDivPosts(dep_id);
        //});
        var q = document.getElementById('closewindow');
        q.addEventListener('click', function (post) {
            console.log("O elemento closeWindowDiv foi clicado!");
            makeDivPosts(dep_id);
            q.removeEventListener('click',q);          
        });
        var w = document.getElementById('closemsg');
        w.addEventListener('click', function () {
            console.log("O elemento closemsg foi clicado!");
            makeDivPosts(dep_id);
            w.removeEventListener('click');
        });
        //// Adicionando o listener de clique
        //closeWindowDiv.addEventListener('click', function () {

        //    console.log("O elemento closeWindowDiv foi clicado!");
        //    makeDivPosts(dep_id);
        //});

        //buttonsDiv.appendChild(saveMsgDiv);
        //buttonsDiv.appendChild(closeMsgDiv);
        //postMsgDiv.appendChild(nameBoxDiv);
        //postMsgDiv.appendChild(closeWindowDiv);
        //postMsgDiv.appendChild(titleMsgDiv);
        //postMsgDiv.appendChild(msgBoxDiv);
        //postMsgDiv.appendChild(dateDiv);
        //postMsgDiv.appendChild(buttonsDiv);
        //insideDiv.appendChild(postMsgDiv);

        // Exemplo de uso para adicionar os elementos criados à div com o ID 'billboard'
        var colorbox = document.getElementById("colorbox")
        colorbox.addEventListener("change", function () {
            document.getElementById("postmsg").style.backgroundColor = colorbox.value;
        })
        var palette = document.getElementById("palette")
        palette.addEventListener("click", function () {
            colorbox.click();
        })
        //var billboardDiv = document.getElementById('billboard');
        //if (billboardDiv) {
        //    //billboardDiv.appendChild(insideDiv);

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
    function editPostForm(id, dep_id) {
        var department = list_departments.filter(function (item) {
            return item.id === parseInt(dep_id, 10);
        })[0];

        var post = list_posts.filter(function (item) {
            return item.id === parseInt(id, 10);
        })[0];
        //var billboard = document.getElementById('billboard').innerHTML = '';

        document.getElementById('insideDiv').innerHTML = '';

        var insideDiv = billboard.add(new innovaphone.ui1.Node("div", null, null, 'insideDiv').setAttribute("id", "insideDiv"));
        //insideDiv.className = 'insideDiv';
        var postMsgDiv = insideDiv.add(new innovaphone.ui1.Node("div", null, null, 'postmsg').setAttribute("id", "postmsg"));
        document.getElementById('postmsg').style.backgroundColor = post.color;

        var nameBoxDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, department.name, 'namebox').setAttribute("id", "namebox"));
        //nameBoxDiv.id = 'namebox';
        //nameBoxDiv.className = 'namebox';
        //nameBoxDiv.innerHTML = department.name;
        var closeWindowDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, null, 'closewindow').setAttribute("id", "closewindow"));
        //closeWindowDiv.id = 'closewindow';
        var titleMsgDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, null, 'titlemsg').setAttribute("id", "titlemsg"));
        var titleinput = titleMsgDiv.add(new innovaphone.ui1.Input('color: #ffff; background-color: rgb(93 126 131 / 36%);', post.title, "Título", 40, "text", 'titleinput').setAttribute("id", "titleevent"));
        //titleMsgDiv.id = 'titlemsg';
        //titleMsgDiv.className = 'titlemsg';
        //titleMsgDiv.innerHTML = '<input id="titleevent" type="text" placeholder="Título" style="color: #ffff; background-color: rgb(93 126 131 / 36%);">';

        var msgBoxDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, null, 'msgbox').setAttribute("id", "msgbox"));
        var msgBoxText = msgBoxDiv.add(new innovaphone.ui1.Node('textarea', null, post.description, 'msgevent').setAttribute("id", "msgevent"));
        msgBoxText.setAttribute('placeHolder', 'Texto da Mensagem: ');
        msgBoxText.setAttribute('maxLenght', '1000');

        var p = msgBoxDiv.add(new innovaphone.ui1.Node('p', null, '1000', 'char-counter').setAttribute("id", "charCount"));
        //msgBoxDiv.id = 'msgbox';
        //msgBoxDiv.className = 'msgbox';
        //msgBoxDiv.innerHTML = '<textarea name="" id="msgevent" cols="30" rows="80" placeholder="Texto da mensagem" maxlength="1000"></textarea>' + '<p class="char-counter"><span id="charCount">1000</span> /1000</p>';

        //document.body.appendChild(msgBoxDiv);

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
        var dateStart = dateDiv.add(new innovaphone.ui1.Input(null, post.date_start, null, null, 'datetime-local', 'dateinput').setAttribute("id", "startevent"));
        var dateEnd = dateDiv.add(new innovaphone.ui1.Input(null, post.date_end, null, null, 'datetime-local', 'dateinput').setAttribute("id", "endevent"));
        //dateDiv.id = 'date';
        //dateDiv.style.backgroundColor = 'rgb(93 126 131 / 36%)';
        //dateDiv.style.fontSize = '12px';
        //var dateInput = document.getElementById('date').innerHTML = '<a>Data de Início: </a><input type="datetime-local" id="startevent" class="dateinput"> <a>Data de Fim: </a><input type="datetime-local" id="endevent" class="dateinput">';
        //dateDiv.innerHTML = '<a>Data de Início: </a><input type="datetime-local" id="startevent" class="dateinput"> <a>Data de Fim: </a><input type="datetime-local" id="endevent" class="dateinput">';

        var buttonsDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, null, 'buttons').setAttribute("id", "buttons"));
        //buttonsDiv.className = 'buttons';
        var paletteColor = document.getElementById('buttons').innerHTML = '<a>Selecione a cor:</a><ul id="palette" class="palette"></ul><input type="color" id="colorbox" style="display: none;">';
        //buttonsDiv.innerHTML = '<a>Selecione a cor:</a><ul id="palette" class="palette"></ul><input type="color" id="colorbox" style="display: none;">'; //onclick="openColorPicker()" onchange="updateColor(event)

        var saveMsgDiv = buttonsDiv.add(new innovaphone.ui1.Node('div', null, 'Inserir', 'saveclose').setAttribute("id", "savemsg"));
        //saveMsgDiv.id = 'savemsg';
        //saveMsgDiv.className = 'saveclose';
        //saveMsgDiv.textContent = 'Inserir';

        var closeMsgDiv = buttonsDiv.add(new innovaphone.ui1.Node('div', null, 'Fechar', 'saveclose').setAttribute("id", "closemsg"));
        //closeMsgDiv.id = 'closemsg';
        //closeMsgDiv.className = 'saveclose';
        //closeMsgDiv.textContent = 'Fechar';


        // Adicionando o listener de clique
        var s = document.getElementById('savemsg');
        s.addEventListener('click', function () {

            console.log("O elemento saveMsgDiv foi clicado!");
            var startPost = document.getElementById('startevent').value;
            var endPost = document.getElementById('endevent').value;
            var msgPost = document.getElementById('msgevent').value;
            var titlePost = document.getElementById('titleevent').value;
            var colorPost = document.getElementById('colorbox').value;

            console.log("Data Start:", startPost);
            app.send({ api: "user", mt: "UpdatePost", id: parseInt(id, 10), title: titlePost, color: colorPost, description: msgPost, department: parseInt(dep_id, 10), date_start: startPost, date_end: endPost }); s.removeEventListener();
        });

        //var closeMsgDiv = document.createElement('div');
        //closeMsgDiv.id = 'closemsg';
        //closeMsgDiv.className = 'saveclose';
        //closeMsgDiv.textContent = 'Fechar';

        // Adicionando o listener de clique
        //closeMsgDiv.addEventListener('click', function () {

        //    console.log("O elemento closeMsgDiv foi clicado!");
        //    makeDivPosts(dep_id);
        //});
        var q = document.getElementById('closewindow');
        q.addEventListener('click', function () {
            console.log("O elemento closeWindowDiv foi clicado!");
            makeDivPosts(dep_id);
            q.removeEventListener('click', q);
        });
        var w = document.getElementById('closemsg');
        w.addEventListener('click', function () {
            console.log("O elemento closemsg foi clicado!");
            makeDivPosts(dep_id);
            w.removeEventListener('click',w);
        });
        //// Adicionando o listener de clique
        //closeWindowDiv.addEventListener('click', function () {

        //    console.log("O elemento closeWindowDiv foi clicado!");
        //    makeDivPosts(dep_id);
        //});

        //buttonsDiv.appendChild(saveMsgDiv);
        //buttonsDiv.appendChild(closeMsgDiv);
        //postMsgDiv.appendChild(nameBoxDiv);
        //postMsgDiv.appendChild(closeWindowDiv);
        //postMsgDiv.appendChild(titleMsgDiv);
        //postMsgDiv.appendChild(msgBoxDiv);
        //postMsgDiv.appendChild(dateDiv);
        //postMsgDiv.appendChild(buttonsDiv);
        //insideDiv.appendChild(postMsgDiv);

        // Exemplo de uso para adicionar os elementos criados à div com o ID 'billboard'
        var colorbox = document.getElementById("colorbox")
        colorbox.addEventListener("change", function () {
            document.getElementById("postmsg").style.backgroundColor = colorbox.value;
        })
        var palette = document.getElementById("palette")
        palette.addEventListener("click", function () {
            colorbox.click();
        })
    }
    function createDepartmentForm() {

        // Adicionar os elementos criados � div com o ID 'billboard'
    //     var billboardDiv = document.getElementById('billboard');
    //     if (billboardDiv) {
    //         buttonsDiv.appendChild(saveMsgDiv);
    //         buttonsDiv.appendChild(closeMsgDiv);
    //         postMsgDiv.appendChild(closeWindowDiv);
    //         postMsgDiv.appendChild(nameDepDiv);
    //         var userTable = createUsersDepartmentsGrid();
    //         postMsgDiv.appendChild(userTable);
    //         postMsgDiv.appendChild(buttonsDiv);
    //         insideDiv.appendChild(postMsgDiv);
    //         billboardDiv.appendChild(insideDiv);

    //         var colorbox = document.getElementById("colorbox")
    //         colorbox.addEventListener("change", function () {
    //             postMsgDiv.style.backgroundColor = colorbox.value;
    //         })
    //         var palette = document.getElementById("palette")
    //         palette.addEventListener("click", function () {
    //             colorbox.click();
    //         })

    //     } else {
    //         console.error("A div com o ID 'billboard' não foi encontrada.");
    //     }
    // }

        var insideDiv = billboard.add(new innovaphone.ui1.Node("div",null,null,"insideDiv"))
        // var insideDiv = document.createElement('div');
        // insideDiv.className = 'insideDiv';
        var postMsgDiv = insideDiv.add(new innovaphone.ui1.Node("div",null,null,"newdep").setAttribute("id","newdep"))
        // Criar os elementos HTML
        // var postMsgDiv = document.createElement('div');
        // postMsgDiv.id = 'newdep';
        // postMsgDiv.className = 'newdep';
        var closeWindowDiv = postMsgDiv.add(new innovaphone.ui1.Node("div",null,null,null).setAttribute("id","closewindow"))
        // var closeWindowDiv = document.createElement('div');
        // closeWindowDiv.id = 'closewindow';
        // Adicionando o listener de clique
        var close = document.getElementById("closewindow")
        close.addEventListener('click', function () {
            console.log("O elemento closeWindowDiv foi clicado!");
            makeDivDepartments();
        });
        

        //var userTable = createUsersDepartmentsGrid();
        //         postMsgDiv.appendChild(userTable);

        var nameDepDiv = postMsgDiv.add(new innovaphone.ui1.Node("div",null,null,"nameDepDiv").setAttribute("id","nameDepDiv"))
        document.getElementById("nameDepDiv").innerHTML = '<input id="namedep" type="text" placeholder=" Nome do departamento " style="color: #ffff;">'
        
        
        var userTable = createUsersDepartmentsGrid();
        // document.getElementById("newdep").appendChild(userTable);
        postMsgDiv.add(userTable)
        // var nameDepDiv = document.createElement('div');
        // nameDepDiv.id = 'nameDepDiv';
        // nameDepDiv.style.display = 'flex';
        // nameDepDiv.style.backgroundColor = '#ffffff33';
        // nameDepDiv.style.color = 'white';
        // nameDepDiv.style.width = '80%';
        // nameDepDiv.style.height = '8%';
        // nameDepDiv.style.marginBottom = '15px';
        // nameDepDiv.style.marginTop = '15px';
        // nameDepDiv.innerHTML = '<input id="namedep" type="text" placeholder=" Nome do departamento" style="color: #ffff;">';
        var buttonsDiv = postMsgDiv.add(new innovaphone.ui1.Node("div",null,null,"buttonsDiv").setAttribute("id","buttonsDiv"))
        document.getElementById("buttonsDiv").innerHTML = '<a>Selecione a cor:</a><ul id="palette" class="palette"></ul><input type="color" id="colorbox" style="display: none;">'
        // var buttonsDiv = document.createElement('div');
        // buttonsDiv.className = 'buttons';
        // buttonsDiv.style.display = 'flex';
        // buttonsDiv.style.alignItems = 'center';
        // buttonsDiv.style.justifyContent = 'flex-start';
        // buttonsDiv.style.width = '80%';
        // buttonsDiv.style.color = '#FFFF';
        // buttonsDiv.innerHTML = '<a>Selecione a cor:</a><ul id="palette" class="palette"></ul><input type="color" id="colorbox" style="display: none;">';
        var saveMsgDiv = buttonsDiv.add(new innovaphone.ui1.Node("div",null,texts.text("labelInsert"),"saveclose").setAttribute("id","savemsg"))
        // var saveMsgDiv = document.createElement('div');
        // saveMsgDiv.id = 'savemsg';
        // saveMsgDiv.className = 'saveclose';
        // saveMsgDiv.textContent = 'Inserir';
        // Event listener de clique para o bot�o "Salvar"
        var closeMsgDiv = buttonsDiv.add(new innovaphone.ui1.Node("div",null,texts.text("labelClose"),"saveclose").setAttribute("id","closemsg"))
        // var closeMsgDiv = document.createElement('div');
        // closeMsgDiv.id = 'closemsg';
        // closeMsgDiv.className = 'saveclose';
        // closeMsgDiv.textContent = 'Fechar';
        // Adicionando o listener de clique
        var closemsg = document.getElementById("closemsg")
        closemsg.addEventListener('click', function () {
            console.log("O elemento closeMsgDiv foi clicado!");
            makeDivDepartments();
        });

        var savemsg = document.getElementById("savemsg")
        savemsg.addEventListener('click', function () {
            // Aqui voc� pode implementar a a��o que deseja realizar quando o bot�o � clicado
            var departmentName = document.getElementById("namedep").value;
            var departmentColor = document.getElementById("colorbox").value;
            // console.log("Salvar clicado!");
            // console.log("Nome do departamento:", departmentName);
            // console.log("Cor selecionada:", departmentColor);
            var editorDepartments = getSelectedUsersDepartments('editor');
            var viewerDepartments = getSelectedUsersDepartments('viewer');
            // console.log("Nome dos departamentos visiveis:", viewerDepartments);
            // console.log("Nome dos departamentos editaveis:", editorDepartments);
            app.send({ api: "user", mt: "InsertDepartment", name: departmentName, color: departmentColor, viewers: viewerDepartments, editors: editorDepartments });
        });

        var colorbox = document.getElementById("colorbox")
        colorbox.addEventListener("change", function () {
                document.getElementById("newdep").style.backgroundColor = colorbox.value;
            })
            var palette = document.getElementById("palette")
            palette.addEventListener("click", function () {
               colorbox.click();
            })


    }

    function createUsersDepartmentsGrid() {
        var usersListDiv = new innovaphone.ui1.Node("div",null,null,"userlist").setAttribute("id","userslist")
        // document.getElementById("userslist").innerHTML = ''
        // var usersListDiv = document.createElement('div');
        // usersListDiv.id = 'userslist';
        // usersListDiv.className = 'userlist';
        // usersListDiv.innerHTML = '';
        var table = usersListDiv.add(new innovaphone.ui1.Node("table",null,null,"table"))
        // var table = document.createElement('table');
        // table.classList.add('table');
        // Criar a primeira linha para os cabeçalhos das colunas
        var headerRow = table.add(new innovaphone.ui1.Node("tr",null,null,"row"))
        // var headerRow = document.createElement('tr');
        // headerRow.classList.add('row');
        var nameCol = headerRow.add(new innovaphone.ui1.Node("th",null,texts.text("labelUser"),"column"))
        // var nameCol = document.createElement('th');
        // nameCol.classList.add('column');
        // nameCol.textContent = 'Usuário';
        var editorCol = headerRow.add(new innovaphone.ui1.Node("th",null,texts.text("labelEditor"),"column"))
        // var editorCol = document.createElement('th');
        // editorCol.classList.add('column');
        // editorCol.textContent = 'Editor';
        var viewerCol = headerRow.add(new innovaphone.ui1.Node("th",null,texts.text("labelViewer"),"column"))
        // var viewerCol = document.createElement('th');
        // viewerCol.classList.add('column');
        // viewerCol.textContent = 'Visualizador';

        // headerRow.add(nameCol);
        // headerRow.add(editorCol);
        // headerRow.add(viewerCol);

        // table.add(headerRow);
        // Criar as demais linhas com os dados dos departamentos
        list_tableUsers.forEach(function (user) {
            var row = table.add(new innovaphone.ui1.Node("tr",null,null,"row"))
            // var row = document.createElement('tr');
            // row.classList.add('row');
            var nameCol = row.add(new innovaphone.ui1.Node("td",null,user.cn,"column"))
            // var nameCol = document.createElement('td');
            // nameCol.classList.add('column');
            // nameCol.textContent = user.cn;
            var editorCol = row.add(new innovaphone.ui1.Node("td",null,null,"column"))
            // var editorCol = document.createElement('td');
            // editorCol.classList.add('column');
            var viewerCol = row.add(new innovaphone.ui1.Node("td",null,null,"column"))
        

            var viewerCheckbox = viewerCol.add(new innovaphone.ui1.Input(null,null,null,null,"checkbox","checkbox viewercheckbox").setAttribute("id","viewercheckbox_" + user.guid));
            viewerCheckbox.setAttribute("name","viewerDepartments");
            viewerCheckbox.setAttribute("value",user.guid)
            
            var editorCheckbox = editorCol.add(new innovaphone.ui1.Input(null,null,null,null,"checkbox","checkbox editorcheckbox").setAttribute("id","editcheckbox_" + user.guid));
            editorCheckbox.setAttribute("name","editorDepartments");
            editorCheckbox.setAttribute("value",user.guid)
                
            editorCheckbox.addEvent('click', function () {
                var viewerCheckbox = document.getElementById("viewercheckbox_" + user.guid);
                viewerCheckbox.checked = true
 
            });
            
            //viewerCheckbox.setAttribute("id","viewercheckbox_");

            //document.getElementById("viewercheckbox").classList.add("viewercheckbox")

                    // Aqui você pode executar outras ações específicas caso dese
            //editorCheckbox.setAttribute("id","editorcheckbox_");

            //document.getElementById("editorcheckbox").classList.add("editorcheckbox")

            // var editorCheckbox = document.createElement('input');
            // editorCheckbox.type = 'checkbox';
            // editorCheckbox.name = 'editorDepartments';
            // editorCheckbox.value = user.guid;
            // editorCheckbox.className = 'checkbox'

            
            // var viewerCol = document.createElement('td');
            // viewerCol.classList.add('column');
            // var viewerCheckbox = document.createElement('input');
            // viewerCheckbox.type = 'checkbox';

            // viewerCheckbox.name = 'viewerDepartments';
            // viewerCheckbox.value = user.guid;
            // viewerCheckbox.className = 'checkbox'

           // viewerCol.add(viewerCheckbox);
            //editorCol.add(editorCheckbox);

            // row.add(nameCol);
            // row.add(editorCol);
            // row.add(viewerCol);

            // table.add(row);
            
                // document.getElementById("viewercheckbox").checked = document.getElementById("editorcheckbox").checked;
                
                
                
            });
            

        //usersListDiv.add(table);
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
        var elementPostsTable = document.getElementById(elementId);
        if (elementPostsTable) {
            var element = document.getElementById(elementId);
            if (element) {
                var childElement = element.querySelector('#headpost');

                // Verifique se o elemento filho foi encontrado
                if (childElement) {
                    // Altere a classe do elemento filho para 'newpost'
                    childElement.classList.add('newpost');
                    /*childElement.className = 'newpost';*/
                } else {
                    console.log("Elemento filho não encontrado.");
                }
                // Salva o conteúdo atual da div
                //var conteudoAntigo = element.innerHTML;

                //element.innerHTML = '';

                //var ulNew = document.createElement('ul');
                //ulNew.id = 'new';
                //ulNew.className = 'newpost';
                //element.appendChild(ulNew);
                //element.innerHTML += conteudoAntigo;
            }

        } else {
            console.log('Não estava na tabela de posts!!')
        }
        
    }
    function changeDepBackgroundColor(elementId) {
        var elementDepartmentsTable = document.getElementById("depcards");
        if (elementDepartmentsTable) {
            var element = document.getElementById(elementId);
            if (element) {
                var childElement = element.querySelector('#newDepPost');

                // Verifique se o elemento filho foi encontrado
                if (childElement) {
                    // Altere a classe do elemento filho para 'newpost'
                    childElement.classList.add('newDepPost');
                    /*childElement.className = 'newDepPost';*/
                } else {
                    console.log("Elemento filho não encontrado.");
                }

                // Salva o conteúdo atual da div
                //var conteudoAntigo = element.innerHTML;

                // Limpa o conteúdo da div encontrada
                //element.innerHTML = '';

                // Cria os novos elementos (ul e a)
                //var ulNew = document.createElement('ul');
                //ulNew.id = 'newDepPost';
                //ulNew.className = 'newDepPost';
                //var aElement = document.createElement('a');
                //// Adiciona o conteúdo antigo de volta à div no elemento A
                //aElement.textContent = conteudoAntigo;

                ////var ulFoot = document.createElement('ul');
                ////ulFoot.id = 'rightDep';
                ////ulFoot.className = 'rightDep';

                //// Adiciona os novos elementos à div
                //element.appendChild(ulNew);
                //element.appendChild(aElement);
                //element.appendChild(ulFoot);
            }
        } else {
            console.log('Não estava na tabela de departamentos!!')
        }

    }
    function editDepartmentForm(dep_id) {
        var department = list_departments.filter(function (item) {
            return item.id === parseInt(dep_id, 10);
        })[0];
        //document.getElementById('insideDiv').innerHTML = '';

        var insideDiv = billboard.add(new innovaphone.ui1.Node("div", null, null, 'insideDiv').setAttribute("id", "insideDiv"));
        //insideDiv.className = 'insideDiv';
        var postMsgDiv = insideDiv.add(new innovaphone.ui1.Node("div", null, null, 'newdep').setAttribute("id", "newdep"));
        document.getElementById('newdep').style.backgroundColor = department.color
        //var insideDiv = document.createElement('div');
        //insideDiv.className = 'insideDiv';

        //// Criar os elementos HTML
        //var postMsgDiv = document.createElement('div');
        //postMsgDiv.id = 'editdep';
        //postMsgDiv.className = 'editdep';
        //postMsgDiv.style.backgroundColor = department.color;
        var closeWindowDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, null, 'closewindow').setAttribute("id", "closewindow"));

        //var closeWindowDiv = document.createElement('div');
        //closeWindowDiv.id = 'closewindow';
        //var historyPostDiv = document.createElement('div');
        //historyPostDiv.id = 'historypost';
        //var editPostDiv = document.createElement('div');
        //editPostDiv.id = 'editpost';
        //var deletePostDiv = document.createElement('div');
        //deletePostDiv.id = 'deletepost';

        // Adicionando o listener de clique
        var c = document.getElementById('closewindow');
        c.addEventListener('click', function () {
            console.log("O elemento closeWindowDiv foi clicado!");
            makeDivPosts(dep_id);
        });
        var nameDepDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, department.name, 'nameDepDiv').setAttribute("id", "nameDepDiv"));
        //var nameDepDiv = document.createElement('div');
        //nameDepDiv.id = 'nameDepDiv';
        //nameDepDiv.style.display = 'flex';
        //nameDepDiv.style.backgroundColor = '#ffffff33';
        //nameDepDiv.style.color = 'white';
        //nameDepDiv.style.width = '80%';
        //nameDepDiv.style.height = '8%';
        //nameDepDiv.style.marginBottom = '15px';
        //nameDepDiv.style.marginTop = '15px';
        //nameDepDiv.style.fontSize = '25px';
        //nameDepDiv.style.justifyContent = 'center';
        //nameDepDiv.style.alignItems = 'center';
        //nameDepDiv.innerHTML = department.name;
        var userTable = editUsersDepartmentsGrid();
        document.getElementById("newdep").appendChild(userTable);

        var buttonsDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, null, 'buttons').setAttribute("id", "buttons"));
        //buttonsDiv.className = 'buttons';
        var paletteColor = document.getElementById('buttons').innerHTML = '<a>Selecione a cor:</a><ul id="palette" class="palette"></ul><input type="color" id="colorbox" style="display: none;">';
        //buttonsDiv.innerHTML = '<a>Selecione a cor:</a><ul id="palette" class="palette"></ul><input type="color" id="colorbox" style="display: none;">'; //onclick="openColorPicker()" onchange="updateColor(event)

        var saveMsgDiv = buttonsDiv.add(new innovaphone.ui1.Node('div', null, 'Atualizar', 'saveclose').setAttribute("id", "savemsg"));
        //saveMsgDiv.id = 'savemsg';
        //saveMsgDiv.className = 'saveclose';
        //saveMsgDiv.textContent = 'Inserir';

        var closeMsgDiv = buttonsDiv.add(new innovaphone.ui1.Node('div', null, 'Fechar', 'saveclose').setAttribute("id", "closemsg"));
        //closeMsgDiv.id = 'closemsg';
        //closeMsgDiv.className = 'saveclose';
        //closeMsgDiv.textContent = 'Fechar';

        //var buttonsDiv = document.createElement('div');
        //buttonsDiv.className = 'buttons';
        //buttonsDiv.style.display = 'flex';
        //buttonsDiv.style.alignItems = 'center';
        //buttonsDiv.style.justifyContent = 'flex-start';
        //buttonsDiv.style.width = '80%';
        //buttonsDiv.style.color = '#FFFF';
        //buttonsDiv.innerHTML = '<a>Selecione a cor:</a><ul id="palette" class="palette"></ul><input type="color" value="' + department.color +'" id="colorbox" style="display: none;">';

        //var closeMsgDiv = document.createElement('div');
        //closeMsgDiv.id = 'closemsg';
        //closeMsgDiv.className = 'saveclose';
        //closeMsgDiv.textContent = 'Fechar';


        // Adicionando o listener de clique
        var d = document.getElementById('closemsg')
        d.addEventListener('click', function () {

            console.log("O elemento closeMsgDiv foi clicado!");
            makeDivPosts(dep_id);
        });

        //var saveMsgDiv = document.createElement('div');
        //saveMsgDiv.id = 'savemsg';
        //saveMsgDiv.className = 'saveclose';
        //saveMsgDiv.textContent = 'Atualizar';


        // Event listener de clique para o bot�o "Salvar"
        var save = document.getElementById('savemsg');
        save.addEventListener('click', function () {
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
        var colorbox = document.getElementById("colorbox")
        colorbox.addEventListener("change", function () {
           document.getElementById("newdep").style.backgroundColor = colorbox.value;
        })
        var palette = document.getElementById("palette")
        palette.addEventListener("click", function () {
            colorbox.click();
        });
        // Adicionar os elementos criados � div com o ID 'billboard'
        //var billboardDiv = document.getElementById('billboard');
        //if (billboardDiv) {
        //    buttonsDiv.appendChild(saveMsgDiv);
        //    buttonsDiv.appendChild(closeMsgDiv);
        //    postMsgDiv.appendChild(closeWindowDiv);
        //    postMsgDiv.appendChild(nameDepDiv);
        //    var userTable = editUsersDepartmentsGrid();
        //    postMsgDiv.appendChild(userTable);
        //    postMsgDiv.appendChild(buttonsDiv);
        //    insideDiv.appendChild(postMsgDiv);
        //    billboardDiv.appendChild(insideDiv);

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
    function createHistoryViewsPostGrid(views_post_history) {
        
        document.getElementById('msgbox').innerHTML = '';
               
        var msgBoxDiv = document.getElementById('msgbox');
        
        var table = msgBoxDiv.add(new innovaphone.ui1.Node('table', null, null, 'table'));
        var headerRow = table.add(new innovaphone.ui1.Node('tr', null, null, 'row'));
        var nameCol = headerRow.add(new innovaphone.ui1.Node('th', null, 'Usuário', 'column'));
        var dateCol = headerRow.add(new innovaphone.ui1.Node('th', null, 'Data', 'column'));
        views_post_history.forEach(function (view) {

            row = table.add(new innovaphone.ui1.Node('tr', null, null, 'row'));
            var user = list_tableUsers.filter(function (item) {
                return item.guid == view.user_guid;
            })[0];
            var nameCol = row.add(new innovaphone.ui1.Node('td', null, user.cn, 'column'));
            var dateCol = row.add(new innovaphone.ui1.Node('td', null, formattedDate, 'column'));
            var dateString = view.date;
            var date = new Date(dateString);
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var formattedDate = (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year + ' - ' + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
        });
        //msgBoxDiv.appendChild(table);
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