var pbxTableUsers = []
var RCC = [];
var monitorInitialized = false;

new PbxApi("PbxTableUsers").onconnected(function (conn) {
    log("PbxTableUsers: connected "+JSON.stringify(conn));

    // for each PBX API connection an own call array is maintained

    //connectionsPbxSignal.push({ ws: conn });
    // register to the PBX in order to acceppt incoming presence calls
    conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateStart", "add": true, "del": true, "columns": { "guid": {}, "dn": {}, "cn": {}, "h323": {}, "e164": {}, "node": {}, "grps": {}, "devices": {} },"src": conn.pbx }));

    conn.onmessage(function (msg) {

        var obj = JSON.parse(msg);


        log("PbxTableUsers: msg received " + msg);

        if (obj.mt == "ReplicateStartResult") {
            pbxTableUsers = [];
            conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateNext", "src": conn.pbx }));
        }
        if (obj.mt == "ReplicateNextResult" && obj.columns) {

            pbxTableUsers.push({ guid: obj.columns.guid, sip: obj.columns.h323, cn: obj.columns.cn, pbx: obj.src, badge: 0 });
            conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateNext", "src": conn.pbx}));

            log("PBX TABLE USERS " + JSON.stringify(pbxTableUsers))
        }

        if (obj.mt == "ReplicateAdd") {

            pbxTableUsers.push({ guid: obj.columns.guid, sip: obj.columns.h323, cn: obj.columns.cn, pbx: obj.src, badge: 0 });

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

new PbxApi("RCC").onconnected(function (conn) {
    RCC.push(conn);
    log("RCC: connected conn " + JSON.stringify(conn));
    log("RCC: connected RCC " + JSON.stringify(RCC));

    if (!monitorInitialized) {
        initializeMonitor();
        monitorInitialized = true;
    }
    
    //conn.send(JSON.stringify({ "api": "RCC", "mt": "Initialize", "limit": 50, "calls": true }));

    //conn.send(JSON.stringify({ api: "RCC", mt: "Devices", cn: "Danilo Volz" }));
    conn.onmessage(function (msg) {
        var obj = JSON.parse(msg);
        log("danilo req : RCC message:: received" + JSON.stringify(obj));

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
        }
        else if (obj.mt === "UserEndResult") {
            log("RCC: connections before delete result " + JSON.stringify(RCC));
            var src = obj.src;
            var myArray = src.split(",");
            var sip = myArray[0];
            var pbx = myArray[1];
            RCC.forEach(function (rcc) {
                if (rcc.pbx == pbx) {
                    delete rcc[sip];
                }
            })
            log("RCC: connections after delete result " + JSON.stringify(RCC));

        }
            /*
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
    
            */
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
                    log("Lista Vazia " + pbxTableUsers)
                }else{
                    conn.send(JSON.stringify({api: "admin", mt: "TableUsersResult", src: obj.src, result: JSON.stringify(pbxTableUsers,null,4) }))
                }
                
            }
            if (obj.mt == "AddRamal") {
                log("obj.data_criacao: " + obj.data_criacao);
                Database.insert("INSERT INTO tbl_ramais (sip, nome, pbx, data_criacao) VALUES ('" + obj.sip + "','" + obj.nome + "','" + obj.pbx + "','" + obj.data_criacao + "')")
                    .oncomplete(function () {
                        RCC.forEach(function (rcc) {
                            if (rcc.pbx == obj.pbx) {
                                log("initializeMonitor= calling RCC API for new ramal monitored " + String(obj.nome) + " on PBX " + rcc.pbx);
                                var msg = { api: "RCC", mt: "UserInitialize", cn: obj.nome, src: obj.sip + "," + rcc.pbx };
                                rcc.send(JSON.stringify(msg));
                            }
                        })
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
                try {
                    Database.exec("SELECT * FROM tbl_ramais WHERE id=" + obj.id + ";")
                        .oncomplete(function (data) {
                            log("DeleteRamal result=" + JSON.stringify(data, null, 4));
                            var ramal = data;
                            var sip = ramal[0].sip;
                            var pbx = ramal[0].pbx;
                            RCC.forEach(function (rcc) {
                                if (rcc.pbx == pbx) {
                                    var user = rcc[sip];
                                    log("DeleteRamal: calling RCC API to End user Monitor " + String(sip) + " on PBX " + pbx);
                                    var msg = { api: "RCC", mt: "UserEnd", user: user, src: sip + "," + pbx };
                                    rcc.send(JSON.stringify(msg));
                                }
                            })

                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            log("DeleteRamal: error "+ String(errorText));
                        });
                } finally {
                    conn.send(JSON.stringify({ api: "admin", mt: "DeleteUsersResult" }));
                    Database.exec("DELETE FROM tbl_ramais WHERE id=" + obj.id + ";")
                        .oncomplete(function () {
                            conn.send(JSON.stringify({ api: "admin", mt: "DeleteRamalSuccess" }));

                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "admin", mt: "UsersError", result: String(errorText) }));
                        });
                }
            }
        });
    }
});


function initializeMonitor() {
    log("initializeMonitor=");
    Database.exec("SELECT * FROM tbl_ramais")
        .oncomplete(function (data) {
            log("initializeMonitor= result " + JSON.stringify(data, null, 4));
            var ramais = data;
            ramais.forEach(function (r) {
                RCC.forEach(function (rcc) {
                    if (rcc.pbx == r.pbx) {
                        log("initializeMonitor= calling RCC API for new ramal monitored " + String(r.nome) + " on PBX " + rcc.pbx);
                        var msg = { api: "RCC", mt: "UserInitialize", cn: r.nome, src: r.sip + "," + rcc.pbx };
                        rcc.send(JSON.stringify(msg));
                    }
                })
            })
        })
        .onerror(function (error, errorText, dbErrorCode) {
            log("initializeMonitor error=" + String(errorText));
        });
}


   

