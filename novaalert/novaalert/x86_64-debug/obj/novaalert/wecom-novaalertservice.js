
var urlalert = Config.urlalert;
var urlPhoneApiEvents = Config.urlPhoneApiEvents;
var sendCallEvents = Config.sendCallEvents;

//var connectionsRCC = [];
var connectionsApp = [];
var connectionsPbxSignal = [];
var connections = [];
var calls = [];
var actions = [];
var buttons = [];
var pbxTableUsers = [];

var connectionsUser = [];
var connectionsAdmin = [];
var RCC = [];
var PbxSignal = [];
var queueGrupsOk = false;
var count = 0;

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

//APPS API
new JsonApi("user").onconnected(function (conn) {
    log("danilo req: user conn: " + JSON.stringify(conn))
    connectionsUser.push(conn);

    if (conn.app == "wecom-novaalert") {
        conn.onmessage(function (msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "UserMessage") {
                updateTableBadgeCount(conn.sip, "ResetCount");
                conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", urlalert: urlalert }));
            }
            if (obj.mt == "UserPresence") {
                RCC.forEach(function (c) {
                    for (var i in c) {
                        
                        if (c.hasOwnProperty(i)) {
                            conn.send(JSON.stringify({ api: "user", mt: "UserConnected", src: i }));
                            //resultado += nomeDoObj + "." + i + " = " + obj[i] + "\n";
                        }
                    }
                })
                //connections.forEach(function (c) {
                //    if (c.user != "" && c.call !="number") {
                //        conn.send(JSON.stringify({ api: "user", mt: "UserConnected", src: c.sip }));
                //    }

                //})
            }
            if (obj.mt == "DecrementCount") {
                updateTableBadgeCount(conn.sip, obj.mt);
            }
            if (obj.mt == "TriggerAlert") {
                callNovaAlert(parseInt(obj.prt), conn.sip);
                conn.send(JSON.stringify({ api: "user", mt: "AlarmSuccessTrigged", src: obj.prt }));
            }
            if (obj.mt == "TriggerCombo") {
                comboManager(parseInt(obj.prt), conn.sip, obj.mt);
            }
            if (obj.mt == "StopCombo") {
                comboManager(parseInt(obj.prt), conn.sip, obj.mt);
                conn.send(JSON.stringify({ api: "user", mt: "ComboSuccessTrigged", src: obj.prt }));
            }
            if (obj.mt == "TriggerCall") {
                var foundCall = false;
                calls.forEach(function (call) {
                    log("danilo req:TriggerCall call.sip == " + call.sip);
                    if (call.sip == conn.sip) {
                        foundCall = true;
                        //callRCC(connectionsRCC[0].ws, conn.cn, "UserClear", obj.prt, conn.sip);
                    }
                })
                if (!foundCall) {
                    RCC.forEach(function (rcc) {
                        var temp = rcc[String(conn.sip)];
                        log("danilo req:TriggerCall call.sip == conn.sip:temp " + temp);
                        if (temp != null) {
                            user = temp;
                            log("danilo-req rccRequest:wil call callRCC for user " + user);
                            callRCC(rcc, user, "UserCall", obj.prt, conn.sip + "," + rcc.pbx);
                        }
                    })
                }
                //callRCC(connectionsRCC[0].ws, conn.cn, "UserCall", obj.prt, conn.sip);
            }
            if (obj.mt == "UserConnect") {
                log("danilo req:UserConnect");
                calls.forEach(function (call) {
                    log("danilo req:UserConnect call.sip == " + call.sip);
                    if (call.sip == conn.sip) {
                        log("danilo req:UserConnect call.sip == conn.sip");
                        RCC.forEach(function (rcc) {
                            var temp = rcc[String(conn.sip)];
                            log("danilo req:UserConnect call.sip == conn.sip:temp " + temp);
                            if (temp != null) {
                                user = temp;
                                //callRCC(connectionsRCC[0].ws, conn.cn, "UserClear", obj.prt, conn.sip);
                                log("danilo-req:UserConnect:will call callRCC for user " + user);
                                callRCC(rcc, user, "UserConnect", obj.prt, conn.sip + "," + rcc.pbx);
                            }
                        })
                    }
                })
            }
            if (obj.mt == "EndCall") {
                log("danilo req:EndCall");
                calls.forEach(function (call) {
                    log("danilo req:EndCall call.sip == "+ call.sip);
                    if (call.sip == conn.sip) {
                        log("danilo req:EndCall call.sip == conn.sip");
                        RCC.forEach(function (rcc) {
                            var temp = rcc[String(conn.sip)];
                            log("danilo req:TriggerCall call.sip == conn.sip:temp " + temp);
                            if (temp != null) {
                                user = temp;
                                //callRCC(connectionsRCC[0].ws, conn.cn, "UserClear", obj.prt, conn.sip);
                                log("danilo-req:TriggerCall:will call callRCC for user " + user);
                                callRCC(rcc, user, "UserClear", obj.prt, conn.sip + "," + rcc.pbx);
                            }
                        })
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
        log("User: disconnected");
        connectionsUser.splice(connectionsUser.indexOf(conn), 1);

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
            if (obj.mt == "InsertComboMessage") {
                Database.insert("INSERT INTO list_buttons (button_name, button_prt, button_prt_user, button_user, button_type, button_type_1, button_type_2, button_type_3, button_type_4) VALUES ('" + String(obj.name) + "','" + String(obj.value) + "','" + String(obj.user) + "','" + String(obj.sip) + "','" + String(obj.type) + "','" + String(obj.type1) + "','" + String(obj.type2) + "','" + String(obj.type3) + "','" + String(obj.type4) +"')")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "InsertMessageSuccess" }));
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

//PBX APIS
//ok
new PbxApi("PbxTableUsers").onconnected(function (conn) {
    log("PbxTableUsers: connected");
    // register to the PBX in order to receive users
    conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateStart", "add": true, "del": true, "columns": { "guid": {}, "dn": {}, "cn": {}, "h323": {}, "e164": {}, "grps": {}, "devices": {} } }));

    conn.onmessage(function (msg) {
        var obj = JSON.parse(msg);
        log("PbxTableUsers: msg received " + msg);

        if (obj.mt == "ReplicateStartResult") {
            pbxTableUsers = [];
            conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateNext" }));
        }
        if (obj.mt == "ReplicateNextResult" && obj.columns) {
            try {
                pbxTableUsers.push({ guid: obj.columns.guid, sip: obj.columns.h323, cn: obj.columns.cn, badge: 0 });
                conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateNext" }));
            } finally {
                log("PbxTableUsers: ReplicateNextResult FIM");
            }
        }
        if (obj.mt == "ReplicateAdd") {
            pbxTableUsers.push({ guid: obj.columns.guid, sip: obj.columns.h323, cn: obj.columns.cn });
        }
        if (obj.mt == "ReplicateUpdate") {

        }
    });

    conn.onclose(function () {
        log("PbxTableUsers: disconnected");
        //connectionsPbxSignal.splice(connectionsPbxSignal.indexOf(conn), 1);
    });
});

//ok
new PbxApi("RCC").onconnected(function (conn) {

    //connectionsRCC.push({ ws: conn });
    RCC.push(conn);
    log("RCC: connected conn " + JSON.stringify(conn));
    log("RCC: connected RCC " + JSON.stringify(RCC));

    if (!queueGrupsOk) {
        initializeButtons();
        queueGrupsOk = true;
    }

    conn.send(JSON.stringify({ "api": "RCC", "mt": "Initialize", "limit": 50, "calls": true }));

    //conn.send(JSON.stringify({ api: "RCC", mt: "Devices", cn: "Danilo Volz" }));
    conn.onmessage(function (msg) {
        var obj = JSON.parse(msg);
        log("danilo req : RCC message:: received" + JSON.stringify(obj));

        //if (obj.mt === "UserInfo" && obj.state==0) {
        //    var msg = { api: "RCC", mt: "UserInitialize", cn: obj.cn, src: obj.h323+","+obj.pbx};
        //    conn.send(JSON.stringify(msg));
        //}
        //if (obj.mt === "UserInfo" && obj.state ==1) {
        //    var msg = { api: "RCC", mt: "UserEnd", cn: obj.cn, src: obj.h323 + "," + obj.pbx };
        //    conn.send(JSON.stringify(msg));
        //}
        if (obj.mt === "DevicesResult") {
            log("danilo req : RCC message:: " + JSON.stringify(obj));
            //var hw = obj.devices.filter(function (device) { return device.text === "Softphone" })[0];
            //conn.send(JSON.stringify({ api: "RCC", mt: "UserInitialize", cn: "danilo", hw: hw }));
        }
        else if (obj.mt === "UserInitializeResult") {
            log("danilo req UserInitializeResult: RCC message:: received" + JSON.stringify(obj));
            //Atualiza connections
            var src = obj.src;
            var myArray = src.split(",");
            var sip = myArray[0];
            var pbx = myArray[1];
            RCC.forEach(function (rcc) {
                if (rcc.pbx == pbx) {
                    rcc[sip] = obj.user;
                }
            })
            connectionsUser.forEach(function (c) {
                c.send(JSON.stringify({ api: "user", mt: "UserConnected", src: sip }));

            })

            //updateConnections(obj.src, "user", obj.user, obj.area);
        } else if (obj.mt === "UserEndResult") {
            
        }
        else if (obj.mt === "CallInfo") {
            var src = obj.src;
            var myArray = src.split(",");
            var sip = myArray[0];
            var pbx = myArray[1];

            log("danilo-req : RCC message::CallInfo for user src " + sip);
            //var foundIndex = connectionsPbxSignal[0].sip.indexOf(obj.src);
            //log("danilo-req : RCC message::CallInfo user src foundIndex " + foundIndex);
            var foundCall = calls.filter(function (call) { return call.sip === sip });

            if (String(foundCall) == "") {
                log("danilo-req : RCC message::CallInfo NOT found Call ");
            } else {
                log("danilo-req : RCC message::CallInfo found Call " + JSON.stringify(foundCall));
                calls.forEach(function (call) {
                    if (call.sip == sip) {
                        call.callid = obj.call;
                    }
                })
                var foundCall = calls.filter(function (call) { return call.sip === sip });
                log("danilo-req : RCC message::CallInfo UPDATED Callid in found Call " + JSON.stringify(foundCall));
            }



            if (obj.msg == "x-alert") {
                //Chamada Receptiva do Ramal ou Grupo//
                if (String(foundCall) == "") {
                    insertCall(obj);

                    //Atualiza status Botões Tela NovaAlert All
                    connectionsUser.forEach(function (conn) {
                        //var ws = conn.ws;
                        log("danilo-req x-alert: conn.sip " + String(conn.sip));
                        log("danilo-req x-alert: obj.src " + String(obj.src));
                        conn.send(JSON.stringify({ api: "user", mt: "CallRinging", src: sip }));
                        //if (String(conn.ws.sip) == String(obj.src)) {
                        //    ws.send(JSON.stringify({ api: "user", mt: "CallConnected", src: obj.src }));
                        //}
                    });

                    if (sendCallEvents) {
                        log("danilo-req : RCC message::sendCallEvents=true");
                        var e164 = obj.peer.e164;
                        if (queues.some(function (v) { return v.Fila === sip })) {
                            if (e164 == "") {
                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "inc" };
                            } else {
                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "inc" };
                            }
                        } else {
                            if (e164 == "") {
                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "inc" };
                            } else {
                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "inc" };
                            }
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
                    connectionsUser.forEach(function (conn) {
                        //var ws = conn.ws;
                        log("danilo-req x-alert: conn.sip " + String(conn.sip));
                        log("danilo-req x-alert: obj.src " + String(obj.src));
                        conn.send(JSON.stringify({ api: "user", mt: "CallRinging", src: sip }));
                        //if (String(conn.ws.sip) == String(obj.src)) {
                        //    ws.send(JSON.stringify({ api: "user", mt: "CallConnected", src: obj.src }));
                        //}
                    });

                    if (sendCallEvents) {
                        log("danilo-req : RCC message::sendCallEvents=true");
                        var e164 = obj.peer.e164;
                        if (queues.some(function (v) { return v.Fila === sip })) {
                            if (e164 == "") {
                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "out" };
                            } else {
                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "out" };
                            }
                        } else {
                            if (e164 == "") {
                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "out" };
                            } else {
                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "out" };
                            }
                        }
                        httpClient(urlPhoneApiEvents, msg);
                    }
                }
            }
            if (obj.msg == "x-conn" || obj.msg == "r-conn") {
                //Chamada Ativa ou Receptiva Atendida//
                if (String(foundCall) !== "") {

                    //Atualiza status Botões Tela NovaAlert All
                    connectionsUser.forEach(function (conn) {
                        //var ws = conn.ws;
                        log("danilo-req x-alert: conn.sip " + String(conn.sip));
                        log("danilo-req x-alert: obj.src " + String(obj.src));
                        conn.send(JSON.stringify({ api: "user", mt: "CallConnected", src: sip }));
                        //if (String(conn.ws.sip) == String(obj.src)) {
                        //    ws.send(JSON.stringify({ api: "user", mt: "CallConnected", src: obj.src }));
                        //}
                    });

                    if (sendCallEvents) {
                        log("danilo-req : RCC message::sendCallEvents=true");
                        var e164 = obj.peer.e164;
                        if (queues.some(function (v) { return v.Fila === sip })) {
                            if (e164 == "") {
                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "ans" };
                            } else {
                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "ans" };
                            }
                        } else {
                            if (e164 == "") {
                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "ans" };
                            } else {
                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "ans" };
                            }
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
                //Chamada Desconectada//
                if (String(foundCall) !== "") {
                    //Remove
                    log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call for user " + sip);
                    calls = calls.filter(deleteCallsBySrc(sip));
                    log("danilo req : after deleteCall " + JSON.stringify(calls));

                    //Atualiza status Botões Tela NovaAlert All
                    connectionsUser.forEach(function (conn) {
                        //var ws = conn.ws;
                        log("danilo-req deleteCall:del conn.sip " + String(conn.sip));
                        log("danilo-req deleteCall:del obj.src " + String(obj.src));
                        conn.send(JSON.stringify({ api: "user", mt: "CallDisconnected", src: sip }));
                        //if (String(conn.ws.sip) == String(obj.src)) {
                        //    ws.send(JSON.stringify({ api: "user", mt: "CallDisconnected", src: obj.src }));
                        //}
                    });

                    if (sendCallEvents) {
                        log("danilo-req : RCC message::sendCallEvents=true");
                        var e164 = obj.peer.e164;
                        if (queues.some(function (v) { return v.Fila === sip })) {
                            if (e164 == "") {
                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "del" };
                            } else {
                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "del" };
                            }
                        } else {
                            if (e164 == "") {
                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "del" };
                            } else {
                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "del" };
                            }
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
        RCC.splice(RCC.indexOf(conn), 1);
        //connectionsRCC.splice(connectionsRCC.indexOf(conn), 1);
    });
});

//ok
new PbxApi("PbxSignal").onconnected(function (conn) {
    log("PbxSignal: connected conn " + JSON.stringify(conn));

    // for each PBX API connection an own call array is maintained
    PbxSignal.push(conn);
    //connectionsPbxSignal.push({ ws: conn });
    log("PbxSignal: connected PbxSignal " + JSON.stringify(PbxSignal));

    // register to the PBX in order to acceppt incoming presence calls
    conn.send(JSON.stringify({ "api": "PbxSignal", "mt": "Register", "flags": "NO_MEDIA_CALL", "src": conn.pbx }));

    conn.onmessage(function (msg) {
        var obj = JSON.parse(msg);
        log(msg);

        if (obj.mt === "RegisterResult") {
            log("PBXSignal: registration result " + JSON.stringify(obj));
        }

        // handle incoming presence_subscribe call setup messages
        // the callid "obj.call" required later for sending badge notifications
        if (obj.mt === "Signaling" && obj.sig.type === "setup" && obj.sig.fty.some(function (v) { return v.type === "presence_subscribe" })) {

            log("PbxSignal: incoming presence subscription for user " + obj.sig.cg.sip);

            // connect call
            conn.send(JSON.stringify({ "mt": "Signaling", "api": "PbxSignal", "call": obj.call, "src": obj.sig.cg.sip + "," + obj.src, "sig": { "type": "conn" } }));

            //Atualiza connections
            var src = obj.src;
            var myArray = src.split(",");
            var pbx = myArray[0];
            log("PbxSignal: before add new userclient " + JSON.stringify(PbxSignal));
            PbxSignal.forEach(function (signal) {
                if (signal.pbx == pbx) {
                    signal[obj.sig.cg.sip] = obj.call;
                }
            })
            log("PbxSignal: after add new userclient " + JSON.stringify(PbxSignal));
            var name = "";
            var myArray = obj.sig.fty;
            myArray.forEach(function (fty) {
                if (fty.name) {
                    name = fty.name;
                }
            })
            RCC.forEach(function (rcc) {
                if (rcc.pbx == pbx) {
                    log("PbxSignal: calling RCC API for new userclient " + String(name) + " on PBX " + pbx);
                    var msg = { api: "RCC", mt: "UserInitialize", cn: name, src: obj.sig.cg.sip + "," + obj.src };
                    rcc.send(JSON.stringify(msg));
                }
            })

            //Adiciona
            //log("PBXSignal: connections before add " + JSON.stringify(connections));
            //connections.push({ sip: obj.sig.cg.sip, call: obj.call, name: obj.sig.fty[1].name, user: "", url:"", area:"" });
            //log("PBXSignal: connections after add " + JSON.stringify(connections));



            //connectionsRCC.forEach(function (c) {
            //    callRCC(c.ws, obj.sig.fty[1].name, "UserInitialize", "", obj.sig.cg.sip);
            //})


            //getURLLogin(obj.sig.cg.sip);

            // send notification with badge count first time the user has connected
            try {
                count = pbxTableUsers.filter(findBySip(obj.sig.cg.sip))[0].badge;
            } finally {
                updateBadge(conn, obj.call, count);
            }
        }

        // handle incoming call release messages
        if (obj.mt === "Signaling" && obj.sig.type === "rel") {
            // remove callid from the array for calls for this connection
            calls.splice(calls.indexOf(obj.call), 1);

            //Remove
            //log("PBXSignal: connections result " + JSON.stringify(connections));
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

            RCC.forEach(function (rcc) {
                if (rcc.pbx == pbx) {
                    var user = rcc[sip];
                    log("PbxSignal: calling RCC API to End user Monitor " + String(sip) + " on PBX " + pbx);
                    var msg = { api: "RCC", mt: "UserEnd", user: user, src: sip + "," + obj.src };
                    conn.send(JSON.stringify(msg));
                }
            })
            connectionsUser.forEach(function (c) {
                c.send(JSON.stringify({ api: "user", mt: "UserDisconnected", src: sip }));

            })
            //connections = connections.filter(delConnectionsByCall(obj.call));
            //log("PBXSignal: connections result " + JSON.stringify(connections));
        }
    });

    conn.onclose(function () {
        log("PbxSignal: disconnected");
        PbxSignal.splice(PbxSignal.indexOf(conn), 1);
        //connectionsPbxSignal.splice(connectionsPbxSignal.indexOf(conn), 1);
    });
});

/*
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
            var count;
            try {
                count = pbxTableUsers.filter(findConnectionsBySip(obj.sig.cg.sip))[0].badge;
            } finally {
                updateBadge(conn, obj.call, count);
            }
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
*/

//Funções Internas
//ok
function callNovaAlert(alert, sip) {
    log("callNovaAlert::");
    var msg = { Username: "webuser", Password: "Wecom12#", AlarmNr: alert, LocationType: "GEO=47.565055,8.912027", Location: "Wecom", LocationDescription: "Wecom POA", Originator: String(sip), AlarmPinCode: "1234", Alarmtext: "Alarm from Myapps!" };
    httpClient(urlalert, msg);
}
//ok
function insertCall(obj) {
    var e164 = obj.peer.e164;
    var myArray = obj.src.split(",");
    var src = myArray[0];
    if (e164 == "") {
        calls.push({ sip: String(src), callid: obj.call, num: obj.peer.h323 });
    } else {
        calls.push({ sip: String(src), callid: obj.call, num: obj.peer.e164 });
    }
    log("danilo req insertCall: call inserted " + JSON.stringify(calls));
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
/*
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
*/
//ok
function findBySip(sip) {
    return function (value) {
        if (value.sip == sip) {
            return true;
        }
        //countInvalidEntries++
        return false;
    }
}
//ok
function updateTableBadgeCount(sip, mt) {
    if (mt == "IncrementCount") {
        pbxTableUsers.forEach(function (user) {
            if (user.sip == sip) {
                user.badge = user.badge + 1;

                log("Sending updates via Presence Signalling");

                PbxSignal.forEach(function (signal) {
                    log("danilo-req badge2:PbxSignal " + JSON.stringify(signal));
                    var call = signal[user.sip];
                    if (call != null) {
                        log("danilo-req badge2:call found" + String(call) +", will call updateBadge");
                        updateBadge(signal, call, user.badge);
                    }

                })


                /*
                connections.forEach(function (conn) {
                    if (conn.sip == user.sip) {
                        connectionsPbxSignal.forEach(function (c) {
                            updateBadge(c.ws, conn.call, user.badge);
                        })
                    }
                })
                */
            }
        })
    }
    if (mt == "DecrementCount") {
        pbxTableUsers.forEach(function (user) {
            if (user.sip == sip) {
                user.badge = user.badge - 1;

                log("Sending updates via Presence Signalling");

                PbxSignal.forEach(function (signal) {
                    log("danilo-req badge2:PbxSignal " + JSON.stringify(signal));
                    var call = signal[user.sip];
                    if (call != null) {
                        log("danilo-req badge2:call found" + String(call) + ", will call updateBadge");
                        updateBadge(signal, call, user.badge);
                    }

                })
                /*
                connections.forEach(function (conn) {
                    if (conn.sip == user.sip) {
                        connectionsPbxSignal.forEach(function (c) {
                            updateBadge(c.ws, conn.call, user.badge);
                        })
                    }
                })
                */
            }
        })
    }
    if (mt == "ResetCount") {
        pbxTableUsers.forEach(function (user) {
            if (user.sip == sip) {
                user.badge = 0;

                log("Sending updates via Presence Signalling");

                PbxSignal.forEach(function (signal) {
                    log("danilo-req badge2:PbxSignal " + JSON.stringify(signal));
                    var call = signal[user.sip];
                    if (call != null) {
                        log("danilo-req badge2:call found" + String(call) + ", will call updateBadge");
                        updateBadge(signal, call, user.badge);
                    }

                })
                /*
                connections.forEach(function (conn) {
                    if (conn.sip == user.sip) {
                        connectionsPbxSignal.forEach(function (c) {
                            updateBadge(c.ws, conn.call, user.badge);
                        })
                    }
                })
                */
            }
        })
    }
}

/*
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
        connections.push({ sip: sip, call: prt, name: value, user: "", url: "" });
        callRCC(connectionsRCC[0].ws, value, "UserInitialize", "", sip);
        //Atualiza status Botões Tela NovaAlert All
        if (prt != "number") {
            connectionsApp.forEach(function (conn) {
                var ws = conn.ws;
                log("danilo-req RCC UserInitializeResult: success for " + String(sip) + " alerting user " + String(conn.ws.sip) + " with APP openned!");
                ws.send(JSON.stringify({ api: "user", mt: "UserConnected", src: sip }));
                //if (String(conn.ws.sip) == String(obj.src)) {
                //    ws.send(JSON.stringify({ api: "user", mt: "CallConnected", src: obj.src }));
                //}
            });
        }
        
    }
}
*/
//ok
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
//ok
function alarmReceived(value) {
    var bodyDecoded = unescape(value);
    log("danilo-req alarmReceived:value " + String(bodyDecoded));
    
    var found = false;
    try {
        var obj = JSON.parse(bodyDecoded);
        log("danilo-req alarmReceived:User " + String(obj.User));
        updateTableBadgeCount(obj.User, "IncrementCount");
        connectionsUser.forEach(function (conn) {
            //var ws = conn.ws;
            log("danilo-req alarmReceived:conn.sip " + String(conn.sip));
            log("danilo-req alarmReceived:obj.User " + String(obj.User));
            if (String(conn.sip) == String(obj.User)) {
                conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: obj.AlarmID }));
                found = true;
            }
        });

    } finally {
        log("danilo-req alarmReceived: FIM");
    }
    if (found == false) {
        connectionsUser.forEach(function (conn) {
            //var ws = conn.ws;
            log("danilo-req alarmReceived:conn.sip not for user " + String(conn.sip));
            updateTableBadgeCount(conn.sip, "IncrementCount");
            conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: obj.AlarmID }));
        });
    }

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
                                    connectionsUser.forEach(function (conn) {
                                        //var ws = conn.ws;
                                        log("danilo-req alarmReceived:video conn.sip " + String(conn.sip));
                                        log("danilo-req alarmReceived:video obj.User " + String(obj.User));
                                        if (String(conn.sip) == String(obj.User)) {
                                            conn.send(JSON.stringify({ api: "user", mt: "VideoRequest", alarm: ac.action_prt }));
                                        }
                                    });
                                    break;
                                case "alarm":
                                    connectionsUser.forEach(function (conn) {
                                        //var ws = conn.ws;
                                        log("danilo-req alarmReceived:alarm conn.sip " + String(conn.sip));
                                        log("danilo-req alarmReceived:alarm obj.User " + String(obj.User));
                                        if (String(conn.sip) == String(obj.User)) {
                                            conn.send(JSON.stringify({ api: "user", mt: "AlarmRequested", alarm: obj.AlarmID }));
                                        }
                                    });
                                    break;
                                case "number":
                                    var foundConnectionUser = connectionsUser.filter(function (conn) { return conn.sip === button.button_user });
                                    var foundCall = calls.filter(function (call) { return call.sip === button.button_user });
                                    if (!foundCall) {
                                        RCC.forEach(function (rcc) {
                                            var temp = rcc[String(foundConnectionUser.sip)];
                                            if (temp != null) {
                                                user = temp;
                                                log("danilo-req alarmReceived:will call callRCC for user " + user + " Nome " + foundConnectionUser.dn);
                                                callRCC(rcc, user, "UserCall", ac.action_prt, foundConnectionUser.sip + "," + rcc.pbx);
                                            }
                                        })
                                    }

                                    //connectionsUser.forEach(function (conn) {
                                    //    //var ws = conn.ws;
                                    //    log("danilo-req alarmReceived:number conn.sip " + String(conn.sip));
                                    //    log("danilo-req alarmReceived:number obj.User " + String(obj.User));
                                    //    if (String(conn.sip) == String(obj.User)) {
                                    //        callRCC(connectionsRCC[0].ws, conn.cn, "UserCall", ac.action_prt, conn.sip);
                                    //    }
                                    //});
                                    break;
                                case "page":
                                    connectionsUser.forEach(function (conn) {
                                        //var ws = conn.ws;
                                        log("danilo-req alarmReceived:video conn.sip " + String(conn.sip));
                                        log("danilo-req alarmReceived:video obj.User " + String(obj.User));
                                        if (String(conn.sip) == String(obj.User)) {
                                            conn.send(JSON.stringify({ api: "user", mt: "PageRequest", alarm: ac.action_prt }));
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
//ok
function initializeButtons() {
    Database.exec("SELECT * FROM list_buttons")
        .oncomplete(function (data) {
            log("result=" + JSON.stringify(data, null, 4));
            buttons = data;

            buttons.forEach(function (b) {
                if (b.button_type == "queue") {
                    //Adiciona
                    var pbx = true;
                    log("danilo-req : initializeButtons:: button: " + b.button_name);
                    RCC.forEach(function (rcc) {
                        if (pbx) {
                            log("initializeButtons: calling RCC API for new queue button " + String(b.button_prt_user) + " on PBX " + rcc.pbx);
                            var msg = { api: "RCC", mt: "UserInitialize", cn: b.button_prt_user, src: b.button_prt + "," + rcc.pbx };
                            rcc.send(JSON.stringify(msg));
                            pbx = false;
                        }
                    })
                    //updateConnections(b.button_prt, b.button_type, b.button_prt_user)
                    //connections.push({ sip: b.button_prt, call: "", name: b.button_prt_user, user: "", url: "" });
                    //log("initializeButtons: connections after add queue button " + JSON.stringify(connections));
                    
                }
                //if (b.button_type == "number") {
                //    //Adiciona
                //    var name = "";
                //    try {
                //        var name = pbxTableUsers.filter(findConnectionsBySip(b.button_prt))[0].cn;
                //    } finally {
                //        var name = b.button_name;
                //        log("initializeButtons: connections before add number button " + JSON.stringify(connections));
                //        updateConnections(b.button_prt, b.button_type, name)
                //        //connections.push({ sip: b.button_prt, call: "", name: b.button_prt_user, user: "", url: "" });
                //        log("initializeButtons: connections after add number button " + JSON.stringify(connections));
                //    }
                //}

            })

        })
        .onerror(function (error, errorText, dbErrorCode) {
            log("danilo req:initializeButtons MessageError =" + String(errorText));
        });

}
//ok
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
//ok
function callRCC(ws, user, mode, num, sip) {
    log("danilo-req callRCC:mode " + String(mode));
    if (String(mode) == "UserInitialize") {
        var msg = { api: "RCC", mt: "UserInitialize", cn: user, src: sip };
        ws.send(JSON.stringify(msg));
    }
    //else if (String(mode) == "UserEnd") {
    //    log("danilo-req UserEnd:sip " + sip);
    //    connections.forEach(function (conn) {
    //        if (conn.sip == sip) {
    //            var msg = { api: "RCC", mt: "UserEnd", user: conn.user, src: sip };
    //            ws.send(JSON.stringify(msg));
    //        } else {
    //            log("danilo req : UserEnd rcc NOT found");
    //        }
    //    })
    //}
    else if (String(mode) == "Device") {
        var msg = { api: "RCC", mt: "Devices", cn: user, src: sip };
        ws.send(JSON.stringify(msg));
    }
    else if (String(mode) == "UserCall") {
        log("danilo-req UserCall:sip " + sip);
        var msg = { api: "RCC", mt: "UserCall", user: user, e164: num, src: sip };
        log("danilo req callRCC: UserCall sent rcc msg " + JSON.stringify(msg));
        ws.send(JSON.stringify(msg));

        //log("danilo-req UserCall:sip " + sip);
        //connections.forEach(function (conn) {
        //    if (conn.sip == sip) {
        //        var msg = { api: "RCC", mt: "UserCall", user: conn.user, e164: num, src: sip };
        //        log("danilo-req UserCall:rcc msg " + JSON.stringify(msg));
        //        ws.send(JSON.stringify(msg));
        //    } else {
        //        log("danilo req : UserCall rcc NOT found");
        //    }
        //})
    }
    else if (String(mode) == "UserClear") {
        var myArray = sip.split(",");
        var sip = myArray[0];
        var pbx = myArray[1];
        calls.forEach(function (call) {
            log("danilo-req UserClear:sip " + sip);
            log("danilo-req UserClear:call " + JSON.stringify(call));
            log("danilo-req UserClear:call.callid " + JSON.stringify(call.callid));
            log("danilo-req UserClear:call.sip " + JSON.stringify(call.sip));
            if (call.sip == sip) {

                var msg = { api: "RCC", mt: "UserClear", call: call.callid, src: call.sip };
                log("danilo req callRCC: UserClear sent rcc msg " + JSON.stringify(msg));
                ws.send(JSON.stringify(msg));
            }

        })

        //calls.forEach(function (call) {
        //    if (call.sip == sip) {
        //        var msg = { api: "RCC", mt: "UserClear", call: call.callid, src: call.sip };
        //        ws.send(JSON.stringify(msg));
        //    }

        //})
    }
    else if (mode == "UserHold") {
        var myArray = sip.split(",");
        var sip = myArray[0];
        var pbx = myArray[1];
        calls.forEach(function (call) {
            if (call.sip == sip) {
                var msg = { api: "RCC", mt: "UserHold", call: call.callid, remote: true, src: call.sip };
                ws.send(JSON.stringify(msg));
            }

        })

        //calls.forEach(function (call) {
        //    if (call.sip == sip) {
        //        var msg = { api: "RCC", mt: "UserHold", call: call.callid, remote: true, src: call.sip };
        //        ws.send(JSON.stringify(msg));
        //    }

        //})
    }
    else if (mode == "UserRetrieve") {
        var myArray = sip.split(",");
        var sip = myArray[0];
        var pbx = myArray[1];
        calls.forEach(function (call) {
            if (call.sip == sip) {
                var msg = { api: "RCC", mt: "UserRetrieve", call: call.callid, src: call.sip };
                ws.send(JSON.stringify(msg));
            }

        })

        //calls.forEach(function (call) {
        //    if (call.sip == sip) {
        //        var msg = { api: "RCC", mt: "UserRetrieve", call: call.callid, src: call.sip };
        //        ws.send(JSON.stringify(msg));
        //    }

        //})
    }
    else if (mode == "UserRedirect") {
        var myArray = sip.split(",");
        var sip = myArray[0];
        var pbx = myArray[1];
        calls.forEach(function (call) {
            if (call.sip == sip) {
                var msg = { api: "RCC", mt: "UserRedirect", call: call.callid, e164: num, src: call.sip };
                ws.send(JSON.stringify(msg));
            }

        })

        //calls.forEach(function (call) {
        //    if (call.sip == sip) {
        //        var msg = { api: "RCC", mt: "UserRedirect", call: call.callid, e164: num, src: call.sip };
        //        ws.send(JSON.stringify(msg));
        //    }

        //})
    }
    else if (mode == "UserConnect") {
        var myArray = sip.split(",");
        var sip = myArray[0];
        var pbx = myArray[1];
        calls.forEach(function (call) {
            log("danilo-req UserConnect:sip " + sip);
            log("danilo-req UserConnect:call " + JSON.stringify(call));
            log("danilo-req UserConnect:call.callid " + JSON.stringify(call.callid));
            log("danilo-req UserConnect:call.sip " + JSON.stringify(call.sip));
            if (call.sip == sip) {
                var msg = { api: "RCC", mt: "UserConnect", call: call.callid, src: call.sip };
                ws.send(JSON.stringify(msg));
            }

        })

        //calls.forEach(function (call) {
        //    if (call.sip == sip) {
        //        var msg = { api: "RCC", mt: "UserConnect", call: call.callid, src: call.sip };
        //        ws.send(JSON.stringify(msg));
        //    }

        //})
    }
}
//ok
function comboManager(combo, sip, mt) {
    var combo_button = [];
    Database.exec("SELECT * FROM list_buttons WHERE button_user = '" + sip + "' AND id = " + parseInt(combo))
        .oncomplete(function (data) {
            log("result comboManager=" + JSON.stringify(data, null, 4));
            combo_button = data;

            log("result combo_button=" + JSON.stringify(combo_button));
            var type1 = parseInt(combo_button[0].button_type_1);
            log("result combo_button=type1 " + type1);

            buttons.forEach(function (button) {
                log("result forEach button" + JSON.stringify(button));
                if (parseInt(combo_button[0].button_type_1) == parseInt(button.id)) {
                    log("result comboManager= Localizado Combo 1 com ID" + button.id);
                    comboDispatcher(button,mt);
                }
                if (parseInt(combo_button[0].button_type_2) == parseInt(button.id)) {
                    log("result comboManager= Localizado Combo 2 com ID" + button.id);
                    comboDispatcher(button,mt);
                }
                if (parseInt(combo_button[0].button_type_3) == parseInt(button.id)) {
                    log("result comboManager= Localizado Combo 3 com ID" + button.id);
                    comboDispatcher(button,mt);
                }
                if (parseInt(combo_button[0].button_type_4) == parseInt(button.id)) {
                    log("result comboManager= Localizado Combo 4 com ID" + button.id);
                    comboDispatcher(button,mt);
                }
            })
            //conn.send(JSON.stringify({ api: "user", mt: "SelectMessageSuccess", result: JSON.stringify(data, null, 4) }));

        })
        .onerror(function (error, errorText, dbErrorCode) {
            //conn.send(JSON.stringify({ api: "user", mt: "MessageError", result: String(errorText) }));
        });
    
    

}
//ok
function comboDispatcher(button, mt) {
    log("danilo-req comboDispatcher:" + String(button));
    switch (button.button_type) {
        case "video":
            connectionsUser.forEach(function (conn) {
                //var ws = conn.ws;
                log("danilo-req comboDispatcher:video conn.sip " + String(conn.sip));
                log("danilo-req comboDispatcher:video button.button_user " + String(button.button_user));
                if (String(conn.sip) == String(button.button_user)) {
                    conn.send(JSON.stringify({ api: "user", mt: "VideoRequest", alarm: button.button_prt }));
                }
            });
            break;
        case "alarm":
            connectionsUser.forEach(function (conn) {
                //var ws = conn.ws;
                log("danilo-req comboDispatcher:alarm conn.sip " + String(conn.sip));
                log("danilo-req comboDispatcher:alarm button.button_user " + String(button.button_user));
                if (String(conn.sip) == String(button.button_user)) {
                    callNovaAlert(parseInt(button.button_prt), conn.sip);
                    conn.send(JSON.stringify({ api: "user", mt: "AlarmSuccessTrigged", value: button.button_prt }));
                }
            });
            break;
        case "number":
            var foundConnectionUser = connectionsUser.filter(function (conn) { return conn.sip === button.button_user });
            log("danilo-req:comboDispatcher:found ConnectionUser for user Name " + foundConnectionUser.dn);
            var foundCall = calls.filter(function (call) { return call.sip === button.button_user });
            log("danilo-req:comboDispatcher:found call " + JSON.stringify(foundCall));
            if (!foundCall) {
                log("danilo-req:comboDispatcher:found call for user " + foundCall.sip);
                RCC.forEach(function (rcc) {
                    var temp = rcc[String(foundConnectionUser.sip)];
                    if (temp != null) {
                        user = temp;
                        log("danilo-req:comboDispatcher:will call callRCC for user " + user + " Nome " + foundConnectionUser.dn);
                        callRCC(rcc, user, "UserCall", button.button_prt_user, foundConnectionUser.sip + "," + rcc.pbx);
                    }
                })
            } else {
                RCC.forEach(function (rcc) {
                    var temp = rcc[String(foundConnectionUser.sip)];
                    log("danilo req:comboDispatcher:number call.sip == conn.sip:temp " + temp);
                    if (temp != null) {
                        user = temp;
                        log("danilo-req:comboDispatcher:will call callRCC for user " + user + " Nome " + foundConnectionUser.dn);
                        callRCC(rcc, user, "UserClear", button.button_prt_user, foundConnectionUser.sip + "," + rcc.pbx);
                    }
                })
            }

            //connectionsUser.forEach(function (conn) {
            //    //var ws = conn.ws;
            //    log("danilo-req comboDispatcher:number conn.sip " + String(conn.sip));
            //    log("danilo-req comboDispatcher:number button.button_user " + String(button.button_user));
            //    if (String(conn.sip) == String(button.button_user)) {
            //        var foundCall = false;
            //        calls.forEach(function (call) {
            //            log("danilo req:TriggerCall call.sip == " + call.sip);
            //            if (call.sip == conn.sip) {
            //                foundCall = true;
            //                //callRCC(connectionsRCC[0].ws, conn.cn, "UserClear", obj.prt, conn.sip);
            //            }
            //        })
            //        if (!foundCall) {
            //            RCC.forEach(function (rcc) {
            //                var temp = rcc[String(conn.sip)];
            //                if (temp != null) {
            //                    user = temp;
            //                    log("danilo-req:comboDispatcher:will call callRCC for user " + user);
            //                    callRCC(rcc, user, "UserCall", button.button_prt_user, conn.sip + "," + rcc.pbx);
            //                }
            //            })
            //        } else {
            //            RCC.forEach(function (rcc) {
            //                var temp = rcc[String(conn.sip)];
            //                log("danilo req:comboDispatcher:number call.sip == conn.sip:temp " + temp);
            //                if (temp != null) {
            //                    user = temp;
            //                    log("danilo-req:comboDispatcher:will call callRCC for user " + user);
            //                    callRCC(rcc, user, "UserClear", button.button_prt_user, conn.sip + "," + rcc.pbx);
            //                }
            //            })
            //        }

                    //if (mt == "StopCombo") {
                    //    callRCC(conn, conn.ws.cn, "UserClear", button.button_prt_user, conn.ws.sip);
                    //} else {
                    //    callRCC(conn, conn.ws.cn, "UserCall", button.button_prt_user, conn.ws.sip);
                    //}
                    
              //  }
            //});
            break;
        case "queue":
            var foundConnectionUser = connectionsUser.filter(function (conn) { return conn.sip === button.button_user });
            log("danilo-req:comboDispatcher:found ConnectionUser for user Name " + foundConnectionUser.dn);
            var foundCall = calls.filter(function (call) { return call.sip === button.button_user });
            log("danilo-req:comboDispatcher:found call " + JSON.stringify(foundCall));
            if (!foundCall) {
                log("danilo-req:comboDispatcher:found call for user " + foundCall.sip);
                RCC.forEach(function (rcc) {
                    var temp = rcc[String(foundConnectionUser.sip)];
                    if (temp != null) {
                        user = temp;
                        log("danilo-req:comboDispatcher:will call callRCC for user " + user + " Nome " + foundConnectionUser.dn);
                        callRCC(rcc, user, "UserCall", button.button_prt_user, foundConnectionUser.sip + "," + rcc.pbx);
                    }
                })
            } else {
                RCC.forEach(function (rcc) {
                    var temp = rcc[String(foundConnectionUser.sip)];
                    log("danilo req:comboDispatcher:number call.sip == conn.sip:temp " + temp);
                    if (temp != null) {
                        user = temp;
                        log("danilo-req:comboDispatcher:will call callRCC for user " + user + " Nome " + foundConnectionUser.dn);
                        callRCC(rcc, user, "UserClear", button.button_prt_user, foundConnectionUser.sip + "," + rcc.pbx);
                    }
                })
            }
            //connectionsApp.forEach(function (conn) {
            //    var ws = conn.ws;
            //    log("danilo-req comboDispatcher:queue conn.sip " + String(conn.ws.sip));
            //    log("danilo-req comboDispatcher:queue button.button_user " + String(button.button_user));
            //    if (String(conn.ws.sip) == String(button.button_user)) {
            //        if (mt == "StopCombo") {
            //            callRCC(connectionsRCC[0].ws, conn.ws.cn, "UserClear", button.button_prt_user, conn.ws.sip);
            //        } else {
            //            callRCC(connectionsRCC[0].ws, conn.ws.cn, "UserCall", button.button_prt_user, conn.ws.sip);
            //        }
                    
            //    }
            //});
            break;
        case "page":
            connectionsUser.forEach(function (conn) {
                //var ws = conn.ws;
                log("danilo-req comboDispatcher:page conn.sip " + String(conn.sip));
                log("danilo-req comboDispatcher:page button.button_user " + String(button.button_user));
                if (String(conn.sip) == String(button.button_user)) {
                    conn.send(JSON.stringify({ api: "user", mt: "PageRequest", alarm: button.button_prt }));
                }
            });
            break;
    }
}


