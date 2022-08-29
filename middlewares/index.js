const middlewares = module.exports;

middlewares.authentication = require('./authentication');
middlewares.validation = require('./validators');
middlewares.cors = require('./cors');