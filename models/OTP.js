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
    }
},{
    timestamps: true
});

var OTP = mongoose.model('Otp', otpSchema);
module.exports = OTP;