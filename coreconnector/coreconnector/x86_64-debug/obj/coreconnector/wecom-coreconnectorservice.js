var baseUrl = WebServer.url;
log("danilo req url: " + baseUrl);
var connectionsUser = [];
var connectionsAdmin = [];
var connectionsDash = [];
var RCC = [];
var PbxSignal = [];
var PbxSignalUsers = [];
var pbxTable = [];
var pbxTableUsers = [];
var pbxApi = {}

var calls = [];
var presences = [];
var queues = [];
var url = Config.url;

var regsDevices = [];
Config.onchanged(function () {
    url = Config.url;

});

//PBX APIS
new PbxApi("PbxTableUsers").onconnected(function (conn) {
    //pbxTable.push(conn);
    log("PbxTableUsers: connected " + JSON.stringify(conn));

    // for each PBX API connection an own call array is maintained
    var signalFound = pbxTable.filter(function (pbx) { return pbx.pbx === conn.pbx });
    if (pbxTable.length == 0) {
        pbxTable.push(conn);
        // register to the PBX in order to acceppt incoming presence calls
        conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateStart", "add": true, "del": true, "columns": { "guid": {}, "dn": {}, "cn": {}, "h323": {}, "e164": {}, "node": {}, "grps": {}, "devices": {} }, "src": conn.pbx }));

    }
    conn.onmessage(function (msg) {

        var obj = JSON.parse(msg);
        //log("PbxTableUsers: msg received " + msg);

        if (obj.mt == "ReplicateStartResult") {
            pbxTableUsers = [];
            conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateNext", "src": conn.pbx }));
        }
        if (obj.mt == "ReplicateNextResult" && obj.columns) {
            pbxTableUsers.push(obj)

            subscribePresence(obj)

            conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateNext", "src": conn.pbx }));
        }

        if (obj.mt == "ReplicateAdd") {
            pbxTableUsers.push(obj);
            subscribePresence(obj)
        }
        if (obj.mt == "ReplicateUpdate") {
            var found = false;
            pbxTableUsers.forEach(function (user) {
                if (user.columns.guid == obj.columns.guid) {
                    log("ReplicateUpdate: Updating the object for user " + obj.columns.cn)
                    Object.assign(user, obj)
                    found = true;
                    returnPbxTableUsersWithDevStatus(obj.columns.guid, function (result) {
                        var msg = { mode: "ReplicateUpdate", guid: obj.columns.guid, result: result };
                        log("danilo req : RCC message:ReplicateUpdate: " + JSON.stringify(msg));
                        httpClient("https://" + url + "/api/innovaphone/userEvents", "POST", msg)
                    })
                }
            })
            if (found == false) {
                log("ReplicateUpdate: Adding the object user " + obj.columns.cn + " because it not exists here before");
                pbxTableUsers.push(obj);
                subscribePresence(obj)
                returnPbxTableUsersWithDevStatus(obj.columns.guid, function (result) {
                    var msg = { mode: "ReplicateUpdate", guid: obj.columns.guid, result: result };
                    log("danilo req : RCC message:ReplicateUpdate: " + JSON.stringify(msg));
                    httpClient("https://" + url + "/api/innovaphone/userEvents", "POST", msg)
                })
            }

        }

        if (obj.mt == "ReplicateDel") {
            pbxTableUsers.splice(pbxTableUsers.indexOf(obj), 1);
            unsubscribePresence(obj)
        }
    });

    conn.onclose(function () {
        log("PbxTableUsers: disconnected");
        pbxTable.splice(pbxTable.indexOf(conn), 1);
    });
});


new PbxApi("PbxApi").onconnected(function (conn) {
    log("PbxApi conectada", conn)
    pbxApi = conn
    conn.onmessage(function (msg) {
        var obj = JSON.parse(msg);
        log("PbxApi msg: " + msg);
        if (obj.mt == "PresenceUpdate") {
            httpClient("https://" + url + "/api/innovaphone/presence", "POST", obj)

            var index = -1;

            for (var i = 0; i < presences.length; i++) {
                if (presences[i].src == obj.src) {
                    index = i;
                    break;
                }
            }

            if (index != -1) {
                // Atualize o objeto existente na posicao 'index'
                presences[index] = obj;
            } else {
                // Adicione o novo objeto ao array
                presences.push(obj);
            }
        }
    })

    conn.onclose(function () {
        pbxApi = {}
        log("PbxApi: disconnected");
    });
});

new PbxApi("RCC").onconnected(function (conn) {
    var rccFound = RCC.filter(function (rcc) { return rcc.pbx === conn.pbx });
    if (rccFound.length == 0) {
        RCC.push(conn);
        //request monitor users
        conn.send(JSON.stringify({ "api": "RCC", "mt": "Initialize", "limit": 50, "calls": true }));

        httpClient("https://" + url + "/api/innovaphone/restartUserMonitor", "GET")
    }
    log("RCC: connected conn " + JSON.stringify(conn));
    log("RCC: connected RCC " + JSON.stringify(RCC));




    //conn.send(JSON.stringify({ api: "RCC", mt: "Devices", cn: "Danilo Volz" }));
    conn.onmessage(function (msg) {
        var obj = JSON.parse(msg);
        //Log de Dev
        //log("danilo req : RCC message:: received" + JSON.stringify(obj));


        if (obj.mt === "DevicesResult") {
            log("danilo req : RCC message:DevicesResult: " + JSON.stringify(obj.devices));

        }
        else if (obj.mt === "UserInitializeResult") {
            log("danilo req UserInitializeResult: RCC message:: received" + JSON.stringify(obj));
            //Atualiza connections
            var src = obj.src;
            log("SPLIT3:");
            var myArray = src.split(",");
            var guid = myArray[0];
            var pbx = myArray[1];
            var device = myArray[2];

            RCC.forEach(function (rcc) {
                if (rcc.pbx == pbx) {
                    log("danilo req UserInitializeResult: RCC pbx == src pbx and will insert the user id");
                    rcc[obj.src] = obj.user;
                }
            })
            log("danilo req UserInitializeResult: RCC after add new user id " + JSON.stringify(RCC));
            //Start a call
            log("danilo req UserInitializeResult: device " + device);


        }
        else if (obj.mt === "UserCallResult") {
            var src = obj.src;
            var myArray = src.split(",");
            var guid = myArray[0];
            var pbx = myArray[1];
            var device = myArray[2];
            var num = myArray[3];
            var btn_id = myArray[4];
            if (obj.call != 0) {

                calls.push({ call: obj.call, guid: guid, src: guid + "," + pbx + "," + device, num: num, btn_id: btn_id })
                log("danilo req : RCC message:UserCallResult: after addCall " + JSON.stringify(calls));
            }
        }
        else if (obj.mt === "UserInfo" && obj.regs) {
            var msg = { mode: "UserInfo", guid: obj.guid, regs: obj.regs };
      
            var found = false;

            for (var i = 0; i < regsDevices.length; i++) {
                if (regsDevices[i].guid === obj.guid) {
                    // Se encontramos o guid, atualizamos o valor de regs
                    regsDevices[i].regs = obj.regs;
                    found = true;
                    break;
                }
            }
            if (!found) {
                regsDevices.push({ guid: obj.guid, regs: obj.regs });
            }

            log("danilo req : RCC message:UserInfo: array regsDevices " + JSON.stringify(regsDevices));
            log("danilo req : RCC message:UserInfo: will send http message UserInfo to CORE server " + JSON.stringify(msg));
            httpClient("https://" + url + "/api/innovaphone/userEvents", "POST", msg)

        }
        else if (obj.mt === "UserEndResult") {
            log("danilo req UserEndResult: RCC message:: received" + JSON.stringify(obj));
            log("RCC: connections before delete result " + JSON.stringify(RCC));
            var src = obj.src;
            var myArray = src.split(",");
            var guid = myArray[0];
            var pbx = myArray[1];
            var device = myArray[2];
            RCC.forEach(function (rcc) {
                if (rcc.pbx == pbx) {
                    delete rcc[obj.src];
                }
            })
            log("RCC: connections after delete result " + JSON.stringify(RCC));
        }
        else if (obj.mt === "CallAdd") {
            log("danilo req : RCC message:CallAdd: " + JSON.stringify(obj));
        }
        else if (obj.mt === "CallUpdate") {
            log("danilo req : RCC message:CallUpdate: " + JSON.stringify(obj));
        }
        else if (obj.mt === "CallDel") {
            log("danilo req : RCC message:CallDel: " + JSON.stringify(obj));
        }
        else if (obj.mt === "CallInfo") {
            log("danilo req : RCC message:CallInfo: " + JSON.stringify(obj));
            if (obj.del && obj.del == true) {

                var call = calls.filter(function (c) { return c.call == obj.call })[0]

                calls = calls.filter(function (c) {
                    return c.call !== obj.call;
                });
                if (call != null) {

                    log("danilo req : RCC message:CallDel: after deleteCall " + JSON.stringify(calls));
                    //Remove from RCC monitor
                    //RCC.forEach(function (rcc) {
                    //    if (rcc.pbx == conn.pbx) {
                    //        var user = rcc[call.src];
                    //        log("RCC: calling RCC API to End user Monitor " + String(call.guid) + " on PBX " + rcc.pbx + " the call has ended");
                    //        var msg = { api: "RCC", mt: "UserEnd", user: user, src: call.src };
                    //        rcc.send(JSON.stringify(msg));
                    //    }
                    //})
                    var src = obj.src;
                    var myArray = src.split(",");
                    var guid = myArray[0];
                    var pbx = myArray[1];
                    var device = myArray[2];
                    var num = call.num;
                    var btn_id = call.btn_id;

                    var msg = { mode: "CallDisconnected", guid: call.guid, device: device, num: num, call:call.call, btn_id: btn_id };
                    log("danilo req : RCC message:CallInfo: will send http message CallDisconnected to CORE server " + JSON.stringify(msg));
                    httpClient("https://" + url + "/api/innovaphone/callEvents", "POST", msg)
                }
            }
            if (obj.msg && obj.msg == 'r-alert') {

                var call = calls.filter(function (c) { return c.call == obj.call })[0]

                if (call != null) {
                    var src = call.src;
                    var myArray = src.split(",");
                    var guid = myArray[0];
                    var pbx = myArray[1];
                    var device = myArray[2];
                    var num = call.num;
                    var btn_id = call.btn_id;
                    var msg = { mode: "CallRinging", guid: call.guid, device: device, num: num, btn_id: btn_id, call: obj.call };
                    log("danilo req : RCC message:CallInfo: will send http message CallRinging to CORE server " + JSON.stringify(msg));
                    httpClient("https://" + url + "/api/innovaphone/callEvents", "POST", msg)
                }
            }
            if (obj.msg && obj.msg == 'x-alert') {

                var call = calls.filter(function (c) { return c.call == obj.call })[0]
                log("danilo req : RCC message:CallUpdate: 'x-alert call ="+JSON.stringify(call));
                if (call == null) {
                    var src = obj.src;
                    var myArray = src.split(",");
                    var guid = myArray[0];
                    var pbx = myArray[1];
                    var device = myArray[2];

                    
                    var num;
                    
                    //Define num
                    try {
                        if (obj.peer.e164 !== undefined && obj.peer.e164 !== "") {
                            num = obj.peer.e164;
                            log("danilo req : RCC message:CallUpdate: x-alert  num = obj.peer.e164;");
                        }
                        else if (obj.peer.h323 !== undefined && obj.peer.h323 !== "") {
                            num = obj.peer.h323;
                            log("danilo req : RCC message:CallUpdate: x-alert num = obj.peer.h323");
                        }
                        else {
                            // Se nenhum dos parametros estiver definido, ignore o evento
                            log("danilo req : RCC message:CallUpdate: x-alert  num = null");
                            return;
                        }
                    }
                    catch (e) {
                        log("danilo req : RCC message:CallUpdate: x-alert  NUM Catch " + e);
                        log("danilo req : RCC message:CallUpdate: x-alert Catch num = null");
                        return;
                    }
                    if (obj.call != 0) {
                        calls.push({ call: obj.call, guid: guid, src: obj.src, num: num, btn_id: '' })
                        log("danilo req : RCC message:CallUpdate: x-alert after addCall " + JSON.stringify(calls));

                        var msg = { mode: "IncomingCallRinging", guid: guid, device: device, num: num, call: obj.call };
                        log("danilo req : RCC message:CallInfo: x-alert will send http message IncomingCallRinging to CORE server " + JSON.stringify(msg));
                        httpClient("https://" + url + "/api/innovaphone/callEvents", "POST", msg)
                    }
                }
            }
            if (obj.conf && obj.msg && obj.msg == 'x-setup') {

                var call = calls.filter(function (c) { return c.call == obj.call })[0]

                if (call != null) {
                    var src = call.src;
                    var myArray = src.split(",");
                    var guid = myArray[0];
                    var pbx = myArray[1];
                    var device = myArray[2];
                    var num = call.num;
                    var btn_id = call.btn_id;
                    var msg = { mode: "CallRecordId", guid: call.guid, device: device, num: num, btn_id: btn_id, record_id: obj.conf, call: obj.call };
                    log("danilo req : RCC message:CallInfo: will send http message CallRecordId to CORE server " + JSON.stringify(msg));
                    httpClient("https://" + url + "/api/innovaphone/callEvents", "POST", msg)
                }
            }
            if (obj.msg && obj.msg == 'r-conn') {

                var call = calls.filter(function (c) { return c.call == obj.call })[0]

                if (call != null) {
                    var src = call.src;
                    var myArray = src.split(",");
                    var guid = myArray[0];
                    var pbx = myArray[1];
                    var device = myArray[2];
                    
                    var btn_id = call.btn_id;
                    var num;

                    //Define num
                    try {
                        if (obj.peer.e164 !== undefined && obj.peer.e164 !== "") {
                            num = obj.peer.e164;
                            log("danilo req : RCC message:CallUpdate: x-conn  num = obj.peer.e164;");
                        }
                        else if (obj.peer.h323 !== undefined && obj.peer.h323 !== "") {
                            num = obj.peer.h323;
                            log("danilo req : RCC message:CallUpdate: x-conn num = obj.peer.h323");
                        }
                        else {
                            // Se nenhum dos parametros estiver definido, ignore o evento
                            log("danilo req : RCC message:CallUpdate: x-conn  num = null");
                            return;
                        }
                    }
                    catch (e) {
                        log("danilo req : RCC message:CallUpdate: x-conn  NUM Catch " + e);
                        log("danilo req : RCC message:CallUpdate: x-conn Catch num = null");
                        num = call.num;
                        return;
                    }
                    for (var i = 0; i < calls.length; i++) {
                        if (calls[i].call == obj.call) {
                            calls[i].num = num; // Atualize o valor de num
                            break; // Saia do loop apos encontrar e atualizar o objeto
                        }
                    }
                    var msg = { mode: "CallConnected", guid: call.guid, device: device, num: num, btn_id: btn_id, call: obj.call };
                    log("danilo req : RCC message:CallInfo: r-conn will send http message CallConnected to CORE server " + JSON.stringify(msg));
                    httpClient("https://" + url + "/api/innovaphone/callEvents", "POST", msg)
                }
            }
            if (obj.msg && obj.msg == 'x-conn') {

                var call = calls.filter(function (c) { return c.call == obj.call })[0]
                log("danilo req : RCC message:CallUpdate: 'x-conn call =" + JSON.stringify(call));
                if (call != null) {
                    var src = call.src;
                    var myArray = src.split(",");
                    var guid = myArray[0];
                    var pbx = myArray[1];
                    var device = myArray[2];

                    var num;

                    //Define num
                    try {
                        if (obj.peer.e164 !== undefined && obj.peer.e164 !== "") {
                            num = obj.peer.e164;
                            log("danilo req : RCC message:CallUpdate: x-conn  num = obj.peer.e164;");
                        }
                        else if (obj.peer.h323 !== undefined && obj.peer.h323 !== "") {
                            num = obj.peer.h323;
                            log("danilo req : RCC message:CallUpdate: x-conn num = obj.peer.h323");
                        }
                        else {
                            // Se nenhum dos parametros estiver definido, ignore o evento
                            log("danilo req : RCC message:CallUpdate: x-conn  num = null");
                            return;
                        }
                    }
                    catch (e) {
                        log("danilo req : RCC message:CallUpdate: x-conn  NUM Catch " + e);
                        log("danilo req : RCC message:CallUpdate: x-conn Catch num = null");
                        num = call.num;
                        return;
                    }
                    for (var i = 0; i < calls.length; i++) {
                        if (calls[i].call == obj.call) {
                            calls[i].num = num; // Atualize o valor de num
                            break; // Saia do loop apos encontrar e atualizar o objeto
                        }
                    }
                    var msg = { mode: "IncomingCallConnected", guid: call.guid, device: device, num: num, call: obj.call };
                    log("danilo req : RCC message:CallInfo: x-conn will send http message IncomingCallConnected to CORE server " + JSON.stringify(msg));
                    httpClient("https://" + url + "/api/innovaphone/callEvents", "POST", msg)
                }
            }
            if (obj.msg && obj.msg == 'r-held') {

                var call = calls.filter(function (c) { return c.call == obj.call })[0]

                if (call != null) {
                    var src = call.src;
                    var myArray = src.split(",");
                    var guid = myArray[0];
                    var pbx = myArray[1];
                    var device = myArray[2];
                    var num = call.num;
                    var btn_id = call.btn_id;
                    var msg = { mode: "CallHeld", guid: call.guid, device: device, num: num, btn_id: btn_id, call: call.call };
                    log("danilo req : RCC message:CallInfo: will send http message CallHeld to CORE server " + JSON.stringify(msg));
                    httpClient("https://" + url + "/api/innovaphone/callEvents", "POST", msg)
                }
            }
            if (obj.msg && obj.msg == 'update' && obj.state == 261) {

                var call = calls.filter(function (c) { return c.call == obj.call })[0]

                if (call != null) {
                    var src = call.src;
                    var myArray = src.split(",");
                    var guid = myArray[0];
                    var pbx = myArray[1];
                    var device = myArray[2];
                    var num = call.num;
                    var btn_id = call.btn_id;
                    var msg = { mode: "UserCallHeld", guid: call.guid, device: device, num: num, btn_id: btn_id, call:call.call };
                    log("danilo req : RCC message:CallInfo: will send http message UserCallHeld to CORE server " + JSON.stringify(msg));
                    httpClient("https://" + url + "/api/innovaphone/callEvents", "POST", msg)
                }
            }
            if (obj.msg && obj.msg == 'update' && obj.state == 389) {

                var call = calls.filter(function (c) { return c.call == obj.call })[0]

                if (call != null) {
                    var src = call.src;
                    var myArray = src.split(",");
                    var guid = myArray[0];
                    var pbx = myArray[1];
                    var device = myArray[2];
                    var num = call.num;
                    var btn_id = call.btn_id;
                    var msg = { mode: "UserIncomingCallHeld", guid: call.guid, device: device, num: num, btn_id: btn_id, call: call.call };
                    log("danilo req : RCC message:CallInfo: will send http message UserIncomingCallHeld to CORE server " + JSON.stringify(msg));
                    httpClient("https://" + url + "/api/innovaphone/callEvents", "POST", msg)
                }
            }
            if (obj.msg && obj.msg == 'update' && obj.state == 133) {

                var call = calls.filter(function (c) { return c.call == obj.call })[0]

                if (call != null) {
                    var src = call.src;
                    var myArray = src.split(",");
                    var guid = myArray[0];
                    var pbx = myArray[1];
                    var device = myArray[2];
                    var btn_id = call.btn_id;
                    var num;

                    //Define num
                    try {
                        if (obj.peer.e164 !== undefined && obj.peer.e164 !== "") {
                            num = obj.peer.e164;
                            log("danilo req : RCC message:CallUpdate: update133 num = obj.peer.e164;");
                        }
                        else if (obj.peer.h323 !== undefined && obj.peer.h323 !== "") {
                            num = obj.peer.h323;
                            log("danilo req : RCC message:CallUpdate: update133 num = obj.peer.h323");
                        }
                        else {
                            // Se nenhum dos parametros estiver definido, ignore o evento
                            log("danilo req : RCC message:CallUpdate: update133  num = null");
                            return;
                        }
                    }
                    catch (e) {
                        log("danilo req : RCC message:CallUpdate: update133  NUM Catch " + e);
                        log("danilo req : RCC message:CallUpdate: update133 Catch num = null");
                        num = call.num;
                        return;
                    }
                    for (var i = 0; i < calls.length; i++) {
                        if (calls[i].call == obj.call) {
                            calls[i].num = num; // Atualize o valor de num
                            break; // Saia do loop apos encontrar e atualizar o objeto
                        }
                    }

                    var msg = { mode: "UserIncomingCallRetrieved", guid: call.guid, device: device, num: num, btn_id: btn_id, call: call.call };
                    log("danilo req : RCC message:CallInfo: will send http message UserIncomingCallRetrieved to CORE server " + JSON.stringify(msg));
                    httpClient("https://" + url + "/api/innovaphone/callEvents", "POST", msg)
                }
            }
            if (obj.msg && obj.msg == 'update' && obj.state == 5) {

                var call = calls.filter(function (c) { return c.call == obj.call })[0]

                if (call != null) {
                    var src = call.src;
                    var myArray = src.split(",");
                    var guid = myArray[0];
                    var pbx = myArray[1];
                    var device = myArray[2];
                    var btn_id = call.btn_id;
                    var num;

                    //Define num
                    try {
                        if (obj.peer.e164 !== undefined && obj.peer.e164 !== "") {
                            num = obj.peer.e164;
                            log("danilo req : RCC message:CallUpdate: update5 num = obj.peer.e164;");
                        }
                        else if (obj.peer.h323 !== undefined && obj.peer.h323 !== "") {
                            num = obj.peer.h323;
                            log("danilo req : RCC message:CallUpdate: update5 num = obj.peer.h323");
                        }
                        else {
                            // Se nenhum dos parametros estiver definido, ignore o evento
                            log("danilo req : RCC message:CallUpdate: update5  num = null");
                            return;
                        }
                    }
                    catch (e) {
                        log("danilo req : RCC message:CallUpdate: update5  NUM Catch " + e);
                        log("danilo req : RCC message:CallUpdate: update5 Catch num = null");
                        num = call.num;
                        return;
                    }
                    for (var i = 0; i < calls.length; i++) {
                        if (calls[i].call == obj.call) {
                            calls[i].num = num; // Atualize o valor de num
                            break; // Saia do loop apos encontrar e atualizar o objeto
                        }
                    }

                    var msg = { mode: "UserCallRetrieved", guid: call.guid, device: device, num: num, btn_id: btn_id, call: call.call };
                    log("danilo req : RCC message:CallInfo: will send http message UserCallRetrieved to CORE server " + JSON.stringify(msg));
                    httpClient("https://" + url + "/api/innovaphone/callEvents", "POST", msg)
                }
            }
            if (obj.msg && obj.msg == 'r-retrieved') {

                var call = calls.filter(function (c) { return c.call == obj.call })[0]

                if (call != null) {
                    var src = call.src;
                    var myArray = src.split(",");
                    var guid = myArray[0];
                    var pbx = myArray[1];
                    var device = myArray[2];
                    var num;

                    //Define num
                    try {
                        if (obj.peer.e164 !== undefined && obj.peer.e164 !== "") {
                            num = obj.peer.e164;
                            log("danilo req : RCC message:CallUpdate: update5 num = obj.peer.e164;");
                        }
                        else if (obj.peer.h323 !== undefined && obj.peer.h323 !== "") {
                            num = obj.peer.h323;
                            log("danilo req : RCC message:CallUpdate: update5 num = obj.peer.h323");
                        }
                        else {
                            // Se nenhum dos parametros estiver definido, ignore o evento
                            log("danilo req : RCC message:CallUpdate: update5  num = null");
                            return;
                        }
                    }
                    catch (e) {
                        log("danilo req : RCC message:CallUpdate: update5  NUM Catch " + e);
                        log("danilo req : RCC message:CallUpdate: update5 Catch num = null");
                        num = call.num;
                        return;
                    }
                    var btn_id = call.btn_id;
                    var msg = { mode: "CallRetrieved", guid: call.guid, device: device, num: num, btn_id: btn_id, call: call.call };
                    log("danilo req : RCC message:CallInfo: will send http message CallRetrieved to CORE server " + JSON.stringify(msg));
                    httpClient("https://" + url + "/api/innovaphone/callEvents", "POST", msg)
                }
            }
        }
    });
    conn.onclose(function () {
        log("RCC: disconnected");
        RCC.splice(RCC.indexOf(conn), 1);
    });
});




//CLIENT APIS
new JsonApi("user").onconnected(function (conn) {
    if (conn.app == "wecom-coreconnector") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "UserMessage") {
                conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", serverName: url, src: obj.src }));
            }
        });
    }
});

new JsonApi("admin").onconnected(function(conn) {
    if (conn.app == "wecom-coreconnectoradmin") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AdminMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", serverName: url, src: obj.src }));
            }
            if (obj.mt == "UpdateConfig") {
                log("danilo-req UpdateConfig:");
                if (obj.prt == "serverName") {
                    Config.url = obj.vl;
                    Config.save();
                    conn.send(JSON.stringify({ api: "admin", mt: "UpdateConfigOk", serverName: obj.vl, src: obj.src }));
                }
            }
        });
    }
});

WebServer.onrequest("pbxApiPresences", function (req) {
    if (req.method == "GET") {
        
        if (presences) {
            // value exists, send it back as text/plain
            req.responseContentType("application/json")
                .sendResponse()
                .onsend(function (req) {
                    req.send(new TextEncoder("utf-8").encode(JSON.stringify(presences)), true);
                });
        }
        else {
            // value does not exist, send 404 Not Found
            req.cancel();
        }
    }
});

WebServer.onrequest("pbxStatus", function (req) {
    if (req.method == "GET") {

        if (Object.keys(pbxApi).length != 0 && RCC.length >=1) {
            // value exists, send it back as text/plain
            req.responseContentType("application/text")
                .sendResponse()
                .onsend(function (req) {
                    req.send(new TextEncoder("utf-8").encode("OK"), true);
                });
        }
        else {
            // value does not exist, send 404 Not Found
            req.cancel();
        }
    }
});


WebServer.onrequest("rcc", function (req) {
    if (req.method == "POST") {
        var newValue = "";
        var value = "";
        req.onrecv(function (req, data) {
            //var obj = JSON.parse((new TextDecoder("utf-8").decode(data)));
            if (data) {
                newValue += (new TextDecoder("utf-8").decode(data));
                req.recv();
            }
            else {
                value = newValue;
                req.sendResponse();
                rccRequest2(value);
            }
        });
    }
    else {
        req.cancel();
    }
});

WebServer.onrequest("pbxTableUsers", function (req) {
    if (req.method == "GET") {
        //var list_users = [];
        //pbxTableUsers.forEach(function (u) {
        //    var devices = u.columns.devices;
        //    log("danilo-req pbxTableUsers: " + u.columns.cn + " devices: " + JSON.stringify(devices));
        //    var regs = findRegByGuid(u.columns.guid)
        //    log("danilo-req pbxTableUsers: " + u.columns.cn + " regs " + JSON.stringify(regs));
        //    if (devices) {
        //        // Percorrer a lista de devices
        //        for (var i = 0; i < devices.length; i++) {
        //            var device = devices[i];
        //            log("danilo-req pbxTableUsers: " + u.columns.cn + " device " + JSON.stringify(device));
        //            // Verificar se o hw existe na lista regs
        //            var found = false;
        //            if (regs != null) {
        //                for (var j = 0; j < regs.length; j++) {
        //                    log("danilo-req pbxTableUsers: verificar se device.hw == regs.hw");
        //                    if (regs[j].hw == device.hw) {
        //                        found = true;
        //                        log("danilo-req pbxTableUsers: device.hw == regs.hw");
        //                        break;
        //                    }
        //                }
        //            }

        //            // Adicionar o estado com base na existencia
        //            if (found) {
        //                devices[i].state = "online";
        //            } else {
        //                devices[i].state = "offline";
        //            }
        //        }
        //    }
            

        //    list_users.push({ cn: u.columns.cn, guid: u.columns.guid, sip: u.columns.h323, e164: u.columns.e164, devices: devices })
        //})

        returnPbxTableUsersWithDevStatus(null, function (list_users) {
            if (list_users) {
                // value exists, send it back as text/plain
                req.responseContentType("application/json")
                    .sendResponse()
                    .onsend(function (req) {
                        req.send(new TextEncoder("utf-8").encode(JSON.stringify(list_users)), true);
                    });
            }
            else {
                // value does not exist, send 404 Not Found
                req.cancel();
            }
        })
        //if (list_users) {
        //    // value exists, send it back as text/plain
        //    req.responseContentType("application/json")
        //        .sendResponse()
        //        .onsend(function (req) {
        //            req.send(new TextEncoder("utf-8").encode(JSON.stringify(list_users)), true);
        //        });
        //}
        //else {
        //    // value does not exist, send 404 Not Found
        //    req.cancel();
        //}
    }
});

function findRegByGuid(guid) {
    // Percorre a lista para encontrar o objeto que tem o 'guid' especificado
    for (var i = 0; i < regsDevices.length; i++) {
        if (regsDevices[i].guid === guid) {
            return regsDevices[i].regs; // Retorna o objeto correspondente
        }
    }
    return null; // Retorna null se nao encontrar
}

function returnPbxTableUsersWithDevStatus(guid, callback) {
    var list_users = [];
    pbxTableUsers.forEach(function (u) {
        if (guid) {
            if (u.columns.guid == guid) {
                var devices = u.columns.devices;
                log("danilo-req pbxTableUsers: " + u.columns.cn + " devices: " + JSON.stringify(devices));
                var regs = findRegByGuid(u.columns.guid)
                log("danilo-req pbxTableUsers: " + u.columns.cn + " regs " + JSON.stringify(regs));
                if (devices) {
                    // Percorrer a lista de devices
                    for (var i = 0; i < devices.length; i++) {
                        var device = devices[i];
                        log("danilo-req pbxTableUsers: " + u.columns.cn + " device " + JSON.stringify(device));
                        // Verificar se o hw existe na lista regs
                        var found = false;
                        if (regs != null) {
                            for (var j = 0; j < regs.length; j++) {
                                log("danilo-req pbxTableUsers: verificar se device.hw == regs.hw");
                                if (regs[j].hw == device.hw) {
                                    found = true;
                                    log("danilo-req pbxTableUsers: device.hw == regs.hw");
                                    break;
                                }
                            }
                        }

                        // Adicionar o estado com base na existencia
                        if (found) {
                            devices[i].state = "online";
                        } else {
                            devices[i].state = "offline";
                        }
                    }
                }

                list_users.push({ cn: u.columns.cn, guid: u.columns.guid, sip: u.columns.h323, e164: u.columns.e164, devices: devices })
            }
        }
        else {
            var devices = u.columns.devices;
            log("danilo-req pbxTableUsers: " + u.columns.cn + " devices: " + JSON.stringify(devices));
            var regs = findRegByGuid(u.columns.guid)
            log("danilo-req pbxTableUsers: " + u.columns.cn + " regs " + JSON.stringify(regs));
            if (devices) {
                // Percorrer a lista de devices
                for (var i = 0; i < devices.length; i++) {
                    var device = devices[i];
                    log("danilo-req pbxTableUsers: " + u.columns.cn + " device " + JSON.stringify(device));
                    // Verificar se o hw existe na lista regs
                    var found = false;
                    if (regs != null) {
                        for (var j = 0; j < regs.length; j++) {
                            log("danilo-req pbxTableUsers: verificar se device.hw == regs.hw");
                            if (regs[j].hw == device.hw) {
                                found = true;
                                log("danilo-req pbxTableUsers: device.hw == regs.hw");
                                break;
                            }
                        }
                    }

                    // Adicionar o estado com base na existencia
                    if (found) {
                        devices[i].state = "online";
                    } else {
                        devices[i].state = "offline";
                    }
                }
            }
            list_users.push({ cn: u.columns.cn, guid: u.columns.guid, sip: u.columns.h323, e164: u.columns.e164, devices: devices })
        }
    })
    if (callback) {
        callback(list_users);
    }

}

//Function called by WebServer.onrequest("rcc")
function rccRequest2(value) {
    log("danilo-req rccRequest:value " + String(value));
    var obj = JSON.parse(String(value));
    if (obj.mode == "PassiveRCCMonitor") {

        var userC = pbxTableUsers.filter(function (userC) { return userC.columns.guid === obj.guid })[0];
        if (userC != null) {
            log("danilo-req rccRequest:user " + String(userC.columns.dn));
            RCC.forEach(function (rcc) {
                //
                //Incluir aqui uma verificacao se ja nao existe um monitoramento para o usuario e device
                //
                if (rcc.pbx == userC.src) {
                    log("danilo req:rccRequest2:PassiveRCCMonitor: from " + userC.columns.cn);
                    if (userC.columns.devices.length > 0) {
                        var devices = userC.columns.devices;
                        log("danilo req:rccRequest2:PassiveRCCMonitor: devices " + JSON.stringify(devices));
                        devices.forEach(function (d) {
                            var src = userC.columns.guid + "," + rcc.pbx + "," + d.hw;
                            var user = rcc[src];
                            if (!user) {
                                var msg = { api: "RCC", mt: "UserInitialize", cn: userC.columns.cn, hw: d.hw, src: userC.columns.guid + "," + rcc.pbx + "," + d.hw };
                                log("danilo req:rccRequest2:PassiveRCCMonitor: UserInitialize sent rcc msg " + JSON.stringify(msg));
                                rcc.send(JSON.stringify(msg));
                            } else {
                                log("danilo req:rccRequest2:PassiveRCCMonitor: UserInitialize already initialized with id " + JSON.stringify(user));
                            }
                        })
                        
                    }
                }
            })
        } else {
            log("danilo-req rccRequest:PassiveRCCMonitor: user not found");
        }
    }
    if (obj.mode == "PassiveRCCMonitorEnd") {

        var userC = pbxTableUsers.filter(function (userC) { return userC.columns.guid === obj.guid })[0];
        if (userC != null) {
            log("danilo-req rccRequest:PassiveRCCMonitorEnd: user " + String(userC.columns.dn));
            RCC.forEach(function (rcc) {
                
                if (rcc.pbx == userC.src) {
                    if (userC.columns.devices.length > 0) {
                        var devices = userC.columns.devices;
                        log("danilo req:rccRequest2:PassiveRCCMonitorEnd: devices " + JSON.stringify(devices));
                        devices.forEach(function (d) {
                            log("danilo req:rccRequest2:PassiveRCCMonitorEnd: from " + userC.columns.cn);
                            var src = obj.guid + "," + rcc.pbx + "," + d.hw;
                            var user = rcc[src];
                            log("RCC: calling RCC API to End user Monitor " + String(obj.guid) + " on PBX " + rcc.pbx);
                            var msg = { api: "RCC", mt: "UserEnd", user: user, src: src };
                            rcc.send(JSON.stringify(msg));
                        })

                    }
                    
                }
            })
        } else {
            log("danilo-req rccRequest:PassiveRCCMonitorEnd: user not found");
        }
    }
    if (obj.mode == "MakeCall") {

        var userC = pbxTableUsers.filter(function (userC) { return userC.columns.guid === obj.guid })[0];
        if (userC != null) {
            log("danilo-req rccRequest:user " + String(userC.columns.dn));
            RCC.forEach(function (rcc) {
                //
                //Incluir aqui uma verificacao se ja nao existe um monitoramento para o usuario e device
                //
                if (rcc.pbx == userC.src) {
                    var src = userC.columns.guid + "," + rcc.pbx + "," + obj.device;
                    var userRcc = rcc[src];
                    log("danilo req:rccRequest2:MakeCall: from " + userC.columns.cn +" with userRCC id "+userRcc);
                    //var msg = { api: "RCC", mt: "UserInitialize", cn: userC.columns.cn, hw: obj.device, src: userC.columns.guid + "," + rcc.pbx + "," + obj.device + "," + obj.num + "," + obj.btn_id };
                    var msg = { api: "RCC", mt: "UserCall", user: userRcc, e164: obj.num, src: src + "," + obj.num + "," + obj.btn_id };
                    log("danilo req:rccRequest2:MakeCall: UserCall sent rcc msg " + JSON.stringify(msg));
                    rcc.send(JSON.stringify(msg));
                }
            })
        } else {
            log("danilo-req rccRequest:MakeCall: user not found");
        }
    }
    if (obj.mode == "HeldCall") {
        var userC = pbxTableUsers.filter(function (userC) { return userC.columns.guid === obj.guid })[0];

        if (userC != null) {
            log("danilo-req rccRequest2:HeldCall: userPbx " + String(userC.columns.dn));

            RCC.forEach(function (rcc) {
                var src = userC.columns.guid + "," + rcc.pbx + "," + obj.device
                var userRcc = rcc[String(src)];
                log("danilo req:rccRequest2:HeldCall userRcc " + userRcc);
                if (userRcc != null) {
                    var call = calls.filter(function (c) { return c.src == src && (c.call == obj.call || c.btn_id == obj.btn_id)})[0]
                    log("danilo req:rccRequest2:HeldCall: to " + userC.columns.cn);

                    if (call != null) {
                        var msg = { api: "RCC", mt: "UserHold", call: call.call, remote: true, user: userRcc, src: src };
                        log("danilo req:rccRequest2:HeldCall: sent rcc msg " + JSON.stringify(msg));
                        rcc.send(JSON.stringify(msg));
                    } else {
                        log('danilo req:rccRequest2:HeldCall: call not found');
                    }
                }
            })
        } else {
            log("danilo-req rccRequest:HeldCall: user not found");
        }
    }
    if (obj.mode == "HeldIncomingCall") {
        var userC = pbxTableUsers.filter(function (userC) { return userC.columns.guid === obj.guid })[0];

        if (userC != null) {
            log("danilo-req rccRequest2:HeldIncomingCall: userPbx " + String(userC.columns.dn));

            RCC.forEach(function (rcc) {
                var src = userC.columns.guid + "," + rcc.pbx + "," + obj.device
                var userRcc = rcc[String(src)];
                log("danilo req:rccRequest2:HeldIncomingCall userRcc " + userRcc);
                if (userRcc != null) {
                    var call = calls.filter(function (c) { return c.src == src && (c.call == obj.call || c.btn_id == obj.btn_id)})[0]
                    log("danilo req:rccRequest2:HeldIncomingCall: to " + userC.columns.cn);

                    if (call != null) {
                        var msg = { api: "RCC", mt: "UserHold", call: call.call, remote: true, user: userRcc, src: src };
                        log("danilo req:rccRequest2:HeldIncomingCall: sent rcc msg " + JSON.stringify(msg));
                        rcc.send(JSON.stringify(msg));
                    } else {
                        log('danilo req:rccRequest2:HeldIncomingCall: call not found');
                    }
                }
            })
        } else {
            log("danilo-req rccRequest:HeldIncomingCall: user not found");
        }
    }
    if (obj.mode == "ConnectCall") {
        var userC = pbxTableUsers.filter(function (userC) { return userC.columns.guid === obj.guid })[0];

        if (userC != null) {
            log("danilo-req rccRequest2:ConnectCall: userPbx " + String(userC.columns.dn));

            RCC.forEach(function (rcc) {
                var src = userC.columns.guid + "," + rcc.pbx + "," + obj.device
                var userRcc = rcc[String(src)];
                log("danilo req:rccRequest2:ConnectCall userRcc " + userRcc);
                if (userRcc != null) {
                    var call = calls.filter(function (c) { return c.src == src && (c.call == obj.call || c.btn_id == obj.btn_id) })[0]
                    log("danilo req:rccRequest2:ConnectCall: to " + userC.columns.cn);

                    if (call != null) {
                        var msg = { api: "RCC", mt: "UserConnect", call: call.call, user: userRcc, src: src };
                        log("danilo req:rccRequest2:ConnectCall: sent rcc msg " + JSON.stringify(msg));
                        rcc.send(JSON.stringify(msg));
                    } else {
                        log('danilo req:rccRequest2:ConnectCall: call not found');
                    }
                }
            })
        } else {
            log("danilo-req rccRequest:ConnectCall: user not found");
        }
    }
    if (obj.mode == "RetrieveCall") {
        var userC = pbxTableUsers.filter(function (userC) { return userC.columns.guid === obj.guid })[0];

        if (userC != null) {
            log("danilo-req rccRequest2:RetrieveCall: userPbx " + String(userC.columns.dn));

            RCC.forEach(function (rcc) {
                var src = userC.columns.guid + "," + rcc.pbx + "," + obj.device
                var userRcc = rcc[String(src)];
                log("danilo req:rccRequest2:RetrieveCall userRcc " + userRcc);
                if (userRcc != null) {
                    var call = calls.filter(function (c) { return c.src == src && (c.call == obj.call || c.btn_id == obj.btn_id)})[0]
                    log("danilo req:rccRequest2:RetrieveCall: to " + userC.columns.cn);

                    if (call != null) {
                        var msg = { api: "RCC", mt: "UserRetrieve", call: call.call, user: userRcc, src: src };
                        log("danilo req:rccRequest2:RetrieveCall: sent rcc msg " + JSON.stringify(msg));
                        rcc.send(JSON.stringify(msg));
                    } else {
                        log('danilo req:rccRequest2:RetrieveCall: call not found');
                    }
                }
            })
        } else {
            log("danilo-req rccRequest:RetrieveCall: user not found");
        }
    }
    if (obj.mode == "RetrieveIncomingCall") {
        var userC = pbxTableUsers.filter(function (userC) { return userC.columns.guid === obj.guid })[0];

        if (userC != null) {
            log("danilo-req rccRequest2:RetrieveIncomingCall: userPbx " + String(userC.columns.dn));

            RCC.forEach(function (rcc) {
                var src = userC.columns.guid + "," + rcc.pbx + "," + obj.device
                var userRcc = rcc[String(src)];
                log("danilo req:rccRequest2:RetrieveIncomingCall userRcc " + userRcc);
                if (userRcc != null) {
                    var call = calls.filter(function (c) { return c.src == src && (c.call == obj.call || c.btn_id == obj.btn_id)})[0]
                    log("danilo req:rccRequest2:RetrieveIncomingCall: to " + userC.columns.cn);

                    if (call != null) {
                        var msg = { api: "RCC", mt: "UserRetrieve", call: call.call, user: userRcc, src: src };
                        log("danilo req:rccRequest2:RetrieveIncomingCall: sent rcc msg " + JSON.stringify(msg));
                        rcc.send(JSON.stringify(msg));
                    } else {
                        log('danilo req:rccRequest2:RetrieveIncomingCall: call not found');
                    }
                }
            })
        } else {
            log("danilo-req rccRequest:RetrieveIncomingCall: user not found");
        }
    }
    if (obj.mode == "RedirectCall") {
        var userC = pbxTableUsers.filter(function (userC) { return userC.columns.guid === obj.guid })[0];

        if (userC != null) {
            log("danilo-req rccRequest2:RetrieveCall: userPbx " + String(userC.columns.dn));

            RCC.forEach(function (rcc) {
                var src = userC.columns.guid + "," + rcc.pbx + "," + obj.device
                var userRcc = rcc[String(src)];
                log("danilo req:rccRequest2:RedirectCall userRcc " + userRcc);
                if (userRcc != null) {
                    var call = calls.filter(function (c) { return c.src == src && (c.call == obj.call || c.btn_id == obj.btn_id)})[0]
                    log("danilo req:rccRequest2:RedirectCall: to " + userC.columns.cn);

                    if (call != null) {
                        var msg = { api: "RCC", mt: "UserRedirect", call: call.call, e164: obj.destination, user: userRcc, src: src };
                        log("danilo req:rccRequest2:RedirectCall: sent rcc msg " + JSON.stringify(msg));
                        rcc.send(JSON.stringify(msg));
                    } else {
                        log('danilo req:rccRequest2:RedirectCall: call not found');
                    }
                }
            })
        } else {
            log("danilo-req rccRequest:RedirectCall: user not found");
        }
    }
    if (obj.mode == "RedirectIncomingCall") {
        var userC = pbxTableUsers.filter(function (userC) { return userC.columns.guid === obj.guid })[0];

        if (userC != null) {
            log("danilo-req rccRequest2:RedirectIncomingCall: userPbx " + String(userC.columns.dn));

            RCC.forEach(function (rcc) {
                var src = userC.columns.guid + "," + rcc.pbx + "," + obj.device
                var userRcc = rcc[String(src)];
                log("danilo req:rccRequest2:RedirectIncomingCall userRcc " + userRcc);
                if (userRcc != null) {
                    var call = calls.filter(function (c) { return c.src == src && (c.call == obj.call || c.btn_id == obj.btn_id)})[0]
                    log("danilo req:rccRequest2:RedirectIncomingCall: to " + userC.columns.cn);

                    if (call != null) {
                        var msg = { api: "RCC", mt: "UserRedirect", call: call.call, e164: obj.destination, user: userRcc, src: src };
                        log("danilo req:rccRequest2:RedirectIncomingCall: sent rcc msg " + JSON.stringify(msg));
                        rcc.send(JSON.stringify(msg));
                    } else {
                        log('danilo req:rccRequest2:RedirectIncomingCall: call not found');
                    }
                }
            })
        } else {
            log("danilo-req rccRequest:RedirectIncomingCall: user not found");
        }
    }
    if (obj.mode == "SendDtmfDigits") {
        var userC = pbxTableUsers.filter(function (userC) { return userC.columns.guid === obj.guid })[0];

        if (userC != null) {
            log("danilo-req rccRequest2:SendDtmfDigits: userPbx " + String(userC.columns.dn));

            RCC.forEach(function (rcc) {
                var src = userC.columns.guid + "," + rcc.pbx + "," + obj.device
                var userRcc = rcc[String(src)];
                log("danilo req:rccRequest2:SendDtmfDigits userRcc " + userRcc);
                if (userRcc != null) {
                    var call = calls.filter(function (c) { return c.src == src && (c.call == obj.call || c.btn_id == obj.btn_id)})[0]
                    log("danilo req:rccRequest2:SendDtmfDigits: to " + userC.columns.cn);

                    if (call != null) {
                        var msg = { api: "RCC", mt: "UserDTMF", call: call.call, dtmf: obj.digit, recv: true, user: userRcc, src: src };
                        log("danilo req:rccRequest2:SendDtmfDigits: sent rcc msg " + JSON.stringify(msg));
                        rcc.send(JSON.stringify(msg));
                    } else {
                        log('danilo req:rccRequest2:SendDtmfDigits: call not found');
                    }
                }
            })
        } else {
            log("danilo-req rccRequest:SendDtmfDigits: user not found");
        }
    }
    if (obj.mode == "SendDtmfDigitsIncomingCall") {
        var userC = pbxTableUsers.filter(function (userC) { return userC.columns.guid === obj.guid })[0];

        if (userC != null) {
            log("danilo-req rccRequest2:SendDtmfDigitsIncomingCall: userPbx " + String(userC.columns.dn));

            RCC.forEach(function (rcc) {
                var src = userC.columns.guid + "," + rcc.pbx + "," + obj.device
                var userRcc = rcc[String(src)];
                log("danilo req:rccRequest2:SendDtmfDigitsIncomingCall userRcc " + userRcc);
                if (userRcc != null) {
                    var call = calls.filter(function (c) { return c.src == src && (c.call == obj.call || c.btn_id == obj.btn_id)})[0]
                    log("danilo req:rccRequest2:SendDtmfDigitsIncomingCall: to " + userC.columns.cn);

                    if (call != null) {
                        var msg = { api: "RCC", mt: "UserDTMF", call: call.call, dtmf: obj.digit, recv: true, user: userRcc, src: src };
                        log("danilo req:rccRequest2:SendDtmfDigitsIncomingCall: sent rcc msg " + JSON.stringify(msg));
                        rcc.send(JSON.stringify(msg));
                    } else {
                        log('danilo req:rccRequest2:SendDtmfDigitsIncomingCall: call not found');
                    }
                }
            })
        } else {
            log("danilo-req rccRequest:SendDtmfDigitsIncomingCall: user not found");
        }
    }
    if (obj.mode == "ClearCall") {
        var userC = pbxTableUsers.filter(function (userC) { return userC.columns.guid === obj.guid })[0];

        if (userC != null) {
            log("danilo-req rccRequest2:ClearCall: userPbx " + String(userC.columns.dn));

            RCC.forEach(function (rcc) {
                var src = userC.columns.guid + "," + rcc.pbx + "," + obj.device
                var userRcc = rcc[String(src)];
                log("danilo req:rccRequest2:ClearCall userRcc " + userRcc);
                if (userRcc != null) {
                    var call = calls.filter(function (c) { return c.src == src && (c.call == obj.call || c.btn_id == obj.btn_id)})[0]
                    log("danilo req:rccRequest2:ClearCall: to " + userC.columns.cn);

                    if (call != null) {
                        var msg = { api: "RCC", mt: "UserClear", call: call.call, cause: 16, user: userRcc, src: src};
                        log("danilo req:rccRequest2:ClearCall: sent rcc msg " + JSON.stringify(msg));
                        rcc.send(JSON.stringify(msg));
                    } else {
                        log('danilo req:rccRequest2:ClearCall: call not found');
                    }
                }
            })
        } else {
            log("danilo-req rccRequest:ClearCall: user not found");
        }
    } 
}


function subscribePresence(obj) {
    pbxApi.send(JSON.stringify({
        "api": "PbxApi",
        "mt": "SubscribePresence",
        "sip": obj.columns.h323,
        "src": obj.columns.guid
    }));
}

function unsubscribePresence(obj) {
    pbxApi.send(JSON.stringify({
        "api": "PbxApi",
        "mt": "UnsubscribePresence",
        "sip": obj.columns.h323,
        "src": obj.columns.guid
    }));
}

function httpClient(url, method, msg, callback) {
    log("danilo-req : httpClient msg " + JSON.stringify(msg));
    var responseData = "";
    log("danilo-req : httpClient url " + url);
    HttpClient.request(method, url)
        .header("X", "Wecom")
        .contentType("application/json")
        .onsend(function (req) {
            req.send(new TextEncoder("utf-8").encode(JSON.stringify(msg)), true);
        })
        .onrecv(function (req, data, last) {
            log("danilo-req : httpClient HttpRequest onrecv " + JSON.stringify(req));
            responseData += new TextDecoder("utf-8").decode(data);
            if (!last) req.recv();
        }, 1024)
        .oncomplete(function (req, success) {
            log(success ? url + " httpClient OK" : url + " httpClient ERROR");
            if (success) {
                log("danilo-req : httpClient HttpRequest complete " + JSON.stringify(req));
                log("danilo-req : httpClient HttpRequest responseData " + responseData);
                if (callback) {
                    callback(responseData);
                }
            }
        })
        .onerror(function (error) {
            log("danilo-req : httpClient HttpRequest error=" + error);
            if (callback) {
                callback();
            }
        });
}

var serviceconns = [];
var appsocket_connect = false;
var contacts = [];

new PbxApi("Services").onconnected(function (conn) {
    log("Connected to PBX API with connection: " + JSON.stringify(conn));
    serviceconns.push(conn);
    if (serviceconns.length == 1) {
        conn.send(JSON.stringify({ "mt": "SubscribeServices", "api": "Services" }));
    }

    log("Services connected: " + conn.pbx);

    conn.onmessage(function (msg) {
        log("Message received from " + conn.pbx + ": " + msg);
        var obj;
        try {
            obj = JSON.parse(msg);
        } catch (e) {
            log("Error parsing message: " + e);
            return;
        }

        if (obj.mt == "ServicesInfo") {
            log("ServicesInfo received: " + JSON.stringify(obj));
            for (var i = 0; i < obj.services.length; i++) {
                if (obj.services[i].info != null) {
                    if (obj.services[i].info.apis != null) {
                        if (obj.services[i].info.apis.hasOwnProperty("com.innovaphone.replicator")) {
                            log("Connecting to service: " + JSON.stringify(obj.services[i]));
                            connectToConnect(transformUrl(obj.services[i].url), obj.services[i].name);
                        }
                        log(JSON.stringify(obj.services[i].info.apis));
                    }
                }
            }
        }
        else if (obj.mt == "GetServiceLoginResult") {
            log("Service Login Result received: " + JSON.stringify(obj));
            if (obj.app == "innovaphone-contacts-searchapi") {
                if (obj.error) {
                    log("Login failed with error: " + obj.error);
                    appsocket_connect.close();
                } else {
                    try {
                        var key = conn.decrypt(obj.salt, obj.key);
                        var info = JSON.stringify(obj.info);
                        appsocket_connect.auth(obj.domain, obj.sip, obj.guid, obj.dn, obj.pbxObj, obj.app, info, obj.digest, key);
                    } catch (e) {
                        log("Error during authentication process: " + e);
                    }
                }
            }

        } else {
            log("Unhandled message type: " + obj.mt);
        }
    });

    conn.onclose(function () {
        log("Service connection closed " + conn.pbx);
        serviceconns.splice(serviceconns.indexOf(conn), 1);
    });
});

function connectToConnect(uri, app) {
    log("Attempting to connect to service at " + uri + " for app " + app);

    var appwebsocket = AppWebsocketClient.connect(uri, null, app);
    appsocket_connect = appwebsocket;

    appwebsocket.onauth(function (conn, app, challenge) {
        log("Auth challenge received for app " + app + ": " + challenge);
        serviceconns.forEach(function (serviceconn) {
            serviceconn.send(JSON.stringify({ api: "Services", mt: "GetServiceLogin", challenge: challenge, app: app }));
        });
    });

    appwebsocket.onopen(function (conn) {
        log("REPLICATOR WebSocket connection opened");

        conn.send(JSON.stringify({
            api: "Services", mt: "ReplicatorAPI", src: conn.pbx, apimsg: {
                mt: "ReplicationStart",
                hasExtAnchor: true
            }
        }))
    });

    appwebsocket.onmessage(function (conn, msg) {
        log("REPLICATOR message received " + msg);
        var obj = JSON.parse(msg);
        // Handle Messages from AppService
        var apimsg = obj.apimsg;
        log("REPLICATOR message received  obj " + JSON.stringify(obj));
        if (apimsg && apimsg.mt == "ReplicationStartResult") {
            //var apimsg = obj.apimsg;
            log("REPLICATOR message received  apimsg " + JSON.stringify(apimsg));
            //conn.send(JSON.stringify({
            //    mt: "ReplicatorAPI", src: "src-02", apimsg: {
            //        mt: "ReplicateNext",
            //        hasExtAnchor: true
            //    }
            //}))
            //log("REPLICATOR ReplicateNext sent");

            //conn.send(JSON.stringify({
            //    mt: "ReplicatorAPI", src: "src-02", apimsg: {
            //        mt: "ReplicationUpdate",
            //        attrs:
            //            [
            //                { a: "sn", v: "Replicator" },
            //                { a: "givenName", v: "Ronald" },
            //                { a: "company", v: "Smith Corp" },
            //                { a: "street", v: "Arlington Blvd 1" },
            //                { a: "city", v: "Munich" },
            //                { a: "postalCode", v: "89000" },
            //                { a: "telephoneNumber", v: "+49891234567" },
            //                { a: "mobile", v: "+491561234567" },
            //                { a: "homePhone", v: "+493361234567" },
            //                { a: "description", v: "Info fur Ron" },
            //                { a: "sip", v: "ron.rep@smithcorp.com" },
            //                { a: "extAnchor", v: "2" }
            //            ]
            //    }
            //}))

            //log("REPLICATOR ReplicationUpdate sent");

        }
    });

    appwebsocket.onclose(function () {
        log("REPLICATOR WebSocket connection closed");
        appsocket_connect = null;
    });
}
function transformUrl(url) {
    if (url.indexOf("https://") === 0) {
        return url.replace("https://", "wss://");
    }

    else if (url.indexOf("http://") === 0) {
        return url.replace("http://", "ws://");
    }

    return url;
}

