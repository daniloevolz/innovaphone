
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.cotacao = Wecom.cotacao || function (start, args) {
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

    var texts = new innovaphone.lib1.Languages(Wecom.cotacaoTexts, start.lang);
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;


    function app_connected(domain, user, dn, appdomain) {
            app.send({ api: "user", mt: "UserMessage" });
    }
  
    var bcblink = "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@dataCotacao=%27";
    var b3link = "";
    var todaslink = "";
    var myInterval;

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
            b3link = obj.urlb3;
            todaslink = obj.urltodas;
            bcblink = obj.urlbcb;
            constructor();
        }
    }
    function constructor() {
        that.clear();
        colEsquerda();
        colDireita();

        var elInicioDiv = document.getElementById("inicio");
        elInicioDiv.addEventListener("click", function () { MudarDiv("inicio") }, false);
        var elB3Div = document.getElementById("b3");
        elB3Div.addEventListener("click", function () { MudarDiv("b3") }, false);
        var elTodasDiv = document.getElementById("todas");
        elTodasDiv.addEventListener("click", function () { MudarDiv("todas") }, false);

        displayMoney();     
    }
    function colEsquerda(){
        var colesquerda =  that.add(new innovaphone.ui1.Div(null, null,"colunaesquerda"));
        var colnav = colesquerda.add(new innovaphone.ui1.Node("nav",null,null,"nav1"))
        var ul =  colnav.add(new innovaphone.ui1.Node("ul",null,null,null))
        var li = ul.add(new innovaphone.ui1.Node("li",null,null,"li"));
        var li2 = ul.add(new innovaphone.ui1.Node("li",null,null,"li"));
        var li3 = ul.add(new innovaphone.ui1.Node("li",null,null,"li"));
        var a = li.add(new innovaphone.ui1.Node("a",null,texts.text("licInicio"),"a"))
        var a2 = li2.add(new innovaphone.ui1.Node("a",null,b3link,"a"))
        var a3 = li3.add(new innovaphone.ui1.Node("a",null,todaslink,"a"))
        a.setAttribute("href","#")
        a2.setAttribute("href","#")
        a3.setAttribute("href","#")
        a.setAttribute("id","inicio")
        a2.setAttribute("id","todas")
        a3.setAttribute("id","b3")
        //var divWecom = colesquerda.add(new innovaphone.ui1.Node("div",null,null,"divWecomEsquerda").setAttribute("id","divWecomEsquerda"))
    }

    function colDireita(){
        var coldireita = that.add(new innovaphone.ui1.Div("display:block", null, "colunadireita"));
        coldireita.setAttribute("id", "colunadireita")
        // linha 1

        /*
        var linha1 = coldireita.add(new innovaphone.ui1.Div(null,null,"linha1"));
        var imginn = linha1.add(new innovaphone.ui1.Node("img",null,null,"logo-inn"));
        imginn.setAttribute("src", "logo-inn.png");
        */
       
        //// linha 2 
        //var linha2 = coldireita.add(new innovaphone.ui1.Div("display:flex",null,"linha2"));
        //linha2.setAttribute("id","linha2")
        ////linha 2 - dolar
        //var divDolar = linha2.add(new innovaphone.ui1.Div(null,null,"div-dolar"));
        //var imgDolar = divDolar.add(new innovaphone.ui1.Node("img",null,null,"img-item"));
        //imgDolar.setAttribute("src","img-dolar.png");
        //imgDolar.setAttribute("id","img-itemdol");
        //var labelDolar = divDolar.add(new innovaphone.ui1.Node("label",null,null,"item-dolar"));
        //labelDolar.setAttribute("id","item-dolar");
        //// linha 2 - euro
        //var divEuro = linha2.add(new innovaphone.ui1.Div(null,null,"div-euro"));
        //var imgEuro = divEuro.add(new innovaphone.ui1.Node("img",null,null,"img-item"));
        //imgEuro.setAttribute("src","img-euro.png");
        //var labelEuro = divEuro.add(new innovaphone.ui1.Node("label",null,null,"item-euro"));
        //labelEuro.setAttribute("id","item-euro");
        ////linha 2 - libra 
        //var divLibra = linha2.add(new innovaphone.ui1.Div(null,null,"div-libra"));
        //var imgLibra = divLibra.add(new innovaphone.ui1.Node("img",null,null,"img-item"));
        //imgLibra.setAttribute("src","img-libra.png");
        //var labelLibra = divLibra.add(new innovaphone.ui1.Node("label",null,null,"item-libra"));
        //labelLibra.setAttribute("id","item-libra");
        //// linha2 - Dados do BCB
        //var divBCB = linha2.add(new innovaphone.ui1.Div(null,null,"div-data"));
        //var h1BCB = divBCB.add(new innovaphone.ui1.Node("h1","font-size:10px; display:block; font-family:'Century Gothic'; color:grey",texts.text("licBCB"),null));
        //h1BCB.setAttribute("id","item-data");
        //// linha 2 - LOGO WECOM
        //var wecom = linha2.add(new innovaphone.ui1.Div(null,null,null));
        //wecom.setAttribute("id","logowecom");
        //// var wecomA = wecom.add(new innovaphone.ui1.Node("a",null,null,null))
        //// wecomA.setAttribute("href","https://wecom.com.br")
        //// imgwecom.setAttribute("src","wecom-white.png")



        //linha2b3
        //var linha2b3 = coldireita.add(new innovaphone.ui1.Div(null,null,"linha2b3"))
        //linha2b3.setAttribute("id","linha2b3")
        //var Divlinha2b3 = linha2b3.add(new innovaphone.ui1.Div("width: auto;height: auto;background: transparent;padding: 0 !important; margin-left:0px;",null,null))
        //var iframelinha2b3  = Divlinha2b3.add(new innovaphone.ui1.Node("iframe","width: 100%; height: 100%; margin: 0 !important; padding: 0 !important;",null,null))
        //iframelinha2b3.setAttribute("id","tradingview_8c59f")
        //iframelinha2b3.setAttribute("src",b3link)
        

        //linha2 todas
       // var linha2todas = coldireita.add(new innovaphone.ui1.Div(null,null,"linha2todas"))
       // linha2todas.setAttribute("id","linha2todas")
       // var divTradingView = linha2todas.add(new innovaphone.ui1.Div("width: auto; z-index: 1000; height: auto; background: transparent; padding: 0 !important; margin-left: 0px;",null,"tradingview-widget-container"))
       // var divinside = divTradingView.add(new innovaphone.ui1.Div("z-index: 1000",null,null))
       // divinside.setAttribute("id","tradingview_f9a16")
       // var divinside2 = divTradingView.add(new innovaphone.ui1.Div("z-index: 1000",null,"tradingview-widget-copyright"))
       //var TradingViewiframe = divTradingView.add(new innovaphone.ui1.Node("iframe","width:100%;height:100%;",null,null))
       // TradingViewiframe.setAttribute("src",todaslink)
   
        }

    function cotacao() {
        //Buscar a primeira vez
        moedas();
        //Criar o Timer para atualização da tela periodicamente
        myInterval = window.setInterval(function () {
            moedas();
        }, 60000);
    }

    function moedas() {
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        var date = formatDate(today, 'mm-dd-aaaa');
        //var result = dolar(date);
        var result = updateValues(date, "%27&@moeda=%27USD%27&$format=json", "item-dolar", texts.text("usd"), texts.text("licBCB"))
        console.log("Result:" + result);
        while (result == false) {
            today.setDate(today.getDate() - 1);
            date = formatDate(today, 'mm-dd-aaaa');
            //result = dolar(date);
            result = updateValues(date, "%27&@moeda=%27USD%27&$format=json", "item-dolar", texts.text("usd"), texts.text("licBCB"))

        }
        //euro(date);
        updateValues(date, "%27&@moeda=%27EUR%27&$format=json", "item-euro", texts.text("eur"), texts.text("licBCB"))
        //libra(date);
        updateValues(date, "%27&@moeda=%27GBP%27&$format=json", "item-libra", texts.text("gbp"), texts.text("licBCB"))
    }
    function dolar(date) {
        console.log("Dolar Compra!" + date);
        var json_obj = JSON.parse(Get(bcblink + date + "%27&@moeda=%27USD%27&$format=json"));

        try {
            console.log(json_obj);
            //const dol = json_obj.value[4].cotacaoCompra;
            const dol = json_obj.value[4].cotacaoVenda;
            console.log("Dolar Compra: " + dol.toString());
            document.getElementById('item-dolar').innerHTML
                = "Dolar Comercial R$: " + dol.toString();
            document.getElementById('item-data').innerHTML
                = "Dados do BCB: " + json_obj.value[4].dataHoraCotacao;
            return true;
        } catch {
            try {
                //const dol = json_obj.value[3].cotacaoCompra;
                const dol = json_obj.value[3].cotacaoVenda;
                console.log("Dolar Compra: " + dol.toString());
                document.getElementById('item-dolar').innerHTML
                    = "Dolar Comercial R$: " + dol.toString();
                document.getElementById('item-data').innerHTML
                    = "Dados do BCB: " + json_obj.value[3].dataHoraCotacao;
                return true;
            } catch {
                try {
                    console.log("Dolar Compra! 2");
                    //const dol = json_obj.value[2].cotacaoCompra;
                    const dol = json_obj.value[2].cotacaoVenda;
                    console.log("Dolar Compra: " + dol.toString());
                    document.getElementById('item-dolar').innerHTML
                        = "Dolar Comercial R$: " + dol.toString();
                    document.getElementById('item-data').innerHTML
                        = "Dados do BCB: " + json_obj.value[2].dataHoraCotacao;
                    return true;
                } catch {
                    try {
                        console.log("Dolar Compra! 1");
                        //const dol = json_obj.value[1].cotacaoCompra;
                        const dol = json_obj.value[1].cotacaoVenda;
                        console.log("Dolar Compra: " + dol.toString());
                        document.getElementById('item-dolar').innerHTML
                            = "Dolar Comercial R$: " + dol.toString();
                        document.getElementById('item-data').innerHTML
                            = "Dados do BCB: " + json_obj.value[1].dataHoraCotacao;
                        return true;
                    } catch {
                        try {
                            console.log("Dolar Compra! 0");
                            //const dol = json_obj.value[0].cotacaoCompra;
                            const dol = json_obj.value[0].cotacaoVenda;
                            console.log("Dolar Compra: " + dol.toString());
                            document.getElementById('item-dolar').innerHTML
                                = "Dolar Comercial R$: " + dol.toString();
                            document.getElementById('item-data').innerHTML
                                = "Dados do BCB: " + json_obj.value[0].dataHoraCotacao;
                            return true;
                        } catch {
                            return false;
                        }
                    }
                }
            }
        }
    }
    function euro(date) {
        console.log("Euro Compra!");
        var json_obj = JSON.parse(Get(bcblink + date + "%27&@moeda=%27EUR%27&$format=json"));
        try {
            //const eur = json_obj.value[4].cotacaoCompra;
            const eur = json_obj.value[4].cotacaoVenda;
            console.log("Euro Compra: " + eur.toString());
            document.getElementById('item-euro').innerHTML
                = "Euro Comercial R$: " + eur.toString();
            return true;
        } catch {
            try {
                //const eur = json_obj.value[3].cotacaoCompra;
                const eur = json_obj.value[3].cotacaoVenda;
                console.log("Euro Compra: " + eur.toString());
                document.getElementById('item-euro').innerHTML
                    = "Euro Comercial R$: " + eur.toString();
                return true;
            } catch {
                try {
                    //const eur = json_obj.value[2].cotacaoCompra;
                    const eur = json_obj.value[2].cotacaoVenda;
                    console.log("Euro Compra: " + eur.toString());
                    document.getElementById('item-euro').innerHTML
                        = "Euro Comercial R$: " + eur.toString();
                    return true;
                } catch {
                    try {
                        //const eur = json_obj.value[1].cotacaoCompra;
                        const eur = json_obj.value[1].cotacaoVenda;

                        console.log("Euro Compra: " + eur.toString());
                        document.getElementById('item-euro').innerHTML
                            = "Euro Comercial R$: " + eur.toString();
                        return true;
                    } catch {
                        try {
                            const eur = json_obj.value[0].cotacaoVenda;
                            console.log("Euro Compra: " + eur.toString());
                            document.getElementById('item-euro').innerHTML
                                = "Euro Comercial R$: " + eur.toString();
                            return true;
                        } catch {
                            return false;
                        }
                    }
                }
            }
        }
    }
    function libra(date) {
        console.log("Libra Compra!");
        var json_obj = JSON.parse(Get(bcblink + date + "%27&@moeda=%27GBP%27&$format=json"));
        try {
            //const lib = json_obj.value[4].cotacaoCompra;
            const lib = json_obj.value[4].cotacaoVenda;
            console.log("Libra Compra: " + lib.toString());
            document.getElementById('item-libra').innerHTML
                = "Libra Comercial R$: " + lib.toString();
            return true;
        } catch {
            try {
                const lib = json_obj.value[3].cotacaoVenda;
                console.log("Libra Compra: " + lib.toString());
                document.getElementById('item-libra').innerHTML
                    = "Libra Comercial R$: " + lib.toString();
                return true;
            } catch {
                try {
                    const lib = json_obj.value[2].cotacaoVenda;
                    console.log("Libra Compra: " + lib.toString());
                    document.getElementById('item-libra').innerHTML
                        = "Libra Comercial R$: " + lib.toString();
                    return true;
                } catch {
                    try {
                        const lib = json_obj.value[1].cotacaoVenda;
                        console.log("Libra Compra: " + lib.toString());
                        document.getElementById('item-libra').innerHTML
                            = "Libra Comercial R$: " + lib.toString();
                        return true;
                    } catch {
                        try {
                            const lib = json_obj.value[0].cotacaoVenda;
                            console.log("Libra Compra: " + lib.toString());
                            document.getElementById('item-libra').innerHTML
                                = "Libra Comercial R$: " + lib.toString();
                            return true;
                        } catch {
                            return false;
                        }
                    }
                }
            }
        }
    }
    function Get(yourUrl) {
        var Httpreq = new XMLHttpRequest(); // a new request
        Httpreq.open("GET", yourUrl, false);
        Httpreq.send(null);
        return Httpreq.responseText;
    }
    function formatDate(date, format) {
        const map = {
            mm: date.getMonth() + 1,
            dd: date.getDate(),
            aa: date.getFullYear().toString().slice(-2),
            aaaa: date.getFullYear()
        }

        return format.replace(/mm|dd|aaaa|aa/gi, matched => map[matched])
    }

    function MudarDiv(el) {
        if (el == "inicio") {
            document.getElementById("b3").style.fontWeight = 'normal';
            document.getElementById("todas").style.fontWeight = 'normal';
            document.getElementById("inicio").style.fontWeight = 'bold';
            //document.getElementById("linha2").style.display = 'flex'; 
            //document.getElementById("linha2b3").style.display = 'none';
            //document.getElementById("linha2todas").style.display = 'none';

            // Excluir o intervalo usando clearInterval()
            clearInterval(myInterval);
            displayMoney();

         } else if (el == "b3") {
            document.getElementById("b3").style.fontWeight = 'bold';
            document.getElementById("todas").style.fontWeight = 'normal';
            document.getElementById("inicio").style.fontWeight = 'normal';
            //document.getElementById("linha2").style.display = 'none';
            //document.getElementById("linha2b3").style.display = 'block';
            //document.getElementById('linha2todas').style.display = 'none';

            // Excluir o intervalo usando clearInterval()
            clearInterval(myInterval);
            createGraph(todaslink)

        } else if (el == "todas") {
            document.getElementById("b3").style.fontWeight = 'normal';
            document.getElementById("todas").style.fontWeight = 'bold';
            document.getElementById("inicio").style.fontWeight = 'normal';
            //document.getElementById("linha2").style.display = 'none';
            //document.getElementById("linha2b3").style.display = 'none';
            //document.getElementById("linha2todas").style.display = 'block';

            // Excluir o intervalo usando clearInterval()
            clearInterval(myInterval);
            createGraph(b3link)

        }
     }

    function updateValues(date, uri, elementId, moneyDescription, dateLabel) {
        console.log(moneyDescription);
        var json_obj = JSON.parse(Get(bcblink + date + uri));
        try {
            //const lib = json_obj.value[4].cotacaoCompra;
            const lib = json_obj.value[4].cotacaoVenda;
            console.log(moneyDescription + lib.toString());
            document.getElementById(elementId).innerHTML
                = moneyDescription + lib.toString();
            document.getElementById('item-data').innerHTML
                = dateLabel + json_obj.value[4].dataHoraCotacao;
            return true;
        } catch {
            try {
                const lib = json_obj.value[3].cotacaoVenda;
                console.log(moneyDescription + lib.toString());
                document.getElementById(elementId).innerHTML
                    = moneyDescription + lib.toString();
                document.getElementById('item-data').innerHTML
                    = dateLabel + json_obj.value[3].dataHoraCotacao;
                return true;
            } catch {
                try {
                    const lib = json_obj.value[2].cotacaoVenda;
                    console.log(moneyDescription + lib.toString());
                    document.getElementById(elementId).innerHTML
                        = moneyDescription + lib.toString();
                    document.getElementById('item-data').innerHTML
                        = dateLabel + json_obj.value[2].dataHoraCotacao;
                    return true;
                } catch {
                    try {
                        const lib = json_obj.value[1].cotacaoVenda;
                        console.log(moneyDescription + lib.toString());
                        document.getElementById(elementId).innerHTML
                            = moneyDescription + lib.toString();
                        document.getElementById('item-data').innerHTML
                            = dateLabel + json_obj.value[1].dataHoraCotacao;
                        return true;
                    } catch {
                        try {
                            const lib = json_obj.value[0].cotacaoVenda;
                            console.log(moneyDescription + lib.toString());
                            document.getElementById(elementId).innerHTML
                                = moneyDescription + lib.toString();
                            document.getElementById('item-data').innerHTML
                                = dateLabel + json_obj.value[0].dataHoraCotacao;
                            return true;
                        } catch {
                            return false;
                        }
                    }
                }
            }
        }
    }

    function createGraph(symbol) {
        var tdireita = document.getElementById("colunadireita")
        tdireita.innerHTML = ''
        // Crie o elemento div principal
        var divPrincipal = document.createElement("div");
        divPrincipal.classList.add("tradingview-widget-container");
        divPrincipal.style.height = "100%";
        divPrincipal.style.width = "100%";

        // Crie o elemento div para o widget
        var divWidget = document.createElement("div");
        divWidget.classList.add("tradingview-widget-container__widget");
        divWidget.style.height = "calc(100% - 32px)";
        divWidget.style.width = "100%";

        // Crie o elemento div para o texto de direitos autorais
        var divCopyright = document.createElement("div");
        divCopyright.classList.add("tradingview-widget-copyright");

        // Crie o link dentro do elemento de direitos autorais
        var link = document.createElement("a");
        link.href = "https://br.tradingview.com/";
        link.rel = "noopener nofollow";
        link.target = "_blank";

        // Crie o elemento de texto dentro do link
        var span = document.createElement("span");
        span.classList.add("blue-text");
        span.textContent = "Monitore todos os mercados no TradingView";

        // Adicione o elemento de texto ao link
        link.appendChild(span);

        // Adicione o link ao elemento de direitos autorais
        divCopyright.appendChild(link);

        // Adicione os elementos ao elemento principal
        divPrincipal.appendChild(divWidget);
        divPrincipal.appendChild(divCopyright);

        // Adicione o elemento principal ao corpo do documento
        tdireita.appendChild(divPrincipal);

        // Crie o elemento de script
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.async = true;

        // Defina o conteúdo do script
        script.textContent = `{
  "autosize": true,
  "symbol": "${symbol}",
  "interval": "D",
  "timezone": "America/Sao_Paulo",
  "theme": "light",
  "style": "1",
  "locale": "br",
  "enable_publishing": false,
  "allow_symbol_change": true,
  "calendar": false,
  "support_host": "https://www.tradingview.com"
}`;

        // Adicione o elemento de script ao elemento principal
        divPrincipal.appendChild(script);

    }

    function displayMoney() {
        var tdireita = document.getElementById("colunadireita")
        tdireita.innerHTML = ''

        // Criar a div principal para linha2
        var linha2 = document.createElement("div");
        linha2.style.display = "flex";
        linha2.setAttribute("id", "linha2");
        linha2.classList.add("linha2");

        // Criar a div para o item Dólar
        var divDolar = document.createElement("div");
        divDolar.setAttribute("class", "div-dolar");
        linha2.appendChild(divDolar);

        // Adicionar imagem do Dólar
        var imgDolar = document.createElement("img");
        imgDolar.setAttribute("src", "img-dolar.png");
        imgDolar.setAttribute("class", "img-item");
        imgDolar.setAttribute("id", "img-itemdol");
        divDolar.appendChild(imgDolar);

        // Adicionar label do Dólar
        var labelDolar = document.createElement("label");
        labelDolar.setAttribute("class", "item-dolar");
        labelDolar.setAttribute("id", "item-dolar");
        divDolar.appendChild(labelDolar);

        // Criar a div para o item Euro
        var divEuro = document.createElement("div");
        divEuro.setAttribute("class", "div-euro");
        linha2.appendChild(divEuro);

        // Adicionar imagem do Euro
        var imgEuro = document.createElement("img");
        imgEuro.setAttribute("src", "img-euro.png");
        imgEuro.setAttribute("class", "img-item");
        divEuro.appendChild(imgEuro);

        // Adicionar label do Euro
        var labelEuro = document.createElement("label");
        labelEuro.setAttribute("class", "item-euro");
        labelEuro.setAttribute("id", "item-euro");
        divEuro.appendChild(labelEuro);

        // Criar a div para o item Libra
        var divLibra = document.createElement("div");
        divLibra.setAttribute("class", "div-libra");
        linha2.appendChild(divLibra);

        // Adicionar imagem da Libra
        var imgLibra = document.createElement("img");
        imgLibra.setAttribute("src", "img-libra.png");
        imgLibra.setAttribute("class", "img-item");
        divLibra.appendChild(imgLibra);

        // Adicionar label da Libra
        var labelLibra = document.createElement("label");
        labelLibra.setAttribute("class", "item-libra");
        labelLibra.setAttribute("id", "item-libra");
        divLibra.appendChild(labelLibra);

        // Criar a div para os dados do BCB
        var divBCB = document.createElement("div");
        divBCB.setAttribute("class", "div-data");
        linha2.appendChild(divBCB);

        // Adicionar título para os dados do BCB
        var h1BCB = document.createElement("h1");
        h1BCB.textContent = texts.text("labelBCB");
        h1BCB.setAttribute("id", "item-data");
        h1BCB.style.fontSize = "10px";
        h1BCB.style.display = "block";
        h1BCB.style.fontFamily = "Century Gothic";
        h1BCB.style.color = "grey";
        divBCB.appendChild(h1BCB);

        // Criar a div para o logo WECOM
        var wecom = document.createElement("div");
        linha2.appendChild(wecom);
        wecom.setAttribute("id", "logowecom");

        // Adicionar linha2 ao corpo do documento
        tdireita.appendChild(linha2);

        //Iniciar o Timer de atualização dos valores agora que a tela está pronta
        cotacao();
    }
    ///Fim Edicao Danilo

    }
Wecom.cotacao.prototype = innovaphone.ui1.nodePrototype;
