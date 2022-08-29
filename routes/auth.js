const express = require('express');
const passport = require('passport');
const router = express.Router();

const controllers = require('../controllers');
const { validation } = require('../middlewares');


router.post('/otp', validation.checkRequiredFields.bind(null, ['email']), controllers.auth.sendOTP);
router.post('/register', validation.checkRequiredFields.bind(null, ['email', 'otp', 'username', 'password']), controllers.auth.registerUser);
router.post('/signin', validation.checkRequiredFields.bind(null, ['email', 'password']), passport.authenticate('local'), controllers.auth.signIn);


module.exports = router;
