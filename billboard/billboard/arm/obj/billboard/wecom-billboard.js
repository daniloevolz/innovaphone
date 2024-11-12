
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
    var receivedFragments = [];


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
    app.onerror = function (error) {
        console.error("Billboard: Appwebsocket.Connection error: " + error);
        changeState("Disconnected");
    };
    app.onclosed = function () {
        console.error("Billboard: Appwebsocket.Connection closed!");
        changeState("Disconnected");
    };
    var currentState = "Loading";
    waitConnection(that);

    function app_connected(domain, user, dn, appdomain) {
        changeState("Connected");
        that.clear();
        billboard = that.add(new innovaphone.ui1.Div(null, null, "billboard").setAttribute("id", "billboard"))
        app.send({ api: "user", mt: "TableUsers" });
        app.send({ api: "user", mt: "SelectDepartments" });

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
        if (obj.api == "user" && obj.mt == "NoLicense") {
            console.log(obj.result);
            makeDivNoLicense(obj.result);
        }
        if (obj.api == "user" && obj.mt == "TableUsersResult") {
            list_tableUsers = JSON.parse(obj.result);
            createDepartment = Boolean(obj.create_department);
        }
        if (obj.api == "user" && obj.mt == "InsertViewHistorySuccess") {
            //app.send({ api: "user", mt: "SelectPosts", department: obj.src });
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
        if (obj.api == "user" && obj.mt == "SelectAllPostsResult") {
            console.log(obj.result);

            receivedFragments.push(obj.result);
            if (obj.lastFragment) {
                // Todos os fragmentos foram recebidos
                list_posts = JSON.parse(receivedFragments.join(""));
                receivedFragments = [];
                // Faça o que quiser com os dados aqui
                //list_posts = JSON.parse(obj.result)
                var dep_id = JSON.parse(obj.dep_id)
                var hasPosts = list_posts.filter(function (item) {
                    return item.department
                })
                console.log("Has posts" + JSON.stringify(hasPosts))
                if (hasPosts.length > 0) {
                    makePopup(texts.text("labelAlert"), texts.text("labelDelAllPosts"), 500, 200);
                } else {
                    app.send({ api: "user", mt: "DeleteDepartment", id: dep_id });
                }
            }
            //list_posts = JSON.parse(obj.result)
            //var dep_id = JSON.parse(obj.dep_id)
            //var hasPosts = list_posts.filter(function (item) {
            //    return item.department
            //})
            //console.log("Has posts" + JSON.stringify(hasPosts))
            //if (hasPosts.length > 0) {
            //    makePopup(texts.text("labelAlert"), texts.text("labelDelAllPosts"), 500, 200);
            //} else {
            //    app.send({ api: "user", mt: "DeleteDepartment", id: dep_id });
            //}


            
        }
    }
    function makePopup(header, content, width, height) {
        console.log("makePopup");
        var styles = [new innovaphone.ui1.PopupStyles("popup-background", "popup-header", "popup-main", "popup-closer")];
        var h = [20];

        var _popup = new innovaphone.ui1.Popup("position: absolute;display: inline-flex; left:50px; top:50px; align-content: center; justify-content: center; flex-direction: row; flex-wrap: wrap;", styles[0], h[0]);
        _popup.header.addText(header);
        _popup.content.addHTML(content);

        // if (popupOpen == false) {s
        //     }    
        //     popup = _popup;
        //     popupOpen = true;
    }
    // exemplo de uso
    // makePopup("ATENÇÃO", "<p class='popup-alarm-p'>Alarme Recebido: " + obj.alarm + "</p><br/><p class='popup-alarm-p'>Origem: " + obj.Sip +"</p>", 500, 200);
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

    function makeDivNoLicense(msg) {
        that.clear();
        //Titulo 
        that.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:100%; top:40%; font-size:18px; text-align:center; font-weight: bold; color: darkblue;", msg));

    }
    function makeDivDepartments() {
        document.getElementById("billboard").innerHTML = '';
        var worktable = billboard.add(new innovaphone.ui1.Node("div", null, null, null).setAttribute("id", 'worktable'))
        var depcards = worktable.add(new innovaphone.ui1.Node("div", null, null, "depcards").setAttribute("id", "depcards"))
        var logoWecom = worktable.add(new innovaphone.ui1.Node("div", null, null, "logo").setAttribute("id", "logowecom"))
        depcards.innerHTML = '';
        list_departments.forEach(function (department) {
            var div = depcards.add(new innovaphone.ui1.Node("div", `display:flex;justify-content:center;align-items:center;border-radius:5px;margin:10px;background-color:${department.color};`, null, "card"));
            div.setAttribute("id", department.id)
            var card = document.querySelectorAll(".card")
            card.forEach(function (cards) {
                cards.addEventListener('click', function () {
                    // Coletar o ID do elemento div clicado
                    var clickedId = this.id;
                    console.log('ID do elemento div clicado:', clickedId);
                    app.send({ api: "user", mt: "SelectPosts", department: clickedId });
                })
            })
            var nameDepartment = department.name
            if(nameDepartment.length >= "20"){
                document.getElementById(department.id).style.fontSize = "20px"
            }
            var ulNew = div.add(new innovaphone.ui1.Node("ul", null, null, null).setAttribute("id", "newDepPost"))
            if (department.color=="#000000") {
                var aElement = div.add(new innovaphone.ui1.Node("a", "color:white;", nameDepartment, null))
            } else {
                var aElement = div.add(new innovaphone.ui1.Node("a", null, nameDepartment, null))
            }
            
        });

        if (createDepartment == true) {
            var divAdd = depcards.add(new innovaphone.ui1.Node("div", "display:flex;justify-content:center;align-items:center;border-radius:5px;background-color: rgb(68, 87, 91);margin:10px;", texts.text("labelAdd"), "cardnew"))
            var cardnew = document.querySelectorAll(".cardnew")
            cardnew.forEach(function (add) {
                add.addEventListener('click', function () {
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
        document.getElementById("billboard").innerHTML = '';
        var worktable = billboard.add(new innovaphone.ui1.Node("div", null, null, null).setAttribute("id", "worktable"))
        var postDepartDiv = worktable.add(new innovaphone.ui1.Node("div", null, null, "post-depart").setAttribute("id", "post-depart"));
        var logoWecom = worktable.add(new innovaphone.ui1.Node("div", null, null, "logo").setAttribute("id", "logowecom"))
        list_posts.forEach(function (post) {
            var postDiv = postDepartDiv.add(new innovaphone.ui1.Node("div", `background-color:${post.color}`, null, "post").setAttribute("id", post.id))
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

            var headpost = postDiv.add(new innovaphone.ui1.Node("ul", null, null, "headpost").setAttribute("id", "headpost"))
            var textpost = postDiv.add(new innovaphone.ui1.Node("a", null, post.title, null).setAttribute("id", "textpost"))
            if (isEditor) {
                var starDate = new Date(post.date_start);
                var endDate = new Date(post.date_end);
                var now = new Date();
                console.log("Start Date" + starDate + "End Date" + endDate + "Now" + now)

                var hdposts = document.querySelectorAll(".headpost");

                hdposts.forEach(function (hdpost) {
                    if (post.deleted) {
                        hdpost.className = 'deletedpost';
                        hdpost.title = texts.text("labelPostDeleted");
                    } else if (starDate > now) {
                        hdpost.className = 'futurepost';
                        hdpost.title = texts.text("labelPostFuture");
                    } else if (endDate < now) {
                        hdpost.className = 'expired';
                        hdpost.title = texts.text("labelPostExpired");
                    } else {
                        hdpost.className = '';
                        hdpost.title = 'Ativo';
                    }
                });
                var footpost = postDiv.add(new innovaphone.ui1.Node("ul", null, null, "footpost").setAttribute("id", "footpost"))
                var spanStart = footpost.add(new innovaphone.ui1.Node("span", "font-size:10px;", null, "dateS").setAttribute("id", "dateS"))
                var spanEnd = footpost.add(new innovaphone.ui1.Node("span", "font-size:10px;", null, "dateE").setAttribute("id", "dateE"))
                var postid = document.getElementById(post.id)
                var dateStartSpan = postid.querySelector(".dateS");
                var dateEndSpan = postid.querySelector(".dateE");
                dateStartSpan.textContent = texts.text("labelStart") + formatDate(starDate);
                dateEndSpan.textContent = texts.text("labelEnd") + formatDate(endDate);
                function formatDate(date) {
                    var day = date.getDate();
                    var month = date.getMonth() + 1; // Months are 0-indexed
                    var year = date.getFullYear();

                    // Add leading zeros if needed
                    if (day < 10) day = '0' + day;
                    if (month < 10) month = '0' + month;

                    return day + '/' + month + '/' + year;
                }
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

            var postNew1Div = postDepartDiv.add(new innovaphone.ui1.Node("div", null, texts.text("labelAdd"), "postnew").setAttribute("id", "postnew1"))
            var postnew = document.getElementById("postnew1");
            postnew.addEventListener('click', function () {
                console.log("O elemento divAdd foi clicado!");
                createPostForm(dep_id);
            });
        }
        var footButtons = worktable.add(new innovaphone.ui1.Node("div", null, null, "footbuttons").setAttribute("id", "footbuttons"))
        var backDiv = footButtons.add(new innovaphone.ui1.Node("div", null, null, "backDiv").setAttribute("id", "backDiv"))
        var back = document.getElementById("backDiv");

        back.addEventListener("click", function () {
            document.getElementById("post-depart").style.display = 'none';
            makeDivDepartments();
        })
        if (isEditor) {

            var editDepDiv = footButtons.add(new innovaphone.ui1.Node("div", null, null, "editDepDiv").setAttribute("id", "editDepDiv"));
            var edit = document.getElementById("editDepDiv")
            edit.addEventListener("click", function (isEditor) {
                console.log("CLICK BOTÃO EDITAR")
                editDepartmentForm(dep_id)
            })
            var delDepDiv = footButtons.add(new innovaphone.ui1.Node("div", null, null, "delDepDiv").setAttribute("id", "delDepDiv"));
            var del = document.getElementById("delDepDiv")
            del.addEventListener("click", function (isEditor) {
                console.log("CLICK BOTÃO DELETAR")
                app.send({ api: "user", mt: "SelectAllPosts", department: dep_id });
            })
            var timedDepDiv = footButtons.add(new innovaphone.ui1.Node("div", null, null, "timedDepDiv").setAttribute("id", "timeDepDiv"))
            var time = document.getElementById("timeDepDiv")
            time.addEventListener("click", function (isEditor) {
                console.log("CLICK BOTÃO SELETOR TEMPO ABRIR POSTS E ENTÂO ENVIAR APP.SEND")

                var worktable1 = document.getElementById('worktable');
                var depTimeManager = document.getElementById('depTimeManager');

                if (depTimeManager) {
                    worktable1.removeChild(depTimeManager)
                } else {
                    var depTimeManager = worktable.add(new innovaphone.ui1.Node("div", null, null, "depTimeManager").setAttribute("id", "depTimeManager"))

                    var topSelect = depTimeManager.add(new innovaphone.ui1.Node("div", null, null, "topselect").setAttribute("id", "topselect"))

                    var middleSelect = depTimeManager.add(new innovaphone.ui1.Node("div", null, null, "mdselect").setAttribute("id", "mdselect"))

                    var customPeriodDiv = middleSelect.add(new innovaphone.ui1.Node("div", "display:none;", null, "customPeriod").setAttribute("id", "customPeriod"))

                    var bottomSelect = depTimeManager.add(new innovaphone.ui1.Node("div", null, null, "btselect").setAttribute("id", "btselect"))

                    var startDateLabel = customPeriodDiv.add(new innovaphone.ui1.Node("label", null, texts.text("labelInicio"), "startDateLabel"))

                    var startDateInput = customPeriodDiv.add(new innovaphone.ui1.Input(null, null, null, null, "date", "dateinput").setAttribute("id", "data_start"));

                    var endDateLabel = customPeriodDiv.add(new innovaphone.ui1.Node("label", null, texts.text("labelExpired"), "endDateLabel"))

                    var endDateInput = customPeriodDiv.add(new innovaphone.ui1.Input(null, null, null, null, "date", "dateinput").setAttribute("id", "data_end"));

                    var checkboxButtonLabel = bottomSelect.add(new innovaphone.ui1.Node("label", "font-size:18px;", texts.text("labelExcluidos"), null))

                    var checkboxButton1 = bottomSelect.add(new innovaphone.ui1.Input("width:30px;height:25px;margin:0px 15px;", "deleted", null, null, "checkbox", null).setAttribute("id", "checkboxDeleted"))

                    var submitButton = bottomSelect.add(new innovaphone.ui1.Node("button", "width: 46px; height: 25px; margin: 10px;", texts.text("btnOk")).setAttribute("id", "submitButton"))

                    var select = topSelect.add(new innovaphone.ui1.Node("select", null, null, "periodSelector").setAttribute("id", "periodSelector"))

                    var options = [
                        texts.text("labelToday"), texts.text("labelLast7Days"), texts.text("labelLast30Days"), texts.text("labelNext7Days"), texts.text("labelNext30Days"), texts.text("labelSinceAlways"), texts.text("labelCustomPeriod")
                    ];

                    options.forEach(function (optionText) {
                        var option = select.add(new innovaphone.ui1.Node("option", null, optionText, null));
                        //var optionValue = optionText.toLowerCase().replace(/\s/g, '');
                        option.setAttribute("id", "optvalue");
                        option.setAttribute("value", optionText);
                        // select.add(option);
                    });

                    var selectPeriod = document.getElementById("periodSelector")
                    selectPeriod.addEventListener('change', function () {
                        if (selectPeriod.value === texts.text("labelCustomPeriod")) {
                            console.log("Periodo Customizado!")
                            document.getElementById("customPeriod").style.display = 'flex'
                            document.getElementById("depTimeManager").className = 'depTimeManagerPersonal'
                            document.getElementById("mdselect").style.display = 'flex';
                            selectPeriod.className = 'periodSelectorPersonal';
                            document.getElementById("topselect").className = 'topselectPersonal'
                            document.getElementById("btselect").className = 'btselectPersonal'
                        } else {
                            document.getElementById("customPeriod").style.display = 'none'
                            document.getElementById("depTimeManager").className = 'depTimeManager'
                            document.getElementById("mdselect").style.display = 'none';
                            selectPeriod.className = 'periodSelector';
                            document.getElementById("topselect").className = 'topselect'
                            document.getElementById("btselect").className = 'btselect';
                        }
                    });
                    var submit = document.getElementById("submitButton")
                    submit.addEventListener('click', function () {
                        var selectedValue = document.getElementById("periodSelector").value
                        console.log("SELECTED VALUE" + selectedValue)
                        var startDate, endDate;
                        var query = '';
                        var checkboxbtn = document.getElementById("checkboxDeleted")
                        console.log(checkboxbtn + "CHECKBOX DELETED")
                        if (!checkboxbtn.checked) {
                            // query += " AND deleted IS NULL";
                            query += " AND deleted IS NULL";
                        }

                        switch (selectedValue) {
                            case texts.text("labelToday:"):
                                startDate = endDate = getDateNow();
                                //startDate = endDate = new Date().toISOString();
                                //startDate = endDate = startDate.setUTCHours(startDate.getUTCHours() - 3);
                                //startDate = endDate = startDate.slice(0, -8);
                                query += " AND date_start <= '" + startDate + "' AND date_end >= '" + endDate + "'";
                                break;
                            case texts.text("labelLast7Days"):
                                //now = new Date().toISOString();
                                //now = now.setUTCHours(now.getUTCHours() - 3);
                                //now = now.slice(0, -8);
                                now = getDateNow();
                                startDate = new Date();
                                startDate.setDate(startDate.getDate() - 6);
                                //startDate = getDateNow(startDate);
                                startDate = startDate.setUTCHours(startDate.getUTCHours() - 3);
                                startDate = new Date(startDate).toISOString();
                                startDate = startDate.slice(0, -8);
                                query += " AND date_start >= '" + startDate + "' AND date_start <= '" + now + "'";
                                break;
                            case texts.text("labelLast30Days"):
                                //now = new Date().toISOString();
                                //now = now.setUTCHours(now.getUTCHours() - 3);
                                //now = now.slice(0, -8);
                                now = getDateNow();
                                startDate = new Date();
                                startDate.setDate(startDate.getDate() - 29);
                                //startDate = getDateNow(startDate);
                                startDate = startDate.setUTCHours(startDate.getUTCHours() - 3);
                                startDate = new Date(startDate).toISOString();
                                startDate = startDate.slice(0, -8);
                                query += " AND date_start >= '" + startDate + "' AND date_start <= '" + now + "'";
                                break;
                            case texts.text("labelNext7Days"):
                                //now = new Date().toISOString();
                                //now = now.setUTCHours(now.getUTCHours() - 3);
                                //now = now.slice(0, -8);
                                now = getDateNow();
                                startDate = new Date();
                                startDate.setDate(startDate.getDate() + 6);
                                //startDate = getDateNow(startDate);
                                startDate = startDate.setUTCHours(startDate.getUTCHours() - 3);
                                startDate = new Date(startDate).toISOString();
                                startDate = startDate.slice(0, -8);
                                query = " AND date_start >= '" + now + "' AND date_start <= '" + startDate + "'";
                                break;
                            case texts.text("labelNext30Days"):
                                //now = new Date().toISOString();
                                //now = now.setUTCHours(now.getUTCHours() - 3);
                                //now = now.slice(0, -8);
                                now = getDateNow();
                                startDate = new Date();
                                startDate.setDate(startDate.getDate() + 29);
                                startDate = startDate.setUTCHours(startDate.getUTCHours() - 3);
                                startDate = new Date(startDate).toISOString();
                                startDate = startDate.slice(0, -8);
                                query += " AND date_start >= '" + now + "' AND date_start <= '" + startDate + "'";
                                break;
                            case texts.text("labelSinceAlways"):
                                query += ";";
                                break;
                            case texts.text("labelCustomPeriod"):
                                var startDateIpt = document.getElementById("data_start")
                                var endDateIpt = document.getElementById("data_end")
                                startDate = startDateIpt.value;
                                endDate = endDateIpt.value;
                                var startDateObj = new Date(startDate);
                                startDateObj = startDateObj.setUTCHours(startDateObj.getUTCHours() - 3);
                                startDateObj = new Date(startDateObj).toISOString();
                                startDateObj = startDateObj.slice(0, -8);
                                var endDateObj = new Date(endDate);
                                endDateObj.setUTCHours(23, 59, 59)
                                endDateObj = endDateObj.setUTCHours(endDateObj.getUTCHours() - 3);
                                endDateObj = new Date(endDateObj).toISOString();
                                endDateObj = endDateObj.slice(0, -8);
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
        }
        for (var i = 0; i < views_history.length; i++) {
            var post = views_history[i].id;
            changeBackgroundColor(post);
        }

    }
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
        return dateString.slice(0, -8);
    }

    function makeDivPostMessage(id, dep_id, user) {

        var post = list_posts.filter(function (item) {
            return item.id === parseInt(id, 10);
        })[0];
        var isEditor = list_departments_editor.filter(function (item) {
            return item.id === parseInt(dep_id, 10);
        })[0];

        var department = list_departments.filter(function (item) {
            return item.id === parseInt(post.department, 10);
        })[0];

        var isNew = views_history.filter(function (item) {
            return item.id === parseInt(id, 10);
        })[0];
        if (isNew) {
            console.log("Post NEW Visualizado:", post.id);
            app.send({ api: "user", mt: "InsertViewHistory", post: post.id, src: parseInt(department.id, 10) });

        }
        var insideDiv = billboard.add(new innovaphone.ui1.Node('div', null, null, 'insideDiv').setAttribute('id', 'insideDiv'));
        var postMsgDiv = insideDiv.add(new innovaphone.ui1.Node('div', `background-color:${post.color}`, null, 'postmsg').setAttribute('id', 'postmsg'));
        var closeWindowDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, null, 'closewindow').setAttribute('id', 'closewindow'));
        var nameBoxDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, department.name, 'namebox').setAttribute('id', 'namebox'));
        var titleMsgDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, post.title, 'titlemsg').setAttribute('id', 'titlemsg'));
        var msgBoxDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', 'height: 75%;', null, 'msgbox').setAttribute('id', 'msgbox'));
        var scrollBox = msgBoxDiv.add(new innovaphone.ui1.Node('scrollbox', 'display: flex; color:white; width:100%; height:100%;', null, 'scrollbox').setAttribute('id', 'scrollbox'));
        var msgContent = scrollBox.add(new innovaphone.ui1.Node('div', 'overflow:auto;', post.description, 'msgcontent').setAttribute('id', 'msgcontent'));

        if (document.getElementById('titlemsg')) {
            console.log("CARREGOU O ELEMENTO")
            // Verificar o comprimento do texto usando .textContent
            if (document.getElementById('titlemsg').innerText.length > 20) {
                // Aplicar o estilo com fontSize 20px
                console.log("O ELEMENTO TEM MAIS DE 20 LETRAS")
                var titleMsg = document.getElementById('titlemsg');
                titleMsg.style.fontSize = '20px';
            }
        }
        
        if (isEditor) {
            app.send({ api: "user", mt: "SelectHistoryByPost", post: parseInt(id, 10), })

            var historyPostDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, null, 'historypost').setAttribute('id', 'historypost'));
            //historyPostDiv.id = 'historypost';
            var backDescription = postMsgDiv.add(new innovaphone.ui1.Node('div', 'display: none;', null, 'backDescription').setAttribute('id', 'backDescription'));
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


            var hist = document.getElementById('historypost');
            var back = document.getElementById('backDescription');
            hist.addEventListener('click', function () {
                console.log("O elemento historyPostDiv foi clicado!", id);
                //app.send({ api: "user", mt: "SelectHistoryByPost", post: parseInt(id, 10), })

                // FUNÇAÕ VEM AQUI 
                document.getElementById('msgbox').innerHTML = '';

                var table = msgBoxDiv.add(new innovaphone.ui1.Node('table', null, null, 'table'));
                var headerRow = table.add(new innovaphone.ui1.Node('tr', null, null, 'row'));
                var nameCol = headerRow.add(new innovaphone.ui1.Node('th', null, texts.text("labelUser"), 'column'));
                var dateCol = headerRow.add(new innovaphone.ui1.Node('th', null, texts.text("labelData"), 'column'));
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
                hist.removeEventListener("click", hist);
            });
            var back = document.getElementById('backDescription');
            back.addEventListener('click', function () {
                msgContent.innerHTML = post.description;
                document.getElementById("msgbox").innerHTML = ''
                msgBoxDiv.add(msgContent);

                hist.style.display = 'flex';
                back.style.display = 'none';
                back.removeEventListener('click', back)
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
        };

        var footShowPost = postMsgDiv.add(new innovaphone.ui1.Node('div', null, null, 'footShowPost').setAttribute('id', 'footShowPost'));
        footShowPost.id = 'footShowPost';
        footShowPost.className = 'footShowPost';
        
        var postType = (post.type == "private") ? texts.text("labelPrivate") : texts.text("labelPublic")
        //var publicPost = footShowPost.add(new innovaphone.ui1.Node('div', null, postType, 'creatorPost').setAttribute('id', post.type));
        var dateString = post.date_start;
        var date = new Date(dateString);
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var formattedDateStart = (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year + ' - ' + hours + ':' + (minutes < 10 ? '0' : '') + minutes;

        var dateString = post.date_end;
        var date = new Date(dateString);
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var formattedDateEnd = (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year + ' - ' + hours + ':' + (minutes < 10 ? '0' : '') + minutes;

        footInfo(footShowPost, texts.text("labelType"), postType)
        footInfo(footShowPost, texts.text("labelCreator"), user.cn)
        footInfo(footShowPost, texts.text("labelStart"), formattedDateStart)
        footInfo(footShowPost, texts.text("labelEnd"), formattedDateEnd)
        // var creatorPost = footShowPost.add(new innovaphone.ui1.Node('div', null, texts.text("labelCreator") + user.cn, 'creatorPost').setAttribute('id', 'creatorPost'));
        // var startDateDiv = footShowPost.add(new innovaphone.ui1.Node('div', null, formattedDateStart, 'creatorPost').setAttribute('id', 'startdate'));
        // var closeDateDiv = footShowPost.add(new innovaphone.ui1.Node('div', null, formattedDateEnd, 'creatorPost').setAttribute('id', 'closedate'));
  
        // document.getElementById("startdate").innerHTML = formattedDateStart
       
        // document.getElementById("closedate").innerHTML = formattedDateEnd
        // Adicionando o listener de clique
        var a = document.getElementById('closewindow');
        a.addEventListener('click', function () {
            console.log("O elemento closeWindowDiv foi clicado!");
            makeDivPosts(post.department);
        });
        

    }
    function footInfo(div, text1, text2){
        const divMain = div.add(new innovaphone.ui1.Node("div", null, null, 'creatorPost').setAttribute("id","divMain"));
        const labelName = divMain.add(new innovaphone.ui1.Node("div", null, text1, null));
        const labelInfo = divMain.add(new innovaphone.ui1.Node("div", null, text2, null));
        return;
    }
    function createPostForm(dep_id) {
        var department = list_departments.filter(function (item) {
            return item.id === parseInt(dep_id, 10);
        })[0];

        
        var insideDiv = billboard.add(new innovaphone.ui1.Node("div", null, null, 'insideDiv').setAttribute("id", "insideDiv"));
        var postMsgDiv = insideDiv.add(new innovaphone.ui1.Node("div", 'background-color:#0f243f;', null, 'postmsg').setAttribute("id", "postmsg"));
        var nameBoxDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, department.name, 'namebox').setAttribute("id", "namebox"));
        var closeWindowDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, null, 'closewindow').setAttribute("id", "closewindow"));
        var titleMsgDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, null, 'titlemsg').setAttribute("id", "titlemsg"));
        var titleinput = titleMsgDiv.add(new innovaphone.ui1.Input('color: #ffff; background-color: rgb(93 126 131 / 36%);', null, texts.text("labelTitle"), 40, "text", 'titleinput').setAttribute("id", "titleevent"));
        var msgBoxDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, null, 'msgbox').setAttribute("id", "msgbox"));
        var msgBoxText = msgBoxDiv.add(new innovaphone.ui1.Node('textarea', null, null, '1000', 'msgevent').setAttribute("id", "msgevent"));
        msgBoxText.setAttribute('placeHolder', '');
        var p = msgBoxDiv.add(new innovaphone.ui1.Node('p', null, '1000', 'char-counter').setAttribute("id", "charCount"));
        var textarea = document.getElementById("msgevent");
        var charCountSpan = document.getElementById("charCount");
        var maxChars = 1000;
        textarea.addEventListener("input", function () {
            var remainingChars = maxChars - textarea.value.length;
            charCountSpan.textContent = remainingChars;
        });
        var dateText = postMsgDiv.add(new innovaphone.ui1.Node('div', 'color: #ffff; background-color: rgb(93 126 131 / 36%);', null, 'datetext').setAttribute("id", "datetext"));
        var aTextStart = dateText.add(new innovaphone.ui1.Node('a', 'width: 100%; padding: 0px 0px 0 50px;',texts.text("labelDateStart"), 'date').setAttribute("id", "date"));
        var aTextEnd = dateText.add(new innovaphone.ui1.Node('a', 'width: 100%; padding: 0px 0px 0 50px;', texts.text("labelDateEnd"), 'date').setAttribute("id", "date"));
        var dateDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', 'color: #ffff; background-color: rgb(93 126 131 / 36%);', null, 'date').setAttribute("id", "date"));
        var dateStart = dateDiv.add(new innovaphone.ui1.Input(null, null, null, '1000', 'datetime-local', 'dateinput').setAttribute("id", "startevent"));
        var dateEnd = dateDiv.add(new innovaphone.ui1.Input(null, null, null, '1000', 'datetime-local', 'dateinput').setAttribute("id", "endevent"));
        var PublicPostDiv = postMsgDiv.add(new innovaphone.ui1.Node("div","width: 80%;display: flex;align-items: center;",null,null))
        var TypePost = PublicPostDiv.add(new innovaphone.ui1.Node("div","color:white;",texts.text("labelTypePost"),null))
        var publicPostSelect = PublicPostDiv.add(new innovaphone.ui1.Node("select",null,null,"selectPublicPost").setAttribute("id","selectTypePost"))
        publicPostSelect.add(new innovaphone.ui1.Node("option",null,texts.text("labelPublic"),null).setAttribute("id","public"))
        publicPostSelect.add(new innovaphone.ui1.Node("option",null,texts.text("labelPrivate"),null).setAttribute("id","private"))
        var buttonsDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, null, 'buttons').setAttribute("id", "buttons"));
        var paletteColor = document.getElementById('buttons').innerHTML = `<a>${texts.text("labelSelectColor")}</a><ul id="palette" class="palette"></ul><input type="color" id="colorbox" style="display: none;">`;
        var saveMsgDiv = buttonsDiv.add(new innovaphone.ui1.Node('div', null, texts.text("labelInsert"), 'saveclose').setAttribute("id", "savemsg"));
        var closeMsgDiv = buttonsDiv.add(new innovaphone.ui1.Node('div', null, texts.text("labelClose"), 'saveclose').setAttribute("id", "closemsg"));

        var s = document.getElementById('savemsg');
        s.addEventListener('click', function () {
            console.log("O elemento saveMsgDiv foi clicado!");
            var startPost = document.getElementById('startevent').value;
            var endPost = document.getElementById('endevent').value;
            var msgPost = document.getElementById('msgevent').value;
            var titlePost = document.getElementById('titleevent').value;
            var colorPost = document.getElementById('colorbox').value;
            var typePostSelect = document.getElementById("selectTypePost");
            var idSel = typePostSelect.options[typePostSelect.selectedIndex].id;

            var currentDate = getDateNow();
            console.log("Data Start:", startPost + "data atual" + currentDate);

            if (msgPost === "" || titlePost === "" || startPost == "" || endPost == "") {
                makePopup(texts.text("labelAlert"),texts.text("labelFullAllPosts"), 500, 200);
            } else if (endPost < startPost) {
                makePopup(texts.text("labelAlert"),texts.text("labelDataEndPostAlert"), 500, 200);
            } else if (endPost < currentDate) {
                makePopup(texts.text("labelAlert"),texts.text("labelDataStartPostAlert"), 500, 200);
            } else {
                app.send({ api: "user", mt: "InsertPost", title: titlePost, color: colorPost, description: msgPost, department: parseInt(dep_id, 10), date_start: startPost, date_end: endPost, type: idSel });
            }
            s.removeEventListener('click', s);
        });
        var q = document.getElementById('closewindow');
        q.addEventListener('click', function (post) {
            console.log("O elemento closeWindowDiv foi clicado!");
            makeDivPosts(dep_id);
            q.removeEventListener('click', q);
        });
        var w = document.getElementById('closemsg');
        w.addEventListener('click', function () {
            console.log("O elemento closemsg foi clicado!");
            makeDivPosts(dep_id);
            w.removeEventListener('click');
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
    function editPostForm(id, dep_id) {
        var department = list_departments.filter(function (item) {
            return item.id === parseInt(dep_id, 10);
        })[0];

        var post = list_posts.filter(function (item) {
            return item.id === parseInt(id, 10);
        })[0];

        document.getElementById('insideDiv').remove();

        var insideDiv = billboard.add(new innovaphone.ui1.Node("div", null, null, 'insideDiv').setAttribute("id", "insideDiv"));
        var postMsgDiv = insideDiv.add(new innovaphone.ui1.Node("div", null, null, 'postmsg').setAttribute("id", "postmsg"));
        document.getElementById('postmsg').style.backgroundColor = post.color;

        var nameBoxDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, department.name, 'namebox').setAttribute("id", "namebox"));
        var closeWindowDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, null, 'closewindow').setAttribute("id", "closewindow"));
        var titleMsgDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, null, 'titlemsg').setAttribute("id", "titlemsg"));
        var titleinput = titleMsgDiv.add(new innovaphone.ui1.Input('color: #ffff; background-color: rgb(93 126 131 / 36%);', post.title, texts.text("labelTitle") , 40, "text", 'titleinput').setAttribute("id", "titleevent"));
        var msgBoxDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, null, 'msgbox').setAttribute("id", "msgbox"));
        var msgBoxText = msgBoxDiv.add(new innovaphone.ui1.Node('textarea', null, post.description, 'msgevent').setAttribute("id", "msgevent"));
        msgBoxText.setAttribute('placeHolder', '');
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
        var aTextStart = dateText.add(new innovaphone.ui1.Node('a', 'width: 100%; padding: 0px 0px 0 50px;', texts.text("labelDateStart"), 'date').setAttribute("id", "date"));
        var aTextEnd = dateText.add(new innovaphone.ui1.Node('a', 'width: 100%; padding: 0px 0px 0 50px;', texts.text("labelDateEnd"), 'date').setAttribute("id", "date"));

        var dateDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', 'color: #ffff; background-color: rgb(93 126 131 / 36%);', null, 'date').setAttribute("id", "date"));
        var dateStart = dateDiv.add(new innovaphone.ui1.Input(null, post.date_start, null, null, 'datetime-local', 'dateinput').setAttribute("id", "startevent"));
        var dateEnd = dateDiv.add(new innovaphone.ui1.Input(null, post.date_end, null, null, 'datetime-local', 'dateinput').setAttribute("id", "endevent"));
        var PublicPostDiv = postMsgDiv.add(new innovaphone.ui1.Node("div","width: 80%;display: flex;align-items: center;",null,null))
        var TypePost = PublicPostDiv.add(new innovaphone.ui1.Node("div","color:white;",texts.text("labelTypePost"),null))
        var publicPostSelect = PublicPostDiv.add(new innovaphone.ui1.Node("select",null,null,"selectPublicPost").setAttribute("id","selectTypePost"))
        publicPostSelect.add(new innovaphone.ui1.Node("option",null,texts.text("labelPublic"),null).setAttribute("id","public"))
        publicPostSelect.add(new innovaphone.ui1.Node("option",null,texts.text("labelPrivate"),null).setAttribute("id","private"))
        var buttonsDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, null, 'buttons').setAttribute("id", "buttons"));
        var paletteColor = document.getElementById('buttons').innerHTML = `<a>${texts.text("labelSelectColor")}</a><ul id="palette" class="palette"></ul><input type="color" id="colorbox" style="display: none;">`;
        var saveMsgDiv = buttonsDiv.add(new innovaphone.ui1.Node('div', null, texts.text("labelInsert"), 'saveclose').setAttribute("id", "savemsg"));
        var closeMsgDiv = buttonsDiv.add(new innovaphone.ui1.Node('div', null, texts.text("labelClose"), 'saveclose').setAttribute("id", "closemsg"));
        
        var postType = post.type == "public" ? texts.text("labelPublic") : texts.text("labelPrivate");

        var selectElement = document.getElementById("selectTypePost");
        selectElement.value = postType;

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
            var colorPost = document.getElementById("postmsg").style.backgroundColor;
            var typePostSelect = document.getElementById("selectTypePost");
            var idSel = typePostSelect.options[typePostSelect.selectedIndex].id;

            var currentDate = getDateNow()
            console.log("Data Start:", startPost);
            if (msgPost === "" || msgPost === " " || titlePost === "" || startPost == "" || endPost == "") {
                makePopup(texts.text("labelAlert"),texts.text("labelCompletePostFormAlert"), 500, 200);
            } else if (endPost < startPost) {
                makePopup(texts.text("labelAlert"),texts.text("labelDataEndPostAlert"), 500, 200);
            }
            //else if (startPost < currentDate) {
            //    makePopup(texts.text("labelAlert"),texts.text("labelUpdateDateAlert"), 500, 200);
            //}
            else {
                app.send({ api: "user", mt: "UpdatePost", id: parseInt(id, 10), title: titlePost, color: colorPost, description: msgPost, department: parseInt(dep_id, 10), date_start: startPost, date_end: endPost, type: idSel });

            };
            s.removeEventListener('click', s);
        });
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
            w.removeEventListener('click', w);
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
    function createDepartmentForm() {
        var insideDiv = billboard.add(new innovaphone.ui1.Node("div", null, null, "insideDiv"))
        var postMsgDiv = insideDiv.add(new innovaphone.ui1.Node("div", null, null, "newdep").setAttribute("id", "newdep"))
        var closeWindowDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, null, null).setAttribute("id", "closewindow"))
        var close = document.getElementById("closewindow")
        close.addEventListener('click', function () {
            console.log("O elemento closeWindowDiv foi clicado!");
            makeDivDepartments();
        });
        var nameDepDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, null, "nameDepDiv").setAttribute("id", "nameDepDiv"))
        document.getElementById("nameDepDiv").innerHTML = `<input id="namedep" type="text" placeholder="${texts.text("labelNameDepart")} " style="color: #000000;">`
        var userTable = createUsersDepartmentsGrid();
        postMsgDiv.add(userTable)
        var buttonsDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, null, "buttonsDiv").setAttribute("id", "buttonsDiv"))
        document.getElementById("buttonsDiv").innerHTML = `<a>${texts.text("labelSelectColor")}</a><ul id="palette" class="palette"></ul><input type="color" id="colorbox" style="display: none;">`;
        var saveMsgDiv = buttonsDiv.add(new innovaphone.ui1.Node("div", null, texts.text("labelInsert"), "saveclose").setAttribute("id", "savemsg"))
        var closeMsgDiv = buttonsDiv.add(new innovaphone.ui1.Node("div", null, texts.text("labelClose"), "saveclose").setAttribute("id", "closemsg"))
        // Adicionando o listener de clique
        var closemsg = document.getElementById("closemsg")
        closemsg.addEventListener('click', function () {
            console.log("O elemento closeMsgDiv foi clicado!");
            makeDivDepartments();
        });

        var savemsg = document.getElementById("savemsg")
        savemsg.addEventListener('click', function () {
            var departmentName = document.getElementById("namedep").value;
            var departmentColor = document.getElementById("colorbox").value;
            var editorDepartments = getSelectedUsersDepartments('editor');
            var viewerDepartments = getSelectedUsersDepartments('viewer');

            if (editorDepartments === 0 || editorDepartments.length === 0) {
                makePopup(texts.text("labelAlert"),texts.text("labelUpdateEditorAlert"), 500, 200);
                
            }
            else {
                console.log("InsertDepartment sending");
                app.send({ api: "user", mt: "InsertDepartment", name: departmentName, color: departmentColor, viewers: viewerDepartments, editors: editorDepartments });
                console.log("InsertDepartment sent")
            }
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
        var usersListDiv = new innovaphone.ui1.Node("div", null, null, "userlist").setAttribute("id", "userslist")

        var table = usersListDiv.add(new innovaphone.ui1.Node("table", null, null, "table"))

        var headerRow = table.add(new innovaphone.ui1.Node("tr", null, null, "row"))

        var nameCol = headerRow.add(new innovaphone.ui1.Node("th", null, texts.text("labelUser"), "column"))

        var editorCol = headerRow.add(new innovaphone.ui1.Node("th", null, texts.text("labelEditor"), "column"))

        var viewerColTitle = headerRow.add(new innovaphone.ui1.Node("th", null, texts.text("labelViewer"), "column"))

        list_tableUsers.forEach(function (user) {

            var userV = list_viewers_departments.filter(function (item) {
                return item.viewer_guid === user.guid;
            })[0];
            var userE = list_editors_departments.filter(function (item) {
                return item.editor_guid === user.guid;
            })[0];

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
        var insideDiv = billboard.add(new innovaphone.ui1.Node("div", null, null, 'insideDiv').setAttribute("id", "insideDiv"));
        //insideDiv.className = 'insideDiv';
        var postMsgDiv = insideDiv.add(new innovaphone.ui1.Node("div", null, null, 'newdep').setAttribute("id", "newdep"));
        document.getElementById('newdep').style.backgroundColor = department.color
        var closeWindowDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, null, 'closewindow').setAttribute("id", "closewindow"));
        // Adicionando o listener de clique
        var c = document.getElementById('closewindow');
        c.addEventListener('click', function () {
            console.log("O elemento closeWindowDiv foi clicado!");
            makeDivPosts(dep_id);
        });
        var nameDepDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, department.name, "nameDepDiv").setAttribute("id", "nameDepDiv"))
        document.getElementById("nameDepDiv").innerHTML = `<input id="namedep" type="text" value="`+ department.name + `" style="color: #ffff;">`
        //var nameDepDiv = postMsgDiv.add(new innovaphone.ui1.Node("div", null, department.name, 'nameDepDiv').setAttribute("id", "nameDepDiv"));
        var userTable = editUsersDepartmentsGrid();
        postMsgDiv.add(userTable);

        var buttonsDiv = postMsgDiv.add(new innovaphone.ui1.Node('div', null, null, 'buttons').setAttribute("id", "buttons"));
        var paletteColor = document.getElementById('buttons').innerHTML = `<a>${texts.text("labelSelectColor")}</a><ul id="palette" class="palette"></ul><input type="color" id="colorbox" style="display: none;">`;
        var saveMsgDiv = buttonsDiv.add(new innovaphone.ui1.Node('div', null, texts.text("labelUpdate"), 'saveclose').setAttribute("id", "savemsg"));
        var closeMsgDiv = buttonsDiv.add(new innovaphone.ui1.Node('div', null, texts.text("labelClose"), 'saveclose').setAttribute("id", "closemsg"));
        // Adicionando o listener de clique
        var d = document.getElementById('closemsg')
        d.addEventListener('click', function () {

            console.log("O elemento closeMsgDiv foi clicado!");
            makeDivPosts(dep_id);
        });
        var save = document.getElementById('savemsg');
        save.addEventListener('click', function () {
            // Aqui voc� pode implementar a a��o que deseja realizar quando o bot�o � clicado
            var departmentName = document.getElementById("namedep").value;
            var departmentColor = document.getElementById('newdep').style.backgroundColor;//document.getElementById("colorbox").value;
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
    }
    function createHistoryViewsPostGrid(views_post_history) {

        document.getElementById('msgbox').innerHTML = '';

        var msgBoxDiv = document.getElementById('msgbox');

        var table = msgBoxDiv.add(new innovaphone.ui1.Node('table', null, null, 'table'));
        var headerRow = table.add(new innovaphone.ui1.Node('tr', null, null, 'row'));
        var nameCol = headerRow.add(new innovaphone.ui1.Node('th', null, texts.text("labelUser"), 'column'));
        var dateCol = headerRow.add(new innovaphone.ui1.Node('th', null, texts.text("labelData"), 'column'));
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