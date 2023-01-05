var mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
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
    type: {
        type: String,
        required: true
    }
},{
    timestamps: true
});

var token = mongoose.model('token', tokenSchema);
module.exports = token;