document.addEventListener('DOMContentLoaded', () => {
    let nextIndex = 0;
    let processCardName = 'main';
    const openButton = document.getElementById('open');
    const newButton = document.getElementById('new');
    const saveButton = document.getElementById('save');
    const deleteButton = document.getElementById('delete');
    const leftPane = document.getElementById('left-pane');
    const rightPane = document.getElementById('right-pane');
    const headerProcess = document.getElementById('process-card-header')

    const elements = [
        { id: 'add', name: 'Soma', description: 'Soma o valor de duas variaveis', img: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>' },
        { id: 'sub', name: 'Subtração', description: 'Subtrai o valor de duas variaveis', img: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus"><path d="M5 12h14"/></svg>' },
        { id: 'assign', name: 'Assign Variable', description: 'Cria ou Atribui valor a uma variavel', img: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-equal"><line x1="5" x2="19" y1="9" y2="9"/><line x1="5" x2="19" y1="15" y2="15"/></svg>' },
        { id: 'call', name: 'Call a function', description: 'Chama uma função definida', img: '<svg role="img" aria-hidden="true" focusable="false" data-prefix="far" data-icon="function" class="svg-inline--fa fa-function fa-fw" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M72 88c0-48.6 39.4-88 88-88h40c13.3 0 24 10.7 24 24s-10.7 24-24 24H160c-22.1 0-40 17.9-40 40V192h48c13.3 0 24 10.7 24 24s-10.7 24-24 24H120V390.7c0 44.8-33.7 82.5-78.3 87.5l-15.1 1.7c-13.2 1.5-25-8-26.5-21.2s8-25 21.2-26.5l15.1-1.7C56.7 428.2 72 411.1 72 390.7V240H24c-13.3 0-24-10.7-24-24s10.7-24 24-24H72V88zm244.3 76.8C288.4 209.1 272 262.5 272 320s16.4 110.9 44.3 155.2c7.1 11.2 3.7 26-7.5 33.1s-26 3.7-33.1-7.5C243 448.9 224 386.7 224 320s19-128.9 51.7-180.8c7.1-11.2 21.9-14.6 33.1-7.5s14.6 21.9 7.5 33.1zm231.4 0c-7.1-11.2-3.7-26 7.5-33.1s26-3.7 33.1 7.5C621 191.1 640 253.3 640 320s-19 128.9-51.7 180.8c-7.1 11.2-21.9 14.6-33.1 7.5s-14.6-21.9-7.5-33.1C575.6 430.9 592 377.5 592 320s-16.4-110.9-44.3-155.2zM393 247l39 39 39-39c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-39 39 39 39c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-39-39-39 39c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z"></path></svg>' },
        { id: 'dbg', name: 'Debug', description: 'Escreve no até 2 valores no Trace do PBX', img: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bug-play"><path d="M12.765 21.522a.5.5 0 0 1-.765-.424v-8.196a.5.5 0 0 1 .765-.424l5.878 3.674a1 1 0 0 1 0 1.696z"/><path d="M14.12 3.88 16 2"/><path d="M18 11a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4v3a6.1 6.1 0 0 0 2 4.5"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M6 13H2"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="m8 2 1.88 1.88"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/></svg>' },
        { id: 'else-start', name: 'Else (Início)', description: 'Início de um Bloco condicional ELSE após um IF', img: '<svg role="img" aria-hidden="true" focusable="false" data-prefix="fal" data-icon="diamond" class="svg-inline--fa fa-diamond fa-fw" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M250.3 34.3c3.1-3.1 8.2-3.1 11.3 0l216 216c3.1 3.1 3.1 8.2 0 11.3l-216 216c-3.1 3.1-8.2 3.1-11.3 0l-216-216c-3.1-3.1-3.1-8.2 0-11.3l216-216zm33.9-22.6c-15.6-15.6-40.9-15.6-56.6 0l-216 216c-15.6 15.6-15.6 40.9 0 56.6l216 216c15.6 15.6 40.9 15.6 56.6 0l216-216c15.6-15.6 15.6-40.9 0-56.6l-216-216z"></path></svg>' },
        { id: 'else-end', name: 'Else (Fim)', description: 'Fim de um Bloco condicional ELSE após um IF', img: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code-xml"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>' },
        { id: 'while-start', name: 'Loop While (Início)', description: 'Executa um Loop enquanto definido', img: '<svg role="img" aria-hidden="true" focusable="false" data-prefix="far" data-icon="arrow-rotate-left" class="svg-inline--fa fa-arrow-rotate-left fa-fw" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M40 224c-13.3 0-24-10.7-24-24V56c0-13.3 10.7-24 24-24s24 10.7 24 24v80.1l20-23.5C125 63.4 186.9 32 256 32c123.7 0 224 100.3 224 224s-100.3 224-224 224c-50.4 0-97-16.7-134.4-44.8c-10.6-8-12.7-23-4.8-33.6s23-12.7 33.6-4.8C179.8 418.9 216.3 432 256 432c97.2 0 176-78.8 176-176s-78.8-176-176-176c-54.3 0-102.9 24.6-135.2 63.4l-.1 .2 0 0L93.1 176H184c13.3 0 24 10.7 24 24s-10.7 24-24 24H40z"></path></svg>' },
        { id: 'while-end', name: 'Loop While (Fim)', description: 'Encerra a declaração um Loop', img: '<svg role="img" aria-hidden="true" focusable="false" data-prefix="far" data-icon="arrow-rotate-left" class="svg-inline--fa fa-arrow-rotate-left fa-fw" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M40 224c-13.3 0-24-10.7-24-24V56c0-13.3 10.7-24 24-24s24 10.7 24 24v80.1l20-23.5C125 63.4 186.9 32 256 32c123.7 0 224 100.3 224 224s-100.3 224-224 224c-50.4 0-97-16.7-134.4-44.8c-10.6-8-12.7-23-4.8-33.6s23-12.7 33.6-4.8C179.8 418.9 216.3 432 256 432c97.2 0 176-78.8 176-176s-78.8-176-176-176c-54.3 0-102.9 24.6-135.2 63.4l-.1 .2 0 0L93.1 176H184c13.3 0 24 10.7 24 24s-10.7 24-24 24H40z"></path></svg>' },
        { id: 'event', name: 'Evento DTMF', description: 'Evento DTMF do PBX', img: '<svg role="img" aria-hidden="true" focusable="false" data-prefix="far" data-icon="calculator" class="svg-inline--fa fa-calculator fa-fw" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M336 176V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V176H336zm0-48H48V64c0-8.8 7.2-16 16-16H320c8.8 0 16 7.2 16 16v64zm48 0V64c0-35.3-28.7-64-64-64H64C28.7 0 0 28.7 0 64v64 24 24V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V176 152 128zM80 232a24 24 0 1 0 48 0 24 24 0 1 0 -48 0zm24 64a24 24 0 1 0 0 48 24 24 0 1 0 0-48zM80 408c0 13.3 10.7 24 24 24h88c13.3 0 24-10.7 24-24s-10.7-24-24-24H104c-13.3 0-24 10.7-24 24zM192 208a24 24 0 1 0 0 48 24 24 0 1 0 0-48zM168 320a24 24 0 1 0 48 0 24 24 0 1 0 -48 0zM280 208a24 24 0 1 0 0 48 24 24 0 1 0 0-48zM256 320a24 24 0 1 0 48 0 24 24 0 1 0 -48 0zm24 64a24 24 0 1 0 0 48 24 24 0 1 0 0-48z"></path></svg>' },
        { id: 'exec', name: 'Exec', description: 'Requisição Http GET para uma url', img: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>' },
        { id: 'function-start', name: 'Funcão (Início)', description: 'Declara o início de uma função', img: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>' },
        { id: 'function-end', name: 'Funcão (Fim)', description: 'Declara o fim de uma função', img: '<svg role="img" aria-hidden="true" focusable="false" data-prefix="fal" data-icon="code" class="svg-inline--fa fa-code fa-fw" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M405.1 .8c-8.4-2.8-17.4 1.7-20.2 10.1l-160 480c-2.8 8.4 1.7 17.4 10.1 20.2s17.4-1.7 20.2-10.1l160-480c2.8-8.4-1.7-17.4-10.1-20.2zM172 117.4c-5.9-6.6-16-7.2-22.6-1.3l-144 128C2 247.1 0 251.4 0 256s2 8.9 5.4 12l144 128c6.6 5.9 16.7 5.3 22.6-1.3s5.3-16.7-1.3-22.6L40.1 256 170.6 140c6.6-5.9 7.2-16 1.3-22.6zm296.1 0c-5.9 6.6-5.3 16.7 1.3 22.6L599.9 256 469.4 372c-6.6 5.9-7.2 16-1.3 22.6s16 7.2 22.6 1.3l144-128c3.4-3 5.4-7.4 5.4-12s-2-8.9-5.4-12l-144-128c-6.6-5.9-16.7-5.3-22.6 1.3z"></path></svg>' },
        { id: 'wait', name: 'Aguardar', description: 'Aguarda tantos segundos definidos', img: '<svg role="img" aria-hidden="true" focusable="false" data-prefix="far" data-icon="clock" class="svg-inline--fa fa-clock fa-fw" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"></path></svg>' },
        { id: 'if-start', name: 'If (Início)', description: 'Início do Bloco condicional IF', img: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-workflow"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></svg>' },
        { id: 'if-end', name: 'If (Fim)', description: 'Fim do Bloco condicional IF, pode ser seguido de um Bloco ELSE', img: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code-xml"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>' },
        { id: 'pbx-xfer', name: 'Transferência', description: 'Transfere a ligação para um número', img: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-redo-dot"><circle cx="12" cy="17" r="1"/><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>' },
        { id: 'pbx-disc', name: 'Desconecta', description: 'Desconecta a chamada do script', img: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-unplug"><path d="m19 5 3-3"/><path d="m2 22 3-3"/><path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"/><path d="M7.5 13.5 10 11"/><path d="M10.5 16.5 13 14"/><path d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z"/></svg>' },
        { id: 'store-get', name: 'Obtem arquivos remotos', description: 'Constroi uma URL para acesso a arquivos', img: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-download"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg>' },
        { id: 'pbx-prompt', name: 'Prompt', description: 'Reproduz um arquivo de áudio', img: '<svg role="img" aria-hidden="true" focusable="false" data-prefix="fal" data-icon="music" class="svg-inline--fa fa-music fa-fw" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M512 23c0-12.7-10.3-23-23-23c-2.3 0-4.6 .3-6.8 1l-311 95.7C164.6 98.8 160 105 160 112V232 372.4C143 359.7 120.6 352 96 352c-53 0-96 35.8-96 80s43 80 96 80s96-35.8 96-80V246.3l288-88.6V308.4c-17-12.7-39.4-20.4-64-20.4c-53 0-96 35.8-96 80s43 80 96 80s96-35.8 96-80V136.4c0-.2 0-.5 0-.7V23zM480 368c0 21.3-22.9 48-64 48s-64-26.7-64-48s22.9-48 64-48s64 26.7 64 48zM160 432c0 21.3-22.9 48-64 48s-64-26.7-64-48s22.9-48 64-48s64 26.7 64 48zM480 124.2L192 212.8v-89L480 35.2v89z"></path></svg>' },
    ];

    leftPane.innerHTML = elements.map(el =>
        `<app-box-item element="${el.id}"  _ngcontent-serverapp-c1993480350="" _nghost-serverapp-c1014264283="" tabindex="0" class="full-width element">
        <div _ngcontent-serverapp-c1014264283="" class="box-wrapper d-flex flex-row flex-wrap theme-secondary">
        <!----><div _ngcontent-serverapp-c1014264283="" class="box-title">
        <div _ngcontent-serverapp-c1014264283="" class="box-icon">
        <fa-icon _ngcontent-serverapp-c1014264283="" class="ng-fa-icon">${el.img}</fa-icon>
        </div>
        <!---->
        <!---->
        <div _ngcontent-serverapp-c1014264283="" class="box-card">
        <!---->
        <h1 _ngcontent-serverapp-c1014264283="" class="mb-0">${el.name}</h1>
        <p _ngcontent-serverapp-c1014264283="">${el.description}</p>
        <!---->
        </div>
        <!---->
        <!---->
        </div>
        <!---->
        <div _ngcontent-serverapp-c1014264283="" class="favorite-icon pointer filled">
        <fa-icon _ngcontent-serverapp-c1014264283="" class="ng-fa-icon">
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

    newButton.addEventListener('click', () => {
        const summaryTitle = document.getElementById('app-process-summary-title');
        if (summaryTitle) {
            const secondDiv = summaryTitle.querySelectorAll('div')[1]; // Isso pega a segunda div aninhada
            if (secondDiv) {
                secondDiv.innerHTML = `
                <input type="text" id="filename" placeholder="Nome do arquivo">
            `;
            }
        }
    });
    openButton.addEventListener('click', async () => {
        const response = await fetch('/api/files');
        const files = await response.json();
        const summaryTitle = document.getElementById('app-process-summary-title');
        if (summaryTitle) {
            const secondDiv = summaryTitle.querySelectorAll('div')[1]; // Isso pega a segunda div aninhada
            if (secondDiv) {
                secondDiv.innerHTML = files.map(file => `<div class="file">${file}</div>`).join('');
            }
        }
        addFileClickListeners();
    });
    saveButton.addEventListener('click', async () => {
        const filename = document.getElementById('filename').value;
        console.log('Xml Filename: ' + filename)
        //const elements = [...document.querySelectorAll('#selected-elements .element')].map(el => el.textContent);
        //const content = elements.map(el => `<${el} />`).join('\n');

        const xmlDoc = createVoicemailXml()

        const response = await fetch('/api/files/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, xmlDoc })
        });

        if (response.ok) {
            alert('File saved successfully');
        } else {
            alert('Error saving file');
        }
    });
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

                default:
                    console.warn(`Unknown type: ${elementType}`);
            }
        });
        return xmlDocument;
    }
    function addElementClickListeners() {
        document.querySelectorAll('.element').forEach(el => {
            el.addEventListener('click', () => {

                if (processCardName == null) {
                    window.alert("Selecione em qual parte do escript o elemento deve ser adicionado")
                    return
                }

                if (nextIndex == null) {
                    window.alert("Selecione uma posição para continuar criando o script")
                    return
                }
                const processCard = document.querySelector('app-process-' + processCardName + '-card')
                const functionContainer = processCard.querySelector('#function-stack-container-' + processCardName);
                //verifica se o aviso de nenhuma fun��o est� ativo
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
                }

                //functionContainer.insertAdjacentHTML('beforeend', component);

                // Converte a string do componente para um elemento DOM.
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = component.trim();
                const newElement = tempDiv.firstChild;

                // Seleciona todos os elementos filhos dentro do cont�iner.
                const allRows = functionContainer.querySelectorAll('app-process-function-stack-row-type-generic')
                //const allRows = functionContainer.children;

                if (nextIndex < allRows.length) {
                    // Se o nextIndex for v�lido, insere o novo componente ap�s o elemento com previousIndex.
                    const nextElement = allRows[nextIndex];
                    functionContainer.insertBefore(newElement, nextElement);

                    //Reordenar Stacks
                    updateStackIndex(processCard, nextIndex + 1, 1)

                    const divCount = functionContainer.querySelectorAll('app-process-function-stack-row-type-generic').length;
                    if (nextIndex == 0 && divCount.length == 1) {
                        nextIndex = null
                    }
                } else {
                    // Se nextIndex for o �ltimo, insere no final.
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
    // Fun��o para adicionar listeners aos inputs result as
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
    // Fun��o que trata a mudan�a no input
    function handleInputChange(event) {
        const changedInput = event.target;
        // Encontra o caminho espec�fico at� o app-process-function-stack-row-type-generic correspondente
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
    // Fun��o para adicionar listeners nas Stacks
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
    // Fun��o para adicionar Listners Lower Actions
    function addEventListenerToLowerActions(card) {
        const lowerActions = card.querySelectorAll('.function-stack-lower-actions');

        lowerActions.forEach(button => {
            button.removeEventListener('click', lowerActionsclick);
            button.addEventListener('click', lowerActionsclick);
        });


    }
    //Fun��o auxiliar para Tratar Clicks em Lower Actions
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
    // Fun��o para adicionar Listners Hover Delete Stack
    function addEventListenerToDellStacks(card) {
        const deleteButtons = card.querySelectorAll('#deleteStack');

        deleteButtons.forEach(button => {
            button.removeEventListener('click', deleteStack);
            button.addEventListener('click', deleteStack);
        });


    }
    // Fun��o para deletar um elemento pelo index e ajustar os �ndices
    function deleteStack(event) {
        const targetIndex = parseInt(event.currentTarget.getAttribute('index')); // Parse para garantir que seja um n�mero
        const targetCard = event.currentTarget.getAttribute('card');
        const card = document.querySelector('app-process-' + targetCard + '-card')
        let allRows = card.querySelectorAll('app-process-function-stack-row-type-generic');

        if (targetIndex >= 0 && targetIndex < allRows.length) {
            // Remove o elemento do DOM pelo �ndice targetIndex
            const removedElement = allRows[targetIndex];
            removedElement.parentNode.removeChild(removedElement);
            console.log(`Elemento com �ndice ${targetIndex} removido.`);

            // Atualiza os �ndices dos elementos restantes
            allRows = card.querySelectorAll('app-process-function-stack-row-type-generic');
            updateStackIndex(card, targetIndex, -1)

            // Verifica se n�o h� um �nico elemento restante e exibe um aviso se necess�rio
            if (allRows.length === 0) {
                const functionContainer = card.querySelector('#function-stack-container-' + targetCard);
                //verifica se o aviso de nenhuma fun��o est� ativo
                const functionStack = functionContainer.querySelector('app-process-card-no-items')

                if (functionStack) {
                    functionStack.classList.remove('hidden');
                    nextIndex = 0;
                }
            }

        } else {
            console.log(`�ndice ${targetIndex} � inv�lido.`);
        }
    }
    //Fun��o para Atualizar Indice em Stacks
    function updateStackIndex(card, targetIndex, offSet) {
        // Atualiza os �ndices dos elementos restantes
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

            // Atualiza o �ndice do bot�o delete dentro desse elemento
            const deleteButton = rowElement.querySelector('#deleteStack');
            if (deleteButton) {
                deleteButton.setAttribute('index', newIndex);
            }

            // Atualiza o �ndice do bot�o lower-action dentro desse elemento
            const lowerAction = rowElement.querySelector('#function-stack-lower-actions');
            if (lowerAction) {
                lowerAction.setAttribute('index', newIndex + 1);
            }
        }
        selectLastLowerAction(card)
    }
    //Fun��o para selecionar sempre o �ltimo Lower Action
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
    //Abre o arquivo selecionado
    function addFileClickListeners() {
        document.querySelectorAll('.file').forEach(file => {
            file.addEventListener('click', async () => {
                const response = await fetch(`/api/files/${file.textContent}`);
                const data = await response.json();
                setProccessTitle(file.textContent.replace('.xml', ''))

                // rightPane.innerHTML = `
                //     <input type="text" id="filename" value="${file.textContent.replace('.xml', '')}">
                //     <div id="selected-elements">${data.content}</div>
                // `;
            });
        });
    }
    // Atualiza o nome do arquivo selecionado
    function setProccessTitle(title) {
        const summaryTitle = document.getElementById('app-process-summary-title');
        if (summaryTitle) {
            const secondDiv = summaryTitle.querySelectorAll('div')[1]; // Isso pega a segunda div aninhada
            if (secondDiv) {
                secondDiv.textContent = title; // Altera o conte�do da segunda div
            }
        }
    }
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
});
