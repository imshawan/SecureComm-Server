const express = require('express');
const passport = require('passport');
const router = express.Router();

const controllers = require('../controllers');
const { validation, authentication } = require('../middlewares');


router.post('/otp', validation.checkRequiredFields.bind(null, ['email']), controllers.auth.sendOTP);
router.post('/register', validation.checkRequiredFields.bind(null, ['email', 'username', 'password']), controllers.auth.registerUser);
router.post('/signin', validation.checkRequiredFields.bind(null, ['username', 'password']), passport.authenticate('local'), controllers.auth.signIn);
router.post('/signout', validation.checkRequiredFields.bind(null, ['token']), controllers.auth.signOut);

router.post('/password/forgot', validation.checkRequiredFields.bind(null, ['email']), controllers.auth.forgotPassword);
router.post('/password/reset', validation.checkRequiredFields.bind(null, ['email', 'otp', 'password']), controllers.auth.resetPassword);
router.post('/password/change', validation.checkRequiredFields.bind(null, ['oldPassword', 'newPassword']), authentication.verifyUser, controllers.auth.changePassword);


module.exports = router;
