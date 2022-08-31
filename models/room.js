var mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    roomId: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    members: {
        type: Array,
        required: true,
        default: []
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastActive: {
        type: Date,
        default: new Date.getUTCDate()
    },
},{
    timestamps: true
});

const room = mongoose.model('Room', roomSchema);
module.exports = room;