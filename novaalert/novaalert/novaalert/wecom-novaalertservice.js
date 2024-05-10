//Config variables
var licenseAppToken = Config.licenseAppToken;
if (licenseAppToken == "") {
    var rand = Random.bytes(16);
    Config.licenseAppToken = String(rand);
    Config.save();
}
var license = getLicense();

var urlalert = Config.urlalert;
var urlmethod = Config.urlmethod;
var urlenable = Config.urlenable;
var urlPhoneApiEvents = Config.urlPhoneApiEvents;
var sendCallEvents = Config.sendCallEvents;
var google_api_key = Config.googleApiKey;
var licenseAppFile = Config.licenseAppFile;
var licenseInstallDate = Config.licenseInstallDate;

//var connectionsRCC = [];
var connectionsApp = [];
var connectionsPbxSignal = [];
var connections = [];
var calls = [];
var actions = [];
var buttons = [];
var pbxTable = [];
var pbxTableUsers = [];

var connectionsUser = [];
var connectionsAdmin = [];
var RCC = [];
var PbxSignal = [];
var queueGrupsOk = false;
var count = 0;

Config.onchanged(function () {
    urlalert = Config.urlalert;
    urlmethod = Config.urlmethod;
    urlenable = Config.urlenable;
    sendCallEvents = Config.sendCallEvents;
    urlPhoneApiEvents = Config.urlPhoneApiEvents;
    google_api_key = Config.googleApiKey;
    licenseAppFile = Config.licenseAppFile;
    licenseInstallDate = Config.licenseInstallDate;
})

log("pietro req: License " + JSON.stringify(license));
if (license != null && license.System == true) {
    WebServer.onrequest("alarmTriggered", function (req) {
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
                    alarmReceived(value);
                }
            });
        }
        else {
            req.cancel();
        }
    });

    WebServer.onrequest("sensorTriggered", function (req) {
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
                    sensorReceived(value);
                }
            });
        }
        else {
            req.cancel();
        }
    });
}

function getButtons() {
    Database.exec("SELECT * FROM list_buttons")
        .oncomplete(function (data) {
            //log("result getButtons=" + JSON.stringify(data, null, 4));
            buttons = [];
            buttons = data;
            return;
        })
        .onerror(function (error, errorText, dbErrorCode) {
            return;
        });
}

function getLicense() {
    var key = Config.licenseAppToken;
    var hash = Config.licenseAppFile;
    var lic;
    if (key != "" && hash != "") {
        lic = decrypt(key, hash);
    }
    return lic;
}

//APPS API
new JsonApi("user").onconnected(function (conn) {
    // log("danilo req: user conn: " + JSON.stringify(conn))
    // connectionsUser.push(conn);
    getButtons();

    if (conn.app == "wecom-novaalert") {
        license = getLicense();
        log("license: " + JSON.stringify(license));
        // log("connectionsUser: license.Users " + license.Users);

        conn.onmessage(function (msg) {
            var obj = JSON.parse(msg);
            var info = JSON.parse(conn.info);
            var today = getDateNow();

            if (license != null && connectionsUser.length <= license.Users) {

                if (obj.mt == "TableUsers") {
                    log("danilo-req TableUsers: reducing the pbxTableUser object to send to user");
                    var list_users = [];
                    pbxTableUsers.forEach(function (u) {
                        list_users.push({sip: u.columns.h323, guid: u.columns.guid, e164: u.columns.e164, cn: u.columns.dn, devices: u.columns.devices})
                    })
                    conn.send(JSON.stringify({ api: "user", mt: "TableUsersResult", src: obj.src, result: JSON.stringify(list_users, null, 4) }));
                }

                if (obj.mt == "UserSession") {

                    var session = Random.bytes(16);
                    conn.send(JSON.stringify({ api: "user", mt: "UserSessionResult", session: session }));

                    //Intert into DB the event of new login
                    log("danilo req: insert into DB = user " + conn.sip);
                    var today = getDateNow();
                    var msg = { guid: conn.guid, name: conn.dn, date: today, status: "Login", group: "APP " + obj.info }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblAvailability(msg);

                }
                if (obj.mt == "InitializeMessage") {
                    log("connectionsUser: connectionsUser.length " + connectionsUser.length);
                    if (connectionsUser.length > 0) {
                        var foundConn = connectionsUser.filter(function (c) { return c.session == obj.session });
                        if (foundConn == "") {
                            log("connectionsUser: not found conn");
                            conn["session"] = obj.session;
                            connectionsUser.push(conn);
                        }
                    } else {
                        log("connectionsUser: connectionsUser.length == 0");
                        conn["session"] = obj.session;
                        connectionsUser.push(conn);
                        log("connectionsUser: connectionsUser.push =" + JSON.stringify(connectionsUser));
                    }
                    //var connectionUser = connectionsUser.filter(function (c) { c.session == obj.session })[0];
                    //log("danilo req: InitializeMessage connectionUser= " + JSON.stringify(connectionUser));
                    //if (JSON.stringify(connectionUser) =="undefined") {
                    //    conn["session"] = obj.session;
                    //    log("danilo req: InitializeMessage connectionUser==undefined " + JSON.stringify(connectionUser));
                    //    connectionsUser.push(conn);
                    //    log("danilo req: InitializeMessage connectionUser==undefined connectionsUser=" + JSON.stringify(connectionsUser));
                    //}

                    //Reset badge count
                    updateTableBadgeCount(conn.sip, "ResetCount");

                    //Callback user about success login
                    log("danilo req: InitializeMessage Callback user about success login " + conn.sip);
                    conn.send(JSON.stringify({ api: "user", mt: "UserInitializeResultSuccess", src: conn.sip }));

                }
                if (obj.mt == "DeviceSelected") {
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
                }
                if (obj.mt == "InitializeMessage2") {
                    try {
                        updateTableBadgeCount(conn.sip, "ResetCount");
                        var user = pbxTableUsers.filter(function (user) { return user.columns.h323 === conn.sip });
                        var numDevices = user[0].columns.devices.length;
                        log("danilo req : devices sao: " + numDevices);
                        RCC.forEach(function (rcc) {
                            if (rcc.pbx == info.pbx) {
                                var temp = rcc[String(conn.sip)];
                                if (temp == null) {
                                    log("danilo req : User Connection conn.sip: " + conn.sip + " rcc temp user " + temp);
                                    if (numDevices > 1) {
                                        conn.send(JSON.stringify({ api: "user", mt: "DevicesList", devices: user[0].columns.devices, src: user[0].columns.h323 + "," + user[0].src }));
                                    }
                                    if (numDevices == 1) {
                                        if (rcc.pbx == info.pbx) {
                                            log("danilo req : User Connection calling RCC API for new userclient " + String(conn.dn) + " on PBX " + info.pbx);
                                            var msg = { api: "RCC", mt: "UserInitialize", hw: user[0].columns.devices[0], cn: String(conn.dn), src: conn.sip + "," + info.pbx };
                                            rcc.send(JSON.stringify(msg));
                                            connectionsUser.forEach(function (c) {
                                                if (c.sip == conn.sip) {
                                                    c.hw = user[0].columns.devices[0];
                                                }
                                            })
                                            log("danilo req : User Connection updated including the new hardware for userclient " + String(conn.dn) + " on connectionsUser " + JSON.stringify(connectionsUser));
                                        }
                                        getURLLogin(conn.sip);
                                    }
                                }
                                else {
                                    conn.send(JSON.stringify({ api: "user", mt: "UserInitializeResultSuccess" }));
                                    connectionsUser.forEach(function (c) {
                                        c.send(JSON.stringify({ api: "user", mt: "UserConnected", src: conn.sip }));

                                    })
                                }
                            }
                        })

                    } catch (e) {
                        log("danilo req : User Connection Erro pbxTableUsers has null, please try again in a few moments " + e);
                    }
                }
                if (obj.mt == "InitializeMessage3") {
                    try {
                        updateTableBadgeCount(conn.sip, "ResetCount");
                        var user = pbxTableUsers.filter(function (user) { return user.columns.h323 === conn.sip });
                        var numDevices = user[0].columns.devices.length;
                        log("danilo req : devices sao: " + numDevices);
                        RCC.forEach(function (rcc) {
                            if (rcc.pbx == info.pbx) {
                                var temp = rcc[String(conn.sip)];
                                if (temp == null && rcc.pbx == info.pbx) {
                                    log("danilo req : User Connection calling RCC API for new userclient " + String(conn.dn) + " on PBX " + info.pbx);
                                    var msg = { api: "RCC", mt: "UserInitialize", cn: String(conn.dn), src: conn.sip + "," + info.pbx };
                                    rcc.send(JSON.stringify(msg));
                                }
                                else {
                                    conn.send(JSON.stringify({ api: "user", mt: "UserInitializeResultSuccess" }));
                                    connectionsUser.forEach(function (c) {
                                        c.send(JSON.stringify({ api: "user", mt: "UserConnected", src: conn.sip }));

                                    })
                                }
                            }
                        })

                    } catch (e) {
                        log("danilo req : User Connection Erro pbxTableUsers has null, please try again in a few moments " + e);
                    }
                }
                if (obj.mt == "UserPresence") {
                    //Notify user about users logged
                    log("danilo req: UserPresence Notify user about users logged");
                    PbxSignal.forEach(function (c) {
                        for (var i in c) {
                            var valorAtual = c[i];
                            if (c.hasOwnProperty(i) && isNegativeNumber(valorAtual)) {
                                log("danilo req: UserPresence Notify user " + conn.sip + " about users logged " + i);
                                conn.send(JSON.stringify({ api: "user", mt: "UserConnected", src: i }));
                            }
                        }
                    })

                    //PbxSignal.forEach(function (sig) {
                    //    var chaves = Object.keys(sig);
                    //    log("danilo req: UserPresence chaves " + chaves);
                    //    for (var i = 0; i < chaves.length; i++) {
                    //        var chave = chaves[i];
                    //        var valorAtual = sig[chave];
                    //        if (isNegativeNumber(valorAtual)) {
                    //            log("danilo req: UserPresence Notify user " + conn.sip + " about users logged " + chave);
                    //            conn.send(JSON.stringify({ api: "user", mt: "UserConnected", src: chave }));
                    //        }
                    //    }
                    //})


                    function isNegativeNumber(value) {
                        return typeof value === 'number' && value < 0;
                    }

                    //connectionsUser.forEach(function (c) {
                    //    if (conn.sip != c.sip) {
                    //        log("danilo req: UserPresence Notify user " + conn.sip + " about users logged " + c.sip);
                    //        conn.send(JSON.stringify({ api: "user", mt: "UserConnected", src: c.sip }));
                    //    }
                    //})
                }
                if (obj.mt == "DecrementCount") {
                    updateTableBadgeCount(conn.sip, obj.mt);
                }
                if (obj.mt == "TriggerStartPage") {
                    //intert into DB the event
                    log("danilo req: insert into DB = user " + conn.sip);
                    var msg = { guid: conn.guid, name: "page", date: today, status: "start", details: obj.prt }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);
                }
                if (obj.mt == "TriggerStopPage") {
                    //intert into DB the event
                    log("danilo req: insert into DB = user " + conn.sip);
                    var msg = { guid: conn.guid, name: "page", date: today, status: "stop", details: obj.prt }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);
                }
                if (obj.mt == "TriggerStartVideo") {
                    //intert into DB the event
                    log("danilo req: insert into DB = user " + conn.sip);
                    var msg = { guid: conn.guid, name: "video", date: today, status: "start", details: obj.prt }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);
                }
                if (obj.mt == "TriggerStopVideo") {
                    //intert into DB the event
                    log("danilo req: insert into DB = user " + conn.sip);
                    var msg = { guid: conn.guid, name: "video", date: today, status: "stop", details: obj.prt }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);
                }
                if (obj.mt == "TriggerStopAlarm") {
                    //intert into DB the event
                    log("danilo req:TriggerStopAlarm insert into DB = user " + conn.guid);
                    var msg = { guid: conn.guid, name: "alarm", date: today, status: "stop", details: obj.prt }
                    log("danilo req:TriggerStopAlarm will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);

                    Database.exec("SELECT * FROM list_buttons WHERE button_prt = '" + obj.prt + "' AND button_type = 'alarm'")
                        .oncomplete(function (data) {
                            log("result=" + JSON.stringify(data, null, 4));
                            var buttons = data
                            if (buttons.length > 0) {
                                log("danilo req:TriggerStopAlarm buttons length >0 : ");
                                buttons.forEach(function (b) {
                                    var con = connectionsUser.filter(function (c) { return c.guid == b.button_user })
                                    log("danilo req:TriggerStopAlarm found users connections to notify : "+ JSON.stringify(con));
                                    con.forEach(function (c) {
                                        //respond success to the client
                                        log("Conn.Guid " + JSON.stringify(conn.guid));
                                        log("C.Guid " + JSON.stringify(c.guid));
                                        log("C.SIP " + JSON.stringify(c.sip));
                                        log("Conn.sip " + JSON.stringify(conn.sip));
                                        log("Connection Inteira " + JSON.stringify(con));
                                        if (conn.guid != c.guid) { // antigo = conn.sip != c.sip
                                            c.send(JSON.stringify({ api: "user", mt: "AlarmSuccessTrigged", alarm: obj.prt, btn_id: String(b.id), from: conn.dn, to: c.dn })); 
                                        }
                                    })
                                })

                            }

                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "user", mt: "MessageError", result: String(errorText) }));
                        });
                }
                if (obj.mt == "TriggerStartPopup") {
                    //intert into DB the event
                    log("danilo req: insert into DB = user " + conn.sip);
                    var msg = { guid: conn.guid, name: "popup", date: today, status: "start", details: obj.prt }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);
                }
                if (obj.mt == "TriggerAlert") {
                    //trigger the Novalink server
                    if (urlenable == true) {
                        callHTTPSServer(parseInt(obj.prt), conn.guid);
                    }


                    // Tratar o evento internamente
                    //var value = '{"From":"${conn.sip}","AlarmID":"${obj.AlarmID}"}'
                    //ECMA5
                    // Criar a string JSON substituindo as variáveis manualmente
                    //var value = '{"From":"' + conn.sip + '", "AlarmID":"' + obj.prt + '", "Detail":"' + obj.btn_name + '"}';

                    //alarmReceived(value);

                    connectionsUser.forEach(function (c) {
                        if (c.guid != conn.guid) {
                            c.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: obj.prt, src: conn.sip}));

                        }
                    })

                    //intert into DB the event
                    log("danilo req: insert into DB = user " + conn.sip);

                    var msg = { guid: conn.guid, name: "alarm", date: today, status: "out", details: obj.prt }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);
                }
                if (obj.mt == "TriggerCombo") {
                    //trigger the combo function
                    comboManager(parseInt(obj.btn_id), conn.guid, obj.mt);
                    //intert into DB the event
                    log("danilo req: insert into DB = user " + conn.guid);

                    var msg = { guid: conn.guid, name: "combo", date: today, status: "start", details: obj.prt }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);
                }
                if (obj.mt == "StopCombo") {
                    //trigger the combo function
                    comboManager(parseInt(obj.btn_id), conn.guid, obj.mt);
                    //intert into DB the event
                    log("danilo req: insert into DB = user " + conn.guid);

                    var msg = { guid: conn.guid, name: "combo", date: today, status: "stop", details: obj.prt }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);
                    //respond success to the client
                    conn.send(JSON.stringify({ api: "user", mt: "ComboSuccessTrigged", src: obj.prt, btn_id: String(obj.btn_id) }));
                }
                if (obj.mt == "TriggerCall") {
                    var num;
                    try {
                        //Check if the number dialed is one user, then call the user number
                        var user = pbxTableUsers.filter(findBySip(obj.prt));
                        log("PbxTableUsers " + JSON.stringify(pbxTableUsers));
                        log("danilo req: TriggerCall user " + JSON.stringify(user));
                        if (user.length > 0) {
                            log("danilo req: TriggerCall user e164 " + user[0].columns.e164);
                            num = user[0].columns.e164;
                        } else {
                            num = obj.prt;
                        }
                    } finally {
                        log("danilo req: TriggerCall num to call " + num);
                    }
                    //intert into DB the event
                    log("danilo req: insert into DB = user " + conn.sip);
                    var msg = { guid: conn.guid, name: "call", date: today, status: "start", details: obj.prt }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);

                    var userButtons = buttons.filter(findButtonByGuid(conn.guid)); //conn.sip
                    log("User Button " + userButtons)
                    //log("danilo req:TriggerCall userButtons " + JSON.stringify(userButtons));
                    userButtons.forEach(function (user_b) {
                        //== String(obj.prt) 
                        if (String(user_b.button_prt) && String(user_b.id) == String(obj.btn_id)) {
                            log("danilo req:TriggerCall user_b match button " + JSON.stringify(user_b));
                            log("danilo req:TriggerCall user_b device " + user_b.button_device);
                            RCC.forEach(function (rcc) {
                                //var temp = rcc[String(conn.sip)];
                                //log("danilo req:TriggerCall call.sip == conn.sip:temp " + temp);
                                if (rcc.pbx == info.pbx) {
                                    //user = temp;
                                    log("danilo req:TriggerCall:sip " + conn.sip);
                                    // var msg = { api: "RCC", mt: "UserCall", user: user, e164: num, hw: user_b.button_device, src: conn.sip + "," + rcc.pbx };
                                    var msg = { api: "RCC", mt: "UserInitialize", cn: conn.dn, hw: user_b.button_device, src: conn.sip + "," + rcc.pbx + "," + user_b.button_device + "," + obj.prt + "," + user_b.id };
                                    log("danilo req:TriggerCall: UserInitialize sent rcc msg " + JSON.stringify(msg));
                                    rcc.send(JSON.stringify(msg));
                                }
                            })

                        }
                    })
                    //verifica se existe alguma ação iniciada por uma ligação realizada
                    triggerAction2(conn.sip, num, num, "out-number", "TriggerCall");
                }
                if (obj.mt == "UserConnect") {
                    log("danilo req:UserConnect");
                    calls.forEach(function (call) {
                        log("danilo req:UserConnect call.sip == " + call.sip);
                        var btn = buttons.filter(function (btn) { return btn.id == obj.btn_id });
                        if (call.sip == conn.sip && call.num == obj.prt && call.device == btn[0].button_device) {
                            log("danilo req:UserConnect call.sip == conn.sip");
                            RCC.forEach(function (rcc) {
                                var temp = rcc[String(call.src)];
                                log("danilo req:UserConnect call.sip == conn.sip:temp " + temp);
                                if (temp != null) {
                                    user = temp;
                                    var msg = { api: "RCC", mt: "UserConnect", user: user, call: call.callid, src: call.src };
                                    log("danilo req:UserConnect: UserConnect sent rcc msg " + JSON.stringify(msg));
                                    rcc.send(JSON.stringify(msg));
                                }
                            })
                        }
                    })
                }
                if (obj.mt == "EndCall") {
                    log("danilo req:EndCall");
                    var btn = buttons.filter(function (btn) { return btn.id == obj.btn_id });
                    calls.forEach(function (call) {
                        log("danilo req:EndCall btn == " + call.sip + "== " + conn.sip + "&& " + call.num + "==" + btn[0].button_prt + " &&" + call.device + " == " + btn[0].button_device);
                        if (call.sip == conn.sip && call.num == btn[0].button_prt && call.device == btn[0].button_device) {
                            log("danilo req:EndCall call.sip == conn.sip call " + JSON.stringify(call));
                            RCC.forEach(function (rcc) {
                                var temp = rcc[String(call.src)];
                                log("danilo req:TriggerCall call.sip == conn.sip:temp " + temp);
                                if (temp != null) {
                                    user = temp;
                                    var msg = { api: "RCC", mt: "UserClear", call: call.callid, cause: 16, user: user, src: call.src };
                                    log("danilo req:UserClear: UserClear sent rcc msg " + JSON.stringify(msg));
                                    rcc.send(JSON.stringify(msg));
                                    //callRCC(rcc, user, "UserClear", obj.prt, call.src);
                                }
                            })
                        }
                    })
                }
                if (obj.mt == "SelectMessage") {
                    conn.send(JSON.stringify({ api: "user", mt: "SelectMessageResult" }));
                    Database.exec("SELECT * FROM list_buttons WHERE button_user = '" + conn.guid + "' OR button_user = 'all'")
                        .oncomplete(function (data) {
                            log("result=" + JSON.stringify(data, null, 4));
                            conn.send(JSON.stringify({ api: "user", mt: "SelectMessageSuccess", result: JSON.stringify(data, null, 4) }));

                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "user", mt: "MessageError", result: String(errorText) }));
                        });
                }
                if (obj.mt == "SelectSensorInfo") {
                    Database.exec("SELECT * FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY sensor_name ORDER BY id DESC) as row_num FROM list_sensors_history) AS subquery WHERE row_num <= 10")
                        // base = "SELECT * FROM list_buttons WHERE button_prt ='" + obj.sensor_name + "';"
                        .oncomplete(function (data) {
                            conn.send(JSON.stringify({ api: "user", mt: "SelectSensorInfoResult", result: JSON.stringify(data) }))
                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            log("Erro ao Consultar Info do Sensor " + errorText);
                        });
                }
                
                if (obj.mt == "SelectSensorInfoSrc") {
                    var querySelect = "SELECT " + obj.type + " FROM list_sensors_history WHERE sensor_name = '" + obj.sensor + "' ORDER BY id DESC LIMIT 1";
                    Database.exec(querySelect)
                        .oncomplete(function (data) {
                            conn.send(JSON.stringify({ api: "user", mt: "SelectSensorInfoResultSrc", result: JSON.stringify(data), src: obj.src }))
                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            log("Erro ao Consultar Info do Sensor " + errorText);
                        });
                }

                if (obj.mt == "SelectSensorName") {
                    Database.exec("SELECT DISTINCT sensor_name FROM list_sensors_history")
                        // base = "SELECT * FROM list_buttons WHERE button_prt ='" + obj.sensor_name + "';"
                        .oncomplete(function (data) {
                            conn.send(JSON.stringify({ api: "user", mt: "SelectSensorNameResult", result: JSON.stringify(data) }))
                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            log("Erro ao Consultar Info do Sensor " + errorText);
                        });
                }
            }
            else {
                log("danilo req: No license Available")
                conn.send(JSON.stringify({ api: "user", mt: "NoLicense", result: String("Por favor, contate o administrador do sistema para realizar o licenciamento.") }));
            }

        })


        conn.onclose(function () {
            log("User: disconnected");

            //Intert into DB the event
            log("danilo req: insert into DB = user " + conn.sip);
            var today = getDateNow();
            var info = JSON.parse(conn.info);
            var msg = { guid: conn.guid, name: conn.dn, date: today, status: "Logout", group: "APP" }
            log("danilo req: will insert it on DB : " + JSON.stringify(msg));
            insertTblAvailability(msg);

            ////Remove from RCC monitor
            //RCC.forEach(function (rcc) {
            //    if (rcc.pbx == info.pbx) {
            //        var user = rcc[conn.sip];
            //        log("PbxSignal: calling RCC API to End user Monitor " + String(conn.sip) + " on PBX " + info.pbx);
            //        var msg = { api: "RCC", mt: "UserEnd", user: user, src: conn.sip + "," + info.pbx };
            //        rcc.send(JSON.stringify(msg));
            //    }
            //})

            //Remove cennection from array
            connectionsUser = connectionsUser.filter(function (c) { return c.session != conn.session });
            log("danilo req : connectionsUsers after delete conn of user " + conn.sip + " : " + JSON.stringify(connectionsUser));

        });
    }
});

new JsonApi("admin").onconnected(function (conn) {
    if (conn.app == "wecom-novaalertadmin") {
        conn.onmessage(function (msg) {
            var obj = JSON.parse(msg);
            //#region TABLE USERS
            if (obj.mt == "AdminMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: obj.src, urlalert: urlalert, urlmethod: urlmethod, urlenable: urlenable, googlekey: google_api_key }));
                log("danilo-req AdminMessage: reducing the pbxTableUser object to send to user");
                var list_users = [];
                pbxTableUsers.forEach(function (u) {
                    list_users.push({ sip: u.columns.h323, cn: u.columns.cn, devices: u.columns.devices, guid: u.columns.guid, e164: u.columns.e164 })
                })
                conn.send(JSON.stringify({ api: "admin", mt: "TableUsersResult", src: obj.src, result: JSON.stringify(list_users, null, 4) }));
            }
            //#endregion
            //#region CONFIG
            if (obj.mt == "UpdateConfig") {
                if (obj.prt == "urlalert") {
                    Config.urlalert = obj.vl;
                    Config.urlmethod = obj.method;
                    Config.urlenable = obj.urlenable;
                    Config.save();
                }
                if (obj.prt == "googlekey") {
                    Config.googleApiKey = obj.vl;
                    Config.save();
                }
            }
            //#endregion
            //#region LICENSE
            if (obj.mt == "ConfigLicense") {
                var licenseAppToken = Config.licenseAppToken;
                licenseInstallDate = Config.licenseInstallDate;
                licenseAppFile = Config.licenseAppFile;
                var licUsed = connectionsUser.length;
                var lic = decrypt(licenseAppToken, licenseAppFile)
                conn.send(JSON.stringify({
                    api: "admin",
                    mt: "LicenseMessageResult",
                    licenseUsed: licUsed,
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
            //#endregion
            //#region BUTTONS
            if (obj.mt == "InsertMessage") {
                Database.insert("INSERT INTO list_buttons (button_name, button_prt, button_prt_user, button_user, button_type, button_device, create_date, create_user, page, position_x, position_y) VALUES ('" + String(obj.name) + "','" + String(obj.value) + "','" + String(obj.user) + "','" + String(obj.guid) + "','" + String(obj.type) + "','" + String(obj.device) + "','" + String(getDateNow()) + "','" + String(conn.guid) + "','" + String(obj.page) + "','" + String(obj.x) + "','" + String(obj.y) + "')")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "InsertMessageSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(error) }));
                    });

            }
            if (obj.mt == "InsertAlarmMessage") {
                Database.insert("INSERT INTO list_buttons (button_name, button_prt, button_prt_user, button_user, button_type, button_device, create_date, create_user, page, position_x, position_y) VALUES ('" + String(obj.name) + "','" + String(obj.value) + "','" + String(obj.guid) + "','" + String(obj.guid) + "','" + String(obj.type) + "','" + String(obj.device) + "','" + String(getDateNow()) + "','" + String(conn.guid) + "','" + String(obj.page) + "','" + String(obj.x) + "','" + String(obj.y) + "')")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "InsertMessageSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(error) }));
                    });

            }
            if (obj.mt == "InsertNumberMessage") {
                Database.insert("INSERT INTO list_buttons (button_name, button_prt, button_prt_user, button_user, button_type, button_device, create_date, create_user, page, position_x, position_y) VALUES ('" + String(obj.name) + "','" + String(obj.value) + "','" + String(obj.guid) + "','" + String(obj.guid) + "','" + String(obj.type) + "','" + String(obj.device) + "','" + String(getDateNow()) + "','" + String(conn.guid) + "','" + String(obj.page) + "','" + String(obj.x) + "','" + String(obj.y) + "')")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "InsertMessageSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(error) }));
                    });

            }
            if (obj.mt == "UpdateMessage") {
                Database.exec("UPDATE list_buttons SET button_name='" + String(obj.name) + "', button_prt='" + String(obj.value) + "', button_prt_user='" + String(obj.user) + "', button_user='" + String(obj.guid) + "', button_type='" + String(obj.type) + "', button_device='" + String(obj.device) + "' WHERE id=" + obj.id)
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "UpdateMessageSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(error) }));
                    });
            }
            if (obj.mt == "InsertComboMessage") {
                Database.insert("INSERT INTO list_buttons (button_name, button_prt, button_prt_user, button_user, button_type, button_type_1, button_type_2, button_type_3, button_type_4, create_date, create_user, page, position_x, position_y) VALUES ('" + String(obj.name) + "','" + String(obj.value) + "','" + String(obj.user) + "','" + String(obj.guid) + "','" + String(obj.type) + "','" + String(obj.type1) + "','" + String(obj.type2) + "','" + String(obj.type3) + "','" + String(obj.type4) + "','" + String(getDateNow()) + "','" + String(conn.guid) + "','" + String(obj.page) + "','" + String(obj.x) + "','" + String(obj.y) + "')")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "InsertMessageSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(error) }));
                    });

            }
            if (obj.mt == "UpdateComboMessage") {
                Database.exec("UPDATE list_buttons SET button_name='" + String(obj.name) + "', button_prt='" + String(obj.value) + "', button_prt_user='" + String(obj.user) + "', button_user='" + String(obj.guid) + "', button_type='" + String(obj.type) + "', button_type_1='" + String(obj.type1) + "', button_type_2='" + String(obj.type2) + "', button_type_3='" + String(obj.type3) + "', button_type_4='" + String(obj.type4) + "' WHERE id=" + obj.id)
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "UpdateComboMessageSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(error) }));
                    });
            }
            if (obj.mt == "SelectMessage") {
                //conn.send(JSON.stringify({ api: "admin", mt: "SelectMessageResult" }));
                Database.exec("SELECT * FROM list_buttons")
                    .oncomplete(function (data) {
                        log("result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "admin", mt: "SelectMessageSuccess", result: JSON.stringify(data, null, 4) }));

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(errorText) }));
                    });
            }
            if (obj.mt == "DeleteMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "DeleteMessageResult" }));
                obj.id.forEach(function (id) {
                    Database.exec("DELETE FROM list_buttons WHERE id=" + id + ";")
                        .oncomplete(function () {
                            log("DeleteMessage: Delete Success ID " + id);
                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(errorText) }));
                        });
                })
                conn.send(JSON.stringify({ api: "admin", mt: "DeleteMessageSuccess" }));

            }
            if (obj.mt == "InsertSensorMessage") {
                //Database.insert("INSERT INTO list_alarm_actions (action_name, action_alarm_code, action_prt, action_user, action_type) VALUES ('" + String(obj.name) + "','" + String(obj.alarm) + "','" + String(obj.value) + "','" + String(obj.sip) + "','" + String(obj.type) + "')")
                Database.insert("INSERT INTO list_buttons (button_name, button_prt, button_prt_user, button_user, button_type, sensor_min_threshold, sensor_max_threshold, sensor_type, create_date, create_user, page, position_x, position_y) VALUES ('" + String(obj.name) + "','" + String(obj.value) + "','" + String(obj.user) + "','" + String(obj.guid) + "','" + String(obj.type) + "','" + String(obj.min) + "','" + String(obj.max) + "','" + String(obj.sensorType) + "','" + String(getDateNow()) + "','" + String(conn.guid) + "','" + String(obj.page) + "','" + String(obj.x) + "','" + String(obj.y) + "')")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "InsertMessageSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(error) }));
                    });

            }
            if (obj.mt == "InsertDestMessage") {
                Database.insert("INSERT INTO list_buttons (button_name, button_prt, button_prt_user, button_user, button_type, button_device, create_date, create_user, page, position_x, position_y, img) VALUES ('" + String(obj.name) + "','" + String(obj.value) + "','" + String(obj.user) + "','" + String(obj.guid) + "','" + String(obj.type) + "','" + String(obj.device) + "','" + String(getDateNow()) + "','" + String(conn.guid) + "','" + String(obj.page) + "','" + String(obj.x) + "','" + String(obj.y) + "','" + String(obj.img) + "')")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "InsertMessageSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(error) }));
                    });

            }

            //#endregion
            //#region ACTIONS
            if (obj.mt == "InsertActionMessage") {
                //Database.insert("INSERT INTO list_alarm_actions (action_name, action_alarm_code, action_prt, action_user, action_type) VALUES ('" + String(obj.name) + "','" + String(obj.alarm) + "','" + String(obj.value) + "','" + String(obj.sip) + "','" + String(obj.type) + "')")
                Database.insert("INSERT INTO list_alarm_actions (action_name, action_alarm_code, action_start_type, action_prt, action_user, action_type, action_device, action_sensor_type, action_sensor_name) VALUES ('" + String(obj.name) + "','" + String(obj.alarm) + "','" + String(obj.start) + "','" + String(obj.value) + "','" + String(obj.guid) + "','" + String(obj.type) + "','" + String(obj.device) + "','" + String(obj.sensorType) + "','" + String(obj.sensorName)+ "')")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "InsertActionMessageSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(error) }));
                    });

            }
            if (obj.mt == "UpdateActionMessage") {
                Database.exec("UPDATE list_alarm_actions SET action_name='" + String(obj.name) + "', action_alarm_code='" + String(obj.alarm) + "',action_start_type='" + String(obj.start) + "', action_prt='" + String(obj.value) + "', action_user='" + String(obj.guid) + "', action_type='" + String(obj.type) + "', action_device='" + String(obj.device) + "' WHERE id=" + obj.id)
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "UpdateActionMessageSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(error) }));
                    });
            }
            if (obj.mt == "SelectActionMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "SelectMessageResult" }));

                Database.exec("SELECT * FROM list_buttons")
                    .oncomplete(function (data) {
                        log("result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "admin", mt: "SelectButtonsMessageSuccess", result: JSON.stringify(data, null, 4) }));

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(errorText) }));
                    });



                Database.exec("SELECT * FROM list_alarm_actions")
                    .oncomplete(function (data) {
                        log("result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "admin", mt: "SelectActionMessageSuccess", result: JSON.stringify(data, null, 4) }));

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(errorText) }));
                    });
            }
            if (obj.mt == "DeleteActionMessage") {
                    Database.exec("DELETE FROM list_alarm_actions WHERE id=" + obj.id + ";")
                        .oncomplete(function () {
                            log("DeleteMessage: Delete Success ID " + obj.id);
                            conn.send(JSON.stringify({ api: "admin", mt: "DeleteActionMessageSuccess" }));
                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(errorText) }));
                        });
            
            }
            //#endregion
            //#region REPORTS
            if (obj.mt == "SelectFromReports") {
                switch (obj.src) {
                    case "RptCalls":
                        var query = "SELECT guid, number, call_started, call_ringing, call_connected, call_ended, status, direction FROM tbl_calls";
                        var conditions = [];
                        if (obj.guid) conditions.push("guid ='" + obj.guid + "'");
                        if (obj.number) conditions.push("number ='" + obj.number + "'");
                        if (obj.from) conditions.push("call_started >'" + obj.from + "'");
                        if (obj.to) conditions.push("call_started <'" + obj.to + "'");
                        if (conditions.length > 0) {
                            query += " WHERE " + conditions.join(" AND ");
                        }
                        Database.exec(query)
                            .oncomplete(function (data) {
                                log("result=" + JSON.stringify(data, null, 4));

                                var jsonData = JSON.stringify(data, null, 4);
                                var maxFragmentSize = 50000; // Defina o tamanho máximo de cada fragmento
                                var fragments = [];
                                for (var i = 0; i < jsonData.length; i += maxFragmentSize) {
                                    fragments.push(jsonData.substr(i, maxFragmentSize));
                                }
                                // Enviar cada fragmento separadamente através do websocket
                                for (var i = 0; i < fragments.length; i++) {
                                    var isLastFragment = i === fragments.length - 1;
                                    conn.send(JSON.stringify({ api: "admin", mt: "SelectFromReportsSuccess", result: fragments[i], lastFragment: isLastFragment, src: obj.src }));
                                }

                                //conn.send(JSON.stringify({ api: "admin", mt: "SelectFromReportsSuccess", result: JSON.stringify(data, null, 4), src: obj.src }));
                            })
                            .onerror(function (error, errorText, dbErrorCode) {
                                conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText), src: obj.src }));
                            });
                        break;
                    case "RptActivities":
                        var query = "SELECT guid, name, date, status, details  FROM tbl_activities";
                        var conditions = [];
                        if (obj.guid) conditions.push("guid ='" + obj.guid + "'");
                        if (obj.from) conditions.push("date >'" + obj.from + "'");
                        if (obj.to) conditions.push("date <'" + obj.to + "'");
                        if (obj.event) conditions.push("name ='" + obj.event + "'");
                        if (conditions.length > 0) {
                            query += " WHERE " + conditions.join(" AND ");
                        }
                        Database.exec(query)
                            .oncomplete(function (data) {
                                log("result=" + JSON.stringify(data, null, 4));

                                var jsonData = JSON.stringify(data, null, 4);
                                var maxFragmentSize = 50000; // Defina o tamanho máximo de cada fragmento
                                var fragments = [];
                                for (var i = 0; i < jsonData.length; i += maxFragmentSize) {
                                    fragments.push(jsonData.substr(i, maxFragmentSize));
                                }
                                // Enviar cada fragmento separadamente através do websocket
                                for (var i = 0; i < fragments.length; i++) {
                                    var isLastFragment = i === fragments.length - 1;
                                    conn.send(JSON.stringify({ api: "admin", mt: "SelectFromReportsSuccess", result: fragments[i], lastFragment: isLastFragment, src: obj.src }));
                                }

                                //conn.send(JSON.stringify({ api: "admin", mt: "SelectFromReportsSuccess", result: JSON.stringify(data, null, 4), src: obj.src }));
                            })
                            .onerror(function (error, errorText, dbErrorCode) {
                                conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText), src: obj.src }));
                            });
                        break;
                    case "RptAvailability":
                        var query = "SELECT guid, date, status, group_name FROM tbl_availability";
                        var conditions = [];
                        if (obj.guid) conditions.push("sip ='" + obj.guid + "'");
                        if (obj.from) conditions.push("date >'" + obj.from + "'");
                        if (obj.to) conditions.push("date <'" + obj.to + "'");
                        if (conditions.length > 0) {
                            query += " WHERE " + conditions.join(" AND ");
                        }

                        Database.exec(query)
                            .oncomplete(function (data) {
                                log("result=" + JSON.stringify(data, null, 4));

                                var jsonData = JSON.stringify(data, null, 4);
                                var maxFragmentSize = 50000; // Defina o tamanho máximo de cada fragmento
                                var fragments = [];
                                for (var i = 0; i < jsonData.length; i += maxFragmentSize) {
                                    fragments.push(jsonData.substr(i, maxFragmentSize));
                                }
                                // Enviar cada fragmento separadamente através do websocket
                                for (var i = 0; i < fragments.length; i++) {
                                    var isLastFragment = i === fragments.length - 1;
                                    conn.send(JSON.stringify({ api: "admin", mt: "SelectFromReportsSuccess", result: fragments[i], lastFragment: isLastFragment, src: obj.src }));
                                }

                                //conn.send(JSON.stringify({ api: "admin", mt: "SelectFromReportsSuccess", result: JSON.stringify(data, null, 4), src: obj.src }));
                            })
                            .onerror(function (error, errorText, dbErrorCode) {
                                conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText), src: obj.src }));
                            });
                        break;
                    case "RptSensors":
                            var query;
                            if (obj.sensor_type) {
                                query = "SELECT id, sensor_name, " + obj.sensor_type + ", date FROM list_sensors_history";
                                var conditions = [];
                                if (obj.sensor) conditions.push("sensor_name ='" + obj.sensor + "'");
                                if (obj.from) conditions.push("date >'" + obj.from + "'");
                                if (obj.to) conditions.push("date <'" + obj.to + "'");
                                if (conditions.length > 0) {
                                    query += " AND " + conditions.join(" AND ");
                                }
                            } else {
                                query = "SELECT * FROM list_sensors_history";
                                var conditions = [];
                                if (obj.sensor) conditions.push("sensor_name ='" + obj.sensor + "'");
                                if (obj.from) conditions.push("date >'" + obj.from + "'");
                                if (obj.to) conditions.push("date <'" + obj.to + "'");
                                if (conditions.length > 0) {
                                    query += " WHERE " + conditions.join(" AND ");
                                }
                            }
                            Database.exec(query)
                                .oncomplete(function (data) {
                                    log("result=" + JSON.stringify(data, null, 4));
    
                                    var jsonData = JSON.stringify(data, null, 4);
                                    var maxFragmentSize = 50000; // Defina o tamanho máximo de cada fragmento
                                    var fragments = [];
                                    for (var i = 0; i < jsonData.length; i += maxFragmentSize) {
                                        fragments.push(jsonData.substr(i, maxFragmentSize));
                                    }
                                    // Enviar cada fragmento separadamente através do websocket
                                    for (var i = 0; i < fragments.length; i++) {
                                        var isLastFragment = i === fragments.length - 1;
                                        conn.send(JSON.stringify({ api: "admin", mt: "SelectFromReportsSuccess", result: fragments[i], lastFragment: isLastFragment, src: obj.src }));
                                    }})
                                .onerror(function (error, errorText, dbErrorCode) {
                                    conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText), src: obj.src }));
                                });
                        break;
                    }        
                }       
            if (obj.mt == "DeleteFromReports") {
                switch (obj.src) {
                    case "RptCalls":
                        var query = "DELETE FROM tbl_calls";
                        var conditions = [];
                        if (obj.to) conditions.push("call_started <'" + obj.to + "'");
                        if (conditions.length > 0) {
                            query += " WHERE " + conditions.join(" AND ");
                        }
                        Database.exec(query)
                            .oncomplete(function (data) {
                                log("result=" + JSON.stringify(data, null, 4));
                                conn.send(JSON.stringify({ api: "admin", mt: "DeleteFromReportsSuccess", src: obj.src }));
                            })
                            .onerror(function (error, errorText, dbErrorCode) {
                                conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText), src: obj.src }));
                            });
                        break;
                    case "RptActivities":
                        var query = "DELETE FROM tbl_activities";
                        var conditions = [];
                        if (obj.to) conditions.push("date <'" + obj.to + "'");
                        if (conditions.length > 0) {
                            query += " WHERE " + conditions.join(" AND ");
                        }
                        Database.exec(query)
                            .oncomplete(function (data) {
                                log("result=" + JSON.stringify(data, null, 4));
                                conn.send(JSON.stringify({ api: "admin", mt: "DeleteFromReportsSuccess", src: obj.src }));
                            })
                            .onerror(function (error, errorText, dbErrorCode) {
                                conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText), src: obj.src }));
                            });
                        break;
                    case "RptAvailability":
                        var query = "DELETE FROM tbl_availability";
                        var conditions = [];
                        if (obj.to) conditions.push("date <'" + obj.to + "'");
                        if (conditions.length > 0) {
                            query += " WHERE " + conditions.join(" AND ");
                        }

                        Database.exec(query)
                            .oncomplete(function (data) {
                                log("result=" + JSON.stringify(data, null, 4));
                                conn.send(JSON.stringify({ api: "admin", mt: "DeleteFromReportsSuccess", src: obj.src }));
                            })
                            .onerror(function (error, errorText, dbErrorCode) {
                                conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText), src: obj.src }));
                            });
                        break;
                }
            }
            //#endregion
        });
    }
});


//PBX APIS
new PbxApi("PbxTableUsers").onconnected(function (conn) {
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
        var today = getDateNow();

        //log("PbxTableUsers: msg received " + msg);

        if (obj.mt == "ReplicateStartResult") {
            pbxTableUsers = [];
            conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateNext", "src": conn.pbx }));
        }
        if (obj.mt == "ReplicateNextResult" && obj.columns) {
            try {
                obj.badge = 0;
                pbxTableUsers.push(obj);
                conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateNext", "src": conn.pbx }));
            } finally {
            }
        }
        if (obj.mt == "ReplicateAdd") {
            obj.badge = 0;
            pbxTableUsers.push(obj);
        }
        if (obj.mt == "ReplicateUpdate") {
            var found;
            log("ReplicateUpdate= user " + obj.columns.h323);
            try {
                pbxTableUsers.forEach(function (user) {
                    if (user.columns.guid == obj.columns.guid) {
                        found = true;
                        try {
                            const grps1 = user.columns.grps;
                            const grps2 = obj.columns.grps;
                            if (grps1) {
                                for (var i = 0; i < grps1.length; i++) {
                                    if (grps2) {
                                        //Atualizar presenca dos grupos existentes
                                        for (var j = 0; j < grps2.length; j++) {
                                            if (grps1[i].name === grps2[j].name) {
                                                if (grps1[i].dyn === grps2[j].dyn) {
                                                } else {
                                                    log("ReplicateUpdate= user " + obj.columns.h323 + " group presence changed!!!");
                                                    switch (grps2[j].dyn) {
                                                        case "out":
                                                            var msg = { guid: obj.columns.guid, name: obj.columns.cn, date: today, status: "Indisponível", group: grps2[j].name }
                                                            log("ReplicateUpdate= will insert it on DB : " + JSON.stringify(msg));
                                                            insertTblAvailability(msg);
                                                            break;
                                                        case "in":
                                                            var msg = { guid: obj.columns.guid, name: obj.columns.cn, date: today, status: "Disponível", group: grps2[j].name }
                                                            log("ReplicateUpdate= will insert it on DB : " + JSON.stringify(msg));
                                                            insertTblAvailability(msg);
                                                            break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        //Sair de todos os grupos existentes
                                        log("ReplicateUpdate= user " + obj.columns.h323 + " group removed!!!");
                                        for (var i = 0; i < grps1.length; i++) {
                                            var msg = { guid: obj.columns.guid, name: obj.columns.cn, date: today, status: "Indisponível", group: grps1[j].name }
                                            log("ReplicateUpdate= will insert it on DB : " + JSON.stringify(msg));
                                            insertTblAvailability(msg);

                                        }

                                    }

                                }
                            }
                            else {
                                //Atualizar a lista pois entraram grupos
                                if (grps2) {
                                    log("ReplicateUpdate= user " + obj.columns.h323 + " group added!!!");
                                    for (var i = 0; i < grps2.length; i++) {
                                        switch (grps2[j].dyn) {
                                            case "out":
                                                var msg = { guid: obj.columns.guid, name: obj.columns.cn, date: today, status: "Indisponível", group: grps2[j].name }
                                                log("ReplicateUpdate= will insert it on DB : " + JSON.stringify(msg));
                                                insertTblAvailability(msg);
                                                break;
                                            case "in":
                                                var msg = { guid: obj.columns.guid, name: obj.columns.cn, date: today, status: "Disponível", group: grps2[j].name }
                                                log("ReplicateUpdate= will insert it on DB : " + JSON.stringify(msg));
                                                insertTblAvailability(msg);
                                                break;
                                        }
                                    }
                                }
                            }
                        }
                        catch (e) {
                            log("ReplicateUpdate: User " + obj.columns.h323 + "! Erro " + e)
                        }
                        finally {
                            log("ReplicateUpdate: Updating the object for user " + obj.columns.h323)
                            obj.badge = user.badge;
                            Object.assign(user, obj)
                        }
                    }
                })
            } catch (e) {
                log("ReplicateUpdate: User " + obj.columns.h323 + " Erro " + e)
            } finally {
                if (found == false) {
                    obj.badge = 0;
                    pbxTableUsers.push(obj);
                }

            }
        }
    });

    conn.onclose(function () {
        log("PbxTableUsers: disconnected");
        pbxTable.splice(pbxTable.indexOf(conn), 1);
    });
});

new PbxApi("RCC").onconnected(function (conn) {
    var rccFound = RCC.filter(function (rcc) { return rcc.pbx === conn.pbx });
    if (rccFound.length == 0) {
        RCC.push(conn);
        //request monitor users
        conn.send(JSON.stringify({ "api": "RCC", "mt": "Initialize", "limit": 50, "calls": true }));
    }
    log("RCC: connected conn " + JSON.stringify(conn));
    log("RCC: connected RCC " + JSON.stringify(RCC));




    //conn.send(JSON.stringify({ api: "RCC", mt: "Devices", cn: "Danilo Volz" }));
    conn.onmessage(function (msg) {
        var obj = JSON.parse(msg);
        var today = getDateNow();
        //Log de Dev
        //log("danilo req : RCC message:: received" + JSON.stringify(obj));


        if (obj.mt === "DevicesResult") {
            log("danilo req : RCC message:DevicesResult: " + JSON.stringify(obj.devices));

        }
        else if (obj.mt === "UserInitializeResult") {
            log("danilo req UserInitializeResult: RCC message:: received" + JSON.stringify(obj));
            //Atualiza connections
            var src = obj.src;
            log("SPLIT3:");
            var myArray = src.split(",");
            var sip = myArray[0];
            var pbx = myArray[1];
            var device = myArray[2];
            var num = myArray[3];
            try {
                //Check if the number dialed is one user, then call the user number
                var user = pbxTableUsers.filter(findBySip(num));
                log("danilo req: TriggerCall user " + JSON.stringify(user));
                if (user.length > 0) {
                    log("danilo req: TriggerCall user e164 " + user[0].columns.e164);
                    num = user[0].columns.e164;
                }
            } finally {
                log("danilo req: TriggerCall num to call " + num);
            }
            RCC.forEach(function (rcc) {
                if (rcc.pbx == pbx) {
                    log("danilo req UserInitializeResult: RCC pbx == src pbx and will insert the user id");
                    rcc[obj.src] = obj.user;
                }
            })
            log("danilo req UserInitializeResult: RCC after add new user id " + JSON.stringify(RCC));
            //Start a call
            var msg = { api: "RCC", mt: "UserCall", user: obj.user, e164: num, hw: device, src: src };
            //, src: obj.src    - pietro colocar isso logo acima ,apos o device
            log("danilo req callRCC: UserCall sent rcc msg " + JSON.stringify(msg));
            conn.send(JSON.stringify(msg));


        }
        else if (obj.mt === "UserCallResult") {

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
                    delete rcc[obj.src];
                }
            })
            log("RCC: connections after delete result " + JSON.stringify(RCC));
        }
        else if (obj.mt === "CallAdd") {
            log("danilo req : RCC message:CallAdd: " + JSON.stringify(obj));
            var userFound = pbxTableUsers.filter(function (user) { return user.columns.cn == obj.cn });
            var sip;
            if (userFound.length > 0) {
                sip = userFound[0].columns.h323;
                //addCall(sip, obj.call, obj.call, null, 0, null, null, null);

            }
        }
        else if (obj.mt === "CallUpdate") {
            log("danilo req : RCC message:CallUpdate: " + JSON.stringify(obj));

            var num;
            var device;
            var sip;

            try {
                if (obj.remote.h323 !== undefined && obj.remote.h323 !== "") {
                    sip = obj.remote.h323;
                    log("danilo req : RCC message:CallUpdate: sip = obj.remote.h323;");
                } else if (obj.remote.e164 !== undefined && obj.remote.e164 !== "") {
                    sip = obj.remote.e164;
                    log("danilo req : RCC message:CallUpdate: sip = obj.remote.e164;");
                } else {
                    // Se nenhum dos parâmetros estiver definido, ignore o evento
                    log("danilo req : RCC message:CallUpdate: sip = null");
                    return;
                }
                var userFound = pbxTableUsers.filter(function (user) { return user.columns.e164 == sip });
                if (userFound.length > 0) sip = userFound[0].columns.h323;
            } catch (e) {
                log("danilo req : RCC message:CallUpdate SIP Catch " + e);
                if (obj.remote.e164 !== undefined && obj.remote.e164 !== "") {
                    sip = obj.remote.e164;
                    log("danilo req : RCC message:CallUpdate: Catch sip = obj.remote.e164;");
                } else {
                    // Se o parâmetro remote.e164 não estiver definido, ignore o evento
                    log("danilo req : RCC message:CallUpdate: Catch sip = null");
                    return;
                }
            }
            //Define num
            try {
                if (obj.local.h323 !== undefined && obj.local.h323 !== "") {
                    num = obj.local.h323;
                    log("danilo req : RCC message:CallUpdate: num = obj.local.h323");
                } else if (obj.local.e164 !== undefined && obj.local.e164 !== "") {
                    num = obj.local.e164;
                    log("danilo req : RCC message:CallUpdate: num = obj.local.e164;");
                } else {
                    // Se nenhum dos parâmetros estiver definido, ignore o evento
                    log("danilo req : RCC message:CallUpdate: num = null");
                    return;
                }
                var userFound = pbxTableUsers.filter(function (user) { return user.columns.e164 == num });
                if (userFound.length > 0) num = userFound[0].columns.h323;
            } catch (e) {
                log("danilo req : RCC message:CallUpdate NUM Catch " + e);
                if (obj.local.e164 !== undefined && obj.local.e164 !== "") {
                    num = obj.local.e164;
                    log("danilo req : RCC message:CallUpdate:Catch num = obj.local.e164;");
                } else {
                    // Se o parâmetro local.e164 não estiver definido, ignore o evento
                    log("danilo req : RCC message:CallUpdate:Catch num = null");
                    return;
                }
            }
            var timeNow = getDateNow();
            var foundCall = calls.filter(function (call) {
                return call.callid === obj.call;
            });

            switch (obj.msg) {
                case "r-setup":
                    //num = obj.remote.e164 !== "" ? obj.remote.e164 : obj.remote.h323;
                    log("danilo req : RCC message:CallUpdate: r-setup 2 foundcall " + JSON.stringify(foundCall));
                    if (foundCall.length == 1) {
                        log("danilo req : RCC message:CallUpdate: r-setup 2 not found call num" + num);
                        addCall(sip, obj.call, obj.call, num, 1, "out", timeNow, device);
                        sendRingingEvents(sip, num, "IncomingCallRinging");
                        //triggerAction(sip, num, "out-number");
                        //triggerAction2(sip, num, num, "out-number", "CallRinging");
                    }
                    break;
                case "x-setup":
                    //num = obj.remote.e164 !== "" ? obj.remote.e164 : obj.remote.h323;
                    log("danilo req : RCC message:CallUpdate: x-setup 2 foundcall " + JSON.stringify(foundCall));
                    if (foundCall.length == 1) {
                        log("danilo req : RCC message:CallUpdate: x-setup 2 not found call num " + num);
                        addCall(sip, obj.call, obj.call, num, 129, "inc", timeNow, device);
                        sendRingingEvents(sip, num, "CallRinging");
                        //triggerAction(sip, num, "inc-number");
                        //triggerAction2(sip, num, num, "inc-number", "CallRinging");
                    }
                    break;
                case "x-alert":
                    handleAlert(obj.call, 4, timeNow, num, sip, sendCallEvents);
                    break;
                case "r-alert":
                    handleAlert(obj.call, 132, timeNow, num, sip, sendCallEvents);
                    break;
                case "x-conn":
                    handleConnected(obj.call, 5, timeNow, sip, sendCallEvents, num);
                    break;
                case "r-conn":
                    handleConnected(obj.call, 133, timeNow, sip, sendCallEvents, num);
                    break;
                case "x-rel":
                    handleDisconnect(obj.call, 6, timeNow, sip, sendCallEvents);
                    break;
                case "r-rel":
                    handleDisconnect(obj.call, 135, timeNow, sip, sendCallEvents);
                    break;
            }
        }
        else if (obj.mt === "CallDelete") {
            log("danilo req : RCC message:CallDelete: " + JSON.stringify(obj));
        }
        else if (obj.mt === "CallInfo") {
            log("danilo req : RCC message:CallInfo: " + JSON.stringify(obj));
            var src = obj.src;
            log("SPLIT4:");
            var myArray = src.split(",");
            var sip = myArray[0];
            var pbx = myArray[1];
            var device = myArray[2];
            var num = myArray[3];
            var btn_id;
            if (myArray[4]) btn_id = myArray[4];
            var timeNow = getDateNow();
            log("danilo-req : RCC message::CallInfo for user src " + sip);
            //var foundIndex = connectionsPbxSignal[0].sip.indexOf(obj.src);
            //log("danilo-req : RCC message::CallInfo user src foundIndex " + foundIndex);

            var foundCall = calls.filter(function (call) { return call.sip === sip && call.src == src });
            log("CALLS COMPLETA :" + JSON.stringify(calls))
            log("PBX table completa (columns) :" + JSON.stringify(pbxTableUsers))
            var objGuid = pbxTableUsers.filter(function(u){
                return u.columns.h323 == sip
            })[0]
            var guid = objGuid.columns.guid;
            log("GUID DO CARA" + JSON.stringify(objGuid.columns.guid))
            if (String(foundCall) == "") {
                log("danilo-req : RCC message::CallInfo NOT foundCall ");
                if (obj.state == 1 || obj.state == 129) {
                    var e164 = obj.peer.e164;
                    switch (obj.state) {
                        case 1:
                            //Ativa (Alert)
                            if (e164 == "") {
                                addCall(guid,sip, obj.call, src, num, obj.state, "out", timeNow, device)
                                //calls.push({ sip: String(sip), src: src, callid: obj.call, num: num, state: obj.state, direction: "out", call_started: timeNow, device: device });
                                //num = obj.peer.h323;
                            } else {
                                addCall(guid,sip, obj.call, src, num, obj.state, "out", timeNow, device)
                                //calls.push({ sip: String(sip), src: src, callid: obj.call, num: num, state: obj.state, direction: "out", call_started: timeNow, device: device });
                                //num = obj.peer.e164;
                            }
                            log("danilo req : RCC message:: call inserted " + JSON.stringify(calls));
                            //Atualiza status Botões Tela NovaAlert All
                            connectionsUser.forEach(function (conn) {
                                log("danilo-req x-alert: conn.sip " + String(conn.sip));
                                log("danilo-req x-alert: obj.src " + String(obj.src));
                                conn.send(JSON.stringify({ api: "user", mt: "CallRinging", src: sip, num: num }));
                            });
                            //triggerAction(sip, num, "out-number");
                            //triggerAction2(sip, num, num, "out-number", "CallRinging");

                            break;
                        case 129:
                            //Receptiva (Alert)
                            if (e164 == "") {
                                addCall(guid,sip, obj.call, src, num, obj.state, "inc", timeNow, device)
                                //calls.push({ sip: String(sip), src: obj.src, callid: obj.call, num: num, state: obj.state, direction: "inc", call_started: timeNow, device: device });
                                //num = obj.peer.h323;
                            } else {
                                addCall(guid,sip, obj.call, src, num, obj.state, "inc", timeNow, device)
                                //calls.push({ sip: String(sip), src: obj.src, callid: obj.call, num: num, state: obj.state, direction: "inc", call_started: timeNow, device: device });
                                //num = obj.peer.e164;
                            }
                            log("danilo req : RCC message:: call inserted " + JSON.stringify(calls));
                            //Atualiza status Botões Tela NovaAlert All
                            connectionsUser.forEach(function (conn) {
                                log("danilo-req x-alert: conn.sip " + String(conn.sip));
                                log("danilo-req x-alert: obj.src " + String(obj.src));
                                conn.send(JSON.stringify({ api: "user", mt: "IncomingCallRinging", src: sip, num: num }));
                            });
                            //triggerAction(sip, num, "inc-number");
                            triggerAction2(sip, num, num, "inc-number", "CallRinging");
                            break;
                    }
                }
            }
            else {
                log("danilo-req : RCC message::CallInfo foundCall " + JSON.stringify(foundCall));
                calls.forEach(function (call) {
                    if (call.src === src) { //call.sip == sip &&
                        if (call.callid < obj.call) {
                            call.callid = obj.call;
                        }
                        if (call.state < obj.state) {
                            switch (obj.state) {
                                case 4:
                                    //Ativa (Alert)
                                    call.call_ringing = timeNow;
                                    var e164 = obj.peer.e164;
                                    if (e164 == "") {
                                        var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "out" };
                                        num = obj.peer.h323;
                                    } else {
                                        var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "out" };
                                        num = obj.peer.e164;
                                    }
                                    //Atualiza status Botões Tela NovaAlert All
                                    connectionsUser.forEach(function (conn) {
                                        log("danilo-req x-alert: conn.sip " + String(conn.sip));
                                        log("danilo-req x-alert: obj.src " + String(obj.src));
                                        conn.send(JSON.stringify({ api: "user", mt: "CallRinging", src: sip, num: call.num }));
                                    });

                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message::sendCallEvents=true");
                                        httpClient(urlPhoneApiEvents, msg);
                                    }

                                    break;
                                case 132:
                                    //Receptiva (Alert)
                                    call.call_ringing = timeNow;
                                    var e164 = obj.peer.e164;
                                    if (e164 == "") {
                                        var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "inc" };
                                        num = obj.peer.h323;
                                    } else {
                                        var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "inc" };
                                        num = obj.peer.e164;
                                    }

                                    //Atualiza status Botões Tela NovaAlert All
                                    connectionsUser.forEach(function (conn) {
                                        log("danilo-req x-alert: conn.sip " + String(conn.sip));
                                        log("danilo-req x-alert: obj.src " + String(obj.src));
                                        conn.send(JSON.stringify({ api: "user", mt: "IncomingCallRinging", src: sip, num: myArray[3] }));
                                    });
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message::sendCallEvents=true");
                                        httpClient(urlPhoneApiEvents, msg);
                                    }
                                    break;
                                case 5:
                                    //Ativa (Connected)
                                    call.call_connected = timeNow;
                                    //Atualiza status Botões Tela NovaAlert All
                                    connectionsUser.forEach(function (conn) {
                                        log("danilo-req x-alert: conn.sip " + String(conn.sip));
                                        log("danilo-req x-alert: obj.src " + String(obj.src));
                                        conn.send(JSON.stringify({ api: "user", mt: "CallConnected", num: call.num, src: sip }));
                                    });
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message::sendCallEvents=true");
                                        var e164 = obj.peer.e164;
                                        if (e164 == "") {
                                            var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "ans" };
                                        } else {
                                            var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "ans" };
                                        }
                                        httpClient(urlPhoneApiEvents, msg);
                                    }
                                    break;
                                case 133:
                                    //Receptiva (Connected)
                                    call.call_connected = timeNow;
                                    //Atualiza status Botões Tela NovaAlert All
                                    connectionsUser.forEach(function (conn) {
                                        log("danilo-req x-alert: conn.sip " + String(conn.sip));
                                        log("danilo-req x-alert: obj.src " + String(obj.src));
                                        conn.send(JSON.stringify({ api: "user", mt: "CallConnected", num: call.num, src: sip }));
                                    });
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message::sendCallEvents=true");
                                        var e164 = obj.peer.e164;
                                        if (e164 == "") {
                                            var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.h323, Status: "ans" };
                                        } else {
                                            var msg = { User: sip, Grupo: "", Callinnumber: obj.peer.e164, Status: "ans" };
                                        }
                                        httpClient(urlPhoneApiEvents, msg);
                                    }
                                    break;
                                case 6:
                                    //Ativa (Disconnect Sent)
                                    call.state = obj.state;
                                    call.call_ended = timeNow;
                                    insertTblCalls(call);
                                    //Atualiza status Botões Tela NovaAlert All
                                    connectionsUser.forEach(function (conn) {
                                        log("danilo-req deleteCall:del conn.sip " + String(conn.sip));
                                        log("danilo-req deleteCall:del obj.src " + String(obj.src));
                                        conn.send(JSON.stringify({ api: "user", mt: "CallDisconnected", num: call.num, src: sip, btn_id: btn_id, btn_id: btn_id }));

                                    });
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message::sendCallEvents=true");
                                        var msg = { User: sip, Grupo: "", Callinnumber: call.num, Status: "del" };
                                        httpClient(urlPhoneApiEvents, msg);
                                    }
                                    //Remove
                                    log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + sip);
                                    calls = calls.filter(function (call) { return src != call.src });
                                    log("danilo req : after deleteCall " + JSON.stringify(calls));

                                    //Remove from RCC monitor
                                    RCC.forEach(function (rcc) {
                                        if (rcc.pbx == pbx) {
                                            var user = rcc[src];
                                            log("RCC: calling RCC API to End user Monitor " + String(sip) + " on PBX " + pbx + " the call has ended");
                                            var msg = { api: "RCC", mt: "UserEnd", user: user, src: sip + "," + pbx + "," + device + "," + num + "," + btn_id };
                                            rcc.send(JSON.stringify(msg));
                                        }
                                    })
                                    break;
                                case 7:
                                    //Ativa (Disconnect Received)
                                    call.state = obj.state;
                                    call.call_ended = timeNow;
                                    insertTblCalls(call);
                                    //Atualiza status Botões Tela NovaAlert All
                                    connectionsUser.forEach(function (conn) {
                                        log("danilo-req deleteCall:del conn.sip " + String(conn.sip));
                                        log("danilo-req deleteCall:del obj.src " + String(obj.src));
                                        conn.send(JSON.stringify({ api: "user", mt: "CallDisconnected", num: call.num, src: sip, btn_id: btn_id, btn_id: btn_id }));

                                    });
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message::sendCallEvents=true");
                                        var msg = { User: sip, Grupo: "", Callinnumber: call.num, Status: "del" };
                                        httpClient(urlPhoneApiEvents, msg);
                                    }
                                    //Remove
                                    log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + sip);
                                    calls = calls.filter(function (call) { return obj.src != call.src });
                                    log("danilo req : after deleteCall " + JSON.stringify(calls));
                                    //Remove from RCC monitor
                                    RCC.forEach(function (rcc) {
                                        if (rcc.pbx == pbx) {
                                            var user = rcc[src];
                                            log("RCC: calling RCC API to End user Monitor " + String(sip) + " on PBX " + pbx + " the call has ended");
                                            var msg = { api: "RCC", mt: "UserEnd", user: user, src: sip + "," + pbx + "," + device + "," + num + "," + btn_id };
                                            rcc.send(JSON.stringify(msg));
                                        }
                                    })
                                    break;
                                case 134:
                                    //Receptiva (Disconnect Sent)
                                    call.state = obj.state;
                                    call.call_ended = timeNow;
                                    insertTblCalls(call);
                                    //Atualiza status Botões Tela NovaAlert All
                                    connectionsUser.forEach(function (conn) {
                                        log("danilo-req deleteCall:del conn.sip " + String(conn.sip));
                                        log("danilo-req deleteCall:del obj.src " + String(obj.src));
                                        conn.send(JSON.stringify({ api: "user", mt: "CallDisconnected", num: call.num, src: sip, btn_id: btn_id }));

                                    });
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message::sendCallEvents=true");
                                        var msg = { User: sip, Grupo: "", Callinnumber: call.num, Status: "del" };
                                        httpClient(urlPhoneApiEvents, msg);
                                    }
                                    //Remove
                                    log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + sip);
                                    calls = calls.filter(function (call) { return src != call.src });
                                    log("danilo req : after deleteCall " + JSON.stringify(calls));
                                    //Remove from RCC monitor
                                    RCC.forEach(function (rcc) {
                                        if (rcc.pbx == pbx) {
                                            var user = rcc[src];
                                            log("RCC: calling RCC API to End user Monitor " + String(sip) + " on PBX " + pbx + " the call has ended");
                                            var msg = { api: "RCC", mt: "UserEnd", user: user, src: sip + "," + pbx + "," + device + "," + num + "," + btn_id };
                                            rcc.send(JSON.stringify(msg));
                                        }
                                    })
                                    break;
                                case 135:
                                    //Receptiva (Disconnect Received)
                                    call.state = obj.state;
                                    call.call_ended = timeNow;
                                    insertTblCalls(call);
                                    //Atualiza status Botões Tela NovaAlert All
                                    connectionsUser.forEach(function (conn) {
                                        //var ws = conn.ws;
                                        log("danilo-req deleteCall:del conn.sip " + String(conn.sip));
                                        log("danilo-req deleteCall:del obj.src " + String(obj.src));
                                        conn.send(JSON.stringify({ api: "user", mt: "CallDisconnected", num: call.num, src: sip, btn_id: btn_id }));

                                    });
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message::sendCallEvents=true");
                                        var msg = { User: sip, Grupo: "", Callinnumber: call.num, Status: "del" };
                                        httpClient(urlPhoneApiEvents, msg);
                                    }
                                    //Remove
                                    log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + sip);
                                    calls = calls.filter(function (call) { return src != call.src });
                                    log("danilo req : after deleteCall " + JSON.stringify(calls));
                                    //Remove from RCC monitor
                                    RCC.forEach(function (rcc) {
                                        if (rcc.pbx == pbx) {
                                            var user = rcc[src];
                                            log("RCC: calling RCC API to End user Monitor " + String(sip) + " on PBX " + pbx + " the call has ended");
                                            var msg = { api: "RCC", mt: "UserEnd", user: user, src: sip + "," + pbx + "," + device + "," + num + "," + btn_id };
                                            rcc.send(JSON.stringify(msg));
                                        }
                                    })
                                    break;

                            }
                            //Condicao de fuga dos states malucos que surgem eventualmente em Park ou Hold
                            if (obj.state == 4 || obj.state == 5 || obj.state == 6 || obj.state == 7 || obj.state == 132 || obj.state == 133 || obj.state == 134 || obj.state == 135) {
                                call.state = obj.state;
                            }
                        }


                    }
                })
                var foundCall = calls.filter(function (call) { return call.sip === sip && call.src == src });
                log("danilo-req : RCC message::CallInfo UPDATED foundCall " + JSON.stringify(foundCall));
            }
        }
    });
    conn.onclose(function () {
        log("RCC: disconnected");
        RCC.splice(RCC.indexOf(conn), 1);
    });
});


new PbxApi("PbxSignal").onconnected(function (conn) {
    log("PbxSignal: connected conn " + JSON.stringify(conn));

    // for each PBX API connection an own call array is maintained
    var signalFound = PbxSignal.filter(function (pbx) { return pbx.pbx === conn.pbx });
    if (signalFound.length == 0) {
        PbxSignal.push(conn);
    }

    //connectionsPbxSignal.push({ ws: conn });
    log("PbxSignal: connected PbxSignal " + JSON.stringify(PbxSignal));

    // register to the PBX in order to acceppt incoming presence calls
    conn.send(JSON.stringify({ "api": "PbxSignal", "mt": "Register", "flags": "NO_MEDIA_CALL", "src": conn.pbx }));

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

            //Atualiza connections
            var src = obj.src;
            log("SPLIT6:");
            var myArray = src.split(",");
            var pbx = myArray[0];
            log("PbxSignal: before add new userclient " + JSON.stringify(PbxSignal));
            PbxSignal.forEach(function (signal) {
                if (signal.pbx == pbx) {
                    if (!signal[obj.sig.cg.sip]) {
                        signal[obj.sig.cg.sip] = obj.call;

                        // connect call
                        conn.send(JSON.stringify({ "mt": "Signaling", "api": "PbxSignal", "call": obj.call, "src": obj.sig.cg.sip + "," + obj.src, "sig": { "type": "conn" } }));

                        //get name of the user from the signal
                        log("PbxSignal: after add new userclient " + JSON.stringify(PbxSignal));
                        var name = "";
                        var myArray = obj.sig.fty;
                        myArray.forEach(function (fty) {
                            if (fty.name) {
                                name = fty.name;
                            }
                        })
                        // send notification with badge count first time the user has connected
                        try {
                            count = pbxTableUsers.filter(findBySip(obj.sig.cg.sip))[0].badge;
                        } finally {
                            updateBadge(conn, obj.call, count);
                        }

                        //Notify users about this new login
                        log("danilo req: !signal[obj.sig.cg.sip] Notify users about this new login");
                        log("danilo req: !signal[obj.sig.cg.sip] Notify users about this new login connectionsUser=" + JSON.stringify(connectionsUser));
                        connectionsUser.forEach(function (c) {
                            log("danilo req: PbxSignal Signaling Notify users " + c.sip + " about this new login " + obj.sig.cg.sip);
                            c.send(JSON.stringify({ api: "user", mt: "UserConnected", src: obj.sig.cg.sip }));

                        })

                        //Intert into DB the event
                        log("PbxSignal= user " + obj.sig.cg.sip + " login");
                        //log("PbxSignal= GUID " + obj.sig.cg.guid + " login");
                        var today = getDateNow();
                        var msg = { guid: obj.sig.cg.sip, name: name, date: today, status: "Login", group: "PBX" }
                        log("PbxSignal= will insert it on DB : " + JSON.stringify(msg));
                        insertTblAvailability(msg);
                    }
                }
            })
        }

        // handle incoming call release messages
        if (obj.mt === "Signaling" && obj.sig.type === "rel") {
            //Remove
            log("PBXSignal: connections before delete result " + JSON.stringify(PbxSignal));
            var src = obj.src;
            log("SPLIT7:");
            var myArray = src.split(",");
            var sip = "";
            var pbx = myArray[0];
            PbxSignal.forEach(function (signal) {
                if (signal.pbx == pbx) {
                    sip = Object.keys(signal).filter(function (key) { return signal[key] === obj.call })[0];
                    if (String(sip) != "undefined") {
                        delete signal[sip];

                        log("PBXSignal: connections after delete result " + JSON.stringify(PbxSignal));

                        //get name of the user from the signal
                        var userTable = pbxTableUsers.filter(findBySip(sip));
                        log("PBXSignal: userTable " + JSON.stringify(userTable));
                        //Notify user about this logout
                        log("danilo req: PbxSignal Signaling rel notify connectionsUser " + JSON.stringify(connectionsUser));
                        connectionsUser.forEach(function (c) {
                            log("danilo req: PbxSignal Signaling Notify users " + c.sip + " about this new logout " + sip);
                            c.send(JSON.stringify({ api: "user", mt: "UserDisconnected", src: sip }));

                        })

                        //Intert into DB the event
                        log("PbxSignal= user " + sip + " logout");
                        var today = getDateNow();
                        var msg = { guid: sip, name: userTable[0].columns.cn, date: today, status: "Logout", group: "PBX" }
                        log("PbxSignal= will insert it on DB : " + JSON.stringify(msg));
                        insertTblAvailability(msg);
                    }

                }
            })
        }
    });

    conn.onclose(function () {
        log("PbxSignal: disconnected");
        PbxSignal.splice(PbxSignal.indexOf(conn), 1);
    });
});

//Funções Internas
function addCall(guid ,sip, callid, src, num, state, direction, call_started, device) {
    var found = false;
    calls.forEach(function (call) {
        if (call.callid == callid) {
            found = true;
            call.guid = guid,
            call.sip = String(sip),
                call.src = src,
                call.callid = callid,
                call.num = num,
                call.state = state,
                call.direction = direction,
                call.call_started = call_started,
                call.device = device
            log("danilo req : RCC message:: call updated " + JSON.stringify(call));
        }
    })
    if (found == false) {
        var call = {
            guid: String(guid),
            sip: String(sip),
            src: src,
            callid: callid,
            num: num,
            state: state,
            direction: direction,
            call_started: call_started,
            device: device
        };
        calls.push(call);
        log("danilo req : RCC message:: call inserted " + JSON.stringify(calls));
    }

}

function sendRingingEvents(sip, num, mt) {
    connectionsUser.forEach(function (conn) {
        conn.send(JSON.stringify({ api: "user", mt: mt, src: sip, num: num }));
    });
}

function handleAlert(callid, state, timeNow, num, sip, sendCallEvents) {
    calls.forEach(function (call) {
        if (call.callid == callid || call.sip === sip && call.num === num) {
            call.state = state;
            call.call_ringing = timeNow;
            sendRingingEvents(sip, call.num, "CallRinging");
            if (sendCallEvents) {
                var msg = { User: sip, Grupo: "", Callinnumber: num, Status: "out" };
                httpClient(urlPhoneApiEvents, msg);
            }
        }
    })
}

function handleConnected(callid, state, timeNow, sip, sendCallEvents, num) {
    calls.forEach(function (call) {
        if (call.callid == callid || call.sip === sip && call.num === num) {
            call.state = state;
            call.call_connected = timeNow;
            sendRingingEvents(sip, call.num, "CallConnected");
            if (sendCallEvents) {
                var msg = { User: sip, Grupo: "", Callinnumber: num, Status: "ans" };
                httpClient(urlPhoneApiEvents, msg);
            }
        }
    })
}

function handleDisconnect(callid, state, timeNow, sip, sendCallEvents) {
    calls.forEach(function (call) {
        if (call.callid == callid) {
            call.state = state;
            call.call_ended = timeNow;
            insertTblCalls(call);
            sendRingingEvents(sip, call.num, "CallDisconnected");
            if (sendCallEvents) {
                var msg = { User: sip, Grupo: "", Callinnumber: call.num, Status: "del" };
                httpClient(urlPhoneApiEvents, msg);
            }
            calls = calls.filter(function (call) {
                return call.callid !== callid;
            });
            log("danilo req : after deleteCall " + JSON.stringify(calls));
        }
    })
}

function callHTTPSServer(alert, guid) {
    log("callHTTPSServer::");
    var msg = { Username: "webuser", Password: "Wecom12#", AlarmNr: alert, LocationType: "GEO=47.565055,8.912027", Location: "Wecom", LocationDescription: "Wecom POA", Originator: String(guid), AlarmPinCode: "1234", Alarmtext: "Alarm from Myapps!" };
    //var msg = urlbody;
    httpClient(urlalert, msg);
}


function findBySip(sip) {
    return function (value) {
        if (value.columns.e164 == sip) {
            return true;
        }
        //countInvalidEntries++
        return false;
    }
}
function findButtonByGuid(guid) {
    return function (value) {
        if (value.button_user == guid) {
            return true;
        }
        //countInvalidEntries++
        return false;
    }
}

function updateTableBadgeCount(sip, mt) {
    if (mt == "IncrementCount") {
        pbxTableUsers.forEach(function (user) {
            if (user.columns.h323 == sip) {
                user.badge = user.badge + 1;

                log("Sending updates via Presence Signalling");

                PbxSignal.forEach(function (signal) {
                    log("danilo-req badge2:PbxSignal " + JSON.stringify(signal));
                    var call = signal[user.columns.h323];
                    if (call != null) {
                        log("danilo-req badge2:call found" + String(call) + ", will call updateBadge");
                        updateBadge(signal, call, user.badge);
                    }

                })


                /*
                connections.forEach(function (conn) {
                    if (conn.sip == user.sip) {
                        connectionsPbxSignal.forEach(function (c) {
                            updateBadge(c.ws, conn.call, user.badge);
                        })
                    }
                })
                */
            }
        })
    }
    if (mt == "DecrementCount") {
        pbxTableUsers.forEach(function (user) {
            if (user.columns.h323 == sip) {
                if (user.badge > 0) {
                    user.badge = user.badge - 1;
                    log("Sending updates via Presence Signalling");

                    PbxSignal.forEach(function (signal) {
                        log("danilo-req badge2:PbxSignal " + JSON.stringify(signal));
                        var call = signal[user.columns.h323];
                        if (call != null) {
                            log("danilo-req badge2:call found" + String(call) + ", will call updateBadge");
                            updateBadge(signal, call, user.badge);
                        }

                    })
                }

                /*
                connections.forEach(function (conn) {
                    if (conn.sip == user.sip) {
                        connectionsPbxSignal.forEach(function (c) {
                            updateBadge(c.ws, conn.call, user.badge);
                        })
                    }
                })
                */
            }
        })
    }
    if (mt == "ResetCount") {
        pbxTableUsers.forEach(function (user) {
            if (user.columns.h323 == sip) {
                user.badge = 0;

                log("Sending updates via Presence Signalling");

                PbxSignal.forEach(function (signal) {
                    log("danilo-req badge2:PbxSignal " + JSON.stringify(signal));
                    var call = signal[user.columns.h323];
                    if (call != null) {
                        log("danilo-req badge2:call found" + String(call) + ", will call updateBadge");
                        updateBadge(signal, call, user.badge);
                    }

                })
                /*
                connections.forEach(function (conn) {
                    if (conn.sip == user.sip) {
                        connectionsPbxSignal.forEach(function (c) {
                            updateBadge(c.ws, conn.call, user.badge);
                        })
                    }
                })
                */
            }
        })
    }
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

function alarmReceived(value) {
    var bodyDecoded = unescape(value);
    log("danilo-req alarmReceived:value " + String(bodyDecoded));
    try {
        var obj = JSON.parse(bodyDecoded);

        //Criado seletor de servidor para atender tanto NovaAlert quanto Milesight
        //Entendo que esse parâmetro será obrigatório, até porque o device tem que permitir a configuração do BOBY
        //de acordo com a necessidade de cada server.
        if (obj.ServerName == "Novaalert") {
            log("danilo-req alarmReceived:ServerType Novaalert");
            //Variaveis presentes no BODY
            //To
            //From
            //Location ou Location1
            //AlarmID

            var location = "";
            if (obj.To) {
                obj.To.forEach(function (user) {
                    //USER PARAMETER PRESENT
                    if (obj.Location) {
                        try {
                            location = obj.Location;
                            log("SPLIT8:");
                            var myArray = location.split(":");
                            log("SPLIT9:");
                            var locationarray = myArray[1].split(",");
                            var x = locationarray[0];
                            var y = locationarray[1];
                            log("danilo-req alarmReceived:User " + String(user));
                            connectionsUser.forEach(function (conn) {
                                //var ws = conn.ws;
                                log("danilo-req alarmReceived:Location conn.sip " + String(conn.sip));
                                log("danilo-req alarmReceived:Location obj.To " + String(user));
                                if (String(conn.sip) == String(user)) {

                                    //Send notifications
                                    conn.send(JSON.stringify({ api: "user", mt: "PopupRequest", name: "Alarme " + String(obj.AlarmID), alarm: "https://www.google.com/maps/embed/v1/place?key=" + google_api_key + "&q=" + x + "," + y + "&zoom=15" }));
                                }
                            });
                        } catch (e) {
                            log("danilo-req alarmReceived: Paramter Location not present");
                        }

                    }
                    if (obj.Location1) {
                        try {
                            location = obj.Location1;
                            log("SPLIT11:");
                            var myArray = location.split(":");
                            log("SPLIT12:");
                            var location = myArray[1].split(",");
                            var x = location[0];
                            var y = location[1];
                            log("danilo-req alarmReceived:Location1 User " + String(user));
                            connectionsUser.forEach(function (conn) {
                                log("danilo-req alarmReceived:Location1 conn.sip " + String(conn.sip));
                                log("danilo-req alarmReceived:Location1 obj.To " + String(user));
                                if (String(conn.sip) == String(user)) {
                                    //Send notifications
                                    conn.send(JSON.stringify({ api: "user", mt: "PopupRequest", name: "Alarme " + String(obj.AlarmID), alarm: "https://www.google.com/maps/embed/v1/place?key=" + google_api_key + "&q=" + x + "," + y + "&zoom=15" }));
                                }
                            });
                        } catch (e) {
                            log("danilo-req alarmReceived: Paramter Location1 not present");
                        }

                    }
                    //Intert into DB the event
                    log("danilo req: insert into DB = user " + user);
                    var today = getDateNow();
                    var msg = { guid: user, from: obj.From, name: "alarm", date: today, status: "inc", details: "ID:" + obj.AlarmID + " " + location }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);

                    connectionsUser.forEach(function (conn) {
                        //Send notifications
                        log("danilo-req alarmReceived:conn.sip " + String(conn.sip));
                        log("danilo-req alarmReceived:obj.To " + String(user));
                        if (String(conn.sip) == String(user)) {
                            conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: obj.AlarmID, src: obj.From }));
                            //update badge Icon
                            updateTableBadgeCount(user, "IncrementCount");
                        }
                    });
                    //VERIFY IF ACTION EXISTS FOR THIS ALARM ID FOR THIS USER
                    //triggerAction(user, obj.AlarmID, "alarm");
                    triggerAction2(obj.From, user, obj.AlarmID, "alarm", location);

                })
            }
            else {
                //SEM USUÁRIO DESTINO DEFINIDO
                var found;
                if (obj.Location) {
                    try {
                        location = obj.Location;
                        log("SPLIT13:");
                        var myArray = location.split(":");
                        log("SPLIT14:");
                        var locationarray = myArray[1].split(",");
                        var x = locationarray[0];
                        var y = locationarray[1];
                        //log("danilo-req alarmReceived:Location User " + String(obj.To));
                        connectionsUser.forEach(function (conn) {
                            //Intert into DB the event
                            log("danilo req: insert into DB = user " + conn.sip);
                            var today = getDateNow();
                            var msg = { guid: conn.guid, name: "alarm", date: today, status: "inc", details: "ID:" + obj.AlarmID + " " + obj.Location }
                            log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                            insertTblActivities(msg);
                            found = true;
                            //Send notifications
                            //updateTableBadgeCount(conn.sip, "IncrementCount");
                            log("danilo-req alarmReceived:Location conn.sip " + String(conn.sip));
                            //log("danilo-req alarmReceived:Location obj.To " + String(obj.To));
                            conn.send(JSON.stringify({ api: "user", mt: "PopupRequest", name: "Alarme " + String(obj.AlarmID), alarm: "https://www.google.com/maps/embed/v1/place?key=" + google_api_key + "&q=" + x + "," + y + "&zoom=15" }));

                        });
                    } catch (e) {
                        log("danilo-req alarmReceived: Paramter Location not present");
                    }

                }
                if (obj.Location1) {
                    try {
                        location = obj.Location;
                        log("SPLIT15:");
                        var myArray = location.split(":");
                        log("SPLIT16:");
                        var locationarray = myArray[1].split(",");
                        var x = locationarray[0];
                        var y = locationarray[1];
                        //log("danilo-req alarmReceived:Location1 User " + String(obj.To));
                        connectionsUser.forEach(function (conn) {
                            //Intert into DB the event
                            log("danilo req: insert into DB = user " + conn.sip);
                            var today = getDateNow();
                            var msg = { guid: conn.guid, name: "alarm", date: today, status: "inc", details: "ID:" + obj.AlarmID + " " + obj.Location1 }
                            log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                            insertTblActivities(msg);
                            found = true;
                            //Send notifications
                            //updateTableBadgeCount(conn.sip, "IncrementCount");
                            log("danilo-req alarmReceived:Location1 notifing user conn.sip " + String(conn.sip));
                            //log("danilo-req alarmReceived:Location1 obj.To " + String(obj.To));
                            conn.send(JSON.stringify({ api: "user", mt: "PopupRequest", name: "Alarme " + String(obj.AlarmID), alarm: "https://www.google.com/maps/embed/v1/place?key=" + google_api_key + "&q=" + x + "," + y + "&zoom=15" }));

                        });
                    } catch (e) {
                        log("danilo-req alarmReceived: Paramter Location1 not present");
                    }

                }
                connectionsUser.forEach(function (conn) {
                    //Intert into DB the event
                    if (conn.sip != obj.From) {
                        if (!found) {
                            log("danilo req: insert into DB = user " + conn.sip);
                            var today = getDateNow();
                            var msg = { guid: conn.guid, from: obj.From, name: "alarm", date: today, status: "inc", details: obj.AlarmID, user: obj.To }
                            log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                            insertTblActivities(msg);
                        }
                        //Send notifications
                        log("danilo-req alarmReceived:without User Paramter, notifing all users logged in now " + String(conn.sip));
                        updateTableBadgeCount(conn.sip, "IncrementCount");
                        conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: obj.AlarmID, src: obj.From }));
                        //VERIFY IF ACTION EXISTS FOR THIS ALARM ID FOR THIS USER
                        //triggerAction(conn.sip, parseInt(obj.AlarmID), "alarm");
                        triggerAction2(obj.From, conn.sip, parseInt(obj.AlarmID), "alarm", location);
                    }
                });
            }
        }
        else if (obj.ServerName == "Milesight") {
            log("danilo-req alarmReceived:ServerType Milesight");
            //Variaveis presentes no BODY
            //ServerName
            //DeviceName
            //AlarmID
            //Detaill
            connectionsUser.forEach(function (conn) {
                //VERIFY IF ACTION EXISTS FOR THIS ALARM ID FOR THIS USER
                triggerAction2(obj.DeviceName, conn.sip, parseInt(obj.AlarmID), "alarm", obj.Detail);

            });
        }
        else {
            log("danilo-req alarmReceived:NO ServerType present, it is a button!");
            connectionsUser.forEach(function (conn) {
                // Impede que o próprio usuário seja notificado e acionado.
                if (conn.sip != obj.From) {
                    //VERIFY IF ACTION EXISTS FOR THIS ALARM ID FOR THIS USER
                    triggerAction2(obj.From, conn.sip, parseInt(obj.AlarmID), "alarm", obj.Detail);
                }
            });
        }
    } catch (e) {
        log("danilo-req alarmReceived: Body not present! Erro " + e);
    }
}

function sensorReceived(value) {
    var sensors = [];
    var bodyDecoded = unescape(value);
    log("danilo-req sensorReceived:value " + String(bodyDecoded));

    //Get Actions from DB
    Database.exec("SELECT * FROM list_alarm_actions")
        .oncomplete(function (data) {
            log("danilo req triggerAction2: select from list_alarm_actions result legth=" + data.length);
            var str = JSON.parse(String(bodyDecoded));
            // Chamada da função para verificar ações
            var acoesAplicaveis = verificarAcoes(str, data);

            // Exibindo as ações aplicáveis
            if (acoesAplicaveis.length > 0) {
                log("Ações aplicáveis encontradas:");
                acoesAplicaveis.forEach(function (ac) {
                    log("- " + JSON.stringify(ac));
                    switch (ac.action_type) {
                        case "alarm":
                            connectionsUser.forEach(function (conn) {
                                log("danilo-req alarmReceived:alarm conn.sip " + String(conn.sip));
                                log("danilo-req alarmReceived:alarm ac.action_user " + String(ac.action_user));
                                if (String(conn.sip) == String(ac.action_user)) {
                                    //Send notifications
                                    log("danilo-req triggerAction2:notifing user logged in now " + String(conn.sip));
                                    updateTableBadgeCount(conn.sip, "IncrementCount");
                                    conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: ac.action_prt, src: str.sensor_name }));
                                }
                            });
                            break;
                        case "number":
                            //var foundConnectionUser = connectionsUser.filter(function (conn) { return conn.sip === to });
                            connectionsUser.forEach(function (conn) {
                                log("danilo-req alarmReceived:number conn.sip " + String(conn.sip));
                                log("danilo-req alarmReceived:number ac.action_user " + String(ac.action_user));
                                if (String(conn.sip) == String(ac.action_user)) {
                                    //Send notifications
                                    log("danilo-req alarmReceived:number conn ", JSON.stringify(conn));

                                    log("danilo-req triggerAction2:search rcc connection for user  " + String(conn.sip));
                                    //updateTableBadgeCount(conn.sip, "IncrementCount");
                                    //conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: ac.action_alarm_code, src: from }));

                                    var info = JSON.parse(conn.info)
                                    var pbx = info.pbx;
                                    RCC.forEach(function (rcc) {
                                        log("danilo-req alarmReceived:number RCC forEach rcc", JSON.stringify(rcc));
                                        if (rcc.pbx == pbx) {
                                            log("danilo req alarmReceived:number RCC: found PBX for sip " + conn.sip);
                                            var msg = { api: "RCC", mt: "UserInitialize", cn: conn.dn, hw: ac.action_device, src: conn.sip + "," + rcc.pbx + "," + ac.action_device + "," + ac.action_prt };
                                            log("danilo req alarmReceived:number RCC: UserInitialize sent rcc msg " + JSON.stringify(msg));
                                            rcc.send(JSON.stringify(msg));
                                        } else {
                                            log("rcc.pbx != info.pbx :: " + rcc.pbx + "!=" + pbx)
                                        }
                                    })

                                }
                            });
                            break;
                        case "button":
                            var btn = buttons.filter(function (btn) { return btn.id == ac.action_prt });
                            connectionsUser.forEach(function (conn) {
                                log("danilo-req alarmReceived:button conn.sip " + String(conn.sip));
                                log("danilo-req alarmReceived:button obj.to " + String(ac.action_user));
                                if (String(conn.sip) == String(ac.action_user)) {
                                    //Send notifications
                                    log("danilo-req triggerAction2:notifing user logged in now " + String(conn.sip));
                                    updateTableBadgeCount(conn.sip, "IncrementCount");
                                    conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: ac.action_name, src: str.sensor_name }));
                                    conn.send(JSON.stringify({ api: "user", mt: "PageRequest", name: ac.action_name, alarm: ac.action_prt, btn_id: btn[0].id, type: btn[0].button_type }));
                                }
                            });
                            break;
                        default:
                            break;
                    }
                });
            } else {
                log("Nenhuma ação aplicável encontrada.");
            }
        })
        .onerror(function (error, errorText, dbErrorCode) {
            log("danilo-req triggerAction2: Erro DB " + errorText);
        });

    try {
        var obj = JSON.parse(bodyDecoded);
        connectionsUser.forEach(function (conn) {
            log("danilo-req sensorReceived: user will be notified " + conn.sip);
            triggerAction2()
            //Verifica se exemtem ações para o valor do sensor
            //Get Buttons from DB
            Database.exec("SELECT * FROM list_buttons WHERE button_prt ='" + obj.sensor_name + "' AND button_user = '"+ conn.sip +"' ORDER BY id DESC LIMIT 1")
                .oncomplete(function (data) {
                    log("danilo req sensorReceived: select from list_buttons result legth=" + data.length);
                    var str = "";
                    str = JSON.stringify(data);
                    sensors = JSON.parse(String(str));
                    if (sensors.length > 0) {
                        sensors.forEach(function (bs) {
                            log("danilo-req sensorReceived: sensors.forEach " + JSON.stringify(bs));
                            conn.send(JSON.stringify({ api: "user", mt: "SensorReceived", value: obj }))
                        })
                    }
                })
                .onerror(function (error, errorText, dbErrorCode) {
                    log("danilo-req sensorReceived: Erro DB " + errorText);
                });
        })
        
        // Insere na tabela de histórico
        obj['date'] = getDateNow();
        insertTblSensorsHistory(obj)


    } catch (e) {
        log("danilo-req sensorReceived: Body not present! Erro " + e);
    }
    // Função para verificar as ações com base no JSON recebido
    function verificarAcoes(data, tabela) {
        var acoes = [];
        log("verificarAcoes:data" + JSON.stringify(data))
        tabela.forEach(function (entry) {
            log("verificarAcoes:entry" + JSON.stringify(entry))
            // Verifica se o nome do sensor corresponde
            if (entry.action_sensor_name === data.sensor_name) {
                // Verifica se o tipo de sensor corresponde
                if (data.hasOwnProperty(entry.action_sensor_type)) {
                    var value = data[entry.action_sensor_type];
                    log("verificarAcoes:value" + value)
                    // Verifica se o tipo de ação é max ou min
                    if (entry.action_start_type == "max-threshold" && value >= parseInt(entry.action_alarm_code)) {
                        acoes.push(entry);
                    } else if (entry.action_start_type == "min-threshold" && value <= parseInt(entry.action_alarm_code)) {
                        acoes.push(entry);
                    }
                }
            }
        });

        return acoes;
    }
}
function triggerActionOld(from, to, prt, type, detail) {
    try {
        //Get Actions from DB
        Database.exec("SELECT * FROM list_alarm_actions WHERE action_user ='" + to + "';")
            .oncomplete(function (data) {
                log("danilo req triggerAction2: select from list_alarm_actions result legth=" + data.length);
                var str = "";
                str = JSON.stringify(data);
                actions = JSON.parse(String(str));

                if (actions.length > 0) {
                    log("danilo-req triggerAction2:actions diferent of null " + JSON.stringify(actions));

                    actions.forEach(function (ac) {
                        log("danilo-req triggerAction2:ac " + JSON.stringify(ac));
                        if (ac.action_user == to) {
                            log("danilo-req triggerAction2:actions action_user " + ac.action_user + " == to " + to);
                            if (ac.action_alarm_code == prt && ac.action_start_type == type) {
                                log("danilo-req triggerAction2:actions action_alarm_code " + ac.action_alarm_code + " == prt " + prt + " == type " + type);

                                switch (ac.action_type) {
                                    case "alarm":
                                        connectionsUser.forEach(function (conn) {
                                            log("danilo-req alarmReceived:alarm conn.sip " + String(conn.sip));
                                            log("danilo-req alarmReceived:alarm obj.to " + String(to));
                                            if (String(conn.sip) == String(to)) {
                                                //Send notifications
                                                log("danilo-req triggerAction2:notifing user logged in now " + String(conn.sip));
                                                updateTableBadgeCount(conn.sip, "IncrementCount");
                                                conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: ac.action_alarm_code, src: from }));
                                                //conn.send(JSON.stringify({ api: "user", mt: "AlarmRequested", alarm: prt }));
                                            }
                                        });
                                        break;
                                    case "number":
                                        var foundConnectionUser = connectionsUser.filter(function (conn) { return conn.sip === to });
                                        connectionsUser.forEach(function (conn) {
                                            //var ws = conn.ws;
                                            log("danilo-req alarmReceived:number conn.sip " + String(conn.sip));
                                            log("danilo-req alarmReceived:number obj.to " + String(to));
                                            if (String(conn.sip) == String(to)) {
                                                //Send notifications
                                                log("danilo-req triggerAction2:notifing user logged in now " + String(conn.sip));
                                                updateTableBadgeCount(conn.sip, "IncrementCount");
                                                conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: ac.action_alarm_code, src: from }));
                                            }
                                        });
                                        //RCC.forEach(function (rcc) {
                                        //    var temp = rcc[String(foundConnectionUser.sip)];
                                        //    if (temp != null) {
                                        //        log("danilo-req alarmReceived:will call callRCC for user " + temp + " Nome " + foundConnectionUser.dn);
                                        //        callRCC(rcc, temp, "UserCall", ac.action_prt, foundConnectionUser.sip + "," + rcc.pbx);
                                        //    }
                                        //})
                                        log("danilo-req alarmReceived:number pre info ");
                                        var info = foundConnectionUser[0].info;
                                        log("danilo-req alarmReceived:number after info ", info);
                                        RCC.forEach(function (rcc) {
                                            log("danilo-req alarmReceived:number RCC forEach rcc", JSON.stringify(rcc));
                                            if (rcc.pbx == info.pbx) {
                                                log("danilo req alarmReceived:number RCC: found PBX for sip " + foundConnectionUser[0].sip);
                                                var msg = { api: "RCC", mt: "UserInitialize", cn: foundConnectionUser[0].dn, hw: ac.action_device, src: foundConnectionUser[0].sip + "," + rcc.pbx + "," + ac.action_device + "," + ac.action_prt };
                                                log("danilo req alarmReceived:number RCC: UserInitialize sent rcc msg " + JSON.stringify(msg));
                                                rcc.send(JSON.stringify(msg));
                                            }
                                        })

                                        break;
                                    case "button":
                                        var btn = buttons.filter(function (btn) { return btn.id == ac.action_prt });
                                        connectionsUser.forEach(function (conn) {
                                            log("danilo-req alarmReceived:button conn.sip " + String(conn.sip));
                                            log("danilo-req alarmReceived:button obj.to " + String(to));
                                            if (String(conn.sip) == String(to)) {
                                                //Send notifications
                                                log("danilo-req triggerAction2:notifing user logged in now " + String(conn.sip));
                                                updateTableBadgeCount(conn.sip, "IncrementCount");
                                                conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: ac.action_alarm_code, src: from }));
                                                conn.send(JSON.stringify({ api: "user", mt: "ButtonRequest", button: JSON.stringify(btn[0]) }));
                                            }
                                        });
                                        break;
                                    case "popup":
                                        connectionsUser.forEach(function (conn) {
                                            log("danilo-req alarmReceived:popup conn.sip " + String(conn.sip));
                                            log("danilo-req alarmReceived:popup obj.to " + String(to));
                                            if (String(conn.sip) == String(to)) {
                                                //Send notifications
                                                log("danilo-req triggerAction2:notifing user logged in now " + String(conn.sip));
                                                updateTableBadgeCount(conn.sip, "IncrementCount");
                                                conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: ac.action_alarm_code, src: from }));
                                                conn.send(JSON.stringify({ api: "user", mt: "PopupRequest", name: ac.action_name, alarm: ac.action_prt }));
                                            }
                                        });
                                        break;
                                    default:
                                        connectionsUser.forEach(function (conn) {
                                            log("danilo-req alarmReceived:" + ac.action_type + " conn.sip " + String(conn.sip));
                                            log("danilo-req alarmReceived:" + ac.action_type + " obj.to " + String(to));
                                            if (String(conn.sip) == String(to)) {
                                                //Send notifications
                                                log("danilo-req triggerAction2:notifing user logged in now " + String(conn.sip));
                                                updateTableBadgeCount(conn.sip, "IncrementCount");
                                                conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: ac.action_alarm_code, src: from }));
                                                conn.send(JSON.stringify({ api: "user", mt: "PageRequest", name: ac.action_name, alarm: ac.action_prt, type: ac.action_type }));
                                            }
                                        });
                                        break;
                                }
                            }
                        }
                    })
                    // Ação tratada... Então insere o log no DB para Histórico
                    log("danilo req: insert into DB = user " + to);
                    var today = getDateNow();
                    var foundGuid = pbxTableUsers.filter(function(u){
                        return u.columns.h323 == to
                    })[0]
                    log("FOUNDGUID " + foundGuid.columns.guid)
                    var msg = { sip: foundGuid.columns.guid, from: from, name: type, date: today, status: "inc", prt: prt, details: detail }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);
                }
                else {
                    log("danilo-req triggerAction2:actions is null " + JSON.stringify(actions));
                }
            })
            .onerror(function (error, errorText, dbErrorCode) {
                log("danilo-req triggerAction2: Erro DB " + errorText);
            });
    }
    catch (e) {
        log("danilo-req triggerAction2: Try Body decode Erro " + e);
    }
}

function triggerAction2(from, to, prt, type, detail) {
    try {
        //Get Actions from DB
        Database.exec("SELECT * FROM list_alarm_actions WHERE action_start_type ='" + type + "' AND action_alarm_code = '"+prt+"';")
            .oncomplete(function (data) {
                log("danilo req triggerAction2: select from list_alarm_actions result legth=" + data.length);
                var str = "";
                str = JSON.stringify(data);
                actions = JSON.parse(String(str));

                if (actions.length > 0) {
                    log("danilo-req triggerAction2:actions diferent of null " + JSON.stringify(actions));

                    actions.forEach(function (ac) {
                        log("danilo-req triggerAction2:ac " + JSON.stringify(ac));
                        switch (ac.action_type) {
                            case "alarm":
                                // Criar a string JSON substituindo as variáveis manualmente
                                //var value = '{"From":"' + ac.action_user + '", "AlarmID":"' + ac.action_prt + '", "Detail":"' + ac.action_name + '"}';

                                //alarmReceived(value);

                                connectionsUser.forEach(function (conn) {
                                    log("danilo-req alarmReceived:alarm conn.sip " + String(conn.sip));
                                    log("danilo-req alarmReceived:alarm ac.action_user " + String(ac.action_user));
                                    if (String(conn.sip) == String(ac.action_user)) {
                                        //Send notifications
                                        log("danilo-req triggerAction2:notifing user logged in now " + String(conn.sip));
                                        updateTableBadgeCount(conn.sip, "IncrementCount");
                                        conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: ac.action_alarm_code, src: from }));
                                        //conn.send(JSON.stringify({ api: "user", mt: "AlarmRequested", alarm: prt }));
                                    }
                                });
                                break;
                            case "number":
                                //var foundConnectionUser = connectionsUser.filter(function (conn) { return conn.sip === to });
                                connectionsUser.forEach(function (conn) {
                                    log("danilo-req alarmReceived:number conn.sip " + String(conn.sip));
                                    log("danilo-req alarmReceived:number ac.action_user " + String(ac.action_user));
                                    if (String(conn.sip) == String(ac.action_user)) {
                                        //Send notifications
                                        log("danilo-req alarmReceived:number conn ", JSON.stringify(conn));

                                        log("danilo-req triggerAction2:search rcc connection for user  " + String(conn.sip));
                                        //updateTableBadgeCount(conn.sip, "IncrementCount");
                                        //conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: ac.action_alarm_code, src: from }));

                                        var info = JSON.parse(conn.info)
                                        var pbx = info.pbx;
                                        RCC.forEach(function (rcc) {
                                            log("danilo-req alarmReceived:number RCC forEach rcc", JSON.stringify(rcc));
                                            if (rcc.pbx == pbx) {
                                                log("danilo req alarmReceived:number RCC: found PBX for sip " + conn.sip);
                                                var msg = { api: "RCC", mt: "UserInitialize", cn: conn.dn, hw: ac.action_device, src: conn.sip + "," + rcc.pbx + "," + ac.action_device + "," + ac.action_prt };
                                                log("danilo req alarmReceived:number RCC: UserInitialize sent rcc msg " + JSON.stringify(msg));
                                                rcc.send(JSON.stringify(msg));
                                            } else {
                                                log("rcc.pbx != info.pbx :: " + rcc.pbx + "!=" + pbx)
                                            }
                                        })

                                    }
                                });
                                break;
                            case "button":
                                var btn = buttons.filter(function (btn) { return btn.id == ac.action_prt });
                                connectionsUser.forEach(function (conn) {
                                    log("danilo-req alarmReceived:button conn.sip " + String(conn.sip));
                                    log("danilo-req alarmReceived:button obj.to " + String(to));
                                    if (String(conn.sip) == String(to)) {
                                        //Send notifications
                                        log("danilo-req triggerAction2:notifing user logged in now " + String(conn.sip));
                                        updateTableBadgeCount(conn.sip, "IncrementCount");
                                        conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: ac.action_name, src: from }));
                                        conn.send(JSON.stringify({ api: "user", mt: "PageRequest", name: btn[0].button_name, alarm: btn[0].button_prt, btn_id: btn[0].id, type: btn[0].button_type }));

                                        //conn.send(JSON.stringify({ api: "user", mt: "ButtonRequest", button: JSON.stringify(btn[0]) }));
                                    }
                                });
                                break;
                            default:
                                break;
                        }
                    })
                    // Ação tratada... Então insere o log no DB para Histórico
                    log("danilo req: insert into DB = user " + to);
                    var today = getDateNow();
                    var foundGuid = pbxTableUsers.filter(function(u){
                        return u.columns.h323 == to
                    })[0]
                    log("FOUNDGUID " + foundGuid.columns.guid)
                    var msg = { sip: foundGuid.columns.guid , from: from, name: type, date: today, status: "inc", prt: prt, details: detail }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);
                }
                else {
                    log("danilo-req triggerAction2:actions is null " + JSON.stringify(actions));
                }
            })
            .onerror(function (error, errorText, dbErrorCode) {
                log("danilo-req triggerAction2: Erro DB " + errorText);
            });
    }
    catch (e) {
        log("danilo-req triggerAction2: Try Body decode Erro " + e);
    }
}

function updateBadge(signal, call, count) {
    var msg = {
        "api": "PbxSignal", "mt": "Signaling", "call": call, "src": "badge",
        "sig": {
            "type": "facility",
            "fty": [{ "type": "presence_notify", "status": "open", "note": "#badge:" + count, "contact": "app:" }]
        }
    };

    signal.send(JSON.stringify(msg));
    return;
}

function comboManager(combo, guid, mt) {
    var combo_button = [];
    Database.exec("SELECT * FROM list_buttons WHERE button_user = '" + guid + "' AND id = " + parseInt(combo))
        .oncomplete(function (data) {
            log("result comboManager=" + JSON.stringify(data, null, 4));
            combo_button = data;

            log("result combo_button=" + JSON.stringify(combo_button));
            var type1 = parseInt(combo_button[0].button_type_1);
            log("result combo_button=type1 " + type1);

            buttons.forEach(function (button) {
                log("result forEach button" + JSON.stringify(button));
                if (parseInt(combo_button[0].button_type_1) == parseInt(button.id)) {
                    log("result comboManager= Localizado Combo 1 com ID" + button.id);
                    comboDispatcher(button, guid, mt);
                }
                if (parseInt(combo_button[0].button_type_2) == parseInt(button.id)) {
                    log("result comboManager= Localizado Combo 2 com ID" + button.id);
                    comboDispatcher(button, guid, mt);
                }
                if (parseInt(combo_button[0].button_type_3) == parseInt(button.id)) {
                    log("result comboManager= Localizado Combo 3 com ID" + button.id);
                    comboDispatcher(button, guid, mt);
                }
                if (parseInt(combo_button[0].button_type_4) == parseInt(button.id)) {
                    log("result comboManager= Localizado Combo 4 com ID" + button.id);
                    comboDispatcher(button, guid, mt);
                }
            })
            connectionsUser.forEach(function (conn) {
                if (conn.guid == guid) {
                    conn.send(JSON.stringify({ api: "user", mt: "ComboSuccessTrigged", src: combo }));
                }
            })
        })
        .onerror(function (error, errorText, dbErrorCode) {
            connectionsUser.forEach(function (conn) {
                if (conn.guid == guid) {
                    conn.send(JSON.stringify({ api: "user", mt: "MessageError", result: String(errorText) }));
                }
            })
        });
    function comboDispatcher(button, guid, mt) {
        log("danilo-req comboDispatcher:button " + JSON.stringify(button));
        switch (button.button_type) {
            case "alarm":
                log("danilo-req comboDispatcher:alarm guid " + String(guid));
                connectionsUser.forEach(function (conn) {
                    if (String(conn.guid) == String(guid)) {
                        log("danilo-req comboDispatcher:alarm found conn.guid " + String(conn.guid));
                        if (urlenable == true) {
                            callHTTPSServer(parseInt(button.button_prt), conn.guid);
                        }
                        // Tratar o evento internamente
                        //var value = '{"From":"${conn.sip}","AlarmID":"${button.button_prt}"}'
                        //ECMA5
                        // Criar a string JSON substituindo as variáveis manualmente
                        var value = '{"From":"' + conn.guid + '", "AlarmID":"' + button.button_prt + '"}';

                        alarmReceived(value);
                        //triggerAction(conn.sip, parseInt(button.button_prt), button.button_type)
                        conn.send(JSON.stringify({ api: "user", mt: "ComboAlarmStarted", alarm: button.button_prt, btn_id: button.id }));
                    }
                });
                break;
            case "number":
                var foundConnectionUser = connectionsUser.filter(function (conn) { return conn.guid === button.button_user });
                log("danilo-req:Type Number comboDispatcher:found ConnectionUser for user Name " + foundConnectionUser[0].dn);
                var foundCall = calls.filter(function (call) { return call.guid === button.button_user && call.num === button.button_prt });
                log("danilo-req:comboDispatcher:found call " + JSON.stringify(foundCall));
                if (foundCall.length == 0) {
                    //log("danilo-req:comboDispatcher:found call for user " + foundCall[0].sip);
                    //RCC.forEach(function (rcc) {
                    //    var temp = rcc[String(foundConnectionUser[0].sip)];
                    //    if (temp != null) {
                    //        user = temp;
                    //        log("danilo-req:comboDispatcher:will call callRCC for user " + user + " Nome " + foundConnectionUser[0].dn);
                    //        callRCC(rcc, user, "UserCall", button.button_prt_user, foundConnectionUser[0].sip + "," + rcc.pbx);
                    //    }
                    //})
                    var info = JSON.parse(foundConnectionUser[0].info);
                    RCC.forEach(function (rcc) {
                        if (rcc.pbx == info.pbx) {
                            log("danilo req:comboDispatcher:guid " + foundConnectionUser[0].guid);
                            var msg = { api: "RCC", mt: "UserInitialize", cn: foundConnectionUser[0].dn, hw: button.button_device, src: foundConnectionUser[0].guid + "," + rcc.pbx + "," + button.button_device + "," + button.button_prt + "," + button.id };
                            log("danilo req:comboDispatcher: UserInitialize sent rcc msg " + JSON.stringify(msg));
                            rcc.send(JSON.stringify(msg));
                        }
                    })
                    connectionsUser.forEach(function (conn) {
                        log("danilo-req comboDispatcher:ComboCallStart conn.guid " + String(conn.guid));
                        log("danilo-req comboDispatcher:ComboCallStart button.button_user " + String(button.button_user));
                        if (String(conn.guid) == String(button.button_user)) {
                            conn.send(JSON.stringify({ api: "user", mt: "ComboCallStart", src: conn.guid, num: button.button_prt, btn_id: button.id }));
                        }
                    });
                }
                break;
            case "dest":
                var foundConnectionUser = connectionsUser.filter(function (conn) { return conn.guid === button.button_user });
                log("danilo-req:comboDispatcher:found ConnectionUser for user Name " + foundConnectionUser[0].dn);
                var foundCall = calls.filter(function (call) { return call.guid === button.button_user && call.num === button.button_prt });
                log("danilo-req:comboDispatcher:found call " + JSON.stringify(foundCall));
                if (foundCall.length == 0) {
                    //log("danilo-req:comboDispatcher:found call for user " + foundCall[0].sip);
                    //RCC.forEach(function (rcc) {
                    //    var temp = rcc[String(foundConnectionUser[0].sip)];
                    //    if (temp != null) {
                    //        user = temp;
                    //        log("danilo-req:comboDispatcher:will call callRCC for user " + user + " Nome " + foundConnectionUser[0].dn);
                    //        callRCC(rcc, user, "UserCall", button.button_prt_user, foundConnectionUser[0].sip + "," + rcc.pbx);
                    //    }
                    //})
                    var info = JSON.parse(foundConnectionUser[0].info);
                    RCC.forEach(function (rcc) {
                        if (rcc.pbx == info.pbx) {
                            log("danilo req:comboDispatcher:guid " + foundConnectionUser[0].guid);
                            var msg = { api: "RCC", mt: "UserInitialize", cn: foundConnectionUser[0].dn, hw: button.button_device, src: foundConnectionUser[0].guid + "," + rcc.pbx + "," + button.button_device + "," + button.button_prt + "," + button.id };
                            log("danilo req:comboDispatcher: UserInitialize sent rcc msg " + JSON.stringify(msg));
                            rcc.send(JSON.stringify(msg));
                        }
                    })
                    connectionsUser.forEach(function (conn) {
                        log("danilo-req comboDispatcher:ComboCallStart conn.guid " + String(conn.guid));
                        log("danilo-req comboDispatcher:ComboCallStart button.button_user " + String(button.button_user));
                        if (String(conn.guid) == String(button.button_user)) {
                            conn.send(JSON.stringify({ api: "user", mt: "ComboCallStart", src: conn.guid, num: button.button_prt, btn_id: button.id }));
                        }
                    });
                }
                break;
            case "user":
                var foundConnectionUser = connectionsUser.filter(function (conn) { return conn.guid === guid });
                log("danilo-req:TypeUser comboDispatcher:found ConnectionUser for user Name " + foundConnectionUser[0].dn);
                var foundCall = calls.filter(function (call) { return call.guid == guid && call.num == button.button_prt });
                log("danilo-req:comboDispatcher:found call " + JSON.stringify(foundCall));
                if (foundCall.length == 0) {
                    var filterGuid = pbxTableUsers.filter(function(u){
                        return u.columns.guid == button.button_prt
                    })[0]
                    //log("danilo-req:comboDispatcher:found call for user " + foundCall[0].sip);
                    //RCC.forEach(function (rcc) {
                    //    var temp = rcc[String(foundConnectionUser[0].sip)];
                    //    if (temp != null) {
                    //        user = temp;
                    //        log("danilo-req:comboDispatcher:will call callRCC for user " + user + " Nome " + foundConnectionUser[0].dn);
                    //        callRCC(rcc, user, "UserCall", button.button_prt, foundConnectionUser[0].sip + "," + rcc.pbx);
                    //    }
                    //})
                    var info = JSON.parse(foundConnectionUser[0].info);
                    log("danilo req:comboDispatcher:info.pbx " + info.pbx);
                    RCC.forEach(function (rcc) {
                        if (rcc.pbx == info.pbx) {
                            log("danilo req:comboDispatcher:match pbx for guid user " + foundConnectionUser[0].guid);
                            var msg = { api: "RCC", mt: "UserInitialize", cn: foundConnectionUser[0].dn, hw: button.button_device, src: foundConnectionUser[0].guid + "," + rcc.pbx + "," + button.button_device + "," + filterGuid.columns.e164 + "," + button.id };
                            log("danilo req:comboDispatcher: UserInitialize sent rcc msg " + JSON.stringify(msg));
                            rcc.send(JSON.stringify(msg));
                        }
                    })

                    connectionsUser.forEach(function (conn) {
                        log("danilo-req type User comboDispatcher:ComboCallStart conn.sip " + String(conn.guid));
                        log("danilo-req comboDispatcher:ComboCallStart sip " + String(guid));
                        log("FilterGuid " + JSON.stringify(filterGuid))
                        if (String(conn.guid) == String(guid)) {
                            log("FilterGuid e164 " + filterGuid.columns.e164)
                            conn.send(JSON.stringify({ api: "user", mt: "ComboCallStart", src: conn.guid, num: filterGuid.columns.e164, btn_id: button.id }));
                        }
                    });
                }
                break;
            default:
                log("danilo-req comboDispatcher:page guid " + String(guid));
                connectionsUser.forEach(function (conn) {
                    if (String(conn.guid) == String(guid)) {
                        log("danilo-req comboDispatcher:page found conn.guid " + String(conn.guid));
                        conn.send(JSON.stringify({ api: "user", mt: "PageRequest", name: button.button_name, alarm: button.button_prt, btn_id: button.id, type: button.button_type }));
                    }
                });
                break;
        }
    }

}


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

//#region inserts reports
function insertTblActivities(obj) {
    Database.insert("INSERT INTO tbl_activities (guid, name, date, status, details) VALUES ('" + obj.guid + "','" + obj.name + "','" + obj.date + "','" + obj.status + "','" + obj.details + "')")
        .oncomplete(function () {
            log("insertTblActivities= Success");

        })
        .onerror(function (error, errorText, dbErrorCode) {
            log("insertTblActivities= Erro " + errorText);
        });
}
function insertTblCalls(obj) {
    if (!obj.call_ringing) {
        obj.call_ringing = "";
    }
    if (!obj.call_connected) {
        obj.call_connected = "";
    }
    Database.insert("INSERT INTO tbl_calls (guid, number, call_started, call_ringing, call_connected, call_ended, status, direction) VALUES ('" + obj.guid + "','" + obj.num + "','" + obj.call_started + "','" + obj.call_ringing + "','" + obj.call_connected + "','" + obj.call_ended + "'," + obj.state + ",'" + obj.direction + "')")
        .oncomplete(function () {
            log("insertTblCalls= Success");

        })
        .onerror(function (error, errorText, dbErrorCode) {
            log("insertTblCalls= Erro " + errorText);
        });
}
function insertTblAvailability(obj) {
    Database.insert("INSERT INTO tbl_availability (guid, name, date, status, group_name) VALUES ('" + obj.guid + "','" + obj.name + "','" + obj.date + "','" + obj.status + "','" + obj.group + "')")
        .oncomplete(function () {
            log("insertTblAvailability= Success");

        })
        .onerror(function (error, errorText, dbErrorCode) {
            log("insertTblAvailability= Erro " + errorText);
        });
}
function insertTblSensorsHistory(obj) {
    // Construindo a consulta de inserção
    var query = "INSERT INTO list_sensors_history (";
    // Obtendo as chaves do objeto (os nomes das colunas)
    var keys = Object.keys(obj);
    // Adicionando os nomes das colunas à consulta
    query += keys.join(", ") + ") VALUES (";
    // Adicionando placeholders para os valores
    // Adicionando valores diretamente em vez de placeholders
    query += keys.map(function (key) {
        if (typeof obj[key] === 'string') {
            return "'" + obj[key] + "'";
        } else {
            return obj[key];
        }
    }).join(", ") + ")";

    Database.insert(query)
        .oncomplete(function () {
            log("insertTblSensorHistory= Success");

        })
        .onerror(function (error, errorText, dbErrorCode) {
            log("insertTblSensorHistory= Erro " + errorText);
        });
}
//#endregion

