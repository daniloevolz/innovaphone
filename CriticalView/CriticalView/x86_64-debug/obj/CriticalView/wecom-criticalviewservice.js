
new JsonApi("user").onconnected(function(conn) {
    if (conn.app == "wecom-criticalview") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "UserMessage") {
                conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", src: obj.src }));
            }
        });
    }
});

new JsonApi("admin").onconnected(function(conn) {
    if (conn.app == "wecom-criticalviewadmin") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AdminMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: obj.src }));
            }
        });
    }
});

new JsonApi("channel").onconnected(function (conn) {
    if (conn.app == "wecom-criticalview") {
        conn.send(JSON.stringify({ api: "channel", mt: "SelectChannelMessageResult" }));
        conn.onmessage(function (msg) {
            var obj = JSON.parse(msg);
            

            if (obj.mt == "SelectChannelMessage") {
                conn.send(JSON.stringify({ api: "channel", mt: "SelectChannelMessageResult" }));
                if (conn.unlicensed) {
                    Database.exec("SELECT * FROM channels LIMIT 1")
                        .oncomplete(function (data) {
                            log("result=" + JSON.stringify(data, null, 4));
                            conn.send(JSON.stringify({ api: "channel", mt: "SelectChannelMessageResultSuccess", result: JSON.stringify(data, null, 4) }));

                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "channel", mt: "ChannelMessageError", result: String(errorText) }));
                        });
            }else{
                Database.exec("SELECT * FROM channels ORDER BY page")
                    .oncomplete(function (data) {
                        log("result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "channel", mt: "SelectChannelMessageResultSuccess", result: JSON.stringify(data, null, 4) }));

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "channel", mt: "ChannelMessageError", result: String(errorText) }));
                    });
            }
            }
                
        });
        conn.messageComplete();
    }
    if (conn.app == "wecom-criticalviewadmin") {
        conn.send(JSON.stringify({ api: "channel", mt: "SelectChannelMessageResult" }));
        conn.onmessage(function (msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AddChannelMessage") {  
                Database.insert("INSERT INTO channels (name, url, type, page ) VALUES ('" + obj.name + "','" + obj.url + "','" + obj.type + "','" + obj.page + "')")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "channel", mt: "InsertChannelMessageSucess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "channel", mt: "ChannelMessageError", result: String(error) }));
                    });

            }
            if (obj.mt == "SelectChannelMessage") {
                conn.send(JSON.stringify({ api: "channel", mt: "SelectChannelMessageResult" }));
                Database.exec("SELECT * FROM channels")
                    .oncomplete(function (data) {
                        log("result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "channel", mt: "SelectChannelMessageResultSuccess", result: JSON.stringify(data, null, 4) }));

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "channel", mt: "ChannelMessageError", result: String(errorText) }));
                    });
            }
            if (obj.mt == "DeleteMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "DeleteMessageResult" }));
                Database.exec("DELETE FROM channels WHERE id=" + obj.id + ";")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "DeleteMessageSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "ChannelMessageError", result: String(errorText) }));
                    });
            }
            if (obj.mt == "AddPageMessage"){
                Database.insert("INSERT INTO pages (name_page,img,page) VALUES ('" + obj.name_page + "','" + obj.img + "','" + obj.page + "') ")
                .oncomplete(function () {
                    conn.send(JSON.stringify({ api: "channel", mt: "InsertPageMessageSucess" }));
                })
                .onerror(function (error, errorText, dbErrorCode) {
                    conn.send(JSON.stringify({ api: "channel", mt: "ChannelMessageError", result: String(error) }));
                });
            }
            if(obj.mt == "SelectPageMessage"){
                conn.send(JSON.stringify({ api: "channel", mt: "SelectChannelMessageResult" }));
                Database.exec("SELECT * FROM pages")
                .oncomplete(function (data) {
                    log("result=" + JSON.stringify(data, null, 4));
                    conn.send(JSON.stringify({ api: "channel", mt: "SelectPageMessageResultSuccess", result: JSON.stringify(data, null, 4) }));

                })
                .onerror(function (error, errorText, dbErrorCode) {
                    conn.send(JSON.stringify({ api: "channel", mt: "ChannelMessageError", result: String(errorText) }));
                });
            }
            if(obj.mt == "DeletePageMessage"){
            conn.send(JSON.stringify({ api: "admin", mt: "DeleteMessageResult" }));
            Database.exec("DELETE FROM pages WHERE id=" + obj.id + ";")
            .oncomplete(function () {
                conn.send(JSON.stringify({ api: "admin", mt: "DeletePageMessageSuccess" }));
            })
            .onerror(function (error, errorText, dbErrorCode) {
                conn.send(JSON.stringify({ api: "admin", mt: "ChannelMessageError", result: String(errorText) }));
            });
        }
        });
        conn.messageComplete();
    }
});
