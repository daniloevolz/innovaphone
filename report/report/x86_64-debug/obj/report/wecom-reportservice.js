var pbxTableUsers = []

new PbxApi("PbxTableUsers").onconnected(function (conn) {
    log("PbxTableUsers: connected");

    // for each PBX API connection an own call array is maintained

    //connectionsPbxSignal.push({ ws: conn });
    // register to the PBX in order to acceppt incoming presence calls
    conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateStart", "add": true, "del": true, "columns": { "guid": {}, "dn": {}, "cn": {}, "h323": {}, "e164": {}, "grps": {}, "devices": {} } }));

    conn.onmessage(function (msg) {

        var obj = JSON.parse(msg);


        log("PbxTableUsers: msg received " + msg);

        if (obj.mt == "ReplicateStartResult") {
            pbxTableUsers = [];
            conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateNext" }));
        }
        if (obj.mt == "ReplicateNextResult" && obj.columns) {

            pbxTableUsers.push({ guid: obj.columns.guid, sip: obj.columns.h323, cn: obj.columns.cn, badge: 0 });
            conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateNext" }));

            log("PBX TABLE USERS " + JSON.stringify(pbxTableUsers))
        }

        if (obj.mt == "ReplicateAdd") {

            pbxTableUsers.push({ guid: obj.columns.guid, sip: obj.columns.h323, cn: obj.columns.cn });

        }
        if (obj.mt == "ReplicateUpdate") {

        }

        // handle incoming presence_subscribe call setup messages
        // the callid "obj.call" required later for sending badge notifications
    });

    conn.onclose(function () {
        log("PbxTableUsers: disconnected");
        //connectionsPbxSignal.splice(connectionsPbxSignal.indexOf(conn), 1);
    });
});



new JsonApi("user").onconnected(function(conn) {
    if (conn.app == "wecom-report") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "UserMessage") {
                conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", src: obj.src }));
            }
        });
    }
});

new JsonApi("admin").onconnected(function(conn) {
    if (conn.app == "wecom-reportadmin") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "TableUsers") {

                if(pbxTableUsers.length === 0){
                    log(" Lista Vazia " + pbxTableUsers)
                }else{
                    conn.send(JSON.stringify({api: "admin", mt: "TableUsersResult", src: obj.src, result: JSON.stringify(pbxTableUsers,null,4) }))
                }
                
            }
            if (obj.mt == "AddRamal") {
                log("obj.data_criacao: " + obj.data_criacao);
                Database.insert("INSERT INTO tbl_ramais (sip, nome, data_criacao) VALUES ('" + obj.sip + "','" + obj.nome + "','" + obj.data_criacao + "')")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "InsertRamalSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "UsersError", result: String(errorText) }));
                    });

            }
            if (obj.mt == "SelectRamais") {
                conn.send(JSON.stringify({ api: "admin", mt: "SelectUsersResult" }));
                Database.exec("SELECT * FROM tbl_ramais")
                    .oncomplete(function (data) {
                        log("result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "admin", mt: "SelectRamaisResultSuccess", result: JSON.stringify(data, null, 4) }));

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "UsersError", result: String(errorText) }));
                    });

            }
            if (obj.mt == "DeleteRamal") {
                conn.send(JSON.stringify({ api: "admin", mt: "DeleteUsersResult" }));
                Database.exec("DELETE FROM tbl_ramais WHERE id=" + obj.id + ";")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "DeleteRamalSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "UsersError", result: String(errorText) }));
                    });
            }
        });
    }
});


   

