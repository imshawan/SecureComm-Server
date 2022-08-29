const { Global } = require('../models');

const utils = module.exports;

utils.utilities = require('./utilities');
utils.constants = require('./constants');

utils.incrementFieldCount = async function (field) {
    const Obj = await Global.findOneAndUpdate({type: 'globals'}, {$inc: {[field]: 1}}, {upsert: true, new: true});
    let { _doc={} } = Obj || {};

    return _doc[field];
}