
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

    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "user", mt: "UserMessage" });
    }

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
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
         function Clicar(){
           var comida1 = document.getElementById("allinput").value; 
           //console.log(turmaUsuario);
         
           // Enviar os dados para o formulario do arquivo index.html utilizando o atributo ID
         //  document.getElementById("receber_turma_usuario").value = turmaUsuario;
         
           // Enviar os dados para o arquivo index.html utilizando o atributo ID
          //var testezada =  document.getElementById("valor_form_turma_usuario").innerHTML = comida1;
          var res =   document.getElementById("alltd");
          res.innerHTML = comida1;
           
         
         
         }







}
Wecom.restaurante.prototype = innovaphone.ui1.nodePrototype;
