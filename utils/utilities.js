const { statusCodeWithError, statusCodeWithMessage } = require('./constants');

const utilities = module.exports;


utilities.handleApiResponse = function (code, response, data) {
	const payload = {
		status: {},
		payload: {}
	};
	let message = 'Ok', error = null;

    if (code < 300) {
		payload.status = {
			success: true,
			error,
			message: 'Ok',
		};
		payload.payload = data || {};

    } else if (data instanceof Error) {
		message = data.message;
		error = statusCodeWithError[400];

		payload.status = {
			success: false,
			error,
			message,
		};
	} else {
		message = (data ? data.message : statusCodeWithMessage[code]) || null;
		error = statusCodeWithError[code];

		payload.status = {
			success: false,
			error,
			message,
		};
		payload.payload = data || {};
	}
	response.setHeader('Content-Type', 'application/json');
	response.status(code).json(payload);
}

utilities.generateOtp = (length) => {
	if (typeof length != 'number'){
	  throw new Error(`Length must be a number, not ${typeof length}`);
	}
	const digits = '0123456789';
	const alpha = 'abcdefghijklmnopqrstuvwxyz';
	const alphaLength = Math.floor(length/3);
	return randomize(alphaLength, alpha).toUpperCase() + randomize(length - alphaLength, digits);
  }
  
const randomize = (length, payload) => {
	let OTP = '';
	for (let i = 0; i < length; i++ ) {
		  OTP += payload[Math.floor(Math.random() * 10)];
	  }
	return OTP;
  }