const { Token } = require('../models');

const room = module.exports;

room.saveUserFCMToken = async (req) => {
    const { user } = req;
    const { token, deviceId } = req.body;

    const payload = {
        $set: {
            user: user._id,
            token, 
            deviceId, 
            type: 'fcm'
        }
    };
    
    await Token.findOneAndUpdate({user: user._id}, payload, {upsert: true, useFindAndModify: false});

    return {message: 'Token saved successfully!'};
}