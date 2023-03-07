var mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    token: {
        type: String,
        default: '',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deviceId: {
        type: String,
        required: true
    },
    deviceType: {
        type: String,
        default: ''
    },
    expiresAt: {
        type: String,
        default: ''
    }
},{
    timestamps: true
});

var session = mongoose.model('session', sessionSchema);
module.exports = session;