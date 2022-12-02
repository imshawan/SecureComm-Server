const {Session, User} = require('../models');
const {utilities} = require('../utils');

const users = module.exports;

const validStatuses = ['online', 'offline', 'hidden'];

users.updateUserPresence = async (userId='', status='') => {
    if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status of type: ${status}, valid statuses are ${validStatuses.join(', ')}`);
    }

    if (userId.length < 24) {
        throw new Error('Invalid user Id');
    }

    const payload = {
        status,
        lastActive: utilities.getISOTimestamp(),
    }

    await User.findByIdAndUpdate(userId, { $set: payload }, { new: true, useFindAndModify: false });
}