const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.EMAIL_LOGIN,
    pass: process.env.EMAIL_PASSWORD,
  },
});

function sendEmail(message) {
  return transport.sendMail(message);
}

module.exports = sendEmail;
