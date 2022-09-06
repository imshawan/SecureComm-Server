const { Server } = require('socket.io');

const Sockets = module.exports;

Sockets.init = function (server) {

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
    Sockets.io = socketIO;
}

function onConnection (socket) {

    socket.on('join-room', (sock) => {
        let {room} = sock;
        socket.join(room);
        console.log(sock)
    })

    socket.on('leave-room', (sock) => {
        let {room} = sock;
        socket.leave(room);
        console.log(room)
    })

    socket.on('message:send', sock => {
        console.log(sock);
        // console.log(Sockets.io.sockets.adapter.rooms.get(6))
        // console.log(Sockets.io.sockets.adapter.rooms.get(3))
        socket.to(sock.room).emit('message:receive', sock);
    });

    // socket.emit('message:receive', {sock})
}