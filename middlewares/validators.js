const { utilities } = require('../utils');

const validators = module.exports;

validators.checkRequiredFields = function (fields=[], req, res, next) {
    let missingFields = []
    if (fields.length) {
        fields.forEach((field) => {
            if (!req.body[field] || req.body[field] == '') {
                missingFields.push(field)
            }
        });
    }

    if (missingFields.length) {
        return utilities.handleApiResponse(400, res, new Error('Required fields were missing from the API call: ' + missingFields.join(', ')));
    } else next();
}