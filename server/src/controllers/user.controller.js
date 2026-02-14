import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { generateOTP, sendEmail } from "../utils/otpService.js";
import  User  from "../models/User.js";
import { otpLogs } from "../models/otpLogs.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
// src/controllers/user.controller.js
import { generateReferralId } from "../utils/refrel.js";
import { ReferAmount } from "../models/add.refer.amount.model.js";


const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new apiError(404, "User not found");

    // ✅ Generate Access Token using JWT_SECRET
    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role || "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m" }
    );

    // ✅ Generate Refresh Token using JWT_REFRESH_SECRET
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d" }
    );

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new apiError(
      500,
      "Error generating access and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { phoneNumber, email, fullName, password } = req.body;

  if (
    [fullName, email, phoneNumber, password].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new apiError(400, "All fields are required !");
  }

  const existedUser = await User.findOne({
    $or: [{ phoneNumber }, { email }],
  });

  if (existedUser) {
    throw new apiError(409, "User with email or username already exists");
  }

  const user = await User.create({
    fullName,
    email,
    password,
    phoneNumber,
    ref_id: generateReferralId(),
    ref_by: req.body.ref_by || null,
  });

  if (user.ref_by) {
    const referrer = await User.findOne({ ref_id: req.body.ref_by });
    const firstAmountDoc = await ReferAmount.findOne(
      {},
      { amount: 1, _id: 0 }
    ).sort({ createdAt: 1 });
    if (referrer) {
      referrer.walletBalance += firstAmountDoc?.amount || 0; // Add the refer amount to referrer's wallet
      await referrer.save();
    }
  }

  const emailOTP = generateOTP();

  await otpLogs.create({
    userId: user._id,
    emailOTP,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // expires in 10 minutes
    verified: false,
  });

  await sendEmail(email, `${emailOTP}`);

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new apiError(500, "Something went wrong while registering the user");
  }
  // /referral-link/:userId
  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "✅ User registered Successfully"));
});

const createReferralLink = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const referralLink = `${process.env.CORS_ORIGIN}/signup?ref=${user.ref_id}`;
    res.json({ referralLink });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, phoneNumber, password } = req.body;
  console.log(email);

  if (!phoneNumber && !email) {
    throw new apiError(400, "phone number or email is required");
  }

  let user = null;

  if (phoneNumber) {
    const cleanedPhoneInput = phoneNumber.replace(/\D/g, "").replace(/^0+/, ""); // remove non-digits and leading zeros
    const phoneRegex = new RegExp(`${cleanedPhoneInput}$`);

    user = await User.findOne({
      phoneNumber: { $regex: phoneRegex },
    });
  }

  // fallback to email if phone not found or not used
  if (!user && email) {
    user = await User.findOne({ email });
  }

  if (!user) {
    throw new apiError(404, "User does not exist");
  }

  const isPasswordValid = user.password === password;

  if (!isPasswordValid) {
    throw new apiError(401, "Invalid user credentials");
  }

  if (!user.isVerified) {
    const otpLog = await otpLogs.findOne({ userId: user._id });

    if (!otpLog || otpLog.expiresAt < Date.now()) {
      await otpLogs.deleteOne({ userId: user._id });
      await User.deleteOne({ _id: user._id });

      throw new apiError(410, "OTP expired. Please register again.");
    }

    throw new apiError(403, "Account not verified. Please verify using OTP.");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200), {}, "User logged out");
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new apiError(401, "Unauthorizes request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new apiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new apiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: false,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshtoken", newRefreshToken, options)
      .json(
        new apiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new apiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new apiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Password changed Successfully"));
});

const requestResetOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new apiError(400, "Email or Phone Number is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new apiError(404, "No user found with provided contact details");
  }

  const emailOTP = generateOTP();

  await otpLogs.findOneAndUpdate(
    { userId: user._id },
    {
      userId: user._id,
      emailOTP,
      verified: false,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
    { upsert: true, new: true }
  );

  if (email) await sendEmail(user.email, emailOTP);

  return res
    .status(200)
    .json(new apiResponse(200, null, "✅ OTP sent for password reset"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { userId, emailOTP, newPassword } = req.body;

  if (!newPassword || !emailOTP) {
    throw new apiError(400, "New password and at least one OTP are required");
  }

  const otpLog = await otpLogs.findOne({ userId });

  if (!otpLog || otpLog.verified) {
    throw new apiError(400, "Invalid or already used OTP");
  }

  if (otpLog.expiresAt < Date.now()) {
    await otpLogs.deleteOne({ userId });
    throw new apiError(410, "OTP expired. Please request a new one.");
  }

  const isEmailValid = emailOTP && otpLog.emailOTP === emailOTP;

  if (!isEmailValid) {
    throw new apiError(400, "OTP is incorrect");
  }

  const user = await User.findById(userId);
  user.password = newPassword;
  await user.save();

  await otpLogs.findByIdAndUpdate(otpLog._id, { verified: true });

  return res
    .status(200)
    .json(new apiResponse(200, null, "✅ Password reset successfully"));
});

 

const getCurrentBalance = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId).select("walletBalance");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ balance: user.walletBalance });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({ message: "Server error" });
  }
});

 
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, phoneNumber, password } = req.body;

  if (!fullName || !email || !phoneNumber || !password) {
    throw new apiError(400, "All fields are required");
  }

  const user = await User.findById(req.params.editUserId);

  if (!user) {
    throw new apiError(404, "User not found");
  }

  user.fullName = fullName;
  user.email = email;
  user.phoneNumber = phoneNumber;
  user.password = password;

  await user.save();

  return res
    .status(200)
    .json(new apiResponse(200, user, "Account details updated successfully"));
});

 
// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "fullName email phoneNumber createdAt");
    res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// Update a user
 const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Agar password update ho raha hai toh hash kar do
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
    if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error in updateUser:", error);
    // Return error message for easier debugging (remove stack in production)
    res.status(500).json({ success: false, message: error.message || "Server Error", error: error.stack || error });
  }
};

// Delete a user
 const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// updateAccountDetails

 

export {
  registerUser,
  createReferralLink,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  requestResetOtp,
  resetPassword,
  getCurrentBalance,
  updateUser,
  getAllUsers,
  deleteUser,
  updateAccountDetails,
};
