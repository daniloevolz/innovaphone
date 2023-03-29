var PbxSignal = [];
var pbxTableUsers = [];
var pbxTable = [];
var connectionsUser = [];


WebServer.onrequest("value", function (req) {
    if (req.method == "GET") {
        var filePath = "Calendario.htm"; // Caminho para o arquivo HTML

        var fileContents = new TextEncoder("utf-8").encode(fs.readFileSync(filePath)); // Le o conteudo do arquivo

        if (fileContents) {
            // Se o arquivo foi encontrado, envie-o como resposta com o tipo MIME apropriado
            req.responseContentType("text/html")
                .sendResponse()
                .onsend(function (req) {
                    req.send(fileContents, true);
                });
        }
        else {
            // value does not exist, send 404 Not Found
            req.cancel();
        }
    }
});
WebServer.onrequest("salvar-evento", function (req) {
    if (req.method == "POST") {
        var newValue = "";
        var value = "";
        var msg;
        req.onrecv(function (req, data) {
            //var obj = JSON.parse((new TextDecoder("utf-8").decode(data)));
            if (data) {
                newValue += (new TextDecoder("utf-8").decode(data));
                req.recv();
            }
            else {
                value = newValue;
                log("danilo req : received POST data " + value);
                try {
                    var obj = JSON.parse(String(value));
                    var schedule_valid = false;
                    Database.exec("SELECT * FROM tbl_availability WHERE sip ='" + obj.sip + "';")
                        .oncomplete(function (dataAvail) {
                            log("SelectAvailabilityMessage:result=" + JSON.stringify(dataAvail, null, 4));
                            var objAvail = dataAvail;
                            objAvail.forEach(function (a) {
                                if (obj.start >= a.time_start && obj.end <= a.time_end) {
                                    schedule_valid = true;
                                    Database.insert("INSERT INTO tbl_schedules (sip, name, email, time_start, time_end) VALUES ('" + obj.sip + "','" + obj.title + "','" + obj.email + "','" + obj.start + "','" + obj.end + "')")
                                        .oncomplete(function () {
                                            Database.exec("SELECT * FROM tbl_user_configs WHERE sip ='" + obj.sip + "';")
                                                .oncomplete(function (data) {
                                                    msg = { status: 200, msg: "Evento agendado, Acesse seu e-mail e encontre o convite!" };
                                                    req.responseContentType("application/json")
                                                        .sendResponse()
                                                        .onsend(function (req) {
                                                            req.send(new TextEncoder("utf-8").encode(JSON.stringify(msg)), true);
                                                        });
                                                    var cfg = JSON.parse(JSON.stringify(data));
                                                    try {
                                                        connectionsUser.forEach(function (conn) {
                                                            if (conn.sip == obj.sip) {
                                                                conn.send(JSON.stringify({ api: "user", mt: "UserEventMessage",name: obj.title, email: obj.email, time_start: obj.start }));
                                                            }
                                                        })

                                                    } catch (e) {
                                                        log("danilo req: erro send UserEventMessage: " + e);
                                                    }
                                                    try {
                                                        var count = 1;
                                                        PbxSignal.forEach(function (signal) {
                                                            log("danilo-req salvar-evento: signal" + JSON.stringify(signal));
                                                            var call = signal[obj.sip];
                                                            if (call != null) {
                                                                log("danilo-req salvar-evento call " + String(call) + ", will call updateBadge");
                                                                try {
                                                                    pbxTableUsers.forEach(function (user) {

                                                                        if (user.columns.h323 == obj.sip) {
                                                                            log("danilo-req salvar-evento: Updating the object for user " + user.columns.h323)
                                                                            user.badge += 1;
                                                                            count = user.badge;
                                                                        }
                                                                    })
                                                                    updateBadge(signal, call, count);
                                                                } catch (e) {
                                                                    log("danilo-req salvar-evento: User " + obj.columns.h323 + " Erro " + e)
                                                                }
                                                            }

                                                        })

                                                    }
                                                    catch (e) {
                                                        log("danilo req: erro send badge: " + e);
                                                    }
                                                    try {
                                                        var today = getDateNow();
                                                        var name = pbxTableUsers.filter(findBySip(obj.sip))[0].columns.cn;
                                                        //Email Cliente
                                                        var dataClient = "<!DOCTYPE html>"
                                                            + "<html>"
                                                            + "<head></head>"
                                                            + "<body>"
                                                            + "<b>" + cfg[0].text_invite + "</b><br/>"
                                                            + "<a>URL do Evento: " + cfg[0].url_conference + "</a><br/>"
                                                            + "<b>Quando: " + obj.start + "</b><br/><br/>"
                                                            + "Best regards<br/>"
                                                            + "<i>DWC Wecom</i>"
                                                            + "</body>"
                                                            + "</html>";

                                                        //Email Usuario
                                                        var dataUser = "<!DOCTYPE html>"
                                                            + "<html>"
                                                            + "<head></head>"
                                                            + "<body>"
                                                            + "<b>Olá "+ name +", um novo agendamento foi realizado para o seu usuários via DWC, seguem informações de contato do solicitante.</b><br/><br/>"
                                                            + "<b>Nome: " + obj.title + "</b><br/>"
                                                            + "<b>E-mail: " + obj.email + "</b><br/>"
                                                            + "<b>Quando: " + obj.start + "</b><br/>"
                                                            + "<a>URL Conferência: " + cfg[0].url_conference + "</a><br/><br/>"
                                                            + "Best regards<br/>"
                                                            + "<i>DWC Wecom</i>"
                                                            + "</body>"
                                                            + "</html>";


                                                        //Anexo
                                                        var attachment = "BEGIN: VCALENDAR"
                                                            +"METHOD: REQUEST"
                                                            + "PRODID: DWC Wecom"
                                                            + "VERSION: 2.0"
                                                            + "BEGIN: VTIMEZONE"
                                                            + "TZID: E.South America Standard Time"
                                                            + "BEGIN: STANDARD"
                                                            + "DTSTART: 16010101T000000"
                                                            + "TZOFFSETFROM: -0300"
                                                            + "TZOFFSETTO: -0300"
                                                            + "END: STANDARD"
                                                            + "BEGIN: DAYLIGHT"
                                                            + "DTSTART: 16010101T000000"
                                                            + "TZOFFSETFROM: -0300"
                                                            + "TZOFFSETTO: -0300"
                                                            + "END: DAYLIGHT"
                                                            + "END: VTIMEZONE"
                                                            + "BEGIN: VEVENT"
                                                            + "ORGANIZER; CN = " + name +": mailto: "+cfg[0].email_contato+""
                                                            + "ATTENDEE; ROLE = REQ - PARTICIPANT; PARTSTAT = NEEDS - ACTION; RSVP = TRUE; CN = " + obj.title + ": mailto: " + obj.email + ""

                                                            + "DESCRIPTION; LANGUAGE = pt - BR: \n______________________________________________"
                                                            + "__________________________________\nReunião do DWC Wecom\nClique para"
                                                            + "ingressar na reunião <" + cfg[0].url_conference + ">\n____________________________"
                                                            + "____________________________________________________\nAviso Legal.Esta me"
                                                            + "nsagem pode conter informações confidenciais e / ou privilegiadas.Se voc"
                                                            + "ê não for o destinatário ou a pessoa autorizada a receber esta mensagem"
                                                            + "não deve usar\, copiar ou divulgar as informações nela contidas ou tom"
                                                            + "ar qualquer ação baseada nessas informações.Se você recebeu essa com"
                                                            + "unicação por engano\, por favor nos avise imediatamente\, respondendo à"
                                                            + "mensagem e excluindo - a do seu computador.\n"
                                                            + "SUMMARY; LANGUAGE = pt - BR: Reunião DWC Wecom"
                                                            + "DTSTART; TZID = E.South America Standard Time: " + obj.start + ""
                                                            + "DTEND; TZID = E.South America Standard Time: " + obj.end + ""
                                                            + "CLASS: PUBLIC"
                                                            + "PRIORITY: 5"
                                                            + "DTSTAMP: " + today + ""
                                                            + "TRANSP: OPAQUE"
                                                            + "STATUS: CONFIRMED"
                                                            + "SEQUENCE: 0"
                                                            + "LOCATION; LANGUAGE = pt - BR: "+ cfg[0].url_conference +""
                                                            + "BEGIN: VALARM"
                                                            + "DESCRIPTION: REMINDER"
                                                            + "TRIGGER; RELATED = START: -PT15M"
                                                            + "ACTION: DISPLAY"
                                                            + "END: VALARM"
                                                            + "END: VEVENT"
                                                            + "END: VCALENDAR";







                                                        sendEmail("Evento Agendado", obj.email, dataClient, attachment);
                                                        
                                                        sendEmail("Evento Agendado", cfg[0].email_contato, dataUser, attachment);
                                                    }
                                                    catch (e) {
                                                        log("danilo req: erro send email:" + e);
                                                        //msg = { status: 200, msg: "Evento agendado, Tivemos um problema ao enviar o email, no dia, utilize o link para ingresso: " + cfg[0].url_conference};
                                                    }
                                                    
                                                })
                                                .onerror(function (error, errorText, dbErrorCode) {
                                                    msg = { status: 400, msg: "ERRO: " + errorText };
                                                    req.responseContentType("application/json")
                                                    req.sendResponse()
                                                        .onsend(function (req) {
                                                            log("salvar-evento:result=402");
                                                            req.send(new TextEncoder("utf-8").encode(JSON.stringify(msg)), true);
                                                        });
                                                });

                                        })
                                        .onerror(function (error, errorText, dbErrorCode) {
                                            msg = { status: 400, msg: "ERRO: " + errorText };
                                            req.responseContentType("application/json")
                                            req.sendResponse()
                                                .onsend(function (req) {
                                                    log("salvar-evento:result=403");
                                                    req.send(new TextEncoder("utf-8").encode(JSON.stringify(msg)), true);
                                                });
                                        });

                                }
                            })
                            if (!schedule_valid) {
                                msg = { status: 400, msg: "Período inválido, tente outro dia e horário!" };
                                // value exists, send it back as text/plain
                                req.responseContentType("application/json")
                                    .sendResponse()
                                    .onsend(function (resp) {
                                        resp.send(new TextEncoder("utf-8").encode(JSON.stringify(msg)), true);
                                    });

                            }

                            
                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                        }); 

                } catch (e) {
                    msg = { status: 400, msg: e };
                    // value exists, send it back as text/plain
                    req.responseContentType("application/json")
                        .sendResponse()
                        .onsend(function (resp) {
                            resp.send(new TextEncoder("utf-8").encode(JSON.stringify(msg)), true);
                        });
                }
            }
        });
    }
    else {
        req.cancel();
    }
});

new JsonApi("user").onconnected(function(conn) {
    if (conn.app == "wecom-dwcscheduler") {
        connectionsUser.push(conn);
        

        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "UserMessage") {
                try {
                    var count = 0;
                    count = pbxTableUsers.filter(findBySip(conn.sip))[0].badge;
                    if (count > 0) {
                        conn.send(JSON.stringify({ api: "user", mt: "UserEventHistoryMessage", count: count }));
                    }
                } catch (e) {
                    log("danilo req: Erro ao enviar mensagem de histórico de agendamentos: " + e);
                }
                Database.exec("SELECT * FROM tbl_user_configs WHERE sip ='" + conn.sip + "';")
                    .oncomplete(function (data) {
                        log("UserMessage:result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", src: obj.src, result: JSON.stringify(data, null, 4) }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                    });
                
            }
            if (obj.mt == "UserAckEventMessage") {
                var count = 0;
                PbxSignal.forEach(function (signal) {
                    log("danilo-req badge2:UserAckEventMessage " + JSON.stringify(signal));
                    var call = signal[conn.sip];
                    if (call != null) {
                        log("danilo-req badge2:UserAckEventMessage call " + String(call) + ", will call updateBadge");
                        try {
                            pbxTableUsers.forEach(function (user) {
                                if (user.columns.h323 == conn.sip) {
                                    log("danilo-req badge2:UserAckEventMessage: Updating the object for user " + user.columns.h323)
                                    user.badge = count;
                                }
                            })
                        } finally {
                            updateBadge(signal, call, count);
                        }
                    }

                })
            }
            if (obj.mt == "UpdateConfigMessage") {
                try {
                    Database.exec("DELETE FROM tbl_user_configs WHERE sip='" + conn.sip + "';")
                        .oncomplete(function () {
                            conn.send(JSON.stringify({ api: "user", mt: "UpdateConfigMessageProccessing"}));
                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                        });
                } catch (e) {
                    conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(e) }));
                }
                
                try {
                    Database.exec("INSERT INTO tbl_user_configs (sip, text_invite, url_conference, email_contato) VALUES ('" + conn.sip + "','" + obj.text_invite + "','" + obj.url_conference + "','" + obj.email + "')")
                        .oncomplete(function () {
                            log("UpdateConfigMessage:result=");
                            conn.send(JSON.stringify({ api: "user", mt: "UpdateConfigMessageSuccess" }));
                            Database.exec("SELECT * FROM tbl_user_configs WHERE sip ='" + conn.sip + "';")
                                .oncomplete(function (data) {
                                    log("UserMessage:result=" + JSON.stringify(data, null, 4));
                                    conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", src: obj.src, result: JSON.stringify(data, null, 4) }));
                                })
                                .onerror(function (error, errorText, dbErrorCode) {
                                    conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                                });

                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                        });
                } catch (e) {
                    conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(e) }));
                }


            }
            if (obj.mt == "AddAvailabilityMessage") {
                Database.insert("INSERT INTO tbl_availability (sip, time_start, time_end) VALUES ('" + conn.sip + "','" + obj.time_start + "','" + obj.time_end + "')")
                    .oncomplete(function () {
                        Database.exec("SELECT * FROM tbl_availability WHERE sip ='"+ conn.sip+"';")
                            .oncomplete(function (data) {
                                log("AddAvailabilityMessage:result=" + JSON.stringify(data, null, 4));
                                conn.send(JSON.stringify({ api: "user", mt: "SelectAvailabilityMessageSuccess", result: JSON.stringify(data, null, 4) }));

                            })
                            .onerror(function (error, errorText, dbErrorCode) {
                                conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                            });
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                    });


            }
            if (obj.mt == "SelectAvailabilityMessage") {
                Database.exec("SELECT * FROM tbl_availability WHERE sip ='" + conn.sip + "';")
                    .oncomplete(function (data) {
                        log("SelectAvailabilityMessage:result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "user", mt: "SelectAvailabilityMessageSuccess", result: JSON.stringify(data, null, 4) }));

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                    });
            }
            if (obj.mt == "DelAvailabilityMessage") {
                Database.exec("DELETE FROM tbl_availability WHERE id=" + obj.id + ";")
                    .oncomplete(function () {
                        Database.exec("SELECT * FROM tbl_availability WHERE sip ='" + conn.sip + "';")
                            .oncomplete(function (data) {
                                log("AddAvailabilityMessage:result=" + JSON.stringify(data, null, 4));
                                conn.send(JSON.stringify({ api: "user", mt: "SelectAvailabilityMessageSuccess", result: JSON.stringify(data, null, 4) }));

                            })
                            .onerror(function (error, errorText, dbErrorCode) {
                                conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                            });

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                    });
            }
            if (obj.mt == "SelectSchedulesMessage") {
                Database.exec("SELECT * FROM tbl_schedules WHERE sip ='" + conn.sip + "';")
                    .oncomplete(function (data) {
                        log("SelectSchedulesMessage:result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "user", mt: "SelectSchedulesMessageSuccess", result: JSON.stringify(data, null, 4) }));

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                    });
            }
            if (obj.mt == "DelSchedulesMessage") {
                Database.exec("DELETE FROM tbl_schedules WHERE id=" + obj.id + ";")
                    .oncomplete(function () {
                        Database.exec("SELECT * FROM tbl_schedules WHERE sip ='" + conn.sip + "';")
                            .oncomplete(function (data) {
                                log("DelSchedulesMessage:result=" + JSON.stringify(data, null, 4));
                                conn.send(JSON.stringify({ api: "user", mt: "SelectSchedulesMessageSuccess", result: JSON.stringify(data, null, 4) }));

                            })
                            .onerror(function (error, errorText, dbErrorCode) {
                                conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                            });

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                    });
            }


        });
        conn.onclose(function () {
            connectionsUser = connectionsUser.filter(deleteBySip(conn.sip));
            log("connectionsUser: after delete conn " + JSON.stringify(connectionsUser));
        })
    }
});

new JsonApi("admin").onconnected(function(conn) {
    if (conn.app == "wecom-dwcscheduleradmin") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AdminMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: obj.src }));
            }
        });
    }
});

new PbxApi("PbxSignal").onconnected(function (conn) {
    log("PbxSignal: connected conn " + JSON.stringify(conn));

    // for each PBX API connection an own call array is maintained
    PbxSignal.push(conn);
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

            //Update signals
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

            // send notification with badge count first time the user has connected
            var count = 0;
            try {
                count = pbxTableUsers.filter(findBySip(obj.sig.cg.sip))[0].badge;
            } finally {
                updateBadge(conn, obj.call, count);
            }
        }

        // handle incoming call release messages
        if (obj.mt === "Signaling" && obj.sig.type === "rel") {
            //Remove signals
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
        }
    });

    conn.onclose(function () {
        log("PbxSignal: disconnected");
        PbxSignal.splice(PbxSignal.indexOf(conn), 1);
        //connectionsPbxSignal.splice(connectionsPbxSignal.indexOf(conn), 1);
    });
});

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
        //var today = getDateNow();

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
            log("ReplicateUpdate= user " + obj.columns.h323);
            try {
                pbxTableUsers.forEach(function (user) {
                    if (user.columns.h323 == obj.columns.h323) {
                            log("ReplicateUpdate: Updating the object for user " + obj.columns.h323)
                            obj.badge = user.badge;
                            Object.assign(user, obj)
                    }
                })

            } catch (e) {
                log("ReplicateUpdate: User " + obj.columns.h323 + " Erro " + e)

            }


        }
    });

    conn.onclose(function () {
        log("PbxTableUsers: disconnected");
        pbxTable.splice(pbxTable.indexOf(conn), 1);
    });
});

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

function sendEmail(subject, to, data, str) {
    log("danilo req : SendEmail : to: " + to + " email: " + data);

    var uint8array = new Uint8Array(str.length);

    for (var i = 0; i < str.length; i++) {
        uint8array[i] = str.charCodeAt(i);
    }
    log("danilo req : SendEmail : attach encoded Uint8Array: " + JSON.stringify(uint8array));

    // Configuration
    var cfg = {
        from: "noreplytecnicawecom@gmail.com",
        fromName: "noreplytecnicawecom",
        host: "localhost",
        server: "smtp.gmail.com",
        username: "noreplytecnicawecom@gmail.com",
        password: "EpfrCf4rFuscigR"
    };
    SmtpClient.config(cfg.from, cfg.fromName, cfg.host, cfg.server, cfg.username, cfg.password);

    // Email content
    var subject = subject;
    var to = to;
    var body = {
        mimeType: "text/html",
        charset: "UTF-8",
        data: data
    };
    var attachments = [
        //{
        //    filename: "readme.txt",
        //    mimeType: "text/plain",
        //    data: "README\n\n"
        //        + "This is a text file"
        //},
          {
              filename: "invite.ics",
              mimeType: "text/calendar",
              data: attachuint8array
          }
    ];

    // Send email
    var email = SmtpClient
        .sendMail(subject)
        .to(to)
        .body(body.data, body.mimeType, body.charset)
        .oncomplete(function () { log("danilo req : sending email complete"); })
        .onerror(function () { log("danilo req : sending email failed"); });

    // Attachments
    attachments.forEach(function (file) {
        email.attach(file.filename, file.mimeType, function (uint8array) {
            uint8array.send(file.data, true);
        });
    });
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
//Function to delete objects from Arrays
function deleteBySip(sip) {
    return function (value) {
        if (value.sip != sip) {
            return true;
        }
        //countInvalidEntries++
        return false;
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