const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('../securecomm-serviceAccountKey.json');
const messaging = require('../messaging');
const {Session, Token} = require('../models');

const firebaseApp = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount)
});

const messagingService = firebaseAdmin.messaging(firebaseApp);
const message = module.exports;

message.onGlobalMessageSent = async (socket, data) => {
    const {currentRoom, message, chatUser, room} = data;
    const {memberDetails, roomId} = currentRoom;
    const {user} = socket;

    const recipientFCMTokenData = await Token.findOne({user: memberDetails._id});
    var messagePayload = {...message, roomId};

    if (recipientFCMTokenData && recipientFCMTokenData.token) {
        const {token} = recipientFCMTokenData;
        const {firstname, lastname, picture, _id} = chatUser;
        const data = {
            message: message.message,
            user: JSON.stringify({
                firstname, lastname, picture, _id
            }),
            roomId: String(roomId),
        };

        const android = {
            // Required for background/quit data-only messages on Android
            priority: 'high',
        };

        try {
            await messagingService.send({ data, token, android });

        } catch (err) {
            console.error(err);
        }
    }

    socket.to(room).emit('global:message:receive', data);

    if (messagePayload.hasOwnProperty('_id')) {
        delete messagePayload._id;
    }

    messagePayload.user = user._id;

    await messaging.createMessage(messagePayload);
}

message.onSingleMessage = async (socket, data) => {
    const {room} = data;
    // console.log(data);
    // console.log(Sockets.io.sockets.adapter.rooms.get(6))
    socket.to(room).emit('message:receive', data);
}

message.updateMessageStatus = async (socket, data) => {
    console.log(data);
}