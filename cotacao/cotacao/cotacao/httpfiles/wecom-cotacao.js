
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

    var elInicioDiv = document.getElementById("inicio");
    elInicioDiv.addEventListener("click", function () { MudarDiv("inicio") }, false);
    var elB3Div = document.getElementById("inicio");
    elB3Div.addEventListener("click", function () { MudarDiv("b3") }, false);
    var elTodasDiv = document.getElementById("inicio");
    elTodasDiv.addEventListener("click", function () { MudarDiv("todas") }, false);

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;


    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "user", mt: "UserMessage" });
        cotacao();
    }

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
        }
    }
    ///Edição de Danilo em 28/07/2022
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
        if (result == false) {
            today.setDate(today.getDate() - 1);
            console.log("Alterando a Data:" + today);
            date = formatDate(today, 'mm-dd-aaaa');
            result = dolar(date);
            if (result == false) {
                today.setDate(today.getDate() - 1);
                date = formatDate(today, 'mm-dd-aaaa');
                result = dolar(date);
                if (result == false) {
                    today.setDate(today.getDate() - 1);
                    date = formatDate(today, 'mm-dd-aaaa');
                    result = dolar(date);
                } else {
                    euro(date);
                    libra(date);
                };
            } else {
                euro(date);
                libra(date);
            };
        } else {
            euro(date);
            libra(date);
        };
        notificar();
    }
    function dolar(date) {
        console.log("Dolar Compra!" + date);
        var json_obj = JSON.parse(Get("https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@dataCotacao=%27" + date + "%27&@moeda=%27USD%27&$format=json"));

        try {
            console.log(json_obj);
            const dol = json_obj.value[4].cotacaoCompra;
            console.log("Dólar Compra: " + dol.toString().substr(0, 4));
            document.getElementById('item-dolar').innerHTML
                = "Dolar Comercial R$: " + dol.toString().substr(0, 4);
            document.getElementById('item-data').innerHTML
                = "Dados do BCB: " + json_obj.value[4].dataHoraCotacao;
            return true;
        } catch {
            try {
                const dol = json_obj.value[3].cotacaoCompra;
                console.log("Dólar Compra: " + dol.toString().substr(0, 4));
                document.getElementById('item-dolar').innerHTML
                    = "Dolar Comercial R$: " + dol.toString().substr(0, 4);
                document.getElementById('item-data').innerHTML
                    = "Dados do BCB: " + json_obj.value[3].dataHoraCotacao;
                return true;
            } catch {
                try {
                    console.log("Dolar Compra! 2");
                    const dol = json_obj.value[2].cotacaoCompra;
                    console.log("Dólar Compra: " + dol.toString().substr(0, 4));
                    document.getElementById('item-dolar').innerHTML
                        = "Dolar Comercial R$: " + dol.toString().substr(0, 4);
                    document.getElementById('item-data').innerHTML
                        = "Dados do BCB: " + json_obj.value[2].dataHoraCotacao;
                    return true;
                } catch {
                    try {
                        console.log("Dolar Compra! 1");
                        const dol = json_obj.value[1].cotacaoCompra;
                        console.log("Dólar Compra: " + dol.toString().substr(0, 4));
                        document.getElementById('item-dolar').innerHTML
                            = "Dolar Comercial R$: " + dol.toString().substr(0, 4);
                        document.getElementById('item-data').innerHTML
                            = "Dados do BCB: " + json_obj.value[1].dataHoraCotacao;
                        return true;
                    } catch {
                        try {
                            console.log("Dolar Compra! 0");
                            const dol = json_obj.value[0].cotacaoCompra;
                            console.log("Dólar Compra: " + dol.toString().substr(0, 4));
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

    function MudarDiv(el) {
        if (el == "inicio") {
            document.getElementById("linha2b3").style.fontWeight = 'normal';
            document.getElementById("linha2todas").style.fontWeight = 'normal';
            document.getElementById("inicio").style.fontWeight = 'bold';
            document.getElementById('linha2').style.display = 'flex';
            document.getElementById('linha2b3').style.display = 'none';
            document.getElementById('linha2todas').style.display = 'none';
        } else if (el == "b3") {
            document.getElementById("linha2b3").style.fontWeight = 'bold';
            document.getElementById("linha2todas").style.fontWeight = 'normal';
            document.getElementById("inicio").style.fontWeight = 'normal';
            document.getElementById('linha2').style.display = 'none';
            document.getElementById('linha2b3').style.display = 'block';
            document.getElementById('linha2todas').style.display = 'none';
        } else if (el == "todas") {
            document.getElementById("linha2b3").style.fontWeight = 'normal';
            document.getElementById("linha2todas").style.fontWeight = 'bold';
            document.getElementById("inicio").style.fontWeight = 'normal';
            document.getElementById('linha2').style.display = 'none';
            document.getElementById('linha2b3').style.display = 'none';
            document.getElementById('linha2todas').style.display = 'block';
        }
    }

    function notificar() {
        var dis = start.consumeApi("com.innovaphone.launcher")

        var title = "Atenção: Variação de Cambio!";
        var largeIcon = "data:image/png;base64,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";
        dis.send({ mt: "AddLocalNotification", title: title, text: null, acceptTitle: "Default", largeIcon: largeIcon }, "*", "111111");
    }
    ///Fim Edição Danilo
}


Wecom.cotacao.prototype = innovaphone.ui1.nodePrototype;
