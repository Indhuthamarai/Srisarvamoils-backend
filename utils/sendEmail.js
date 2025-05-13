// utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", 
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"SriSarvam" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Confirmation email sent to:", to);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};

module.exports = sendEmail;
