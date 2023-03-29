var PbxSignal = [];
var pbxTableUsers = [];
var pbxTable = [];
var connectionsUser = [];

var SmtpClient;
SmtpClient.config(cfg.from, cfg.fromName, cfg.host, cfg.server, cfg.username, cfg.password);

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
                        .oncomplete(function (data) {
                            log("SelectAvailabilityMessage:result=" + JSON.stringify(data, null, 4));
                            var objAvail = data;
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
                                                        sendEmail("Evento Agendado", obj.email, dataClient);
                                                        var dataUser = "<!DOCTYPE html>"
                                                            + "<html>"
                                                            + "<head></head>"
                                                            + "<body>"
                                                            + "<b>Um novo agendamento foi realizado para o seu usuários via DWC, seguem informações de contato do solicitante.</b><br/><br/>"
                                                            + "<b>Nome: " + obj.title + "</b><br/>"
                                                            + "<b>E-mail: " + obj.email + "</b><br/>"
                                                            + "<b>Quando: " + obj.start + "</b><br/>"
                                                            + "<a>URL Conferência: " + cfg[0].url_conference + "</a><br/><br/>"
                                                            + "Best regards<br/>"
                                                            + "<i>DWC Wecom</i>"
                                                            + "</body>"
                                                            + "</html>";
                                                        sendEmail("Evento Agendado", cfg[0].email_contato, dataUser);
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

function sendEmail(subject, to, data) {
    log("danilo req : SendEmail : to: " + to + " email: " + data);
    // Configuration
    var cfg = {
        from: "noreplytecnicawecom@gmail.com",
        fromName: "noreplytecnicawecom",
        host: "localhost",
        server: "smtp.gmail.com",
        username: "noreplytecnicawecom@gmail.com",
        password: "EpfrCf4rFuscigR"
    };

    
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
        //{
        //    filename: "image.png",
        //    mimeType: "image/png",
        //    data: new Uint8Array([
        //        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x4B, 0x00, 0x00, 0x00, 0x4B,
        //        0x08, 0x02, 0x00, 0x00, 0x00, 0xB7, 0x2C, 0xED, 0xBD, 0x00, 0x00, 0x02, 0xF3, 0x49, 0x44, 0x41, 0x54, 0x78, 0xDA, 0xED, 0xDB, 0xCF, 0x6B, 0xD4,
        //        0x40, 0x14, 0x07, 0xF0, 0x37, 0xB3, 0x83, 0xB1, 0xAD, 0xD2, 0x2D, 0x58, 0x6C, 0xF0, 0xE4, 0x61, 0x6F, 0x05, 0xB1, 0x5D, 0x45, 0xB4, 0x8A, 0x57,
        //        0xC1, 0x8A, 0x88, 0x88, 0xB9, 0x18, 0xBC, 0xFA, 0x17, 0xF8, 0x1F, 0xF8, 0x1F, 0x78, 0x13, 0x89, 0x97, 0x80, 0x07, 0x29, 0xF4, 0xE0, 0x49, 0x10,
        //        0xAD, 0xAD, 0xE8, 0xB6, 0x55, 0x58, 0x14, 0xDC, 0x83, 0xDE, 0xA2, 0x28, 0xEC, 0x2E, 0xD5, 0x62, 0xDC, 0x59, 0xD7, 0x43, 0x24, 0x87, 0x35, 0xDD,
        //        0x24, 0xF3, 0xE3, 0x25, 0xAC, 0xF3, 0x6E, 0xB9, 0x64, 0xF9, 0x30, 0x93, 0xCD, 0x7B, 0x3B, 0xDF, 0x25, 0x83, 0xC1, 0x00, 0xC6, 0xBA, 0x28, 0x8C,
        //        0x7B, 0x19, 0xA1, 0x11, 0x1A, 0xA1, 0x11, 0x1A, 0xA1, 0x11, 0x96, 0x49, 0xD8, 0xEA, 0xB6, 0xB7, 0xBE, 0x7D, 0x19, 0x5B, 0x61, 0xAB, 0xDB, 0x5E,
        //        0xDE, 0x5C, 0xBB, 0xF4, 0x66, 0xE3, 0xD5, 0xD7, 0xCF, 0x63, 0x28, 0x8C, 0x78, 0x9D, 0x3E, 0xE7, 0x83, 0xC1, 0x95, 0xB7, 0x2F, 0x91, 0x91, 0x14,
        //        0x8D, 0x17, 0x5D, 0xE2, 0x23, 0x29, 0x26, 0xAF, 0x10, 0x24, 0x45, 0xE6, 0xE1, 0x23, 0x29, 0x3E, 0x0F, 0x19, 0x49, 0x0B, 0xE1, 0x61, 0x22, 0x69,
        //        0x51, 0x3C, 0x34, 0x24, 0x2D, 0x90, 0x87, 0x83, 0xA4, 0xC5, 0xF2, 0x10, 0x90, 0xB4, 0x70, 0x9E, 0x6E, 0x24, 0x2D, 0x03, 0x4F, 0x2B, 0x52, 0x8D,
        //        0xF0, 0x56, 0xB3, 0x21, 0xC9, 0x8B, 0x91, 0x37, 0x9B, 0x8D, 0x5D, 0x15, 0xB7, 0x52, 0x2C, 0x7C, 0x70, 0xFC, 0x74, 0xCD, 0xDA, 0x2F, 0x7F, 0x9F,
        //        0x6A, 0x85, 0xAD, 0x2C, 0x9C, 0x99, 0xAC, 0xB0, 0xB2, 0x08, 0x83, 0x20, 0x08, 0x82, 0x00, 0x00, 0xEC, 0xC9, 0xA9, 0x87, 0xF5, 0x73, 0x92, 0xC8,
        //        0x6A, 0x85, 0xAD, 0x2E, 0x2E, 0xD5, 0xA6, 0x67, 0xCA, 0xB2, 0x4B, 0x83, 0x20, 0xF0, 0x3C, 0xCF, 0xF3, 0x3C, 0x25, 0x48, 0x4D, 0x3C, 0x71, 0x61,
        //        0xC4, 0x0B, 0xC3, 0x30, 0x0C, 0x43, 0x79, 0xA4, 0x3E, 0x9E, 0xA0, 0x30, 0xE6, 0x45, 0x97, 0x92, 0x48, 0xAD, 0x3C, 0x00, 0x20, 0x79, 0xCF, 0x2D,
        //        0x86, 0x78, 0x71, 0x59, 0x96, 0xE5, 0xBA, 0xAE, 0x6D, 0xDB, 0x00, 0x10, 0xEC, 0xFE, 0xB8, 0xD6, 0x78, 0xD6, 0x0A, 0x7F, 0x0A, 0xF0, 0xF8, 0xA7,
        //        0x8D, 0xFE, 0xFB, 0x7B, 0x02, 0x92, 0x7D, 0xE7, 0xEF, 0x90, 0x89, 0x59, 0x59, 0xE1, 0x5E, 0x3C, 0x31, 0x64, 0xE2, 0xEA, 0xF5, 0xDE, 0x3D, 0xE9,
        //        0xAD, 0x5F, 0x15, 0x10, 0x4E, 0x5C, 0x6F, 0x92, 0x03, 0x47, 0xA4, 0x76, 0xE9, 0x68, 0x5E, 0xDE, 0xED, 0xAA, 0x7B, 0x73, 0xE6, 0x16, 0xA6, 0xF2,
        //        0x72, 0x21, 0xD1, 0x78, 0x59, 0x85, 0x19, 0x79, 0x19, 0x91, 0x98, 0xBC, 0x4C, 0xC2, 0x5C, 0xBC, 0x54, 0x24, 0x32, 0x2F, 0x5D, 0x28, 0xC0, 0x1B,
        //        0x81, 0xC4, 0xE7, 0xA5, 0x08, 0x85, 0x79, 0x7B, 0x21, 0x1F, 0x9F, 0x38, 0x8B, 0xCC, 0x1B, 0x25, 0x94, 0xE4, 0x25, 0x22, 0x8F, 0x1E, 0xAC, 0x02,
        //        0x7A, 0x25, 0x0B, 0x39, 0xE7, 0xBE, 0xEF, 0x4B, 0xF2, 0x62, 0xA4, 0xEF, 0xFB, 0x9C, 0x73, 0x28, 0xA8, 0x92, 0x85, 0x8C, 0x31, 0xC7, 0x71, 0x2C,
        //        0xCB, 0x92, 0xFF, 0x00, 0xCB, 0xB2, 0x1C, 0xC7, 0x61, 0x8C, 0x95, 0x4B, 0x08, 0x00, 0xB6, 0x6D, 0xBB, 0xAE, 0x2B, 0x89, 0x1C, 0xEA, 0x72, 0x3E,
        //        0xEE, 0x74, 0x4A, 0x24, 0x94, 0x47, 0xFE, 0xDB, 0xC4, 0x5D, 0x78, 0xFD, 0xBC, 0xD5, 0x6D, 0x97, 0x48, 0x28, 0x83, 0x4C, 0xEC, 0x51, 0x3B, 0x7D,
        //        0xBE, 0xBC, 0xB9, 0x86, 0x8C, 0x4C, 0x7F, 0xE3, 0x0B, 0x20, 0x47, 0xB4, 0xE0, 0xF8, 0xC8, 0x4C, 0x5D, 0x5B, 0x2E, 0x64, 0xEA, 0x84, 0x81, 0x8C,
        //        0xCC, 0xDA, 0x79, 0x67, 0x44, 0x66, 0x1C, 0xA0, 0x30, 0x91, 0x39, 0xA6, 0xA7, 0x54, 0x64, 0xAE, 0xF9, 0x10, 0x0D, 0x59, 0xBE, 0x19, 0xFF, 0xC3,
        //        0x53, 0xBE, 0x7D, 0x5B, 0xE4, 0xAB, 0xFB, 0xE2, 0x0A, 0x99, 0x9A, 0x53, 0x20, 0x4C, 0x44, 0x8A, 0xF1, 0x70, 0xA6, 0x0D, 0x91, 0x5F, 0xA2, 0x86,
        //        0xB6, 0xAB, 0x0C, 0x0F, 0x61, 0xBB, 0x12, 0xE1, 0x04, 0x6D, 0xB4, 0x92, 0x00, 0x20, 0xC3, 0x43, 0x58, 0x49, 0x22, 0x93, 0x11, 0xFE, 0x3B, 0x34,
        //        0x48, 0xF3, 0xB4, 0x22, 0x89, 0x92, 0x14, 0xB4, 0x3C, 0x4F, 0x1F, 0x52, 0xCD, 0xC9, 0xCC, 0x8D, 0xED, 0x75, 0x79, 0x5E, 0xF4, 0x4C, 0x5E, 0xDE,
        //        0x7A, 0x51, 0xC6, 0xB3, 0xA7, 0xBB, 0xF3, 0xF5, 0xAA, 0x8A, 0x03, 0x23, 0x46, 0xC8, 0xFD, 0xF9, 0x7A, 0x89, 0xCE, 0x9E, 0xE2, 0xAA, 0x4D, 0xCF,
        //        0xAC, 0x2E, 0x2E, 0x49, 0x22, 0x19, 0x21, 0x8F, 0x8E, 0x9D, 0x3A, 0x39, 0x3B, 0x57, 0xFC, 0xDB, 0x42, 0x07, 0x52, 0x13, 0x0F, 0xD4, 0x26, 0x15,
        //        0x84, 0x91, 0xFA, 0x78, 0xA0, 0x3C, 0x6D, 0x22, 0x80, 0xD4, 0xCA, 0x03, 0x1D, 0x89, 0xA1, 0x5C, 0x48, 0xDD, 0x3C, 0xD0, 0x94, 0xFA, 0xCA, 0x88,
        //        0x44, 0xE0, 0x81, 0xBE, 0xE4, 0x5E, 0x2A, 0x12, 0x87, 0x07, 0x5A, 0xD3, 0x97, 0x23, 0x90, 0x68, 0x3C, 0xD0, 0x9D, 0xA0, 0x4D, 0x44, 0x62, 0xF2,
        //        0x00, 0x21, 0x05, 0x3D, 0x84, 0x44, 0xE6, 0x29, 0xEB, 0xBC, 0x53, 0x2B, 0x8A, 0x85, 0x7D, 0xFF, 0xDD, 0x47, 0xE6, 0xE1, 0x09, 0x23, 0xE4, 0x4E,
        //        0xEF, 0xD7, 0xC2, 0xA1, 0xC3, 0x80, 0x5B, 0xC4, 0xFC, 0x87, 0xD4, 0x08, 0x8D, 0xD0, 0x08, 0x8D, 0xD0, 0x08, 0x8D, 0xF0, 0x3F, 0x10, 0xFE, 0x01,
        //        0x8D, 0xDC, 0xE4, 0x9A, 0x94, 0x50, 0x9C, 0x16, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        //    ])
        //}
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
        email.attach(file.filename, file.mimeType, function (attachment) {
            attachment.send(file.data, true);
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