const express = require('express');
const router = express.Router();
const { utilities } = require('../utils');
const { cors } = require('../middlewares');

router.options('/*',cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

router.use('/api/v1/users', cors.cors, require('./user'));
router.use('/api/v1/auth', cors.cors, require('./auth'));
router.use('/api/v1/rooms', cors.cors, require('./rooms'));

// 404 handling
router.use('/', (req, res) => {
  utilities.handleApiResponse(404, res);
});

module.exports = router;
