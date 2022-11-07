
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

    // var elInicioDiv = document.getElementById("inicio");
    // elInicioDiv.addEventListener("click", function () { MudarDiv("inicio") }, false);
    // var elB3Div = document.getElementById("b3");
    // elB3Div.addEventListener("click", function () { MudarDiv("b3") }, false);
    // var elTodasDiv = document.getElementById("todas");
    // elTodasDiv.addEventListener("click", function () { MudarDiv("todas") }, false);

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;


    function app_connected(domain, user, dn, appdomain) {
        if (app.logindata.info.unlicensed) {
          //sem licen�a
          var counter = that.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:calc(5% - 15px); font-size:30px; text-align:center", texts.text("licText")));
          that.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:30%; top:calc(15% - 6px); font-size:12px; text-align:center", null, "button")).addTranslation(texts, "licContinue").addEvent("click", function () {
             constructor();
          });

      } else {

          constructor();
      }
      
  }

    function app_message(obj) {
       
    }
    ///Edi��o de Danilo em 28/07/2022
    function constructor(){
      that.clear();
      colEsquerda();
      colDireita();
    }
    function colEsquerda(){
        var colesquerda =  that.add(new innovaphone.ui1.Div(null, null,"colunaesquerda"));
        var colnav = colesquerda.add(new innovaphone.ui1.Node("nav",null,null,"nav1"))
        var ul =  colnav.add(new innovaphone.ui1.Node("ul",null,null,null))
        var li = ul.add(new innovaphone.ui1.Node("li",null,"Início","li"));
        var li2 = ul.add(new innovaphone.ui1.Node("li",null,"B3","li"));
        var li3 = ul.add(new innovaphone.ui1.Node("li",null,"Todas as Fontes","li"));
        
    }
    function colDireita(){
        var coldireita = that.add(new innovaphone.ui1.Div(null,null,"colunadireita"));
        var linha1 = coldireita.add(new innovaphone.ui1.Div(null,null,"linha1"));
        var imginn = linha1.add(new innovaphone.ui1.Node("img",null,null,"logo-inn"));
        imginn.setAttribute("src", "logo-inn.png");

    }
    function cotacao() {
        moedas();
        const myInterval = window.setInterval(function () {
            moedas();
        }, 60000);
    }

    function moedas() {
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        var date = formatDate(today, 'mm-dd-aaaa');
        var result = dolar(date);
        console.log("Result:" + result);
        while (result = false) {
            today.setDate(today.getDate() - 1);
            date = formatDate(today, 'mm-dd-aaaa');
            result = dolar(date);
        }
        euro(date);
        libra(date);
    }
    function dolar(date) {
        console.log("Dolar Compra!" + date);
        var json_obj = JSON.parse(Get("https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@dataCotacao=%27" + date + "%27&@moeda=%27USD%27&$format=json"));

        try {
            console.log(json_obj);
            const dol = json_obj.value[4].cotacaoCompra;
            console.log("D�lar Compra: " + dol.toString().substr(0, 4));
            document.getElementById('item-dolar').innerHTML
                = "Dolar Comercial R$: " + dol.toString().substr(0, 4);
            document.getElementById('item-data').innerHTML
                = "Dados do BCB: " + json_obj.value[4].dataHoraCotacao;
            return true;
        } catch {
            try {
                const dol = json_obj.value[3].cotacaoCompra;
                console.log("D�lar Compra: " + dol.toString().substr(0, 4));
                document.getElementById('item-dolar').innerHTML
                    = "Dolar Comercial R$: " + dol.toString().substr(0, 4);
                document.getElementById('item-data').innerHTML
                    = "Dados do BCB: " + json_obj.value[3].dataHoraCotacao;
                return true;
            } catch {
                try {
                    console.log("Dolar Compra! 2");
                    const dol = json_obj.value[2].cotacaoCompra;
                    console.log("D�lar Compra: " + dol.toString().substr(0, 4));
                    document.getElementById('item-dolar').innerHTML
                        = "Dolar Comercial R$: " + dol.toString().substr(0, 4);
                    document.getElementById('item-data').innerHTML
                        = "Dados do BCB: " + json_obj.value[2].dataHoraCotacao;
                    return true;
                } catch {
                    try {
                        console.log("Dolar Compra! 1");
                        const dol = json_obj.value[1].cotacaoCompra;
                        console.log("D�lar Compra: " + dol.toString().substr(0, 4));
                        document.getElementById('item-dolar').innerHTML
                            = "Dolar Comercial R$: " + dol.toString().substr(0, 4);
                        document.getElementById('item-data').innerHTML
                            = "Dados do BCB: " + json_obj.value[1].dataHoraCotacao;
                        return true;
                    } catch {
                        try {
                            console.log("Dolar Compra! 0");
                            const dol = json_obj.value[0].cotacaoCompra;
                            console.log("D�lar Compra: " + dol.toString().substr(0, 4));
                            document.getElementById('item-dolar').innerHTML
                                = "Dolar Comercial R$: " + dol.toString().substr(0, 4);
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
        var json_obj = JSON.parse(Get("https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@dataCotacao=%27" + date + "%27&@moeda=%27EUR%27&$format=json"));
        try {
            const eur = json_obj.value[4].cotacaoCompra;
            console.log("Euro Compra: " + eur.toString().substr(0, 4));
            document.getElementById('item-euro').innerHTML
                = "Euro Comercial R$: " + eur.toString().substr(0, 4);
            return true;
        } catch {
            try {
                const eur = json_obj.value[3].cotacaoCompra;
                console.log("Euro Compra: " + eur.toString().substr(0, 4));
                document.getElementById('item-euro').innerHTML
                    = "Euro Comercial R$: " + eur.toString().substr(0, 4);
                return true;
            } catch {
                try {
                    const eur = json_obj.value[2].cotacaoCompra;
                    console.log("Euro Compra: " + eur.toString().substr(0, 4));
                    document.getElementById('item-euro').innerHTML
                        = "Euro Comercial R$: " + eur.toString().substr(0, 4);
                    return true;
                } catch {
                    try {
                        const eur = json_obj.value[1].cotacaoCompra;
                        console.log("Euro Compra: " + eur.toString().substr(0, 4));
                        document.getElementById('item-euro').innerHTML
                            = "Euro Comercial R$: " + eur.toString().substr(0, 4);
                        return true;
                    } catch {
                        try {
                            const eur = json_obj.value[0].cotacaoCompra;
                            console.log("Euro Compra: " + eur.toString().substr(0, 4));
                            document.getElementById('item-euro').innerHTML
                                = "Euro Comercial R$: " + eur.toString().substr(0, 4);
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
        var json_obj = JSON.parse(Get("https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@dataCotacao=%27" + date + "%27&@moeda=%27GBP%27&$format=json"));
        try {
            const lib = json_obj.value[4].cotacaoCompra;
            console.log("Libra Compra: " + lib.toString().substr(0, 4));
            document.getElementById('item-libra').innerHTML
                = "Libra Comercial R$: " + lib.toString().substr(0, 4);
            return true;
        } catch {
            try {
                const lib = json_obj.value[3].cotacaoCompra;
                console.log("Libra Compra: " + lib.toString().substr(0, 4));
                document.getElementById('item-libra').innerHTML
                    = "Libra Comercial R$: " + lib.toString().substr(0, 4);
                return true;
            } catch {
                try {
                    const lib = json_obj.value[2].cotacaoCompra;
                    console.log("Libra Compra: " + lib.toString().substr(0, 4));
                    document.getElementById('item-libra').innerHTML
                        = "Libra Comercial R$: " + lib.toString().substr(0, 4);
                    return true;
                } catch {
                    try {
                        const lib = json_obj.value[1].cotacaoCompra;
                        console.log("Libra Compra: " + lib.toString().substr(0, 4));
                        document.getElementById('item-libra').innerHTML
                            = "Libra Comercial R$: " + lib.toString().substr(0, 4);
                        return true;
                    } catch {
                        try {
                            const lib = json_obj.value[0].cotacaoCompra;
                            console.log("Libra Compra: " + lib.toString().substr(0, 4));
                            document.getElementById('item-libra').innerHTML
                                = "Libra Comercial R$: " + lib.toString().substr(0, 4);
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

    // function MudarDiv(el) {
    //     if (el == "inicio") {
    //         document.getElementById("b3").style.fontWeight = 'normal';
    //         document.getElementById("todas").style.fontWeight = 'normal';
    //         document.getElementById("inicio").style.fontWeight = 'bold';
    //         document.getElementById('linha2').style.display = 'flex';
    //         document.getElementById('linha2b3').style.display = 'none';
    //         document.getElementById('linha2todas').style.display = 'none';
    //     } else if (el == "b3") {
    //         document.getElementById("b3").style.fontWeight = 'bold';
    //         document.getElementById("todas").style.fontWeight = 'normal';
    //         document.getElementById("inicio").style.fontWeight = 'normal';
    //         document.getElementById('linha2').style.display = 'none';
    //         document.getElementById('linha2b3').style.display = 'block';
    //         document.getElementById('linha2todas').style.display = 'none';
    //     } else if (el == "todas") {
    //         document.getElementById("b3").style.fontWeight = 'normal';
    //         document.getElementById("todas").style.fontWeight = 'bold';
    //         document.getElementById("inicio").style.fontWeight = 'normal';
    //         document.getElementById('linha2').style.display = 'none';
    //         document.getElementById('linha2b3').style.display = 'none';
    //         document.getElementById('linha2todas').style.display = 'block';
    //     }
    // }

    ///Fim Edi��o Danilo
}

Wecom.cotacao.prototype = innovaphone.ui1.nodePrototype;
