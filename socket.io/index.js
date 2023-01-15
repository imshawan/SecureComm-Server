const { Server } = require('socket.io');
const passport = require('passport');
const {ExtractJwt} = require('passport-jwt');
const chalk = require('chalk');
const {Session, Token} = require('../models');
const userUtils = require('./user');
const {timeStamp} = require('../utils/utilities');
const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('../securecomm-serviceAccountKey.json');

const Sockets = module.exports;

const inactivityTime = (1000 * 60) * 2; // 2 minutes
var connectedUsers = [];

const firebaseApp = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount)
});

const messagingService = firebaseAdmin.messaging(firebaseApp);

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
        // console.log(sock)
    })

    socket.on('leave-room', (sock) => {
        let {room} = sock;
        socket.leave(room);
        // console.log(room)
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

    socket.on('message:send', sock => {
        // console.log(sock);
        // console.log(Sockets.io.sockets.adapter.rooms.get(6))
        socket.to(sock.room).emit('message:receive', sock);
    });

    socket.on('global:message:send', async (sock) => {
        const {currentRoom, message, chatUser} = sock;
        const {memberDetails, roomId} = currentRoom;

        const recipientFCMTokenData = await Token.findOne({user: memberDetails._id});

        if (recipientFCMTokenData && recipientFCMTokenData.token) {
            let {token} = recipientFCMTokenData;
            let {firstname, lastname, picture, _id} = chatUser;
            let payload = {
                message: message.message,
                user: JSON.stringify({
                    firstname, lastname, picture, _id
                }),
                roomId,
            };

            try {
                console.log('RoomId: ',roomId);
                console.log('typeof: ',typeof roomId);
                await messagingService.send({ data: payload, token });
            } catch (err) {
                console.error(err);
            }
        }

        socket.to(sock.room).emit('global:message:receive', sock);
    });

}