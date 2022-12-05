
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.space = Wecom.space || function (start, args) {
    this.createNode("body");
    var that = this;
    const username = "";

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

    var avaliar = document.getElementById("buttonEnviarAvaliacao");
    avaliar.addEventListener("click", function () { insertReview() }, false);
    

    function app_connected(domain, user, dn, appdomain) {
        if (app.logindata.info.unlicensed) {
            // unlicensed mode
            console.log("Unlicensed mode");
        }
        else {
            // licensed mode
            console.log("Licensed mode");
        }


        document.getElementById("spanNameUsuario").innerText = dn;
        username = dn;
        app.send({ api: "restaurante", mt: "SelectMessage", day: "segunda", exe: "SELECT segunda FROM cardapio_restaurante WHERE dia ='segunda'" });
        app.send({ api: "restaurante", mt: "SelectMessage", day: "terca", exe: "SELECT terca FROM cardapio_restaurante WHERE dia ='terca'" });
        app.send({ api: "restaurante", mt: "SelectMessage", day: "quarta", exe: "SELECT quarta FROM cardapio_restaurante WHERE dia ='quarta'" });
        app.send({ api: "restaurante", mt: "SelectMessage", day: "quinta", exe: "SELECT quinta FROM cardapio_restaurante WHERE dia ='quinta'" });
        app.send({ api: "restaurante", mt: "SelectMessage", day: "sexta", exe: "SELECT sexta FROM cardapio_restaurante WHERE dia ='sexta'" });

    }

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
            constructor();
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

        if (obj.api = "restaurante" && obj.mt == "InsertReviewSucess") {
            console.log("Sugestão Registrada!!!!!");
            closeModal();
        }

    }
    function constructor(){
        colEsquerda();
        colDireita();
    }
    function colEsquerda(){
        var colEsquerda = that.add(new innovaphone.ui1.Div(null,null,"colunaesquerda"));
        var navColEsquerda = colEsquerda.add(new innovaphone.ui1.Node("nav",null,null,null));
        var ulColEsquerda = navColEsquerda.add(new innovaphone.ui1.Node("ul",null,null,null));
        for (let i = 0; i < 3; i++) {
            var liColEsquerda = ulColEsquerda.add(new innovaphone.ui1.Node("li",null,null,null));  
        }
        var lista = {a: texts.text("licInicio"), b: texts.text("licCardapio")};
        for (var x in lista) {
        var a = liColEsquerda.add(new innovaphone.ui1.Node("a",null,lista[x],null));
      }
        var id = {a:"novidades",b:"restaurante"}
        for (var c in id)
        a.setAttribute("id",id[c])
    }
    function colDireita(){
        //linha 1 beginning
        var colDireita = that.add(new innovaphone.ui1.Div(null,null,"colunadireita"));
        var linha1 = colDireita.add(new innovaphone.ui1.Div(null,null,"linha1"));
        var imgLinha1 = linha1.add(new innovaphone.ui1.Node("img",null,null,"logo-inn"));
        imgLinha1.setAttribute("src","./images/imglogoinn.png");
        //linha 2 end

        // linha news (PDF) beginning  
        var linhaNews = colDireita.add(new innovaphone.ui1.Div("display: block;",null,null));
        linhaNews.setAttribute("id","linhanews");
        var id = {a:"iframedesktop",b:"iframemobile"}
        for(var x in id){
            var iframe = linhaNews.add(new innovaphone.ui1.Node("iframe","position: absolute; height: 100%; width: 100%;"));
            iframe.setAttribute("id",id[x]);
            iframe.setAttribute("src","./news/news.pdf#toolbar=0")
        }
        // linha news (PDF) end

        //linha cardapio beginning
        var linhaCardapio = colDireita.add(new innovaphone.ui1.Div("display:none;",null,null));
        linhaCardapio.setAttribute("id","linhacardapio");
        var divAll = linhaCardapio.add(new innovaphone.ui1.Div(null,null,null));
        divAll.setAttribute("id","all");
        var header = divAll.add(new innovaphone.ui1.Node("header",null,null,"header1"));
        var h1Cardapio = header.add(new innovaphone.ui1.Node("h1",null,texts.text("licCardapio"),null));
        var divinfo = divAll.add(new innovaphone.ui1.Div(null,null,"info"));
        var h3divinfo = divinfo.add(new innovaphone.ui1.Node("h3",null,texts.text("licCardapioUpdate"),null))
        //linha cardapio end

        //section main beginning
        // FAZER A SECTION MAIN NA TERÇA FEIRA 6/12
        //section main end
    }
    function insertReview() {
        var annonimous = document.getElementById("checkAnonimo");
        if (annonimous.checked) {
            var name = "anonimo";
        } else {
            var name = username;
        }
        var rate = document.querySelector('input[name="rate"]:checked').value;
        var comment = document.getElementById("textareaSugestao").value;
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);

        app.send({ api: "restaurante", mt: "InsertReview", nome: name, avaliacao: rate, comentario: comment, data: today.toISOString(), vizualizada: 0 });

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
    elSpan.addEventListener("click", function () { closeModal() }, false);

    function closeModal() {
        modal.style.display = "none";
    }

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

    var res = document.getElementById('res')

    var myBtn3 = document.getElementById('checkAnonimo').checked;
    myBtn3.addEventListener("click",function () {
        res.style.display = "none";
    })
} 



Wecom.space.prototype = innovaphone.ui1.nodePrototype;
