

// the variables
var baseUrl = WebServer.url;
log("danilo req url: " + baseUrl);
var count = 0;
var sendCallHistory = Config.sendCallHistory;
var sendCallEvents = Config.sendCallEvents;
var urlPhoneApiEvents = Config.urlPhoneApiEvents;
var urlCallHistory = Config.urlCallHistory;
var urlDashboard = Config.urldash;
var codClient = Config.CodClient;
var codLeaveAllGroups = Config.CodLeaveAllGroups;
var leaveAllGroupsOnStatup = Config.LeaveAllGroupsOnStatup;
var url = Config.url;
var urlSSO = Config.urlSSO;
var urlGetGroups = Config.urlGetGroups;

var connectionsUser = [];
var connectionsAdmin = [];
//var connectionsPbxSignal = [];
//var connectionsRCC = [];
var RCC = [];
var PbxSignal = [];
var pbxTable = [];
var pbxTableUsers = [];

//var connections = [];
var calls = [];

var queues = [];


//Services APIS
Config.onchanged(function () {
    sendCallHistory = Config.sendCallHistory;
    sendCallEvents = Config.sendCallEvents;
    urlPhoneApiEvents = Config.urlPhoneApiEvents;
    urlCallHistory = Config.urlCallHistory;
    urlDashboard = Config.urldash;
    urlSSO = Config.urlSSO;
    codClient = Config.CodClient;
    url = Config.url;
    urlGetGroups = Config.urlGetGroups;
    codLeaveAllGroups = Config.CodLeaveAllGroups;
    leaveAllGroupsOnStatup = Config.LeaveAllGroupsOnStatup;

    updateConfigUsers();
});


WebServer.onurlchanged(function (newUrl) {
    baseUrl = newUrl;
    log("danilo req urlchaged: " + baseUrl);
});

WebServer.onrequest("makecall", function (req) {
    if (req.method == "POST") {
        var newValue = "";
        var value = "";
        req.onrecv(function (req, data) {
            //var obj = JSON.parse((new TextDecoder("utf-8").decode(data)));
            if (data) {
                newValue += (new TextDecoder("utf-8").decode(data));
                req.recv();
            }
            else {
                value = newValue;
                req.sendResponse();
                makecallRequest(value);
            }
        });
    }
    else {
        req.cancel();
    }
});
WebServer.onrequest("disconnectcall", function (req) {
    if (req.method == "POST") {
        var newValue = "";
        var value = "";
        req.onrecv(function (req, data) {
            //var obj = JSON.parse((new TextDecoder("utf-8").decode(data)));
            if (data) {
                newValue += (new TextDecoder("utf-8").decode(data));
                req.recv();
            }
            else {
                value = newValue;
                req.sendResponse();
                disconnectRequest(value);
            }
        });
    }
    else {
        req.cancel();
    }
});
WebServer.onrequest("badge", function (req) {
    if (req.method == "POST") {
        var newValue = "";
        var value = "";
        req.onrecv(function (req, data) {
            //var obj = JSON.parse((new TextDecoder("utf-8").decode(data)));
            if (data) {
                newValue += (new TextDecoder("utf-8").decode(data));
                req.recv();
            }
            else {
                value = newValue;
                req.sendResponse();
                badgeRequest2(value);
            }
        });
    }
    else {
        req.cancel();
    }
});
WebServer.onrequest("rcc", function (req) {
    if (req.method == "POST") {
        var newValue = "";
        var value = "";
        req.onrecv(function (req, data) {
            //var obj = JSON.parse((new TextDecoder("utf-8").decode(data)));
            if (data) {
                newValue += (new TextDecoder("utf-8").decode(data));
                req.recv();
            }
            else {
                value = newValue;
                req.sendResponse();
                rccRequest(value);
            }
        });
    }
    else {
        req.cancel();
    }
});
WebServer.onrequest("pbxTable", function (req) {
    if (req.method == "POST") {
        var newValue = "";
        var value = "";
        req.onrecv(function (req, data) {
            //var obj = JSON.parse((new TextDecoder("utf-8").decode(data)));
            if (data) {
                newValue += (new TextDecoder("utf-8").decode(data));
                req.recv();
            }
            else {
                value = newValue;
                req.sendResponse();
                pbxTableRequest(value);
            }
        });
    }
    else {
        req.cancel();
    }
});
WebServer.onrequest("value", function (req) {
    if (req.method == "GET") {
        var valueteste = "Danilo is the big dev from Wecom..";
        if (valueteste) {
            // value exists, send it back as text/plain
            req.responseContentType("txt")
                .sendResponse()
                .onsend(function (req) {
                    req.send(new TextEncoder("utf-8").encode(valueteste), true);
                });
        }
        else {
            // value does not exist, send 404 Not Found
            req.cancel();
        }
    }
});

getQueueGroups();

//JSON APIS

new JsonApi("user").onconnected(function (conn) {
    connectionsUser.push(conn);
    getURLLogin(conn.sip);
    if (sendCallEvents) {
        log("danilo-req : connectionUser:login:sendCallEvents=true");
        var msg = { User: conn.sip, Grupo: "", Callinnumber: "", Status: "login" };

        httpClient(urlPhoneApiEvents, msg);
    }
    log("danilo req : user connection " + JSON.stringify(conn));
    if (conn.app == "wecom-wecall") {
        var info = JSON.parse(conn.info);
        RCC.forEach(function (rcc) {
            if (rcc.pbx == info.pbx) {
                log("PbxSignal: calling RCC API for new userclient " + String(conn.dn) + " on PBX " + info.pbx);
                var msg = { api: "RCC", mt: "UserInitialize", cn: String(conn.dn), src: conn.sip + "," + info.pbx };
                rcc.send(JSON.stringify(msg));
            }
        })

        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            log("danilo-req : wecom-wecall");
            //if (obj.mt == "PhoneApiEvent") {
            //    log("danilo-req : PhoneApiEvent");
            //    if (sendCallEvents) {
            //        log("danilo-req : PhoneApiEvent=true");
            //        httpClient(urlPhoneApiEvents, obj.obj);
            //    }
            //}
            if (obj.mt == "CallHistoryEvent") {
                log("danilo-req : CallHistoryEvent");
                if (sendCallHistory) {
                    log("danilo-req : CallHistoryEvent=true");
                    httpClient(urlCallHistory, obj.obj);
                }
            }
            if (obj.mt == "UserMessage") {
                
            }
            if (obj.mt == "AddMessage") {
                Config.url = obj.url;
                Config.save();
                var url = Config.url;
                conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", src: url }));
            }
        });
    }
    conn.onclose(function () {
        log("User: disconnected");
        connectionsUser.splice(connectionsUser.indexOf(conn), 1);
        if (sendCallEvents) {
            log("danilo-req : connectionUser:logout:sendCallEvents=true");
            var msg = { User: conn.sip, Grupo: "", Callinnumber: "", Status: "logout" };

            httpClient(urlPhoneApiEvents, msg);
        }
    });
});
new JsonApi("admin").onconnected(function (conn) {
    connectionsAdmin.push(conn);
    if (conn.app == "wecom-wecalladmin") {
        log("danilo-req AdminMessage:wecom-wecalladmin");
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AdminMessage") {
                log("danilo-req AdminMessage: reducing the pbxTableUser object to send to user");
                var list_users = [];
                pbxTableUsers.forEach(function (u) {
                    list_users.push({ sip: u.columns.h323})
                })
                conn.send(JSON.stringify({ api: "admin", mt: "TableUsersResult", result: JSON.stringify(list_users) }));
                updateConfigUsers();
            }
            if (obj.mt == "AddURLDashMessage") {
                // Horario Atual
                var day = new Date().toLocaleString();
                log("AddURLDashMessage:day: " + day);
                Database.insert("INSERT INTO tbl_dashboards (sip, app_name, url, date_add) VALUES ('" + obj.sip + "','" + obj.app + "','" + obj.url + "','" + day + "')")
                    .oncomplete(function () {
                        Database.exec("SELECT * FROM tbl_dashboards")
                            .oncomplete(function (data) {
                                log("AddURLDashMessage:result=" + JSON.stringify(data, null, 4));
                                conn.send(JSON.stringify({ api: "admin", mt: "AddURLDashMessageSucess", result: JSON.stringify(data, null, 4) }));

                            })
                            .onerror(function (error, errorText, dbErrorCode) {
                                conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText) }));
                            });
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText) }));
                    });


            }
            if (obj.mt == "SelectURLDashMessage") {
                Database.exec("SELECT * FROM tbl_dashboards")
                    .oncomplete(function (data) {
                        log("result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "admin", mt: "SelectURLDashResultSuccess", result: JSON.stringify(data, null, 4) }));

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText) }));
                    });
            }
            if (obj.mt == "DelURLDashMessage") {
                Database.exec("DELETE FROM tbl_dashboards WHERE id=" + obj.id + ";")
                    .oncomplete(function () {
                        Database.exec("SELECT * FROM tbl_dashboards")
                            .oncomplete(function (data) {
                                log("AddURLDashMessage:result=" + JSON.stringify(data, null, 4));
                                conn.send(JSON.stringify({ api: "admin", mt: "DelURLDashMessageSucess", result: JSON.stringify(data, null, 4) }));

                            })
                            .onerror(function (error, errorText, dbErrorCode) {
                                conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText) }));
                            });

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText) }));
                    });
            }
            if (obj.mt == "AddMessage") {
                Config.urladmin = obj.url;
                Config.save();
                var urladmin = Config.urladmin;
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: urladmin }));
            }
            if (obj.mt == "UpdateConfig") {
                log("danilo-req UpdateConfig:");
                if (obj.prt == "urlPhoneApiEvents") {
                    Config.urlPhoneApiEvents = obj.vl;
                    Config.save();
                }
                if (obj.prt == "urlCallHistory") {
                    Config.urlCallHistory = obj.vl;
                    Config.save();
                }
                if (obj.prt == "sendCallHistory") {
                    Config.sendCallHistory = obj.vl;
                    Config.save();
                }
                if (obj.prt == "sendCallEvents") {
                    Config.sendCallEvents = obj.vl;
                    Config.save();
                }
                if (obj.prt == "leaveGroupsStartup") {
                    Config.LeaveAllGroupsOnStatup = obj.vl;
                    Config.save();
                }
                if (obj.prt == "urlDashboard") {
                    Config.urldash = obj.vl;
                    Config.save();
                }
                if (obj.prt == "urlSSO") {
                    Config.urlSSO = obj.vl;
                    Config.save();
                }
                if (obj.prt == "CodClient") {
                    Config.CodClient = obj.vl;
                    Config.save();
                }
                if (obj.prt == "Url") {
                    Config.url = obj.vl;
                    Config.save();
                }
                if (obj.prt == "UrlG") {
                    Config.urlGetGroups = obj.vl;
                    Config.save();
                }
            }
        });
    }
    conn.onclose(function () {
        log("UserAdmin: disconnected");
        connectionsAdmin.splice(connectionsAdmin.indexOf(conn), 1);
    });
});
new JsonApi("dash").onconnected(function (conn) {
    if (conn.app == "wecom-wecalldash") {
        conn.onmessage(function (msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "DashURLMessage") {
                //var urldash = Config.urldash;
                Database.exec("SELECT url FROM tbl_dashboards WHERE sip ='" + conn.sip + "' AND app_name ='" + obj.app + "';")
                    .oncomplete(function (data) {
                        log("DashURLMessage:result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "dash", mt: "DashMessageResult", src: JSON.stringify(data, null, 4) }));

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "dash", mt: "DashMessageResult", src: "" }));
                    });
                
            }
            if (obj.mt == "AddURLDashMessage") {
                //Config.urldash = obj.url;
                //Config.save();
                //var urldash = Config.urldash;
                // Horario Atual
                var day = new Date().toLocaleString();
                log("AddURLMessage:day: " + day);
                Database.insert("INSERT INTO tbl_dashboards (sip, app_name, url, date_add) VALUES ('" + obj.sip + "','" + obj.app + "','" + obj.url + "','" + day + "')")
                    .oncomplete(function () {
                        Database.exec("SELECT url FROM tbl_dashboards WHERE sip ='" + obj.sip + "' AND app_name ='" + obj.app + "';")
                            .oncomplete(function (data) {
                                log("DashURLMessage:result=" + JSON.stringify(data, null, 4));
                                conn.send(JSON.stringify({ api: "dash", mt: "DashMessageResult", src: JSON.stringify(data, null, 4) }));

                            })
                            .onerror(function (error, errorText, dbErrorCode) {
                                conn.send(JSON.stringify({ api: "dash", mt: "DashMessageResult", src: "" }));
                            });
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "dash", mt: "Error", result: String(errorText) }));
                    }); 
            }
        });
    }
});

//PBX APIS
new PbxApi("PbxTableUsers").onconnected(function (conn) {
    //pbxTable.push(conn);
    log("PbxTableUsers: connected " + JSON.stringify(conn));

    // for each PBX API connection an own call array is maintained
    var signalFound = pbxTable.filter(function (pbx) { return pbx.pbx === conn.pbx });
    if (signalFound.length == 0) {
        pbxTable.push(conn);
        // register to the PBX in order to acceppt incoming presence calls
        conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateStart", "add": true, "del": true, "columns": { "guid": {}, "dn": {}, "cn": {}, "h323": {}, "e164": {}, "node": {}, "grps": {}, "devices": {} }, "src": conn.pbx }));

    }
    conn.onmessage(function (msg) {

        var obj = JSON.parse(msg);


        log("PbxTableUsers: msg received " + msg);

        if (obj.mt == "ReplicateStartResult") {
            pbxTableUsers = [];
            conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateNext", "src": conn.pbx }));
        }
        if (obj.mt == "ReplicateNextResult" && obj.columns) {

            //pbxTableUsers.push({ guid: obj.columns.guid, sip: obj.columns.h323, cn: obj.columns.cn, pbx: obj.src, e164: obj.columns.e164, node: obj.columns.node, devices: obj.columns.devices, badge: 0 });
            pbxTableUsers.push(obj)
            conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateNext", "src": conn.pbx }));
        }

        if (obj.mt == "ReplicateAdd") {

            //pbxTableUsers.push({ guid: obj.columns.guid, sip: obj.columns.h323, cn: obj.columns.cn, pbx: obj.src, e164: obj.columns.e164, node: obj.columns.node, devices: obj.columns.devices, badge: 0 });
            pbxTableUsers.push(obj);
        }
        if (obj.mt == "ReplicateUpdate") {
            var foundTableUser = pbxTableUsers.filter(function (pbx) { return pbx.columns.h323 === obj.columns.h323 });
            log("ReplicateUpdate= foundTableUser " + JSON.stringify(foundTableUser));
            const grps1 = foundTableUser[0].columns.grps;
            const grps2 = obj.columns.grps;
            log("ReplicateUpdate= user " + obj.columns.h323);

            try {
                for (var i = 0; i < grps1.length; i++) {
                    try {
                        for (var j = 0; j < grps2.length; j++) {
                            if (grps1[i].name === grps2[j].name) {
                                if (grps1[i].dyn === grps2[j].dyn) {
                                } else {
                                    log("ReplicateUpdate= user " + obj.columns.h323 + " group presence changed for group " + grps2[j].name +"!!!");
                                    switch (grps2[j].dyn) {
                                        case "out":
                                            if (sendCallEvents) {
                                                var msg = { User: obj.columns.h323, Grupo: grps2[j].name, Callinnumber: "", Status: "grp_logout" };
                                                httpClient(urlPhoneApiEvents, msg);
                                            }
                                            break;
                                        case "in":
                                            if (sendCallEvents) {
                                                var msg = { User: obj.columns.h323, Grupo: grps2[j].name, Callinnumber: "", Status: "grp_login" };
                                                httpClient(urlPhoneApiEvents, msg);
                                            }
                                            break;
                                    }
                                }
                            }
                        }

                    }
                    catch (e) {
                        log("ReplicateUpdate= user " + obj.columns.h323 + " received from pbx has no grups at this moment and group presence changed to out for all!!!");
                        log("ReplicateUpdate= user " + obj.columns.h323 + " group presence changed to OUT for group " + grps1[j].name);
                        var msg = { User: obj.columns.h323, Grupo: grps1[j].name, Callinnumber: "", Status: "grp_logout" };
                        httpClient(urlPhoneApiEvents, msg);
                    }
                    
                }

            }
            catch (e) {
                log("ReplicateUpdate= user " + obj.columns.h323 + " stored on app has no grups at this moment and group presence received from pbx!!!");
                for (var j = 0; j < grps2.length; j++) {
                    log("ReplicateUpdate= user " + obj.columns.h323 + " group presence changed for group " + grps1[j].name);
                    switch (grps2[j].dyn) {
                        case "out":
                            if (sendCallEvents) {
                                var msg = { User: obj.columns.h323, Grupo: grps2[j].name, Callinnumber: "", Status: "grp_logout" };
                                httpClient(urlPhoneApiEvents, msg);
                            }
                            break;
                        case "in":
                            if (sendCallEvents) {
                                var msg = { User: obj.columns.h323, Grupo: grps2[j].name, Callinnumber: "", Status: "grp_login" };
                                httpClient(urlPhoneApiEvents, msg);
                            }
                            break;
                    }
                }
            }
            
            

            //log("ReplicateUpdate= user " + obj.columns.h323);
            //if (obj.columns.grps) {
            //    log("ReplicateUpdate= obj.coumns.grps exists");
            //    var grps = obj.columns.grps;
            //    grps.forEach(function (g) {
            //        switch (g.dyn) {
            //            case "out":
            //                if (sendCallEvents) {
            //                    log("danilo-req : connectionUser:logout on queue :sendCallEvents=true");
            //                    var msg = { User: obj.columns.h323, Grupo: g.name, Callinnumber: "", Status: "grp_logout" };
            //                    httpClient(urlPhoneApiEvents, msg);
            //                }
            //                break;
            //            case "in":
            //                if (sendCallEvents) {
            //                    log("danilo-req : connectionUser:login on queue :sendCallEvents=true");
            //                    var msg = { User: obj.columns.h323, Grupo: g.name, Callinnumber: "", Status: "grp_login" };
            //                    httpClient(urlPhoneApiEvents, msg);
            //                }
            //        }
                    
            //    })
            //}

            pbxTableUsers.forEach(function (user) {
                if (user.columns.h323 == obj.columns.h323) {
                    log("ReplicateUpdate: Updating the object for user " + obj.columns.h323)
                    Object.assign(user, obj)
                }
            })

        }
    });

    conn.onclose(function () {
        log("PbxTableUsers: disconnected");
        pbxTable.splice(pbxTable.indexOf(conn), 1);
    });
});

new PbxApi("PbxSignal").onconnected(function (conn) {
    log("PbxSignal: connected conn " + JSON.stringify(conn));
    
    // for each PBX API connection an own call array is maintained
    PbxSignal.push(conn);
    //connectionsPbxSignal.push({ ws: conn });
    log("PbxSignal: connected PbxSignal " + JSON.stringify(PbxSignal));

    // register to the PBX in order to acceppt incoming presence calls
    conn.send(JSON.stringify({ "api": "PbxSignal", "mt": "Register", "flags": "NO_MEDIA_CALL" ,"src": conn.pbx}));

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
            conn.send(JSON.stringify({ "mt": "Signaling", "api": "PbxSignal", "call": obj.call, "src": obj.sig.cg.sip + "," + obj.src, "sig": { "type": "conn" } }));

            //Atualiza connections
            var src = obj.src;
            var myArray = src.split(",");
            var pbx = myArray[0];
            log("PbxSignal: before add new userclient " + JSON.stringify(PbxSignal));
            PbxSignal.forEach(function (signal) {
                if (signal.pbx == pbx) {
                    signal[obj.sig.cg.sip] = obj.call;
                }
            })
            log("PbxSignal: after add new userclient " + JSON.stringify(PbxSignal));
            var name = "";
            var myArray = obj.sig.fty;
            myArray.forEach(function (fty) {
                if (fty.name) {
                    name = fty.name;
                }
            })
            

            //Adiciona
            //log("PBXSignal: connections before add " + JSON.stringify(connections));
            //connections.push({ sip: obj.sig.cg.sip, call: obj.call, name: obj.sig.fty[1].name, user: "", url:"", area:"" });
            //log("PBXSignal: connections after add " + JSON.stringify(connections));


            
            //connectionsRCC.forEach(function (c) {
            //    callRCC(c.ws, obj.sig.fty[1].name, "UserInitialize", "", obj.sig.cg.sip);
            //})
            

            //getURLLogin(obj.sig.cg.sip);

            // send notification with badge count first time the user has connected
            updateBadge(conn, obj.call, count);
        }

        // handle incoming call release messages
        if (obj.mt === "Signaling" && obj.sig.type === "rel") {
            // remove callid from the array for calls for this connection
            calls.splice(calls.indexOf(obj.call), 1);

            //Remove
            //log("PBXSignal: connections result " + JSON.stringify(connections));
            log("PBXSignal: connections before delete result " + JSON.stringify(PbxSignal));
            var src = obj.src;
            var myArray = src.split(",");
            var sip = "";
            var pbx = myArray[0];
            PbxSignal.forEach(function (signal) {
                if (signal.pbx == pbx) {
                    sip = Object.keys(signal).filter(function (key) { return signal[key] === obj.call })[0];
                    delete signal[sip];
                    
                }
            })
            log("PBXSignal: connections after delete result " + JSON.stringify(PbxSignal));

            RCC.forEach(function (rcc) {
                if (rcc.pbx == pbx) {
                    var user = rcc[sip];
                    log("PbxSignal: calling RCC API to End user Monitor " + String(sip) + " on PBX " + pbx);
                    var msg = { api: "RCC", mt: "UserEnd", user: user, src: sip + "," + pbx };
                    rcc.send(JSON.stringify(msg));
                }
            })
            //connections = connections.filter(delConnectionsByCall(obj.call));
            //log("PBXSignal: connections result " + JSON.stringify(connections));
        }
    });

    conn.onclose(function () {
        log("PbxSignal: disconnected");
        PbxSignal.splice(PbxSignal.indexOf(conn), 1);
        //connectionsPbxSignal.splice(connectionsPbxSignal.indexOf(conn), 1);
    });
});

new PbxApi("RCC").onconnected(function (conn) {

    //connectionsRCC.push({ ws: conn });
    RCC.push(conn);
    log("RCC: connected conn " + JSON.stringify(conn));
    log("RCC: connected RCC " + JSON.stringify(RCC));
    
    initializeQueues();

    conn.send(JSON.stringify({ "api": "RCC", "mt": "Initialize", "limit": 50, "calls":true }));

    //conn.send(JSON.stringify({ api: "RCC", mt: "Devices", cn: "Danilo Volz" }));
    conn.onmessage(function (msg) {
        var obj = JSON.parse(msg);
        if (obj.mt === "DevicesResult") {
            log("danilo req : RCC message:: " + JSON.stringify(obj));
            //var hw = obj.devices.filter(function (device) { return device.text === "Softphone" })[0];
            //conn.send(JSON.stringify({ api: "RCC", mt: "UserInitialize", cn: "danilo", hw: hw }));
        }
        else if (obj.mt === "UserInitializeResult") {
            log("danilo req UserInitializeResult: RCC message:: received" + JSON.stringify(obj));
            //Atualiza connections
            var src = obj.src;
            var myArray = src.split(",");
            var sip = myArray[0];
            var pbx = myArray[1];
            RCC.forEach(function (rcc) {
                if (rcc.pbx == pbx) {
                    rcc[sip] = obj.user;
                }
            })

            //Sair de Todos os Grupos DAC do PABX para que usuario faca login
            if (Boolean(leaveAllGroupsOnStatup)) {
                log("danilo req UserInitializeResult: leaveAllGroupsOnStatup is " + String(leaveAllGroupsOnStatup));
                callRCC(conn, obj.user, "UserCall", codLeaveAllGroups, obj.src);
            }
            //updateConnections(obj.src, "user", obj.user, obj.area);
        }
        else if (obj.mt === "UserEndResult") {
            log("danilo req UserEndResult: RCC message:: received" + JSON.stringify(obj));
            log("RCC: connections before delete result " + JSON.stringify(RCC));
            var src = obj.src;
            var myArray = src.split(",");
            var sip = myArray[0];
            var pbx = myArray[1];
            RCC.forEach(function (rcc) {
                if (rcc.pbx == pbx) {
                    delete rcc[sip];
                }
            })
            log("RCC: connections after delete result " + JSON.stringify(RCC));

        }
        else if (obj.mt === "CallInfo") {
            log("danilo req CallInfo: RCC message:: received" + JSON.stringify(obj));
            var src = obj.src;
            var myArray = src.split(",");
            var sip = myArray[0];
            var pbx = myArray[1];

            log("danilo-req : RCC message::CallInfo for user src " + sip);
            //var foundIndex = connectionsPbxSignal[0].sip.indexOf(obj.src);
            //log("danilo-req : RCC message::CallInfo user src foundIndex " + foundIndex);
            var foundCall = calls.filter(function (call) { return call.sip === sip });

            if (String(foundCall) == "") {
                log("danilo-req : RCC message::CallInfo NOT foundCall ");
                if (obj.state == 4 || obj.state == 132) {
                    var e164 = obj.peer.e164;
                    var myArray = obj.src.split(",");
                    var src = myArray[0];
                    if (e164 == "") {
                        calls.push({ sip: String(src), callid: obj.call, num: obj.peer.h323, state: obj.state });
                    } else {
                        calls.push({ sip: String(src), callid: obj.call, num: obj.peer.e164, state: obj.state });
                    }
                    log("danilo req : RCC message:: call inserted " + JSON.stringify(calls));

                    switch (obj.state) {
                        case 4:
                            //Ativa (Alert)
                            if (sendCallEvents) {
                                log("danilo-req : RCC message::sendCallEvents=true");
                                var e164 = obj.peer.e164;
                                if (queues.some(function (v) { return v.Fila === sip })) {
                                    if (e164 == "") {
                                        var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "out" };
                                    } else {
                                        var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "out" };
                                    }
                                } else {
                                    if (e164 == "") {
                                        var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "out" };
                                    } else {
                                        var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "out" };
                                    }
                                }
                                httpClient(urlPhoneApiEvents, msg);
                            }
                            break;
                        case 132:
                            //Receptiva (Alert)
                            if (sendCallEvents) {
                                log("danilo-req : RCC message::sendCallEvents=true");
                                var e164 = obj.peer.e164;
                                if (queues.some(function (v) { return v.Fila === sip })) {
                                    if (e164 == "") {
                                        var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "inc" };
                                    } else {
                                        var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "inc" };
                                    }
                                } else {
                                    if (e164 == "") {
                                        var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "inc" };
                                    } else {
                                        var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "inc" };
                                    }
                                }
                                httpClient(urlPhoneApiEvents, msg);
                            }
                            break;
                    }
                }
            } else {
                log("danilo-req : RCC message::CallInfo foundCall " + JSON.stringify(foundCall));
                calls.forEach(function (call) {
                    if (call.sip == sip) {
                        if (call.callid < obj.call) {
                            call.callid = obj.call;
                        }
                        if (call.state < obj.state) {
                            switch (obj.state) {
                                case 5:
                                    //Ativa (Connected)
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message::sendCallEvents=true");
                                        var e164 = obj.peer.e164;
                                        if (queues.some(function (v) { return v.Fila === sip })) {
                                            if (e164 == "") {
                                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "ans" };
                                            } else {
                                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "ans" };
                                            }
                                        } else {
                                            if (e164 == "") {
                                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "ans" };
                                            } else {
                                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "ans" };
                                            }
                                        }
                                        httpClient(urlPhoneApiEvents, msg);
                                    }
                                    break;
                                case 133:
                                    //Receptiva (Connected)
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message::sendCallEvents=true");
                                        var e164 = obj.peer.e164;
                                        if (queues.some(function (v) { return v.Fila === sip })) {
                                            if (e164 == "") {
                                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "ans" };
                                            } else {
                                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "ans" };
                                            }
                                        } else {
                                            if (e164 == "") {
                                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "ans" };
                                            } else {
                                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "ans" };
                                            }
                                        }
                                        httpClient(urlPhoneApiEvents, msg);
                                    }
                                    break;
                                case 6:
                                    //Ativa (Disconnect Sent)
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message::sendCallEvents=true");
                                        var e164 = obj.peer.e164;
                                        if (queues.some(function (v) { return v.Fila === sip })) {
                                            if (e164 == "") {
                                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "del" };
                                            } else {
                                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "del" };
                                            }
                                        } else {
                                            if (e164 == "") {
                                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "del" };
                                            } else {
                                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "del" };
                                            }
                                        }
                                        httpClient(urlPhoneApiEvents, msg);
                                    }
                                    //Remove
                                    log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + sip);
                                    calls = calls.filter(deleteCallsBySrc(sip));
                                    log("danilo req : after deleteCall " + JSON.stringify(calls));
                                    break;
                                case 7:
                                    //Ativa (Disconnect Received)
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message::sendCallEvents=true");
                                        var e164 = obj.peer.e164;
                                        if (queues.some(function (v) { return v.Fila === sip })) {
                                            if (e164 == "") {
                                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "del" };
                                            } else {
                                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "del" };
                                            }
                                        } else {
                                            if (e164 == "") {
                                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "del" };
                                            } else {
                                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "del" };
                                            }
                                        }
                                        httpClient(urlPhoneApiEvents, msg);
                                    }
                                    //Remove
                                    log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + sip);
                                    calls = calls.filter(deleteCallsBySrc(sip));
                                    log("danilo req : after deleteCall " + JSON.stringify(calls));
                                    break;
                                case 134:
                                    //Receptiva (Disconnect Sent)
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message::sendCallEvents=true");
                                        var e164 = obj.peer.e164;
                                        if (queues.some(function (v) { return v.Fila === sip })) {
                                            if (e164 == "") {
                                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "del" };
                                            } else {
                                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "del" };
                                            }
                                        } else {
                                            if (e164 == "") {
                                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "del" };
                                            } else {
                                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "del" };
                                            }
                                        }
                                        httpClient(urlPhoneApiEvents, msg);
                                    }
                                    //Remove
                                    log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + sip);
                                    calls = calls.filter(deleteCallsBySrc(sip));
                                    log("danilo req : after deleteCall " + JSON.stringify(calls));
                                    break;
                                case 135:
                                    //Receptiva (Disconnect Received)
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message::sendCallEvents=true");
                                        var e164 = obj.peer.e164;
                                        if (queues.some(function (v) { return v.Fila === sip })) {
                                            if (e164 == "") {
                                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "del" };
                                            } else {
                                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "del" };
                                            }
                                        } else {
                                            if (e164 == "") {
                                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "del" };
                                            } else {
                                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "del" };
                                            }
                                        }
                                        httpClient(urlPhoneApiEvents, msg);
                                    }
                                    //Remove
                                    log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + sip);
                                    calls = calls.filter(deleteCallsBySrc(sip));
                                    log("danilo req : after deleteCall " + JSON.stringify(calls));
                                    break;
                                
                            }
                            call.state = obj.state;
                        }
                        

                    }
                })
                var foundCall = calls.filter(function (call) { return call.sip === sip });
                log("danilo-req : RCC message::CallInfo UPDATED foundCall " + JSON.stringify(foundCall));
            }



            /*

            if (obj.msg == "x-alert") {
                //Chamada Receptiva do Ramal ou Grupo//
                if (String(foundCall) == "") {
                    insertCall(obj);
                    if (sendCallEvents) {
                        log("danilo-req : RCC message::sendCallEvents=true");
                        var e164 = obj.peer.e164;
                        if (queues.some(function (v) { return v.Fila === sip })) {
                            if (e164 == "") {
                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "inc" };
                            } else {
                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "inc" };
                            }
                        } else {
                            if (e164 == "") {
                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "inc" };
                            } else {
                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "inc" };
                            }
                        }
                        
                        httpClient(urlPhoneApiEvents, msg);
                    }
                }
            }
            if (obj.msg == "x-setup") {
                //Chamada Ativa do Ramal//
                if (String(foundCall) == "") {
                    insertCall(obj);
                    if (sendCallEvents) {
                        log("danilo-req : RCC message::sendCallEvents=true");
                        var e164 = obj.peer.e164;
                        if (queues.some(function (v) { return v.Fila === sip })) {
                            if (e164 == "") {
                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "out" };
                            } else {
                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "out" };
                            }
                        } else {
                            if (e164 == "") {
                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "out" };
                            } else {
                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "out" };
                            }
                        }
                        httpClient(urlPhoneApiEvents, msg);
                    }
                }
            }
            if (obj.msg == "x-conn" || obj.msg == "r-conn") {
                //Chamada Ativa ou Receptiva Atendida//
                if (String(foundCall) !== "") {
                    if (sendCallEvents) {
                        log("danilo-req : RCC message::sendCallEvents=true");
                        var e164 = obj.peer.e164;
                        if (queues.some(function (v) { return v.Fila === sip })) {
                            if (e164 == "") {
                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "ans" };
                            } else {
                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "ans" };
                            }
                        } else {
                            if (e164 == "") {
                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "ans" };
                            } else {
                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "ans" };
                            }
                        }
                        httpClient(urlPhoneApiEvents, msg);
                    }
                }
            }
            if (obj.msg == "r-setup") {
                //Chamada Ativa do Ramal????
                //if (String(foundCall) == "") {
                //    insertCall(obj);
                //    if (sendCallEvents) {
                //        log("danilo-req : RCC message::sendCallEvents=true");
                //        var e164 = obj.peer.e164;
                //        if (e164 == "") {
                //            var msg = { user: obj.src, callingNumber: obj.peer.h323, queue: obj.no[0].e164, call: obj.call, status: "inc" };
                //        } else {
                //            var msg = { user: obj.src, callingNumber: obj.peer.e164, queue: obj.no[0].e164, call: obj.call, status: "inc" };
                //        }
                //        httpClient(urlPhoneApiEvents, msg);
                //    }
                //}
            }
            if (obj.msg == "del") {
                 //Chamada Desconectada//
                if (String(foundCall) !== "") {
                    //Remove
                    log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + sip);
                    calls = calls.filter(deleteCallsBySrc(sip));
                    log("danilo req : after deleteCall " + JSON.stringify(calls));
                    if (sendCallEvents) {
                        log("danilo-req : RCC message::sendCallEvents=true");
                        var e164 = obj.peer.e164;
                        if (queues.some(function (v) { return v.Fila === sip })) {
                            if (e164 == "") {
                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "del" };
                            } else {
                                var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "del" };
                            }
                        } else {
                            if (e164 == "") {
                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "del" };
                            } else {
                                var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "del" };
                            }
                        }
                        httpClient(urlPhoneApiEvents, msg);
                    }
                }
            }

            */
        }
    });
    conn.onclose(function () {
        log("RCC: disconnected");
        RCC.splice(RCC.indexOf(conn), 1);
        //connectionsRCC.splice(connectionsRCC.indexOf(conn), 1);
    });
});

//Internal Functions
function updateBadge(ws, call, count) {
    var msg = {
        "api": "PbxSignal", "mt": "Signaling", "call": call, "src": "badge",
        "sig": {
            "type": "facility",
            "fty": [{ "type": "presence_notify", "status": "open", "note": "#badge:" + count, "contact": "app:" }]
        }
    };
    log("danilo-req updateBadge:msg " + JSON.stringify(msg));
    ws.send(JSON.stringify(msg));
}

function updateConfigUsers() {
    log("danilo-req updateConfigUsers:");
    connectionsAdmin.forEach(function (connection) {
        log("danilo-req updateConfigUsers:connection user" + connection.guid);
        connection.send(JSON.stringify({ api: "admin", mt: "UpdateConfigResult", sH: sendCallHistory, sP: sendCallEvents, urlP: String(urlPhoneApiEvents), urlH: String(urlCallHistory), urlD: String(urlDashboard), urlSSO: String(urlSSO), CodCli: String(codClient), url: String(url), urlG: String(urlGetGroups), CodLeave: String(codLeaveAllGroups), sLS: leaveAllGroupsOnStatup}));
    });
}

function badgeRequest2(value) {

    log("danilo-req badge2:value " + JSON.stringify(value));
    var obj = JSON.parse(value);

    obj.listuser.forEach(function (user) {
        PbxSignal.forEach(function (signal) {
            log("danilo-req badge2:PbxSignal " + JSON.stringify(signal));
            var call = signal[user.user];
            if (call != null) {
                log("danilo-req badge2:call " + String(call)+", will call updateBadge");
                updateBadge(signal, call, user.num);
            }
            
        })

        //connections.forEach(function (conn) {
        //    if (conn.sip == user.user) {
        //        connectionsPbxSignal.forEach(function (c) {
        //            updateBadge(c.ws, conn.call, user.num);
        //        })
                
        //    }
        //})
    });
}
/*
function disconnectRequest(value) {
    log("danilo-req disconnectcall:value " + String(value));
    var obj = JSON.parse(String(value));

    log("danilo-req disconnectcall:user " + obj.user);
    log("danilo-req disconnectcall:num " + obj.num);
    connectionsUser.forEach(function (connection) {
        if (connection.sip == obj.user) {
            log("danilo-req disconnectcall:connection user" + connection.guid);
            connection.send(JSON.stringify({ api: "user", mt: "DisconnectCall", num: obj.num }));
        }
        //connection.send(JSON.stringify({ api: "user", mt: "MakeCall", num: obj.num }));
        log("danilo-req disconnectcall:connection NOT user ");
    });
}*/

function rccRequest(value) {

    log("danilo-req rccRequest:value " + String(value));
    var obj = JSON.parse(String(value));

    if (obj.mode == "Grp_Add") {
        log("danilo-req rccRequest:Grp_Add before END Queue " + obj.user);
        queues.push({ Fila: obj.user, Nome: obj.pbx })
        log("danilo-req rccRequest:Grp_Add after END Queue " + obj.user);

        log("danilo-req rccRequest:Grp_Add wil call RCC for NEW Queue " + obj.user);
        RCC.forEach(function (rcc) {
            if (rcc.pbx == obj.pbx) {
                var msg = { api: "RCC", mt: "UserInitialize", cn: obj.user, src: obj.user + "," + obj.pbx };
                rcc.send(JSON.stringify(msg));
            }
        })
    }
    else if (obj.mode == "Grp_Del") {
        var foundQueue = queues.filter(function (queue) { return queue.Fila === obj.user });
        if (foundQueue.length > 0) {

            log("danilo-req rccRequest:Grp_Del before END Queue " + obj.user);
            queues = queues.filter(deleteCallsBySrc(obj.user));
            log("danilo-req rccRequest:Grp_Del after END Queue " + obj.user);

            RCC.forEach(function (rcc) {
                if (rcc.pbx == obj.pbx) {
                    var user = rcc[obj.user];
                    log("PbxSignal: calling RCC API to End Queue Monitor " + String(obj.user) + " on PBX " + rcc.pbx);
                    var msg = { api: "RCC", mt: "UserEnd", user: user, src: obj.user + "," + rcc.pbx };
                    rcc.send(JSON.stringify(msg));
                }
            })
        }

    }
    else {
        log("danilo-req rccRequest:user " + obj.user);
        log("danilo-req rccRequest:sip " + obj.sip);
        log("danilo-req rccRequest:mode " + obj.mode);
        log("danilo-req rccRequest:num " + obj.num);
        var user;
        RCC.forEach(function (rcc) {
            var temp = rcc[String(obj.sip)];
            log("danilo-req rccRequest:temp " + temp);
            if (temp != null) {
                user = temp;
                log("danilo-req rccRequest:wil call callRCC for user " + user);
                callRCC(rcc, user, obj.mode, obj.num, obj.sip + "," + rcc.pbx);
            }
        })
    }
    //connectionsRCC.forEach(function (connection) {
    //    log("danilo-req rccRequest: will callRCC ");
    //    callRCC(connection.ws, obj.user, obj.mode, obj.num, obj.sip);
    //});
}
function pbxTableRequest(value) {
    log("danilo-req pbxTableRequest:value " + String(value));
    var obj = JSON.parse(String(value));
    var user = pbxTableUsers.filter(function (user) { return user.columns.h323 === obj.sip });
    var found = false;

    if (user[0].columns.grps) {
        log("danilo-req pbxTableRequest:Objeto contem colunms.grps" + JSON.stringify(user[0].columns));
        user[0].columns.grps.forEach(function (grp) {
            if (grp.name == obj.group) {
                found = true;
                log("danilo-req pbxTableRequest: Group founded changing presence")
                if (obj.mode == "Login") {
                    grp["dyn"] = "in";
                }
                if (obj.mode == "Logout") {
                    grp["dyn"] = "out";
                }
            }

        })
        if (!found) {
            log("danilo-req pbxTableRequest: Group not founded including it");
            if (obj.mode == "Login") {
                user[0].columns.grps.push({ name: obj.group, dyn: "in" })
            }
            if (obj.mode == "Logout") {
                user[0].columns.grps.push({ name: obj.group, dyn: "out" })
            }
        }
        pbxTable.forEach(function (conn) {
            if (conn.pbx == user[0].src) {
                user[0].mt="ReplicateUpdate";
                log(JSON.stringify(user[0]));
                conn.send(JSON.stringify(user[0]));
            }
        })
        pbxTableUsers.forEach(function (u) {
            if (u.columns.h323 == user[0].columns.h323) {
                user[0].mt = "ReplicateNextResult";
                Object.assign(u, user[0])
            }
        })

    } else {
        log("danilo-req pbxTableRequest:Objeto nno contem colunms.grps" + JSON.stringify(user[0].columns));
        if (obj.mode == "Login") {
            //user[0].columns.grps = [];
            //user[0].columns.grps.push({ name: obj.group, dyn: "in" })
            const grps = [
                //{
                //    "name": obj.group,
                //    "dyn": "in"
                //}
            ];
            user[0].columns.grps = grps;
            user[0].columns.grps.push({ name: obj.group, dyn: "in" })
        }
        if (obj.mode == "Logout") {
            //user[0].columns.grps = [];
            //user[0].columns.grps.push({ name: obj.group, dyn: "out" })
            const grps = [
                //{
                //    "name": obj.group,
                //    "dyn": "out"
                //}
            ];
            user[0].columns.grps = grps;
            user[0].columns.grps.push({ name: obj.group, dyn: "out" })
        }
        pbxTable.forEach(function (conn) {
            if (conn.pbx == user[0].src) {
                user[0].mt = "ReplicateUpdate";
                log("danilo-req pbxTableRequest:Objeto a ser enviado no pbxTable "+JSON.stringify(user[0]));
                conn.send(JSON.stringify(user[0]));
            }
        })
        pbxTableUsers.forEach(function (u) {
            if (u.columns.h323 == user[0].columns.h323) {
                user[0].mt = "ReplicateNextResult";
                Object.assign(u, user[0])
                log("danilo-req pbxTableRequest:Objeto atualizado no pbxTableUsers " + JSON.stringify(u));
            }
        })

    }
    //user[0].columns.grps.forEach(function (grp) {
    //    if (grp.name == obj.group) {
    //        found = true;
    //        if (obj.mode == "Login") {
    //            grp["dyn"] = "in";
    //        }
    //        if (obj.mode == "Logout") {
    //            grp["dyn"] = "out";
    //        }
    //    }

    //})
    //if (!found) {
    //    if (obj.mode == "Login") {
    //        user[0].columns.grps.push({ name: obj.group, dyn: "in" })
    //    }
    //    if (obj.mode == "Logout") {
    //        user[0].columns.grps.push({ name: obj.group, dyn: "out" })
    //    }
    //}
    //pbxTable.forEach(function (conn) {
    //    if (conn.pbx == user[0].src) {
    //        log(JSON.stringify(user[0]));
    //        conn.send(JSON.stringify(user[0]));
    //    }
    //})
    //pbxTableUsers.forEach(function (u) {
    //    if (u.columns.h323 == user[0].columns.h323) {
    //        Object.assign(u, user[0])
    //    }
    //})

    

    //if (obj.mode === "Login") {
    //    pbxTable.forEach(function (conn) {
    //        if (conn.pbx == user[0].src) {
    //            log(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateUpdate", "columns": { "guid": user[0].guid, "cn": user[0].cn, "h323": user[0].sip, "e164": user[0].e164, "node": user[0].node, "grps": [{ "name": obj.group, "dyn": "in" }], "devices": user[0].devices,"src": user[0].sip+","+conn.pbx } }));
    //            //log(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateUpdate", "columns": { "guid": user[0].guid, "cn": user[0].cn, "h323": user[0].sip, "grps": { "name": obj.group, "dyn": "in" }, "src": user[0].sip+","+conn.pbx } }));
    //            conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateUpdate", "columns": { "guid": user[0].guid, "cn": user[0].cn, "h323": user[0].sip, "e164": user[0].e164, "node": user[0].node, "grps": [{ "name": obj.group, "dyn": "in" }], "devices": user[0].devices,"src": user[0].sip + "," + conn.pbx } }));
    //        }
    //    })
    //}
    //if (obj.mode === "Logout") {
    //    pbxTable.forEach(function (conn) {
    //        if (conn.pbx == user[0].src) {
    //            log(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateUpdate", "columns": { "guid": user[0].guid, "cn": user[0].cn, "h323": user[0].sip, "e164": user[0].e164, "node": user[0].node, "grps": [{ "name": obj.group, "dyn": "out" }], "devices": user[0].devices, "src": user[0].sip + "," + conn.pbx } }));
    //            conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateUpdate", "columns": { "guid": user[0].guid, "cn": user[0].cn, "h323": user[0].sip, "e164": user[0].e164, "node": user[0].node, "grps": [{ "name": obj.group, "dyn": "out" }], "devices": user[0].devices, "src": user[0].sip + "," + conn.pbx } }));
    //        }
    //    })
    //}
}
/*
function makecallRequest(value) {
    log("danilo-req makecall:value " + String(value));
    var obj = JSON.parse(String(value));

    log("danilo-req makecall:user " + obj.user);
    log("danilo-req makecall:num " + obj.num);

    connectionsUser.forEach(function (connection) {
        if (connection.sip == obj.user) {
            log("danilo-req makecall:connection user" + connection.guid);
            connection.send(JSON.stringify({ api: "user", mt: "MakeCall", num: obj.num }));
        }
        //connection.send(JSON.stringify({ api: "user", mt: "MakeCall", num: obj.num }));
        log("danilo-req makecall:connection NOT user ");
    });
}
*/
function httpClient(url, call) {
    log("danilo-req : httpClient");
    var responseData = "";
    log("danilo-req : httpClient : content" +JSON.stringify(call));
    var req = HttpClient.request("PUT", url);

    req.header("X-Token", "danilo");
    req.contentType("application/json");
    req.onsend(function (req) {
        req.send(new TextEncoder("utf-8").encode(JSON.stringify(call)), true);
    });
    req.onrecv(function (req, data, last) {
        responseData += new TextDecoder("utf-8").decode(data);
        if (!last) req.recv();
    },1024);
    req.oncomplete(function (req, success) {
        log("danilo-req : HttpRequest complete");
        log("danilo-req : HttpRequest responseData "+ responseData);
    })
        .onerror(function (error) {
            log("danilo-req : HttpRequest error=" + error);
        });

}


function callRCC(ws,user,mode,num,sip) {
    if (mode == "UserInitialize") {
        var msg = { api: "RCC", mt: "UserInitialize", cn: user, src: sip };
        ws.send(JSON.stringify(msg));
    }
    else if (mode == "Device") {
        var msg = { api: "RCC", mt: "Devices", cn: user, src: sip };
        ws.send(JSON.stringify(msg));
    }
    else if (mode == "UserCall") {
        log("danilo-req UserCall:sip " + sip);
        var msg = { api: "RCC", mt: "UserCall", user: user, e164: num, src: sip };
        log("danilo req callRCC: UserCall sent rcc msg " + JSON.stringify(msg));
        ws.send(JSON.stringify(msg));


        //RCC.forEach(function (rcc) {
        //    var user = rcc[sip];
        //    if (user != null) {
        //        var msg = { api: "RCC", mt: "UserCall", user: user, e164: num, src: sip };
        //        log("danilo req callRCC: UserCall sent rcc msg " + JSON.stringify(msg));
        //        ws.send(JSON.stringify(msg));
        //    }
        //})

        //connectionsUser.forEach(function (conn) {
        //    if (conn.sip == sip) {
        //        var msg = { api: "RCC", mt: "UserCall", user: conn.user, e164: num, src: sip };
        //        log("danilo req : UserCall sent rcc msg "+JSON.stringify(msg));
        //        ws.send(JSON.stringify(msg));
        //    } else {
        //        log("danilo req : UserCall rcc NOT found");
        //    }
        //})
    }
    else if (mode == "UserClear") {
        var myArray = sip.split(",");
        var sip = myArray[0];
        var pbx = myArray[1];
        calls.forEach(function (call) {
            log("danilo-req UserClear:sip " + sip);
            log("danilo-req UserClear:call " + JSON.stringify(call));
            log("danilo-req UserClear:call.callid " + JSON.stringify(call.callid));
            log("danilo-req UserClear:call.sip " + JSON.stringify(call.sip));
            if (call.sip == sip) {

                var msg = { api: "RCC", mt: "UserClear", call: call.callid, src: call.sip };
                log("danilo req callRCC: UserClear sent rcc msg " + JSON.stringify(msg));
                ws.send(JSON.stringify(msg));
            }

        })
    }
    else if (mode == "UserHold") {
        var myArray = sip.split(",");
        var sip = myArray[0];
        var pbx = myArray[1];
        calls.forEach(function (call) {
            if (call.sip == sip) {
                var msg = { api: "RCC", mt: "UserHold", call: call.callid, remote:true, src: call.sip };
                ws.send(JSON.stringify(msg));
            }

        })
    }
    else if (mode == "UserRetrieve") {
        var myArray = sip.split(",");
        var sip = myArray[0];
        var pbx = myArray[1];
        calls.forEach(function (call) {
            if (call.sip == sip) {
                var msg = { api: "RCC", mt: "UserRetrieve", call: call.callid, src: call.sip };
                ws.send(JSON.stringify(msg));
            }

        })
    }
    else if (mode == "UserRedirect") {
        var myArray = sip.split(",");
        var sip = myArray[0];
        var pbx = myArray[1];
        calls.forEach(function (call) {
            if (call.sip == sip) {
                var msg = { api: "RCC", mt: "UserRedirect", call: call.callid, e164: num, src: call.sip };
                ws.send(JSON.stringify(msg));
            }

        })
    }
    else if (mode == "UserConnect") {
        var myArray = sip.split(",");
        var sip = myArray[0];
        var pbx = myArray[1];
        calls.forEach(function (call) {
            log("danilo-req UserConnect:sip " + sip);
            log("danilo-req UserConnect:call " + JSON.stringify(call));
            log("danilo-req UserConnect:call.callid " + JSON.stringify(call.callid));
            log("danilo-req UserConnect:call.sip " + JSON.stringify(call.sip));
            if (call.sip == sip) {
                var msg = { api: "RCC", mt: "UserConnect", call: call.callid, src: call.sip };
                ws.send(JSON.stringify(msg));
            }

        })
    }
}

function insertCall(obj) {
    var e164 = obj.peer.e164;
    var myArray = obj.src.split(",");
    var src = myArray[0];
    if (e164 == "") {
        calls.push({ sip: String(src), callid: obj.call, num: obj.peer.h323, state: obj.state });
    } else {
        calls.push({ sip: String(src), callid: obj.call, num: obj.peer.e164, state: obj.state });
    }
    log("danilo req insertCall: call inserted " + JSON.stringify(calls));
}
function deleteCall(obj) {
    log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + obj.local.h323);
    calls.splice(calls.indexOf(obj.local.h323), 1);
    log("danilo req : after deleteCall " + JSON.stringify(calls));
}
function deleteCallsBySrc(src) {
    return function (value) {
        if (value.sip != src) {
            return true;
        }
        //countInvalidEntries++
        return false;
    }
}

function getURLLogin(sip) {

    var msg = { user: sip, client: codClient };
    log("danilo req : getURLLogin url" + urlSSO);
    log("danilo req : getURLLogin msg" + JSON.stringify(msg));

    var responseData = "";
    var req = HttpClient.request("POST", urlSSO);
    req.header("X-Token", "danilo");
    req.contentType("application/json");
    req.onsend(function (req) {
        req.send(new TextEncoder("utf-8").encode(JSON.stringify(msg)), true);
    });
    req.onrecv(function (req, data, last) {
        responseData += new TextDecoder("utf-8").decode(data);
        if (!last) req.recv();
    }, 1024);
    req.oncomplete(function (req, success) {
        log("danilo-req : getURLLogin complete");
        log("danilo-req : getURLLogin responseData " + responseData);

        var obj = JSON.parse(responseData);
        if (obj.status == "success") {
            connectionsUser.forEach(function (conn) {
                if (conn.sip == sip) {
                    conn["url"] = obj.token;
                    var url = Config.url;
                    var urlAlt = conn["url"];
                    log("danilo req : getLoginResponse sip " + conn.sip);
                    if (urlAlt != "") {
                        url = url + conn.sip + "/" + urlAlt;
                        log("danilo req : UserMessage url " + url);

                    }
                    conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", src: url }));
                }
            })
            //Atualiza connections 
            //updateConnections(sip, "url", obj.token,"");

        } else {
            log("danilo req : getLoginResponse " + obj.msg);
            connectionsUser.forEach(function (conn) {
                if (conn.sip == sip) {
                    var url = Config.url;
                    var urlAlt = "";
                    log("danilo req : getLoginResponse sip " + conn.sip);
                    if (urlAlt != "") {
                        url = url + conn.sip + "/" + urlAlt;
                        log("danilo req : UserMessage url " + url);

                    }
                    conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", src: url }));
                }
            })
        }
        
    })
        .onerror(function (error) {
            log("danilo-req : getURLLogin error=" + error);
        });

}

function getQueueGroups() {

    var msg = { user: "", client: "" };
    log("danilo req : getGroups url" + urlGetGroups);
    log("danilo req : getGroups msg" + JSON.stringify(msg));

    var responseData = "";
    var req = HttpClient.request("POST", urlGetGroups);
    req.header("X-Token", "danilo");
    req.contentType("application/json");
    req.onsend(function (req) {
        req.send(new TextEncoder("utf-8").encode(JSON.stringify(msg)), true);
    });
    req.onrecv(function (req, data, last) {
        responseData += new TextDecoder("utf-8").decode(data);
        if (!last) req.recv();
    }, 1024);
    req.oncomplete(function (req, success) {
        log("danilo-req : getGroups complete");
        log("danilo-req : getGroups responseData " + responseData);

        var obj = JSON.parse(responseData);
        if (obj.status == "success") {
            //Atualiza connections 
            queues = JSON.parse(obj.msg)
            initializeQueues(queues);

        } else {
            log("danilo req : getGroupsResponse " + obj.msg);
        }
    })
        .onerror(function (error) {
            log("danilo-req : getGroups error=" + error);
        });

}

function delConnectionsByCall(call) {
    return function (value) {
        if (value.call != call) {
            return true;
        }
        //countInvalidEntries++
        return false;
    }
}
/*
function updateConnections(sip, prt, value, area) {

    connections.forEach(function (conn) {
        if (conn.sip == sip) {
            switch (prt) {
                case "name": {
                    conn.name = value
                    break
                }
                case "call": {
                    conn.call = value
                    break
                }
                case "user": {
                    if (conn.area == "") {
                        conn.user = value
                        conn.area = area
                    } else {
                        if (conn.user != value && conn.area != area) {
                            //Adiciona Initialize From WebService
                            log("updateConnections because user is diferent for the same SIP: connections before add " + JSON.stringify(connections));
                            connections.push({ sip: conn.sip, call: conn.call, name: conn.name, user: value, url: conn.url, area: area });
                            log("updateConnections because user is diferent for the same SIP: connections after add " + JSON.stringify(connections));
                        }
                    }
                    break
                }
                case "area": {
                    conn.area = area
                    break
                }
                case "url": {
                    conn.url = value
                    break
                }
            }

        }
    })
}
*/
function initializeQueues() {
    log("danilo-req : initializeQueues:: queues");
    //queues = JSON.parse(msg)
    queues.forEach(function (q) {
        log("danilo-req : initializeQueues:: queue: " + JSON.stringify(q));
        RCC.forEach(function (rcc) {
            if (rcc.pbx == q.Nome && !rcc[q.Fila]) {
                var msg = { api: "RCC", mt: "UserInitialize", cn: q.Fila, src: q.Fila + "," + q.Nome };
                rcc.send(JSON.stringify(msg));
            }
        })
    })
    //queues = msg.split(",");
    //queues.forEach(function (q) {
        //log("danilo-req : initializeQueues:: queue: " + q);
        //RCC.forEach(function (rcc) {
        //    if (rcc.pbx == q.Nome) {
                
        //    }
        //})
        //connectionsRCC.forEach(function (c) {
        //    callRCC(c.ws, q, "UserInitialize", "", q);
        //})
        
    //})
}

