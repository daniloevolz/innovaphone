var count = 0;
var sendCallHistory = Config.sendCallHistory;
var sendCallEvents = Config.sendCallEvents;
var urlPhoneApiEvents = Config.urlPhoneApiEvents;
var urlCallHistory = Config.urlCallHistory;
var urlDashboard = Config.urldash;
Config.onchanged(function () {
    sendCallHistory = Config.sendCallHistory;
    sendCallEvents = Config.sendCallEvents;
    urlPhoneApiEvents = Config.urlPhoneApiEvents;
    urlCallHistory = Config.urlCallHistory;
    urlDashboard = Config.urldash;

    updateConfigUsers();
});

var connectionsUser = [];

new JsonApi("user").onconnected(function (conn) {
    connectionsUser.push(conn);

    if (conn.app == "wecom-wecall") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            log("danilo-req : wecom-wecall");
            if (obj.mt == "PhoneApiEvent") {
                log("danilo-req : PhoneApiEvent");
                if (sendCallEvents) {
                    httpClient(urlPhoneApiEvents, obj.obj);
                }
            }
            if (obj.mt == "CallHistoryEvent") {
                log("danilo-req : CallHistoryEvent");
                if (sendCallHistory) {
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

function updateConfigUsers() {
    log("danilo-req updateConfigUsers:");
    connectionsUser.forEach(function (connection) {
        log("danilo-req updateConfigUsers:connection user" + connection.guid);
        connection.send(JSON.stringify({ api: "admin", mt: "UpdateConfigResult", sH: sendCallHistory, sP: sendCallEvents, urlP: String(urlPhoneApiEvents), urlH: String(urlCallHistory), urlD: String(urlDashboard)}));
    });
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
                badgeRequest(value);
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

function badgeRequest(value) {

    log("danilo-req badge:value " + String(value));
    var obj = JSON.parse(String(value));
    //log("danilo-req badge:data " + (new TextDecoder("utf-8").decode(data)));
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
    
    var req = HttpClient.request("POST", url);

    req.header("X-Token", "danilo");
    req.contentType("application/json");
    req.onsend(function (req) {
        req.send(new TextEncoder("utf-8").encode(JSON.stringify(call)), true);
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