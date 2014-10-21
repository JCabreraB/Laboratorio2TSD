var puerto = 8008;
var io = require('socket.io').listen(puerto);


var palabrasPersonaAnimalLugar = [
	"Tortuga", 1, 
	"Bosque", 2, 
	"Perro", 1,
	"Gato", 1,
	"Delfín", 2,
	"Desierto", 2,
	"Ballena", 2,
	"Hombre", 1,
	"Mujer", 1,
	"Travesti", 3
];

var palabrasObjeto = [
	"Casa", 1,
	"Árbol", 1, 
	"Billetera", 2,
	"Televisor", 1,
	"Lámpara", 1,
	"Escuadra", 1,
	"Lápiz", 1,
	"Moneda", 1,
	"Billete", 1,
	"Guitarra", 2
];

var palabrasAcción = [
	"Comer", 2,
	"Correr", 2,
	"Caminar", 2,
	"Jugar", 2,
	"Sentarse", 2,
	"Programar", 3,
	"Estudiar", 3,
	"Procrastinar", 3,
	"Escuchar", 3,
	"Gritar", 3
];

var palabrasProfesion = [
	"Profesor", 2,
	"Doctor", 2,
	"Programador", 2,
	"Atendedor de boludos", 4,
	"Limpiador", 2,
	"Cocinero", 2,
	"Músico", 2,
	"Pintor", 2,
	"Salvavidas", 3,
	"Dentista", 2
];

var palabrasRandom = [
	"Tortuga", 1,
	"Bosque", 2,
	"Perro", 1,
	"Atendedor de boludos", 4,
	"Limpiador", 2,
	"Cocinero", 2,
	"Procrastinar", 3,
	"Escuchar", 3,
	"Gritar", 3,
	"Profesor", 2
];
 
var listaUsuarios = [];
var roomsUsuarios = [];
var identificadoresJugadores = [];
var listaSalas = [];
var jugadoresSala = [];

////Tablero General/////
var MatrizTablero = new Array(10);
for(var i = 0; i<10;i++){
	MatrizTablero[i] = new Array(10);
}

MatrizTablero [0][0] = 1;
MatrizTablero [9][9] = 3;
///Fin Tablero General////



function palabraAzar() {

	var numero = Math.floor( (Math.random() * 5 ) );
	
	var lista;
	if (numero == 0)
		lista = palabrasPersonaAnimalLugar;
	else if (numero == 1)
		lista = palabrasObjeto;
	else if (numero == 2)
		lista = palabrasAcción;
	else if (numero == 3)
		lista = palabrasProfesion;
	else if (numero == 4)
		lista = palabrasRandom;

	var numero2 = Math.floor( (Math.random() * 10 ) );
	var numero2 = numero2 * 2;

	var palabra = [ lista[numero2], lista[numero2+1] ];

	return palabra;
}

function Mostrar(){

	var i , j = 0;
	var salir = false;

		for(i = 0; i < 10; i++){
		for(j = 0; j < 10; j++){
			if(MatrizTablero[i][j]==1){
				salir = true;
				break;
			}
		}	
		if(salir) break;	
	}

	console.log("El raton esta en : [", i ,"][", j ,"]\n");
}


function moverPieza(){

	var lado = data.Lado;
	var i, j = 0;
	var salir = false;

	for(i = 0; i < 10; i++){
		for(j = 0; j < 10; j++){
			if(MatrizTablero[i][j]==1){
				salir = true;
				break;
			}
		}	
		if(salir) break;	
	}

	MatrizTablero[i][j] = 0;

	if(lado == 0 && i<9 ) MatrizTablero[i+1][j] = 1;
	if(lado == 1 && i>0 ) MatrizTablero[i-1][j] = 1;
	if(lado == 2 && j<9 ) MatrizTablero[i][j+1] = 1;
	if(lado == 3 && j>0 ) MatrizTablero[i][j-1] = 1;

	Mostrar();

}


io.sockets.on('connection', function (socket) { // conexion

	socket.on('drawClick', function(data) {
		io.sockets.in(data.room).emit('draw', {x: data.x, y: data.y, type: data.type});
     	//socket.broadcast.emit('draw', {x: data.x, y: data.y, type: data.type});
    });

	socket.on('detenerJuego', function (data) {

		io.sockets.in(data.room).emit('retornoDetenerJuego', {});

	});

	socket.on('cancelarTimeout', function (data) {

		io.sockets.in(data.room).emit('retornoCancelarTimeout', {});
	});

	socket.on('anunciarGanador', function (data) {

		var ganador = 0;
		if (data.p1 > data.p2)
			ganador = 1;
		else if (data.p1 < data.p2)
			ganador = 2;

		io.sockets.in(data.room).emit('retornoAnunciarGanador', {ganador: ganador});
	});

	socket.on('siguienteRonda', function (data) {

		var estado = data.estado;
		var puntajes = [data.p1, data.p2];
		var palabra = palabraAzar();

		io.sockets.in(data.room).emit('iniciarRonda', {estado: estado, puntajes: puntajes, palabra: palabra});
	});

	socket.on('actualizarJugadoresSala', function (data) {
			
		var indicesUsuariosSala = [];
		var identificadoresSala = [];
		
		if (data.room != "Sala Principal") {
			for (var i = 0; i < listaUsuarios.length; i++) {
				var sala = roomsUsuarios[i];
				if (sala == data.room) {
					indicesUsuariosSala.push(i);
					identificadoresSala.push( identificadoresJugadores[i] );
				}
			}
		}

		var usuariosOrdenados = [];

		for (var j = 0; j < indicesUsuariosSala.length; j++) {
			for (var i = 0; i < indicesUsuariosSala.length; i++) {
				if (identificadoresSala[i] == j+1) {
					var nombre = listaUsuarios[ indicesUsuariosSala[i] ];
					usuariosOrdenados.push(nombre);
					break;
				}
			}
		}

		io.sockets.in(data.room).emit('retornoActualizarJugadores', {usuarios: usuariosOrdenados});

	});

	socket.on('obtenerSalas', function (data) {
		socket.emit('retornoObtenerSalas', {salas: listaSalas});
	});

	socket.on('enviarDatosPizarra', function (data) {
		if (data.room != "") {
			io.sockets.in(data.room).emit('retornoDatosPizarra', {datos: data.datos});
		}
	});

	socket.on('eliminarUsuario', function (data) {

		var indice = data.indice;
		listaUsuarios.splice(indice, 1);
		roomsUsuarios.splice(indice, 1);
		identificadoresJugadores.splice(indice, 1);

		for (var i = 0; i < listaUsuarios.length; i++) {
			var nombre = listaUsuarios[i];
			var nombreGenerico = "-Usuario" + (i+1) + "-";
			var nombreGenericoAntiguo = "-Usuario" + (i+2) + "-";
			if (nombre == nombreGenericoAntiguo)
				listaUsuarios[i] = nombreGenerico;
		}

		socket.broadcast.emit('retornoEliminacion', {indice: indice});
	});

	socket.on('ingresarUsuario', function (data) {

		var indice = data.indice;
		var room = data.room;
		
		if (indice == -1) 
			indice = listaUsuarios.length;

		var nombre = "-Usuario" + (indice+1) + "-";
		listaUsuarios.push(nombre);
		roomsUsuarios.push(room);
		identificadoresJugadores.push(0);

		socket.emit('retornarUsuario', {indice: indice, nombre: nombre});

	});

	socket.on('obtenerListaUsuarios', function (data) {

		var texto = "";
		for (var i = 0; i < listaUsuarios.length; i++) 
			texto += listaUsuarios[i] + " (" + roomsUsuarios[i] + ")\n";

		socket.broadcast.emit('retornarListaUsuarios', {texto: texto});
		socket.emit('retornarListaUsuarios', {texto: texto});
	});

	socket.on('obtenerNombreUsuario', function (data) {

		var indice = data.indice;
		var nombre = listaUsuarios[indice];
		socket.emit('retornarUsuario', {indice: indice, nombre: nombre});
	});
		
	socket.on('cambiarNombreUsuario', function (data) {
		
		var indice = data.indice;
		var nombre = data.nombre;

		var repetido = 0;
		for (var i = 0; i < listaUsuarios.length; i++) {
			if (listaUsuarios[i] == nombre) {
				repetido = 1;
				break;
			}
		}

		if (repetido == 0) 
			listaUsuarios[indice] = nombre;

		nombre = listaUsuarios[indice];
		socket.emit('retornarNuevoNombre', {nombre: nombre});
	});

	socket.on('agregarSala', function (data) {
		listaSalas.push(data.nombre);
		jugadoresSala.push(0);
		socket.broadcast.emit('retornoAgregarSala', {nombre: data.nombre});
	});

	socket.on('cambiarRoom', function (data) {

		var indiceSala = listaSalas.indexOf(data.room);
		var indiceJugador = listaUsuarios.indexOf(data.nombre);
		var cambio = 0;
		var iniciarJuego = 0;

		if (indiceSala != -1) {

			if (jugadoresSala[indiceSala] < 4) {

				cambio = 1;
				jugadoresSala[indiceSala]++;

				if (indiceJugador != -1) 
					identificadoresJugadores[indiceJugador] = jugadoresSala[indiceSala];
			}

			else 
				socket.emit('salaLlena', {});
		}

		else 
			cambio = 1;

		if (cambio == 1) {
			if (indiceJugador != -1)
				roomsUsuarios[indiceJugador] = data.room;
			socket.join(data.room);
			socket.emit('cambioExitosoSala', {});
		}

	});
	
	socket.on('comprobarInicioJuego', function (data) {

		var iniciarJuego = 0;
		var indiceSala = listaSalas.indexOf(data.room);
		if (indiceSala != -1) {
			if (jugadoresSala[indiceSala] == 4)
				iniciarJuego = 1;
		}

		if (iniciarJuego == 1) {
			var estado = 1;
			var puntajes = [0,0];
			var palabra = palabraAzar();
			io.sockets.in(data.room).emit('iniciarRonda', {estado: estado, puntajes: puntajes, palabra: palabra});
		}
	});

	socket.on('salirRoom', function (data) {

		var indiceSala = listaSalas.indexOf(data.room);
		var indiceJugador = listaUsuarios.indexOf(data.nombre);

		if (indiceSala != -1) {

			var nombreSala = listaSalas[indiceSala];
			jugadoresSala[indiceSala]--;
			
			if (indiceJugador != -1) {

				var identificadorJugador = identificadoresJugadores[indiceJugador];
				identificadoresJugadores[indiceJugador] = 0;

				for (var i = 0; i < roomsUsuarios.length; i++) {
					var idJugador = identificadoresJugadores[i];
					var sala = roomsUsuarios[i];
					if (sala == nombreSala && idJugador > identificadorJugador)
						identificadoresJugadores[i]--;
				}
			}
		}

		socket.leave(data.room);
	});

	socket.on('disconnect', function () {
		console.log("Usuario desconectado");
	});
	
	socket.on('broadcastDeCliente', function (data) {
		socket.broadcast.emit('alguienBroadcasteo', { texto:data.mensaje});
	});

	socket.on('enviarMensajeRoom', function (data) {
		if (data.room != "") {
			io.sockets.in(data.room).emit('retornoEnviarMensajeRoom', {room: data.room, texto: data.texto});
		}
	});

	socket.on('limpiarPizarrasSala', function (data) {
		io.sockets.in(data.room).emit('retornoLimpiarPizarras', {});
	});

});

