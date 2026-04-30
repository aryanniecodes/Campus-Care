const nodemailer = require("nodemailer");

const logger = require("../utils/logger");

const sendEmail = async (to, subject, text) => {
  // 1. Fix environment variable handling
  const isEmailEnabled = process.env.ENABLE_EMAIL === 'true' || process.env.ENABLE_EMAIL === true;

  if (!isEmailEnabled) {
    logger.warn(`[EMAIL SKIP] Email disabled via ENABLE_EMAIL. Skipped email to: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    // 2. Fix email service configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    logger.info(`[EMAIL ATTEMPT] Attempting to send email to ${to}...`);
    const info = await transporter.sendMail(mailOptions);
    logger.info(`[EMAIL SUCCESS] Email sent to ${to}. Message ID: ${info.messageId}`);
  } catch (error) {
    // 4. Add debugging logs
    logger.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error.message);
  }
};

module.exports = { sendEmail };
