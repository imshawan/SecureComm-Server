const { Server } = require('socket.io');

const sockets = module.exports;

sockets.init = function (server) {

    let socketIO = new Server({
		path: '/socket.io',
	});

    const sockOptions = {
		transports: ['polling', 'websocket'],
		cookie: false,
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            allowedHeaders: ['content-type'],
        }
	};

    socketIO.on('connection', onConnection);
    
    socketIO.listen(server, sockOptions);
}

function onConnection (socket) {
    console.log(socket)
}