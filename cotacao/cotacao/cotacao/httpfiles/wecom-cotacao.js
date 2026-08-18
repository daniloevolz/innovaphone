
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

    // Cache para armazenar as últimas cotações obtidas
    var cotacoesCache = {
        USD: null,
        EUR: null,
        GBP: null,
        lastUpdate: null
    };

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
        
        // Verificar se cache está válido (menos de 5 minutos)
        if (cotacoesCache.lastUpdate && (timeElapsed - cotacoesCache.lastUpdate) < 300000) {
            // Usar valores do cache
            if (cotacoesCache.USD) {
                document.getElementById('item-dolar').innerHTML = texts.text("usd") + cotacoesCache.USD.value;
                document.getElementById('item-data').innerHTML = texts.text("licBCB") + cotacoesCache.USD.date;
            }
            if (cotacoesCache.EUR) {
                document.getElementById('item-euro').innerHTML = texts.text("eur") + cotacoesCache.EUR.value;
            }
            if (cotacoesCache.GBP) {
                document.getElementById('item-libra').innerHTML = texts.text("gbp") + cotacoesCache.GBP.value;
            }
            return;
        }
        
        // Limite máximo de tentativas (5 dias úteis)
        const maxAttempts = 5;
        let date = formatDate(today, 'mm-dd-aaaa');
        let attempts = 0;
        
        // Função para buscar cotação de uma moeda com retry limitado
        function fetchCotacao(moeda, elementId, moneyDescription) {
            return new Promise((resolve) => {
                let currentDate = new Date(today);
                let currentAttempts = 0;
                
                function tryFetch() {
                    const currentDateStr = formatDate(currentDate, 'mm-dd-aaaa');
                    const url = bcblink + currentDateStr + "%27&@moeda=%27" + moeda + "%27&$format=json";
                    
                    // Usar requisição assíncrona
                    var Httpreq = new XMLHttpRequest();
                    Httpreq.open("GET", url, true);
                    Httpreq.onreadystatechange = function() {
                        if (Httpreq.readyState == 4) {
                            if (Httpreq.status == 200) {
                                try {
                                    var json_obj = JSON.parse(Httpreq.responseText);
                                    // Tentar diferentes índices (0-4)
                                    for (let i = 4; i >= 0; i--) {
                                        try {
                                            const cotacaoVenda = json_obj.value[i].cotacaoVenda;
                                            const dataHora = json_obj.value[i].dataHoraCotacao;
                                            resolve({
                                                success: true,
                                                value: cotacaoVenda,
                                                date: dataHora,
                                                dateStr: currentDateStr
                                            });
                                            return;
                                        } catch (e) {}
                                    }
                                    // Se não achou, tentar dia anterior
                                    currentDate.setDate(currentDate.getDate() - 1);
                                    currentAttempts++;
                                    if (currentAttempts < maxAttempts) {
                                        tryFetch();
                                    } else {
                                        resolve({ success: false, moeda: moeda });
                                    }
                                } catch (e) {
                                    currentDate.setDate(currentDate.getDate() - 1);
                                    currentAttempts++;
                                    if (currentAttempts < maxAttempts) {
                                        tryFetch();
                                    } else {
                                        resolve({ success: false, moeda: moeda });
                                    }
                                }
                            } else {
                                currentDate.setDate(currentDate.getDate() - 1);
                                currentAttempts++;
                                if (currentAttempts < maxAttempts) {
                                    tryFetch();
                                } else {
                                    resolve({ success: false, moeda: moeda });
                                }
                            }
                        }
                    };
                    Httpreq.send(null);
                }
                
                tryFetch();
            });
        }
        
        // Buscar todas as moedas em paralelo
        Promise.all([
            fetchCotacao('USD', 'item-dolar', texts.text("usd")),
            fetchCotacao('EUR', 'item-euro', texts.text("eur")),
            fetchCotacao('GBP', 'item-libra', texts.text("gbp"))
        ]).then(([usdResult, eurResult, gbpResult]) => {
            // Processar resultados
            if (usdResult.success) {
                document.getElementById('item-dolar').innerHTML = texts.text("usd") + usdResult.value;
                document.getElementById('item-data').innerHTML = texts.text("licBCB") + usdResult.date;
                cotacoesCache.USD = { value: usdResult.value, date: usdResult.date };
            } else {
                console.log("Não foi possível obter cotação para USD");
            }
            
            if (eurResult.success) {
                document.getElementById('item-euro').innerHTML = texts.text("eur") + eurResult.value;
                cotacoesCache.EUR = { value: eurResult.value, date: eurResult.date };
            } else {
                console.log("Não foi possível obter cotação para EUR");
            }
            
            if (gbpResult.success) {
                document.getElementById('item-libra').innerHTML = texts.text("gbp") + gbpResult.value;
                cotacoesCache.GBP = { value: gbpResult.value, date: gbpResult.date };
            } else {
                console.log("Não foi possível obter cotação para GBP");
            }
            
            cotacoesCache.lastUpdate = Date.now();
        });
    }
    // Função Get mantida para compatibilidade, mas não é mais usada
    function Get(yourUrl) {
        var Httpreq = new XMLHttpRequest();
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
