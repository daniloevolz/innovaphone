
new JsonApi("user").onconnected(function(conn) {
    if (conn.app == "wecom-mural") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "Ping") {
                conn.send(JSON.stringify({ api: "user", mt: "Pong", src: obj.src }));
            }
            if (obj.mt == "InsertPost") {
                Database.exec("INSERT INTO tbl_posts (user_guid, color, title, description, department, date_creation, date_start, date_end) VALUES ('" + obj.guid + "','" + obj.color + "','" + obj.title + "','" + obj.description + "','" + obj.department + "','" + obj.date_creation + "','" + obj.dte_start + "','" + obj.date_end+ "')")
                    .oncomplete(function () {
                        log("InsertPost:result=success");
                        conn.send(JSON.stringify({ api: "user", mt: "InsertPostSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                    });
            }
            if (obj.mt == "SelectPosts") {
                Database.exec("SELECT * FROM tbl_posts where department ='"+obj.department+"';")
                    .oncomplete(function (data) {
                        log("SelectPosts:result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "user", mt: "SelectPostsResult", src: obj.src, result: JSON.stringify(data, null, 4) }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                    });
            }
        });
    }
});

new JsonApi("admin").onconnected(function(conn) {
    if (conn.app == "wecom-muraladmin") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AdminMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: obj.src }));
            }
            if (obj.mt == "TableUsers") {
                log("danilo-req AdminMessage: reducing the pbxTableUser object to send to user");
                var list_users = [];
                pbxTableUsers.forEach(function (u) {
                    list_users.push({ cn: u.columns.cn, guid: u.columns.guid })
                })
                conn.send(JSON.stringify({ api: "admin", mt: "TableUsersResult", result: JSON.stringify(list_users), src: obj.src }));
            }
            if (obj.mt == "InsertDepartment") {
                Database.exec("INSERT INTO tbl_departments (name) VALUES ('" + obj.name + "')")
                    .oncomplete(function () {
                        log("InsertDepartment:result=success");
                        conn.send(JSON.stringify({ api: "admin", mt: "InsertDepartmentSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText) }));
                    });
            }
            if (obj.mt == "SelectDepartments") {
                Database.exec("SELECT * FROM tbl_departments;")
                    .oncomplete(function (data) {
                        log("SelectDepartments:result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "admin", mt: "SelectDepartmentsResult", src: obj.src, result: JSON.stringify(data, null, 4) }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText) }));
                    });
            }
            if (obj.mt == "DeleteDepartments") {
                 Database.exec("DELETE FROM tbl_departments WHERE id=" + obj.id + ";")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "DeleteDepartmentsSuccess", result: JSON.stringify(data, null, 4) }));

                     })
                    .onerror(function (error, errorText, dbErrorCode) {
                         conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText) }));
                    });
            }
            if (obj.mt == "InsertUser") {
                Database.exec("INSERT INTO tbl_users (guid,editor,viewer) VALUES ('" + obj.guid + "','"+obj.editor+"','"+obj.viewer+"')")
                    .oncomplete(function () {
                        log("InsertUser:result=success");
                        conn.send(JSON.stringify({ api: "admin", mt: "InsertUserSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText) }));
                    });
            }
            if (obj.mt == "SelectUsers") {
                Database.exec("SELECT * FROM tbl_users;")
                    .oncomplete(function (data) {
                        log("SelectUsers:result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "admin", mt: "SelectUsersResult", src: obj.src, result: JSON.stringify(data, null, 4) }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText) }));
                    });
            }
            if (obj.mt == "DeleteUsers") {
                Database.exec("DELETE FROM tbl_users WHERE id=" + obj.id + ";")
                   .oncomplete(function () {
                       conn.send(JSON.stringify({ api: "admin", mt: "DeleteUsersSuccess", result: JSON.stringify(data, null, 4) }));

                    })
                   .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText) }));
                   });
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
        log("PbxSignal msg: "+msg);

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
            //Teste Danilo 20/07: armazenar o conteúdo call no parâmetro e o sip no valor
            PbxSignal.forEach(function (signal) {
                if (signal.pbx == pbx) {
                    var call = obj.call.toString();
                    signal[call] = obj.sig.cg.sip;
                }
            })
            //Teste Danilo 20/07: armazenar o conteúdo call no paâmetro e o sip no valor
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
