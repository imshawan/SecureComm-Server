const sendgridMail = require('@sendgrid/mail');
const { sendgrid } = require('../app.config');

sendgridMail.setApiKey(sendgrid.API_KEY);

function sendEmail (recipient, subject, message) {}

const msg = {
  to: 'test@example.com', // Change to your recipient
  from: 'test@example.com', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}