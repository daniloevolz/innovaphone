// the variables
var licenseAppToken = Config.licenseAppToken;
if (licenseAppToken == "") {
    var rand = Random.bytes(16);
    Config.licenseAppToken = String(rand);
    Config.save();
}
var license = getLicense();

var baseUrl = WebServer.url;
log("danilo req url: " + baseUrl);
var count = 0;
var sendCallHistory = Config.sendCallHistory;
var sendCallEvents = Config.sendCallEvents;
var urlPhoneApiEvents = Config.urlPhoneApiEvents;
var urlCallHistory = Config.urlCallHistory;
var urlDashboard = Config.urldash;
var urlMobile = Config.urlmobile;
var codClient = Config.CodClient;
var codLeaveAllGroups = Config.CodLeaveAllGroups;
var leaveAllGroupsOnStatup = Config.LeaveAllGroupsOnStatup;
var url = Config.url;
var urlSSO = Config.urlSSO;
var urlGetGroups = Config.urlGetGroups;

var connectionsUser = [];
var connectionsAdmin = [];
var connectionsDash = [];
var RCC = [];
var PbxSignal = [];
var PbxSignalUsers = [];
var pbxTable = [];
var pbxTableUsers = [];

var calls = [];

var queues = [];

var httpRequestQueue = [];  // Fila de requisições
var httpBusy = false;  // Variável de controle para verificar se uma requisição está em andamento

//Services APIS
Config.onchanged(function () {
    sendCallHistory = Config.sendCallHistory;
    sendCallEvents = Config.sendCallEvents;
    urlPhoneApiEvents = Config.urlPhoneApiEvents;
    urlCallHistory = Config.urlCallHistory;
    urlDashboard = Config.urldash;
    urlMobile = Config.urlmobile;
    urlSSO = Config.urlSSO;
    codClient = Config.CodClient;
    url = Config.url;
    urlGetGroups = Config.urlGetGroups;
    codLeaveAllGroups = Config.CodLeaveAllGroups;
    leaveAllGroupsOnStatup = Config.LeaveAllGroupsOnStatup;
    licenseAppFile = Config.licenseAppFile;
    licenseInstallDate = Config.licenseInstallDate;
    updateConfigUsers();
});

//WebServers
WebServer.onurlchanged(function (newUrl) {
    baseUrl = newUrl;
    log("danilo req urlchaged: " + baseUrl);
});
WebServer.onrequest("value", function (req) {
    if (req.method == "GET") {
        var valueteste = "Congrats, you are here!\nBig dev, from Wecom..";
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

log("pietro req: License " + JSON.stringify(license));
if (license != null && license.System == true) {
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


    var msg = { user: "", client: "" };
    httpClient(urlGetGroups, "POST", msg, function(responseData) {

        try {
            var obj = JSON.parse(responseData);
            if (obj.status == "success") {
                //Atualiza connections 
                queues = JSON.parse(obj.msg)
                initializeQueues(queues);

            } else {
                log("danilo req : getGroupsResponse " + obj.msg);
            }
        } catch (e) {
            log("danilo req : getGroupsResponse Erro" + e);
        }
    });
}

//JSON APIS
new JsonApi("user").onconnected(function (conn) {
    log("danilo req : User Connection " + JSON.stringify(conn));
    if (conn.app == "wecom-wecall") {
        license = getLicense();
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            var info = JSON.parse(conn.info);
            log("danilo-req : wecom-wecall");
            if (license != null && connectionsUser.length <= license.Users) {
                if (obj.mt == "UserSession") {
                    var foundConn = connectionsUser.filter(function (c) { return c.sip == conn.sip });
                    if(foundConn.length>0){
                        conn.send(JSON.stringify({ api: "user", mt: "UserSessionResultDuplicated", result: "Login duplicado! Identifiamos uma sessão já aberta no seguinte local: " + foundConn[0].sessionInfo }));
                    }else{
                        var session = Random.bytes(16);
                        conn.send(JSON.stringify({ api: "user", mt: "UserSessionResult", session: session }));
                    }
                    }
                if (obj.mt == "CallHistoryEvent") {
                    log("danilo-req : CallHistoryEvent");
                    if (sendCallHistory) {
                        log("danilo-req : CallHistoryEvent=true");
                        httpClient(urlCallHistory,"PUT", obj.obj, null);
                    }
                }
                if (obj.mt == "DeviceSelected") {
                    var src = obj.src;
                    log("SPLIT1:");
                    var myArray = src.split(",");
                    var sip = myArray[0];
                    var pbx = myArray[1];
                    var user = pbxTableUsers.filter(function (user) { return user.columns.h323 === conn.sip });
                    var hw = user[0].columns.devices.filter(function (device) { return device.hw === obj.hw })[0];
                    RCC.forEach(function (rcc) {
                        if (rcc.pbx == info.pbx) {
                            log("DeviceSeclected: calling RCC API for new userclient " + String(conn.dn) + " on PBX " + info.pbx);
                            var msg = { api: "RCC", mt: "UserInitialize", hw: hw, cn: conn.dn, src: conn.sip + "," + info.pbx };
                            rcc.send(JSON.stringify(msg));

                            connectionsUser.forEach(function (c) {
                                if (c.sip == conn.sip) {
                                    c.hw = hw;
                                }
                            })
                            log("DeviceSeclected: connectionsUser updated including the new hardware for userclient " + String(conn.dn) + " on connectionsUser " + JSON.stringify(connectionsUser));
                        }
                    })
                    getURLLogin(conn.sip);
                }
                if (obj.mt == "InitializeMessage") {
                    try {
                        if (connectionsUser.length > 0) {
                            var foundConn = connectionsUser.filter(function (c) { return c.session == obj.session });
                            if (foundConn.length==0) {
                                log("connectionsUser: not found conn");
                                conn["session"] = obj.session;
                                conn["sessionInfo"] = obj.info;
                                connectionsUser.push(conn);
                            }
                        } else {
                            log("connectionsUser: connectionsUser.length == 0");
                            conn["session"] = obj.session;
                            conn["sessionInfo"] = obj.info;
                            connectionsUser.push(conn);
                            log("connectionsUser: connectionsUser.push =" + JSON.stringify(connectionsUser));
                        }

                        RCC.forEach(function (rcc) {
                            if (rcc.pbx == info.pbx) {
                                var temp = rcc[String(conn.sip)];
                                log("danilo req : User Connection conn.sip:temp " + temp);
                                if (temp == null && rcc.pbx == info.pbx) {
                                    log("danilo req : User Connection calling RCC API for new userclient " + String(conn.dn) + " on PBX " + info.pbx);
                                    var msg = { api: "RCC", mt: "UserInitialize", cn: String(conn.dn), src: conn.sip + "," + info.pbx };
                                    rcc.send(JSON.stringify(msg));

                                    if (sendCallEvents) {
                                        log("danilo-req : connectionUser:login:sendCallEvents=true");
                                        var msg = { User: conn.sip, Grupo: "", Callinnumber: "", Status: "login" };
                                
                                        httpClient(urlPhoneApiEvents, "PUT", msg, false);
                                    }

                                }else{
                                    log("danilo req : User Connection conn.sip:temp already exists " + temp);
                                }
                            }
                        })
                        log("danilo req : calling getURLLogin: " + conn.sip);
                        getURLLogin(conn.sip, obj.session);

                    } catch (e) {
                        log("danilo req : User Connection Erro RCC has null, please try again in a few moments " + e);
                    }
                }
                if (obj.mt == "AddMessage") {
                    Config.url = obj.url;
                    Config.save();
                    var url = Config.url;
                    conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", src: url }));
                }
            } else {
                log("danilo req: No license Available")
                conn.send(JSON.stringify({ api: "user", mt: "NoLicense", result: String("Por favor, contate o administrador do sistema para realizar o licenciamento.") }));
            }
        });
    }
    conn.onclose(function () {
        log("connectionsUser: disconnected");
        var info = JSON.parse(conn.info);

        //connectionsUser.splice(connectionsUser.indexOf(conn), 1);
        connectionsUser = connectionsUser.filter(function (c) { return c.session != conn.session });
        log("connectionsUser: after delete conn "+JSON.stringify(connectionsUser));

        var userHasMultiConn = connectionsUser.filter(function (c) { return c.sip == conn.sip });
        log("connectionsUser: after delete conn "+JSON.stringify(connectionsUser));
        if(userHasMultiConn.length==0){
            log("connectionsUser: last connection for this user " + conn.sip);
            RCC.forEach(function (rcc) {
                if (rcc.pbx == info.pbx) {
                    var user = rcc[conn.sip];
                    log("connectionsUser: calling RCC API to End user Monitor " + String(conn.sip) + " on PBX " + info.pbx);
                    var msg = { api: "RCC", mt: "UserEnd", user: user, src: conn.sip + "," + info.pbx };
                    rcc.send(JSON.stringify(msg));
                }
            })

            if (sendCallEvents) {
                log("danilo-req : connectionUser:logout:sendCallEvents=true");
                var msg = { User: conn.sip, Grupo: "", Callinnumber: "", Status: "logout" };
                httpClient(urlPhoneApiEvents, "PUT", msg, null);
            }
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
                if (obj.prt == "urlM") {
                    Config.urlmobile = obj.vl;
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
            // license 
            if (obj.mt == "ConfigLicense") {
                var licenseAppToken = Config.licenseAppToken;
                licenseInstallDate = Config.licenseInstallDate;
                licenseAppFile = Config.licenseAppFile;
                var licUsed = connectionsUser.length;
                var licDashUsed = connectionsDash.length;
                var used = "Users:" + licUsed + " Dashboards:" + licDashUsed;
                var lic = decrypt(licenseAppToken, licenseAppFile)
                conn.send(JSON.stringify({
                    api: "admin",
                    mt: "LicenseMessageResult",
                    licenseUsed: used,
                    licenseToken: licenseAppToken,
                    licenseFile: licenseAppFile,
                    licenseActive: JSON.stringify(lic),
                    licenseInstallDate: licenseInstallDate
                }));
            }
            if (obj.mt == "UpdateConfigLicenseMessage") {
                try {
                    var lic = decrypt(obj.licenseToken, obj.licenseFile)
                    log("UpdateConfigLicenseMessage: License decrypted: " + JSON.stringify(lic));
                    Config.licenseAppFile = obj.licenseFile;
                    Config.licenseInstallDate = getDateNow();
                    Config.save();
                    conn.send(JSON.stringify({ api: "admin", mt: "UpdateConfigLicenseMessageSuccess" }));

                } catch (e) {
                    conn.send(JSON.stringify({ api: "admin", mt: "UpdateConfigMessageErro" }));
                    log("ERRO UpdateConfigLicenseMessage:" + e);


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
    connectionsDash.push(conn);
    if (conn.app == "wecom-wecalldash") {
        license = getLicense();
        conn.onmessage(function (msg) {
            var obj = JSON.parse(msg);
            if (license != null && connectionsDash.length <= license.Dashboards) {
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
            } else {
                log("danilo req: No license Available")
                conn.send(JSON.stringify({ api: "dash", mt: "NoLicense", result: String("Por favor, contate o administrador do sistema para realizar o licenciamento.") }));

            }
            });
        conn.onclose(function () {
            log("connectionsDash: disconnected");
            connectionsDash = connectionsDash.filter(removeObjectBySip(conn.sip));
            log("connectionsDash: after delete conn " + JSON.stringify(connectionsDash));
            
        });
    }
});

//PBX APIS
new PbxApi("PbxTableUsers").onconnected(function (conn) {
    //pbxTable.push(conn);
    log("PbxTableUsers: connected " + JSON.stringify(conn));

    // for each PBX API connection an own call array is maintained
    var signalFound = pbxTable.filter(function (pbx) { return pbx.pbx === conn.pbx });
    if (pbxTable.length == 0) {
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
            pbxTableUsers.push(obj)
            conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateNext", "src": conn.pbx }));
        }

        if (obj.mt == "ReplicateAdd") {
            pbxTableUsers.push(obj);
        }
        if (obj.mt == "ReplicateUpdate") {
            var foundTableUser = pbxTableUsers.filter(function (pbx) { return pbx.columns.h323 === obj.columns.h323 });
            log("ReplicateUpdate= foundTableUser " + JSON.stringify(foundTableUser));
            var grps1 = foundTableUser[0].columns.grps;
            var grps2 = obj.columns.grps;
            log("ReplicateUpdate= user " + obj.columns.h323);
            if (grps1) {
                //Obj local do usuario ja possui algum Grupo
                for (var i = 0; i < grps1.length; i++) {
                    try {
                        if (grps2) {
                            //Obj vindo do PBX possui algum Grupo
                            for (var j = 0; j < grps2.length; j++) {
                                if (grps1[i].name === grps2[j].name) {
                                    if (grps1[i].dyn === grps2[j].dyn) {
                                    } else {
                                        log("ReplicateUpdate= user " + obj.columns.h323 + " group presence changed for group " + grps2[j].name + "!!!");
                                        switch (grps2[j].dyn) {
                                            case "out":
                                                if (sendCallEvents) {
                                                    var msg = { User: obj.columns.h323, Grupo: grps2[j].name, Callinnumber: "", Status: "grp_logout" };
                                                    httpClient(urlPhoneApiEvents, "PUT", msg, null);
                                                }
                                                break;
                                            case "in":
                                                if (sendCallEvents) {
                                                    var msg = { User: obj.columns.h323, Grupo: grps2[j].name, Callinnumber: "", Status: "grp_login" };
                                                    httpClient(urlPhoneApiEvents, "PUT", msg, null);
                                                }
                                                break;
                                        }
                                    }
                                }
                            }
                        } else {
                            //Obj vindo do PBX NaO possui Grupo
                            log("ReplicateUpdate= user " + obj.columns.h323 + " received from pbx has no grups at this moment and group presence changed to out for all!!!");
                            log("ReplicateUpdate= user " + obj.columns.h323 + " group presence changed to OUT for group " + grps1[j].name);
                            var msg = { User: obj.columns.h323, Grupo: grps1[j].name, Callinnumber: "", Status: "grp_logout" };
                            httpClient(urlPhoneApiEvents, "PUT", msg, null);
                        }
                    }
                    catch (e) {
                        log("ReplicateUpdate Try2= user " + obj.columns.h323 + " ERRO: " + e);
                    }

                }
            }
            else {
                //Obj local do usuario NaO possui Grupo
                log("ReplicateUpdate= user " + obj.columns.h323 + " stored on app has no grups at this moment and new presence received from pbx!!!");
                if (grps2) {
                    for (var j = 0; j < grps2.length; j++) {
                        log("ReplicateUpdate= user " + obj.columns.h323 + " group presence changed from PBX for group " + grps1[j].name);
                        switch (grps2[j].dyn) {
                            case "out":
                                if (sendCallEvents) {
                                    var msg = { User: obj.columns.h323, Grupo: grps2[j].name, Callinnumber: "", Status: "grp_logout" };
                                    httpClient(urlPhoneApiEvents, "PUT", msg, null);
                                }
                                break;
                            case "in":
                                if (sendCallEvents) {
                                    var msg = { User: obj.columns.h323, Grupo: grps2[j].name, Callinnumber: "", Status: "grp_login" };
                                    httpClient(urlPhoneApiEvents, "PUT", msg, null);
                                }
                                break;
                        }
                    }
                }
            }
            
            var found;
            pbxTableUsers.forEach(function (user) {
                if (user.columns.h323 == obj.columns.h323) {
                    log("ReplicateUpdate: Updating the object for user " + obj.columns.h323)
                    Object.assign(user, obj)
                    found = true;
                }
            })
            if (found == false) {
                log("ReplicateUpdate: Adding the object user " + obj.columns.h323+" because it not exists here before");
                pbxTableUsers.push(obj);
            }

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
    var signalFound = PbxSignal.filter(function (signal) { return signal.pbx === conn.pbx });
    if (signalFound.length == 0) {
        PbxSignal.push(conn);
        log("PbxSignal: connected PbxSignal " + JSON.stringify(PbxSignal));
        // register to the PBX in order to acceppt incoming presence calls
        conn.send(JSON.stringify({ "api": "PbxSignal", "mt": "Register", "flags": "NO_MEDIA_CALL", "src": conn.pbx }));
    }
    
    conn.onmessage(function (msg) {
        var obj = JSON.parse(msg);
        log("PbxSignal msg: " + msg);

        if (obj.mt === "RegisterResult") {
            log("PBXSignal: registration result " + JSON.stringify(obj));
        }

        // handle incoming presence_subscribe call setup messages
        // the callid "obj.call" required later for sending badge notifications
        if (obj.mt === "Signaling" && obj.sig.type === "setup" && obj.sig.fty.some(function (v) { return v.type === "presence_subscribe" })) {

            log("PbxSignal: incoming presence subscription for user " + obj.sig.cg.sip);

            // connect call
            conn.send(JSON.stringify({ "mt": "Signaling", "api": "PbxSignal", "call": obj.call, "src": obj.sig.cg.sip + "," + obj.src, "sig": { "type": "conn" } }));

            //Update signals
            var src = obj.src;
            var myArray = src.split(",");
            var pbx = myArray[0];
            
            //Teste Danilo 05/08: armazenar o conteudo call em nova lista
            var sip = obj.sig.cg.sip;
            var call = obj.call;
            var callData = { call, sip };
            //Adiciona o PBX2 no objeto caso ele não exista
            if (!PbxSignalUsers[pbx]) {
                PbxSignalUsers[pbx] = [];
                PbxSignalUsers[pbx].push(callData);
            } else {
                PbxSignalUsers[pbx].push(callData);
            }
            //Teste Danilo 05/08: armazenar o conteudo call em nova lista

            log("PbxSignalUsers: after add new userclient " + JSON.stringify(PbxSignalUsers));
            var name = "";
            var myArray = obj.sig.fty;
            myArray.forEach(function (fty) {
                if (fty.name) {
                    name = fty.name;
                }
            })
            // send notification with badge count first time the user has connected
            log("PbxSignal:pbxTable=" + JSON.stringify(pbxTable));
            var user = pbxTableUsers.filter(function (item) {
                return item.columns.h323 === obj.sig.cg.sip;
            })[0];
            log("PbxSignal:connUser=" + JSON.stringify(user));
            //We can update the initial value, but we ignor it, wecall update every 20s...
            //updateBadge2(obj.sig.cg.sip, dataPosts.length)
        }

        // handle incoming call release messages
        if (obj.mt === "Signaling" && obj.sig.type === "rel") {
            //Remove signals
            //log("PBXSignal: connections before delete result " + JSON.stringify(PbxSignal));
            var src = obj.src;
            var myArray = src.split(",");
            var sip = "";
            var pbx = myArray[0];
            removeObjectByCall(PbxSignalUsers, pbx, obj.call);

            log("PBXSignalUsers: connections after delete result " + JSON.stringify(PbxSignalUsers));
        }
    });

    conn.onclose(function () {
        //Remove cennection from array
        PbxSignal = PbxSignal.filter(function (c) { return c.pbx != conn.pbx });
        log("PbxSignal: disconnected");
        //PbxSignal.splice(PbxSignal.indexOf(conn), 1);
        //connectionsPbxSignal.splice(connectionsPbxSignal.indexOf(conn), 1);
    });
});

new PbxApi("RCC").onconnected(function (conn) {
    log("RCC: connected conn " + JSON.stringify(conn));
    var rccFound = RCC.filter(function (rcc) { return rcc.pbx === conn.pbx });
    if (rccFound.length == 0) {
        RCC.push(conn);
        log("RCC: connected RCC " + JSON.stringify(RCC));
    }
    
    initializeQueues();

    //conn.send(JSON.stringify({ "api": "RCC", "mt": "Initialize", "limit": 50, "calls":true }));

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
                var userC = connectionsUser.filter(function (userC) { return userC.sip === sip });
                var msg = { api: "user", mt: "MakeCall", num: codLeaveAllGroups, src: sip };
                userC[0].send(JSON.stringify(msg));
            }
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
            var num;
            //Define num
            try {
                if (obj.peer.e164 !== undefined && obj.peer.e164 !== "") {
                    num = obj.peer.e164;
                    log("danilo req : RCC message:CallUpdate: num = obj.local.e164;");
                } else if (obj.peer.h323 !== undefined && obj.peer.h323 !== "") {
                    num = obj.peer.h323;
                    log("danilo req : RCC message:CallUpdate: num = obj.peer.h323");
                } else {
                    // Se nenhum dos parâmetros estiver definido, ignore o evento
                    log("danilo req : RCC message:CallUpdate: num = null");
                    return;
                }
            }
            catch (e) {
                log("danilo req : RCC message:CallUpdate NUM Catch "+e);
                if (obj.peer.e164 !== undefined && obj.peer.e164 !== "") {
                    num = obj.peer.e164;
                    log("danilo req : RCC message:CallUpdate:Catch num = obj.local.e164;");
                } else {
                    // Se o parâmetro local.e164 não estiver definido, ignore o evento
                    log("danilo req : RCC message:CallUpdate:Catch num = null");
                    return;
                }
            }

            log("danilo-req : RCC message::CallInfo for user src " + sip);
            //var foundIndex = connectionsPbxSignal[0].sip.indexOf(obj.src);
            //log("danilo-req : RCC message::CallInfo user src foundIndex " + foundIndex);
            var foundCall = calls.filter(function (call) { return call.sip === sip });

            if (String(foundCall) == "") {
                log("danilo-req : RCC message::CallInfo NOT foundCall ");
                if (obj.state == 1 || obj.state == 129) {
                    log("danilo-req : RCC message:: obj.state == 1 || obj.state == 129");
                    //var e164 = obj.peer.e164;
                    var myArray = obj.src.split(",");
                    var src = myArray[0];
                    calls.push({ sip: String(src), callid: obj.call, num: num, state: obj.state });
                    log("danilo-req : RCC message:: call after insertion "+JSON.stringify(calls));
                    // if (e164 == "") {
                    //     calls.push({ sip: String(src), callid: obj.call, num: num, state: obj.state });
                    // } else {
                    //     calls.push({ sip: String(src), callid: obj.call, num: obj.peer.e164, state: obj.state });
                    // }
                    log("danilo req : RCC message:: call inserted " + JSON.stringify(calls));

                    switch (obj.state) {
                        case 4:
                            //Ativa (Alert)
                            if (sendCallEvents) {
                                log("danilo-req : RCC message::sendCallEvents=true");
                                //var e164 = obj.peer.e164;
                                if (queues.some(function (v) { return v.Fila === sip })) {
                                    var msg = { User: "", Grupo: sip, Callinnumber: num, Status: "out" };
                                    // if (e164 == "") {
                                    //     var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "out" };
                                    // } else {
                                    //     var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "out" };
                                    // }
                                } else {
                                    var msg = { User: sip, Grupo: "", Callinnumber: num, Status: "out" };
                                    // if (e164 == "") {
                                    //     var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "out" };
                                    // } else {
                                    //     var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "out" };
                                    // }
                                }
                                httpClient(urlPhoneApiEvents, "PUT", msg, null);
                            }
                            break;
                        case 132:
                            //Receptiva (Alert)
                            if (sendCallEvents) {
                                log("danilo-req : RCC message::sendCallEvents=true");
                                //var e164 = obj.peer.e164;
                                if (queues.some(function (v) { return v.Fila === sip })) {
                                    var msg = { User: "", Grupo: sip, Callinnumber: num, Status: "inc" };
                                    // if (e164 == "") {
                                    //     var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "inc" };
                                    // } else {
                                    //     var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "inc" };
                                    // }
                                } else {
                                    var msg = { User: sip, Grupo: "", Callinnumber: num, Status: "inc" };
                                    // if (e164 == "") {
                                    //     var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "inc" };
                                    // } else {
                                    //     var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "inc" };
                                    // }
                                }
                                httpClient(urlPhoneApiEvents, "PUT", msg, null);
                            }
                            break;
                    }
                }
            }
            else {
                log("danilo-req : RCC message::CallInfo foundCall " + JSON.stringify(foundCall));
                var cause;
                var message;
                if (obj.cause) cause = obj.cause;
                if (obj.msg) message = obj.msg;
                calls.forEach(function (call) {
                    if (call.sip == sip) {
                        if (call.callid < obj.call && cause !=26) {
                            call.callid = obj.call;
                        }
                        if (call.state < obj.state && cause != 26) {
                            //Condicao de fuga dos states malucos que surgem eventualmente em Park ou Hold
                            if (obj.state == 4 || obj.state == 5 || obj.state == 132 || obj.state == 133) {
                                call.state = obj.state;
                            }
                            switch (obj.state) {
                                case 4:
                                    //Ativa (Alert)
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message:4:sendCallEvents=true");
                                        //var e164 = obj.peer.e164;
                                        if (queues.some(function (v) { return v.Fila === sip })) {
                                            var msg = { User: "", Grupo: sip, Callinnumber: num, Status: "out" };
                                            // if (e164 == "") {
                                            //     var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "out" };
                                            // } else {
                                            //     var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "out" };
                                            // }
                                        } else {
                                            var msg = { User: sip, Grupo: "", Callinnumber: num, Status: "out" };
                                            // if (e164 == "") {
                                            //     var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "out" };
                                            // } else {
                                            //     var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "out" };
                                            // }
                                        }
                                        httpClient(urlPhoneApiEvents, "PUT", msg, null);
                                    }
                                    break;
                                case 132:
                                    //Receptiva (Alert)
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message:132:sendCallEvents=true");
                                        //var e164 = obj.peer.e164;
                                        if (queues.some(function (v) { return v.Fila === sip })) {
                                            var msg = { User: "", Grupo: sip, Callinnumber: num, Status: "inc" };
                                            // if (e164 == "") {
                                            //     var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "inc" };
                                            // } else {
                                            //     var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "inc" };
                                            // }
                                        } else {
                                            var msg = { User: sip, Grupo: "", Callinnumber: num, Status: "inc" };
                                            // if (e164 == "") {
                                            //     var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "inc" };
                                            // } else {
                                            //     var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "inc" };
                                            // }
                                        }
                                        httpClient(urlPhoneApiEvents, "PUT", msg, null);
                                    }
                                    break;
                                case 5:
                                    //Ativa (Connected)
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message:5:sendCallEvents=true");
                                        //var e164 = obj.peer.e164;
                                        if (queues.some(function (v) { return v.Fila === sip })) {
                                            var msg = { User: "", Grupo: sip, Callinnumber: num, Status: "ans" };
                                            // if (e164 == "") {
                                            //     var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "ans" };
                                            // } else {
                                            //     var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "ans" };
                                            // }
                                        } else {
                                            var msg = { User: sip, Grupo: "", Callinnumber: num, Status: "ans" };

                                            // if (e164 == "") {
                                            //     var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "ans" };
                                            // } else {
                                            //     var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "ans" };
                                            // }
                                        }
                                        httpClient(urlPhoneApiEvents, "PUT", msg, null);
                                    }
                                    break;
                                case 133:
                                    //Receptiva (Connected)
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message:133:sendCallEvents=true");
                                        //var e164 = obj.peer.e164;
                                        if (queues.some(function (v) { return v.Fila === sip })) {
                                            var msg = { User: "", Grupo: sip, Callinnumber: num, Status: "ans" };
                                            // if (e164 == "") {
                                            //     var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "ans" };
                                            // } else {
                                            //     var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "ans" };
                                            // }
                                        } else {
                                            var msg = { User: sip, Grupo: "", Callinnumber: num, Status: "ans" };
                                            // if (e164 == "") {
                                            //     var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "ans" };
                                            // } else {
                                            //     var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "ans" };
                                            // }
                                        }
                                        httpClient(urlPhoneApiEvents, "PUT", msg, null);
                                    }
                                    break;
                                case 6:
                                    //Ativa (Disconnect Sent)
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message:6:sendCallEvents=true");
                                        //var e164 = obj.peer.e164;
                                        if (queues.some(function (v) { return v.Fila === sip })) {
                                            var msg = { User: "", Grupo: sip, Callinnumber: num, Status: "del", Direction: "out" };

                                            // if (e164 == "") {
                                            //     var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "del" };
                                            // } else {
                                            //     var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "del" };
                                            // }
                                        } else {
                                            var msg = { User: sip, Grupo: "", Callinnumber: num, Status: "del", Direction: "out" };
                                            // if (e164 == "") {
                                            //     var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "del" };
                                            // } else {
                                            //     var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "del" };
                                            // }
                                        }
                                        httpClient(urlPhoneApiEvents, "PUT", msg, null);
                                    }
                                    //Remove
                                    log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + sip);
                                    calls = calls.filter(removeObjectBySip(sip));
                                    log("danilo req : after deleteCall " + JSON.stringify(calls));
                                    break;
                                case 7:
                                    //Ativa (Disconnect Received)
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message:7:sendCallEvents=true");
                                        //var e164 = obj.peer.e164;
                                        if (queues.some(function (v) { return v.Fila === sip })) {
                                            var msg = { User: "", Grupo: sip, Callinnumber: num, Status: "del", Direction: "inc" };
                                            // if (e164 == "") {
                                            //     var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "del" };
                                            // } else {
                                            //     var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "del" };
                                            // }
                                        } else {
                                            var msg = { User: sip, Grupo: "", Callinnumber: num, Status: "del", Direction: "inc" };
                                            // if (e164 == "") {
                                            //     var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "del" };
                                            // } else {
                                            //     var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "del" };
                                            // }
                                        }
                                        httpClient(urlPhoneApiEvents, "PUT", msg,null);
                                    }
                                    //Remove
                                    log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + sip);
                                    calls = calls.filter(removeObjectBySip(sip));
                                    log("danilo req : after deleteCall " + JSON.stringify(calls));
                                    break;
                                case 134:
                                    //Receptiva (Disconnect Sent)
                                    log("danilo-req : RCC message:134:obj.msg " + message);
                                    if (message == 'r-rel' || message == 'x-rel') {
                                        log("danilo-req : RCC message:134:obj.msg == x-rel || r-rel");
                                        if (sendCallEvents) {
                                            log("danilo-req : RCC message:134:sendCallEvents=true");
                                            //var e164 = obj.peer.e164;
                                            if (queues.some(function (v) { return v.Fila === sip })) {
                                                var msg = { User: "", Grupo: sip, Callinnumber: num, Status: "del", Direction: "out" };
                                                // if (e164 == "") {
                                                //     var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "del" };
                                                // } else {
                                                //     var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "del" };
                                                // }
                                            } else {
                                                var msg = { User: sip, Grupo: "", Callinnumber: num, Status: "del", Direction: "out" };
                                                // if (e164 == "") {
                                                //     var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "del" };
                                                // } else {
                                                //     var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "del" };
                                                // }
                                            }
                                            httpClient(urlPhoneApiEvents, "PUT", msg,null);
                                        }
                                        //Remove
                                        log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + sip);
                                        calls = calls.filter(removeObjectBySip(sip));
                                        log("danilo req : after deleteCall " + JSON.stringify(calls));
                                    }
                                    break;
                                case 135:
                                    //Receptiva (Disconnect Received)
                                    //log("danilo-req : RCC message:135:obj.del " + del);
                                    log("danilo-req : RCC message:135:");
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message:135:sendCallEvents=true");
                                        //var e164 = obj.peer.e164;
                                        if (queues.some(function (v) { return v.Fila === sip })) {
                                            var msg = { User: "", Grupo: sip, Callinnumber: num, Status: "del", Direction: "inc" };
                                            // if (e164 == "") {
                                            //     var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.h323, Status: "del" };
                                            // } else {
                                            //     var msg = { User: "", Grupo: sip, Callinnumber: obj.peer.e164, Status: "del" };
                                            // }
                                        } else {
                                            var msg = { User: sip, Grupo: "", Callinnumber: num, Status: "del", Direction: "inc" };
                                            // if (e164 == "") {
                                            //     var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "del" };
                                            // } else {
                                            //     var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "del" };
                                            // }
                                        }
                                        httpClient(urlPhoneApiEvents, "PUT", msg,null);
                                    }
                                    //Remove
                                    log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + sip);
                                    calls = calls.filter(removeObjectBySip(sip));
                                    log("danilo req : after deleteCall " + JSON.stringify(calls));
                                    //if (del == true) {

                                    //}

                                    break;
                            }
                        }
                        
                    }
                })
                var foundCall = calls.filter(function (call) { return call.sip === sip });
                log("danilo-req : RCC message::CallInfo UPDATED foundCall " + JSON.stringify(foundCall));
            }
        }
    });
    conn.onclose(function () {
        log("RCC: disconnected");
        RCC.splice(RCC.indexOf(conn), 1);
    });
});

//Helper functions
//Return Date String
function getDateNow() {
    // Cria uma nova data com a data e hora atuais em UTC
    var date = new Date();
    // Adiciona o deslocamento de GMT-3 às horas da data atual em UTC
    date.setUTCHours(date.getUTCHours() - 3);

    // Formata a data e hora em uma string ISO 8601 com o caractere "T"
    var dateString = date.toISOString();

    // Substitui o caractere "T" por um espaço
    dateString = dateString.replace("T", " ");

    // Retorna a string no formato "AAAA-MM-DD HH:mm:ss.sss"
    return dateString.slice(0, -5);
}
//Return license decrypted from Config
function getLicense() {
    var key = Config.licenseAppToken;
    var hash = Config.licenseAppFile;
    var lic;
    if (key != "" && hash != "") {
        lic = decrypt(key, hash);
    }
    return lic;
}
//Decrypt license
function decrypt(key, hash) {
    //var iv = iv.substring(0, 16);
    log("key: " + key)
    log("hash: " + hash)
    // encryption using AES-128 in CTR mode
    var ciphertext = Crypto.cipher("AES", "CTR", key, true).iv(key).crypt(hash);
    log("Crypted: " + ciphertext);
    // decryption using AES-128 in CTR mode
    var decrypted = Crypto.cipher("AES", "CTR", key, false).iv(key).crypt(hash);
    log("Decrypted: " + decrypted);
    // now decrypted contains the plain text again

    return JSON.parse(decrypted);
}
//Function to update Admins after Update Config
function updateConfigUsers() {
    log("danilo-req updateConfigUsers:");
    connectionsAdmin.forEach(function (connection) {
        log("danilo-req updateConfigUsers:connection user" + connection.guid);
        connection.send(JSON.stringify({ api: "admin", mt: "UpdateConfigResult", sH: sendCallHistory, sP: sendCallEvents, urlP: String(urlPhoneApiEvents), urlH: String(urlCallHistory), urlD: String(urlDashboard), urlSSO: String(urlSSO), CodCli: String(codClient), url: String(url), urlG: String(urlGetGroups), urlM: String(urlMobile), CodLeave: String(codLeaveAllGroups), sLS: leaveAllGroupsOnStatup}));
    });
}
//Function called by WebServer.onrequest("badge")
function badgeRequest2(value) {

    log("danilo-req badge2:value " + JSON.stringify(value));
    var obj = JSON.parse(value);

    obj.listuser.forEach(function (user) {
        //Update Badge
        
        try {
            updateBadge2(user.user, user.num)
            // var count = 0;

            // PbxSignal.forEach(function (signal) {
            //     log("danilo-req badge2: signal" + JSON.stringify(signal));
            //     //var call = signal[obj.sip];
            //     //Teste Danilo 20/07:
            //     var foundCalls = [];
            //     for (var key in signal) {
            //         if (Object.prototype.hasOwnProperty.call(signal, key) && signal[key] == user.user) {
            //             foundCalls.push(key);
            //         }
            //     }
            //     //
            //     log("danilo-req: badge2:call = " + foundCalls);
            //     if (foundCalls.length > 0) {
            //         log("danilo-req badge2 call " + foundCalls + ", will call updateBadge");
            //         try {
            //             foundCalls.forEach(function (call) {
            //                 updateBadge(signal, parseInt(call, 10), user.num);
            //             })

            //         } catch (e) {
            //             log("danilo-req badge2: User " + user.user + " Erro " + e)
            //         }
            //     }

            // })

        }
        catch (e) {
            log("danilo req: erro send badge: " + e);
        }
    });
}
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
function updateBadge2(sip, count) {
    //Update Badge
    try {
        for (var pbx in PbxSignalUsers) {
            if (PbxSignalUsers.hasOwnProperty(pbx)) {
                var entry = PbxSignalUsers[pbx];
                entry.forEach(function (e) {
                    if (e.sip == sip) {
                        log('danilo-req updateBadge: PBX:', pbx, ', Call:', e.call, ', Sip:', e.sip);
                        var signal = PbxSignal.filter(function (item) {
                            return item.pbx === pbx;
                        })[0];
                        var msg = {
                            "api": "PbxSignal", "mt": "Signaling", "call": parseInt(e.call, 10), "src": "badge",
                            "sig": {
                                "type": "facility",
                                "fty": [{ "type": "presence_notify", "status": "open", "note": "#badge:" + count, "contact": "app:" }]
                            }
                        };
                        if (signal) {
                            log("danilo-req updateBadge:msg " + JSON.stringify(msg));
                            signal.send(JSON.stringify(msg));
                        }
                    }
                })
            }
        }
    }
    catch (e) {
        log("danilo req: erro send badge: " + e);
    }
}
//Function called by WebServer.onrequest("rcc")
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
            queues = queues.filter(removeObjectBySip(obj.user));
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
        var userC = connectionsUser.filter(function (userC) { return userC.sip === obj.sip });
        var user;
        RCC.forEach(function (rcc) {
            var temp = rcc[String(obj.sip)];
            log("danilo-req rccRequest:temp " + temp);
            if (temp != null) {
                user = temp;
                log("danilo-req rccRequest:wil call RCC for user id " + user+ " sip "+ obj.sip);
                //callRCC(rcc, user, obj.mode, obj.num, obj.sip + "," + rcc.pbx);
                if (obj.mode == "UserCall") {
                    log("danilo-req UserCall:sip " + obj.sip);
                    //var msg = { api: "RCC", mt: "UserCall", user: user, e164: num, src: src };
                    //log("danilo req callRCC: UserCall sent rcc msg " + JSON.stringify(msg));
                    //ws.send(JSON.stringify(msg));
                    var msg = { api: "user", mt: "MakeCall", num: obj.num, src: obj.sip };
                    userC[0].send(JSON.stringify(msg));
                }
                else if (obj.mode == "UserClear") {
                    calls.forEach(function (call) {
                        log("danilo-req UserClear:sip " + obj.sip);
                        log("danilo-req UserClear:call " + JSON.stringify(call));
                        log("danilo-req UserClear:call.callid " + JSON.stringify(call.callid));
                        log("danilo-req UserClear:call.sip " + JSON.stringify(call.sip));
                        if (call.sip == obj.sip) {
            
                            //var msg = { api: "RCC", mt: "UserClear", call: call.callid, src: call.sip };
                            //log("danilo req callRCC: UserClear sent rcc msg " + JSON.stringify(msg));
                            //ws.send(JSON.stringify(msg));
                            var msg = { api: "user", mt: "DisconnectCall", src: obj.sip };
                            userC[0].send(JSON.stringify(msg));
                        }
                        
            
                    })
                }
                else if (obj.mode == "UserHold") {
                    calls.forEach(function (call) {
                        if (call.sip == obj.sip) {
                            var msg = { api: "RCC", mt: "UserHold", call: call.callid, remote: true, src: call.src };
                            rcc.send(JSON.stringify(msg));
                        }
            
                    })
                }
                else if (obj.mode == "UserRetrieve") {
                    calls.forEach(function (call) {
                        if (call.sip == obj.sip) {
                            //var msg = { api: "RCC", mt: "UserRetrieve", hw: userC[0].hw, call: call.callid, src: call.sip };
                            var msg = { api: "RCC", mt: "UserRetrieve", call: call.callid, src: call.src };
                            rcc.send(JSON.stringify(msg));
                        }
            
                    })
                }
                else if (obj.mode == "UserRedirect") {
                    calls.forEach(function (call) {
                        if (call.sip == obj.sip) {
                            var msg = { api: "RCC", mt: "UserRedirect",  call: call.callid, e164: obj.num, src: call.src };
                            rcc.send(JSON.stringify(msg));
                        }
            
                    })
                }
                else if (obj.mode == "UserConnect") {
                    calls.forEach(function (call) {
                        log("danilo-req UserConnect:sip " + obj.sip);
                        log("danilo-req UserConnect:call " + JSON.stringify(call));
                        log("danilo-req UserConnect:call.callid " + JSON.stringify(call.callid));
                        log("danilo-req UserConnect:call.sip " + JSON.stringify(call.sip));
                        if (call.sip == obj.sip) {
                            //var msg = { api: "user", mt: "UserConnect", call: call.callid, src: call.sip };
                            //ws.send(JSON.stringify(msg));
                            var msg = { api: "user", mt: "ConnectCall", call: call.callid, src: call.src };
                            userC[0].send(JSON.stringify(msg));
                        }
            
                    })
                }
            }
        })
    }
}
//Function called by WebServer.onrequest("pbxTable")
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
        //Teste do problema de antrar e sair de grupos
        if (pbxTable.length >0) {
            user[0].mt="ReplicateUpdate";
            log("danilo-req pbxTable: found PBX connection user "+ JSON.stringify(user[0]));
            pbxTable[0].send(JSON.stringify(user[0]));
        }else{
            log("danilo-req pbxTable: PBX connection is 0 ");
        }
        // pbxTable.forEach(function (conn) {
        //     log("danilo-req pbxTable: forEach conn "+ JSON.stringify(conn));
        //     if (conn.pbx == user[0].src) {
        //         user[0].mt="ReplicateUpdate";
        //         log("danilo-req pbxTable: found PBX connection user "+ JSON.stringify(user[0]));
        //         conn.send(JSON.stringify(user[0]));
        //     }
        // })
        pbxTableUsers.forEach(function (u) {
            if (u.columns.h323 == user[0].columns.h323) {
                user[0].mt = "ReplicateNextResult";
                Object.assign(u, user[0])
                log("danilo-req pbxTable: pbxTableUsers list updated "+ JSON.stringify(pbxTableUsers));
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

function httpClient(url, method, msg, callback) {
    log("danilo-req : httpClient msg "+JSON.stringify(msg));
    var responseData = "";
    log("danilo-req : httpClient url " + url);
    HttpClient.request(method, url)
    .header("X", "Wecom")
    .contentType("application/json")
    .onsend(function (req) {
        req.send(new TextEncoder("utf-8").encode(JSON.stringify(msg)), true);
    })
    .onrecv(function (req, data, last) {
        log("danilo-req : httpClient HttpRequest onrecv " + JSON.stringify(req));
        responseData += new TextDecoder("utf-8").decode(data);
        if (!last) req.recv();
    }, 1024)
    .oncomplete(function (req, success) {
        log(success ? url+" httpClient OK" : url+" httpClient ERROR");
        if (success) {
            log("danilo-req : httpClient HttpRequest complete " + JSON.stringify(req));
            log("danilo-req : httpClient HttpRequest responseData " + responseData);
            if (callback) {
                callback(responseData);
            }
        }
    })
    .onerror(function (error) {
            log("danilo-req : httpClient HttpRequest error=" + error);
            if (callback) {
                callback();
            }
        });
}

//Functions to delete objects from Arrays
function removeObjectBySip(sip) {
    return function (value) {
        if (value.sip != sip) {
            return true;
        }
        //countInvalidEntries++
        return false;
    }
}

function removeObjectByCall(arr, pbx, callToRemove) {
    //console.log("removeObjectByCall+++++++++++++++++++++++++++++++" + JSON.stringify(arr[pbx].length));
    for (var i = 0; i < arr[pbx].length; i++) {
        var pbxEntry = arr[pbx];
        //console.log("arr[i][pbx]+++++++++++++++++++++++++++++++" + JSON.stringify(arr[pbx]));
        if (pbxEntry) {
            //console.log("pbxEntry+++++++++++++++++++++++++++++++" + JSON.stringify(pbxEntry.length));
            for (var j = 0; j < pbxEntry.length; j++) {
                //console.log("pbxEntry[j].call+++++++++++++++++++++++++++++++" + pbxEntry[j].call);
                if (pbxEntry[j].call == callToRemove) {
                    log("pbxEntry[j].call == callToRemove:" + pbxEntry[j].call + " == " + callToRemove);
                    pbxEntry.splice(j, 1);
                    break;
                }
            }
        }
    }
}
//function to get User Login URL from Wecall
function getURLLogin(sip, session) {

    var foundConn = connectionsUser.filter(function (c) { return c.sip == sip });
    var foundSession = connectionsUser.filter(function (c) { return c.session == session });
    if(foundConn[0].url){
            var url = Config.url;
            var urlAlt = foundConn[0].url;
            if (urlAlt != "") {
                url = url + sip + "/" + urlAlt;
                log("danilo req : UserMessage url " + url);

            }
            foundSession[0].send(JSON.stringify({ api: "user", mt: "UserMessageResult", src: url }));
    }else{
        var msg = { user: sip, client: codClient };

        log("danilo req : getURLLogin url " + urlSSO);
        log("danilo req : getURLLogin msg " + JSON.stringify(msg));
        var responseData = "";
        //Teste 15/09
        HttpClient.request("POST", urlSSO)
        .header("X", "Wecom")
        .contentType("application/json")
        .onsend(function (req) {
            req.send(new TextEncoder("utf-8").encode(JSON.stringify(msg)), true);
            log("danilo-req : getURLLogin send " + JSON.stringify(msg));
        })
        .onrecv(function (req, data, last) {
            log("danilo-req : getURLLogin data " + data);
            responseData += new TextDecoder("utf-8").decode(data);
            if (!last) req.recv();
        }, 1024)
        .oncomplete(function (req, success) {
            log(success ? "POST getURLLogin OK" : "POST getURLLogin ERROR");
            log("danilo-req : getURLLogin complete");
            log("danilo-req : getURLLogin responseData " + responseData);
            try {
                var obj = JSON.parse(responseData);
                if (obj.status == "success") {
                    connectionsUser.forEach(function (conn) {
                        if (conn.sip == sip) {
                            conn["url"] = obj.token;
                            var url = Config.url;
                            var urlM = Config.url;
                            var urlAlt = conn["url"];
                            log("danilo req : getLoginResponse sip " + conn.sip);
                            if (urlAlt != "") {
                                url = url + "/home/desktop/startup/" + conn.sip + "/" + urlAlt;
                                urlM = urlM + "/mobile/startup/cel/" + conn.sip + "/" + urlAlt;
                                log("danilo req : UserMessage url " + url);

                            }
                            foundSession[0].send(JSON.stringify({ api: "user", mt: "UserMessageResult", src: url, urlM: urlM }));
                        }
                    })

                } else {
                    log("danilo req : getLoginResponse " + obj.msg);
                    var url = Config.url;
                    var urlAlt = "";
                    log("danilo req : getLoginResponse sip " + sip);
                    if (urlAlt != "") {
                        url = url + sip + "/" + urlAlt;
                        log("danilo req : UserMessage url " + url);

                    }
                    foundSession[0].send(JSON.stringify({ api: "user", mt: "UserMessageResult", src: url }));
                }
            } catch (e) {
                log("danilo req : getLoginResponse Erro " + e);
                var url = Config.url;
                foundSession[0].send(JSON.stringify({ api: "user", mt: "UserMessageResult", src: url }));
            }
        })
        .onerror(function (error) {
                log("danilo-req : getURLLogin error=" + error);
                var url = Config.url;
                foundSession[0].send(JSON.stringify({ api: "user", mt: "UserMessageResult", src: url }));
            });
        //Teste 15/09
    } 
}

//Functions to Initialize monitor of Queues from Wecall
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
}

