const nodemailer = require("nodemailer");

const logger = require("./logger");

const sendEmail = async (to, subject, text) => {
  // ─── DEMO MODE ────────────────────────────────────────────────────────────────
  // In a real production app, you would use Nodemailer or SendGrid here.
  // For this hackathon/demo, we log to the console to show it works.
  if (process.env.NODE_ENV === "development") {
    logger.info(`[DEMO MODE] Email to ${to} would have been sent: ${subject}`);
    return true;
  }

  try {
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

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}`);
    return true;
  } catch (error) {
    logger.error("Email send failed:", error);
    return false;
  }
};

module.exports = sendEmail;
