const nodemailer = require('nodemailer');
const logger = require('../config/logger');

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    html,
    text,
  };

  const info = await transporter.sendMail(mailOptions);
  logger.info(`Email sent: ${info.messageId} to ${to}`);
  return info;
};

module.exports = sendEmail;
