var PbxSignal = [];
var pbxTableUsers = [];
var pbxTable = [];
var PbxAdminApi;
var connectionsUser = [];
var connectionsIdentity = [];
var baseUrl = WebServer.url;
var license = getLicense();

//Config variables
var licenseAppToken = Config.licenseAppToken;
if (licenseAppToken == "") {
    var rand = Random.bytes(16);
    Config.licenseAppToken = String(rand);
    Config.save();
}

WebServer.onurlchanged(function (newUrl) {
    baseUrl = newUrl;
    log("danilo req urlchaged: " + baseUrl);
});

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
    if (license.Scheduller == true) {
        log("danilo req: License for Scheduller found, Webservers will be available");
        WebServer.onrequest("value", function (req) {
            if (req.method == "GET") {
                var filePath = "Calendario.htm"; // Caminho para o arquivo HTML

                var fileContents = new TextEncoder("utf-8").encode(fs.readFileSync(filePath)); // Le o conteudo do arquivo

                if (fileContents) {
                    // Se o arquivo foi encontrado, envie-o como resposta com o tipo MIME apropriado
                    req.responseContentType("text/html")
                        .sendResponse()
                        .onsend(function (req) {
                            req.send(filePath, true);
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
                            var today = convertDateTimeLocalToCustomFormat(getDateNow());
                            var arrayToday = obj.time_start.split("T");
                            var day = arrayToday[0];
                            var time = arrayToday[1];
                            var name = pbxTableUsers.filter(findBySip(obj.sip))[0].columns.cn;

                            //Início teste url temporária
                            function creationDate(date) {
                                var ano = date.substring(0, 4);
                                var mes = date.substring(4, 6);
                                var dia = date.substring(6, 8);
                                var hora = date.substring(9, 11);
                                var minuto = date.substring(11, 13);
                                var segundo = date.substring(13, 15);
                                return ano + '-' + mes + '-' + dia + 'T' + hora + ':' + minuto + ':' + segundo;
                            }
                            var version = 0;
                            var flags = 0;
                            var rand = String(Random.dword());
                            rand = rand.substring(0, 4);
                            log("rand" + rand);

                            var meetingId = rand;
                            var startTimestamp = convertDateTimeToTimestamp(obj.time_start);
                            log("startTimestamp " + startTimestamp);
                            var endTimestamp = convertDateTimeToTimestamp(obj.time_end);
                            log("endTimestamp " + endTimestamp);

                            var timeNow = creationDate(today);
                            var creationTimestamp = convertDateTimeToTimestamp(timeNow);
                            log("creationTimestamp " + creationTimestamp);

                            selectUserConfigs(obj, function (error, resultConfigs) {
                                if (error) {
                                    log("selectUserConfigs Ocorreu um erro:", error);
                                    msg = JSON.parse(JSON.stringify(resultConfigs));
                                    req.responseContentType("application/json")
                                        .sendResponse()
                                        .onsend(function (resp) {
                                            resp.send(new TextEncoder("utf-8").encode(JSON.stringify(msg)), true);
                                        });
                                } else {
                                    log("selectUserConfigs Resultado:", JSON.stringify(resultConfigs));
                                    var cfg = JSON.parse(JSON.stringify(resultConfigs.msg));
                                    log("resultConfigs.status==" + resultConfigs.status);
                                    var roomNumber = cfg[0].number_conference;
                                    var md5Hash = decodeURIComponent(cfg[0].key_conference);
                                    var reservedChannels = cfg[0].reserved_conference;
                                    var conferenceLink = createConferenceLink(version, flags, roomNumber, meetingId, startTimestamp, endTimestamp, reservedChannels, creationTimestamp, md5Hash, cfg[0].url_conference, cfg[0].obj_conference);
                                    log("conferenceLink" + conferenceLink);
                                    insertConferenceSchedule(obj, conferenceLink, function (error, resultSchedule) {
                                        if (error) {
                                            log("selectUserConfigs Ocorreu um erro:", error);
                                            msg = JSON.parse(JSON.stringify(resultSchedule));
                                            req.responseContentType("application/json")
                                                .sendResponse()
                                                .onsend(function (resp) {
                                                    resp.send(new TextEncoder("utf-8").encode(JSON.stringify(msg)), true);
                                                });
                                        } else {
                                            log("insertConferenceSchedule Resultado:", JSON.stringify(resultSchedule));
                                            log("resultSchedule.status==" + resultSchedule.status);
                                            req.responseContentType("application/json")
                                            req.sendResponse()
                                                .onsend(function (req) {
                                                    log("salvar-evento:result=" + JSON.stringify(resultSchedule));
                                                    req.send(new TextEncoder("utf-8").encode(JSON.stringify(resultSchedule)), true);
                                                });
                                            //Notify user 
                                            try {
                                                connectionsUser.forEach(function (conn) {
                                                    if (conn.sip == obj.sip) {
                                                        conn.send(JSON.stringify({ api: "user", mt: "UserEventMessage", name: obj.name, email: obj.email, time_start: obj.time_start }));
                                                    }
                                                })

                                            } catch (e) {
                                                log("danilo req: erro send UserEventMessage: " + e);
                                            }
                                            //Update Badge
                                            try {
                                                var count = 0;
                                                
                                                PbxSignal.forEach(function (signal) {
                                                    log("danilo-req salvar-evento: signal" + JSON.stringify(signal));
                                                    //var call = signal[obj.sip];
                                                    //Teste Danilo 20/07:
                                                    var foundCalls = [];
                                                    for (var key in signal) {
                                                        if (Object.prototype.hasOwnProperty.call(signal, key) && signal[key] === obj.sip) {
                                                            foundCalls.push(key);
                                                        }
                                                    }
                                                    //
                                                    log("pietro-log: call = " + foundCalls);
                                                    if (foundCalls.length >0) {
                                                        log("danilo-req salvar-evento call " + foundCalls + ", will call updateBadge");
                                                        try {
                                                            pbxTableUsers.forEach(function (user) {
                                                                if (user.columns.h323 == obj.sip) {
                                                                    var old_badge = user.badge;
                                                                    user.badge += 1;
                                                                    log("danilo-req salvar-evento: Updating the Badge for object user " + user.columns.h323 + " the old Badge value is " + old_badge + " and new value is " + user.badge);
                                                                    count = user.badge;
                                                                }
                                                            })
                                                            foundCalls.forEach(function (call) {
                                                                updateBadge(signal, parseInt(call,10), count);
                                                            })
                                                            
                                                        } catch (e) {
                                                            log("danilo-req salvar-evento: User " + obj.columns.h323 + " Erro " + e)
                                                        }
                                                    }

                                                })

                                            }
                                            catch (e) {
                                                log("danilo req: erro send badge: " + e);
                                            }
                                            //Send e-mails to users
                                            try {
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
                                                    + "<a style='color:white; font-weight:bold; width:100%; height:fit-content; text-decoration: none;' href=" + " ' " + conferenceLink + " ' " + ">" + "<span style = 'width: 100%; font-weight: bold;' > Entrar na reunião"
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
                                                    + "<td><b>Url da Reunião</b>" + "<br>" + "<span style = 'color: #70757a'>" + conferenceLink + "</span>" + "</td>"
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
                                                    + "<b>Nome: " + obj.name + "</b><br/>"
                                                    + "<b>E-mail:</b> " + obj.email + "<br/>"
                                                    + "<b>Quando:</b> " + day + "<br/>"
                                                    + "<b>Horário:</b> " + time + "<br/><br/>"
                                                    + "<b>URL Conferência:</b> " + conferenceLink + "<br/><br/>"
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
                                                    + "DTSTART;TZID=America/Sao_Paulo:" + convertDateTimeLocalToCustomFormat(obj.time_start) + "\n"
                                                    + "DTEND;TZID=America/Sao_Paulo:" + convertDateTimeLocalToCustomFormat(obj.time_end) + "\n"
                                                    + "DTSTAMP:" + today + "Z\n"
                                                    + "ORGANIZER;CN=" + cfg[0].email_contato + ":mailto:" + cfg[0].email_contato + "\n"
                                                    + "ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=TRUE"
                                                    + ";CN=" + cfg[0].email_contato + ":mailto:" + cfg[0].email_contato + "\n"
                                                    + "ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=TRUE"
                                                    + ";CN=" + obj.email + ":mailto:" + obj.email + "\n"
                                                    + "X-GOOGLE-CONFERENCE:" + conferenceLink + "\n"
                                                    + "X-MICROSOFT-CDO-OWNERAPPTID:1590702030\n"
                                                    + "CREATED:" + today + "Z\n"
                                                    + "DESCRIPTION:" + conferenceLink + "\n\n-::~:~::~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~\n"
                                                    + " :~:~:~:~:~:~:~:~:~:~:~:~::~:~::-\nJoin with Browser: " + conferenceLink + " \n\nLearn more about Meet at: https://support.google.com/"
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

                                                sendEmail(cfg[0].email_title, obj.email, dataClient, attachment, function (error, resultEmail) {
                                                    if (error) {
                                                        log("sendEmail Ocorreu um erro:", error);

                                                    } else {
                                                        log("sendEmail:", resultEmail);
                                                    }
                                                });

                                                sendEmail(cfg[0].email_title, cfg[0].email_contato, dataUser, attachment, function (error, resultEmail) {
                                                    if (error) {
                                                        log("sendEmail Ocorreu um erro:", error);

                                                    } else {
                                                        log("sendEmail:", resultEmail);
                                                    }
                                                });
                                            }
                                            catch (e) {
                                                log("danilo req: erro send email:" + e);
                                                //msg = { status: 200, msg: "Evento agendado, Tivemos um problema ao enviar o email, no dia, utilize o link para ingresso: " + cfg[0].url_conference};
                                            }
                                        }
                                    })
                                }
                            });



                            /*Verificação desnecessária pois o calendário já tem as verificações
                            var schedule_valid = false;
                            Database.exec("SELECT * FROM tbl_availability WHERE sip ='" + obj.sip + "';")
                                .oncomplete(function (dataAvail) {
                                    log("SelectAvailabilityMessage:result=" + JSON.stringify(dataAvail, null, 4));
                                    var objAvail = dataAvail;
                                    objAvail.forEach(function (a) {
                                        if (obj.time_start >= a.time_start && obj.time_end <= a.time_end) {
                                            log("danilo req : Time schedule valid")
                                            schedule_valid = true;
                                        }
                                    })
                                    
                                })
                                .onerror(function (error, errorText, dbErrorCode) {
                                    conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                                });
                                */


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
    if (license.Identity == true) {
        log("danilo req: License for Identity found, Webservers will be available");
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
                log("put-caller: received request to update Identity App");

                connectionsIdentity.forEach(function (c) {
                    if (c.sip == sip) {
                        log("put-caller:user connected notified caller=" + caller);
                        if (sendLocation && license.Location == true) {
                            //var mapbox = 'https://api.mapbox.com/styles/v1/mapbox/streets-v12.html?title=true&zoomwheel=false&access_token=' + google_api_key + '#15/' + x + '/' + y + '/70';
                            var google = "https://www.google.com/maps/embed/v1/place?key=" + google_api_key + "&q=" + x + "," + y + "&zoom=15";
                            c.send(JSON.stringify({ api: "user", mt: "DWCCallRequest", caller: caller, location: google }));
                            log("put-caller: sendLocation true");
                        } else {
                            c.send(JSON.stringify({ api: "user", mt: "DWCCallRequest", caller: caller, location: "" }));
                            log("put-caller: sendLocation false");
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
    }
    
    
}

function getLicense() {
    var key = Config.licenseAppToken;
    var hash = Config.licenseAppFile;
    var lic = '';
    try {
       lic = decrypt(key, hash);
    } catch (e) {
        
    }
    
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
                        //var call = signal[conn.sip];
                        //Teste Danilo 20/07:
                        var foundCalls = [];
                        for (var key in signal) {
                            if (Object.prototype.hasOwnProperty.call(signal, key) && signal[key] === conn.sip) {
                                foundCalls.push(key);
                            }
                        }
                        //
                        if (foundCalls.length > 0) {
                            log("danilo-req badge2:UserAckEventMessage call " + foundCalls + ", will call updateBadge");
                            try {
                                pbxTableUsers.forEach(function (user) {
                                    if (user.columns.h323 == conn.sip) {
                                        log("danilo-req badge2:UserAckEventMessage: Updating the object for user " + user.columns.h323)
                                        user.badge = count;
                                    }
                                })
                            } finally {
                                //updateBadge(signal, call, count);
                                foundCalls.forEach(function (call) {
                                    updateBadge(signal, parseInt(call, 10), count);
                                })
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
                        Database.exec("INSERT INTO tbl_user_configs (sip, text_invite, url_conference, email_contato, email_title, title_conference, obj_conference, number_conference, key_conference, reserved_conference) VALUES ('" + conn.sip + "','" + obj.text_invite + "','" + obj.url_conference + "','" + obj.email + "','" + obj.email_title + "','" + obj.title_conference + "','" + obj.obj_conference + "','" + obj.number_conference + "','" + obj.key_conference + "','" + obj.reserved_conference+ "')")
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
                if (obj.mt == "FindObjConfMessage") {
                    PbxAdminApi.send(JSON.stringify({ "api": "PbxAdminApi", "mt": "GetObject", "h323": obj.obj_conference, "template": "without", "src": conn.sip }));
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
    if (conn.app == "wecom-dwcidentity") {
        conn.onmessage(function (msg) {
            var obj = JSON.parse(msg);
            if (license != null && connectionsIdentity.length <= license.HiddenUsers) {
                if (obj.mt == "UserSession") {
                    log("connectionsUser: UserSession");
                    var session = Random.bytes(16);
                    conn.send(JSON.stringify({ api: "user", mt: "UserSessionResult", session: session }));

                }
                if (obj.mt == "InitializeMessage") {
                    log("connectionsUser: InitializeMessage");
                    if (connectionsIdentity.length > 0) {
                        log("connectionsUser: InitializeMessage connectionsIdentity.length > 0");
                        var foundConn = connectionsIdentity.filter(function (c) { return c.session == obj.session });
                        log("connectionsUser: InitializeMessage foundConn " + JSON.stringify(foundConn));
                        if (foundConn.length==0) {
                            log("connectionsUser: not found conn");
                            conn["session"] = obj.session;
                            connectionsIdentity.push(conn);
                            log("Identity Conectado:  " + conn.sip + ". Usuários conectados:" + connectionsIdentity.length);
                        }
                    } else {
                        log("connectionsUser: InitializeMessage connectionsUser.length == 0");
                        conn["session"] = obj.session;
                        connectionsIdentity.push(conn);
                        log("Identity Conectado:  " + conn.sip + ". Usuários conectados:" + connectionsIdentity.length);
                    }

                }
            }
        })

        conn.onclose(function () {

            //Remove cennection from array
            connectionsIdentity = connectionsIdentity.filter(function (c) { return c.session != conn.session });
            log("danilo req : connectionsIdentity after delete conn of user " + conn.sip + " : " + JSON.stringify(connectionsIdentity));

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

new PbxApi("PbxAdminApi").onconnected(function(conn){
    log("PbxAdminApi: connected conn " + JSON.stringify(conn));
    PbxAdminApi = conn;
    //conn.send(JSON.stringify({ "api": "PbxAdminApi", "mt": "GetObject", "cn":"Conference", "template": "without", "src": conn.pbx }));
    conn.onmessage(function (msg) {
        var obj = JSON.parse(msg);
        log("PbxAdminApi msg "+msg);

        if (obj.mt === "GetObjectResult") {
            var found = false;
            var rooms;
            var key;
            if (obj.guid) {
                found = true;
                rooms = obj.pseudo["static-room"];
                key = obj.pseudo["m-key"];
                log("PbxAdminApi msg " + JSON.stringify(rooms));
            }
            connectionsUser.forEach(function (c) {
                if (c.sip == obj.src) {
                    c.send(JSON.stringify({ api: "user", mt: "FindObjConfMessageResult", found: found, rooms: rooms, key: key}));
                }
            })
            
        }
    });
    conn.onclose(function () {
        PbxAdminApi = null;
        log("PbxAdminApi: disconnected");
    });
})

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
    //PbxSignal.push(conn);
    // register to the PBX in order to acceppt incoming presence calls
    //conn.send(JSON.stringify({ "api": "PbxSignal", "mt": "Register", "flags": "NO_MEDIA_CALL", "src": conn.pbx }));

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
            //Teste Danilo 20/07: armazenar o conteúdo call no parâmetro e o sip no valor
            PbxSignal.forEach(function (signal) {
                if (signal.pbx == pbx) {
                    var call = obj.call.toString();
                    signal[call] = obj.sig.cg.sip;
                }
            })
            //Teste Danilo 20/07: armazenar o conteúdo call no parâmetro e o sip no valor
            //PbxSignal.forEach(function (signal) {
            //    if (signal.pbx == pbx) {
            //        signal[obj.sig.cg.sip] = obj.call;
            //    }
            //})
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
        //Remove cennection from array
        PbxSignal = PbxSignal.filter(function (c) { return c.pbx != conn.pbx });
        log("PbxSignal: disconnected");
        //PbxSignal.splice(PbxSignal.indexOf(conn), 1);
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
        
        pbxTable.splice(pbxTable.indexOf(conn), 1);
        log("PbxTableUsers: disconnected");
    });
});

function decrypt(key,hash) {
    //var iv = iv.substring(0, 16);

    log("key: " + key)
    log("hash: " + hash)

    try {
        // encryption using AES-128 in CTR mode
        //var ciphertext = Crypto.cipher("AES", "CTR", key, true).iv(key).crypt(hash);
        //log("Crypted: " + ciphertext);
        // decryption using AES-128 in CTR mode
        var decrypted = Crypto.cipher("AES", "CTR", key, false).iv(key).crypt(hash);
        log("Decrypted: " + decrypted);
        // now decrypted contains the plain text again

    } catch (e) {
        log("ERRO decrypt: " + e);
    }
    

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

function sendEmail(subject, to, data, str, callback) {
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
        .oncomplete(function () { 
            log("danilo req : sending email complete"); 
            callback(null,"danilo req : sending email complete");
        })
        .onerror(function (e) { 
            log("danilo req : sending email failed");
            callback(e,"danilo req : sending email failed");
     });

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
function createConferenceLink(version, flags, roomNumber, meetingId, startTimestamp, endTimestamp, reservedChannels, creationTimestamp, md5Hash, domain, obj) {
    log("version "+version+", flags "+flags+", roomNumber "+roomNumber+", meetingId "+meetingId+", startTimestamp "+startTimestamp+", endTimestamp "+endTimestamp+", reservedChannels "+reservedChannels+", creationTimestamp "+creationTimestamp+", md5Hash "+md5Hash+", domain "+domain);
    var conf = {
        version: toUint8Array(version, 1),
        flags: toUint8Array(flags, 1),
        roomNumberLength: toUint8Array(2, 1),
        roomNumber: toUint8Array(parseInt(roomNumber, 10), 4),
        meetingId: toUint8Array(parseInt(meetingId, 10), 4),
        startTimestamp: toUint8Array(parseInt(startTimestamp, 10), 4),
        endTimestamp: toUint8Array(parseInt(endTimestamp, 10), 4),
        channels: toUint8Array(parseInt(reservedChannels, 10), 2),
        mKey: Encoding.stringToBin(md5Hash) // m-key property from config line of the Conference PBX Object
    };
    
    
    var confValues = [];
    Object.keys(conf).forEach(function (key) { confValues.push(conf[key]) });
    
    var hashInputBytes = mergeUint8Arrays(confValues);
    log("Input for MD5 Digest: " + Encoding.binToHex(hashInputBytes));
    
    var digest = Crypto.hash("MD5").update(hashInputBytes).final();
    log("MD5 Digest: " + digest);
    
    var creationTimestamp = toUint8Array(creationTimestamp, 4);
    confValues.pop(); // remove last element (mKey)
    confValues.push(creationTimestamp); // add creationTimestamp instead
    confValues.push(Encoding.hexToBin(digest)); // add MD5 hash from previous step
    
    var base64InputBytes = mergeUint8Arrays(confValues);
    log("Input for Base64 Encoding: " + Encoding.binToHex(base64InputBytes));
    
    var result = Duktape.enc('base64', base64InputBytes);
    log("Base64 String: " + result);
    // Replace '+' with '-' and '/' with '_' to make it URL-compatible
    var urlEncoded = result.replace(/\+/g, '-').replace(/\//g, '_');

    // Construct the final conference link
    var conferenceLink = 'https://' + domain + '/PBX0/APPS/' + obj.toLowerCase()+'/webaccess.htm?m=' + urlEncoded;
  
    return conferenceLink;
}
// helper functions
// convert decimal to Uint8Array of specific length with padding
function toUint8Array(decimal, arrayLength) {
    log("toUint8Array decimal "+decimal);
    var binaryString = decimal.toString(2);  // Convert decimal to binary string
    var binaryStringLength = binaryString.length;
    var paddingLength = 8 * arrayLength - binaryStringLength;

    // Pad binary string with leading zeroes if necessary
    if (paddingLength > 0) {
        binaryString = new Array(paddingLength + 1).join('0') + binaryString;
    }

    var uint8Array = new Uint8Array(arrayLength);

    for (var i = 0; i < arrayLength; i++) {
        uint8Array[i] = parseInt(binaryString.slice(i * 8, (i + 1) * 8), 2);
    }

    return uint8Array;
}

function mergeUint8Arrays(arrays) {
    var totalLength = arrays.reduce(function (acc, value) {
        return acc + value.length;
    }, 0);

    if (arrays.length === 0) return null;

    var result = new Uint8Array(totalLength);

    var length = 0;
    for (var i = 0; i < arrays.length; i++) {
        result.set(arrays[i], length);
        length += arrays[i].length;
    }

    return result;
}    
function convertDateTimeToTimestamp(dateTimeString) {
    var dateTimeParts = dateTimeString.split('T');
    var dateParts = dateTimeParts[0].split('-');
    var timeParts = dateTimeParts[1].split(':');
    
    var year = parseInt(dateParts[0]);
    var month = parseInt(dateParts[1]) - 1; // Month is zero-based in JavaScript
    var day = parseInt(dateParts[2]);
    var hours = parseInt(timeParts[0]);
    var minutes = parseInt(timeParts[1]);
    
    var timestamp = new Date(year, month, day, hours+3, minutes).getTime() / 1000; // Divide by 1000 to get the timestamp in seconds
    
    return timestamp;
  }
function selectUserConfigs(obj, callback){
    Database.exec("SELECT * FROM tbl_user_configs WHERE sip ='" + obj.sip + "';")
            .oncomplete(function (data) {
                log("selectUserConfigs result success = "+JSON.stringify(data))
                msg = { status: 201, msg: data };
                callback(null, msg);
            })
            .onerror(function (error, errorText, dbErrorCode) {
                msg = { status: 400, msg: "ERRO: " + errorText };
                callback(msg);
            });
}
function insertConferenceSchedule(obj, conferenceLink, callback){
    Database.insert("INSERT INTO tbl_schedules (sip, name, email, time_start, time_end, conf_link) VALUES ('" + obj.sip + "','" + obj.name + "','" + obj.email + "','" + obj.time_start + "','" + obj.time_end + "','" + conferenceLink + "')")
    .oncomplete(function (id) {
        msg = { status: 200, msg: "Evento agendado, Em breve você receberá um e-mail com o convite da conferência.\nNão esqueça de verificar sua caixa de SPAM!\nObrigado!",id:id };
        callback(null, msg);
    })
    .onerror(function (error, errorText, dbErrorCode) {
        msg = { status: 400, msg: "ERRO: " + errorText };
        callback(msg);
    });
}