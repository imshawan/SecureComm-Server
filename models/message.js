const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageObject = {
    name: {
        type: String,
        default: ''
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    id: {
        type: Number,
    },
    fromId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    toId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roomId: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: new Date(Date.now()).toISOString()
    },
    status: {
        type: String,
        default: 'sent'
    },
};

const messageSchema = new Schema(messageObject, {
    timestamps: true
});

const message = mongoose.model('Message', messageSchema);

module.exports = {
    message, messageObject
};