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
                    //log("ReplicateUpdate: Updating the object for user " + obj.columns.h323)
                    Object.assign(user, obj)
                    found = true;
                }
            })
            if (found == false) {
                //log("ReplicateUpdate: Adding the object user " + obj.columns.h323 + " because it not exists here before");
                pbxTableUsers.push(obj);
                subscribePresence(obj)
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
            var sip = myArray[0];
            var pbx = myArray[1];
            var device = myArray[2];
            var num = myArray[3];

            RCC.forEach(function (rcc) {
                if (rcc.pbx == pbx) {
                    log("danilo req UserInitializeResult: RCC pbx == src pbx and will insert the user id");
                    rcc[obj.src] = obj.user;
                }
            })
            log("danilo req UserInitializeResult: RCC after add new user id " + JSON.stringify(RCC));
            //Start a call
            var msg = { api: "RCC", mt: "UserCall", user: obj.user, e164: num, hw: device, src: src };
            //, src: obj.src    - pietro colocar isso logo acima ,apos o device
            log("danilo req callRCC: UserCall sent rcc msg " + JSON.stringify(msg));
            conn.send(JSON.stringify(msg));


        }
        else if (obj.mt === "UserCallResult") {
            var src = obj.src;
            var myArray = src.split(",");
            var guid = myArray[0];
            var btn_id = myArray[4];

            calls.push({ call: obj.call, guid: guid, src: obj.src, btn_id: btn_id })
            log("danilo req : RCC message:UserCallResult: after addCall " + JSON.stringify(calls));
        }
        else if (obj.mt === "UserEndResult") {
            log("danilo req UserEndResult: RCC message:: received" + JSON.stringify(obj));
            log("RCC: connections before delete result " + JSON.stringify(RCC));
            var src = obj.src;
            var myArray = src.split(",");
            var sip = myArray[0];
            var pbx = myArray[1];
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
                    RCC.forEach(function (rcc) {
                        if (rcc.pbx == conn.pbx) {
                            var user = rcc[call.src];
                            log("RCC: calling RCC API to End user Monitor " + String(call.guid) + " on PBX " + rcc.pbx + " the call has ended");
                            var msg = { api: "RCC", mt: "UserEnd", user: user, src: call.src };
                            rcc.send(JSON.stringify(msg));
                        }
                    })
                    var src = call.src;
                    var myArray = src.split(",");
                    var guid = myArray[0];
                    var pbx = myArray[1];
                    var device = myArray[2];
                    var num = myArray[3];
                    var btn_id = myArray[4];

                    var msg = { mode: "CallDisconnected", guid: call.guid, device: device, num: num, btn_id: btn_id };
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
                    var num = myArray[3];
                    var btn_id = myArray[4];
                    var msg = { mode: "CallRinging", guid: call.guid, device: device, num: num, btn_id: btn_id };
                    log("danilo req : RCC message:CallInfo: will send http message CallRinging to CORE server " + JSON.stringify(msg));
                    httpClient("https://" + url + "/api/innovaphone/callEvents", "POST", msg)
                }
            }
            if (obj.conf && obj.msg && obj.msg == 'x-setup') {

                var call = calls.filter(function (c) { return c.src == obj.src })[0]

                if (call != null) {
                    var src = call.src;
                    var myArray = src.split(",");
                    var guid = myArray[0];
                    var pbx = myArray[1];
                    var device = myArray[2];
                    var num = myArray[3];
                    var btn_id = myArray[4];
                    var msg = { mode: "CallRecordId", guid: call.guid, device: device, num: num, btn_id: btn_id, record_id: obj.conf };
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
                    var num = myArray[3];
                    var btn_id = myArray[4];
                    var msg = { mode: "CallConnected", guid: call.guid, device: device, num: num, btn_id: btn_id };
                    log("danilo req : RCC message:CallInfo: will send http message CallConnected to CORE server " + JSON.stringify(msg));
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
        var list_users = [];
        pbxTableUsers.forEach(function (u) {
            list_users.push({ cn: u.columns.cn, guid: u.columns.guid, sip: u.columns.h323, e164: u.columns.e164, devices: u.columns.devices })
        })
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
    }
});

//Function called by WebServer.onrequest("rcc")
function rccRequest2(value) {

    log("danilo-req rccRequest:value " + String(value));
    var obj = JSON.parse(String(value));

    if (obj.mode == "MakeCall") {

        var userC = pbxTableUsers.filter(function (userC) { return userC.columns.guid === obj.guid })[0];
        if (userC != null) {
            log("danilo-req rccRequest:user " + String(userC.columns.dn));
            RCC.forEach(function (rcc) {
                //
                //Incluir aqui uma verificacao se ja nao existe um monitoramento para o usuario e device
                //
                if (rcc.pbx == userC.src) {
                    log("danilo req:rccRequest2:MakeCall: from " + userC.columns.cn);
                    var msg = { api: "RCC", mt: "UserInitialize", cn: userC.columns.cn, hw: obj.device, src: userC.columns.guid + "," + rcc.pbx + "," + obj.device + "," + obj.num + "," + obj.btn_id };
                    log("danilo req:rccRequest2:MakeCall: UserInitialize sent rcc msg " + JSON.stringify(msg));
                    rcc.send(JSON.stringify(msg));
                }
            })
        } else {
            log("danilo-req rccRequest:MakeCall: user not found");
        }
    }
    if (obj.mode == "ClearCall") {
        var userC = pbxTableUsers.filter(function (userC) { return userC.columns.guid === obj.guid })[0];

        if (userC != null) {
            log("danilo-req rccRequest2:ClearCall: userPbx " + String(userC.columns.dn));

            RCC.forEach(function (rcc) {
                var src = userC.columns.guid + "," + rcc.pbx + "," + obj.device + "," + obj.num + "," + obj.btn_id
                var userRcc = rcc[String(src)];
                log("danilo req:rccRequest2:ClearCall userRcc " + userRcc);
                if (userRcc != null) {
                    var call = calls.filter(function (c) { return c.src == src })[0]
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

