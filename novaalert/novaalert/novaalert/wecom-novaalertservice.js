
var urlalert = Config.urlalert;
var urlPhoneApiEvents = Config.urlPhoneApiEvents;
var sendCallEvents = Config.sendCallEvents;

var connectionsRCC = [];
var connectionsApp = [];
var connections = [];
var calls = [];

Config.onchanged(function(){
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
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "UserMessage") {
                conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", urlalert:urlalert }));
            }
            if (obj.mt == "TriggerAlert") {
                callNovaAlert(parseInt(obj.prt), conn.sip);
            }
            if (obj.mt == "TriggerCall") {
                callRCC(connectionsRCC[0].ws,conn.cn,"UserCall", parseInt(obj.prt), conn.sip);
            }
            if (obj.mt == "SelectMessage") {
                conn.send(JSON.stringify({ api: "user", mt: "SelectMessageResult" }));
                Database.exec("SELECT * FROM list_buttons WHERE button_user = '" + conn.sip+"'")
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
new JsonApi("admin").onconnected(function(conn) {
    if (conn.app == "wecom-novaalertadmin") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AdminMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: obj.src, urlalert:urlalert}));
            }
            if (obj.mt == "UpdateConfig") {
                if(obj.prt == "urlalert"){
                    Config.urlalert = obj.vl;
                    Config.save();
                }
            }
            if (obj.mt == "InsertMessage") {
                Database.insert("INSERT INTO list_buttons (button_name, button_prt, button_user, button_type) VALUES ('" + String(obj.name) + "','" + String(obj.value) + "','" + String(obj.sip) + "','" + String(obj.type) + "')")
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
        });
    }
});

new PbxApi("RCC").onconnected(function (conn) {

    log("danilo req : RCC message:: connected " + JSON.stringify(conn));
    connectionsRCC.push({ ws: conn });

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
                //Chamada Receptiva do Ramal ou Grupo????
                if (String(foundCall) == "") {
                    insertCall(obj);
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
                //Chamada Ativa do Ramal????
                if (String(foundCall) == "") {
                    insertCall(obj);
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
                if (String(foundCall) == "") {
                    insertCall(obj);
                    if (sendCallEvents) {
                        log("danilo-req : RCC message::sendCallEvents=true");
                        var e164 = obj.peer.e164;
                        if (e164 == "") {
                            var msg = { user: obj.src, callingNumber: obj.peer.h323, queue: obj.no[0].e164, call: obj.call, status: "inc" };
                        } else {
                            var msg = { user: obj.src, callingNumber: obj.peer.e164, queue: obj.no[0].e164, call: obj.call, status: "inc" };
                        }
                        httpClient(urlPhoneApiEvents, msg);
                    }
                }
            }
            if (obj.msg == "del") {
                //Chamada Desconectada
                if (String(foundCall) !== "") {
                    //Remove
                    log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + obj.src);
                    calls = calls.filter(deleteCallsBySrc(obj.src));
                    log("danilo req : after deleteCall " + JSON.stringify(calls));
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
function updateConnections(sip, prt, value) {

    connections.forEach(function (conn) {
        if (conn.sip == sip) {
            switch (prt) {
                case "name": {
                    conn.name = value
                    break
                }
                case "call": {
                    conn.call = value
                    break
                }
                case "user": {
                    conn.user = value
                    break
                }
                case "url": {
                    conn.url = value
                    break
                }
            }

        }
    })
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

    log("danilo-req alarmReceived:value " + String(value));
    //var obj = JSON.parse(String(value));
    connectionsApp.forEach(function (connection) {
        var ws = connection.ws;
        log("danilo-req alarmReceived: will send "+JSON.stringify(connection));
        ws.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: value }));
    });


}
function callRCC(ws, user, mode, num, sip) {
    log("danilo-req callRCC:mode " + String(mode));
    if (String(mode) == "UserInitialize") {
        var msg = { api: "RCC", mt: "UserInitialize", cn: user, src: sip };
        ws.send(JSON.stringify(msg));
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

