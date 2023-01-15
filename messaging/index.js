const {Room, Message} = require('../models');
const {messageObject} = require('../models/message');
const {incrementFieldCount, utilities} = require('../utils');

const messaging = module.exports;
const messageFields = Object.keys(messageObject).filter(elem => messageObject[elem]['required']);
const userFields = ['firstname', 'lastname', 'picture', 'username'];
const validMessageStatuses = ['sent', 'delivered', 'read'];

messaging.getMessages = async (data) => {
    const {page=0, limit=50, roomId, user} = data;

    if (!roomId) {
        throw new Error(`Property 'roomId' is missing from data`)
    }

    if (!user) {
        throw new Error(`Property 'user' is missing from data`)
    }

    if (user.length != 24) {
        throw new Error('Invalid user id supplied');
    }

    if (isNaN(roomId)) {
        throw new Error('roomId must be a number');
    }

    const keys = {roomId};

    const roomData = await Room.findOne(keys);
    if (!roomData) {
        throw new Error('No information was found with the room Id');
    }

    if (!roomData.members.includes(user)) {
        throw new Error('You are not authorized to view messages for this chat');
    }

    const [messages, count=0] = await Promise.all([
        Message.find(keys).populate('toId', userFields).populate('fromId', userFields)
                .sort({ _id: -1 }).skip(page * limit).limit(limit),
        Message.countDocuments(keys)
    ])

    return {messages, count};
}

messaging.createMessage = async (message={}) => {
    if (typeof message != 'object') {
        throw new Error(`Message must be an object, found ${typeof message} instead`);
    }

    const missingFields = [];

    messageFields.forEach(field => {
        if (!Object.keys(message).includes(field)) {
            missingFields.push(field);
        }
    });

    if (missingFields.length) {
        throw new Error('Required fields were missing: ' + missingFields.join(', '));
    }

    const id = await incrementFieldCount('messageId');
    message.id = id;

    try {
        return await Message.create(message);
    } catch (err) {
        throw new Error(err.message);
    }
}

messaging.deleteMessage = async (data) => {
    const {user, messageId} = data;

    validateRequiredProperties(data);
    await hasPermissionToAccess(messageId, user);

    const acknowledgement = await Message.deleteOne({
        user, id: messageId
    })

    return {deleted: acknowledgement && acknowledgement.deletedCount === 1};
}

messaging.updateStatus = async (data) => {
    const {user, messageId, status} = data;

    if (!status) {
        throw new Error(`Property 'status' is missing from data`);
    }

    if (!validMessageStatuses.includes(status)) {
        throw new Error('Invalid status: ' + status + ', valid statuses are: ' + validMessageStatuses.join(', '));
    }

    validateRequiredProperties(data);
    await hasPermissionToAccess(messageId, user);
    
    const acknowledgement = await Message.updateOne({id: messageId}, {$set: {status}});

    return {updated: acknowledgement && acknowledgement.nModified === 1};
}

function validateRequiredProperties (data) {
    
    if (!data.hasOwnProperty('user') || !data.user) {
        throw new Error(`Property 'user' is missing from data`);
    }

    if (!data.hasOwnProperty('messageId') || !data.messageId) {
        throw new Error(`Property 'messageId' is missing from data`);
    }

    if (data.user.length != 24) {
        throw new Error('Invalid user id supplied');
    }

    if (isNaN(data.messageId)) {
        throw new Error('MessageId must be a number');
    }
}

async function hasPermissionToAccess (messageId, user) {
    const message = await Message.findOne({id: messageId});
    if (!message) {
        throw new Error('No message was found against the supplied messageId');
    }

    if (String(message.user) != user) {
        throw new Error('You are unauthorized to access');
    }
}

messaging.updateStatus({
    user: '631ac5bfc8245bc7c98456a5', messageId: 188, status: 'sents'
})