const express = require('express');
const router = express.Router();

const controllers = require('../controllers');
const { validation } = require('../middlewares');

router.post('/contact', validation.checkRequiredFields.bind(null, ['email', 'message']), controllers.sheets.saveResponse);

module.exports = router;
