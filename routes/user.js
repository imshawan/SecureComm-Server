const express = require('express');
const router = express.Router();

const controllers = require('../controllers');
const { validation, authentication } = require('../middlewares');

router.get('/username', authentication.verifyUser, controllers.users.getUsersByUsername);
router.get('/:id', authentication.verifyUser, controllers.users.getUserById);

router.post('/authentication', authentication.verifyUser, controllers.users.checkAuthentication);

module.exports = router;
