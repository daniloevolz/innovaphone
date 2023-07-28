
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.mural = Wecom.mural || function (start, args) {
    this.createNode("body");
    var that = this;
    var list_departments = []

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

    var texts = new innovaphone.lib1.Languages(Wecom.muralTexts, start.lang);
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "user", mt: "SelectDepartments"});
    }

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
        }
        if (obj.api == "user" && obj.mt == "SelectDepartmentsResult") {
            console.log(obj.result);
            list_departments = JSON.parse(obj.result);
            makeDivDepartments();
        }
    }
    function makeDivDepartments() {
        // Criação do elemento ftground
        var ftground = document.createElement('div');
        ftground.id = 'ftground';
        ftground.style.display = 'flex';
        ftground.style.width = '100%';
        ftground.style.height = '100vh';
        ftground.style.justifyContent = 'center';
        ftground.style.flexDirection = 'column';
        ftground.style.alignItems = 'center';
        ftground.style.backgroundColor = 'white';
        // ftground.style.borderRadius = '20px';
      
        // Criação do elemento headbanner
        var headbanner = document.createElement('div');
        headbanner.id = 'headbanner';
        headbanner.style.backgroundColor = 'rgba(132, 0, 255, 0.644)';
        headbanner.style.height = '30%';
        headbanner.style.width = '100%';
        headbanner.style.fontSize = '35px';
        headbanner.style.display = 'flex';
        headbanner.style.justifyContent = 'center';
        headbanner.style.alignItems = 'center';
        // headbanner.style.borderTopLeftRadius = '20px';
        // headbanner.style.borderTopRightRadius = '20px';
        headbanner.textContent = 'Banner: MURAL DE AVISOS WECOM';
        ftground.appendChild(headbanner);
      
        // Criação do elemento depcards
        var depcards = document.createElement('div');
        depcards.id = 'depcards';
        depcards.style.backgroundColor = 'rgba(136, 255, 132, 0.767)';
        depcards.style.display = 'flex';
        depcards.style.flexWrap = 'wrap';
        depcards.style.width = '100%';
        depcards.style.height = '70%';
        depcards.style.justifyContent = 'center';
        depcards.style.alignItems = 'center';
        ftground.appendChild(depcards);
        
        // FOR EACH DO BANCO

        // Criação do elemento pgbuttom
        var pgbuttom = document.createElement('div');
        pgbuttom.id = 'pgbuttom';
        pgbuttom.style.width = '100%';
        pgbuttom.style.display = 'flex';
        pgbuttom.style.justifyContent = 'center';
      
        // Criação dos elementos ul (pg-1, pg-2, pg-3)
        for (var i = 1; i <= 3; i++) {
          var ul = document.createElement('ul');
          ul.id = 'pg-' + i;
          ul.style.display = 'flex';
          ul.style.justifyContent = 'center';
          ul.style.backgroundColor = i === 1 ? 'rgb(96, 154, 201)' : 'rgb(189, 187, 187)';
          ul.style.borderRadius = '50%';
          ul.style.width = '20px';
          ul.style.height = '20px';
          ul.style.padding = '0';
          ul.style.marginLeft = '5px';
          ul.style.marginRight = '5px';
          ul.textContent = i;
          pgbuttom.appendChild(ul);
        }
      
        ftground.appendChild(pgbuttom);
      
        // Adicionando o elemento ftground ao body
        document.body.appendChild(ftground);

        var depCardsContainer = document.getElementById('depcards');

        depCardsContainer.innerHTML = '';

    list_departments.forEach(function (department) {

        var div = document.createElement('div');
        div.textContent = department.name;
        div.style.display = 'flex';
        div.style.justifyContent = 'center';
        div.style.alignItems = 'center';
        div.style.width = '120px';
        div.style.height = '40px';
        div.style.borderRadius = '5px';
        div.style.backgroundColor = department.color;
        div.style.margin = '10px';

       
        depCardsContainer.appendChild(div);
        
    });
    var divAdd = document.createElement('div');
    divAdd.textContent = "Adicionar +";
    divAdd.style.display = 'flex';
    divAdd.style.justifyContent = 'center';
    divAdd.style.alignItems = 'center';
    divAdd.style.width = '120px';
    divAdd.style.height = '40px';
    divAdd.style.borderRadius = '5px';
    divAdd.style.backgroundColor = 'rgb(96, 154, 201)';
    divAdd.style.margin = '10px';

    depCardsContainer.appendChild(divAdd)
      }
}
Wecom.mural.prototype = innovaphone.ui1.nodePrototype;
