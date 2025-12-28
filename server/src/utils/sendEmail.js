import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config(); // make sure this is at the top

export const sendOtpMail = async (email, otp) => {
  console.log("📧 sendOtpMail called for:", email, "OTP:", otp);

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // for port 587 use false, for 465 use true
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log("🚀 Transporter created, now sending mail...");

    const mailOptions = {
      from: `"CoinWave247" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your verification code is: ${otp}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Mail sent successfully:", info.response);
  } catch (error) {
    console.error("❌ Failed to send OTP:", error.message);
  }
};
