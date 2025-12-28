// components/OTPVerificationModal.jsx
import React, { useState } from "react";
import { verifyOTP } from "../utils/registerUser";

const OTPVerificationModal = ({ isOpen, onClose, userEmail, onVerificationSuccess }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
  };

  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Enter 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const res = await verifyOTP({ identifier: userEmail, code });
      onVerificationSuccess(res);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-xl w-[400px]">
        <h2 className="text-white text-xl mb-4">Verify OTP</h2>
        <div className="flex justify-between mb-4">
          {otp.map((num, idx) => (
            <input
              key={idx}
              type="text"
              maxLength={1}
              value={num}
              onChange={(e) => handleChange(e, idx)}
              className="w-12 h-12 text-center rounded-lg text-black"
            />
          ))}
        </div>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
          disabled={isVerifying}
        >
          {isVerifying ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
};

export default OTPVerificationModal;
