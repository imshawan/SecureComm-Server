const { utilities } = require('../utils');

const users = module.exports;

users.checkAuthentication = (req, res) => {
    if (req.user && req.user._id) {
        utilities.handleApiResponse(200, res, {authenticated: true})
    } else {
        utilities.handleApiResponse(401, res, {authenticated: false})
    }
}