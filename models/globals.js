const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const globals = new Schema({
    type: {
        type: String,
        default: 'globals'
    }}, 
    { strict: false });

const Globals = mongoose.model('Global', globals);
module.exports = Globals;