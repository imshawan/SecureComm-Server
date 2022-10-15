const { utilities } = require('../utils');
const api = require('../api');


const room = module.exports;

room.create = async (req, res) => {
    try {
        utilities.handleApiResponse(200, res, await api.rooms.fetchExistingOrcreate(req));
    } catch (err) {
        utilities.handleApiResponse(400, res, new Error(err.message));
    }
}