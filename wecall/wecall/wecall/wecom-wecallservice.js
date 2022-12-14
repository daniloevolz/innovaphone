

// the variables
var baseUrl = WebServer.url;
log("danilo req url: " + baseUrl);
var count = 0;
var sendCallHistory = Config.sendCallHistory;
var sendCallEvents = Config.sendCallEvents;
var urlPhoneApiEvents = Config.urlPhoneApiEvents;
var urlCallHistory = Config.urlCallHistory;
var urlDashboard = Config.urldash;
var codClient = Config.CodClient;
var url = Config.url;
var urlSSO = Config.urlSSO;
var urlGetGroups = Config.urlGetGroups;

var connectionsUser = [];
var connectionsPbxSignal = [];
var connectionsRCC = [];


var connections = [];
var calls = [];

var queues = [];


//Services APIS
Config.onchanged(function () {
    sendCallHistory = Config.sendCallHistory;
    sendCallEvents = Config.sendCallEvents;
    urlPhoneApiEvents = Config.urlPhoneApiEvents;
    urlCallHistory = Config.urlCallHistory;
    urlDashboard = Config.urldash;
    urlSSO = Config.urlSSO;
    codClient = Config.CodClient;
    url = Config.url;
    urlGetGroups = Config.urlGetGroups;

    updateConfigUsers();
});


WebServer.onurlchanged(function (newUrl) {
    baseUrl = newUrl;
    log("danilo req urlchaged: " + baseUrl);
});

WebServer.onrequest("makecall", function (req) {
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
                makecallRequest(value);
            }
        });
    }
    else {
        req.cancel();
    }
});
WebServer.onrequest("disconnectcall", function (req) {
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
                disconnectRequest(value);
            }
        });
    }
    else {
        req.cancel();
    }
});
WebServer.onrequest("badge", function (req) {
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
                badgeRequest2(value);
            }
        });
    }
    else {
        req.cancel();
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
                rccRequest(value);
            }
        });
    }
    else {
        req.cancel();
    }
});
WebServer.onrequest("value", function (req) {
    if (req.method == "GET") {
        var valueteste = "Danilo is the big dev from Wecom..";
        if (valueteste) {
            // value exists, send it back as text/plain
            req.responseContentType("txt")
                .sendResponse()
                .onsend(function (req) {
                    req.send(new TextEncoder("utf-8").encode(valueteste), true);
                });
        }
        else {
            // value does not exist, send 404 Not Found
            req.cancel();
        }
    }
});

//JSON APIS

new JsonApi("user").onconnected(function (conn) {
    connectionsUser.push(conn);
    log("danilo req : user connection " + JSON.stringify(conn));
    if (conn.app == "wecom-wecall") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            log("danilo-req : wecom-wecall");
            //if (obj.mt == "PhoneApiEvent") {
            //    log("danilo-req : PhoneApiEvent");
            //    if (sendCallEvents) {
            //        log("danilo-req : PhoneApiEvent=true");
            //        httpClient(urlPhoneApiEvents, obj.obj);
            //    }
            //}
            if (obj.mt == "CallHistoryEvent") {
                log("danilo-req : CallHistoryEvent");
                if (sendCallHistory) {
                    log("danilo-req : CallHistoryEvent=true");
                    httpClient(urlCallHistory, obj.obj);
                }
            }
            if (obj.mt == "UserMessage") {
                var url = Config.url;
                var urlAlt = "";
                log("danilo req : UserMessage sip " + conn.sip);

                connections.forEach(function (connection) {
                    if (connection.sip == conn.sip) {
                        urlAlt = connection.url;
                    }
                })
                log("danilo req : UserMessage urlLogin " + urlAlt);
                if (urlAlt !== "") {
                    var url = url + conn.sip + "/" + urlAlt;
                    log("danilo req : UserMessage url " + url);
             
                }
                conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", src: url }));
            }
            if (obj.mt == "AddMessage") {
                Config.url = obj.url;
                Config.save();
                var url = Config.url;
                conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", src: url }));
            }
        });
    }
    conn.onclose(function () {
        log("User: disconnected");
        connectionsUser.splice(connectionsUser.indexOf(conn), 1);
    });
});
new JsonApi("admin").onconnected(function (conn) {
    connectionsUser.push(conn);
    if (conn.app == "wecom-wecalladmin") {
        log("danilo-req AdminMessage:wecom-wecalladmin");
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AdminMessage") {
                log("danilo-req AdminMessage:");
                updateConfigUsers();
            }
            if (obj.mt == "AddMessage") {
                Config.urladmin = obj.url;
                Config.save();
                var urladmin = Config.urladmin;
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: urladmin }));
            }
            if (obj.mt == "UpdateConfig") {
                log("danilo-req UpdateConfig:");
                if (obj.prt == "urlPhoneApiEvents") {
                    Config.urlPhoneApiEvents = obj.vl;
                    Config.save();
                }
                if (obj.prt == "urlCallHistory") {
                    Config.urlCallHistory = obj.vl;
                    Config.save();
                }
                if (obj.prt == "sendCallHistory") {
                    Config.sendCallHistory = obj.vl;
                    Config.save();
                }
                if (obj.prt == "sendCallEvents") {
                    Config.sendCallEvents = obj.vl;
                    Config.save();
                }
                if (obj.prt == "urlDashboard") {
                    Config.urldash = obj.vl;
                    Config.save();
                }
                if (obj.prt == "urlSSO") {
                    Config.urlSSO = obj.vl;
                    Config.save();
                }
                if (obj.prt == "CodClient") {
                    Config.CodClient = obj.vl;
                    Config.save();
                }
                if (obj.prt == "Url") {
                    Config.url = obj.vl;
                    Config.save();
                }
                if (obj.prt == "UrlG") {
                    Config.urlGetGroups = obj.vl;
                    Config.save();
                }
            }
        });
    }
    conn.onclose(function () {
        log("UserAdmin: disconnected");
        connectionsUser.splice(connectionsUser.indexOf(conn), 1);
    });
});
new JsonApi("dash").onconnected(function (conn) {
    if (conn.app == "wecom-wecalldash") {
        conn.onmessage(function (msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "DashMessage") {
                var urldash = Config.urldash;
                conn.send(JSON.stringify({ api: "dash", mt: "DashMessageResult", src: urldash }));
            }
            if (obj.mt == "AddMessage") {
                Config.urldash = obj.url;
                Config.save();
                var urldash = Config.urldash;
                conn.send(JSON.stringify({ api: "dash", mt: "DashMessageResult", src: urldash }));
            }
        });
    }
});


//PBX APIS

new PbxApi("PbxSignal").onconnected(function (conn) {
    log("PbxSignal: connected");

    // for each PBX API connection an own call array is maintained

    connectionsPbxSignal.push({ ws: conn});
    // register to the PBX in order to acceppt incoming presence calls
    conn.send(JSON.stringify({ "api": "PbxSignal", "mt": "Register", "flags": "NO_MEDIA_CALL" }));

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
            log("danilo req : PBXSignal::connectionsPbxSignal: " + JSON.stringify(connectionsPbxSignal));

            // connect call
            conn.send(JSON.stringify({ "mt": "Signaling", "api": "PbxSignal", "call": obj.call, "sig": { "type": "conn" } }));

            //Adiciona
            log("PBXSignal: connections before add " + JSON.stringify(connections));
            connections.push({ sip: obj.sig.cg.sip, call: obj.call, name: obj.sig.fty[1].name, user: "", url:"" });
            log("PBXSignal: connections after add " + JSON.stringify(connections));

            callRCC(connectionsRCC[0].ws, obj.sig.fty[1].name, "UserInitialize", "", obj.sig.cg.sip);

            getURLLogin(obj.sig.cg.sip);

            // send notification with badge count first time the user has connected
            updateBadge(conn, obj.call, count);
        }

        // handle incoming call release messages
        if (obj.mt === "Signaling" && obj.sig.type === "rel") {
            // remove callid from the array for calls for this connection
            calls.splice(calls.indexOf(obj.call), 1);

            //Remove
            log("PBXSignal: connections result " + JSON.stringify(connections));
            connections = connections.filter(delConnectionsByCall(obj.call));
            log("PBXSignal: connections result " + JSON.stringify(connections));

        }
    });

    conn.onclose(function () {
        log("PbxSignal: disconnected");
        connectionsPbxSignal.splice(connectionsPbxSignal.indexOf(conn), 1);
    });
});

new PbxApi("RCC").onconnected(function (conn) {

    connectionsRCC.push({ ws: conn });

    getQueueGroups();

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
            //Atualiza connections 
            updateConnections(obj.src, "user", obj.user);
        }
        else if (obj.mt === "CallInfo") {

            log("danilo-req : RCC message::CallInfo for user src "+obj.src);
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
                    if (sendCallEvents) {
                        log("danilo-req : RCC message::sendCallEvents=true");
                        var e164 = obj.peer.e164;
                        if (e164 == "") {
                            var msg = { user: obj.src, callingNumber: obj.peer.h323, status: "inc" };
                        } else {
                            var msg = { user: obj.src, callingNumber: obj.peer.e164, status: "inc" };
                        }
                        httpClient(urlPhoneApiEvents, msg);
                    }
                }
            }
            if (obj.msg == "x-setup") {
                //Chamada Ativa do Ramal//
                if (String(foundCall) == "") {
                    insertCall(obj);
                    if (sendCallEvents) {
                        log("danilo-req : RCC message::sendCallEvents=true");
                        var e164 = obj.peer.e164;
                        if (e164 == "") {
                            var msg = { user: obj.src, callingNumber: obj.peer.h323, status: "out" };
                        } else {
                            var msg = { user: obj.src, callingNumber: obj.peer.e164, status: "out" };
                        }
                        httpClient(urlPhoneApiEvents, msg);
                    }
                }
            }
            if (obj.msg == "x-conn" || obj.msg == "r-conn") {
                //Chamada Ativa ou Receptiva Atendida//
                if (String(foundCall) !== "") {
                    if (sendCallEvents) {
                        log("danilo-req : RCC message::sendCallEvents=true");
                        var e164 = obj.peer.e164;
                        if (e164 == "") {
                            var msg = { user: obj.src, callingNumber: obj.peer.h323, status: "ans" };
                        } else {
                            var msg = { user: obj.src, callingNumber: obj.peer.e164, status: "ans" };
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
                    log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + obj.src);
                    calls = calls.filter(deleteCallsBySrc(obj.src));
                    log("danilo req : after deleteCall " + JSON.stringify(calls));
                    if (sendCallEvents) {
                        log("danilo-req : RCC message::sendCallEvents=true");
                        var e164 = obj.peer.e164;
                        if (e164 == "") {
                            var msg = { user: obj.src, callingNumber: obj.peer.h323, status: "del" };
                        }
                        else {
                            var msg = { user: obj.src, callingNumber: obj.peer.e164, status: "del" };
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


//Internal Functions

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

function updateConfigUsers() {
    log("danilo-req updateConfigUsers:");
    connectionsUser.forEach(function (connection) {
        log("danilo-req updateConfigUsers:connection user" + connection.guid);
        connection.send(JSON.stringify({ api: "admin", mt: "UpdateConfigResult", sH: sendCallHistory, sP: sendCallEvents, urlP: String(urlPhoneApiEvents), urlH: String(urlCallHistory), urlD: String(urlDashboard), urlSSO: String(urlSSO), CodCli: String(codClient), url: String(url), urlG: String(urlGetGroups)}));
    });
}

function badgeRequest2(value) {

    log("danilo-req badge2:value " + String(value));
    var obj = JSON.parse(value);

    obj.listuser.forEach(function (user) {
        connections.forEach(function (conn) {
            if (conn.sip == user.user) {
                updateBadge(connectionsPbxSignal[0].ws, conn.call, user.num);
            }
        })
    });
}

function disconnectRequest(value) {
    log("danilo-req disconnectcall:value " + String(value));
    var obj = JSON.parse(String(value));

    log("danilo-req disconnectcall:user " + obj.user);
    log("danilo-req disconnectcall:num " + obj.num);
    connectionsUser.forEach(function (connection) {
        if (connection.sip == obj.user) {
            log("danilo-req disconnectcall:connection user" + connection.guid);
            connection.send(JSON.stringify({ api: "user", mt: "DisconnectCall", num: obj.num }));
        }
        //connection.send(JSON.stringify({ api: "user", mt: "MakeCall", num: obj.num }));
        log("danilo-req disconnectcall:connection NOT user ");
    });
}

function rccRequest(value) {

    log("danilo-req rccRequest:value " + String(value));
    var obj = JSON.parse(String(value));

    log("danilo-req rccRequest:user " + obj.user);
    log("danilo-req rccRequest:sip " + obj.sip);
    log("danilo-req rccRequest:mode " + obj.mode);
    log("danilo-req rccRequest:num " + obj.num);

    connectionsRCC.forEach(function (connection) {
        log("danilo-req rccRequest: will callRCC ");
        callRCC(connection.ws, obj.user, obj.mode, obj.num, obj.sip);
    });

    if (obj.mode == "UserInitialize") {
        //Adiciona Initialize From WebService
        log("PBXSignal: connections before add " + JSON.stringify(connections));
        connections.push({ sip: obj.sip, call: "", name: obj.user, user: "", url: "" });
        log("PBXSignal: connections after add " + JSON.stringify(connections));
    }
}

function makecallRequest(value) {
    log("danilo-req makecall:value " + String(value));
    var obj = JSON.parse(String(value));

    log("danilo-req makecall:user " + obj.user);
    log("danilo-req makecall:num " + obj.num);

    connectionsUser.forEach(function (connection) {
        if (connection.sip == obj.user) {
            log("danilo-req makecall:connection user" + connection.guid);
            connection.send(JSON.stringify({ api: "user", mt: "MakeCall", num: obj.num }));
        }
        //connection.send(JSON.stringify({ api: "user", mt: "MakeCall", num: obj.num }));
        log("danilo-req makecall:connection NOT user ");
    });
}

function httpClient(url, call) {
    log("danilo-req : httpClient");
    var responseData = "";
    log("danilo-req : httpClient : content" +JSON.stringify(call));
    var req = HttpClient.request("PUT", url);

    req.header("X-Token", "danilo");
    req.contentType("application/json");
    req.onsend(function (req) {
        req.send(new TextEncoder("utf-8").encode(JSON.stringify(call)), true);
    });
    req.onrecv(function (req, data, last) {
        responseData += new TextDecoder("utf-8").decode(data);
        if (!last) req.recv();
    },1024);
    req.oncomplete(function (req, success) {
        log("danilo-req : HttpRequest complete");
        log("danilo-req : HttpRequest responseData "+ responseData);
    })
        .onerror(function (error) {
            log("danilo-req : HttpRequest error=" + error);
        });

}


function callRCC(ws,user,mode,num,sip) {
    if (mode == "UserInitialize") {
        var msg = { api: "RCC", mt: "UserInitialize", cn: user, src: sip };
        ws.send(JSON.stringify(msg));
    }
    else if (mode == "Device") {
        var msg = { api: "RCC", mt: "Devices", cn: user, src: sip };
        ws.send(JSON.stringify(msg));
    }
    else if (mode == "UserCall") {
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
    else if (mode == "UserClear") {
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
                var msg = { api: "RCC", mt: "UserHold", call: call.callid, remote:true, src: call.sip };
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

function insertCall(obj) {
    var e164 = obj.peer.e164;
    if (e164 == "") {
        calls.push({ sip: String(obj.src), callid: obj.call, num: obj.peer.h323 });
    } else {
        calls.push({ sip: String(obj.src), callid: obj.call, num: obj.peer.e164 });
    }
    log("danilo req : insertCall " + JSON.stringify(calls));
}
function deleteCall(obj) {
    log("danilo req : before deleteCall " + JSON.stringify(calls),"Obj.call "+obj.src);
    calls.splice(calls.indexOf(obj.src), 1);
    log("danilo req : after deleteCall " + JSON.stringify(calls));
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

function getURLLogin(sip) {

    var msg = { user: sip, client: codClient };
    log("danilo req : getURLLogin url" + urlSSO);
    log("danilo req : getURLLogin msg" + JSON.stringify(msg));

    var responseData = "";
    var req = HttpClient.request("POST", urlSSO);
    req.header("X-Token", "danilo");
    req.contentType("application/json");
    req.onsend(function (req) {
        req.send(new TextEncoder("utf-8").encode(JSON.stringify(msg)), true);
    });
    req.onrecv(function (req, data, last) {
        responseData += new TextDecoder("utf-8").decode(data);
        if (!last) req.recv();
    }, 1024);
    req.oncomplete(function (req, success) {
        log("danilo-req : getURLLogin complete");
        log("danilo-req : getURLLogin responseData " + responseData);

        var obj = JSON.parse(responseData);
        if (obj.status == "success") {
            //Atualiza connections 
            updateConnections(sip, "url", obj.token);

        } else {
            log("danilo req : getLoginResponse " + obj.msg);
        }
    })
        .onerror(function (error) {
            log("danilo-req : getURLLogin error=" + error);
        });

}

function getQueueGroups() {

    var msg = { user: "", client: "" };
    log("danilo req : getGroups url" + urlGetGroups);
    log("danilo req : getGroups msg" + JSON.stringify(msg));

    var responseData = "";
    var req = HttpClient.request("POST", urlGetGroups);
    req.header("X-Token", "danilo");
    req.contentType("application/json");
    req.onsend(function (req) {
        req.send(new TextEncoder("utf-8").encode(JSON.stringify(msg)), true);
    });
    req.onrecv(function (req, data, last) {
        responseData += new TextDecoder("utf-8").decode(data);
        if (!last) req.recv();
    }, 1024);
    req.oncomplete(function (req, success) {
        log("danilo-req : getGroups complete");
        log("danilo-req : getGroups responseData " + responseData);

        var obj = JSON.parse(responseData);
        if (obj.status == "success") {
            //Atualiza connections 
            initializeQueues(obj.msg);

        } else {
            log("danilo req : getGroupsResponse " + obj.msg);
        }
    })
        .onerror(function (error) {
            log("danilo-req : getGroups error=" + error);
        });

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

function initializeQueues(msg) {
    log("danilo-req : initializeQueues:: queues");
    queues = msg.split(",");
    queues.forEach(function (q) {
        log("danilo-req : initializeQueues:: queue: "+ q);
        callRCC(connectionsRCC[0].ws, q, "UserInitialize", "", q);
    })
}

