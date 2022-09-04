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
	response.setHeader('X-Powered-By', 'SecureComm');
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

utilities.paginateResponse = (data, count, limit, page) => {
	page = parseInt(page)

	const last = count ? Math.floor(count / limit) : 0;
	const firstPageNumber = 0
	const nextPageNumber = page === last ? null : (page + 1);
	const prevPageNumber = page === 0 ? null : (page - 1);
	const lastPageNumber = Math.floor(count / limit);

	const pagination = {
		total: count,
		perPage: limit,
		currentPage: page,
		firstPageNumber,
		nextPageNumber,
		prevPageNumber,
		lastPageNumber,
		from: page * limit,
		to: page + 1
	}

	return {
		data: data,
		pagination
	}
}

utilities.timeStamp = () => {
	return `[${new Date(Date.now()).toISOString()}]`;
  }