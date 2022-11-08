var count = 1;


var connectionsUser = [];
new JsonApi("user").onconnected(function (conn) {
    connectionsUser.push(conn);

    if (conn.app == "wecom-wecall") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
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
            if (obj.mt === "GetCount") {
                conn.send(JSON.stringify({ api: "user", mt: "GetCountResult", count: count, src: obj.src }));
            }
            if (obj.mt === "DeleteBadge") {
                count = 0;
                conn.send(JSON.stringify({ api: "user", mt: "IncrementCountResult", count: count, src: obj.src }));

                log("Sending updates via Presence Signalling");
                connectionsPbxSignal.forEach(function (connection) {
                    connection.calls.forEach(function (call) {
                        updateBadge(connection.ws, call, count);
                    });
                });

                log("Sending updates via WS");
                connectionsUser.forEach(function (connection) {
                    connection.send(JSON.stringify({ api: "user", mt: "UpdateCount", count: count }));
                });
            }
            if (obj.mt === "IncrementCount") {
                count++;
                conn.send(JSON.stringify({ api: "user", mt: "IncrementCountResult", count: count, src: obj.src }));

                log("Sending updates via Presence Signalling");
                connectionsPbxSignal.forEach(function (connection) {
                    connection.calls.forEach(function (call) {
                        updateBadge(connection.ws, call, count);
                    });
                });

                log("Sending updates via WS");
                connectionsUser.forEach(function (connection) {
                    connection.send(JSON.stringify({ api: "user", mt: "UpdateCount", count: count }));
                });
            }
        });
    }
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
    connectionsPbxSignal.push({ ws: conn, calls: calls });

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
var value = null;
var baseUrl = WebServer.url;
log("url: " + baseUrl);

WebServer.onurlchanged(function (newUrl) {
    baseUrl = newUrl;
    log("url: " + baseUrl);
});


WebServer.onrequest("makecall", function (req) {
    log("danilo-req makecall1: " + req);

    if (req.method == "GET") {
        if (value) {
            // value exists, send it back as text/plain
            req.responseContentType("txt")
                .sendResponse()
                .onsend(function (req) {
                    req.send(new TextEncoder("utf-8").encode(value), true);
                });
        }
        else {
            // value does not exist, send 404 Not Found
            req.cancel();
        }

    }
    else if (req.method == "PUT") {
        // overwrite existing value with newValue

        var newValue = "";
        req.onrecv(function (req, data) {
            log("danilo-req: " + data);
            if (data) {
                newValue += (new TextDecoder("utf-8").decode(data));
                req.recv();
            }
            else {
                value = newValue;
                req.sendResponse();
            }
        });
    }
    else if (req.method == "POST") {
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
                log("danilo-req makecall:connection NOT user " );
            });
            req.recv();
        });
        req.sendResponse(200);
    }
    else {
        req.cancel();
    }
});
WebServer.onrequest("disconnectcall", function (req) {
    log("danilo-req disconnectcall1: " + req);
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
WebServer.onrequest("incrementbadge", function (req) {
    log("danilo-req incrementbadge1: " + req);
    if (req.method == "POST") {
        req.onrecv(function (req, data) {
            var obj = JSON.parse((new TextDecoder("utf-8").decode(data)));
            log("danilo-req incrementbadge:data " + (new TextDecoder("utf-8").decode(data)));
            log("danilo-req incrementbadge:user " + obj.user);
            log("danilo-req incrementbadge:num " + obj.num);

            connectionsUser.forEach(function (connection) {
                if (connection.sip == obj.user) {
                    log("danilo-req incrementbadge:connection user" + connection.guid);
                    connection.send(JSON.stringify({ api: "user", mt: "IncrementBadge", num: obj.num }));
                }
                //connection.send(JSON.stringify({ api: "user", mt: "MakeCall", num: obj.num }));
                log("danilo-req incrementbadge:connection NOT user ");
            });
            req.recv();
        });
        req.sendResponse(200);
    }
    else {
        req.cancel();
    }
});
