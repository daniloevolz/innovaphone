var count = 0;
var sendCallHistory = Config.sendCallHistory;
var sendCallEvents = Config.sendCallEvents;
var urlPhoneApiEvents = Config.urlPhoneApiEvents;
var urlCallHistory = Config.urlCallHistory;
Config.onchanged(function () {
    sendCallHistory = Config.sendCallHistory;
    sendCallEvents = Config.sendCallEvents;
    urlPhoneApiEvents = Config.urlPhoneApiEvents;
    urlCallHistory = Config.urlCallHistory;
});

var connectionsUser = [];
new JsonApi("user").onconnected(function (conn) {
    connectionsUser.push(conn);

    if (conn.app == "wecom-wecall") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "PhoneApiEvent") {
                if (sendCallEvents == "true") {
                    httpClient(urlPhoneApiEvents, obj.obj);
                }
            }
            if (obj.mt == "CallHistoryEvent") {
                if (sendCallHistory == "true") {
                    httpClient(urlCallHistory, obj.obj);
                }
            }
            if (obj.mt == "UserMessage") {
                var url = Config.url;
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

new JsonApi("admin").onconnected(function(conn) {
    if (conn.app == "wecom-wecalladmin") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AdminMessage") {
                var urladmin = Config.urladmin;
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: urladmin }));
            }
            if (obj.mt == "AddMessage") {
                Config.urladmin = obj.url;
                Config.save();
                var urladmin = Config.urladmin;
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: urladmin }));
            }
        });
    }
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


var connectionsPbxSignal = [];
new PbxApi("PbxSignal").onconnected(function (conn) {
    log("PbxSignal: connected");

    // for each PBX API connection an own call array is maintained
    var calls = [];
    var sip = [];
    connectionsPbxSignal.push({ ws: conn, calls: calls, sip: sip });

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

            // connect call
            conn.send(JSON.stringify({ "mt": "Signaling", "api": "PbxSignal", "call": obj.call, "sig": { "type": "conn" } }));

            // add callid to the array for calls for this connection
            connectionsPbxSignal.filter(function (v) { return v.ws === conn })[0].calls.push(obj.call);
            connectionsPbxSignal.filter(function (v) { return v.ws === conn })[0].sip.push(obj.sig.cg.sip);

            // send notification with badge count first time the user has connected
            updateBadge(conn, obj.call, count);
        }

        // handle incoming call release messages
        if (obj.mt === "Signaling" && obj.sig.type === "rel") {
            // remove callid from the array for calls for this connection
            calls.splice(calls.indexOf(obj.call), 1);
        }
    });

    conn.onclose(function () {
        log("PbxSignal: disconnected");
        connectionsPbxSignal.splice(connectionsPbxSignal.indexOf(conn), 1);
    });
});


function updateBadge(ws, callid, count) {
    var msg = {
        "api": "PbxSignal", "mt": "Signaling", "call": callid, "src": "badge",
        "sig": {
            "type": "facility",
            "fty": [{ "type": "presence_notify", "status": "open", "note": "#badge:" + count, "contact": "app:" }]
        }
    };

    ws.send(JSON.stringify(msg));
}

// the variable containing the string value
var baseUrl = WebServer.url;
log("url: " + baseUrl);

WebServer.onurlchanged(function (newUrl) {
    baseUrl = newUrl;
    log("url: " + baseUrl);
});


WebServer.onrequest("makecall", function (req) {
    if (req.method == "POST") {
        req.onrecv(function (req, data) {
            var obj = JSON.parse((new TextDecoder("utf-8").decode(data)));
            log("danilo-req makecall:data " + (new TextDecoder("utf-8").decode(data)));
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
            //req.recv();
        });
        req.sendResponse(200);
    }
    else {
        req.cancel();
    }
});
WebServer.onrequest("disconnectcall", function (req) {
    if (req.method == "POST") {
        req.onrecv(function (req, data) {
            var obj = JSON.parse((new TextDecoder("utf-8").decode(data)));
            log("danilo-req disconnectcall:data " + (new TextDecoder("utf-8").decode(data)));
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
            req.recv();
        });
        req.sendResponse(200);
    }
    else {
        req.cancel();
    }
});
WebServer.onrequest("badge", function (req) {
    if (req.method == "POST") {
        req.onrecv(function (req, data) {
            var obj = JSON.parse((new TextDecoder("utf-8").decode(data)));
            log("danilo-req badge:data " + (new TextDecoder("utf-8").decode(data)));
            log("danilo-req badge:user " + obj.user);
            log("danilo-req badge:num " + obj.num);
            connectionsPbxSignal.forEach(function (connection) {
                log("danilo-req badge:connection " + JSON.stringify(connection));
                //var jsonConns = JSON.parse(connection);
                var sipConns = connection.sip;
                var index = sipConns.indexOf(obj.user);
                log("danilo-req badge:index of user " + String(index));

                if (String(obj.user) == String(connection.sip[index])) {
                    log("danilo-req badge:call sip " + connection.calls[index]);
                    updateBadge(connection.ws, connection.calls[index], obj.num);
                } else {
                    log("danilo-req badge:connection NOT user ");
                }
            });
            req.responseContentType("application/json")
                .sendResponse()
                .onsend(function (req) {
                    req.send(new TextEncoder("utf-8").encode("OK"), true);
                });
            req.oncomplete(function (req, success) {
                log("HttpRequest complete");
            });
        });

    }
    else {
        req.cancel();
    }
});

function httpClient(url, call) {
    var req = HttpClient.request("POST", url);
    var req = HttpClient.timeout(30000);
    req.header("X-Token", "danilo");
    req.contentType("application/json");
    req.onsend(function (req) {
        req.send(new TextEncoder("utf-8").encode(JSON.Stringfy(call)), true);
    });
    req.onrecv(function (req, data, last) {
        if (!last) req.recv();
    });
    req.oncomplete(function (req, success) {
        log("HttpRequest complete");
    })
        .onerror(function (error) {
            log("HttpRequest error=" + error);
        });
}