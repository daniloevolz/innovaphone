
new JsonApi("user").onconnected(function(conn) {
    if (conn.app == "wecom-mural") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "Ping") {
                conn.send(JSON.stringify({ api: "user", mt: "Pong", src: obj.src }));
            }
        });
    }
});

new JsonApi("admin").onconnected(function(conn) {
    if (conn.app == "wecom-muraladmin") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AdminMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: obj.src }));
            }
        });
    }
});
