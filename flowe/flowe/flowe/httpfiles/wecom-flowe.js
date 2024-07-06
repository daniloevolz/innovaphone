
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.flowe = Wecom.flowe || function (start, args) {
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

    var texts = new innovaphone.lib1.Languages(Wecom.floweTexts, start.lang);
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    //variaveis customizadas 
    const elements = [
        { id: 'add', name: 'Soma', description: 'Soma o valor de duas variaveis', img: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>' },
        { id: 'sub', name: 'Subtração', description: 'Subtrai o valor de duas variaveis', img: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus"><path d="M5 12h14"/></svg>' },
        { id: 'assign', name: 'Assign Variable', description: 'Cria ou Atribui valor a uma variavel', img: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-equal"><line x1="5" x2="19" y1="9" y2="9"/><line x1="5" x2="19" y1="15" y2="15"/></svg>' },
        { id: 'call', name: 'Call a function', description: 'Chama uma função definida', img: '<svg role="img" aria-hidden="true" focusable="false" width="20" height="20" data-prefix="far" data-icon="function" class="svg-inline--fa fa-function fa-fw" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M72 88c0-48.6 39.4-88 88-88h40c13.3 0 24 10.7 24 24s-10.7 24-24 24H160c-22.1 0-40 17.9-40 40V192h48c13.3 0 24 10.7 24 24s-10.7 24-24 24H120V390.7c0 44.8-33.7 82.5-78.3 87.5l-15.1 1.7c-13.2 1.5-25-8-26.5-21.2s8-25 21.2-26.5l15.1-1.7C56.7 428.2 72 411.1 72 390.7V240H24c-13.3 0-24-10.7-24-24s10.7-24 24-24H72V88zm244.3 76.8C288.4 209.1 272 262.5 272 320s16.4 110.9 44.3 155.2c7.1 11.2 3.7 26-7.5 33.1s-26 3.7-33.1-7.5C243 448.9 224 386.7 224 320s19-128.9 51.7-180.8c7.1-11.2 21.9-14.6 33.1-7.5s14.6 21.9 7.5 33.1zm231.4 0c-7.1-11.2-3.7-26 7.5-33.1s26-3.7 33.1 7.5C621 191.1 640 253.3 640 320s-19 128.9-51.7 180.8c-7.1 11.2-21.9 14.6-33.1 7.5s-14.6-21.9-7.5-33.1C575.6 430.9 592 377.5 592 320s-16.4-110.9-44.3-155.2zM393 247l39 39 39-39c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-39 39 39 39c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-39-39-39 39c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z"></path></svg>' },
        { id: 'dbg', name: 'Debug', description: 'Escreve no até 2 valores no Trace do PBX', img: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bug-play"><path d="M12.765 21.522a.5.5 0 0 1-.765-.424v-8.196a.5.5 0 0 1 .765-.424l5.878 3.674a1 1 0 0 1 0 1.696z"/><path d="M14.12 3.88 16 2"/><path d="M18 11a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4v3a6.1 6.1 0 0 0 2 4.5"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M6 13H2"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="m8 2 1.88 1.88"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/></svg>' },
        { id: 'else-start', name: 'Else (Início)', description: 'Início de um Bloco condicional ELSE após um IF', img: '<svg role="img" width="20" height="20" aria-hidden="true" focusable="false" data-prefix="fal" data-icon="diamond" stroke="currentColor" stroke-width="1" class="svg-inline--fa fa-diamond fa-fw" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M250.3 34.3c3.1-3.1 8.2-3.1 11.3 0l216 216c3.1 3.1 3.1 8.2 0 11.3l-216 216c-3.1 3.1-8.2 3.1-11.3 0l-216-216c-3.1-3.1-3.1-8.2 0-11.3l216-216zm33.9-22.6c-15.6-15.6-40.9-15.6-56.6 0l-216 216c-15.6 15.6-15.6 40.9 0 56.6l216 216c15.6 15.6 40.9 15.6 56.6 0l216-216c15.6-15.6 15.6-40.9 0-56.6l-216-216z"></path></svg>' },
        { id: 'else-end', name: 'Else (Fim)', description: 'Fim de um Bloco condicional ELSE após um IF', img: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code-xml"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>' },
        { id: 'while-start', name: 'Loop While (Início)', description: 'Executa um Loop enquanto definido', img: '<svg role="img" width="20" height="20" aria-hidden="true" focusable="false" data-prefix="far" data-icon="arrow-rotate-left" stroke="currentColor" stroke-width="1" class="svg-inline--fa fa-arrow-rotate-left fa-fw" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M40 224c-13.3 0-24-10.7-24-24V56c0-13.3 10.7-24 24-24s24 10.7 24 24v80.1l20-23.5C125 63.4 186.9 32 256 32c123.7 0 224 100.3 224 224s-100.3 224-224 224c-50.4 0-97-16.7-134.4-44.8c-10.6-8-12.7-23-4.8-33.6s23-12.7 33.6-4.8C179.8 418.9 216.3 432 256 432c97.2 0 176-78.8 176-176s-78.8-176-176-176c-54.3 0-102.9 24.6-135.2 63.4l-.1 .2 0 0L93.1 176H184c13.3 0 24 10.7 24 24s-10.7 24-24 24H40z"></path></svg>' },
        { id: 'while-end', name: 'Loop While (Fim)', description: 'Encerra a declaração um Loop', img: '<svg role="img" width="20" height="20" aria-hidden="true" focusable="false" data-prefix="far" data-icon="arrow-rotate-left" stroke="currentColor" stroke-width="1" class="svg-inline--fa fa-arrow-rotate-left fa-fw" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M40 224c-13.3 0-24-10.7-24-24V56c0-13.3 10.7-24 24-24s24 10.7 24 24v80.1l20-23.5C125 63.4 186.9 32 256 32c123.7 0 224 100.3 224 224s-100.3 224-224 224c-50.4 0-97-16.7-134.4-44.8c-10.6-8-12.7-23-4.8-33.6s23-12.7 33.6-4.8C179.8 418.9 216.3 432 256 432c97.2 0 176-78.8 176-176s-78.8-176-176-176c-54.3 0-102.9 24.6-135.2 63.4l-.1 .2 0 0L93.1 176H184c13.3 0 24 10.7 24 24s-10.7 24-24 24H40z"></path></svg>' },
        { id: 'event', name: 'Evento DTMF', description: 'Evento DTMF do PBX', img: '<svg role="img" aria-hidden="true" width="20" height="20" focusable="false" data-prefix="far" data-icon="calculator" stroke="currentColor" stroke-width="1" class="svg-inline--fa fa-calculator fa-fw" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M336 176V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V176H336zm0-48H48V64c0-8.8 7.2-16 16-16H320c8.8 0 16 7.2 16 16v64zm48 0V64c0-35.3-28.7-64-64-64H64C28.7 0 0 28.7 0 64v64 24 24V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V176 152 128zM80 232a24 24 0 1 0 48 0 24 24 0 1 0 -48 0zm24 64a24 24 0 1 0 0 48 24 24 0 1 0 0-48zM80 408c0 13.3 10.7 24 24 24h88c13.3 0 24-10.7 24-24s-10.7-24-24-24H104c-13.3 0-24 10.7-24 24zM192 208a24 24 0 1 0 0 48 24 24 0 1 0 0-48zM168 320a24 24 0 1 0 48 0 24 24 0 1 0 -48 0zM280 208a24 24 0 1 0 0 48 24 24 0 1 0 0-48zM256 320a24 24 0 1 0 48 0 24 24 0 1 0 -48 0zm24 64a24 24 0 1 0 0 48 24 24 0 1 0 0-48z"></path></svg>' },
        { id: 'exec', name: 'Exec', description: 'Requisição Http GET para uma url', img: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>' },
        { id: 'function-start', name: 'Funcão (Início)', description: 'Declara o início de uma função', img: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>' },
        { id: 'function-end', name: 'Funcão (Fim)', description: 'Declara o fim de uma função', img: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code-xml"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>' },
        { id: 'wait', name: 'Aguardar', description: 'Aguarda tantos segundos definidos', img: '<svg role="img" aria-hidden="true" width="20" height="20"focusable="false" data-prefix="far" data-icon="clock" stroke="currentColor" stroke-width="1" class="svg-inline--fa fa-clock fa-fw" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"></path></svg>' },
        { id: 'if-start', name: 'If (Início)', description: 'Início do Bloco condicional IF', img: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-workflow"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></svg>' },
        { id: 'if-end', name: 'If (Fim)', description: 'Fim do Bloco condicional IF, pode ser seguido de um Bloco ELSE', img: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code-xml"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>' },
        { id: 'pbx-xfer', name: 'Transferência', description: 'Transfere a ligação para um número', img: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-redo-dot"><circle cx="12" cy="17" r="1"/><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>' },
        { id: 'pbx-disc', name: 'Desconecta', description: 'Desconecta a chamada do script', img: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-unplug"><path d="m19 5 3-3"/><path d="m2 22 3-3"/><path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"/><path d="M7.5 13.5 10 11"/><path d="M10.5 16.5 13 14"/><path d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z"/></svg>' },
        { id: 'store-get', name: 'Obtem arquivos remotos', description: 'Constroi uma URL para acesso a arquivos', img: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-download"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg>' },
        { id: 'pbx-prompt', name: 'Prompt', description: 'Reproduz um arquivo de áudio', img: '<svg role="img" aria-hidden="true" focusable="false" width="20" height="20" data-prefix="fal" data-icon="music" stroke="currentColor" stroke-width="1" class="svg-inline--fa fa-music fa-fw" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M512 23c0-12.7-10.3-23-23-23c-2.3 0-4.6 .3-6.8 1l-311 95.7C164.6 98.8 160 105 160 112V232 372.4C143 359.7 120.6 352 96 352c-53 0-96 35.8-96 80s43 80 96 80s96-35.8 96-80V246.3l288-88.6V308.4c-17-12.7-39.4-20.4-64-20.4c-53 0-96 35.8-96 80s43 80 96 80s96-35.8 96-80V136.4c0-.2 0-.5 0-.7V23zM480 368c0 21.3-22.9 48-64 48s-64-26.7-64-48s22.9-48 64-48s64 26.7 64 48zM160 432c0 21.3-22.9 48-64 48s-64-26.7-64-48s22.9-48 64-48s64 26.7 64 48zM480 124.2L192 212.8v-89L480 35.2v89z"></path></svg>' },
        { id: 'pbx-getdtmfdigit', name: 'Obtem o último dígito DTMF', description: 'Deve ser usado em um Loop para obter o último dígito DTMF', img: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down-0-1"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><rect x="15" y="4" width="4" height="6" ry="2"/><path d="M17 20v-6h-2"/><path d="M15 20h4"/></svg>' },
        { id: 'lib-strlen', name: 'Tamanho da String', description: 'Retorna o tamanho de uma string', img: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ruler"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg>' },
        { id: 'lib-enc', name: 'Converte uma String para URL encode', description: 'Retorna o uma string formatada para ser usada em url, substitui espaços por %20, etc.', img: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe-lock"><path d="M15.686 15A14.5 14.5 0 0 1 12 22a14.5 14.5 0 0 1 0-20 10 10 0 1 0 9.542 13"/><path d="M2 12h8.5"/><path d="M20 6V4a2 2 0 1 0-4 0v2"/><rect width="8" height="5" x="14" y="6" rx="1"/></svg>' },
        { id: 'lib-dec', name: 'Converte uma URL encode para String', description: 'Retorna uma string a partir de uma url', img: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>' },
        { id: 'lib-strcat', name: 'Concatena Strings', description: 'Retorna uma string concatenando duas strings', img: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-end"><path d="M16 12H3"/><path d="M16 6H3"/><path d="M10 18H3"/><path d="M21 6v10a2 2 0 0 1-2 2h-5"/><path d="m16 16-2 2 2 2"/></svg>' },
        { id: 'switch-start', name: 'Switch (Início)', description: 'Declara o início de umBloco SWITCH', img: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>' },
        { id: 'switch-end', name: 'Switch (Fim)', description: 'Declara o fim de um Bloco SWITCH', img: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code-xml"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>' },
        { id: 'case-start', name: 'Case (Início)', description: 'Declara um Bloco CASE dentro de um Bloco SWITCH', img: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-todo"><rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>' },
        { id: 'case-end', name: 'Case (Fim)', description: 'Encerra a declaração um Bloco CASE', img: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code-xml"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>' },

    ];
    let nextIndex = 0;
    let processCardName = 'main';
    let xmls = [];
    let licenseToken;
    let licenseFile;
    let licenseActive;
    let licenseInstallDate;
    let licenseUsed;
    let xmlAllowed = 0;


    function app_connected(domain, user, dn, appdomain) {
        app.sendSrc({ mt: "SqlInsert", statement: "insert-folder", args: { name: "myFolder" } }, folderAdded);
        app.send({ api: "user", mt: "UserMessage" });
        createBody();
    }

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
            xmlAllowed = obj.xmls;
        }
        if (obj.mt == "UpdateConfigMessageErro") {
            window.alert("ERRO: "+obj.result);
        }
    }


    function createBody() {

        //#region TOPBAR
        let topBar = document.createElement('div')
        topBar.classList.add('top-bar')

        // Cria o botão
        let button = document.createElement('button');
        button.id = 'license';
        button.textContent = texts.text('license'); // Define o texto do botão

        topBar.appendChild(button)

        // Cria o botão
        button = document.createElement('button');
        button.id = 'vms';
        button.textContent = texts.text('ura'); // Define o texto do botão

        topBar.appendChild(button)

        // Cria o botão
        button = document.createElement('button');
        button.id = 'openScripts';
        button.textContent = texts.text('openScripts'); // Define o texto do botão

        topBar.appendChild(button)

        document.body.appendChild(topBar);

        var btnLic = document.getElementById('license')
        btnLic.addEventListener('click', function (e) {
            //Altera aparencia do botão ativo
            var btnOpen = document.getElementById('openScripts')
            if (btnOpen.classList.contains('button-clicked')) {
                btnOpen.classList.remove('button-clicked');
            }
            var btnVms = document.getElementById('vms')
            if (btnVms.classList.contains('button-clicked')) {
                btnVms.classList.remove('button-clicked');
            }
            if (!e.currentTarget.classList.contains('button-clicked')) {
                e.currentTarget.classList.add('button-clicked');
            }
            manageLicense();
        })

        var btnVms = document.getElementById('vms')
        btnVms.addEventListener('click', function (e) {
            //Altera aparencia do botão ativo
            var btnOpen = document.getElementById('openScripts')
            if (btnOpen.classList.contains('button-clicked')) {
                btnOpen.classList.remove('button-clicked');
            }
            var btnLic = document.getElementById('license')
            if (btnLic.classList.contains('button-clicked')) {
                btnLic.classList.remove('button-clicked');
            }
            if (!e.currentTarget.classList.contains('button-clicked')) {
                e.currentTarget.classList.add('button-clicked');
            }
            selectVms();
        })

        var btnOpenScripts = document.getElementById('openScripts')
        btnOpenScripts.addEventListener('click', function (e) {
            //Altera aparencia do botão ativo
            var btnVms = document.getElementById('vms')
            if (btnVms.classList.contains('button-clicked')) {
                btnVms.classList.remove('button-clicked');
            }
            var btnLic = document.getElementById('license')
            if (btnLic.classList.contains('button-clicked')) {
                btnLic.classList.remove('button-clicked');
            }
            if (!e.currentTarget.classList.contains('button-clicked')) {
                e.currentTarget.classList.add('button-clicked');
            }

            openScripts()
        })

        //#endregion

        //#region CONTAINER
        // Container principal
        var container = createElement('div', 'container', 'container');

        // Left Pane
        var leftPane = createElement('div', 'left-pane', 'left-pane');
        container.appendChild(leftPane);

        // Right Pane
        var rightPane = createElement('div', 'right-pane', 'right-pane');
        container.appendChild(rightPane);

        // Process Title Card
        var appProcessTitleCard = createElement('app-process-title-card');
        appProcessTitleCard.setAttribute('addbtnclass', 'step1');

        var processTitleCard = createElement('div', 'process-card hoverhighlight', 'process-title-card');
        appProcessTitleCard.appendChild(processTitleCard);

        // Process Card Header
        var processCardHeader1 = createElement('div', 'process-card-header', 'process-card-header');
        processTitleCard.appendChild(processCardHeader1);

        var dFlex1 = createElement('div', 'd-flex');
        processCardHeader1.appendChild(dFlex1);

        var processCardHeaderCollapseIcons1 = createElement('div', 'process-card-header-collapse-icons');
        dFlex1.appendChild(processCardHeaderCollapseIcons1);

        var faIcon1 = createElement('fa-icon', 'ng-fa-icon');
        processCardHeaderCollapseIcons1.appendChild(faIcon1);

        var svg1 = '<svg role="img" aria-hidden="true" focusable="false" data-prefix="far" data-icon="chevron-up" class="svg-inline--fa fa-chevron-up fa-fw" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M239 111c9.4-9.4 24.6-9.4 33.9 0L465 303c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-175-175L81 337c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9L239 111z"></path></svg>';
        faIcon1.innerHTML = svg1;

        var titleContainer1 = createElement('div');
        dFlex1.appendChild(titleContainer1);

        var processCardHeaderTitle1 = createElement('div', 'process-card-header-title');
        titleContainer1.appendChild(processCardHeaderTitle1);

        var title1 = createElement('div');
        title1.title = texts.text('card1title');
        title1.innerText = texts.text('card1title');
        processCardHeaderTitle1.appendChild(title1);

        var processCardHeaderSubtitle1 = createElement('div', 'process-card-header-subtitle');
        titleContainer1.appendChild(processCardHeaderSubtitle1);

        var subtitle1 = createElement('div');
        subtitle1.setAttribute('subtitle', '');
        subtitle1.innerText = texts.text('card1description');
        processCardHeaderSubtitle1.appendChild(subtitle1);

        // Process Card Body
        var processCardBody1 = createElement('div', 'process-card-body ng-star-inserted hidden', 'process-card-body');
        processTitleCard.appendChild(processCardBody1);

        var appProcessSummaryTitle = createElement('app-process-summary-title', '', 'app-process-summary-title');
        processCardBody1.appendChild(appProcessSummaryTitle);

        var textCenter = createElement('div', 'text-center');
        appProcessSummaryTitle.appendChild(textCenter);

        var processSummaryTitle = createElement('div', 'process-summary-title');
        processSummaryTitle.innerText = texts.text('noFilename');
        textCenter.appendChild(processSummaryTitle);

        // Append Process Title Card to Right Pane
        rightPane.appendChild(appProcessTitleCard);

        // Process Main Card
        var appProcessMainCard = createElement('app-process-main-card');
        appProcessMainCard.setAttribute('addbtnclass', 'step2');

        var processMainCard = createElement('div', 'process-card hoverhighlight', 'process-main-card');
        appProcessMainCard.appendChild(processMainCard);

        // Process Card Header 2
        var processCardHeader2 = createElement('div', 'process-card-header', 'process-card-header');
        processMainCard.appendChild(processCardHeader2);

        var dFlex2 = createElement('div', 'd-flex');
        processCardHeader2.appendChild(dFlex2);

        var processCardHeaderCollapseIcons2 = createElement('div', 'process-card-header-collapse-icons');
        dFlex2.appendChild(processCardHeaderCollapseIcons2);

        var faIcon2 = createElement('fa-icon', 'ng-fa-icon');
        processCardHeaderCollapseIcons2.appendChild(faIcon2);

        var svg2 = '<svg role="img" aria-hidden="true" focusable="false" data-prefix="far" data-icon="chevron-up" class="svg-inline--fa fa-chevron-up fa-fw" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M239 111c9.4-9.4 24.6-9.4 33.9 0L465 303c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-175-175L81 337c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9L239 111z"></path></svg>';
        faIcon2.innerHTML = svg2;

        var titleContainer2 = createElement('div');
        dFlex2.appendChild(titleContainer2);

        var processCardHeaderTitle2 = createElement('div', 'process-card-header-title');
        titleContainer2.appendChild(processCardHeaderTitle2);

        var title2 = createElement('div');
        title2.title = texts.text('card2title');
        title2.innerText = texts.text('card2title');
        processCardHeaderTitle2.appendChild(title2);

        var processCardHeaderSubtitle2 = createElement('div', 'process-card-header-subtitle');
        titleContainer2.appendChild(processCardHeaderSubtitle2);

        var subtitle2 = createElement('div');
        subtitle2.setAttribute('subtitle', '');
        subtitle2.innerText = texts.text('card2description');
        processCardHeaderSubtitle2.appendChild(subtitle2);

        // Process Card Body 2
        var processCardBody2 = createElement('div', 'process-card-body ng-star-inserted hidden', 'process-card-body');
        processMainCard.appendChild(processCardBody2);

        var appProcessFunctionStackMain = createElement('app-process-function-stack');
        processCardBody2.appendChild(appProcessFunctionStackMain);

        var functionStackContainerMain = createElement('div', 'function-stack-container', 'function-stack-container-main');
        appProcessFunctionStackMain.appendChild(functionStackContainerMain);

        var appProcessCardNoItemsMain = createElement('app-process-card-no-items', 'ng-star-inserted');
        functionStackContainerMain.appendChild(appProcessCardNoItemsMain);

        var emptyErrorMain = createElement('div', 'empty-error');
        appProcessCardNoItemsMain.appendChild(emptyErrorMain);

        var py3Main = createElement('div', 'py-3');
        py3Main.innerText = texts.text('noFunction');
        emptyErrorMain.appendChild(py3Main);

        // Append Process Main Card to Right Pane
        rightPane.appendChild(appProcessMainCard);

        // Process Function Card
        var appProcessFunctionCard = createElement('app-process-function-card');
        appProcessFunctionCard.setAttribute('addbtnclass', 'step3');

        var processFunctionCard = createElement('div', 'process-card hoverhighlight', 'process-function-card');
        appProcessFunctionCard.appendChild(processFunctionCard);

        // Process Card Header 3
        var processCardHeader3 = createElement('div', 'process-card-header', 'process-card-header');
        processFunctionCard.appendChild(processCardHeader3);

        var dFlex3 = createElement('div', 'd-flex');
        processCardHeader3.appendChild(dFlex3);

        var processCardHeaderCollapseIcons3 = createElement('div', 'process-card-header-collapse-icons');
        dFlex3.appendChild(processCardHeaderCollapseIcons3);

        var faIcon3 = createElement('fa-icon', 'ng-fa-icon');
        processCardHeaderCollapseIcons3.appendChild(faIcon3);

        var svg3 = '<svg role="img" aria-hidden="true" focusable="false" data-prefix="far" data-icon="chevron-up" class="svg-inline--fa fa-chevron-up fa-fw" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M239 111c9.4-9.4 24.6-9.4 33.9 0L465 303c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-175-175L81 337c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9L239 111z"></path></svg>';
        faIcon3.innerHTML = svg3;

        var titleContainer3 = createElement('div');
        dFlex3.appendChild(titleContainer3);

        var processCardHeaderTitle3 = createElement('div', 'process-card-header-title');
        titleContainer3.appendChild(processCardHeaderTitle3);

        var title3 = createElement('div');
        title3.title = texts.text('card3title');
        title3.innerText = texts.text('card3title');
        processCardHeaderTitle3.appendChild(title3);

        var processCardHeaderSubtitle3 = createElement('div', 'process-card-header-subtitle');
        titleContainer3.appendChild(processCardHeaderSubtitle3);

        var subtitle3 = createElement('div');
        subtitle3.setAttribute('subtitle', '');
        subtitle3.innerText = texts.text('card3description');
        processCardHeaderSubtitle3.appendChild(subtitle3);

        // Process Card Body 3
        var processCardBody3 = createElement('div', 'process-card-body ng-star-inserted hidden', 'process-card-body');
        processFunctionCard.appendChild(processCardBody3);

        var appProcessFunctionStackFunction = createElement('app-process-function-stack');
        processCardBody3.appendChild(appProcessFunctionStackFunction);

        var functionStackContainerFunction = createElement('div', 'function-stack-container', 'function-stack-container-function');
        appProcessFunctionStackFunction.appendChild(functionStackContainerFunction);

        var appProcessCardNoItemsFunction = createElement('app-process-card-no-items', 'ng-star-inserted');
        functionStackContainerFunction.appendChild(appProcessCardNoItemsFunction);

        var emptyErrorFunction = createElement('div', 'empty-error');
        appProcessCardNoItemsFunction.appendChild(emptyErrorFunction);

        var py3Function = createElement('div', 'py-3');
        py3Function.innerText = texts.text('noFunction');
        emptyErrorFunction.appendChild(py3Function);

        // Append Process Function Card to Right Pane
        rightPane.appendChild(appProcessFunctionCard);

        // Append the container to the body or another parent element
        document.body.appendChild(container);

        //#endregion

        //#region LISTNERS
        // Tratamento para colapsar elementos do Body
        const headers = document.querySelectorAll('.process-card-header');
        headers.forEach(header => {
            // Adiciona um listener de click a cada header
            header.addEventListener('click', () => {
                // Encontra o elemento 'process-card-body' correspondente
                const body = header.nextElementSibling;
                if (body && body.classList.contains('process-card-body')) {
                    body.classList.toggle('hidden');

                    const faIcon = header.querySelector('fa-icon');
                    if (faIcon) {
                        if (body.classList.contains('hidden')) {
                            faIcon.innerHTML = `<svg role="img" aria-hidden="true" focusable="false" data-prefix="far" data-icon="chevron-up" class="svg-inline--fa fa-chevron-up fa-fw" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M239 111c9.4-9.4 24.6-9.4 33.9 0L465 303c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-175-175L81 337c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9L239 111z"></path></svg>`;
                        } else {
                            faIcon.innerHTML = `<svg role="img" aria-hidden="true" focusable="false" data-prefix="far" data-icon="chevron-down" class="svg-inline--fa fa-chevron-down fa-fw" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M239 401c9.4 9.4 24.6 9.4 33.9 0L465 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-175 175L81 175c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9L239 401z"></path></svg>`;
                        }
                    }
                }
            });
        });
        const mainCard = document.querySelector('app-process-main-card');
        mainCard.addEventListener('click', (event) => {
            if (!mainCard.classList.contains('force-active')) {
                mainCard.classList.add('force-active');
            }
            processCardName = 'main'
            const functionCard = document.querySelector('app-process-function-card');
            if (functionCard.classList.contains('force-active')) {
                functionCard.classList.remove('force-active');
                selectLastLowerAction(mainCard)
            }
        });
        const functionCard = document.querySelector('app-process-function-card');
        functionCard.addEventListener('click', (event) => {
            if (!functionCard.classList.contains('force-active')) {
                functionCard.classList.add('force-active');
            }
            processCardName = 'function'
            const mainCard = document.querySelector('app-process-main-card');
            if (mainCard.classList.contains('force-active')) {
                mainCard.classList.remove('force-active');
                selectLastLowerAction(functionCard)
            }
        });
        //#endregion
    }


    //#region Funções Botões Top-bar
    // Função para criar e configurar um novo elemento HTML
    function createElement(tag, className, id) {
        var element = document.createElement(tag);
        if (className) element.className = className;
        if (id) element.id = id;
        return element;
    }

    //Função para mostrar Scripts Existentes no DB
    function openScripts() {

        const leftPane = document.getElementById('left-pane')
        leftPane.innerHTML = '';

        //#region TOPBAR
        let topBar = document.createElement('div')
        topBar.classList.add('left-top-bar')

        // Cria o botão
        button = document.createElement('button');
        button.id = 'new';
        button.textContent = texts.text('new'); // Define o texto do botão

        topBar.appendChild(button)

        // Cria o botão
        button = document.createElement('button');
        button.id = 'save';
        button.textContent = texts.text('save'); // Define o texto do botão

        topBar.appendChild(button)

        leftPane.appendChild(topBar);


        let insideLeftPane = document.createElement('div')
        insideLeftPane.id = 'inside-left-pane'
        insideLeftPane.classList.add('group-list-container', 'inside-left-pane')
        leftPane.appendChild(insideLeftPane);

        var btnNew = document.getElementById('new')
        btnNew.addEventListener('click', newScript)

        var btnOpenScripts = document.getElementById('save')
        btnOpenScripts.addEventListener('click', saveScript)

        //#endregion

        //#region INSIDE Scripts
        xmls.forEach(function (x) {
            const xml = `<app-box-item xml-id=${x.id} tabindex="0" class="full-width element">
                    <div class="xml-box-wrapper d-flex flex-row flex-wrap theme-secondary">
                    <!---->
                    <div class="box-title">
                    <div class="box-icon">
                        <fa-icon class="ng-fa-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#001a4d" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-code"><path d="M10 12.5 8 15l2 2.5"/><path d="m14 12.5 2 2.5-2 2.5"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/></svg></fa-icon>
                    </div>
                    <!---->
                    <!---->
                    <div class="box-card">
                        <!---->
                        <h1 class="mb-1">${texts.text('lastChange')}</h1>
                        <!---->
                    </div>
                    <!---->
                    <div class="text-end function-stack-return align-self-center" >
                        <span id="highlight-variable" appdebuggerpopup="" class="highlight-variable">${formatTimestamp(x.modified)}</span>
                        <!---->
                     </div>
                    <!---->
                    </div>
                    <div class="box-title">
                        <div class="box-card">
                            <!---->
                            <h1 class="mb-1">${texts.text('xmlName')}</h1>
                            <p class="mb-0">${x.name}</p>
                            <!---->
                        </div>
                        <!--
                        <div class="box-card">
                            
                            <h1 type="text" href="${start.originalUrl + "/files/" + x.id}" xml-id=${x.id}>${x.name}</>
                            
                        </div>
                       -->
                    </div>
                    <div class="box-option-icon">
                         <!--Edit-->
                       <div id="editXml" xml-id=${x.id} class="action-icon text-danger">
                        <fa-icon class="ng-fa-icon action-icon-icon" >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#001061" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                        </fa-icon>
                       </div>
                        <!--Delete-->
                       <div id="deleteXml" xml-id=${x.id} class="action-icon text-danger">
                            <fa-icon class="ng-fa-icon action-icon-icon" >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d10000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </fa-icon>
                        </div>
                    </div>
                    <!---->
                    <!---->
                    <!---->
                    </app-box-item>
                `
            insideLeftPane.innerHTML += xml;
        })

        let dels = document.querySelectorAll('#deleteXml');
        dels.forEach((d) => {
            d.addEventListener('click', (e) => {
                let xmlId = e.currentTarget.getAttribute('xml-id');
                // Example usage:
                createConfirmationModal(texts.text('cinfirmDeleteTitle'), texts.text('confirmDeleteBody'), texts.text('confirm'), texts.text('cancel'))
                    .then(() => {
                        console.log('Item deleted ' + xmlId);
                        deleteFile(xmlId)

                    })
                    .catch(() => {
                        console.log('Deletion canceled');
                    });
            })
        })
        let edits = document.querySelectorAll('#editXml');
        edits.forEach((d) => {
            d.addEventListener('click', (e) => {
                let xmlId = e.currentTarget.getAttribute('xml-id');
                // Example usage:
                console.log('Item to edit ' + xmlId);
            })
        })
        //#endregion
    }

    function manageLicense() {
        app.sendSrc({ api: 'user', mt: 'ConfigLicense', src: 1 }, async function (obj) {
            console.log('LicenseMessageResult=' + JSON.stringify(obj))
            try {
                licenseToken = obj.licenseToken;
                licenseFile = obj.licenseFile;
                licenseActive = obj.licenseActive;
                licenseInstallDate = obj.licenseInstallDate;
                licenseUsed = obj.licenseUsed;

                const leftPane = document.getElementById('left-pane')
                leftPane.innerHTML = '';

                //#region TOPBAR
                let topBar = document.createElement('div')
                topBar.classList.add('left-top-bar')

                // Cria o botão
                button = document.createElement('button');
                button.id = 'updateLicense';
                button.textContent = texts.text('update'); // Define o texto do botão

                topBar.appendChild(button)

                leftPane.appendChild(topBar);


                let insideLeftPane = document.createElement('div')
                insideLeftPane.id = 'inside-left-pane'
                insideLeftPane.classList.add('group-list-container', 'inside-left-pane')
                leftPane.appendChild(insideLeftPane);
                var btnUpdateLicense = document.getElementById('updateLicense')
                btnUpdateLicense.addEventListener('click', function (e) {
                    licenseFile = document.getElementById('licenseFile').value;

                    app.sendSrc({ api: 'user', mt: 'UpdateConfigLicenseMessage', licenseToken: licenseToken, licenseFile: licenseFile, src: 1 }, async function (obj) {
                        console.log('UpdateConfigLicenseMessageSuccess')
                        manageLicense();
                    })
                })
                //#endregion

                const license = `<app-box-item tabindex="0" class="full-width element">
                    <div class="xml-box-wrapper row-gap-10 d-flex flex-row flex-wrap theme-secondary">
                    <!---->
                    <div class="box-title">
                    <div class="box-icon">
                        <fa-icon class="ng-fa-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#001a4d" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-code"><path d="M10 12.5 8 15l2 2.5"/><path d="m14 12.5 2 2.5-2 2.5"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/></svg></fa-icon>
                    </div>
                    <!---->
                    <!---->
                    <!---->
                    </div>
                    <div class="box-title">
                    <div class="box-card function-stack-return">
                        <!---->
                        <h1 class="mb-1">${texts.text('licenseToken')}</h1>
                        <span id="highlight-variable" appdebuggerpopup="" class="highlight-variable">${licenseToken}</span>
                        <!---->
                    </div>
                    </div>
                    <div class="box-title">
                        <div class="box-card">
                            <!---->
                            <h1 class="mb-1">${texts.text('licenseActive')}</h1>
                            <span class="mb-0 highlight-variable">${licenseActive}</span>
                            <!---->
                        </div>
                    </div>
                    <div class="box-title">
                        <div class="box-card">
                            <!---->
                            <h1 class="mb-1">${texts.text('licenseFile')}</h1>
                            <input id="licenseFile" type="text" class="mb-0" value="${licenseFile}"></>
                            <!---->
                        </div>
                    </div>
                    <div class="box-option-icon">
                        <div class="box-card">
                            <!---->
                            <h1 class="mb-1">${texts.text('licenseInstallDate')}</h1>
                            <p class="mb-0">${licenseInstallDate}</p>
                            <!---->
                        </div>

                    </div>
                    <!---->
                    <!---->
                    <!---->
                    </app-box-item>
                `
                insideLeftPane.innerHTML += license;



            } catch (e) {
                console.log("ERRO LicenseMessageResult:" + e)
            }
        })

    }


    //#region Modais
    function createConfirmationModal(title, message, confirmText, cancelText) {
        return new Promise((resolve, reject) => {
            // Create the overlay
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = 0;
            overlay.style.left = 0;
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.zIndex = 1000;

            // Create the modal
            const modal = document.createElement('div');
            modal.style.backgroundColor = '#fff';
            modal.style.borderRadius = '10px';
            modal.style.padding = '20px';
            modal.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            modal.style.maxWidth = '400px';
            modal.style.width = '100%';

            // Create the title
            const modalTitle = document.createElement('h2');
            modalTitle.innerText = title;
            modalTitle.style.marginBottom = '20px';
            modalTitle.style.fontSize = '1.5em';
            modalTitle.style.fontWeight = 'bold';

            // Create the message
            const modalMessage = document.createElement('p');
            modalMessage.innerText = message;
            modalMessage.style.marginBottom = '20px';

            // Create the buttons container
            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.display = 'flex';
            buttonsContainer.style.justifyContent = 'space-between';

            // Create the confirm button
            const confirmButton = document.createElement('button');
            confirmButton.innerText = confirmText;
            confirmButton.style.padding = '10px 20px';
            confirmButton.style.backgroundColor = '#4CAF50';
            confirmButton.style.color = '#fff';
            confirmButton.style.border = 'none';
            confirmButton.style.borderRadius = '5px';
            confirmButton.style.cursor = 'pointer';
            confirmButton.addEventListener('click', () => {
                document.body.removeChild(overlay);
                resolve(true);
            });

            // Create the cancel button
            const cancelButton = document.createElement('button');
            cancelButton.innerText = cancelText;
            cancelButton.style.padding = '10px 20px';
            cancelButton.style.backgroundColor = '#f44336';
            cancelButton.style.color = '#fff';
            cancelButton.style.border = 'none';
            cancelButton.style.borderRadius = '5px';
            cancelButton.style.cursor = 'pointer';
            cancelButton.addEventListener('click', () => {
                document.body.removeChild(overlay);
                reject();
            });

            // Append elements
            buttonsContainer.appendChild(cancelButton);
            buttonsContainer.appendChild(confirmButton);
            modal.appendChild(modalTitle);
            modal.appendChild(modalMessage);
            modal.appendChild(buttonsContainer);
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
        });
    }
    function createInfoModal(title, message, confirmText) {
        return new Promise((resolve, reject) => {
            // Create the overlay
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = 0;
            overlay.style.left = 0;
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.zIndex = 1000;

            // Create the modal
            const modal = document.createElement('div');
            modal.style.backgroundColor = '#fff';
            modal.style.borderRadius = '10px';
            modal.style.padding = '20px';
            modal.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            modal.style.maxWidth = '400px';
            modal.style.width = '100%';

            // Create the title
            const modalTitle = document.createElement('h2');
            modalTitle.innerText = title;
            modalTitle.style.marginBottom = '20px';
            modalTitle.style.fontSize = '1.5em';
            modalTitle.style.fontWeight = 'bold';

            // Create the message
            const modalMessage = document.createElement('p');
            modalMessage.innerText = message;
            modalMessage.style.marginBottom = '20px';

            // Create the buttons container
            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.display = 'flex';
            buttonsContainer.style.justifyContent = 'space-between';

            // Create the confirm button
            const confirmButton = document.createElement('button');
            confirmButton.innerText = confirmText;
            confirmButton.style.padding = '10px 20px';
            confirmButton.style.backgroundColor = '#4CAF50';
            confirmButton.style.color = '#fff';
            confirmButton.style.border = 'none';
            confirmButton.style.borderRadius = '5px';
            confirmButton.style.cursor = 'pointer';
            confirmButton.addEventListener('click', () => {
                document.body.removeChild(overlay);
                resolve(true);
            });

            // Append elements
            buttonsContainer.appendChild(confirmButton);
            modal.appendChild(modalTitle);
            modal.appendChild(modalMessage);
            modal.appendChild(buttonsContainer);
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
        });
    }
    //#endregion


    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês é zero-indexado
        const year = date.getFullYear();

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }

    //Função para mostrar Objetos VM no PBX
    function selectVms(e) {
        app.sendSrc({ api: 'user', mt: 'VmObjects', src: 1 }, async function (obj) {
            console.log('VmObjectsResult=' + JSON.stringify(obj.result))
            const vms = obj.result;
            const leftPane = document.getElementById('left-pane')
            leftPane.innerHTML = '';

            //#region TOPBAR
            let topBar = document.createElement('div')
            topBar.classList.add('left-top-bar')

            // Cria o botão
            button = document.createElement('button');
            button.id = 'newVm';
            button.textContent = texts.text('newVm'); // Define o texto do botão

            topBar.appendChild(button)

            leftPane.appendChild(topBar);


            let insideLeftPane = document.createElement('div')
            insideLeftPane.id = 'inside-left-pane'
            insideLeftPane.classList.add('group-list-container', 'inside-left-pane')
            leftPane.appendChild(insideLeftPane);
            var btnNewVm = document.getElementById('newVm')
            btnNewVm.addEventListener('click', newVm)
            //#endregion


            vms.forEach(function (el) {
                const vm = `<app-box-item vm-guid=${el.columns.guid}  _ngcontent-serverapp-c1993480350="" _nghost-serverapp-c1014264283="" tabindex="0" class="full-width element">
                    <div class="box-wrapper d-flex flex-row flex-wrap theme-secondary">
                    <!---->
                    <div class="box-title">
                    <div class="box-icon">
                        <fa-icon class="ng-fa-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-audio-lines"><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/></svg></fa-icon>
                    </div>
                    <!---->
                    <!---->
                    <div class="box-card">
                        <!---->
                        <h1 class="mb-0">${texts.text('name')}</h1>
                        <h1 class="mb-0">${el.columns.cn}</h1>
                        <!---->
                    </div>
                    </div>
                    <div class="box-title">
                    <div class="box-card">
                        <!---->
                        <h1 class="mb-0">${texts.text('script')}</h1>
                        <input type="text" vm-guid=${el.columns.guid} value=${extractUrl(el.columns.pseudo)}></>
                        <!---->
                    </div>
                    <!---->
                    <div class="box-card">
                        <div class="text-end function-stack-return align-self-center" >
                            <h1 class="mb-0">${texts.text('number')}</h1>
                            <span id="highlight-variable" appdebuggerpopup="" class="highlight-variable">${el.columns.e164}</span>
                            <!---->
                         </div>
                    </div>
                    <!--Save-->
                    <div id="saveVm" vm-guid=${el.columns.guid}  class="action-icon text-danger">
                        <fa-icon class="ng-fa-icon action-icon-icon" >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000770" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-save"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>
                        </fa-icon>
                    </div>
                    <!--Delete-->
                       <div id="deleteVm" vm-guid=${el.columns.guid} class="action-icon text-danger">
                            <fa-icon class="ng-fa-icon action-icon-icon" >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d10000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </fa-icon>
                        </div>
                    <!---->
                    </div>
                    <!---->
                    <!---->
                    <!---->
                    </app-box-item>
                `
                insideLeftPane.innerHTML += vm;
            })
                
            addSaveUrlClickListeners();

            addDelVmClickListeners();
        })

    }

    // Atualiza o nome do arquivo selecionado
    function setProccessTitle(title) {
        const summaryTitle = document.getElementById('app-process-summary-title');
        if (summaryTitle) {
            const secondDiv = summaryTitle.querySelectorAll('div')[1]; // Isso pega a segunda div aninhada
            if (secondDiv) {
                secondDiv.textContent = title; // Altera o conteudo da segunda div
            }
        }
    }

    const extractUrl = (str) => {
        const regex = /<script url="([^"]+)"/;
        const match = str.match(regex);
        return match ? match[1] : null;
    };

    function addSaveUrlClickListeners(e) {
        document.querySelectorAll('#saveVm').forEach(el => {
            el.addEventListener('click', function (e) {
                var vmGuid = e.currentTarget.getAttribute('vm-guid');
                var inputElement = document.querySelector('input[vm-guid="' + vmGuid + '"]');
                if (inputElement) {
                    console.log(inputElement.value);
                    app.sendSrc({ api: 'user', mt: 'SetVmObjectUrl', guid:vmGuid, url:inputElement.value, src: 1 }, async function (obj) {
                        console.log('SetVmObjectUrlResult=' + JSON.stringify(obj.result))
                        selectVms();
                    })
                } else {
                    console.error('Input element not found for vm-guid:', vmGuid);
                }
            });
        })
    }
    function addDelVmClickListeners(e) {
        document.querySelectorAll('#deleteVm').forEach(el => {
            el.addEventListener('click', function (e) {
                var vmGuid = e.currentTarget.getAttribute('vm-guid');
                createConfirmationModal(texts.text('cinfirmDeleteTitle'), texts.text('confirmDeleteVmBody'), texts.text('confirm'), texts.text('cancel'))
                    .then(() => {
                        console.log('Item deleted ' + vmGuid);
                        app.sendSrc({ api: 'user', mt: 'DeleteVmObject', guid: vmGuid, src: 1 }, async function (obj) {
                            console.log('DeleteVmObjectResult=' + JSON.stringify(obj.result))
                            selectVms();
                        })

                    })
                    .catch(() => {
                        console.log('Deletion canceled');
                    });
            });
        })
    }

    function newScript(e) {
        const summaryTitle = document.getElementById('app-process-summary-title');
        if (summaryTitle) {
            const secondDiv = summaryTitle.querySelectorAll('div')[1]; // Isso pega a segunda div aninhada
            if (secondDiv) {
                secondDiv.innerHTML = `
                <input type="text" class="iptFilename" id="filename" placeholder=${texts.text('fileName')}>
            `;
            }
        }

        const leftPane = document.getElementById('inside-left-pane')
        leftPane.innerHTML = '';
        leftPane.innerHTML = elements.map(el =>
            `<app-box-item element="${el.id}"  _ngcontent-serverapp-c1993480350="" _nghost-serverapp-c1014264283="" tabindex="0" class="full-width element">
        <div class="box-wrapper d-flex flex-row flex-wrap theme-secondary">
        <!----><div class="box-title">
        <div class="box-icon">
        <fa-icon class="ng-fa-icon">${el.img}</fa-icon>
        </div>
        <!---->
        <!---->
        <div class="box-card">
        <!---->
        <h1 class="mb-0">${el.name}</h1>
        <p _ngcontent-serverapp-c1014264283="">${el.description}</p>
        <!---->
        </div>
        <!---->
        <!---->
        </div>
        <!---->
        <div class="favorite-icon pointer filled">
        <fa-icon class="ng-fa-icon">
        <svg role="img" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="star" class="svg-inline--fa fa-star" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z">
        </path>
        </svg>
        </fa-icon>
        <!---->
        <!---->
        </div>
        <!---->
        <!---->
        </div>
        <!---->
        <!---->
        </app-box-item>`)
            .join('');
        addElementClickListeners();

    }

    function saveScript(e) {
        let filename = ''
        try {
            filename = document.getElementById('filename').value;
            console.log('Xml Filename: ' + filename)
            //const elements = [...document.querySelectorAll('#selected-elements .element')].map(el => el.textContent);
            //const content = elements.map(el => `<${el} />`).join('\n');

            if (filename == "") {
                createInfoModal(texts.text('warning'), texts.text('warningFillName'), texts.text('ok'))
                //window.alert(texts.text('warningFillName'))
                return;
            }
        } catch (e) {
            createInfoModal(texts.text('warning'), texts.text('warningFillName'), texts.text('ok'))
            //window.alert(texts.text('warningFillName'))
            return;
        }
        

        const xmlDoc = createVoicemailXml()

        //Vamos criar o objeto File para ser enviado a Innovaphone
        // Parâmetros do arquivo
        const lastModified = new Date();
        const lastModifiedDate = new Date();
        const name = filename+".xml";
        const size = xmlDoc.length;
        const type = "text/xml";
        const webkitRelativePath = "";

        // Cria um objeto Blob com o conteúdo do arquivo
        const blob = new Blob([xmlDoc], { type });

        // Cria um objeto File a partir do Blob
        const file = new File([blob], name, {
            type: type,
            lastModified: lastModified
        });

        // Adiciona as propriedades que não são configuráveis pelo construtor do File
        Object.defineProperty(file, 'lastModifiedDate', { value: lastModifiedDate });
        Object.defineProperty(file, 'webkitRelativePath', { value: webkitRelativePath });



        postFile(file)
    }
    //#endregion

    //Funcao para adicionar listners aos elements 
    function addElementClickListeners() {
        document.querySelectorAll('.element').forEach(el => {
            el.addEventListener('click', () => {

                if (processCardName == null) {
                    createInfoModal(texts.text('warning'), texts.text('selectCard'), texts.text('ok'))
                    //window.alert("Selecione em qual parte do escript o elemento deve ser adicionado")
                    return
                }

                if (nextIndex == null) {
                    createInfoModal(texts.text('warning'), texts.text('selectIndex'), texts.text('ok'))
                    //window.alert("Selecione uma posição para continuar criando o script")
                    return
                }
                const processCard = document.querySelector('app-process-' + processCardName + '-card')
                const functionContainer = processCard.querySelector('#function-stack-container-' + processCardName);
                //verifica se o aviso de nenhuma funcao esta ativo
                const functionStack = functionContainer.querySelector('app-process-card-no-items')
                if (functionStack) {
                    functionStack.classList.add('hidden')
                }

                const elementId = el.getAttribute('element')

                console.log('danilo req: Adicionar o Elemento: ' + elementId + ', na posicao: ' + nextIndex + ' do ' + processCardName)


                const element = elements.find(obj => obj.id === elementId);

                let component;
                switch (elementId) {
                    case 'dbg':
                        component = `<app-process-function-stack-row-type-generic
  index="${nextIndex}"
  element="${elementId}"
>
  <app-process-function-stack-row
    
    _nghost-serverapp-c865612792=""
  >
    <div
      
      class="d-flex function-stack-row"
      id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
    >
      <div
        
        class="function-stack-index"
        style="left: 0px"
      >
        ${nextIndex}
      </div>
      <!---->
      <!---->
      <div  class="flex-grow-1 menu-padding">
        <div
          
          similarclassname="function-stack-function"
          class="d-flex diff- flex-column function-stack-function force-hover"
          data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
        >
          <div  class="d-flex flex-row">
            <!---->
            <div  class="function-stack-icon">
              <app-process-function-stack-row-icon
                
                _nghost-serverapp-c335782559=""
              >
                <fa-icon  class="ng-fa-icon">
                  ${element.img}
                </fa-icon>
              </app-process-function-stack-row-icon>
              <!---->
              <!---->
              <!---->
            </div>
            <div
              
              class="function-stack-body my-auto flex-grow-1"
            >
              <app-process-function-stack-row-body
                
                _nghost-serverapp-c2854308694=""
              >
                <div
                  
                  class="function-stack-action"
                >
                  <div
                    
                    class="function-stack-description"
                  ></div>
                  ${element.name}
                  <!---->
                  <!---->
                </div>
                <div
                  
                  class="d-flex align-items-center gap-1"
                >
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <span  class="prefix"
                      >string:</span
                    >
                    <!---->
                    <input
                      id="inputVarString1"
                      param="string"
                      index="${nextIndex}"
                      type="text"
                    />
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <span  class="prefix"
                      >string2:</span
                    >
                    <!---->
                    <input
                      id="inputVarString2"
                      param="string2"
                      index="${nextIndex}"
                      type="text"
                    />
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  
                  <!---->
                  <!---->
                  <!---->
                  <!---->
    
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                </div>
                <!---->
              </app-process-function-stack-row-body>
            </div>
            <!---->
            <!---->
            <!---->
            <!---->
            <!-- Hover Actions-->
            <div
              
              class="function-stack-hover-actions"
            >
              <!-- Esquerda -->
              <div
                
                class="function-stack-left-actions d-flex flex-column justify-content-center"
              >
                <div
                  
                  class="action-icon function-stack-handle"
                >
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="grip-vertical"
                      class="svg-inline--fa fa-grip-vertical fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 320 512"
                    >
                      <path
                        fill="currentColor"
                        d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
              <!-- Direita -->
              <div  class="function-stack-right-actions">
                <!-- 3 pontinhos -->
                <div
                  
                  dropdownclass="processStackRowDropdown"
                  ngbdropdown=""
                  placement="left-top"
                  class="action-icon processStackRowDropdown dropdown"
                >
                  <div
                    
                    ngbdropdowntoggle=""
                    class="dropdown-toggle"
                    aria-expanded="false"
                  >
                    <fa-icon
                      
                      class="ng-fa-icon action-icon-icon"
                    >
                      <svg
                        role="img"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fal"
                        data-icon="ellipsis"
                        class="svg-inline--fa fa-ellipsis fa-fw"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="currentColor"
                          d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                        ></path>
                      </svg>
                    </fa-icon>
                  </div>
                  <!-- Edit description -->
                </div>
                <!--Delete-->
                <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                  <svg
                  role="img"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="trash-can"
                  class="svg-inline--fa fa-trash-can fa-fw"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path
                    fill="currentColor"
                    d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                  ></path>
                  </svg>
                  </fa-icon>
                </div>
                <!---->
                <!---->
                <!---->
              </div>
              
              <!---->
            </div>
            <!---->
          </div>
          <!---->
        </div>
      </div>
    </div>
</app-process-function-stack-row>
<!-- Bot�o + para seguir o fluxo-->
              <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                <div class="add-action-icon">
                  <fa-icon class="ng-fa-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="plus"
                      class="svg-inline--fa fa-plus fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path
                        fill="currentColor"
                        d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
<!---->
<!---->
<!---->
<!---->
</app-process-function-stack-row-type-generic>`
                        break;
                    case 'add':
                        component = `<app-process-function-stack-row-type-generic
  
  index="${nextIndex}"
  element="${elementId}"
>
  <app-process-function-stack-row
    
    _nghost-serverapp-c865612792=""
  >
    <div
      
      class="d-flex function-stack-row"
      id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
    >
      <div
        
        class="function-stack-index"
        style="left: 0px"
      >
        ${nextIndex}
      </div>
      <!---->
      <!---->
      <div  class="flex-grow-1 menu-padding">
        <div
          
          similarclassname="function-stack-function"
          class="d-flex diff- flex-column function-stack-function force-hover"
          data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
        >
          <div  class="d-flex flex-row">
            <!---->
            <div  class="function-stack-icon">
              <app-process-function-stack-row-icon
                
                _nghost-serverapp-c335782559=""
              >
                <fa-icon  class="ng-fa-icon">
                  ${element.img}
                </fa-icon>
              </app-process-function-stack-row-icon>
              <!---->
              <!---->
              <!---->
            </div>
            <div
              
              class="function-stack-body my-auto flex-grow-1"
            >
              <app-process-function-stack-row-body
                
                _nghost-serverapp-c2854308694=""
              >
                <div
                  
                  class="function-stack-action"
                >
                  <div
                    
                    class="function-stack-description"
                  ></div>
                  ${element.name}
                  <!---->
                  <!---->
                </div>
                <div
                  
                  class="d-flex align-items-center gap-1"
                >
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <span  class="prefix"
                      >var:</span
                    >
                    <!---->
                    <input
                      id="inputVarName"
                      param="out"
                      index="${nextIndex}"
                      type="text"
                    />
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    class="d-inline-block function-stack-variable"
                  >
                    =
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <div class="d-flex">
                      <span class="prefix"></span
                      ><input id="inputVarValue" param="value" type="text" class="value" />
                      <span class="filter" title=""></span>
                    </div>
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    class="d-inline-block function-stack-variable"
                  >
                    +
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <div class="d-flex">
                      <span class="prefix"></span
                      ><input id="inputVarValue2" param="value2" type="text" class="value" />
                      <span class="filter" title=""></span>
                    </div>
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                </div>
                <!---->
              </app-process-function-stack-row-body>
            </div>
            <!---->
            <!---->
            <!---->
            <div
              
              class="text-end function-stack-return align-self-center"
            >
              retorna como
              <span
                
                id="highlight-variable"
                appdebuggerpopup=""
                class="highlight-variable"
              ></span>
              <!---->
            </div>
            <!---->
            <!-- Hover Actions-->
            <div
              
              class="function-stack-hover-actions"
            >
              <!-- Esquerda -->
              <div
                
                class="function-stack-left-actions d-flex flex-column justify-content-center"
              >
                <div
                  
                  class="action-icon function-stack-handle"
                >
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="grip-vertical"
                      class="svg-inline--fa fa-grip-vertical fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 320 512"
                    >
                      <path
                        fill="currentColor"
                        d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
              <!-- Direita -->
              <div  class="function-stack-right-actions">
                <!-- 3 pontinhos -->
                <div
                  
                  dropdownclass="processStackRowDropdown"
                  ngbdropdown=""
                  placement="left-top"
                  class="action-icon processStackRowDropdown dropdown"
                >
                  <div
                    
                    ngbdropdowntoggle=""
                    class="dropdown-toggle"
                    aria-expanded="false"
                  >
                    <fa-icon
                      
                      class="ng-fa-icon action-icon-icon"
                    >
                      <svg
                        role="img"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fal"
                        data-icon="ellipsis"
                        class="svg-inline--fa fa-ellipsis fa-fw"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="currentColor"
                          d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                        ></path>
                      </svg>
                    </fa-icon>
                  </div>
                  <!-- Edit description -->
                </div>
                <!--Delete-->
                <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                  <svg
                  role="img"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="trash-can"
                  class="svg-inline--fa fa-trash-can fa-fw"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path
                    fill="currentColor"
                    d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                  ></path>
                  </svg>
                  </fa-icon>
                </div>
                <!---->
                <!---->
                <!---->
              </div>
              
              <!---->
            </div>
            <!---->
          </div>
          <!---->
        </div>
      </div>
    </div>
</app-process-function-stack-row>
<!-- Bot�o + para seguir o fluxo-->
              <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                <div class="add-action-icon">
                  <fa-icon class="ng-fa-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="plus"
                      class="svg-inline--fa fa-plus fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path
                        fill="currentColor"
                        d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
<!---->
<!---->
<!---->
<!---->
</app-process-function-stack-row-type-generic>`
                        break;
                    case 'sub':
                        component = `<app-process-function-stack-row-type-generic
  
  index="${nextIndex}"
  element="${elementId}"
>
  <app-process-function-stack-row
    
    _nghost-serverapp-c865612792=""
  >
    <div
      
      class="d-flex function-stack-row"
      id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
    >
      <div
        
        class="function-stack-index"
        style="left: 0px"
      >
        ${nextIndex}
      </div>
      <!---->
      <!---->
      <div  class="flex-grow-1 menu-padding">
        <div
          
          similarclassname="function-stack-function"
          class="d-flex diff- flex-column function-stack-function force-hover"
          data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
        >
          <div  class="d-flex flex-row">
            <!---->
            <div  class="function-stack-icon">
              <app-process-function-stack-row-icon
                
                _nghost-serverapp-c335782559=""
              >
                <fa-icon  class="ng-fa-icon">
                  ${element.img}
                </fa-icon>
              </app-process-function-stack-row-icon>
              <!---->
              <!---->
              <!---->
            </div>
            <div
              
              class="function-stack-body my-auto flex-grow-1"
            >
              <app-process-function-stack-row-body
                
                _nghost-serverapp-c2854308694=""
              >
                <div
                  
                  class="function-stack-action"
                >
                  <div
                    
                    class="function-stack-description"
                  ></div>
                  ${element.name}
                  <!---->
                  <!---->
                </div>
                <div
                  
                  class="d-flex align-items-center gap-1"
                >
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <span  class="prefix"
                      >var:</span
                    >
                    <!---->
                    <input
                      id="inputVarName"
                      param="out"
                      index="${nextIndex}"
                      type="text"
                    />
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    class="d-inline-block function-stack-variable"
                  >
                    =
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <div class="d-flex">
                      <span class="prefix"></span
                      ><input id="inputVarValue" param="value" type="text" class="value" />
                      <span class="filter" title=""></span>
                    </div>
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    class="d-inline-block function-stack-variable"
                  >
                    -
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <div class="d-flex">
                      <span class="prefix"></span
                      ><input id="inputVarValue2" param="value2" type="text" class="value" />
                      <span class="filter" title=""></span>
                    </div>
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                </div>
                <!---->
              </app-process-function-stack-row-body>
            </div>
            <!---->
            <!---->
            <!---->
            <div
              
              class="text-end function-stack-return align-self-center"
            >
              retorna como
              <span
                
                id="highlight-variable"
                appdebuggerpopup=""
                class="highlight-variable"
              ></span>
              <!---->
            </div>
            <!---->
            <!-- Hover Actions-->
            <div
              
              class="function-stack-hover-actions"
            >
              <!-- Esquerda -->
              <div
                
                class="function-stack-left-actions d-flex flex-column justify-content-center"
              >
                <div
                  
                  class="action-icon function-stack-handle"
                >
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="grip-vertical"
                      class="svg-inline--fa fa-grip-vertical fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 320 512"
                    >
                      <path
                        fill="currentColor"
                        d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
              <!-- Direita -->
              <div  class="function-stack-right-actions">
                <!-- 3 pontinhos -->
                <div
                  
                  dropdownclass="processStackRowDropdown"
                  ngbdropdown=""
                  placement="left-top"
                  class="action-icon processStackRowDropdown dropdown"
                >
                  <div
                    
                    ngbdropdowntoggle=""
                    class="dropdown-toggle"
                    aria-expanded="false"
                  >
                    <fa-icon
                      
                      class="ng-fa-icon action-icon-icon"
                    >
                      <svg
                        role="img"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fal"
                        data-icon="ellipsis"
                        class="svg-inline--fa fa-ellipsis fa-fw"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="currentColor"
                          d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                        ></path>
                      </svg>
                    </fa-icon>
                  </div>
                  <!-- Edit description -->
                </div>
                <!--Delete-->
                <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                  <svg
                  role="img"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="trash-can"
                  class="svg-inline--fa fa-trash-can fa-fw"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path
                    fill="currentColor"
                    d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                  ></path>
                  </svg>
                  </fa-icon>
                </div>
                <!---->
                <!---->
                <!---->
              </div>
              
              <!---->
            </div>
            <!---->
          </div>
          <!---->
        </div>
      </div>
    </div>
</app-process-function-stack-row>
<!-- Bot�o + para seguir o fluxo-->
              <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                <div class="add-action-icon">
                  <fa-icon class="ng-fa-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="plus"
                      class="svg-inline--fa fa-plus fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path
                        fill="currentColor"
                        d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
<!---->
<!---->
<!---->
<!---->
</app-process-function-stack-row-type-generic>`
                        break;
                    case 'assign':
                        component = `<app-process-function-stack-row-type-generic
  
  index="${nextIndex}"
  element="${elementId}"
>
  <app-process-function-stack-row
    
    _nghost-serverapp-c865612792=""
  >
    <div
      
      class="d-flex function-stack-row"
      id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
    >
      <div
        
        class="function-stack-index"
        style="left: 0px"
      >
        ${nextIndex}
      </div>
      <!---->
      <!---->
      <div  class="flex-grow-1 menu-padding">
        <div
          
          similarclassname="function-stack-function"
          class="d-flex diff- flex-column function-stack-function force-hover"
          data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
        >
          <div  class="d-flex flex-row">
            <!---->
            <div  class="function-stack-icon">
              <app-process-function-stack-row-icon
                
                _nghost-serverapp-c335782559=""
              >
                <fa-icon  class="ng-fa-icon">
                  ${element.img}
                </fa-icon>
              </app-process-function-stack-row-icon>
              <!---->
              <!---->
              <!---->
            </div>
            <div
              
              class="function-stack-body my-auto flex-grow-1"
            >
              <app-process-function-stack-row-body
                
                _nghost-serverapp-c2854308694=""
              >
                <div
                  
                  class="function-stack-action"
                >
                  <div
                    
                    class="function-stack-description"
                  ></div>
                  ${element.name}
                  <!---->
                  <!---->
                </div>
                <div
                  
                  class="d-flex align-items-center gap-1"
                >
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <span  class="prefix"
                      >var:</span
                    >
                    <!---->
                    <input
                      id="inputVarName"
                      param="out"
                      index="${nextIndex}"
                      type="text"
                    />
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    class="d-inline-block function-stack-variable"
                  >
                    =
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <div class="d-flex">
                      <span class="prefix"></span
                      ><input id="inputVarValue" type="text" param="value" class="value" />
                      <span class="filter" title=""></span>
                    </div>
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                </div>
                <!---->
              </app-process-function-stack-row-body>
            </div>
            <!---->
            <!---->
            <!---->
            <div
              
              class="text-end function-stack-return align-self-center"
            >
              retorna como
              <span
                
                id="highlight-variable"
                appdebuggerpopup=""
                class="highlight-variable"
              ></span>
              <!---->
            </div>
            <!---->
            <!-- Hover Actions-->
            <div
              
              class="function-stack-hover-actions"
            >
              <!-- Esquerda -->
              <div
                
                class="function-stack-left-actions d-flex flex-column justify-content-center"
              >
                <div
                  
                  class="action-icon function-stack-handle"
                >
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="grip-vertical"
                      class="svg-inline--fa fa-grip-vertical fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 320 512"
                    >
                      <path
                        fill="currentColor"
                        d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
              <!-- Direita -->
              <div  class="function-stack-right-actions">
                <!-- 3 pontinhos -->
                <div
                  
                  dropdownclass="processStackRowDropdown"
                  ngbdropdown=""
                  placement="left-top"
                  class="action-icon processStackRowDropdown dropdown"
                >
                  <div
                    
                    ngbdropdowntoggle=""
                    class="dropdown-toggle"
                    aria-expanded="false"
                  >
                    <fa-icon
                      
                      class="ng-fa-icon action-icon-icon"
                    >
                      <svg
                        role="img"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fal"
                        data-icon="ellipsis"
                        class="svg-inline--fa fa-ellipsis fa-fw"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="currentColor"
                          d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                        ></path>
                      </svg>
                    </fa-icon>
                  </div>
                  <!-- Edit description -->
                </div>
                <!--Delete-->
                <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                  <svg
                  role="img"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="trash-can"
                  class="svg-inline--fa fa-trash-can fa-fw"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path
                    fill="currentColor"
                    d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                  ></path>
                  </svg>
                  </fa-icon>
                </div>
                <!---->
                <!---->
                <!---->
              </div>
              
              <!---->
            </div>
            <!---->
          </div>
          <!---->
        </div>
      </div>
    </div>
</app-process-function-stack-row>
<!-- Bot�o + para seguir o fluxo-->
              <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                <div class="add-action-icon">
                  <fa-icon class="ng-fa-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="plus"
                      class="svg-inline--fa fa-plus fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path
                        fill="currentColor"
                        d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
<!---->
<!---->
<!---->
<!---->
</app-process-function-stack-row-type-generic>`
                        break;
                    case 'exec':
                        component = `<app-process-function-stack-row-type-generic
  
  index="${nextIndex}"
  element="${elementId}"
>
  <app-process-function-stack-row
    
    _nghost-serverapp-c865612792=""
  >
    <div
      
      class="d-flex function-stack-row"
      id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
    >
      <div
        
        class="function-stack-index"
        style="left: 0px"
      >
        ${nextIndex}
      </div>
      <!---->
      <!---->
      <div  class="flex-grow-1 menu-padding">
        <div
          
          similarclassname="function-stack-function"
          class="d-flex diff- flex-column function-stack-function force-hover"
          data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
        >
          <div  class="d-flex flex-row">
            <!---->
            <div  class="function-stack-icon">
              <app-process-function-stack-row-icon
                
                _nghost-serverapp-c335782559=""
              >
                <fa-icon  class="ng-fa-icon">
                  ${element.img}
                </fa-icon>
              </app-process-function-stack-row-icon>
              <!---->
              <!---->
              <!---->
            </div>
            <div
              
              class="function-stack-body my-auto flex-grow-1"
            >
              <app-process-function-stack-row-body
                
                _nghost-serverapp-c2854308694=""
              >
                <div
                  
                  class="function-stack-action"
                >
                  <div
                    
                    class="function-stack-description"
                  ></div>
                  ${element.name}
                  <!---->
                  <!---->
                </div>
                <div
                  
                  class="d-flex align-items-center gap-1"
                >
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <span  class="prefix"
                      >url:</span
                    >
                    <!---->
                    <input
                      id="inputVarUrl"
                      param="url"
                      index="${nextIndex}"
                      type="text"
                    />
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                </div>
                <!---->
              </app-process-function-stack-row-body>
            </div>
            <!---->
            <!---->
            <!---->
            <!---->
            <!-- Hover Actions-->
            <div
              
              class="function-stack-hover-actions"
            >
              <!-- Esquerda -->
              <div
                
                class="function-stack-left-actions d-flex flex-column justify-content-center"
              >
                <div
                  
                  class="action-icon function-stack-handle"
                >
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="grip-vertical"
                      class="svg-inline--fa fa-grip-vertical fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 320 512"
                    >
                      <path
                        fill="currentColor"
                        d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
              <!-- Direita -->
              <div  class="function-stack-right-actions">
                <!-- 3 pontinhos -->
                <div
                  
                  dropdownclass="processStackRowDropdown"
                  ngbdropdown=""
                  placement="left-top"
                  class="action-icon processStackRowDropdown dropdown"
                >
                  <div
                    
                    ngbdropdowntoggle=""
                    class="dropdown-toggle"
                    aria-expanded="false"
                  >
                    <fa-icon
                      
                      class="ng-fa-icon action-icon-icon"
                    >
                      <svg
                        role="img"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fal"
                        data-icon="ellipsis"
                        class="svg-inline--fa fa-ellipsis fa-fw"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="currentColor"
                          d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                        ></path>
                      </svg>
                    </fa-icon>
                  </div>
                  <!-- Edit description -->
                </div>
                <!--Delete-->
                <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                  <svg
                  role="img"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="trash-can"
                  class="svg-inline--fa fa-trash-can fa-fw"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path
                    fill="currentColor"
                    d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                  ></path>
                  </svg>
                  </fa-icon>
                </div>
                <!---->
                <!---->
                <!---->
              </div>
              
              <!---->
            </div>
            <!---->
          </div>
          <!---->
        </div>
      </div>
    </div>
</app-process-function-stack-row>
<!-- Bot�o + para seguir o fluxo-->
              <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                <div class="add-action-icon">
                  <fa-icon class="ng-fa-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="plus"
                      class="svg-inline--fa fa-plus fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path
                        fill="currentColor"
                        d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
<!---->
<!---->
<!---->
<!---->
</app-process-function-stack-row-type-generic>`
                        break;
                    case 'pbx-disc':
                        component = `<app-process-function-stack-row-type-generic
  
  index="${nextIndex}"
  element="${elementId}"
>
  <app-process-function-stack-row
    
    _nghost-serverapp-c865612792=""
  >
    <div
      
      class="d-flex function-stack-row"
      id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
    >
      <div
        
        class="function-stack-index"
        style="left: 0px"
      >
        ${nextIndex}
      </div>
      <!---->
      <!---->
      <div  class="flex-grow-1 menu-padding">
        <div
          
          similarclassname="function-stack-function"
          class="d-flex diff- flex-column function-stack-function force-hover"
          data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
        >
          <div  class="d-flex flex-row">
            <!---->
            <div  class="function-stack-icon">
              <app-process-function-stack-row-icon
                
                _nghost-serverapp-c335782559=""
              >
                <fa-icon  class="ng-fa-icon">
                  ${element.img}
                </fa-icon>
              </app-process-function-stack-row-icon>
              <!---->
              <!---->
              <!---->
            </div>
            <div
              
              class="function-stack-body my-auto flex-grow-1"
            >
              <app-process-function-stack-row-body
                
                _nghost-serverapp-c2854308694=""
              >
                <div
                  
                  class="function-stack-action"
                >
                  <div
                    
                    class="function-stack-description"
                  ></div>
                  ${element.name}
                  <!---->
                  <!---->
                </div>
                <div
                  
                  class="d-flex align-items-center gap-1"
                >
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <span  class="prefix"
                      >Disconecta a chamada do script</span
                    >
                    <!---->
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                </div>
                <!---->
              </app-process-function-stack-row-body>
            </div>
            <!---->
            <!---->
            <!---->
            <!---->
            <!-- Hover Actions-->
            <div
              
              class="function-stack-hover-actions"
            >
              <!-- Esquerda -->
              <div
                
                class="function-stack-left-actions d-flex flex-column justify-content-center"
              >
                <div
                  
                  class="action-icon function-stack-handle"
                >
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="grip-vertical"
                      class="svg-inline--fa fa-grip-vertical fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 320 512"
                    >
                      <path
                        fill="currentColor"
                        d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
              <!-- Direita -->
              <div  class="function-stack-right-actions">
                <!-- 3 pontinhos -->
                <div
                  
                  dropdownclass="processStackRowDropdown"
                  ngbdropdown=""
                  placement="left-top"
                  class="action-icon processStackRowDropdown dropdown"
                >
                  <div
                    
                    ngbdropdowntoggle=""
                    class="dropdown-toggle"
                    aria-expanded="false"
                  >
                    <fa-icon
                      
                      class="ng-fa-icon action-icon-icon"
                    >
                      <svg
                        role="img"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fal"
                        data-icon="ellipsis"
                        class="svg-inline--fa fa-ellipsis fa-fw"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="currentColor"
                          d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                        ></path>
                      </svg>
                    </fa-icon>
                  </div>
                  <!-- Edit description -->
                </div>
                <!--Delete-->
                <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                  <svg
                  role="img"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="trash-can"
                  class="svg-inline--fa fa-trash-can fa-fw"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path
                    fill="currentColor"
                    d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                  ></path>
                  </svg>
                  </fa-icon>
                </div>
                <!---->
                <!---->
                <!---->
              </div>
              
              <!---->
            </div>
            <!---->
          </div>
          <!---->
        </div>
      </div>
    </div>
</app-process-function-stack-row>
<!-- Bot�o + para seguir o fluxo-->
              <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                <div class="add-action-icon">
                  <fa-icon class="ng-fa-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="plus"
                      class="svg-inline--fa fa-plus fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path
                        fill="currentColor"
                        d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
<!---->
<!---->
<!---->
<!---->
</app-process-function-stack-row-type-generic>`
                        break;
                    case 'wait':
                        component = `<app-process-function-stack-row-type-generic
  
  index="${nextIndex}"
  element="${elementId}"
>
  <app-process-function-stack-row
    
    _nghost-serverapp-c865612792=""
  >
    <div
      
      class="d-flex function-stack-row"
      id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
    >
      <div
        
        class="function-stack-index"
        style="left: 0px"
      >
        ${nextIndex}
      </div>
      <!---->
      <!---->
      <div  class="flex-grow-1 menu-padding">
        <div
          
          similarclassname="function-stack-function"
          class="d-flex diff- flex-column function-stack-function force-hover"
          data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
        >
          <div  class="d-flex flex-row">
            <!---->
            <div  class="function-stack-icon">
              <app-process-function-stack-row-icon
                
                _nghost-serverapp-c335782559=""
              >
                <fa-icon  class="ng-fa-icon">
                  ${element.img}
                </fa-icon>
              </app-process-function-stack-row-icon>
              <!---->
              <!---->
              <!---->
            </div>
            <div
              
              class="function-stack-body my-auto flex-grow-1"
            >
              <app-process-function-stack-row-body
                
                _nghost-serverapp-c2854308694=""
              >
                <div
                  
                  class="function-stack-action"
                >
                  <div
                    
                    class="function-stack-description"
                  ></div>
                  ${element.name}
                  <!---->
                  <!---->
                </div>
                <div
                  
                  class="d-flex align-items-center gap-1"
                >
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <span  class="prefix"
                      >sec:</span
                    >
                    <!---->
                    <input
                      id="inputVarSeconds"
                      param="sec"
                      index="${nextIndex}"
                      type="text"
                    />
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                </div>
                <!---->
              </app-process-function-stack-row-body>
            </div>
            <!---->
            <!---->
            <!---->
            <!---->
            <!-- Hover Actions-->
            <div
              
              class="function-stack-hover-actions"
            >
              <!-- Esquerda -->
              <div
                
                class="function-stack-left-actions d-flex flex-column justify-content-center"
              >
                <div
                  
                  class="action-icon function-stack-handle"
                >
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="grip-vertical"
                      class="svg-inline--fa fa-grip-vertical fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 320 512"
                    >
                      <path
                        fill="currentColor"
                        d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
              <!-- Direita -->
              <div  class="function-stack-right-actions">
                <!-- 3 pontinhos -->
                <div
                  
                  dropdownclass="processStackRowDropdown"
                  ngbdropdown=""
                  placement="left-top"
                  class="action-icon processStackRowDropdown dropdown"
                >
                  <div
                    
                    ngbdropdowntoggle=""
                    class="dropdown-toggle"
                    aria-expanded="false"
                  >
                    <fa-icon
                      
                      class="ng-fa-icon action-icon-icon"
                    >
                      <svg
                        role="img"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fal"
                        data-icon="ellipsis"
                        class="svg-inline--fa fa-ellipsis fa-fw"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="currentColor"
                          d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                        ></path>
                      </svg>
                    </fa-icon>
                  </div>
                  <!-- Edit description -->
                </div>
                <!--Delete-->
                <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                  <svg
                  role="img"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="trash-can"
                  class="svg-inline--fa fa-trash-can fa-fw"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path
                    fill="currentColor"
                    d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                  ></path>
                  </svg>
                  </fa-icon>
                </div>
                <!---->
                <!---->
                <!---->
              </div>
              
              <!---->
            </div>
            <!---->
          </div>
          <!---->
        </div>
      </div>
    </div>
</app-process-function-stack-row>
<!-- Bot�o + para seguir o fluxo-->
              <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                <div class="add-action-icon">
                  <fa-icon class="ng-fa-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="plus"
                      class="svg-inline--fa fa-plus fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path
                        fill="currentColor"
                        d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
<!---->
<!---->
<!---->
<!---->
</app-process-function-stack-row-type-generic>`
                        break;
                    case 'pbx-prompt':
                        component = `<app-process-function-stack-row-type-generic
  
  index="${nextIndex}"
  element="${elementId}"
>
  <app-process-function-stack-row
    
    _nghost-serverapp-c865612792=""
  >
    <div
      
      class="d-flex function-stack-row"
      id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
    >
      <div
        
        class="function-stack-index"
        style="left: 0px"
      >
        ${nextIndex}
      </div>
      <!---->
      <!---->
      <div  class="flex-grow-1 menu-padding">
        <div
          
          similarclassname="function-stack-function"
          class="d-flex diff- flex-column function-stack-function force-hover"
          data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
        >
          <div  class="d-flex flex-row">
            <!---->
            <div  class="function-stack-icon">
              <app-process-function-stack-row-icon
                
                _nghost-serverapp-c335782559=""
              >
                <fa-icon  class="ng-fa-icon">
                  ${element.img}
                </fa-icon>
              </app-process-function-stack-row-icon>
              <!---->
              <!---->
              <!---->
            </div>
            <div
              
              class="function-stack-body my-auto flex-grow-1"
            >
              <app-process-function-stack-row-body
                
                _nghost-serverapp-c2854308694=""
              >
                <div
                  
                  class="function-stack-action"
                >
                  <div
                    
                    class="function-stack-description"
                  ></div>
                  ${element.name}
                  <!---->
                  <!---->
                </div>
                <div
                  
                  class="d-flex align-items-center gap-1"
                >
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <span  class="prefix"
                      >url:</span
                    >
                    <!---->
                    <input
                      id="inputVarValue"
                      index="${nextIndex}"
                      type="text"
                    />
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                </div>
                <!---->
              </app-process-function-stack-row-body>
            </div>
            <!---->
            <!---->
            <!---->
            <!---->
            <!-- Hover Actions-->
            <div
              
              class="function-stack-hover-actions"
            >
              <!-- Esquerda -->
              <div
                
                class="function-stack-left-actions d-flex flex-column justify-content-center"
              >
                <div
                  
                  class="action-icon function-stack-handle"
                >
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="grip-vertical"
                      class="svg-inline--fa fa-grip-vertical fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 320 512"
                    >
                      <path
                        fill="currentColor"
                        d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
              <!-- Direita -->
              <div  class="function-stack-right-actions">
                <!-- 3 pontinhos -->
                <div
                  
                  dropdownclass="processStackRowDropdown"
                  ngbdropdown=""
                  placement="left-top"
                  class="action-icon processStackRowDropdown dropdown"
                >
                  <div
                    
                    ngbdropdowntoggle=""
                    class="dropdown-toggle"
                    aria-expanded="false"
                  >
                    <fa-icon
                      
                      class="ng-fa-icon action-icon-icon"
                    >
                      <svg
                        role="img"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fal"
                        data-icon="ellipsis"
                        class="svg-inline--fa fa-ellipsis fa-fw"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="currentColor"
                          d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                        ></path>
                      </svg>
                    </fa-icon>
                  </div>
                  <!-- Edit description -->
                </div>
                <!--Delete-->
                <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                  <svg
                  role="img"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="trash-can"
                  class="svg-inline--fa fa-trash-can fa-fw"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path
                    fill="currentColor"
                    d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                  ></path>
                  </svg>
                  </fa-icon>
                </div>
                <!---->
                <!---->
                <!---->
              </div>
              
              <!---->
            </div>
            <!---->
          </div>
          <!---->
        </div>
      </div>
    </div>
</app-process-function-stack-row>
<!-- Bot�o + para seguir o fluxo-->
              <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                <div class="add-action-icon">
                  <fa-icon class="ng-fa-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="plus"
                      class="svg-inline--fa fa-plus fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path
                        fill="currentColor"
                        d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
<!---->
<!---->
<!---->
<!---->
</app-process-function-stack-row-type-generic>`
                        break;
                    case 'pbx-xfer':
                        component = `<app-process-function-stack-row-type-generic
    
    index="${nextIndex}"
    element="${elementId}"
  >
    <app-process-function-stack-row
      
      _nghost-serverapp-c865612792=""
    >
      <div
        
        class="d-flex function-stack-row"
        id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
      >
        <div
          
          class="function-stack-index"
          style="left: 0px"
        >
          ${nextIndex}
        </div>
        <!---->
        <!---->
        <div  class="flex-grow-1 menu-padding">
          <div
            
            similarclassname="function-stack-function"
            class="d-flex diff- flex-column function-stack-function force-hover"
            data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
          >
            <div  class="d-flex flex-row">
              <!---->
              <div  class="function-stack-icon">
                <app-process-function-stack-row-icon
                  
                  _nghost-serverapp-c335782559=""
                >
                  <fa-icon  class="ng-fa-icon">
                    ${element.img}
                  </fa-icon>
                </app-process-function-stack-row-icon>
                <!---->
                <!---->
                <!---->
              </div>
              <div
                
                class="function-stack-body my-auto flex-grow-1"
              >
                <app-process-function-stack-row-body
                  
                  _nghost-serverapp-c2854308694=""
                >
                  <div
                    
                    class="function-stack-action"
                  >
                    <div
                      
                      class="function-stack-description"
                    ></div>
                    ${element.name}
                    <!---->
                    <!---->
                  </div>
                  <div
                    
                    class="d-flex align-items-center gap-1"
                  >
                    <div
                      
                      appdebuggerpopup=""
                      class="function-stack-variable highlight"
                    >
                      <span  class="prefix"
                        >e164:</span
                      >
                      <!---->
                      <input
                        id="inputVare164"
                        param="e164"
                        index="${nextIndex}"
                        type="text"
                      />
                    </div>
                    <!---->
                    <!---->
                    <!---->
                    <!---->
                    <!---->
                    <!---->
                    
                    <!---->
                    <!---->
                    <!---->
                    <!---->
                    <!---->
                    
                    <!---->
                    <!---->
                    <!---->
                    <!---->
                    <!---->
                    <!---->
                    <!---->
                    <!---->
                    <!---->
                  </div>
                  <!---->
                </app-process-function-stack-row-body>
              </div>
              <!---->
              <!---->
              <!---->
              <!---->
              <!-- Hover Actions-->
              <div
                
                class="function-stack-hover-actions"
              >
                <!-- Esquerda -->
                <div
                  
                  class="function-stack-left-actions d-flex flex-column justify-content-center"
                >
                  <div
                    
                    class="action-icon function-stack-handle"
                  >
                    <fa-icon
                      
                      class="ng-fa-icon action-icon-icon"
                    >
                      <svg
                        role="img"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fal"
                        data-icon="grip-vertical"
                        class="svg-inline--fa fa-grip-vertical fa-fw"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 320 512"
                      >
                        <path
                          fill="currentColor"
                          d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                        ></path>
                      </svg>
                    </fa-icon>
                  </div>
                  <!---->
                </div>
                <!-- Direita -->
                <div  class="function-stack-right-actions">
                  <!-- 3 pontinhos -->
                  <div
                    
                    dropdownclass="processStackRowDropdown"
                    ngbdropdown=""
                    placement="left-top"
                    class="action-icon processStackRowDropdown dropdown"
                  >
                    <div
                      
                      ngbdropdowntoggle=""
                      class="dropdown-toggle"
                      aria-expanded="false"
                    >
                      <fa-icon
                        
                        class="ng-fa-icon action-icon-icon"
                      >
                        <svg
                          role="img"
                          aria-hidden="true"
                          focusable="false"
                          data-prefix="fal"
                          data-icon="ellipsis"
                          class="svg-inline--fa fa-ellipsis fa-fw"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 448 512"
                        >
                          <path
                            fill="currentColor"
                            d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                          ></path>
                        </svg>
                      </fa-icon>
                    </div>
                    <!-- Edit description -->
                  </div>
                  <!--Delete-->
                  <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                    <fa-icon
                      
                      class="ng-fa-icon action-icon-icon"
                    >
                    <svg
                    role="img"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fal"
                    data-icon="trash-can"
                    class="svg-inline--fa fa-trash-can fa-fw"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                  >
                    <path
                      fill="currentColor"
                      d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                    ></path>
                    </svg>
                    </fa-icon>
                  </div>
                  <!---->
                  <!---->
                  <!---->
                </div>
                
                <!---->
              </div>
              <!---->
            </div>
            <!---->
          </div>
        </div>
      </div>
  </app-process-function-stack-row>
  <!-- Bot�o + para seguir o fluxo-->
                <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                  <div class="add-action-icon">
                    <fa-icon class="ng-fa-icon"
                    >
                      <svg
                        role="img"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fal"
                        data-icon="plus"
                        class="svg-inline--fa fa-plus fa-fw"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="currentColor"
                          d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                        ></path>
                      </svg>
                    </fa-icon>
                  </div>
                  <!---->
                </div>
  <!---->
  <!---->
  <!---->
  <!---->
  </app-process-function-stack-row-type-generic>`
                        break;
                    case 'store-get':
                        component = `<app-process-function-stack-row-type-generic
  
  index="${nextIndex}"
  element="${elementId}"
>
  <app-process-function-stack-row
    
    _nghost-serverapp-c865612792=""
  >
    <div
      
      class="d-flex function-stack-row"
      id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
    >
      <div
        
        class="function-stack-index"
        style="left: 0px"
      >
        ${nextIndex}
      </div>
      <!---->
      <!---->
      <div  class="flex-grow-1 menu-padding">
        <div
          
          similarclassname="function-stack-function"
          class="d-flex diff- flex-column function-stack-function force-hover"
          data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
        >
          <div  class="d-flex flex-row">
            <!---->
            <div  class="function-stack-icon">
              <app-process-function-stack-row-icon
                
                _nghost-serverapp-c335782559=""
              >
                <fa-icon  class="ng-fa-icon">
                  ${element.img}
                </fa-icon>
              </app-process-function-stack-row-icon>
              <!---->
              <!---->
              <!---->
            </div>
            <div
              
              class="function-stack-body my-auto flex-grow-1"
            >
              <app-process-function-stack-row-body
                
                _nghost-serverapp-c2854308694=""
              >
                <div
                  
                  class="function-stack-action"
                >
                  <div
                    
                    class="function-stack-description"
                  ></div>
                  ${element.name}
                  <!---->
                  <!---->
                </div>
                <div
                  
                  class="d-flex align-items-center gap-1"
                >
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <span  class="prefix"
                      >out-url:</span
                    >
                    <!---->
                    <input
                      id="inputVarName"
                      param="out-url"
                      index="${nextIndex}"
                      type="text"
                    />
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    class="d-inline-block function-stack-variable"
                  >
                    =
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <div class="d-flex">
                      <span class="prefix"></span
                      ><input id="inputVarValue" param="root" type="text" class="value" />
                      <span class="filter" title=""></span>
                    </div>
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    class="d-inline-block function-stack-variable"
                  >
                    /
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <div class="d-flex">
                      <span class="prefix"></span
                      ><input id="inputVarValue2" param="name" type="text" class="value" />
                      <span class="filter" title=""></span>
                    </div>
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                </div>
                <!---->
              </app-process-function-stack-row-body>
            </div>
            <!---->
            <!---->
            <!---->
            <div
              
              class="text-end function-stack-return align-self-center"
            >
              retorna como
              <span
                
                id="highlight-variable"
                appdebuggerpopup=""
                class="highlight-variable"
              ></span>
              <!---->
            </div>
            <!---->
            <!-- Hover Actions-->
            <div
              
              class="function-stack-hover-actions"
            >
              <!-- Esquerda -->
              <div
                
                class="function-stack-left-actions d-flex flex-column justify-content-center"
              >
                <div
                  
                  class="action-icon function-stack-handle"
                >
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="grip-vertical"
                      class="svg-inline--fa fa-grip-vertical fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 320 512"
                    >
                      <path
                        fill="currentColor"
                        d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
              <!-- Direita -->
              <div  class="function-stack-right-actions">
                <!-- 3 pontinhos -->
                <div
                  
                  dropdownclass="processStackRowDropdown"
                  ngbdropdown=""
                  placement="left-top"
                  class="action-icon processStackRowDropdown dropdown"
                >
                  <div
                    
                    ngbdropdowntoggle=""
                    class="dropdown-toggle"
                    aria-expanded="false"
                  >
                    <fa-icon
                      
                      class="ng-fa-icon action-icon-icon"
                    >
                      <svg
                        role="img"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fal"
                        data-icon="ellipsis"
                        class="svg-inline--fa fa-ellipsis fa-fw"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="currentColor"
                          d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                        ></path>
                      </svg>
                    </fa-icon>
                  </div>
                  <!-- Edit description -->
                </div>
                <!--Delete-->
                <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                  <svg
                  role="img"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="trash-can"
                  class="svg-inline--fa fa-trash-can fa-fw"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path
                    fill="currentColor"
                    d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                  ></path>
                  </svg>
                  </fa-icon>
                </div>
                <!---->
                <!---->
                <!---->
              </div>
              
              <!---->
            </div>
            <!---->
          </div>
          <!---->
        </div>
      </div>
    </div>
</app-process-function-stack-row>
<!-- Bot�o + para seguir o fluxo-->
              <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                <div class="add-action-icon">
                  <fa-icon class="ng-fa-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="plus"
                      class="svg-inline--fa fa-plus fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path
                        fill="currentColor"
                        d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
<!---->
<!---->
<!---->
<!---->
</app-process-function-stack-row-type-generic>`
                        break;
                    case 'call':
                        component = `<app-process-function-stack-row-type-generic
      
      index="${nextIndex}"
      element="${elementId}"
    >
      <app-process-function-stack-row
        
        _nghost-serverapp-c865612792=""
      >
        <div
          
          class="d-flex function-stack-row"
          id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
        >
          <div
            
            class="function-stack-index"
            style="left: 0px"
          >
            ${nextIndex}
          </div>
          <!---->
          <!---->
          <div  class="flex-grow-1 menu-padding">
            <div
              
              similarclassname="function-stack-function"
              class="d-flex diff- flex-column function-stack-function force-hover"
              data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
            >
              <div  class="d-flex flex-row">
                <!---->
                <div  class="function-stack-icon">
                  <app-process-function-stack-row-icon
                    
                    _nghost-serverapp-c335782559=""
                  >
                    <fa-icon  class="ng-fa-icon">
                      ${element.img}
                    </fa-icon>
                  </app-process-function-stack-row-icon>
                  <!---->
                  <!---->
                  <!---->
                </div>
                <div
                  
                  class="function-stack-body my-auto flex-grow-1"
                >
                  <app-process-function-stack-row-body
                    
                    _nghost-serverapp-c2854308694=""
                  >
                    <div
                      
                      class="function-stack-action"
                    >
                      <div
                        
                        class="function-stack-description"
                      ></div>
                      ${element.name}
                      <!---->
                      <!---->
                    </div>
                    <div
                      
                      class="d-flex align-items-center gap-1"
                    >
                      <div
                        
                        appdebuggerpopup=""
                        class="function-stack-variable highlight"
                      >
                        <span  class="prefix"
                          >name:</span
                        >
                        <!---->
                        <input
                          id="inputVarName"
                          param="name"
                          index="${nextIndex}"
                          type="text"
                        />
                      </div>
                      <!---->
                      <!---->
                      <!---->
                      <!---->
                      <!---->
                      <!---->
                      
                      <!---->
                      <!---->
                      <!---->
                      <!---->
                      <!---->
                      
                      <!---->
                      <!---->
                      <!---->
                      <!---->
                      <!---->
                      <!---->
                      <!---->
                      <!---->
                      <!---->
                    </div>
                    <!---->
                  </app-process-function-stack-row-body>
                </div>
                <!---->
                <!---->
                <!---->
                <!---->
                <!-- Hover Actions-->
                <div
                  
                  class="function-stack-hover-actions"
                >
                  <!-- Esquerda -->
                  <div
                    
                    class="function-stack-left-actions d-flex flex-column justify-content-center"
                  >
                    <div
                      
                      class="action-icon function-stack-handle"
                    >
                      <fa-icon
                        
                        class="ng-fa-icon action-icon-icon"
                      >
                        <svg
                          role="img"
                          aria-hidden="true"
                          focusable="false"
                          data-prefix="fal"
                          data-icon="grip-vertical"
                          class="svg-inline--fa fa-grip-vertical fa-fw"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 320 512"
                        >
                          <path
                            fill="currentColor"
                            d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                          ></path>
                        </svg>
                      </fa-icon>
                    </div>
                    <!---->
                  </div>
                  <!-- Direita -->
                  <div  class="function-stack-right-actions">
                    <!-- 3 pontinhos -->
                    <div
                      
                      dropdownclass="processStackRowDropdown"
                      ngbdropdown=""
                      placement="left-top"
                      class="action-icon processStackRowDropdown dropdown"
                    >
                      <div
                        
                        ngbdropdowntoggle=""
                        class="dropdown-toggle"
                        aria-expanded="false"
                      >
                        <fa-icon
                          
                          class="ng-fa-icon action-icon-icon"
                        >
                          <svg
                            role="img"
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fal"
                            data-icon="ellipsis"
                            class="svg-inline--fa fa-ellipsis fa-fw"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512"
                          >
                            <path
                              fill="currentColor"
                              d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                            ></path>
                          </svg>
                        </fa-icon>
                      </div>
                      <!-- Edit description -->
                    </div>
                    <!--Delete-->
                    <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                      <fa-icon
                        
                        class="ng-fa-icon action-icon-icon"
                      >
                      <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="trash-can"
                      class="svg-inline--fa fa-trash-can fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path
                        fill="currentColor"
                        d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                      ></path>
                      </svg>
                      </fa-icon>
                    </div>
                    <!---->
                    <!---->
                    <!---->
                  </div>
                  
                  <!---->
                </div>
                <!---->
              </div>
              <!---->
            </div>
          </div>
        </div>
    </app-process-function-stack-row>
    <!-- Bot�o + para seguir o fluxo-->
                  <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                    <div class="add-action-icon">
                      <fa-icon class="ng-fa-icon"
                      >
                        <svg
                          role="img"
                          aria-hidden="true"
                          focusable="false"
                          data-prefix="fal"
                          data-icon="plus"
                          class="svg-inline--fa fa-plus fa-fw"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 448 512"
                        >
                          <path
                            fill="currentColor"
                            d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                          ></path>
                        </svg>
                      </fa-icon>
                    </div>
                    <!---->
                  </div>
    <!---->
    <!---->
    <!---->
    <!---->
    </app-process-function-stack-row-type-generic>`
                        break;
                    case 'if-end':
                        component = `<app-process-function-stack-row-type-generic
        
        index="${nextIndex}"
        element="${elementId}"
      >
        <app-process-function-stack-row
          
          _nghost-serverapp-c865612792=""
        >
          <div
            
            class="d-flex function-stack-row"
            id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
          >
            <div
              
              class="function-stack-index"
              style="left: 0px"
            >
              ${nextIndex}
            </div>
            <!---->
            <!---->
            <div  class="flex-grow-1 menu-padding">
              <div
                
                similarclassname="function-stack-function"
                class="d-flex diff- flex-column function-stack-function force-hover"
                data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
              >
                <div  class="d-flex flex-row">
                  <!---->
                  <div  class="function-stack-icon">
                    <app-process-function-stack-row-icon
                      
                      _nghost-serverapp-c335782559=""
                    >
                      <fa-icon  class="ng-fa-icon">
                        ${element.img}
                      </fa-icon>
                    </app-process-function-stack-row-icon>
                    <!---->
                    <!---->
                    <!---->
                  </div>
                  <div
                    
                    class="function-stack-body my-auto flex-grow-1"
                  >
                    <app-process-function-stack-row-body
                      
                      _nghost-serverapp-c2854308694=""
                    >
                      <div
                        
                        class="function-stack-action"
                      >
                        <div
                          
                          class="function-stack-description"
                        ></div>
                        ${element.name}
                        <!---->
                        <!---->
                      </div>
                      <div
                        
                        class="d-flex align-items-center gap-1"
                      >
                        <div
                          
                          appdebuggerpopup=""
                          class="function-stack-variable highlight"
                        >
                          <span  class="prefix"
                            >${element.description}</span
                          >
                          <!---->
                        </div>
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                      </div>
                      <!---->
                    </app-process-function-stack-row-body>
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!-- Hover Actions-->
                  <div
                    
                    class="function-stack-hover-actions"
                  >
                    <!-- Esquerda -->
                    <div
                      
                      class="function-stack-left-actions d-flex flex-column justify-content-center"
                    >
                      <div
                        
                        class="action-icon function-stack-handle"
                      >
                        <fa-icon
                          
                          class="ng-fa-icon action-icon-icon"
                        >
                          <svg
                            role="img"
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fal"
                            data-icon="grip-vertical"
                            class="svg-inline--fa fa-grip-vertical fa-fw"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 320 512"
                          >
                            <path
                              fill="currentColor"
                              d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                            ></path>
                          </svg>
                        </fa-icon>
                      </div>
                      <!---->
                    </div>
                    <!-- Direita -->
                    <div  class="function-stack-right-actions">
                      <!-- 3 pontinhos -->
                      <div
                        
                        dropdownclass="processStackRowDropdown"
                        ngbdropdown=""
                        placement="left-top"
                        class="action-icon processStackRowDropdown dropdown"
                      >
                        <div
                          
                          ngbdropdowntoggle=""
                          class="dropdown-toggle"
                          aria-expanded="false"
                        >
                          <fa-icon
                            
                            class="ng-fa-icon action-icon-icon"
                          >
                            <svg
                              role="img"
                              aria-hidden="true"
                              focusable="false"
                              data-prefix="fal"
                              data-icon="ellipsis"
                              class="svg-inline--fa fa-ellipsis fa-fw"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 448 512"
                            >
                              <path
                                fill="currentColor"
                                d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                              ></path>
                            </svg>
                          </fa-icon>
                        </div>
                        <!-- Edit description -->
                      </div>
                      <!--Delete-->
                      <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                        <fa-icon
                          
                          class="ng-fa-icon action-icon-icon"
                        >
                        <svg
                        role="img"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fal"
                        data-icon="trash-can"
                        class="svg-inline--fa fa-trash-can fa-fw"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="currentColor"
                          d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                        ></path>
                        </svg>
                        </fa-icon>
                      </div>
                      <!---->
                      <!---->
                      <!---->
                    </div>
                    
                    <!---->
                  </div>
                  <!---->
                </div>
                <!---->
              </div>
            </div>
          </div>
      </app-process-function-stack-row>
      <!-- Bot�o + para seguir o fluxo-->
                    <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                      <div class="add-action-icon">
                        <fa-icon class="ng-fa-icon"
                        >
                          <svg
                            role="img"
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fal"
                            data-icon="plus"
                            class="svg-inline--fa fa-plus fa-fw"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512"
                          >
                            <path
                              fill="currentColor"
                              d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                            ></path>
                          </svg>
                        </fa-icon>
                      </div>
                      <!---->
                    </div>
      <!---->
      <!---->
      <!---->
      <!---->
      </app-process-function-stack-row-type-generic>`
                        break;
                    case 'function-end':
                        component = `<app-process-function-stack-row-type-generic
            
            index="${nextIndex}"
            element="${elementId}"
          >
            <app-process-function-stack-row
              
              _nghost-serverapp-c865612792=""
            >
              <div
                
                class="d-flex function-stack-row"
                id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
              >
                <div
                  
                  class="function-stack-index"
                  style="left: 0px"
                >
                  ${nextIndex}
                </div>
                <!---->
                <!---->
                <div  class="flex-grow-1 menu-padding">
                  <div
                    
                    similarclassname="function-stack-function"
                    class="d-flex diff- flex-column function-stack-function force-hover"
                    data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
                  >
                    <div  class="d-flex flex-row">
                      <!---->
                      <div  class="function-stack-icon">
                        <app-process-function-stack-row-icon
                          
                          _nghost-serverapp-c335782559=""
                        >
                          <fa-icon  class="ng-fa-icon">
                            ${element.img}
                          </fa-icon>
                        </app-process-function-stack-row-icon>
                        <!---->
                        <!---->
                        <!---->
                      </div>
                      <div
                        
                        class="function-stack-body my-auto flex-grow-1"
                      >
                        <app-process-function-stack-row-body
                          
                          _nghost-serverapp-c2854308694=""
                        >
                          <div
                            
                            class="function-stack-action"
                          >
                            <div
                              
                              class="function-stack-description"
                            ></div>
                            ${element.name}
                            <!---->
                            <!---->
                          </div>
                          <div
                            
                            class="d-flex align-items-center gap-1"
                          >
                            <div
                              
                              appdebuggerpopup=""
                              class="function-stack-variable highlight"
                            >
                              <span  class="prefix"
                                >${element.description}</span
                              >
                              <!---->
                            </div>
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                          </div>
                          <!---->
                        </app-process-function-stack-row-body>
                      </div>
                      <!---->
                      <!---->
                      <!---->
                      <!---->
                      <!-- Hover Actions-->
                      <div
                        
                        class="function-stack-hover-actions"
                      >
                        <!-- Esquerda -->
                        <div
                          
                          class="function-stack-left-actions d-flex flex-column justify-content-center"
                        >
                          <div
                            
                            class="action-icon function-stack-handle"
                          >
                            <fa-icon
                              
                              class="ng-fa-icon action-icon-icon"
                            >
                              <svg
                                role="img"
                                aria-hidden="true"
                                focusable="false"
                                data-prefix="fal"
                                data-icon="grip-vertical"
                                class="svg-inline--fa fa-grip-vertical fa-fw"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 320 512"
                              >
                                <path
                                  fill="currentColor"
                                  d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                                ></path>
                              </svg>
                            </fa-icon>
                          </div>
                          <!---->
                        </div>
                        <!-- Direita -->
                        <div  class="function-stack-right-actions">
                          <!-- 3 pontinhos -->
                          <div
                            
                            dropdownclass="processStackRowDropdown"
                            ngbdropdown=""
                            placement="left-top"
                            class="action-icon processStackRowDropdown dropdown"
                          >
                            <div
                              
                              ngbdropdowntoggle=""
                              class="dropdown-toggle"
                              aria-expanded="false"
                            >
                              <fa-icon
                                
                                class="ng-fa-icon action-icon-icon"
                              >
                                <svg
                                  role="img"
                                  aria-hidden="true"
                                  focusable="false"
                                  data-prefix="fal"
                                  data-icon="ellipsis"
                                  class="svg-inline--fa fa-ellipsis fa-fw"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 448 512"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                                  ></path>
                                </svg>
                              </fa-icon>
                            </div>
                            <!-- Edit description -->
                          </div>
                          <!--Delete-->
                          <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                            <fa-icon
                              
                              class="ng-fa-icon action-icon-icon"
                            >
                            <svg
                            role="img"
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fal"
                            data-icon="trash-can"
                            class="svg-inline--fa fa-trash-can fa-fw"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512"
                          >
                            <path
                              fill="currentColor"
                              d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                            ></path>
                            </svg>
                            </fa-icon>
                          </div>
                          <!---->
                          <!---->
                          <!---->
                        </div>
                        
                        <!---->
                      </div>
                      <!---->
                    </div>
                    <!---->
                  </div>
                </div>
              </div>
          </app-process-function-stack-row>
          <!-- Bot�o + para seguir o fluxo-->
                        <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                          <div class="add-action-icon">
                            <fa-icon class="ng-fa-icon"
                            >
                              <svg
                                role="img"
                                aria-hidden="true"
                                focusable="false"
                                data-prefix="fal"
                                data-icon="plus"
                                class="svg-inline--fa fa-plus fa-fw"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                              >
                                <path
                                  fill="currentColor"
                                  d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                                ></path>
                              </svg>
                            </fa-icon>
                          </div>
                          <!---->
                        </div>
          <!---->
          <!---->
          <!---->
          <!---->
          </app-process-function-stack-row-type-generic>`
                        break;
                    case 'else-end':
                        component = `<app-process-function-stack-row-type-generic
              index="${nextIndex}"
              element="${elementId}"
            >
              <app-process-function-stack-row
                
                _nghost-serverapp-c865612792=""
              >
                <div
                  
                  class="d-flex function-stack-row"
                  id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
                >
                  <div
                    
                    class="function-stack-index"
                    style="left: 0px"
                  >
                    ${nextIndex}
                  </div>
                  <!---->
                  <!---->
                  <div  class="flex-grow-1 menu-padding">
                    <div
                      
                      similarclassname="function-stack-function"
                      class="d-flex diff- flex-column function-stack-function force-hover"
                      data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
                    >
                      <div  class="d-flex flex-row">
                        <!---->
                        <div  class="function-stack-icon">
                          <app-process-function-stack-row-icon
                            
                            _nghost-serverapp-c335782559=""
                          >
                            <fa-icon  class="ng-fa-icon">
                              ${element.img}
                            </fa-icon>
                          </app-process-function-stack-row-icon>
                          <!---->
                          <!---->
                          <!---->
                        </div>
                        <div
                          
                          class="function-stack-body my-auto flex-grow-1"
                        >
                          <app-process-function-stack-row-body
                            
                            _nghost-serverapp-c2854308694=""
                          >
                            <div
                              
                              class="function-stack-action"
                            >
                              <div
                                
                                class="function-stack-description"
                              ></div>
                              ${element.name}
                              <!---->
                              <!---->
                            </div>
                            <div
                              
                              class="d-flex align-items-center gap-1"
                            >
                              <div
                                
                                appdebuggerpopup=""
                                class="function-stack-variable highlight"
                              >
                                <span  class="prefix"
                                  >${element.description}</span
                                >
                                <!---->
                              </div>
                              <!---->
                              <!---->
                              <!---->
                              <!---->
                              <!---->
                              <!---->
                              
                              <!---->
                              <!---->
                              <!---->
                              <!---->
                              <!---->
                              
                              <!---->
                              <!---->
                              <!---->
                              <!---->
                              <!---->
                              <!---->
                              <!---->
                              <!---->
                              <!---->
                            </div>
                            <!---->
                          </app-process-function-stack-row-body>
                        </div>
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!-- Hover Actions-->
                        <div
                          
                          class="function-stack-hover-actions"
                        >
                          <!-- Esquerda -->
                          <div
                            
                            class="function-stack-left-actions d-flex flex-column justify-content-center"
                          >
                            <div
                              
                              class="action-icon function-stack-handle"
                            >
                              <fa-icon
                                
                                class="ng-fa-icon action-icon-icon"
                              >
                                <svg
                                  role="img"
                                  aria-hidden="true"
                                  focusable="false"
                                  data-prefix="fal"
                                  data-icon="grip-vertical"
                                  class="svg-inline--fa fa-grip-vertical fa-fw"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 320 512"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                                  ></path>
                                </svg>
                              </fa-icon>
                            </div>
                            <!---->
                          </div>
                          <!-- Direita -->
                          <div  class="function-stack-right-actions">
                            <!-- 3 pontinhos -->
                            <div
                              
                              dropdownclass="processStackRowDropdown"
                              ngbdropdown=""
                              placement="left-top"
                              class="action-icon processStackRowDropdown dropdown"
                            >
                              <div
                                
                                ngbdropdowntoggle=""
                                class="dropdown-toggle"
                                aria-expanded="false"
                              >
                                <fa-icon
                                  
                                  class="ng-fa-icon action-icon-icon"
                                >
                                  <svg
                                    role="img"
                                    aria-hidden="true"
                                    focusable="false"
                                    data-prefix="fal"
                                    data-icon="ellipsis"
                                    class="svg-inline--fa fa-ellipsis fa-fw"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 448 512"
                                  >
                                    <path
                                      fill="currentColor"
                                      d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                                    ></path>
                                  </svg>
                                </fa-icon>
                              </div>
                              <!-- Edit description -->
                            </div>
                            <!--Delete-->
                            <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                              <fa-icon
                                
                                class="ng-fa-icon action-icon-icon"
                              >
                              <svg
                              role="img"
                              aria-hidden="true"
                              focusable="false"
                              data-prefix="fal"
                              data-icon="trash-can"
                              class="svg-inline--fa fa-trash-can fa-fw"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 448 512"
                            >
                              <path
                                fill="currentColor"
                                d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                              ></path>
                              </svg>
                              </fa-icon>
                            </div>
                            <!---->
                            <!---->
                            <!---->
                          </div>
                          
                          <!---->
                        </div>
                        <!---->
                      </div>
                      <!---->
                    </div>
                  </div>
                </div>
            </app-process-function-stack-row>
            <!-- Bot�o + para seguir o fluxo-->
                          <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                            <div class="add-action-icon">
                              <fa-icon class="ng-fa-icon"
                              >
                                <svg
                                  role="img"
                                  aria-hidden="true"
                                  focusable="false"
                                  data-prefix="fal"
                                  data-icon="plus"
                                  class="svg-inline--fa fa-plus fa-fw"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 448 512"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                                  ></path>
                                </svg>
                              </fa-icon>
                            </div>
                            <!---->
                          </div>
            <!---->
            <!---->
            <!---->
            <!---->
            </app-process-function-stack-row-type-generic>`
                        break;
                    case 'else-start':
                        component = `<app-process-function-stack-row-type-generic
                index="${nextIndex}"
                element="${elementId}"
              >
                <app-process-function-stack-row
                  
                  _nghost-serverapp-c865612792=""
                >
                  <div
                    
                    class="d-flex function-stack-row"
                    id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
                  >
                    <div
                      
                      class="function-stack-index"
                      style="left: 0px"
                    >
                      ${nextIndex}
                    </div>
                    <!---->
                    <!---->
                    <div  class="flex-grow-1 menu-padding">
                      <div
                        
                        similarclassname="function-stack-function"
                        class="d-flex diff- flex-column function-stack-function force-hover"
                        data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
                      >
                        <div  class="d-flex flex-row">
                          <!---->
                          <div  class="function-stack-icon">
                            <app-process-function-stack-row-icon
                              
                              _nghost-serverapp-c335782559=""
                            >
                              <fa-icon  class="ng-fa-icon">
                                ${element.img}
                              </fa-icon>
                            </app-process-function-stack-row-icon>
                            <!---->
                            <!---->
                            <!---->
                          </div>
                          <div
                            
                            class="function-stack-body my-auto flex-grow-1"
                          >
                            <app-process-function-stack-row-body
                              
                              _nghost-serverapp-c2854308694=""
                            >
                              <div
                                
                                class="function-stack-action"
                              >
                                <div
                                  
                                  class="function-stack-description"
                                ></div>
                                ${element.name}
                                <!---->
                                <!---->
                              </div>
                              <div
                                
                                class="d-flex align-items-center gap-1"
                              >
                                <div
                                  
                                  appdebuggerpopup=""
                                  class="function-stack-variable highlight"
                                >
                                  <span  class="prefix"
                                    >${element.description}</span
                                  >
                                  <!---->
                                </div>
                                <!---->
                                <!---->
                                <!---->
                                <!---->
                                <!---->
                                <!---->
                                
                                <!---->
                                <!---->
                                <!---->
                                <!---->
                                <!---->
                                
                                <!---->
                                <!---->
                                <!---->
                                <!---->
                                <!---->
                                <!---->
                                <!---->
                                <!---->
                                <!---->
                              </div>
                              <!---->
                            </app-process-function-stack-row-body>
                          </div>
                          <!---->
                          <!---->
                          <!---->
                          <!---->
                          <!-- Hover Actions-->
                          <div
                            
                            class="function-stack-hover-actions"
                          >
                            <!-- Esquerda -->
                            <div
                              
                              class="function-stack-left-actions d-flex flex-column justify-content-center"
                            >
                              <div
                                
                                class="action-icon function-stack-handle"
                              >
                                <fa-icon
                                  
                                  class="ng-fa-icon action-icon-icon"
                                >
                                  <svg
                                    role="img"
                                    aria-hidden="true"
                                    focusable="false"
                                    data-prefix="fal"
                                    data-icon="grip-vertical"
                                    class="svg-inline--fa fa-grip-vertical fa-fw"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 320 512"
                                  >
                                    <path
                                      fill="currentColor"
                                      d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                                    ></path>
                                  </svg>
                                </fa-icon>
                              </div>
                              <!---->
                            </div>
                            <!-- Direita -->
                            <div  class="function-stack-right-actions">
                              <!-- 3 pontinhos -->
                              <div
                                
                                dropdownclass="processStackRowDropdown"
                                ngbdropdown=""
                                placement="left-top"
                                class="action-icon processStackRowDropdown dropdown"
                              >
                                <div
                                  
                                  ngbdropdowntoggle=""
                                  class="dropdown-toggle"
                                  aria-expanded="false"
                                >
                                  <fa-icon
                                    
                                    class="ng-fa-icon action-icon-icon"
                                  >
                                    <svg
                                      role="img"
                                      aria-hidden="true"
                                      focusable="false"
                                      data-prefix="fal"
                                      data-icon="ellipsis"
                                      class="svg-inline--fa fa-ellipsis fa-fw"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 448 512"
                                    >
                                      <path
                                        fill="currentColor"
                                        d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                                      ></path>
                                    </svg>
                                  </fa-icon>
                                </div>
                                <!-- Edit description -->
                              </div>
                              <!--Delete-->
                              <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                                <fa-icon
                                  
                                  class="ng-fa-icon action-icon-icon"
                                >
                                <svg
                                role="img"
                                aria-hidden="true"
                                focusable="false"
                                data-prefix="fal"
                                data-icon="trash-can"
                                class="svg-inline--fa fa-trash-can fa-fw"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                              >
                                <path
                                  fill="currentColor"
                                  d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                                ></path>
                                </svg>
                                </fa-icon>
                              </div>
                              <!---->
                              <!---->
                              <!---->
                            </div>
                            
                            <!---->
                          </div>
                          <!---->
                        </div>
                        <!---->
                      </div>
                    </div>
                  </div>
              </app-process-function-stack-row>
              <!-- Bot�o + para seguir o fluxo-->
                            <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                              <div class="add-action-icon">
                                <fa-icon class="ng-fa-icon"
                                >
                                  <svg
                                    role="img"
                                    aria-hidden="true"
                                    focusable="false"
                                    data-prefix="fal"
                                    data-icon="plus"
                                    class="svg-inline--fa fa-plus fa-fw"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 448 512"
                                  >
                                    <path
                                      fill="currentColor"
                                      d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                                    ></path>
                                  </svg>
                                </fa-icon>
                              </div>
                              <!---->
                            </div>
              <!---->
              <!---->
              <!---->
              <!---->
              </app-process-function-stack-row-type-generic>`
                        break;
                    case 'function-start':
                        component = `<app-process-function-stack-row-type-generic
        
        index="${nextIndex}"
        element="${elementId}"
      >
        <app-process-function-stack-row
          
          _nghost-serverapp-c865612792=""
        >
          <div
            
            class="d-flex function-stack-row"
            id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
          >
            <div
              
              class="function-stack-index"
              style="left: 0px"
            >
              ${nextIndex}
            </div>
            <!---->
            <!---->
            <div  class="flex-grow-1 menu-padding">
              <div
                
                similarclassname="function-stack-function"
                class="d-flex diff- flex-column function-stack-function force-hover"
                data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
              >
                <div  class="d-flex flex-row">
                  <!---->
                  <div  class="function-stack-icon">
                    <app-process-function-stack-row-icon
                      
                      _nghost-serverapp-c335782559=""
                    >
                      <fa-icon  class="ng-fa-icon">
                        ${element.img}
                      </fa-icon>
                    </app-process-function-stack-row-icon>
                    <!---->
                    <!---->
                    <!---->
                  </div>
                  <div
                    
                    class="function-stack-body my-auto flex-grow-1"
                  >
                    <app-process-function-stack-row-body
                      
                      _nghost-serverapp-c2854308694=""
                    >
                      <div
                        
                        class="function-stack-action"
                      >
                        <div
                          
                          class="function-stack-description"
                        ></div>
                        ${element.name}
                        <!---->
                        <!---->
                      </div>
                      <div
                        
                        class="d-flex align-items-center gap-1"
                      >
                        <div
                          
                          appdebuggerpopup=""
                          class="function-stack-variable highlight"
                        >
                          <span  class="prefix"
                            >define:</span
                          >
                          <!---->
                          <input
                            id="inputVarDefine"
                            param="define"
                            index="${nextIndex}"
                            type="text"
                          />
                        </div>
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                      </div>
                      <!---->
                    </app-process-function-stack-row-body>
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!-- Hover Actions-->
                  <div
                    
                    class="function-stack-hover-actions"
                  >
                    <!-- Esquerda -->
                    <div
                      
                      class="function-stack-left-actions d-flex flex-column justify-content-center"
                    >
                      <div
                        
                        class="action-icon function-stack-handle"
                      >
                        <fa-icon
                          
                          class="ng-fa-icon action-icon-icon"
                        >
                          <svg
                            role="img"
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fal"
                            data-icon="grip-vertical"
                            class="svg-inline--fa fa-grip-vertical fa-fw"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 320 512"
                          >
                            <path
                              fill="currentColor"
                              d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                            ></path>
                          </svg>
                        </fa-icon>
                      </div>
                      <!---->
                    </div>
                    <!-- Direita -->
                    <div  class="function-stack-right-actions">
                      <!-- 3 pontinhos -->
                      <div
                        
                        dropdownclass="processStackRowDropdown"
                        ngbdropdown=""
                        placement="left-top"
                        class="action-icon processStackRowDropdown dropdown"
                      >
                        <div
                          
                          ngbdropdowntoggle=""
                          class="dropdown-toggle"
                          aria-expanded="false"
                        >
                          <fa-icon
                            
                            class="ng-fa-icon action-icon-icon"
                          >
                            <svg
                              role="img"
                              aria-hidden="true"
                              focusable="false"
                              data-prefix="fal"
                              data-icon="ellipsis"
                              class="svg-inline--fa fa-ellipsis fa-fw"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 448 512"
                            >
                              <path
                                fill="currentColor"
                                d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                              ></path>
                            </svg>
                          </fa-icon>
                        </div>
                        <!-- Edit description -->
                      </div>
                      <!--Delete-->
                      <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                        <fa-icon
                          
                          class="ng-fa-icon action-icon-icon"
                        >
                        <svg
                        role="img"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fal"
                        data-icon="trash-can"
                        class="svg-inline--fa fa-trash-can fa-fw"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="currentColor"
                          d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                        ></path>
                        </svg>
                        </fa-icon>
                      </div>
                      <!---->
                      <!---->
                      <!---->
                    </div>
                    
                    <!---->
                  </div>
                  <!---->
                </div>
                <!---->
              </div>
            </div>
          </div>
      </app-process-function-stack-row>
      <!-- Bot�o + para seguir o fluxo-->
                    <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                      <div class="add-action-icon">
                        <fa-icon class="ng-fa-icon"
                        >
                          <svg
                            role="img"
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fal"
                            data-icon="plus"
                            class="svg-inline--fa fa-plus fa-fw"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512"
                          >
                            <path
                              fill="currentColor"
                              d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                            ></path>
                          </svg>
                        </fa-icon>
                      </div>
                      <!---->
                    </div>
      <!---->
      <!---->
      <!---->
      <!---->
      </app-process-function-stack-row-type-generic>`
                        break;
                    case 'if-start':
                        component = `<app-process-function-stack-row-type-generic
          index="${nextIndex}"
          element="${elementId}"
        >
          <app-process-function-stack-row
            
            _nghost-serverapp-c865612792=""
          >
            <div
              
              class="d-flex function-stack-row"
              id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
            >
              <div
                
                class="function-stack-index"
                style="left: 0px"
              >
                ${nextIndex}
              </div>
              <!---->
              <!---->
              <div  class="flex-grow-1 menu-padding">
                <div
                  
                  similarclassname="function-stack-function"
                  class="d-flex diff- flex-column function-stack-function force-hover"
                  data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
                >
                  <div  class="d-flex flex-row">
                    <!---->
                    <div  class="function-stack-icon">
                      <app-process-function-stack-row-icon
                        
                        _nghost-serverapp-c335782559=""
                      >
                        <fa-icon  class="ng-fa-icon">
                          ${element.img}
                        </fa-icon>
                      </app-process-function-stack-row-icon>
                      <!---->
                      <!---->
                      <!---->
                    </div>
                    <div
                      
                      class="function-stack-body my-auto flex-grow-1"
                    >
                      <app-process-function-stack-row-body
                        
                        _nghost-serverapp-c2854308694=""
                      >
                        <div
                          
                          class="function-stack-action"
                        >
                          <div
                            
                            class="function-stack-description"
                          ></div>
                          ${element.name}
                          <!---->
                          <!---->
                        </div>
                        <div
                          
                          class="d-flex align-items-center gap-1"
                        >
                          <div
                            
                            appdebuggerpopup=""
                            class="function-stack-variable highlight"
                          >
                            <span  class="prefix"
                              >var:</span
                            >
                            <!---->
                            <input
                              id="inputVarCond"
                              param="cond"
                              index="${nextIndex}"
                              type="text"
                            />
                          </div>
                          <!---->
                          <!---->
                          <!---->
                          <!---->
                          <!---->
                          <!---->
                          <div
                            
                            class="d-inline-block function-stack-variable"
                          ><select id="selectVarCond" param="cond" index="${nextIndex}">
                          <option value="==">==</>
                          <option value="!=">!=</>
                          </select>
                          </div>
                          <!---->
                          <!---->
                          <!---->
                          <!---->
                          <!---->
                          <div
                            
                            appdebuggerpopup=""
                            class="function-stack-variable highlight"
                          >
                            <div class="d-flex">
                              <span class="prefix"></span
                              >true
                              <span class="filter" title=""></span>
                            </div>
                          </div>
                          <!---->
                          <!---->
                          <!---->
                          <!---->
                          <!---->
                          <!---->
                          <!---->
                          <!---->
                          <!---->
                        </div>
                        <!---->
                      </app-process-function-stack-row-body>
                    </div>
                    <!---->
                    <!---->
                    <!---->
                    <!---->
                    <!-- Hover Actions-->
                    <div
                      
                      class="function-stack-hover-actions"
                    >
                      <!-- Esquerda -->
                      <div
                        
                        class="function-stack-left-actions d-flex flex-column justify-content-center"
                      >
                        <div
                          
                          class="action-icon function-stack-handle"
                        >
                          <fa-icon
                            
                            class="ng-fa-icon action-icon-icon"
                          >
                            <svg
                              role="img"
                              aria-hidden="true"
                              focusable="false"
                              data-prefix="fal"
                              data-icon="grip-vertical"
                              class="svg-inline--fa fa-grip-vertical fa-fw"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 320 512"
                            >
                              <path
                                fill="currentColor"
                                d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                              ></path>
                            </svg>
                          </fa-icon>
                        </div>
                        <!---->
                      </div>
                      <!-- Direita -->
                      <div  class="function-stack-right-actions">
                        <!-- 3 pontinhos -->
                        <div
                          
                          dropdownclass="processStackRowDropdown"
                          ngbdropdown=""
                          placement="left-top"
                          class="action-icon processStackRowDropdown dropdown"
                        >
                          <div
                            
                            ngbdropdowntoggle=""
                            class="dropdown-toggle"
                            aria-expanded="false"
                          >
                            <fa-icon
                              
                              class="ng-fa-icon action-icon-icon"
                            >
                              <svg
                                role="img"
                                aria-hidden="true"
                                focusable="false"
                                data-prefix="fal"
                                data-icon="ellipsis"
                                class="svg-inline--fa fa-ellipsis fa-fw"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                              >
                                <path
                                  fill="currentColor"
                                  d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                                ></path>
                              </svg>
                            </fa-icon>
                          </div>
                          <!-- Edit description -->
                        </div>
                        <!--Delete-->
                        <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                          <fa-icon
                            
                            class="ng-fa-icon action-icon-icon"
                          >
                          <svg
                          role="img"
                          aria-hidden="true"
                          focusable="false"
                          data-prefix="fal"
                          data-icon="trash-can"
                          class="svg-inline--fa fa-trash-can fa-fw"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 448 512"
                        >
                          <path
                            fill="currentColor"
                            d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                          ></path>
                          </svg>
                          </fa-icon>
                        </div>
                        <!---->
                        <!---->
                        <!---->
                      </div>
                      
                      <!---->
                    </div>
                    <!---->
                  </div>
                  <!---->
                </div>
              </div>
            </div>
        </app-process-function-stack-row>
        <!-- Bot�o + para seguir o fluxo-->
                      <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                        <div class="add-action-icon">
                          <fa-icon class="ng-fa-icon"
                          >
                            <svg
                              role="img"
                              aria-hidden="true"
                              focusable="false"
                              data-prefix="fal"
                              data-icon="plus"
                              class="svg-inline--fa fa-plus fa-fw"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 448 512"
                            >
                              <path
                                fill="currentColor"
                                d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                              ></path>
                            </svg>
                          </fa-icon>
                        </div>
                        <!---->
                      </div>
        <!---->
        <!---->
        <!---->
        <!---->
        </app-process-function-stack-row-type-generic>`
                        break;
                    case 'while-start':
                        component = `<app-process-function-stack-row-type-generic
            index="${nextIndex}"
            element="${elementId}"
          >
            <app-process-function-stack-row
              
              _nghost-serverapp-c865612792=""
            >
              <div
                
                class="d-flex function-stack-row"
                id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
              >
                <div
                  
                  class="function-stack-index"
                  style="left: 0px"
                >
                  ${nextIndex}
                </div>
                <!---->
                <!---->
                <div  class="flex-grow-1 menu-padding">
                  <div
                    
                    similarclassname="function-stack-function"
                    class="d-flex diff- flex-column function-stack-function force-hover"
                    data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
                  >
                    <div  class="d-flex flex-row">
                      <!---->
                      <div  class="function-stack-icon">
                        <app-process-function-stack-row-icon
                          
                          _nghost-serverapp-c335782559=""
                        >
                          <fa-icon  class="ng-fa-icon">
                            ${element.img}
                          </fa-icon>
                        </app-process-function-stack-row-icon>
                        <!---->
                        <!---->
                        <!---->
                      </div>
                      <div
                        
                        class="function-stack-body my-auto flex-grow-1"
                      >
                        <app-process-function-stack-row-body
                          
                          _nghost-serverapp-c2854308694=""
                        >
                          <div
                            
                            class="function-stack-action"
                          >
                            <div
                              
                              class="function-stack-description"
                            ></div>
                            ${element.name}
                            <!---->
                            <!---->
                          </div>
                          <div
                            
                            class="d-flex align-items-center gap-1"
                          >
                            <div
                              
                              appdebuggerpopup=""
                              class="function-stack-variable highlight"
                            >
                              <span  class="prefix"
                                >var:</span
                              >
                              <!---->
                              <input
                                id="inputVarCond"
                                param="cond"
                                index="${nextIndex}"
                                type="text"
                              />
                            </div>
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <div
                              
                              class="d-inline-block function-stack-variable"
                            ><select id="selectVarCond" param="cond" index="${nextIndex}">
                            <option value="==">==</>
                            <option value="!=">!=</>
                            </select>
                            </div>
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <div
                              
                              appdebuggerpopup=""
                              class="function-stack-variable highlight"
                            >
                              <div class="d-flex">
                                <span class="prefix"></span
                                >true
                                <span class="filter" title=""></span>
                              </div>
                            </div>
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                          </div>
                          <!---->
                        </app-process-function-stack-row-body>
                      </div>
                      <!---->
                      <!---->
                      <!---->
                      <!---->
                      <!-- Hover Actions-->
                      <div
                        
                        class="function-stack-hover-actions"
                      >
                        <!-- Esquerda -->
                        <div
                          
                          class="function-stack-left-actions d-flex flex-column justify-content-center"
                        >
                          <div
                            
                            class="action-icon function-stack-handle"
                          >
                            <fa-icon
                              
                              class="ng-fa-icon action-icon-icon"
                            >
                              <svg
                                role="img"
                                aria-hidden="true"
                                focusable="false"
                                data-prefix="fal"
                                data-icon="grip-vertical"
                                class="svg-inline--fa fa-grip-vertical fa-fw"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 320 512"
                              >
                                <path
                                  fill="currentColor"
                                  d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                                ></path>
                              </svg>
                            </fa-icon>
                          </div>
                          <!---->
                        </div>
                        <!-- Direita -->
                        <div  class="function-stack-right-actions">
                          <!-- 3 pontinhos -->
                          <div
                            
                            dropdownclass="processStackRowDropdown"
                            ngbdropdown=""
                            placement="left-top"
                            class="action-icon processStackRowDropdown dropdown"
                          >
                            <div
                              
                              ngbdropdowntoggle=""
                              class="dropdown-toggle"
                              aria-expanded="false"
                            >
                              <fa-icon
                                
                                class="ng-fa-icon action-icon-icon"
                              >
                                <svg
                                  role="img"
                                  aria-hidden="true"
                                  focusable="false"
                                  data-prefix="fal"
                                  data-icon="ellipsis"
                                  class="svg-inline--fa fa-ellipsis fa-fw"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 448 512"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                                  ></path>
                                </svg>
                              </fa-icon>
                            </div>
                            <!-- Edit description -->
                          </div>
                          <!--Delete-->
                          <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                            <fa-icon
                              
                              class="ng-fa-icon action-icon-icon"
                            >
                            <svg
                            role="img"
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fal"
                            data-icon="trash-can"
                            class="svg-inline--fa fa-trash-can fa-fw"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512"
                          >
                            <path
                              fill="currentColor"
                              d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                            ></path>
                            </svg>
                            </fa-icon>
                          </div>
                          <!---->
                          <!---->
                          <!---->
                        </div>
                        
                        <!---->
                      </div>
                      <!---->
                    </div>
                    <!---->
                  </div>
                </div>
              </div>
          </app-process-function-stack-row>
          <!-- Bot�o + para seguir o fluxo-->
                        <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                          <div class="add-action-icon">
                            <fa-icon class="ng-fa-icon"
                            >
                              <svg
                                role="img"
                                aria-hidden="true"
                                focusable="false"
                                data-prefix="fal"
                                data-icon="plus"
                                class="svg-inline--fa fa-plus fa-fw"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                              >
                                <path
                                  fill="currentColor"
                                  d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                                ></path>
                              </svg>
                            </fa-icon>
                          </div>
                          <!---->
                        </div>
          <!---->
          <!---->
          <!---->
          <!---->
          </app-process-function-stack-row-type-generic>`
                        break;
                    case 'while-end':
                        component = `<app-process-function-stack-row-type-generic
                index="${nextIndex}"
                element="${elementId}"
              >
                <app-process-function-stack-row
                  
                  _nghost-serverapp-c865612792=""
                >
                  <div
                    
                    class="d-flex function-stack-row"
                    id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
                  >
                    <div
                      
                      class="function-stack-index"
                      style="left: 0px"
                    >
                      ${nextIndex}
                    </div>
                    <!---->
                    <!---->
                    <div  class="flex-grow-1 menu-padding">
                      <div
                        
                        similarclassname="function-stack-function"
                        class="d-flex diff- flex-column function-stack-function force-hover"
                        data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
                      >
                        <div  class="d-flex flex-row">
                          <!---->
                          <div  class="function-stack-icon">
                            <app-process-function-stack-row-icon
                              
                              _nghost-serverapp-c335782559=""
                            >
                              <fa-icon  class="ng-fa-icon">
                                ${element.img}
                              </fa-icon>
                            </app-process-function-stack-row-icon>
                            <!---->
                            <!---->
                            <!---->
                          </div>
                          <div
                            
                            class="function-stack-body my-auto flex-grow-1"
                          >
                            <app-process-function-stack-row-body
                              
                              _nghost-serverapp-c2854308694=""
                            >
                              <div
                                
                                class="function-stack-action"
                              >
                                <div
                                  
                                  class="function-stack-description"
                                ></div>
                                ${element.name}
                                <!---->
                                <!---->
                              </div>
                              <div
                                
                                class="d-flex align-items-center gap-1"
                              >
                                <div
                                  
                                  appdebuggerpopup=""
                                  class="function-stack-variable highlight"
                                >
                                  <span  class="prefix"
                                    >${element.description}</span
                                  >
                                  <!---->
                                </div>
                                <!---->
                                <!---->
                                <!---->
                                <!---->
                                <!---->
                                <!---->
                                
                                <!---->
                                <!---->
                                <!---->
                                <!---->
                                <!---->
                                
                                <!---->
                                <!---->
                                <!---->
                                <!---->
                                <!---->
                                <!---->
                                <!---->
                                <!---->
                                <!---->
                              </div>
                              <!---->
                            </app-process-function-stack-row-body>
                          </div>
                          <!---->
                          <!---->
                          <!---->
                          <!---->
                          <!-- Hover Actions-->
                          <div
                            
                            class="function-stack-hover-actions"
                          >
                            <!-- Esquerda -->
                            <div
                              
                              class="function-stack-left-actions d-flex flex-column justify-content-center"
                            >
                              <div
                                
                                class="action-icon function-stack-handle"
                              >
                                <fa-icon
                                  
                                  class="ng-fa-icon action-icon-icon"
                                >
                                  <svg
                                    role="img"
                                    aria-hidden="true"
                                    focusable="false"
                                    data-prefix="fal"
                                    data-icon="grip-vertical"
                                    class="svg-inline--fa fa-grip-vertical fa-fw"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 320 512"
                                  >
                                    <path
                                      fill="currentColor"
                                      d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                                    ></path>
                                  </svg>
                                </fa-icon>
                              </div>
                              <!---->
                            </div>
                            <!-- Direita -->
                            <div  class="function-stack-right-actions">
                              <!-- 3 pontinhos -->
                              <div
                                
                                dropdownclass="processStackRowDropdown"
                                ngbdropdown=""
                                placement="left-top"
                                class="action-icon processStackRowDropdown dropdown"
                              >
                                <div
                                  
                                  ngbdropdowntoggle=""
                                  class="dropdown-toggle"
                                  aria-expanded="false"
                                >
                                  <fa-icon
                                    
                                    class="ng-fa-icon action-icon-icon"
                                  >
                                    <svg
                                      role="img"
                                      aria-hidden="true"
                                      focusable="false"
                                      data-prefix="fal"
                                      data-icon="ellipsis"
                                      class="svg-inline--fa fa-ellipsis fa-fw"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 448 512"
                                    >
                                      <path
                                        fill="currentColor"
                                        d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                                      ></path>
                                    </svg>
                                  </fa-icon>
                                </div>
                                <!-- Edit description -->
                              </div>
                              <!--Delete-->
                              <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                                <fa-icon
                                  
                                  class="ng-fa-icon action-icon-icon"
                                >
                                <svg
                                role="img"
                                aria-hidden="true"
                                focusable="false"
                                data-prefix="fal"
                                data-icon="trash-can"
                                class="svg-inline--fa fa-trash-can fa-fw"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                              >
                                <path
                                  fill="currentColor"
                                  d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                                ></path>
                                </svg>
                                </fa-icon>
                              </div>
                              <!---->
                              <!---->
                              <!---->
                            </div>
                            
                            <!---->
                          </div>
                          <!---->
                        </div>
                        <!---->
                      </div>
                    </div>
                  </div>
              </app-process-function-stack-row>
              <!-- Bot�o + para seguir o fluxo-->
                            <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                              <div class="add-action-icon">
                                <fa-icon class="ng-fa-icon"
                                >
                                  <svg
                                    role="img"
                                    aria-hidden="true"
                                    focusable="false"
                                    data-prefix="fal"
                                    data-icon="plus"
                                    class="svg-inline--fa fa-plus fa-fw"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 448 512"
                                  >
                                    <path
                                      fill="currentColor"
                                      d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                                    ></path>
                                  </svg>
                                </fa-icon>
                              </div>
                              <!---->
                            </div>
              <!---->
              <!---->
              <!---->
              <!---->
              </app-process-function-stack-row-type-generic>`
                        break;
                    case 'lib-enc':
                        component = `<app-process-function-stack-row-type-generic
  
  index="${nextIndex}"
  element="${elementId}"
>
  <app-process-function-stack-row
    
    _nghost-serverapp-c865612792=""
  >
    <div
      
      class="d-flex function-stack-row"
      id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
    >
      <div
        
        class="function-stack-index"
        style="left: 0px"
      >
        ${nextIndex}
      </div>
      <!---->
      <!---->
      <div  class="flex-grow-1 menu-padding">
        <div
          
          similarclassname="function-stack-function"
          class="d-flex diff- flex-column function-stack-function force-hover"
          data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
        >
          <div  class="d-flex flex-row">
            <!---->
            <div  class="function-stack-icon">
              <app-process-function-stack-row-icon
                
                _nghost-serverapp-c335782559=""
              >
                <fa-icon  class="ng-fa-icon">
                  ${element.img}
                </fa-icon>
              </app-process-function-stack-row-icon>
              <!---->
              <!---->
              <!---->
            </div>
            <div
              
              class="function-stack-body my-auto flex-grow-1"
            >
              <app-process-function-stack-row-body
                
                _nghost-serverapp-c2854308694=""
              >
                <div
                  
                  class="function-stack-action"
                >
                  <div
                    
                    class="function-stack-description"
                  ></div>
                  ${element.name}
                  <!---->
                  <!---->
                </div>
                <div
                  
                  class="d-flex align-items-center gap-1"
                >
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <span  class="prefix"
                      >var:</span
                    >
                    <!---->
                    <input
                      id="inputVarName"
                      param="strig-out"
                      index="${nextIndex}"
                      type="text"
                    />
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    class="d-inline-block function-stack-variable"
                  >
                    =
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <div class="d-flex">
                      <span class="prefix"></span
                      ><input id="inputVarValue" type="text" param="string" class="value" />
                      <span class="filter" title=""></span>
                    </div>
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                </div>
                <!---->
              </app-process-function-stack-row-body>
            </div>
            <!---->
            <!---->
            <!---->
            <div
              
              class="text-end function-stack-return align-self-center"
            >
              retorna como
              <span
                
                id="highlight-variable"
                appdebuggerpopup=""
                class="highlight-variable"
              ></span>
              <!---->
            </div>
            <!---->
            <!-- Hover Actions-->
            <div
              
              class="function-stack-hover-actions"
            >
              <!-- Esquerda -->
              <div
                
                class="function-stack-left-actions d-flex flex-column justify-content-center"
              >
                <div
                  
                  class="action-icon function-stack-handle"
                >
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="grip-vertical"
                      class="svg-inline--fa fa-grip-vertical fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 320 512"
                    >
                      <path
                        fill="currentColor"
                        d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
              <!-- Direita -->
              <div  class="function-stack-right-actions">
                <!-- 3 pontinhos -->
                <div
                  
                  dropdownclass="processStackRowDropdown"
                  ngbdropdown=""
                  placement="left-top"
                  class="action-icon processStackRowDropdown dropdown"
                >
                  <div
                    
                    ngbdropdowntoggle=""
                    class="dropdown-toggle"
                    aria-expanded="false"
                  >
                    <fa-icon
                      
                      class="ng-fa-icon action-icon-icon"
                    >
                      <svg
                        role="img"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fal"
                        data-icon="ellipsis"
                        class="svg-inline--fa fa-ellipsis fa-fw"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="currentColor"
                          d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                        ></path>
                      </svg>
                    </fa-icon>
                  </div>
                  <!-- Edit description -->
                </div>
                <!--Delete-->
                <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                  <svg
                  role="img"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="trash-can"
                  class="svg-inline--fa fa-trash-can fa-fw"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path
                    fill="currentColor"
                    d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                  ></path>
                  </svg>
                  </fa-icon>
                </div>
                <!---->
                <!---->
                <!---->
              </div>
              
              <!---->
            </div>
            <!---->
          </div>
          <!---->
        </div>
      </div>
    </div>
</app-process-function-stack-row>
<!-- Bot�o + para seguir o fluxo-->
              <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                <div class="add-action-icon">
                  <fa-icon class="ng-fa-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="plus"
                      class="svg-inline--fa fa-plus fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path
                        fill="currentColor"
                        d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
<!---->
<!---->
<!---->
<!---->
</app-process-function-stack-row-type-generic>`
                        break;
                    case 'lib-dec':
                        component = `<app-process-function-stack-row-type-generic
  
  index="${nextIndex}"
  element="${elementId}"
>
  <app-process-function-stack-row
    
    _nghost-serverapp-c865612792=""
  >
    <div
      
      class="d-flex function-stack-row"
      id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
    >
      <div
        
        class="function-stack-index"
        style="left: 0px"
      >
        ${nextIndex}
      </div>
      <!---->
      <!---->
      <div  class="flex-grow-1 menu-padding">
        <div
          
          similarclassname="function-stack-function"
          class="d-flex diff- flex-column function-stack-function force-hover"
          data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
        >
          <div  class="d-flex flex-row">
            <!---->
            <div  class="function-stack-icon">
              <app-process-function-stack-row-icon
                
                _nghost-serverapp-c335782559=""
              >
                <fa-icon  class="ng-fa-icon">
                  ${element.img}
                </fa-icon>
              </app-process-function-stack-row-icon>
              <!---->
              <!---->
              <!---->
            </div>
            <div
              
              class="function-stack-body my-auto flex-grow-1"
            >
              <app-process-function-stack-row-body
                
                _nghost-serverapp-c2854308694=""
              >
                <div
                  
                  class="function-stack-action"
                >
                  <div
                    
                    class="function-stack-description"
                  ></div>
                  ${element.name}
                  <!---->
                  <!---->
                </div>
                <div
                  
                  class="d-flex align-items-center gap-1"
                >
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <span  class="prefix"
                      >var:</span
                    >
                    <!---->
                    <input
                      id="inputVarName"
                      param="strig-out"
                      index="${nextIndex}"
                      type="text"
                    />
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    class="d-inline-block function-stack-variable"
                  >
                    =
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <div class="d-flex">
                      <span class="prefix"></span
                      ><input id="inputVarValue" type="text" param="string" class="value" />
                      <span class="filter" title=""></span>
                    </div>
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                </div>
                <!---->
              </app-process-function-stack-row-body>
            </div>
            <!---->
            <!---->
            <!---->
            <div
              
              class="text-end function-stack-return align-self-center"
            >
              retorna como
              <span
                
                id="highlight-variable"
                appdebuggerpopup=""
                class="highlight-variable"
              ></span>
              <!---->
            </div>
            <!---->
            <!-- Hover Actions-->
            <div
              
              class="function-stack-hover-actions"
            >
              <!-- Esquerda -->
              <div
                
                class="function-stack-left-actions d-flex flex-column justify-content-center"
              >
                <div
                  
                  class="action-icon function-stack-handle"
                >
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="grip-vertical"
                      class="svg-inline--fa fa-grip-vertical fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 320 512"
                    >
                      <path
                        fill="currentColor"
                        d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
              <!-- Direita -->
              <div  class="function-stack-right-actions">
                <!-- 3 pontinhos -->
                <div
                  
                  dropdownclass="processStackRowDropdown"
                  ngbdropdown=""
                  placement="left-top"
                  class="action-icon processStackRowDropdown dropdown"
                >
                  <div
                    
                    ngbdropdowntoggle=""
                    class="dropdown-toggle"
                    aria-expanded="false"
                  >
                    <fa-icon
                      
                      class="ng-fa-icon action-icon-icon"
                    >
                      <svg
                        role="img"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fal"
                        data-icon="ellipsis"
                        class="svg-inline--fa fa-ellipsis fa-fw"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="currentColor"
                          d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                        ></path>
                      </svg>
                    </fa-icon>
                  </div>
                  <!-- Edit description -->
                </div>
                <!--Delete-->
                <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                  <svg
                  role="img"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="trash-can"
                  class="svg-inline--fa fa-trash-can fa-fw"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path
                    fill="currentColor"
                    d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                  ></path>
                  </svg>
                  </fa-icon>
                </div>
                <!---->
                <!---->
                <!---->
              </div>
              
              <!---->
            </div>
            <!---->
          </div>
          <!---->
        </div>
      </div>
    </div>
</app-process-function-stack-row>
<!-- Bot�o + para seguir o fluxo-->
              <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                <div class="add-action-icon">
                  <fa-icon class="ng-fa-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="plus"
                      class="svg-inline--fa fa-plus fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path
                        fill="currentColor"
                        d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
<!---->
<!---->
<!---->
<!---->
</app-process-function-stack-row-type-generic>`
                        break;
                    case 'lib-strcat':
                        component = `<app-process-function-stack-row-type-generic
  
  index="${nextIndex}"
  element="${elementId}"
>
  <app-process-function-stack-row
    
    _nghost-serverapp-c865612792=""
  >
    <div
      
      class="d-flex function-stack-row"
      id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
    >
      <div
        
        class="function-stack-index"
        style="left: 0px"
      >
        ${nextIndex}
      </div>
      <!---->
      <!---->
      <div  class="flex-grow-1 menu-padding">
        <div
          
          similarclassname="function-stack-function"
          class="d-flex diff- flex-column function-stack-function force-hover"
          data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
        >
          <div  class="d-flex flex-row">
            <!---->
            <div  class="function-stack-icon">
              <app-process-function-stack-row-icon
                
                _nghost-serverapp-c335782559=""
              >
                <fa-icon  class="ng-fa-icon">
                  ${element.img}
                </fa-icon>
              </app-process-function-stack-row-icon>
              <!---->
              <!---->
              <!---->
            </div>
            <div
              
              class="function-stack-body my-auto flex-grow-1"
            >
              <app-process-function-stack-row-body
                
                _nghost-serverapp-c2854308694=""
              >
                <div
                  
                  class="function-stack-action"
                >
                  <div
                    
                    class="function-stack-description"
                  ></div>
                  ${element.name}
                  <!---->
                  <!---->
                </div>
                <div
                  
                  class="d-flex align-items-center gap-1"
                >
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <span  class="prefix"
                      >var:</span
                    >
                    <!---->
                    <input
                      id="inputVarName"
                      param="out-string"
                      index="${nextIndex}"
                      type="text"
                    />
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    class="d-inline-block function-stack-variable"
                  >
                    =
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <div class="d-flex">
                      <span class="prefix"></span
                      ><input id="inputVarValue" param="string" type="text" class="value" />
                      <span class="filter" title=""></span>
                    </div>
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    class="d-inline-block function-stack-variable"
                  >
                    +
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <div class="d-flex">
                      <span class="prefix"></span
                      ><input id="inputVarValue2" param="string2" type="text" class="value" />
                      <span class="filter" title=""></span>
                    </div>
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                </div>
                <!---->
              </app-process-function-stack-row-body>
            </div>
            <!---->
            <!---->
            <!---->
            <div
              
              class="text-end function-stack-return align-self-center"
            >
              retorna como
              <span
                
                id="highlight-variable"
                appdebuggerpopup=""
                class="highlight-variable"
              ></span>
              <!---->
            </div>
            <!---->
            <!-- Hover Actions-->
            <div
              
              class="function-stack-hover-actions"
            >
              <!-- Esquerda -->
              <div
                
                class="function-stack-left-actions d-flex flex-column justify-content-center"
              >
                <div
                  
                  class="action-icon function-stack-handle"
                >
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="grip-vertical"
                      class="svg-inline--fa fa-grip-vertical fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 320 512"
                    >
                      <path
                        fill="currentColor"
                        d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
              <!-- Direita -->
              <div  class="function-stack-right-actions">
                <!-- 3 pontinhos -->
                <div
                  
                  dropdownclass="processStackRowDropdown"
                  ngbdropdown=""
                  placement="left-top"
                  class="action-icon processStackRowDropdown dropdown"
                >
                  <div
                    
                    ngbdropdowntoggle=""
                    class="dropdown-toggle"
                    aria-expanded="false"
                  >
                    <fa-icon
                      
                      class="ng-fa-icon action-icon-icon"
                    >
                      <svg
                        role="img"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fal"
                        data-icon="ellipsis"
                        class="svg-inline--fa fa-ellipsis fa-fw"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="currentColor"
                          d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                        ></path>
                      </svg>
                    </fa-icon>
                  </div>
                  <!-- Edit description -->
                </div>
                <!--Delete-->
                <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                  <svg
                  role="img"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="trash-can"
                  class="svg-inline--fa fa-trash-can fa-fw"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path
                    fill="currentColor"
                    d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                  ></path>
                  </svg>
                  </fa-icon>
                </div>
                <!---->
                <!---->
                <!---->
              </div>
              
              <!---->
            </div>
            <!---->
          </div>
          <!---->
        </div>
      </div>
    </div>
</app-process-function-stack-row>
<!-- Bot�o + para seguir o fluxo-->
              <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                <div class="add-action-icon">
                  <fa-icon class="ng-fa-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="plus"
                      class="svg-inline--fa fa-plus fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path
                        fill="currentColor"
                        d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
<!---->
<!---->
<!---->
<!---->
</app-process-function-stack-row-type-generic>`
                        break;
                    case 'pbx-getdtmfdigit':
                        component = `<app-process-function-stack-row-type-generic
  
  index="${nextIndex}"
  element="${elementId}"
>
  <app-process-function-stack-row
    
    _nghost-serverapp-c865612792=""
  >
    <div
      
      class="d-flex function-stack-row"
      id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
    >
      <div
        
        class="function-stack-index"
        style="left: 0px"
      >
        ${nextIndex}
      </div>
      <!---->
      <!---->
      <div  class="flex-grow-1 menu-padding">
        <div
          
          similarclassname="function-stack-function"
          class="d-flex diff- flex-column function-stack-function force-hover"
          data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
        >
          <div  class="d-flex flex-row">
            <!---->
            <div  class="function-stack-icon">
              <app-process-function-stack-row-icon
                
                _nghost-serverapp-c335782559=""
              >
                <fa-icon  class="ng-fa-icon">
                  ${element.img}
                </fa-icon>
              </app-process-function-stack-row-icon>
              <!---->
              <!---->
              <!---->
            </div>
            <div
              
              class="function-stack-body my-auto flex-grow-1"
            >
              <app-process-function-stack-row-body
                
                _nghost-serverapp-c2854308694=""
              >
                <div
                  
                  class="function-stack-action"
                >
                  <div
                    
                    class="function-stack-description"
                  ></div>
                  ${element.name}
                  <!---->
                  <!---->
                </div>
                <div
                  
                  class="d-flex align-items-center gap-1"
                >
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <span  class="prefix"
                      >var:</span
                    >
                    <!---->
                    <input
                      id="inputVarName"
                      param="out-dtmf"
                      index="${nextIndex}"
                      type="text"
                    />
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                </div>
                <!---->
              </app-process-function-stack-row-body>
            </div>
            <!---->
            <!---->
            <!---->
            <div
              
              class="text-end function-stack-return align-self-center"
            >
              retorna como
              <span
                
                id="highlight-variable"
                appdebuggerpopup=""
                class="highlight-variable"
              ></span>
              <!---->
            </div>
            <!---->
            <!-- Hover Actions-->
            <div
              
              class="function-stack-hover-actions"
            >
              <!-- Esquerda -->
              <div
                
                class="function-stack-left-actions d-flex flex-column justify-content-center"
              >
                <div
                  
                  class="action-icon function-stack-handle"
                >
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="grip-vertical"
                      class="svg-inline--fa fa-grip-vertical fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 320 512"
                    >
                      <path
                        fill="currentColor"
                        d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
              <!-- Direita -->
              <div  class="function-stack-right-actions">
                <!-- 3 pontinhos -->
                <div
                  
                  dropdownclass="processStackRowDropdown"
                  ngbdropdown=""
                  placement="left-top"
                  class="action-icon processStackRowDropdown dropdown"
                >
                  <div
                    
                    ngbdropdowntoggle=""
                    class="dropdown-toggle"
                    aria-expanded="false"
                  >
                    <fa-icon
                      
                      class="ng-fa-icon action-icon-icon"
                    >
                      <svg
                        role="img"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fal"
                        data-icon="ellipsis"
                        class="svg-inline--fa fa-ellipsis fa-fw"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="currentColor"
                          d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                        ></path>
                      </svg>
                    </fa-icon>
                  </div>
                  <!-- Edit description -->
                </div>
                <!--Delete-->
                <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                  <svg
                  role="img"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="trash-can"
                  class="svg-inline--fa fa-trash-can fa-fw"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path
                    fill="currentColor"
                    d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                  ></path>
                  </svg>
                  </fa-icon>
                </div>
                <!---->
                <!---->
                <!---->
              </div>
              
              <!---->
            </div>
            <!---->
          </div>
          <!---->
        </div>
      </div>
    </div>
</app-process-function-stack-row>
<!-- Bot�o + para seguir o fluxo-->
              <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                <div class="add-action-icon">
                  <fa-icon class="ng-fa-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="plus"
                      class="svg-inline--fa fa-plus fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path
                        fill="currentColor"
                        d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
<!---->
<!---->
<!---->
<!---->
</app-process-function-stack-row-type-generic>`
                        break;
                    case 'lib-strlen':
                        component = `<app-process-function-stack-row-type-generic
  
  index="${nextIndex}"
  element="${elementId}"
>
  <app-process-function-stack-row
    
    _nghost-serverapp-c865612792=""
  >
    <div
      
      class="d-flex function-stack-row"
      id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
    >
      <div
        
        class="function-stack-index"
        style="left: 0px"
      >
        ${nextIndex}
      </div>
      <!---->
      <!---->
      <div  class="flex-grow-1 menu-padding">
        <div
          
          similarclassname="function-stack-function"
          class="d-flex diff- flex-column function-stack-function force-hover"
          data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
        >
          <div  class="d-flex flex-row">
            <!---->
            <div  class="function-stack-icon">
              <app-process-function-stack-row-icon
                
                _nghost-serverapp-c335782559=""
              >
                <fa-icon  class="ng-fa-icon">
                  ${element.img}
                </fa-icon>
              </app-process-function-stack-row-icon>
              <!---->
              <!---->
              <!---->
            </div>
            <div
              
              class="function-stack-body my-auto flex-grow-1"
            >
              <app-process-function-stack-row-body
                
                _nghost-serverapp-c2854308694=""
              >
                <div
                  
                  class="function-stack-action"
                >
                  <div
                    
                    class="function-stack-description"
                  ></div>
                  ${element.name}
                  <!---->
                  <!---->
                </div>
                <div
                  
                  class="d-flex align-items-center gap-1"
                >
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <span  class="prefix"
                      >var:</span
                    >
                    <!---->
                    <input
                      id="inputVarName"
                      param="out"
                      index="${nextIndex}"
                      type="text"
                    />
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    class="d-inline-block function-stack-variable"
                  >
                    =
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <div
                    
                    appdebuggerpopup=""
                    class="function-stack-variable highlight"
                  >
                    <div class="d-flex">
                      <span class="prefix"></span
                      ><input id="inputVarValue" type="text" param="string" class="value" />
                      <span class="filter" title=""></span>
                    </div>
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                </div>
                <!---->
              </app-process-function-stack-row-body>
            </div>
            <!---->
            <!---->
            <!---->
            <div
              
              class="text-end function-stack-return align-self-center"
            >
              retorna como
              <span
                
                id="highlight-variable"
                appdebuggerpopup=""
                class="highlight-variable"
              ></span>
              <!---->
            </div>
            <!---->
            <!-- Hover Actions-->
            <div
              
              class="function-stack-hover-actions"
            >
              <!-- Esquerda -->
              <div
                
                class="function-stack-left-actions d-flex flex-column justify-content-center"
              >
                <div
                  
                  class="action-icon function-stack-handle"
                >
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="grip-vertical"
                      class="svg-inline--fa fa-grip-vertical fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 320 512"
                    >
                      <path
                        fill="currentColor"
                        d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
              <!-- Direita -->
              <div  class="function-stack-right-actions">
                <!-- 3 pontinhos -->
                <div
                  
                  dropdownclass="processStackRowDropdown"
                  ngbdropdown=""
                  placement="left-top"
                  class="action-icon processStackRowDropdown dropdown"
                >
                  <div
                    
                    ngbdropdowntoggle=""
                    class="dropdown-toggle"
                    aria-expanded="false"
                  >
                    <fa-icon
                      
                      class="ng-fa-icon action-icon-icon"
                    >
                      <svg
                        role="img"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fal"
                        data-icon="ellipsis"
                        class="svg-inline--fa fa-ellipsis fa-fw"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="currentColor"
                          d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                        ></path>
                      </svg>
                    </fa-icon>
                  </div>
                  <!-- Edit description -->
                </div>
                <!--Delete-->
                <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                  <fa-icon
                    
                    class="ng-fa-icon action-icon-icon"
                  >
                  <svg
                  role="img"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fal"
                  data-icon="trash-can"
                  class="svg-inline--fa fa-trash-can fa-fw"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path
                    fill="currentColor"
                    d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                  ></path>
                  </svg>
                  </fa-icon>
                </div>
                <!---->
                <!---->
                <!---->
              </div>
              
              <!---->
            </div>
            <!---->
          </div>
          <!---->
        </div>
      </div>
    </div>
</app-process-function-stack-row>
<!-- Bot�o + para seguir o fluxo-->
              <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                <div class="add-action-icon">
                  <fa-icon class="ng-fa-icon"
                  >
                    <svg
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fal"
                      data-icon="plus"
                      class="svg-inline--fa fa-plus fa-fw"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path
                        fill="currentColor"
                        d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                      ></path>
                    </svg>
                  </fa-icon>
                </div>
                <!---->
              </div>
<!---->
<!---->
<!---->
<!---->
</app-process-function-stack-row-type-generic>`
                        break;
                    case 'event':
                        component = `<app-process-function-stack-row-type-generic
        
        index="${nextIndex}"
        element="${elementId}"
      >
        <app-process-function-stack-row
          
          _nghost-serverapp-c865612792=""
        >
          <div
            
            class="d-flex function-stack-row"
            id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
          >
            <div
              
              class="function-stack-index"
              style="left: 0px"
            >
              ${nextIndex}
            </div>
            <!---->
            <!---->
            <div  class="flex-grow-1 menu-padding">
              <div
                
                similarclassname="function-stack-function"
                class="d-flex diff- flex-column function-stack-function force-hover"
                data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
              >
                <div  class="d-flex flex-row">
                  <!---->
                  <div  class="function-stack-icon">
                    <app-process-function-stack-row-icon
                      
                      _nghost-serverapp-c335782559=""
                    >
                      <fa-icon  class="ng-fa-icon">
                        ${element.img}
                      </fa-icon>
                    </app-process-function-stack-row-icon>
                    <!---->
                    <!---->
                    <!---->
                  </div>
                  <div
                    
                    class="function-stack-body my-auto flex-grow-1"
                  >
                    <app-process-function-stack-row-body
                      
                      _nghost-serverapp-c2854308694=""
                    >
                      <div
                        
                        class="function-stack-action"
                      >
                        <div
                          
                          class="function-stack-description"
                        ></div>
                        ${element.name}
                        <!---->
                        <!---->
                      </div>
                      <div
                        
                        class="d-flex align-items-center gap-1"
                      >
                        <div
                          
                          appdebuggerpopup=""
                          class="function-stack-variable highlight"
                        >
                          <span  class="prefix"
                            >function name:</span
                          >
                          <!---->
                          <input
                            id="inputVarDefine"
                            param="call-function-name"
                            index="${nextIndex}"
                            type="text"
                          />
                        </div>
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                      </div>
                      <!---->
                    </app-process-function-stack-row-body>
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!-- Hover Actions-->
                  <div
                    
                    class="function-stack-hover-actions"
                  >
                    <!-- Esquerda -->
                    <div
                      
                      class="function-stack-left-actions d-flex flex-column justify-content-center"
                    >
                      <div
                        
                        class="action-icon function-stack-handle"
                      >
                        <fa-icon
                          
                          class="ng-fa-icon action-icon-icon"
                        >
                          <svg
                            role="img"
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fal"
                            data-icon="grip-vertical"
                            class="svg-inline--fa fa-grip-vertical fa-fw"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 320 512"
                          >
                            <path
                              fill="currentColor"
                              d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                            ></path>
                          </svg>
                        </fa-icon>
                      </div>
                      <!---->
                    </div>
                    <!-- Direita -->
                    <div  class="function-stack-right-actions">
                      <!-- 3 pontinhos -->
                      <div
                        
                        dropdownclass="processStackRowDropdown"
                        ngbdropdown=""
                        placement="left-top"
                        class="action-icon processStackRowDropdown dropdown"
                      >
                        <div
                          
                          ngbdropdowntoggle=""
                          class="dropdown-toggle"
                          aria-expanded="false"
                        >
                          <fa-icon
                            
                            class="ng-fa-icon action-icon-icon"
                          >
                            <svg
                              role="img"
                              aria-hidden="true"
                              focusable="false"
                              data-prefix="fal"
                              data-icon="ellipsis"
                              class="svg-inline--fa fa-ellipsis fa-fw"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 448 512"
                            >
                              <path
                                fill="currentColor"
                                d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                              ></path>
                            </svg>
                          </fa-icon>
                        </div>
                        <!-- Edit description -->
                      </div>
                      <!--Delete-->
                      <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                        <fa-icon
                          
                          class="ng-fa-icon action-icon-icon"
                        >
                        <svg
                        role="img"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fal"
                        data-icon="trash-can"
                        class="svg-inline--fa fa-trash-can fa-fw"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="currentColor"
                          d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                        ></path>
                        </svg>
                        </fa-icon>
                      </div>
                      <!---->
                      <!---->
                      <!---->
                    </div>
                    
                    <!---->
                  </div>
                  <!---->
                </div>
                <!---->
              </div>
            </div>
          </div>
      </app-process-function-stack-row>
      <!-- Bot�o + para seguir o fluxo-->
                    <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                      <div class="add-action-icon">
                        <fa-icon class="ng-fa-icon"
                        >
                          <svg
                            role="img"
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fal"
                            data-icon="plus"
                            class="svg-inline--fa fa-plus fa-fw"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512"
                          >
                            <path
                              fill="currentColor"
                              d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                            ></path>
                          </svg>
                        </fa-icon>
                      </div>
                      <!---->
                    </div>
      <!---->
      <!---->
      <!---->
      <!---->
      </app-process-function-stack-row-type-generic>`
                        break;
                    case 'switch-start':
                        component = `<app-process-function-stack-row-type-generic
        
        index="${nextIndex}"
        element="${elementId}"
      >
        <app-process-function-stack-row
          
          _nghost-serverapp-c865612792=""
        >
          <div
            
            class="d-flex function-stack-row"
            id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
          >
            <div
              
              class="function-stack-index"
              style="left: 0px"
            >
              ${nextIndex}
            </div>
            <!---->
            <!---->
            <div  class="flex-grow-1 menu-padding">
              <div
                
                similarclassname="function-stack-function"
                class="d-flex diff- flex-column function-stack-function force-hover"
                data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
              >
                <div  class="d-flex flex-row">
                  <!---->
                  <div  class="function-stack-icon">
                    <app-process-function-stack-row-icon
                      
                      _nghost-serverapp-c335782559=""
                    >
                      <fa-icon  class="ng-fa-icon">
                        ${element.img}
                      </fa-icon>
                    </app-process-function-stack-row-icon>
                    <!---->
                    <!---->
                    <!---->
                  </div>
                  <div
                    
                    class="function-stack-body my-auto flex-grow-1"
                  >
                    <app-process-function-stack-row-body
                      
                      _nghost-serverapp-c2854308694=""
                    >
                      <div
                        
                        class="function-stack-action"
                      >
                        <div
                          
                          class="function-stack-description"
                        ></div>
                        ${element.name}
                        <!---->
                        <!---->
                      </div>
                      <div
                        
                        class="d-flex align-items-center gap-1"
                      >
                        <div
                          
                          appdebuggerpopup=""
                          class="function-stack-variable highlight"
                        >
                          <span  class="prefix"
                            >define:</span
                          >
                          <!---->
                          <input
                            id="inputVarName"
                            param="var"
                            index="${nextIndex}"
                            type="text"
                          />
                        </div>
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                        <!---->
                      </div>
                      <!---->
                    </app-process-function-stack-row-body>
                  </div>
                  <!---->
                  <!---->
                  <!---->
                  <!---->
                  <!-- Hover Actions-->
                  <div
                    
                    class="function-stack-hover-actions"
                  >
                    <!-- Esquerda -->
                    <div
                      
                      class="function-stack-left-actions d-flex flex-column justify-content-center"
                    >
                      <div
                        
                        class="action-icon function-stack-handle"
                      >
                        <fa-icon
                          
                          class="ng-fa-icon action-icon-icon"
                        >
                          <svg
                            role="img"
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fal"
                            data-icon="grip-vertical"
                            class="svg-inline--fa fa-grip-vertical fa-fw"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 320 512"
                          >
                            <path
                              fill="currentColor"
                              d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                            ></path>
                          </svg>
                        </fa-icon>
                      </div>
                      <!---->
                    </div>
                    <!-- Direita -->
                    <div  class="function-stack-right-actions">
                      <!-- 3 pontinhos -->
                      <div
                        
                        dropdownclass="processStackRowDropdown"
                        ngbdropdown=""
                        placement="left-top"
                        class="action-icon processStackRowDropdown dropdown"
                      >
                        <div
                          
                          ngbdropdowntoggle=""
                          class="dropdown-toggle"
                          aria-expanded="false"
                        >
                          <fa-icon
                            
                            class="ng-fa-icon action-icon-icon"
                          >
                            <svg
                              role="img"
                              aria-hidden="true"
                              focusable="false"
                              data-prefix="fal"
                              data-icon="ellipsis"
                              class="svg-inline--fa fa-ellipsis fa-fw"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 448 512"
                            >
                              <path
                                fill="currentColor"
                                d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                              ></path>
                            </svg>
                          </fa-icon>
                        </div>
                        <!-- Edit description -->
                      </div>
                      <!--Delete-->
                      <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                        <fa-icon
                          
                          class="ng-fa-icon action-icon-icon"
                        >
                        <svg
                        role="img"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fal"
                        data-icon="trash-can"
                        class="svg-inline--fa fa-trash-can fa-fw"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="currentColor"
                          d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                        ></path>
                        </svg>
                        </fa-icon>
                      </div>
                      <!---->
                      <!---->
                      <!---->
                    </div>
                    
                    <!---->
                  </div>
                  <!---->
                </div>
                <!---->
              </div>
            </div>
          </div>
      </app-process-function-stack-row>
      <!-- Bot�o + para seguir o fluxo-->
                    <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                      <div class="add-action-icon">
                        <fa-icon class="ng-fa-icon"
                        >
                          <svg
                            role="img"
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fal"
                            data-icon="plus"
                            class="svg-inline--fa fa-plus fa-fw"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512"
                          >
                            <path
                              fill="currentColor"
                              d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                            ></path>
                          </svg>
                        </fa-icon>
                      </div>
                      <!---->
                    </div>
      <!---->
      <!---->
      <!---->
      <!---->
      </app-process-function-stack-row-type-generic>`
                        break;
                    case 'switch-end':
                        component = `<app-process-function-stack-row-type-generic
            
            index="${nextIndex}"
            element="${elementId}"
          >
            <app-process-function-stack-row
              
              _nghost-serverapp-c865612792=""
            >
              <div
                
                class="d-flex function-stack-row"
                id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
              >
                <div
                  
                  class="function-stack-index"
                  style="left: 0px"
                >
                  ${nextIndex}
                </div>
                <!---->
                <!---->
                <div  class="flex-grow-1 menu-padding">
                  <div
                    
                    similarclassname="function-stack-function"
                    class="d-flex diff- flex-column function-stack-function force-hover"
                    data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
                  >
                    <div  class="d-flex flex-row">
                      <!---->
                      <div  class="function-stack-icon">
                        <app-process-function-stack-row-icon
                          
                          _nghost-serverapp-c335782559=""
                        >
                          <fa-icon  class="ng-fa-icon">
                            ${element.img}
                          </fa-icon>
                        </app-process-function-stack-row-icon>
                        <!---->
                        <!---->
                        <!---->
                      </div>
                      <div
                        
                        class="function-stack-body my-auto flex-grow-1"
                      >
                        <app-process-function-stack-row-body
                          
                          _nghost-serverapp-c2854308694=""
                        >
                          <div
                            
                            class="function-stack-action"
                          >
                            <div
                              
                              class="function-stack-description"
                            ></div>
                            ${element.name}
                            <!---->
                            <!---->
                          </div>
                          <div
                            
                            class="d-flex align-items-center gap-1"
                          >
                            <div
                              
                              appdebuggerpopup=""
                              class="function-stack-variable highlight"
                            >
                              <span  class="prefix"
                                >${element.description}</span
                              >
                              <!---->
                            </div>
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                          </div>
                          <!---->
                        </app-process-function-stack-row-body>
                      </div>
                      <!---->
                      <!---->
                      <!---->
                      <!---->
                      <!-- Hover Actions-->
                      <div
                        
                        class="function-stack-hover-actions"
                      >
                        <!-- Esquerda -->
                        <div
                          
                          class="function-stack-left-actions d-flex flex-column justify-content-center"
                        >
                          <div
                            
                            class="action-icon function-stack-handle"
                          >
                            <fa-icon
                              
                              class="ng-fa-icon action-icon-icon"
                            >
                              <svg
                                role="img"
                                aria-hidden="true"
                                focusable="false"
                                data-prefix="fal"
                                data-icon="grip-vertical"
                                class="svg-inline--fa fa-grip-vertical fa-fw"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 320 512"
                              >
                                <path
                                  fill="currentColor"
                                  d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                                ></path>
                              </svg>
                            </fa-icon>
                          </div>
                          <!---->
                        </div>
                        <!-- Direita -->
                        <div  class="function-stack-right-actions">
                          <!-- 3 pontinhos -->
                          <div
                            
                            dropdownclass="processStackRowDropdown"
                            ngbdropdown=""
                            placement="left-top"
                            class="action-icon processStackRowDropdown dropdown"
                          >
                            <div
                              
                              ngbdropdowntoggle=""
                              class="dropdown-toggle"
                              aria-expanded="false"
                            >
                              <fa-icon
                                
                                class="ng-fa-icon action-icon-icon"
                              >
                                <svg
                                  role="img"
                                  aria-hidden="true"
                                  focusable="false"
                                  data-prefix="fal"
                                  data-icon="ellipsis"
                                  class="svg-inline--fa fa-ellipsis fa-fw"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 448 512"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                                  ></path>
                                </svg>
                              </fa-icon>
                            </div>
                            <!-- Edit description -->
                          </div>
                          <!--Delete-->
                          <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                            <fa-icon
                              
                              class="ng-fa-icon action-icon-icon"
                            >
                            <svg
                            role="img"
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fal"
                            data-icon="trash-can"
                            class="svg-inline--fa fa-trash-can fa-fw"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512"
                          >
                            <path
                              fill="currentColor"
                              d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                            ></path>
                            </svg>
                            </fa-icon>
                          </div>
                          <!---->
                          <!---->
                          <!---->
                        </div>
                        
                        <!---->
                      </div>
                      <!---->
                    </div>
                    <!---->
                  </div>
                </div>
              </div>
          </app-process-function-stack-row>
          <!-- Bot�o + para seguir o fluxo-->
                        <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                          <div class="add-action-icon">
                            <fa-icon class="ng-fa-icon"
                            >
                              <svg
                                role="img"
                                aria-hidden="true"
                                focusable="false"
                                data-prefix="fal"
                                data-icon="plus"
                                class="svg-inline--fa fa-plus fa-fw"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                              >
                                <path
                                  fill="currentColor"
                                  d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                                ></path>
                              </svg>
                            </fa-icon>
                          </div>
                          <!---->
                        </div>
          <!---->
          <!---->
          <!---->
          <!---->
          </app-process-function-stack-row-type-generic>`
                        break;
                    case 'case-start':
                        component = `<app-process-function-stack-row-type-generic
            index="${nextIndex}"
            element="${elementId}"
          >
            <app-process-function-stack-row
              
              _nghost-serverapp-c865612792=""
            >
              <div
                
                class="d-flex function-stack-row"
                id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
              >
                <div
                  
                  class="function-stack-index"
                  style="left: 0px"
                >
                  ${nextIndex}
                </div>
                <!---->
                <!---->
                <div  class="flex-grow-1 menu-padding">
                  <div
                    
                    similarclassname="function-stack-function"
                    class="d-flex diff- flex-column function-stack-function force-hover"
                    data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
                  >
                    <div  class="d-flex flex-row">
                      <!---->
                      <div  class="function-stack-icon">
                        <app-process-function-stack-row-icon
                          
                          _nghost-serverapp-c335782559=""
                        >
                          <fa-icon  class="ng-fa-icon">
                            ${element.img}
                          </fa-icon>
                        </app-process-function-stack-row-icon>
                        <!---->
                        <!---->
                        <!---->
                      </div>
                      <div
                        
                        class="function-stack-body my-auto flex-grow-1"
                      >
                        <app-process-function-stack-row-body
                          
                          _nghost-serverapp-c2854308694=""
                        >
                          <div
                            
                            class="function-stack-action"
                          >
                            <div
                              
                              class="function-stack-description"
                            ></div>
                            ${element.name}
                            <!---->
                            <!---->
                          </div>
                          <div
                            
                            class="d-flex align-items-center gap-1"
                          >
                            <div
                              
                              appdebuggerpopup=""
                              class="function-stack-variable highlight"
                            >
                              <span  class="prefix"
                                >var:</span
                              >
                              <!---->
                              <input
                                id="inputVarCond"
                                param="cond"
                                index="${nextIndex}"
                                type="text"
                              />
                            </div>
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <div
                              
                              class="d-inline-block function-stack-variable"
                            ><select id="selectVarCond" param="cond" index="${nextIndex}">
                            <option value="==">==</>
                            <option value="!=">!=</>
                            </select>
                            </div>
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <div
                              
                              appdebuggerpopup=""
                              class="function-stack-variable highlight"
                            >
                              <div class="d-flex">
                                <span class="prefix"></span
                                >true
                                <span class="filter" title=""></span>
                              </div>
                            </div>
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                            <!---->
                          </div>
                          <!---->
                        </app-process-function-stack-row-body>
                      </div>
                      <!---->
                      <!---->
                      <!---->
                      <!---->
                      <!-- Hover Actions-->
                      <div
                        
                        class="function-stack-hover-actions"
                      >
                        <!-- Esquerda -->
                        <div
                          
                          class="function-stack-left-actions d-flex flex-column justify-content-center"
                        >
                          <div
                            
                            class="action-icon function-stack-handle"
                          >
                            <fa-icon
                              
                              class="ng-fa-icon action-icon-icon"
                            >
                              <svg
                                role="img"
                                aria-hidden="true"
                                focusable="false"
                                data-prefix="fal"
                                data-icon="grip-vertical"
                                class="svg-inline--fa fa-grip-vertical fa-fw"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 320 512"
                              >
                                <path
                                  fill="currentColor"
                                  d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                                ></path>
                              </svg>
                            </fa-icon>
                          </div>
                          <!---->
                        </div>
                        <!-- Direita -->
                        <div  class="function-stack-right-actions">
                          <!-- 3 pontinhos -->
                          <div
                            
                            dropdownclass="processStackRowDropdown"
                            ngbdropdown=""
                            placement="left-top"
                            class="action-icon processStackRowDropdown dropdown"
                          >
                            <div
                              
                              ngbdropdowntoggle=""
                              class="dropdown-toggle"
                              aria-expanded="false"
                            >
                              <fa-icon
                                
                                class="ng-fa-icon action-icon-icon"
                              >
                                <svg
                                  role="img"
                                  aria-hidden="true"
                                  focusable="false"
                                  data-prefix="fal"
                                  data-icon="ellipsis"
                                  class="svg-inline--fa fa-ellipsis fa-fw"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 448 512"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                                  ></path>
                                </svg>
                              </fa-icon>
                            </div>
                            <!-- Edit description -->
                          </div>
                          <!--Delete-->
                          <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                            <fa-icon
                              
                              class="ng-fa-icon action-icon-icon"
                            >
                            <svg
                            role="img"
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fal"
                            data-icon="trash-can"
                            class="svg-inline--fa fa-trash-can fa-fw"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512"
                          >
                            <path
                              fill="currentColor"
                              d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                            ></path>
                            </svg>
                            </fa-icon>
                          </div>
                          <!---->
                          <!---->
                          <!---->
                        </div>
                        
                        <!---->
                      </div>
                      <!---->
                    </div>
                    <!---->
                  </div>
                </div>
              </div>
          </app-process-function-stack-row>
          <!-- Bot�o + para seguir o fluxo-->
                        <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                          <div class="add-action-icon">
                            <fa-icon class="ng-fa-icon"
                            >
                              <svg
                                role="img"
                                aria-hidden="true"
                                focusable="false"
                                data-prefix="fal"
                                data-icon="plus"
                                class="svg-inline--fa fa-plus fa-fw"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                              >
                                <path
                                  fill="currentColor"
                                  d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                                ></path>
                              </svg>
                            </fa-icon>
                          </div>
                          <!---->
                        </div>
          <!---->
          <!---->
          <!---->
          <!---->
          </app-process-function-stack-row-type-generic>`
                        break;
                    case 'case-end':
                        component = `<app-process-function-stack-row-type-generic
                index="${nextIndex}"
                element="${elementId}"
              >
                <app-process-function-stack-row
                  
                  _nghost-serverapp-c865612792=""
                >
                  <div
                    
                    class="d-flex function-stack-row"
                    id="row-f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
                  >
                    <div
                      
                      class="function-stack-index"
                      style="left: 0px"
                    >
                      ${nextIndex}
                    </div>
                    <!---->
                    <!---->
                    <div  class="flex-grow-1 menu-padding">
                      <div
                        
                        similarclassname="function-stack-function"
                        class="d-flex diff- flex-column function-stack-function force-hover"
                        data-selectable-xsid="f:c2251a64-dfc3-45a9-9a50-295c0ecdf330"
                      >
                        <div  class="d-flex flex-row">
                          <!---->
                          <div  class="function-stack-icon">
                            <app-process-function-stack-row-icon
                              
                              _nghost-serverapp-c335782559=""
                            >
                              <fa-icon  class="ng-fa-icon">
                                ${element.img}
                              </fa-icon>
                            </app-process-function-stack-row-icon>
                            <!---->
                            <!---->
                            <!---->
                          </div>
                          <div
                            
                            class="function-stack-body my-auto flex-grow-1"
                          >
                            <app-process-function-stack-row-body
                              
                              _nghost-serverapp-c2854308694=""
                            >
                              <div
                                
                                class="function-stack-action"
                              >
                                <div
                                  
                                  class="function-stack-description"
                                ></div>
                                ${element.name}
                                <!---->
                                <!---->
                              </div>
                              <div
                                
                                class="d-flex align-items-center gap-1"
                              >
                                <div
                                  
                                  appdebuggerpopup=""
                                  class="function-stack-variable highlight"
                                >
                                  <span  class="prefix"
                                    >${element.description}</span
                                  >
                                  <!---->
                                </div>
                                <!---->
                                <!---->
                              </div>
                              <!---->
                            </app-process-function-stack-row-body>
                          </div>
                          <!---->
                          <!---->
                          <!---->
                          <!---->
                          <!-- Hover Actions-->
                          <div class="function-stack-hover-actions">
                            <!-- Esquerda -->
                            <div class="function-stack-left-actions d-flex flex-column justify-content-center">
                              <div class="action-icon function-stack-handle">
                                <fa-icon class="ng-fa-icon action-icon-icon">
                                  <svg
                                    role="img"
                                    aria-hidden="true"
                                    focusable="false"
                                    data-prefix="fal"
                                    data-icon="grip-vertical"
                                    class="svg-inline--fa fa-grip-vertical fa-fw"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 320 512"
                                  ><path fill="currentColor" d="M32 440l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zm184-40l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 232c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 280c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40zM32 72c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8l0-48zM0 120c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 48zm224 0l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8-3.6-8-8zm8 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40z"
                                    ></path>
                                  </svg>
                                </fa-icon>
                              </div>
                              <!---->
                            </div>
                            <!-- Direita -->
                            <div  class="function-stack-right-actions">
                              <!-- 3 pontinhos -->
                              <div dropdownclass="processStackRowDropdown" ngbdropdown="" placement="left-top" class="action-icon processStackRowDropdown dropdown">
                                <div
                                  
                                  ngbdropdowntoggle=""
                                  class="dropdown-toggle"
                                  aria-expanded="false"
                                >
                                  <fa-icon
                                    
                                    class="ng-fa-icon action-icon-icon"
                                  >
                                    <svg
                                      role="img"
                                      aria-hidden="true"
                                      focusable="false"
                                      data-prefix="fal"
                                      data-icon="ellipsis"
                                      class="svg-inline--fa fa-ellipsis fa-fw"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 448 512"
                                    >
                                      <path
                                        fill="currentColor"
                                        d="M416 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"
                                      ></path>
                                    </svg>
                                  </fa-icon>
                                </div>
                                <!-- Edit description -->
                              </div>
                              <!--Delete-->
                              <div id="deleteStack" index=${nextIndex} card=${processCardName}  class="action-icon text-danger">
                                <fa-icon
                                  
                                  class="ng-fa-icon action-icon-icon"
                                >
                                <svg
                                role="img"
                                aria-hidden="true"
                                focusable="false"
                                data-prefix="fal"
                                data-icon="trash-can"
                                class="svg-inline--fa fa-trash-can fa-fw"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                              >
                                <path
                                  fill="currentColor"
                                  d="M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                                ></path>
                                </svg>
                                </fa-icon>
                              </div>
                              <!---->
                              <!---->
                              <!---->
                            </div>
                            
                            <!---->
                          </div>
                          <!---->
                        </div>
                        <!---->
                      </div>
                    </div>
                  </div>
              </app-process-function-stack-row>
              <!-- Bot�o + para seguir o fluxo-->
                            <div id="function-stack-lower-actions" index=${nextIndex + 1} card=${processCardName} class="function-stack-lower-actions function-stack-hover-actions">
                              <div class="add-action-icon">
                                <fa-icon class="ng-fa-icon"
                                >
                                  <svg
                                    role="img"
                                    aria-hidden="true"
                                    focusable="false"
                                    data-prefix="fal"
                                    data-icon="plus"
                                    class="svg-inline--fa fa-plus fa-fw"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 448 512"
                                  >
                                    <path
                                      fill="currentColor"
                                      d="M240 64c0-8.8-7.2-16-16-16s-16 7.2-16 16V240H32c-8.8 0-16 7.2-16 16s7.2 16 16 16H208V448c0 8.8 7.2 16 16 16s16-7.2 16-16V272H416c8.8 0 16-7.2 16-16s-7.2-16-16-16H240V64z"
                                    ></path>
                                  </svg>
                                </fa-icon>
                              </div>
                              <!---->
                            </div>
              <!---->
              <!---->
              <!---->
              <!---->
              </app-process-function-stack-row-type-generic>`
                        break;
                }

                // Converte a string do componente para um elemento DOM.
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = component.trim();
                const newElement = tempDiv.firstChild;

                // Seleciona todos os elementos filhos dentro do container.
                const allRows = functionContainer.querySelectorAll('app-process-function-stack-row-type-generic')
                //const allRows = functionContainer.children;

                if (nextIndex < allRows.length) {
                    // Se o nextIndex for valido, insere o novo componente ap�s o elemento com previousIndex.
                    const nextElement = allRows[nextIndex];
                    functionContainer.insertBefore(newElement, nextElement);

                    //Reordenar Stacks
                    updateStackIndex(processCard, nextIndex + 1, 1)

                    const divCount = functionContainer.querySelectorAll('app-process-function-stack-row-type-generic').length;
                    if (nextIndex == 0 && divCount.length == 1) {
                        nextIndex = null
                    }
                } else {
                    // Se nextIndex for o ultimo, insere no final.
                    functionContainer.appendChild(newElement);
                }

                addEventListenersToInputs();
                addEventListenersToStacks();
                addEventListenerToDellStacks(processCard);
                addEventListenerToLowerActions(processCard);
                selectLastLowerAction(processCard)
            });
        });
    }

    // Funcao para adicionar listeners aos inputs result as
    function addEventListenersToInputs() {
        // Seleciona todos os elementos input com o id 'inputVarName'
        const inputs = document.querySelectorAll('input[id="inputVarName"]');

        // Adiciona um event listener de 'change' para cada input
        inputs.forEach(input => {
            // Remove event listeners existentes para evitar duplica��o
            input.removeEventListener('change', handleInputChange);
            // Adiciona o novo event listener
            input.addEventListener('change', handleInputChange);
        });


    }
    // Funcao que trata a mudanca no input
    function handleInputChange(event) {
        const changedInput = event.target;
        // Encontra o caminho especifico ate o app-process-function-stack-row-type-generic correspondente
        let parentRow = changedInput.closest('app-process-function-stack-row-type-generic');
        if (parentRow) {
            // Encontra o elemento com id='highlight-variable' dentro do parentRow
            const highlightVariable = parentRow.querySelector('#highlight-variable');
            if (highlightVariable) {
                // Atualiza o valor do highlight-variable com o valor do input alterado
                highlightVariable.textContent = '$' + changedInput.value; // ou highlightVariable.textContent, dependendo do elemento
                console.log(`Elemento com id 'highlight-variable' atualizado para: ${changedInput.value}`);
            }
        }
    }
    // Funcao para adicionar listeners nas Stacks
    function addEventListenersToStacks() {
        const divs = document.querySelectorAll('div[similarclassname="function-stack-function"]');

        divs.forEach(div => {
            // Adiciona o evento mouseover para adicionar a classe
            div.addEventListener('mouseover', () => {
                div.classList.add('force-hover');
            });

            // Adiciona o evento mouseout para remover a classe
            div.addEventListener('mouseout', () => {
                div.classList.remove('force-hover');
            });
        });
    }
    // Funcao para adicionar Listners Lower Actions
    function addEventListenerToLowerActions(card) {
        const lowerActions = card.querySelectorAll('.function-stack-lower-actions');

        lowerActions.forEach(button => {
            button.removeEventListener('click', lowerActionsclick);
            button.addEventListener('click', lowerActionsclick);
        });


    }
    //Funcao auxiliar para Tratar Clicks em Lower Actions
    function lowerActionsclick(event) {
        const targetCard = event.currentTarget.getAttribute('card');
        const card = document.querySelector('app-process-' + targetCard + '-card')
        const lowerActions = card.querySelectorAll('.function-stack-lower-actions');
        lowerActions.forEach(action => {
            if (action.classList.contains('force-active')) {
                action.classList.remove('force-active');
            }
        });
        const targetIndex = parseInt(event.currentTarget.getAttribute('index'));
        console.log('lower action clicado ' + targetIndex)
        nextIndex = targetIndex
        event.currentTarget.classList.add('force-active')
    }
    // Funcao para adicionar Listners Hover Delete Stack
    function addEventListenerToDellStacks(card) {
        const deleteButtons = card.querySelectorAll('#deleteStack');

        deleteButtons.forEach(button => {
            button.removeEventListener('click', deleteStack);
            button.addEventListener('click', deleteStack);
        });


    }
    // Funcao para deletar um elemento pelo index e ajustar os indices
    function deleteStack(event) {
        const targetIndex = parseInt(event.currentTarget.getAttribute('index')); // Parse para garantir que seja um numero
        const targetCard = event.currentTarget.getAttribute('card');
        const card = document.querySelector('app-process-' + targetCard + '-card')
        let allRows = card.querySelectorAll('app-process-function-stack-row-type-generic');

        if (targetIndex >= 0 && targetIndex < allRows.length) {
            // Remove o elemento do DOM pelo �ndice targetIndex
            const removedElement = allRows[targetIndex];
            removedElement.parentNode.removeChild(removedElement);
            console.log(`Elemento com indice ${targetIndex} removido.`);

            // Atualiza os indices dos elementos restantes
            allRows = card.querySelectorAll('app-process-function-stack-row-type-generic');
            updateStackIndex(card, targetIndex, -1)

            // Verifica se nao ha um unico elemento restante e exibe um aviso se necessario
            if (allRows.length === 0) {
                const functionContainer = card.querySelector('#function-stack-container-' + targetCard);
                //verifica se o aviso de nenhuma funcao esta ativo
                const functionStack = functionContainer.querySelector('app-process-card-no-items')

                if (functionStack) {
                    functionStack.classList.remove('hidden');
                    nextIndex = 0;
                }
            }

        } else {
            console.log(`indice ${targetIndex} é inválido.`);
        }
    }
    //Funcao para Atualizar Indice em Stacks
    function updateStackIndex(card, targetIndex, offSet) {
        // Atualiza os indices dos elementos restantes
        const allRows = card.querySelectorAll('app-process-function-stack-row-type-generic');


        for (let i = targetIndex; i < allRows.length; i++) {
            const rowElement = allRows[i];
            const currentIndex = parseInt(rowElement.getAttribute('index'));
            const newIndex = currentIndex + offSet;

            // Atualiza o �ndice no pr�prio elemento
            rowElement.setAttribute('index', newIndex);

            // Atualiza o valor no caminho especificado
            const indexElement = rowElement.querySelector('div[class="function-stack-index"]');
            if (indexElement) {
                indexElement.textContent = newIndex;
            }

            // Atualiza o indice do botao delete dentro desse elemento
            const deleteButton = rowElement.querySelector('#deleteStack');
            if (deleteButton) {
                deleteButton.setAttribute('index', newIndex);
            }

            // Atualiza o indice do botao lower-action dentro desse elemento
            const lowerAction = rowElement.querySelector('#function-stack-lower-actions');
            if (lowerAction) {
                lowerAction.setAttribute('index', newIndex + 1);
            }
        }
        selectLastLowerAction(card)
    }
    //Função para selecionar sempre o último Lower Action
    function selectLastLowerAction(card) {
        const lowerActions = card.querySelectorAll('.function-stack-lower-actions');
        const divCount = lowerActions.length;
        console.log('selectLastLowerAction count Lower Actions ' + divCount)

        //Atualiza o nextIndex para seguir criando
        console.log('selectLastLowerAction nextIndex is ' + nextIndex)
        nextIndex = divCount

        console.log('selectLastLowerAction nextIndex now is in the last element ' + nextIndex)

        lowerActions.forEach(action => {
            if (action.classList.contains('force-active')) {
                action.classList.remove('force-active');
            }
            if (action.getAttribute('index') == nextIndex) {
                action.classList.add('force-active');
            }
        });

    }


    //#region DB files
    // container
    var folder = null;

    function postFile(file) {
        if (!file) return;
        //dialog.container.showModal();
        sessionKey = innovaphone.crypto.sha256("generic-dbfiles:" + app.key());
        console.log("FILE IMG " + String(file))
        fetch('?dbfiles=myfiles&folder=' + folder + '&name=' + encodeURI(file.name) + '&key=' + sessionKey,
            {
                method: 'POST',
                headers: {},
                body: file
            }).then(response => {
                if (!response.ok) {
                    return Promise.reject(response);
                }
                return response.json();
            }).then(data => {
                console.log("Success");
                //dialog.container.close();
                console.log(data);
                listFolder(folder, function (msg) {
                    xmls = msg.files;
                    openScripts();
                });
            }).catch(error => {
                //dialog.container.close();
                if (typeof error.json === "function") {
                    error.json().then(jsonError => {
                        console.log("JSON error from API");
                        console.log(jsonError);
                    }).catch(genericError => {
                        console.log("Generic error from API");
                        console.log(error.statusText);
                    });
                } else {
                    console.log("Fetch error");
                    console.log(error);
                }
            });
    }

    function deleteFile(id) {
        controlDB = false
        if (!id) return;
        // dialog.container.showModal();
        sessionKey = innovaphone.crypto.sha256("generic-dbfiles:" + app.key());

        fetch('?dbfiles=myfiles&folder=' + folder + '&del=' + id + '&key=' + sessionKey,
            {
                method: 'POST',
                headers: {}
            }).then(response => {
                if (!response.ok) {
                    return Promise.reject(response);
                }
                return response.json();
            }).then(data => {
                console.log("Success");
                //dialog.container.close();
                console.log(data);
                //document.getElementById("imgBD").innerHTML = '';
                listFolder(folder, function (msg) {
                    xmls = msg.files
                    openScripts();
                });
                
            }).catch(error => {
                //dialog.container.close();
                if (typeof error.json === "function") {
                    error.json().then(jsonError => {
                        console.log("JSON error from API");
                        console.log(jsonError);
                    }).catch(genericError => {
                        console.log("Generic error from API");
                        console.log(error.statusText);
                    });
                } else {
                    console.log("Fetch error");
                    console.log(error);
                }
            });
    }
    function folderAdded(msg) {
        console.log("FOLDER" + msg)
        folder = msg.id;
        listFolder(folder, listFolderResult);
    }

    function listFolder(id, listFolderResult) {
        // fileList.clear();
        app.sendSrc({ mt: "DbFilesList", name: "myfiles", folder: id }, listFolderResult);
    }

    function listFolderResult(msg) {
        if ("files" in msg && msg.files.length > 0) {
            xmls = msg.files;
        }
    }
   
    //#endregion

    //#region Create XML file
    function createVoicemailXml() {
        let xmlPart = ''
        //Header
        let xmlDocument = `<?xml version="1.0" encoding="utf-8" ?>\n<voicemail xmlns="http://www.innovaphone.com/xsd/voicemail6.xsd">\n`;

        const functionMainContainer = document.getElementById('function-stack-container-main');

        //const functionMainContainer = document.getElementById('function-stack-container-main');

        if (!functionMainContainer) {
            console.error('Container not found');
            return;
        }
        // Seleciona todos os elementos filhos dentro do cont�iner.
        const rowsMain = functionMainContainer.querySelectorAll('app-process-function-stack-row-type-generic')

        //const rows = functionMainContainer.getElementsByClassName('app-process-function-stack-row-type-generic');
        console.log(`Number of elements found: ${rowsMain.length}`);

        xmlDocument += `   <function define="Main">\n`
        xmlPart = createXmlDom(rowsMain)
        console.log('xmlPart at end Main Functions: ' + xmlPart);
        xmlDocument += xmlPart
        xmlDocument += `  </function>\n`;

        console.log('xmlDocument at end Main: ' + xmlDocument);

        const functionsContainer = document.getElementById('function-stack-container-function');
        if (!functionsContainer) {
            console.error('Container Functions not found');
        }
        // Seleciona todos os elementos filhos dentro do cont�iner.
        const rowsFunctions = functionsContainer.querySelectorAll('app-process-function-stack-row-type-generic')
        xmlPart = createXmlDom(rowsFunctions)
        console.log('xmlPart at end Aditional Functions: ' + xmlPart);
        xmlDocument += xmlPart
        xmlDocument += `</voicemail>`;
        console.log('xmlDocument at end Aditional Functions: ' + xmlDocument);
        return xmlDocument
    }
    function createXmlDom(rows) {
        let xmlDocument = '';
        Array.from(rows).forEach(row => {
            const elementType = row.getAttribute('element');
            switch (elementType) {
                case 'add':
                    const addVarName = row.querySelector('#inputVarName')?.value;
                    const addVarValue = row.querySelector('#inputVarValue')?.value;
                    const addVarValue2 = row.querySelector('#inputVarValue2')?.value;
                    if (addVarName && addVarValue && addVarValue2) {
                        xmlDocument += `    <${elementType} out="${addVarName}" value="${addVarValue}" value2="${addVarValue2}"/>\n`;
                    }
                    break;
                case 'sub':
                    const subVarName = row.querySelector('#inputVarName')?.value;
                    const subVarValue = row.querySelector('#inputVarValue')?.value;
                    const subVarValue2 = row.querySelector('#inputVarValue2')?.value;
                    if (subVarName && subVarValue && subVarValue2) {
                        xmlDocument += `    <${elementType} out="${subVarName}" value="${subVarValue}" value2="${subVarValue2}"/>\n`;
                    }
                    break;
                case 'assign':
                    const assignVarName = row.querySelector('#inputVarName')?.value;
                    const assignVarValue = row.querySelector('#inputVarValue')?.value;
                    if (assignVarName && assignVarValue) {
                        xmlDocument += `    <${elementType} out="${assignVarName}" value="${assignVarValue}"/>\n`;
                    }
                    break;
                case 'call':
                    const callVarName = row.querySelector('#inputVarName')?.value;
                    if (callVarName) {
                        xmlDocument += `    <${elementType} name="${callVarName}" />\n`;
                    }
                    break;
                case 'wait':
                    const waitVarSeconds = row.querySelector('#inputVarSeconds')?.value;
                    if (waitVarSeconds) {
                        xmlDocument += `    <${elementType} sec="${waitVarSeconds}" />\n`;
                    }
                    break;
                case 'dbg':
                    const dbgVarValue = row.querySelector('#inputVarString1')?.value;
                    const dbgVarValue2 = row.querySelector('#inputVarString2')?.value;
                    if (dbgVarValue || dbgVarValue2) {
                        xmlDocument += `    <${elementType} string="${dbgVarValue}" string2="${dbgVarValue2}"/>\n`;
                    }
                    break;
                case 'exec':
                    const execVarUrl = row.querySelector('#inputVarUrl')?.value;
                    if (execVarUrl) {
                        xmlDocument += `    <${elementType} url="${execVarUrl}" />\n`;
                    }
                    break;
                case 'pbx-fwd':
                    const fwdVare164 = row.querySelector('#inputVare164')?.value;
                    if (fwdVare164) {
                        xmlDocument += `    <${elementType} url="${fwdVare164}" />\n`;
                    }
                    break;
                case 'pbx-disc':
                    xmlDocument += `    <${elementType} />\n`;
                    break;
                case 'pbx-prompt':
                    const promptVarUrl = row.querySelector('#inputVarUrl')?.value;
                    if (promptVarUrl) {
                        xmlDocument += `    <${elementType} url="${promptVarUrl}" />\n`;
                    }
                    break;
                case 'if-start':
                    const ifVarCond = row.querySelector('#inputVarCond')?.value;
                    const ifVarNotCond = row.querySelector('#selectVarCond')?.value;
                    if (ifVarNotCond == '==') {
                        xmlDocument += `    <if cond="${ifVarCond}" >\n`;
                    } else {
                        xmlDocument += `    <if notcond="${ifVarCond}" >\n`;
                    }
                    break;
                case 'if-end':
                    xmlDocument += `    </if>\n`;
                    break;
                case 'function-start':
                    const funcVarDefine = row.querySelector('#inputVarDefine')?.value;
                    if (funcVarDefine) {
                        xmlDocument += `    <function define="${funcVarDefine}" >\n`;
                    }
                    break;
                case 'function-end':
                    xmlDocument += `    </function>\n`;
                    break;
                case 'while-start':
                    const whileVarCond = row.querySelector('#inputVarCond')?.value;
                    const whileVarNotCond = row.querySelector('#selectVarCond')?.value;
                    if (whileVarNotCond == '==') {
                        xmlDocument += `    <while cond="${whileVarCond}" >\n`;
                    } else {
                        xmlDocument += `    <while notcond="${whileVarCond}" >\n`;
                    }
                    break;
                case 'while-end':
                    xmlDocument += `    </while>\n`;
                    break;
                case 'switch-start':
                    const switchVarName = row.querySelector('#inputVarName')?.value;
                    if (switchVarName) {
                        xmlDocument += `    <switch var="${switchVarName}" >\n`;
                    }
                    break;
                case 'switch-end':
                    xmlDocument += `    </switch>\n`;
                    break;
                case 'case-start':
                    const caseVarCond = row.querySelector('#inputVarCond')?.value;
                    const caseVarNotCond = row.querySelector('#selectVarCond')?.value;
                    if (caseVarNotCond == '==') {
                        xmlDocument += `    <case equal="${caseVarCond}" >\n`;
                    } else {
                        xmlDocument += `    <case not-equal="${caseVarCond}" >\n`;
                    }
                    break;
                case 'case-end':
                    xmlDocument += `    </case>\n`;
                    break;
                case 'pbx-getdtmfdigit':
                    const dtmfVarName = row.querySelector('#inputVarName')?.value;
                    if (dtmfVarName) {
                        xmlDocument += `    <${elementType} out-dtmf="${dtmfVarName}" >\n`;
                    }
                    break;
                case 'lib-strcat':
                    const strVarName = row.querySelector('#inputVarName')?.value;
                    const strVarValue = row.querySelector('#inputVarValue')?.value;
                    const strVarValue2 = row.querySelector('#inputVarValue2')?.value;
                    if (strVarName && strVarValue && strVarValue2) {
                        xmlDocument += `    <${elementType} out-string="${strVarName}" string="${strVarValue}" string2="${strVarValue2}"/>\n`;
                    }
                    break;
                case 'lib-strlen':
                    const lenVarName = row.querySelector('#inputVarName')?.value;
                    const lenVarValue = row.querySelector('#inputVarValue')?.value;
                    if (lenVarName && lenVarValue) {
                        xmlDocument += `    <${elementType} out-string="${lenVarName}" string="${lenVarValue}"/>\n`;
                    }
                    break;
                case 'lib-enc':
                    const encVarName = row.querySelector('#inputVarName')?.value;
                    const encVarValue = row.querySelector('#inputVarValue')?.value;
                    if (encVarName && encVarValue) {
                        xmlDocument += `    <${elementType} out-string="${encVarName}" string="${encVarValue}" type="url" />\n`;
                    }
                    break;
                case 'lib-dec':
                    const decVarName = row.querySelector('#inputVarName')?.value;
                    const decVarValue = row.querySelector('#inputVarValue')?.value;
                    if (decVarName && decVarValue) {
                        xmlDocument += `    <${elementType} out-string="${decVarName}" string="${decVarValue}" type="url" />\n`;
                    }
                    break;
                case 'event':
                    const eventVarDefine = row.querySelector('#inputVarDefine')?.value;
                    if (eventVarDefine) {
                        xmlDocument += `    <event type="dtmf" block="false">\n        <call name="${eventVarDefine}" />\n    </event>\n`;
                    }
                    break;
                default:
                    console.warn(`Unknown type: ${elementType}`);
            }
        });
        return xmlDocument;
    }
    //#endregion
}

Wecom.flowe.prototype = innovaphone.ui1.nodePrototype;
