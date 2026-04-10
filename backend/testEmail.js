require('dotenv').config();
const nodemailer = require('nodemailer');

console.log("USER:", process.env.EMAIL_USER);
console.log("PASS:", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log('Verify Error:', error);
  } else {
    console.log('Server is ready');
  }
});
