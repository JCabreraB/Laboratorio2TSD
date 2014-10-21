//var IPServidor = '158.170.248.192';	// Andy
//var IPServidor = '192.168.0.12';	// Hans
var IPServidor = 'localhost';// General.
//var IPServidor = = '192.168.43.35';

var puerto = 8008;
var direccion = obtenerDireccionSocket();
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

try {

	socket = io.connect(direccion); 

	socket.on('retornoCancelarTimeout', function (data) {

		if (indiceJugador == 1 && idTimeout != 0) {
			window.clearTimeout(idTimeout);
			idTimeout = 0;
		}

		detenerReloj();
	});

	socket.on('retornoLimpiarPizarras', function (data) {
		limpiarPizarra();
	});

	socket.on('iniciarRonda', function (data) {
			
		limpiarPizarrasSala();

		estadoJuegoActual = data.estado;
		puntajes = data.puntajes;
		palabra = data.palabra[0];
		puntajePalabra = data.palabra[1];

		var puntosA = document.getElementById('puntosA');
		var puntosB = document.getElementById('puntosB');
		puntosA.innerHTML = puntajes[0];
		puntosB.innerHTML = puntajes[1];

		var texto = document.getElementById('estadoJuego');
		texto.innerHTML = "Jugando " + estadoJuegoActual;

		var textoPalabra = document.getElementById('palabra');
		
		dibujando = 0;
		var primeraParejaDibujando = estadoJuegoActual % 2;
		if ( (primeraParejaDibujando == 1 && indiceJugador < 3) ||
			 (primeraParejaDibujando == 0 && indiceJugador > 2) )
			dibujando = 1;

		if (dibujando)
			textoPalabra.innerHTML = "Dibujar: " + palabra;
		else 
			textoPalabra.innerHTML = "Adivinar el dibujo";

		idTimeout = 0;
		if (indiceJugador == 1) 
			idTimeout = window.setTimeout("siguienteRonda()", tiempoTurno);

		tiempoRestante = (tiempoTurno / 1000) + 1;
		actualizarReloj();
		
	});

	socket.on('retornoAnunciarGanador', function (data) {

		var grupo = 0;
		if (indiceJugador < 3)
			grupo = 1;
		else if (indiceJugador > 2)
			grupo = 2;

		if (data.ganador != 0) {
			if (data.ganador == grupo) 
				alert("Has ganado!");
			else 
				alert("Has perdido");
		}

		else 
			alert("Empate!");

		detenerPartidaActual();

		if (indiceJugador == 1)
			socket.emit('comprobarInicioJuego', {room: roomUsuario});
	});

	socket.on('retornoDetenerJuego', function (data) {

		detenerPartidaActual();
	});
	
	socket.on('retornoActualizarJugadores', function (data) {
		
		var nombre = document.getElementById('nombreUsuario').value;
		var unoA = document.getElementById('jugador1A');
		var dosA = document.getElementById('jugador2A');
		var unoB = document.getElementById('jugador1B');
		var dosB = document.getElementById('jugador2B');
		var puntosA = document.getElementById('puntosA');
		var puntosB = document.getElementById('puntosB');

		unoA.innerHTML = " - ";
		dosA.innerHTML = " - ";
		unoB.innerHTML = " - ";
		dosB.innerHTML = " - ";
		puntosA.innerHTML = "0";
		puntosB.innerHTML = "0";
		indiceJugador = 0;

		var usuarios = data.usuarios;
		for (var i = 0; i < usuarios.length; i++) {
			
			var jug = unoA;
			if (i == 1)
				jug = dosA;
			else if (i == 2)
				jug = unoB;
			else if (i == 3)
				jug = dosB;

			jug.innerHTML = usuarios[i];

			if (usuarios[i] == nombre)
				indiceJugador = i+1;
		}
	});

	socket.on('retornoObtenerSalas', function (data) {
		var lista = document.getElementById('listaSalas');
		for (var i = 0; i < data.salas.length; i++) 
			lista.options.add(new Option(data.salas[i], lista.length));
	});

	socket.on('salaLlena', function (data) {
		var lista = document.getElementById("listaSalas");
		lista.value = "0";
		alert("Sala llena");
		roomUsuario = "Sala Principal";
		cambiarSala();
	});

	socket.on('cambioExitosoSala', function (data) {
		
		document.getElementById('titulo').innerHTML = roomUsuario;
		socket.emit('actualizarJugadoresSala', {room: roomUsuario});
		socket.emit('comprobarInicioJuego', {room: roomUsuario});
	});

	socket.on('retornoDatosPizarra', function (data) {
		alert(data.datos);
		var pizarra = document.getElementById('pizarra').getContext("2d");
		pizarra.putImageData(data.datos,0,0);
	});

	socket.on('retornoAgregarSala', function (data) {
		var lista = document.getElementById('listaSalas');
		lista.options.add(new Option(data.nombre, lista.length));
	});

	socket.on('retornarListaUsuarios', function (data) {
		document.getElementById('listaUsuarios').value = data.texto;
	});

	socket.on('retornarUsuario', function (data) {
		indiceNombreUsuario = data.indice;
		document.getElementById('nombreUsuario').value = data.nombre;
	});

	socket.on('retornarNuevoNombre', function (data) {
		document.getElementById('nombreUsuario').value = data.nombre;
	});

	socket.on('retornoEliminacion', function (data) {
		var indiceEliminado = data.indice;
		if (indiceNombreUsuario > indiceEliminado) 
			indiceNombreUsuario = indiceNombreUsuario - 1;
		actualizarNombreUsuario();

	});

	socket.on('alguienBroadcasteo', function (data) {
		console.log("alguienBroadcasteo");
		document.getElementById('cuadroConversacion').value = data.texto;
	});

	socket.on('obtenerIndiceUsuario', function (data) {
		console.log("obtenerIndiceUsuario");
		indiceNombreUsuario = data.indice;
		document.getElementById('cuadroConversacion').value = data.indice;
	});

	socket.on('retornoEnviarMensajeRoom', function (data) {
		var mensajes = document.getElementById('cuadroConversacion').value;
		var mensaje = data.texto;
		var resultado = mensajes + '\n' + mensaje;
		document.getElementById('cuadroConversacion').value = resultado;
	});

}
catch (err) {
	alert('No está disponible el servidor Node.js');
}
	
function salaPrincipal() {
	agregarSalaPrincipal();
	mostrarCosas(0);
	roomUsuario = "Sala Principal";
	var nombre = document.getElementById('nombreUsuario').value;
	socket.emit('ingresarUsuario', {indice: indiceNombreUsuario, room: roomUsuario});
	socket.emit('cambiarRoom', {room: roomUsuario, nombre: nombre});
	actualizarListaUsuarios();
	obtenerSalas();
}

function MoverPieza(movimiento){

	socket.emit("moverPieza", {lado: movimiento});
}

function mostrarCosas(valor) {

	var mostrar = "none";
	if (valor == 1)
		mostrar = "block";

	var objetos = [];
	objetos.push( document.getElementById('contenedorPizarra') );
	objetos.push( document.getElementById('datosEquipos') );
	objetos.push( document.getElementById('datosJuego') );

	for (var i = 0; i < objetos.length; i++)
		objetos[i].style.display = mostrar;
}

function actualizarReloj() {

	tiempoRestante -= 1;
	var tiempo = document.getElementById('tiempoRestante');
	tiempo.innerHTML = "Tiempo restante: "  + tiempoRestante;

	if (tiempoRestante > 1) 
		idTimeoutReloj = window.setTimeout("actualizarReloj()", 1000);
}

function detenerReloj() {

	tiempoRestante = 0;
	var tiempo = document.getElementById('tiempoRestante');
	tiempo.innerHTML = "";

	if (idTimeoutReloj != 0)
		window.clearTimeout(idTimeoutReloj);
}

function detenerPartidaActual() {

	estadoJuegoActual = 0;
	puntajes = [0, 0];
	palabra = "";

	var texto = document.getElementById('estadoJuego');
	texto.innerHTML = "En espera";

	texto = document.getElementById('palabra');
	texto.innerHTML = "";

	if (idTimeout != 0)
		window.clearTimeout(idTimeout);

	detenerReloj();
	limpiarPizarrasSala();

}

function siguienteRonda() {
	estadoJuegoActual++;

	var huboGanador = 0;
	if (puntajes[0] >= maximoPuntaje || puntajes[1] >= maximoPuntaje)
		huboGanador = 1;

	if (huboGanador == 1 && estadoJuegoActual % 2 == 1)
		socket.emit('anunciarGanador', {room: roomUsuario, p1: puntajes[0], p2: puntajes[1]});
	else
		socket.emit('siguienteRonda', {room: roomUsuario, estado: estadoJuegoActual, p1: puntajes[0], p2: puntajes[1]});
}

function detenerJuego() {
	socket.emit('detenerJuego', {room: roomUsuario});
}

function obtenerSalas() {
	socket.emit('obtenerSalas', {});
}

function enviarDibujo() {
	var pizarra = document.getElementById('pizarra').getContext("2d");
	var datos = pizarra.getImageData(0,0,300,300).data;
	socket.emit('enviarDatosPizarra', {room: roomUsuario, datos: datos});
}

function agregarSalaPrincipal() {
	var lista = document.getElementById('listaSalas');
	lista.options.add(new Option("Sala Principal", "0"));
}

function agregarSala() {

	var lista = document.getElementById("listaSalas");
	var nombre = document.getElementById('nombreSalaNueva').value;
	var largo = lista.length;

	if (nombre != "") {

		var repetido = 0;
		for (var i = 0; i < largo; i++) {
			var nombreOpcion = lista.options[i].text;
			if (nombre == nombreOpcion) {
				repetido = 1;
				break;
			}
		}

		if (repetido == 0) {
			lista.options.add(new Option(nombre,largo));
			lista.value = largo;
			socket.emit('agregarSala', {nombre: nombre});
			cambiarSala();
		}
	}
}

function cambiarNombreUsuario() {
	var nombre = document.getElementById('nombreUsuario').value;
	socket.emit('cambiarNombreUsuario', {indice: indiceNombreUsuario, nombre: nombre});
	actualizarListaUsuarios();
	socket.emit('actualizarJugadoresSala', {room: roomUsuario});
}

function cambiarSala() {
	var salaAnterior = roomUsuario;
	var nombre = document.getElementById('nombreUsuario').value;
	detenerJuego();
	socket.emit('salirRoom', {room: roomUsuario, nombre: nombre});
	var e = document.getElementById("listaSalas");
	roomUsuario = e.options[e.selectedIndex].text;

	if (roomUsuario == "Sala Principal")
		mostrarCosas(0);
	else 
		mostrarCosas(1);

	socket.emit('cambiarRoom', {room: roomUsuario, nombre: nombre});
	
	limpiarConversacion();
	actualizarListaUsuarios();

	socket.emit('actualizarJugadoresSala', {room: salaAnterior});
}

function salirRoom() {
	var salaAnterior = roomUsuario;
	var nombre = document.getElementById("nombreUsuario").value;
	var e = document.getElementById("listaSalas");
	var id = e.options[e.selectedIndex].text;
	detenerJuego();
	socket.emit('salirRoom', {room: id, nombre: nombre});
	id = "Sala Principal";
	socket.emit('cambiarRoom', {room: id, nombre: nombre});
	var valor = "0";
	$("#listaSalas option[value="+ valor +"]").attr("selected",true);
	
	socket.emit('actualizarJugadoresSala', {room: salaAnterior});
	socket.emit('actualizarJugadoresSala', {room: roomUsuario});
}	

function actualizarListaUsuarios() {
	socket.emit('obtenerListaUsuarios', {});
}

function actualizarNombreUsuario() {
	socket.emit('obtenerNombreUsuario', {indice: indiceNombreUsuario});
	actualizarListaUsuarios();
}

function actualizarConversacion() {
	var texto = document.getElementById('cuadroConversacion').value;
	socket.emit('broadcastDeCliente', {mensaje: texto});
}

function enviarMensajeSala() {
	var nombreUsuario = document.getElementById('nombreUsuario').value;
	var texto = document.getElementById('cuadroChat').value;
	var mensaje = nombreUsuario + ': ' + texto;
	socket.emit('enviarMensajeRoom', {room: roomUsuario, texto: mensaje});
	document.getElementById('cuadroChat').value = "";

	if (estadoJuegoActual > 0 && dibujando == 0 && texto == palabra) {
		var indicePareja = estadoJuegoActual % 2;
		puntajes[indicePareja] += puntajePalabra;
		socket.emit('cancelarTimeout', {room: roomUsuario});
		siguienteRonda();
	}
}
	
function cerrarCon() {
	salirRoom();
	socket.emit('eliminarUsuario', {indice: indiceNombreUsuario});
	socket.disconnect();
}

function limpiarConversacion() {
	var cuadroConversacion = document.getElementById('cuadroConversacion');
	var cuadroChat = document.getElementById('cuadroChat');
	cuadroConversacion.value = "";
	cuadroChat.value = "";
}

function limpiarPizarrasSala() {
	socket.emit('limpiarPizarrasSala', {room: roomUsuario});
}

window.onbeforeunload = function () {
	cerrarCon();
}

function obtenerDireccionSocket() {
	var direccion = 'http://' + IPServidor + ':' + puerto + '/';
	return direccion;
}
