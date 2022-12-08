const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const utilities = require('../utils/utilities');

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
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    picture: {
        type: String,
        default: ''
    },
    about: {
        type: String,
        default: 'Hey there! SecureComm is really interesting.'
    },
    status: {
        type: String,
        default: '',
    },
    lastActive: {
        type: String,
        default: utilities.getISOTimestamp(),
    },
    location: {
        type: Object,
        default: {
            country: {},
            region: {},
            city: ''
        }
    },
    phone: {
        type: String,
        default: ''
    },
    work: {
        type: String,
        default: 'SecureComm User'
    },
    organization: {
        type: String,
        default: ''
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
