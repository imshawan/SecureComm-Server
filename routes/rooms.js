const express = require('express');
const router = express.Router();

const controllers = require('../controllers');
const { validation, authentication } = require('../middlewares');

router.post('/create', authentication.verifyUser, validation.checkRequiredFields.bind(null, ['members']), controllers.rooms.create);

module.exports = router;
