var licenseAppToken = Config.licenseAppToken;
if (licenseAppToken == "") {
    var rand = Random.bytes(16);
    Config.licenseAppToken = String(rand);
    Config.save();
}
var license = getLicense();

var pbxTable = [];
var pbxTableUsers = [];

//FUNCOES DO CLIENTE
new JsonApi("user").onconnected(function (conn) {
    if (conn.app == "wecom-flowe") {
        conn.onmessage(function (msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "UserMessage") {
                //licenseAppToken = Config.licenseAppToken;
                //var licenseAppFile = Config.licenseAppFile;
                //var lic = decrypt(licenseAppToken, licenseAppFile)
                var lic = getLicense()
                if (lic != undefined) {
                    var licObj = JSON.parse(lic)
                    lic = licObj.xmls;
                }
                conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", xmls: lic, src: obj.src }));
            }
            if (obj.mt == "VmObjects") {
                conn.send(JSON.stringify({ api: "user", mt: "VmObjectsResult", result: pbxTableUsers, src: obj.src }));
            }
            if (obj.mt == "SetVmObjectUrl") {
                var result = updatePseudoByGuid(obj.guid, obj.url)
                conn.send(JSON.stringify({ api: "user", mt: "SetVmObjectUrlResult", result: result, src: obj.src }));
            }
            if (obj.mt == "DeleteVmObject") {
                var result = deleteObjectByGuid(obj.guid)
                conn.send(JSON.stringify({ api: "user", mt: "DeleteVmObjectResult", result: result, src: obj.src }));
            }
            // license 
            if (obj.mt == "ConfigLicense") {
                licenseAppToken = Config.licenseAppToken;
                licenseInstallDate = Config.licenseInstallDate;
                licenseAppFile = Config.licenseAppFile;
                var lic = decrypt(licenseAppToken, licenseAppFile)
                conn.send(JSON.stringify({
                    api: "user",
                    mt: "LicenseMessageResult",
                    licenseUsed: "",
                    licenseToken: licenseAppToken,
                    licenseFile: licenseAppFile,
                    licenseActive: JSON.stringify(lic),
                    licenseInstallDate: licenseInstallDate,
                    src: obj.src
                }));
            }
            if (obj.mt == "UpdateConfigLicenseMessage") {
                try {
                    var lic = decrypt(obj.licenseToken, obj.licenseFile)
                    log("UpdateConfigLicenseMessage: License decrypted: " + JSON.stringify(lic));
                    Config.licenseAppFile = obj.licenseFile;
                    Config.licenseInstallDate = getDateNow();
                    Config.save();
                    conn.send(JSON.stringify({ api: "user", mt: "UpdateConfigLicenseMessageSuccess", src: obj.src }));

                } catch (e) {
                    conn.send(JSON.stringify({ api: "user", mt: "UpdateConfigMessageErro", result: e}));
                    log("ERRO UpdateConfigLicenseMessage:" + e);


                }
            }

        });
    }
});


//PBX APIS
new PbxApi("PbxTableUsers").onconnected(function (conn) {
    //pbxTable.push(conn);
    log("PbxTableUsers: connected " + JSON.stringify(conn));

    // for each PBX API connection an own call array is maintained
    var signalFound = pbxTable.filter(function (pbx) { return pbx.pbx === conn.pbx });
    if (pbxTable.length == 0) {
        pbxTable.push(conn);
        // register to the PBX in order to acceppt incoming presence calls
        conn.send(JSON.stringify({
            "api": "PbxTableUsers",
            "mt": "ReplicateStart",
            "add": true,
            "del": true,
            "columns": {
                "cn": {
                    "update": true
                },
                "guid": {},
                "h323": {
                    "update": true
                },
                "e164": {
                    "update": true
                },
                "pseudo": {
                    "update": true
                }
            },
            "pseudo": [
                "vm"
            ],
            "src": conn.pbx
        }));

    }
    conn.onmessage(function (msg) {
        var obj = JSON.parse(msg);
        log("PbxTableUsers: msg received " + msg);

        if (obj.mt == "ReplicateStartResult") {
            pbxTableUsers = [];
            conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateNext", "src": conn.pbx }));
        }
        if (obj.mt == "ReplicateNextResult" && obj.columns) {
            pbxTableUsers.push(obj)
            conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateNext", "src": conn.pbx }));
        }

        if (obj.mt == "ReplicateAdd") {
            pbxTableUsers.push(obj);
        }
        if (obj.mt == "ReplicateUpdate") {
            var foundTableUser = pbxTableUsers.filter(function (pbx) { return pbx.columns.guid === obj.columns.guid });
            log("ReplicateUpdate= foundTableUser " + JSON.stringify(foundTableUser));
            var found = false;
            pbxTableUsers.forEach(function (user) {
                if (user.columns.guid == obj.columns.guid) {
                    log("ReplicateUpdate: Updating the object for user " + obj.columns.h323)
                    Object.assign(user, obj)
                    found = true;
                }
            })
            if (found == false) {
                log("ReplicateUpdate: Adding the object user " + obj.columns.h323 + " because it not exists here before");
                pbxTableUsers.push(obj);
            }

        }

        if (obj.mt == "ReplicateDel") {
            pbxTableUsers.splice(pbxTableUsers.indexOf(obj), 1);
        }
    });

    conn.onclose(function () {
        log("PbxTableUsers: disconnected");
        pbxTable.splice(pbxTable.indexOf(conn), 1);
    });
});


//FUNCOES DO SERVIcO
function updatePseudoByGuid(guid, url) {
    pbxTableUsers.forEach(function (item) {
        if (item.columns && item.columns.guid === guid) {
            //Atualiza o valor de pseudo
            item.columns.pseudo = "<pseudo type=\"vm\"><script url=\"" + url + "\"/></pseudo>";

            // Envia a atualizaao para o PBX
            if (pbxTable.length > 0) {
                item.mt = "ReplicateUpdate";
                log("danilo-req updatePseudoByGuid: found PBX connection to update vm " + JSON.stringify(item));
                pbxTable[0].send(JSON.stringify(item));
                // Retorna a Lista para "NextResult" como inicialmente recebido do PBX
                item.mt = "ReplicateNextResult";
                return true;
            } else {
                log("danilo-req updatePseudoByGuid: PBX connection length is 0 ");
                return false;
            }
        }
    });

}
function deleteObjectByGuid(guid) {
    pbxTableUsers.forEach(function (item) {
        if (item.columns && item.columns.guid === guid) {

            // Envia a atualizaao para o PBX
            if (pbxTable.length > 0) {
                item.mt = "ReplicateDel";
                log("danilo-req deleteObjectByGuid: found PBX connection to delete vm " + JSON.stringify(item));
                pbxTable[0].send(JSON.stringify(item));
                // Retorna a Lista para "NextResult" como inicialmente recebido do PBX
                item.mt = "ReplicateNextResult";
                pbxTableUsers.splice(pbxTableUsers.indexOf(item), 1);
                return true;
            } else {
                log("danilo-req updatePseudoByGuid: PBX connection length is 0 ");
                return false;
            }
        }
    });

}
//#region License Functions
//Return license decrypted from Config
function getLicense() {
    var key = Config.licenseAppToken;
    log('danilo-req: key '+key)
    var hash = Config.licenseAppFile;
    log('danilo-req: hash ' + hash)
    var lic;
    if (key != "" && hash != "") {
        lic = decrypt(key, hash);
    }
    return lic;
}
//Decrypt license
function decrypt(key, hash) {
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
    return date.toISOString() //dateString.slice(0, -5);
}
//#endregion



//#region inicio db files
WebServer.onrequest("files", function (req) {
    log("request URI=" + req.relativeUri);
    if (req.method === "GET") {
        var fileId = null;
        if (req.relativeUri) fileId = fileIdFromUri(req.relativeUri);
        getFileMetaData(req, fileId, streamFileData);
    }
    else {
        req.cancel();
    }
});

function getFileMetaData(req, fileId, callback) {
    log("getFileMetadata: fileId=" + fileId);
    Database.exec("SELECT  fd.id, f.name, f.crypted FROM files_data fd JOIN files f ON (f.id=fd.file)  WHERE fd.file=" + fileId + "  ORDER BY fd.id ASC")
        .oncomplete(function (dataset) {
            var fileName = (Array.isArray(dataset) && dataset.length > 0) ? dataset[0].name : null;
            var fileDataIds = [];
            if (fileName) {
                dataset.forEach(function (v) { fileDataIds.push(v.id) });
                log("getFileMetadata: fileDataIds=" + JSON.stringify(fileDataIds));
                callback(req, fileId, fileName, fileDataIds);
            }
            else {
                req.cancel();
            }
        })
        .onerror(function (error, errorText, dbErrorCode) { });
}

function streamFileData(req, fileId, fileName, fileDataIds) {
    log("streamFileData: fileId=" + fileId + ", fileName=" + fileName + ", fileDataIds=" + JSON.stringify(fileDataIds));
    //var headerContentDisposition = 'attachment; filename="' + fileName + '"';
    var headerContentDisposition = 'inline'
    req.responseContentType("image/*")
        .responseHeader("Content-Disposition", headerContentDisposition)
        .sendResponse()
        .onsend(function (req) {
            var last = fileDataIds.length === 1;
            readChunkFromDB(fileDataIds.shift(), function (data) {
                log("streamFileData: send " + data.length + " bytes, last=" + last);
                req.send(data, last);
            });
        });
}

function readChunkFromDB(fileDataId, callback) {
    log("readChunkFromDB: fileDataId=" + fileDataId);
    Database.exec("SELECT data FROM files_data WHERE id=" + fileDataId)
        .oncomplete(function (dataset) {
            if (Array.isArray(dataset) && dataset.length > 0) {
                log("readChunkFromDB: " + dataset[0].data.length + " bytes from DB");
                callback(dataset[0].data);
            }
            else {
                req.cancel();
            }
        })
        .onerror(function (error, errorText, dbErrorCode) { });
}

function fileIdFromUri(str) {
    // Check if the string is empty or does not start with "/"
    if (!str || str[0] !== "/") {
        return null;
    }
    // Extract the number part of the string
    const numStr = str.substring(1);
    // Check if the remaining string contains only digits
    var i;
    for (i = 0; i < numStr.length; i++) {
        const charCode = numStr.charCodeAt(i);
        if (charCode < 48 || charCode > 57) {
            return null;
        }
    }
    // Return the extracted number
    return numStr;
}

var baseUrl = WebServer.url;
log("url: " + baseUrl);

WebServer.onurlchanged(function (newUrl) {
    baseUrl = newUrl;
    log("url: " + baseUrl);
});
//#endregion fim db files
