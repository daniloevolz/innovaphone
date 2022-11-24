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
            if (obj.mt == "TriggerAlert") {
                callNovaAlert(parseInt(obj.prt));
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

function callNovaAlert(alert) {
    log("callNovaAlert::");
    var msg = { Username: "webuser", Password: "Wecom12#", AlarmNr: alert, LocationType: "GEO=47.565055,8.912027", Location: "Wecom", LocationDescription: "Wecom POA", Originator: "danilo", AlarmPinCode: "1234", Alarmtext: "Alarm from Myapps by Danilo!" };
    httpClient(urlalert, msg);


}

function httpClient(url, call) {
    log("danilo-req : httpClient");
    var responseData = "";
    log("danilo-req : httpClient : content" + JSON.stringify(call));
    var req = HttpClient.request("POST", url);

    req.header("X-Token", "danilo");
    req.contentType("application/json");
    req.onsend(function (req) {
        req.send(new TextEncoder("utf-8").encode(JSON.stringify(call)), true);
    });
    req.onrecv(function (req, data, last) {
        responseData += new TextDecoder("utf-8").decode(data);
        if (!last) req.recv();
    }, 1024);
    req.oncomplete(function (req, success) {
        log("danilo-req : HttpRequest complete");
        log("danilo-req : HttpRequest responseData " + responseData);
    })
        .onerror(function (error) {
            log("danilo-req : HttpRequest error=" + error);
        });

}

