import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Otp from "../models/Otp.js";
import { sendResponse } from "../utils/sendResponse.js";
import nodemailer from "nodemailer";
import { sendOtpMail } from "../utils/sendEmail.js";

// ------------------ JWT Helpers ------------------
const createAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m",
  });

const createRefreshToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d",
  });

// ------------------ Nodemailer Setup ------------------
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // 587 ke liye false, 465 ke liye true
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

 


// ---------------- Register ----------------

// export const register = async (req, res) => {
//   try {
//     console.log("Received registration data:", req.body);
//     const { fullName, email, phoneNumber, password, ref_by } = req.body;

//     if (!fullName || !email || !phoneNumber || !password) {
//       return res.status(400).json({ success: false, message: "All fields are required" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = await User.create({
//       fullName,
//       email,
//       phoneNumber,
//       password: hashedPassword,
//       ref_by,
//     });

//     // ✅ Generate OTP immediately after registration
//     const code = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
//     await Otp.create({ identifier: email, code, purpose: 'verify', expiresAt });

//     // Send OTP email
//     await transporter.sendMail({
//       from: `"My App" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: "Your OTP Code",
//       text: `Your OTP code is: ${code}\nThis code will expire in 5 minutes.`,
//     });

//     console.log("OTP sent:", code, "to:", email);

//     return res.status(201).json({ 
//       success: true, 
//       message: "User registered", 
//       userId: newUser._id, 
//       email: newUser.email 
//     });

//   } catch (err) {
//     console.error("Registration error:", err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

export const register = async (req, res) => {
  try {
    console.log("Received registration data:", req.body);
    const { fullName, email, phoneNumber, password, ref_by } = req.body;

    // Validate required fields
    if (!fullName || !email || !phoneNumber || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      ref_by: ref_by || null,
    });

    // ✅ Generate OTP immediately after registration
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

    await Otp.create({ identifier: email, code, purpose: 'verify', expiresAt });

    // ⚡ Instead of sending real email, log OTP for testing
    console.log(`📧 OTP for ${email}: ${code}`);

    return res.status(201).json({ 
      success: true, 
      message: "User registered! OTP sent (check console).", 
      userId: newUser._id, 
      email: newUser.email 
    });

  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};




// ------------------ Login ------------------
 
export const login = async (req, res) => {
  try {
    const { email, phoneNumber, emailOrPhone, password } = req.body;

    // 🧩 Normalize input
    const finalEmail =
      email || (emailOrPhone && emailOrPhone.includes("@") ? emailOrPhone : null);
    const finalPhone =
      phoneNumber || (emailOrPhone && !emailOrPhone.includes("@") ? emailOrPhone : null);

    // ✅ Validation
    if ((!finalEmail && !finalPhone) || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email/Phone and password required" });
    }

    // ✅ Find user by email or phone
    const user = finalEmail
      ? await User.findOne({ email: finalEmail })
      : await User.findOne({ phoneNumber: finalPhone });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email/phone or password" });
    }

    // ✅ Check verification
    // if (!user.isVerified) {
    //   return res
    //     .status(403)
    //     .json({ success: false, message: "Please verify your account first" });
    // }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email/phone or password" });
    }

    // ✅ Generate JWT tokens
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "7d" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "30d" }
    );

    // ✅ Return complete user details
    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// ------------------ Request OTP ------------------
export const requestOtp = async (req, res) => {
  try {
    const { identifier } = req.body;
    console.log("Sending OTP to:", identifier);

    if (!identifier) return res.status(400).json({ success: false, message: "Identifier required" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const otpRecord = await Otp.create({ identifier, code, purpose: 'verify', expiresAt });
    console.log("OTP record created:", otpRecord);

    await transporter.sendMail({
      from: `"CoinWave247" <${process.env.SMTP_USER}>`,
      to: identifier,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${code}\nThis code will expire in 5 minutes.`,
    });

    console.log("OTP email sent successfully to:", identifier);

    res.status(200).json({ success: true, message: "OTP sent successfully", expiresAt });
  } catch (err) {
    console.error("Request OTP error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ------------------ Verify OTP ------------------
// export const verifyOtp = async (req, res) => {
//   try {
//     const { identifier, code } = req.body;

//     if (!identifier || !code)
//       return sendResponse(res, 400, false, "Identifier and OTP code required");

//     const otpRecord = await Otp.findOne({ identifier, code });
//     console.log("OTP record found:", otpRecord);

//     if (!otpRecord) return sendResponse(res, 400, false, "Invalid OTP");

//     if (otpRecord.expiresAt < new Date())
//       return sendResponse(res, 400, false, "OTP expired");

//     const user = await User.findOne({ email: identifier });
//     if (!user) return sendResponse(res, 404, false, "User not found");

//     // ✅ Correct field: isVerified (used in login)
//     user.isVerified = true;
//     await user.save();

//     await Otp.deleteOne({ _id: otpRecord._id });

//     return sendResponse(res, 200, true, "OTP verified successfully!", {
//       email: user.email,
//     });
//   } catch (err) {
//     console.error("Verify OTP error:", err);
//     return sendResponse(res, 500, false, "Server error during OTP verification");
//   }
// };

export const verifyOtp = async (req, res) => {
  try {
    const { identifier, code } = req.body;

    console.log("✅ OTP verification route hit with:", req.body);

    if (!identifier || !code) {
      return res.status(400).json({ success: false, message: "Identifier and OTP code required" });
    }

    // Trim aur lowercase — galat match se bachne ke liye
    const cleanIdentifier = identifier.trim().toLowerCase();

    // OTP find karo
    const otpRecord = await Otp.findOne({ identifier: cleanIdentifier, code });
    console.log("OTP record found:", otpRecord);

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // User find karo
    const user = await User.findOne({ email: cleanIdentifier });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ Verification mark
    console.log("Before save:", user.isVerified);
    user.isVerified = true;
    await user.save();
    console.log("After save:", user.isVerified);

    // OTP delete kar do
    await Otp.deleteOne({ _id: otpRecord._id });

    // ✅ Success response
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully!",
      email: user.email,
      verified: user.isVerified
    });

  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ success: false, message: "Server error during OTP verification" });
  }
};


// ------------------ Refresh Token ------------------
export const refreshTokenFn = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return sendResponse(res, 400, false, "Refresh token required");

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return sendResponse(res, 401, false, "Invalid refresh token");

    const accessToken = createAccessToken(user);
    sendResponse(res, 200, true, "New access token generated", { accessToken });
  } catch (err) {
    console.error("Refresh token error:", err);
    sendResponse(res, 401, false, "Invalid or expired refresh token");
  }
};

// ------------------ Get Profile ------------------
export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    sendResponse(res, 200, true, "Profile fetched", { user });
  } catch (err) {
    console.error("Get profile error:", err);
    sendResponse(res, 500, false, "Server error");
  }
};

// ------------------ Update Profile ------------------
export const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { name, email, phone } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    await user.save();
    sendResponse(res, 200, true, "Profile updated", { user });
  } catch (err) {
    console.error("Update profile error:", err);
    sendResponse(res, 500, false, "Server error");
  }
};

// ------------------ Change Password ------------------
export const changePassword = async (req, res) => {
  try {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return sendResponse(res, 400, false, "Both old and new passwords are required");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return sendResponse(res, 400, false, "Old password is incorrect");

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    sendResponse(res, 200, true, "Password changed successfully");
  } catch (err) {
    console.error("Change password error:", err);
    sendResponse(res, 500, false, "Server error");
  }
};
