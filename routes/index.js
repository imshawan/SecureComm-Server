const express = require('express');
const router = express.Router();
const { utilities } = require('../utils');


router.use('/api/v1/users', require('./user'));
router.use('/api/v1/auth', require('./auth'));

// 404 handling
router.use('/', (req, res) => {
  utilities.handleApiResponse(404, res);
});

module.exports = router;
