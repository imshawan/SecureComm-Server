const express = require('express');
const router = express.Router();
const { utilities } = require('../utils');


router.get('/', function(req, res, next) {
  utilities.handleApiResponse(200, res)
});

module.exports = router;
