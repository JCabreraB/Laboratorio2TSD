//var IPServidor = '158.170.248.192';	// Andy
//var IPServidor = '192.168.0.12';	// Hans
var IPServidor = 'localhost';// General.
//var IPServidor = = '192.168.43.35';

var puerto = 8008;
var direccion = 'http://' + IPServidor + ':' + puerto + '/';
var roomUsuario;
var indiceNombreUsuario = -1;
var indiceJugador = 0;

var tiempoTurno = 30000;
var maximoPuntaje = 10;

var estadoJuegoActual = 0;
var puntajes = [];
var palabra = "";
var puntajePalabra = 0;

var idTimeout = 0;
var idTimeoutReloj = 0;
var tiempoRestante = 0;

var dibujando = 0;

var matriz;

var MatrizTablero = new Array(10);
for(var i = 0; i<10;i++){
	MatrizTablero[i] = new Array(10);
	for(var j =0; j<10; j++){
		MatrizTablero[i][j] = 0;
	}
}

try {

	socket = io.connect(direccion); 

	socket.on('recibirMatriz', function (data) {
		
		MatrizTablero = data.matriz;

		//alert(MatrizTablero);

	});

	socket.on('reciboActualizarTablero', function (data) {

		MatrizTablero = data.matriz;
		cambiarTextoTodosBotones();

	});

	
}
catch (err) {
	alert('No está disponible el servidor Node.js');
}
	


function MoverPieza(movimiento){
	socket.emit("moverPieza", {lado: movimiento});

}

function PedirMatriz(){
	socket.emit("retornarMatriz", {});
}

function agregarBoton() {

	var boton = document.createElement('input');
	boton.setAttribute('type', 'button');
	boton.setAttribute('value', '-');

	var tablero = document.getElementById('tablero');

	tablero.appendChild(boton);
}

function crearTablero() {

	for (var i = 0; i < 10; i++) { 
		
		for (var j = 0; j < 10; j++) 
			agregarBoton();
		
		var tablero = document.getElementById('tablero');
		var br = document.createElement("br");
		tablero.appendChild(br);
	}
}

function cambiarTextoBoton(i, j, texto) {

	var tablero = document.getElementById('tablero');
	var largo = tablero.length;

	var indice = i + j * 10;

	var boton = tablero.elements.item(indice);
	boton.value = texto;
}

function cambiarTextoTodosBotones() {

	for (var i = 0; i < 10; i++) { 
		
		for (var j = 0; j < 10; j++) {

			var texto = "0";

			if (MatrizTablero[i][j]==1)
				texto = "1";
			else if (MatrizTablero[i][j]==3)
				texto = "3";

			cambiarTextoBoton(i, j, texto);

		}
	}

}

function actualizarTablero() {

	socket.emit('actualizarTablero', {});
}

function inicio() {

	crearTablero();
	actualizarTablero();
}

function fin() {

}
