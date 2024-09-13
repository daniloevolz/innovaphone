
var clientId = Config.client_id;
var redirectUrl;
var clientSecret = Config.client_secret;
var baseUrl;
var connectionList = [];

var PbxSignal = [];
var PbxSignalUsers = [];
var pbxTable = [];
var pbxTableUsers = [];
var pbxApi = {}
var presences = [];
var in_meeting_now = [];
var status = false;

Config.onchanged(function () {
    clientId = Config.client_id;
    clientSecret = Config.client_secret;
});

new JsonApi("user").onconnected(function (conn) {
    if (conn.app == "wecom-gcallendar") {
        
        connectionList.push(conn);
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "UserMessage") {
                Database.exec("SELECT * FROM tbl_tokens WHERE guid ='" + conn.guid + "';")
                    .oncomplete(function (data) {
                        log("result=" + JSON.stringify(data, null, 4));
                        log("danilo req result conn=" + JSON.stringify(conn, null, 4));
                        var info = JSON.parse(conn.info)
                        redirectUrl = removeLastPartOfUrl(info.appurl) + "/newToken";
                        startRenewTokens()
                        conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", token: JSON.stringify(data, null, 4), client_id: clientId, javascript_origins: redirectUrl, guid: conn.guid, src: obj.src }));

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                    });
            }
            if (obj.mt == "UserDisconnect") {
                Database.exec("DELETE FROM tbl_tokens WHERE guid = '" + conn.guid + "';")
                    .oncomplete(function (data) {
                        conn.send(JSON.stringify({ api: "user", mt: "UserDisconnectResult", src: obj.src }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        log("UserDisconnect:result=Error " + String(errorText));
                        conn.send(JSON.stringify({ api: "user", mt: "Error", message: errorText }));
                    });
            }
        });
        conn.onclose(function () {
            log("user: disconnected");
            connectionList.splice(connectionList.indexOf(conn), 1);
        });
    }
});

new JsonApi("admin").onconnected(function(conn) {
    if (conn.app == "wecom-gcallendaradmin") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AdminMessage") {
                var info = JSON.parse(conn.info)
                redirectUrl = removeLastPartOfUrl(info.appurl) + "/newToken";
                startRenewTokens()
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", client_id: clientId, javascript_origins: redirectUrl, client_secret: clientSecret, src: obj.src }));
            }
            if (obj.mt == "UpdateClientId") {
                Config.client_id = obj.client_id;
                Config.save();
                var client_id = Config.client_id;
                conn.send(JSON.stringify({ api: "admin", mt: "UpdateClientIdResult", src: client_id }));
            }
            if (obj.mt == "UpdateClientSecret") {
                Config.client_secret = obj.client_secret;
                Config.save();
                clientSecret = Config.client_secret;
                conn.send(JSON.stringify({ api: "admin", mt: "UpdateClientSecretResult", src: clientSecret }));
            }
        });
    }
});


//#region PBX APIS
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
        //log("PbxTableUsers: msg received " + msg);

        if (obj.mt == "ReplicateStartResult") {
            pbxTableUsers = [];
            conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateNext", "src": conn.pbx }));
        }
        if (obj.mt == "ReplicateNextResult" && obj.columns) {
            pbxTableUsers.push(obj)

            subscribePresence(obj)

            conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateNext", "src": conn.pbx }));
        }

        if (obj.mt == "ReplicateAdd") {
            pbxTableUsers.push(obj);
            subscribePresence(obj)
        }
        if (obj.mt == "ReplicateUpdate") {
            var found = false;
            pbxTableUsers.forEach(function (user) {
                if (user.columns.guid == obj.columns.guid) {
                    //log("ReplicateUpdate: Updating the object for user " + obj.columns.h323)
                    Object.assign(user, obj)
                    found = true;
                }
            })
            if (found == false) {
                //log("ReplicateUpdate: Adding the object user " + obj.columns.h323 + " because it not exists here before");
                pbxTableUsers.push(obj);
                subscribePresence(obj)
            }

        }

        if (obj.mt == "ReplicateDel") {
            pbxTableUsers.splice(pbxTableUsers.indexOf(obj), 1);
            unsubscribePresence(obj)
        }
    });

    conn.onclose(function () {
        log("PbxTableUsers: disconnected");
        pbxTable.splice(pbxTable.indexOf(conn), 1);
    });
});


new PbxApi("PbxApi").onconnected(function (conn) {
    log("PbxApi conectada", conn)
    pbxApi = conn
    conn.onmessage(function (msg) {
        var obj = JSON.parse(msg);
        log("PbxApi msg: " + msg);
        if (obj.mt == "PresenceUpdate") {
            //httpClient("https://" + url + "/api/innovaphone/presence", "POST", obj)

            var index = -1;

            for (var i = 0; i < presences.length; i++) {
                if (presences[i].src == obj.src) {
                    index = i;
                    break;
                }
            }

            if (index != -1) {
                // Atualize o objeto existente na posicao 'index'
                presences[index] = obj;
            } else {
                // Adicione o novo objeto ao array
                presences.push(obj);
            }
        }
    })

    conn.onclose(function () {
        pbxApi = {}
        log("PbxApi: disconnected");
    });
});

function subscribePresence(obj) {
    pbxApi.send(JSON.stringify({
        "api": "PbxApi",
        "mt": "SubscribePresence",
        "sip": obj.columns.h323,
        "src": obj.columns.guid
    }));
}

function unsubscribePresence(obj) {
    pbxApi.send(JSON.stringify({
        "api": "PbxApi",
        "mt": "UnsubscribePresence",
        "sip": obj.columns.h323,
        "src": obj.columns.guid
    }));
}

function handleSetPresenceMessage(sip, note, activity) {
    log("handle LOG - SET PRESENCE MSG:", sip, note)
    // Enviar a mensagem para a conexao PbxApi
    pbxApi.send(JSON.stringify({
        "api": "PbxApi",
        "mt": "SetPresence",
        "sip": sip,
        "activity": activity,
        "note": note
    }));

}

//#endregion

// Funcao para obter as reunioes do dia atual
function getTodayMeetings(token, callback) {
    // Obter a data de hoje no formato correto para a API
    var now = new Date();
    var todayStart = now.toISOString().split('T')[0] + 'T00:00:00Z';  // Inicio do dia em UTC
    var todayEnd = now.toISOString().split('T')[0] + 'T23:59:59Z';    // Fim do dia em UTC

    // URL da API do Google Calendar para eventos de um intervalo de tempo
    var calendarId = 'primary';  // Use 'primary' para o calendario principal
    var url = 'https://www.googleapis.com/calendar/v3/calendars/' + calendarId + '/events?' +
        'timeMin=' + encodeURIComponent(todayStart) +
        '&timeMax=' + encodeURIComponent(todayEnd) +
        '&orderBy=startTime&singleEvents=true';

    // Fazer a requisicao
    httpClient(url, token, "GET", function (err, responseText) {
        if (err) {
            callback(err);
        } else {
            var events = JSON.parse(responseText);
            callback(null, events.items);
        }
    });
}



function httpClient(url, token, method, callback) {
    log("danilo-req : httpClient token " + JSON.stringify(token));
    var responseData = "";
    log("danilo-req : httpClient url " + url);
    HttpClient.request(method, url)
        .header("Authorization", 'Bearer ' + token)
        .onrecv(function (req, data, last) {
            log("danilo-req : httpClient HttpRequest onrecv " + JSON.stringify(req));
            responseData += new TextDecoder("utf-8").decode(data);
            if (!last) req.recv();
        }, 1024)
        .oncomplete(function (req, success) {
            log(success ? url + " httpClient OK" : url + " httpClient ERROR");
            if (success) {
                log("danilo-req : httpClient HttpRequest complete ");
                if (callback) {
                    callback(null, responseData);
                }
            } else {
                if (callback) {
                    callback(responseData, null);
                }
            }
        })
        .onerror(function (error) {
            log("danilo-req : httpClient HttpRequest error=" + error);
            if (callback) {
                callback(error, null);
            }
        });
}

function getAccessToken(url, body, method, callback) {
    log("danilo-req : httpClient body " + JSON.stringify(body));
    var responseData = "";
    log("danilo-req : httpClient url " + url);
    HttpClient.request(method, url)
        .contentType("application/x-www-form-urlencoded")
        .onsend(function (req) {
            req.send(new TextEncoder("utf-8").encode(body), true);
        })
        .onrecv(function (req, data, last) {
            log("danilo-req : httpClient HttpRequest onrecv " + JSON.stringify(req));
            responseData += new TextDecoder("utf-8").decode(data);
            if (!last) req.recv();
        }, 1024)
        .oncomplete(function (req, success) {
            log(success ? url + " httpClient OK" : url + " httpClient ERROR");
            if (success) {
                log("danilo-req : httpClient HttpRequest complete " + JSON.stringify(req));
                log("danilo-req : httpClient HttpRequest responseData " + responseData);
                if (callback) {
                    callback(null, responseData);
                }
            } else {
                if (callback) {
                    callback(responseData, null);
                }
            }
        })
        .onerror(function (error) {
            log("danilo-req : httpClient HttpRequest error=" + error);
            if (callback) {
                callback(error, null);
            }
        });
}

//WebServers
WebServer.onurlchanged(function (newUrl) {
    baseUrl = newUrl;
    log("danilo req urlchaged: " + baseUrl);
});
WebServer.onrequest("newToken", function (req) {
    if (req.method == "GET") {
        // Extrair a URL completa
        var fullUrl = req.relativeUri;
        log('newToken relativeUri===='+fullUrl)
        // Funcao para extrair o valor de um parametro especifico da URL
        function getQueryParam(url, param) {
            var queryString = url.split('?')[1]; // Pega a parte depois do '?'
            if (!queryString) return null; // Se nao houver parametros, retorna null

            var queryParams = queryString.split('&'); // Divide os parametros
            for (var i = 0; i < queryParams.length; i++) {
                var pair = queryParams[i].split('=');
                if (pair[0] === param) {
                    return decodeURIComponent(pair[1]); // Retorna o valor do parametro
                }
            }
            return null; // Se o parametro nao for encontrado, retorna null
        }

        // Obter o valor do parametro 'code'
        var codeValue = getQueryParam(fullUrl, "code");
        log('newToken codeValue====' + codeValue)
        // Obter o valor do parametro 'guid'
        var guidValue = getQueryParam(fullUrl, "state");
        log('newToken guidValue====' + guidValue)
        // Verificar se o valor do 'code' foi encontrado
        if (codeValue && guidValue) {
            var responseMessage;
            var body = "code=" + encodeURIComponent(codeValue) +
                "&client_id=" + encodeURIComponent(clientId) +
                "&client_secret=" + encodeURIComponent(clientSecret) +
                "&redirect_uri=" + encodeURIComponent(redirectUrl) +
                "&grant_type=" + encodeURIComponent('authorization_code');

            newToken(guidValue, body, function (err, token) {
                if (err) {

                    responseMessage = 'Error:'+err;
                    req.responseContentType("txt")
                        .sendResponse()
                        .onsend(function (req) {
                            req.send(new TextEncoder("utf-8").encode(responseMessage), true);
                        });
                    return;

                } else if (token) {
                    log('newToken added, will notify user and response OK to Google page.');
                    connectionList.forEach(function (c) {
                        if (c.guid == guidValue) {
                            c.send(JSON.stringify({ api: "user", mt: "UserMessageResult", token: JSON.stringify(token), client_id: clientId, javascript_origins: redirectUrl, guid: c.guid }));
                        }
                    })
                    responseMessage = 'You could close this window!';
                    req.responseContentType("txt")
                        .sendResponse()
                        .onsend(function (req) {
                            req.send(new TextEncoder("utf-8").encode(responseMessage), true);
                        });
                    return;
                }
            })    
        } else {
            // Se nao encontrou o 'code', retorna um 404
            req.cancel();
        }
    }
});

var i = Timers.setInterval(function () {
    var now = new Date();
    log("INTERVAL::getDateNow", now)

    getTokensFromTable(function (err, data) {
        if (err) {
            log('INTERVAL:Erro ao obter tokens from db: ' + err);
        } else {
            log('INTERVAL:tokens from DB:'+JSON.stringify(data));
            if (data.length > 0) {
                data.forEach(function (item) {
                    log("INTERVAL:item: ", JSON.stringify(item))

                    getTodayMeetings(item.token, function (err, meetings) {
                        if (err) {
                            log('INTERVAL:Erro ao obter reunioes: ' + err.message);
                        } else {
                            log('INTERVAL:Reunioes de hoje:');
                            var isUserInMeeting = false;
                            for (var i = 0; i < meetings.length; i++) {
                                var meeting = meetings[i];
                                log('INTERVAL:===========MEETING============Titulo: ' + meeting.summary);
                                
                                var startDateTime = new Date(meeting.start.dateTime);
                                var endDateTime = new Date(meeting.end.dateTime);
                                log('INTERVAL:Inicio: ' + startDateTime);
                                log('INTERVAL:Fim: ' + endDateTime);
                                log('INTERVAL:pbxTableUsers:total ' + pbxTableUsers.length);
                                var user = pbxTableUsers.filter(function (u) { return u.columns.guid == item.guid })[0]
                                log('INTERVAL: user: ' + JSON.stringify(user.columns.cn));
                                // Obter a data e hora atuais
                                var currentDateTime = new Date();
                                log('INTERVAL: Current Date: ' + currentDateTime);

                                if (currentDateTime >= startDateTime && currentDateTime <= endDateTime) {
                                    log('INTERVAL: A data atual esta dentro do intervalo da reuniao: ' + meeting.summary);

                                    var is_in_meeting = in_meeting_now.filter(function (m) { return m.guid == item.guid })[0]
                                    if (user) {
                                        if (!is_in_meeting) {
                                            log('INTERVAL: user: is_not_in_meeting');
                                            var originalPresence = presences.filter(function (p) { return p.src == user.columns.guid; })[0];
                                            log('INTERVAL: user: originalPresence ' + JSON.stringify(originalPresence));
                                            if (originalPresence) {
                                                in_meeting_now.push({ guid: item.guid, originalPresence: originalPresence, meeting: meeting.summary });
                                                log('INTERVAL: user: handleSetPresenceMessage ' + JSON.stringify(meeting.summary));
                                                handleSetPresenceMessage(user.columns.h323, 'GMEET: ' + meeting.summary, 'dnd')

                                            }
                                        }
                                        else {
                                            log('INTERVAL: user: is_in_meeting now');
                                            if (is_in_meeting.meeting != meeting.summary) {
                                                log('INTERVAL: user: is_in_meeting now but with diferent meeting summary');
                                                log('INTERVAL: user: handleSetPresenceMessage ' + JSON.stringify(meeting.summary));
                                                in_meeting_now.forEach(function (m) {
                                                    if (m.guid == item.guid) {
                                                        m.meeting = meeting.summary
                                                    }
                                                })
                                                handleSetPresenceMessage(user.columns.h323, 'GMEET: ' + meeting.summary, 'dnd')
                                            }

                                        }
                                    }
                                    isUserInMeeting = true;
                                    log('INTERVAL: users: in_meeting_now ' + JSON.stringify(in_meeting_now));
                                    break;
                                } 
                            }
                            if (!isUserInMeeting) {

                                log('INTERVAL:A data atual esta fora do periodo de reunioes');
                                var endedMeetingUser = in_meeting_now.filter(function (m) { return m.guid == item.guid })[0];
                                if (endedMeetingUser) {
                                    log('INTERVAL: endedMeetingUser restaurando presenca do usuario: ' + item.guid);

                                    // Restaurar a presenca original
                                    var originalPresence = endedMeetingUser.originalPresence;
                                    if (originalPresence) {
                                        var note = '';
                                        if (originalPresence.presence[0].note) {
                                            note = originalPresence.presence[0].note;
                                        }
                                        var activity = 'online';
                                        if (originalPresence.presence[0].activity) {
                                            activity = originalPresence.presence[0].activity
                                        }
                                        log('INTERVAL: endedMeetingUser restaurando presenca do usuario para originalPresence: ' + JSON.stringify(originalPresence));
                                        handleSetPresenceMessage(user.columns.h323, note, activity);
                                    } else {
                                        log('INTERVAL: endedMeetingUser nao tem originalPresence: ' + JSON.stringify(originalPresence));
                                    }

                                    log('INTERVAL:Remover o usuario da lista de reuniao em andamento')
                                    in_meeting_now = in_meeting_now.filter(function (m) { return m.guid != item.guid });
                                } else {
                                    log('INTERVAL: NOT endedMeetingUser usuario: ' + item.guid);
                                }

                            }
                        }
                    });
                })

            }
        }
    });

}, 60000);

//obtem a lista de GUIDs e Tokens autorizados do banco de dados
function getTokensFromTable(callback) {
    Database.exec("SELECT * FROM tbl_tokens")
        .oncomplete(function (data) {
            log("result=" + JSON.stringify(data, null, 4));
            callback(null, data);

        })
        .onerror(function (error, errorText, dbErrorCode) {
            callback(String(errorText),null);
        });
}
var timers = [];
//Insere o token do db
function updateTokenIntoTable(guid, token, callback) {
    //delete this token from db to allow new authorization
    Database.exec("UPDATE tbl_tokens SET token ='" + token + "' WHERE guid = '" + guid + "'")
        .oncomplete(function (data) {
            
            Database.exec("SELECT * FROM tbl_tokens where guid = '" + guid + "';")
                .oncomplete(function (data) {
                    log("updateTokenIntoTable: result=" + JSON.stringify(data, null, 4));
                    callback(null, data);

                })
                .onerror(function (error, errorText, dbErrorCode) {
                    log("updateTokenIntoTable:Error:DB result=Error " + String(errorText));
                    callback(String(errorText), null);
                });
            
        })
        .onerror(function (error, errorText, dbErrorCode) {
            log("updateTokenIntoTable:Error:DB result=Error " + String(errorText));
            callback(String(errorText), null)
        });
    
}
function insertTokenAndRefreshTokenIntoTable(guid, token, refresh_token, callback) {
    //delete this token from db to allow new authorization
    Database.exec("DELETE FROM tbl_tokens WHERE guid = '" + guid + "';")
        .oncomplete(function (data) {
            Database.insert("INSERT INTO tbl_tokens (guid, token, refresh_token) VALUES ('" + guid + "','" + token + "','" + refresh_token + "')")
                .oncomplete(function () {
                    Database.exec("SELECT * FROM tbl_tokens where guid = '" + guid + "';")
                        .oncomplete(function (data) {
                            log("insertTokenIntoTable: result=" + JSON.stringify(data, null, 4));
                            callback(null, data);

                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            log("insertTokenIntoTable:Error:DB result=Error " + String(errorText));
                            callback(String(errorText), null);
                        });
                })
                .onerror(function (error, errorText, dbErrorCode) {
                    log("insertTokenIntoTable:Error:DB result=Error " + String(errorText));
                    callback(String(errorText), null)
                });

        })
        .onerror(function (error, errorText, dbErrorCode) {
            log("insertTokenIntoTable:Error:DB result=Error " + String(errorText));
            callback(String(errorText), null)
        });

}
function removeLastPartOfUrl(url) {

    var lastSlashIndex = url.lastIndexOf("/");


    if (lastSlashIndex !== -1) {
        return url.substring(0, lastSlashIndex);
    }

 
    return url;
}


//#region RENOVACAO DE TOKEN
function startTokenRenewalTimer(guid, expiresIn) {
    // Calcular o tempo para renovacao (10 segundos antes de expirar)
    var renewalTime = (expiresIn - 1000) * 1000;
    log("startTokenRenewalTimer:renewalTime? " + renewalTime)
    log("startTokenRenewalTimer:timers? " + JSON.stringify(timers))
    // Verificar se ja existe um timer para esse 'guid'
    var existingTimer = timers.filter(function (timerObj) {
        return timerObj.guid === guid;
    })[0];
    log("startTokenRenewalTimer:existingTimer? " + JSON.stringify(existingTimer))


    // Se existir um timer, limpar o timer anterior
    if (existingTimer) {
        Timers.clearTimeout(existingTimer.timer);
        log("startTokenRenewalTimer:Timer anterior para o guid " + guid + " foi limpo.");
    } else {
        // Se nao existir, criar um novo timer para esse 'guid'
        log("startTokenRenewalTimer:Timer nao existe para o guid")
        existingTimer = { guid: guid };
        timers.push(existingTimer);
    }

    // Criar o novo timer e armazena-lo
    existingTimer.timer = Timers.setTimeout(function () {

        Database.exec("SELECT * FROM tbl_tokens WHERE guid ='" + guid + "';")
            .oncomplete(function (data) {
                log("INTERVAL:startTokenRenewalTimer:existingTimer: result=" + JSON.stringify(data, null, 4));
                var body = "refresh_token=" + encodeURIComponent(data[0].refresh_token) +
                    "&client_id=" + encodeURIComponent(clientId) +
                    "&client_secret=" + encodeURIComponent(clientSecret) +
                    "&redirect_uri=" + encodeURIComponent(redirectUrl) +
                    "&grant_type=" + encodeURIComponent('refresh_token');
                renewToken(guid, body);  // Chama a func renew do token para este 'guid'
            })
            .onerror(function (error, errorText, dbErrorCode) {
                log("INTERVAL:startTokenRenewalTimer:existingTimer: error DB query token =" + JSON.stringify(errorText, null, 4));
            });
        
    }, parseInt(renewalTime));

    log("startTokenRenewalTimer:Timer de renovacao iniciado para " + guid + " por " + String(parseInt(renewalTime) / 1000) + " segundos.");
}

function renewToken(guid, body, callback) {
    log("renewToken:Renovando token para o guid " + guid + "...");


    getAccessToken('https://oauth2.googleapis.com/token', body, 'POST', function (err, data) {
        if (err) {

            //delete this token from db to allow new authorization
            Database.exec("DELETE FROM tbl_tokens WHERE guid = '" + guid + "';")
                .oncomplete(function (data) {
                    connectionList.forEach(function (c) {
                        if (c.guid == guid) {
                            c.send(JSON.stringify({ api: "user", mt: "UserDisconnectResult" }));
                        }
                    })
                })
                .onerror(function (error, errorText, dbErrorCode) {
                    log("renewToken:getAccessToken:Error:DB result=Error " + String(errorText));
                });

            if (callback) {
                callback(err, null)
            }
        } else if (data) {
            var obj = JSON.parse(data)
            log('renewToken:getAccessToken: data ' + JSON.stringify(data));
            updateTokenIntoTable(guid, obj.access_token, function (err, token) {
                if (err) {

                    if (callback) {
                        callback(err, null)
                    }
                } else if (token) {
                    //cria rotina de renovacao
                    log('renewToken:getAccessToken:insertTokenIntoTable: success, now will startTokenRenewallTimer for ' + guid + ' and expires_in ' + obj.expires_in)
                    startTokenRenewalTimer(guid, parseInt(obj.expires_in));

                    if (callback) {
                        callback(null,token)

                    }
                    
                }
            })

        }


    })
}

function newToken(guid, body, callback) {
    log("renewToken:Renovando token para o guid " + guid + "...");


    getAccessToken('https://oauth2.googleapis.com/token', body, 'POST', function (err, data) {
        if (err) {

            //delete this token from db to allow new authorization
            Database.exec("DELETE FROM tbl_tokens WHERE guid = '" + guid + "';")
                .oncomplete(function (data) {
                    connectionList.forEach(function (c) {
                        if (c.guid == guid) {
                            c.send(JSON.stringify({ api: "user", mt: "UserDisconnectResult" }));
                        }
                    })
                })
                .onerror(function (error, errorText, dbErrorCode) {
                    log("renewToken:getAccessToken:Error:DB result=Error " + String(errorText));
                });

            if (callback) {
                callback(err, null)
            }
        } else if (data) {
            var obj = JSON.parse(data)
            log('renewToken:getAccessToken: data ' + JSON.stringify(data));
            insertTokenAndRefreshTokenIntoTable(guid, obj.access_token, obj.refresh_token, function (err, token) {
                if (err) {

                    if (callback) {
                        callback(err, null)
                    }
                } else if (token) {
                    //cria rotina de renovacao
                    log('renewToken:getAccessToken:insertTokenIntoTable: success, now will startTokenRenewallTimer for ' + guid + ' and expires_in ' + obj.expires_in)
                    startTokenRenewalTimer(guid, parseInt(obj.expires_in));

                    if (callback) {
                        callback(null, token)

                    }

                }
            })

        }


    })
}

//app started renew all tokens
function startRenewTokens() {
    if (status == false) {
        status = true;
        getTokensFromTable(function (err, oldTokens) {
            if (err) {
                log("START:getTokensFromTable:error: ", JSON.stringify(err))

            } else if (oldTokens) {
                oldTokens.forEach(function (item) {
                    log("START:getTokensFromTable:item to renew Token: ", JSON.stringify(item))
                    var body = "refresh_token=" + encodeURIComponent(item.refresh_token) +
                        "&client_id=" + encodeURIComponent(clientId) +
                        "&client_secret=" + encodeURIComponent(clientSecret) +
                        "&redirect_uri=" + encodeURIComponent(redirectUrl) +
                        "&grant_type=" + encodeURIComponent('refresh_token');
                    renewToken(item.guid, body)
                })

            }

        })
    }
}

//#endregion

