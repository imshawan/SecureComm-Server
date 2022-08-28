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
			message,
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
		message = statusCodeWithMessage[code] || null;
		error = statusCodeWithError[code];

		payload.status = {
			success: false,
			error,
			message,
		};
		payload.payload = data || {};
	}
	response.status(code).json(payload);
}