const express = require('express');
const router = express.Router();

const controllers = require('../controllers');
const { validation, authentication } = require('../middlewares');

router.get('/username', authentication.verifyUser, controllers.users.getUsersByUsername);
router.get('/status', authentication.verifyUser, controllers.users.getUserActivityStatus);

router.get('/:id', authentication.verifyUser, controllers.users.getUserById);
router.put('/update', authentication.verifyUser, controllers.users.updateUserData);
router.put('/picture', authentication.verifyUser, validation.checkRequiredFields.bind(null, ['picture']), controllers.users.updateUserProfile);
router.delete('/picture', authentication.verifyUser, controllers.users.removeUserProfilePicture);

router.post('/authentication', controllers.users.checkAuthentication);

module.exports = router;
