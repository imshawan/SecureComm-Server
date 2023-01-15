const { Global } = require('../models');

const utils = module.exports;

utils.utilities = require('./utilities');
utils.constants = require('./constants');
utils.generators = require('./generators');
utils.emailer = require('./emailer');

utils.incrementFieldCount = async function (field) {
    const Obj = await Global.findOneAndUpdate(
        {type: 'globals'}, {$inc: {[field]: 1}}, {upsert: true, useFindAndModify: false, new: true});
        
    let { _doc={} } = Obj || {};

    return _doc[field];
}