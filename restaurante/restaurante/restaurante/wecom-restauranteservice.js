
new JsonApi("user").onconnected(function(conn) {
    if (conn.app == "wecom-restaurante") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "UserMessage") {
                conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", src: obj.src }));
            }
        });
    }
});

new JsonApi("admin").onconnected(function(conn) {
    if (conn.app == "wecom-restauranteadmin") {
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