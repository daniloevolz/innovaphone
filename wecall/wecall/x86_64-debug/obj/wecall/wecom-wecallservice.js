
new JsonApi("user").onconnected(function(conn) {
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
