﻿// inicio db files


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


// fim db files

function pbxTableRequest(value) {
    //var value = {sip:"danilo.volz", hw:"00556a524",mode:"Login/Logout"}
    //var obj = JSON.parse(String(value));
    // log("Value Request:" + JSON.stringify(value))
    var obj = value
    log("danilo-req pbxTableRequest:value " + String(obj.sip));
    var user = pbxTableUsers.filter(function (user) { return user.columns.h323 === obj.sip });
    var found = false;

    if (user[0].columns.devices) {
        log("danilo-req pbxTableRequest:Objeto contem colunms.grps" + JSON.stringify(user[0].columns));
        user[0].columns.devices.forEach(function (dev) {
            if (dev.hw == obj.hw) {
                found = true;
                log("danilo-req pbxTableRequest: Device founded changing")
                if (obj.mode == "Login") {
                    user[0].columns.devices.push({ hw: obj.hw, text: "Telefone", app: "phone", tls: true, trusted: true })
                }
                if (obj.mode == "Logout") {
                    const devices = [];
                    user[0].columns.devices = devices; 
                }
            }

        })
        if (!found) {
            log("danilo-req pbxTableRequest: Device not founded including it");
            if (obj.mode == "Login") {
                user[0].columns.devices.push({ hw: obj.hw, text: "Telefone", app: "phone", tls: true, trusted: true })
            }
            if (obj.mode == "Logout") {
                const devices = [];
                user[0].columns.devices = devices;
            }
        }
        //Teste do problema de antrar e sair de grupos
        if (pbxTable.length > 0) {
            user[0].mt = "ReplicateUpdate";
            log("danilo-req pbxTable: found PBX connection user " + JSON.stringify(user[0]));
            pbxTable[0].send(JSON.stringify(user[0]));
        } else {
            log("danilo-req pbxTable: PBX connection is 0 ");
        }
        // pbxTable.forEach(function (conn) {
        //     log("danilo-req pbxTable: forEach conn "+ JSON.stringify(conn));
        //     if (conn.pbx == user[0].src) {
        //         user[0].mt="ReplicateUpdate";
        //         log("danilo-req pbxTable: found PBX connection user "+ JSON.stringify(user[0]));
        //         conn.send(JSON.stringify(user[0]));
        //     }
        // })
        pbxTableUsers.forEach(function (u) {
            if (u.columns.h323 == user[0].columns.h323) {
                user[0].mt = "ReplicateNextResult";
                Object.assign(u, user[0])
                log("danilo-req pbxTable: pbxTableUsers list updated " + JSON.stringify(pbxTableUsers));
            }
        })

    }
    else {
        log("danilo-req pbxTableRequest:Objeto nno contem colunms.grps" + JSON.stringify(user[0].columns));
        if (obj.mode == "Login") {
            //user[0].columns.grps = [];
            //user[0].columns.grps.push({ name: obj.group, dyn: "in" })
            const devices = [
                //{
                //    "name": obj.group,
                //    "dyn": "in"
                //}
            ];
            user[0].columns.devices = devices;
            user[0].columns.devices.push({ hw: obj.hw, text: "Telefone", app: "phone", tls: true, trusted: true })
        }
        if (obj.mode == "Logout") {
            //user[0].columns.grps = [];
            //user[0].columns.grps.push({ name: obj.group, dyn: "out" })
            const devices = [
                //{
                //    "name": obj.group,
                //    "dyn": "out"
                //}
            ];
            user[0].columns.devices = devices;
            
        }
        pbxTable.forEach(function (conn) {
            if (conn.pbx == user[0].src) {
                user[0].mt = "ReplicateUpdate";
                log("danilo-req pbxTableRequest:Objeto a ser enviado no pbxTable " + JSON.stringify(user[0]));
                conn.send(JSON.stringify(user[0]));
            }
        })
        pbxTableUsers.forEach(function (u) {
            if (u.columns.h323 == user[0].columns.h323) {
                user[0].mt = "ReplicateNextResult";
                Object.assign(u, user[0])
                log("danilo-req pbxTableRequest:Objeto atualizado no pbxTableUsers " + JSON.stringify(u));
            }
        })

    }
}

function filterObjectsByDevice(objects, mac) {
    log("PbxTableUsersINTEIRA:" + JSON.stringify(pbxTableUsers))
    var filteredObjects = [];

    for (var i = 0; i < objects.length; i++) {
        var object = objects[i];
        var devices = object.columns.devices;

        if (devices && devices.length) {
            for (var j = 0; j < devices.length; j++) {
                if (devices[j].hw == mac) {
                    filteredObjects.push(object);
                    log("filterObjectsByDevice: filteredObjects " + JSON.stringify(filteredObjects));
                    return filteredObjects; 
                }
            }
        }else{
            log("Devices nao existe!")
        }
    }
    return filteredObjects;
}

new JsonApi("user").onconnected(function(conn) {
    if (conn.app == "wecom-coolwork") {
    }
});

new JsonApi("admin").onconnected(function(conn) {
    PbxApi = conn
    if (conn.app == "wecom-coolworkadmin") {
        conn.onmessage(function(msg) {
            var obj = JSON.parse(msg);
            log("Message OBJ:" + JSON.stringify(obj))
            if (obj.mt == "SetPresence") {
                handleSetPresenceMessage(conn.sip, obj.note, obj.activity)
            };
            if (obj.mt == "TableUsers") {
                log("danilo-req AdminMessage: reducing the pbxTableUser object to send to user");
                var list_users = [];
                pbxTableUsers.forEach(function (u) {
                    list_users.push({ cn: u.columns.cn, guid: u.columns.guid })
                })
                conn.send(JSON.stringify({ api: "admin", mt: "TableUsersResult", result: JSON.stringify(list_users), src: obj.src }));
            }
            if (obj.mt == "PhoneList") {
                var devices = [];
                devices = obj.devices;
                log("PhoneList: devices " + JSON.stringify(devices));
                devices.forEach(function (dev) {
                    log("PhoneList: dev" + JSON.stringify(dev))
                    var filteredObject = filterObjectsByDevice(pbxTableUsers, dev.hwId);
                    log("PhoneList: filteredObject" + JSON.stringify(filteredObject))
                    log("hw id" + dev.hwId)
                    if (filteredObject.length > 0) {
                        log("PhoneList: filteredObject>0")
                        dev.sip = filteredObject[0].columns.h323;
                        dev.cn = filteredObject[0].columns.cn;
                        dev.guid = filteredObject[0].columns.guid;
                        Database.exec("DELETE FROM tbl_devices WHERE room_id IS NULL") 
                        .oncomplete(function () {
                        Database.exec("INSERT INTO tbl_devices (hwid, pbxactive, online, product, sip, cn, guid) SELECT '" + dev.hwId + "','" + dev.pbxActive + "','" + dev.online + "','" + dev.product + "','" + dev.sip + "','" + dev.cn + "','" + dev.guid + "' WHERE NOT EXISTS (SELECT 1 FROM tbl_devices WHERE hwid = '" + dev.hwId + "')")
                        .oncomplete(function (data) {
                        log("InsertSuccess" + JSON.stringify(data))
                        conn.send(JSON.stringify({ api: "admin", mt: "InsertDevicesResult", src: data.src }));
                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                                log("InsertDevicesResult:result=Error " + String(errorText));
                        });

                    })
                .onerror(function (error, errorText, dbErrorCode) {
                    conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText) }));
                });
      
                // log("PhoneList: PhoneListResult devices " + JSON.stringify(devices))
                // conn.send(JSON.stringify({ api: "admin", mt: "PhoneListResult", result: devices, src: obj.src }));
            }
            
        })
    }
            if (obj.mt == "SelectDevices") {
                Database.exec("SELECT * FROM tbl_devices WHERE room_id IS NULL")
                .oncomplete(function (data) {
                log("SelectSuccess" + JSON.stringify(data))
                conn.send(JSON.stringify({ api: "admin", mt: "SelectDevicesResult", result: JSON.stringify(data), src: data.src }));
                })
                .onerror(function (error, errorText, dbErrorCode) {
                        log("SelectDevicesResult:result=Error " + String(errorText));
                });
            }
            if (obj.mt == "InsertRoom") {
                Database.exec("INSERT INTO tbl_room (name, img) VALUES ('" + obj.name + "','" + obj.img + "') RETURNING id")
                    .oncomplete(function (roomData) {
                        var roomID = roomData[0].id; 
            
                        Database.exec("INSERT INTO tbl_room_schedule (type, data_start, data_end, schedule_module, room_id) VALUES ('" + obj.type + "','" + obj.dateStart + "','" + obj.dateEnd + "','" + obj.schedule + "','" + roomID + "')")
                            .oncomplete(function (scheduleData) {
                                conn.send(JSON.stringify({ api: "admin", mt: "InsertRoomResult", src: scheduleData.src }));
                            })
                            .onerror(function (error, errorText, dbErrorCode) {
                                log("Erro ao inserir na tbl_room_schedule: " + String(errorText));
                            });
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        log("Erro ao inserir na tbl_room: " + String(errorText));
                    });
            }
            
            if (obj.mt == "SelectAllRoom") { // revisar 04/10
                Database.exec("SELECT * FROM tbl_room")
                .oncomplete(function (data) {
                log("SelectSuccess" + JSON.stringify(data))
                conn.send(JSON.stringify({ api: "admin", mt: "SelectAllRoomResult", result: JSON.stringify(data), src: data.src }));
                })
                .onerror(function (error, errorText, dbErrorCode) {
                        log("SelectAllRoomResult:result=Error " + String(errorText));
                });
            }
            if (obj.mt == "SelectRoom") {
                var roomId = obj.id;
            
                var querySelectRoom = "SELECT * FROM tbl_room WHERE id = " + roomId + ";";
                var querySelectDevices = "SELECT * FROM tbl_devices WHERE room_id = " + roomId + ";";
                var querySelectRoomSchedule = "SELECT * FROM tbl_room_schedule WHERE room_id =" + roomId + ";"; 
                Database.exec(querySelectRoom)
                    .oncomplete(function (roomData) {
                        Database.exec(querySelectDevices)
                            .oncomplete(function (deviceData) {
                                Database.exec(querySelectRoomSchedule)
                                    .oncomplete(function (roomScheduleData) {
                                        conn.send(JSON.stringify({ api: "admin", mt: "SelectRoomResult", rooms: JSON.stringify(roomData), dev: deviceData, schedules: JSON.stringify(roomScheduleData)  }));
                                    })
                                    .onerror(function (error, errorText, dbErrorCode) {
                                        log("SelectRoomResult: Error ao selecionar tabela tbl_room_schedule: " + String(errorText));
                                    });
                            })
                            .onerror(function (error, errorText, dbErrorCode) {
                                log("SelectRoomResult: Error ao selecionar tabela tbl_devices: " + String(errorText));
                            });
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        log("SelectRoomResult: Error ao selecionar sala: " + String(errorText));
                    });
            }
            
            if (obj.mt == "DeleteRoom") {
                var roomId = obj.id;
                var queryUpdateDevices = "UPDATE tbl_devices SET room_id = NULL WHERE room_id = " + roomId + ";";
                Database.exec(queryUpdateDevices)
                    .oncomplete(function (updateResult) {
                        if (updateResult) {
                            Database.exec("DELETE FROM tbl_room WHERE id = " + roomId)
                                .oncomplete(function (deleteResult) {
                                    log("DeleteRoom: Sala excluída com sucesso");
                                    conn.send(JSON.stringify({ api: "admin", mt: "DeleteRoomSuccess" }));
                                })
                                .onerror(function (error, errorText, dbErrorCode) {
                                    log("DeleteRoom: Erro ao excluir a sala: " + String(errorText));
                                    conn.send(JSON.stringify({ api: "admin", mt: "DeleteRoomError", error: String(errorText) }));
                                });
                        } else {
                            //log("DeleteRoom: Erro ao atualizar dispositivos: " + String(updateResult.errorText));
                           // conn.send(JSON.stringify({ api: "admin", mt: "DeleteRoomError", error: String(updateResult.errorText) }));
                        }
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        log("DeleteRoom: Erro ao atualizar dispositivos: " + String(errorText));
                        conn.send(JSON.stringify({ api: "admin", mt: "DeleteRoomError", error: String(errorText) }));
                    });
            }
            if(obj.mt == "DeleteDeviceFromRoom"){
                var sql = "UPDATE tbl_devices SET room_id = null WHERE hwid = '" + obj.hwid + "'";
                Database.exec(sql)
                .oncomplete(function (updatereulst) {
                    conn.send(JSON.stringify({ api: "admin", mt: "DeleteDeviceFromRoomSuccess" }));
                })
                .onerror(function (error, errorText, dbErrorCode) {
                    conn.send(JSON.stringify({ api: "admin", mt: "DeleteDeviceFromRoomError", error: String(errorText) }));
                });
            }           
            if (obj.mt == "UpdateDeviceRoom") {
                var devices = [];
                devices = obj.devices;

                if (devices.length == 0) {
                    var sql = "UPDATE tbl_devices SET topoffset = null, leftoffset = null, room_id = null WHERE room_id = " + obj.room;
                    Database.exec(sql)
                        .oncomplete(function (data) {
                            log("UpdateSuccess" + JSON.stringify(data));
                            conn.send(JSON.stringify({ api: "admin", mt: "UpdateDevicesResult", src: data.src }));
                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            log("UpdateDevicesResult:result=Error " + String(errorText));
                        });

                } else {
                    devices.forEach(function (dev) {
                        var sql = "UPDATE tbl_devices SET topoffset = " + dev.topoffset + ", leftoffset = " + dev.leftoffset + ", room_id = " + dev.room_id + " WHERE hwid = '" + dev.hwid + "'";
                        Database.exec(sql)
                            .oncomplete(function (data) {
                                log("UpdateSuccess" + JSON.stringify(data));
                                conn.send(JSON.stringify({ api: "admin", mt: "UpdateDevicesResult", src: data.src }));
                            })
                            .onerror(function (error, errorText, dbErrorCode) {
                                log("UpdateDevicesResult:result=Error " + String(errorText));
                            });
                    });
                }   
            } 

            if(obj.mt == "UpdatePresence"){
                 notePresence = []
                 notePresence = obj.note
                 log("NotePresence" + notePresence)
                 log("NotePresence" + JSON.stringify(notePresence))
                 log("SIP DO CARA" + conn.sip)
                 //log("HW DO CARA" + conn.hw)
                 // HW 
            }

            if (obj.mt == "LoginPhone") {
                var value = { sip: conn.sip, hw: obj.hw, mode: "Login" }
                pbxTableRequest(value);
            }
            if (obj.mt == "LoginPhone") {
                var value = { sip: conn.sip, hw: obj.hw, mode: "Logout" }
                pbxTableRequest(value);
            }
    })
}
});
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


// function checkAppointments() {
//     log("CHECKAPOOINTMENTS")
//     setInterval(function () {
//       var now = getDateNow();
//       Database.exec("SELECT * FROM tbl_device_schedule")

//       log("APPOINTMENT")
//       .oncomplete(function (data) {
//       log("AppointmentsSuccess" + JSON.stringify(data))
//         //   var sip = row.sip;
//         //   var dateEnd = new Date(row.date_end);
//         //   var note = ''; // Note might be empty based on your requirements
//         //   var activity = 'available';
//         const sip = "Erick";
//         const dateEnd = "2023-10-25T17:50";
//         const note = 'Appointments'; // Note might be empty based on your requirements
//         const activity = 'available';

//         // Call the handleSetPresenceMessage function
//         handleSetPresenceMessage(sip, note, activity);

//         // Check if dateEnd is within 30, 15, or 5 minutes
//         checkTimeRemaining(sip, dateEnd);
//       })
//       .onerror(function (error, errorText, dbErrorCode) {
//               log("SelectAllRoomResult:result=Error " + String(errorText));
//       });



//     }, 60000); // 60000 milliseconds = 1 minute
//   }
  
//   // Function to check time remaining
//   function checkTimeRemaining(sip, dateEnd) {
//     var now = new Date(getDateNow());
//     var timeRemaining = dateEnd - now;
//     var minutesRemaining = Math.ceil(timeRemaining / 60000); // Convert milliseconds to minutes
  
//     if (minutesRemaining === 30 || minutesRemaining === 15 || minutesRemaining === 5) {
//       var note = 'Last ' + minutesRemaining + ' minutes';
//       var activity = 'away';
//       handleSetPresenceMessage(sip, note, activity);
//     }
//   }
  
//   // Example of how to use the function
//   checkAppointments();

var pbxApi = {}
new PbxApi("PbxApi").onconnected(function (conn) {
    log("PbxApi conectada", conn)
    pbxApi = conn
    conn.onmessage(function (msg) {
        var obj = JSON.parse(msg);
        log("PbxApi msg: " + msg);
    })

    conn.onclose(function () {
        pbxApi = {}
        log("PbxApi: disconnected");
    });
});
function handleSetPresenceMessage(sip, note, activity) {
    log("handle LOG - SET PRESENCE MSG:", sip, note)
    // Enviar a mensagem para a conexão PbxApi
    pbxApi.send(JSON.stringify({
        "api": "PbxApi",
        "mt": "SetPresence",
        "sip": sip,
        "activity": activity,
        "note": note
    }));

}
     //conn.send(json.stringify({
     //         "api": "pbxapi",
     //         "mt": "setpresence",
     //         "sip": "erick",
     //         "activity" : "",
     //         "note": "on start"
     //}));

//     // if (conn.app == "wecom-coolworkadmin") {
//     //     conn.onmessage(function(msg) {
//     //         var obj = JSON.parse(msg);
//     //         log("Message OBJ:" + JSON.stringify(obj))
//     //         if (obj.mt == "SetPresence") {
//     //             console.log("ADMIN SET PRESENCE OBJ:",obj)
//     //             console.log("ADMIN SET PRESENCE MSG:", msg)
//     //             log("ADMIN LOG - SET PRESENCE OBJ:",obj)
//     //             log("ADMIN LOG - SET PRESENCE MSG:", msg)
//     //             conn.send(JSON.stringify({
//     //                 "api": "PbxApi",
//     //                 "mt": "SetPresence",
//     //                 "sip": "Erick",
//     //                 "activity" : "busy",
//     //                 "note": "CONN API"
//     //             }));
                
//     //         };
//     //     });
//     //     if (presence.length != '' ){
//     //         conn.send(JSON.stringify({
//     //             "api": "PbxApi",
//     //             "mt": "SetPresence",
//     //             "sip": "Erick",
//     //             "activity" : "busy",
//     //             "note": "PRESENCE-UPDATE"
//     //         }));
//     //     }
//     // }

// })
    // conn.setFlowControl(true)
    //     .onmessage(function(msg) {
    //     log("ERICK SET PbxApi:",JSON.stringify(conn))
    //         var obj = JSON.parse(msg);
    //         if (obj.mt == "SubscribePresenceResult") {
    //             // do something
    //         }
    //         conn.messageComplete();
    //     });

var pbxTable = [];
var pbxTableUsers = [];
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
        log("PbxTableUsers msg: " + msg);
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