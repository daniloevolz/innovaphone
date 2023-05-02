
new JsonApi("user").onconnected(function(conn) {
    if (conn.app == "wecom-wecomlicensemanager") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "UserMessage") {
                conn.send(JSON.stringify({ api: "user", mt: "UserMessageResult", src: obj.src }));
            }
            
            if (obj.mt == "UpdateConfigLicenseMessage") {
                try {
                    var lic = encrypt(obj.licenseToken, obj.licenseFile)
                    var date = getDateNow();
                    log("UpdateConfigLicenseMessage: License encrypted: " + JSON.stringify(lic));
                    conn.send(JSON.stringify({ api: "user", mt: "UpdateConfigLicenseMessageSuccess", licenseKey: lic, licenseInstallDate: date, licenseToken: obj.licenseToken}));

                } catch (e) {
                    conn.send(JSON.stringify({ api: "user", mt: "UpdateConfigMessageErro" }));
                    log("ERRO UpdateConfigLicenseMessage:" + e);


                }
            }
        });
    }
});

new JsonApi("admin").onconnected(function(conn) {
    if (conn.app == "wecom-wecomlicensemanageradmin") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AdminMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: obj.src }));
            }
        });
    }
});
function getDateNow() {
    // Cria uma nova data com a data e hora atuais em UTC
    var date = new Date();
    // Adiciona o deslocamento de GMT-3 ás horas da data atual em UTC
    date.setUTCHours(date.getUTCHours() - 3);

    // Formata a data e hora em uma string ISO 8601 com o caractere "T"
    var dateString = date.toISOString();

    // Substitui o caractere "T" por um espaço
    //dateString = dateString.replace("T", " ");

    // Retorna a string no formato "AAAA-MM-DDTHH:mm:ss.sss"
    return dateString.slice(0, -5);
}
function encrypt(key, hash) {
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

    return ciphertext;
}
