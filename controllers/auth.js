const { utilities } = require('../utils');
const api = require('../api');

const userAuth = module.exports;

userAuth.get = async (req, res) => {
  try {
    utilities.handleApiResponse(200, res, await api.auth.get(req));
  } catch (err) {
    utilities.handleApiResponse(400, res, new Error(err.message));
  }
}

userAuth.registerUser = async (req, res) => {
  try {
    utilities.handleApiResponse(200, res, await api.auth.registerUser(req, res));
  } catch (err) {
    utilities.handleApiResponse(400, res, new Error(err.message));
  }
}

userAuth.sendOTP = async (req, res) => {
  try {
    utilities.handleApiResponse(200, res, await api.auth.sendOTP(req));
  } catch (err) {
    utilities.handleApiResponse(400, res, new Error(err.message));
  }
}

userAuth.signIn = async (req, res) => {
  try {
    utilities.handleApiResponse(200, res, await api.auth.signIn(req));
  } catch (err) {
    utilities.handleApiResponse(400, res, new Error(err.message));
  }
}

userAuth.signOut = async (req, res) => {
  try {
    utilities.handleApiResponse(200, res, await api.auth.signOut(req));
  } catch (err) {
    utilities.handleApiResponse(400, res, new Error(err.message));
  }
}

userAuth.forgotPassword = async (req, res) => {
  try {
    utilities.handleApiResponse(200, res, await api.auth.forgotPassword(req));
  } catch (err) {
    utilities.handleApiResponse(400, res, new Error(err.message));
  }
}

userAuth.resetPassword = async (req, res) => {
  try {
    utilities.handleApiResponse(200, res, await api.auth.resetPassword(req));
  } catch (err) {
    utilities.handleApiResponse(400, res, new Error(err.message));
  }
}

userAuth.changePassword = async (req, res) => {
  try {
    utilities.handleApiResponse(200, res, await api.auth.changePassword(req));
  } catch (err) {
    utilities.handleApiResponse(400, res, new Error(err.message));
  }
}