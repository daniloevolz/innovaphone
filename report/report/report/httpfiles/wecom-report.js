
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.report = Wecom.report || function (start, args) {
    this.createNode("body");
    var that = this;

    var list_ramais = [];
     // Horario Atual
    var day = new Date().toLocaleString();

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

    var texts = new innovaphone.lib1.Languages(Wecom.reportTexts, start.lang);
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;
    app.onclosed = waitConnection;
    app.onerror = waitConnection;
    var UIuser;
<<<<<<< HEAD

    function waitConnection() {
        that.clear();
        var bodywait = new innovaphone.ui1.Div("height: 100%; width: 100%; display: inline-flex; position: absolute;justify-content: center; background-color:rgba(100,100,100,0.5)", null, "bodywaitconnection")
        bodywait.addHTML('<svg class="pl" viewBox="0 0 128 128" width="128px" height="128px" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="hsl(193,90%,55%)" /><stop offset="100%" stop-color="hsl(223,90%,55%)" /></linearGradient></defs>	<circle class="pl__ring" r="56" cx="64" cy="64" fill="none" stroke="hsla(0,10%,10%,0.1)" stroke-width="16" stroke-linecap="round" />	<path class="pl__worm" d="M92,15.492S78.194,4.967,66.743,16.887c-17.231,17.938-28.26,96.974-28.26,96.974L119.85,59.892l-99-31.588,57.528,89.832L97.8,19.349,13.636,88.51l89.012,16.015S81.908,38.332,66.1,22.337C50.114,6.156,36,15.492,36,15.492a56,56,0,1,0,56,0Z" fill="none" stroke="url(#pl-grad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="44 1111" stroke-dashoffset="10" /></svg >');
        that.add(bodywait);
    }
=======
>>>>>>> b9d838dcbbfe3362e59a7861c40264b581c9a850

    function app_connected(domain, user, dn, appdomain) {
        UIuser = dn;
        app.send({ api: "user", mt: "UserMessage" });
        app.send({ api: "user", mt: "SelectRamais"})
        // document.getElementById('user').innerHTML = dn
        
        
    }

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
            // MakeReportTA()
        }
        if (obj.api == "user" && obj.mt == "SelectUsersResultSuccess"){
            console.log(obj.result)
            list_ramais = [];
            list_ramais = JSON.parse(obj.result);
                 
            constructor();
       
        var TotaisPeriodo = document.getElementById("TTP");
        TotaisPeriodo.addEventListener("click",function() {MudarTexto("TTP")})

        var DetalhadoPeriodo = document.getElementById("DTP");
        DetalhadoPeriodo.addEventListener("click",function() {MudarTexto("DTP")})

        var DetalhadoRamal = document.getElementById("DTR");
        DetalhadoRamal.addEventListener("click",function() {MudarTexto("DTR")})

        var TotalRamal = document.getElementById("TTR");
        TotalRamal.addEventListener("click",function() {MudarTexto("TTR")})
        
            
        }
    }
    function waitConnection() {
        that.clear();
        var bodywait = new innovaphone.ui1.Div("height: 100%; width: 100%; display: inline-flex; position: absolute;justify-content: center; background-color:rgba(100,100,100,0.5)", null, "bodywaitconnection")
        bodywait.addHTML('<svg class="pl" viewBox="0 0 128 128" width="128px" height="128px" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="hsl(193,90%,55%)" /><stop offset="100%" stop-color="hsl(223,90%,55%)" /></linearGradient></defs>	<circle class="pl__ring" r="56" cx="64" cy="64" fill="none" stroke="hsla(0,10%,10%,0.1)" stroke-width="16" stroke-linecap="round" />	<path class="pl__worm" d="M92,15.492S78.194,4.967,66.743,16.887c-17.231,17.938-28.26,96.974-28.26,96.974L119.85,59.892l-99-31.588,57.528,89.832L97.8,19.349,13.636,88.51l89.012,16.015S81.908,38.332,66.1,22.337C50.114,6.156,36,15.492,36,15.492a56,56,0,1,0,56,0Z" fill="none" stroke="url(#pl-grad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="44 1111" stroke-dashoffset="10" /></svg >');
        that.add(bodywait);
    }
    function constructor(){
    
        that.clear();
        // col Esquerda
        var colEsquerda = that.add(new innovaphone.ui1.Div(null,null,"colunaesquerda"));
        var divreport = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; border-bottom: 1px solid #4b545c; border-width: 100%; height: 10%; width: 100%; background-color: #02163F;  display: flex; align-items: center;",null,null));
        var imglogo = divreport.add(new innovaphone.ui1.Node("img","max-height: 33px; opacity: 0.8;",null,null));
        imglogo.setAttribute("src","logo-wecom.png");
        var spanreport = divreport.add(new innovaphone.ui1.Div("font-size: 1.25rem; color:white; margin : 5px;",texts.text("labelNameApp"),null));
        var user = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; height: 10%; top: 10%; width: 100%; align-items: center; display: flex; border-bottom: 1px solid #4b545c"));
        var imguser = user.add(new innovaphone.ui1.Node("img","max-height: 33px;",null,null));
        imguser.setAttribute("src","icon-user.png");
        var username = user.add(new innovaphone.ui1.Node("span","font-size: 1.25rem; color:white; margin: 5px;",UIuser,null));
        username.setAttribute("id","user")
        
        var relatorios = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 24%; height: 40%;"));
        var prelatorios = relatorios.add(new innovaphone.ui1.Node("p","text-align: center; font-size: 20px;",texts.text("labelRelatórios") ,null));
        var br = relatorios.add(new innovaphone.ui1.Node("br",null,null,null));

            var lirelatorios1 = relatorios.add(new innovaphone.ui1.Node("li","opacity: 0.9",null,"liOptions"))
            var lirelatorios2 = relatorios.add(new innovaphone.ui1.Node("li","opacity: 0.9",null,"liOptions"))
            var lirelatorios3 = relatorios.add(new innovaphone.ui1.Node("li","opacity: 0.9",null,"liOptions"))
            var lirelatorios4 = relatorios.add(new innovaphone.ui1.Node("li","opacity: 0.9",null,"liOptions"))
            var Arelatorios1 = lirelatorios1.add(new innovaphone.ui1.Node("a",null,texts.text("labelTotalPeríodo"),null));
            Arelatorios1.setAttribute("id","TTP");
            var Arelatorios2 = lirelatorios2.add(new innovaphone.ui1.Node("a",null,texts.text("labelDetalhadoPeríodo"),null));
            Arelatorios2.setAttribute("id","DTP")
            var Arelatorios3 = lirelatorios3.add(new innovaphone.ui1.Node("a",null,texts.text("labelDetalhadoAtendente"),null));
            Arelatorios3.setAttribute("id","DTR")
            var Arelatorios4 = lirelatorios4.add(new innovaphone.ui1.Node("a",null,texts.text("labelTotalAtendente"),null));
            Arelatorios4.setAttribute("id","TTR")
            
        var divother = colEsquerda.add(new innovaphone.ui1.Div("text-align: left; position: absolute; top:59%;",null,null));
        var divother2 = divother.add(new innovaphone.ui1.Div(null,null,"otherli"));

        var config = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 62%;",null,null));
        var liconfig = config.add(new innovaphone.ui1.Node("li","display:flex; aligns-items: center",null,"config"));
        
        var imgconfig = liconfig.add(new innovaphone.ui1.Node("img","max-height: 30px; opacity: 0.9; margin: 5px; ",null,null));
        imgconfig.setAttribute("src","config-icon.png");
        var Aconfig = liconfig.add(new innovaphone.ui1.Node("a","display: flex; align-items: center; justify-content: center;",texts.text("labelConfig"),null));
        Aconfig.setAttribute("href","#");
        // col direita
        var colDireita = that.add(new innovaphone.ui1.Div(null,null,"colunadireita"));
        var divFiltros = colDireita.add(new innovaphone.ui1.Div("position:absolute; font-weight:bolder; width: 90%; top: 5%; left: 5%; font-size: 4rem;",texts.text("labelFiltros"),null));
        var divFiltrosDetails = colDireita.add(new innovaphone.ui1.Div("position:absolute; font-weight:bolder; width: 50%; top: 8.5%; left: 18%; font-size: 2rem;",texts.text("labelTotalPeríodo"),null));
        divFiltrosDetails.setAttribute("id","details");

        var divDe = colDireita.add(new innovaphone.ui1.Div("position: absolute; top: 25.5%; left: 6%; font-weight: bold;",texts.text("labelDe"),null));
        var InputDe = colDireita.add(new innovaphone.ui1.Input("position: absolute;  top: 25%; left: 9%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;",null,null,null,"date",null));
        var divAte = colDireita.add(new innovaphone.ui1.Div("position: absolute; top: 35.5%; left: 6%; font-weight: bold;",texts.text("labelAté"),null));
        var InputAte = colDireita.add(new innovaphone.ui1.Input("position: absolute; top: 35%; left: 10%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;",null,null,null,"date",null));
        var divNumOrigem = colDireita.add(new innovaphone.ui1.Div("position: absolute; top: 45.6%; left: 6%; font-weight: bold;",texts.text("labelTelefone"),null));
        var InputNumOrigem = colDireita.add(new innovaphone.ui1.Input("position: absolute; top: 45%; left: 21%; height: 25px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F; ",null,null,null,"number",null));
        var divRamal = colDireita.add(new innovaphone.ui1.Div("position: absolute; top: 55.6%; left: 6%; font-weight: bold;",texts.text("labelAtendente"),null));
        var SelectRamal = colDireita.add(new innovaphone.ui1.Node("select","position: absolute; top: 55.0%; left: 14%; height: 25px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F; font-size: 13px; font-weight: bold ",null,null));
       
        list_ramais.forEach(function (user) {
         var opt =  SelectRamal.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", user.sip, null));
         opt.setAttribute("id","sips");

       })     
       

       

        // logo WeCom colDireita
        var wecom = colDireita.add(new innovaphone.ui1.Div("position:absolute; top:90%; left: 2%;",null,null));
        var wecomA = wecom.add(new innovaphone.ui1.Node("a",null,null,null))
        wecomA.setAttribute("href","https://wecom.com.br")
        var imgwecom = wecomA.add(new innovaphone.ui1.Node("img",null,null,"imglogo"));
        imgwecom.setAttribute("src","logo.png");
        // buttons
        var btnCancel = colDireita.add(new innovaphone.ui1.Node("button","position: absolute; top: 70%; height: 50px; width: 90px; left: 75%; border-radius: 10px; background-color: transparent; border: 2px solid; border-color: #02163F; font-weight: bold;",texts.text("labelCancel"),null))
        var btnSee = colDireita.add(new innovaphone.ui1.Node("button","position: absolute; top: 70%; height: 50px; width: 90px; left: 87%; border-radius: 10px; background-color: #02163F; color: white; font-weight: bold;",texts.text("labelVisualizar"),null));
        

    }   
    // Mudar nome dos relatório conforme escolhido na coluna esquerda
    function MudarTexto(ex){
        if(ex == "TTP"){
            document.getElementById('details').innerHTML = texts.text("labelTotalPeríodo");
        }
        if(ex == "DTP"){
            document.getElementById('details').innerHTML = texts.text("labelDetalhadoPeríodo"); 
        }
        if(ex == "DTR"){
            document.getElementById('details').innerHTML = texts.text("labelDetalhadoRamal");
        }
        if(ex == "TTR"){
            document.getElementById('details').innerHTML = texts.text("labelTotalRamal");
        }
    }
    // Funções de criação do Relatório - Abreviadas pelas iniciais de cada Relatório
    function MakeReportTA(){
        that.clear();
       var divMainTA = that.add(new innovaphone.ui1.Div("width: 85%; background-color: rgb(196, 196, 196); color:black; height: 100%; position: absolute; left:15%;"));
       var divDateReport = divMainTA.add(new innovaphone.ui1.Div("text-align:left; font-size: 16px ; font-weight:bold",texts.text("labelDateReport") + day,null))                                                             
       var divAtendente = divMainTA.add(new innovaphone.ui1.Div("position:absolute; top: 10%; width:50%; height: 50px; display:flex; align-items:center; justify-content:center ;border: 1px solid black;",texts.text("labelAtendente2")))
       var divTempoFalando = divMainTA.add(new innovaphone.ui1.Div("position:absolute; top: 10%; width:50%; height: 50px; display:flex; align-items:center; left: 50%; justify-content:center ;border: 1px solid black;",texts.text("labelTempoFalando")))       
   // Tabela dos Atendentes  - mais p frente podemos seprar em uma Função conforme o desenvolvimento
   var list = divMainTA.add(new innovaphone.ui1.Div("position: absolute; left:0%; top:20%;  width: 50%; height:300px", null, "divTable"));
   var rows = list_ramais.length;
   var listView = new innovaphone.ui1.ListView(list, 30, "headercl", "arrow", false);
    //Tabela    
  list_ramais.forEach(function (b) {
      var row = [];
      row.push(b.sip);
      row.push(b.nome);
      listView.addRow(i, row, "rowcl", "#A0A0A0", "#82CAE2");
      that.add(list);
  })


   // Tabela do Tempo Falando  - mais p frente podemos seprar em uma Função conforme o desenvolvimento
        
    }
    
}

Wecom.report.prototype = innovaphone.ui1.nodePrototype;
