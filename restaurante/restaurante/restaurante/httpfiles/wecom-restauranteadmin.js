
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.restauranteAdmin = Wecom.restauranteAdmin || function (start, args) {
    this.createNode("body");
    var that = this;

    var colorSchemes = {
        dark: {
            "--bg": "#191919",
            "--button": "#303030",
            "--text-standard": "#4a4a49",
        },
        light: {
            "--bg": "white",
            "--button": "#e0e0e0",
            "--text-standard": "#4a4a49",
        }
    };
    var schemes = new innovaphone.ui1.CssVariables(colorSchemes, start.scheme);
    start.onschemechanged.attach(function () { schemes.activate(start.scheme) });

    var texts = new innovaphone.lib1.Languages(Wecom.restauranteTexts, start.lang);

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    var atualizar = document.getElementById("atualizar");
    atualizar.addEventListener("click", function () { atualizarLista() }, false);

    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "admin", mt: "AdminMessage" });
        app.send({ api: "restaurante", mt: "SelectMessage", day: "segunda", exe: "SELECT segunda FROM cardapio_restaurante" });
        app.send({ api: "restaurante", mt: "SelectMessage", day: "terca", exe: "SELECT terca FROM cardapio_restaurante" });
        app.send({ api: "restaurante", mt: "SelectMessage", day: "quarta", exe: "SELECT quarta FROM cardapio_restaurante" });
        app.send({ api: "restaurante", mt: "SelectMessage", day: "quinta", exe: "SELECT quinta FROM cardapio_restaurante" });
        app.send({ api: "restaurante", mt: "SelectMessage", day: "sexta", exe: "SELECT sexta FROM cardapio_restaurante" });
    }

    function app_message(obj) {
        if (obj.api == "admin" && obj.mt == "AdminMessageResult") {
        }
        if (obj.api == "restaurante" && obj.mt == "MessageError") {
            console.log(obj.result);
        }
        if (obj.api == "restaurante" && obj.mt == "SelectMessageResultSuccess") {
            console.log(obj.mt);
            var pratos = JSON.parse(obj.result);
            switch (obj.day) {
                case 'segunda':
                    console.log('segunda');
                    document.getElementById("comidasegunda").value = pratos[0].segunda;
                    document.getElementById("comidasegunda1").value = pratos[1].segunda;
                    document.getElementById("comidasegunda2").value = pratos[2].segunda;
                    document.getElementById("comidasegunda3").value = pratos[3].segunda;
                    document.getElementById("comidasegunda4").value = pratos[4].segunda;
                    document.getElementById("comidasegunda5").value = pratos[5].segunda;
                    document.getElementById("comidasegunda6").value = pratos[6].segunda;
                    document.getElementById("comidasegunda7").value = pratos[7].segunda;
                    break;
                case 'terca':
                    console.log('terça');
                    document.getElementById("comidaterca").value = pratos[0].terca;
                    document.getElementById("comidaterca1").value = pratos[1].terca;
                    document.getElementById("comidaterca2").value = pratos[2].terca;
                    document.getElementById("comidaterca3").value = pratos[3].terca;
                    document.getElementById("comidaterca4").value = pratos[4].terca;
                    document.getElementById("comidaterca5").value = pratos[5].terca;
                    document.getElementById("comidaterca6").value = pratos[6].terca;
                    document.getElementById("comidaterca7").value = pratos[7].terca;
                case 'quarta':
                    console.log('quarta');
                    document.getElementById("comidaquarta").value = pratos[0].quarta;
                    document.getElementById("comidaquarta1").value = pratos[1].quarta;
                    document.getElementById("comidaquarta2").value = pratos[2].quarta;
                    document.getElementById("comidaquarta3").value = pratos[3].quarta;
                    document.getElementById("comidaquarta4").value = pratos[4].quarta;
                    document.getElementById("comidaquarta5").value = pratos[5].quarta;
                    document.getElementById("comidaquarta6").value = pratos[6].quarta;
                    document.getElementById("comidaquarta7").value = pratos[7].quarta;
                    break;
                case 'quinta':
                    console.log('quinta');
                    document.getElementById("comidaquinta").value = pratos[0].quinta;
                    document.getElementById("comidaquinta1").value = pratos[1].quinta;
                    document.getElementById("comidaquinta2").value = pratos[2].quinta;
                    document.getElementById("comidaquinta3").value = pratos[3].quinta;
                    document.getElementById("comidaquinta4").value = pratos[4].quinta;
                    document.getElementById("comidaquinta5").value = pratos[5].quinta;
                    document.getElementById("comidaquinta6").value = pratos[6].quinta;
                    document.getElementById("comidaquinta7").value = pratos[7].quinta;
                    break;
                case 'sexta':
                    console.log('sexta');
                    document.getElementById("comidasexta").value = pratos[0].sexta;
                    document.getElementById("comidasexta1").value = pratos[1].sexta;
                    document.getElementById("comidasexta2").value = pratos[2].sexta;
                    document.getElementById("comidasexta3").value = pratos[3].sexta;
                    document.getElementById("comidasexta4").value = pratos[4].sexta;
                    document.getElementById("comidasexta5").value = pratos[5].sexta;
                    document.getElementById("comidasexta6").value = pratos[6].sexta;
                    document.getElementById("comidasexta7").value = pratos[7].sexta;
                    break;
                default:
                    console.log(`Sorry, we are out of ${expr}.`);
            }

            

        }
    }
    function atualizarLista() {

        var check = document.getElementById("check");
        var check2 = document.getElementById("check1");
        var check3 = document.getElementById("check2")
        var check4 = document.getElementById("check3")
        var check5 = document.getElementById("check4")

        if (check.checked) {
            var segunda1 = document.getElementById("comidasegunda").value;
            var segunda2 = document.getElementById("comidasegunda2").value;
            var segunda3 = document.getElementById("comidasegunda1").value;
            var segunda4 = document.getElementById("comidasegunda3").value;
            var segunda5 = document.getElementById("comidasegunda4").value;
            var segunda6 = document.getElementById("comidasegunda5").value;
            var segunda7 = document.getElementById("comidasegunda6").value;
            var segunda8 = document.getElementById("comidasegunda7").value;

            if (segunda1.length > 1 || segunda2.length > 1 || segunda3.length > 1) {
                app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(segunda) VALUES('" + String(segunda1) + "')" });
                app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(segunda) VALUES('" + String(segunda2) + "')" });
                app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(segunda) VALUES('" + String(segunda3) + "')" });
                app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(segunda) VALUES('" + String(segunda4) + "')" });
                app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(segunda) VALUES('" + String(segunda5) + "')" });
                app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(segunda) VALUES('" + String(segunda6) + "')" });
                app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(segunda) VALUES('" + String(segunda7) + "')" });
                app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(segunda) VALUES('" + String(segunda8) + "')" });
            }
        }
        if (check2.checked) {
            var limpado9 = document.getElementById("comidaterca").value = "";
            var limpado10 = document.getElementById("comidaterca1").value = "";
            var limpado11 = document.getElementById("comidaterca2").value = "";
            var limpado12 = document.getElementById("comidaterca3").value = "";
            var limpado13 = document.getElementById("comidaterca4").value = "";
            var limpado14 = document.getElementById("comidaterca5").value = "";
            var limpado15 = document.getElementById("comidaterca6").value = "";
            var limpado16 = document.getElementById("comidaterca7").value = "";
        }
        if (check3.checked) {
            var limpado17 = document.getElementById("comidaquarta").value = "";
            var limpado18 = document.getElementById("comidaquarta1").value = "";
            var limpado19 = document.getElementById("comidaquarta2").value = "";
            var limpado20 = document.getElementById("comidaquarta3").value = "";
            var limpado21 = document.getElementById("comidaquarta4").value = "";
            var limpado22 = document.getElementById("comidaquarta5").value = "";
            var limpado23 = document.getElementById("comidaquarta6").value = "";
            var limpado24 = document.getElementById("comidaquarta7").value = "";
        }
        if (check4.checked) {
            var limpado25 = document.getElementById("comidaquinta").value = "";
            var limpado26 = document.getElementById("comidaquinta1").value = "";
            var limpado27 = document.getElementById("comidaquinta2").value = "";
            var limpado28 = document.getElementById("comidaquinta3").value = "";
            var limpado29 = document.getElementById("comidaquinta4").value = "";
            var limpado30 = document.getElementById("comidaquinta5").value = "";
            var limpado31 = document.getElementById("comidaquinta6").value = "";
            var limpado32 = document.getElementById("comidaquinta7").value = "";
        }
        if (check5.checked) {
            var limpado33 = document.getElementById("comidasexta").value = "";
            var limpado34 = document.getElementById("comidasexta1").value = "";
            var limpado35 = document.getElementById("comidasexta2").value = "";
            var limpado36 = document.getElementById("comidasexta3").value = "";
            var limpado37 = document.getElementById("comidasexta4").value = "";
            var limpado38 = document.getElementById("comidasexta5").value = "";
            var limpado39 = document.getElementById("comidasexta6").value = "";
            var limpado40 = document.getElementById("comidasexta7").value = "";
        }
    }

}



Wecom.restauranteAdmin.prototype = innovaphone.ui1.nodePrototype;
