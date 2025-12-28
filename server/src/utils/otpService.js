import nodemailer from "nodemailer";
import axios from "axios";
import twilio from "twilio";

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  }
});

const sendEmail = async (email, message) => {
  const mailOptions = {
    from: `"Your App" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    html: `<p>Your OTP is <strong>${message}</strong></p>`
  };

  const result = await transporter.sendMail(mailOptions);
  console.log("Email sent to", email);
  return result;
};

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const sendSMS = async (phoneNumber, message) => {
  try {
    const result = await client.messages.create({
      body: `Your OTP is ${message}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log("✅ SMS sent via Twilio to", phoneNumber);
    return result;
  } catch (error) {
    console.error("❌ Twilio SMS error:", error);
    throw new Error("Failed to send SMS via Twilio");
  }
};

export {
  generateOTP,
  sendEmail,
  sendSMS
};