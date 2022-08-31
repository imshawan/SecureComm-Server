const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const Schema = mongoose.Schema;

const User = new Schema({
    firstname: {
        type: String,
        default: 'SecureComm',
    },
    lastname: {
        type: String,
        default: 'User',
    },
    username: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    picture: {
        type: String,
        default: ''
    },
    about: {
        type: String,
        default: 'Hey there! SecureComm is really interesting.'
    },
    acceptedTerms: {
        type: Boolean,
        default: false
    },
    payload: {
        type: Object,
        default: {}
    },
}, {
    timestamps: true
});

User.plugin(passportLocalMongoose, { usernameQueryFields: ['email', 'username'] });
const Users = mongoose.model('User', User);
module.exports = Users;
