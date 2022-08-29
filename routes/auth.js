const express = require('express');
const router = express.Router();

const controllers = require('../controllers');
const { validation } = require('../middlewares');


router.post('/otp', validation.checkRequiredFields.bind(null, ['email']), controllers.auth.sendOTP);
router.post('/register', validation.checkRequiredFields.bind(null, ['email', 'otp', 'username', 'password']), controllers.auth.registerUser);


module.exports = router;
