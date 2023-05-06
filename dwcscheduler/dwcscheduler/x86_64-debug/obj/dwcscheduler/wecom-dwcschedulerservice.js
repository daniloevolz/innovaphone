var PbxSignal = [];
var pbxTableUsers = [];
var pbxTable = [];
var connectionsUser = [];

var license = getLicense();

//Config variables
var licenseAppToken = Config.licenseAppToken;
if (licenseAppToken == "") {
    var rand = Random.bytes(16);
    Config.licenseAppToken = String(rand);
    Config.save();
}

var from = Config.from;
var fromName = Config.fromName;
var server = Config.server;
var pbx = Config.pbx;
var username = Config.username;
var password = Config.password;
var google_api_key = Config.googleApiKey;
var sendLocation = Config.sendLocation;
var licenseAppFile = Config.licenseAppFile;
var licenseInstallDate = Config.licenseInstallDate;

Config.onchanged(function () {
    from = Config.from;
    fromName = Config.fromName;
    pbx = Config.pbx;
    server = Config.server;
    username = Config.username;
    password = Config.password;
    google_api_key = Config.googleApiKey;
    sendLocation = Config.sendLocation;
    licenseAppFile = Config.licenseAppFile;
    licenseInstallDate = Config.licenseInstallDate;
})

log("danilo req: License "+JSON.stringify(license));
if (license != null && license.System==true) {
    log("danilo req: License for System found, Webservers will be available");
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
    WebServer.onrequest("get-agenda", function (req) {
        if (req.method == "GET") {
            var uri = req.relativeUri;
            log(uri);
            var array_uri = uri.split("=");
            var sip = array_uri[1];
            var msg;
            Database.exec("SELECT * FROM tbl_availability WHERE sip ='" + sip + "';")
                .oncomplete(function (dataavailability) {
                    log("get-agenda:tbl_availability result=" + JSON.stringify(dataavailability, null, 4));

                    Database.exec("SELECT * FROM tbl_schedules WHERE sip ='" + sip + "';")
                        .oncomplete(function (dataschedules) {
                            log("get-agenda:tbl_schedules result=" + JSON.stringify(dataschedules, null, 4));
                            msg = { status: 200, dataavailability: JSON.stringify(dataavailability), dataschedules: JSON.stringify(dataschedules) };
                            req.responseContentType("application/json")
                                .sendResponse()
                                .onsend(function (req) {
                                    req.send(new TextEncoder("utf-8").encode(JSON.stringify(msg)), true);
                                });
                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            // value does not exist, send 404 Not Found
                            req.cancel();
                        });
                })
                .onerror(function (error, errorText, dbErrorCode) {
                    // value does not exist, send 404 Not Found
                    req.cancel();
                });

        }
    });
    WebServer.onrequest("put-caller", function (req) {
        if (req.method == "GET") {
            var uri = req.relativeUri;
            log(uri);
            var params = getQueryStringParams(uri); // Obter um objeto com os parâmetros

            var sip = params['id']; // Obter o valor do parâmetro 'id'
            var caller = params['caller']; // Obter o valor do parâmetro 'caller'
            var x = params['x']; // Obter o valor do parâmetro 'id'
            var y = params['y']; // Obter o valor do parâmetro 'caller'
            var msg;


            connectionsUser.forEach(function (c) {
                if (c.sip == sip) {
                    log("put-caller:user connected notified caller=" + caller);
                    if (sendLocation) {
                        c.send(JSON.stringify({ api: "user", mt: "DWCCallRequest", caller: caller, location: "https://www.google.com/maps/embed/v1/place?key=" + google_api_key + "&q=" + x + "," + y + "&zoom=15" }));
                    } else {
                        c.send(JSON.stringify({ api: "user", mt: "DWCCallRequest", caller: caller, location: "" }));
                    }
                }
            })

            msg = { status: 200 };
            req.responseContentType("application/json")
                .sendResponse()
                .onsend(function (req) {
                    req.send(new TextEncoder("utf-8").encode(JSON.stringify(msg)), true);
                });
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
                                                        msg = { status: 200, msg: "Evento agendado, Em breve você receberá um e-mail com o convite da conferência.\nNão esqueça de verificar sua caixa de SPAM!\nObrigado!" };
                                                        req.responseContentType("application/json")
                                                            .sendResponse()
                                                            .onsend(function (req) {
                                                                req.send(new TextEncoder("utf-8").encode(JSON.stringify(msg)), true);
                                                            });
                                                        var cfg = JSON.parse(JSON.stringify(data));
                                                        try {
                                                            connectionsUser.forEach(function (conn) {
                                                                if (conn.sip == obj.sip) {
                                                                    conn.send(JSON.stringify({ api: "user", mt: "UserEventMessage", name: obj.title, email: obj.email, time_start: obj.start }));
                                                                }
                                                            })

                                                        } catch (e) {
                                                            log("danilo req: erro send UserEventMessage: " + e);
                                                        }
                                                        try {
                                                            var count = 0;
                                                            PbxSignal.forEach(function (signal) {
                                                                log("danilo-req salvar-evento: signal" + JSON.stringify(signal));
                                                                var call = signal[obj.sip];
                                                                log("pietro-log: call = " + call)
                                                                if (call != null) {
                                                                    log("danilo-req salvar-evento call " + String(call) + ", will call updateBadge");
                                                                    try {
                                                                        pbxTableUsers.forEach(function (user) {

                                                                            if (user.columns.h323 == obj.sip) {
                                                                                var old_badge = user.badge;
                                                                                user.badge += 1;
                                                                                log("danilo-req salvar-evento: Updating the Badge for object user " + user.columns.h323 + " the old Badge value is " + old_badge + " and new value is " + user.badge);
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
                                                            var today = convertDateTimeLocalToCustomFormat(getDateNow());
                                                            var arrayToday = obj.start.split("T");
                                                            var day = arrayToday[0];
                                                            var time = arrayToday[1];
                                                            var name = pbxTableUsers.filter(findBySip(obj.sip))[0].columns.cn;
                                                            //Email Cliente
                                                            var dataClient = "<!DOCTYPE html>"
                                                                + "<html>"
                                                                + "<head></head>"
                                                                + "<body>"
                                                                + "<div style = 'border: solid 1px #dadce0;border-radius: 8px;'>"
                                                                + "<h3>" + cfg[0].text_invite + "</h3>"
                                                                + "<p></p>"
                                                                + "<table style='width: 100%;'>"
                                                                + "<tr style='width: 100%;'>"
                                                                + "<td style ='width: 50%'><b>Quando</b>" + "<br>" + day + '&nbsp;' + time
                                                                + "</td>"
                                                                + "<td style= 'background-color: #1a73e8;border: none; width: 25%; color:white ;padding:15px;border-radius: 5px; display:flex; justify-content: center; align-items: center; text-align: center;' >"
                                                                + "<a style='color:white; font-weight:bold; width:100%; height:fit-content; text-decoration: none;' href=" + " ' " + cfg[0].url_conference + " ' " + ">" + "<span style = 'width: 100%; font-weight: bold;' > Entrar na reunião"
                                                                + "</span>"
                                                                + "</a>"
                                                                + "</td>"
                                                                + "</tr>"
                                                                + "<tr style='height: 25px;'></tr>"
                                                                + "</tr>"
                                                                + "<tr>"
                                                                + "<td>"
                                                                + "<b>Participantes</b>"
                                                                + "<br>" + "<span style ='text-decoration: none; color: #3c4043'>" + cfg[0].email_contato + "</span>" + "<span style='color: #70757a;'> - organizador </span>"
                                                                + "<br>" + "<span style ='text-decoration: none; color: #3c4043'>" + obj.email + "</span>"
                                                                + "</td>"
                                                                + "<td><b>Url da Reunião</b>" + "<br>" + "<span style = 'color: #70757a'>" + cfg[0].url_conference + "</span>" + "</td>"
                                                                + "</tr>"
                                                                + "</table>"
                                                                + "</div>"
                                                                + "</body>"
                                                                + "</html>";

                                                            //Email Usuario
                                                            var dataUser = "<!DOCTYPE html>"
                                                                + "<html>"
                                                                + "<head></head>"
                                                                + "<body>"
                                                                + "<h3>Olá " + name + ", um novo agendamento foi realizado para o seu usuários via DWC, seguem informações de contato do solicitante.</h3><br/>"
                                                                + "<b>Nome: " + obj.title + "</b><br/>"
                                                                + "<b>E-mail:</b> " + obj.email + "<br/>"
                                                                + "<b>Quando:</b> " + day + "<br/>"
                                                                + "<b>Horário:</b> " + time + "<br/><br/>"
                                                                + "<b>URL Conferência:</b> " + cfg[0].url_conference + "<br/><br/>"
                                                                + "Atenciosamente<br/>"
                                                                + "<i>DWC Wecom</i>"
                                                                + "</body>"
                                                                + "</html>";


                                                            //Anexo
                                                            var attachment = "BEGIN:VCALENDAR\n"
                                                                + "PRODID:-//DWC Wecom//EN\n"
                                                                + "VERSION:2.0\n"
                                                                + "CALSCALE:GREGORIAN\n"
                                                                + "METHOD:REQUEST\n"
                                                                + "BEGIN:VTIMEZONE\n"
                                                                + "TZID:America/Sao_Paulo\n"
                                                                + "X-LIC-LOCATION:America/Sao_Paulo\n"
                                                                + "BEGIN:STANDARD\n"
                                                                + "TZOFFSETFROM:-0300\n"
                                                                + "TZOFFSETTO:-0300\n"
                                                                + "TZNAME:-03\n"
                                                                + "DTSTART:19700101T000000\n"
                                                                + "END:STANDARD\n"
                                                                + "END:VTIMEZONE\n"
                                                                + "BEGIN:VEVENT\n"
                                                                + "DTSTART;TZID=America/Sao_Paulo:" + convertDateTimeLocalToCustomFormat(obj.start) + "\n"
                                                                + "DTEND;TZID=America/Sao_Paulo:" + convertDateTimeLocalToCustomFormat(obj.end) + "\n"
                                                                + "DTSTAMP:" + today + "Z\n"
                                                                + "ORGANIZER;CN=" + cfg[0].email_contato + ":mailto:" + cfg[0].email_contato + "\n"
                                                                + "ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=TRUE"
                                                                + ";CN=" + cfg[0].email_contato + ":mailto:" + cfg[0].email_contato + "\n"
                                                                + "ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=TRUE"
                                                                + ";CN=" + obj.email + ":mailto:" + obj.email + "\n"
                                                                + "X-GOOGLE-CONFERENCE:" + cfg[0].url_conference + "\n"
                                                                + "X-MICROSOFT-CDO-OWNERAPPTID:1590702030\n"
                                                                + "CREATED:" + today + "Z\n"
                                                                + "DESCRIPTION:" + cfg[0].url_conference + "\n\n-::~:~::~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~\n"
                                                                + " :~:~:~:~:~:~:~:~:~:~:~:~::~:~::-\nJoin with Browser: " + cfg[0].url_conference + " \n\nLearn more about Meet at: https://support.google.com/"
                                                                + " a/users/answer/9282720\n\nPlease do not edit this section.\n-::~:~::~:~:~:~\n"
                                                                + " :~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~::~:~::-\n"
                                                                + "LAST-MODIFIED:" + today + "Z\n"
                                                                + "LOCATION:\n"
                                                                + "SEQUENCE:0\n"
                                                                + "STATUS:CONFIRMED\n"
                                                                + "SUMMARY:" + cfg[0].title_conference + "\n"
                                                                + "TRANSP:OPAQUE\n"
                                                                + "BEGIN:VALARM\n"
                                                                + "DESCRIPTION:REMINDER\n"
                                                                + "TRIGGER;RELATED=START:-PT15M\n"
                                                                + "ACTION:DISPLAY\n"
                                                                + "END:VALARM\n"
                                                                + "END:VEVENT\n"
                                                                + "END:VCALENDAR";

                                                            sendEmail(cfg[0].email_title, obj.email, dataClient, attachment);

                                                            sendEmail(cfg[0].email_title, cfg[0].email_contato, dataUser, attachment);
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
}

function getLicense() {
    var key = Config.licenseAppToken;
    var hash = Config.licenseAppFile;
    var lic = decrypt(key,hash);
    return lic;
}

function getQueryStringParams(queryString) {
    var params = {};
    var pairs = queryString.slice(1).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        params[pair[0]] = pair[1];
    }
    return params;
}

new JsonApi("user").onconnected(function(conn) {
    if (conn.app == "wecom-dwcscheduler") {
        log("license: " + JSON.stringify(license));
        log("connectionsUser: license.Users " + license.Users);
        log("connectionsUser: connectionsUser.length " + connectionsUser.length);
        // if (connectionsUser.length < license.Users) {
               connectionsUser.push(conn);
               log("Usuario Conectado:  " + connectionsUser.length);
        // }
        
        conn.onmessage(function (msg) {

            if (license != null && connectionsUser.length <= license.Users) {
                
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
                                conn.send(JSON.stringify({ api: "user", mt: "UpdateConfigMessageProccessing" }));
                            })
                            .onerror(function (error, errorText, dbErrorCode) {
                                conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                            });
                    } catch (e) {
                        conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(e) }));
                    }

                    try {
                        Database.exec("INSERT INTO tbl_user_configs (sip, text_invite, url_conference, email_contato, email_title, title_conference) VALUES ('" + conn.sip + "','" + obj.text_invite + "','" + obj.url_conference + "','" + obj.email + "','" + obj.email_title + "','" + obj.title_conference + "')")
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
            }
            else {
                log("danilo req: No license Available")
                conn.send(JSON.stringify({ api: "user", mt: "NoLicense", result: String("Por favor, contate o administrador do sistema para realizar o licenciamento.") }));
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

                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: obj.src, from: from, fromName: fromName, server: server, username: username, password: password, googleApiKey: google_api_key, sendLocation: sendLocation }));
            }
            if (obj.mt == "UpdateConfigMessage") {
                try {
                    Config.from = obj.from;
                    Config.fromName = obj.fromName;
                    Config.server = obj.server;
                    Config.username = obj.username;
                    Config.password = obj.password;
                    var info = JSON.parse(conn.info);
                    Config.pbx = info.pbx + "." + conn.domain;
                    Config.save();
                    conn.send(JSON.stringify({ api: "admin", mt: "UpdateConfigMessageSuccess" }));

                } catch (e) {
                    conn.send(JSON.stringify({ api: "admin", mt: "UpdateConfigMessageErro"}));
                    log("ERRO UpdateConfigMessage:" + e);


                }
                
            }
            if (obj.mt == "UpdateConfigGoogleMessage") {
                try {
                    Config.sendLocation = obj.sendLocation;
                    Config.googleApiKey = obj.googleApiKey;
                    
                    Config.save();
                    conn.send(JSON.stringify({ api: "admin", mt: "UpdateConfigGoogleMessageSuccess" }));

                } catch (e) {
                    conn.send(JSON.stringify({ api: "admin", mt: "UpdateConfigMessageErro" }));
                    log("ERRO UpdateConfigGoogleMessage:" + e);


                }
            }
            if (obj.mt == "ConfigLicense") {
                var licenseAppToken = Config.licenseAppToken;
                licenseInstallDate = Config.licenseInstallDate;
                licenseAppFile = Config.licenseAppFile;
                var licUsed = connectionsUser.length;
                var lic = decrypt(licenseAppToken, licenseAppFile)
                conn.send(JSON.stringify({ api: "admin", mt: "LicenseMessageResult",licenseUsed: licUsed, licenseToken: licenseAppToken, licenseFile: licenseAppFile, licenseActive: JSON.stringify(lic), licenseInstallDate: licenseInstallDate }));
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
                        obj.badge = user.badge;
                        log("ReplicateUpdate: Updating the object for user " + obj.columns.h323 + " and current Badge is " + user.badge);
                        Object.assign(user, obj);
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
        from: from,
        fromName: fromName,
        host: pbx,
        server: server,
        username: username,
        password: password
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
              data: uint8array
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
    //dateString = dateString.replace("T", " ");

    // Retorna a string no formato "AAAA-MM-DDTHH:mm:ss.sss"
    return dateString.slice(0, -5);
}
function getDateNow2() {
    // Cria uma nova data com a data e hora atuais em UTC
    var date = new Date();
    // Adiciona o deslocamento de GMT-3 às horas da data atual em UTC
    date.setUTCHours(date.getUTCHours() - 3);

    // Formata a data em uma string no formato "AAAAMMDDTHHmmss"
    var year = date.getUTCFullYear();
    var month = padZero(date.getUTCMonth() + 1);
    var day = padZero(date.getUTCDate());
    var hours = padZero(date.getUTCHours());
    var minutes = padZero(date.getUTCMinutes());
    var seconds = padZero(date.getUTCSeconds());
    var dateString = year + month + day + "T" + hours + minutes + seconds;

    // Retorna a string no formato "AAAAMMDDTHHmmss"
    return dateString;
}
function convertDateTimeLocalToCustomFormat(datetimeLocal) {
    var d = new Date(datetimeLocal);
    var year = d.getFullYear();
    var month = padZero(d.getMonth() + 1);
    var day = padZero(d.getDate());
    var hours = padZero(d.getHours());
    var minutes = padZero(d.getMinutes());
    var seconds = padZero(d.getSeconds());
    return year + month + day + "T" + hours + minutes + seconds;
}

function padZero(num) {
    return (num < 10 ? "0" : "") + num;
}


