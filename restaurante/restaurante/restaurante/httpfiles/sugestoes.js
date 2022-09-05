// OCULTAR A OPÇÃO "SEU NOME" PARA CASO O USUARIO QUEIRA RESPONDER ANONIMAMENTE
var anom = prompt(" Deseja responder anonimamente? ")
var none = document.getElementById('res')
var anomcheck = document.getElementById('anomcheck')

if (anom.toLowerCase() == 'sim') {
    none.innerHTML = ' '
}