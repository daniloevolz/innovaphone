
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
            if (obj.mt == "InsertToken") {
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






