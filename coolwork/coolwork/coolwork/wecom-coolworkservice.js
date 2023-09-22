
function pbxTableRequest(value) {
    //var value = {sip:"danilo.volz", hw:"00556a524",mode:"Login/Logout"}
    log("danilo-req pbxTableRequest:value " + String(obj.sip));
    var obj = JSON.parse(String(value));
    var user = pbxTableUsers.filter(function (user) { return user.columns.h323 === obj.sip });
    var found = false;

    if (user[0].columns.devices) {
        log("danilo-req pbxTableRequest:Objeto contem colunms.grps" + JSON.stringify(user[0].columns));
        user[0].columns.devices.forEach(function (dev) {
            if (dev.hw == obj.hw) {
                found = true;
                log("danilo-req pbxTableRequest: Device founded changing")
                if (obj.mode == "Login") {
                    user[0].columns.devices.push({ hw: obj.hw, text: "Telefone", app: "phone", tls: true, trusted: true })
                }
                if (obj.mode == "Logout") {
                    const devices = [];
                    user[0].columns.devices = devices;
                }
            }

        })
        if (!found) {
            log("danilo-req pbxTableRequest: Device not founded including it");
            if (obj.mode == "Login") {
                user[0].columns.devices.push({ hw: obj.hw, text: "Telefone", app: "phone", tls: true, trusted: true })
            }
            if (obj.mode == "Logout") {
                const devices = [];
                user[0].columns.devices = devices;
            }
        }
        //Teste do problema de antrar e sair de grupos
        if (pbxTable.length > 0) {
            user[0].mt = "ReplicateUpdate";
            log("danilo-req pbxTable: found PBX connection user " + JSON.stringify(user[0]));
            pbxTable[0].send(JSON.stringify(user[0]));
        } else {
            log("danilo-req pbxTable: PBX connection is 0 ");
        }
        // pbxTable.forEach(function (conn) {
        //     log("danilo-req pbxTable: forEach conn "+ JSON.stringify(conn));
        //     if (conn.pbx == user[0].src) {
        //         user[0].mt="ReplicateUpdate";
        //         log("danilo-req pbxTable: found PBX connection user "+ JSON.stringify(user[0]));
        //         conn.send(JSON.stringify(user[0]));
        //     }
        // })
        pbxTableUsers.forEach(function (u) {
            if (u.columns.h323 == user[0].columns.h323) {
                user[0].mt = "ReplicateNextResult";
                Object.assign(u, user[0])
                log("danilo-req pbxTable: pbxTableUsers list updated " + JSON.stringify(pbxTableUsers));
            }
        })

    }
    else {
        log("danilo-req pbxTableRequest:Objeto nno contem colunms.grps" + JSON.stringify(user[0].columns));
        if (obj.mode == "Login") {
            //user[0].columns.grps = [];
            //user[0].columns.grps.push({ name: obj.group, dyn: "in" })
            const devices = [
                //{
                //    "name": obj.group,
                //    "dyn": "in"
                //}
            ];
            user[0].columns.devices = devices;
            user[0].columns.devices.push({ hw: obj.hw, text: "Telefone", app: "phone", tls: true, trusted: true })
        }
        if (obj.mode == "Logout") {
            //user[0].columns.grps = [];
            //user[0].columns.grps.push({ name: obj.group, dyn: "out" })
            const devices = [
                //{
                //    "name": obj.group,
                //    "dyn": "out"
                //}
            ];
            user[0].columns.devices = devices;
            
        }
        pbxTable.forEach(function (conn) {
            if (conn.pbx == user[0].src) {
                user[0].mt = "ReplicateUpdate";
                log("danilo-req pbxTableRequest:Objeto a ser enviado no pbxTable " + JSON.stringify(user[0]));
                conn.send(JSON.stringify(user[0]));
            }
        })
        pbxTableUsers.forEach(function (u) {
            if (u.columns.h323 == user[0].columns.h323) {
                user[0].mt = "ReplicateNextResult";
                Object.assign(u, user[0])
                log("danilo-req pbxTableRequest:Objeto atualizado no pbxTableUsers " + JSON.stringify(u));
            }
        })

    }
}


new JsonApi("user").onconnected(function(conn) {
    if (conn.app == "wecom-coolwork") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "UserMessage") {
                conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", src: obj.src }));
            }
            if (obj.mt == "LoginPhone") {
                var value = { sip: conn.sip, hw: obj.hw, mode: "Login" }
                pbxTableRequest(value);
            }
            if (obj.mt == "LoginPhone") {
                var value = { sip: conn.sip, hw: obj.hw, mode: "Logout" }
                pbxTableRequest(value);
            }
        });
    }
});

new JsonApi("admin").onconnected(function(conn) {
    if (conn.app == "wecom-coolworkadmin") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AdminMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: obj.src }));
            }
        });
    }
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
