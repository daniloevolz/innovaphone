
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.space = Wecom.space || function (start, args) {
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
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    var elRestauranteDiv = document.getElementById("restaurante");
    elRestauranteDiv.addEventListener("click", function () { MudarDiv("restaurante") }, false);
    var elNovidadesDiv = document.getElementById("novidades");
    elNovidadesDiv.addEventListener("click", function () { MudarDiv("novidades") }, false);

    

    function app_connected(domain, user, dn, appdomain) {
        document.getElementById("spanNameUsuario").innerText = dn;
        app.send({ api: "restaurante", mt: "SelectMessage", day: "segunda", exe: "SELECT segunda FROM cardapio_restaurante WHERE dia ='segunda'" });
        app.send({ api: "restaurante", mt: "SelectMessage", day: "terca", exe: "SELECT terca FROM cardapio_restaurante WHERE dia ='terca'" });
        app.send({ api: "restaurante", mt: "SelectMessage", day: "quarta", exe: "SELECT quarta FROM cardapio_restaurante WHERE dia ='quarta'" });
        app.send({ api: "restaurante", mt: "SelectMessage", day: "quinta", exe: "SELECT quinta FROM cardapio_restaurante WHERE dia ='quinta'" });
        app.send({ api: "restaurante", mt: "SelectMessage", day: "sexta", exe: "SELECT sexta FROM cardapio_restaurante WHERE dia ='sexta'" });

    }

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
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
                        document.getElementById("comidasegunda").innerText = pratos[0].segunda;
                        document.getElementById("comidasegunda1").innerText = pratos[1].segunda;
                        document.getElementById("comidasegunda2").innerText = pratos[2].segunda;
                        document.getElementById("comidasegunda3").innerText = pratos[3].segunda;
                        document.getElementById("comidasegunda4").innerText = pratos[4].segunda;
                        document.getElementById("comidasegunda5").innerText = pratos[5].segunda;
                        document.getElementById("comidasegunda6").innerText = pratos[6].segunda;
                        document.getElementById("comidasegunda7").innerText = pratos[7].segunda;
                    } catch {
                        document.getElementById("comidasegunda").innerText = "";
                        document.getElementById("comidasegunda1").innerText = "";
                        document.getElementById("comidasegunda2").innerText = "";
                        document.getElementById("comidasegunda3").innerText = "";
                        document.getElementById("comidasegunda4").innerText = "";
                        document.getElementById("comidasegunda5").innerText = "";
                        document.getElementById("comidasegunda6").innerText = "";
                        document.getElementById("comidasegunda7").innerText = "";
                    }

                    break;
                case 'terca':
                    console.log('ter�a');
                    try {
                        document.getElementById("comidaterca").innerText = pratos[0].terca;
                        document.getElementById("comidaterca1").innerText = pratos[1].terca;
                        document.getElementById("comidaterca2").innerText = pratos[2].terca;
                        document.getElementById("comidaterca3").innerText = pratos[3].terca;
                        document.getElementById("comidaterca4").innerText = pratos[4].terca;
                        document.getElementById("comidaterca5").innerText = pratos[5].terca;
                        document.getElementById("comidaterca6").innerText = pratos[6].terca;
                        document.getElementById("comidaterca7").innerText = pratos[7].terca;

                    } catch {
                        document.getElementById("comidaterca").innerText = "";
                        document.getElementById("comidaterca1").innerText = "";
                        document.getElementById("comidaterca2").innerText = "";
                        document.getElementById("comidaterca3").innerText = "";
                        document.getElementById("comidaterca4").innerText = "";
                        document.getElementById("comidaterca5").innerText = "";
                        document.getElementById("comidaterca6").innerText = "";
                        document.getElementById("comidaterca7").innerText = "";

                    }

                case 'quarta':
                    console.log('quarta');
                    try {
                        document.getElementById("comidaquarta").innerText = pratos[0].quarta;
                        document.getElementById("comidaquarta1").innerText = pratos[1].quarta;
                        document.getElementById("comidaquarta2").innerText = pratos[2].quarta;
                        document.getElementById("comidaquarta3").innerText = pratos[3].quarta;
                        document.getElementById("comidaquarta4").innerText = pratos[4].quarta;
                        document.getElementById("comidaquarta5").innerText = pratos[5].quarta;
                        document.getElementById("comidaquarta6").innerText = pratos[6].quarta;
                        document.getElementById("comidaquarta7").innerText = pratos[7].quarta;

                    } catch {
                        document.getElementById("comidaquarta").innerText = "";
                        document.getElementById("comidaquarta1").innerText = "";
                        document.getElementById("comidaquarta2").innerText = "";
                        document.getElementById("comidaquarta3").innerText = "";
                        document.getElementById("comidaquarta4").innerText = "";
                        document.getElementById("comidaquarta5").innerText = "";
                        document.getElementById("comidaquarta6").innerText = "";
                        document.getElementById("comidaquarta7").innerText = "";

                    }

                    break;
                case 'quinta':
                    console.log('quinta');
                    try {
                        document.getElementById("comidaquinta").innerText = pratos[0].quinta;
                        document.getElementById("comidaquinta1").innerText = pratos[1].quinta;
                        document.getElementById("comidaquinta2").innerText = pratos[2].quinta;
                        document.getElementById("comidaquinta3").innerText = pratos[3].quinta;
                        document.getElementById("comidaquinta4").innerText = pratos[4].quinta;
                        document.getElementById("comidaquinta5").innerText = pratos[5].quinta;
                        document.getElementById("comidaquinta6").innerText = pratos[6].quinta;
                        document.getElementById("comidaquinta7").innerText = pratos[7].quinta;

                    } catch {
                        document.getElementById("comidaquinta").innerText = "";
                        document.getElementById("comidaquinta1").innerText = "";
                        document.getElementById("comidaquinta2").innerText = "";
                        document.getElementById("comidaquinta3").innerText = "";
                        document.getElementById("comidaquinta4").innerText = "";
                        document.getElementById("comidaquinta5").innerText = "";
                        document.getElementById("comidaquinta6").innerText = "";
                        document.getElementById("comidaquinta7").innerText = "";

                    }

                    break;
                case 'sexta':
                    console.log('sexta');
                    try {
                        document.getElementById("comidasexta").innerText = pratos[0].sexta;
                        document.getElementById("comidasexta1").innerText = pratos[1].sexta;
                        document.getElementById("comidasexta2").innerText = pratos[2].sexta;
                        document.getElementById("comidasexta3").innerText = pratos[3].sexta;
                        document.getElementById("comidasexta4").innerText = pratos[4].sexta;
                        document.getElementById("comidasexta5").innerText = pratos[5].sexta;
                        document.getElementById("comidasexta6").innerText = pratos[6].sexta;
                        document.getElementById("comidasexta7").innerText = pratos[7].sexta;

                    } catch {
                        document.getElementById("comidasexta").innerText = "";
                        document.getElementById("comidasexta1").innerText = "";
                        document.getElementById("comidasexta2").innerText = "";
                        document.getElementById("comidasexta3").innerText = "";
                        document.getElementById("comidasexta4").innerText = "";
                        document.getElementById("comidasexta5").innerText = "";
                        document.getElementById("comidasexta6").innerText = "";
                        document.getElementById("comidasexta7").innerText = "";
                    }

                    break;
                default:
                    console.log(`Sorry, we are out of ${expr}.`);
            }
        }

    }
    
    function MudarDiv(el) {
      if (el == "restaurante") {
          document.getElementById("restaurante").style.fontWeight = 'bold';
          document.getElementById("novidades").style.fontWeight = 'normal';
          document.getElementById('linhacardapio').style.display = 'block';
          document.getElementById('linhanews').style.display = 'none';
      } else if (el == "novidades") {
          document.getElementById("restaurante").style.fontWeight = 'normal';
          document.getElementById("novidades").style.fontWeight = 'bold';
          document.getElementById('linhacardapio').style.display = 'block';
          document.getElementById('linhanews').style.display = 'block';
      }
    }
    
    // Modal JS Edição Pietrooo
    
    var modal = document.getElementById("myModal");
    var modal2 = document.getElementById("myModal2");

    // botão que fecha o modal
    var elSpan = document.getElementsByClassName("close")[0];
    elSpan.addEventListener("click", function () {
        modal.style.display = "none";
    }, false);

    // botão que abre o modal
    var elmyBtn = document.getElementById("myBtn");
    elmyBtn.addEventListener("click", function () {
        modal.style.display = "block";
    }, false);  

    // botão que fecha o modal
    var elSpan2 = document.getElementsByClassName("close2")[0];
    elSpan2.addEventListener("click", function () {
        modal2.style.display = "none";
    }, false);

    // botão que abre o modal
    var elmyBtn2 = document.getElementById("myBtn3");
    elmyBtn2.addEventListener("click", function () {
        modal2.style.display = "block";
    }, false);



} 

// Responder Anonimamente Script 
 function Sumir(){
    if(document.getElementById('check').checked){
        document.getElementById('res').style.display = 'none';
    }else{
        document.getElementById('res').style.display = 'block';
    }
} 


Wecom.space.prototype = innovaphone.ui1.nodePrototype;
