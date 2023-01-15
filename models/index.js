const Models = module.exports;

const {message} = require('./message');

Models.User = require('./user');
Models.OTP = require('./OTP');
Models.Global = require('./globals');
Models.Room = require('./room');
Models.Session = require('./sessions');
Models.Token = require('./token');
Models.Message = message;