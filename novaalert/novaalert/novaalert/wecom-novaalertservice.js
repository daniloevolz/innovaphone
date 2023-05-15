//Config variables
var licenseAppToken = Config.licenseAppToken;
if (licenseAppToken == "") {
    var rand = Random.bytes(16);
    Config.licenseAppToken = String(rand);
    Config.save();
}
var license = getLicense();

var urlalert = Config.urlalert;
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
    sendCallEvents = Config.sendCallEvents;
    urlPhoneApiEvents = Config.urlPhoneApiEvents;
    google_api_key = Config.googleApiKey;
    licenseAppFile = Config.licenseAppFile;
    licenseInstallDate = Config.licenseInstallDate;
})

log("pietro req: License "+JSON.stringify(license));
if (license != null && license.System==true) {
    WebServer.onrequest("triggedAlarm", function (req) {
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
        log("connectionsUser: connectionsUser.length " + connectionsUser.length);
        
        connectionsUser.push(conn);
        log("Usuario Conectado:  " + connectionsUser.length);
     
        //Intert into DB the event of new login
        log("danilo req: insert into DB = user " + conn.sip );
        var today = getDateNow();
        var msg = { sip: conn.sip, name: conn.dn, date: today, status: "Login", group: "APP" }
        log("danilo req: will insert it on DB : " + JSON.stringify(msg));
        insertTblAvailability(msg);
        
        conn.onmessage(function (msg) {
            var obj = JSON.parse(msg);
            var info = JSON.parse(conn.info);
            var today = getDateNow();

            if (license != null && connectionsUser.length <= license.Users) {
                    
                if (obj.mt == "InitializeMessage") {
                    //Reset badge count
                    updateTableBadgeCount(conn.sip, "ResetCount");

                    //Callback user about success login
                    conn.send(JSON.stringify({ api: "user", mt: "UserInitializeResultSuccess", src: conn.sip }));

                    //Notify users about this new login
                    connectionsUser.forEach(function (c) {
                        c.send(JSON.stringify({ api: "user", mt: "UserConnected", src: conn.sip }));

                    })
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
                                    log("danilo req : User Connection conn.sip: "+conn.sip+" rcc temp user " + temp);
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
                                    conn.send(JSON.stringify({ api: "user", mt: "UserInitializeResultSuccess"}));
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
                    //RCC.forEach(function (c) {
                    //    for (var i in c) {
                    //        if (c.hasOwnProperty(i)) {
                    //            conn.send(JSON.stringify({ api: "user", mt: "UserConnected", src: i }));
                    //        }
                    //    }
                    //})
                    //Notify user about users logged
                    connectionsUser.forEach(function (c) {
                        conn.send(JSON.stringify({ api: "user", mt: "UserConnected", src: c.sip }));

                    })
                }
                if (obj.mt == "DecrementCount") {
                    updateTableBadgeCount(conn.sip, obj.mt);
                }
                if (obj.mt == "TriggerStartPage") {
                    //intert into DB the event
                    log("danilo req: insert into DB = user " + conn.sip);
                    var msg = { sip: conn.sip, name: "page", date: today, status: "start", details: obj.prt }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);
                }
                if (obj.mt == "TriggerStopPage") {
                    //intert into DB the event
                    log("danilo req: insert into DB = user " + conn.sip);
                    var msg = { sip: conn.sip, name: "page", date: today, status: "stop", details: obj.prt }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);
                }
                if (obj.mt == "TriggerStartVideo") {
                    //intert into DB the event
                    log("danilo req: insert into DB = user " + conn.sip);
                    var msg = { sip: conn.sip, name: "video", date: today, status: "start", details: obj.prt }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);
                }
                if (obj.mt == "TriggerStopVideo") {
                    //intert into DB the event
                    log("danilo req: insert into DB = user " + conn.sip);
                    var msg = { sip: conn.sip, name: "video", date: today, status: "stop", details: obj.prt }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);
                }
                if (obj.mt == "TriggerStopAlarm") {
                    //intert into DB the event
                    log("danilo req: insert into DB = user " + conn.sip);
                    var msg = { sip: conn.sip, name: "alarm", date: today, status: "stop", details: obj.prt }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);
                }
                if (obj.mt == "TriggerStartPopup") {
                    //intert into DB the event
                    log("danilo req: insert into DB = user " + conn.sip);
                    var msg = { sip: conn.sip, name: "popup", date: today, status: "start", details: obj.prt }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);
                }
                if (obj.mt == "TriggerAlert") {
                    //trigger the Novalink server
                    callNovaAlert(parseInt(obj.prt), conn.sip);
                    //intert into DB the event
                    log("danilo req: insert into DB = user " + conn.sip);
             
                    var msg = { sip: conn.sip, name: "alarm", date: today, status: "out", details: obj.prt }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);
                    //respond success to the client
                    conn.send(JSON.stringify({ api: "user", mt: "AlarmSuccessTrigged", alarm: obj.prt, btn_id: String(obj.btn_id)}));
                }
                if (obj.mt == "TriggerCombo") {
                    //trigger the combo function
                    comboManager(parseInt(obj.btn_id), conn.sip, obj.mt);
                    //intert into DB the event
                    log("danilo req: insert into DB = user " + conn.sip);

                    var msg = { sip: conn.sip, name: "combo", date: today, status: "start", details: obj.prt }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);
                }
                if (obj.mt == "StopCombo") {
                    //trigger the combo function
                    comboManager(parseInt(obj.btn_id), conn.sip, obj.mt);
                    //intert into DB the event
                    log("danilo req: insert into DB = user " + conn.sip);

                    var msg = { sip: conn.sip, name: "combo", date: today, status: "stop", details: obj.prt }
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
                        log("danilo req: TriggerCall user " + JSON.stringify(user));
                        if (user.length>0) {
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
                    var msg = { sip: conn.sip, name: "call", date: today, status: "start", details: obj.prt }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);

                    var userButtons = buttons.filter(findButtonBySip(conn.sip));
                    //log("danilo req:TriggerCall userButtons " + JSON.stringify(userButtons));
                    userButtons.forEach(function (user_b) {
                        if (String(user_b.button_prt) == String(obj.prt) && String(user_b.id) == String(obj.btn_id)) {
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
                                    var msg = { api: "RCC", mt: "UserConnect", user: user, call:call.callid, src: call.src};
                                    log("danilo req:UserConnect: UserConnect sent rcc msg " + JSON.stringify(msg));
                                    rcc.send(JSON.stringify(msg));
                                }
                            })
                        }
                    })
                }
                if (obj.mt == "EndCall") {
                    log("danilo req:EndCall");
                    calls.forEach(function (call) {
                        log("danilo req:EndCall call == " + JSON.stringify(call));
                        var btn = buttons.filter(function (btn) { return btn.id == obj.btn_id });
                        log("danilo req:EndCall btn == " + call.sip + "== " + conn.sip + "&& " + call.num + "==" + btn[0].button_prt + " &&" + call.device + " == "+btn[0].button_device);
                        if (call.sip == conn.sip && call.num == btn[0].button_prt && call.device == btn[0].button_device) {
                            log("danilo req:EndCall call.sip == conn.sip");
                            RCC.forEach(function (rcc) {
                                var temp = rcc[String(call.src)];
                                log("danilo req:TriggerCall call.sip == conn.sip:temp " + temp);
                                if (temp != null) {
                                    user = temp;
                                    var msg = { api: "RCC", mt: "UserClear", call: call.callid, cause:16, user: user, src: call.src };
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
                    Database.exec("SELECT * FROM list_buttons WHERE button_user = '" + conn.sip + "' OR button_user = 'all'")
                        .oncomplete(function (data) {
                            log("result=" + JSON.stringify(data, null, 4));
                            conn.send(JSON.stringify({ api: "user", mt: "SelectMessageSuccess", result: JSON.stringify(data, null, 4) }));

                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "user", mt: "MessageError", result: String(errorText) }));
                        });
                }
            }
            else{
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
            var msg = { sip: conn.sip, name: conn.dn, date: today, status: "Logout", group: "APP" }
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

            //Notify user about this logout
            connectionsUser.forEach(function (c) {
                c.send(JSON.stringify({ api: "user", mt: "UserDisconnected", src: conn.sip }));

            })

            //Remove cennection from array
            connectionsUser.splice(connectionsUser.indexOf(conn), 1);
            log("danilo req : connectionsUsers after delete conn of user " + conn.sip + " : " + JSON.stringify(connectionsUser));

        });
    }
});

new JsonApi("admin").onconnected(function (conn) {
    if (conn.app == "wecom-novaalertadmin") {
        conn.onmessage(function (msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AdminMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: obj.src, urlalert: urlalert, googlekey: google_api_key }));
                log("danilo-req AdminMessage: reducing the pbxTableUser object to send to user");
                var list_users = [];
                pbxTableUsers.forEach(function (u) {
                    list_users.push({ sip: u.columns.h323, cn: u.columns.cn, devices: u.columns.devices })
                })
                conn.send(JSON.stringify({ api: "admin", mt: "TableUsersResult", src: obj.src, result: JSON.stringify(list_users, null, 4) }));
            }
            if (obj.mt == "UpdateConfig") {
                if (obj.prt == "urlalert") {
                    Config.urlalert = obj.vl;
                    Config.save();
                }
                if (obj.prt == "googlekey") {
                    Config.googleApiKey = obj.vl;
                    Config.save();
                }
            }
            // license 
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
                    var lic = decrypt(obj.licenseToken,obj.licenseFile)
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

            if (obj.mt == "InsertMessage") {
                Database.insert("INSERT INTO list_buttons (button_name, button_prt, button_prt_user, button_user, button_type, button_device) VALUES ('" + String(obj.name) + "','" + String(obj.value) + "','" + String(obj.user) + "','" + String(obj.sip) + "','" + String(obj.type) + "','" + String(obj.device) + "')")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "InsertMessageSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(error) }));
                    });

            }

            if (obj.mt == "InsertNumberMessage") {
                Database.insert("INSERT INTO list_buttons (button_name, button_prt, button_prt_user, button_user, button_type, button_device) VALUES ('" + String(obj.name) + "','" + String(obj.value) + "','" + String(obj.user) + "','" + String(obj.sip) + "','" + String(obj.type) + "','" + String(obj.device) + "')")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "InsertMessageSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(error) }));
                    });

            }
            if (obj.mt == "UpdateMessage") {
                Database.exec("UPDATE list_buttons SET button_name='" + String(obj.name) + "', button_prt='" + String(obj.value) + "', button_prt_user='" + String(obj.user) + "', button_user='" + String(obj.sip) + "', button_type='" + String(obj.type) + "', button_device='" + String(obj.device) +"' WHERE id=" + obj.id)
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "UpdateMessageSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(error) }));
                    });
            }
            if (obj.mt == "InsertComboMessage") {
                Database.insert("INSERT INTO list_buttons (button_name, button_prt, button_prt_user, button_user, button_type, button_type_1, button_type_2, button_type_3, button_type_4) VALUES ('" + String(obj.name) + "','" + String(obj.value) + "','" + String(obj.user) + "','" + String(obj.sip) + "','" + String(obj.type) + "','" + String(obj.type1) + "','" + String(obj.type2) + "','" + String(obj.type3) + "','" + String(obj.type4) +"')")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "InsertMessageSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(error) }));
                    });

            }
            if (obj.mt == "UpdateComboMessage") {
                Database.exec("UPDATE list_buttons SET button_name='" + String(obj.name) + "', button_prt='" + String(obj.value) + "', button_prt_user='" + String(obj.user) + "', button_user='" + String(obj.sip) + "', button_type='" + String(obj.type) + "', button_type_1='" + String(obj.type1) + "', button_type_2='" + String(obj.type2) + "', button_type_3='" + String(obj.type3) + "', button_type_4='" + String(obj.type4) + "' WHERE id=" + obj.id)
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "UpdateComboMessageSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(error) }));
                    });
            }
            if (obj.mt == "SelectMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "SelectMessageResult" }));
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
            if (obj.mt == "InsertActionMessage") {
                //Database.insert("INSERT INTO list_alarm_actions (action_name, action_alarm_code, action_prt, action_user, action_type) VALUES ('" + String(obj.name) + "','" + String(obj.alarm) + "','" + String(obj.value) + "','" + String(obj.sip) + "','" + String(obj.type) + "')")
                Database.insert("INSERT INTO list_alarm_actions (action_name, action_alarm_code, action_start_type, action_prt, action_user, action_type, action_device) VALUES ('" + String(obj.name) + "','" + String(obj.alarm) + "','" + String(obj.start) + "','" + String(obj.value) + "','" + String(obj.sip) + "','" + String(obj.type)+ "','" + String(obj.device) +"')")
                .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "InsertActionMessageSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(error) }));
                    });

            }
            if (obj.mt == "UpdateActionMessage") {
                Database.exec("UPDATE list_alarm_actions SET action_name='" + String(obj.name) + "', action_alarm_code='" + String(obj.alarm) + "',action_start_type='" + String(obj.start) + "', action_prt='" + String(obj.value) + "', action_user='" + String(obj.sip) + "', action_type='" + String(obj.type)+ "', action_device='" + String(obj.device) + "' WHERE id=" + obj.id)
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
                conn.send(JSON.stringify({ api: "admin", mt: "DeleteMessageResult" }));
                obj.id.forEach(function (id) {
                    Database.exec("DELETE FROM list_alarm_actions WHERE id=" + id + ";")
                        .oncomplete(function () {
                            log("DeleteMessage: Delete Success ID "+id);
                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(errorText) }));
                        });
                })
                conn.send(JSON.stringify({ api: "admin", mt: "DeleteActionMessageSuccess" }));
                
            }
            if (obj.mt == "SelectFromReports") {
                switch (obj.src) {
                    case "RptCalls":
                        var query = "SELECT sip, number, call_started, call_ringing, call_connected, call_ended, status, direction FROM tbl_calls";
                        var conditions = [];
                        if (obj.sip) conditions.push("sip ='" + obj.sip + "'");
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
                        var query = "SELECT sip, name, date, status, details  FROM tbl_activities";
                        var conditions = [];
                        if (obj.sip) conditions.push("sip ='" + obj.sip + "'");
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
                        var query = "SELECT sip, date, status, group_name FROM tbl_availability";
                        var conditions = [];
                        if (obj.sip) conditions.push("sip ='" + obj.sip + "'");
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

        log("PbxTableUsers: msg received " + msg);

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
                    if (user.columns.h323 == obj.columns.h323) {
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
                                                            var msg = { sip: obj.columns.h323, name: obj.columns.cn, date: today, status: "Indisponível", group: grps2[j].name }
                                                            log("ReplicateUpdate= will insert it on DB : " + JSON.stringify(msg));
                                                            insertTblAvailability(msg);
                                                            break;
                                                        case "in":
                                                            var msg = { sip: obj.columns.h323, name: obj.columns.cn, date: today, status: "Disponível", group: grps2[j].name }
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
                                            var msg = { sip: obj.columns.h323, name: obj.columns.cn, date: today, status: "Indisponível", group: grps1[j].name }
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
                                                var msg = { sip: obj.columns.h323, name: obj.columns.cn, date: today, status: "Indisponível", group: grps2[j].name }
                                                log("ReplicateUpdate= will insert it on DB : " + JSON.stringify(msg));
                                                insertTblAvailability(msg);
                                                break;
                                            case "in":
                                                var msg = { sip: obj.columns.h323, name: obj.columns.cn, date: today, status: "Disponível", group: grps2[j].name }
                                                log("ReplicateUpdate= will insert it on DB : " + JSON.stringify(msg));
                                                insertTblAvailability(msg);
                                                break;
                                        }
                                    }
                                }
                            }
                        }
                        catch (e) {
                            log("ReplicateUpdate: User " + obj.columns.h323+"! Erro "+e)
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
    if(rccFound.length == 0) {
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
        log("danilo req : RCC message:: received" + JSON.stringify(obj));
        

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
            var msg = { api: "RCC", mt: "UserCall", user: obj.user, e164: num, hw:device, src:src};
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
        }
        else if (obj.mt === "CallUpdate") {
            log("danilo req : RCC message:CallUpdate: " + JSON.stringify(obj));
            var num;
            var device;
            var sip = obj.local.h323;
            var timeNow = getDateNow();

            var foundCall = calls.filter(function (call) { return call.sip === sip && call.callid == obj.call });

            switch (obj.msg) {
                case "x-call-proc":
                    //Ativa (Alert)
                    var e164 = obj.remote.e164;
                    if (String(foundCall) == "") {
                        log("danilo-req : RCC message::CallInfo NOT foundCall ");

                        if (e164 == "") {
                            num = obj.remote.h323;
                            calls.push({ sip: String(sip), src: obj.call, callid: obj.call, num: num, state: 1, direction: "out", call_started: timeNow, device: device });

                        } else {
                            num = obj.remote.e164;
                            calls.push({ sip: String(sip), src: obj.call, callid: obj.call, num: num, state: 1, direction: "out", call_started: timeNow, device: device });

                        }
                        log("danilo req : RCC message:: call inserted " + JSON.stringify(calls));
                        //Atualiza status Botões Tela NovaAlert All
                        connectionsUser.forEach(function (conn) {
                            log("danilo-req x-alert: conn.sip " + String(conn.sip));
                            log("danilo-req x-alert: obj.call " + String(obj.call));
                            conn.send(JSON.stringify({ api: "user", mt: "CallRinging", src: sip, num: num }));
                        });
                        triggerAction(sip, num, "out-number");


                    }


                    break;
                case "r-call-proc":
                    //Receptiva (Alert)
                    var e164 = obj.remote.e164;
                    if (String(foundCall) == "") {
                        log("danilo-req : RCC message::CallInfo NOT foundCall ");

                        if (e164 == "") {
                            num = obj.remote.h323;
                            calls.push({ sip: String(sip), src: obj.call, callid: obj.call, num: num, state: 129, direction: "inc", call_started: timeNow, device: device });
                        } else {
                            num = obj.remote.e164;
                            calls.push({ sip: String(sip), src: obj.call, callid: obj.call, num: num, state: 129, direction: "inc", call_started: timeNow, device: device });
                        }
                        log("danilo req : RCC message:: call inserted " + JSON.stringify(calls));
                        //Atualiza status Botões Tela NovaAlert All
                        connectionsUser.forEach(function (conn) {
                            log("danilo-req x-alert: conn.sip " + String(conn.sip));
                            log("danilo-req x-alert: obj.call " + String(obj.call));
                            conn.send(JSON.stringify({ api: "user", mt: "IncomingCallRinging", src: sip, num: num }));
                        });
                        triggerAction(sip, num, "inc-number");
                        break;
                    }
                case "x-alert":
                    //Ativa (Alert)
                    var sip = obj.local.h323;
                    calls.forEach(function (call) {
                        if (call.sip === sip && call.callid == obj.call) {
                            call.state = 4;
                            call.call_ringing = timeNow;
                            var e164 = obj.remote.e164;
                            if (e164 == "") {
                                var msg = { User: sip, Grupo: "", Callinnumber: obj.remote.h323, Status: "out" };
                            } else {
                                var msg = { User: sip, Grupo: "", Callinnumber: obj.remote.e164, Status: "out" };
                            }
                            //Atualiza status Botões Tela NovaAlert All
                            connectionsUser.forEach(function (conn) {
                                log("danilo-req x-alert: conn.sip " + String(conn.sip));
                                log("danilo-req x-alert: obj.call " + String(obj.call));
                                conn.send(JSON.stringify({ api: "user", mt: "CallRinging", src: sip, num: call.num }));
                            });

                            if (sendCallEvents) {
                                log("danilo-req : RCC message::sendCallEvents=true");
                                httpClient(urlPhoneApiEvents, msg);
                            }
                        }
                    });
                    break;
                case "r-alert":
                    //Receptiva (Alert)
                    var sip = obj.local.h323;
                    calls.forEach(function (call) {
                        if (call.sip === sip && call.callid == obj.call) {
                            call.state = 132;
                            call.call_ringing = timeNow;
                            var e164 = obj.remote.e164;
                            if (e164 == "") {
                                var msg = { User: sip, Grupo: "", Callinnumber: obj.remote.h323, Status: "inc" };
                            } else {
                                var msg = { User: sip, Grupo: "", Callinnumber: obj.remote.e164, Status: "inc" };
                            }

                            //Atualiza status Botões Tela NovaAlert All
                            connectionsUser.forEach(function (conn) {
                                log("danilo-req x-alert: conn.sip " + String(conn.sip));
                                log("danilo-req x-alert: obj.call " + String(obj.call));
                                conn.send(JSON.stringify({ api: "user", mt: "IncomingCallRinging", src: sip, num: call.num }));
                            });
                            if (sendCallEvents) {
                                log("danilo-req : RCC message::sendCallEvents=true");
                                httpClient(urlPhoneApiEvents, msg);
                            }
                        }
                    });
                    break;
                case "x-conn":
                    //Ativa (Connected)
                    var sip = obj.local.h323;
                    calls.forEach(function (call) {
                        if (call.sip === sip && call.callid == obj.call) {
                            call.state = 5;
                            call.call_connected = timeNow;
                            //Atualiza status Botões Tela NovaAlert All
                            connectionsUser.forEach(function (conn) {
                                log("danilo-req x-alert: conn.sip " + String(conn.sip));
                                log("danilo-req x-alert: obj.call " + String(obj.call));
                                conn.send(JSON.stringify({ api: "user", mt: "CallConnected", num: call.num, src: sip }));
                            });
                            if (sendCallEvents) {
                                log("danilo-req : RCC message::sendCallEvents=true");
                                var e164 = obj.peer.e164;
                                if (e164 == "") {
                                    var msg = { User: sip, Grupo: "", Callinnumber: obj.remote.h323, Status: "ans" };
                                } else {
                                    var msg = { User: sip, Grupo: "", Callinnumber: obj.remote.e164, Status: "ans" };
                                }
                                httpClient(urlPhoneApiEvents, msg);
                            }
                        }
                    });
                    break;
                case "r-conn":
                    //Receptiva (Connected)
                    var sip = obj.local.h323;
                    calls.forEach(function (call) {
                        if (call.sip === sip && call.callid == obj.call) {
                            call.state = 133;
                            call.call_connected = timeNow;
                            //Atualiza status Botões Tela NovaAlert All
                            connectionsUser.forEach(function (conn) {
                                log("danilo-req x-alert: conn.sip " + String(conn.sip));
                                log("danilo-req x-alert: obj.call " + String(obj.call));
                                conn.send(JSON.stringify({ api: "user", mt: "CallConnected", num: call.num, src: sip }));
                            });
                            if (sendCallEvents) {
                                log("danilo-req : RCC message::sendCallEvents=true");
                                var e164 = obj.remote.e164;
                                if (e164 == "") {
                                    var msg = { User: sip, Grupo: "", Callinnumber: obj.remote.h323, Status: "ans" };
                                } else {
                                    var msg = { User: sip, Grupo: "", Callinnumber: obj.remote.e164, Status: "ans" };
                                }
                                httpClient(urlPhoneApiEvents, msg);
                            }
                        }
                    });
                    break;
                case "x-rel":
                    //Ativa (Disconnect Sent)
                    var sip = obj.local.h323;
                    calls.forEach(function (call) {
                        if (call.sip === sip && call.callid == obj.call) {
                            call.state = 6;
                            call.call_ended = timeNow;
                            insertTblCalls(call);
                            //Atualiza status Botões Tela NovaAlert All
                            connectionsUser.forEach(function (conn) {
                                log("danilo-req deleteCall:del conn.sip " + String(conn.sip));
                                log("danilo-req deleteCall:del obj.call " + String(obj.call));
                                conn.send(JSON.stringify({ api: "user", mt: "CallDisconnected", num: call.num, src: sip, btn_id: btn_id}));

                            });
                            if (sendCallEvents) {
                                log("danilo-req : RCC message::sendCallEvents=true");
                                var msg = { User: sip, Grupo: "", Callinnumber: call.num, Status: "del" };
                                httpClient(urlPhoneApiEvents, msg);
                            }
                            //Remove
                            log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + sip);
                            calls = calls.filter(deleteCallsBySrc(obj.call));
                            log("danilo req : after deleteCall " + JSON.stringify(calls));

                        }
                    });
                    break;
                case "r-rel":
                    //Ativa (Disconnect Received)
                    var sip = obj.local.h323;
                    calls.forEach(function (call) {
                        if (call.sip === sip && call.callid == obj.call) {
                            call.state = 135;
                            call.call_ended = timeNow;
                            insertTblCalls(call);
                            //Atualiza status Botões Tela NovaAlert All
                            connectionsUser.forEach(function (conn) {
                                log("danilo-req deleteCall:del conn.sip " + String(conn.sip));
                                log("danilo-req deleteCall:del obj.call " + String(obj.call));
                                conn.send(JSON.stringify({ api: "user", mt: "CallDisconnected", num: call.num, src: sip, btn_id: btn_id }));

                            });
                            if (sendCallEvents) {
                                log("danilo-req : RCC message::sendCallEvents=true");
                                var msg = { User: sip, Grupo: "", Callinnumber: call.num, Status: "del" };
                                httpClient(urlPhoneApiEvents, msg);
                            }
                            //Remove
                            log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + sip);
                            calls = calls.filter(deleteCallsBySrc(obj.call));
                            log("danilo req : after deleteCall " + JSON.stringify(calls));
                        }
                    })
                    break;
            }
        }
        else if (obj.mt === "CallDelete") {
            log("danilo req : RCC message:CallDelete: " + JSON.stringify(obj));
        }
        else if (obj.mt === "CallInfo") {
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

            var foundCall = calls.filter(function (call) { return call.sip === sip && call.src == src});

            if (String(foundCall) == "") {
                log("danilo-req : RCC message::CallInfo NOT foundCall ");
                if (obj.state == 1 || obj.state == 129) {
                    var e164 = obj.peer.e164;
                    switch (obj.state) {
                        case 1:
                            //Ativa (Alert)
                            if (e164 == "") {
                                calls.push({ sip: String(sip), src: src, callid: obj.call, num: num, state: obj.state, direction: "out", call_started: timeNow, device: device });
                                //num = obj.peer.h323;
                            } else {
                                calls.push({ sip: String(sip), src: src, callid: obj.call, num: num, state: obj.state, direction: "out", call_started: timeNow, device: device});
                                //num = obj.peer.e164;
                            }
                            log("danilo req : RCC message:: call inserted " + JSON.stringify(calls));
                            //Atualiza status Botões Tela NovaAlert All
                            connectionsUser.forEach(function (conn) {
                                log("danilo-req x-alert: conn.sip " + String(conn.sip));
                                log("danilo-req x-alert: obj.src " + String(obj.src));
                                conn.send(JSON.stringify({ api: "user", mt: "CallRinging", src: sip, num: num }));
                            });
                            triggerAction(sip, num, "out-number");
                            break;
                        case 129:
                            //Receptiva (Alert)
                            if (e164 == "") {
                                calls.push({ sip: String(sip), src: obj.src, callid: obj.call, num: num, state: obj.state, direction: "inc", call_started: timeNow, device: device });
                                //num = obj.peer.h323;
                            } else {
                                calls.push({ sip: String(sip), src: obj.src, callid: obj.call, num: num, state: obj.state, direction: "inc", call_started: timeNow, device: device });
                                //num = obj.peer.e164;
                            }
                            log("danilo req : RCC message:: call inserted " + JSON.stringify(calls));
                            //Atualiza status Botões Tela NovaAlert All
                            connectionsUser.forEach(function (conn) {
                                log("danilo-req x-alert: conn.sip " + String(conn.sip));
                                log("danilo-req x-alert: obj.src " + String(obj.src));
                                conn.send(JSON.stringify({ api: "user", mt: "IncomingCallRinging", src: sip, num: num }));
                            });
                            triggerAction(sip, num, "inc-number");
                            break;
                    }
                }
            }
            else {
                log("danilo-req : RCC message::CallInfo foundCall " + JSON.stringify(foundCall));
                calls.forEach(function (call) {
                    if (call.sip == sip && call.src == src) {
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
                                        conn.send(JSON.stringify({ api: "user", mt: "IncomingCallRinging", src: sip, num: myArray[3]}));
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
                                        conn.send(JSON.stringify({ api: "user", mt: "CallDisconnected", num: call.num, src: sip, btn_id: btn_id, btn_id: btn_id  }));

                                    });
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message::sendCallEvents=true");
                                        var msg = { User: sip, Grupo: "", Callinnumber: call.num, Status: "del" };
                                        httpClient(urlPhoneApiEvents, msg);
                                    }
                                    //Remove
                                    log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + sip);
                                    calls = calls.filter(deleteCallsBySrc(src));
                                    log("danilo req : after deleteCall " + JSON.stringify(calls));

                                    //Remove from RCC monitor
                                    RCC.forEach(function (rcc) {
                                        if (rcc.pbx == pbx) {
                                            var user = rcc[src];
                                            log("RCC: calling RCC API to End user Monitor " + String(sip) + " on PBX " + pbx + " the call has ended");
                                            var msg = { api: "RCC", mt: "UserEnd", user: user, src: sip + "," + pbx + "," + device + "," + num + "," +btn_id};
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
                                        conn.send(JSON.stringify({ api: "user", mt: "CallDisconnected", num: call.num, src: sip, btn_id: btn_id, btn_id: btn_id  }));

                                    });
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message::sendCallEvents=true");
                                        var msg = { User: sip, Grupo: "", Callinnumber: call.num, Status: "del" };
                                        httpClient(urlPhoneApiEvents, msg);
                                    }
                                    //Remove
                                    log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + sip);
                                    calls = calls.filter(deleteCallsBySrc(src));
                                    log("danilo req : after deleteCall " + JSON.stringify(calls));
                                    //Remove from RCC monitor
                                    RCC.forEach(function (rcc) {
                                        if (rcc.pbx == pbx) {
                                            var user = rcc[src];
                                            log("RCC: calling RCC API to End user Monitor " + String(sip) + " on PBX " + pbx + " the call has ended");
                                            var msg = { api: "RCC", mt: "UserEnd", user: user, src: sip + "," + pbx + "," + device + "," + num + "," +btn_id };
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
                                        conn.send(JSON.stringify({ api: "user", mt: "CallDisconnected", num: call.num, src: sip, btn_id: btn_id  }));

                                    });
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message::sendCallEvents=true");
                                        var msg = { User: sip, Grupo: "", Callinnumber: call.num, Status: "del" };
                                        httpClient(urlPhoneApiEvents, msg);
                                    }
                                    //Remove
                                    log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + sip);
                                    calls = calls.filter(deleteCallsBySrc(src));
                                    log("danilo req : after deleteCall " + JSON.stringify(calls));
                                    //Remove from RCC monitor
                                    RCC.forEach(function (rcc) {
                                        if (rcc.pbx == pbx) {
                                            var user = rcc[src];
                                            log("RCC: calling RCC API to End user Monitor " + String(sip) + " on PBX " + pbx + " the call has ended");
                                            var msg = { api: "RCC", mt: "UserEnd", user: user, src: sip + "," + pbx + "," + device + "," + num + "," +btn_id};
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
                                        conn.send(JSON.stringify({ api: "user", mt: "CallDisconnected", num: call.num, src: sip, btn_id: btn_id  }));

                                    });
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message::sendCallEvents=true");
                                        var msg = { User: sip, Grupo: "", Callinnumber: call.num, Status: "del" };
                                        httpClient(urlPhoneApiEvents, msg);
                                    }
                                    //Remove
                                    log("danilo req : before deleteCall " + JSON.stringify(calls), "Obj.call " + sip);
                                    calls = calls.filter(deleteCallsBySrc(src));
                                    log("danilo req : after deleteCall " + JSON.stringify(calls));
                                    //Remove from RCC monitor
                                    RCC.forEach(function (rcc) {
                                        if (rcc.pbx == pbx) {
                                            var user = rcc[src];
                                            log("RCC: calling RCC API to End user Monitor " + String(sip) + " on PBX " + pbx + " the call has ended");
                                            var msg = { api: "RCC", mt: "UserEnd", user: user, src: sip + "," + pbx + "," + device + "," + num + "," +btn_id };
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
                var foundCall = calls.filter(function (call) { return call.sip === sip && call.src == src});
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

            // connect call
            conn.send(JSON.stringify({ "mt": "Signaling", "api": "PbxSignal", "call": obj.call, "src": obj.sig.cg.sip + "," + obj.src, "sig": { "type": "conn" } }));

            //Atualiza connections
            var src = obj.src;
            log("SPLIT6:");
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
            //RCC.forEach(function (rcc) {
            //    if (rcc.pbx == pbx) {
            //        log("PbxSignal: calling RCC API for new userclient " + String(name) + " on PBX " + pbx);
            //        var msg = { api: "RCC", mt: "Devices", cn: name, src: obj.sig.cg.sip + "," + obj.src };
            //        //var msg = { api: "RCC", mt: "UserInitialize", cn: name, src: obj.sig.cg.sip + "," + obj.src };
            //        rcc.send(JSON.stringify(msg));
            //    }
            //})

            // send notification with badge count first time the user has connected
            try {
                count = pbxTableUsers.filter(findBySip(obj.sig.cg.sip))[0].badge;
            } finally {
                updateBadge(conn, obj.call, count);
            }
            //Intert into DB the event
            log("PbxSignal= user " + obj.sig.cg.sip + " login");
            var today = getDateNow();
            var msg = { sip: obj.sig.cg.sip, name: name, date: today, status: "Login", group: "PBX" }
            log("PbxSignal= will insert it on DB : " + JSON.stringify(msg));
            insertTblAvailability(msg);
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
                    delete signal[sip];
                }
            })
            log("PBXSignal: connections after delete result " + JSON.stringify(PbxSignal));

            //Intert into DB the event
            log("PbxSignal= user " + sip + " logout");
            var today = getDateNow();
            var msg = { sip: sip, name: name, date: today, status: "Logout", group: "PBX" }
            log("PbxSignal= will insert it on DB : " + JSON.stringify(msg));
            insertTblAvailability(msg);
        }
    });

    conn.onclose(function () {
        log("PbxSignal: disconnected");
        PbxSignal.splice(PbxSignal.indexOf(conn), 1);
    });
});

//Funções Internas
function callNovaAlert(alert, sip) {
    log("callNovaAlert::");
    var msg = { Username: "webuser", Password: "Wecom12#", AlarmNr: alert, LocationType: "GEO=47.565055,8.912027", Location: "Wecom", LocationDescription: "Wecom POA", Originator: String(sip), AlarmPinCode: "1234", Alarmtext: "Alarm from Myapps!" };
    httpClient(urlalert, msg);
}

function deleteCallsBySrc(src) {
    return function (value) {
        if (value.src != src) {
            return true;
        }
        //countInvalidEntries++
        return false;
    }
}

function findBySip(sip) {
    return function (value) {
        if (value.columns.h323 == sip) {
            return true;
        }
        //countInvalidEntries++
        return false;
    }
}
function findButtonBySip(sip) {
    return function (value) {
        if (value.button_user == sip) {
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
                        log("danilo-req badge2:call found" + String(call) +", will call updateBadge");
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
        var location = "";
        if (obj.User) {
            obj.User.forEach(function (user) {
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
                            log("danilo-req alarmReceived:Location obj.User " + String(user));
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
                            log("danilo-req alarmReceived:Location1 obj.User " + String(user));
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
                var msg = { sip: user, name: "alarm", date: today, status: "inc", details: "ID:" + obj.AlarmID + " " + location }
                log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                insertTblActivities(msg);

                connectionsUser.forEach(function (conn) {
                    //Send notifications
                    log("danilo-req alarmReceived:conn.sip " + String(conn.sip));
                    log("danilo-req alarmReceived:obj.User " + String(user));
                    if (String(conn.sip) == String(user)) {
                        conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: obj.AlarmID, src: obj.Sip }));
                        //update badge Icon
                        updateTableBadgeCount(user, "IncrementCount");
                    }
                });
                //VERIFY IF ACTION EXISTS FOR THIS ALARM ID FOR THIS USER
                triggerAction(user, obj.AlarmID, "alarm");
 
            })
            
        }
        else {
            //SEM USUÁRIO DEFINIDO
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
                    //log("danilo-req alarmReceived:Location User " + String(obj.User));
                    connectionsUser.forEach(function (conn) {
                        //Intert into DB the event
                        log("danilo req: insert into DB = user " + conn.sip);
                        var today = getDateNow();
                        var msg = { sip: conn.sip, name: "alarm", date: today, status: "inc", details: "ID:" + obj.AlarmID + " " + obj.Location }
                        log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                        insertTblActivities(msg);
                        found = true;
                        //Send notifications
                        //updateTableBadgeCount(conn.sip, "IncrementCount");
                        log("danilo-req alarmReceived:Location conn.sip " + String(conn.sip));
                        //log("danilo-req alarmReceived:Location obj.User " + String(obj.User));
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
                    //log("danilo-req alarmReceived:Location1 User " + String(obj.User));
                    connectionsUser.forEach(function (conn) {
                        //Intert into DB the event
                        log("danilo req: insert into DB = user " + conn.sip);
                        var today = getDateNow();
                        var msg = { sip: conn.sip, name: "alarm", date: today, status: "inc", details: "ID:" + obj.AlarmID + " " + obj.Location1 }
                        log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                        insertTblActivities(msg);
                        found = true;
                        //Send notifications
                        //updateTableBadgeCount(conn.sip, "IncrementCount");
                        log("danilo-req alarmReceived:Location1 notifing user conn.sip " + String(conn.sip));
                        //log("danilo-req alarmReceived:Location1 obj.User " + String(obj.User));
                        conn.send(JSON.stringify({ api: "user", mt: "PopupRequest", name: "Alarme " + String(obj.AlarmID), alarm: "https://www.google.com/maps/embed/v1/place?key=" + google_api_key + "&q=" + x + "," + y + "&zoom=15" }));

                    });
                } catch (e) {
                    log("danilo-req alarmReceived: Paramter Location1 not present");
                }

            }
            connectionsUser.forEach(function (conn) {
                //Intert into DB the event
                if (!found) {
                    log("danilo req: insert into DB = user " + conn.sip);
                    var today = getDateNow();
                    var msg = { sip: conn.sip, name: "alarm", date: today, status: "inc", details: obj.AlarmID }
                    log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                    insertTblActivities(msg);
                }
                //Send notifications
                log("danilo-req alarmReceived:without User Paramter, notifing all users logged in now " + String(conn.sip));
                updateTableBadgeCount(conn.sip, "IncrementCount");
                conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: obj.AlarmID, src: obj.Sip }));
            });
        }  
    } catch (e) {
        log("danilo-req alarmReceived: Body not present! Erro " + e);
    }
}

function triggerAction(user, prt, type) {
    try {
        //Get Actions from DB
        Database.exec("SELECT * FROM list_alarm_actions WHERE action_user ='" + user + "';")
            .oncomplete(function (data) {
                log("danilo req : select from list_alarm_actions result legth=" + data.length);
                var str = "";
                str = JSON.stringify(data);
                actions = JSON.parse(String(str));
                log("danilo-req triggerAction:actions " + actions);
                if (actions != null) {
                    log("danilo-req triggerAction:actions diferent of null " + actions);
                    actions.forEach(function (ac) {
                        log("danilo-req triggerAction:ac " + JSON.stringify(ac));
                        if (ac.action_user == user) {
                            log("danilo-req alarmReceived:actions action_user " + ac.action_user + " == user " + user);
                            if (ac.action_alarm_code == prt && ac.action_start_type == type) {
                                log("danilo-req triggerAction:actions action_alarm_code " + ac.action_alarm_code + " == prt " + prt + " == type " + type);

                                switch (ac.action_type) {
                                    case "video":
                                        connectionsUser.forEach(function (conn) {
                                            //var ws = conn.ws;
                                            log("danilo-req alarmReceived:video conn.sip " + String(conn.sip));
                                            log("danilo-req alarmReceived:video obj.User " + String(user));
                                            if (String(conn.sip) == String(user)) {
                                                conn.send(JSON.stringify({ api: "user", mt: "VideoRequest", name: ac.action_name, alarm: ac.action_prt }));
                                            }
                                        });
                                        break;
                                    case "alarm":
                                        connectionsUser.forEach(function (conn) {
                                            //var ws = conn.ws;
                                            log("danilo-req alarmReceived:alarm conn.sip " + String(conn.sip));
                                            log("danilo-req alarmReceived:alarm obj.User " + String(user));
                                            if (String(conn.sip) == String(user)) {
                                                conn.send(JSON.stringify({ api: "user", mt: "AlarmRequested", alarm: prt }));
                                            }
                                        });
                                        break;
                                    case "number":
                                        var foundConnectionUser = connectionsUser.filter(function (conn) { return conn.sip === user });
                                        //RCC.forEach(function (rcc) {
                                        //    var temp = rcc[String(foundConnectionUser.sip)];
                                        //    if (temp != null) {
                                        //        log("danilo-req alarmReceived:will call callRCC for user " + temp + " Nome " + foundConnectionUser.dn);
                                        //        callRCC(rcc, temp, "UserCall", ac.action_prt, foundConnectionUser.sip + "," + rcc.pbx);
                                        //    }
                                        //})
                                        var info = foundConnectionUser[0].info;
                                        RCC.forEach(function (rcc) {
                                            if (rcc.pbx == info.pbx) {
                                                log("danilo req:comboDispatcher:sip " + foundConnectionUser[0].sip);
                                                var msg = { api: "RCC", mt: "UserInitialize", cn: foundConnectionUser[0].dn, hw: ac.action_device, src: foundConnectionUser[0].sip + "," + rcc.pbx + "," + ac.action_device +"," + ac.action_prt };
                                                log("danilo req:comboDispatcher: UserInitialize sent rcc msg " + JSON.stringify(msg));
                                                rcc.send(JSON.stringify(msg));
                                            }
                                        })

                                        break;
                                    case "page":
                                        connectionsUser.forEach(function (conn) {
                                            //var ws = conn.ws;
                                            log("danilo-req alarmReceived:page conn.sip " + String(conn.sip));
                                            log("danilo-req alarmReceived:page obj.User " + String(user));
                                            if (String(conn.sip) == String(user)) {
                                                conn.send(JSON.stringify({ api: "user", mt: "PageRequest", name: ac.action_name, alarm: ac.action_prt }));
                                            }
                                        });
                                        break;
                                    case "button":
                                        var btn = buttons.filter(function (btn) { return btn.id == ac.action_prt });
                                        connectionsUser.forEach(function (conn) {
                                            //var ws = conn.ws;
                                            log("danilo-req alarmReceived:page conn.sip " + String(conn.sip));
                                            log("danilo-req alarmReceived:page obj.User " + String(user));
                                            if (String(conn.sip) == String(user)) {
                                                conn.send(JSON.stringify({ api: "user", mt: "ButtonRequest", button: JSON.stringify(btn[0]) }));
                                            }
                                        });
                                        break;
                                    case "popup":
                                        connectionsUser.forEach(function (conn) {
                                            //var ws = conn.ws;
                                            log("danilo-req alarmReceived:page conn.sip " + String(conn.sip));
                                            log("danilo-req alarmReceived:page obj.User " + String(user));
                                            if (String(conn.sip) == String(user)) {
                                                conn.send(JSON.stringify({ api: "user", mt: "PopupRequest", name: ac.action_name, alarm: ac.action_prt }));
                                            }
                                        });
                                        break;
                                }
                            }
                        }
                    })
                }
            })
            .onerror(function (error, errorText, dbErrorCode) {
                log("danilo-req triggerAction: Erro DB " + errorText);
            });
    }
    catch (e) {
        log("danilo-req triggerAction: Paramter Location not present Erro " + e);
    }
}

function updateBadge(ws, call, count) {
    var msg = {
        "api": "PbxSignal", "mt": "Signaling", "call": call, "src": "badge",
        "sig": {
            "type": "facility",
            "fty": [{ "type": "presence_notify", "status": "open", "note": "#badge:" + count, "contact": "app:" }]
        }
    };

    ws.send(JSON.stringify(msg));
    return;
}

function comboManager(combo, sip, mt) {
    var combo_button = [];
    Database.exec("SELECT * FROM list_buttons WHERE button_user = '" + sip + "' AND id = " + parseInt(combo))
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
                    comboDispatcher(button, sip, mt);
                }
                if (parseInt(combo_button[0].button_type_2) == parseInt(button.id)) {
                    log("result comboManager= Localizado Combo 2 com ID" + button.id);
                    comboDispatcher(button, sip, mt);
                }
                if (parseInt(combo_button[0].button_type_3) == parseInt(button.id)) {
                    log("result comboManager= Localizado Combo 3 com ID" + button.id);
                    comboDispatcher(button, sip, mt);
                }
                if (parseInt(combo_button[0].button_type_4) == parseInt(button.id)) {
                    log("result comboManager= Localizado Combo 4 com ID" + button.id);
                    comboDispatcher(button, sip, mt);
                }
            })
            connectionsUser.forEach(function (conn) {
                if (conn.sip == sip) {
                    conn.send(JSON.stringify({ api: "user", mt: "ComboSuccessTrigged", src: combo }));
                }
            })
        })
        .onerror(function (error, errorText, dbErrorCode) {
            connectionsUser.forEach(function (conn) {
                if (conn.sip == sip) {
                    conn.send(JSON.stringify({ api: "user", mt: "MessageError", result: String(errorText) }));
                }
            })
        });
    function comboDispatcher(button, sip, mt) {
        log("danilo-req comboDispatcher:button " + JSON.stringify(button));
        switch (button.button_type) {
            case "video":
                log("danilo-req comboDispatcher:video sip " + String(sip));
                connectionsUser.forEach(function (conn) {
                    if (String(conn.sip) == String(sip)) {
                        log("danilo-req comboDispatcher:video found conn.sip " + String(conn.sip));
                        conn.send(JSON.stringify({ api: "user", mt: "VideoRequest", name: button.button_name, alarm: button.button_prt, btn_id: button.id  }));
                    }
                });
                break;
            case "alarm":
                log("danilo-req comboDispatcher:alarm sip " + String(sip));
                connectionsUser.forEach(function (conn) {
                    if (String(conn.sip) == String(sip)) {
                        log("danilo-req comboDispatcher:alarm found conn.sip " + String(conn.sip));
                        callNovaAlert(parseInt(button.button_prt), conn.sip);
                        conn.send(JSON.stringify({ api: "user", mt: "AlarmSuccessTrigged", alarm: button.button_prt, btn_id: button.id }));
                    }
                });
                break;
            case "externalnumber":
                var foundConnectionUser = connectionsUser.filter(function (conn) { return conn.sip === sip });
                log("danilo-req:comboDispatcher:found ConnectionUser for user Name " + foundConnectionUser[0].dn);
                var foundCall = calls.filter(function (call) { return call.sip === sip && call.num===button.button_prt});
                log("danilo-req:comboDispatcher:found call " + JSON.stringify(foundCall));
                if (foundCall.length == 0) {
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
                            log("danilo req:comboDispatcher:sip " + foundConnectionUser[0].sip);
                            var msg = { api: "RCC", mt: "UserInitialize", cn: foundConnectionUser[0].dn, hw: button.button_device, src: foundConnectionUser[0].sip + "," + rcc.pbx + "," + button.button_device + "," + button.button_prt + "," + button.id};
                            log("danilo req:comboDispatcher: UserInitialize sent rcc msg " + JSON.stringify(msg));
                            rcc.send(JSON.stringify(msg));
                        }
                    })
                    connectionsUser.forEach(function (conn) {
                        log("danilo-req comboDispatcher:ComboCallStart conn.sip " + String(conn.sip));
                        log("danilo-req comboDispatcher:ComboCallStart sip " + String(sip));
                        if (String(conn.sip) == String(sip)) {
                            conn.send(JSON.stringify({ api: "user", mt: "ComboCallStart", src: conn.sip, num: button.button_prt, btn_id: button.id }));
                        }
                    });
                }
                break;
            case "number":
                var foundConnectionUser = connectionsUser.filter(function (conn) { return conn.sip === button.button_user });
                log("danilo-req:comboDispatcher:found ConnectionUser for user Name " + foundConnectionUser[0].dn);
                var foundCall = calls.filter(function (call) { return call.sip === button.button_user && call.num === button.button_prt});
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
                    var info = JOSN.parse(foundConnectionUser[0].info);
                    RCC.forEach(function (rcc) {
                        if (rcc.pbx == info.pbx) {
                            log("danilo req:comboDispatcher:sip " + foundConnectionUser[0].sip);
                            var msg = { api: "RCC", mt: "UserInitialize", cn: foundConnectionUser[0].dn, hw: button.button_device, src: foundConnectionUser[0].sip + "," + rcc.pbx + "," + button.button_device + "," + button.button_prt_user + "," + button.id };
                            log("danilo req:comboDispatcher: UserInitialize sent rcc msg " + JSON.stringify(msg));
                            rcc.send(JSON.stringify(msg));
                        }
                    })
                    connectionsUser.forEach(function (conn) {
                        log("danilo-req comboDispatcher:ComboCallStart conn.sip " + String(conn.sip));
                        log("danilo-req comboDispatcher:ComboCallStart button.button_user " + String(button.button_user));
                        if (String(conn.sip) == String(button.button_user)) {
                            conn.send(JSON.stringify({ api: "user", mt: "ComboCallStart", src: conn.sip, num: button.button_prt, btn_id: button.id  }));
                        }
                    });
                }
                break;
            case "user":
                var foundConnectionUser = connectionsUser.filter(function (conn) { return conn.sip === sip });
                log("danilo-req:comboDispatcher:found ConnectionUser for user Name " + foundConnectionUser[0].dn);
                var foundCall = calls.filter(function (call) { return call.sip == sip && call.num == button.button_prt});
                log("danilo-req:comboDispatcher:found call " + JSON.stringify(foundCall));
                if (foundCall.length == 0) {
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
                            log("danilo req:comboDispatcher:match pbx for sip user " + foundConnectionUser[0].sip);
                            var msg = { api: "RCC", mt: "UserInitialize", cn: foundConnectionUser[0].dn, hw: button.button_device, src: foundConnectionUser[0].sip + "," + rcc.pbx + "," + button.button_device + "," + button.button_prt + "," + button.id };
                            log("danilo req:comboDispatcher: UserInitialize sent rcc msg " + JSON.stringify(msg));
                            rcc.send(JSON.stringify(msg));
                        }
                    })
                    connectionsUser.forEach(function (conn) {
                        log("danilo-req comboDispatcher:ComboCallStart conn.sip " + String(conn.sip));
                        log("danilo-req comboDispatcher:ComboCallStart sip " + String(sip));
                        if (String(conn.sip) == String(sip)) {
                            conn.send(JSON.stringify({ api: "user", mt: "ComboCallStart", src: conn.sip, num: button.button_prt, btn_id: button.id  }));
                        }
                    });
                }
                break;
            case "page":
                log("danilo-req comboDispatcher:page sip " + String(sip));
                connectionsUser.forEach(function (conn) {
                    if (String(conn.sip) == String(sip)) {
                        log("danilo-req comboDispatcher:page found conn.sip " + String(conn.sip));
                        conn.send(JSON.stringify({ api: "user", mt: "PageRequest", name: button.button_name, alarm: button.button_prt, btn_id: button.id }));
                    }
                });
                break;
        }
    }

}

function decrypt(key,hash) {
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
//reports
function insertTblActivities(obj) {
    Database.insert("INSERT INTO tbl_activities (sip, name, date, status, details) VALUES ('" + obj.sip + "','" + obj.name + "','" + obj.date + "','" + obj.status + "','" + obj.details + "')")
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
    Database.insert("INSERT INTO tbl_calls (sip, number, call_started, call_ringing, call_connected, call_ended, status, direction) VALUES ('" + obj.sip + "','" + obj.num + "','" + obj.call_started + "','" + obj.call_ringing + "','" + obj.call_connected + "','" + obj.call_ended +"'," + obj.state + ",'" + obj.direction + "')")
        .oncomplete(function () {
            log("insertTblCalls= Success");

        })
        .onerror(function (error, errorText, dbErrorCode) {
            log("insertTblCalls= Erro " + errorText);
        });
}
function insertTblAvailability(obj) {
    Database.insert("INSERT INTO tbl_availability (sip, name, date, status, group_name) VALUES ('" + obj.sip + "','" + obj.name + "','" + obj.date + "','" + obj.status + "','" + obj.group + "')")
        .oncomplete(function () {
            log("insertTblAvailability= Success");

        })
        .onerror(function (error, errorText, dbErrorCode) {
            log("insertTblAvailability= Erro " + errorText);
        });
}


