function cadComida(comida1,comida2,comida3,comida4,comida5,comida6,comida7,comida8){

var tb = document.getElementById("tdComida");
var qtdlinhas = tb.rows.length;
var linha = tb.insertRow(qtdlinhas);


var comidaseg1 = linha.insertCell(0);
var comidaseg2 = linha.insertCell(1);
var comidaseg3 = linha.insertCell(2);
var comidaseg4 = linha.insertCell(3);
var comidaseg5 = linha.insertCell(4);
var comidaseg6 = linha.insertCell(5);
var comidaseg7 = linha.insertCell(6);
var comidaseg8 = linha.insertCell(7);

comidaseg1.innerHTML = comida1
comidaseg2.innerHTML = comida2
comidaseg3.innerHTML =  comida3
comidaseg4.innerHTML = comida4
comidaseg5.innerHTML = comida5
comidaseg6.innerHTML = comida6
comidaseg7.innerHTML = comida7
comidaseg8.innerHTML = comida8




}
