var PbxSignal = [];
var pbxTableUsers = [];
var pbxTable = [];
var PbxAdminApi;
var connectionsUser = [];
var connectionsAdmin = [];
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
var lang; // idioma do navegador do cliente
var timeZoneClient;
var langMyApps; // idioma do myapps do usuario DWC 
var timeZoneMyApps; // timezone do my apps do usuario DWC
var url_conference = Config.url_conference;
var obj_conference = Config.obj_conference;
var number_conference = Config.number_conference;
var reserved_conference = Config.reserved_conference;
var key_conference = Config.key_conference;

 var  WecomDwcschedulerTexts = [{
     pt: {
         labelEventWhen: "Quando",
         labelJoinConf: "Entrar na reunião",
         labelMembers: "Participantes",
         labelHost: "Organizador",
         labelConfUrl: "Link do evento: ",
         labelEventScheduled: "Evento agendado, Em breve você receberá um e-mail com o convite da conferência.\nNão esqueça de verificar sua caixa de SPAM!\nObrigado!",
         labelHello: "Olá",
         labelName: "Nome",
         labelHour: "Horário",
         labelMail: "E-mail",
         labelNewSchedule: "um novo agendamento foi realizado para o seu usuário via DWC, seguem informações de contato do solicitante.",
         labelBestRegards: "Atenciosamente"
     },
     en: {
         labelEventWhen: "When",
         labelJoinConf: "Join meeting",
         labelMembers: "Participants",
         labelHost: "Host",
         labelConfUrl: "Event link: ",
         labelEventScheduled: "Event scheduled, Soon you will receive an email with the conference invitation.\nDon't forget to check your SPAM folder!\nThank you!",
         labelHello: "Hello",
         labelName: "Name",
         labelHour: "Hour",
         labelMail: "E-mail",
         labelNewSchedule: "a new schedule has been made for your user via DWC, here are the requester's contact information.",
         labelBestRegards: "Best regards"
     },
     es: {
         labelEventWhen: "Cuándo",
         labelJoinConf: "Unirse a la reunión",
         labelMembers: "Participantes",
         labelHost: "Organizador",
         labelConfUrl: "Enlace del evento: ",
         labelEventScheduled: "Evento programado, Pronto recibirá un correo electrónico con la invitación a la conferencia.\n¡No olvides revisar tu carpeta de SPAM!\n¡Gracias!",
         labelHello: "Hola",
         labelName: "Nombre",
         labelHour: "Hora",
         labelMail: "Correo electrónico",
         labelNewSchedule: "se ha realizado un nuevo horario para su usuario a través de DWC, aquí están los datos de contacto del solicitante.",
         labelBestRegards: "Atentamente"
     },
     fr: {
         labelEventWhen: "Quand",
         labelJoinConf: "Rejoindre la réunion",
         labelMembers: "Participants",
         labelHost: "Organisateur",
         labelConfUrl: "Lien de l'événement :",
         labelEventScheduled: "Événement programmé, Bientôt vous recevrez un e-mail avec l'invitation à la conférence.\nN'oubliez pas de vérifier votre dossier SPAM !\nMerci !",
         labelHello: "Bonjour",
         labelName: "Nom",
         labelHour: "Heure",
         labelMail: "E-mail",
         labelNewSchedule: "un nouveau calendrier a été établi pour votre utilisateur via DWC, voici les coordonnées du demandeur.",
         labelBestRegards: "Cordialement"
     },
     de: {
         labelEventWhen: "Wann",
         labelJoinConf: "An der Sitzung teilnehmen",
         labelMembers: "Teilnehmer",
         labelHost: "Veranstalter",
         labelConfUrl: "Veranstaltungslink: ",
         labelEventScheduled: "Veranstaltung geplant, Bald erhalten Sie eine E-Mail mit der Konferenzeinladung.\nVergessen Sie nicht, Ihren SPAM-Ordner zu überprüfen!\nVielen Dank!",
         labelHello: "Hallo",
         labelName: "Name",
         labelHour: "Stunde",
         labelMail: "E-Mail",
         labelNewSchedule: "Ein neuer Zeitplan wurde für Ihren Benutzer über DWC erstellt. Hier sind die Kontaktdaten des Antragstellers.",
         labelBestRegards: "Mit freundlichen Grüßen"
     }
    
}]

// Objeto de mapeamento de deslocamento horário para TZID
var timeZoneMapping = {
    "-12:00": "Pacific/Kwajalein",
    "-11:00": "Pacific/Midway",
    "-10:00": "Pacific/Honolulu",
    "-09:00": "America/Anchorage",
    "-08:00": "America/Los_Angeles",
    "-07:00": "America/Denver",
    "-06:00": "America/Chicago",
    "-05:00": "America/New_York",
    "-04:00": "America/Caracas",
    "-03:00": "America/Sao_Paulo",
    "-02:00": "Atlantic/Azores",
    "-01:00": "Atlantic/Cape_Verde",
    "+00:00": "Europe/London",
    "+01:00": "Europe/Paris",
    "+02:00": "Europe/Athens",
    "+03:00": "Europe/Moscow",
    "+04:00": "Asia/Dubai",
    "+05:00": "Asia/Karachi",
    "+06:00": "Asia/Dhaka",
    "+07:00": "Asia/Bangkok",
    "+08:00": "Asia/Hong_Kong",
    "+09:00": "Asia/Tokyo",
    "+10:00": "Australia/Sydney",
    "+11:00": "Pacific/Noumea",
    "+12:00": "Pacific/Fiji"
};



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
    url_conference = Config.url_conference;
    obj_conference = Config.obj_conference;
    number_conference = Config.number_conference;
    reserved_conference = Config.reserved_conference;
    key_conference = Config.key_conference;
})

log("dwcschedulerservice: License "+JSON.stringify(license));
if (license != null && license.System==true) {
    log("danilo req: License for System found, Webservers will be available");
    if (license.Scheduler == true) {
        log("danilo req: License for Scheduler found, Webservers will be available");
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
            if (req.method == "OPTIONS") {
                log("get-agenda: OPTIONS request");
                req.responseHeader("Access-Control-Allow-Origin", "*");
                req.responseHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT");
                req.sendResponse();
            }
            if (req.method == "GET") {
                var uri = req.relativeUri;
                log(uri);
                var array_uri = uri.split("=");
                var sip = array_uri[1];
                var msg;
                Database.exec("SELECT * FROM tbl_day_availability WHERE sip ='" + sip + "';")
                    .oncomplete(function (dataavailability) {
                        log("get-agenda:tbl_availability result=" + JSON.stringify(dataavailability, null, 4));

                        Database.exec("SELECT * FROM tbl_schedules WHERE sip ='" + sip + "';")
                            .oncomplete(function (dataschedules) {
                                log("get-agenda:tbl_schedules result=" + JSON.stringify(dataschedules, null, 4));
                                msg = { status: 200, dataavailability: JSON.stringify(dataavailability), dataschedules: JSON.stringify(dataschedules), timeZoneMyApps: timeZoneMyApps };
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
            if (req.method == "OPTIONS") {
                log("salvar-evento: OPTIONS request");
                req.responseHeader("Access-Control-Allow-Origin", "*");
                req.responseHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT");
                req.sendResponse();
            }
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
                            var arrayToday = obj.time_start.split("T");
                            var day = arrayToday[0];
                            var time = arrayToday[1];
                            var name = pbxTableUsers.filter(findBySip(obj.sip))[0].columns.cn;
                            lang = obj.language
                            timeZoneClient = obj.timeZone
                            //timeZoneClient = "+2:00"
                            var todayClient = convertDateTimeLocalToCustomFormat(getDateTimeZone(timeZoneClient));
                            var todayMyApps = convertDateTimeLocalToCustomFormat(getDateTimeZone(timeZoneMyApps));

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
                            var timeNowClient = creationDate(todayClient);
                            var timeNowMyApps = creationDate(todayMyApps);
                            var timeDiff = "0"
                            //if(timeZoneMyApps != timeZoneClient){
                            //    timeDiff = calculateTimeZoneDifference(timeZoneClient,timeZoneMyApps)
                            //}

                            log("TimeZoneMyApps " + timeZoneMyApps) //+03:00
                            log("TimeZoneClient " + timeZoneClient)
                            log("TimeNowClient " + timeNowClient)
                            log("TimeNowMyApps " + timeNowMyApps)


                            var timeZoneClientShort = timeZoneClient.split(':')[0] 
                            log("timeZoneClient" + timeZoneClient);
                            var timeZoneMyAppsShort = timeZoneMyApps.split(":")[0] //+03
                            log("timeZoneMyApps" + timeZoneMyApps);
                            //if (timeZoneClientShort < timeZoneMyAppsShort) {
                            //    log("if 1");
                            //    timeDiff = calculateTimeZoneDifference(timeZoneClientShort, timeZoneMyAppsShort)

                            //} else if (timeZoneClientShort > timeZoneMyAppsShort) {
                            //    log("if 2");
                            //    timeDiff = calculateTimeZoneDifference(timeZoneMyAppsShort, timeZoneClientShort)
                                
                            //} else {
                            //    log("else");
                            //}
                            //log("timeDiff" + timeDiff);

                            //// Transforma a string de data em um objeto Date
                            //var date = new Date(obj.time_start);
                            //// Adiciona as horas
                            //date.setHours(date.getHours() - timeZoneClientShort);
                            //// Ou subtrai as horas
                            //// date.setHours(date.getHours() - hoursToSubtract);
                            //// Transforma de volta para uma string de data
                            //var time_start_utc = date.toISOString();
                            //obj.time_start_utc = time_start_utc

                            //// Transforma a string de data em um objeto Date
                            //var date = new Date(obj.time_end);
                            //// Subtrai as horas
                            //date.setHours(date.getHours() - timeZoneClientShort);
                            //// Transforma de volta para uma string de data
                            //var time_end_utc = date.toISOString();
                            //obj.time_end_utc = time_end_utc
                            //// Transforma a string de data em um objeto Date
                            //var date = new Date(obj.time_start);
                            //// Adiciona as horas
                            //date.setHours(date.getHours() + timeDiff);
                            //// Transforma de volta para uma string de data
                            //var myapps_time_start = date.toISOString();
                            //log("myapps_time_start toISOString " + myapps_time_start);
                            var myapps_time_start = ajustarHora(obj.time_start, timeZoneMyAppsShort)
                            log("myapps_time_start formated " + myapps_time_start);
                            var client_time_start = ajustarHora(obj.time_start, timeZoneClientShort)
                            log("myapps_time_start formated " + client_time_start);


                            var myapps_time_end = ajustarHora(obj.time_end, timeZoneMyAppsShort)
                            log("myapps_time_end formated " + myapps_time_end);
                            var client_time_end = ajustarHora(obj.time_end, timeZoneClientShort)
                            log("myapps_time_end formated " + client_time_end);

                            var startTimestampUTC = convertDateTimeToTimestamp(obj.time_start);
                            log("startTimestampUTC " + startTimestampUTC);

                            var endTimestampUTC = convertDateTimeToTimestamp(obj.time_end);
                            log("endTimestampUTC  " + endTimestampUTC);

                            var creationTimestampUTC = convertDateTimeToTimestamp(timeNowMyApps);
                            log("creationTimestampUTC  " + creationTimestampUTC);


                            var creationTimestampClient = convertDateTimeToTimestamp(timeNowClient);
                            log("creationTimestampClient " + creationTimestampClient);

                            var timeZoneName = timeZoneMapping[timeZoneMyApps]
                            log("timeZoneName " + timeZoneName);

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
                                    var roomNumber = number_conference;
                                    var md5Hash = key_conference;
                                    var reservedChannels = reserved_conference;
                                    //var conferenceLinkClient = createConferenceLink(timeZoneClient,version, flags, roomNumber, meetingId, startTimestampClient, endTimestampClient, reservedChannels, creationTimestampClient, md5Hash, cfg[0].url_conference, cfg[0].obj_conference);
                                    var conferenceLinkMyApps = createConferenceLink(timeZoneMyApps, version, flags, roomNumber, meetingId, startTimestampUTC, endTimestampUTC, reservedChannels, creationTimestampUTC, md5Hash, url_conference, obj_conference);
                                    log("conferenceLinkMyApps" + conferenceLinkMyApps);
                                    insertConferenceSchedule(obj, conferenceLinkMyApps, function (error, resultSchedule) {
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
                                                        conn.send(JSON.stringify({ api: "user", mt: "UserEventMessage", name: obj.name, email: obj.email, time_start: formatDate(myapps_time_start) }));
                                                    }
                                                })

                                            } catch (e) {
                                                log("danilo req: erro send UserEventMessage: " + e);
                                            }
                                            //Update Badge
                                            try {
                                                var count = 0;
                                                
                                                //Teste Danilo 22/08:
                                                pbxTableUsers.forEach(function (user) {
                                                    if (user.columns.h323 == obj.sip) {
                                                        var old_badge = user.badge;
                                                        user.badge += 1;
                                                        log("danilo-req adge2: Updating the Badge for object user " + user.columns.h323 + " the old Badge value is " + old_badge + " and new value is " + user.badge);
                                                        count = user.badge;
                                                        log("danilo-req badge2:UserAckEventMessage: Updating the object for user " + user.columns.h323)
                                                        user.badge = count;
                                                    }
                                                })
                                                updateBadge(obj.sip, count);

                                            }
                                            catch (e) {
                                                log("danilo req: erro send badge: " + e);
                                            }
                                            //Send e-mails to users
                                   
                                            try {
                                                log("TimeZoneDiff " + timeZoneClient)
                                                log("First Language " + lang)
                                                log("New Navigator Language " + lang)
                                                log("Language MyApps " + JSON.stringify(langMyApps))
                                                //Email Client
                                                var dataClient = "<!DOCTYPE html>"
                                                    + "<html>"
                                                    + "<head></head>"
                                                    + "<body>"
                                                    + "<div style = 'border: solid 1px #dadce0;border-radius: 8px;'>"
                                                    + "<h3>" + cfg[0].text_invite + "</h3>"
                                                    + "<p></p>"
                                                    + "<table style='width: 100%;'>"
                                                    + "<tr style='width: 100%;'>"
                                                    + "<td style ='width: 50%'>" + "<b>" + WecomDwcschedulerTexts[0][lang]['labelEventWhen'] + "</b><br>" + formatDate(client_time_start)
                                                    + "</td>"
                                                    + "<td style= 'background-color: #1a73e8;border: none; width: 25%; color:white ;padding:15px;border-radius: 5px; display:flex; justify-content: center; align-items: center; text-align: center;' >"
                                                    + "<a style='color:white; font-weight:bold; width:100%; height:fit-content; text-decoration: none;' href=" + " ' " + conferenceLinkMyApps + " ' " + ">" + "<span style = 'width: 100%; font-weight: bold;' >" + WecomDwcschedulerTexts[0][lang]['labelJoinConf']
                                                    + "</span>"
                                                    + "</a>"
                                                    + "</td>"
                                                    + "</tr>"
                                                    + "<tr style='height: 25px;'></tr>"
                                                    + "</tr>"
                                                    + "<tr>"
                                                    + "<td>"
                                                    + "<b>" +  WecomDwcschedulerTexts[0][lang]['labelMembers'] + "</b>"
                                                    + "<br>" + "<span style ='text-decoration: none; color: #3c4043'>" + cfg[0].email_contato + "</span>" + "<span style='color: #70757a;'>" + "-" +  WecomDwcschedulerTexts[0][lang]['labelHost'] + "</span>"
                                                    + "<br>" + "<span style ='text-decoration: none; color: #3c4043'>" + obj.email + "</span>"
                                                    + "</td>"
                                                    + "<td>" + WecomDwcschedulerTexts[0][lang]['labelConfUrl'] + "</b>" + "<br>" + "<span style = 'color: #70757a'>" + conferenceLinkMyApps + "</span>" + "</td>"
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
                                                    + "<h3>" + WecomDwcschedulerTexts[0][langMyApps]['labelHello'] + " " + name + "," + WecomDwcschedulerTexts[0][langMyApps]["labelNewSchedule"] + "</h3><br/>"
                                                    + "<b>"+  WecomDwcschedulerTexts[0][langMyApps]['labelName'] + " " + obj.name + "</b><br/>"
                                                    + "<b>" +  WecomDwcschedulerTexts[0][langMyApps]['labelMail'] + " " + "</b> " + obj.email + "<br/>"
                                                    + "<b>" + WecomDwcschedulerTexts[0][langMyApps]['labelEventWhen'] + " " + "</b> " + formatDate(myapps_time_start) + "<br/><br/>"
                                                    + "<b>" + WecomDwcschedulerTexts[0][langMyApps]['labelConfUrl'] + " " + "</b> " + conferenceLinkMyApps + "<br/><br/>"
                                                    + WecomDwcschedulerTexts[0][langMyApps]['labelBestRegards'] + "<br/>"
                                                    + "<i>DWC Wecom</i>"
                                                    + "</body>"
                                                    + "</html>";


                                                //Anexo Client
                                                var attachmentClient = "BEGIN:VCALENDAR\n"
                                                    + "PRODID:-//DWC Wecom//EN\n"
                                                    + "VERSION:2.0\n"
                                                    + "CALSCALE:GREGORIAN\n"
                                                    + "METHOD:REQUEST\n"
                                                    + "BEGIN:VTIMEZONE\n"
                                                    + "TZID:" + timeZoneMapping[timeZoneClient] + "\n"
                                                    + "X-LIC-LOCATION:" + timeZoneMapping[timeZoneClient] + "\n"
                                                    + "BEGIN:STANDARD\n"
                                                    + "TZOFFSETFROM:" + timeZoneClient.replace(":", "") +"\n"
                                                    + "TZOFFSETTO:" + timeZoneClient.replace(":", "") +"\n"
                                                    + "TZNAME:" + timeZoneClientShort + "\n"
                                                    + "DTSTART:19700101T000000\n"
                                                    + "END:STANDARD\n"
                                                    + "END:VTIMEZONE\n"
                                                    + "BEGIN:VEVENT\n"
                                                    + "DTSTART;TZID=" + timeZoneMapping[timeZoneClient] + ":" + convertDateTimeLocalToCustomFormat(client_time_start) + "\n" //convertDateTimeLocalToCustomFormat(obj.time_start)
                                                    + "DTEND;TZID=" + timeZoneMapping[timeZoneClient] + ":" + convertDateTimeLocalToCustomFormat(client_time_end) + "\n" //convertDateTimeLocalToCustomFormat(obj.time_end)
                                                    + "DTSTAMP:" + todayClient + "Z\n"
                                                    + "ORGANIZER;CN=" + cfg[0].email_contato + ":mailto:" + cfg[0].email_contato + "\n"
                                                    + "ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=TRUE"
                                                    + ";CN=" + cfg[0].email_contato + ":mailto:" + cfg[0].email_contato + "\n"
                                                    + "ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=TRUE"
                                                    + ";CN=" + obj.email + ":mailto:" + obj.email + "\n"
                                                    + "X-GOOGLE-CONFERENCE:" + conferenceLinkMyApps + "\n"
                                                    + "X-MICROSOFT-CDO-OWNERAPPTID:1590702030\n"
                                                    + "CREATED:" + todayClient + "Z\n"
                                                    + "DESCRIPTION:" + conferenceLinkMyApps + "\n\n-::~:~::~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~\n"
                                                    + " :~:~:~:~:~:~:~:~:~:~:~:~::~:~::-\nJoin with Browser: " + conferenceLinkMyApps + " \n\nLearn more about Meet at: https://support.google.com/"
                                                    + " a/users/answer/9282720\n\nPlease do not edit this section.\n-::~:~::~:~:~:~\n"
                                                    + " :~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~::~:~::-\n"
                                                    + "LAST-MODIFIED:" + todayClient + "Z\n"
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

                                                var attachmentMyApps = "BEGIN:VCALENDAR\n"
                                                + "PRODID:-//DWC Wecom//EN\n"
                                                + "VERSION:2.0\n"
                                                + "CALSCALE:GREGORIAN\n"
                                                + "METHOD:REQUEST\n"
                                                + "BEGIN:VTIMEZONE\n"
                                                + "TZID:" + timeZoneMapping[timeZoneMyApps] + "\n"
                                                + "X-LIC-LOCATION:" + timeZoneMapping[timeZoneMyApps] + "\n"
                                                + "BEGIN:STANDARD\n"
                                                + "TZOFFSETFROM:" + timeZoneMyApps.replace(":", "")+"\n"
                                                + "TZOFFSETTO:" + timeZoneMyApps.replace(":", "") +"\n"
                                                + "TZNAME:" + timeZoneMyAppsShort + "\n"
                                                + "DTSTART:19700101T000000\n"
                                                + "END:STANDARD\n"
                                                + "END:VTIMEZONE\n"
                                                + "BEGIN:VEVENT\n"
                                                    + "DTSTART;TZID=" + timeZoneMapping[timeZoneMyApps] + ":" + convertDateTimeLocalToCustomFormat(myapps_time_start)+ "\n" //convertDateTimeLocalToCustomFormat(obj.time_start)
                                                        + "DTEND;TZID=" + timeZoneMapping[timeZoneMyApps] + ":" + convertDateTimeLocalToCustomFormat(myapps_time_end)+ "\n" //convertDateTimeLocalToCustomFormat(obj.time_end)
                                                + "DTSTAMP:" + todayMyApps + "Z\n"
                                                + "ORGANIZER;CN=" + cfg[0].email_contato + ":mailto:" + cfg[0].email_contato + "\n"
                                                + "ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=TRUE"
                                                + ";CN=" + cfg[0].email_contato + ":mailto:" + cfg[0].email_contato + "\n"
                                                + "ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=TRUE"
                                                + ";CN=" + obj.email + ":mailto:" + obj.email + "\n"
                                                + "X-GOOGLE-CONFERENCE:" + conferenceLinkMyApps + "\n"
                                                + "X-MICROSOFT-CDO-OWNERAPPTID:1590702030\n"
                                                + "CREATED:" + todayMyApps + "Z\n"
                                                + "DESCRIPTION:" + conferenceLinkMyApps + "\n\n-::~:~::~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~\n"
                                                + " :~:~:~:~:~:~:~:~:~:~:~:~::~:~::-\nJoin with Browser: " + conferenceLinkMyApps + " \n\nLearn more about Meet at: https://support.google.com/"
                                                + " a/users/answer/9282720\n\nPlease do not edit this section.\n-::~:~::~:~:~:~\n"
                                                + " :~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~::~:~::-\n"
                                                + "LAST-MODIFIED:" + todayMyApps + "Z\n"
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
                                                //Enviar para o Cliente
                                                sendEmail(cfg[0].email_title, obj.email, dataClient, attachmentClient, function (error, resultEmail) {
                                                    if (error) {
                                                        log("sendEmail Ocorreu um erro:", error);

                                                    } else {
                                                        log("sendEmail:", resultEmail);
                                                    }
                                                });
                                                //Enviar para o usuário
                                                sendEmail(cfg[0].email_title, cfg[0].email_contato, dataUser, attachmentMyApps, function (error, resultEmail) {
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
    if (license.Reports == true) {
        //liceciado
        WebServer.onrequest("cdr", function (req) {
            if (req.method == "POST") {
                var newValue = "";
                var value = "";
                var msg;
                req.onrecv(function (req, data) {
                    //var obj = JSON.parse((new TextDecoder("utf-8").decode(data)));
                    if (data) {
                        newValue += (new TextDecoder("utf-8").decode(data));
                        req.recv();
                    } else {
                        value = newValue;
                        log("dwcscheduler/cdr: received POST data " + value);
                        try {

                            requestCDREvent(value);

                            msg = { ok: "ok" }
                            req.responseContentType("application/json")
                                .sendResponse()
                                .onsend(function (resp) {
                                    resp.send(new TextEncoder("utf-8").encode(JSON.stringify(msg)), true);
                                });


                        }
                        catch (e) {
                            log("dwcscheduler/cdr: received POST data ERROR: " + e);
                            req.responseContentType("application/json")
                                .sendResponse()
                                .onsend(function (resp) {
                                    resp.send(new TextEncoder("utf-8").encode(JSON.stringify(e)), true);
                                });
                        }

                    }
                });
            } else {
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
                var x = params['x']; // Obter o valor do parâmetro 'x'
                var y = params['y']; // Obter o valor do parâmetro 'y'
                var msg;
                log("put-caller: received request to update Identity App");
                var control = false;
                connectionsIdentity.forEach(function (c) {
                    if (c.sip == sip) {
                        control = true;
                        log("put-caller:user connected="+ sip +" will be notified about call from caller=" + caller);
                        if (sendLocation && license.Location == true) {
                            //var mapbox = 'https://api.mapbox.com/styles/v1/mapbox/streets-v12.html?title=true&zoomwheel=false&access_token=' + google_api_key + '#15/' + x + '/' + y + '/70';
                            var google = "https://www.google.com/maps/embed/v1/place?key=" + google_api_key + "&q=" + x + "," + y + "&zoom=15";
                            c.send(JSON.stringify({ api: "user", mt: "DWCCallRequest", caller: caller, location: google }));
                            log("put-caller: sendLocation true");
                            log("put-caller:user connected=" + sip + " notified about call from caller=" + caller);
                        } else {
                            c.send(JSON.stringify({ api: "user", mt: "DWCCallRequest", caller: caller, location: "" }));
                            log("put-caller: sendLocation false");
                            log("put-caller:user connected=" + sip + " notified about call from caller=" + caller);
                        }
                    }
                })
                if (!control) {
                    log("put-caller:user not connected in Identity App= " + sip);
                }

                msg = { status: 200 };
                req.responseContentType("application/json")
                    .sendResponse()
                    .onsend(function (req) {
                        req.send(new TextEncoder("utf-8").encode(JSON.stringify(msg)), true);
                    });
            }
            if (req.method == "OPTIONS") {
                log("put-caller: OPTIONS request");
                req.responseHeader("Access-Control-Allow-Origin", "*");
                req.responseHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT");
                req.sendResponse();
            }
        });
    }
}

// Exemplo de uso:
//var dataOriginal = "2024-04-28T03:57";
//var diferenca = "-03"; // ou "+03" para somar 3 horas
function ajustarHora(dataString, diferenca) {
    // Converte a string de data para um objeto Date
    var data = new Date(dataString);

    // Extrai o valor da diferença de horas da string
    var diferencaHoras = parseInt(diferenca);

    // Verifica se a diferença é positiva ou negativa e adiciona ou subtrai horas
    if (diferencaHoras >= 0) {
        data.setHours(data.getHours() + diferencaHoras);
    } else {
        data.setHours(data.getHours() - Math.abs(diferencaHoras));
    }

    // Formata a nova data para o formato desejado (yyyy-mm-ddThh:mm)
    var ano = data.getFullYear();
    var mes = padZero(data.getMonth() + 1); // Adiciona 1 porque os meses são indexados a partir de 0
    var dia = padZero(data.getDate());
    var horas = padZero(data.getHours());
    var minutos = padZero(data.getMinutes());

    var novaDataString = ano + "-" + mes + "-" + dia + "T" + horas + ":" + minutos;

    // Formata a nova data para o formato desejado (yyyy-mm-ddThh:mm) EM UTC
    //var novaDataString = new Date(dataString).toISOString().slice(0, 16);

    return novaDataString;
}

function padZero(num) {
    return (num < 10 ? "0" : "") + num;
}

function formatDate(date) {
    // Cria uma nova data com a data e hora atuais em UTC
    var date = new Date(date);
    // Adiciona o deslocamento de GMT-3 �s horas da data atual em UTC
    //date.setUTCHours(date.getUTCHours() - 3);

    // Formata a data em uma string no formato "AAAAMMDDTHHmmss"
    var year = date.getUTCFullYear();
    var month = padZero(date.getUTCMonth() + 1);
    var day = padZero(date.getUTCDate());
    var hours = padZero(date.getUTCHours());
    var minutes = padZero(date.getUTCMinutes());
    var seconds = padZero(date.getUTCSeconds());
    var dateString = year + "-" + month + "-" + day + " " + hours + ":" + minutes + "-" + seconds;

    // Retorna a string no formato "AAAAMMDDTHHmmss"
    return dateString;
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
                 langMyApps = obj.lang
                 timeZoneMyApps = obj.timeZone //obter o idioma do my apps do Usuario que criou a conf 
                 if(lang != "en" && lang != "pt" ){
                    lang = "en"
                }
                if(langMyApps != "en" && langMyApps != "pt"){
                    langMyApps = "en"
                }
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
                    //PbxSignal.forEach(function (signal) {
                        //log("danilo-req badge2:UserAckEventMessage " + JSON.stringify(signal));
                        //var call = signal[conn.sip];
                        //Teste Danilo 20/07:
                        //var foundCalls = [];
                        //for (var key in signal) {
                        //    if (Object.prototype.hasOwnProperty.call(signal, key) && signal[key] === conn.sip) {
                        //        foundCalls.push(key);
                        //    }
                        //}
                        ////
                        //if (foundCalls.length > 0) {
                        //    log("danilo-req badge2:UserAckEventMessage call " + foundCalls + ", will call updateBadge");
                        //    try {
                        //        pbxTableUsers.forEach(function (user) {
                        //            if (user.columns.h323 == conn.sip) {
                        //                log("danilo-req badge2:UserAckEventMessage: Updating the object for user " + user.columns.h323)
                        //                user.badge = count;
                        //            }
                        //        })
                        //    } finally {
                        //        //updateBadge(signal, call, count);
                        //        foundCalls.forEach(function (call) {
                        //            updateBadge(signal, parseInt(call, 10), count);
                        //        })
                        //    }
                        //}
                    //})
                    //Teste Danilo 22/08:
                    pbxTableUsers.forEach(function (user) {
                         if (user.columns.h323 == conn.sip) {
                             log("danilo-req badge2:UserAckEventMessage: Updating the object for user " + user.columns.h323)
                             user.badge = count;
                         }
                    })
                    updateBadge(conn.sip, count);

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
                        Database.exec("INSERT INTO tbl_user_configs (sip, text_invite, email_contato, email_title, title_conference) VALUES ('" + conn.sip + "','" + obj.text_invite + "','" + obj.email + "','" + obj.email_title + "','" + obj.title_conference + "')")
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
                if (obj.mt == "AddDayAvailability") {
                    Database.exec("DELETE FROM tbl_day_availability WHERE sip='" + conn.sip + "';")
                        .oncomplete(function () {
                            Database.insert("INSERT INTO tbl_day_availability (sip, day, hour_start, hour_end, minute_start, minute_end, date_start, date_end ) VALUES('" + conn.sip + "', '" + obj.day + "', '" + obj.hour_start + "', '" + obj.hour_end + "', '" + obj.minute_start + "', '" + obj.minute_end + "', '" + obj.date_start + "', '" + obj.date_end +"')")
                                .oncomplete(function () {
                                    Database.exec("SELECT * FROM tbl_day_availability WHERE sip ='" + conn.sip + "';")
                                        .oncomplete(function (data) {
                                            log("AddAvailabilityMessage:result=" + JSON.stringify(data, null, 4));
                                            conn.send(JSON.stringify({ api: "user", mt: "SelectAvailabilityMessageSuccess", result: JSON.stringify(data, null, 4), src: obj.src }));

                                        })
                                        .onerror(function (error, errorText, dbErrorCode) {
                                            conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                                        });
                                })
                                .onerror(function (error, errorText, dbErrorCode) {
                                    conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                                });
                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                        });
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
                    Database.exec("SELECT * FROM tbl_day_availability WHERE sip ='" + conn.sip + "';")
                        .oncomplete(function (data) {
                            log("SelectAvailabilityMessage:result=" + JSON.stringify(data, null, 4));
                            conn.send(JSON.stringify({ api: "user", mt: "SelectAvailabilityMessageSuccess", result: JSON.stringify(data, null, 4), src: obj.src }));

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
                            conn.send(JSON.stringify({ api: "user", mt: "SelectSchedulesMessageSuccess", result: JSON.stringify(data, null, 4), src: obj.src }));

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
                                    conn.send(JSON.stringify({ api: "user", mt: "SelectSchedulesMessageSuccess", result: JSON.stringify(data, null, 4), src: obj.src }));

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
                    if (PbxAdminApi) {
                        PbxAdminApi.send(JSON.stringify({ "api": "PbxAdminApi", "mt": "GetObject", "h323": obj.obj_conference, "template": "without", "src": conn.sip }));
                    }
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
                if (obj.mt == "Ping") {
                    log("connectionsUser: Ping received from "+conn.sip);
                    conn.send(JSON.stringify({ api: "user", mt: "Pong" }));

                }
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
        connectionsAdmin.push(conn);
        log("Admins Conectados:  " + connectionsAdmin.length);

        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AdminMessage") {

                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: obj.src, from: from, fromName: fromName, server: server, username: username, password: password, googleApiKey: google_api_key, sendLocation: sendLocation }));


                //log("danilo-req AdminMessage: reducing the pbxTableUser object to send to user");
                //var list_users = [];
                //pbxTableUsers.forEach(function (u) {
                //    list_users.push({ sip: u.columns.h323, dn: u.columns.dn, cn: u.columns.cn, guid: u.columns.guid })
                //})
                reduceUserObject(function (users) {
                    conn.send(JSON.stringify({ api: "admin", mt: "TableUsersResult", result: JSON.stringify(users) }));
                });
                
            }
            if (obj.mt == "ConferenceConfigMessage") {

                conn.send(JSON.stringify({
                    api: "admin", mt: "ConferenceConfigMessageResult",
                    src: obj.src,
                    url_conference: url_conference,
                    obj_conference: obj_conference,
                    key_conference: key_conference,
                    reserved_conference: reserved_conference,
                    number_conference: number_conference
                }));

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
            if (obj.mt == "FindObjConfMessage") {
                if (PbxAdminApi) {
                    PbxAdminApi.send(JSON.stringify({ "api": "PbxAdminApi", "mt": "GetObject", "h323": obj.obj_conference, "template": "without", "src": conn.sip }));
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
            if (obj.mt == "UpdateConfigConferenceObjMessage") {
                try {
                    Config.url_conference = obj.url_conference;
                    Config.obj_conference = obj.obj_conference;
                    Config.number_conference = obj.number_conference;
                    Config.key_conference = obj.key_conference;
                    Config.reserved_conference = obj.reserved_conference;

                    Config.save();
                    conn.send(JSON.stringify({ api: "admin", mt: "UpdateConfigConferenceObjMessageSuccess" }));

                } catch (e) {
                    conn.send(JSON.stringify({ api: "admin", mt: "UpdateConfigMessageErro" }));
                    log("ERRO UpdateConfigConferenceObjMessage:" + e);


                }
            }
            if (obj.mt == "SelectAvailabilityMessage") {
                Database.exec("SELECT * FROM tbl_day_availability WHERE sip ='" + obj.sip + "';")
                    .oncomplete(function (data) {
                        log("SelectAvailabilityMessage:result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "admin", mt: "SelectAvailabilityMessageSuccess", result: JSON.stringify(data, null, 4), sip: obj.sip, src:obj.src }));

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText) }));
                    });
            }
            if (obj.mt == "SelectSchedulesMessage") {
                Database.exec("SELECT * FROM tbl_schedules WHERE sip ='" + obj.sip + "';")
                    .oncomplete(function (data) {
                        log("SelectSchedulesMessage:result=" + JSON.stringify(data, null, 4));
                        conn.send(JSON.stringify({ api: "admin", mt: "SelectSchedulesMessageSuccess", result: JSON.stringify(data, null, 4), sip: obj.sip, src: obj.src }));

                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText) }));
                    });
            }
            if (obj.mt == "SelectFromReports") {
                if (license.Reports) {
                    switch (obj.src) {
                        case "RptAvailability":
                            var query = "SELECT guid, date, status, detail FROM tbl_agent_availability";
                            var conditions = [];
                            //if (obj.guid) conditions.push("sip ='" + obj.guid + "'");
                            if (obj.guid && Object.prototype.toString.call(obj.guid) === '[object Array]' && obj.guid.length > 0) {
                                var guidConditions = obj.guid.map(function (guid) {
                                    return "guid ='" + guid + "'";
                                });
                                conditions.push("(" + guidConditions.join(" OR ") + ")");
                            }
                            if (obj.status) conditions.push("status ='" + obj.status + "'");
                            if (obj.from) conditions.push("date >'" + obj.from + "'");
                            if (obj.to) conditions.push("date <'" + obj.to + "'");
                            if (conditions.length > 0) {
                                query += " WHERE " + conditions.join(" AND ");
                            }

                            Database.exec(query)
                                .oncomplete(function (data) {
                                    log("result=" + JSON.stringify(data, null, 4));

                                    var jsonData = JSON.stringify(data, null, 4);
                                    var maxFragmentSize = 40000; // Defina o tamanho máximo de cada fragmento
                                    var fragments = [];
                                    for (var i = 0; i < jsonData.length; i += maxFragmentSize) {
                                        fragments.push(jsonData.substr(i, maxFragmentSize));
                                    }
                                    // Enviar cada fragmento separadamente através do websocket
                                    for (var i = 0; i < fragments.length; i++) {
                                        var isLastFragment = i === fragments.length - 1;
                                        conn.send(JSON.stringify({ api: "admin", mt: "SelectFromReportsSuccess", result: fragments[i], lastFragment: isLastFragment, src: obj.src }));
                                    }

                                    //conn.send(JSON.stringify({ api: "admin", mt: "SelectFromReportsSuccess", result: JSON.stringify(data, null, 4), src: obj.src }));
                                })
                                .onerror(function (error, errorText, dbErrorCode) {
                                    conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText), src: obj.src }));
                                });
                            break;
                        case "RptSchedules":
                            var query = "SELECT * FROM tbl_schedules";
                            var conditions = [];
                            //if (obj.guid) conditions.push("sip ='" + obj.guid + "'");
                            if (obj.guid && Object.prototype.toString.call(obj.guid) === '[object Array]' && obj.guid.length > 0) {
                                var guidConditions = obj.guid.map(function (guid) {
                                    return "sip ='" + guid + "'";
                                });
                                conditions.push("(" + guidConditions.join(" OR ") + ")");
                            }
                            if (obj.from) conditions.push("time_start >'" + obj.from + "'");
                            if (obj.to) conditions.push("time_start <'" + obj.to + "'");
                            if (conditions.length > 0) {
                                query += " WHERE " + conditions.join(" AND ");
                            }

                            Database.exec(query)
                                .oncomplete(function (data) {
                                    log("result=" + JSON.stringify(data, null, 4));

                                    var jsonData = JSON.stringify(data, null, 4);
                                    var maxFragmentSize = 40000; // Defina o tamanho máximo de cada fragmento
                                    var fragments = [];
                                    for (var i = 0; i < jsonData.length; i += maxFragmentSize) {
                                        fragments.push(jsonData.substr(i, maxFragmentSize));
                                    }
                                    // Enviar cada fragmento separadamente através do websocket
                                    for (var i = 0; i < fragments.length; i++) {
                                        var isLastFragment = i === fragments.length - 1;
                                        conn.send(JSON.stringify({ api: "admin", mt: "SelectFromReportsSuccess", result: fragments[i], lastFragment: isLastFragment, src: obj.src }));
                                    }

                                    //conn.send(JSON.stringify({ api: "admin", mt: "SelectFromReportsSuccess", result: JSON.stringify(data, null, 4), src: obj.src }));
                                })
                                .onerror(function (error, errorText, dbErrorCode) {
                                    conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText), src: obj.src }));
                                });
                            break;
                        case "RptCalls":
                            var query = "SELECT cdr_id, guid, sip, cn, node, dir, utc, call, flow, created_at FROM tbl_cdr_events";
                            var conditions = [];

                            // Filtro por lista de GUIDs
                            if (obj.guid && Object.prototype.toString.call(obj.guid) === '[object Array]' && obj.guid.length > 0) {
                                var guidConditions = obj.guid.map(function (guid) {
                                    return "guid ='" + guid + "'";
                                });
                                conditions.push("(" + guidConditions.join(" OR ") + ")");
                            }

                            // Filtro por intervalo de datas (from = data inicial, to = data final)
                            if (obj.from) conditions.push("created_at >= '" + obj.from + "'");
                            if (obj.to) conditions.push("created_at <= '" + obj.to + "'");

                            if (conditions.length > 0) {
                                query += " WHERE " + conditions.join(" AND ");
                            }

                            // Ordenação por data mais recente
                            query += " ORDER BY created_at DESC";

                            Database.exec(query)
                                .oncomplete(function (data) {
                                    log("result=" + JSON.stringify(data, null, 4));

                                    var jsonData = JSON.stringify(data, null, 4);
                                    var maxFragmentSize = 40000; // Para dividir em partes menores no WebSocket
                                    var fragments = [];
                                    for (var i = 0; i < jsonData.length; i += maxFragmentSize) {
                                        fragments.push(jsonData.substr(i, maxFragmentSize));
                                    }

                                    for (var i = 0; i < fragments.length; i++) {
                                        var isLastFragment = i === fragments.length - 1;
                                        conn.send(JSON.stringify({
                                            api: "admin",
                                            mt: "SelectFromReportsSuccess",
                                            result: fragments[i],
                                            lastFragment: isLastFragment,
                                            src: obj.src
                                        }));
                                    }
                                })
                                .onerror(function (error, errorText, dbErrorCode) {
                                    conn.send(JSON.stringify({
                                        api: "admin",
                                        mt: "Error",
                                        result: String(errorText),
                                        src: obj.src
                                    }));
                                });
                            break;
                    }
                } else {
                    log("ERRO SelectFromReports: Licensed for Reports? " + license.Reports);
                    conn.send(JSON.stringify({ api: "admin", mt: "SelectFromReportsSuccess", result: [], lastFragment: true, src: obj.src }));
                }
            }
        });
        conn.onclose(function () {
            connectionsAdmin = connectionsAdmin.filter(deleteBySip(conn.sip));
            log("connectionsAdmin: after delete conn " + JSON.stringify(connectionsAdmin));
        })
    }
});

new PbxApi("PbxAdminApi").onconnected(function(conn){
    log("PbxAdminApi: connected conn " + JSON.stringify(conn));


    PbxAdminApi = conn;
    
    //conn.send(JSON.stringify({ "api": "PbxAdminApi", "mt": "GetObject", "cn":"Conference", "template": "without", "src": conn.pbx }));
    conn.onmessage(function (msg) {
        var obj = JSON.parse(msg);
        log("PbxAdminApi msg "+ msg);
        if (obj.mt === "GetPseudoObjectsResult") {
            log("PbxAdminApi timers " + JSON.stringify(obj));
            connectionsUser.forEach(function (c) {
                if (c.sip == obj.src) {
                    c.send(JSON.stringify({ api: "user", mt: "GetObjTimerMessageResult", result: obj.objects }));
                }
            })
        }
        if (obj.mt === "GetObjectResult") {
            if (obj.src === "Timers") {
                log("PbxAdminApi timers " + JSON.stringify(obj));

            } else {
                var found = false;
                var rooms;
                var key;
                if (obj.guid) {
                    found = true;
                    rooms = obj.pseudo["static-room"];
                    key = obj.pseudo["m-key"];
                    log("PbxAdminApi msg " + JSON.stringify(rooms));
                }
                connectionsAdmin.forEach(function (c) {
                    if (c.sip == obj.src) {
                        c.send(JSON.stringify({ api: "admin", mt: "FindObjConfMessageResult", found: found, rooms: rooms, key: key }));
                    }
                })
            }
            
        }
    });
    conn.onclose(function () {
        PbxAdminApi = null;
        log("PbxAdminApi: disconnected");
    });
})

var PbxSignal = [];
var PbxSignalUsers = {};
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
        log("PbxSignal msg: " + msg);

        if (obj.mt === "RegisterResult") {
            log("PBXSignal: registration result " + JSON.stringify(obj));
        }

        // handle incoming presence_subscribe call setup messages
        // the callid "obj.call" required later for sending badge notifications
        if (obj.mt === "Signaling" && obj.sig.type === "setup" && obj.sig.fty.some(function (v) { return v.type === "presence_subscribe" })) {

            log("PbxSignal: incoming presence subscription for user " + obj.sig.cg.sip);

            // connect call
            conn.send(JSON.stringify({ "mt": "Signaling", "api": "PbxSignal", "call": obj.call, "src": obj.src, "sig": { "type": "conn" } }));

            //Update signals
            var pbx = obj.src;

            //Teste Danilo 05/08: armazenar o conteudo call em nova lista
            var sip = obj.sig.cg.sip;
            var call = obj.call;
            var callData = { call, sip };
            //Adiciona o PBX2 no objeto caso ele não exista
            if (!PbxSignalUsers[pbx]) {
                PbxSignalUsers[pbx] = [];
                PbxSignalUsers[pbx].push(callData);
            } else {
                var control = false;
                PbxSignalUsers[pbx].forEach(function (p) {
                    if (p.call == call && p.sip == sip) {
                        control = true;
                        log("PbxSignalUsers: moving var control to true because this signal has been exists");
                    }
                })
                if (!control) {
                    PbxSignalUsers[pbx].push(callData);
                    log("PbxSignalUsers: callData added because control still false");
                } else {
                    log("PbxSignalUsers: callData ignored because control changed to true");
                }
                
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
            if (user) {
                // send notification with badge count first time the user has connected
                var count = 0;
                try {
                    count = user.badge;
                } finally {
                    updateBadge(obj.sig.cg.sip, count);
                }
                //Intert into DB the event
                log("PbxSignal= user " + obj.sig.cg.sip + " login MyApps");
                //log("PbxSignal= GUID " + obj.sig.cg.guid + " login");
                if (license.Reports) {
                    var today = getDateNow();
                    var msg = { guid: user.columns.guid, date: today, status: "Login", detail: "MyApps" }
                    log("PbxSignal= will insert it on DB: " + JSON.stringify(msg));
                    insertTblAvailability(msg);
                } else {
                    log("PbxSignal= Licensed for Reports? "+ license.Reports);
                }
            } else {
                log("PbxSignal= PbxTable User not found for user " + obj.sig.cg.sip + " in login MyApps");
            }
        }

        // handle incoming call release messages
        if (obj.mt === "Signaling" && obj.sig.type === "rel") {
            var pbx = obj.src;

            // Remove da lista e pega o sip associado
            var sip = removeObjectByCall(PbxSignalUsers, pbx, obj.call);

            if (sip) {
                // Log do evento Logout
                log("PbxSignal= user " + sip + " logout MyApps");
                var today = getDateNow();

                // Encontrar o usuário na pbxTableUsers para pegar o GUID
                var user = pbxTableUsers.filter(function (item) {
                    return item.columns.h323 === sip;
                })[0];

                if (user) {
                    if (license.Reports) {
                        var msg = {
                            guid: user.columns.guid,
                            date: today,
                            status: "Logout",
                            detail: "MyApps"
                        };
                        log("PbxSignal= will insert it on DB : " + JSON.stringify(msg));
                        insertTblAvailability(msg);
                    } else {
                        log("PbxSignal= Licensed for Reports? " + license.Reports);
                    }
                } else {
                    log("PbxSignal= user not found in pbxTableUsers for logout tracking");
                }
            } else {
                log("PbxSignal= no matching call found for pbx " + pbx + " and call " + obj.call);
            }

            log("PbxSignalUsers: connections after delete result " + JSON.stringify(PbxSignalUsers));
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

var pbxApi;
var presences = [];
new PbxApi("PbxApi").onconnected(function (conn) {
    log("PbxApi conectada", conn)
    pbxApi = conn
    conn.onmessage(function (msg) {
        var obj = JSON.parse(msg);
        log("PbxApi:onmessage: " + JSON.stringify(obj));
        //log("PbxApi msg: " + msg);
        if (obj.mt == "PresenceUpdate") {
            log("PbxApi:PresenceUpdate: " + JSON.stringify(obj));
            if (license.Reports == true) {
                handlePresenceUpdate(obj);
            } else {
                log("PbxApi:PresenceUpdate: Licensed for Reports? " + license.Reports);
            }
        }
    })

    conn.onclose(function () {
        pbxApi = {}
        log("PbxApi: disconnected");
    });
});

function subscribePresence(obj) {
    if (PbxApi) {
        log("subscribePresence:PbxApi: for user " + obj.columns.cn);
        pbxApi.send(JSON.stringify({
            "api": "PbxApi",
            "mt": "SubscribePresence",
            "sip": obj.columns.h323,
            "src": obj.columns.guid
        }));
    } else {
        log("subscribePresence:PbxApi:ERRO PbxApi Disconectada, for user " + obj.columns.cn);
    }
}

function unsubscribePresence(obj) {
    pbxApi.send(JSON.stringify({
        "api": "PbxApi",
        "mt": "UnsubscribePresence",
        "sip": obj.columns.h323,
        "src": obj.columns.guid
    }));
}

function setPresenceStatusMessage(sip, note, activity) {
    log("setPresenceStatusMessage: SET PRESENCE ON :", sip + " to " + activity)
    // Enviar a mensagem para a conexao PbxApi

    try {
        pbxApi.send(JSON.stringify({
            "api": "PbxApi",
            "mt": "SetPresence",
            "sip": sip,
            "activity": activity,
            "note": note,
            "src": sip
        }));

    } catch (e) {
        log("ERRO setPresenceStatusMessage: SET PRESENCE ON :", sip + " to " + activity + " ERRO:" + e)
    }
}
function handlePresenceUpdate(newPresenceEvent) {
    var src = newPresenceEvent.src;
    var newPresenceList = newPresenceEvent.presence;

    var sip = pbxTableUsers.filter(function (u) { return u.columns.guid == src })[0].columns.h323;

    // Buscar evento anterior
    var oldPresenceEvent = null;
    for (var i = 0; i < presences.length; i++) {
        if (presences[i].src === src) {
            oldPresenceEvent = presences[i];
            break;
        }
    }

    // Obter último status e nota anteriores
    var lastStatus = "online";
    var lastTelStatus = null;
    var oldNotes = [];

    if (oldPresenceEvent) {
        for (var i = 0; i < oldPresenceEvent.presence.length; i++) {
            var pres = oldPresenceEvent.presence[i];
            var act = pres.activity;
            var note = pres.note;
            var contact = pres.contact;
            if (act) lastStatus = act;
            if (note) oldNotes.push(note);
            if (contact === "tel:") lastTelStatus = pres.status;
        }
    }
    var oldNoteConcat = oldNotes.join("|");

    // Novo status e nova nota
    var newStatus = null;
    var newTelStatus = null;
    var newNotes = [];

    for (var i = 0; i < newPresenceList.length; i++) {
        var pres = newPresenceList[i];
        var act = pres.activity;
        var note = pres.note;
        var contact = pres.contact;
        if (act && !newStatus) newStatus = act;
        if (note) newNotes.push(note);
        if (contact === "tel:") newTelStatus = pres.status;
    }
    if (!newStatus) newStatus = "online";
    var newNoteConcat = newNotes.join("|");

    var today = getDateNow();

    if (license.Reports) {
        if (newTelStatus !== lastTelStatus) {
            var msg = { guid: src, date: today, status: newTelStatus == 'closed' ? 'Logout' : 'Login' , detail: newTelStatus };
            log("handlePresenceUpdate: Status Softphone alterado por " + sip + ": " + JSON.stringify(msg));
            insertTblAvailability(msg);
        }
        else if (newStatus !== lastStatus) {
            var msg = { guid: src, date: today, status: newStatus, detail: newNoteConcat || newStatus };
            log("handlePresenceUpdate: Status IM alterado por " + sip + ": " + JSON.stringify(msg));
            insertTblAvailability(msg);
        } else if (newNoteConcat !== oldNoteConcat) {
            var msg = { guid: src, date: today, status: newStatus, detail: newNoteConcat };
            log("handlePresenceUpdate: Note alterado por " + sip + ": " + JSON.stringify(msg));
            insertTblAvailability(msg);
        } else {
            log("handlePresenceUpdate: Ignorado status e note repetidos para " + sip);
        }
    } else {
        log("handlePresenceUpdate: Licensed for Reports? " + license.Reports);
    }

    // Atualiza presença no array
    var updated = false;
    for (var i = 0; i < presences.length; i++) {
        if (presences[i].src === src) {
            presences[i] = newPresenceEvent;
            updated = true;
            break;
        }
    }
    if (!updated) presences.push(newPresenceEvent);
}


new PbxApi("PbxTableUsers").onconnected(function (conn) {
    log("PbxTableUsers: connected " + JSON.stringify(conn));

    // for each PBX API connection an own call array is maintained
    var signalFound = pbxTable.filter(function (pbx) { return pbx.pbx === conn.pbx });
    if (signalFound.length == 0) {
        pbxTable.push(conn);
        // register to the PBX in order to acceppt incoming presence calls
        conn.send(JSON.stringify({ "api": "PbxTableUsers", "mt": "ReplicateStart", "add": true, "del": true, "columns": { "guid": {}, "dn": {}, "cn": {}, "h323": {}, "e164": {}, "node": {}, "grps": {}, "devices": {} }, "pseudo": [""], "src": conn.pbx }));

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
                log("ReplicateNextResult: request subscribePresence " +obj.columns.dn)
                subscribePresence(obj);
            } catch (e) {
                log("PbxTableUsers:ReplicateNextResult: erro ao atualizar lista de  usuários " + e)
            }
        }
        if (obj.mt == "ReplicateNextResult" && !obj.columns) {
            try {
                reduceUserObject(function (users) {
                    connectionsAdmin.forEach(function (c) {
                        c.send(JSON.stringify({ api: "admin", mt: "TableUsersResult", result: JSON.stringify(users) }));
                    })
                });
                
                
            } catch (e) {
                log("PbxTableUsers:ReplicateNextResult: erro ao notificar usuários sobre tabela atualizada "+ e)
            }
        }
        if (obj.mt == "ReplicateAdd") {
            //pbxTableUsers.push(obj);
            //editado em 05/05/25 para corrigir problemas na Feluma
            var exists = false;
            for (var i = 0; i < pbxTableUsers.length; i++) {
                if (pbxTableUsers[i].columns && pbxTableUsers[i].columns.h323 === obj.columns.h323) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                pbxTableUsers.push(obj);
                subscribePresence(obj);
            }
        }
        if (obj.mt == "ReplicateUpdate") {
            log("ReplicateUpdate= user " + obj.columns.h323);
            try {
                pbxTableUsers.forEach(function (user) {
                    if (user.columns.guid == obj.columns.guid) {
                        obj.badge = user.badge;
                        log("ReplicateUpdate: Updating the object for user " + obj.columns.h323 + " and current Badge is " + user.badge);
                        Object.assign(user, obj);
                    }
                })

            } catch (e) {
                log("PbxTableUsers:ReplicateUpdate: User " + obj.columns.h323 + " Erro " + e)

            }
        }
        if (obj.mt == "ReplicateDel") {
            //pbxTableUsers.splice(pbxTableUsers.indexOf(obj), 1);
            //editado em 05/05/25 para corrigir problemas na Feluma
            removePbxTableUserByGuid(obj.columns.guid);
            unsubscribePresence(obj)
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

function updateBadge(sip, count) {
    //Update Badge
    try {
        for (var pbx in PbxSignalUsers) {
            if (PbxSignalUsers.hasOwnProperty(pbx)) {
                var entry = PbxSignalUsers[pbx];
                entry.forEach(function (e) {
                    if (e.sip == sip) {
                        log('danilo-req updateBadge: PBX:', pbx, ', Call:', e.call, ', Sip:', e.sip);
                        var signal = PbxSignal.filter(function (item) {
                            return item.pbx === pbx;
                        })[0];
                        var msg = {
                            "api": "PbxSignal", "mt": "Signaling", "call": parseInt(e.call, 10), "src": "badge",
                            "sig": {
                                "type": "facility",
                                "fty": [{ "type": "presence_notify", "status": "open", "note": "#badge:" + count, "contact": "app:" }]
                            }
                        };
                        if (signal) {
                            log("danilo-req updateBadge:msg " + JSON.stringify(msg));
                            signal.send(JSON.stringify(msg));
                        }
                    }
                })
            }
        }
    }
    catch (e) {
        log("danilo req: erro send badge: " + e);
    }
}
//Funcions to delete user Call from PbxTableuser API Array
function removePbxTableUserByGuid(guid) {
    log("removePbxTableUserByGuid+++++++++++++++++++++++++++++++is " + JSON.stringify(pbxTableUsers.length));
    for (var j = 0; j < pbxTableUsers.length; j++) {
        if (pbxTableUsers.columns.guid == guid) {
            log("pbxTableUsers[j].columns.guid == guid:" + pbxTableUsers[j].columns.guid + " == " + guid);
            pbxTableUsers.splice(j, 1);
            log("removePbxTableUserByGuid+++++++++++++++++++++++++++++++result " + JSON.stringify(pbxTableUsers.length));
            break;
        }
    }
}
function oldRemoveObjectByCall(arr, pbx, callToRemove) {
    for (var i = 0; i < arr.length; i++) {
        var pbxEntry = arr[i][pbx];
        if (pbxEntry) {
            for (var j = 0; j < pbxEntry.length; j++) {
                if (parseInt(pbxEntry[j].call) === parseInt(callToRemove)) {
                    pbxEntry.splice(j, 1);
                    break;
                }
            }
        }
    }
}
function removeObjectByCall(pbxList, pbx, call) {
    var sipRemoved = null;

    if (pbxList[pbx]) {
        for (var i = 0; i < pbxList[pbx].length; i++) {
            if (pbxList[pbx][i].call === call) {
                sipRemoved = pbxList[pbx][i].sip;
                pbxList[pbx].splice(i, 1); // remove o item
                log("PbxSignalUsers: removed call " + call + " for PBX " + pbx);
                break;
            }
        }

        // se a lista ficar vazia, remover o pbx completamente
        if (pbxList[pbx].length === 0) {
            delete pbxList[pbx];
        }
    }

    return sipRemoved;
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
    date.setUTCHours(date.getUTCHours());

    // Formata a data e hora em uma string ISO 8601 com o caractere "T"
    var dateString = date.toISOString();

    // Substitui o caractere "T" por um espaço
    //dateString = dateString.replace("T", " ");

    // Retorna a string no formato "AAAA-MM-DDTHH:mm:ss.sss"
    return dateString.slice(0, -5);
}

function getDateTimeZone(timeZone) {
        var date = new Date()
        var timeZoneParts = timeZone.split(':');
        var sign = timeZoneParts[0][0]; 
        var number = timeZoneParts[0].slice(1);
        log("SIGN" + sign)

         timeZone.startsWith('+') ? date.setUTCHours(date.getUTCHours() + parseInt(number)) : date.setUTCHours(date.getUTCHours() - parseInt(number))
        //  if (timeZone.startsWith('+')) {
        //     date.setUTCHours(date.getUTCHours() + parseInt(number));  
        // } else{
        //     date.setUTCHours(date.getUTCHours() - parseInt(number));  
        // }
    // Formata a data e hora em uma string ISO 8601 com o caractere "T"
        var dateString = date.toISOString();
    // Retorna a string no formato "AAAA-MM-DDTHH:mm:ss.sss"
    log("Hora Criação " + dateString)
    return dateString.slice(0, -5);

   
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
function createConferenceLink(timeZone,version, flags, roomNumber, meetingId, startTimestamp, endTimestamp, reservedChannels, creationTimestamp, md5Hash, domain, obj) {
    log("version "+version+", flags "+flags+", roomNumber "+roomNumber+", meetingId "+meetingId+", startTimestamp "+startTimestamp+", endTimestamp "+endTimestamp+", reservedChannels "+reservedChannels+", creationTimestamp "+creationTimestamp+", md5Hash "+md5Hash+", domain "+domain);
     
     var adjustedTimeZone = timeZone.startsWith('+') ? timeZone.substring(1) : timeZone;
     log("AdjustedTimeZone " + adjustedTimeZone)

    //  // Converter o horário de início para o fuso horário correto
    // var startDateTime = new Date(startTimestamp);
    // var adjustedStartDateTime = new Date(startDateTime.getTime() + clientTimeZoneOffset * 60000); // 60000 ms em 1 minuto

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


function convertTimeZoneToNumber(timeZone) {
    var sign = timeZone.charAt(0); // Obtém o sinal do fuso horário (+ ou -)
    var offset = parseInt(timeZone.slice(1)); // Obtém o deslocamento numérico do fuso horário
    return sign === '+' ? offset : -offset; // Retorna o número de horas com sinal correto
}

// Função para calcular a diferença entre dois fusos horários //
function calculateTimeZoneDifference(timeZoneClient, timeZoneMyApps) { //+2 - -3=5
    var timeZone1Offset = convertTimeZoneToNumber(String(timeZoneClient));
    log("timeZone1Offset " + timeZone1Offset);
    var timeZone2Offset = convertTimeZoneToNumber(String(timeZoneMyApps));
    log("timeZone2Offset " + timeZone2Offset);
    return timeZone1Offset - timeZone2Offset; // Retorna a diferença entre os fusos horários
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
    var timestamp;
    //var isNegative = String(timeDiff).startsWith('-')
    var date;
    //if (isNegative) {
    date = new Date(year, month, day, hours, minutes)
        timestamp = new Date(year, month, day, hours, minutes).getTime() / 1000
    //} else {
    //    date = new Date(year, month, day, hours + timeDiff, minutes)
    //    timestamp = new Date(year, month, day, hours + timeDiff, minutes).getTime() / 1000
    //}
    //String(timeDiff).startsWith('-') ? timestamp = new Date(year, month, day, hours - timeDiff, minutes).getTime() / 1000  : timestamp = new Date(year, month, day, hours - timeDiff, minutes).getTime() / 1000
    //timestamp = new Date(year, month, day, hours + timeDiff, minutes).getTime() / 1000 
    log("date "+date)
    //var timestamp = new Date(year, month, day, hours, minutes).getTime() / 1000; // Divide by 1000 to get the timestamp in seconds

    return timestamp;
}

function selectUserConfigs(obj, callback){
    Database.exec("SELECT * FROM tbl_user_configs WHERE sip ='" + obj.sip + "';")
            .oncomplete(function (data) {
                log("selectUserConfigs result success = " + JSON.stringify(data))
                msg = { status: 201, msg: data };
                callback(null, msg);
            })
            .onerror(function (error, errorText, dbErrorCode) {
                msg = { status: 400, msg: "ERRO: " + errorText };
                callback(msg);
            });
}
function insertConferenceSchedule(obj, conferenceLink,callback){
    Database.insert("INSERT INTO tbl_schedules (sip, name, email, time_start, time_end, conf_link) VALUES ('" + obj.sip + "','" + obj.name + "','" + obj.email + "','" + obj.time_start + "','" + obj.time_end + "','" + conferenceLink + "')")
    .oncomplete(function (id) {
        msg = { status: 200, msg:  WecomDwcschedulerTexts[0][lang]['labelEventScheduled'] ,id:id };
        callback(null, msg);
    })
    .onerror(function (error, errorText, dbErrorCode) {
        msg = { status: 400, msg: "ERRO: " + errorText };
        callback(msg);
    });
}
function reduceUserObject(callback) {
    log("danilo-req AdminMessage: reducing the pbxTableUser object to send to user");
    var list_users = [];
    pbxTableUsers.forEach(function (u) {
        list_users.push({ sip: u.columns.h323, dn: u.columns.dn, cn: u.columns.cn, guid: u.columns.guid })
    })
    if (callback) { return callback(list_users);}
}
function insertTblAvailability(obj) {
    Database.insert("INSERT INTO tbl_agent_availability (guid, date, status, detail) VALUES ('" + obj.guid + "','" + obj.date + "','" + obj.status + "','" + obj.detail + "')")
        .oncomplete(function () {
            log("insertTblAvailability= Success for user "+ obj.guid);

        })
        .onerror(function (error, errorText, dbErrorCode) {
            log("insertTblAvailability= Erro " + errorText);
        });
}
function insertTblCdrEventJson(cdrParsed) {
    if (!cdrParsed || cdrParsed.tag !== "cdr") return;

    var c = cdrParsed.attrs;
    if (c.related) return;

    // Normaliza children
    var children = Array.isArray(cdrParsed.children) ? cdrParsed.children : [];

    // --- Regra do pseudo no primeiro filho ---
    var firstChild = children[0] || {};
    var firstChildAttrs = firstChild.attrs || {};
    var pseudoFromFirstChild = firstChildAttrs.pseudo;

    if (typeof pseudoFromFirstChild === "string" &&
        pseudoFromFirstChild.toLowerCase() === "app") {
        log("insertTblCdrEventJson = Ignorado pois children[0].pseudo == 'app' para cdr_id " + (c.id || ""));
        return;
    }
    if (typeof pseudoFromFirstChild === "string" &&
        pseudoFromFirstChild.toLowerCase() === "gw") {
        log("insertTblCdrEventJson = Ignorado pois children[0].pseudo == 'gw' para cdr_id " + (c.id || ""));
        return;
    }
    // --- Captura conf do primeiro <event> que possuir attrs.conf ---
    var conf = "";
    for (var i = 0; i < children.length; i++) {
        var ch = children[i];
        if (ch && ch.tag === "event" && ch.attrs && ch.attrs.conf) {
            conf = String(ch.attrs.conf);
            break;
        }
    }

    // --- Define pseudo a salvar (fallback 'user') ---
    var pseudoToSave = pseudoFromFirstChild ? String(pseudoFromFirstChild) : "user";

    var cdr_id = c.id;
    var guid = c.guid;
    var sip = c.h323 || "";
    var cn = c.cn || "";
    var node = c.node || "";
    var dir = c.dir || "";
    var utc = parseInt(c.utc || "0");
    var call = c.call || "";
    var flow = JSON.stringify(cdrParsed.children || []).replace(/'/g, "''");
    var groups = JSON.stringify([]).replace(/'/g, "''");
    if (call != '00000000000000000000000000000000') {

        var query = "INSERT INTO tbl_cdr_events " +
            "(cdr_id, conf, pseudo, guid, sip, cn, node, dir, utc, call, flow, groups) VALUES (" +
            "'" + cdr_id + "', " +
            "'" + conf + "', " +
            "'" + pseudoToSave + "', " +
            "'" + guid + "', " +
            "'" + sip + "', " +
            "'" + cn + "', " +
            "'" + node + "', " +
            "'" + dir + "', " +
            utc + ", " +
            "'" + call + "', " +
            "'" + flow + "', " +
            "'" + groups + "'" +
            ")"; // <-- sem ponto e vírgula

        log("insertTblCdrEventJson = record para a chamada " + cdr_id + " : " + query);

        Database.insert(query)
            .oncomplete(function () {
                log("insertTblCdrEventJson = Sucesso para chamada " + cdr_id);
            })
            .onerror(function (error, errorText, dbErrorCode) {
                log("insertTblCdrEventJson = Erro: " + errorText);
            });
    } else {
        log("insertTblCdrEventJson = Ignorado record para a chamada " + cdr_id + " :call " + call);
    }
}




//CDR Event
//trata o cdr recebido
function requestCDREvent(xmlString) {
    try {
        var parsed = parseCDREventData(xmlString);
        
        if (parsed == null) {
            var parsed = parseXmlToObject(xmlString)
            removeGrpTags(parsed); // limpa os grp antes de salvar
            log("requestCDREvent: XML parsed: " + JSON.stringify(parsed, null, 2));
            insertTblCdrEventJson(parsed);
        } else {
            //log("requestCDREvent URI parsed: " + JSON.stringify(parsed));
        }

    }
    catch (e) {
        log("requestCDREvent: error: " + JSON.stringify(e.message))
    };

}
function removeGrpTags(obj) {
    if (!obj || typeof obj !== 'object') return;

    if (obj.children && Object.prototype.toString.call(obj.children) === '[object Array]') {
        var newChildren = [];
        for (var i = 0; i < obj.children.length; i++) {
            var child = obj.children[i];
            if (child.tag !== "grp") {
                removeGrpTags(child); // chamada recursiva
                newChildren.push(child);
            }
        }
        obj.children = newChildren;
    }
}


//parser do cdr uri para json
function parseCDREventData(data) {
    if (data.indexOf("?event=") === 0) {
        var query = data.substring(1); // remove o "?"
        var parts = query.split("&");
        var result = {};

        for (var i = 0; i < parts.length; i++) {
            var keyValue = parts[i].split("=");
            var key = decodeURIComponent(keyValue[0]);
            var value = keyValue.length > 1 ? decodeURIComponent(keyValue[1]) : "";
            result[key] = value;
        }

        return result; // objeto com os campos extraídos
    }

    // fallback para XML, ou null se não for XML nem query string
    return null;
}

//parser do xml para json
function parseXmlToObject(xml) {
    function parseAttrs(str) {
        var attrs = {};
        var re = /(\w+)=["'](.*?)["']/g;
        var match;
        while ((match = re.exec(str))) {
            attrs[match[1]] = match[2];
        }
        return attrs;
    }

    function parseTag(xml, startIndex) {
        var tagStart = xml.indexOf("<", startIndex);
        if (tagStart === -1) return null;

        // Checar se é fechamento
        if (xml[tagStart + 1] === '/') {
            var tagEnd = xml.indexOf(">", tagStart);
            return {
                type: "close",
                tag: xml.slice(tagStart + 2, tagEnd).trim(),
                next: tagEnd + 1
            };
        }

        var tagEnd = xml.indexOf(">", tagStart);
        var isSelfClosing = xml[tagEnd - 1] === '/';
        var tagContent = xml.slice(tagStart + 1, isSelfClosing ? tagEnd - 1 : tagEnd);
        var spaceIndex = tagContent.indexOf(" ");
        var tagName = spaceIndex === -1 ? tagContent : tagContent.slice(0, spaceIndex);
        var attrString = spaceIndex === -1 ? "" : tagContent.slice(spaceIndex + 1);

        return {
            type: isSelfClosing ? "self" : "open",
            tag: tagName,
            attrs: parseAttrs(attrString),
            next: tagEnd + 1
        };
    }

    function parseRecursive(xml, startIndex, expectedTag) {
        var result = [];
        var i = startIndex;

        while (i < xml.length) {
            var nextTag = parseTag(xml, i);
            if (!nextTag) break;

            i = nextTag.next;

            if (nextTag.type === "close") {
                if (nextTag.tag === expectedTag) break;
                else continue;
            }

            var child = {
                tag: nextTag.tag,
                attrs: nextTag.attrs,
                children: []
            };

            if (nextTag.type === "open") {
                var parsedChildren = parseRecursive(xml, i, nextTag.tag);
                child.children = parsedChildren.children;
                i = parsedChildren.next;
            }

            result.push(child);
        }

        return { children: result, next: i };
    }

    // Limpar cabeçalho XML se existir
    var xmlBody = xml.replace(/<\?xml.*?\?>/, '').trim();

    // Começar pelo elemento raiz (esperamos <cdr>)
    var rootTag = parseTag(xmlBody, 0);
    if (!rootTag || rootTag.type !== "open") return null;

    var root = {
        tag: rootTag.tag,
        attrs: rootTag.attrs,
        children: []
    };

    var parsed = parseRecursive(xmlBody, rootTag.next, rootTag.tag);
    root.children = parsed.children;

    return root;
}


