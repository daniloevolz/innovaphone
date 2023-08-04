
new JsonApi("user").onconnected(function(conn) {
    if (conn.app == "wecom-billboard") {
        conn.onmessage(function (msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "Ping") {
                conn.send(JSON.stringify({ api: "user", mt: "Pong", src: obj.src }));
            }
            if (obj.mt == "TableUsers") {
                log("danilo-req AdminMessage: reducing the pbxTableUser object to send to user");
                var list_users = [];
                pbxTableUsers.forEach(function (u) {
                    list_users.push({ cn: u.columns.cn, guid: u.columns.guid })
                })
                conn.send(JSON.stringify({ api: "user", mt: "TableUsersResult", result: JSON.stringify(list_users), src: obj.src }));
            }
            if (obj.mt == "InsertPost") {
                Database.exec("INSERT INTO tbl_posts (user_guid, color, title, description, department, date_creation, date_start, date_end) VALUES ('" + conn.guid + "','" + obj.color + "','" + obj.title + "','" + obj.description + "','" + obj.department + "','" + obj.date_creation + "','" + obj.dte_start + "','" + obj.date_end + "')")
                    .oncomplete(function () {
                        log("InsertPost:result=success");
                        conn.send(JSON.stringify({ api: "user", mt: "InsertPostSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                    });
            }
            if (obj.mt == "SelectPosts") {
                Database.exec("SELECT * FROM tbl_posts where department ='" + obj.department + "';")
                    .oncomplete(function (data) {
                        log("SelectPosts:result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "user", mt: "SelectPostsResult", src: obj.src, result: JSON.stringify(data, null, 4), department: obj.department }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                    });
            }
            if (obj.mt == "SelectDepartments") {
                log("SelectDepartments:");
                var query = "SELECT d.id, d.name, d.color FROM tbl_departments d JOIN tbl_department_viewers v ON d.id = v.department_id WHERE v.viewer_guid = '" + conn.guid + "';";
                var querylegado = "SELECT * FROM tbl_departments WHERE id = ANY(SELECT unnest(string_to_array(viewer, ','))::bigint FROM tbl_users WHERE guid ='" + conn.guid + "');";
                Database.exec(query)
                    .oncomplete(function (dataUsersViewer) {
                        log("SelectDepartments:result=" + JSON.stringify(dataUsersViewer, null, 4));
                        selectViewsHistory(conn, dataUsersViewer);
                        conn.send(JSON.stringify({ api: "user", mt: "SelectDepartmentsResult", src: obj.src, result: JSON.stringify(dataUsersViewer, null, 4) }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                    });
            }

            if (obj.mt == "InsertDepartment") {
                Database.exec("INSERT INTO tbl_departments (name, color) VALUES ('" + obj.name + "','" + obj.color + "')")
                    .oncomplete(function () {
                        log("InsertDepartment:result=success ");

                        Database.exec("SELECT id FROM tbl_departments where name ='" + obj.name + "';")
                            .oncomplete(function (data) {
                                log("SelectDepartments:result=" + data[0].id);
                                var viewers = obj.viewers;
                                viewers.forEach(function (v) {
                                    Database.exec("INSERT INTO tbl_department_viewers (department_id, viewer_guid) VALUES (" + parseInt(JSON.stringify(data[0].id), 10) + ",'" + v + "')")
                                        .oncomplete(function () {
                                            log("InsertDepartmentViewer:result=success");

                                        })
                                        .onerror(function (error, errorText, dbErrorCode) {
                                            log("InsertDepartmentViewer:result=Error " + String(errorText));
                                        });
                                })
                                var editors = obj.editors;
                                editors.forEach(function (e) {
                                    Database.exec("INSERT INTO tbl_department_editors (department_id, editor_guid) VALUES ('" + parseInt(JSON.stringify(data[0].id), 10) + "','" + e + "')")
                                        .oncomplete(function () {
                                            log("InsertDepartmentEditor:result=success");

                                        })
                                        .onerror(function (error, errorText, dbErrorCode) {
                                            log("InsertDepartmentEditor:result=Error " + String(errorText));
                                        });
                                })
                                conn.send(JSON.stringify({ api: "user", mt: "InsertDepartmentSuccess" }));

                            })
                            .onerror(function (error, errorText, dbErrorCode) {

                            });

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                    });
            }
            if (obj.mt == "DeleteDepartments") {
                Database.exec("DELETE FROM tbl_departments WHERE id=" + obj.id + ";")
                    .oncomplete(function () {
                        Database.exec("DELETE FROM tbl_departments_viewers WHERE department_id=" + obj.id + ";")
                            .oncomplete(function () {
                                Database.exec("DELETE FROM tbl_departments_editors WHERE department_id=" + obj.id + ";")
                                    .oncomplete(function () {
                                        conn.send(JSON.stringify({ api: "user", mt: "DeleteDepartmentsSuccess", result: JSON.stringify(data, null, 4) }));
                                    })
                                    .onerror(function (error, errorText, dbErrorCode) {
                                        log("InsertDepartmentEditor:result=success");
                                    });
                            })
                            .onerror(function (error, errorText, dbErrorCode) {
                                log("InsertDepartmentViewer:result=success");
                            });
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                    });
            }
        });
    }
});

new JsonApi("admin").onconnected(function(conn) {
    if (conn.app == "wecom-billboardadmin") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AdminMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: obj.src }));
            }
        });
    }
});
var PbxSignal = [];
new PbxApi("PbxSignal").onconnected(function (conn) {
    log("PbxSignal: connected conn " + JSON.stringify(conn));

    // for each PBX API connection an own call array is maintained
    var signalFound = PbxSignal.filter(function (signal) { return signal.pbx === conn.pbx });
    if (signalFound.length == 0) {
        PbxSignal.push(conn);
        log("PbxSignal: connected PbxSignal " + JSON.stringify(PbxSignal));

        // register to the PBX in order to acceppt incoming presence calls
        conn.send(JSON.stringify({ "api": "PbxSignal", "mt": "Register", "flags": "NO_MEDIA_CALL", "src": conn.pbx }));
    }
    //PbxSignal.push(conn);
    // register to the PBX in order to acceppt incoming presence calls
    //conn.send(JSON.stringify({ "api": "PbxSignal", "mt": "Register", "flags": "NO_MEDIA_CALL", "src": conn.pbx }));

    conn.onmessage(function (msg) {
        var obj = JSON.parse(msg);
        log("PbxSignal msg: " + msg);

        if (obj.mt === "RegisterResult") {
            log("PBXSignal: registration result " + JSON.stringify(obj));
        }

        // handle incoming presence_subscribe call setup messages
        // the callid "obj.call" required later for sending badge notifications
        if (obj.mt === "Signaling" && obj.sig.type === "setup" && obj.sig.fty.some(function (v) { return v.type === "presence_subscribe" })) {

            log("PbxSignal: incoming presence subscription for user " + obj.sig.cg.sip);

            // connect call
            conn.send(JSON.stringify({ "mt": "Signaling", "api": "PbxSignal", "call": obj.call, "src": obj.sig.cg.sip + "," + obj.src, "sig": { "type": "conn" } }));

            //Update signals
            var src = obj.src;
            var myArray = src.split(",");
            var pbx = myArray[0];
            log("PbxSignal: before add new userclient " + JSON.stringify(PbxSignal));
            //Teste Danilo 20/07: armazenar o conte�do call no par�metro e o sip no valor
            PbxSignal.forEach(function (signal) {
                if (signal.pbx == pbx) {
                    var call = obj.call.toString();
                    signal[call] = obj.sig.cg.sip;
                }
            })
            //Teste Danilo 20/07: armazenar o conte�do call no pa�metro e o sip no valor
            //PbxSignal.forEach(function (signal) {
            //    if (signal.pbx == pbx) {
            //        signal[obj.sig.cg.sip] = obj.call;
            //    }
            //})
            log("PbxSignal: after add new userclient " + JSON.stringify(PbxSignal));
            var name = "";
            var myArray = obj.sig.fty;
            myArray.forEach(function (fty) {
                if (fty.name) {
                    name = fty.name;
                }
            })



            // send notification with badge count first time the user has connected
            var count = 0;
            try {
                count = pbxTableUsers.filter(findBySip(obj.sig.cg.sip))[0].badge;
            } finally {
                updateBadge(conn, obj.call, count);
            }
        }

        // handle incoming call release messages
        if (obj.mt === "Signaling" && obj.sig.type === "rel") {
            //Remove signals
            log("PBXSignal: connections before delete result " + JSON.stringify(PbxSignal));
            var src = obj.src;
            var myArray = src.split(",");
            var sip = "";
            var pbx = myArray[0];
            PbxSignal.forEach(function (signal) {
                if (signal.pbx == pbx) {
                    sip = Object.keys(signal).filter(function (key) { return signal[key] === obj.call })[0];
                    delete signal[sip];

                }
            })
            log("PBXSignal: connections after delete result " + JSON.stringify(PbxSignal));
        }
    });

    conn.onclose(function () {
        //Remove cennection from array
        PbxSignal = PbxSignal.filter(function (c) { return c.pbx != conn.pbx });
        log("PbxSignal: disconnected");
        //PbxSignal.splice(PbxSignal.indexOf(conn), 1);
        //connectionsPbxSignal.splice(connectionsPbxSignal.indexOf(conn), 1);
    });
});


var pbxTable = [];
var pbxTableUsers = [];
new PbxApi("PbxTableUsers").onconnected(function (conn) {
    log("PbxTableUsers: connected " + JSON.stringify(conn));

    // for each PBX API connection an own call array is maintained
    var signalFound = pbxTable.filter(function (pbx) { return pbx.pbx === conn.pbx });
    if (signalFound.length == 0) {
        pbxTable.push(conn);
        // register to the PBX in order to acceppt incoming presence calls
        conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateStart", "add": true, "del": true, "columns": { "guid": {}, "dn": {}, "cn": {}, "h323": {}, "e164": {}, "node": {}, "grps": {}, "devices": {} }, "src": conn.pbx }));

    }
    conn.onmessage(function (msg) {
        var obj = JSON.parse(msg);
        log("PbxTableUsers msg: " + msg);
        //var today = getDateNow();

        //log("PbxTableUsers: msg received " + msg);

        if (obj.mt == "ReplicateStartResult") {
            pbxTableUsers = [];
            conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateNext", "src": conn.pbx }));
        }
        if (obj.mt == "ReplicateNextResult" && obj.columns) {
            try {
                obj.badge = 0;
                pbxTableUsers.push(obj);
                conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateNext", "src": conn.pbx }));
            } finally {
            }
        }
        if (obj.mt == "ReplicateAdd") {
            obj.badge = 0;
            pbxTableUsers.push(obj);
        }
        if (obj.mt == "ReplicateUpdate") {
            log("ReplicateUpdate= user " + obj.columns.h323);
            try {
                pbxTableUsers.forEach(function (user) {
                    if (user.columns.h323 == obj.columns.h323) {
                        obj.badge = user.badge;
                        log("ReplicateUpdate: Updating the object for user " + obj.columns.h323 + " and current Badge is " + user.badge);
                        Object.assign(user, obj);
                    }
                })

            } catch (e) {
                log("ReplicateUpdate: User " + obj.columns.h323 + " Erro " + e)

            }


        }
    });

    conn.onclose(function () {

        pbxTable.splice(pbxTable.indexOf(conn), 1);
        log("PbxTableUsers: disconnected");
    });
});

function selectViewsHistory(conn, departments) {
    // Dados de entrada (lista de objetos JSON)
    var inputData = [
        {
            "id": 1,
            "name": "Teste",
            "color": "#d522d8"
        },
        {
            "id": 4,
            "name": "Suporte",
            "color": "#ff0000"
        },
        {
            "id": 5,
            "name": "Pré Vendas",
            "color": "#045bb9"
        }
    ];

    // Construir uma lista com os ids dos objetos de entrada
    var idsToSearch = [];
    for (var i = 0; i < departments.length; i++) {
        idsToSearch.push(departments[i].id);
    }

    // Consulta na tabela 'tbl_posts' com LEFT JOIN e WHERE para filtrar os resultados
    var queryPosts = "SELECT p.* FROM tbl_posts p LEFT JOIN tbl_views_history v ON p.id = v.post_id AND v.user_guid = '" + conn.guid + "' WHERE v.post_id IS NULL";

    // Executar consulta na tabela 'tbl_posts'
    Database.exec(queryPosts)
        .oncomplete(function (dataPosts) {
            // Dados retornados da consulta na tabela 'tbl_posts'
            log("SelectPosts:result=" + JSON.stringify(dataPosts, null, 4));
            conn.send(JSON.stringify({ api: "user", mt: "SelectViewsHistoryResult", result: JSON.stringify(dataPosts, null, 4) }));
        })
        .onerror(function (error, errorText, dbErrorCode) {
            conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
        });

}
//Internal supporters functions

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