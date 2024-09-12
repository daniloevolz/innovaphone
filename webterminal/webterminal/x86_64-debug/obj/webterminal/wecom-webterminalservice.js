
var socket;
var state = "initial";

new JsonApi("user").onconnected(function (conn) {
    if (conn.app == "wecom-webterminal") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "Connect") {
                // exemplo de uso:
                connect(obj.ip, parseInt(obj.port), function (error, response) {
                    if (error) {
                        error("erro:", error);
                        conn.send(JSON.stringify({ api: "user", mt: "error", msg: error, src: obj.src }));
                    } else {
                        log("resposta:", response);
                        conn.send(JSON.stringify({ api: "user", mt: "Message", msg: response, src: obj.src }));
                    }
                });
            }
            if (obj.mt == "SendMessage") {
                // Enviar uma mensagem
                send(socket, obj.ip, parseInt(obj.port), obj.msg, function (error, response) {
                    if (error) {
                        error("Erro:", error);
                    } else {
                        log("Resposta:", response);
                    }
                });
            }
            if (obj.mt == "Disconnect") {
                disconnect(socket, function (error, response) {
                    if (error) {
                        log("Erro:", error);
                        conn.send(JSON.stringify({ api: "user", mt: "Error", msg: error, src: obj.src }));
                    } else {
                        log("Resposta:", response);
                        conn.send(JSON.stringify({ api: "user", mt: "Message", msg: response, src: obj.src }));
                    }
                });

            }
        });
    }
});

// conectar ao IP e Porta SSH
function connect(ip, port, callback) {
    var customCertPemFile = '';
    Network.socketContext("tcp").setCertificate("client", customCertPemFile);
    Network.socket("tcp")
        .connect(ip, port)
        .onconnect(function (skt) {
            socket = skt;
            log("Conectado ao servidor " + ip + ":" + port);
            sendVersion();
            if (callback) callback(null, "Conectado ao servidor.");
        })
        .onclose(function (socket, error) {
            log("Desconectado do servidor.");
            if (callback) callback(null, "Desconectado do servidor.");
        })
        .recv(1024, true)
        .onrecv(function (socket, data) {
            socket.recv(1024, true);
            var message = hexToString(data);
            log("Recebido: " + message);

            if (state === "version_exchange") {
                processServerVersion(message);
            } else if (state === "key_exchange") {
                // Implementar troca de chaves
            } else if (state === "authentication") {
                // Implementar autenticação
            }
            if (callback) callback(null, hexToString(data));
        });
}

// desconectar do servidor
function disconnect(socket, callback) {
    if (socket) {
        socket.close();
        log("Solicitacao de desconexao enviada.");
        if (callback) callback(null, "Solicitacao de desconexao enviada.");
    } else {
        log("Nenhuma conexao ativa.");
        if (callback) callback("Nenhuma conexao ativa.", null);
    }
}

// enviar mensagem ao servidor SSH
function send(socket, ip, port, msg, callback) {
    if (socket) {
        var request = Encoding.stringToBin(msg)
        socket.send(request)
            .onsend(function (socket, data) {
                // data has been sent, ready to send the next chunk
            });
        log("Mensagem enviada: " + msg);
        if (callback) callback(null, "Mensagem enviada: " + msg);
    } else {
        log("Nenhuma conexao ativa para enviar a mensagem.");
        if (callback) callback("Nenhuma conexao ativa.", null);
    }
}

function stringToHex(str) {
    var hexObj = {};
    for (var i = 0; i < str.length; i++) {
        hexObj[i] = str.charCodeAt(i);
    }
    return hexObj;
}
function hexToString(hexObj) {
    var str = '';
    for (var key in hexObj) {
        if (hexObj.hasOwnProperty(key)) {
            str += String.fromCharCode(hexObj[key]);
        }
    }
    return str;
}


function sendVersion () {
    var version = "SSH-2.0-MySSHClient_1.0\r\n";
    send(socket, '', '', version)
    state = "version_exchange";
};

function processServerVersion(message) {
    if (message.startsWith("SSH-")) {
        log("Versão do servidor SSH: " + message.trim());
        state = "key_exchange";
        initiateKeyExchange();
    } else {
        log("Versão SSH inválida recebida.");
    }
};

function initiateKeyExchange() {
    // Iniciar o processo de troca de chaves (parcialmente implementado)
    // Você precisará gerar parâmetros Diffie-Hellman, enviar chaves públicas, etc.
    state = "authentication";
};

function authenticate(username, password) {
    // Implementar autenticação com base em senha ou chave pública
    state = "session";
};



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
            var events = JSON.parse(responseText).items;
            callback(null, events);
        }
    });
}

// Exemplo de uso:
var token = 'ya29.a0AcM612zoXFE-eLMIKcfEU-65Dqh601yJC5n-B7TC7WIQxK6cW0FP0WNWzO7PdSvcolGyRlBu9y8FW4EQB0rm67urUVBg-JQ0CwNEQdr3RHBpO5gDP2uWyUDyRfa4redwRWD4KmMkvu4auvNLyf9UCrt1bbkbYKRtYHyc2VyJaCgYKASQSARASFQHGX2MiKOxtWx5BnkBeqfLhhnhkyQ0175';  // Substitua pelo seu token OAuth

getTodayMeetings(token, function (err, meetings) {
    if (err) {
        log('Erro ao obter reunioes: ' + err.message);
    } else {
        log('Reuniões de hoje:');
        for (var i = 0; i < meetings.length; i++) {
            var meeting = meetings[i];
            log('Titulo: ' + meeting.summary);
            log('Inicio: ' + meeting.start.dateTime);
            log('Fim: ' + meeting.end.dateTime);
        }
    }
});

function httpClient(url, token, method,  callback) {
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




