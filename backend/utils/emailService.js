const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports.sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: `"CareLink AI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log("📧 Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email failed:", error);
    throw error;
  }
};