//
new JsonApi("user").onconnected(function(conn) {
    if (conn.app == "wecom-testes_danilo") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "UserMessage") {

                //PbxSignal[0].send(JSON.stringify({ "api": "PbxSignal", "mt": "Signaling", "call": 1, "sig": { "type": "setup", "channel": 0, "cd": { "flags":"U", "sip": "danilo.volz" }, "fty": [{ "type": "im_setup" }] } }));

                
                conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", src: obj.src }));
            }
        });
    }
});

new JsonApi("admin").onconnected(function(conn) {
    if (conn.app == "wecom-testes_daniloadmin") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AdminMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: obj.src }));
            }
        });
    }
});



var PbxSignal = [];
var PbxSignalUsers = [];
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

    conn.onmessage(function (msg) {
        var obj = JSON.parse(msg);
        log("PbxSignal msg: " + msg);
        if (obj.mt === "Signaling" && obj.sig.type === "setup_ack") {
            var date = new Date();
            conn.send(JSON.stringify({
                "api": "PbxSignal",
                "mt": "Signaling",
                "call": 1,
                "sig": {
                    "type": "facility",
                    "cd": { "sip": "1dpherval" },
                    "fty": [{
                        "type": "im_message",
                        "subject": "TESTES",
                        "data": "Mensagem do servico de teste do Danilo",
                        "attach": "",
                        "time": date.getTime(),
                        "typing": false,
                        "mime": "text/html",
                        "more": false
                    }]
                }
            }));
        }
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

            //Teste Danilo 05/08: armazenar o conteudo call em nova lista
            var sip = obj.sig.cg.sip;
            var call = obj.call;
            var callData = { call, sip };
            //Adiciona o PBX2 no objeto caso ele nao exista
            if (!PbxSignalUsers[pbx]) {
                PbxSignalUsers[pbx] = [];
                PbxSignalUsers[pbx].push(callData);
            } else {
                PbxSignalUsers[pbx].push(callData);
            }
            //Teste Danilo 05/08: armazenar o conteudo call em nova lista

            log("PbxSignalUsers: after add new userclient " + JSON.stringify(PbxSignalUsers));
            var name = "";
            var myArray = obj.sig.fty;
            myArray.forEach(function (fty) {
                if (fty.name) {
                    name = fty.name;
                }
            })
            // send notification with badge count first time the user has connected
            log("PbxSignal:pbxTable=" + JSON.stringify(pbxTable));
            var user = pbxTableUsers.filter(function (item) {
                return item.columns.h323 === obj.sig.cg.sip;
            })[0];
            log("PbxSignal:connUser=" + JSON.stringify(user));
            //We can update the initial value, but we ignor it, wecall update every 20s...
            //updateBadge2(obj.sig.cg.sip, dataPosts.length)
        }

        // handle incoming call release messages
        if (obj.mt === "Signaling" && obj.sig.type === "rel") {
            //Remove signals
            //log("PBXSignal: connections before delete result " + JSON.stringify(PbxSignal));
            var src = obj.src;
            var myArray = src.split(",");
            var sip = "";
            var pbx = myArray[0];
            removeObjectByCall(PbxSignalUsers, pbx, obj.call);

            log("PBXSignalUsers: connections after delete result " + JSON.stringify(PbxSignalUsers));
        }
    });

    conn.onclose(function () {
        //Remove cennection from array
        PbxSignal = PbxSignal.filter(function (c) { return c.pbx != conn.pbx });
        log("PbxSignal: disconnected");
        //PbxSignal.splice(PbxSignal.indexOf(conn), 1);
        //connectionsPbxSignal.splice(connectionsPbxSignal.indexOf(conn), 1);
    });

    function removeObjectByCall(arr, pbx, callToRemove) {
        //console.log("removeObjectByCall+++++++++++++++++++++++++++++++" + JSON.stringify(arr[pbx].length));
        for (var i = 0; i < arr[pbx].length; i++) {
            var pbxEntry = arr[pbx];
            //console.log("arr[i][pbx]+++++++++++++++++++++++++++++++" + JSON.stringify(arr[pbx]));
            if (pbxEntry) {
                //console.log("pbxEntry+++++++++++++++++++++++++++++++" + JSON.stringify(pbxEntry.length));
                for (var j = 0; j < pbxEntry.length; j++) {
                    //console.log("pbxEntry[j].call+++++++++++++++++++++++++++++++" + pbxEntry[j].call);
                    if (pbxEntry[j].call == callToRemove) {
                        log("pbxEntry[j].call == callToRemove:" + pbxEntry[j].call + " == " + callToRemove);
                        pbxEntry.splice(j, 1);
                        break;
                    }
                }
            }
        }
    }
});

// Establish a TCP connection
Network.socket("tcp")
    .connect("10.10.20.41", 5060)
    .onconnect(function (socket) {
        log("danilo req: TCP Connection stabilished")
        // Send a request on a TCP connection
        // Send a request on a TCP connection
        var request = Encoding.stringToBin(
            "REGISTER sip:10.10.20.41:5060;transport=tcp SIP/2.0 \r\n" +
            "Via: SIP/2.0/TCP 10.10.20.42:5060;rport;branch=z9hG4bKPj807cd8b1-570e-476c-8905-519cdb1270f1 \r\n" +
            "Max-Forwards: 70\r\n" +
            "From: <sip:1006@10.10.20.41:5060>;tag=350a37e8-f98d-4917-b7ea-ae45bac919f6 \r\n" +
            "To: <sip:1006@10.10.20.41:5060> \r\n" +
            "Call-ID: 74a95846-c3af-4651-9cbb-1eca314a844f \r\n" +
            "CSeq: 5060 REGISTER \r\n" +
            "User-Agent: TESTE DO DANILO \r\n" +
            "Contact: <sip:1006@10.10.20.42:5060;transport=tcp> \r\n" +
            "Expires: 3600 \r\n" +
            "Allow: INVITE, ACK, BYE, CANCEL, UPDATE, PRACK, SUBSCRIBE, NOTIFY, REFER, OPTIONS \r\n" +
            "Content-Length:  0 \r\n" +
            "\r\n"
        );



        
        log("danilo req: TCP register request ", JSON.stringify(request))
        socket.send(request);
    });


//Network.server("tcp", null, 5060)
//    .onsocket(function (server, socket, addr, port) {
//        log("onsocket");
//        sipConnection(socket);
//    });

function sipConnection(socket) {
    socket.onconnect(function (socket) {
        log("onconnect");
        socket.recv(1000, true);
    })
        .onrecv(function (socket, data) {
            log("onrecv");
            processMessage(parseMessage(data), socket);
            socket.recv(1000, true);
        })
        .onsend(function (socket) {
            //if (closed) socket.close();
        });
}

function processMessage(msg, socket) {
    log(JSON.stringify(msg, null, 4));

    var reply = undefined;

    if (msg.register && msg.authorization === false) {
        reply = "SIP/2.0 401 Unauthorized\r\n";
        ["Via", "From", "To", "Call-ID", "CSeq"].forEach(function (v) {
            reply = reply + getHeader(msg, v) + "\r\n";
        });
        reply = reply + "WWW-Authenticate: Digest algorithm=MD5, realm=\"example.com\", nonce=\"343eb793\"" + "\r\n";
        reply = reply + "User-Agent: Wecom\r\n";
        reply = reply + "\r\n";
    } else if (msg.register && msg.authorization === true) {
        reply = "SIP/2.0 200 OK\r\n";
        ["Via", "From", "To", "Call-ID", "CSeq", "Contact"].forEach(function (v) {
            reply = reply + getHeader(msg, v) + "\r\n";
        });
        reply = reply + "User-Agent: Wecom\r\n";
        reply = reply + "\r\n";
    }

    if (reply !== undefined) socket.send(Encoding.stringToBin(reply));
}

function getHeader(msg, name) {
    var header = null;
    msg.sip.headers.forEach(function (v) {
        if (v.startsWith(name)) header = v;
    });
    return header;
}

function parseMessage(data) {
    var msg = {};
    msg.raw = Encoding.binToString(data);
    msg.lines = [];
    msg.offset = 0;

    var end = false;
    while (!end) {
        var parseResult = parseLine(msg);
        end = parseResult.end;
    }

    log(JSON.stringify(msg));
    log("msg.sip.request" + JSON.stringify(msg.sip.request));
    msg.register = msg.sip.request.match(/^REGISTER/) === null ? false : true;
    msg.authorization = getHeader(msg, "Authorization") === null ? false : true;

    return msg;
}

function parseLine(msg) {
    parsed = {};
    parsed.end = false;

    var prev = msg.offset;
    var next = msg.raw.indexOf("\r\n", prev);
    msg.offset = next + 2;
    var line = msg.raw.substring(prev, next);
    msg.lines.push(line);

    msg.sip = msg.sip || {};
    if (isRequest(line)) msg.sip.request = line;
    msg.sip.headers = msg.sip.headers || [];
    if (isHeader(line)) msg.sip.headers.push(line);

    if (prev >= next) parsed.end = true;
    return parsed;
}

function isRequest(line) {
    var re = /^(?:OPTIONS|INVITE|ACK|BYE|CANCEL|REGISTER|SUBSCRIBE|NOTIFY|PUBLISH|INFO|REFER|MESSAGE)\s\S+\sSIP\/2\.0$/;
    return line.match(re) === null ? false : true;
}

function isHeader(line) {
    var re = /^[A-Za-z\-]+:\s.*$/; // eslint-disable-line
    return line.match(re) === null ? false : true;
}


