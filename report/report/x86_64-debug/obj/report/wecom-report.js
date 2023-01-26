
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.report = Wecom.report || function (start, args) {
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

    var texts = new innovaphone.lib1.Languages(Wecom.reportTexts, start.lang);
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "user", mt: "UserMessage" });
        // document.getElementById('user').innerHTML = dn
        
        
    }

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
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
        var username = user.add(new innovaphone.ui1.Node("span","font-size: 1.25rem; color:white; margin: 5px;","Nome do usuário",null));
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
            var Arelatorios3 = lirelatorios3.add(new innovaphone.ui1.Node("a",null,texts.text("labelDetalhadoRamal"),null));
            Arelatorios3.setAttribute("id","DTR")
            var Arelatorios4 = lirelatorios4.add(new innovaphone.ui1.Node("a",null,texts.text("labelTotalRamal"),null));
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
        var divNumOrigem = colDireita.add(new innovaphone.ui1.Div("position: absolute; top: 45.6%; left: 6%; font-weight: bold;",texts.text("labelNumOrigem"),null));
        var InputNumOrigem = colDireita.add(new innovaphone.ui1.Input("position: absolute; top: 45%; left: 21%; height: 25px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F; ",null,null,null,"number",null));
        var divRamal = colDireita.add(new innovaphone.ui1.Div("position: absolute; top: 55.6%; left: 6%; font-weight: bold;",texts.text("labelRamal"),null));
        var InputRamal = colDireita.add(new innovaphone.ui1.Input("position: absolute; top: 55.0%; left: 12%; height: 25px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F; ",null,null,null,"number",null));
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
    
}

Wecom.report.prototype = innovaphone.ui1.nodePrototype;
