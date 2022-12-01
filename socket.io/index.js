const { Server } = require('socket.io');
const passport = require('passport');
const {ExtractJwt} = require('passport-jwt');
const {Session} = require('../models');

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

    socketIO.use(authenticate);
    socketIO.on('connection', onConnection);
    
    socketIO.listen(server, sockOptions);
    Sockets.io = socketIO;
}

async function authenticate (socket, next) {
    const {headers, request} = socket.handshake;
    const socketRequest = {...request, headers};

    const authorizationToken = ExtractJwt.fromAuthHeaderAsBearerToken()(socketRequest);

    if (!authorizationToken) {
        return next(new Error('Authorization token was not found in this connection'));
    }

    passport.authenticate('jwt', {session: false}, async function (err, user) {
        if (err || !user) {
            return next(new Error('Unauthorized! A valid token was not found in this connection'));
        }
        
        let session = await Session.findOne({user: user._id});
        if (!session || session.token != authorizationToken) {
            return next(new Error('Unable to verify the token! Please retry logging in'));
        }

        next();
    })(socketRequest, {}, next);
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

    socket.on('global:message:send', sock => {
        socket.to(sock.room).emit('global:message:receive', sock);
    });

    // socket.emit('message:receive', {sock})
}