var urlb3 = Config.urlb3;
var urltodas = Config.urltodas;
var urlbcb = Config.urlbcb;
Config.onchanged(function(){
     urlb3 = Config.urlb3;
    urltodas = Config.urltodas;
    urlbcb = Config.urlbcb;
})


new JsonApi("user").onconnected(function(conn) {
    if (conn.app == "wecom-cotacao") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "UserMessage") {
                conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", src: obj.src }));
            }
        });
    }
});

new JsonApi("admin").onconnected(function(conn) {
    if (conn.app == "wecom-cotacaoadmin") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AdminMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: obj.src , urlb3:urlb3, urltodas:urltodas, urlbcb:urlbcb}));
            }
            if (obj.mt == "UpdateConfig") {
                if(obj.prt == "urlb3"){
                    Config.urlb3 = obj.vl;
                    Config.save();
                }
                if(obj.prt == "urltodas"){
                    Config.urltodas = obj.vl;
                    Config.save();
                }
                if(obj.prt == "urlbcb"){
                    Config.urlbcb = obj.vl;
                    Config.save();
                }
            }
        });
    }
});
