const api = require('../api');
const { utilities } = require('../utils');


const users = module.exports;

users.getUserById = async (req, res) => {
    try {
        utilities.handleApiResponse(200, res, await api.users.getUserById(req));
    } catch (err) {
        utilities.handleApiResponse(400, res, new Error(err.message));
    }
}

users.checkAuthentication = async (req, res, next) => {
    try {
        utilities.handleApiResponse(200, res, await api.users.checkAuthentication(req, res, next));
    } catch (err) {
        utilities.handleApiResponse(400, res, new Error(err.message));
    }
}

users.getUsersByUsername = async (req, res) => {
    try {
        utilities.handleApiResponse(200, res, await api.users.getUsersByUsername(req));
    } catch (err) {
        utilities.handleApiResponse(400, res, new Error(err.message));
    }
}

users.updateUserData = async (req, res) => {
    try {
        utilities.handleApiResponse(200, res, await api.users.updateUserData(req));
    } catch (err) {
        utilities.handleApiResponse(400, res, new Error(err.message));
    }
}

users.updateUserProfile = async (req, res) => {
    try {
        utilities.handleApiResponse(200, res, await api.users.updateUserProfile(req));
    } catch (err) {
        utilities.handleApiResponse(400, res, new Error(err.message));
    }
}

users.removeUserProfilePicture = async (req, res) => {
    try {
        utilities.handleApiResponse(200, res, await api.users.removeUserProfilePicture(req));
    } catch (err) {
        utilities.handleApiResponse(400, res, new Error(err.message));
    }
}

users.getUserActivityStatus = async (req, res) => {
    try {
        utilities.handleApiResponse(200, res, await api.users.getUserActivityStatus(req));
    } catch (err) {
        utilities.handleApiResponse(400, res, new Error(err.message));
    }
}