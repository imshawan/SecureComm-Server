const { GoogleSpreadsheet } = require('google-spreadsheet');
const { utilities } = require('../utils');
const SHEET = require('../securecomm-gsheet.json');
const APP_CONFIG = require('../app.config');

const sheets = module.exports;

const client = SHEET.client_id;
const key = SHEET.private_key;
const SHEET_ID = APP_CONFIG.sheetId;

sheets.saveRowToSheet = async (record={}, fields=[], sheetId) => {
    let missingFields = [];
    let payload = {};

    if (typeof record != 'object') {
        throw new Error('Record must be an Object')
    }

    if (!sheetId) {
        throw new Error('Sheet Id is required!');
    }

    if (fields.length) {
        fields.forEach((elem) => {
            if (!record[elem]) {
                missingFields.push(elem);
            } else {
                payload[elem] = record[elem];
            }
        })
    }

    if (missingFields.length) {
        throw new Error('Required fields: ' + missingFields.join(', '));
    }

    const doc = new GoogleSpreadsheet(sheetId);

    await doc.useServiceAccountAuth({
        client_email: client.toString(),
        private_key: key.toString()
    });
  
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    await sheet.addRow(payload);
  }

sheets.saveResponse = async (req, res) => {
    const fields = ['email', 'message', 'username'];

    try {
        await sheets.saveRowToSheet(req.body, fields, SHEET_ID);
        utilities.handleApiResponse(200, res, {message: 'Your query was recorded, we\'ll get back to you shortly.'});
    } catch (err) {
        utilities.handleApiResponse(400, res, new Error(err.message));
    }
}