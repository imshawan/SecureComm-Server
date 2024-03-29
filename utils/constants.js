const path = require('path');

const FILES_LOCATION = 'uploads';

module.exports = {
    statusCodeWithError: {
        200: 'OK',
        201: 'Created',
        200: 'OK',
        201: 'Created',
        202: 'Accepted',
        203: 'Non-Authoritative Information',
        204: 'No Content',
        300: 'Multiple Choices',
        301: 'Moved Permanently',
        302: 'Found',
        303: 'See Other',
        304: 'Not Modified',
        400: 'Bad Request',
        401: 'Unauthorized',
        402: 'Payment Required',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        406: 'Not Acceptable',
        407: 'Proxy Authentication Required',
        408: 'Request Timeout',
        500: 'Internal Server Error',
        501: 'Not Implemented',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Timeout'
    },
    statusCodeWithMessage: {
        400: 'Bad Request! Smething went wrong, please check your API request',
        401: 'Unauthorized access denied!',
        403: 'Forbidden! You are not authorized for making this API call',
        404: 'The API endpoint wasn\'t not found on our server',
        500: 'The server encountered an error and was unable to process this request',
    },
    baseDir: __dirname,
    files: FILES_LOCATION,
    images: path.join(FILES_LOCATION, 'images'),
    allowedImageExtensions: {
        bmp: 'image/bmp',
        gif: 'image/gif',
        ief: 'image/ief',
        jfif: 'image/pipeg',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg',
        png: 'image/png',
        svg: 'image/svg+xml',
        tif: 'image/tiff',
        tiff: 'image/tiff',
    },
}