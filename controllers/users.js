const { utilities } = require('../utils');
const { User } = require('../models');

const users = module.exports;
const userFields = [
    "_id",
    "firstname",
    "lastname",
    "email",
    "picture",
    "username"
];

users.checkAuthentication = (req, res) => {
    if (req.user && req.user._id) {
        utilities.handleApiResponse(200, res, {authenticated: true})
    } else {
        utilities.handleApiResponse(401, res, {authenticated: false})
    }
}

users.getUsersByUsername = async (req, res) => {
    const { page=0, limit=8, query } = req.query;
    let username = new RegExp(query);
    let keys = {
        username: {
            $regex: username,
            $options: '$i'
        }
    };

    const [users, count=0] = await Promise.all([
        User.find(keys, userFields).sort({ _id: -1 }).skip(page * limit).limit(limit),
        User.countDocuments(keys)
    ])

    utilities.handleApiResponse(200, res, utilities.paginateResponse(users, count, limit, page));
}