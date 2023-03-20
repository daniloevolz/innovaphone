
var urlalert = Config.urlalert;
var urlPhoneApiEvents = Config.urlPhoneApiEvents;
var sendCallEvents = Config.sendCallEvents;
var google_api_key = Config.googleApiKey;

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
})

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

//APPS API
new JsonApi("user").onconnected(function (conn) {
    log("danilo req: user conn: " + JSON.stringify(conn))
    connectionsUser.push(conn);

    if (conn.app == "wecom-novaalert") {

        //Intert into DB the event
        log("danilo req: insert into DB = user " + conn.sip );
        var today = getDateNow();
        var msg = { sip: conn.sip, name: conn.dn, date: today, status: "Login", group: "APP" }
        log("danilo req: will insert it on DB : " + JSON.stringify(msg));
        insertTblAvailability(msg);



        conn.onmessage(function (msg) {
            var obj = JSON.parse(msg);
            var today = getDateNow();

            if (obj.mt == "UserMessage") {
                updateTableBadgeCount(conn.sip, "ResetCount");
                var user = pbxTableUsers.filter(findBySip(conn.sip));
                let numDevices = user[0].columns.devices.length;
                log("Os devices são:" + numDevices)
                if (numDevices > 1) {
                    conn.send(JSON.stringify({ api: "user", mt: "DevicesList", devices: user[0].columns.devices, src: user[0].columns.h323 + "," + user[0].src }));
                } else {
                    var src = obj.src;
                    log("SPLIT1:");
                    var myArray = src.split(",");
                    var sip = myArray[0];
                    var pbx = myArray[1];
                    RCC.forEach(function (rcc) {
                        if (rcc.pbx == pbx) {
                            log("DeviceSeclected: calling RCC API for new userclient " + String(conn.dn) + " on PBX " + pbx);
                            var msg = { api: "RCC", mt: "UserInitialize", cn: conn.dn, hw: obj.hw, src: obj.src };
                            rcc.send(JSON.stringify(msg));
                        }
                    })
                }
                
            }
            if (obj.mt == "DeviceSelected") {
                var src = obj.src;
                log("SPLIT1:");
                var myArray = src.split(",");
                var sip = myArray[0];
                var pbx = myArray[1];
                RCC.forEach(function (rcc) {
                    if (rcc.pbx == pbx) {
                        log("DeviceSeclected: calling RCC API for new userclient " + String(conn.dn) + " on PBX " + pbx);
                        var msg = { api: "RCC", mt: "UserInitialize", cn: conn.dn, hw: obj.hw, src: obj.src };
                        rcc.send(JSON.stringify(msg));
                    }
                })
            }
            if (obj.mt == "UserPresence") {
                RCC.forEach(function (c) {
                    for (var i in c) {
                        
                        if (c.hasOwnProperty(i)) {
                            conn.send(JSON.stringify({ api: "user", mt: "UserConnected", src: i }));
                            //resultado += nomeDoObj + "." + i + " = " + obj[i] + "\n";
                        }
                    }
                })
                //connections.forEach(function (c) {
                //    if (c.user != "" && c.call !="number") {
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
                conn.send(JSON.stringify({ api: "user", mt: "AlarmSuccessTrigged", alarm: obj.prt }));
            }
            if (obj.mt == "TriggerCombo") {
                //trigger the combo function
                comboManager(parseInt(obj.prt), conn.sip, obj.mt);
                //intert into DB the event
                log("danilo req: insert into DB = user " + conn.sip);

                var msg = { sip: conn.sip, name: "combo", date: today, status: "start", details: obj.prt }
                log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                insertTblActivities(msg);
                conn.send(JSON.stringify({ api: "user", mt: "ComboSuccessTrigged", src: obj.prt }));
            }
            if (obj.mt == "StopCombo") {
                //trigger the combo function
                comboManager(parseInt(obj.prt), conn.sip, obj.mt);
                //intert into DB the event
                log("danilo req: insert into DB = user " + conn.sip);

                var msg = { sip: conn.sip, name: "combo", date: today, status: "stop", details: obj.prt }
                log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                insertTblActivities(msg);
                //respond success to the client
                conn.send(JSON.stringify({ api: "user", mt: "ComboSuccessTrigged", src: obj.prt }));
            }
            if (obj.mt == "TriggerCall") {
                var num;
                try {
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

                //treat the event
                var foundCall = false;
                calls.forEach(function (call) {
                    log("danilo req:TriggerCall call.sip == " + call.sip);
                    if (call.sip == conn.sip) {
                        foundCall = true;
                        //callRCC(connectionsRCC[0].ws, conn.cn, "UserClear", obj.prt, conn.sip);
                    }
                })
                if (!foundCall) {
                    RCC.forEach(function (rcc) {
                        var temp = rcc[String(conn.sip)];
                        log("danilo req:TriggerCall call.sip == conn.sip:temp " + temp);
                        if (temp != null) {
                            user = temp;
                            log("danilo-req rccRequest:wil call callRCC for user " + user+" to num "+num);
                            callRCC(rcc, user, "UserCall", num, conn.sip + "," + rcc.pbx);
                        }
                    })
                }
                //callRCC(connectionsRCC[0].ws, conn.cn, "UserCall", obj.prt, conn.sip);
            }
            if (obj.mt == "UserConnect") {
                log("danilo req:UserConnect");
                calls.forEach(function (call) {
                    log("danilo req:UserConnect call.sip == " + call.sip);
                    if (call.sip == conn.sip) {
                        log("danilo req:UserConnect call.sip == conn.sip");
                        RCC.forEach(function (rcc) {
                            var temp = rcc[String(conn.sip)];
                            log("danilo req:UserConnect call.sip == conn.sip:temp " + temp);
                            if (temp != null) {
                                user = temp;
                                //callRCC(connectionsRCC[0].ws, conn.cn, "UserClear", obj.prt, conn.sip);
                                log("danilo-req:UserConnect:will call callRCC for user " + user);
                                callRCC(rcc, user, "UserConnect", obj.prt, conn.sip + "," + rcc.pbx);
                            }
                        })
                    }
                })
            }
            if (obj.mt == "EndCall") {
                log("danilo req:EndCall");
                calls.forEach(function (call) {
                    log("danilo req:EndCall call.sip == "+ call.sip);
                    if (call.sip == conn.sip) {
                        log("danilo req:EndCall call.sip == conn.sip");
                        RCC.forEach(function (rcc) {
                            var temp = rcc[String(conn.sip)];
                            log("danilo req:TriggerCall call.sip == conn.sip:temp " + temp);
                            if (temp != null) {
                                user = temp;
                                //callRCC(connectionsRCC[0].ws, conn.cn, "UserClear", obj.prt, conn.sip);
                                log("danilo-req:TriggerCall:will call callRCC for user " + user);
                                callRCC(rcc, user, "UserClear", obj.prt, conn.sip + "," + rcc.pbx);
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
        });
    }
    conn.onclose(function () {
        log("User: disconnected");
        //Intert into DB the event
        log("danilo req: insert into DB = user " + conn.sip);
        var today = getDateNow();
        var msg = { sip: conn.sip, name: conn.dn, date: today, status: "Logout", group: "APP" }
        log("danilo req: will insert it on DB : " + JSON.stringify(msg));
        insertTblAvailability(msg);

        connectionsUser.splice(connectionsUser.indexOf(conn), 1);

    });
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
                    list_users.push({ sip: u.columns.h323, cn: u.columns.cn })
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
            if (obj.mt == "InsertMessage") {
                Database.insert("INSERT INTO list_buttons (button_name, button_prt, button_prt_user, button_user, button_type) VALUES ('" + String(obj.name) + "','" + String(obj.value) + "','" + String(obj.user) + "','" + String(obj.sip) + "','" + String(obj.type) + "')")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "InsertMessageSuccess" }));
                        initializeButtons();
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
                Database.exec("DELETE FROM list_buttons WHERE id=" + obj.id + ";")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "DeleteMessageSuccess" }));

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(errorText) }));
                    });
            }
            if (obj.mt == "InsertActionMessage") {
                Database.insert("INSERT INTO list_alarm_actions (action_name, action_alarm_code, action_prt, action_user, action_type) VALUES ('" + String(obj.name) + "','" + String(obj.alarm) + "','" + String(obj.value) + "','" + String(obj.sip) + "','" + String(obj.type) + "')")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "InsertActionMessageSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(error) }));
                    });

            }
            if (obj.mt == "SelectActionMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "SelectMessageResult" }));
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
                Database.exec("DELETE FROM list_alarm_actions WHERE id=" + obj.id + ";")
                    .oncomplete(function () {
                        conn.send(JSON.stringify({ api: "admin", mt: "DeleteActionMessageSuccess" }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "MessageError", result: String(errorText) }));
                    });
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
//ok
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
            //var foundTableUser = pbxTableUsers.filter(function (pbx) { return pbx.columns.h323 === obj.columns.h323 });
            //log("ReplicateUpdate= foundTableUser " + JSON.stringify(foundTableUser));
            //const grps1 = foundTableUser[0].columns.grps;
            //const grps2 = obj.columns.grps;
            log("ReplicateUpdate= user " + obj.columns.h323);
            try {
                //for (var i = 0; i < grps1.length; i++) {
                //    for (var j = 0; j < grps2.length; j++) {
                //        if (grps1[i].name === grps2[j].name) {
                //            if (grps1[i].dyn === grps2[j].dyn) {
                //            } else {
                //                log("ReplicateUpdate= user " + obj.columns.h323 + " group presence changed!!!");
                //                switch (grps2[j].dyn) {
                //                    case "out":
                //                        var msg = { sip: obj.columns.h323, name: obj.columns.cn, date: today, status: "Indisponível", group: g.name }
                //                        log("ReplicateUpdate= will insert it on DB : " + JSON.stringify(msg));
                //                        insertTblAvailability(msg);
                //                        break;
                //                    case "in":
                //                        var msg = { sip: obj.columns.h323, name: obj.columns.cn, date: today, status: "Disponível", group: g.name }
                //                        log("ReplicateUpdate= will insert it on DB : " + JSON.stringify(msg));
                //                        insertTblAvailability(msg);
                //                        break;
                //                }
                //            }
                //        }
                //    }
                //}
                pbxTableUsers.forEach(function (user) {
                    if (user.columns.h323 == obj.columns.h323) {
                        try {
                            const grps1 = user.columns.grps;
                            const grps2 = obj.columns.grps;
                            for (var i = 0; i < grps1.length; i++) {
                                for (var j = 0; j < grps2.length; j++) {
                                    if (grps1[i].name === grps2[j].name) {
                                        if (grps1[i].dyn === grps2[j].dyn) {
                                        } else {
                                            log("ReplicateUpdate= user " + obj.columns.h323 + " group presence changed!!!");
                                            switch (grps2[j].dyn) {
                                                case "out":
                                                    var msg = { sip: obj.columns.h323, name: obj.columns.cn, date: today, status: "Indisponível", group: g.name }
                                                    log("ReplicateUpdate= will insert it on DB : " + JSON.stringify(msg));
                                                    insertTblAvailability(msg);
                                                    break;
                                                case "in":
                                                    var msg = { sip: obj.columns.h323, name: obj.columns.cn, date: today, status: "Disponível", group: g.name }
                                                    log("ReplicateUpdate= will insert it on DB : " + JSON.stringify(msg));
                                                    insertTblAvailability(msg);
                                                    break;
                                            }
                                        }
                                    }
                                }
                            }

                        } catch (e){
                            log("ReplicateUpdate: User " + obj.columns.h323+" has no grups lenght at this moment! Erro "+e)

                        } finally {
                            log("ReplicateUpdate: Updating the object for user " + obj.columns.h323)
                            obj.badge = user.badge;
                            Object.assign(user, obj)

                        }
                        
                        
                    }
                })

            } catch (e) {
                log("ReplicateUpdate: User " + obj.columns.h323 + " Erro " + e)

            }finally {

            }
            

        }
    });

    conn.onclose(function () {
        log("PbxTableUsers: disconnected");
        pbxTable.splice(pbxTable.indexOf(conn), 1);
    });
});

//ok
new PbxApi("RCC").onconnected(function (conn) {
    var rccFound = RCC.filter(function (rcc) { return rcc.pbx === conn.pbx });
    if(rccFound.length == 0) {
        RCC.push(conn);
    }
    log("RCC: connected conn " + JSON.stringify(conn));
    log("RCC: connected RCC " + JSON.stringify(RCC));

    if (!queueGrupsOk) {
        initializeButtons();
        queueGrupsOk = true;
    }

    //conn.send(JSON.stringify({ "api": "RCC", "mt": "Initialize", "limit": 50, "calls": true }));

    //conn.send(JSON.stringify({ api: "RCC", mt: "Devices", cn: "Danilo Volz" }));
    conn.onmessage(function (msg) {
        var obj = JSON.parse(msg);
        var today = getDateNow();
        //Log de Dev
        log("danilo req : RCC message:: received" + JSON.stringify(obj));

        if (obj.mt === "DevicesResult") {
            log("danilo req : RCC message:DevicesResult: " + JSON.stringify(obj.devices));
            //var src = obj.src;
            //log("SPLIT2:");
            //var myArray = src.split(",");
            //var sip = myArray[0];
            //var pbx = myArray[1];
            //connectionsUser.forEach(function (usr) {
            //    if (String(usr.sip) == String(sip)) {
            //        usr.send(JSON.stringify({ api: "user", mt: "DevicesList", devices: obj.devices, src: src}));
            //    }

            //})
            //var hw = obj.devices.filter(function (device) { return device.text === "Softphone" })[0];
            //conn.send(JSON.stringify({ api: "RCC", mt: "UserInitialize", cn: "danilo", hw: hw }));
        }
        else if (obj.mt === "UserInitializeResult") {
            log("danilo req UserInitializeResult: RCC message:: received" + JSON.stringify(obj));
            //Atualiza connections
            var src = obj.src;
            log("SPLIT3:");
            var myArray = src.split(",");
            var sip = myArray[0];
            var pbx = myArray[1];
            RCC.forEach(function (rcc) {
                if (rcc.pbx == pbx) {
                    rcc[sip] = obj.user;
                }
            })
            connectionsUser.forEach(function (c) {
                c.send(JSON.stringify({ api: "user", mt: "UserConnected", src: sip }));

            })
            

            //updateConnections(obj.src, "user", obj.user, obj.area);
        } else if (obj.mt === "UserEndResult") {
            
        }
        else if (obj.mt === "CallInfo") {
            var src = obj.src;
            log("SPLIT4:");
            var myArray = src.split(",");
            var sip = myArray[0];
            var pbx = myArray[1];
            var timeNow = getDateNow();

            log("danilo-req : RCC message::CallInfo for user src " + sip);
            //var foundIndex = connectionsPbxSignal[0].sip.indexOf(obj.src);
            //log("danilo-req : RCC message::CallInfo user src foundIndex " + foundIndex);

            var foundCall = calls.filter(function (call) { return call.sip === sip });

            if (String(foundCall) == "") {
                log("danilo-req : RCC message::CallInfo NOT foundCall ");
                if (obj.state == 1 || obj.state == 129) {
                    var e164 = obj.peer.e164;
                    log("SPLIT5:");
                    var myArray = obj.src.split(",");
                    var src = myArray[0];

                    switch (obj.state) {
                        case 1:
                            //Ativa (Alert)
                            if (e164 == "") {
                                calls.push({ sip: String(src), callid: obj.call, num: obj.peer.h323, state: obj.state, direction: "out", call_started: timeNow });
                            } else {
                                calls.push({ sip: String(src), callid: obj.call, num: obj.peer.e164, state: obj.state, direction: "out", call_started: timeNow });
                            }
                            log("danilo req : RCC message:: call inserted " + JSON.stringify(calls));
                            //Atualiza status Botões Tela NovaAlert All
                            connectionsUser.forEach(function (conn) {
                                log("danilo-req x-alert: conn.sip " + String(conn.sip));
                                log("danilo-req x-alert: obj.src " + String(obj.src));
                                conn.send(JSON.stringify({ api: "user", mt: "CallRinging", src: sip}));
                            });
                            break;
                        case 129:
                            //Receptiva (Alert)
                            if (e164 == "") {
                                calls.push({ sip: String(src), callid: obj.call, num: obj.peer.h323, state: obj.state, direction: "inc", call_started: timeNow });
                            } else {
                                calls.push({ sip: String(src), callid: obj.call, num: obj.peer.e164, state: obj.state, direction: "inc", call_started: timeNow });
                            }
                            log("danilo req : RCC message:: call inserted " + JSON.stringify(calls));
                            //Atualiza status Botões Tela NovaAlert All
                            connectionsUser.forEach(function (conn) {
                                log("danilo-req x-alert: conn.sip " + String(conn.sip));
                                log("danilo-req x-alert: obj.src " + String(obj.src));
                                conn.send(JSON.stringify({ api: "user", mt: "IncomingCallRinging", src: sip }));
                            });
                            break;
                    }
                }
            }
            else {
                log("danilo-req : RCC message::CallInfo foundCall " + JSON.stringify(foundCall));
                calls.forEach(function (call) {
                    if (call.sip == sip) {
                        if (call.callid < obj.call) {
                            call.callid = obj.call;
                        }
                        if (call.state < obj.state) {
                            switch (obj.state) {
                                case 4:
                                    //Ativa (Alert)
                                    call.call_ringing = timeNow;
                                    //Atualiza status Botões Tela NovaAlert All
                                    connectionsUser.forEach(function (conn) {
                                        log("danilo-req x-alert: conn.sip " + String(conn.sip));
                                        log("danilo-req x-alert: obj.src " + String(obj.src));
                                        conn.send(JSON.stringify({ api: "user", mt: "CallRinging", src: sip }));
                                    });

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
                                    call.call_ringing = timeNow;
                                    //Atualiza status Botões Tela NovaAlert All
                                    connectionsUser.forEach(function (conn) {
                                        log("danilo-req x-alert: conn.sip " + String(conn.sip));
                                        log("danilo-req x-alert: obj.src " + String(obj.src));
                                        conn.send(JSON.stringify({ api: "user", mt: "IncomingCallRinging", src: sip }));
                                    });
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
                                    call.state = obj.state;
                                    call.call_ended = timeNow;
                                    insertTblCalls(call);
                                    //Atualiza status Botões Tela NovaAlert All
                                    connectionsUser.forEach(function (conn) {
                                        log("danilo-req deleteCall:del conn.sip " + String(conn.sip));
                                        log("danilo-req deleteCall:del obj.src " + String(obj.src));
                                        conn.send(JSON.stringify({ api: "user", mt: "CallDisconnected", num: call.num, src: sip }));

                                    });
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message::sendCallEvents=true");
                                        if (queues.some(function (v) { return v.Fila === sip })) {
                                            var msg = { User: "", Grupo: sip, Callinnumber: call.num, Status: "del" };
                                        } else {
                                            var msg = { User: sip, Grupo: "", Callinnumber: call.num, Status: "del" };
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
                                    call.state = obj.state;
                                    call.call_ended = timeNow;
                                    insertTblCalls(call);
                                    //Atualiza status Botões Tela NovaAlert All
                                    connectionsUser.forEach(function (conn) {
                                        log("danilo-req deleteCall:del conn.sip " + String(conn.sip));
                                        log("danilo-req deleteCall:del obj.src " + String(obj.src));
                                        conn.send(JSON.stringify({ api: "user", mt: "CallDisconnected", num:call.num, src: sip }));

                                    });
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message::sendCallEvents=true");
                                        if (queues.some(function (v) { return v.Fila === sip })) {
                                            var msg = { User: "", Grupo: sip, Callinnumber: call.num, Status: "del" };
                                        } else {
                                            var msg = { User: sip, Grupo: "", Callinnumber: call.num, Status: "del" };
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
                                    call.state = obj.state;
                                    call.call_ended = timeNow;
                                    insertTblCalls(call);
                                    //Atualiza status Botões Tela NovaAlert All
                                    connectionsUser.forEach(function (conn) {
                                        log("danilo-req deleteCall:del conn.sip " + String(conn.sip));
                                        log("danilo-req deleteCall:del obj.src " + String(obj.src));
                                        conn.send(JSON.stringify({ api: "user", mt: "CallDisconnected", num: call.num, src: sip }));

                                    });
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message::sendCallEvents=true");
                                        if (queues.some(function (v) { return v.Fila === sip })) {
                                            var msg = { User: "", Grupo: sip, Callinnumber: call.num, Status: "del" };
                                        } else {
                                            var msg = { User: sip, Grupo: "", Callinnumber: call.num, Status: "del" };
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
                                    call.state = obj.state;
                                    call.call_ended = timeNow;
                                    insertTblCalls(call);
                                    //Atualiza status Botões Tela NovaAlert All
                                    connectionsUser.forEach(function (conn) {
                                        //var ws = conn.ws;
                                        log("danilo-req deleteCall:del conn.sip " + String(conn.sip));
                                        log("danilo-req deleteCall:del obj.src " + String(obj.src));
                                        conn.send(JSON.stringify({ api: "user", mt: "CallDisconnected", num: call.num, src: sip }));

                                    });
                                    if (sendCallEvents) {
                                        log("danilo-req : RCC message::sendCallEvents=true");
                                        if (queues.some(function (v) { return v.Fila === sip })) {
                                            var msg = { User: "", Grupo: sip, Callinnumber: call.num, Status: "del" };
                                        } else {
                                            var msg = { User: sip, Grupo: "", Callinnumber: call.num, Status: "del" };
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
        }
    });
    conn.onclose(function () {
        log("RCC: disconnected");
        RCC.splice(RCC.indexOf(conn), 1);
    });
});

//ok
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
            // remove callid from the array for calls for this connection
            calls.splice(calls.indexOf(obj.call), 1);

            //Remove
            //log("PBXSignal: connections result " + JSON.stringify(connections));
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

            RCC.forEach(function (rcc) {
                if (rcc.pbx == pbx) {
                    var user = rcc[sip];
                    log("PbxSignal: calling RCC API to End user Monitor " + String(sip) + " on PBX " + pbx);
                    var msg = { api: "RCC", mt: "UserEnd", user: user, src: sip + "," + obj.src };
                    conn.send(JSON.stringify(msg));
                }
            })
            connectionsUser.forEach(function (c) {
                c.send(JSON.stringify({ api: "user", mt: "UserDisconnected", src: sip }));

            })
            //Intert into DB the event
            log("PbxSignal= user " + sip + " logout");
            var today = getDateNow();
            var msg = { sip: sip, name: name, date: today, status: "Logout", group: "PBX" }
            log("PbxSignal= will insert it on DB : " + JSON.stringify(msg));
            insertTblAvailability(msg);
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


//Funções Internas
//ok
function callNovaAlert(alert, sip) {
    log("callNovaAlert::");
    var msg = { Username: "webuser", Password: "Wecom12#", AlarmNr: alert, LocationType: "GEO=47.565055,8.912027", Location: "Wecom", LocationDescription: "Wecom POA", Originator: String(sip), AlarmPinCode: "1234", Alarmtext: "Alarm from Myapps!" };
    httpClient(urlalert, msg);
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

function findBySip(sip) {
    return function (value) {
        if (value.columns.h323 == sip) {
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
            //USER PARAMETER PRESENT
            if (obj.Location) {
                try {
                    location = obj.Location;
                    log("SPLIT8:");
                    var myArray = location.split(":");
                    log("SPLIT9:");
                    var location = myArray[1].split(",");
                    var x = location[0];
                    var y = location[1];
                    log("danilo-req alarmReceived:User " + String(obj.User));
                    connectionsUser.forEach(function (conn) {
                        //var ws = conn.ws;
                        log("danilo-req alarmReceived:Location conn.sip " + String(conn.sip));
                        log("danilo-req alarmReceived:Location obj.User " + String(obj.User));
                        if (String(conn.sip) == String(obj.User)) {
                            //Intert into DB the event
                            log("danilo req: insert into DB = user " + obj.User);
                            var today = getDateNow();
                            var msg = { sip: obj.User, name: "alarm", date: today, status: "inc", details: "ID:" + obj.AlarmID + " " + obj.Location }
                            log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                            insertTblActivities(msg);
                            //Send notifications
                            conn.send(JSON.stringify({ api: "user", mt: "PopupRequest", name: "Alarme " + String(obj.AlarmID), alarm: "https://www.google.com/maps/embed/v1/place?key=" + google_api_key + "&q=" + x + "," + y + "&zoom=15" }));
                            //conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: obj.AlarmID }));
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
                    log("danilo-req alarmReceived:Location1 User " + String(obj.User));
                    connectionsUser.forEach(function (conn) {
                        log("danilo-req alarmReceived:Location1 conn.sip " + String(conn.sip));
                        log("danilo-req alarmReceived:Location1 obj.User " + String(obj.User));
                        if (String(conn.sip) == String(obj.User)) {
                            //Intert into DB the event
                            log("danilo req: insert into DB = user " + obj.User);
                            var today = getDateNow();
                            var msg = { sip: obj.User, name: "alarm", date: today, status: "inc", details: "ID:" + obj.AlarmID + " " + obj.Location1 }
                            log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                            insertTblActivities(msg);
                            //Send notifications
                            conn.send(JSON.stringify({ api: "user", mt: "PopupRequest", name: "Alarme " + String(obj.AlarmID), alarm: "https://www.google.com/maps/embed/v1/place?key=" + google_api_key + "&q=" + x + "," + y + "&zoom=15" }));
                            //conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: obj.AlarmID }));
                        }
                    });
                } catch (e) {
                    log("danilo-req alarmReceived: Paramter Location1 not present");
                }

            }
            connectionsUser.forEach(function (conn) {
                //Intert into DB the event
                log("danilo req: insert into DB = user " + conn.sip);
                var today = getDateNow();
                var msg = { sip: conn.sip, name: "alarm", date: today, status: "inc", details: "ID:" + obj.AlarmID }
                log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                insertTblActivities(msg);
                //Send notifications
                log("danilo-req alarmReceived:conn.sip " + String(conn.sip));
                log("danilo-req alarmReceived:obj.User " + String(obj.User));
                if (String(conn.sip) == String(obj.User)) {
                    conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: obj.AlarmID }));
                    //update badge Icon
                    updateTableBadgeCount(obj.User, "IncrementCount");
                }
            });
            //VERIFY IF ACTION EXISTS FOR THIS ALARM ID FOR THIS USER
            try {
                //Get Actions from DB
                Database.exec("SELECT * FROM list_alarm_actions")
                    .oncomplete(function (data) {
                        log("result=" + JSON.stringify(data, null, 4));
                        var str = "";
                        str = JSON.stringify(data);
                        actions = JSON.parse(String(str));
                        log("danilo-req alarmReceived:actions " + actions);
                        if (actions != null) {
                            log("danilo-req alarmReceived:actions diferent of null " + actions);
                            actions.forEach(function (ac) {
                                log("danilo-req alarmReceived:ac " + JSON.stringify(ac));
                                if (ac.action_user == obj.User) {
                                    log("danilo-req alarmReceived:actions action_user " + ac.action_user + " == obj.User " + obj.User);
                                    if (ac.action_alarm_code == obj.AlarmID) {
                                        log("danilo-req alarmReceived:actions action_alarm_code " + ac.action_alarm_code + " == obj.AlarmID " + obj.AlarmID);

                                        switch (ac.action_type) {
                                            case "video":
                                                connectionsUser.forEach(function (conn) {
                                                    //var ws = conn.ws;
                                                    log("danilo-req alarmReceived:video conn.sip " + String(conn.sip));
                                                    log("danilo-req alarmReceived:video obj.User " + String(obj.User));
                                                    if (String(conn.sip) == String(obj.User)) {
                                                        conn.send(JSON.stringify({ api: "user", mt: "VideoRequest", name: ac.action_name, alarm: ac.action_prt }));
                                                    }
                                                });
                                                break;
                                            case "alarm":
                                                connectionsUser.forEach(function (conn) {
                                                    //var ws = conn.ws;
                                                    log("danilo-req alarmReceived:alarm conn.sip " + String(conn.sip));
                                                    log("danilo-req alarmReceived:alarm obj.User " + String(obj.User));
                                                    if (String(conn.sip) == String(obj.User)) {
                                                        conn.send(JSON.stringify({ api: "user", mt: "AlarmRequested", alarm: obj.AlarmID }));
                                                    }
                                                });
                                                break;
                                            case "number":
                                                var foundConnectionUser = connectionsUser.filter(function (conn) { return conn.sip === obj.User });
                                                RCC.forEach(function (rcc) {
                                                    var temp = rcc[String(foundConnectionUser.sip)];
                                                    if (temp != null) {
                                                        user = temp;
                                                        log("danilo-req alarmReceived:will call callRCC for user " + user + " Nome " + foundConnectionUser.dn);
                                                        callRCC(rcc, user, "UserCall", ac.action_prt, foundConnectionUser.sip + "," + rcc.pbx);
                                                    }
                                                })
                                                //var foundCall = calls.filter(function (call) { return call.num === ac.action_prt });
                                                //if (!foundCall) {

                                                //}

                                                //connectionsUser.forEach(function (conn) {
                                                //    //var ws = conn.ws;
                                                //    log("danilo-req alarmReceived:number conn.sip " + String(conn.sip));
                                                //    log("danilo-req alarmReceived:number obj.User " + String(obj.User));
                                                //    if (String(conn.sip) == String(obj.User)) {
                                                //        callRCC(connectionsRCC[0].ws, conn.cn, "UserCall", ac.action_prt, conn.sip);
                                                //    }
                                                //});
                                                break;
                                            case "page":
                                                connectionsUser.forEach(function (conn) {
                                                    //var ws = conn.ws;
                                                    log("danilo-req alarmReceived:page conn.sip " + String(conn.sip));
                                                    log("danilo-req alarmReceived:page obj.User " + String(obj.User));
                                                    if (String(conn.sip) == String(obj.User)) {
                                                        conn.send(JSON.stringify({ api: "user", mt: "PageRequest", name: ac.action_name, alarm: ac.action_prt }));
                                                    }
                                                });
                                                break;
                                            case "popup":
                                                connectionsUser.forEach(function (conn) {
                                                    //var ws = conn.ws;
                                                    log("danilo-req alarmReceived:page conn.sip " + String(conn.sip));
                                                    log("danilo-req alarmReceived:page obj.User " + String(obj.User));
                                                    if (String(conn.sip) == String(obj.User)) {
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
                        conn.send(JSON.stringify({ api: "user", mt: "MessageError", result: String(errorText) }));
                    });
            } catch (e) {
                log("danilo-req alarmReceived: Paramter Location not present Erro " + e);
            }
        }
        else {
            //SEM USUÁRIO DEFINIDO
            if (obj.Location) {
                try {
                    var location = obj.Location;
                    log("SPLIT13:");
                    var myArray = location.split(":");
                    log("SPLIT14:");
                    var location = myArray[1].split(",");
                    var x = location[0];
                    var y = location[1];
                    //log("danilo-req alarmReceived:Location User " + String(obj.User));
                    connectionsUser.forEach(function (conn) {
                        //Intert into DB the event
                        log("danilo req: insert into DB = user " + conn.sip);
                        var today = getDateNow();
                        var msg = { sip: conn.sip, name: "alarm", date: today, status: "inc", details: "ID:" + obj.AlarmID + " " + obj.Location }
                        log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                        insertTblActivities(msg);
                        //Send notifications
                        //updateTableBadgeCount(conn.sip, "IncrementCount");
                        log("danilo-req alarmReceived:Location conn.sip " + String(conn.sip));
                        //log("danilo-req alarmReceived:Location obj.User " + String(obj.User));
                        conn.send(JSON.stringify({ api: "user", mt: "PopupRequest", name: "Alarme " + String(obj.AlarmID), alarm: "https://www.google.com/maps/embed/v1/place?key=" + google_api_key + "&q=" + x + "," + y + "&zoom=15" }));
                        //conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: obj.AlarmID }));

                    });
                } catch (e) {
                    log("danilo-req alarmReceived: Paramter Location not present");
                }

            }
            if (obj.Location1) {
                try {
                    var location = obj.Location;
                    log("SPLIT15:");
                    var myArray = location.split(":");
                    log("SPLIT16:");
                    var location = myArray[1].split(",");
                    var x = location[0];
                    var y = location[1];
                    //log("danilo-req alarmReceived:Location1 User " + String(obj.User));
                    connectionsUser.forEach(function (conn) {
                        //Intert into DB the event
                        log("danilo req: insert into DB = user " + conn.sip);
                        var today = getDateNow();
                        var msg = { sip: conn.sip, name: "alarm", date: today, status: "inc", details: "ID:" + obj.AlarmID + " " + obj.Location1 }
                        log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                        insertTblActivities(msg);
                        //Send notifications
                        //updateTableBadgeCount(conn.sip, "IncrementCount");
                        log("danilo-req alarmReceived:Location1 notifing user conn.sip " + String(conn.sip));
                        //log("danilo-req alarmReceived:Location1 obj.User " + String(obj.User));
                        conn.send(JSON.stringify({ api: "user", mt: "PopupRequest", name: "Alarme " + String(obj.AlarmID), alarm: "https://www.google.com/maps/embed/v1/place?key=" + google_api_key + "&q=" + x + "," + y + "&zoom=15" }));
                        //conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: obj.AlarmID }));

                    });
                } catch (e) {
                    log("danilo-req alarmReceived: Paramter Location1 not present");
                }

            }
            connectionsUser.forEach(function (conn) {
                //Intert into DB the event
                log("danilo req: insert into DB = user " + conn.sip);
                var today = getDateNow();
                var msg = { sip: conn.sip, name: "alarm", date: today, status: "inc", details: obj.AlarmID }
                log("danilo req: will insert it on DB : " + JSON.stringify(msg));
                insertTblActivities(msg);
                //Send notifications
                log("danilo-req alarmReceived:without User Paramter, notifing all users logged in now " + String(conn.sip));
                updateTableBadgeCount(conn.sip, "IncrementCount");
                conn.send(JSON.stringify({ api: "user", mt: "AlarmReceived", alarm: obj.AlarmID }));
            });
        }  
    } catch (e) {
        log("danilo-req alarmReceived: Body not present! Erro " + e);
    }
}

function initializeButtons() {
    Database.exec("SELECT * FROM list_buttons")
        .oncomplete(function (data) {
            log("result=" + JSON.stringify(data, null, 4));
            buttons = data;

            buttons.forEach(function (b) {
                if (b.button_type == "queue") {
                    //Adiciona
                    var pbx = true;
                    log("danilo-req : initializeButtons:: button: " + b.button_name);
                    RCC.forEach(function (rcc) {
                        if (pbx) {
                            log("initializeButtons: calling RCC API for new queue button " + String(b.button_prt_user) + " on PBX " + rcc.pbx);
                            var msg = { api: "RCC", mt: "UserInitialize", cn: b.button_prt_user, src: b.button_prt + "," + rcc.pbx };
                            rcc.send(JSON.stringify(msg));
                            pbx = false;
                        }
                    })
                    //updateConnections(b.button_prt, b.button_type, b.button_prt_user)
                    //connections.push({ sip: b.button_prt, call: "", name: b.button_prt_user, user: "", url: "" });
                    //log("initializeButtons: connections after add queue button " + JSON.stringify(connections));
                    
                }
                //if (b.button_type == "number") {
                //    //Adiciona
                //    var name = "";
                //    try {
                //        var name = pbxTableUsers.filter(findConnectionsBySip(b.button_prt))[0].cn;
                //    } finally {
                //        var name = b.button_name;
                //        log("initializeButtons: connections before add number button " + JSON.stringify(connections));
                //        updateConnections(b.button_prt, b.button_type, name)
                //        //connections.push({ sip: b.button_prt, call: "", name: b.button_prt_user, user: "", url: "" });
                //        log("initializeButtons: connections after add number button " + JSON.stringify(connections));
                //    }
                //}

            })

        })
        .onerror(function (error, errorText, dbErrorCode) {
            log("danilo req:initializeButtons MessageError =" + String(errorText));
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

    ws.send(JSON.stringify(msg));
    return;
}

function callRCC(ws, user, mode, num, sip) {
    log("danilo-req callRCC:mode " + String(mode));
    if (String(mode) == "UserInitialize") {
        var msg = { api: "RCC", mt: "UserInitialize", cn: user, src: sip };
        ws.send(JSON.stringify(msg));
    }
    //else if (String(mode) == "UserEnd") {
    //    log("danilo-req UserEnd:sip " + sip);
    //    connections.forEach(function (conn) {
    //        if (conn.sip == sip) {
    //            var msg = { api: "RCC", mt: "UserEnd", user: conn.user, src: sip };
    //            ws.send(JSON.stringify(msg));
    //        } else {
    //            log("danilo req : UserEnd rcc NOT found");
    //        }
    //    })
    //}
    else if (String(mode) == "Device") {
        var msg = { api: "RCC", mt: "Devices", cn: user, src: sip };
        ws.send(JSON.stringify(msg));
    }
    else if (String(mode) == "UserCall") {
        log("danilo-req UserCall:sip " + sip);
        var msg = { api: "RCC", mt: "UserCall", user: user, e164: num, src: sip };
        log("danilo req callRCC: UserCall sent rcc msg " + JSON.stringify(msg));
        ws.send(JSON.stringify(msg));

        //log("danilo-req UserCall:sip " + sip);
        //connections.forEach(function (conn) {
        //    if (conn.sip == sip) {
        //        var msg = { api: "RCC", mt: "UserCall", user: conn.user, e164: num, src: sip };
        //        log("danilo-req UserCall:rcc msg " + JSON.stringify(msg));
        //        ws.send(JSON.stringify(msg));
        //    } else {
        //        log("danilo req : UserCall rcc NOT found");
        //    }
        //})
    }
    else if (String(mode) == "UserClear") {
        log("SPLIT17:");
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

        //calls.forEach(function (call) {
        //    if (call.sip == sip) {
        //        var msg = { api: "RCC", mt: "UserClear", call: call.callid, src: call.sip };
        //        ws.send(JSON.stringify(msg));
        //    }

        //})
    }
    else if (mode == "UserHold") {
        log("SPLIT18:");
        var myArray = sip.split(",");
        var sip = myArray[0];
        var pbx = myArray[1];
        calls.forEach(function (call) {
            if (call.sip == sip) {
                var msg = { api: "RCC", mt: "UserHold", call: call.callid, remote: true, src: call.sip };
                ws.send(JSON.stringify(msg));
            }

        })

        //calls.forEach(function (call) {
        //    if (call.sip == sip) {
        //        var msg = { api: "RCC", mt: "UserHold", call: call.callid, remote: true, src: call.sip };
        //        ws.send(JSON.stringify(msg));
        //    }

        //})
    }
    else if (mode == "UserRetrieve") {
        log("SPLIT19:");
        var myArray = sip.split(",");
        var sip = myArray[0];
        var pbx = myArray[1];
        calls.forEach(function (call) {
            if (call.sip == sip) {
                var msg = { api: "RCC", mt: "UserRetrieve", call: call.callid, src: call.sip };
                ws.send(JSON.stringify(msg));
            }

        })

        //calls.forEach(function (call) {
        //    if (call.sip == sip) {
        //        var msg = { api: "RCC", mt: "UserRetrieve", call: call.callid, src: call.sip };
        //        ws.send(JSON.stringify(msg));
        //    }

        //})
    }
    else if (mode == "UserRedirect") {
        log("SPLIT20:");
        var myArray = sip.split(",");
        var sip = myArray[0];
        var pbx = myArray[1];
        calls.forEach(function (call) {
            if (call.sip == sip) {
                var msg = { api: "RCC", mt: "UserRedirect", call: call.callid, e164: num, src: call.sip };
                ws.send(JSON.stringify(msg));
            }

        })

        //calls.forEach(function (call) {
        //    if (call.sip == sip) {
        //        var msg = { api: "RCC", mt: "UserRedirect", call: call.callid, e164: num, src: call.sip };
        //        ws.send(JSON.stringify(msg));
        //    }

        //})
    }
    else if (mode == "UserConnect") {
        log("SPLIT21:");
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

        //calls.forEach(function (call) {
        //    if (call.sip == sip) {
        //        var msg = { api: "RCC", mt: "UserConnect", call: call.callid, src: call.sip };
        //        ws.send(JSON.stringify(msg));
        //    }

        //})
    }
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
            //conn.send(JSON.stringify({ api: "user", mt: "SelectMessageSuccess", result: JSON.stringify(data, null, 4) }));

        })
        .onerror(function (error, errorText, dbErrorCode) {
            //conn.send(JSON.stringify({ api: "user", mt: "MessageError", result: String(errorText) }));
        });
    
    

}

function comboDispatcher(button, sip, mt) {
    log("danilo-req comboDispatcher:button " + JSON.stringify(button));
    switch (button.button_type) {
        case "video":
            connectionsUser.forEach(function (conn) {
                log("danilo-req comboDispatcher:video conn.sip " + String(conn.sip));
                log("danilo-req comboDispatcher:video sip " + String(sip));
                if (String(conn.sip) == String(sip)) {
                    conn.send(JSON.stringify({ api: "user", mt: "VideoRequest", name: button.button_name, alarm: button.button_prt }));
                }
            });
            break;
        case "alarm":
            connectionsUser.forEach(function (conn) {
                log("danilo-req comboDispatcher:alarm conn.sip " + String(conn.sip));
                log("danilo-req comboDispatcher:alarm sip " + String(sip));
                if (String(conn.sip) == String(sip)) {
                    callNovaAlert(parseInt(button.button_prt), conn.sip);
                    conn.send(JSON.stringify({ api: "user", mt: "AlarmSuccessTrigged", alarm: button.button_prt }));
                }
            });
            break;
        case "externalnumber":
            var foundConnectionUser = connectionsUser.filter(function (conn) { return conn.sip === sip });
            log("danilo-req:comboDispatcher:found ConnectionUser for user Name " + foundConnectionUser[0].dn);
            var foundCall = calls.filter(function (call) { return call.sip === sip });
            log("danilo-req:comboDispatcher:found call " + JSON.stringify(foundCall));
            if (foundCall.length == 0) {
                //log("danilo-req:comboDispatcher:found call for user " + foundCall[0].sip);
                RCC.forEach(function (rcc) {
                    var temp = rcc[String(foundConnectionUser[0].sip)];
                    if (temp != null) {
                        user = temp;
                        log("danilo-req:comboDispatcher:will call callRCC for user " + user + " Nome " + foundConnectionUser[0].dn);
                        callRCC(rcc, user, "UserCall", button.button_prt, foundConnectionUser[0].sip + "," + rcc.pbx);
                    }
                })
                connectionsUser.forEach(function (conn) {
                    log("danilo-req comboDispatcher:ComboCallStart conn.sip " + String(conn.sip));
                    log("danilo-req comboDispatcher:ComboCallStart sip " + String(sip));
                    if (String(conn.sip) == String(sip)) {
                        conn.send(JSON.stringify({ api: "user", mt: "ComboCallStart", src: conn.sip, num: button.button_prt }));
                    }
                });
            } else {
                RCC.forEach(function (rcc) {
                    var temp = rcc[String(foundConnectionUser[0].sip)];
                    log("danilo req:comboDispatcher:number call.sip == conn.sip:temp " + temp);
                    if (temp != null) {
                        user = temp;
                        log("danilo-req:comboDispatcher:will call callRCC for user " + user + " Nome " + foundConnectionUser[0].dn);
                        callRCC(rcc, user, "UserClear", button.button_prt_user, foundConnectionUser[0].sip + "," + rcc.pbx);
                    }
                })
            }
            break;
        case "number":
            var foundConnectionUser = connectionsUser.filter(function (conn) { return conn.sip === button.button_user });
            log("danilo-req:comboDispatcher:found ConnectionUser for user Name " + foundConnectionUser[0].dn);
            var foundCall = calls.filter(function (call) { return call.sip === button.button_user });
            log("danilo-req:comboDispatcher:found call " + JSON.stringify(foundCall));
            if (foundCall.length == 0) {
                //log("danilo-req:comboDispatcher:found call for user " + foundCall[0].sip);
                RCC.forEach(function (rcc) {
                    var temp = rcc[String(foundConnectionUser[0].sip)];
                    if (temp != null) {
                        user = temp;
                        log("danilo-req:comboDispatcher:will call callRCC for user " + user + " Nome " + foundConnectionUser[0].dn);
                        callRCC(rcc, user, "UserCall", button.button_prt_user, foundConnectionUser[0].sip + "," + rcc.pbx);
                    }
                })
                connectionsUser.forEach(function (conn) {
                    log("danilo-req comboDispatcher:ComboCallStart conn.sip " + String(conn.sip));
                    log("danilo-req comboDispatcher:ComboCallStart button.button_user " + String(button.button_user));
                    if (String(conn.sip) == String(button.button_user)) {
                        conn.send(JSON.stringify({ api: "user", mt: "ComboCallStart", src: conn.sip, num: button.button_prt }));
                    }
                });
            } else {
                RCC.forEach(function (rcc) {
                    var temp = rcc[String(foundConnectionUser[0].sip)];
                    log("danilo req:comboDispatcher:number call.sip == conn.sip:temp " + temp);
                    if (temp != null) {
                        user = temp;
                        log("danilo-req:comboDispatcher:will call callRCC for user " + user + " Nome " + foundConnectionUser[0].dn);
                        callRCC(rcc, user, "UserClear", button.button_prt_user, foundConnectionUser[0].sip + "," + rcc.pbx);
                    }
                })
            }
            break;
        case "user":
            var foundConnectionUser = connectionsUser.filter(function (conn) { return conn.sip === sip });
            log("danilo-req:comboDispatcher:found ConnectionUser for user Name " + foundConnectionUser[0].dn);
            var foundCall = calls.filter(function (call) { return call.sip === sip });
            log("danilo-req:comboDispatcher:found call " + JSON.stringify(foundCall));
            if (foundCall.length == 0) {
                //log("danilo-req:comboDispatcher:found call for user " + foundCall[0].sip);
                RCC.forEach(function (rcc) {
                    var temp = rcc[String(foundConnectionUser[0].sip)];
                    if (temp != null) {
                        user = temp;
                        log("danilo-req:comboDispatcher:will call callRCC for user " + user + " Nome " + foundConnectionUser[0].dn);
                        callRCC(rcc, user, "UserCall", button.button_prt, foundConnectionUser[0].sip + "," + rcc.pbx);
                    }
                })
                connectionsUser.forEach(function (conn) {
                    log("danilo-req comboDispatcher:ComboCallStart conn.sip " + String(conn.sip));
                    log("danilo-req comboDispatcher:ComboCallStart sip " + String(sip));
                    if (String(conn.sip) == String(sip)) {
                        conn.send(JSON.stringify({ api: "user", mt: "ComboCallStart", src: conn.sip, num: button.button_prt }));
                    }
                });
            } else {
                RCC.forEach(function (rcc) {
                    var temp = rcc[String(foundConnectionUser[0].sip)];
                    log("danilo req:comboDispatcher:number call.sip == conn.sip:temp " + temp);
                    if (temp != null) {
                        user = temp;
                        log("danilo-req:comboDispatcher:will call callRCC for user " + user + " Nome " + foundConnectionUser[0].dn);
                        callRCC(rcc, user, "UserClear", button.button_prt, foundConnectionUser[0].sip + "," + rcc.pbx);
                    }
                })
            }
            break;
        case "queue":
            var foundConnectionUser = connectionsUser.filter(function (conn) { return conn.sip === button.button_user });
            log("danilo-req:comboDispatcher:found ConnectionUser for user Name " + foundConnectionUser[0].dn);
            var foundCall = calls.filter(function (call) { return call.sip === button.button_user });
            log("danilo-req:comboDispatcher:found call " + JSON.stringify(foundCall));
            if (foundCall.length == 0) {
                //log("danilo-req:comboDispatcher:found call for user " + foundCall.sip);
                RCC.forEach(function (rcc) {
                    var temp = rcc[String(foundConnectionUser[0].sip)];
                    if (temp != null) {
                        user = temp;
                        log("danilo-req:comboDispatcher:will call callRCC for user " + user + " Nome " + foundConnectionUser[0].dn);
                        callRCC(rcc, user, "UserCall", button.button_prt_user, foundConnectionUser[0].sip + "," + rcc.pbx);
                    }
                })
                connectionsUser.forEach(function (conn) {
                    log("danilo-req comboDispatcher:ComboCallStart conn.sip " + String(conn.sip));
                    log("danilo-req comboDispatcher:ComboCallStart button.button_user " + String(button.button_user));
                    if (String(conn.sip) == String(button.button_user)) {
                        conn.send(JSON.stringify({ api: "user", mt: "ComboCallStart", src: conn.sip, num: button.button_prt }));
                    }
                });
            } else {
                RCC.forEach(function (rcc) {
                    var temp = rcc[String(foundConnectionUser[0].sip)];
                    log("danilo req:comboDispatcher:number call.sip == conn.sip:temp " + temp);
                    if (temp != null) {
                        user = temp;
                        log("danilo-req:comboDispatcher:will call callRCC for user " + user + " Nome " + foundConnectionUser[0].dn);
                        callRCC(rcc, user, "UserClear", button.button_prt_user, foundConnectionUser[0].sip + "," + rcc.pbx);
                    }
                })
            }
            break;
        case "page":
            connectionsUser.forEach(function (conn) {
                log("danilo-req comboDispatcher:page conn.sip " + String(conn.sip));
                log("danilo-req comboDispatcher:page sip " + String(sip));
                if (String(conn.sip) == String(sip)) {
                    conn.send(JSON.stringify({ api: "user", mt: "PageRequest", name: button.button_name, alarm: button.button_prt }));
                }
            });
            break;
    }
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


