const { utilities } = require('../utils');
const api = require('../api');


const tokens = module.exports;

tokens.saveFCMToken = async (req, res) => {
    try {
        utilities.handleApiResponse(200, res, await api.tokens.saveUserFCMToken(req));
    } catch (err) {
        utilities.handleApiResponse(400, res, new Error(err.message));
    }
}