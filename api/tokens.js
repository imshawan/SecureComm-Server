const { Token } = require('../models');

const room = module.exports;

room.saveUserFCMToken = async (req) => {
    const { user } = req;
    const { token, deviceId, deviceType } = req.body;

    const payload = {
        $set: {
            user: user._id,
            token, 
            deviceId,
            deviceType, 
            type: 'fcm'
        }
    };
    
    await Token.findOneAndUpdate({user: user._id}, payload, {upsert: true, useFindAndModify: false});

    return {message: 'Token saved successfully!'};
}