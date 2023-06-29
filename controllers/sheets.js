const api = require('../api');
const { utilities } = require('../utils');

const sheets = module.exports;

sheets.saveResponse = async (req, res) => {
    try {
        utilities.handleApiResponse(200, res, await api.sheets.saveResponse(req));
    } catch (err) {
        console.log(err)
        utilities.handleApiResponse(400, res, new Error(err.message));
    }
}