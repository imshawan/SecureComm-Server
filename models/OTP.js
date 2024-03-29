var mongoose = require('mongoose');
const Schema = mongoose.Schema;

const otpSchema = new Schema({
    otp: {
        type: String,
        default: '',
    },
    expiresIn: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: '',
    },
    action: {
        type: String,
        default: '',
    },
    revoked: {
        type: Boolean,
        default: false,
    }
},{
    timestamps: true
});

var OTP = mongoose.model('Otp', otpSchema);
module.exports = OTP;