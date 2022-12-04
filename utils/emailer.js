const sendgridMail = require('@sendgrid/mail');
const { sendgrid } = require('../app.config');

sendgridMail.setApiKey(sendgrid.API_KEY);

const emailer = module.exports;

emailer.sendEmail = async (recipient, template, data) => {
    const {subject, content} = populateEmailContent(template, data);
    await sendgridMail.send({
      to: recipient,
      from: sendgrid.SENDER,
      subject,
      html: content,
    })
}

function populateEmailContent (template, data) {
    const json = {
      subject: "Code for password reset",
      content: `<strong>${data.code} is your code for changing your email</strong>`
    }
    return json
}