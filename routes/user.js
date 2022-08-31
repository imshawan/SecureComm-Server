const express = require('express');
const router = express.Router();

const controllers = require('../controllers');
const { validation, authentication } = require('../middlewares');

router.post('/authentication', authentication.verifyUser, controllers.users.checkAuthentication);

module.exports = router;
