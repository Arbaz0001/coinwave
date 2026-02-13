import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0 },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "limited-admin", "superadmin"],
    },
    ref_id: {
      type: String,
      unique: true,
      default: () =>
        `REF${uuidv4().replace(/-/g, "").substring(0, 8).toUpperCase()}`,
    },
    ref_by: { type: String, default: null },
  },
  { timestamps: true }
);

// ✅ Password check
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// ✅ Generate Access Token (uses JWT_SECRET from .env)
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      phoneNumber: this.phoneNumber,
      role: this.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m" }
  );
};

// ✅ Generate Refresh Token (uses JWT_REFRESH_SECRET)
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d" }
  );
};

// ✅ Safe export
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
