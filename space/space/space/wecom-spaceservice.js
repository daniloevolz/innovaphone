
new JsonApi("user").onconnected(function(conn) {
    if (conn.app == "wecom-space") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "UserMessage") {
                conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", src: obj.src }));
            }
        });
    }
});

new JsonApi("admin").onconnected(function(conn) {
    if (conn.app == "wecom-spaceadmin") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AdminMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: obj.src }));
            }
        });
    }
});
new JsonApi("restaurante").onconnected(function (conn) {
    if (conn.app == "wecom-restaurante") {
        conn.send(JSON.stringify({ api: "restaurante", mt: "SelectMessageResult" }));
        conn.onmessage(function (msg) {
            var obj = JSON.parse(msg);

            if (obj.mt == "SelectMessage") {
                conn.send(JSON.stringify({ api: "restaurante", mt: "SelectMessageResult" }));
                Database.exec(obj.exe)
                    .oncomplete(function (data) {
                        log("result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "restaurante", mt: "SelectMessageResultSuccess", day: obj.day, result: JSON.stringify(data, null, 4) }));

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "restaurante", mt: "MessageError", result: String(errorText) }));
                    });
            }
        });
        conn.messageComplete();
    }
    if (conn.app == "wecom-restauranteadmin") {
        conn.send(JSON.stringify({ api: "restaurante", mt: "SelectMessageResult" }));
        conn.onmessage(function (msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AddMessage") {
                Database.insert(obj.exe)
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "restaurante", mt: "InsertMessageSucess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "restaurante", mt: "MessageError", result: String(error) }));
                    });

            }
            if (obj.mt == "SelectMessage") {
                conn.send(JSON.stringify({ api: "restaurante", mt: "SelectMessageResult" }));
                Database.exec(obj.exe)
                    .oncomplete(function (data) {
                        log("result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "restaurante", mt: "SelectMessageResultSuccess", day: obj.day, result: JSON.stringify(data, null, 4) }));

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "restaurante", mt: "MessageError", result: String(errorText) }));
                    });
            }
            if (obj.mt == "DeleteMessage") {
                conn.send(JSON.stringify({ api: "restaurante", mt: "DeleteMessageResult" }));
                Database.exec("DELETE FROM cardapio_restaurante WHERE dia ='" + obj.day + "';")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "restaurante", mt: "DeleteMessageResultSuccess", day: obj.day }));

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "restaurante", mt: "MessageError", result: String(errorText) }));
                    });
            }
        });
        conn.messageComplete();
    }
});

// the variable containing the string value
var value = null;
var baseUrl = WebServer.url;
log("url: " + baseUrl);

WebServer.onurlchanged(function (newUrl) {
    baseUrl = newUrl;
    log("url: " + baseUrl);
});


WebServer.onrequest("value", function (req) {
    log("danilo-req: " + req);
    log("danilo-req: " + value);
    
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
    else if (req.method == "DELETE") {
        // delete value
        value = null;
        req.sendResponse();
    }
    else {
        req.cancel();
    }
});