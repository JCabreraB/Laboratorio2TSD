var puerto = 8008;
var io = require('socket.io').listen(puerto);


////Tablero General/////
var MatrizTablero = new Array(10);
for(var i = 0; i<10;i++){
	MatrizTablero[i] = new Array(10);
	for(var j =0; j<10; j++){
		MatrizTablero[i][j] = 0;
	}
}

MatrizTablero [0][0] = 1;
MatrizTablero [9][9] = 3;
///Fin Tablero General////




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


function moverPieza(lado){

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

	var x = i;
	var y = j;

	if (lado == 0)
		x++;
	else if (lado == 1)
		x--;
	else if (lado == 2)
		y++;
	else if (lado == 3)
		y--;

	if (x >= 0 && x <= 9 && y >= 0 && y <= 9) {

		MatrizTablero[i][j] = 0;
		MatrizTablero[x][y] = 1;
	}


	Mostrar();

}




io.sockets.on('connection', function (socket) { // conexion

	socket.on('moverPieza', function (data) {

		moverPieza(data.lado);
		socket.emit('reciboActualizarTablero', {matriz: MatrizTablero});
		socket.broadcast.emit('reciboActualizarTablero', {matriz: MatrizTablero});

		//io.sockets.in(data.room).emit('draw', {x: data.x, y: data.y, type: data.type});
     	//socket.broadcast.emit('draw', {x: data.x, y: data.y, type: data.type});
    });

	socket.on('retornarMatriz', function (data) {
		
		socket.emit('recibirMatriz', {matriz: MatrizTablero});

	});

	socket.on('actualizarTablero', function (data)  {

		socket.emit('reciboActualizarTablero', {matriz: MatrizTablero});
	});


});

