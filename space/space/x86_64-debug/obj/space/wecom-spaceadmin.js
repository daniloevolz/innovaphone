
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.spaceAdmin = Wecom.spaceAdmin || function (start, args) {
    this.createNode("body");
    var that = this;

    var colorSchemes = {
        dark: {
            "--bg": "#191919",
            "--button": "#303030",
            "--text-standard": "#f2f5f6",
        },
        light: {
            "--bg": "white",
            "--button": "#e0e0e0",
            "--text-standard": "#4a4a49",
        }
    };
    var schemes = new innovaphone.ui1.CssVariables(colorSchemes, start.scheme);
    start.onschemechanged.attach(function () { schemes.activate(start.scheme) });

    var texts = new innovaphone.lib1.Languages(Wecom.spaceTexts, start.lang);

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    document.getElementById("novidades").style.fontWeight = 'bold';

    sessionKey = innovaphone.crypto.sha256("generic-dbfiles:" + app.key());
    console.log(sessionKey);

    var atualizar = document.getElementById("atualizar");
    atualizar.addEventListener("click", function () { insertTable() }, false);

    var limpar = document.getElementById("limpar");
    limpar.addEventListener("click", function () { limparLista() }, false);

    var elRestauranteDiv = document.getElementById("restaurante");
    elRestauranteDiv.addEventListener("click", function () { MudarDiv("restaurante") }, false);
    var elNovidadesDiv = document.getElementById("novidades");
    elNovidadesDiv.addEventListener("click", function () { MudarDiv("novidades") }, false);


    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "admin", mt: "AdminMessage" });
        app.send({ mt: "DbFilesList", src: "news", name:"news", folder:"1"});
        app.send({ api: "restaurante", mt: "SelectEvaluation", name: "nome", rate: "avaliacao", sugest: "comentario"});
        app.send({ api: "restaurante", mt: "SelectMessage", day: "segunda", exe: "SELECT segunda FROM cardapio_restaurante WHERE dia ='segunda'" });
        app.send({ api: "restaurante", mt: "SelectMessage", day: "terca", exe: "SELECT terca FROM cardapio_restaurante WHERE dia ='terca'" });
        app.send({ api: "restaurante", mt: "SelectMessage", day: "quarta", exe: "SELECT quarta FROM cardapio_restaurante WHERE dia ='quarta'" });
        app.send({ api: "restaurante", mt: "SelectMessage", day: "quinta", exe: "SELECT quinta FROM cardapio_restaurante WHERE dia ='quinta'" });
        app.send({ api: "restaurante", mt: "SelectMessage", day: "sexta", exe: "SELECT sexta FROM cardapio_restaurante WHERE dia ='sexta'" });
    }

    function app_message(obj) {
        console.log("log-danilo: "+obj);

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
                    try {
                        document.getElementById("comidasegunda").value = pratos[0].segunda;
                        document.getElementById("comidasegunda1").value = pratos[1].segunda;
                        document.getElementById("comidasegunda2").value = pratos[2].segunda;
                        document.getElementById("comidasegunda3").value = pratos[3].segunda;
                        document.getElementById("comidasegunda4").value = pratos[4].segunda;
                        document.getElementById("comidasegunda5").value = pratos[5].segunda;
                        document.getElementById("comidasegunda6").value = pratos[6].segunda;
                        document.getElementById("comidasegunda7").value = pratos[7].segunda;
                    }catch{
                        document.getElementById("comidasegunda").value = "";
                        document.getElementById("comidasegunda1").value = "";
                        document.getElementById("comidasegunda2").value = "";
                        document.getElementById("comidasegunda3").value = "";
                        document.getElementById("comidasegunda4").value = "";
                        document.getElementById("comidasegunda5").value = "";
                        document.getElementById("comidasegunda6").value = "";
                        document.getElementById("comidasegunda7").value = "";
                    }
                    
                    break;
                case 'terca':
                    console.log('terca');
                    try {
                        document.getElementById("comidaterca").value = pratos[0].terca;
                        document.getElementById("comidaterca1").value = pratos[1].terca;
                        document.getElementById("comidaterca2").value = pratos[2].terca;
                        document.getElementById("comidaterca3").value = pratos[3].terca;
                        document.getElementById("comidaterca4").value = pratos[4].terca;
                        document.getElementById("comidaterca5").value = pratos[5].terca;
                        document.getElementById("comidaterca6").value = pratos[6].terca;
                        document.getElementById("comidaterca7").value = pratos[7].terca;

                    } catch {
                        document.getElementById("comidaterca").value = "";
                        document.getElementById("comidaterca1").value = "";
                        document.getElementById("comidaterca2").value = "";
                        document.getElementById("comidaterca3").value = "";
                        document.getElementById("comidaterca4").value = "";
                        document.getElementById("comidaterca5").value = "";
                        document.getElementById("comidaterca6").value = "";
                        document.getElementById("comidaterca7").value = "";

                    }
                    
                case 'quarta':
                    console.log('quarta');
                    try {
                        document.getElementById("comidaquarta").value = pratos[0].quarta;
                        document.getElementById("comidaquarta1").value = pratos[1].quarta;
                        document.getElementById("comidaquarta2").value = pratos[2].quarta;
                        document.getElementById("comidaquarta3").value = pratos[3].quarta;
                        document.getElementById("comidaquarta4").value = pratos[4].quarta;
                        document.getElementById("comidaquarta5").value = pratos[5].quarta;
                        document.getElementById("comidaquarta6").value = pratos[6].quarta;
                        document.getElementById("comidaquarta7").value = pratos[7].quarta;

                    } catch {
                        document.getElementById("comidaquarta").value = "";
                        document.getElementById("comidaquarta1").value = "";
                        document.getElementById("comidaquarta2").value = "";
                        document.getElementById("comidaquarta3").value = "";
                        document.getElementById("comidaquarta4").value = "";
                        document.getElementById("comidaquarta5").value = "";
                        document.getElementById("comidaquarta6").value = "";
                        document.getElementById("comidaquarta7").value = "";

                    }
                    
                    break;
                case 'quinta':
                    console.log('quinta');
                    try {
                        document.getElementById("comidaquinta").value = pratos[0].quinta;
                        document.getElementById("comidaquinta1").value = pratos[1].quinta;
                        document.getElementById("comidaquinta2").value = pratos[2].quinta;
                        document.getElementById("comidaquinta3").value = pratos[3].quinta;
                        document.getElementById("comidaquinta4").value = pratos[4].quinta;
                        document.getElementById("comidaquinta5").value = pratos[5].quinta;
                        document.getElementById("comidaquinta6").value = pratos[6].quinta;
                        document.getElementById("comidaquinta7").value = pratos[7].quinta;

                    } catch {
                        document.getElementById("comidaquinta").value = "";
                        document.getElementById("comidaquinta1").value = "";
                        document.getElementById("comidaquinta2").value = "";
                        document.getElementById("comidaquinta3").value = "";
                        document.getElementById("comidaquinta4").value = "";
                        document.getElementById("comidaquinta5").value = "";
                        document.getElementById("comidaquinta6").value = "";
                        document.getElementById("comidaquinta7").value = "";

                    }
                    
                    break;
                case 'sexta':
                    console.log('sexta');
                    try {
                        document.getElementById("comidasexta").value = pratos[0].sexta;
                        document.getElementById("comidasexta1").value = pratos[1].sexta;
                        document.getElementById("comidasexta2").value = pratos[2].sexta;
                        document.getElementById("comidasexta3").value = pratos[3].sexta;
                        document.getElementById("comidasexta4").value = pratos[4].sexta;
                        document.getElementById("comidasexta5").value = pratos[5].sexta;
                        document.getElementById("comidasexta6").value = pratos[6].sexta;
                        document.getElementById("comidasexta7").value = pratos[7].sexta;

                    } catch {
                        document.getElementById("comidasexta").value = "";
                        document.getElementById("comidasexta1").value = "";
                        document.getElementById("comidasexta2").value = "";
                        document.getElementById("comidasexta3").value = "";
                        document.getElementById("comidasexta4").value = "";
                        document.getElementById("comidasexta5").value = "";
                        document.getElementById("comidasexta6").value = "";
                        document.getElementById("comidasexta7").value = "";
                    }
                    
                    break;
                default:
                    console.log(`Sorry, we are out of ${expr}.`);
            }
        }
        if (obj.api == "restaurante" && obj.mt == "DeleteMessageResultSuccess") {

            console.log(obj.mt);
            switch (obj.day) {
                case 'segunda':
                    console.log('segunda');
                    app.send({ api: "restaurante", mt: "SelectMessage", day: "segunda", exe: "SELECT segunda FROM cardapio_restaurante WHERE dia ='segunda'" });
                    break;

                case 'terca':
                    console.log('ter�a');
                    app.send({ api: "restaurante", mt: "SelectMessage", day: "terca", exe: "SELECT terca FROM cardapio_restaurante WHERE dia ='terca'" });
                    break;

                case 'quarta':
                    console.log('quarta');
                    app.send({ api: "restaurante", mt: "SelectMessage", day: "quarta", exe: "SELECT quarta FROM cardapio_restaurante WHERE dia ='quarta'" });
                    break;

                case 'quinta':
                    console.log('quinta');
                    app.send({ api: "restaurante", mt: "SelectMessage", day: "quinta", exe: "SELECT quinta FROM cardapio_restaurante WHERE dia ='quinta'" });
                    break;

                case 'sexta':
                    console.log('sexta');
                    app.send({ api: "restaurante", mt: "SelectMessage", day: "sexta", exe: "SELECT sexta FROM cardapio_restaurante WHERE dia ='sexta'" });
                    break;

                default:
                    console.log(`Sorry, we are out of ${expr}.`);
            }


        }
    }


    function insertTable() {

        limparLista();

        var check = document.getElementById("check");
        var check2 = document.getElementById("check1");
        var check3 = document.getElementById("check2")
        var check4 = document.getElementById("check3")
        var check5 = document.getElementById("check4")

        if (check.checked) {
            var segunda1 = document.getElementById("comidasegunda").value;
            var segunda2 = document.getElementById("comidasegunda1").value;
            var segunda3 = document.getElementById("comidasegunda2").value;
            var segunda4 = document.getElementById("comidasegunda3").value;
            var segunda5 = document.getElementById("comidasegunda4").value;
            var segunda6 = document.getElementById("comidasegunda5").value;
            var segunda7 = document.getElementById("comidasegunda6").value;
            var segunda8 = document.getElementById("comidasegunda7").value;

            if (segunda1.length > 1 || segunda2.length > 1 || segunda3.length > 1) {
            }

            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, segunda) VALUES('segunda','" + String(segunda1) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, segunda) VALUES('segunda','" + String(segunda2) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, segunda) VALUES('segunda','" + String(segunda3) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, segunda) VALUES('segunda','" + String(segunda4) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, segunda) VALUES('segunda','" + String(segunda5) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, segunda) VALUES('segunda','" + String(segunda6) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, segunda) VALUES('segunda','" + String(segunda7) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, segunda) VALUES('segunda','" + String(segunda8) + "')" });

        }
        if (check2.checked) {
            var terca1 = document.getElementById("comidaterca").value;
            var terca2 = document.getElementById("comidaterca1").value;
            var terca3 = document.getElementById("comidaterca2").value;
            var terca4 = document.getElementById("comidaterca3").value;
            var terca5 = document.getElementById("comidaterca4").value;
            var terca6 = document.getElementById("comidaterca5").value;
            var terca7 = document.getElementById("comidaterca6").value;
            var terca8 = document.getElementById("comidaterca7").value;

            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, terca) VALUES('terca','" + String(terca1) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, terca) VALUES('terca','" + String(terca2) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, terca) VALUES('terca','" + String(terca3) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, terca) VALUES('terca','" + String(terca4) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, terca) VALUES('terca','" + String(terca5) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, terca) VALUES('terca','" + String(terca6) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, terca) VALUES('terca','" + String(terca7) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, terca) VALUES('terca','" + String(terca8) + "')" });

        }
        if (check3.checked) {
            var quarta1 = document.getElementById("comidaquarta").value;
            var quarta2 = document.getElementById("comidaquarta1").value;
            var quarta3 = document.getElementById("comidaquarta2").value;
            var quarta4 = document.getElementById("comidaquarta3").value;
            var quarta5 = document.getElementById("comidaquarta4").value;
            var quarta6 = document.getElementById("comidaquarta5").value;
            var quarta7 = document.getElementById("comidaquarta6").value;
            var quarta8 = document.getElementById("comidaquarta7").value;

            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, quarta) VALUES('quarta','" + String(quarta1) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, quarta) VALUES('quarta','" + String(quarta2) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, quarta) VALUES('quarta','" + String(quarta3) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, quarta) VALUES('quarta','" + String(quarta4) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, quarta) VALUES('quarta','" + String(quarta5) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, quarta) VALUES('quarta','" + String(quarta6) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, quarta) VALUES('quarta','" + String(quarta7) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, quarta) VALUES('quarta','" + String(quarta8) + "')" });

        }
        if (check4.checked) {
            var quinta1 = document.getElementById("comidaquinta").value;
            var quinta2 = document.getElementById("comidaquinta1").value;
            var quinta3 = document.getElementById("comidaquinta2").value;
            var quinta4 = document.getElementById("comidaquinta3").value;
            var quinta5 = document.getElementById("comidaquinta4").value;
            var quinta6 = document.getElementById("comidaquinta5").value;
            var quinta7 = document.getElementById("comidaquinta6").value;
            var quinta8 = document.getElementById("comidaquinta7").value;

            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, quinta) VALUES('quinta','" + String(quinta1) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, quinta) VALUES('quinta','" + String(quinta2) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, quinta) VALUES('quinta','" + String(quinta3) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, quinta) VALUES('quinta','" + String(quinta4) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, quinta) VALUES('quinta','" + String(quinta5) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, quinta) VALUES('quinta','" + String(quinta6) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, quinta) VALUES('quinta','" + String(quinta7) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, quinta) VALUES('quinta','" + String(quinta8) + "')" });

        }
        if (check5.checked) {
            var sexta1 = document.getElementById("comidasexta").value;
            var sexta2 = document.getElementById("comidasexta1").value;
            var sexta3 = document.getElementById("comidasexta2").value;
            var sexta4 = document.getElementById("comidasexta3").value;
            var sexta5 = document.getElementById("comidasexta4").value;
            var sexta6 = document.getElementById("comidasexta5").value;
            var sexta7 = document.getElementById("comidasexta6").value;
            var sexta8 = document.getElementById("comidasexta7").value;

            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, sexta) VALUES('sexta','" + String(sexta1) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, sexta) VALUES('sexta','" + String(sexta2) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, sexta) VALUES('sexta','" + String(sexta3) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, sexta) VALUES('sexta','" + String(sexta4) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, sexta) VALUES('sexta','" + String(sexta5) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, sexta) VALUES('sexta','" + String(sexta6) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, sexta) VALUES('sexta','" + String(sexta7) + "')" });
            app.send({ api: "restaurante", mt: "AddMessage", exe: "INSERT INTO cardapio_restaurante(dia, sexta) VALUES('sexta','" + String(sexta8) + "')" });

        }
    }
    // Função referente ao button Limpar dados
    function limparLista() {
        
        var check = document.getElementById("check");
        var check2 = document.getElementById("check1");
        var check3 = document.getElementById("check2")
        var check4 = document.getElementById("check3")
        var check5 = document.getElementById("check4")

        if (check.checked) {
            app.send({ api: "restaurante", mt: "DeleteMessage", day: "segunda" });
            }
        if (check2.checked) {
            app.send({ api: "restaurante", mt: "DeleteMessage", day: "terca" });
        }
        if (check3.checked) {
            app.send({ api: "restaurante", mt: "DeleteMessage", day: "quarta" });
        }
        if (check4.checked) {
            app.send({ api: "restaurante", mt: "DeleteMessage", day: "quinta" });
        }
        if (check5.checked) {
            app.send({ api: "restaurante", mt: "DeleteMessage", day: "sexta" });
        }
    }
    function MudarDiv(el) {
        if (el == "restaurante") {
            document.getElementById("restaurante").style.fontWeight = 'bold';
            document.getElementById("novidades").style.fontWeight = 'normal';
            document.getElementById('linhacardapio').style.display = 'flex';
            document.getElementById('linhanews').style.display = 'none';
        } else if (el == "novidades") {
            document.getElementById("restaurante").style.fontWeight = 'normal';
            document.getElementById("novidades").style.fontWeight = 'bold';
            document.getElementById('linhacardapio').style.display = 'none';
            document.getElementById('linhanews').style.display = 'block';
        }
    }

    sessionKey = innovaphone.crypto.sha256("generic-dbfiles:" + app.key());
    // Select your input type file and store it in a variable
    const input = document.getElementById('myfile');

    // This will upload the file after having read it
    const upload = (file) => {
        fetch('?dbfiles=news&folder=1&name=news&key=' + sessionKey, { // Your POST endpoint
            method: 'POST',
            headers: {
                // Content-Type may need to be completely **omitted**
                // or you may need something
                "Content-Type": "application/pdf"
            },
            body: file // This is your file object
        }).then(
            response => response.json() // if the response is a JSON object
        ).then(
            success => console.log(success) // Handle the success response object
        ).catch(
            error => console.log(error) // Handle the error response object
        );
    };

    // Event handler executed when a file is selected
    const onSelectFile = () => upload(input.files[0]);

    // Add a listener on your input
    // It will be triggered when a file will be selected
    //input.addEventListener('change', onSelectFile, false);

    
    const uploadbtn = document.getElementById('uploadpdf');
    uploadbtn.addEventListener('click', function () { onSelectFile() }, false);

    // Edição Pietro

    // Modal JS Edição Pietro
  
    var modal2 = document.getElementById("myModal3");

    // botão que abre o modal
    var btn2 = document.getElementById("duvidas");

    // botão que fecha o modal
    var span2 = document.getElementsByClassName("close3")[0];

    // clicar e abrir o modal
    btn2.onclick = function() {
      modal2.style.display = "block";
    }

    // clicar e fechar o modal
    span2.onclick = function() {
      modal2.style.display = "none";
    }

    // clicar fora do modal e fechar ele 
    window.onclick = function(event) {
      if (event.target == modal2) {
        modal2.style.display = "none";
      }


      // Modal sugestões admin
  
    var modal3 = document.getElementById("myModal4");

    // botão que abre o modal
    var btn3 = document.getElementById("myBtn2");

    // botão que fecha o modal
    var span3 = document.getElementsByClassName("close4")[0];

    // clicar e abrir o modal
    btn3.onclick = function() {
      modal3.style.display = "block";
    }

    // clicar e fechar o modal
    span3.onclick = function() {
      modal3.style.display = "none";
    }

    // clicar fora do modal e fechar ele 
    window.onclick = function(event) {
      if (event.target == modal3) {
        modal3.style.display = "none";
      }
    }
    }    

}


Wecom.spaceAdmin.prototype = innovaphone.ui1.nodePrototype;
