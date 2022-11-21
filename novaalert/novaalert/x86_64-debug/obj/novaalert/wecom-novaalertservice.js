var urlalert = Config.urlalert;

Config.onchanged(function(){
    urlalert = Config.urlalert;

})

new JsonApi("user").onconnected(function(conn) {
    if (conn.app == "wecom-novaalert") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "UserMessage") {
                conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", urlalert:urlalert }));
            }
        });
    }
});

new JsonApi("admin").onconnected(function(conn) {
    if (conn.app == "wecom-novaalertadmin") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AdminMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: obj.src, urlalert:urlalert}));
            }
            if (obj.mt == "UpdateConfig") {
                if(obj.prt == "urlalert"){
                    Config.urlalert = obj.vl;
                    Config.save();
                }
            }
        });
    }
});
