const express = require('express');
const router = express.Router();

const controllers = require('../controllers');
const { validation, authentication } = require('../middlewares');

router.post('/fcm', authentication.verifyUser, validation.checkRequiredFields.bind(null, ['deviceId', 'token']), controllers.tokens.saveFCMToken);

module.exports = router;
