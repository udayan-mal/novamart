const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: `"NovaMart" <${process.env.SMTP_USER || "noreply@novamart.com"}>`,
      to,
      subject,
      html,
    });
    console.log(`✓ Email sent to ${to}`);
  } catch (error) {
    console.error(`✗ Email failed to ${to}:`, error.message);
    // Don't throw — email failure shouldn't break auth flow
  }
}

module.exports = { sendEmail };
