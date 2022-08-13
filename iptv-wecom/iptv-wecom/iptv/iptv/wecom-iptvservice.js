
new JsonApi("user").onconnected(function(conn) {
    if (conn.app == "wecom-iptv") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "UserMessage") {
                conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", src: obj.src }));
            }
        });
    }
});

new JsonApi("admin").onconnected(function(conn) {
    if (conn.app == "wecom-iptvadmin") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AdminMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: obj.src }));
            }
        });
        conn.messageComplete();
    }
});
new JsonApi("channel").onconnected(function (conn) {
    if (conn.app == "wecom-iptv") {
        conn.send(JSON.stringify({ api: "channel", mt: "SelectChannelMessageResult" }));
        conn.onmessage(function (msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AddChannelMessage") {
                Database.insert("INSERT INTO channels (name, url, img) VALUES ('" + obj.name + "','" + obj.url + "','" + obj.img + "')")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "channel", mt: "InsertChannelMessageSucess"}));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "channel", mt: "ChannelMessageError", result: String(error) }));
                    });

            }
            if (obj.mt == "SelectChannelMessage") {
                conn.send(JSON.stringify({ api: "channel", mt: "SelectChannelMessageResult"}));
                Database.exec("SELECT * FROM channels")
                    .oncomplete(function (data) {
                        log("result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "channel", mt: "SelectChannelMessageResultSuccess", result: JSON.stringify(data, null, 4)}));

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "channel", mt: "ChannelMessageError", result: String(errorText)}));
                    });
            }
        });
        conn.messageComplete();
    }
});
