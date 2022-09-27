
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.restaurante = Wecom.restaurante || function (start, args) {
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
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    var elInicioDiv = document.getElementById("inicio");
    elInicioDiv.addEventListener("click", function () { MudarDiv("inicio") }, false);
    var elRestauranteDiv = document.getElementById("restaurante");
    elRestauranteDiv.addEventListener("click", function () { MudarDiv("restaurante") }, false);
    var elNovidadesDiv = document.getElementById("novidades");
    elNovidadesDiv.addEventListener("click", function () { MudarDiv("novidades") }, false);


    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "user", mt: "UserMessage" });
    }

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
        }
    }

    function MudarDiv(el) {
      if (el == "inicio") {
          document.getElementById("restaurante").style.fontWeight = 'normal';
          document.getElementById("novidades").style.fontWeight = 'normal';
          document.getElementById("inicio").style.fontWeight = 'bold';
          document.getElementById('linhainicio').style.display = 'block';
          document.getElementById('linhacardapio').style.display = 'block';
          document.getElementById('linhanews').style.display = 'none';
      } else if (el == "restaurante") {
          document.getElementById("restaurante").style.fontWeight = 'bold';
          document.getElementById("novidades").style.fontWeight = 'normal';
          document.getElementById("inicio").style.fontWeight = 'normal';
          document.getElementById('linhainicio').style.display = 'block';
          document.getElementById('linhacardapio').style.display = 'block';
          document.getElementById('linhanews').style.display = 'none';
      } else if (el == "novidades") {
          document.getElementById("restaurante").style.fontWeight = 'normal';
          document.getElementById("novidades").style.fontWeight = 'bold';
          document.getElementById("inicio").style.fontWeight = 'normal';
          document.getElementById('linhainicio').style.display = 'none';
          document.getElementById('linhacardapio').style.display = 'block';
          document.getElementById('linhanews').style.display = 'block';
      }
  }

    
    // Modal JS Edição Pietrooo
  
var modal = document.getElementById("myModal");

// botão que abre o modal
var btn = document.getElementById("myBtn");

// botão que fecha o modal
var span = document.getElementsByClassName("close")[0];

// clicar e abrir o modal
btn.onclick = function() {
  modal.style.display = "block";
}

// clicar e fechar o modal
span.onclick = function() {
  modal.style.display = "none";
}

// clicar fora do modal e fechar ele 
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
         // Modal JS Edição Pietrooo
  
         var modal2 = document.getElementById("myModal2");

         // botão que abre o modal
         var btn2 = document.getElementById("myBtn3");
         
         // botão que fecha o modal
         var span2 = document.getElementsByClassName("close2")[0];
         
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
         }        
         
         
         }




        



Wecom.restaurante.prototype = innovaphone.ui1.nodePrototype;
