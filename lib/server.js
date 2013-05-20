var net = require('net');
var server = net.createServer(function(socket) {
	socket.setTimeout(4000,function(){
		//console.log('timeout');
		socket.end();
	})
});

server.listen(8124);