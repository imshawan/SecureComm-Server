const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const Schema = mongoose.Schema;

const User = new Schema({
    firstname: {
        type: String,
        default: 'Default',
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
        default: 'SecureComm user'
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
