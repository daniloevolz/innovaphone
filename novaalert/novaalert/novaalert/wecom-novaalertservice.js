
var urlalert = Config.urlalert;
var urlPhoneApiEvents = Config.urlPhoneApiEvents;
var sendCallEvents = Config.sendCallEvents;

var connectionsRCC = [];
var connectionsApp = [];
var connectionsPbxSignal = [];
var connections = [];
var calls = [];
var actions = [];
var buttons = [];
var pbxTableUsers = [];

Config.onchanged(function () {
    urlalert = Config.urlalert;
    sendCallEvents = Config.sendCallEvents;
    urlPhoneApiEvents = Config.urlPhoneApiEvents;
})

WebServer.onrequest("triggedAlarm", function (req) {
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
                alarmReceived(value);
            }
        });
    }
    else {
        req.cancel();
    }
});


new JsonApi("user").onconnected(function (conn) {
    log("danilo req: user conn: " + JSON.stringify(conn))
    connectionsApp.push({ ws: conn });

    if (conn.app == "wecom-novaalert") {
        conn.onmessage(function (msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "UserMessage") {
                conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", urlalert: urlalert }));

            }
            if (obj.mt == "UserPresence") {
                connections.forEach(function (c) {
                    if (c.user != "") {
                        conn.send(JSON.stringify({ api: "user", mt: "UserConnected", src: c.sip }));
                    }

                })
            }
            if (obj.mt == "TriggerAlert") {
                callNovaAlert(parseInt(obj.prt), conn.sip);
                conn.send(JSON.stringify({ api: "user", mt: "AlarmSuccessTrigged", value: obj.prt }));
            }
            if (obj.mt == "TriggerCall") {
                callRCC(connectionsRCC[0].ws, conn.cn, "UserCall", obj.prt, conn.sip);
            }
            if (obj.mt == "EndCall") {
                log("danilo req:EndCall");
                calls.forEach(function (call) {
                    log("danilo req:EndCall call.sip == "+ call.sip);
                    if (call.sip == conn.sip) {
                        log("danilo req:EndCall call.sip == conn.sip");
                        callRCC(connectionsRCC[0].ws, conn.cn, "UserClear", obj.prt, conn.sip);
                    }

                })
            }
            if (obj.mt == "SelectMessage") {
                conn.send(JSON.stringify({ api: "user", mt: "SelectMessageResult" }));
                Database.exec("SELECT * FROM list_buttons WHERE button_user = '" + conn.sip + "'")
                    .oncomplete(function (data) {
                        log("result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "user", mt: "SelectMessageSuccess", result: JSON.stringify(data, null, 4) }));

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "user", mt: "MessageError", result: String(errorText) }));
                    });
            }
        });
    }
    conn.onclose(function () {
        log("danilo req: user conn: disconnected");
        connectionsApp.splice(connectionsApp.indexOf(conn), 1);

    });
});
new JsonApi("admin").onconnected(function (conn) {
    if (conn.app == "wecom-novaalertadmin") {
        conn.onmessage(function (msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AdminMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: obj.src, urlalert: urlalert }));
                conn.send(JSON.stringify({ api: "admin", mt: "TableUsersResult", src: obj.src, result: JSON.stringify(pbxTableUsers, null, 4) }));
            }
            if (obj.mt == "UpdateConfig") {
                if (obj.prt == "urlalert") {
                    Config.urlalert = obj.vl;
                    Config.save();
                }
            }
            if (obj.mt == "InsertMessage") {
                Database.insert("INSERT INTO list_buttons (button_name, button_prt, button_prt_user, button_user, button_type) VALUES ('" + String(obj.name) + "','" + String(obj.value) + "','" + String(obj.user) + "','" + String(obj.sip) + "','" + String(obj.type) + "')")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "InsertMessageSuccess" }));
                        initializeButtons();
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(error) }));
                    });

            }
            if (obj.mt == "SelectMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "SelectMessageResult" }));
                Database.exec("SELECT * FROM list_buttons")
                    .oncomplete(function (data) {
                        log("result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "admin", mt: "SelectMessageSuccess", result: JSON.stringify(data, null, 4) }));

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(errorText) }));
                    });
            }
            if (obj.mt == "DeleteMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "DeleteMessageResult" }));
                Database.exec("DELETE FROM list_buttons WHERE id=" + obj.id + ";")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "DeleteMessageSuccess" }));

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(errorText) }));
                    });
            }
            if (obj.mt == "InsertActionMessage") {
                Database.insert("INSERT INTO list_alarm_actions (action_name, action_alarm_code, action_prt, action_user, action_type) VALUES ('" + String(obj.name) + "','" + String(obj.alarm) + "','" + String(obj.value) + "','" + String(obj.sip) + "','" + String(obj.type) + "')")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "InsertActionMessageSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(error) }));
                    });

            }
            if (obj.mt == "SelectActionMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "SelectMessageResult" }));
                Database.exec("SELECT * FROM list_alarm_actions")
                    .oncomplete(function (data) {
                        log("result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "admin", mt: "SelectActionMessageSuccess", result: JSON.stringify(data, null, 4) }));

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(errorText) }));
                    });
            }
            if (obj.mt == "DeleteActionMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "DeleteMessageResult" }));
                Database.exec("DELETE FROM list_alarm_actions WHERE id=" + obj.id + ";")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "DeleteActionMessageSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(errorText) }));
                    });
            }
        });
    }
});

new PbxApi("RCC").onconnected(function (conn) {

    log("danilo req : RCC message:: connected " + JSON.stringify(conn));
    connectionsRCC.push({ ws: conn });
    initializeButtons();

    //conn.send(JSON.stringify({ api: "RCC", mt: "Devices", cn: "Danilo Volz" }));
    conn.onmessage(function (msg) {
        var obj = JSON.parse(msg);
        log("danilo req : RCC message:: received " + JSON.stringify(obj));

        if (obj.mt === "DevicesResult") {
            log("danilo req : RCC message:: " + JSON.stringify(obj));
            //var hw = obj.devices.filter(function (device) { return device.text === "Softphone" })[0];
            //conn.send(JSON.stringify({ api: "RCC", mt: "UserInitialize", cn: "danilo", hw: hw }));
        }
        else if (obj.mt === "UserInitializeResult") {
            //Atualiza connections 
            updateConnections(obj.src, "user", obj.user);
            //Atualiza status Botões Tela NovaAlert All
            connectionsApp.forEach(function (conn) {
                var ws = conn.ws;
                log("danilo-req RCC UserInitializeResult: success for " + String(obj.src) + " alerting user " + String(conn.ws.sip) +" with APP openned!");
                ws.send(JSON.stringify({ api: "user", mt: "UserConnected", src: obj.src }));
                //if (String(conn.ws.sip) == String(obj.src)) {
                //    ws.send(JSON.stringify({ api: "user", mt: "CallConnected", src: obj.src }));
                //}
            });
        }
        else if (obj.mt === "CallInfo") {

            log("danilo-req : RCC message::CallInfo for user src " + obj.src);
            //var foundIndex = connectionsPbxSignal[0].sip.indexOf(obj.src);
            //log("danilo-req : RCC message::CallInfo user src foundIndex " + foundIndex);
            var foundCall = calls.filter(function (call) { return call.sip === obj.src });

            if (String(foundCall) == "") {
                log("danilo-req : RCC message::CallInfo NOT foundCall ");
            } else {
                log("danilo-req : RCC message::CallInfo foundCall " + JSON.stringify(foundCall));
                calls.forEach(function (call) {
                    if (call.sip == obj.src) {
                        call.callid = obj.call;
                    }
                })
                var foundCall = calls.filter(function (call) { return call.sip === obj.src });
                log("danilo-req : RCC message::CallInfo UPDATED foundCall " + JSON.stringify(foundCall));
            }
            if (obj.msg == "x-alert") {
                //Chamada Receptiva do Ramal ou Grupo//
                if (String(foundCall) == "") {
                    insertCall(obj);

                    //Atualiza status Botões Tela NovaAlert All
                    connectionsApp.forEach(function (conn) {
                        var ws = conn.ws;
                        log("danilo-req x-alert: conn.ws.sip " + String(conn.ws.sip));
                        log("danilo-req x-alert: obj.src " + String(obj.src));
                        ws.send(JSON.stringify({ api: "user", mt: "CallConnected", src: obj.src }));
                        //if (String(conn.ws.sip) == String(obj.src)) {
                        //    ws.send(JSON.stringify({ api: "user", mt: "CallConnected", src: obj.src }));
                        //}
                    });

                    if (sendCallEvents) {
                        log("danilo-req : RCC message::sendCallEvents=true");
                        var e164 = obj.peer.e164;
                        if (e164 == "") {
                            var msg = { user: obj.src, callingNumber: obj.peer.h323, queue: "", call: obj.call, status: "inc" };
                        } else {
                            var msg = { user: obj.src, callingNumber: obj.peer.e164, queue: "", call: obj.call, status: "inc" };
                        }
                        httpClient(urlPhoneApiEvents, msg);
                    }
                }
            }
            if (obj.msg == "x-setup") {
                //Chamada Ativa do Ramal//
                if (String(foundCall) == "") {
                    insertCall(obj);

                    //Atualiza status Botões Tela NovaAlert All
                    connectionsApp.forEach(function (conn) {
                        var ws = conn.ws;
                        log("danilo-req x-alert: conn.ws.sip " + String(conn.ws.sip));
                        log("danilo-req x-alert: obj.src " + String(obj.src));
                        ws.send(JSON.stringify({ api: "user", mt: "CallConnected", src: obj.src }));
                    //    if (String(conn.ws.sip) == String(obj.src)) {
                    //        ws.send(JSON.stringify({ api: "user", mt: "CallConnected", src: obj.src }));
                    //    }
                    });

                    if (sendCallEvents) {
                        log("danilo-req : RCC message::sendCallEvents=true");
                        var e164 = obj.peer.e164;
                        if (e164 == "") {
                            var msg = { user: obj.src, callingNumber: obj.peer.h323, queue: "", call: obj.call, status: "out" };
                        } else {
                            var msg = { user: obj.src, callingNumber: obj.peer.e164, queue: "", call: obj.call, status: "out" };
                        }
                        httpClient(urlPhoneApiEvents, msg);
                    }
                }
            }
            if (obj.msg == "r-setup") {
                //Chamada Ativa do Ramal????
                //if (String(foundCall) == "") {
                //    insertCall(obj);
                //    if (sendCallEvents) {
                //        log("danilo-req : RCC message::sendCallEvents=true");
                //        var e164 = obj.peer.e164;
                //        if (e164 == "") {
                //            var msg = { user: obj.src, callingNumber: obj.peer.h323, queue: obj.no[0].e164, call: obj.call, status: "inc" };
                //        } else {
                //            var msg = { user: obj.src, callingNumber: obj.peer.e164, queue: obj.no[0].e164, call: obj.call, status: "inc" };
                //        }
                //        httpClient(urlPhoneApiEvents, msg);
                //    }
                //}
            }
            if (obj.msg == "del") {
                //Chamada Desconectada
                if (String(foundCall) !== "") {
                    //Remove
                    log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + obj.src);
                    calls = calls.filter(deleteCallsBySrc(obj.src));
                    log("danilo req : after deleteCall " + JSON.stringify(calls));

                    //Atualiza status Botões Tela NovaAlert All
                    connectionsApp.forEach(function (conn) {
                        var ws = conn.ws;
                        log("danilo-req deleteCall:del conn.ws.sip " + String(conn.ws.sip));
                        log("danilo-req deleteCall:del obj.src " + String(obj.src));
                        ws.send(JSON.stringify({ api: "user", mt: "CallDisconnected", src: obj.src }));
                        //if (String(conn.ws.sip) == String(obj.src)) {
                        //    ws.send(JSON.stringify({ api: "user", mt: "CallDisconnected", src: obj.src }));
                        //}
                    });

                    if (sendCallEvents) {
                        log("danilo-req : RCC message::sendCallEvents=true");
                        var e164 = obj.peer.e164;
                        if (e164 == "") {
                            var msg = { user: obj.src, callingNumber: obj.peer.h323, call: obj.call, status: "del" };
                        }
                        else {
                            var msg = { user: obj.src, callingNumber: obj.peer.e164, call: obj.call, status: "del" };
                        }
                        httpClient(urlPhoneApiEvents, msg);
                    }
                }
            }
        }
        else if (obj.mt === "CallDel") {
            log("danilo req : RCC message:: CallDel");
        }
        else if (obj.mt === "UserCallResult") {
            log("danilo req : RCC message:: UserCallResult")
        }
    });
    conn.onclose(function () {
        log("RCC: disconnected");
        connectionsRCC.splice(connectionsRCC.indexOf(conn), 1);
    });
});

//PBX APIS
new PbxApi("PbxSignal").onconnected(function (conn) {
    log("PbxSignal: connected");

    // for each PBX API connection an own call array is maintained

    connectionsPbxSignal.push({ ws: conn });
    // register to the PBX in order to acceppt incoming presence calls
    conn.send(JSON.stringify({ "api": "PbxSignal", "mt": "Register", "flags": "NO_MEDIA_CALL" }));

    conn.onmessage(function (msg) {
        var obj = JSON.parse(msg);
        log(msg);

        if (obj.mt === "RegisterResult") {
            log("PBXSignal: registration result " + JSON.stringify(obj));
            //initializeButtons();
        }

        // handle incoming presence_subscribe call setup messages
        // the callid "obj.call" required later for sending badge notifications
        if (obj.mt === "Signaling" && obj.sig.type === "setup" && obj.sig.fty.some(function (v) { return v.type === "presence_subscribe" })) {

            log("PbxSignal: incoming presence subscription for user " + obj.sig.cg.sip);
            log("danilo req : PBXSignal::connectionsPbxSignal: " + JSON.stringify(connectionsPbxSignal));

            // connect call
            conn.send(JSON.stringify({ "mt": "Signaling", "api": "PbxSignal", "call": obj.call, "sig": { "type": "conn" } }));

            //Adiciona
            log("PBXSignal: connections before add " + JSON.stringify(connections));
            updateConnections(obj.sig.cg.sip, "", obj.sig.fty[1].name);
            updateConnections(obj.sig.cg.sip, "call", obj.call);
            
            //connections.push({ sip: obj.sig.cg.sip, call: obj.call, name: obj.sig.fty[1].name, user: "", url: "" });
            log("PBXSignal: connections after add " + JSON.stringify(connections));

            //callRCC(connectionsRCC[0].ws, obj.sig.fty[1].name, "UserInitialize", "", obj.sig.cg.sip);

            //getURLLogin(obj.sig.cg.sip);

            // send notification with badge count first time the user has connected
            //updateBadge(conn, obj.call, count);
        }

        // handle incoming call release messages
        if (obj.mt === "Signaling" && obj.sig.type === "rel") {
            // remove callid from the array for calls for this connection
            calls.splice(calls.indexOf(obj.call), 1);
            //Remove
            log("PBXSignal: connections before user release " + JSON.stringify(connections));

            var deletedConn = connections.filter(findConnectionsByCall(obj.call))[0].sip;
            log("PBXSignal: deletedConn release " + JSON.stringify(deletedConn));
            connections = connections.filter(delConnectionsByCall(obj.call));
            log("PBXSignal: connections after user release " + JSON.stringify(connections));
            //Atualiza status Botões Tela NovaAlert All
            connectionsApp.forEach(function (conn) {
                var ws = conn.ws;
                log("danilo-req RCC UserReleaseResult: success for " + String(deletedConn) + " alerting user " + String(conn.ws.sip) + " with APP openned!");
                ws.send(JSON.stringify({ api: "user", mt: "UserDisconnected", src: String(deletedConn) }));
            });

        }
    });

    conn.onclose(function () {
        log("PbxSignal: disconnected");
        connectionsPbxSignal.splice(connectionsPbxSignal.indexOf(conn), 1);
    });
});

new PbxApi("PbxTableUsers").onconnected(function (conn) {
    log("PbxTableUsers: connected");

    // for each PBX API connection an own call array is maintained

    //connectionsPbxSignal.push({ ws: conn });
    // register to the PBX in order to acceppt incoming presence calls
    conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateStart", "add": true, "del": true, "columns": { "guid": {}, "dn": {}, "cn": {}, "h323": {}, "e164": {}, "grps": {}, "devices": {}} }));

    conn.onmessage(function (msg) {
        var obj = JSON.parse(msg);
        log("PbxTableUsers: msg received " + msg);

        if (obj.mt == "ReplicateStartResult") {
            conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateNext"  }));

        }
        if (obj.mt == "ReplicateNextResult" && obj.columns.guid) {

            pbxTableUsers.push({ guid: obj.columns.guid, sip: obj.columns.h323, cn: obj.columns.cn  });

            conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateNext" }));

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



//Funções Internas
function callNovaAlert(alert, sip) {
    log("callNovaAlert::");
    var msg = { Username: "webuser", Password: "Wecom12#", AlarmNr: alert, LocationType: "GEO=47.565055,8.912027", Location: "Wecom", LocationDescription: "Wecom POA", Originator: String(sip), AlarmPinCode: "1234", Alarmtext: "Alarm from Myapps!" };
    httpClient(urlalert, msg);
}

function insertCall(obj) {
    var e164 = obj.peer.e164;
    if (e164 == "") {
        calls.push({ sip: String(obj.src), callid: obj.call, num: obj.peer.h323 });
    } else {
        calls.push({ sip: String(obj.src), callid: obj.call, num: obj.peer.e164 });
    }
    log("danilo req : insertCall " + JSON.stringify(calls));
}
function deleteCallsBySrc(src) {
    return function (value) {
        if (value.sip != src) {
            return true;
        }
        //countInvalidEntries++
        return false;
    }
}


function delConnectionsByCall(call) {
    return function (value) {
        if (value.call != call) {
            return true;
        }
        //countInvalidEntries++
        return false;
    }
}
function findConnectionsByCall(call) {
    return function (value) {
        if (value.call == call) {
            return true;
        }
        //countInvalidEntries++
        return false;
    }
}
function updateConnections(sip, prt, value) {
    var found = false;
    connections.forEach(function (conn) {
        if (conn.sip == sip) {
            found = true;
            switch (prt) {
                case "name": {
                    conn.name = value;
                    break
                }
                case "call": {
                    conn.call = value;
                    break
                }
                case "user": {
                    conn.user = value;
                    break
                }
                case "url": {
                    conn.url = value;
                    break
                }
                case "sip": {
                    conn.sip = value;
                    break
                }
            }

        }
    })
    if (!found) {
        connections.push({ sip: sip, call: "", name: value, user: "", url: "" });
        callRCC(connectionsRCC[0].ws, value, "UserInitialize", "", sip);
    }
}

function httpClient(url, call) {
    log("danilo-req : httpClient");
    var responseData = "";
    log("danilo-req : httpClient : content" + JSON.stringify(call));
    var req = HttpClient.request("POST", url);

    req.header("X-Token", "danilo");
    req.contentType("application/json");
    req.onsend(function (req) {
        req.send(new TextEncoder("utf-8").encode(JSON.stringify(call)), true);
    });
    req.onrecv(function (req, data, last) {
        responseData += new TextDecoder("utf-8").decode(data);
        if (!last) req.recv();
    }, 1024);
    req.oncomplete(function (req, success) {
        log("danilo-req : HttpRequest complete");
        log("danilo-req : HttpRequest responseData " + responseData);
    })
        .onerror(function (error) {
            log("danilo-req : HttpRequest error=" + error);
        });

}

function alarmReceived(value) {
    var bodyDecoded = unescape(value);
    log("danilo-req alarmReceived:value " + String(bodyDecoded));
    var obj = JSON.parse(bodyDecoded);
    log("danilo-req alarmReceived:User " + String(obj.User));

    connectionsApp.forEach(function (conn) {
        var ws = conn.ws;
        log("danilo-req alarmReceived:conn.sip " + String(conn.ws.sip));
        log("danilo-req alarmReceived:obj.User " + String(obj.User));
        if (String(conn.ws.sip) == String(obj.User)) {
            ws.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: obj.AlarmID }));
        }
    });

    //Get Actions from DB
    Database.exec("SELECT * FROM list_alarm_actions")
        .oncomplete(function (data) {
            log("result=" + JSON.stringify(data, null, 4));
            var str = "";
            str = JSON.stringify(data);
            actions = JSON.parse(String(str));
            log("danilo-req alarmReceived:actions " + actions);
            if (actions != null) {
                log("danilo-req alarmReceived:actions diferent of null " + actions);
                actions.forEach(function (ac) {
                    log("danilo-req alarmReceived:ac " + JSON.stringify(ac));
                    if (ac.action_user == obj.User) {
                        log("danilo-req alarmReceived:actions action_user " + ac.action_user + " == obj.User " + obj.User);
                        if (ac.action_alarm_code == obj.AlarmID) {
                            log("danilo-req alarmReceived:actions action_alarm_code " + ac.action_alarm_code + " == obj.AlarmID " + obj.AlarmID);

                            switch (ac.action_type) {
                                case "video":
                                    connectionsApp.forEach(function (conn) {
                                        var ws = conn.ws;
                                        log("danilo-req alarmReceived:video conn.sip " + String(conn.ws.sip));
                                        log("danilo-req alarmReceived:video obj.User " + String(obj.User));
                                        if (String(conn.ws.sip) == String(obj.User)) {
                                            ws.send(JSON.stringify({ api: "user", mt: "VideoRequest", alarm: ac.action_prt }));
                                        }
                                    });
                                    break;
                                case "alarm":
                                    connectionsApp.forEach(function (conn) {
                                        var ws = conn.ws;
                                        log("danilo-req alarmReceived:alarm conn.sip " + String(conn.ws.sip));
                                        log("danilo-req alarmReceived:alarm obj.User " + String(obj.User));
                                        if (String(conn.ws.sip) == String(obj.User)) {
                                            //ws.send(JSON.stringify({ api: "user", mt: "AlarmRequested", alarm: obj.AlarmID }));
                                        }
                                    });
                                    break;
                                case "number":
                                    connectionsApp.forEach(function (conn) {
                                        var ws = conn.ws;
                                        log("danilo-req alarmReceived:number conn.sip " + String(conn.ws.sip));
                                        log("danilo-req alarmReceived:number obj.User " + String(obj.User));
                                        if (String(conn.ws.sip) == String(obj.User)) {
                                            callRCC(connectionsRCC[0].ws, conn.ws.cn, "UserCall", ac.action_prt, conn.ws.sip);
                                        }
                                    });
                                    break;
                                case "page":
                                    connectionsApp.forEach(function (conn) {
                                        var ws = conn.ws;
                                        log("danilo-req alarmReceived:video conn.sip " + String(conn.ws.sip));
                                        log("danilo-req alarmReceived:video obj.User " + String(obj.User));
                                        if (String(conn.ws.sip) == String(obj.User)) {
                                            ws.send(JSON.stringify({ api: "user", mt: "PageRequest", alarm: ac.action_prt }));
                                        }
                                    });
                                    break;
                            }
                        }
                    }
                })
            }
        })
        .onerror(function (error, errorText, dbErrorCode) {
            conn.send(JSON.stringify({ api: "user", mt: "MessageError", result: String(errorText) }));
        });
    //var obj = JSON.parse(String(value));
    //connectionsApp.forEach(function (connection) {
    //    var ws = connection.ws;
    //    log("danilo-req alarmReceived: will send "+JSON.stringify(connection));
    //    ws.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: value }));
    //});
}

function initializeButtons() {
    Database.exec("SELECT * FROM list_buttons")
        .oncomplete(function (data) {
            log("result=" + JSON.stringify(data, null, 4));
            buttons = data;

            buttons.forEach(function (b) {
                log("danilo-req : initializeButtons:: button: " + b.button_name);
                if (b.button_type == "queue") {
                    //Adiciona
                    log("initializeButtons: connections before add queue button " + JSON.stringify(connections));
                    updateConnections(b.button_prt, "", b.button_prt_user)
                    //connections.push({ sip: b.button_prt, call: "", name: b.button_prt_user, user: "", url: "" });
                    log("initializeButtons: connections after add queue button " + JSON.stringify(connections));
                    
                }
                if (b.button_type == "number") {
                    //Adiciona
                    log("initializeButtons: connections before add number button " + JSON.stringify(connections));
                    updateConnections(b.button_prt, "",b.button_name)
                    //connections.push({ sip: b.button_prt, call: "", name: b.button_prt_user, user: "", url: "" });
                    log("initializeButtons: connections after add number button " + JSON.stringify(connections));
                }

            })

        })
        .onerror(function (error, errorText, dbErrorCode) {
            log("danilo req:initializeButtons MessageError =" + String(errorText));
        });

}

function updateBadge(ws, call, count) {
    var msg = {
        "api": "PbxSignal", "mt": "Signaling", "call": call, "src": "badge",
        "sig": {
            "type": "facility",
            "fty": [{ "type": "presence_notify", "status": "open", "note": "#badge:" + count, "contact": "app:" }]
        }
    };

    ws.send(JSON.stringify(msg));
}
function callRCC(ws, user, mode, num, sip) {
    log("danilo-req callRCC:mode " + String(mode));
    if (String(mode) == "UserInitialize") {
        var msg = { api: "RCC", mt: "UserInitialize", cn: user, src: sip };
        ws.send(JSON.stringify(msg));
    }
    else if (String(mode) == "UserEnd") {
        log("danilo-req UserEnd:sip " + sip);
        connections.forEach(function (conn) {
            if (conn.sip == sip) {
                var msg = { api: "RCC", mt: "UserEnd", user: conn.user, src: sip };
                ws.send(JSON.stringify(msg));
            } else {
                log("danilo req : UserEnd rcc NOT found");
            }
        })
    }
    else if (String(mode) == "Device") {
        var msg = { api: "RCC", mt: "Devices", cn: user, src: sip };
        ws.send(JSON.stringify(msg));
    }
    else if (String(mode) == "UserCall") {
        log("danilo-req UserCall:sip " + sip);
        connections.forEach(function (conn) {
            if (conn.sip == sip) {
                var msg = { api: "RCC", mt: "UserCall", user: conn.user, e164: num, src: sip };
                log("danilo-req UserCall:rcc msg " + JSON.stringify(msg));
                ws.send(JSON.stringify(msg));
            } else {
                log("danilo req : UserCall rcc NOT found");
            }
        })
    }
    else if (String(mode) == "UserClear") {
        calls.forEach(function (call) {
            if (call.sip == sip) {
                var msg = { api: "RCC", mt: "UserClear", call: call.callid, src: call.sip };
                ws.send(JSON.stringify(msg));
            }

        })
    }
    else if (mode == "UserHold") {
        calls.forEach(function (call) {
            if (call.sip == sip) {
                var msg = { api: "RCC", mt: "UserHold", call: call.callid, remote: true, src: call.sip };
                ws.send(JSON.stringify(msg));
            }

        })
    }
    else if (mode == "UserRetrieve") {
        calls.forEach(function (call) {
            if (call.sip == sip) {
                var msg = { api: "RCC", mt: "UserRetrieve", call: call.callid, src: call.sip };
                ws.send(JSON.stringify(msg));
            }

        })
    }
    else if (mode == "UserRedirect") {
        calls.forEach(function (call) {
            if (call.sip == sip) {
                var msg = { api: "RCC", mt: "UserRedirect", call: call.callid, e164: num, src: call.sip };
                ws.send(JSON.stringify(msg));
            }

        })
    }
    else if (mode == "UserConnect") {
        calls.forEach(function (call) {
            if (call.sip == sip) {
                var msg = { api: "RCC", mt: "UserConnect", call: call.callid, src: call.sip };
                ws.send(JSON.stringify(msg));
            }

        })
    }
}

