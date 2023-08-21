var connectionsUser = [];
var license = getLicense();

//Config variables
var licenseAppToken = Config.licenseAppToken;

var licenseAppFile = Config.licenseAppFile;
var licenseInstallDate = Config.licenseInstallDate;

var now = new Date();  // Cria uma instância da data atual
var futureDate = new Date(now);  // Cria uma cópia da instância atual
futureDate.setDate(futureDate.getDate() + 29);  // Adiciona 29 dias à data
log("danilo-req:futureDate:  " + futureDate);
Config.appInstallDate = String(futureDate);
Config.save();

var appInstallDate = Config.appInstallDate;
log("danilo-req:START:appInstallDate:  " + appInstallDate);
if (licenseAppToken == "") {
    var rand = Random.bytes(16);
    Config.licenseAppToken = String(rand);
    
    var now = new Date();  // Cria uma instância da data atual
    var futureDate = new Date(now);  // Cria uma cópia da instância atual
    futureDate.setDate(futureDate.getDate() + 29);  // Adiciona 29 dias à data
    log("danilo-req:futureDate:  " + futureDate);
    Config.appInstallDate = futureDate;
    Config.save();
}

Config.onchanged(function () {
    licenseAppFile = Config.licenseAppFile;
    licenseInstallDate = Config.licenseInstallDate;
    appInstallDate =  Config.appInstallDate;
})

new JsonApi("user").onconnected(function (conn) {
    if (conn.app == "wecom-billboard") {
        // log("connectionsUser: license.Users " + license.Users);
        connectionsUser.push(conn);
        log("Usuario Conectado:  " + connectionsUser.length);
        
        conn.onmessage(function (msg) {
            var now = Date();
            var appInstallDate = Config.appInstallDate;
            log("danilo-req:Now:  " + now);
            log("danilo-req:appInstallDate:  " + appInstallDate);
            if (license != null && connectionsUser.length <= license.Users || now <= appInstallDate  ) {
                var obj = JSON.parse(msg);
                if (obj.mt == "Ping") {
                    conn.send(JSON.stringify({ api: "user", mt: "Pong", src: obj.src }));
                }
                if (obj.mt == "SelectViewHistory") {
                    selectViewsHistory(conn.sip, conn);
                }
                if (obj.mt == "TableUsers") {
                    log("danilo-req AdminMessage: reducing the pbxTableUser object to send to user");
                    var list_users = [];
                    pbxTableUsers.forEach(function (u) {
                        list_users.push({ cn: u.columns.cn, guid: u.columns.guid })
                    })
                    selectViewsHistory(conn.sip, conn);

                    var query = "SELECT create_department FROM tbl_admins WHERE guid ='" + conn.guid + "'";
                    Database.exec(query)
                        .oncomplete(function (data) {
                            log("tbl_admins:result=" + JSON.stringify(data, null, 4)+" data.lenght="+data.lenght);
                            var adm = data;
                            if (adm.length > 0) {
                                adm = true;
                            } else {
                                adm = false;
                            }
                            conn.send(JSON.stringify({ api: "user", mt: "TableUsersResult", result: JSON.stringify(list_users), create_department: Boolean(adm), src: obj.src }));
                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                        });
                    
                }
                if (obj.mt == "InsertPost") {
                    var now = getDateNow();
                    Database.exec("INSERT INTO tbl_posts (user_guid, color, title, description, department, date_creation, date_start, date_end) VALUES ('" + conn.guid + "','" + obj.color + "','" + obj.title + "','" + obj.description + "','" + obj.department + "','" + now + "','" + obj.date_start + "','" + obj.date_end + "')")
                        .oncomplete(function () {
                            log("InsertPost:result=success");
                            conn.send(JSON.stringify({ api: "user", mt: "InsertPostSuccess", src: obj.department }));

                            //Atualiza usuários sobre NEW Post
                            for (var pbx in PbxSignalUsers) {
                                if (PbxSignalUsers.hasOwnProperty(pbx)) {
                                    var entry = PbxSignalUsers[pbx];
                                    entry.forEach(function (e) {
                                        selectViewsHistory(e.sip);
                                    })
                                }
                            }
                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                        });
                }
                if (obj.mt == "UpdatePost") {
                    Database.exec("UPDATE tbl_posts SET color = '" + obj.color + "', title = '" + obj.title + "', description = '" + obj.description + "', department = '" + obj.department + "', date_start = '" + obj.date_start + "', date_end = '" + obj.date_end + "' WHERE id = " + obj.id)
                        .oncomplete(function () {
                            log("UpdatePost:result=success");

                            // Atualize os usuários sobre o post atualizado, se necessário
                            for (var pbx in PbxSignalUsers) {
                                if (PbxSignalUsers.hasOwnProperty(pbx)) {
                                    var entry = PbxSignalUsers[pbx];
                                    entry.forEach(function (e) {
                                        selectViewsHistory(e.sip);
                                    });
                                }
                            }

                            conn.send(JSON.stringify({ api: "user", mt: "UpdatePostSuccess", src: obj.department }));
                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                        });
                }
                if (obj.mt == "DeletePost") {
                    var now = getDateNow();
                    var query = "UPDATE tbl_posts SET deleted = '" + now + "', deleted_guid = '" + conn.guid + "' WHERE id = '" + obj.id + "'";
                    Database.exec(query)
                        .oncomplete(function () {
                            log("UpdateDeletedColumns:result=success");
                            conn.send(JSON.stringify({ api: "user", mt: "DeletePostSuccess", src:obj.src }));
                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                        });

                }
                if (obj.mt == "InsertViewHistory") {
                    var now = getDateNow();
                    Database.exec("INSERT INTO tbl_views_history (user_guid, post_id, date) VALUES ('" + conn.guid + "','" + obj.post + "','" + now + "')")
                        .oncomplete(function () {
                            log("InsertViewHistory:result=success");
                            conn.send(JSON.stringify({ api: "user", mt: "InsertViewHistorySuccess", src: obj.src }));
                            selectViewsHistory(conn.sip, conn);
                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                        });
                }
                if (obj.mt == "SelectHistoryByPost") {
                    var now = getDateNow();
                    Database.exec("SELECT * FROM tbl_views_history where post_id ='" + obj.post + "'")
                        .oncomplete(function (data) {
                            log("SelectHistoryByPost:result=success");
                            conn.send(JSON.stringify({ api: "user", mt: "SelectHistoryByPostResult", src: obj.src, result: JSON.stringify(data) }));
                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                        });
                }
                if (obj.mt == "SelectPosts") {
                    var query = "SELECT * FROM tbl_posts WHERE department ='" + obj.department + "'";
                    if (obj.query) {
                        query += obj.query;
                    } else {
                        var end = getDateNow();
                        var start = getDateNow();
                        query += " AND date_start <= '" + start + "' AND date_end >= '" + end + "' AND deleted IS NULL";
                    }
                    //var query = "SELECT * FROM tbl_posts where department ='" + obj.department + "';";
                    //query com condição de data e horario
                    //var end = getDateNow();
                    //var start = getDateNow();
                    //var query;
                    //if (obj.deleted) {
                    //    var query = "SELECT * FROM tbl_posts WHERE department ='" + obj.department +
                    //        "' AND date_start >= '" + start + "' AND date_end <= '" + end + "'";
                    //} else {
                    //    var query = "SELECT * FROM tbl_posts WHERE department ='" + obj.department +
                    //        "' AND date_start >= '" + start + "' AND date_end <= '" + end + "' AND deleted IS NULL";
                    //}
                    //var query = "SELECT * FROM tbl_posts WHERE department ='" + obj.department + "' AND '"+start+"' >= date_start AND '"+end+"' < date_end AND deleted IS NULL";
                    Database.exec(query)
                        .oncomplete(function (data) {
                            log("SelectPosts:result=" + JSON.stringify(data, null, 4));
                            conn.send(JSON.stringify({ api: "user", mt: "SelectPostsResult", src: obj.src, result: JSON.stringify(data, null, 4), department: obj.department }));
                            var queryV = "SELECT viewer_guid FROM tbl_department_viewers WHERE department_id =" + parseInt(obj.department, 10);
                            Database.exec(queryV)
                                .oncomplete(function (data) {
                                    log("SelectPosts:viewer_guid result=" + JSON.stringify(data, null, 4));
                                    conn.send(JSON.stringify({ api: "user", mt: "SelectDepartmentViewersResult", src: obj.src, result: JSON.stringify(data, null, 4), department: obj.department }));

                                    var queryE = "SELECT editor_guid FROM tbl_department_editors WHERE department_id =" + parseInt(obj.department, 10);
                                    Database.exec(queryE)
                                        .oncomplete(function (data) {
                                            log("SelectPosts:editor_guid result=" + JSON.stringify(data, null, 4));
                                            conn.send(JSON.stringify({ api: "user", mt: "SelectDepartmentEditorsResult", src: obj.src, result: JSON.stringify(data, null, 4), department: obj.department }));
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
                if (obj.mt == "SelectDepartments") {
                    log("SelectDepartments:");
                    selectViewsHistory(conn.sip, conn);
                    var queryViewer;
                    if (obj.deleted) {
                        var queryViewer = "SELECT d.id, d.name, d.color FROM tbl_departments d JOIN tbl_department_viewers v ON d.id = v.department_id WHERE v.viewer_guid = '" + conn.guid + "';";
                    } else {
                        //Query para Departamentos Não Excluídos
                        var queryViewer = "SELECT d.id, d.name, d.color FROM tbl_departments d JOIN tbl_department_viewers v ON d.id = v.department_id WHERE v.viewer_guid = '" + conn.guid + "' AND d.deleted IS NULL;";
                    }
                    Database.exec(queryViewer)
                        .oncomplete(function (dataUsersViewer) {
                            log("SelectDepartments:result=" + JSON.stringify(dataUsersViewer, null, 4));
                            conn.send(JSON.stringify({ api: "user", mt: "SelectUserDepartmentsViewerResult", src: obj.src, result: JSON.stringify(dataUsersViewer, null, 4) }));
                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                        });
                    if (obj.deleted) {
                        var queryEditor = "SELECT d.id, d.name, d.color FROM tbl_departments d JOIN tbl_department_editors v ON d.id = v.department_id WHERE v.editor_guid = '" + conn.guid + "';";
                    } else {
                        //Query para Departamentos Não Excluídos
                        var queryEditor = "SELECT d.id, d.name, d.color FROM tbl_departments d JOIN tbl_department_editors v ON d.id = v.department_id WHERE v.editor_guid = '" + conn.guid + "' AND d.deleted IS NULL;";
                    }
                    Database.exec(queryEditor)
                        .oncomplete(function (dataUsersViewer) {
                            log("SelectDepartments:result=" + JSON.stringify(dataUsersViewer, null, 4));

                            conn.send(JSON.stringify({ api: "user", mt: "SelectUserDepartmentsEditorResult", src: obj.src, result: JSON.stringify(dataUsersViewer, null, 4) }));
                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                        });
                }
                if (obj.mt == "InsertDepartment") {
                    Database.exec("INSERT INTO tbl_departments (name, color) VALUES ('" + obj.name + "','" + obj.color + "')")
                        .oncomplete(function () {
                            log("InsertDepartment:result=success ");

                            Database.exec("SELECT id FROM tbl_departments where name ='" + obj.name + "';")
                                .oncomplete(function (data) {
                                    log("SelectDepartments:result=" + data[0].id);
                                    var viewers = obj.viewers;
                                    viewers.forEach(function (v) {
                                        Database.exec("INSERT INTO tbl_department_viewers (department_id, viewer_guid) VALUES (" + parseInt(JSON.stringify(data[0].id), 10) + ",'" + v + "')")
                                            .oncomplete(function () {
                                                log("InsertDepartmentViewer:result=success");

                                            })
                                            .onerror(function (error, errorText, dbErrorCode) {
                                                log("InsertDepartmentViewer:result=Error " + String(errorText));
                                            });
                                    })
                                    var editors = obj.editors;
                                    editors.forEach(function (e) {
                                        Database.exec("INSERT INTO tbl_department_editors (department_id, editor_guid) VALUES ('" + parseInt(JSON.stringify(data[0].id), 10) + "','" + e + "')")
                                            .oncomplete(function () {
                                                log("InsertDepartmentEditor:result=success");

                                            })
                                            .onerror(function (error, errorText, dbErrorCode) {
                                                log("InsertDepartmentEditor:result=Error " + String(errorText));
                                            });
                                    })
                                    conn.send(JSON.stringify({ api: "user", mt: "InsertDepartmentSuccess" }));

                                })
                                .onerror(function (error, errorText, dbErrorCode) {

                                });

                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                        });
                }
                if (obj.mt == "DeleteDepartment") {
                    var now = getDateNow();
                    var query = "UPDATE tbl_departments SET deleted = '" + now + "', deleted_guid = '" + conn.guid + "' WHERE id = '" + obj.id + "'";
                    Database.exec(query)
                        .oncomplete(function () {
                            log("UpdateDeletedColumns:result=success");
                            conn.send(JSON.stringify({ api: "user", mt: "DeleteDepartmentSuccess" }));
                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                        });
                }
                if (obj.mt == "UpdateDepartment") {
                    Database.exec("UPDATE tbl_departments SET name = '" + obj.name + "', color = '" + obj.color + "' WHERE id = " + obj.id)
                        .oncomplete(function () {
                            log("UpdateDepartment:result=success");

                            var viewers = obj.viewers;
                            var editors = obj.editors;

                            // Primeiro, exclua os registros antigos da tabela tbl_department_viewers e tbl_department_editors
                            Database.exec("DELETE FROM tbl_department_viewers WHERE department_id = " + obj.id)
                                .oncomplete(function () {
                                    log("DeleteDepartmentViewers:result=success");

                                    // Agora insira os novos registros em tbl_department_viewers
                                    viewers.forEach(function (v) {
                                        Database.exec("INSERT INTO tbl_department_viewers (department_id, viewer_guid) VALUES (" + obj.id + ",'" + v + "')")
                                            .oncomplete(function () {
                                                log("InsertDepartmentViewer:result=success");
                                            })
                                            .onerror(function (error, errorText, dbErrorCode) {
                                                log("InsertDepartmentViewer:result=Error " + String(errorText));
                                            });
                                    });

                                    // Exclua os registros antigos da tabela tbl_department_editors
                                    Database.exec("DELETE FROM tbl_department_editors WHERE department_id = " + obj.id)
                                        .oncomplete(function () {
                                            log("DeleteDepartmentEditors:result=success");

                                            // Agora insira os novos registros em tbl_department_editors
                                            editors.forEach(function (e) {
                                                Database.exec("INSERT INTO tbl_department_editors (department_id, editor_guid) VALUES (" + obj.id + ",'" + e + "')")
                                                    .oncomplete(function () {
                                                        log("InsertDepartmentEditor:result=success");
                                                    })
                                                    .onerror(function (error, errorText, dbErrorCode) {
                                                        log("InsertDepartmentEditor:result=Error " + String(errorText));
                                                    });
                                            });

                                            conn.send(JSON.stringify({ api: "user", mt: "UpdateDepartmentSuccess" }));
                                        })
                                        .onerror(function (error, errorText, dbErrorCode) {
                                            log("DeleteDepartmentEditors:result=Error " + String(errorText));
                                        });
                                })
                                .onerror(function (error, errorText, dbErrorCode) {
                                    log("DeleteDepartmentViewers:result=Error " + String(errorText));
                                });
                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                        });
                }
            }
            // fechamento do if de licença 
            else {
                 log("danilo req: No license Available")
                conn.send(JSON.stringify({ api: "user", mt: "NoLicense", result: String("Seu período de avaliação terminou! Por favor, contate o administrador do sistema para realizar o licenciamento.") }));
             }
        });
        conn.onclose(function () {
            connectionsUser = connectionsUser.filter(deleteBySip(conn.sip));
            log("connectionsUser: after delete conn " + JSON.stringify(connectionsUser));
        })
    }
});

new JsonApi("admin").onconnected(function (conn) {
    if (conn.app == "wecom-billboardadmin") {
        conn.onmessage(function (msg) {
            var obj = JSON.parse(msg);
            if (obj.mt == "AdminMessage") {
                conn.send(JSON.stringify({ api: "admin", mt: "AdminMessageResult", src: obj.src }));
            }
            if (obj.mt == "TableUsers") {
                log("danilo-req AdminMessage: reducing the pbxTableUser object to send to user");
                var list_users = [];
                pbxTableUsers.forEach(function (u) {
                    list_users.push({ cn: u.columns.cn, guid: u.columns.guid })
                })
                conn.send(JSON.stringify({ api: "admin", mt: "TableUsersResult", result: JSON.stringify(list_users), src: obj.src }));
            }
            if (obj.mt == "ConfigLicense") {
                var appDate = Config.appInstallDate;
                var licenseAppToken = Config.licenseAppToken;
                licenseInstallDate = Config.licenseInstallDate;
                licenseAppFile = Config.licenseAppFile;
                var licUsed = connectionsUser.length;
                var lic = decrypt(licenseAppToken, licenseAppFile)
                conn.send(JSON.stringify({ api: "admin", mt: "LicenseMessageResult",licenseUsed: licUsed, licenseToken: licenseAppToken, licenseFile: licenseAppFile, licenseActive: JSON.stringify(lic), licenseInstallDate: licenseInstallDate, appInstallDate: appDate }));
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
            if (obj.mt == "InsertAdmins") {
                Database.exec("DELETE FROM tbl_admins;")
                    .oncomplete(function () {
                        log("DeleteAdmins:result=success");
                        var list_guids = obj.users;
                        list_guids.forEach(function (guid) {
                            Database.exec("INSERT INTO tbl_admins (guid,create_department) VALUES ('" + guid + "'," + true + ")")
                                .oncomplete(function () {
                                    log("InsertAdmin:result=success");
                                    
                                })
                                .onerror(function (error, errorText, dbErrorCode) {
                                    conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText) }));
                                });
                        })
                        conn.send(JSON.stringify({ api: "admin", mt: "InsertAdminsSuccess", src: obj.src }));
                        
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText) }));
                    });
                
            }
            if (obj.mt == "SelectAdmins") {
                Database.exec("SELECT * FROM tbl_admins")
                    .oncomplete(function (data) {
                        log("SelectAdmins:result=success");
                        conn.send(JSON.stringify({ api: "admin", mt: "SelectAdminsResult", src: obj.src, result: JSON.stringify(data) }));
                    })
                    .onerror(function (error, errorText, dbErrorCode) {
                        conn.send(JSON.stringify({ api: "admin", mt: "Error", result: String(errorText) }));
                    });
            }
            
        });
    }
});

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
            conn.send(JSON.stringify({ "mt": "Signaling", "api": "PbxSignal", "call": obj.call, "src": obj.sig.cg.sip + "," + obj.src, "sig": { "type": "conn" } }));

            //Update signals
            var src = obj.src;
            var myArray = src.split(",");
            var pbx = myArray[0];
            //log("PbxSignal: before add new userclient " + JSON.stringify(PbxSignal));
            //Teste Danilo 20/07: armazenar o conte�do call no par�metro e o sip no valor
            //PbxSignal.forEach(function (signal) {
            //    if (signal.pbx == pbx) {
            //        var call = obj.call.toString();
            //        signal[call] = obj.sig.cg.sip;
            //    }
            //})
            //Teste Danilo 20/07: armazenar o conte�do call no pa�metro e o sip no valor
            //PbxSignal.forEach(function (signal) {
            //    if (signal.pbx == pbx) {
            //        signal[obj.sig.cg.sip] = obj.call;
            //    }
            //})
            //Teste Danilo 05/08: armazenar o conteudo call em nova lista
            var sip = obj.sig.cg.sip;
            var call = obj.call;
            var callData = { call, sip };
            //Adiciona o PBX2 no objeto caso ele não exista
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
            // Consulta na tabela 'tbl_posts' com LEFT JOIN e WHERE para filtrar os resultados
            var queryViewer = "SELECT d.id, d.name, d.color FROM tbl_departments d JOIN tbl_department_viewers v ON d.id = v.department_id WHERE v.viewer_guid = '" + user.columns.guid + "';";
            Database.exec(queryViewer)
                .oncomplete(function (departments) {
                    log("SelectDepartments:result=" + JSON.stringify(departments, null, 4));



                    var idsToSearch = [];
                    for (var i = 0; i < departments.length; i++) {
                        idsToSearch.push("'" + departments[i].id + "'");
                    }

                    // Formatar a lista de ids para uso na consulta SQL
                    var departmentIdsFormatted = idsToSearch.join(",");

                    // Consulta na tabela 'tbl_posts' com LEFT JOIN, filtrando por 'user_guid' e 'department'
                    //var queryPosts = "SELECT p.* FROM tbl_posts p LEFT JOIN tbl_views_history v ON p.id = v.post_id AND v.user_guid = '" + user.columns.guid + "' WHERE v.post_id IS NULL AND p.department IN (" + departmentIdsFormatted + ")";
                    //query com condição de data e horario
                    var now = getDateNow();
                    var queryPosts = "SELECT p.* FROM tbl_posts p LEFT JOIN tbl_views_history v ON p.id = v.post_id AND v.user_guid = '" + user.columns.guid + "' WHERE v.post_id IS NULL AND p.department IN (" + departmentIdsFormatted + ") AND '" + now + "' >= p.date_start AND '" + now + "' < p.date_end AND p.deleted IS NULL";
                    // Executar consulta na tabela 'tbl_posts'
                    Database.exec(queryPosts)
                        .oncomplete(function (dataPosts) {
                            // Dados retornados da consulta na tabela 'tbl_posts'
                            log("SelectPosts:result=" + JSON.stringify(dataPosts, null, 4));

                            updateBadge(obj.sig.cg.sip, dataPosts.length)

                        })
                        .onerror(function (error, errorText, dbErrorCode) {
                            log("PbxSignal:SelectPosts:result=" + JSON.stringify(errorText, null, 4));
                        });
                    //conn.send(JSON.stringify({ api: "user", mt: "SelectDepartmentsViewerResult", src: obj.src, result: JSON.stringify(dataUsersViewer, null, 4) }));
                })
                .onerror(function (error, errorText, dbErrorCode) {
                    log("PbxSignal:SelectDepartments:result=" + JSON.stringify(errorText, null, 4));
                });
        }

        // handle incoming call release messages
        if (obj.mt === "Signaling" && obj.sig.type === "rel") {
            //Remove signals
            //log("PBXSignal: connections before delete result " + JSON.stringify(PbxSignal));
            var src = obj.src;
            var myArray = src.split(",");
            var sip = "";
            var pbx = myArray[0];
            //PbxSignal.forEach(function (signal) {
            //    if (signal.pbx == pbx) {
            //        sip = Object.keys(signal).filter(function (key) { return signal[key] === obj.call })[0];
            //        delete signal[sip];

            //    }
            //})
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
});


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

//License Function
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

function decrypt(key,hash) {
    //var iv = iv.substring(0, 16);

    log("Key : " + key)
    log("Hash : " + hash)

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
    
    // Esta dando erro aqui 
    return JSON.parse(decrypted);
 }

//Internal supporters functions
function selectViewsHistory(sip, connOld) {
    var guid = pbxTableUsers.filter(function (item) {
        return item.columns.h323 === sip;
    })[0].columns.guid;

    var queryViewer = "SELECT d.id, d.name, d.color FROM tbl_departments d JOIN tbl_department_viewers v ON d.id = v.department_id WHERE v.viewer_guid = '" + guid + "' AND d.deleted IS NULL;";
    Database.exec(queryViewer)
        .oncomplete(function (departments) {
            log("SelectDepartments:result=" + JSON.stringify(departments, null, 4));

            var idsToSearch = [];
            for (var i = 0; i < departments.length; i++) {
                idsToSearch.push("'" + departments[i].id + "'");
            }

            // Consulta na tabela 'tbl_posts' com LEFT JOIN e WHERE para filtrar os resultados
            //var queryPosts = "SELECT p.* FROM tbl_posts p LEFT JOIN tbl_views_history v ON p.id = v.post_id AND v.user_guid = '" + conn.guid + "' WHERE v.post_id IS NULL";
            // Formatar a lista de ids para uso na consulta SQL
            var departmentIdsFormatted = idsToSearch.join(",");
            // Consulta na tabela 'tbl_posts' com LEFT JOIN, filtrando por 'user_guid' e 'department'
            //var queryPosts = "SELECT p.* FROM tbl_posts p LEFT JOIN tbl_views_history v ON p.id = v.post_id AND v.user_guid = '" + conn.guid + "' WHERE v.post_id IS NULL AND p.department IN (" + departmentIdsFormatted + ")";
            //query com condição de data e hora
            var now = getDateNow();
            var queryPosts = "SELECT p.* FROM tbl_posts p LEFT JOIN tbl_views_history v" +
                " ON p.id = v.post_id AND v.user_guid = '" + guid + "' WHERE v.post_id IS NULL AND" +
                " p.department IN (" + departmentIdsFormatted + ") AND '" + now + "' >= p.date_start AND" +
                " '" + now + "' < p.date_end AND p.deleted IS NULL";
            // Executar consulta na tabela 'tbl_posts'
            Database.exec(queryPosts)
                .oncomplete(function (dataPosts) {
                    // Dados retornados da consulta na tabela 'tbl_posts'
                    log("SelectPosts:result=" + JSON.stringify(dataPosts, null, 4));
                    connectionsUser.forEach(function (conn) {
                        if (conn.sip==sip) {
                            log("SelectPosts:conn to notify= " + JSON.stringify(conn, null, 4));
                            conn.send(JSON.stringify({ api: "user", mt: "SelectViewsHistoryResult", result: JSON.stringify(dataPosts, null, 4) }));
                        }
                    })
                    
                    updateBadge(sip, dataPosts.length)

                })
                .onerror(function (error, errorText, dbErrorCode) {
                    if (conn) {
                        log("SelectPosts:conn to notify= " + JSON.stringify(conn, null, 4) + " ERRO=" + errorText);
                        conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
                    } else {
                        log("SelectPosts: ERRO=" + errorText);
                    }
                });
        })
        .onerror(function (error, errorText, dbErrorCode) {
            if (conn) {
                log("SelectPosts:conn to notify= " + JSON.stringify(conn, null, 4) + " ERRO=" + errorText);
                conn.send(JSON.stringify({ api: "user", mt: "Error", result: String(errorText) }));
            } else {
                log("SelectPosts: ERRO=" + errorText);
            }
        });
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
function deleteBySip(sip) {
    return function (value) {
        if (value.sip != sip) {
            return true;
        }
        //countInvalidEntries++
        return false;
    }
}

function removeObjectByCall(arr, pbx, callToRemove) {
    for (var i = 0; i < arr.length; i++) {
        var pbxEntry = arr[i][pbx];
        if (pbxEntry) {
            for (var j = 0; j < pbxEntry.length; j++) {
                if (pbxEntry[j].call === callToRemove) {
                    pbxEntry.splice(j, 1);
                    break;
                }
            }
        }
    }
}

// Chamar a função novamente após 3 minutos
log("+++++++++++++++++++++++++++++++TUDO OK+++++++++++++++++++++++++++++++");
log("+++++++++++++++++++++++++++++++INICIANDO INTREVALO+++++++++++++++++++++++++++++++");
var i = Timers.setInterval(function () {
    log("+++++++++++++++++++++++++++++++TIMER+++++++++++++++++++++++++++++++");
    for (var pbx in PbxSignalUsers) {
        if (PbxSignalUsers.hasOwnProperty(pbx)) {
            var entry = PbxSignalUsers[pbx];
            entry.forEach(function (e) {
                selectViewsHistory(e.sip);
            })
        }
    }
}, 3 * 60 * 1000);

