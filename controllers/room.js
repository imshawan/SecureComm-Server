const { utilities } = require('../utils');
const { User } = require('../models');


const room = module.exports;

room.create = async (req, res) => {
    utilities.handleApiResponse(200, res);
}