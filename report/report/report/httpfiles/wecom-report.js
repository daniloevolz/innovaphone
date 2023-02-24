
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />
/// <reference path="../../web1/ui1.listview/innovaphone.ui1.listview.js" />

var Wecom = Wecom || {};
Wecom.report = Wecom.report || function (start, args) {
    this.createNode("body");
    var appdn = start.title;
    var avatar = start.consumeApi("com.innovaphone.avatar");
    var that = this;
    var colDireita;
    
    var list_ramais = []
    
    var colorSchemes = {
        dark: {
            "--bg": "url('bg.png')",
            "--button": "#c6c6c6",
            "--text-standard": "#004c84",
            "--div-DelBtn" : "#f2f5f6",
        },
        light: {
            "--bg": "url('bg.png')",
            "--button": "#c6c6c6",
            "--text-standard": "#004c84",
            "--div-DelBtn" : "#f2f5f6",
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
    var colDireita;
    var UIuserPicture;

    function app_connected(domain, user, dn, appdomain) {
        UIuser = dn;
        //avatar
        avatar = new innovaphone.Avatar(start, user, domain);
        UIuserPicture = avatar.url(user, 100, dn);
        constructor();

        app.send({ api: "user", mt: "UserMessage" });
        app.send({ api: "user", mt: "SelectUser"})
        
        // document.getElementById('user').innerHTML = dn


    }

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
        }
        if (obj.api == "user" && obj.mt == "SelectFromReportsSuccess") {
            reportView(colDireita, obj.result, obj.src);
        }
        if(obj.api == "user" && obj.mt == "SelectUsersResultSuccess"){
            list_ramais = [];
            list_ramais = JSON.parse(obj.result); 
        }
        if (obj.api == "admin" && obj.mt == "DeleteFromReportsSuccess") {
            constructor();
            makePopup("Atenção!", texts.text(labelDeleteSuccess));
        }
    }
    function waitConnection(t) {
        t.clear();
        var bodywait = new innovaphone.ui1.Div("height: 100%; width: 100%; display: inline-flex; position: absolute;justify-content: center; background-color:rgba(100,100,100,0.5)", null, "bodywaitconnection")
        bodywait.addHTML('<svg class="pl" viewBox="0 0 128 128" width="128px" height="128px" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="hsl(193,90%,55%)" /><stop offset="100%" stop-color="hsl(223,90%,55%)" /></linearGradient></defs>	<circle class="pl__ring" r="56" cx="64" cy="64" fill="none" stroke="hsla(0,10%,10%,0.1)" stroke-width="16" stroke-linecap="round" />	<path class="pl__worm" d="M92,15.492S78.194,4.967,66.743,16.887c-17.231,17.938-28.26,96.974-28.26,96.974L119.85,59.892l-99-31.588,57.528,89.832L97.8,19.349,13.636,88.51l89.012,16.015S81.908,38.332,66.1,22.337C50.114,6.156,36,15.492,36,15.492a56,56,0,1,0,56,0Z" fill="none" stroke="url(#pl-grad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="44 1111" stroke-dashoffset="10" /></svg >');
        t.add(bodywait);
    }
    
    function makeDivClearDB(t) {
        t.clear();
        //Título
        t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:10%; font-size:25px; text-align:center", texts.text("labelTituloClearDB")));

        var divTo = t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 35%; left: 6%; font-weight: bold;", texts.text("labelTo"), null));
        var InputTo = t.add(new innovaphone.ui1.Input("position: absolute; top: 35%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "date", null).setAttribute("id", "dateTo"));
        var divReport = t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 55.6%; left: 6%; font-weight: bold;", texts.text("labelReports"), null));
        var SelectReport = new innovaphone.ui1.Node("select", "position: absolute; top: 55.0%; left: 20%; height: 25px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F; font-size: 13px; font-weight: bold ", null, null).setAttribute("id", "selectReport");
        t.add(SelectReport);
        SelectReport.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", "RptCalls", null)).setAttribute("id", "RptCalls");
        SelectReport.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", "RptAvailability", null)).setAttribute("id", "RptAvailability");
        SelectReport.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", "RptActivities", null)).setAttribute("id", "RptActivities");
        // buttons
        t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnOk").addEvent("click", function () {
            var to = document.getElementById("dateTo").value;
            var report = document.getElementById("selectReport").value;
            app.send({ api: "user", mt: "DeleteFromReports", src:report,  to: to });
            waitConnection(t);
        });
        t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:90%; font-size:12px; text-align:center; color:var(--div-DelBtn); background-color: #B0132B", null, "button-inn")).addTranslation(texts, "btnCancel").addEvent("click", function () {
            constructor();
        });
    }
    function constructor() {
        that.clear();
        // col direita
        var _colDireita = that.add(new innovaphone.ui1.Div(null, null, "colunadireitaadmin"));
        // col Esquerda
        var colEsquerda = that.add(new innovaphone.ui1.Div(null, null, "colunaesquerda"));
        var divreport = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; border-bottom: 1px solid #4b545c; border-width: 100%; height: 10%; width: 100%; background-color: #02163F;  display: flex; align-items: center;", null, null));
        var imglogo = divreport.add(new innovaphone.ui1.Node("img", "max-height: 33px; opacity: 0.8;", null, null));
        imglogo.setAttribute("src", "logo-wecom.png");
        var spanreport = divreport.add(new innovaphone.ui1.Div("font-size: 1.00rem; color:white; margin : 5px;", appdn, null));
        var user = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; height: 10%; top: 10%; width: 100%; align-items: center; display: flex; border-bottom: 1px solid #4b545c"));
        var imguser = user.add(new innovaphone.ui1.Node("img", "max-height: 33px; border-radius: 50%;", null, null));
        imguser.setAttribute("src", UIuserPicture);
        var username = user.add(new innovaphone.ui1.Node("span", "font-size: 0.75rem; color:white; margin: 5px;", UIuser, null));
        username.setAttribute("id", "user")

        var relatorios = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 26%; height: 40%;"));
        relatorios.add(new innovaphone.ui1.Node("p", "text-align: left; font-size: 20px;", texts.text("labelReports"), null));
        relatorios.add(new innovaphone.ui1.Node("br", null, null, null));
        var lirelatorios1 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        var lirelatorios2 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        var lirelatorios3 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        var lirelatorios4 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        lirelatorios1.add(new innovaphone.ui1.Node("a", null, texts.text("labelRptAvailability"), null).setAttribute("id", "RptAvailability"));
        lirelatorios2.add(new innovaphone.ui1.Node("a", null, texts.text("labelRptCalls"), null).setAttribute("id", "RptCalls"));
        lirelatorios3.add(new innovaphone.ui1.Node("a", null, texts.text("labelRptActivities"), null).setAttribute("id", "RptActivities"));
        lirelatorios4.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgDefaults"), null).setAttribute("id", "CfgDefaults"));
       
        var divother = colEsquerda.add(new innovaphone.ui1.Div("text-align: left; position: absolute; top:59%;", null, null));
        var divother2 = divother.add(new innovaphone.ui1.Div(null, null, "otherli"));

        var config = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 90%;", null, null));
        var liconfig = config.add(new innovaphone.ui1.Node("li", "display:flex; aligns-items: center", null, "config"));

        var imgconfig = liconfig.add(new innovaphone.ui1.Node("img", "width: 100%; opacity: 0.9; margin: 2px; ", null, null));
        imgconfig.setAttribute("src", "logo.png");
        //var Aconfig = liconfig.add(new innovaphone.ui1.Node("a", "display: flex; align-items: center; justify-content: center;", texts.text("labelConfig"), null));
        //Aconfig.setAttribute("href", "#");
        var a = document.getElementById("RptAvailability");
        a.addEventListener("click", function () { filterReports("RptAvailability", _colDireita) })
        var a = document.getElementById("RptCalls");
        a.addEventListener("click", function () { filterReports("RptCalls", _colDireita) })
        var a = document.getElementById("RptActivities");
        a.addEventListener("click", function () { filterReports("RptActivities", _colDireita) })
        var a = document.getElementById("CfgDefaults");
        a.addEventListener("click", function () { makeDivClearDB(_colDireita) })

        colDireita = _colDireita;
    }
    function filterReports(rpt,colDireita) {
        colDireita.clear();
        var divFiltros = colDireita.add(new innovaphone.ui1.Div("position:absolute; font-weight:bolder; width: 90%; top: 5%; left: 5%; font-size: 25px;", texts.text("labelFiltros"), null));
        var divFiltrosDetails = colDireita.add(new innovaphone.ui1.Div("position:absolute; font-weight:bolder; width: 50%; top: 8.5%; left: 18%; font-size: 15px;", texts.text(rpt), null));
        var divFrom = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 25.5%; left: 6%; font-weight: bold;", texts.text("labelFrom"), null));
        var InputFrom = colDireita.add(new innovaphone.ui1.Input("position: absolute;  top: 25%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "date", null).setAttribute("id","dateFrom"));
        var divTo = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 35.5%; left: 6%; font-weight: bold;", texts.text("labelTo"), null));
        var InputTo = colDireita.add(new innovaphone.ui1.Input("position: absolute; top: 35%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "date", null).setAttribute("id", "dateTo"));
        var divNumber = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 45.6%; left: 6%; font-weight: bold;", texts.text("labelPhone"), null));
        var InputNumber = colDireita.add(new innovaphone.ui1.Input("position: absolute; top: 45%; left: 20%; height: 25px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F; ", null, null, null, "number", null).setAttribute("id", "number"));
        var divRamal = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 55.6%; left: 6%; font-weight: bold;", texts.text("labelAgent"), null));
        var SelectRamal = new innovaphone.ui1.Node("select", "position: absolute; top: 55.0%; left: 20%; height: 25px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F; font-size: 13px; font-weight: bold ", null, null).setAttribute("id","selectUser");
        colDireita.add(SelectRamal);
        SelectRamal.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", null, null)).setAttribute("id", "sips");
        list_ramais.forEach(function (user) {
            SelectRamal.add(new innovaphone.ui1.Node("option", "font-size:13px; font-weight: bold; text-align:center", user.sip, null)).setAttribute("id", "sips");
        })
        // buttons
        colDireita.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnOk").addEvent("click", function () {
            var sip = document.getElementById("selectUser").value;
            var from = document.getElementById("dateFrom").value;
            var to = document.getElementById("dateTo").value;
            var number = document.getElementById("number").value;

            app.send({ api: "user", mt: "SelectFromReports", sip: sip, from: from, to: to, number: number, src: rpt });
            waitConnection(colDireita);
        });
        colDireita.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:90%; font-size:12px; text-align:center; color:var(--div-DelBtn); background-color: #B0132B", null, "button-inn")).addTranslation(texts, "btnCancel").addEvent("click", function () {
            constructor();
        });
    }
    function reportView(t, result, src) {
        t.clear();
        var result = JSON.parse(result);
        //Botões Tabela
        t.add(new innovaphone.ui1.Div("position:absolute; left:15%; width:15%; top:0%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnPdf").addEvent("click", function () {
            downloadPDF();
        });
        t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:15%; top:0%; font-size:12px; text-align:center; color:var(--div-DelBtn); background-color: #B0132B", null, "button-inn")).addTranslation(texts, "btnReturn").addEvent("click", function () {
            filterReports(src, colDireita)
        });
        //Título Tabela
        t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:30%; top:10%; font-size:17px; text-align:center; font-weight: bold", texts.text(src)).setAttribute("id","titleReport"));
        var list = new innovaphone.ui1.Div("background-color: rgba(128, 130, 131, 0.48); position: absolute; left:2px; top:15%; right:2px; height:fit-content", null, "").setAttribute("id","listReport");
        var columns = Object.keys(result[0]).length;
        var listView = new innovaphone.ui1.ListView(list, 50, "headercl", "arrow", false);
        //Cabeçalho
        for (i = 0; i < columns; i++) {
            listView.addColumn(null, "text", texts.text("cabecalho"+src+ + i), i, 10, false);
        }
        //Tabela 
        switch (src) {
            case "RptCalls":
                result.forEach(function (b) {
                    var row = [];
                    row.push(b.sip);
                    row.push(b.number);
                    row.push(b.call_started);
                    row.push(b.call_ringing);
                    row.push(b.call_connected);
                    row.push(b.call_ended);
                    row.push(b.status);
                    row.push(b.direction);
                    listView.addRow(i, row, "rowcl", "#A0A0A0", "#82CAE2");
                    t.add(list);
                })
                break;
            case "RptActivities":
                result.forEach(function (b) {
                    var row = [];
                    row.push(b.sip);
                    row.push(b.name);
                    row.push(b.date);
                    row.push(b.status);
                    row.push(b.details);
                    listView.addRow(i, row, "rowcl", "#A0A0A0", "#82CAE2");
                    t.add(list);
                })
                break;
            case "RptAvailability":
                result.forEach(function (b) {
                    var row = [];
                    row.push(b.sip);
                    row.push(b.date);
                    row.push(b.status);
                    row.push(b.group_name);
                    listView.addRow(i, row, "rowcl", "#A0A0A0", "#82CAE2");
                    t.add(list);
                })
                break;
        }
    }
    function downloadPDF() {
        // Crie um objeto jsPDF
        const doc = new jsPDF('l', 'pt', 'a4');

        // Carregar a imagem usando um objeto Image
        var img = new Image();
        img.src = 'logo.png';

        // Quando a imagem terminar de carregar, adicionar ao PDF
        img.onload = function () {
            // Adicionar a imagem ao documento
            doc.addImage(img, 'PNG', 10, 30, 100, 19);
            // Defina a fonte para 18px
            doc.setFontSize(18);
            const title = document.getElementById("titleReport");
            // Adicione o texto da tabela
            doc.text(title.innerHTML, 300, 50);

            // Defina a fonte para 10px
            doc.setFontSize(10);

            // Obtenha a tabela da listview
            const table = document.getElementById("listReport");

            // Obtenha as linhas da tabela
            const rows = table.querySelectorAll("tr");


            // Obter todas as colunas da primeira linha
            var colunas = rows[0].getElementsByTagName('td');
            // Definir a largura da página
            var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
            // Definir a largura de cada coluna
            //var colWidth = pageWidth / colunas.length;
            var cellWidth = (pageWidth - (colunas.length * 2)) / colunas.length;


            // Defina o posicionamento inicial para o topo da primeira página
            let y = 100;

            // Itere sobre as linhas e colunas da tabela e adicione os dados ao PDF
            for (let i = 0; i < rows.length; i++) {
                const cells = rows[i].querySelectorAll("td");
                let x = 10;

                // Verificar se a próxima linha ultrapassa a altura da página
                if (y + 20 > doc.internal.pageSize.height) {
                    doc.addPage();
                    y = 100;
                }

                for (let j = 0; j < cells.length; j++) {
                    //var cellWidth = cells[j].offsetWidth * 0.264583;

                    // Adicione bordas à célula
                    //doc.rect(x, y, cells[j].clientWidth, cells[j].clientHeight);
                    doc.rect(x, y, cellWidth, cells[j].clientHeight);

                    // Adicione o texto da célula
                    doc.text(cells[j].textContent, x + 2, y + 10);

                    // Atualize a posição X para a próxima célula
                    //x += cells[j].clientWidth;
                    x += cellWidth;
                }

                // Atualize a posição Y para a próxima linha
                y += cells[0].clientHeight;
            }

            // Baixar o arquivo PDF
            doc.output();
            saveAs(doc.output('blob'), 'Report.pdf');
        };
        
    }
}


Wecom.report.prototype = innovaphone.ui1.nodePrototype;