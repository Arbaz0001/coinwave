import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  identifier: { type: String, required: true, trim: true }, // phone/email
  code: { type: String, required: true },
  purpose: { type: String, enum: ["register", "login", "verify"], default: "verify" },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// TTL index → expiresAt ke baad doc auto-delete
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ek user ke multiple OTP avoid karne ke liye optional cleanup
otpSchema.pre("save", async function (next) {
  await mongoose.model("Otp").deleteMany({
    identifier: this.identifier,
    purpose: this.purpose,
    used: false,
  });
  next();
});

export default mongoose.model("Otp", otpSchema);
