const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const Schema = mongoose.Schema;

const User = new Schema({
    firstname: {
        type: String,
        default: '',
    },
    lastname: {
        type: String,
        default: '',
    },
    username: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    acceptedTerms: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

User.plugin(passportLocalMongoose, { usernameQueryFields: ['email', 'username'] });
const Users = mongoose.model('User', User);
module.exports = Users;
