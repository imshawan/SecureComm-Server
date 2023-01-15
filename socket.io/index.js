const { Server } = require('socket.io');
const passport = require('passport');
const {ExtractJwt} = require('passport-jwt');
const chalk = require('chalk');
const {Session, Token} = require('../models');
const userUtils = require('./user');
const {timeStamp} = require('../utils/utilities');
const {onGlobalMessageSent, onSingleMessage, updateMessageStatus} = require('./message');

const Sockets = module.exports;

const inactivityTime = (1000 * 60) * 2; // 2 minutes
var connectedUsers = [];

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
    console.info(timeStamp(), chalk.yellowBright(`Soeket.IO listening to incoming connections`));
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

        socket.user = user;
        next();
    })(socketRequest, {}, next);
}

function onConnection (socket) {
    var inactivityTimer, socketUserId = String(socket.user._id).trim();
    var index = connectedUsers.indexOf(socketUserId);
    if (index === -1) {
        connectedUsers.push(socketUserId);
    }
    if (socket.user && socket.user.status === 'offline') {
        // I will not use await here so that the execution doesn't stop right here.
        userUtils.updateUserPresence(socketUserId, 'online');
    }

    socket.on('disconnect', async () => {
        let userIndex = connectedUsers.indexOf(socketUserId);
        if (userIndex > -1) {
            connectedUsers.splice(userIndex, 1);
            await userUtils.updateUserPresence(socketUserId, 'offline');
        }
    });

    socket.on('join-room', (sock) => {
        let {room} = sock;
        socket.join(room);
    })

    socket.on('leave-room', (sock) => {
        let {room} = sock;
        socket.leave(room);
    });

    socket.on('user:ping', async (sock) => {
        const {status} = sock;
        if (typeof inactivityTimer === 'function') {
            clearTimeout(inactivityTimer);
        }

        await userUtils.updateUserPresence(socketUserId, 'online');
        inactivityTimer = setTimeout(userUtils.updateUserPresence.bind(null, socketUserId, 'offline'), inactivityTime);
        socket.to(sock.room).emit('user:pong', sock);
    });

    socket.on('message:send', onSingleMessage.bind(null, socket));

    socket.on('message:manage:status', updateMessageStatus.bind(null, socket));

    socket.on('global:message:send', onGlobalMessageSent.bind(null, socket));

}