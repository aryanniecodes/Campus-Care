const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    // Email disabled for demo
    console.log(`[DEMO MODE] Email to ${to} would have been sent: ${subject}`);
    /*
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
    console.log(`Email sent to ${to}`);
    */
  } catch (error) {
    // Silent fail if email service is down in demo
  }
};

module.exports = sendEmail;
