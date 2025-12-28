// src/pages/VerifyEmail.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function VerifyEmail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { userId, email } = state || {};
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Agar bina signup ke aaya toh redirect
  useEffect(() => {
    if (!userId || !email) {
      navigate("/signup");
    }
  }, [userId, email, navigate]);

  const handleVerify = async () => {
    setErrorMsg("");
    try {
      setLoading(true);
      await api.post("/auth/verify-email", { userId, otp });

      alert("✅ Email verified successfully! Please login.");
      navigate("/login");
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "❌ Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setErrorMsg("");
    try {
      setResending(true);
      await api.post("/auth/resend-otp", { userId, email });
      alert("📩 A new OTP has been sent to your email.");
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Failed to resend OTP. Try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Verify Your Email
        </h2>
        <p className="text-gray-600 text-center mb-6">
          We’ve sent a verification code to <br />
          <span className="font-semibold">{email}</span>
        </p>

        {errorMsg && (
          <div className="mb-4 text-red-600 text-center font-medium">
            {errorMsg}
          </div>
        )}

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 text-center tracking-widest"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-3 bg-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-semibold"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        <div className="mt-4 text-center">
          <p className="text-gray-500 text-sm">Didn’t get the code?</p>
          <button
            onClick={handleResend}
            disabled={resending}
            className="mt-2 text-purple-500 font-semibold hover:underline disabled:opacity-50"
          >
            {resending ? "Resending..." : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}
