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
            if (obj.mt === "CountZero") {
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
